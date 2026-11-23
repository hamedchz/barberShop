import React, { createContext, useCallback, useContext, useState } from "react";

import AuthModal from "./AuthModal";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children, site }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState("login");

    const openAuthModal = useCallback((type = "login") => {
        setMode(type);
        setIsOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <AuthModalContext.Provider
            value={{
                openAuthModal,
                closeAuthModal,
            }}
        >
            {children}

            <AuthModal
                site={site}
                isOpen={isOpen}
                mode={mode}
                onClose={closeAuthModal}
            />
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);

    if (!context) {
        throw new Error("useAuthModal must be used inside AuthModalProvider");
    }

    return context;
}
