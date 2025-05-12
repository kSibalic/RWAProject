export const BASE_URL = "http://localhost:8000";

// utils/apiPaths.js
export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GET_PROFILE: "/api/auth/profile",
    },

    USERS: {
        GET_ALL_USERS: "/api/users",
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
        CREATE_USER: "/api/users",
        UPDATE_USER: `/api/users/${userId}`,
        DELETE_UESR: `/api/users/${userId}`,
    },

    CHORES: {
        GET_DASHBOARD_DATA: "/api/chores/dashboard-data",
        GET_USER_DASHBOARD_DATA: "/api/chores/user-dashboard-data",
        GET_ALL_CHORES: "/api/chores",
        GET_CHORE_BY_ID: (choreId) => `/api/chores/${choreId}`,
        CREATE_CHORE: "/api/chores",
        UPDATE_TASK: (choreId) => `/api/chores/${choreId}`,
        DELETE_CHORE: (choreId) => `/api/chores/${choreId}`,
        UPDATE_CHORE_STATUS: (choreId) => `/api/chores/${choreId}/status`,
        UPDATE_TODO_CHECKLIST: (choreId) => `/api/chores/${choreId}/todo`,
    },

    REPORTS: {
        EXPORT_CHORES: "/api/reports/export/chores",
        EXPORT_USERS: "api/reports/export/users",
    },

    IMAGE: {
        UPLOAD_IMAGE: "api/auth/upload-image",
    },
};