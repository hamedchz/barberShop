import axios from "axios";

const api = axios.create({
    baseURL: "http://barberApp.test/api",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// اضافه کردن توکن به هر درخواست
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
