<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BrandSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class BrandingController extends Controller
{
    public function edit(): \Inertia\Response
    {
        if (! Schema::hasTable('brand_settings')) {
            return \Inertia\Inertia::render('admin/branding/edit', [
                'settings' => [
                    'name' => null,
                    'tagline' => null,
                    'tagline_fr' => null,
                    'description' => null,
                    'description_fr' => null,
                    'terms_url' => null,
                    'privacy_url' => null,
                    'support_url' => null,
                    'logo_url' => null,
                    'favicon_url' => null,
                    'favicon_svg_url' => null,
                ],
            ]);
        }

        $settings = BrandSetting::query()->first();

        return \Inertia\Inertia::render('admin/branding/edit', [
            'settings' => [
                'name' => $settings?->name,
                'tagline' => $settings?->tagline,
                'tagline_fr' => $settings?->tagline_fr,
                'description' => $settings?->description,
                'description_fr' => $settings?->description_fr,
                'terms_url' => $settings?->terms_url,
                'privacy_url' => $settings?->privacy_url,
                'support_url' => $settings?->support_url,
                'logo_url' => $settings?->logo_path ? asset('storage/' . $settings->logo_path) : null,
                'favicon_url' => $settings?->favicon_path ? asset('storage/' . $settings->favicon_path) : null,
                'favicon_svg_url' => $settings?->favicon_svg_path ? asset('storage/' . $settings->favicon_svg_path) : null,
            ],
        ]);
    }

    public function update(Request $request): \Illuminate\Http\RedirectResponse
    {
        if (! Schema::hasTable('brand_settings')) {
            return back()->withErrors(['error' => 'Brand settings table is missing. Please run migrations.']);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'tagline_fr' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'terms_url' => 'nullable|string|max:2048',
            'privacy_url' => 'nullable|string|max:2048',
            'support_url' => 'nullable|string|max:2048',
            'logo' => 'nullable|image|max:4096',
            'favicon' => 'nullable|file|mimes:ico,png,jpg,jpeg,webp|max:1024',
            'favicon_svg' => 'nullable|file|mimes:svg|max:1024',
        ]);

        $settings = BrandSetting::query()->first() ?? new BrandSetting();

        $settings->fill([
            'name' => $validated['name'] ?? null,
            'tagline' => $validated['tagline'] ?? null,
            'tagline_fr' => $validated['tagline_fr'] ?? null,
            'description' => $validated['description'] ?? null,
            'description_fr' => $validated['description_fr'] ?? null,
            'terms_url' => $validated['terms_url'] ?? null,
            'privacy_url' => $validated['privacy_url'] ?? null,
            'support_url' => $validated['support_url'] ?? null,
        ]);

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            $settings->logo_path = $request->file('logo')->store('brand', 'public');
        }

        if ($request->hasFile('favicon')) {
            if ($settings->favicon_path) {
                Storage::disk('public')->delete($settings->favicon_path);
            }
            $settings->favicon_path = $request->file('favicon')->store('brand', 'public');
        }

        if ($request->hasFile('favicon_svg')) {
            if ($settings->favicon_svg_path) {
                Storage::disk('public')->delete($settings->favicon_svg_path);
            }
            $settings->favicon_svg_path = $request->file('favicon_svg')->store('brand', 'public');
        }

        $settings->save();

        return back()->with('success', 'Branding updated successfully.');
    }
}
