import React from "react";
import {
    FileText,
    Home,
    BarChart2,
    CheckSquare,
    Calendar,
    Settings,
    LogOut,
    X,
} from "lucide-react";

const SidebarItem = ({ icon: Icon, label, active, badge }) => (
    <div className={`sidebar-item ${active ? "active" : ""}`}>
        <div className="sidebar-item-content">
            <Icon
                size={20}
                className={active ? "text-emerald-500" : "text-gray-400"}
            />
            <span>{label}</span>
        </div>
        {badge && <span className="badge">{badge}</span>}
    </div>
);

export default function Sidebar({ isOpen, closeSidebar }) {
    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
            <div>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-icon">S</div>
                        <span className="logo-text">SCHOOLUS</span>
                    </div>
                    <button
                        className="close-sidebar-btn"
                        onClick={closeSidebar}
                    >
                        <X size={24} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <SidebarItem icon={FileText} label="Materials" />
                    <SidebarItem icon={Home} label="Classes" />
                    <SidebarItem icon={BarChart2} label="Progress" />
                    <SidebarItem
                        icon={CheckSquare}
                        label="Statistics"
                        active={true}
                    />
                    <SidebarItem icon={Calendar} label="Testing" />
                    <SidebarItem icon={Calendar} label="Meetings" badge="2" />
                    <SidebarItem icon={Settings} label="Settings" />
                </nav>
            </div>
            <div className="logout-btn">
                <LogOut size={20} />
                <span>Log out</span>
            </div>
        </aside>
    );
}
