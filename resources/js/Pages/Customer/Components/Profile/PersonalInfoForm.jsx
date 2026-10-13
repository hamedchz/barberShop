import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    User,
    Mail,
    MapPin,
    Calendar,
    Save,
    AlertCircle,
    Info,
} from "lucide-react";
import { toPersianNumber } from "../../../../utils/persianNumbers";
import PersianDatePicker from "../../../../Components/PersianDatePicker";
const genderOptions = [
    { value: "", label: "انتخاب کنید" },
    { value: "male", label: "مرد" },
    { value: "female", label: "زن" },
    { value: "other", label: "سایر" },
];

export default function PersonalInfoForm({ user }) {
    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        address: user.address || "",
        city: user.city || "",
        birth_date: user.birth_date || "",
        gender: user.gender || "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        router.put(route("customer.profile.update"), formData, {
            preserveScroll: true,
            onSuccess: () => setIsLoading(false),
            onError: (errs) => {
                setErrors(errs);
                setIsLoading(false);
            },
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <div className="card-icon-box blue">
                    <User size={20} />
                </div>
                <h2>اطلاعات شخصی</h2>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                {/* نام */}
                <div className="form-group">
                    <label>
                        <User size={14} />
                        نام و نام خانوادگی
                        <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        className={`form-input ${errors.name ? "error" : ""}`}
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            setErrors({ ...errors, name: undefined });
                        }}
                        placeholder="مثلاً: علی رضایی"
                    />
                    {errors.name && (
                        <span className="form-error">
                            <AlertCircle size={12} />
                            {errors.name}
                        </span>
                    )}
                </div>

                {/* ایمیل */}
                <div className="form-group">
                    <label>
                        <Mail size={14} />
                        ایمیل
                        <span className="required">*</span>
                    </label>
                    <input
                        type="email"
                        className={`form-input ltr ${
                            errors.email ? "error" : ""
                        }`}
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            setErrors({ ...errors, email: undefined });
                        }}
                        placeholder="example@email.com"
                        dir="ltr"
                    />
                    {errors.email && (
                        <span className="form-error">
                            <AlertCircle size={12} />
                            {errors.email}
                        </span>
                    )}
                </div>

                {/* شماره تماس (غیرقابل ویرایش) */}
                <div className="form-group">
                    <label>شماره موبایل</label>
                    <div className="form-input readonly">
                        <span dir="ltr">{toPersianNumber(user.phone)}</span>
                        <span className="readonly-badge">
                            <AlertCircle size={12} />
                            برای تغییر با پشتیبانی تماس بگیرید
                        </span>
                    </div>
                </div>

                {/* تاریخ تولد و جنسیت */}
                <div className="form-row">
                    <div className="form-group">
                        {/* <label>
                            <Calendar size={14} />
                            تاریخ تولد
                        </label> */}
                        <PersianDatePicker
                            label="تاریخ تولد"
                            value={formData.birth_date}
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    birth_date: value,
                                }))
                            }
                            placeholder="انتخاب تاریخ تولد"
                            maxDate={new Date()}
                        />
                    </div>

                    <div className="form-group">
                        <label>جنسیت</label>
                        <select
                            className="form-input"
                            value={formData.gender}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    gender: e.target.value,
                                })
                            }
                        >
                            {genderOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* شهر */}
                {/* <div className="form-group">
                    <label>
                        <MapPin size={14} />
                        شهر
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.city}
                        onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="مثلاً: تهران"
                    />
                </div> */}

                {/* آدرس */}
                {/* <div className="form-group">
                    <label>
                        <MapPin size={14} />
                        آدرس
                    </label>
                    <textarea
                        className="form-textarea"
                        value={formData.address}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                address: e.target.value,
                            })
                        }
                        placeholder="آدرس دقیق..."
                        rows={3}
                    />
                </div> */}

                {/* بیوگرافی */}
                {/* <div className="form-group">
                    <label>درباره من</label>
                    <textarea
                        className="form-textarea"
                        value={formData.bio}
                        onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="چند خط درباره خودتان..."
                        rows={4}
                        maxLength={500}
                    />
                    <span className="form-hint">
                        {toPersianNumber(formData.bio.length)} / ۵۰۰ کاراکتر
                    </span>
                </div> */}

                {/* دکمه ذخیره */}
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            در حال ذخیره...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            ذخیره تغییرات
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
