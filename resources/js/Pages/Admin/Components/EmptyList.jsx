import React from "react";

const EmptyState = ({
    title = "اطلاعاتی موجود نیست",
    message = "در حال حاضر اطلاعاتی برای نمایش وجود ندارد.",
    className = "",
}) => {
    return (
        <div
            className={`text-center flex items-center justify-center w-full flex-col empty-photo my-4 ${className}`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 189.1 182.7"
                width="280"
                role="img"
                aria-label={title}
            >
                <ellipse
                    cx="82.8"
                    cy="159.6"
                    fill="#e4e9f0"
                    rx="82.5"
                    ry="23.1"
                    transform="rotate(-.7 80.8 180.6)"
                />

                <path
                    fill="#fff"
                    fillRule="evenodd"
                    stroke="#00aab2"
                    strokeWidth="2"
                    d="M98.1 80.1v41.8L115 105l23.3-8.2z"
                />

                <path
                    fill="#ccf2f2"
                    fillRule="evenodd"
                    d="M98.1 80.1v41.8L115 105l23.3-8.2z"
                />

                <path
                    fill="#fff"
                    fillRule="evenodd"
                    stroke="#00aab2"
                    strokeWidth="2"
                    d="M98.1 121.9V80.1l-44.4 16 23.2 8.9 13.2 24.9z"
                />

                <path
                    fill="#ccf2f2"
                    fillRule="evenodd"
                    d="M98.1 121.9V80.1l-44.4 16 23.2 8.9 13.2 24.9z"
                />

                <path
                    fill="#fff"
                    fillRule="evenodd"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                    d="M27.1 151.2v-45.4l63 24.1 69.6-24.1v45.4l-70.4 24.2z"
                />

                <path
                    fill="#fff"
                    fillRule="evenodd"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                    d="M98.1 80.1l-71 25.7-22-17.6 70.3-24.9z"
                />

                <path
                    fill="#fff"
                    fillRule="evenodd"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                    d="M27.1 105.8l63 24.1L76.9 105l-63-24.2zM159.7 105.8L98.1 80.1l27.1-14.6 61.6 24.1z"
                />

                <path
                    fill="none"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                    d="M98.2 80.1v41.8M90.1 129.9l-.7 45.4"
                />

                <path
                    fill="#fff"
                    fillRule="evenodd"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                    d="M159.7 105.8l-69.6 24.1L115 105l68.9-24.2z"
                />

                <path
                    fill="none"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                    d="M49.4 131.9c-.7 2.3-3.3 3.6-6.2 3a8.7 8.7 0 01-6.6-5.4M74.4 140c-.7 2.4-3.3 3.6-6.2 3.1a8.8 8.8 0 01-6.6-5.5"
                />

                <circle
                    cx="44.3"
                    cy="54.1"
                    r="1.1"
                    fill="none"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                />

                <path
                    fill="none"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                    d="M70.7 6.1a2.5 2.5 0 002.5-2.5A2.5 2.5 0 0070.7 1a2.6 2.6 0 00-2.6 2.6 2.6 2.6 0 002.6 2.5z"
                />

                <circle
                    cx="85.3"
                    cy="39.5"
                    r="1.1"
                    fill="none"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                />

                <circle
                    cx="121.2"
                    cy="31.4"
                    r="1.1"
                    fill="none"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                />

                <circle
                    cx="172.9"
                    cy="52.3"
                    r="1.5"
                    fill="none"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                />

                <path
                    fill="none"
                    stroke="#00aab2"
                    strokeMiterlimit="2.6"
                    strokeWidth="2"
                    d="M104.7 67.7a3.7 3.7 0 10-3.6-3.7 3.7 3.7 0 003.6 3.7z"
                />
            </svg>

            <h4 className="mt-4 font-normal text-3xl">{title}</h4>

            <p className="text-base">{message}</p>
        </div>
    );
};

export default EmptyState;
