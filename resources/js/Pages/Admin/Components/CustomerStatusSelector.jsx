// resources/js/Components/CustomerStatusSelector.jsx

import { useState } from "react";
import { router } from "@inertiajs/react";
import { ChevronDown, UserX } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import {
    UserStatus,
    getUserStatusConfig,
    getUserStatusOptions,
} from "../../../Enums/userStatus";
import "../Assets/css/CustomerStatusSelector.css";

export default function CustomerStatusSelector({ customer }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(customer.status);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // ✅ کانفیگ وضعیت فعلی
    const currentStatus = getUserStatusConfig(customer.status);
    const CurrentIcon = currentStatus.icon;

    const selectedCfg = getUserStatusConfig(selectedStatus);

    const statusOptions = getUserStatusOptions();

    // ============ انتخاب وضعیت ============
    const handleSelect = (statusKey) => {
        if (statusKey === customer.status) {
            setIsOpen(false);
            return;
        }

        setSelectedStatus(statusKey);
        setIsOpen(false);
        setShowConfirm(true);
    };

    // ============ تایید ============
    const handleConfirm = () => {
        setIsLoading(true);

        router.patch(
            route("admin.customers.update-status", customer.id),
            { status: selectedStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowConfirm(false);
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                    setSelectedStatus(customer.status);
                },
            },
        );
    };

    // ============ بستن مدال ============
    const closeConfirmModal = () => {
        if (isLoading) return;
        setSelectedStatus(customer.status);
        setShowConfirm(false);
    };

    return (
        <div className="customer-status-selector">
            {/* ============ Trigger ============ */}
            <button
                type="button"
                className={`status-selector-trigger status-${currentStatus.color}`}
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
            >
                <CurrentIcon size={16} />
                <span>{currentStatus.label}</span>
                <ChevronDown
                    size={14}
                    className={`chevron ${isOpen ? "open" : ""}`}
                />
            </button>

            {/* ============ Dropdown ============ */}
            {isOpen && (
                <>
                    <div
                        className="status-selector-backdrop"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="status-selector-dropdown">
                        <div className="dropdown-header">
                            <UserX size={16} />
                            <span>تغییر وضعیت کاربر</span>
                        </div>

                        <div className="status-options">
                            {statusOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected =
                                    option.value === customer.status;
                                const isPending =
                                    option.value === selectedStatus;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`status-option status-${option.color} ${
                                            isSelected ? "current" : ""
                                        } ${isPending ? "pending" : ""}`}
                                        onClick={() =>
                                            handleSelect(option.value)
                                        }
                                    >
                                        <div
                                            className={`status-option-icon status-${option.color}`}
                                        >
                                            <Icon size={16} />
                                        </div>
                                        <div className="status-option-content">
                                            <div className="status-option-header">
                                                <span className="status-option-label">
                                                    {option.label}
                                                </span>
                                                {isSelected && (
                                                    <span className="current-badge">
                                                        فعلی
                                                    </span>
                                                )}
                                            </div>
                                            <span className="status-option-desc">
                                                {option.description}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* ============ ✅ ConfirmModal ============ */}
            <ConfirmModal
                isOpen={showConfirm}
                onClose={closeConfirmModal}
                onConfirm={handleConfirm}
                title="تغییر وضعیت کاربر"
                message={
                    customer.name
                        ? `آیا از تغییر وضعیت کاربر «${customer.name}» از «${currentStatus.label}» به «${selectedCfg.label}» مطمئن هستید؟\n\n${selectedCfg.description}`
                        : ""
                }
                confirmText="بله، تغییر بده"
                cancelText="انصراف"
                type={
                    selectedCfg.color === "red"
                        ? "danger"
                        : selectedCfg.color === "green"
                          ? "success"
                          : "warning"
                }
                isLoading={isLoading}
            />
        </div>
    );
}
