export const UserWarningType = Object.freeze({
    customerRude: "customer_rude",
    falseReview: "false_review",
    rude_behavior: "rude_behavior",
});

export const UserWarningTypeLabels = Object.freeze({
    [UserWarningType.customerRude]: "اهانت مشتری",
    [UserWarningType.falseReview]: "دیدگاه نادرست",
    [UserWarningType.rude_behavior]: "رفتار نامناسب",
});

export const getUserWarningTypeLabel = (status) => {
    return UserWarningTypeLabels[status] ?? "نامشخص";
};
