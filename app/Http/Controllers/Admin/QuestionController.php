<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(\Illuminate\Http\Request $request, \App\Models\Quiz $quiz): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'text' => 'required|string',
            'type' => 'required|in:multiple_choice,true_false,short_answer',
            'points' => 'required|integer|min:1',
            'options' => 'array|nullable',
            'options.*.text' => 'required|string',
            'options.*.is_correct' => 'boolean',
        ]);

        $question = $quiz->questions()->create([
            'text' => $validated['text'],
            'type' => $validated['type'],
            'points' => $validated['points'],
            'order' => $quiz->questions()->count(),
        ]);

        if (!empty($validated['options'])) {
            foreach ($validated['options'] as $option) {
                $question->options()->create($option);
            }
        }

        return back()->with('success', 'Question added.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(\Illuminate\Http\Request $request, \App\Models\Question $question): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'text' => 'required|string',
            'type' => 'required|in:multiple_choice,true_false,short_answer',
            'points' => 'required|integer|min:1',
            'options' => 'array|nullable',
            'options.*.id' => 'nullable|integer',
            'options.*.text' => 'required|string',
            'options.*.is_correct' => 'boolean',
        ]);

        $question->update([
            'text' => $validated['text'],
            'type' => $validated['type'],
            'points' => $validated['points'],
        ]);

        // Sync options logic
        if (isset($validated['options'])) {
             // Basic sync: delete missing, update existing, create new
             $optionIds = array_filter(array_column($validated['options'], 'id'));
             $question->options()->whereNotIn('id', $optionIds)->delete();

             foreach ($validated['options'] as $optionData) {
                 if (isset($optionData['id'])) {
                     $question->options()->where('id', $optionData['id'])->update([
                         'text' => $optionData['text'],
                         'is_correct' => $optionData['is_correct'] ?? false,
                     ]);
                 } else {
                     $question->options()->create([
                         'text' => $optionData['text'],
                         'is_correct' => $optionData['is_correct'] ?? false,
                     ]);
                 }
             }
        }

        return back()->with('success', 'Question updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Question $question): \Illuminate\Http\RedirectResponse
    {
        $question->delete();

        return back()->with('success', 'Question deleted.');
    }
}
