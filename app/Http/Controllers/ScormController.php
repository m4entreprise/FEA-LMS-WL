<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\UserProgress;
use App\Services\CourseProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScormController extends Controller
{
    public function get(Content $content)
    {
        $progress = UserProgress::firstOrCreate(
            [
                'user_id' => Auth::id(),
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
        $progress = UserProgress::where('user_id', Auth::id())
            ->where('content_id', $content->id)
            ->firstOrFail();

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
        $user = Auth::user();
        if ($user && $course) {
            app(CourseProgressService::class)->updateForUserAndCourse($user, $course);
        }

        return response()->json(['success' => true]);
    }
}
