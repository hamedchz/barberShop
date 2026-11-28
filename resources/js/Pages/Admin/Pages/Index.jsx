import { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";

import Layout from "../Layouts/Layout";

import "./Assets/css/Index.css";
import { toPersianNumber } from "../../../utils/persianNumbers";
import SearchComponent from "../../../Components/Search";
import Pagination from "../Components/Pagination";
import ConfirmModal from "../Components/ConfirmModal";
import Swal from "sweetalert2";
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
    GlobeLock,
    SplinePointer,
    LockKeyhole,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const STATUS_OPTIONS = [
    { value: "", label: "همه وضعیت‌ها" },
    { value: "published", label: "منتشر شده" },
    { value: "draft", label: "پیش‌نویس" },
    { value: "archived", label: "بایگانی شده" },
];

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

function PageTypeBadge({ isSystem }) {
    return (
        <span
            className={`pages-type-badge ${
                isSystem ? "pages-type-system" : "pages-type-normal"
            }`}
        >
            {isSystem ? (
                <>
                    <LockKeyhole size={13} />
                    سیستمی
                </>
            ) : (
                <>
                    <FileText size={13} />
                    عادی
                </>
            )}
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
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    // const { props } = usePage();
    const { pages, stats, filters, can } = usePage().props;

    const pageData = pages?.data || [];
    // const paginationLinks = pages?.links || [];

    const [searchTerm, setSearchTerm] = useState(filters.search ?? "");
    const [status, setStatus] = useState(filters.status ?? "");
    const [isSearching, setIsSearching] = useState(false);

    // هماهنگ‌سازی فیلترها با آدرس و پاسخ سرور
    useEffect(() => {
        setSearchTerm(filters.search ?? "");
        setStatus(filters.status ?? "");
    }, [filters.search, filters.status]);

    // اعمال فیلترها
    const applyFilters = (overrides = {}) => {
        const params = {
            search: searchTerm,
            status,
            ...overrides,
            page: 1,
        };

        setIsSearching(true);

        router.get(route("admin.pages.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => {
                setIsSearching(false);
            },
        });
    };

    // جستجو
    const handleSearch = (value) => {
        applyFilters({
            search: value,
        });
    };

    // تغییر وضعیت
    const handleStatusChange = (value) => {
        setStatus(value);

        applyFilters({
            status: value,
        });
    };

    const resetFilters = () => {
        setSearchTerm("");
        setStatus("");
        setIsSearching(true);

        router.get(
            route("admin.pages.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        page: null,
        isLoading: false,
    });

    const openDeleteModal = (page) => {
        setDeleteModal({
            isOpen: true,
            page,
            isLoading: false,
        });
    };

    const closeDeleteModal = () => {
        if (deleteModal.isLoading) return;

        setDeleteModal({
            isOpen: false,
            page: null,
            isLoading: false,
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteModal.page || deleteModal.isLoading) return;

        setDeleteModal((prev) => ({
            ...prev,
            isLoading: true,
        }));

        router.delete(route("admin.pages.destroy", deleteModal.page.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({
                    isOpen: false,
                    page: null,
                    isLoading: false,
                });
            },
            onError: () => {
                setDeleteModal((prev) => ({
                    ...prev,
                    isLoading: false,
                }));
            },
            onFinish: () => {
                setDeleteModal((prev) => ({
                    ...prev,
                    isLoading: false,
                }));
            },
        });
    };

    const [publishModal, setPublishModal] = useState({
        isOpen: false,
        page: null,
        action: "publish",
        isLoading: false,
        error: null,
    });

    const openPublishModal = (page, action = "publish") => {
        setPublishModal({
            isOpen: true,
            page,
            action,
            isLoading: false,
            error: null,
        });
    };

    const closePublishModal = () => {
        if (publishModal.isLoading) return;

        setPublishModal({
            isOpen: false,
            page: null,
            action: "publish",
            isLoading: false,
            error: null,
        });
    };

    const handleConfirmPublish = () => {
        if (!publishModal.page || publishModal.isLoading) return;

        const { page, action } = publishModal;

        setPublishModal((prev) => ({
            ...prev,
            isLoading: true,
        }));

        router.post(
            route(
                action === "publish"
                    ? "admin.pages.publish"
                    : "admin.pages.unpublish",
                page.id,
            ),
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    setPublishModal({
                        isOpen: false,
                        page: null,
                        action: "publish",
                        isLoading: false,
                        error: null,
                    });
                },

                onError: (errors) => {
                    const message =
                        errors?.sections ||
                        Object.values(errors || {})[0] ||
                        "خطایی هنگام انجام عملیات رخ داد.";

                    // بستن مدال
                    setPublishModal({
                        isOpen: false,
                        page: null,
                        action: "publish",
                        isLoading: false,
                        error: null,
                    });

                    // نمایش خطا
                    Swal.fire({
                        icon: "error",
                        title: "خطا",
                        text: message,
                        confirmButtonText: "متوجه شدم",
                        customClass: {
                            popup: "rtl-alert",
                        },
                    });
                },

                onFinish: () => {
                    setPublishModal((prev) => ({
                        ...prev,
                        isLoading: false,
                    }));
                },
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
                {/* Page Creation Guide */}
                <div
                    className={`pages-guide ${isGuideOpen ? "is-open" : "is-collapsed"}`}
                >
                    <div className="pages-guide-header">
                        <div className="pages-guide-heading">
                            <div className="pages-guide-icon">
                                <FileText size={21} />
                            </div>

                            <div>
                                <h3>راهنمای مدیریت صفحات</h3>
                                <p>
                                    برای ساخت و انتشار صفحات جدید، مراحل زیر را
                                    دنبال کنید.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="pages-guide-toggle"
                            onClick={() => setIsGuideOpen((prev) => !prev)}
                            aria-expanded={isGuideOpen}
                            title={
                                isGuideOpen ? "جمع کردن راهنما" : "نمایش راهنما"
                            }
                        >
                            {/* <span>
                                {isGuideOpen
                                    ? "جمع کردن راهنما"
                                    : "مشاهده راهنما"}
                            </span> */}
                            {isGuideOpen ? (
                                <ChevronUp size={17} />
                            ) : (
                                <ChevronDown size={17} />
                            )}
                        </button>
                    </div>

                    {isGuideOpen && (
                        <div className="pages-guide-content">
                            <div className="pages-guide-steps">
                                <div className="pages-guide-step">
                                    <span className="pages-guide-step-number">
                                        ۱
                                    </span>

                                    <div className="pages-guide-step-content">
                                        <strong>ایجاد صفحه جدید</strong>
                                        <p>
                                            روی دکمه ایجاد صفحه جدید کلیک کنید و
                                            عنوان، آدرس و اطلاعات اولیه صفحه را
                                            وارد کنید.
                                        </p>
                                    </div>
                                </div>

                                <div className="pages-guide-step">
                                    <span className="pages-guide-step-number">
                                        ۲
                                    </span>

                                    <div className="pages-guide-step-content">
                                        <strong>طراحی محتوای صفحه</strong>
                                        <p>
                                            وارد صفحه‌ساز شوید و بخش‌های
                                            موردنیاز مانند متن، تصویر، گالری و
                                            معرفی خدمات را اضافه کنید.
                                        </p>
                                    </div>
                                </div>

                                <div className="pages-guide-step">
                                    <span className="pages-guide-step-number">
                                        ۳
                                    </span>

                                    <div className="pages-guide-step-content">
                                        <strong>بررسی پیش‌نمایش</strong>
                                        <p>
                                            قبل از انتشار، پیش‌نمایش صفحه را
                                            بررسی کنید تا از ظاهر و محتوای آن
                                            مطمئن شوید.
                                        </p>
                                    </div>
                                </div>

                                <div className="pages-guide-step">
                                    <span className="pages-guide-step-number">
                                        ۴
                                    </span>

                                    <div className="pages-guide-step-content">
                                        <strong>انتشار صفحه</strong>
                                        <p>
                                            پس از تکمیل طراحی، از گزینه انتشار
                                            استفاده کنید تا صفحه برای
                                            بازدیدکنندگان قابل مشاهده شود.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pages-guide-footer">
                                <div className="pages-guide-notice">
                                    <div className="pages-guide-notice-icon">
                                        <FileText size={18} />
                                    </div>

                                    <p>
                                        <strong>نکته مهم:</strong>
                                        صفحات سیستمی مانند درباره ما و تماس با
                                        ما قابل حذف نیستند. برای عدم نمایش آن‌ها
                                        در سایت، وضعیت انتشار یا تنظیمات نمایش
                                        در منو را تغییر دهید.
                                    </p>
                                </div>

                                {can.create && (
                                    <Link
                                        href={route("admin.pages.create")}
                                        className="pages-guide-create"
                                    >
                                        <Plus size={17} />
                                        ایجاد صفحه جدید
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
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
                            <SearchComponent
                                value={searchTerm}
                                onChange={setSearchTerm}
                                onSearch={handleSearch}
                                placeholder="جستجو در عنوان یا آدرس صفحه..."
                                delay={500}
                                isLoading={isSearching}
                            />
                        </div>

                        <div className="pages-filter-status">
                            <select
                                value={status}
                                onChange={(e) =>
                                    handleStatusChange(e.target.value)
                                }
                                disabled={isSearching}
                                className="pages-status-select"
                            >
                                <option value="">همه وضعیت‌ها</option>
                                <option value="published">منتشر شده</option>
                                <option value="draft">پیش‌نویس</option>
                                <option value="archived">بایگانی شده</option>
                            </select>
                        </div>

                        {(searchTerm || status) && (
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
                                            <th>نوع صفحه</th>
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
                                                    <PageTypeBadge
                                                        isSystem={
                                                            page.is_system
                                                        }
                                                    />
                                                </td>

                                                <td>
                                                    <div className="pages-actions">
                                                        {can.edit && (
                                                            <>
                                                                <Link
                                                                    href={route(
                                                                        "admin.pages.edit",
                                                                        page.id,
                                                                    )}
                                                                    className="pages-action-btn edit"
                                                                    title="ویرایش صفحه"
                                                                >
                                                                    <Pencil
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </Link>
                                                                <Link
                                                                    href={route(
                                                                        "admin.pages.builder",
                                                                        page.id,
                                                                    )}
                                                                    className="pages-action-btn design"
                                                                    title="طراحی صفحه"
                                                                >
                                                                    <SplinePointer
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </Link>
                                                            </>
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
                                                        {can.publish &&
                                                            page.status !==
                                                                "published" && (
                                                                <button
                                                                    type="button"
                                                                    className="pages-action-btn publish"
                                                                    onClick={() =>
                                                                        openPublishModal(
                                                                            page,
                                                                            "publish",
                                                                        )
                                                                    }
                                                                    title="انتشار صفحه"
                                                                >
                                                                    <Globe
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                        {can.publish &&
                                                            page.status ===
                                                                "published" && (
                                                                <button
                                                                    type="button"
                                                                    className="pages-action-btn pages-action-unpublish"
                                                                    onClick={() =>
                                                                        openPublishModal(
                                                                            page,
                                                                            "unpublish",
                                                                        )
                                                                    }
                                                                    title="لغو انتشار"
                                                                >
                                                                    <GlobeLock
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                        {page.is_system ? (
                                                            <span
                                                                className="pages-action-btn pages-action-locked"
                                                                title="صفحات سیستمی قابل حذف نیستند. برای عدم نمایش، وضعیت انتشار یا تنظیمات نمایش در منو را تغییر دهید."
                                                                aria-label="صفحه سیستمی قابل حذف نیست"
                                                            >
                                                                <LockKeyhole
                                                                    size={16}
                                                                />
                                                            </span>
                                                        ) : (
                                                            can.delete && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openDeleteModal(
                                                                            page,
                                                                        )
                                                                    }
                                                                    className="pages-action-btn delete"
                                                                    title="حذف صفحه"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination links={pages.links} only={pages} />
                        </>
                    ) : (
                        <div className="pages-empty-state">
                            <div className="pages-empty-icon">
                                <FileText size={34} />
                            </div>

                            <h3>
                                {searchTerm || status
                                    ? "صفحه‌ای با این مشخصات پیدا نشد"
                                    : "هنوز صفحه‌ای ایجاد نشده است"}
                            </h3>

                            <p>
                                {searchTerm || status
                                    ? "فیلترهای جستجو را تغییر دهید یا آن‌ها را پاک کنید."
                                    : "برای شروع، اولین صفحه سایت خود را ایجاد کنید."}
                            </p>

                            {can.create && !searchTerm && !status && (
                                <Link
                                    href={route("admin.pages.create")}
                                    className="pages-primary-button"
                                >
                                    <Plus size={18} />
                                    ایجاد اولین صفحه
                                </Link>
                            )}

                            {(searchTerm || status) && (
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

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="حذف صفحه"
                message={
                    deleteModal.page
                        ? `آیا از حذف صفحه «${deleteModal.page.title}» مطمئن هستید؟`
                        : ""
                }
                confirmText="بله، حذف کن"
                cancelText="انصراف"
                type="danger"
                isLoading={deleteModal.isLoading}
            />

            <ConfirmModal
                isOpen={publishModal.isOpen}
                onClose={closePublishModal}
                onConfirm={handleConfirmPublish}
                title={
                    publishModal.action === "publish"
                        ? "انتشار صفحه"
                        : "لغو انتشار صفحه"
                }
                message={
                    publishModal.page
                        ? publishModal.action === "publish"
                            ? `آیا از انتشار صفحه «${publishModal.page.title}» مطمئن هستید؟`
                            : `آیا از لغو انتشار صفحه «${publishModal.page.title}» مطمئن هستید؟`
                        : ""
                }
                confirmText={
                    publishModal.action === "publish"
                        ? "بله، منتشر کن"
                        : "بله، لغو انتشار کن"
                }
                cancelText="انصراف"
                type={publishModal.action === "publish" ? "success" : "warning"}
                isLoading={publishModal.isLoading}
            />
        </Layout>
    );
}
