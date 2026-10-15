import { toPersianNumber } from "../utils/persianNumbers";

export const formatCompactNumber = (value) => {
    const amount = Number(value || 0);

    const format = (divisor, suffix) => {
        const result = Math.floor((amount / divisor) * 10) / 10;

        return `${toPersianNumber(
            result.toLocaleString("en-US", {
                maximumFractionDigits: 1,
                useGrouping: false,
            }),
        )}${suffix}`;
    };

    if (amount >= 1_000_000_000_000) {
        return format(1_000_000_000_000, "T");
    }

    if (amount >= 1_000_000_000) {
        return format(1_000_000_000, "B");
    }

    if (amount >= 1_000_000) {
        return format(1_000_000, "M");
    }

    if (amount >= 1_000) {
        return format(1_000, "K");
    }

    return toPersianNumber(amount.toLocaleString("en-US"));
};
