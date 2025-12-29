<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): \Inertia\Response
    {
        return \Inertia\Inertia::render('admin/courses/index', [
            'courses' => \App\Models\Course::withCount('students')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): \Inertia\Response
    {
        return \Inertia\Inertia::render('admin/courses/edit', [
            'course' => null,
            'allCourses' => Course::select('id', 'title')->orderBy('title')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'estimated_duration' => 'nullable|integer',
            'is_published' => 'boolean',
            'certificate_title' => 'nullable|string|max:255',
            'certificate_body' => 'nullable|string',
            'prerequisite_ids' => 'nullable|array',
            'prerequisite_ids.*' => 'integer|distinct|exists:courses,id',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
        
        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $count = 1;
        while (\App\Models\Course::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count++;
        }

        $prerequisiteIds = $validated['prerequisite_ids'] ?? [];
        unset($validated['prerequisite_ids']);

        $course = \App\Models\Course::create($validated);
        $course->prerequisites()->sync($prerequisiteIds);

        return redirect()->route('admin.courses.index')->with('success', 'Course created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(\App\Models\Course $course): \Inertia\Response
    {
        return \Inertia\Inertia::render('admin/courses/edit', [
            'course' => $course->load(['modules.contents', 'prerequisites:id,title']),
            'allCourses' => Course::select('id', 'title')->where('id', '!=', $course->id)->orderBy('title')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\Course $course): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'estimated_duration' => 'nullable|integer',
            'is_published' => 'boolean',
            'certificate_title' => 'nullable|string|max:255',
            'certificate_body' => 'nullable|string',
            'prerequisite_ids' => 'nullable|array',
            'prerequisite_ids.*' => [
                'integer',
                'distinct',
                'exists:courses,id',
                Rule::notIn([$course->id]),
            ],
        ]);

        if ($course->title !== $validated['title']) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
            
            // Ensure slug is unique
            $originalSlug = $validated['slug'];
            $count = 1;
            while (\App\Models\Course::where('slug', $validated['slug'])->where('id', '!=', $course->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count++;
            }
        }

        $prerequisiteIds = $validated['prerequisite_ids'] ?? [];
        unset($validated['prerequisite_ids']);

        $course->update($validated);
        $course->prerequisites()->sync($prerequisiteIds);

        return redirect()->route('admin.courses.index')->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Course $course): \Illuminate\Http\RedirectResponse
    {
        $course->delete();

        return redirect()->route('admin.courses.index')->with('success', 'Course deleted successfully.');
    }
}
