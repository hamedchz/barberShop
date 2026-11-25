import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Layout from "../Layouts/Layout";

import {
    Plus,
    Search,
    FileText,
    Eye,
    Pencil,
    Trash2,
    Globe,
    FileEdit,
    Archive,
    RefreshCw,
    ChevronRight,
    ChevronLeft,
    ExternalLink,
    LayoutGrid,
} from "lucide-react";

import "./Assets/css/Index.css";

const STATUS_OPTIONS = [
    { value: "", label: "همه وضعیت‌ها" },
    { value: "published", label: "منتشر شده" },
    { value: "draft", label: "پیش‌نویس" },
    { value: "archived", label: "بایگانی شده" },
];

const toPersianNumber = (value) => Number(value || 0).toLocaleString("fa-IR");

const getStatus = (status) => {
    const statuses = {
        published: {
            label: "منتشر شده",
            className: "page-status-published",
            icon: Globe,
        },
        draft: {
            label: "پیش‌نویس",
            className: "page-status-draft",
            icon: FileEdit,
        },
        archived: {
            label: "بایگانی شده",
            className: "page-status-archived",
            icon: Archive,
        },
    };

    return statuses[status] || statuses.draft;
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
};

function StatusBadge({ status }) {
    const item = getStatus(status);
    const Icon = item.icon;

    return (
        <span className={`pages-status ${item.className}`}>
            <Icon size={14} />
            {item.label}
        </span>
    );
}

function StatCard({ title, value, icon: Icon, type = "default" }) {
    return (
        <div className={`pages-stat-card pages-stat-${type}`}>
            <div className="pages-stat-icon">
                <Icon size={21} />
            </div>

            <div className="pages-stat-content">
                <span>{title}</span>
                <strong>{toPersianNumber(value)}</strong>
            </div>
        </div>
    );
}

export default function Index() {
    const { props } = usePage();

    const { pages, stats = {}, filters = {}, can = {} } = props;

    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");

    const pageData = pages?.data || [];
    const paginationLinks = pages?.links || [];

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(
            route("admin.pages.index"),
            {
                search: search || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch("");
        setStatus("");

        router.get(
            route("admin.pages.index"),
            {},
            {
                preserveState: false,
                replace: true,
            },
        );
    };

    const deletePage = (page) => {
        const confirmed = window.confirm(
            `آیا از حذف صفحه «${page.title}» اطمینان دارید؟`,
        );

        if (!confirmed) return;

        router.delete(route("admin.pages.destroy", page.id), {
            preserveScroll: true,
        });
    };

    const changePublishStatus = (page) => {
        const isPublished = page.status === "published";

        const message = isPublished
            ? `صفحه «${page.title}» از حالت انتشار خارج شود؟`
            : `صفحه «${page.title}» منتشر شود؟`;

        if (!window.confirm(message)) return;

        const action = isPublished ? "unpublish" : "publish";

        router.post(
            route(`admin.pages.${action}`, page.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <Layout>
            <Head title="مدیریت صفحات" />

            <div className="main-content-inner pages-management">
                {/* Page Header */}
                <div className="pages-header">
                    <div className="pages-header-content">
                        <div className="pages-header-icon">
                            <LayoutGrid size={25} />
                        </div>

                        <div>
                            <h1 className="page-title">مدیریت صفحات</h1>
                            <p className="pages-header-description">
                                صفحات سایت خود را ایجاد، ویرایش و مدیریت کنید.
                            </p>
                        </div>
                    </div>

                    {can.create && (
                        <Link
                            href={route("admin.pages.create")}
                            className="pages-primary-button"
                        >
                            <Plus size={19} />
                            ایجاد صفحه جدید
                        </Link>
                    )}
                </div>

                {/* Statistics */}
                <div className="pages-stats-grid">
                    <StatCard
                        title="تمام صفحات"
                        value={stats.total}
                        icon={FileText}
                    />

                    <StatCard
                        title="منتشر شده"
                        value={stats.published}
                        icon={Globe}
                        type="success"
                    />

                    <StatCard
                        title="پیش‌نویس"
                        value={stats.draft}
                        icon={FileEdit}
                        type="warning"
                    />

                    <StatCard
                        title="بایگانی شده"
                        value={stats.archived}
                        icon={Archive}
                        type="muted"
                    />
                </div>

                {/* Main Card */}
                <div className="pages-main-card">
                    <div className="pages-card-header">
                        <div>
                            <h2>فهرست صفحات</h2>
                            <p>
                                {toPersianNumber(pages?.total)} صفحه در سیستم
                                ثبت شده است.
                            </p>
                        </div>

                        <div className="pages-card-header-icon">
                            <FileText size={21} />
                        </div>
                    </div>

                    {/* Filters */}
                    <form className="pages-filters" onSubmit={applyFilters}>
                        <div className="pages-search-wrapper">
                            <Search size={18} />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="جستجو بر اساس عنوان یا آدرس صفحه..."
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            aria-label="فیلتر وضعیت"
                        >
                            {STATUS_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        <button type="submit" className="pages-filter-button">
                            <Search size={16} />
                            جستجو
                        </button>

                        {(search || status) && (
                            <button
                                type="button"
                                className="pages-reset-button"
                                onClick={resetFilters}
                                title="پاک کردن فیلترها"
                            >
                                <RefreshCw size={16} />
                                پاک کردن
                            </button>
                        )}
                    </form>

                    {/* Table */}
                    {pageData.length > 0 ? (
                        <>
                            <div className="pages-table-wrapper">
                                <table className="pages-table">
                                    <thead>
                                        <tr>
                                            <th>عنوان صفحه</th>
                                            <th>آدرس</th>
                                            <th>وضعیت</th>
                                            <th>نمایش در منو</th>
                                            <th>آخرین بروزرسانی</th>
                                            <th>عملیات</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {pageData.map((page) => (
                                            <tr key={page.id}>
                                                <td>
                                                    <div className="pages-title-cell">
                                                        <div className="pages-row-icon">
                                                            <FileText
                                                                size={18}
                                                            />
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {page.title}
                                                            </strong>

                                                            <span>
                                                                {page.excerpt ||
                                                                    "بدون توضیحات"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="pages-slug">
                                                        /{page.slug}
                                                    </span>
                                                </td>

                                                <td>
                                                    <StatusBadge
                                                        status={page.status}
                                                    />
                                                </td>

                                                <td>
                                                    <div className="pages-menu-flags">
                                                        {page.show_in_header && (
                                                            <span className="pages-menu-flag">
                                                                هدر
                                                            </span>
                                                        )}

                                                        {page.show_in_footer && (
                                                            <span className="pages-menu-flag">
                                                                فوتر
                                                            </span>
                                                        )}

                                                        {!page.show_in_header &&
                                                            !page.show_in_footer && (
                                                                <span className="pages-no-menu">
                                                                    نمایش ندارد
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="pages-date">
                                                        {formatDate(
                                                            page.updated_at,
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="pages-actions">
                                                        {can.edit && (
                                                            <Link
                                                                href={route(
                                                                    "admin.pages.edit",
                                                                    page.id,
                                                                )}
                                                                className="pages-action-btn edit"
                                                                title="ویرایش صفحه"
                                                            >
                                                                <Pencil
                                                                    size={16}
                                                                />
                                                            </Link>
                                                        )}

                                                        {can.preview && (
                                                            <a
                                                                href={route(
                                                                    "admin.pages.preview",
                                                                    page.id,
                                                                )}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="pages-action-btn preview"
                                                                title="پیش‌نمایش"
                                                            >
                                                                <Eye
                                                                    size={16}
                                                                />
                                                            </a>
                                                        )}

                                                        {can.publish && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    changePublishStatus(
                                                                        page,
                                                                    )
                                                                }
                                                                className={`pages-action-btn ${
                                                                    page.status ===
                                                                    "published"
                                                                        ? "unpublish"
                                                                        : "publish"
                                                                }`}
                                                                title={
                                                                    page.status ===
                                                                    "published"
                                                                        ? "خارج کردن از انتشار"
                                                                        : "انتشار صفحه"
                                                                }
                                                            >
                                                                {page.status ===
                                                                "published" ? (
                                                                    <FileEdit
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Globe
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                )}
                                                            </button>
                                                        )}

                                                        {can.delete && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deletePage(
                                                                        page,
                                                                    )
                                                                }
                                                                className="pages-action-btn delete"
                                                                title="حذف صفحه"
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {paginationLinks.length > 3 && (
                                <div className="pages-pagination">
                                    <span className="pages-pagination-info">
                                        نمایش {toPersianNumber(pages.from)} تا{" "}
                                        {toPersianNumber(pages.to)} از{" "}
                                        {toPersianNumber(pages.total)} مورد
                                    </span>

                                    <div className="pages-pagination-links">
                                        {paginationLinks.map((item, index) => {
                                            const isPrevious = index === 0;
                                            const isNext =
                                                index ===
                                                paginationLinks.length - 1;

                                            return (
                                                <Link
                                                    key={index}
                                                    href={item.url || "#"}
                                                    preserveScroll
                                                    className={`pages-pagination-link ${
                                                        item.active
                                                            ? "active"
                                                            : ""
                                                    } ${!item.url ? "disabled" : ""}`}
                                                >
                                                    {isPrevious ? (
                                                        <ChevronRight
                                                            size={17}
                                                        />
                                                    ) : isNext ? (
                                                        <ChevronLeft
                                                            size={17}
                                                        />
                                                    ) : (
                                                        item.label
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="pages-empty-state">
                            <div className="pages-empty-icon">
                                <FileText size={34} />
                            </div>

                            <h3>
                                {search || status
                                    ? "صفحه‌ای با این مشخصات پیدا نشد"
                                    : "هنوز صفحه‌ای ایجاد نشده است"}
                            </h3>

                            <p>
                                {search || status
                                    ? "فیلترهای جستجو را تغییر دهید یا آن‌ها را پاک کنید."
                                    : "برای شروع، اولین صفحه سایت خود را ایجاد کنید."}
                            </p>

                            {can.create && !search && !status && (
                                <Link
                                    href={route("admin.pages.create")}
                                    className="pages-primary-button"
                                >
                                    <Plus size={18} />
                                    ایجاد اولین صفحه
                                </Link>
                            )}

                            {(search || status) && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="pages-reset-button"
                                >
                                    پاک کردن فیلترها
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
