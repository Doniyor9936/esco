import apiClient from "@/app/api/client";
import type {
	CreateSessionDto,
	Session,
	SessionsListResponse,
	SessionsQueryParams,
	UpdateDiscountDto,
	UpdateRateDto,
} from "../types/sessions.types";

export const sessionsService = {
	async getAll(params?: SessionsQueryParams): Promise<SessionsListResponse> {
		const response = await apiClient.get<SessionsListResponse>("/sessions", { params });
		return response.data;
	},

	async getById(id: string): Promise<Session> {
		const response = await apiClient.get<Session>(`/sessions/${id}`);
		return response.data;
	},

	// Stol bo'yicha aktiv sessiyani olish
	async getActiveByTable(tableId: string): Promise<Session | null> {
		const response = await apiClient.get<SessionsListResponse>("/sessions", {
			params: { tableId, status: "active", limit: 1, page: 1 },
		});
		return response.data.data[0] ?? null;
	},

	async create(data: CreateSessionDto): Promise<Session> {
		const response = await apiClient.post<Session>("/sessions", data);
		return response.data;
	},

	async pause(id: string): Promise<Session> {
		const response = await apiClient.post<Session>(`/sessions/${id}/pause`);
		return response.data;
	},

	async resume(id: string): Promise<Session> {
		const response = await apiClient.post<Session>(`/sessions/${id}/resume`);
		return response.data;
	},

	async updateRate(id: string, data: UpdateRateDto): Promise<Session> {
		const response = await apiClient.patch<Session>(`/sessions/${id}/rate`, data);
		return response.data;
	},

	async updateDiscount(id: string, data: UpdateDiscountDto): Promise<Session> {
		const response = await apiClient.patch<Session>(`/sessions/${id}/discount`, data);
		return response.data;
	},

	async close(id: string): Promise<Session> {
		const response = await apiClient.post<Session>(`/sessions/${id}/close`);
		return response.data;
	},

	async cancel(id: string): Promise<Session> {
		const response = await apiClient.post<Session>(`/sessions/${id}/cancel`);
		return response.data;
	},
};
