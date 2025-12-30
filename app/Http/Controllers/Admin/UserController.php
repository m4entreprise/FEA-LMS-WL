<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Certificate;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): \Inertia\Response
    {
        return \Inertia\Inertia::render('admin/users/index', [
            'users' => \App\Models\User::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): \Inertia\Response
    {
        return \Inertia\Inertia::render('admin/users/edit', [
            'user' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,student',
        ]);

        \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(\App\Models\User $user): \Inertia\Response
    {
        $user->load(['courses.modules.contents']);
        
        $enrolledCourses = $user->courses->map(function ($course) use ($user) {
             $contentIds = $course->modules->flatMap->contents->pluck('id');
             $totalContents = $contentIds->count();
             
             if ($totalContents === 0) {
                 $progress = 0;
             } else {
                 $completedCount = \App\Models\UserProgress::where('user_id', $user->id)
                     ->whereIn('content_id', $contentIds)
                     ->whereNotNull('completed_at')
                     ->count();
                 $progress = round(($completedCount / $totalContents) * 100);
             }
             
             return [
                 'id' => $course->id,
                 'title' => $course->title,
                 'slug' => $course->slug,
                 'progress' => $progress,
                 'total_contents' => $totalContents,
                 'completed_at' => $course->pivot->completed_at,
                 'enrolled_at' => $course->pivot->created_at,
             ];
        });

        // Recent activity
        $recentActivity = \App\Models\UserProgress::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->with(['content.module.course'])
            ->orderBy('completed_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($progress) {
                return [
                    'id' => $progress->id,
                    'content_title' => $progress->content->title,
                    'course_title' => $progress->content->module->course->title,
                    'completed_at' => $progress->completed_at,
                    'type' => $progress->content->type,
                ];
            });

        $certificates = Certificate::query()
            ->where('user_id', $user->id)
            ->with(['course:id,title,slug'])
            ->orderByDesc('issued_at')
            ->get()
            ->map(function (Certificate $certificate) {
                return [
                    'uuid' => $certificate->uuid,
                    'certificate_number' => $certificate->certificate_number,
                    'issued_at' => $certificate->issued_at?->toISOString(),
                    'course' => $certificate->course
                        ? [
                            'title' => $certificate->course->title,
                            'slug' => $certificate->course->slug,
                        ]
                        : null,
                ];
            });

        return \Inertia\Inertia::render('admin/users/show', [
            'user' => $user,
            'enrolledCourses' => $enrolledCourses,
            'recentActivity' => $recentActivity,
            'certificates' => $certificates,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(\App\Models\User $user): \Inertia\Response
    {
        return \Inertia\Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\User $user): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|in:admin,student',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => \Illuminate\Support\Facades\Hash::make($validated['password'])]);
        }

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\User $user): \Illuminate\Http\RedirectResponse
    {
        if ($user->id === \Illuminate\Support\Facades\Auth::id()) {
            return back()->withErrors(['error' => 'You cannot delete yourself.']);
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
