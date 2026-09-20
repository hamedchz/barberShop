/**
 * Button — reusable, shared across the project.
 *
 * Usage:
 *   <Button>Login</Button>
 *   <Button variant="secondary" size="sm">Cancel</Button>
 *   <Button variant="outline" fullWidth loading={isSubmitting}>Save</Button>
 *   <Button as="a" href="/help">Get help</Button>
 *
 * Props:
 *  - variant: "primary" | "secondary" | "outline" | "ghost"  (default: "primary")
 *  - size:    "sm" | "md" | "lg"                             (default: "md")
 *  - fullWidth: boolean — stretch to container width
 *  - loading:   boolean — shows a spinner and disables the button
 *  - as:        "button" | "a" — render as <button> or <a>
 *  - all other native <button>/<a> props (onClick, type, href, disabled, ...) pass through
 */

const VARIANT_CLASSES = {
    primary:
        "bg-[#E8A318] text-white shadow-sm hover:bg-[#D6960F] focus-visible:ring-[#E8A318] disabled:hover:bg-[#E8A318]",
    secondary:
        "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus-visible:ring-neutral-400 disabled:hover:bg-neutral-100",
    outline:
        "bg-transparent text-[#C8790A] ring-1 ring-inset ring-[#E8A318] hover:bg-[#FDF3DF] focus-visible:ring-[#E8A318]",
    ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100 focus-visible:ring-neutral-400",
};

const SIZE_CLASSES = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-8 py-3 text-sm gap-2",
    lg: "px-10 py-3.5 text-base gap-2",
};

export default function Button({
    as = "button",
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    className = "",
    text,
    children,
    ...rest
}) {
    const Tag = as;
    const isDisabled = disabled || loading;

    const classes = [
        "inline-flex items-center justify-center rounded-lg font-semibold transition",
        "outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "active:scale-[0.98]",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        fullWidth ? "w-full" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Tag
            className={classes}
            disabled={Tag === "button" ? isDisabled : undefined}
            aria-disabled={isDisabled || undefined}
            {...rest}
        >
            {loading && <Spinner />}
            {children}
        </Tag>
    );
}

function Spinner() {
    return (
        <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
            />
        </svg>
    );
}
