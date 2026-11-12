import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "../Layouts/Layout";
import { ArrowRight } from "lucide-react";
import CategoryForm from "./Components/CategoryForm";
import "./Assets/css/Form.css";

export default function ServiceCategoriesCreate({ colors, icons }) {
    return (
        <AdminLayout>
            <Head title="ایجاد دسته‌بندی خدمت" />

            <div className="sc-form-page">
                <Link
                    href={route("admin.service-categories.index")}
                    className="sc-back-link"
                >
                    <ArrowRight size={16} />
                    بازگشت به لیست
                </Link>

                <CategoryForm mode="create" colors={colors} icons={icons} />
            </div>
        </AdminLayout>
    );
}
