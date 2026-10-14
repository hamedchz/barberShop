import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    CheckCircle,
    XCircle,
    Building2,
    Filter,
    RotateCcw,
    Eye,
    EyeOff,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import { formatFullDateTime } from "../../../utils/dateHelpers";
import SearchComponent from "../../../Components/Search";
import Pagination from "../Components/Pagination";
import BankFormModal from "../Components/BankFormModal";
import DeleteBankModal from "../Components/DeleteBankModal";
import "../Assets/css/Banks.css";

export default function BanksIndex({ banks, stats, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isSearching, setIsSearching] = useState(false);

    // مدال فرم (اضافه/ویرایش)
    const [formModal, setFormModal] = useState({
        isOpen: false,
        bank: null, // null = اضافه | شیء = ویرایش
    });

    // مدال حذف
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        bank: null,
        isLoading: false,
    });

    // ============ باز کردن مدال اضافه ============
    const openCreateModal = () => {
        setFormModal({ isOpen: true, bank: null });
    };

    // ============ باز کردن مدال ویرایش ============
    const openEditModal = (bank) => {
        setFormModal({ isOpen: true, bank });
    };

    // ============ بستن مدال ============
    const closeFormModal = () => {
        setFormModal({ isOpen: false, bank: null });
    };

    // ============ باز کردن مدال حذف ============
    const openDeleteModal = (bank) => {
        setDeleteModal({ isOpen: true, bank, isLoading: false });
    };

    // ============ تایید حذف ============
    const handleConfirmDelete = () => {
        if (!deleteModal.bank) return;

        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(route("admin.banks.destroy", deleteModal.bank.id), {
            preserveScroll: true,
            onSuccess: () =>
                setDeleteModal({ isOpen: false, bank: null, isLoading: false }),
            onError: () =>
                setDeleteModal((prev) => ({ ...prev, isLoading: false })),
        });
    };

    // ============ سرچ ============
    const handleSearch = (value) => {
        setIsSearching(true);

        router.get(
            route("admin.banks.index"),
            {
                search: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ============ تغییر وضعیت ============
    const handleToggleStatus = (bank) => {
        router.patch(
            route("admin.banks.toggle", bank.id),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <Layout>
            <Head title="مدیریت بانکها" />

            <div className="admin-banks-page">
                {/* ============ هدر ============ */}
                <div className="banks-header">
                    <div className="banks-header-content">
                        <div className="banks-header-icon">
                            <Building2 size={28} />
                        </div>
                        <div>
                            <h1>مدیریت بانکها</h1>
                            <p>افزودن، ویرایش و مدیریت بانکهای پلتفرم</p>
                        </div>
                    </div>

                    <div className="banks-header-actions">
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={openCreateModal}
                        >
                            <Plus size={16} />
                            افزودن بانک
                        </button>
                    </div>
                </div>

                {/* ============ آمار ============ */}
                <div className="banks-stats-grid">
                    <div className="bank-stat-card blue">
                        <div className="stat-icon-box">
                            <Building2 size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">کل بانکها</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.total)}
                            </span>
                        </div>
                    </div>

                    <div className="bank-stat-card green">
                        <div className="stat-icon-box">
                            <CheckCircle size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">فعال</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.active)}
                            </span>
                        </div>
                    </div>

                    <div className="bank-stat-card gray">
                        <div className="stat-icon-box">
                            <XCircle size={20} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">غیرفعال</span>
                            <span className="stat-value">
                                {toPersianNumber(stats.inactive)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============ سرچ + فیلتر ============ */}
                <div className="banks-toolbar">
                    <SearchComponent
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onSearch={handleSearch}
                        placeholder="جستجو در نام، کد یا slug..."
                        delay={500}
                        isLoading={isSearching}
                    />
                </div>

                {/* ============ لیست ============ */}
                <div className="banks-list-card">
                    {banks.data.length === 0 ? (
                        <div className="empty-state">
                            <Building2 size={48} />
                            <p>بانکی یافت نشد.</p>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={openCreateModal}
                            >
                                <Plus size={16} />
                                افزودن اولین بانک
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="banks-list">
                                {banks.data.map((bank) => (
                                    <div
                                        key={bank.id}
                                        className={`bank-item ${
                                            !bank.is_active ? "inactive" : ""
                                        }`}
                                    >
                                        {/* آیکون */}
                                        <div className="bank-icon-wrapper">
                                            {bank.icon_url ? (
                                                <img
                                                    src={bank.icon_url}
                                                    alt={bank.name}
                                                />
                                            ) : (
                                                <Building2 size={20} />
                                            )}
                                        </div>

                                        {/* محتوا */}
                                        <div className="bank-content">
                                            <div className="bank-header">
                                                <span className="bank-name">
                                                    {bank.name}
                                                </span>
                                                {bank.code && (
                                                    <span className="bank-code">
                                                        کد: {bank.code}
                                                    </span>
                                                )}
                                                <span
                                                    className={`bank-status ${
                                                        bank.is_active
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >
                                                    {bank.is_active
                                                        ? "فعال"
                                                        : "غیرفعال"}
                                                </span>
                                            </div>

                                            {bank.description && (
                                                <p className="bank-description">
                                                    {bank.description}
                                                </p>
                                            )}

                                            <div className="bank-meta">
                                                <span>Slug: {bank.slug}</span>
                                                <span>
                                                    ترتیب:{" "}
                                                    {toPersianNumber(
                                                        bank.sort_order,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* عملیات */}
                                        <div className="bank-actions">
                                            <button
                                                type="button"
                                                className="action-btn toggle"
                                                onClick={() =>
                                                    handleToggleStatus(bank)
                                                }
                                                title={
                                                    bank.is_active
                                                        ? "غیرفعال کردن"
                                                        : "فعال کردن"
                                                }
                                            >
                                                {bank.is_active ? (
                                                    <EyeOff size={14} />
                                                ) : (
                                                    <Eye size={14} />
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="action-btn edit"
                                                onClick={() =>
                                                    openEditModal(bank)
                                                }
                                                title="ویرایش"
                                            >
                                                <Edit3 size={14} />
                                            </button>

                                            <button
                                                type="button"
                                                className="action-btn delete"
                                                onClick={() =>
                                                    openDeleteModal(bank)
                                                }
                                                title="حذف"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Pagination links={banks.links} only={["banks"]} />
                        </>
                    )}
                </div>
            </div>

            {/* ============ مدال فرم ============ */}
            <BankFormModal
                isOpen={formModal.isOpen}
                bank={formModal.bank}
                onClose={closeFormModal}
            />

            {/* ============ مدال حذف ============ */}
            <DeleteBankModal
                isOpen={deleteModal.isOpen}
                bank={deleteModal.bank}
                isLoading={deleteModal.isLoading}
                onClose={() =>
                    setDeleteModal({
                        isOpen: false,
                        bank: null,
                        isLoading: false,
                    })
                }
                onConfirm={handleConfirmDelete}
            />
        </Layout>
    );
}
