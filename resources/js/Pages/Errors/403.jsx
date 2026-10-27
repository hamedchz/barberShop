import React from "react";
import { usePage } from "@inertiajs/react";
import ErrorPage from "./ErrorPage";

export default function Error403() {
    const { site } = usePage().props;
    return <ErrorPage status={403} site={site} />;
}
