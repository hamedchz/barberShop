import React from "react";
import { Head, Link } from "@inertiajs/react";
import Layout from "../../Admin/Layouts/Layout";
import { LayoutDashboard, Calendar, Wallet, Star, Plus } from "lucide-react";
import WelcomeCard from "./Components/WelcomeCard";
import QuickStats from "./Components/QuickStats";
import NextBookingCard from "./Components/NextBookingCard";
import RecentTransactions from "./Components/RecentTransactions";
import RecentReviews from "./Components/RecentReviews";
import QuickActions from "./Components/QuickActions";
import "./Assets/css/Dashboard.css";

export default function CustomerDashboard({
    user,
    stats,
    nextBooking,
    recentTransactions,
    recentReviews,
}) {
    return (
        <Layout>
            <Head title="داشبورد" />

            <div className="customer-dashboard-page">
                {/* هدر خوش‌آمدگویی */}
                <WelcomeCard user={user} stats={stats} />

                {/* آمار سریع */}
                <QuickStats stats={stats} />

                {/* دکمه‌های سریع */}
                <QuickActions />

                {/* رزرو بعدی */}
                {nextBooking && <NextBookingCard booking={nextBooking} />}

                {/* دو ستون: تراکنش‌ها و نظرات */}
                <div className="dashboard-grid">
                    <RecentTransactions transactions={recentTransactions} />
                    <RecentReviews reviews={recentReviews} />
                </div>

                {/* دکمه شناور رزرو جدید */}
                <Link
                    href={route("user.barbers.index")}
                    className="floating-book-btn"
                    title="رزرو جدید"
                >
                    <Plus size={24} />
                    <span>رزرو جدید</span>
                </Link>
            </div>
        </Layout>
    );
}
