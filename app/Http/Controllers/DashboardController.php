<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
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
            ];
        });

        return Inertia::render('dashboard', [
            'enrolledCourses' => $courses,
            'stats' => [
                'total_courses' => $totalCoursesCount,
                'completed_courses' => $completedCoursesCount,
                'in_progress_courses' => $inProgressCoursesCount,
            ],
            'recentActivity' => $recentActivity,
        ]);
    }
}
