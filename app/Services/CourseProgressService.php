<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use App\Models\UserProgress;
use Illuminate\Support\Carbon;

class CourseProgressService
{
    public function updateForUserAndCourse(User $user, Course $course): void
    {
        $course->loadMissing(['modules.contents' => function ($query) {
            $query->select('id', 'module_id');
        }]);

        $contentIds = $course->modules->flatMap->contents->pluck('id');
        $totalContents = $contentIds->count();

        $progress = 0;
        $completedAt = null;

        if ($totalContents > 0) {
            $completedCount = UserProgress::where('user_id', $user->id)
                ->whereIn('content_id', $contentIds)
                ->whereNotNull('completed_at')
                ->count();

            $progress = (int) round(($completedCount / $totalContents) * 100);

            if ($completedCount === $totalContents) {
                $completedAt = Carbon::now();
            }
        }

        $user->courses()->updateExistingPivot($course->id, [
            'progress' => $progress,
            'completed_at' => $completedAt,
        ]);
    }
}
