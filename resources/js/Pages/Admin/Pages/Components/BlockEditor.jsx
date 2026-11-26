import BlockFields from "./BlockFields";
import { Settings2 } from "lucide-react";

export default function BlockEditor({
    section,
    index,
    sectionTypes,
    errors = {},
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
        <div className="builder-panel builder-editor">
            <div className="builder-panel-heading">
                <h3>{definition.label}</h3>
                <p>{definition.description}</p>
            </div>

            <div className="builder-editor-body">
                <BlockFields
                    type={section.type}
                    content={section.content ?? {}}
                    settings={section.settings ?? {}}
                    index={index}
                    errors={errors}
                    onContentChange={onContentChange}
                    onSettingsChange={onSettingsChange}
                />
            </div>
        </div>
    );
}
