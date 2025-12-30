<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Models\UserProgress;
use App\Services\CourseProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class QuizAttemptController extends Controller
{
    public function start(Quiz $quiz)
    {
        // Check if user has access to this quiz (enrolled in course) - handled by middleware/policy usually, 
        // but explicit check is good.
        
        // For now, just create a placeholder attempt or just return success to start the timer.
        // Actually, we might not need to create the attempt record until submission 
        // UNLESS we want to enforce time limits strictly from server side or track "in progress".
        
        // Let's keep it simple: "Start" just validates they can take it.
        // Real creation happens on submit for this simple version.

        $userId = Auth::id();
        if (! $userId) {
            abort(401);
        }

        $user = User::findOrFail($userId);

        $quiz->loadMissing('content.module.course');

        $content = $quiz->content;
        $course = $content?->module?->course;
        if (! $content || ! $course || $content->type !== 'quiz') {
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

        $practice = request()->boolean('practice');
        $hasPassed = $quiz->attempts()
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->where('passed', true)
            ->exists();

        if ($hasPassed && ! $practice) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'You already passed this quiz. Use Practice Again to retake.',
                ], 403);
            }

            abort(403, 'You already passed this quiz. Use Practice Again to retake.');
        }

        $existingAttempt = $quiz->attempts()
            ->where('user_id', $user->id)
            ->whereNull('completed_at')
            ->orderByDesc('created_at')
            ->first();

        if ($existingAttempt && $quiz->time_limit) {
            $deadline = $existingAttempt->created_at->copy()->addMinutes($quiz->time_limit);
            if (now()->greaterThan($deadline)) {
                $existingAttempt->update([
                    'score' => 0,
                    'passed' => false,
                    'completed_at' => now(),
                ]);
                $existingAttempt = null;
            }
        }

        $attempt = $existingAttempt;
        if (! $attempt) {
            $attempt = $quiz->attempts()->create([
                'user_id' => $user->id,
            ]);
        }

        if (request()->expectsJson()) {
            $deadline = $quiz->time_limit
                ? $attempt->created_at->copy()->addMinutes($quiz->time_limit)
                : null;

            return response()->json([
                'success' => true,
                'attempt_id' => $attempt->id,
                'started_at' => $attempt->created_at->toIso8601String(),
                'deadline_at' => $deadline?->toIso8601String(),
                'time_limit' => $quiz->time_limit,
            ]);
        }

        return back();
    }

    public function submit(Request $request, Quiz $quiz)
    {
        $userId = Auth::id();
        if (! $userId) {
            abort(401);
        }

        $user = User::findOrFail($userId);

        $quiz->loadMissing('content.module.course');

        $content = $quiz->content;
        $course = $content?->module?->course;
        if (! $content || ! $course || $content->type !== 'quiz') {
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

        $hasPassed = $quiz->attempts()
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->where('passed', true)
            ->exists();

        $attempt = $quiz->attempts()
            ->where('user_id', $user->id)
            ->whereNull('completed_at')
            ->orderByDesc('created_at')
            ->first();

        if (! $attempt) {
            if ($hasPassed) {
                return back()->withErrors([
                    'error' => 'You already passed this quiz. Use Practice Again to start a new attempt.',
                ]);
            }

            if ($quiz->time_limit) {
                return back()->withErrors([
                    'error' => 'You must start the quiz before submitting it.',
                ]);
            }

            $attempt = $quiz->attempts()->create([
                'user_id' => $user->id,
            ]);
        }

        if ($quiz->time_limit) {
            $deadline = $attempt->created_at->copy()->addMinutes($quiz->time_limit);
            if (now()->greaterThan($deadline)) {
                $attempt->update([
                    'score' => 0,
                    'passed' => false,
                    'completed_at' => now(),
                ]);

                return back()->withErrors([
                    'error' => 'Time limit exceeded. Please retake the quiz.',
                ]);
            }
        }

        $validated = $request->validate([
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.option_id' => 'nullable|exists:question_options,id',
            'answers.*.text_answer' => 'nullable|string',
        ]);

        $score = 0;
        
        $quiz->load('questions.options');

        if ($quiz->questions->isEmpty()) {
            return back()->withErrors([
                'error' => 'This quiz has no questions. Please contact an administrator.',
            ]);
        }

        $totalPoints = (int) $quiz->questions->sum('points');
        if ($totalPoints <= 0) {
            return back()->withErrors([
                'error' => 'This quiz is not configured correctly (total points is 0). Please contact an administrator.',
            ]);
        }

        $quizQuestionIds = $quiz->questions->pluck('id')->all();
        foreach ($validated['answers'] as $answer) {
            if (! in_array($answer['question_id'], $quizQuestionIds, true)) {
                return back()->withErrors([
                    'error' => 'Invalid quiz submission (unknown question).',
                ]);
            }
        }

        $answersByQuestionId = collect($validated['answers'])->keyBy('question_id');
        foreach ($quiz->questions as $question) {
            $answer = $answersByQuestionId->get($question->id);
            if (! $answer) {
                return back()->withErrors([
                    'error' => 'Please answer all questions before submitting.',
                ]);
            }

            if (in_array($question->type, ['multiple_choice', 'true_false'], true)) {
                if (! array_key_exists('option_id', $answer) || $answer['option_id'] === null) {
                    return back()->withErrors([
                        'error' => 'Please answer all questions before submitting.',
                    ]);
                }
            }

            if ($question->type === 'short_answer') {
                $text = trim((string) ($answer['text_answer'] ?? ''));
                if ($text === '') {
                    return back()->withErrors([
                        'error' => 'Please answer all questions before submitting.',
                    ]);
                }
            }
        }

        DB::beginTransaction();
        try {
            $attempt->answers()->delete();

            foreach ($quiz->questions as $question) {
                // Find user answer for this question
                $userAnswer = collect($validated['answers'])->firstWhere('question_id', $question->id);
                
                $isCorrect = false;
                $textAnswer = null;
                $optionId = null;

                if ($userAnswer) {
                    if ($question->type === 'multiple_choice' || $question->type === 'true_false') {
                        $optionId = $userAnswer['option_id'] ?? null;
                        $selectedOption = $optionId
                            ? $question->options->where('id', $optionId)->first()
                            : null;

                        if ($optionId !== null && ! $selectedOption) {
                            throw new \Exception('Invalid quiz submission (unknown option).');
                        }

                        if ($selectedOption && $selectedOption->is_correct) {
                            $isCorrect = true;
                            $score += $question->points;
                        }
                    } elseif ($question->type === 'short_answer') {
                        $textAnswer = (string) ($userAnswer['text_answer'] ?? '');
                        // Basic string matching for short answer (case insensitive)
                        // This assumes we stored correct answer(s) in options for short answer too, 
                        // or we need a different mechanism. 
                        // In QuestionController store/update, we allowed options for short answer?
                        // Let's check Question model structure again.
                        // Ideally short answer correct text is stored in an option with is_correct=true
                        
                        $correctOptions = $question->options->where('is_correct', true);
                        foreach ($correctOptions as $opt) {
                            if (strcasecmp(trim($textAnswer), trim($opt->text)) === 0) {
                                $isCorrect = true;
                                $score += $question->points;
                                break;
                            }
                        }
                    }
                }

                $attempt->answers()->create([
                    'question_id' => $question->id,
                    'question_option_id' => $optionId,
                    'text_answer' => $textAnswer,
                    'is_correct' => $isCorrect,
                ]);
            }

            $attempt->update([
                'score' => $score,
                'passed' => $score >= (($quiz->passing_score / 100) * $totalPoints),
                'completed_at' => now(),
            ]);

            $attempt->refresh();

            if ($attempt->passed) {
                $quiz->loadMissing('content.module.course');

                /** @var Content|null $content */
                $content = $quiz->content;
                if ($content) {
                    $progress = UserProgress::firstOrCreate(
                        ['user_id' => $user->id, 'content_id' => $content->id],
                        []
                    );

                    if (! $progress->completed_at) {
                        $progress->completed_at = now();
                        $progress->save();
                    }

                    $course = $content->module?->course;
                    if ($course) {
                        app(CourseProgressService::class)->updateForUserAndCourse($user, $course);
                    }
                }
            }

            DB::commit();

            return back()->with('success', 'Quiz submitted!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to submit quiz: ' . $e->getMessage()]);
        }
    }
}
