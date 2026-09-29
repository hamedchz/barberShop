<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'در حال انتقال به درگاه پرداخت')</title>

    <!-- فونت فارسی -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">

    <!-- استایل -->
    <style>
        /* ============ Reset ============ */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            direction: rtl;
            text-align: right;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #ffffff 100%);
            color: #1f2937;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            overflow-x: hidden;
            position: relative;
        }

        /* ============ دایره‌های تزئینی پس‌زمینه ============ */
        body::before {
            content: "";
            position: fixed;
            top: -100px;
            right: -100px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
            border-radius: 50%;
            animation: floatShape 8s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
        }

        body::after {
            content: "";
            position: fixed;
            bottom: -100px;
            left: -100px;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
            border-radius: 50%;
            animation: floatShape 10s ease-in-out infinite reverse;
            pointer-events: none;
            z-index: 0;
        }

        @keyframes floatShape {

            0%,
            100% {
                transform: translate(0, 0) scale(1);
            }

            50% {
                transform: translate(30px, -30px) scale(1.1);
            }
        }

        /* ============ کارت اصلی ============ */
        .redirect-card {
            position: relative;
            z-index: 1;
            background: #ffffff;
            border-radius: 2rem;
            padding: 2.5rem 2rem;
            max-width: 480px;
            width: 100%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.15);
            text-align: center;
            animation: cardSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes cardSlideUp {
            from {
                opacity: 0;
                transform: translateY(40px) scale(0.95);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        /* ============ اطلاعات درگاه ============ */
        .gateway-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.875rem;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px dashed #e5e7eb;
        }

        .gateway-logo {
            max-width: 100px;
            max-height: 60px;
            object-fit: contain;
        }

        .gateway-icon {
            width: 4rem;
            height: 4rem;
            border-radius: 1.25rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }

        .gateway-name {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .gateway-name span {
            font-size: 0.75rem;
            color: #9ca3af;
            font-weight: 500;
        }

        .gateway-name strong {
            font-size: 1.125rem;
            color: #1f2937;
            font-weight: 800;
        }

        /* ============ انیمیشن اسپینر ============ */
        .spinner-wrapper {
            display: flex;
            justify-content: center;
            margin-bottom: 1.75rem;
        }

        .spinner {
            position: relative;
            width: 8rem;
            height: 8rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .spinner-ring {
            position: absolute;
            border-radius: 50%;
            border: 3px solid transparent;
        }

        .ring-1 {
            width: 100%;
            height: 100%;
            border-top-color: #10b981;
            animation: spinRing 2s linear infinite;
            opacity: 0.8;
        }

        .ring-2 {
            width: 75%;
            height: 75%;
            border-top-color: #3b82f6;
            animation: spinRing 1.5s linear infinite reverse;
            opacity: 0.6;
        }

        .ring-3 {
            width: 50%;
            height: 50%;
            border-top-color: #f59e0b;
            animation: spinRing 1s linear infinite;
            opacity: 0.5;
        }

        @keyframes spinRing {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        .spinner-center {
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.1),
                0 8px 24px rgba(16, 185, 129, 0.3);
            animation: centerPulse 2s ease-in-out infinite;
        }

        @keyframes centerPulse {

            0%,
            100% {
                transform: scale(1);
                box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.1),
                    0 8px 24px rgba(16, 185, 129, 0.3);
            }

            50% {
                transform: scale(1.05);
                box-shadow: 0 0 0 12px rgba(16, 185, 129, 0.15),
                    0 12px 32px rgba(16, 185, 129, 0.4);
            }
        }

        /* ============ محتوا ============ */
        .content {
            margin-bottom: 1.75rem;
        }

        .title {
            font-size: 1.25rem;
            font-weight: 800;
            color: #1f2937;
            margin-bottom: 0.625rem;
            line-height: 1.4;
            min-height: 1.75rem;
        }

        .subtitle {
            font-size: 0.875rem;
            color: #6b7280;
            line-height: 1.7;
        }

        /* ============ نوار پیشرفت ============ */
        .progress-wrapper {
            margin-bottom: 1.5rem;
        }

        .progress-bar {
            height: 0.5rem;
            background-color: #f3f4f6;
            border-radius: 9999px;
            overflow: hidden;
            position: relative;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #10b981, #34d399, #10b981);
            background-size: 200% 100%;
            border-radius: 9999px;
            animation: progressShimmer 1.5s ease-in-out infinite;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
            transition: width 0.1s linear;
        }

        @keyframes progressShimmer {
            0% {
                background-position: 0% 50%;
            }

            100% {
                background-position: 200% 50%;
            }
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
            font-size: 0.75rem;
            color: #6b7280;
            font-weight: 600;
        }

        .countdown {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            color: #10b981;
        }

        /* ============ جعبه اطلاعات ============ */
        .info-box {
            display: flex;
            justify-content: center;
            gap: 1rem;
            padding: 0.75rem 1rem;
            background-color: #f0fdf4;
            border-radius: 0.875rem;
            margin-bottom: 1.25rem;
            flex-wrap: wrap;
        }

        .info-item {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.75rem;
            color: #065f46;
            font-weight: 600;
        }

        .info-item svg {
            color: #10b981;
            flex-shrink: 0;
        }

        /* ============ هشدار ============ */
        .warning {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background-color: #fffbeb;
            border-radius: 0.875rem;
            border-right: 3px solid #f59e0b;
            margin-bottom: 1.25rem;
            text-align: right;
        }

        .warning svg {
            color: #f59e0b;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .warning p {
            font-size: 0.75rem;
            color: #92400e;
            line-height: 1.6;
            font-weight: 500;
        }

        /* ============ دکمه لغو ============ */
        .cancel-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.625rem 1rem;
            background: transparent;
            border: none;
            border-radius: 0.625rem;
            font-size: 0.8125rem;
            font-weight: 600;
            font-family: inherit;
            color: #9ca3af;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }

        .cancel-btn:hover {
            background-color: #fef2f2;
            color: #ef4444;
        }

        /* ============ ریسپانسیو ============ */
        @media (max-width: 640px) {
            .redirect-card {
                padding: 1.75rem 1.25rem;
                border-radius: 1.5rem;
            }

            .spinner {
                width: 6.5rem;
                height: 6.5rem;
            }

            .spinner-center {
                width: 3rem;
                height: 3rem;
            }

            .title {
                font-size: 1.0625rem;
            }

            .subtitle {
                font-size: 0.8125rem;
            }
        }

        /* ============ انیمیشن محو شدن ============ */
        .fade-out {
            animation: fadeOut 0.5s ease forwards;
        }

        @keyframes fadeOut {
            from {
                opacity: 1;
            }

            to {
                opacity: 0;
                visibility: hidden;
            }
        }
    </style>
</head>

<body>
    @yield('content')


    @stack('scripts')
</body>

</html>
