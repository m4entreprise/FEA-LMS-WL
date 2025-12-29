<?php

$locale = app()->getLocale();

$tagline = $locale === 'fr'
    ? env('BRAND_TAGLINE_FR', env('BRAND_TAGLINE', 'Learn. Track. Certify.'))
    : env('BRAND_TAGLINE', 'Learn. Track. Certify.');

$description = $locale === 'fr'
    ? env('BRAND_DESCRIPTION_FR', env('BRAND_DESCRIPTION', 'A modern learning platform for teams and students.'))
    : env('BRAND_DESCRIPTION', 'A modern learning platform for teams and students.');

return [
    'name' => env('BRAND_NAME', env('APP_NAME', 'M4 LMS')),
    'tagline' => $tagline,
    'logo' => env('BRAND_LOGO', null),
    'links' => [
        'terms' => env('BRAND_TERMS_URL', '/terms'),
        'privacy' => env('BRAND_PRIVACY_URL', '/privacy'),
        'support' => env('BRAND_SUPPORT_URL', '/support'),
    ],
    'meta' => [
        'description' => $description,
        'image' => env('BRAND_OG_IMAGE', '/apple-touch-icon.png'),
        'favicon' => env('BRAND_FAVICON', '/favicon.ico'),
        'favicon_svg' => env('BRAND_FAVICON_SVG', '/favicon.svg'),
        'apple_touch_icon' => env('BRAND_APPLE_TOUCH_ICON', '/apple-touch-icon.png'),
    ],
    'tokens' => [
        'radius' => env('BRAND_RADIUS', null),
    ],
    'colors' => [
        'primary' => env('BRAND_PRIMARY', null),
        'secondary' => env('BRAND_SECONDARY', null),
    ],
];
