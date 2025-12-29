<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Laravel\Fortify\Features;

class CertificateController extends Controller
{
    public function index(): \Inertia\Response
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (! $user) {
            abort(401);
        }

        $completedCourses = $user->courses()
            ->whereNotNull('course_user.completed_at')
            ->get(['courses.id', 'courses.title', 'courses.slug']);

        $certificates = Certificate::where('user_id', $user->id)
            ->whereIn('course_id', $completedCourses->pluck('id'))
            ->get(['id', 'uuid', 'certificate_number', 'issued_at', 'course_id'])
            ->keyBy('course_id');

        $payload = $completedCourses
            ->map(function ($course) use ($certificates) {
                $cert = $certificates->get($course->id);

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'completed_at' => optional($course->pivot?->completed_at)->toISOString(),
                    'certificate' => $cert ? [
                        'uuid' => $cert->uuid,
                        'certificate_number' => $cert->certificate_number,
                        'issued_at' => optional($cert->issued_at)->toISOString(),
                    ] : null,
                ];
            })
            ->values();

        return \Inertia\Inertia::render('certificates/index', [
            'completedCourses' => $payload,
        ]);
    }

    public function verify(string $uuid): \Inertia\Response
    {
        $certificate = Certificate::where('uuid', $uuid)
            ->with(['user:id,name', 'course:id,title,slug'])
            ->first();

        return \Inertia\Inertia::render('certificates/verify', [
            'certificate' => $certificate,
            'query' => $uuid,
            'searched' => true,
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }

    public function verifyForm(Request $request): \Inertia\Response
    {
        $qRaw = trim((string) $request->query('q', ''));

        $q = $qRaw;
        if ($q !== '' && str_contains($q, '/')) {
            $q = trim((string) Str::of($q)->afterLast('/'));
        }

        $certificate = null;
        if ($q !== '') {
            $qUpper = strtoupper($q);

            $certificate = Certificate::query()
                ->where('uuid', $q)
                ->orWhere('certificate_number', $qUpper)
                ->with(['user:id,name', 'course:id,title,slug'])
                ->first();
        }

        return \Inertia\Inertia::render('certificates/verify', [
            'certificate' => $certificate,
            'query' => $qRaw,
            'searched' => $qRaw !== '',
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }

    public function download(Course $course)
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (! $user) {
            abort(401);
        }

        /** @var \App\Models\User $user */

        $enrollment = $user->courses()->where('course_id', $course->id)->first();

        if (!$enrollment || !$enrollment->pivot->completed_at) {
            abort(403, 'Course must be completed to download certificate.');
        }

        $certificate = Certificate::firstOrCreate(
            [
                'user_id' => $user->id,
                'course_id' => $course->id,
            ],
            [
                'uuid' => (string) Str::uuid(),
                'certificate_number' => strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4)),
                'issued_at' => now(),
            ]
        );

        $certificate->loadMissing(['user', 'course']);

        $pdf = Pdf::loadView('certificates/course', [
            'certificate' => $certificate,
            'user' => $certificate->user,
            'course' => $certificate->course,
        ])->setPaper('a4', 'landscape');

        $filename = 'certificate_' . $course->slug . '_' . $certificate->certificate_number . '.pdf';

        return $pdf->download($filename);
    }
}
