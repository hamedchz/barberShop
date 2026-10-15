// resources/js/Components/CustomerStatusCard.jsx

import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Shield,
    AlertCircle,
    Info,
    CheckCircle,
    ChevronRight,
} from "lucide-react";
import ConfirmModal from "../Components/ConfirmModal";
import {
    UserStatus,
    getUserStatusConfig,
    getUserStatusOptions,
} from "../../../Enums/userStatus";
import "../Assets/css/CustomerStatusCard.css";

export default function CustomerStatusCard({ customer }) {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // ============ کانفیگ وضعیت فعلی ============
    const currentStatus = getUserStatusConfig(customer.status);
    const CurrentIcon = currentStatus.icon;

    const statusOptions = getUserStatusOptions();

    // ============ انتخاب وضعیت ============
    const handleSelect = (statusKey) => {
        if (statusKey === customer.status) return;

        setSelectedStatus(statusKey);
        setShowConfirm(true);
    };

    // ============ تایید ============
    const handleConfirm = () => {
        if (!selectedStatus) return;

        setIsLoading(true);

        router.patch(
            route("admin.customers.update-status", customer.id),
            { status: selectedStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowConfirm(false);
                    setSelectedStatus(null);
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    // ============ بستن مدال ============
    const closeConfirmModal = () => {
        if (isLoading) return;
        setSelectedStatus(null);
        setShowConfirm(false);
    };

    const selectedCfg = selectedStatus
        ? getUserStatusConfig(selectedStatus)
        : null;

    return (
        <div className="customer-status-card">
            {/* ============ هدر کارت ============ */}
            <div className="card-header">
                <div className="card-icon-box blue">
                    <Shield size={20} />
                </div>
                <h2 className="card-title">وضعیت حساب کاربری</h2>
                <span
                    className={`customer-status-badge status-${currentStatus.color}`}
                >
                    <CurrentIcon size={12} />
                    {currentStatus.label}
                </span>
            </div>

            {/* ============ توضیح کارت ============ */}
            <div className="status-card-intro">
                <Info size={14} />
                <p>
                    از این بخش می‌توانید وضعیت حساب کاربر را تغییر دهید. تغییر
                    وضعیت بلافاصله اعمال می‌شود و بر دسترسی کاربر به خدمات تاثیر
                    می‌گذارد.
                </p>
            </div>

            {/* ============ وضعیت فعلی ============ */}
            <div className="current-status-box">
                <div className="current-status-header">
                    <span className="current-status-label">وضعیت فعلی</span>
                </div>
                <div
                    className={`current-status-content status-${currentStatus.color}`}
                >
                    <div
                        className={`current-status-icon status-${currentStatus.color}`}
                    >
                        <CurrentIcon size={20} />
                    </div>
                    <div className="current-status-info">
                        <span className="current-status-title">
                            {currentStatus.label}
                        </span>
                        <span className="current-status-desc">
                            {currentStatus.description}
                        </span>
                    </div>
                </div>
            </div>

            {/* ============ گزینه‌های تغییر وضعیت ============ */}
            <div className="status-change-section">
                <div className="status-change-header">
                    <ChevronRight size={14} />
                    <span>تغییر وضعیت به:</span>
                </div>

                <div className="status-options-grid">
                    {statusOptions.map((option) => {
                        const Icon = option.icon;
                        const isCurrent = option.value === customer.status;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                className={`status-option-card status-${option.color} ${
                                    isCurrent ? "current" : ""
                                }`}
                                onClick={() => handleSelect(option.value)}
                                disabled={isCurrent || isLoading}
                                title={
                                    isCurrent
                                        ? "وضعیت فعلی"
                                        : `تغییر به ${option.label}`
                                }
                            >
                                <div
                                    className={`status-option-icon status-${option.color}`}
                                >
                                    <Icon size={18} />
                                </div>
                                <div className="status-option-info">
                                    <span className="status-option-label">
                                        {option.label}
                                    </span>
                                    <span className="status-option-desc">
                                        {option.description}
                                    </span>
                                </div>
                                {isCurrent && (
                                    <span className="current-indicator">
                                        <CheckCircle size={14} />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ============ هشدار ============ */}
            <div className="status-card-warning">
                <AlertCircle size={14} />
                <p>
                    <strong>توجه:</strong> تغییر وضعیت به «مسدود» یا «معلق» باعث
                    قطع دسترسی کاربر به حساب می‌شود. لطفاً با دقت عمل کنید.
                </p>
            </div>

            {/* ============ ConfirmModal ============ */}
            <ConfirmModal
                isOpen={showConfirm}
                onClose={closeConfirmModal}
                onConfirm={handleConfirm}
                title="تغییر وضعیت کاربر"
                message={
                    customer.name && selectedCfg
                        ? `آیا از تغییر وضعیت کاربر «${customer.name}» از «${currentStatus.label}» به «${selectedCfg.label}» مطمئن هستید؟\n\n${selectedCfg.description}`
                        : ""
                }
                confirmText="بله، تغییر بده"
                cancelText="انصراف"
                type={
                    selectedCfg?.color === "red"
                        ? "danger"
                        : selectedCfg?.color === "green"
                          ? "success"
                          : "warning"
                }
                isLoading={isLoading}
            />
        </div>
    );
}
