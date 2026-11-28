import React from "react";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, Eye, Image as ImageIcon } from "lucide-react";

import FrontLayout from "../../Frontend/FrontLayout";
import SectionRenderer from "../../../Components/PageBuilder/SectionRenderer";

import "./Assets/css/Preview.css";
const imageUrl = (value) => {
    if (!value) return "";

    if (/^https?:\/\//i.test(value) || value.startsWith("/")) {
        return value;
    }

    return `/storage/${value.replace(/^storage\//, "")}`;
};

function PreviewImage({ src, alt = "" }) {
    if (!src) return null;

    return <img src={imageUrl(src)} alt={alt} loading="lazy" />;
}

export default function Preview({ page }) {
    const sections = [...(page?.sections || [])]
        .filter((section) => section.is_active)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return (
        <FrontLayout>
            <Head title={`پیش‌نمایش | ${page?.title || "صفحه"}`} />

            <div className="page-preview">
                <div className="preview-admin-toolbar">
                    <div className="preview-toolbar-info">
                        <Eye size={18} />
                        <span>حالت پیش‌نمایش</span>
                        <small>{page?.title}</small>
                    </div>

                    <div className="preview-toolbar-actions">
                        <Link
                            href={route("admin.pages.builder", page.id)}
                            className="preview-toolbar-button"
                        >
                            <ArrowRight size={17} />
                            بازگشت به ویرایشگر
                        </Link>
                    </div>
                </div>

                <main className="preview-page-content">
                    {page?.featured_image && (
                        <div className="preview-featured-image">
                            <PreviewImage
                                src={page.featured_image}
                                alt={page.title}
                            />
                        </div>
                    )}

                    {sections.length ? (
                        sections.map((section) => (
                            <SectionRenderer
                                key={section.id}
                                section={section}
                                mode="preview"
                            />
                        ))
                    ) : (
                        <div className="preview-no-sections">
                            <ImageIcon size={42} />

                            <h2>هنوز محتوایی برای نمایش وجود ندارد</h2>

                            <p>
                                برای مشاهده پیش‌نمایش، ابتدا بلوک‌هایی به صفحه
                                اضافه کنید.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </FrontLayout>
    );
}
