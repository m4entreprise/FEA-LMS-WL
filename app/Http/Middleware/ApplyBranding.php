<?php

namespace App\Http\Middleware;

use App\Models\BrandSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class ApplyBranding
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        if (! Schema::hasTable('brand_settings')) {
            return $next($request);
        }

        $settings = BrandSetting::query()->first();
        if (! $settings) {
            return $next($request);
        }

        $locale = app()->getLocale();

        $tagline = $locale === 'fr'
            ? ($settings->tagline_fr ?: $settings->tagline)
            : ($settings->tagline ?: $settings->tagline_fr);

        $description = $locale === 'fr'
            ? ($settings->description_fr ?: $settings->description)
            : ($settings->description ?: $settings->description_fr);

        $overrides = [];

        if ($settings->name) {
            $overrides['brand.name'] = $settings->name;
        }

        if ($tagline) {
            $overrides['brand.tagline'] = $tagline;
        }

        if ($description) {
            $overrides['brand.meta.description'] = $description;
        }

        if ($settings->logo_path) {
            $overrides['brand.logo'] = asset('storage/' . $settings->logo_path);
        }

        if ($settings->favicon_path) {
            $overrides['brand.meta.favicon'] = asset('storage/' . $settings->favicon_path);
        }

        if ($settings->favicon_svg_path) {
            $overrides['brand.meta.favicon_svg'] = asset('storage/' . $settings->favicon_svg_path);
        }

        if ($settings->terms_url) {
            $overrides['brand.links.terms'] = $settings->terms_url;
        }

        if ($settings->privacy_url) {
            $overrides['brand.links.privacy'] = $settings->privacy_url;
        }

        if ($settings->support_url) {
            $overrides['brand.links.support'] = $settings->support_url;
        }

        if (! empty($overrides)) {
            config($overrides);
        }

        return $next($request);
    }
}
