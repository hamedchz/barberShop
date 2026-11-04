import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import PublicLayout from "../../Layouts/PublicLayout";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_DATA = [
    {
        category: "رزرو نوبت",
        questions: [
            {
                q: "چگونه نوبت رزرو کنم؟",
                a: "کافی است وارد صفحه آرایشگر موردنظر شوید، خدمت موردنظر را انتخاب کنید، تاریخ و ساعت را مشخص کنید و دکمه رزرو را بزنید.",
            },
            {
                q: "می‌توانم نوبتم را لغو کنم؟",
                a: "بله، تا ۲۴ ساعت قبل از موعد رزرو می‌توانید بدون جریمه لغو کنید.",
            },
        ],
    },
    {
        category: "پرداخت",
        questions: [
            {
                q: "روش‌های پرداخت چیست؟",
                a: "پرداخت از طریق درگاه‌های بانکی معتبر و همچنین کیف پول داخلی امکان‌پذیر است.",
            },
            {
                q: "آیا امکان بازگشت وجه وجود دارد؟",
                a: "بله، در صورت لغو توسط آرایشگر، مبلغ به‌طور کامل به کیف پول شما بازمی‌گردد.",
            },
        ],
    },
    {
        category: "حساب کاربری",
        questions: [
            {
                q: "چگونه ثبت‌نام کنم؟",
                a: "با کلیک روی دکمه ثبت‌نام و وارد کردن شماره موبایل، حساب کاربری خود را بسازید.",
            },
            {
                q: "رمز عبورم را فراموش کرده‌ام",
                a: "از صفحه ورود، روی «فراموشی رمز عبور» کلیک کنید و مراحل را دنبال کنید.",
            },
        ],
    },
];

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`faq-item ${isOpen ? "open" : ""}`}>
            <button
                type="button"
                className="faq-question"
                onClick={() => setIsOpen(!isOpen)}
            >
                <HelpCircle size={18} />
                <span>{question}</span>
                <ChevronDown
                    size={18}
                    className={`faq-chevron ${isOpen ? "rotated" : ""}`}
                />
            </button>
            {isOpen && (
                <div className="faq-answer">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
}

export default function FAQ() {
    return (
        <PublicLayout>
            <Head title="سوالات متداول" />

            <div className="page-hero">
                <div className="page-hero-content">
                    <h1>سوالات متداول</h1>
                    <p>پاسخ سوالات پرتکرار کاربران</p>
                </div>
            </div>

            <div className="page-container">
                <div className="faq-container">
                    {FAQ_DATA.map((category, idx) => (
                        <div key={idx} className="faq-category">
                            <h2 className="faq-category-title">
                                {category.category}
                            </h2>
                            <div className="faq-items">
                                {category.questions.map((item, qIdx) => (
                                    <FAQItem
                                        key={qIdx}
                                        question={item.q}
                                        answer={item.a}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="faq-cta">
                    <h3>سوال دیگری دارید؟</h3>
                    <p>تیم پشتیبانی ما آماده پاسخگویی است</p>
                    <a href={route("public.contact")} className="btn-primary">
                        تماس با ما
                    </a>
                </div>
            </div>
        </PublicLayout>
    );
}
