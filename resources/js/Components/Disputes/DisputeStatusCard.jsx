import React from "react";
import { Eye } from "lucide-react";
import { toJalaali } from "jalaali-js";
import { toPersianNumber } from "../../utils/persianNumbers";
import {
    getDisputeTypeConfig,
    getDisputeStatusCardConfig,
    getDisputeColorPalette,
} from "../../Constants/disputeTypes";
import "../../Assets/Disputes/DisputeStatusCard.css";

const formatFullDateTime = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const { jy, jm, jd } = toJalaali(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    );
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return toPersianNumber(
        `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")} - ${hours}:${minutes}`,
    );
};

export default function DisputeStatusCard({
    dispute,
    viewerRole,
    scrollTargetSelector,
    showReason = true,
    showScrollButton = false,
    normalizeStatus = true,
    className = "",
}) {
    if (!dispute) return null;

    const statusCfg = getDisputeStatusCardConfig(dispute.status, {
        normalize: normalizeStatus,
    });
    const palette = getDisputeColorPalette(statusCfg.colorName);
    const StatusIcon = statusCfg.icon;

    const isMyDispute = dispute.disputed_by === viewerRole;
    const otherRoleLabel = viewerRole === "customer" ? "آرایشگر" : "مشتری";

    const handleScrollToBanner = () => {
        if (!scrollTargetSelector) return;
        document
            .querySelector(scrollTargetSelector)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div
            className={`dispute-status-card status-${dispute.status} ${className}`}
            style={{
                background: `linear-gradient(135deg, ${palette.bg} 0%, #ffffff 100%)`,
                borderColor: palette.border,
            }}
        >
            <div
                className="dispute-status-card-stripe"
                style={{ background: palette.accent }}
            />

            <div className="dispute-status-card-header">
                <div
                    className="dispute-status-card-icon"
                    style={{
                        backgroundColor: palette.bg,
                        color: palette.color,
                        borderColor: palette.border,
                    }}
                >
                    <StatusIcon size={22} />
                </div>

                <div className="dispute-status-card-title">
                    <span className="dispute-status-card-label">
                        وضعیت اعتراض
                    </span>
                    <h3 style={{ color: palette.color }}>{statusCfg.label}</h3>
                </div>

                <span
                    className="dispute-status-card-badge"
                    style={{
                        backgroundColor: palette.bg,
                        color: palette.color,
                        borderColor: palette.border,
                    }}
                >
                    <StatusIcon size={12} />
                    {statusCfg.label}
                </span>
            </div>

            <div className="dispute-status-card-body">
                <div className="dispute-status-info-row">
                    <div className="info-cell">
                        <span className="cell-label">اعتراض‌کننده</span>
                        <span className="cell-value">
                            {isMyDispute
                                ? `شما (${viewerRole === "customer" ? "مشتری" : "آرایشگر"})`
                                : otherRoleLabel}
                        </span>
                    </div>

                    <div className="info-cell">
                        <span className="cell-label">نوع اعتراض</span>
                        <span className="cell-value">
                            {getDisputeTypeConfig(dispute.dispute_type)
                                ?.label || "-"}
                        </span>
                    </div>

                    <div className="info-cell">
                        <span className="cell-label">تاریخ ثبت</span>
                        <span className="cell-value">
                            {formatFullDateTime(dispute.created_at)}
                        </span>
                    </div>

                    <div className="info-cell">
                        <span className="cell-label">کد اعتراض</span>
                        <span className="cell-value mono" dir="ltr">
                            #{toPersianNumber(dispute.id)}
                        </span>
                    </div>
                </div>

                <div className="dispute-status-card-reason">
                    <span className="reason-label">توجه:</span>
                    <p>برای این سرویس یک اعتراض ثبت شده است.</p>
                </div>
                {/* 
                {showReason && dispute.reason && (
                    <div className="dispute-status-card-reason">
                        <span className="reason-label">متن اعتراض:</span>
                        <p>
                            {dispute.reason.length > 160
                                ? dispute.reason.substring(0, 160) + "..."
                                : dispute.reason}
                        </p>
                    </div>
                )} */}
            </div>

            {/* {showScrollButton && scrollTargetSelector && (
                <div className="dispute-status-card-footer">
                    <button
                        type="button"
                        className="scroll-to-banner-btn"
                        style={{
                            color: palette.color,
                            borderColor: palette.border,
                        }}
                        onClick={handleScrollToBanner}
                    >
                        <Eye size={14} />
                        <span>مشاهده جزئیات کامل اعتراض</span>
                    </button>
                </div>
            )} */}
        </div>
    );
}
