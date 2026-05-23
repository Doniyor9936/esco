import apiClient from "@/app/api/client";
import type {
	CreateTableDto,
	Table,
	TablesQueryParams,
	TablesResponse,
	UpdateTableDto,
} from "../types";

export const tablesService = {
	async getAll(params?: TablesQueryParams): Promise<TablesResponse> {
		const response = await apiClient.get<TablesResponse>("/tables", { params });
		return response.data;
	},

	async create(data: CreateTableDto): Promise<Table> {
		const response = await apiClient.post<Table>("/tables", data);
		return response.data;
	},

	async update(id: string, data: UpdateTableDto): Promise<Table> {
		const response = await apiClient.put<Table>(`/tables/${id}`, data);
		return response.data;
	},

	async remove(id: string): Promise<void> {
		await apiClient.delete(`/tables/${id}`);
	},
};
