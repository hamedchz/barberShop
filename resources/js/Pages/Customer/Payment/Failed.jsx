import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import PublicLayout from "../Layouts/PublicLayout";
import {
    XCircle,
    Home,
    RefreshCw,
    AlertCircle,
    Phone,
    Calendar1,
} from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";
import "../Assets/Payment.css";
import { Calendar } from "react-multi-date-picker";
export default function PaymentFailed({ auth, booking }) {
    // ============ تلاش مجدد ============
    const handleRetry = () => {
        router.get(`/customer/bookings`);
    };

    return (
        <PublicLayout>
            <Head title="پرداخت ناموفق" />

            <div className="payment-result-container">
                <div className="payment-result-card failed">
                    {/* آیکون خطا */}
                    <div className="result-icon-wrapper failed">
                        <XCircle size={48} />
                    </div>

                    <h1 className="result-title failed">پرداخت انجام نشد</h1>

                    <p className="result-subtitle">
                        متأسفانه پرداخت شما با موفقیت انجام نشد. در صورت کسر
                        مبلغ از حساب، تا ۷۲ ساعت آینده به حساب شما بازگردانده
                        می‌شود.
                    </p>

                    <div className="failed-info-box">
                        <AlertCircle size={18} />
                        <div>
                            <strong>دلایل احتمالی:</strong>
                            <ul>
                                <li>انصراف از پرداخت</li>
                                <li>عدم موجودی کافی</li>
                                <li>خطای ارتباط با درگاه بانکی</li>
                                <li>اطلاعات کارت نادرست</li>
                            </ul>
                        </div>
                    </div>

                    <div className="support-box">
                        <Phone size={16} />
                        <p>
                            در صورت نیاز به کمک با پشتیبانی تماس بگیرید:{" "}
                            <strong dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</strong>
                        </p>
                    </div>

                    {/* دکمه‌ها */}
                    <div className="result-actions">
                        <button
                            onClick={handleRetry}
                            className="result-btn primary"
                        >
                            <Calendar1 size={18} />
                            نوبت های من
                        </button>
                        <Link href="/" className="result-btn outline">
                            <Home size={18} />
                            بازگشت به خانه
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
