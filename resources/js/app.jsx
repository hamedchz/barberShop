// import "./bootstrap";
import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
// import { SweetAlertProvider, SweetAlertFlash } from "./Components/StickyAlert";
import AlertProvider from "./Components/AlertProvider";

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx");
        return pages[`./Pages/${name}.jsx`]();
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            // <SweetAlertProvider>
            <AlertProvider>
                <App {...props} />
            </AlertProvider>,

            //   <SweetAlertFlash />
            //  </SweetAlertProvider>,
        );
    },
});
