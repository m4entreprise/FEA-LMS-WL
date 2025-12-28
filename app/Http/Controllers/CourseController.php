<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserProgress;
use App\Models\Course;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): \Inertia\Response
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        $search = $request->string('q')->trim()->toString();
        $category = $request->string('category')->trim()->toString();
        $duration = $request->string('duration')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $query = Course::query()
            ->where('is_published', true)
            ->withCount('modules')
            ->orderBy('title');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category !== '') {
            $query->where('category', $category);
        }

        if ($duration !== '') {
            if ($duration === '0-30') {
                $query->whereNotNull('estimated_duration')->where('estimated_duration', '<=', 30);
            }

            if ($duration === '30-60') {
                $query->whereNotNull('estimated_duration')->whereBetween('estimated_duration', [30, 60]);
            }

            if ($duration === '60+') {
                $query->whereNotNull('estimated_duration')->where('estimated_duration', '>=', 60);
            }
        }

        if ($user) {
            if ($status === 'enrolled') {
                $query->whereHas('students', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
            }

            if ($status === 'completed') {
                $query->whereHas('students', function ($q) use ($user) {
                    $q->where('users.id', $user->id)->whereNotNull('course_user.completed_at');
                });
            }

            if ($status === 'available') {
                $query->whereDoesntHave('students', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
            }

            $query->withExists([
                'students as is_enrolled' => function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                },
                'students as is_completed' => function ($q) use ($user) {
                    $q->where('users.id', $user->id)->whereNotNull('course_user.completed_at');
                },
            ]);
        }

        $categories = Course::where('is_published', true)
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->values();

        return \Inertia\Inertia::render('courses/index', [
            'courses' => $query->paginate(9)->withQueryString(),
            'categories' => $categories,
            'filters' => [
                'q' => $search,
                'category' => $category,
                'duration' => $duration,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Enroll the user in the course.
     */
    public function enroll(\Illuminate\Http\Request $request, \App\Models\Course $course): \Illuminate\Http\RedirectResponse
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (! $user) {
            abort(401);
        }

        $course->loadMissing(['prerequisites:id']);
        if ($course->prerequisites->isNotEmpty()) {
            $completedCourseIds = $user->courses()
                ->whereNotNull('course_user.completed_at')
                ->pluck('courses.id')
                ->all();

            $missingPrerequisiteIds = $course->prerequisites
                ->pluck('id')
                ->reject(fn ($id) => in_array($id, $completedCourseIds, true))
                ->values();

            if ($missingPrerequisiteIds->isNotEmpty()) {
                return back()->withErrors([
                    'prerequisites' => 'You must complete all prerequisite courses before enrolling.',
                ]);
            }
        }

        if (! $course->students()->where('user_id', Auth::id())->exists()) {
            $course->students()->attach(Auth::id());
        }

        return redirect()->route('courses.show', $course);
    }
    /**
     * Display the specified resource.
     */
    public function show(\App\Models\Course $course): \Inertia\Response
    {
        if (! $course->is_published) {
            abort(404);
        }

        $course->load([
            'prerequisites:id,title,slug',
            'modules.contents' => function ($query) {
            $query->select('id', 'module_id', 'title', 'type', 'order'); 
            },
        ]);

        $orderedContents = $course->modules
            ->flatMap(fn ($m) => $m->contents)
            ->values();

        $firstContentId = $orderedContents->first()?->id;

        $enrollment = $course->students()->where('user_id', Auth::id())->first();

        $missingPrerequisiteIds = [];
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        $continueContentId = $firstContentId;
        $progressSummary = [
            'percent' => 0,
            'completed' => 0,
            'total' => $orderedContents->count(),
        ];

        if ($user && $enrollment && $firstContentId) {
            $completedContentIds = UserProgress::where('user_id', $user->id)
                ->whereIn('content_id', $orderedContents->pluck('id'))
                ->pluck('content_id')
                ->all();

            $completedCount = count($completedContentIds);
            $totalCount = $orderedContents->count();

            $progressSummary = [
                'percent' => $totalCount > 0 ? (int) round(($completedCount / $totalCount) * 100) : 0,
                'completed' => $completedCount,
                'total' => $totalCount,
            ];

            $continueContentId = $orderedContents
                ->first(fn ($c) => ! in_array($c->id, $completedContentIds, true))
                ?->id;

            $continueContentId = $continueContentId ?: $firstContentId;
        }
        if ($user && $course->prerequisites->isNotEmpty()) {
            $completedCourseIds = $user->courses()
                ->whereNotNull('course_user.completed_at')
                ->pluck('courses.id')
                ->all();

            $missingPrerequisiteIds = $course->prerequisites
                ->pluck('id')
                ->reject(fn ($id) => in_array($id, $completedCourseIds, true))
                ->values()
                ->all();
        }

        return \Inertia\Inertia::render('courses/show', [
            'course' => $course,
            'isEnrolled' => $enrollment !== null,
            'completedAt' => $enrollment?->pivot?->completed_at,
            'missingPrerequisiteIds' => $missingPrerequisiteIds,
            'firstContentId' => $firstContentId,
            'continueContentId' => $continueContentId,
            'progress' => $progressSummary,
        ]);
    }
}
