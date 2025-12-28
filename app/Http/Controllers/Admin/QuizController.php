<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function edit(\App\Models\Quiz $quiz): \Inertia\Response
    {
        $quiz->load(['content.module.course', 'questions.options']);

        return \Inertia\Inertia::render('admin/quizzes/edit', [
            'quiz' => $quiz,
            'course' => $quiz->content->module->course,
            'module' => $quiz->content->module,
            'content' => $quiz->content,
        ]);
    }

    public function update(\Illuminate\Http\Request $request, \App\Models\Quiz $quiz): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'passing_score' => 'required|integer|min:0|max:100',
            'time_limit' => 'nullable|integer|min:1',
            'shuffle_questions' => 'boolean',
        ]);

        $quiz->update($validated);

        return back()->with('success', 'Quiz settings updated.');
    }
}
