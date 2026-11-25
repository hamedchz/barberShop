import { usePage } from "@inertiajs/react";
import PageForm from "./Form";

export default function Edit() {
    const { page, sectionTypes } = usePage().props;

    return <PageForm mode="edit" page={page} sectionTypes={sectionTypes} />;
}
