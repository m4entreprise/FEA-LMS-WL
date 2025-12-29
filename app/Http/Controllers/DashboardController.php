<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (! $user instanceof User) {
            abort(403, 'Unauthorized action.');
        }

        if ($user && $user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        
        // Calculate stats
        $totalCoursesCount = $user->courses()->count();
        $completedCoursesCount = $user->courses()->wherePivotNotNull('completed_at')->count();
        $inProgressCoursesCount = $totalCoursesCount - $completedCoursesCount;

        // Get recent activity (completed lessons)
        $recentActivity = UserProgress::where('user_id', $user->id)
            ->with(['content.module.course'])
            ->orderBy('completed_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($progress) {
                return [
                    'id' => $progress->id,
                    'content_title' => $progress->content->title,
                    'course_title' => $progress->content->module->course->title,
                    'course_slug' => $progress->content->module->course->slug,
                    'content_id' => $progress->content->id,
                    'completed_at_human' => $progress->completed_at->diffForHumans(),
                    'type' => $progress->content->type,
                ];
            });

        $courses = $user->courses()->get()->map(function ($course) use ($user) {
            // Get all content IDs for this course
            $contentIds = $course->modules->flatMap->contents->pluck('id');
            $totalContents = $contentIds->count();

            if ($totalContents === 0) {
                $progress = 0;
            } else {
                // Count how many of these contents the user has completed
                $completedCount = UserProgress::where('user_id', $user->id)
                    ->whereIn('content_id', $contentIds)
                    ->count();
                
                $progress = round(($completedCount / $totalContents) * 100);
            }

            return [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'category' => $course->category,
                'image_path' => $course->image_path,
                'progress' => $progress,
                'total_contents' => $totalContents,
                'completed_at' => optional($course->pivot?->completed_at)->toISOString(),
            ];
        });

        $completedCourses = $user->courses()
            ->whereNotNull('course_user.completed_at')
            ->get(['courses.id', 'courses.title', 'courses.slug']);

        $certificatesByCourse = Certificate::where('user_id', $user->id)
            ->whereIn('course_id', $completedCourses->pluck('id'))
            ->get(['uuid', 'certificate_number', 'issued_at', 'course_id'])
            ->keyBy('course_id');

        $completedCoursesPayload = $completedCourses
            ->map(function ($course) use ($certificatesByCourse) {
                $cert = $certificatesByCourse->get($course->id);

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'completed_at' => optional($course->pivot?->completed_at)->toISOString(),
                    'certificate' => $cert ? [
                        'uuid' => $cert->uuid,
                        'certificate_number' => $cert->certificate_number,
                        'issued_at' => optional($cert->issued_at)->toISOString(),
                    ] : null,
                ];
            })
            ->values();

        $certificates = Certificate::query()
            ->where('user_id', $user->id)
            ->with(['course:id,title,slug'])
            ->orderByDesc('issued_at')
            ->limit(10)
            ->get()
            ->map(function (Certificate $certificate) {
                return [
                    'uuid' => $certificate->uuid,
                    'certificate_number' => $certificate->certificate_number,
                    'issued_at' => optional($certificate->issued_at)->toISOString(),
                    'course' => $certificate->course
                        ? [
                            'title' => $certificate->course->title,
                            'slug' => $certificate->course->slug,
                        ]
                        : null,
                ];
            })
            ->values();

        $recommendedCourses = Course::query()
            ->where('is_published', true)
            ->whereDoesntHave('students', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            })
            ->withCount('modules')
            ->orderBy('title')
            ->limit(6)
            ->get(['id', 'title', 'slug', 'description', 'category', 'estimated_duration']);

        return Inertia::render('dashboard', [
            'enrolledCourses' => $courses,
            'completedCourses' => $completedCoursesPayload,
            'certificates' => $certificates,
            'recommendedCourses' => $recommendedCourses,
            'stats' => [
                'total_courses' => $totalCoursesCount,
                'completed_courses' => $completedCoursesCount,
                'in_progress_courses' => $inProgressCoursesCount,
            ],
            'recentActivity' => $recentActivity,
        ]);
    }
}
