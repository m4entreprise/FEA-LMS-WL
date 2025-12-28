<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserProgress;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): \Inertia\Response
    {
        return \Inertia\Inertia::render('courses/index', [
            'courses' => \App\Models\Course::where('is_published', true)
                ->withCount('modules')
                ->get(),
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
        if ($user && $enrollment && $firstContentId) {
            $completedContentIds = UserProgress::where('user_id', $user->id)
                ->whereIn('content_id', $orderedContents->pluck('id'))
                ->pluck('content_id')
                ->all();

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
        ]);
    }
}
