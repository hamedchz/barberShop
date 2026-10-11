import React from "react";
import { Link } from "@inertiajs/react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import "../Assets/css/Pagination.css";

const Pagination = ({ links = [], only = [] }) => {
    if (!links || links.length <= 3) {
        return null;
    }

    // ============ ترجمه label ============
    const getLabel = (label) => {
        if (!label) return "";

        if (label.includes("Previous") || label.includes("previous")) {
            return "قبلی";
        }

        if (label.includes("Next") || label.includes("next")) {
            return "بعدی";
        }

        // اگه label شامل &laquo; یا &raquo; بود (لاراول پیش‌فرض)
        const cleanLabel = label
            .replace(/&laquo;/g, "")
            .replace(/&raquo;/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();

        return toPersianNumber(cleanLabel);
    };

    return (
        <div className="pagination">
            {links.map((link, index) => {
                const label = getLabel(link.label);
                const isDisabled = !link.url;

                // دکمه غیرفعال
                if (isDisabled) {
                    return (
                        <span
                            key={index}
                            className="pagination-item disabled"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                // دکمه فعال یا لینک
                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveState
                        preserveScroll
                        only={only.length > 0 ? only : undefined}
                        className={`pagination-item ${
                            link.active ? "active" : ""
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
};

export default Pagination;
