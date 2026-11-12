import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "../Layouts/Layout";
import { ArrowRight, Package } from "lucide-react";
import CategoryForm from "./Components/CategoryForm";
import "./Assets/css/Form.css";

export default function ServiceCategoriesEdit({ category, colors, icons }) {
    return (
        <AdminLayout>
            <Head title={`ویرایش ${category.name}`} />

            <div className="sc-form-page">
                <Link
                    href={route("admin.service-categories.index")}
                    className="sc-back-link"
                >
                    <ArrowRight size={16} />
                    بازگشت به لیست
                </Link>

                {category.services_count > 0 && (
                    <div className="sc-form-notice">
                        <Package size={18} />
                        <p>
                            این دسته‌بندی دارای{" "}
                            <strong>{category.services_count} خدمت</strong> فعال
                            است. تغییرات بر همه آن‌ها اعمال می‌شود.
                        </p>
                    </div>
                )}

                <CategoryForm
                    mode="edit"
                    category={category}
                    colors={colors}
                    icons={icons}
                />
            </div>
        </AdminLayout>
    );
}
