<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $q = trim((string) $request->query('q', ''));

        $certificatesQuery = Certificate::query()->with(['user:id,name,email', 'course:id,title,slug']);

        if ($q !== '') {
            $certificatesQuery->where(function ($query) use ($q) {
                $query
                    ->where('certificate_number', 'like', '%' . $q . '%')
                    ->orWhere('uuid', 'like', '%' . $q . '%')
                    ->orWhereHas('user', function ($userQuery) use ($q) {
                        $userQuery->where('name', 'like', '%' . $q . '%')->orWhere('email', 'like', '%' . $q . '%');
                    })
                    ->orWhereHas('course', function ($courseQuery) use ($q) {
                        $courseQuery->where('title', 'like', '%' . $q . '%')->orWhere('slug', 'like', '%' . $q . '%');
                    });
            });
        }

        $certificates = $certificatesQuery
            ->orderByDesc('issued_at')
            ->limit(200)
            ->get();

        return \Inertia\Inertia::render('admin/certificates/index', [
            'certificates' => $certificates,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }
}
