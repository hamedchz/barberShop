import React from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    Search,
    MoreHorizontal,
    AlertCircle,
    XCircle,
    ChevronRight,
} from "lucide-react";
import Layout from "./Layouts/Layout"; // ایمپورت Layout

// --- داده‌های نمونه ---
const interestData = [
    { name: "Sport", value: 40, color: "#10b981" },
    { name: "Reading", value: 65, color: "#10b981" },
    { name: "Hi-tech", value: 30, color: "#10b981" },
    { name: "Music/Art", value: 85, color: "#ef4444" },
    { name: "Science", value: 55, color: "#10b981" },
];

const traitData = [
    { subject: "Conscientiousness", A: 120, fullMark: 150 },
    { subject: "Neuroticism", A: 98, fullMark: 150 },
    { subject: "Extraversion", A: 86, fullMark: 150 },
    { subject: "Agreeableness", A: 99, fullMark: 150 },
    { subject: "Openness", A: 85, fullMark: 150 },
    { subject: "Stability", A: 65, fullMark: 150 },
];

const performanceData = [
    { month: "03/20", score: 60 },
    { month: "06/20", score: 45 },
    { month: "09/20", score: 70 },
    { month: "12/20", score: 85 },
];

export default function Dashboard() {
    return (
        <Layout>
            {/* ستون وسط */}
            <div className="center-column">
                {/* کارت پروفایل */}
                <div className="card profile-card">
                    <img
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                        alt="Profile"
                        className="profile-img"
                    />
                    <div className="profile-info">
                        <span className="badge-new">New student</span>
                        <h1 className="profile-name">Gabriela Richardson</h1>
                        <div className="profile-details-grid">
                            <div>
                                <p className="detail-label">School</p>
                                <p className="detail-value">
                                    Harvey Mudd College California
                                </p>
                            </div>
                            <div>
                                <p className="detail-label">Age</p>
                                <p className="detail-value">15</p>
                            </div>
                            <div>
                                <p className="detail-label">Mother</p>
                                <p className="detail-value">Tyrell Mccaffrey</p>
                            </div>
                            <div>
                                <p className="detail-label">Father</p>
                                <p className="detail-value">Usman Rankin</p>
                            </div>
                        </div>
                        <button className="btn-outline">
                            View full profile
                        </button>
                    </div>
                </div>

                {/* ردیف میانی */}
                <div className="grid-2-col">
                    {/* Areas of interest */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Areas of interest</h2>
                            <MoreHorizontal
                                size={20}
                                color="#9ca3af"
                                cursor="pointer"
                            />
                        </div>
                        <p
                            style={{
                                fontSize: "0.75rem",
                                color: "#9ca3af",
                                marginBottom: "1.5rem",
                            }}
                        >
                            Key hobbies - painting, reading
                        </p>
                        <div className="interest-list">
                            {interestData.map((item, idx) => (
                                <div key={idx} className="interest-item">
                                    <span className="interest-name">
                                        {item.name}
                                    </span>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${item.value}%`,
                                                backgroundColor: item.color,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Traits of character */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Traits of character</h2>
                            <span className="link-btn">See full map</span>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart
                                    cx="50%"
                                    cy="50%"
                                    outerRadius="70%"
                                    data={traitData}
                                >
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: "#6b7280", fontSize: 10 }}
                                    />
                                    <Radar
                                        name="Student"
                                        dataKey="A"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.6}
                                    />
                                    <Radar
                                        name="Average"
                                        dataKey="A"
                                        stroke="#ef4444"
                                        fill="#ef4444"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ردیف پایین */}
                <div className="grid-2-col">
                    {/* Social contacts */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Social contacts</h2>
                            <span className="link-btn">See all</span>
                        </div>
                        <div className="contacts-list">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="contact-item">
                                    <img
                                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                        alt="Contact"
                                        className="contact-img"
                                    />
                                    <p className="contact-name">Sade W.</p>
                                </div>
                            ))}
                        </div>
                        <p
                            style={{
                                fontSize: "0.75rem",
                                color: "#9ca3af",
                                textAlign: "center",
                            }}
                        >
                            Number of Facebook friends{" "}
                            <span
                                style={{ fontWeight: "bold", color: "#1f2937" }}
                            >
                                78
                            </span>
                        </p>
                    </div>

                    {/* Academic performance */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Academic performance</h2>
                            <MoreHorizontal
                                size={20}
                                color="#9ca3af"
                                cursor="pointer"
                            />
                        </div>
                        <div
                            className="chart-container"
                            style={{ height: "10rem" }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f3f4f6"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "#10b981" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="chart-tooltip">
                                <p>08/20</p>
                                <p>Average mark</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ستون سمت راست */}
            <div className="right-column">
                {/* Search */}
                <div className="search-box">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search"
                        className="search-input"
                    />
                </div>

                {/* Personal recommendations */}
                <div>
                    <h2 className="section-title">Personal recommendations</h2>
                    <div className="recommendation-card">
                        <div className="rec-icon-wrapper danger">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h3 className="rec-title">High stress level</h3>
                            <p className="rec-desc">
                                Personal psychological consultation recommended
                            </p>
                        </div>
                    </div>
                    <div className="recommendation-card">
                        <div className="rec-icon-wrapper success">
                            <XCircle size={20} />
                        </div>
                        <div>
                            <h3 className="rec-title">Afterschool programs</h3>
                            <p className="rec-desc">
                                A painter for art. Drawing classes recommended
                            </p>
                        </div>
                    </div>
                </div>

                {/* Medical history */}
                <div>
                    <h2 className="section-title">Medical history</h2>
                    <div className="history-card">
                        <div className="history-header">
                            <h3 className="history-title">Anxiety disorder</h3>
                            <span className="history-code">F41.9</span>
                        </div>
                        <p className="history-desc">
                            Personal consultation recommended
                        </p>
                        <div className="history-footer">
                            <span className="status-badge active">
                                <span className="status-dot"></span> Active
                            </span>
                            <button className="link-btn">
                                See full history <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="history-card">
                        <div className="history-header">
                            <h3 className="history-title">
                                Mild depressive episode
                            </h3>
                            <span className="history-code">F32.0</span>
                        </div>
                        <p className="history-desc">
                            End of last disease episode - 03/08/19
                        </p>
                        <div className="history-footer">
                            <span className="status-badge cured">
                                <span className="status-dot"></span> Cured
                            </span>
                            <button className="link-btn">
                                See full history <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="action-buttons">
                    <button className="btn-outline">Contact parents</button>
                    <button className="btn-primary">Consultation</button>
                </div>
            </div>
        </Layout>
    );
}
