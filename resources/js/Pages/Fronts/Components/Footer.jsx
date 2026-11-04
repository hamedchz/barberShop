import React from "react";
import { Link } from "@inertiajs/react";
import {
    Scissors,
    Camera,
    Send,
    Phone,
    MapPin,
    Clock3,
    ArrowUpLeft,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="front-footer" id="contact">
            <div className="front-container">
                <div className="front-footer-main">
                    <div className="front-footer-about">
                        <Link
                            href="/"
                            className="front-brand front-footer-brand"
                        >
                            <span className="front-brand-icon">
                                <Scissors size={23} />
                            </span>

                            <span className="front-brand-text">
                                <strong>BARBER</strong>
                                <small>STUDIO</small>
                            </span>
                        </Link>

                        <p>
                            تجربه‌ای متفاوت از آراستگی و زیبایی؛ انتخاب
                            حرفه‌ای‌ها برای داشتن ظاهری خاص و آراسته.
                        </p>

                        <div className="front-social-links">
                            <a href="#" aria-label="اینستاگرام">
                                <Camera size={18} />
                            </a>
                            <a href="#" aria-label="تلگرام">
                                <Send size={18} />
                            </a>
                        </div>
                    </div>

                    <div className="front-footer-column">
                        <h3>دسترسی سریع</h3>
                        <a href="#home">صفحه اصلی</a>
                        <a href="#services">خدمات ما</a>
                        <a href="#barbers">آرایشگران</a>
                        <a href="#about">درباره ما</a>
                    </div>

                    <div className="front-footer-column">
                        <h3>خدمات مشتریان</h3>
                        <a href="#booking">رزرو نوبت</a>
                        <a href="/auth/login">ورود به حساب</a>
                        <a href="#contact">تماس با ما</a>
                    </div>

                    <div className="front-footer-column front-footer-contact">
                        <h3>اطلاعات تماس</h3>

                        <div>
                            <Phone size={17} />
                            <span>شماره تماس مجموعه</span>
                        </div>

                        <div>
                            <MapPin size={17} />
                            <span>آدرس آرایشگاه</span>
                        </div>

                        <div>
                            <Clock3 size={17} />
                            <span>ساعات کاری مجموعه</span>
                        </div>
                    </div>
                </div>

                <div className="front-footer-bottom">
                    <span>تمامی حقوق این وب‌سایت محفوظ است.</span>

                    <a href="#home" className="front-back-to-top">
                        بازگشت به بالا
                        <ArrowUpLeft size={16} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
