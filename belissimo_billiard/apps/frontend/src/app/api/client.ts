import type { RefreshResponse } from "@shared/types";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/modules/auth/store/auth.store";

// Use relative URL since nginx proxies /api to backend
// If VITE_API_URL is set at build time, use it; otherwise use relative path
const baseURL =
	typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
		? `${import.meta.env.VITE_API_URL}/api`
		: "/api";

export const apiClient = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor - attach access token
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const accessToken = useAuthStore.getState().accessToken;
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor - handle 401 and auto-refresh
apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

		// If 401 and not a retry, try to refresh token
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			const refreshToken = useAuthStore.getState().refreshToken;

			if (refreshToken) {
				try {
					const response = await axios.post<RefreshResponse>(`${baseURL}/auth/refresh`, {
						refreshToken,
					});

					const { accessToken, refreshToken: newRefreshToken } = response.data.data;

					// Update store with new tokens
					useAuthStore.getState().setTokens(accessToken, newRefreshToken);

					// Retry original request with new token
					originalRequest.headers.Authorization = `Bearer ${accessToken}`;
					return apiClient(originalRequest);
				} catch {
					// Refresh failed - logout user
					useAuthStore.getState().logout();
					window.location.href = "/login";
					return Promise.reject(error);
				}
			} else {
				// No refresh token - logout
				useAuthStore.getState().logout();
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	}
);

export default apiClient;
