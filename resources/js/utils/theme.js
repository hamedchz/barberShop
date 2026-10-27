// resources/js/utils/theme.js

const getTintFromPrimary = (hex) => {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#E8F8F2";
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const tintR = Math.round(r * 0.1 + 255 * 0.9);
    const tintG = Math.round(g * 0.1 + 255 * 0.9);
    const tintB = Math.round(b * 0.1 + 255 * 0.9);
    return `#${tintR.toString(16).padStart(2, "0")}${tintG.toString(16).padStart(2, "0")}${tintB.toString(16).padStart(2, "0")}`;
};

const getHoverFromPrimary = (hex) => {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#0D9668";
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const hoverR = Math.round(r * 0.8);
    const hoverG = Math.round(g * 0.8);
    const hoverB = Math.round(b * 0.8);
    return `#${hoverR.toString(16).padStart(2, "0")}${hoverG.toString(16).padStart(2, "0")}${hoverB.toString(16).padStart(2, "0")}`;
};

export function applyThemeToDOM(primary, mode = "light") {
    const root = document.documentElement;

    const hover = getHoverFromPrimary(primary);
    const tint = getTintFromPrimary(primary);

    root.style.setProperty("--color-primary", primary);
    root.style.setProperty("--color-primary-hover", hover);
    root.style.setProperty("--color-primary-tint", tint);
    root.style.setProperty("--color-primary-light", `${primary}20`);
    root.style.setProperty("--color-primary-dark", hover);

    root.style.setProperty(
        "--gradient-primary",
        `linear-gradient(135deg, ${primary}, ${hover})`,
    );
    root.style.setProperty(
        "--gradient-primary-vertical",
        `linear-gradient(180deg, ${primary}, ${hover})`,
    );

    // حالت ظاهری
    if (mode === "dark") {
        root.classList.add("dark");
    } else if (mode === "light") {
        root.classList.remove("dark");
    } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }
}
