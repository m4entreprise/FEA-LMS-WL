<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Http\Request;

class QuestionBankController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $q = trim((string) $request->query('q', ''));
        $type = trim((string) $request->query('type', ''));
        $courseId = trim((string) $request->query('course', ''));

        $questionsQuery = Question::query()
            ->with(['options', 'quiz.content.module.course']);

        if ($type !== '') {
            $questionsQuery->where('type', $type);
        }

        if ($courseId !== '') {
            $questionsQuery->whereHas('quiz.content.module.course', function ($courseQuery) use ($courseId) {
                $courseQuery->where('id', (int) $courseId);
            });
        }

        if ($q !== '') {
            $questionsQuery->where(function ($query) use ($q) {
                $query
                    ->where('text', 'like', '%' . $q . '%')
                    ->orWhere('type', 'like', '%' . $q . '%')
                    ->orWhereHas('quiz.content', function ($contentQuery) use ($q) {
                        $contentQuery->where('title', 'like', '%' . $q . '%');
                    })
                    ->orWhereHas('quiz.content.module.course', function ($courseQuery) use ($q) {
                        $courseQuery->where('title', 'like', '%' . $q . '%')->orWhere('slug', 'like', '%' . $q . '%');
                    });
            });
        }

        $questions = $questionsQuery
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        $quizzes = Quiz::query()
            ->with(['content.module.course'])
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        $courses = Course::query()
            ->select(['id', 'title'])
            ->orderBy('title')
            ->get();

        return \Inertia\Inertia::render('admin/question-bank/index', [
            'questions' => $questions,
            'quizzes' => $quizzes,
            'courses' => $courses,
            'filters' => [
                'q' => $q,
                'type' => $type,
                'course' => $courseId,
            ],
        ]);
    }

    public function copy(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'question_id' => 'required|integer|exists:questions,id',
            'quiz_id' => 'required|integer|exists:quizzes,id',
        ]);

        $source = Question::with('options')->findOrFail($validated['question_id']);
        $targetQuiz = Quiz::findOrFail($validated['quiz_id']);

        $maxOrder = $targetQuiz->questions()->max('order');
        $nextOrder = $maxOrder === null ? 0 : ((int) $maxOrder + 1);

        $copy = $targetQuiz->questions()->create([
            'text' => $source->text,
            'type' => $source->type,
            'points' => $source->points,
            'order' => $nextOrder,
        ]);

        foreach ($source->options as $option) {
            $copy->options()->create([
                'text' => $option->text,
                'is_correct' => (bool) $option->is_correct,
            ]);
        }

        return back()->with('success', 'Question copied to quiz.');
    }
}
