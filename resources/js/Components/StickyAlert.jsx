// src/lib/sweetalert.js
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";

// ایجاد نمونه‌ای از SweetAlert که از کامپوننت‌های React پشتیبانی می‌کند
export const MySwal = withReactContent(Swal);

// می‌توانید تنظیمات پیش‌فرض سراسری را اینجا اعمال کنید
// مثلاً تغییر رنگ دکمه تایید یا غیرفعال کردن انیمیشن‌ها
export const GlobalSwal = MySwal.mixin({
    confirmButtonColor: "#3B82F6",
    cancelButtonColor: "#EF4444",
    // سایر تنظیمات پیش‌فرض
});
