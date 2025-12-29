<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Quiz;
use App\Models\QuizAttempt;
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
        
        return back();
    }

    public function submit(Request $request, Quiz $quiz)
    {
        $user = Auth::user();
        if (! $user) {
            abort(401);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.option_id' => 'nullable|exists:question_options,id',
            'answers.*.text_answer' => 'nullable|string',
        ]);

        $score = 0;
        $totalPoints = 0;
        
        $quiz->load('questions.options');

        DB::beginTransaction();
        try {
            $attempt = $quiz->attempts()->create([
                'user_id' => $user->id,
                'completed_at' => now(),
            ]);

            foreach ($quiz->questions as $question) {
                $totalPoints += $question->points;
                
                // Find user answer for this question
                $userAnswer = collect($validated['answers'])->firstWhere('question_id', $question->id);
                
                $isCorrect = false;
                $textAnswer = null;
                $optionId = null;

                if ($userAnswer) {
                    if ($question->type === 'multiple_choice' || $question->type === 'true_false') {
                        $optionId = $userAnswer['option_id'];
                        $selectedOption = $question->options->where('id', $optionId)->first();
                        if ($selectedOption && $selectedOption->is_correct) {
                            $isCorrect = true;
                            $score += $question->points;
                        }
                    } elseif ($question->type === 'short_answer') {
                        $textAnswer = $userAnswer['text_answer'];
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
            ]);

            $attempt->refresh();

            if ($attempt->passed) {
                $quiz->loadMissing('content.module.course');

                /** @var Content|null $content */
                $content = $quiz->content;
                if ($content) {
                    UserProgress::updateOrCreate(
                        ['user_id' => $user->id, 'content_id' => $content->id],
                        ['completed_at' => now()]
                    );

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
