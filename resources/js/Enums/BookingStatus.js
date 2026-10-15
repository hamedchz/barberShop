export const BookingStatus = Object.freeze({
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
});

export const BookingStatusLabels = Object.freeze({
    [BookingStatus.PENDING]: "در انتظار تأیید",
    [BookingStatus.CONFIRMED]: "تأیید شده",
    [BookingStatus.COMPLETED]: "تکمیل شده",
    [BookingStatus.CANCELLED]: "لغو شده",
});

export const getBookingStatusLabel = (status) => {
    return BookingStatusLabels[status] ?? "نامشخص";
};
