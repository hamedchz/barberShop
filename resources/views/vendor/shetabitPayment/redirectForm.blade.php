<!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>در حال انتقال به درگاه پرداخت</title>

    <link rel="preconnect" href="https://cdn.jsdelivr.net">

    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html,
        body {
            min-height: 100%;
        }

        body {
            min-height: 100vh;
            font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
            background: linear-gradient(135deg,
                    #f0fdf4 0%,
                    #ecfdf5 50%,
                    #ffffff 100%);

            color: #1f2937;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 20px;

            direction: rtl;
            position: relative;
            overflow: hidden;
        }

        /* =========================
           Background
        ========================= */

        .bg-shape {
            position: fixed;
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
        }

        .shape-1 {
            top: -100px;
            right: -100px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle,
                    rgba(16, 185, 129, 0.15) 0%,
                    transparent 70%);
            animation: floatShape 8s ease-in-out infinite;
        }

        .shape-2 {
            bottom: -100px;
            left: -100px;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle,
                    rgba(59, 130, 246, 0.12) 0%,
                    transparent 70%);
            animation: floatShape 10s ease-in-out infinite reverse;
        }

        .shape-3 {
            top: 50%;
            left: 20%;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle,
                    rgba(245, 158, 11, 0.10) 0%,
                    transparent 70%);
            animation: floatShape 12s ease-in-out infinite;
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

        /* =========================
           Card
        ========================= */

        .redirect-card {
            position: relative;
            z-index: 1;

            width: 100%;
            max-width: 480px;

            background: #ffffff;

            border-radius: 30px;

            padding: 40px 32px;

            text-align: center;

            border: 1px solid rgba(16, 185, 129, 0.15);

            box-shadow:
                0 25px 50px -12px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(16, 185, 129, 0.05);

            animation: cardSlideUp 0.5s ease;
        }

        @keyframes cardSlideUp {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.96);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        /* =========================
           Gateway
        ========================= */

        .gateway-info {
            display: flex;
            flex-direction: column;
            align-items: center;

            gap: 12px;

            margin-bottom: 25px;

            padding-bottom: 22px;

            border-bottom: 1px dashed #e5e7eb;
        }

        .gateway-icon {
            width: 72px;
            height: 72px;

            border-radius: 20px;

            background: linear-gradient(135deg,
                    #10b981,
                    #059669);

            color: #fff;

            display: flex;
            align-items: center;
            justify-content: center;

            box-shadow:
                0 8px 24px rgba(16, 185, 129, 0.30);

            animation: iconBounce 2s ease-in-out infinite;
        }

        .gateway-icon svg {
            width: 34px;
            height: 34px;
        }

        @keyframes iconBounce {

            0%,
            100% {
                transform: translateY(0);
            }

            50% {
                transform: translateY(-5px);
            }
        }

        .gateway-text {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .gateway-text span {
            font-size: 12px;
            color: #9ca3af;
        }

        .gateway-text strong {
            font-size: 18px;
            font-weight: 800;
            color: #1f2937;
        }

        /* =========================
           Spinner
        ========================= */

        .spinner-wrapper {
            display: flex;
            justify-content: center;

            margin: 5px 0 25px;
        }

        .spinner {
            position: relative;

            width: 120px;
            height: 120px;

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

            animation: spin 2s linear infinite;

            opacity: 0.8;
        }

        .ring-2 {
            width: 75%;
            height: 75%;

            border-top-color: #3b82f6;

            animation: spin 1.5s linear infinite reverse;

            opacity: 0.6;
        }

        .ring-3 {
            width: 50%;
            height: 50%;

            border-top-color: #f59e0b;

            animation: spin 1s linear infinite;

            opacity: 0.5;
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        .spinner-center {
            width: 56px;
            height: 56px;

            border-radius: 50%;

            background: linear-gradient(135deg,
                    #10b981,
                    #059669);

            color: #fff;

            display: flex;
            align-items: center;
            justify-content: center;

            box-shadow:
                0 0 0 8px rgba(16, 185, 129, 0.10),
                0 8px 24px rgba(16, 185, 129, 0.30);

            animation: pulseCenter 2s ease-in-out infinite;
        }

        .spinner-center svg {
            width: 25px;
            height: 25px;
        }

        @keyframes pulseCenter {

            0%,
            100% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.06);
            }
        }

        /* =========================
           Text
        ========================= */

        .content {
            margin-bottom: 25px;
        }

        .title {
            font-size: 21px;
            font-weight: 800;

            color: #1f2937;

            margin-bottom: 10px;
        }

        .subtitle {
            font-size: 14px;

            color: #6b7280;

            line-height: 1.9;
        }

        /* =========================
           Progress
        ========================= */

        .progress-wrapper {
            margin-bottom: 22px;
        }

        .progress-bar {
            height: 8px;

            background: #f3f4f6;

            border-radius: 999px;

            overflow: hidden;
        }

        .progress-fill {
            height: 100%;

            width: 0%;

            background: linear-gradient(90deg,
                    #10b981,
                    #34d399,
                    #10b981);

            background-size: 200% 100%;

            border-radius: 999px;

            animation: progressShimmer 1.5s linear infinite;

            transition: width 0.1s linear;
        }

        @keyframes progressShimmer {
            from {
                background-position: 0% 50%;
            }

            to {
                background-position: 200% 50%;
            }
        }

        .progress-info {
            display: flex;

            justify-content: space-between;

            margin-top: 8px;

            font-size: 12px;

            color: #6b7280;
        }

        .countdown {
            color: #10b981;

            font-weight: 700;
        }

        /* =========================
           Info
        ========================= */

        .info-box {
            display: flex;

            justify-content: center;

            gap: 20px;

            padding: 12px;

            background: #f0fdf4;

            border-radius: 14px;

            margin-bottom: 18px;
        }

        .info-item {
            display: flex;

            align-items: center;

            gap: 6px;

            font-size: 12px;

            color: #065f46;

            font-weight: 600;
        }

        .info-item svg {
            width: 15px;
            height: 15px;

            color: #10b981;
        }

        /* =========================
           Warning
        ========================= */

        .warning {
            display: flex;

            align-items: flex-start;

            gap: 8px;

            padding: 12px 14px;

            background: #fffbeb;

            border-radius: 14px;

            border-right: 3px solid #f59e0b;

            text-align: right;
        }

        .warning svg {
            width: 15px;
            height: 15px;

            color: #f59e0b;

            flex-shrink: 0;

            margin-top: 3px;
        }

        .warning p {
            font-size: 12px;

            color: #92400e;

            line-height: 1.7;

            font-weight: 500;
        }

        /* =========================
           Form
        ========================= */

        .payment-form {
            display: none;
        }

        .manual-submit {
            display: inline-block;

            margin-top: 18px;

            padding: 8px 16px;

            border: none;

            border-radius: 8px;

            background: #10b981;

            color: #fff;

            font-family: inherit;

            cursor: pointer;
        }

        /* =========================
           Mobile
        ========================= */

        @media (max-width: 640px) {

            body {
                padding: 15px;
            }

            .redirect-card {
                padding: 30px 20px;

                border-radius: 24px;
            }

            .spinner {
                width: 100px;
                height: 100px;
            }

            .gateway-icon {
                width: 64px;
                height: 64px;
            }

            .title {
                font-size: 18px;
            }

            .subtitle {
                font-size: 13px;
            }

            .info-box {
                flex-direction: column;

                gap: 8px;

                align-items: center;
            }
        }
    </style>
</head>

<body>

    <!-- Background -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>


    <!-- Main Card -->
    <div class="redirect-card">

        <!-- Gateway -->
        <div class="gateway-info">

            <div class="gateway-icon">

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />

                    <line x1="2" y1="10" x2="22" y2="10" />
                </svg>

            </div>

            <div class="gateway-text">

                <span>
                    در حال اتصال به
                </span>

                <strong>
                    درگاه پرداخت بانکی
                </strong>

            </div>

        </div>


        <!-- Spinner -->
        <div class="spinner-wrapper">

            <div class="spinner">

                <div class="spinner-ring ring-1"></div>

                <div class="spinner-ring ring-2"></div>

                <div class="spinner-ring ring-3"></div>

                <div class="spinner-center">

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />

                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>

                </div>

            </div>

        </div>


        <!-- Content -->
        <div class="content">

            <h1 class="title" id="title">
                در حال اتصال به درگاه...
            </h1>

            <p class="subtitle">
                لطفاً صفحه را نبندید.
                <br>
                در حال انتقال امن شما به صفحه پرداخت هستیم.
            </p>

        </div>


        <!-- Progress -->
        <div class="progress-wrapper">

            <div class="progress-bar">

                <div class="progress-fill" id="progressFill"></div>

            </div>

            <div class="progress-info">

                <span id="progressPercent">
                    ۰٪
                </span>

                <span class="countdown">

                    انتقال در
                    <span id="countdown">
                        ۱
                    </span>
                    ثانیه

                </span>

            </div>

        </div>


        <!-- Information -->
        <div class="info-box">

            <div class="info-item">

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6-8 10-8 10z" />

                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>

                <span>
                    اتصال امن
                </span>

            </div>


            <div class="info-item">

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />

                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />

                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />

                    <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>

                <span>
                    ارتباط با درگاه
                </span>

            </div>

        </div>


        <!-- Warning -->
        <div class="warning">

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                stroke-width="2">
                <circle cx="12" cy="12" r="10" />

                <line x1="12" y1="16" x2="12" y2="12" />

                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>

            <p>
                لطفاً تا انتقال کامل به درگاه،
                این صفحه را نبندید.
            </p>

        </div>


        <!--
            مهم:
            این فرم متعلق به Shetabit Multipay است.
            متغیرهای $method، $action و $inputs
            را تغییر نده.
        -->

        <form id="payment-form" class="payment-form" method="{{ $method }}" action="{{ $action }}">

            @foreach ($inputs as $name => $value)
                <input type="hidden" name="{{ $name }}" value="{{ $value }}">
            @endforeach

            <!--
                اگر JavaScript غیرفعال بود،
                کاربر بتواند دستی ادامه دهد.
            -->

            <button type="submit" class="manual-submit">
                انتقال به درگاه پرداخت
            </button>

        </form>

    </div>


    <script>
        (function() {

            /*
             * مدت زمان نمایش صفحه
             *
             * نکته مهم:
             * این زمان فقط برای ظاهر است.
             * بعد از آن فرم اصلی Shetabit submit می‌شود.
             */

            const totalDuration = 1000;

            const startTime = Date.now();

            const progressFill =
                document.getElementById("progressFill");

            const progressPercent =
                document.getElementById("progressPercent");

            const countdownEl =
                document.getElementById("countdown");

            const titleEl =
                document.getElementById("title");

            const paymentForm =
                document.getElementById("payment-form");


            function toPersianNumber(num) {

                const persian = [
                    "۰",
                    "۱",
                    "۲",
                    "۳",
                    "۴",
                    "۵",
                    "۶",
                    "۷",
                    "۸",
                    "۹"
                ];

                return String(num).replace(
                    /\d/g,
                    function(d) {
                        return persian[d];
                    }
                );
            }


            function submitPaymentForm() {

                if (paymentForm) {

                    paymentForm.submit();

                }

            }


            const interval = setInterval(function() {

                const elapsed =
                    Date.now() - startTime;

                const progress =
                    Math.min(
                        (elapsed / totalDuration) * 100,
                        100
                    );


                progressFill.style.width =
                    progress + "%";


                progressPercent.textContent =
                    toPersianNumber(
                        Math.round(progress)
                    ) + "٪";


                if (progress >= 50) {

                    titleEl.textContent =
                        "در حال انتقال به صفحه پرداخت...";

                }


                const remaining =
                    Math.max(
                        0,
                        Math.ceil(
                            (totalDuration - elapsed) / 1000
                        )
                    );


                countdownEl.textContent =
                    toPersianNumber(remaining);


                if (progress >= 100) {

                    clearInterval(interval);

                    submitPaymentForm();

                }

            }, 50);


            /*
             * اگر JavaScript با تأخیر اجرا شد،
             * حداکثر بعد از 1.2 ثانیه فرم ارسال شود.
             */

            setTimeout(function() {

                submitPaymentForm();

            }, 1200);


        })();
    </script>

</body>

</html>
