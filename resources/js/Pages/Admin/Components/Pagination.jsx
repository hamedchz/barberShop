import React from "react";
import { Link } from "@inertiajs/react";

const Pagination = ({ links = [] }) => {
    if (!links || links.length <= 3) {
        return null;
    }

    const getLabel = (label) => {
        if (!label) {
            return "";
        }

        // Previous
        if (label.includes("Previous") || label.includes("previous")) {
            return "قبلی";
        }

        // Next
        if (label.includes("Next") || label.includes("next")) {
            return "بعدی";
        }

        return label;
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "1rem",
                flexWrap: "wrap",
                direction: "ltr",
            }}
        >
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || "#"}
                    className={`btn-outline ${link.active ? "active" : ""}`}
                    style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        textDecoration: "none",

                        opacity: link.url ? 1 : 0.5,

                        pointerEvents: link.url ? "auto" : "none",

                        backgroundColor: link.active
                            ? "var(--primary)"
                            : "transparent",

                        color: link.active ? "white" : "var(--primary)",

                        width: "auto",

                        borderRadius: "6px",
                    }}
                >
                    {getLabel(link.label)}
                </Link>
            ))}
        </div>
    );
};

export default Pagination;
