import { Head, Link } from "@inertiajs/react";
import {
    ArrowRight,
    Phone,
    Mail,
    MapPin,
    Clock,
    Scissors,
    Users,
    Image as ImageIcon,
    Eye,
    ExternalLink,
} from "lucide-react";
import FrontLayout from "../../Frontend/FrontLayout";
import "./Assets/css/Preview.css";

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

function ContactFormBlock({ content = {}, settings = {} }) {
    return (
        <section className="preview-section preview-section-soft">
            <div className="preview-container preview-form-container">
                <SectionTitle
                    title={content.title || "ارتباط با ما"}
                    subtitle={content.description}
                />

                <form
                    className="preview-contact-form"
                    onSubmit={(event) => event.preventDefault()}
                >
                    <div className="preview-form-field">
                        <label>نام و نام خانوادگی</label>
                        <input
                            type="text"
                            placeholder="نام خود را وارد کنید"
                            disabled
                        />
                    </div>

                    <div className="preview-form-field">
                        <label>شماره تماس</label>
                        <input type="tel" placeholder="شماره تماس" disabled />
                    </div>

                    {settings.show_email && (
                        <div className="preview-form-field">
                            <label>ایمیل</label>
                            <input
                                type="email"
                                placeholder="ایمیل شما"
                                disabled
                            />
                        </div>
                    )}

                    {settings.show_subject && (
                        <div className="preview-form-field">
                            <label>موضوع</label>
                            <input
                                type="text"
                                placeholder="موضوع پیام"
                                disabled
                            />
                        </div>
                    )}

                    <div className="preview-form-field">
                        <label>متن پیام</label>
                        <textarea
                            rows="4"
                            placeholder="پیام خود را بنویسید"
                            disabled
                        />
                    </div>

                    <button type="button" className="preview-button" disabled>
                        ارسال پیام (غیرفعال در پیش‌نمایش)
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

function SectionRenderer({ section }) {
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
            return <ContactFormBlock content={content} settings={settings} />;
        case "divider":
            return <DividerBlock settings={settings} />;
        default:
            return null;
    }
}

export default function Preview({ page, preview = true }) {
    const sections = [...(page?.sections || [])]
        .filter((section) => section.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <FrontLayout>
            <Head title={`پیش‌نمایش | ${page.title}`} />

            <div className="page-preview">
                <div className="preview-admin-toolbar">
                    <div className="preview-toolbar-info">
                        <Eye size={18} />
                        <span>حالت پیش‌نمایش</span>
                        <small>{page.title}</small>
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
                    {page.featured_image && (
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
