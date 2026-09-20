import { createContext, useContext, useEffect } from "react";
import Swal from "sweetalert2";
import { usePage } from "@inertiajs/react";

const SweetAlertContext = createContext(null);

export const SweetAlertProvider = ({ children }) => {
    const { flash } = usePage().props;

    const alert = ({
        icon = "info",
        title = "",
        text = "",
        html = "",
        confirmButtonText = "باشه",
        cancelButtonText = "انصراف",
        showCancelButton = false,
        ...options
    }) => {
        return Swal.fire({
            icon,
            title,
            text,
            html,
            confirmButtonText,
            cancelButtonText,
            showCancelButton,

            reverseButtons: true,

            customClass: {
                popup: "swal-rtl",
                confirmButton: "swal-confirm",
                cancelButton: "swal-cancel",
            },

            ...options,
        });
    };

    const success = (text, title = "موفق") => {
        return alert({
            icon: "success",
            title,
            text,
        });
    };

    const error = (text, title = "خطا") => {
        return alert({
            icon: "error",
            title,
            text,
        });
    };

    const warning = (text, title = "هشدار") => {
        return alert({
            icon: "warning",
            title,
            text,
        });
    };

    const info = (text, title = "اطلاعات") => {
        return alert({
            icon: "info",
            title,
            text,
        });
    };

    const confirm = ({
        title = "آیا مطمئن هستید؟",
        text = "این عملیات قابل بازگشت نیست.",
        confirmButtonText = "بله",
        cancelButtonText = "انصراف",
        icon = "warning",
    } = {}) => {
        return alert({
            icon,
            title,
            text,
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Laravel Flash Messages
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (flash?.success) {
            success(flash.success);
        }

        if (flash?.error) {
            error(flash.error);
        }

        if (flash?.warning) {
            warning(flash.warning);
        }

        if (flash?.info) {
            info(flash.info);
        }
    }, [flash]);

    return (
        <SweetAlertContext.Provider
            value={{
                alert,
                success,
                error,
                warning,
                info,
                confirm,
            }}
        >
            {children}
        </SweetAlertContext.Provider>
    );
};

export const useSweetAlert = () => {
    const context = useContext(SweetAlertContext);

    if (!context) {
        throw new Error("useSweetAlert must be used inside SweetAlertProvider");
    }

    return context;
};
