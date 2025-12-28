<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // User Stats
        $totalUsers = User::count();
        $totalStudents = User::where('role', 'student')->count();
        $totalAdmins = User::where('role', 'admin')->count();

        // Course Stats
        $totalCourses = Course::count();
        $publishedCourses = Course::where('is_published', true)->count(); // Assuming is_published exists, or just count all if not

        // Enrollment Stats
        // We can get enrollments from the course_user table
        $totalEnrollments = DB::table('course_user')->count();
        $completedEnrollments = DB::table('course_user')->whereNotNull('completed_at')->count();

        $completionRate = $totalEnrollments > 0
            ? round(($completedEnrollments / $totalEnrollments) * 100, 1)
            : 0;

        $certificatesIssued = Certificate::count();

        $startDate = Carbon::today()->subDays(13)->startOfDay();

        $enrollmentsByDay = DB::table('course_user')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->pluck('count', 'date');

        $completionsByDay = DB::table('course_user')
            ->selectRaw('DATE(completed_at) as date, COUNT(*) as count')
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', $startDate)
            ->groupBy('date')
            ->pluck('count', 'date');

        $certificatesByDay = Certificate::query()
            ->selectRaw('DATE(issued_at) as date, COUNT(*) as count')
            ->where('issued_at', '>=', $startDate)
            ->groupBy('date')
            ->pluck('count', 'date');

        $series = collect(range(0, 13))
            ->map(function ($i) use ($startDate, $enrollmentsByDay, $completionsByDay, $certificatesByDay) {
                $date = $startDate->copy()->addDays($i)->toDateString();

                return [
                    'date' => $date,
                    'enrollments' => (int) ($enrollmentsByDay[$date] ?? 0),
                    'completions' => (int) ($completionsByDay[$date] ?? 0),
                    'certificates' => (int) ($certificatesByDay[$date] ?? 0),
                ];
            })
            ->values();

        // Recent Users
        $recentUsers = User::latest()->take(5)->get();

        // Recent Enrollments (needs joining with users and courses)
        $recentEnrollments = DB::table('course_user')
            ->join('users', 'course_user.user_id', '=', 'users.id')
            ->join('courses', 'course_user.course_id', '=', 'courses.id')
            ->select('users.name as user_name', 'courses.title as course_title', 'course_user.created_at')
            ->orderBy('course_user.created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'total_students' => $totalStudents,
                'total_admins' => $totalAdmins,
                'total_courses' => $totalCourses,
                'total_enrollments' => $totalEnrollments,
                'completed_enrollments' => $completedEnrollments,
                'completion_rate' => $completionRate,
                'certificates_issued' => $certificatesIssued,
            ],
            'series' => $series,
            'recentUsers' => $recentUsers,
            'recentEnrollments' => $recentEnrollments,
        ]);
    }
}
