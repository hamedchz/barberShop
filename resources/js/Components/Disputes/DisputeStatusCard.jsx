import React from "react";
import {
    Eye,
    Gavel,
    AlertTriangle,
    DollarSign,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock4,
} from "lucide-react";
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

    // ============ بررسی تصمیم ادمین ============
    const isResolved = dispute.status === "resolved";
    const isRejected = dispute.status === "rejected";
    const hasDecision = isResolved || isRejected;

    // ============ مبالغ ============
    const refundAmount = parseFloat(dispute.refund_amount || 0);
    const penaltyAmount = parseFloat(dispute.penalty_amount || 0);
    const compensationAmount = parseFloat(dispute.compensation_amount || 0);
    const hasFinancialEffect =
        refundAmount > 0 || penaltyAmount > 0 || compensationAmount > 0;

    // ============ آیا آرایشگر جریمه شده؟ ============
    const isBarberPenalized = penaltyAmount > 0;
    const isBarberCompensated =
        compensationAmount > 0 && viewerRole === "barber";
    const isCustomerRefunded = refundAmount > 0 && viewerRole === "customer";

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

            {/* ============ هدر ============ */}
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

            {/* ============ اطلاعات خلاصه ============ */}
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

                {/* ============ ✅ تصمیم ادمین ============ */}
                {hasDecision && (
                    <div
                        className={`dispute-decision-box decision-${dispute.status}`}
                    >
                        <div className="decision-header">
                            <div className="decision-icon">
                                {isResolved ? (
                                    <CheckCircle size={16} />
                                ) : (
                                    <XCircle size={16} />
                                )}
                            </div>
                            <span className="decision-title">
                                {isResolved
                                    ? "نتیجه: اعتراض تایید شد"
                                    : "نتیجه: اعتراض رد شد"}
                            </span>
                            {dispute.resolved_at && (
                                <span className="decision-date">
                                    {formatFullDateTime(dispute.resolved_at)}
                                </span>
                            )}
                        </div>

                        {dispute.resolution && (
                            <div className="decision-content">
                                <MessageSquare size={12} />
                                <p>{dispute.resolution}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ============ ✅ اثرات مالی ============ */}
                {hasDecision && isResolved && hasFinancialEffect && (
                    <div className="dispute-financial-box">
                        <div className="financial-header">
                            <DollarSign size={14} />
                            <span>تسویه مالی</span>
                        </div>

                        <div className="financial-rows">
                            {/* بازگشت به مشتری */}
                            {refundAmount > 0 && (
                                <div className="financial-row refund">
                                    <div className="row-icon">
                                        <DollarSign size={12} />
                                    </div>
                                    <div className="row-content">
                                        <span className="row-label">
                                            بازگشت به مشتری
                                        </span>
                                        <span className="row-value">
                                            {toPersianNumber(
                                                refundAmount.toLocaleString(),
                                            )}{" "}
                                            <span className="currency">
                                                تومان
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* جریمه آرایشگر */}
                            {penaltyAmount > 0 && (
                                <div className="financial-row penalty">
                                    <div className="row-icon">
                                        <AlertTriangle size={12} />
                                    </div>
                                    <div className="row-content">
                                        <span className="row-label">
                                            جریمه آرایشگر
                                            {viewerRole === "barber" && (
                                                <span className="row-tag">
                                                    (شما)
                                                </span>
                                            )}
                                        </span>
                                        <span className="row-value">
                                            {toPersianNumber(
                                                penaltyAmount.toLocaleString(),
                                            )}{" "}
                                            <span className="currency">
                                                تومان
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* غرامت به آرایشگر */}
                            {compensationAmount > 0 && (
                                <div className="financial-row compensation">
                                    <div className="row-icon">
                                        <DollarSign size={12} />
                                    </div>
                                    <div className="row-content">
                                        <span className="row-label">
                                            غرامت به آرایشگر
                                            {viewerRole === "barber" && (
                                                <span className="row-tag success">
                                                    (به نفع شما)
                                                </span>
                                            )}
                                        </span>
                                        <span className="row-value">
                                            {toPersianNumber(
                                                compensationAmount.toLocaleString(),
                                            )}{" "}
                                            <span className="currency">
                                                تومان
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* جمع‌بندی برای آرایشگر */}
                        {viewerRole === "barber" &&
                            (penaltyAmount > 0 || compensationAmount > 0) && (
                                <div className="financial-summary">
                                    {penaltyAmount > 0 &&
                                    compensationAmount > 0 ? (
                                        <>
                                            <span className="summary-label">
                                                تأثیر خالص بر کیف پول شما:
                                            </span>
                                            <span
                                                className={`summary-value ${
                                                    compensationAmount -
                                                        penaltyAmount >=
                                                    0
                                                        ? "positive"
                                                        : "negative"
                                                }`}
                                            >
                                                {compensationAmount -
                                                    penaltyAmount >=
                                                0
                                                    ? "+"
                                                    : "-"}
                                                {toPersianNumber(
                                                    Math.abs(
                                                        compensationAmount -
                                                            penaltyAmount,
                                                    ).toLocaleString(),
                                                )}{" "}
                                                تومان
                                            </span>
                                        </>
                                    ) : penaltyAmount > 0 ? (
                                        <>
                                            <span className="summary-label">
                                                کسر شده از کیف پول شما:
                                            </span>
                                            <span className="summary-value negative">
                                                -
                                                {toPersianNumber(
                                                    penaltyAmount.toLocaleString(),
                                                )}{" "}
                                                تومان
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="summary-label">
                                                واریز شده به کیف پول شما:
                                            </span>
                                            <span className="summary-value positive">
                                                +
                                                {toPersianNumber(
                                                    compensationAmount.toLocaleString(),
                                                )}{" "}
                                                تومان
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}

                        {/* جمع‌بندی برای مشتری */}
                        {viewerRole === "customer" && refundAmount > 0 && (
                            <div className="financial-summary">
                                <span className="summary-label">
                                    واریز شده به کیف پول شما:
                                </span>
                                <span className="summary-value positive">
                                    +
                                    {toPersianNumber(
                                        refundAmount.toLocaleString(),
                                    )}{" "}
                                    تومان
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* ============ راهنما ============ */}
                <div className="dispute-status-card-reason">
                    <span className="reason-label">توجه:</span>
                    <p>برای این سرویس یک اعتراض ثبت شده است.</p>
                </div>
            </div>
        </div>
    );
}
