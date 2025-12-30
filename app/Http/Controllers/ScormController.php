<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\User;
use App\Models\UserProgress;
use App\Services\CourseProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScormController extends Controller
{
    public function get(Content $content)
    {
        $userId = Auth::id();
        if (! $userId) {
            abort(401);
        }

        $user = User::findOrFail($userId);

        if ($content->type !== 'scorm') {
            abort(404);
        }

        $content->loadMissing('module.course');
        $course = $content->module?->course;
        if (! $course) {
            abort(404);
        }

        $isEnrolled = $course->students()->where('user_id', $user->id)->exists();
        if (! $isEnrolled && ! $user->isAdmin()) {
            abort(403, 'You must be enrolled to view this content.');
        }

        if (! $user->isAdmin()) {
            $course->loadMissing(['prerequisites:id']);
            if ($course->prerequisites->isNotEmpty()) {
                $completedCourseIds = $user->courses()
                    ->whereNotNull('course_user.completed_at')
                    ->pluck('courses.id')
                    ->all();

                $missingPrerequisiteIds = $course->prerequisites
                    ->pluck('id')
                    ->reject(fn ($id) => in_array($id, $completedCourseIds, true));

                if ($missingPrerequisiteIds->isNotEmpty()) {
                    abort(403, 'You must complete prerequisite courses before accessing this course.');
                }
            }

            $course->loadMissing(['modules.contents' => function ($query) {
                $query->select('id', 'module_id', 'order');
            }]);

            $completedContentIds = UserProgress::where('user_id', $user->id)
                ->whereIn('content_id', $course->modules->flatMap->contents->pluck('id'))
                ->whereNotNull('completed_at')
                ->pluck('content_id');

            $completedSet = array_flip($completedContentIds->all());
            $unlockedContentIds = [];
            foreach ($course->modules as $module) {
                $moduleContentIds = $module->contents->pluck('id')->all();
                foreach ($moduleContentIds as $id) {
                    $unlockedContentIds[] = $id;
                }

                $moduleCompleted = true;
                foreach ($moduleContentIds as $id) {
                    if (! isset($completedSet[$id])) {
                        $moduleCompleted = false;
                        break;
                    }
                }

                if (! $moduleCompleted) {
                    break;
                }
            }

            if (! in_array($content->id, $unlockedContentIds, true)) {
                abort(403, 'This lesson is locked. Complete the previous module to unlock it.');
            }
        }

        $progress = UserProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'content_id' => $content->id,
            ],
            [
                'data' => [],
            ]
        );

        return response()->json($progress->data ?? []);
    }

    public function put(Content $content, Request $request)
    {
        $userId = Auth::id();
        if (! $userId) {
            abort(401);
        }

        $user = User::findOrFail($userId);

        if ($content->type !== 'scorm') {
            abort(404);
        }

        $content->loadMissing('module.course');
        $course = $content->module?->course;
        if (! $course) {
            abort(404);
        }

        $isEnrolled = $course->students()->where('user_id', $user->id)->exists();
        if (! $isEnrolled && ! $user->isAdmin()) {
            abort(403, 'You must be enrolled to view this content.');
        }

        if (! $user->isAdmin()) {
            $course->loadMissing(['prerequisites:id']);
            if ($course->prerequisites->isNotEmpty()) {
                $completedCourseIds = $user->courses()
                    ->whereNotNull('course_user.completed_at')
                    ->pluck('courses.id')
                    ->all();

                $missingPrerequisiteIds = $course->prerequisites
                    ->pluck('id')
                    ->reject(fn ($id) => in_array($id, $completedCourseIds, true));

                if ($missingPrerequisiteIds->isNotEmpty()) {
                    abort(403, 'You must complete prerequisite courses before accessing this course.');
                }
            }

            $course->loadMissing(['modules.contents' => function ($query) {
                $query->select('id', 'module_id', 'order');
            }]);

            $completedContentIds = UserProgress::where('user_id', $user->id)
                ->whereIn('content_id', $course->modules->flatMap->contents->pluck('id'))
                ->whereNotNull('completed_at')
                ->pluck('content_id');

            $completedSet = array_flip($completedContentIds->all());
            $unlockedContentIds = [];
            foreach ($course->modules as $module) {
                $moduleContentIds = $module->contents->pluck('id')->all();
                foreach ($moduleContentIds as $id) {
                    $unlockedContentIds[] = $id;
                }

                $moduleCompleted = true;
                foreach ($moduleContentIds as $id) {
                    if (! isset($completedSet[$id])) {
                        $moduleCompleted = false;
                        break;
                    }
                }

                if (! $moduleCompleted) {
                    break;
                }
            }

            if (! in_array($content->id, $unlockedContentIds, true)) {
                abort(403, 'This lesson is locked. Complete the previous module to unlock it.');
            }
        }

        $progress = UserProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'content_id' => $content->id,
            ],
            [
                'data' => [],
            ]
        );

        $currentData = $progress->data ?? [];
        $newData = $request->input('cmi', []);
        
        // Merge new data into current data
        // For SCORM, we typically just overlay the new keys
        $mergedData = array_merge($currentData, $newData);

        $progress->data = $mergedData;
        
        // Check for completion status in SCORM data to mark as completed in our system
        if (isset($mergedData['cmi.core.lesson_status']) && 
            in_array($mergedData['cmi.core.lesson_status'], ['completed', 'passed'])) {
            $progress->completed_at = now();
        } elseif (isset($mergedData['cmi.completion_status']) && 
                  in_array($mergedData['cmi.completion_status'], ['completed', 'passed'])) {
            // SCORM 2004
            $progress->completed_at = now();
        }

        $progress->save();

        if ($content->relationLoaded('module') === false) {
            $content->load('module.course');
        } elseif ($content->module->relationLoaded('course') === false) {
            $content->module->load('course');
        }

        $course = $content->module->course;
        if ($course) {
            app(CourseProgressService::class)->updateForUserAndCourse($user, $course);
        }

        return response()->json(['success' => true]);
    }
}
