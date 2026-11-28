import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    ArrowRight,
    Save,
    FileText,
    Search,
    Globe,
    LayoutTemplate,
    Info,
    AlertCircle,
    GlobeCode,
    RefreshCw,
    Link as LinkIcon,
} from "lucide-react";

import Layout from "../Layouts/Layout";
import "./Assets/css/Form.css";

const toPersianNumber = (value) =>
    String(value ?? "").replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);

function FieldError({ message }) {
    if (!message) return null;

    return (
        <div className="page-form-error">
            <AlertCircle size={14} />
            <span>{message}</span>
        </div>
    );
}

const generateUtf8Slug = (text = "") => {
    return (
        String(text)
            .toLowerCase()
            // حذف کاراکترهای غیرمجاز و حفظ حروف و اعداد یونیکد
            .replace(/[^\p{L}\p{N}\s\-_]/gu, " ")
            // تبدیل فاصله، زیرخط و خط تیره به یک خط تیره
            .replace(/[\s\-_]+/gu, "-")
            // حذف خط تیره ابتدا و انتها
            .replace(/^-+|-+$/g, "")
    );
};

function InputField({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
    dir = "rtl",
    required = false,
    help,
}) {
    return (
        <div className="page-form-field">
            <label htmlFor={name} className="page-form-label">
                {label}
                {required && <span className="page-form-required">*</span>}
            </label>

            <input
                id={name}
                type="text"
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                dir={dir}
                className={`page-form-input ${error ? "is-invalid" : ""}`}
            />

            {help && <small className="page-form-help">{help}</small>}
            <FieldError message={error} />
        </div>
    );
}

function TextareaField({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
    rows = 4,
    help,
}) {
    return (
        <div className="page-form-field">
            <label htmlFor={name} className="page-form-label">
                {label}
            </label>

            <textarea
                id={name}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`page-form-textarea ${error ? "is-invalid" : ""}`}
            />

            {help && <small className="page-form-help">{help}</small>}
            <FieldError message={error} />
        </div>
    );
}

function ToggleField({ label, description, checked, onChange }) {
    return (
        <label className="page-form-toggle">
            <span className="page-form-toggle-content">
                <span className="page-form-toggle-title">{label}</span>
                {description && (
                    <span className="page-form-toggle-description">
                        {description}
                    </span>
                )}
            </span>

            <span className={`page-form-switch ${checked ? "active" : ""}`}>
                <input
                    type="checkbox"
                    checked={!!checked}
                    onChange={(event) => onChange(event.target.checked)}
                />
                <span className="page-form-switch-slider" />
            </span>
        </label>
    );
}

export default function PageForm({ page = null, mode = "create" }) {
    const isEdit = mode === "edit";
    const {
        data,
        setData,
        post,
        put,
        transform,
        processing,
        errors,
        recentlySuccessful,
    } = useForm({
        title: page?.title ?? "",
        slug: page?.slug ?? "",
        excerpt: page?.excerpt ?? "",
        seo_title: page?.seo_title ?? "",
        seo_description: page?.seo_description ?? "",
        status: page?.status ?? "draft",
        show_in_header: page?.show_in_header ?? false,
        show_in_footer: page?.show_in_footer ?? false,
        header_order: page?.header_order ?? "",
        footer_order: page?.footer_order ?? "",
    });

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    // useEffect(() => {
    //     if (!data.title || isEdit) return;

    //     // در صفحه ایجاد، اگر کاربر هنوز Slug را تغییر نداده باشد،
    //     // می‌توان آن را از سمت سرور تولید کرد.
    // }, [data.title, isEdit]);

    const submit = (intent = "draft") => {
        if (isEdit) {
            put(route("admin.pages.update", page.id), {
                preserveScroll: true,
            });

            return;
        }

        transform((formData) => ({
            ...formData,
            intent,
        }));

        post(route("admin.pages.store"), {
            preserveScroll: true,
        });
    };

    return (
        <Layout>
            <Head title={isEdit ? "ویرایش صفحه" : "ایجاد صفحه جدید"} />

            <div className="main-content-inner page-form-page">
                <div className="finance-header">
                    <div className="finance-header-content">
                        <div className="finance-header-icon">
                            <GlobeCode size={28} />
                        </div>
                        <div>
                            <h1>
                                {" "}
                                {isEdit ? "ویرایش صفحه" : "ایجاد صفحه جدید"}
                            </h1>
                            <p>
                                {" "}
                                اطلاعات اصلی صفحه و تنظیمات نمایش آن را مدیریت
                                کنید.
                            </p>
                        </div>
                    </div>
                    <div className="finance-header-actions">
                        <Link
                            href={route("admin.pages.index")}
                            className="back-btn"
                        >
                            <ArrowRight size={20} />
                            <span>بازگشت به لیست صفحات</span>
                        </Link>
                    </div>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit("draft");
                    }}
                    className="page-form"
                >
                    <div className="page-form-main">
                        {/* اطلاعات عمومی */}
                        <section className="page-form-card">
                            <div className="page-form-card-header">
                                <div className="page-form-card-icon">
                                    <FileText size={19} />
                                </div>

                                <div>
                                    <h2>اطلاعات عمومی</h2>
                                    <p>عنوان و محتوای خلاصه صفحه</p>
                                </div>
                            </div>

                            <div className="page-form-card-body">
                                <InputField
                                    label="عنوان صفحه"
                                    name="title"
                                    value={data.title}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        setData("title", value);

                                        if (
                                            mode === "create" &&
                                            !slugManuallyEdited
                                        ) {
                                            setData(
                                                "slug",
                                                generateUtf8Slug(value),
                                            );
                                        }
                                    }}
                                    error={errors.title}
                                    placeholder="مثلاً درباره ما"
                                    required
                                />

                                <div className="page-form-field page-form-slug-field">
                                    <div className="page-form-slug-label-row">
                                        <label
                                            htmlFor="slug"
                                            className="page-form-label"
                                        >
                                            آدرس صفحه (Slug)
                                            <span className="page-form-required">
                                                *
                                            </span>
                                        </label>

                                        <button
                                            type="button"
                                            className="page-form-slug-regenerate"
                                            onClick={() => {
                                                setData(
                                                    "slug",
                                                    generateUtf8Slug(
                                                        data.title,
                                                    ),
                                                );
                                                setSlugManuallyEdited(false);
                                            }}
                                            disabled={!data.title.trim()}
                                        >
                                            <RefreshCw size={14} />
                                            تولید از عنوان
                                        </button>
                                    </div>

                                    <div
                                        className={`page-form-slug-input-wrapper ${errors.slug ? "is-invalid" : ""}`}
                                    >
                                        <span className="page-form-slug-icon">
                                            <LinkIcon size={17} />
                                        </span>

                                        <input
                                            id="slug"
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => {
                                                setSlugManuallyEdited(true);
                                                setData(
                                                    "slug",
                                                    generateUtf8Slug(
                                                        e.target.value,
                                                    ),
                                                );
                                            }}
                                            placeholder="about-us"
                                            dir="ltr"
                                            className="page-form-slug-input"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div
                                        className="page-form-slug-preview"
                                        dir="ltr"
                                    >
                                        <span className="page-form-slug-preview-label">
                                            {window.location.origin}
                                        </span>
                                        <span className="page-form-slug-preview-path">
                                            /{data.slug || "page-url"}
                                        </span>
                                    </div>

                                    <small className="page-form-help">
                                        آدرس صفحه به‌صورت خودکار از عنوان ساخته
                                        می‌شود. می‌توانید آن را دستی نیز تغییر
                                        دهید.
                                    </small>

                                    <FieldError message={errors.slug} />
                                </div>

                                <TextareaField
                                    label="توضیحات کوتاه"
                                    name="excerpt"
                                    value={data.excerpt}
                                    onChange={(e) =>
                                        setData("excerpt", e.target.value)
                                    }
                                    error={errors.excerpt}
                                    placeholder="توضیح مختصری درباره این صفحه..."
                                    rows={4}
                                    help="این توضیحات می‌تواند در بخش‌های مختلف سایت نمایش داده شود."
                                />
                            </div>
                        </section>

                        {/* تنظیمات سئو */}
                        <section className="page-form-card">
                            <div className="page-form-card-header">
                                <div className="page-form-card-icon">
                                    <Search size={19} />
                                </div>

                                <div>
                                    <h2>تنظیمات سئو</h2>
                                    <p>
                                        اطلاعاتی که موتورهای جستجو مشاهده
                                        می‌کنند
                                    </p>
                                </div>
                            </div>

                            <div className="page-form-card-body">
                                <InputField
                                    label="عنوان سئو (اختیاری)"
                                    name="seo_title"
                                    value={data.seo_title}
                                    onChange={(e) =>
                                        setData("seo_title", e.target.value)
                                    }
                                    error={errors.seo_title}
                                    placeholder="عنوان مناسب برای موتورهای جستجو"
                                    help="در صورت خالی بودن، عنوان اصلی صفحه استفاده می‌شود."
                                />

                                <TextareaField
                                    label="توضیحات سئو (اختیاری)"
                                    name="seo_description"
                                    value={data.seo_description}
                                    onChange={(e) =>
                                        setData(
                                            "seo_description",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.seo_description}
                                    placeholder="توضیح کوتاه درباره محتوای صفحه..."
                                    rows={3}
                                    help="توضیحی مختصر و مرتبط با محتوای صفحه بنویسید."
                                />
                            </div>
                        </section>

                        {/* محل نمایش */}
                        <section className="page-form-card">
                            <div className="page-form-card-header">
                                <div className="page-form-card-icon">
                                    <Globe size={19} />
                                </div>

                                <div>
                                    <h2>محل نمایش صفحه</h2>
                                    <p>
                                        مشخص کنید لینک این صفحه در کدام قسمت
                                        سایت باشد.
                                    </p>
                                </div>
                            </div>

                            <div className="page-form-card-body">
                                <ToggleField
                                    label="نمایش در هدر سایت"
                                    description="لینک صفحه در منوی بالای سایت نمایش داده شود."
                                    checked={data.show_in_header}
                                    onChange={(value) =>
                                        setData("show_in_header", value)
                                    }
                                />

                                {data.show_in_header && (
                                    <InputField
                                        label="ترتیب نمایش در هدر"
                                        name="header_order"
                                        value={data.header_order}
                                        onChange={(e) =>
                                            setData(
                                                "header_order",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.header_order}
                                        placeholder="مثلاً ۱"
                                        dir="ltr"
                                        help="عدد کمتر، اولویت نمایش بالاتری دارد."
                                    />
                                )}

                                <div className="page-form-section-divider" />

                                <ToggleField
                                    label="نمایش در فوتر سایت"
                                    description="لینک صفحه در بخش پایینی سایت نمایش داده شود."
                                    checked={data.show_in_footer}
                                    onChange={(value) =>
                                        setData("show_in_footer", value)
                                    }
                                />

                                {data.show_in_footer && (
                                    <InputField
                                        label="ترتیب نمایش در فوتر"
                                        name="footer_order"
                                        value={data.footer_order}
                                        onChange={(e) =>
                                            setData(
                                                "footer_order",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.footer_order}
                                        placeholder="مثلاً ۱"
                                        dir="ltr"
                                        help="عدد کمتر، اولویت نمایش بالاتری دارد."
                                    />
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ستون کناری */}
                    <aside className="page-form-sidebar">
                        <section className="page-form-card">
                            <div className="page-form-card-header">
                                <div className="page-form-card-icon">
                                    <LayoutTemplate size={19} />
                                </div>

                                <div>
                                    <h2>وضعیت صفحه</h2>
                                    <p>وضعیت انتشار صفحه را مدیریت کنید.</p>
                                </div>
                            </div>

                            <div className="page-form-card-body">
                                {isEdit ? (
                                    <>
                                        <div className="page-form-field">
                                            <label
                                                htmlFor="status"
                                                className="page-form-label"
                                            >
                                                وضعیت انتشار
                                            </label>

                                            <select
                                                id="status"
                                                value={data.status}
                                                onChange={(e) =>
                                                    setData(
                                                        "status",
                                                        e.target.value,
                                                    )
                                                }
                                                className={`page-form-input ${
                                                    errors.status
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                            >
                                                <option value="draft">
                                                    پیش‌نویس
                                                </option>
                                                <option value="published">
                                                    منتشرشده
                                                </option>
                                                <option value="archived">
                                                    آرشیوشده
                                                </option>
                                            </select>

                                            <FieldError
                                                message={errors.status}
                                            />
                                        </div>

                                        {data.status === "archived" && (
                                            <div className="page-form-info">
                                                <Info size={16} />
                                                <p>
                                                    صفحه آرشیو شده و در سایت
                                                    برای بازدیدکنندگان نمایش
                                                    داده نمی‌شود. اطلاعات و
                                                    بلوک‌های صفحه حفظ خواهند شد
                                                    و هر زمان بخواهید می‌توانید
                                                    دوباره آن را منتشر کنید.
                                                </p>
                                            </div>
                                        )}

                                        {data.status === "draft" && (
                                            <div className="page-form-info">
                                                <Info size={16} />
                                                <p>
                                                    این صفحه پیش‌نویس است و تا
                                                    زمان انتشار، برای
                                                    بازدیدکنندگان قابل مشاهده
                                                    نخواهد بود.
                                                </p>
                                            </div>
                                        )}

                                        {data.status === "published" && (
                                            <div className="page-form-info">
                                                <Info size={16} />
                                                <p>
                                                    این صفحه پس از ذخیره، در
                                                    سایت منتشر خواهد شد. برای
                                                    نمایش صحیح محتوا، حداقل یک
                                                    بلوک فعال باید داشته باشد.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="page-form-status-info">
                                            <span className="page-form-status-dot" />
                                            <span>پیش‌نویس</span>
                                        </div>

                                        <div className="page-form-info">
                                            <Info size={16} />
                                            <p>
                                                صفحه جدید ابتدا به‌صورت پیش‌نویس
                                                ایجاد می‌شود. پس از طراحی محتوا
                                                می‌توانید آن را منتشر کنید.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="page-form-card page-form-actions-card">
                            {isEdit ? (
                                <>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="page-form-submit"
                                    >
                                        <Save size={17} />
                                        {processing
                                            ? "در حال ذخیره..."
                                            : "ذخیره تغییرات"}
                                    </button>

                                    <Link
                                        href={route(
                                            "admin.pages.builder",
                                            page.id,
                                        )}
                                        className="page-form-cancel"
                                    >
                                        <LayoutTemplate size={16} />
                                        طراحی محتوای صفحه
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        disabled={processing}
                                        className="page-form-submit"
                                        onClick={() => submit("builder")}
                                    >
                                        <LayoutTemplate size={17} />
                                        {processing
                                            ? "در حال ذخیره..."
                                            : "ذخیره و طراحی صفحه"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={processing}
                                        className="page-form-cancel"
                                        onClick={() => submit("draft")}
                                    >
                                        <Save size={16} />
                                        ذخیره و بازگشت
                                    </button>
                                </>
                            )}

                            <Link
                                href={route("admin.pages.index")}
                                className="page-form-cancel"
                            >
                                انصراف
                            </Link>

                            {recentlySuccessful && (
                                <div className="page-form-success">
                                    تغییرات با موفقیت ذخیره شد.
                                </div>
                            )}
                        </section>
                    </aside>
                </form>
            </div>
        </Layout>
    );
}
