import {
    LayoutTemplate,
    Type,
    Image,
    Images,
    Star,
    Users,
    Phone,
    MapPin,
    MessageSquare,
    Minus,
    Plus,
} from "lucide-react";

const blockIcons = {
    hero: LayoutTemplate,
    text: Type,
    image_text: Image,
    gallery: Images,
    features: Star,
    team: Users,
    contact_info: Phone,
    map: MapPin,
    contact_form: MessageSquare,
    divider: Minus,
};

export default function BlockLibrary({ sectionTypes = {}, onAdd }) {
    return (
        <div className="builder-panel">
            <div className="builder-panel-heading">
                <h3>افزودن بخش</h3>
                <p>بخش موردنظر را انتخاب کنید.</p>
            </div>

            <div className="builder-block-library">
                {Object.entries(sectionTypes).map(([type, definition]) => {
                    const Icon = blockIcons[type] ?? LayoutTemplate;

                    return (
                        <button
                            type="button"
                            key={type}
                            className="builder-library-item"
                            onClick={() => onAdd(type)}
                        >
                            <span className="builder-library-icon">
                                <Icon size={21} />
                            </span>

                            <span className="builder-library-text">
                                <strong>{definition.label}</strong>
                                <small>{definition.description}</small>
                            </span>

                            <Plus size={17} className="builder-library-add" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
