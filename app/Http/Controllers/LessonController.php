<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Models\UserProgress;
use App\Services\CourseProgressService;

class LessonController extends Controller
{
    public function show(\App\Models\Course $course, \App\Models\Content $content): \Inertia\Response
    {
        // Check if content belongs to course
        if ($content->module->course_id !== $course->id) {
            abort(404);
        }

        // Check if user is enrolled (or admin)
        $isEnrolled = $course->students()->where('user_id', Auth::id())->exists();
        if (! $isEnrolled && ! Auth::user()->isAdmin()) {
            abort(403, 'You must be enrolled to view this content.');
        }

        if (! Auth::user()->isAdmin()) {
            $course->loadMissing(['prerequisites:id']);
            if ($course->prerequisites->isNotEmpty()) {
                /** @var \App\Models\User $user */
                $user = Auth::user();
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
        }

        // Load course structure for sidebar navigation
        $course->load(['modules.contents' => function ($query) {
            $query->select('id', 'module_id', 'title', 'type', 'order');
        }]);

        $orderedContents = $course->modules
            ->flatMap(fn ($m) => $m->contents)
            ->values();

        $currentIndex = $orderedContents->search(fn ($c) => $c->id === $content->id);
        $previousContentId = null;
        $nextContentId = null;

        if ($currentIndex !== false) {
            $previousContentId = $orderedContents->get($currentIndex - 1)?->id;
            $nextContentId = $orderedContents->get($currentIndex + 1)?->id;
        }

        // Load user progress for the sidebar
        $progress = UserProgress::where('user_id', Auth::id())
            ->whereIn('content_id', $course->modules->flatMap->contents->pluck('id'))
            ->pluck('content_id');

        $unlockedContentIds = [];
        if (Auth::user()->isAdmin()) {
            $unlockedContentIds = $course->modules->flatMap->contents->pluck('id')->all();
        } else {
            $completedSet = array_flip($progress->all());
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
        }

        if (! in_array($content->id, $unlockedContentIds, true)) {
            abort(403, 'This lesson is locked. Complete the previous module to unlock it.');
        }

        if ($previousContentId !== null && ! in_array($previousContentId, $unlockedContentIds, true)) {
            $previousContentId = null;
        }

        if ($nextContentId !== null && ! in_array($nextContentId, $unlockedContentIds, true)) {
            $nextContentId = null;
        }

        if ($content->type === 'quiz') {
            $content->load(['quiz.questions.options']);
            $content->quiz->load(['attempts' => function ($q) {
                $q->where('user_id', Auth::id())
                    ->withCount([
                        'answers as correct_answers_count' => function ($qq) {
                            $qq->where('is_correct', true);
                        },
                        'answers',
                    ])
                    ->orderBy('created_at', 'desc');
            }]);
        }

        return \Inertia\Inertia::render('courses/lesson', [
            'course' => $course,
            'currentContent' => $content,
            'userProgress' => $progress,
            'unlockedContentIds' => $unlockedContentIds,
            'previousContentId' => $previousContentId,
            'nextContentId' => $nextContentId,
        ]);
    }

    public function complete(\App\Models\Course $course, \App\Models\Content $content)
    {
        // Check if content belongs to course
        if ($content->module->course_id !== $course->id) {
            abort(404);
        }

        $user = Auth::user();

        if (! $user) {
            abort(401);
        }
        
        $progress = UserProgress::where('user_id', $user->id)
            ->where('content_id', $content->id)
            ->first();

        if ($progress) {
            // Toggle off if already exists (optional, or just keep it completed)
            // For now let's allow toggling
            $progress->delete();
        } else {
            UserProgress::create([
                'user_id' => $user->id,
                'content_id' => $content->id,
                'completed_at' => now(),
            ]);
        }

        app(CourseProgressService::class)->updateForUserAndCourse($user, $course);

        return $progress
            ? back()->with('success', 'Lesson marked as incomplete.')
            : back()->with('success', 'Lesson marked as complete.');
    }
}
