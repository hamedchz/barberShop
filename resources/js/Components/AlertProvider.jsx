import React, { createContext, useContext, useEffect } from "react";

import Swal from "sweetalert2";
import { router } from "@inertiajs/react";

// import "./alert.css";

const AlertContext = createContext(null);

const AlertProvider = ({ children }) => {
    /**
     * Show SweetAlert
     */
    const alert = ({
        title = "",
        text = "",
        icon = "info",
        confirmButtonText = "باشه",
        cancelButtonText = "انصراف",
        timer = null,
        showConfirmButton = true,
        showCancelButton = false,
        position = "center",
    } = {}) => {
        return Swal.fire({
            title,
            text,
            icon,

            confirmButtonText,
            cancelButtonText,

            showConfirmButton,
            showCancelButton,

            timer,

            position,

            reverseButtons: true,

            customClass: {
                popup: "rtl-alert",
            },

            buttonsStyling: true,
        });
    };

    /**
     * Success
     */
    const success = (title, text = "") => {
        return alert({
            title,
            text,
            icon: "success",
        });
    };

    /**
     * Error
     */
    const error = (title, text = "") => {
        return alert({
            title,
            text,
            icon: "error",
        });
    };

    /**
     * Warning
     */
    const warning = (title, text = "") => {
        return alert({
            title,
            text,
            icon: "warning",
        });
    };

    /**
     * Info
     */
    const info = (title, text = "") => {
        return alert({
            title,
            text,
            icon: "info",
        });
    };

    /**
     * Toast
     *
     * Example:
     *
     * toast({
     *     title: "عملیات موفق بود",
     *     type: "success",
     *     timer: 3000,
     *     position: "top-end"
     * });
     */
    const toast = ({
        title = "",
        type = "success",
        timer = 3000,
        position = "top-end",
    } = {}) => {
        return Swal.fire({
            toast: true,

            position,

            icon: type,

            title,

            showConfirmButton: false,

            timer,

            timerProgressBar: true,

            customClass: {
                popup: "rtl-toast",
            },
        });
    };

    /**
     * Confirm
     */
    const confirm = async ({
        title = "آیا مطمئن هستید؟",
        text = "",
        confirmButtonText = "بله",
        cancelButtonText = "انصراف",
        icon = "warning",
    } = {}) => {
        const result = await Swal.fire({
            title,
            text,

            icon,

            showCancelButton: true,

            confirmButtonText,
            cancelButtonText,

            reverseButtons: true,

            customClass: {
                popup: "rtl-alert",
            },
        });

        return result.isConfirmed;
    };

    /**
     * Laravel Flash Alert
     *
     * دریافت Alert از Response اینرتیا
     */
    useEffect(() => {
        const removeListener = router.on("navigate", (event) => {
            const page = event.detail.page;

            const alert = page?.props?.alert;

            if (!alert) {
                return;
            }

            /**
             * Laravel Toast
             */
            if (alert.toast === true) {
                Swal.fire({
                    toast: true,

                    position: alert.position ?? "top-end",

                    icon: alert.type ?? "success",

                    title: alert.title ?? "",

                    showConfirmButton: false,

                    timer: alert.timer ?? 3000,

                    timerProgressBar: true,

                    customClass: {
                        popup: "rtl-toast",
                    },
                });

                return;
            }

            /**
             * Laravel Normal Alert
             */
            Swal.fire({
                title: alert.title ?? "",

                text: alert.message ?? "",

                icon: alert.type ?? "info",

                confirmButtonText: alert.confirmButtonText ?? "باشه",

                cancelButtonText: alert.cancelButtonText ?? "انصراف",

                showConfirmButton: alert.showConfirmButton ?? true,

                showCancelButton: alert.showCancelButton ?? false,

                timer: alert.timer ?? undefined,

                position: alert.position ?? "center",

                reverseButtons: true,

                customClass: {
                    popup: "rtl-alert",
                },
            });
        });

        return () => {
            removeListener();
        };
    }, []);

    return (
        <AlertContext.Provider
            value={{
                alert,
                success,
                error,
                warning,
                info,
                toast,
                confirm,
            }}
        >
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);

    if (!context) {
        throw new Error("useAlert must be used inside AlertProvider");
    }

    return context;
};

export default AlertProvider;
