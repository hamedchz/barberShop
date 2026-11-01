import React from "react";
import { FileText, User, Calendar } from "lucide-react";
import { formatFullDateTime } from "../../../../utils/dateHelpers";

export default function DisputeDetails({ dispute }) {
    return (
        <div className="dispute-show-card">
            <div className="dispute-show-card-header">
                <div className="card-icon-box warning">
                    <FileText size={20} />
                </div>
                <h2>جزئیات اعتراض</h2>
            </div>

            <div className="dispute-details-content">
                {/* نوع اعتراض */}
                <div className="detail-row">
                    <span className="detail-label">نوع اعتراض</span>
                    <span className="detail-value">
                        {dispute.dispute_type_label}
                    </span>
                </div>

                {/* ثبت‌کننده */}
                <div className="detail-row">
                    <span className="detail-label">ثبت‌کننده</span>
                    <span className="detail-value">
                        {dispute.disputed_by_user?.name}
                    </span>
                </div>

                {/* تاریخ */}
                <div className="detail-row">
                    <span className="detail-label">تاریخ ثبت</span>
                    <span className="detail-value">
                        {formatFullDateTime(dispute.created_at)}
                    </span>
                </div>

                {/* متن اعتراض */}
                <div className="detail-block">
                    <span className="detail-label">متن اعتراض</span>
                    <div className="detail-block-content">{dispute.reason}</div>
                </div>
            </div>
        </div>
    );
}
