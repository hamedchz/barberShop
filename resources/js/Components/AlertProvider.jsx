import React, { createContext, useContext, useEffect, useRef } from "react";

import Swal from "sweetalert2";
import { router } from "@inertiajs/react";

const AlertContext = createContext(null);

const AlertProvider = ({ children }) => {
    const displayedFlashRef = useRef(null);

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

    const success = (title, text = "") => {
        return alert({
            title,
            text,
            icon: "success",
        });
    };

    const error = (title, text = "") => {
        return alert({
            title,
            text,
            icon: "error",
        });
    };

    const warning = (title, text = "") => {
        return alert({
            title,
            text,
            icon: "warning",
        });
    };

    const info = (title, text = "") => {
        return alert({
            title,
            text,
            icon: "info",
        });
    };

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

    const normalizeFlash = (flash, type = "info") => {
        if (!flash) {
            return null;
        }

        if (typeof flash === "string") {
            return {
                title: flash,
                text: "",
                type,
                toast: false,
                timer: null,
                position: "center",
                showConfirmButton: true,
                showCancelButton: false,
                confirmButtonText: "باشه",
                cancelButtonText: "انصراف",
            };
        }

        if (typeof flash === "object") {
            return {
                title: flash.title ?? "",
                text: flash.message ?? flash.text ?? "",
                type: flash.type ?? flash.icon ?? type,
                toast: flash.toast === true,
                timer: flash.timer ?? (flash.toast === true ? 3000 : null),
                position:
                    flash.position ??
                    (flash.toast === true ? "top-end" : "center"),
                showConfirmButton:
                    flash.showConfirmButton ?? flash.toast !== true,
                showCancelButton: flash.showCancelButton ?? false,
                confirmButtonText: flash.confirmButtonText ?? "باشه",
                cancelButtonText: flash.cancelButtonText ?? "انصراف",
            };
        }

        return null;
    };

    const showAlertData = (data) => {
        if (!data) {
            return;
        }

        if (data.toast === true) {
            Swal.fire({
                toast: true,
                position: data.position ?? "top-end",
                icon: data.type ?? "info",
                title: data.title ?? "",
                text: data.text ?? "",
                showConfirmButton: false,
                timer: data.timer ?? 3000,
                timerProgressBar: true,
                customClass: {
                    popup: "rtl-toast",
                },
            });

            return;
        }

        Swal.fire({
            title: data.title ?? "",
            text: data.text ?? "",
            icon: data.type ?? "info",
            confirmButtonText: data.confirmButtonText ?? "باشه",
            cancelButtonText: data.cancelButtonText ?? "انصراف",
            showConfirmButton: data.showConfirmButton ?? true,
            showCancelButton: data.showCancelButton ?? false,
            timer: data.timer ?? undefined,
            position: data.position ?? "center",
            reverseButtons: true,
            customClass: {
                popup: "rtl-alert",
            },
            buttonsStyling: true,
        });
    };

    const showFlash = (flash) => {
        if (!flash) {
            return;
        }

        if (flash.alert) {
            const alertData = normalizeFlash(
                flash.alert,
                flash.alert.type ?? "info",
            );

            if (alertData) {
                showAlertData(alertData);
                return;
            }
        }

        const types = ["success", "error", "warning", "info"];

        for (const type of types) {
            if (flash[type]) {
                const alertData = normalizeFlash(flash[type], type);

                if (alertData) {
                    showAlertData(alertData);
                    return;
                }
            }
        }
    };

    useEffect(() => {
        const removeListener = router.on("navigate", (event) => {
            const page = event.detail.page;

            const flash = page?.props?.flash;

            if (!flash) {
                return;
            }

            const flashKey = JSON.stringify(flash);

            if (displayedFlashRef.current === flashKey) {
                return;
            }

            displayedFlashRef.current = flashKey;

            showFlash(flash);
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
