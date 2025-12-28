<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Illuminate\Http\Request;

class ContentController extends Controller
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
    public function store(\Illuminate\Http\Request $request, \App\Models\Module $module): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:text,video,quiz,scorm,document',
        ]);

        $content = $module->contents()->create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'order' => $module->contents()->count(),
        ]);

        if ($validated['type'] === 'quiz') {
            $content->quiz()->create([
                'description' => '',
                'passing_score' => 70,
            ]);
        }

        return back()->with('success', 'Content added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Content $content)
    {
        return redirect()->route('admin.contents.edit', $content);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Content $content): \Inertia\Response|\Illuminate\Http\RedirectResponse
    {
        if ($content->type === 'quiz') {
            return redirect()->route('admin.quizzes.edit', $content->quiz ?? $content->quiz()->create());
        }

        $content->load('module.course');
        
        return \Inertia\Inertia::render('admin/contents/edit', [
            'content' => $content,
            'course' => $content->module->course,
            'module' => $content->module,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(\Illuminate\Http\Request $request, Content $content): \Illuminate\Http\RedirectResponse
    {
        $rules = [
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:text,video,quiz,scorm,document',
            'body' => 'nullable|string',
            'video_url' => 'nullable|string',
            'order' => 'integer',
        ];

        // Add file validation if a file is being uploaded
        if ($request->hasFile('file')) {
            $maxSize = 102400; // 100MB default
            if ($request->type === 'video') {
                $maxSize = 512000; // 500MB for videos
            }

            $rules['file'] = "required|file|max:$maxSize";
            if ($request->type === 'scorm') {
                $rules['file'] .= '|mimes:zip';
            } elseif ($request->type === 'video') {
                $rules['file'] .= '|mimes:mp4,mov,ogg,qt,webm';
            }
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('file')) {
            if ($content->type === 'scorm') {
                $validated['file_path'] = $this->handleScormUpload($request->file('file'));
            } elseif ($content->type === 'video') {
                $validated['file_path'] = $request->file('file')->store('videos', 'public');
            } else {
                $validated['file_path'] = $request->file('file')->store('documents', 'public');
            }
        }

        unset($validated['file']);

        $content->update($validated);

        return redirect()->route('admin.courses.edit', $content->module->course_id)
            ->with('success', 'Content updated successfully.');
    }

    private function handleScormUpload($file)
    {
        $zip = new \ZipArchive;
        $folderName = 'scorm_' . uniqid();
        $extractPath = storage_path('app/public/scorm/' . $folderName);

        if ($zip->open($file->getRealPath()) === TRUE) {
            $zip->extractTo($extractPath);
            $zip->close();
            
            // Try to find entry point
            $entryPoint = $this->findScormEntryPoint($extractPath);
            return 'scorm/' . $folderName . '/' . $entryPoint;
        }
        
        throw new \Exception('Failed to extract SCORM package.');
    }

    private function findScormEntryPoint($path)
    {
        if (file_exists($path . '/index.html')) return 'index.html';
        if (file_exists($path . '/story.html')) return 'story.html';
        if (file_exists($path . '/launcher.html')) return 'launcher.html';
        
        // Scan for any .html file if standard ones aren't found
        $files = glob($path . '/*.html');
        if (count($files) > 0) {
            return basename($files[0]);
        }

        return 'index.html'; // Fallback
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Content $content): \Illuminate\Http\RedirectResponse
    {
        $content->delete();

        return back()->with('success', 'Content deleted successfully.');
    }
}
