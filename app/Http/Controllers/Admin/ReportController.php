<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function enrollmentsCsv()
    {
        $filename = 'enrollments_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $rows = DB::table('course_user')
            ->join('users', 'course_user.user_id', '=', 'users.id')
            ->join('courses', 'course_user.course_id', '=', 'courses.id')
            ->select(
                'users.id as user_id',
                'users.name as user_name',
                'users.email as user_email',
                'users.role as user_role',
                'courses.id as course_id',
                'courses.title as course_title',
                'course_user.progress as progress',
                'course_user.created_at as enrolled_at',
                'course_user.completed_at as completed_at'
            )
            ->orderBy('course_user.created_at', 'desc')
            ->get();

        return response()->streamDownload(function () use ($rows) {
            $output = fopen('php://output', 'w');

            fputcsv($output, [
                'user_id',
                'user_name',
                'user_email',
                'user_role',
                'course_id',
                'course_title',
                'progress',
                'enrolled_at',
                'completed_at',
            ]);

            foreach ($rows as $row) {
                fputcsv($output, [
                    $row->user_id,
                    $row->user_name,
                    $row->user_email,
                    $row->user_role,
                    $row->course_id,
                    $row->course_title,
                    $row->progress,
                    $row->enrolled_at,
                    $row->completed_at,
                ]);
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
