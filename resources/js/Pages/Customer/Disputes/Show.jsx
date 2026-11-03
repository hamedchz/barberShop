import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Layout from "../../Admin/Layouts/Layout";

import {
    ArrowRight,
    FileText,
    MessageCircle,
    Scale,
    Clock,
    CheckCircle2,
    AlertCircle,
    Wallet,
    Calendar,
    Scissors,
    User,
    Paperclip,
} from "lucide-react";
import DisputeHeader from "./Components/DisputeHeader";
import DisputeTimeline from "./Components/DisputeTimeline";
import DisputeDetails from "./Components/DisputeDetails";

import "./Assets/css/Show.css";

export default function DisputeShow({
    dispute,
    booking,
    permissions,
    disputeTypes,
}) {
    const [showEditModal, setShowEditModal] = useState(false);
    // const [showDeleteModal, setShowDeleteModal] = useState(false);
    // const [showRespondModal, setShowRespondModal] = useState(false);

    const hasActions =
        permissions.can_edit ||
        permissions.can_delete ||
        permissions.can_respond;

    return (
        <Layout>
            <Head title={`اعتراض #${dispute.id}`} />

            <div className="dispute-show-page">
                {/* هدر وضعیت */}
                <DisputeHeader
                    dispute={dispute}
                    booking={booking}
                    permissions={permissions}
                />

                {/* تایم‌لاین */}
                <DisputeTimeline dispute={dispute} />

                {/* Grid اصلی */}
                <div className="dispute-show-grid">
                    {/* ستون اصلی */}
                    <div className="dispute-show-main">
                        {/* جزئیات اعتراض */}
                        <DisputeDetails dispute={dispute} />
                    </div>

                    {/* ستون کنار */}
                    <div className="dispute-show-sidebar">
                        {/* اطلاعات مالی */}
                        {(dispute.refund_amount > 0 ||
                            dispute.penalty_amount > 0 ||
                            dispute.compensation_amount > 0) && (
                            <div className="dispute-show-card">
                                <div className="dispute-show-card-header">
                                    <div className="card-icon-box green">
                                        <Wallet size={20} />
                                    </div>
                                    <h2>اطلاعات مالی</h2>
                                </div>
                                <div className="financial-info-list">
                                    {dispute.refund_amount > 0 && (
                                        <div className="financial-item">
                                            <span className="label">
                                                بازگشت وجه
                                            </span>
                                            <span className="value refund">
                                                {toPersianNumber(
                                                    dispute.refund_amount.toLocaleString(),
                                                )}{" "}
                                                تومان
                                            </span>
                                        </div>
                                    )}
                                    {dispute.penalty_amount > 0 && (
                                        <div className="financial-item">
                                            <span className="label">جریمه</span>
                                            <span className="value penalty">
                                                {toPersianNumber(
                                                    dispute.penalty_amount.toLocaleString(),
                                                )}{" "}
                                                تومان
                                            </span>
                                        </div>
                                    )}
                                    {dispute.compensation_amount > 0 && (
                                        <div className="financial-item">
                                            <span className="label">غرامت</span>
                                            <span className="value compensation">
                                                {toPersianNumber(
                                                    dispute.compensation_amount.toLocaleString(),
                                                )}{" "}
                                                تومان
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* اطلاعات رزرو مرتبط */}
                        <div className="dispute-show-card">
                            <div className="dispute-show-card-header">
                                <div className="card-icon-box blue">
                                    <Calendar size={20} />
                                </div>
                                <h2>رزرو مرتبط</h2>
                            </div>
                            <div className="booking-info-list">
                                <div className="booking-info-item">
                                    <span className="label">کد رزرو</span>
                                    <span className="value mono">
                                        {booking.booking_code}
                                    </span>
                                </div>
                                <div className="booking-info-item">
                                    <span className="label">خدمت</span>
                                    <span className="value">
                                        {booking.service_name}
                                    </span>
                                </div>
                                <div className="booking-info-item">
                                    <span className="label">آرایشگر</span>
                                    <span className="value">
                                        {booking.barber?.name}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={route(
                                    "customer.bookings.show",
                                    booking.id,
                                )}
                                className="btn-secondary full-width"
                            >
                                <FileText size={14} />
                                مشاهده رزرو
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
