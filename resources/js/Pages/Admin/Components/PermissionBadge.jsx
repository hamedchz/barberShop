import React from "react";
import { Check } from "lucide-react";

export default function PermissionBadge({ label, color = "gray", icon: Icon }) {
    return (
        <div className={`permission-badge badge-${color}`}>
            <div className="permission-badge-icon">
                {Icon ? <Icon size={12} /> : <Check size={12} />}
            </div>
            <span>{label}</span>
        </div>
    );
}
