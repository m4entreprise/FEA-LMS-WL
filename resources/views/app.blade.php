<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            :root {
                @php($brandPrimary = config('brand.colors.primary'))
                @php($brandSecondary = config('brand.colors.secondary'))
                @php($brandRadius = config('brand.tokens.radius'))
                @if ($brandPrimary)
                    --primary: {{ $brandPrimary }};
                @endif
                @if ($brandSecondary)
                    --secondary: {{ $brandSecondary }};
                @endif
                @if ($brandRadius)
                    --radius: {{ $brandRadius }};
                @endif
            }
        </style>

        @php($brandName = config('brand.name', config('app.name', 'M4 LMS')))
        <title inertia>{{ $brandName }}</title>
        @php($brandDescription = config('brand.meta.description', 'A modern learning platform for teams and students.'))
        @php($brandImage = config('brand.meta.image', '/apple-touch-icon.png'))
        @php($brandImageUrl = str_starts_with($brandImage, 'http') ? $brandImage : url($brandImage))
        <meta name="description" content="{{ $brandDescription }}">
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ $brandName }}">
        <meta property="og:description" content="{{ $brandDescription }}">
        <meta property="og:image" content="{{ $brandImageUrl }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $brandName }}">
        <meta name="twitter:description" content="{{ $brandDescription }}">
        <meta name="twitter:image" content="{{ $brandImageUrl }}">

        @php($favicon = config('brand.meta.favicon', '/favicon.ico'))
        @php($faviconSvg = config('brand.meta.favicon_svg', '/favicon.svg'))
        @php($appleTouch = config('brand.meta.apple_touch_icon', '/apple-touch-icon.png'))
        <link rel="icon" href="{{ $favicon }}" sizes="any">
        <link rel="icon" href="{{ $faviconSvg }}" type="image/svg+xml">
        <link rel="apple-touch-icon" href="{{ $appleTouch }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
