import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import {
    ArrowRight,
    Phone,
    Mail,
    MapPin,
    Clock,
    Scissors,
    Users,
} from "lucide-react";

import "./Assets/Page.css";
const imageUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;

    return `/storage/${value.replace(/^storage\//, "")}`;
};

function PreviewImage({ src, alt = "", className = "" }) {
    if (!src) return null;

    return (
        <img
            src={imageUrl(src)}
            alt={alt}
            className={className}
            loading="lazy"
        />
    );
}

function SectionTitle({ title, subtitle }) {
    if (!title && !subtitle) return null;

    return (
        <div className="preview-section-heading">
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
        </div>
    );
}

function HeroBlock({ content = {}, settings = {} }) {
    const alignment = settings.alignment || "right";
    const background = settings.background || "primary";
    const height = settings.height || "medium";

    return (
        <section
            className={`preview-hero preview-hero-${background} preview-hero-${height} preview-align-${alignment}`}
            style={
                content.image
                    ? {
                          backgroundImage: `linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.58)), url("${imageUrl(content.image)}")`,
                      }
                    : {}
            }
        >
            <div className="preview-container">
                <div className="preview-hero-content">
                    {content.title && <h1>{content.title}</h1>}
                    {content.subtitle && <p>{content.subtitle}</p>}

                    {content.button_text && content.button_url && (
                        <a
                            href={content.button_url}
                            className="preview-button preview-button-light"
                            target={
                                content.button_url.startsWith("http")
                                    ? "_blank"
                                    : undefined
                            }
                            rel="noopener noreferrer"
                        >
                            {content.button_text}
                            <ArrowRight size={17} />
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}

function TextBlock({ content = {}, settings = {} }) {
    return (
        <section className="preview-section">
            <div
                className={`preview-container preview-text-width-${settings.width || "normal"} preview-align-${settings.alignment || "right"}`}
            >
                <SectionTitle title={content.title} />
                <div className="preview-rich-text">{content.body}</div>
            </div>
        </section>
    );
}

function ImageTextBlock({ content = {}, settings = {} }) {
    const imagePosition = settings.image_position || "right";

    return (
        <section className="preview-section">
            <div
                className={`preview-container preview-image-text preview-image-${imagePosition}`}
            >
                <div className="preview-image-text-media">
                    <PreviewImage
                        src={content.image}
                        alt={content.image_alt || content.title}
                    />
                </div>

                <div className="preview-image-text-content">
                    <SectionTitle title={content.title} />
                    <p>{content.body}</p>
                </div>
            </div>
        </section>
    );
}

function GalleryBlock({ content = {}, settings = {} }) {
    const images = Array.isArray(content.images) ? content.images : [];

    return (
        <section className="preview-section">
            <div className="preview-container">
                <SectionTitle title={content.title} />

                <div
                    className={`preview-gallery preview-gallery-${settings.columns || 3} preview-gallery-${settings.aspect_ratio || "square"}`}
                >
                    {images.map((image, index) => (
                        <div
                            key={`${image}-${index}`}
                            className="preview-gallery-item"
                        >
                            <PreviewImage
                                src={image}
                                alt={`${content.title || "تصویر"} ${index + 1}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeaturesBlock({ content = {}, settings = {} }) {
    const items = Array.isArray(content.items) ? content.items : [];

    return (
        <section className="preview-section preview-section-soft">
            <div className="preview-container">
                <SectionTitle title={content.title} />

                <div
                    className={`preview-feature-grid preview-grid-${settings.columns || 3}`}
                >
                    {items.map((item, index) => (
                        <article className="preview-feature-card" key={index}>
                            <div className="preview-feature-icon">
                                <Scissors size={23} />
                            </div>
                            <h3>{item.title}</h3>
                            {item.description && <p>{item.description}</p>}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TeamBlock({ content = {}, settings = {} }) {
    const items = Array.isArray(content.items) ? content.items : [];

    return (
        <section className="preview-section">
            <div className="preview-container">
                <SectionTitle title={content.title} />

                <div
                    className={`preview-team-grid preview-grid-${settings.columns || 3}`}
                >
                    {items.map((item, index) => (
                        <article className="preview-team-card" key={index}>
                            {item.image ? (
                                <PreviewImage
                                    src={item.image}
                                    alt={item.name}
                                    className="preview-team-image"
                                />
                            ) : (
                                <div className="preview-team-placeholder">
                                    <Users size={34} />
                                </div>
                            )}

                            <h3>{item.name}</h3>
                            {item.role && <span>{item.role}</span>}
                            {item.bio && <p>{item.bio}</p>}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ContactInfoBlock({ content = {}, settings = {} }) {
    const items = [
        { icon: Phone, label: "تلفن", value: content.phone },
        { icon: Mail, label: "ایمیل", value: content.email },
        { icon: MapPin, label: "آدرس", value: content.address },
        { icon: Clock, label: "ساعات کاری", value: content.working_hours },
    ].filter((item) => item.value);

    return (
        <section className="preview-section preview-section-soft">
            <div className="preview-container">
                <SectionTitle title={content.title} />

                <div
                    className={`preview-contact-info ${settings.layout === "list" ? "preview-contact-list" : ""}`}
                >
                    {items.map(({ icon: Icon, label, value }) => (
                        <div className="preview-contact-card" key={label}>
                            <span className="preview-contact-icon">
                                <Icon size={21} />
                            </span>
                            <div>
                                <small>{label}</small>
                                <strong>{value}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function MapBlock({ content = {}, settings = {} }) {
    const height = settings.height || "medium";

    return (
        <section className="preview-section">
            <div className="preview-container">
                <SectionTitle title={content.title} />

                {content.address && (
                    <p className="preview-map-address">
                        <MapPin size={18} />
                        {content.address}
                    </p>
                )}

                {content.map_url && (
                    <div className={`preview-map preview-map-${height}`}>
                        <iframe
                            src={content.map_url}
                            title={content.title || "نقشه"}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />
                    </div>
                )}
            </div>
        </section>
    );
}

function ContactFormBlock({
    content = {},
    settings = {},
    pageSlug,
    preview = true,
}) {
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            phone: "",
            email: "",
            subject: "",
            message: "",
            website: "",
        });

    const showEmail = Boolean(settings.show_email);
    const showSubject = Boolean(settings.show_subject);

    const handleChange = (field, value) => {
        setData(field, value);
        clearErrors(field);
        setSubmitted(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // در پیش‌نمایش هیچ درخواستی به سرور ارسال نمی‌شود.
        if (preview || !pageSlug || processing) return;

        setSubmitted(false);

        post(route("user.pages.contact.store", pageSlug), {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                setSubmitted(true);
            },
        });
    };

    const renderError = (field) => {
        if (!errors[field]) return null;

        return <small className="preview-form-error">{errors[field]}</small>;
    };

    return (
        <section className="preview-section preview-section-soft">
            <div className="preview-container preview-form-container">
                <SectionTitle
                    title={content.title || "ارتباط با ما"}
                    subtitle={content.description}
                />

                {submitted && (
                    <div className="preview-form-success" role="status">
                        پیام شما با موفقیت ارسال شد. از ارتباط شما سپاسگزاریم.
                    </div>
                )}

                <form
                    className={`preview-contact-form ${preview ? "is-preview" : ""}`}
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {/* فیلد مخفی برای جلوگیری از ارسال ربات‌ها */}
                    <div className="preview-form-honeypot" aria-hidden="true">
                        <label htmlFor={`contact-website-${pageSlug}`}>
                            وب‌سایت
                        </label>

                        <input
                            id={`contact-website-${pageSlug}`}
                            type="text"
                            name="website"
                            tabIndex="-1"
                            autoComplete="off"
                            value={data.website}
                            onChange={(e) =>
                                handleChange("website", e.target.value)
                            }
                        />
                    </div>

                    <div className="preview-form-field">
                        <label htmlFor={`contact-name-${pageSlug}`}>
                            نام و نام خانوادگی
                            <span className="preview-required">*</span>
                        </label>

                        <input
                            id={`contact-name-${pageSlug}`}
                            type="text"
                            placeholder="نام خود را وارد کنید"
                            value={data.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            maxLength={120}
                            autoComplete="name"
                            required
                            disabled={preview || processing}
                        />

                        {renderError("name")}
                    </div>

                    <div className="preview-form-field">
                        <label htmlFor={`contact-phone-${pageSlug}`}>
                            شماره تماس{" "}
                            <span className="preview-required">*</span>
                        </label>

                        <input
                            id={`contact-phone-${pageSlug}`}
                            type="tel"
                            placeholder="شماره تماس خود را وارد کنید"
                            value={data.phone}
                            onChange={(e) =>
                                handleChange("phone", e.target.value)
                            }
                            maxLength={30}
                            autoComplete="tel"
                            required
                            disabled={preview || processing}
                        />

                        {renderError("phone")}
                    </div>

                    {showEmail && (
                        <div className="preview-form-field">
                            <label htmlFor={`contact-email-${pageSlug}`}>
                                ایمیل
                            </label>

                            <input
                                id={`contact-email-${pageSlug}`}
                                type="email"
                                placeholder="ایمیل شما"
                                value={data.email}
                                onChange={(e) =>
                                    handleChange("email", e.target.value)
                                }
                                maxLength={150}
                                autoComplete="email"
                                disabled={preview || processing}
                            />

                            {renderError("email")}
                        </div>
                    )}

                    {showSubject && (
                        <div className="preview-form-field">
                            <label htmlFor={`contact-subject-${pageSlug}`}>
                                موضوع
                            </label>

                            <input
                                id={`contact-subject-${pageSlug}`}
                                type="text"
                                placeholder="موضوع پیام"
                                value={data.subject}
                                onChange={(e) =>
                                    handleChange("subject", e.target.value)
                                }
                                maxLength={180}
                                disabled={preview || processing}
                            />

                            {renderError("subject")}
                        </div>
                    )}

                    <div className="preview-form-field">
                        <label htmlFor={`contact-message-${pageSlug}`}>
                            متن پیام <span className="preview-required">*</span>
                        </label>

                        <textarea
                            id={`contact-message-${pageSlug}`}
                            rows="5"
                            placeholder="پیام خود را بنویسید"
                            value={data.message}
                            onChange={(e) =>
                                handleChange("message", e.target.value)
                            }
                            maxLength={5000}
                            disabled={preview || processing}
                            required
                        />

                        {renderError("message")}
                    </div>

                    <button
                        type="submit"
                        className="preview-button"
                        disabled={preview || processing}
                    >
                        {preview
                            ? "پیش‌نمایش فرم"
                            : processing
                              ? "در حال ارسال..."
                              : "ارسال پیام"}
                    </button>
                </form>
            </div>
        </section>
    );
}

function DividerBlock({ settings = {} }) {
    const spacing = settings.spacing || "medium";

    if (settings.style === "space") {
        return (
            <div
                className={`preview-divider-space preview-spacing-${spacing}`}
            />
        );
    }

    return (
        <div className={`preview-divider-wrap preview-spacing-${spacing}`}>
            <div
                className={`preview-divider preview-divider-${settings.style || "solid"}`}
            />
        </div>
    );
}

export default function SectionRenderer({ section, pageSlug, preview = true }) {
    if (!section) return null;

    const content = section.content || {};
    const settings = section.settings || {};

    switch (section.type) {
        case "hero":
            return <HeroBlock content={content} settings={settings} />;

        case "text":
            return <TextBlock content={content} settings={settings} />;

        case "image_text":
            return <ImageTextBlock content={content} settings={settings} />;

        case "gallery":
            return <GalleryBlock content={content} settings={settings} />;

        case "features":
            return <FeaturesBlock content={content} settings={settings} />;

        case "team":
            return <TeamBlock content={content} settings={settings} />;

        case "contact_info":
            return <ContactInfoBlock content={content} settings={settings} />;

        case "map":
            return <MapBlock content={content} settings={settings} />;

        case "contact_form":
            return (
                <ContactFormBlock
                    content={content}
                    settings={settings}
                    pageSlug={pageSlug}
                    preview={preview}
                />
            );

        case "divider":
            return <DividerBlock settings={settings} />;

        default:
            return null;
    }
}
