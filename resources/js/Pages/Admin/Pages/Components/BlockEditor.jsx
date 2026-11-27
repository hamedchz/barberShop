import BlockFields from "./BlockFields";
import { Settings2 } from "lucide-react";

export default function BlockEditor({
    pageId,
    section,
    sectionTypes = {},
    onContentChange,
    onSettingsChange,
}) {
    if (!section) {
        return (
            <div className="builder-editor-empty">
                <Settings2 size={32} />
                <h3>ویرایش بخش</h3>
                <p>برای ویرایش محتوا، یکی از بخش‌های صفحه را انتخاب کنید.</p>
            </div>
        );
    }

    const definition = sectionTypes[section.type];

    if (!definition) return null;

    return (
        <BlockFields
            pageId={pageId}
            type={section.type}
            content={section.content}
            settings={section.settings}
            onContentChange={onContentChange}
            onSettingsChange={onSettingsChange}
        />
    );
}
