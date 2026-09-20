import { useState } from "react";
import { useForm } from "@inertiajs/react";
import Button from "../../Components/Button";
// import { route } from "ziggy-js";

const heroImageUrl =
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1200&auto=format&fit=crop";

export default function EmployeePortalLogin() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        phone: "",
        password: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("login");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F3F1EC] p-3 sm:p-6 lg:p-10">
            <div className="relative w-full max-w-[1000px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] flex flex-col lg:flex-row">
                {/* ---------------- Image / brand panel ---------------- */}
                <div className="relative w-full lg:w-[52%] shrink-0">
                    {/* Base image */}
                    <div className="relative h-[220px] sm:h-[280px] lg:h-auto lg:min-h-[560px] w-full overflow-hidden">
                        <img
                            src={heroImageUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        {/* Amber wash */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(115deg, rgba(20,14,2,0.55) 0%, rgba(180,120,10,0.55) 35%, rgba(232,163,24,0.85) 100%)",
                                mixBlendMode: "multiply",
                            }}
                        />

                        <svg
                            className="absolute inset-0 h-full w-full"
                            viewBox="0 0 520 560"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M0,0 H420 C470,60 460,140 430,200 C400,260 440,300 470,340 C500,380 480,460 420,500 C370,535 300,560 220,560 H0 Z"
                                fill="#E8A318"
                                fillOpacity="0.001"
                            />

                            <path
                                d="M0,0 H430 C480,70 465,150 432,205 C400,258 442,300 472,338 C505,380 486,462 424,502 C372,536 300,560 218,560 H0 Z"
                                fill="url(#amberGrad)"
                            />

                            <path
                                d="M60,40 C160,120 120,220 200,260 C280,300 260,400 340,440"
                                stroke="rgba(255,255,255,0.35)"
                                strokeWidth="1.5"
                                fill="none"
                            />

                            <path
                                d="M20,120 C110,180 90,260 160,300 C230,340 210,430 280,470"
                                stroke="rgba(255,255,255,0.25)"
                                strokeWidth="1.5"
                                fill="none"
                            />

                            <defs>
                                <linearGradient
                                    id="amberGrad"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor="#D98A0E" />
                                    <stop offset="100%" stopColor="#F0B22C" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Brand text */}
                        <div className="absolute left-5 top-5 sm:left-8 sm:top-8 lg:left-10 lg:top-10">
                            <h1 className="text-white text-[26px] sm:text-[32px] lg:text-[38px] font-semibold leading-none tracking-tight">
                                Tech
                                <span className="font-extrabold">GENICS</span>
                            </h1>

                            <p className="mt-1.5 text-white/85 text-[11px] sm:text-xs lg:text-sm">
                                Providing lead services region wide.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ---------------- Form panel ---------------- */}
                <div className="w-full lg:w-[48%] flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
                    <div>
                        <h2 className="text-[22px] sm:text-2xl font-semibold text-neutral-900">
                            Account Login
                        </h2>

                        <p className="mt-2 text-sm text-neutral-500 leading-relaxed max-w-[38ch]">
                            Welcome to your portal workflow, where making a
                            change begins at the click of a button.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-7 space-y-5"
                            noValidate
                        >
                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="sr-only">
                                    Phone
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="Phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                    className={`w-full rounded-lg bg-neutral-100 px-4 py-3.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none ring-1 transition focus:bg-white focus:ring-2 focus:ring-[#E8A318] ${
                                        errors.phone
                                            ? "ring-red-400"
                                            : "ring-transparent"
                                    }`}
                                />

                                {errors.phone && (
                                    <p
                                        className="mt-1.5 text-xs text-red-500"
                                        role="alert"
                                    >
                                        {errors.phone}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="mt-1.5 text-xs text-neutral-500 hover:text-[#C8790A] transition"
                                >
                                    Forgot phone?
                                </button>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className={`w-full rounded-lg bg-neutral-100 px-4 py-3.5 pr-12 text-sm text-neutral-800 placeholder-neutral-400 outline-none ring-1 transition focus:bg-white focus:ring-2 focus:ring-[#E8A318] ${
                                            errors.password
                                                ? "ring-red-400"
                                                : "ring-transparent"
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon />
                                        ) : (
                                            <EyeIcon />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p
                                        className="mt-1.5 text-xs text-red-500"
                                        role="alert"
                                    >
                                        {errors.password}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="mt-1.5 text-xs text-neutral-500 hover:text-[#C8790A] transition"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* General error */}
                            {errors.error && (
                                <p
                                    className="text-xs text-red-500"
                                    role="alert"
                                >
                                    {errors.error}
                                </p>
                            )}

                            {/* Login button */}
                            <Button
                                type="submit"
                                loading={processing}
                                disabled={processing}
                                className="w-full sm:w-auto sm:ml-auto sm:block"
                            >
                                {processing ? "" : "ورود"}
                            </Button>
                        </form>
                    </div>

                    {/* Footer */}
                    <footer className="mt-8 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400">
                        <a
                            href="#"
                            className="hover:text-neutral-600 transition"
                        >
                            Security Policy
                        </a>

                        <a
                            href="#"
                            className="hover:text-neutral-600 transition"
                        >
                            Privacy Policy
                        </a>

                        <a
                            href="#"
                            className="hover:text-neutral-600 transition"
                        >
                            Legal
                        </a>

                        <a
                            href="#"
                            className="hover:text-neutral-600 transition"
                        >
                            Technical Support
                        </a>
                    </footer>
                </div>
            </div>
        </div>
    );
}

/* ---------------- Eye Icon ---------------- */

function EyeIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

/* ---------------- Eye Off Icon ---------------- */

function EyeOffIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
            <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a17.5 17.5 0 0 1-3.06 3.94M6.06 6.06A17.6 17.6 0 0 0 1 11s4 7 11 7a10.9 10.9 0 0 0 4.02-.76" />
        </svg>
    );
}
