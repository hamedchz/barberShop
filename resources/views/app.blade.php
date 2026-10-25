<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="rtl">

<head>
    {{-- seetings --}}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="{{ $page['props']['site']['description'] ?? '' }}">

    <title inertia>{{ $page['props']['site']['name'] ?? config('app.name') }}</title>

    @if (!empty($page['props']['site']['favicon']))
        <link rel="icon" type="image/png" href="{{ $page['props']['site']['favicon'] }}">
    @endif

    {{-- ============ CSS Variables (Dynamic Theme) ============ --}}
    @php
        $theme = $page['props']['theme'] ?? [
            'mode' => 'light',
            'primary' => '#10B981',
            'primaryHover' => '#0D9668',
            'primaryTint' => '#E8F8F2',
            'secondary' => '#1E293B',
            'success' => '#10B981',
            'danger' => '#EF4444',
            'warning' => '#F59E0B',
            'info' => '#3B82F6',
        ];
    @endphp

    <style>
        :root {
            /* ============ رنگ اصلی ============ */
            --color-primary: {{ $theme['primary'] }};
            --color-primary-hover: {{ $theme['primaryHover'] }};
            --color-primary-tint: {{ $theme['primaryTint'] }};
            --color-primary-light: {{ $theme['primary'] }}20;
            --color-primary-dark: {{ $theme['primaryHover'] }};

            /* ============ رنگ مکمل ============ */
            --color-secondary: {{ $theme['secondary'] }};
            --color-secondary-light: {{ $theme['secondary'] }}15;

            /* ============ رنگ‌های وضعیت ============ */
            --color-success: {{ $theme['success'] }};
            --color-danger: {{ $theme['danger'] }};
            --color-warning: {{ $theme['warning'] }};
            --color-info: {{ $theme['info'] }};

            /* ============ گرادیانت ============ */
            --gradient-primary: linear-gradient(135deg,
                    var(--color-primary),
                    var(--color-primary-hover));

            /* ============ وضعیت رزروها ============ */
            --status-pending: #92400e;
            --status-pending-bg: #fffbeb;

            --status-confirmed: #065f46;
            --status-confirmed-bg: #ecfdf5;

            --status-completed: #1e40af;
            --status-completed-bg: #eff6ff;

            --status-cancelled: #991b1b;
            --status-cancelled-bg: #fef2f2;

            /* ============ تم روشن پیش‌فرض ============ */
            --color-bg: #f9fafb;
            --color-bg-card: #ffffff;
            --color-bg-hover: #f3f4f6;

            --color-text: #111827;
            --color-text-muted: #6b7280;

            --color-border: #e5e7eb;
            --color-shadow: rgba(0, 0, 0, 0.08);
        }

        /* ============ تم تیره ============ */
        @if ($theme['mode'] === 'dark')
            :root,
            html.dark {
                --color-bg: #0f172a;
                --color-bg-card: #1e293b;
                --color-bg-hover: #334155;

                --color-text: #f1f5f9;
                --color-text-muted: #94a3b8;

                --color-border: #334155;
                --color-shadow: rgba(0, 0, 0, 0.3);
            }
        @endif

        @if ($theme['mode'] === 'auto')
            @media (prefers-color-scheme: dark) {
                :root {
                    --color-bg: #0f172a;
                    --color-bg-card: #1e293b;
                    --color-bg-hover: #334155;

                    --color-text: #f1f5f9;
                    --color-text-muted: #94a3b8;

                    --color-border: #334155;
                    --color-shadow: rgba(0, 0, 0, 0.3);
                }
            }
        @endif

        html,
        body {
            background-color: var(--color-bg);
            color: var(--color-text);
        }
    </style>

    {{-- end settings --}}


    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @routes
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    <x-inertia::head />
</head>

<body>
    <x-inertia::app />
</body>

</html>
