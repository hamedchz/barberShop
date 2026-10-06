import React, { useState, useEffect } from "react";
import { Clock4 } from "lucide-react";
import { toPersianNumber } from "../../../utils/persianNumbers";

export default function DisputeCountdown({ createdAt, status }) {
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        if (status !== "pending") {
            setTimeRemaining(null);
            return;
        }

        const calculateTimeRemaining = () => {
            const created = new Date(createdAt);
            const deadline = new Date(created.getTime() + 2 * 60 * 60 * 1000);
            const now = new Date();
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeRemaining(null);
                return;
            }

            const hours = Math.floor(diff / 1000 / 60 / 60);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeRemaining({
                hours,
                minutes,
                seconds,
                totalMs: diff,
            });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [createdAt, status]);

    if (!timeRemaining) return null;

    // ============ تعیین حالت ============
    const isCritical = timeRemaining.totalMs < 5 * 60 * 1000; // کمتر از ۵ دقیقه
    const isWarning = timeRemaining.totalMs < 30 * 60 * 1000; // کمتر از ۳۰ دقیقه

    const getClassName = () => {
        if (isCritical) return "dispute-banner-countdown critical";
        if (isWarning) return "dispute-banner-countdown warning";
        return "dispute-banner-countdown";
    };

    const getMessage = () => {
        if (isCritical) return "🚨 زمان بسیار کمی باقی مانده!";
        if (isWarning) return "⚠️ زمان کمی باقی مانده!";
        return "زمان باقی‌مانده برای ویرایش:";
    };

    return (
        <div className={getClassName()}>
            <Clock4 size={16} />
            <div className="countdown-content">
                <strong>{getMessage()}</strong>
                <div className="countdown-timer">
                    <span className="time-block">
                        <span className="time-value">
                            {toPersianNumber(timeRemaining.hours)}
                        </span>
                        <span className="time-label">ساعت</span>
                    </span>
                    <span className="time-separator">:</span>
                    <span className="time-block">
                        <span className="time-value">
                            {toPersianNumber(
                                String(timeRemaining.minutes).padStart(2, "0"),
                            )}
                        </span>
                        <span className="time-label">دقیقه</span>
                    </span>
                    <span className="time-separator">:</span>
                    <span className="time-block">
                        <span className="time-value">
                            {toPersianNumber(
                                String(timeRemaining.seconds).padStart(2, "0"),
                            )}
                        </span>
                        <span className="time-label">ثانیه</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
