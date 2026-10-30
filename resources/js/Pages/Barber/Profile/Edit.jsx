import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import { User, Lock, CreditCard, Wallet, Scissors } from "lucide-react";
import ProfileAvatar from "./Components/ProfileAvatar";
import PersonalInfoForm from "./Components/PersonalInfoForm";
import PasswordForm from "./Components/PasswordForm";
import BankInfoForm from "./Components/BankInfoForm";
import "./Assets/css/Profile.css";

export default function ProfileEdit({ user, bankInfo, banks = [] }) {
    const [activeTab, setActiveTab] = useState("personal");

    const tabs = [
        { key: "personal", label: "اطلاعات شخصی", icon: User },
        { key: "password", label: "تغییر رمز", icon: Lock },
        { key: "bank", label: "اطلاعات بانکی", icon: CreditCard },
    ];

    return (
        <Layout>
            <Head title="ویرایش پروفایل آرایشگر" />

            <div className="customer-profile-page">
                {/* هدر */}
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-header-icon">
                            <Scissors size={28} />
                        </div>
                        <div>
                            <h1>ویرایش پروفایل آرایشگر</h1>
                            <p>
                                مدیریت اطلاعات حساب کاربری و اطلاعات بانکی شما
                            </p>
                        </div>
                    </div>

                    {/* <div className="profile-header-actions">
                        <Link
                            href={route("barber.finance.wallet.index")}
                            className="btn-secondary"
                        >
                            <Wallet size={16} />
                            کیف پول
                        </Link>
                    </div> */}
                </div>

                {/* گرید */}
                <div className="profile-grid">
                    {/* سایدبار — آواتار */}
                    <div className="profile-sidebar">
                        <ProfileAvatar user={user} />
                    </div>

                    {/* محتوای اصلی */}
                    <div className="profile-main">
                        {/* تب‌ها */}
                        <div className="profile-tabs">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        className={`profile-tab ${
                                            activeTab === tab.key
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <Icon size={16} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* محتوا */}
                        <div className="profile-tab-content">
                            {activeTab === "personal" && (
                                <PersonalInfoForm user={user} />
                            )}
                            {activeTab === "password" && (
                                <PasswordForm user={user} />
                            )}
                            {activeTab === "bank" && (
                                <BankInfoForm
                                    bankInfo={bankInfo}
                                    banks={banks}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
