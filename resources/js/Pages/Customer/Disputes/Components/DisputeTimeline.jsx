import React from "react";
import {
    Plus,
    Clock,
    MessageCircle,
    CheckCircle2,
    XCircle,
    User,
} from "lucide-react";
import { formatFullDateTime } from "../../../../utils/dateHelpers";

export default function DisputeTimeline({ dispute }) {
    const events = [];

    // 1. ثبت اعتراض
    events.push({
        icon: Plus,
        color: "warning",
        title: "ثبت اعتراض",
        description: `توسط ${dispute.disputed_by_user?.name || "شما"}`,
        date: dispute.created_at,
    });

    // 2. پاسخ
    if (dispute.responded_at && dispute.response) {
        events.push({
            icon: MessageCircle,
            color: "info",
            title: "پاسخ ثبت شد",
            description: `توسط ${dispute.responded_by_user?.name || "طرف مقابل"}`,
            date: dispute.responded_at,
        });
    }

    // 3. حل شدن
    if (dispute.resolved_at && dispute.resolution) {
        events.push({
            icon: dispute.status === "resolved" ? CheckCircle2 : XCircle,
            color: dispute.status === "resolved" ? "primary" : "danger",
            title:
                dispute.status === "resolved" ? "اعتراض حل شد" : "اعتراض رد شد",
            description: `توسط ${dispute.resolved_by_user?.name || "ادمین"}`,
            date: dispute.resolved_at,
        });
    }

    return (
        <div className="dispute-timeline">
            <h3 className="timeline-title">تاریخچه اعتراض</h3>
            <div className="timeline-list">
                {events.map((event, idx) => {
                    const Icon = event.icon;
                    return (
                        <div
                            key={idx}
                            className={`timeline-item ${event.color}`}
                        >
                            <div className={`timeline-icon ${event.color}`}>
                                <Icon size={16} />
                            </div>
                            <div className="timeline-content">
                                <span className="timeline-item-title">
                                    {event.title}
                                </span>
                                <span className="timeline-item-desc">
                                    {event.description}
                                </span>
                                <span className="timeline-item-date">
                                    {formatFullDateTime(event.date)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
