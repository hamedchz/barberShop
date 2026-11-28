import React from "react";
import { Head } from "@inertiajs/react";

import FrontLayout from "../../Frontend/FrontLayout";
import SectionRenderer from "../../../Components/PageBuilder/SectionRenderer";

function imageUrl(value) {
    if (!value || typeof value !== "string") {
        return null;
    }

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("/")
    ) {
        return value;
    }

    return `/storage/${value.replace(/^storage\//, "")}`;
}

function FeaturedImage({ src, alt }) {
    const url = imageUrl(src);

    if (!url) {
        return null;
    }

    return (
        <div className="preview-featured-image">
            <img src={url} alt={alt || ""} />
        </div>
    );
}

export default function Show({ page }) {
    const sections = [...(page?.sections || [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );

    const seoTitle = page?.seo?.title || page?.title || "صفحه";
    const seoDescription = page?.seo?.description;

    return (
        <FrontLayout>
            <Head title={seoTitle}>
                {seoDescription && (
                    <meta
                        head-key="description"
                        name="description"
                        content={seoDescription}
                    />
                )}
            </Head>

            <div className="page-preview">
                <FeaturedImage src={page?.featured_image} alt={page?.title} />

                <div className="preview-page-content">
                    {sections.length > 0 ? (
                        sections.map((section) => (
                            <SectionRenderer
                                key={section.id}
                                section={section}
                                pageSlug={page.slug}
                                preview={false}
                            />
                        ))
                    ) : (
                        <div className="preview-no-sections">
                            <h2>{page?.title}</h2>

                            <p>
                                {page?.excerpt ||
                                    "محتوایی برای نمایش در این صفحه وجود ندارد."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </FrontLayout>
    );
}
