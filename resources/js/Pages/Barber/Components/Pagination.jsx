import React from "react";
import { Link } from "@inertiajs/react";
import { toPersianNumber } from "../../../utils/persianNumbers";

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
                    style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        opacity: link.url ? 1 : 0.5,
                        pointerEvents: link.url ? "auto" : "none",
                        background: link.active
                            ? "var(--gradient-primary)"
                            : "transparent",
                        color: link.active ? "white" : "var(--color-primary)",
                        borderColor: "var(--color-primary)",
                        borderWidth: "1.5px",
                        borderStyle: "solid",
                        width: "auto",
                        borderRadius: "0.5rem",
                        fontWeight: 700,
                    }}
                >
                    {toPersianNumber(getLabel(link.label))}
                </Link>
            ))}
        </div>
    );
};

export default Pagination;
