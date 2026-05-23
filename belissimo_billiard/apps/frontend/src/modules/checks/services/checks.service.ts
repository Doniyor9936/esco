import apiClient from "@/app/api/client";
import type { Check, CreateCheckDto, PayCheckDto } from "../types";

export const checksService = {
	async create(data: CreateCheckDto): Promise<Check> {
		const response = await apiClient.post<Check>("/checks", data);
		return response.data;
	},

	async getById(id: string): Promise<Check> {
		const response = await apiClient.get<Check>(`/checks/${id}`);
		return response.data;
	},

	async pay(id: string, data: PayCheckDto): Promise<Check> {
		const response = await apiClient.post<Check>(`/checks/${id}/pay`, data);
		return response.data;
	},
};
