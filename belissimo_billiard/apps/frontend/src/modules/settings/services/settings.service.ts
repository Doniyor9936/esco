import apiClient from "@/app/api/client";
import type {
	CreateSettingsTableDto,
	Settings,
	SettingsTable,
	UpdateSettingsDto,
	UpdateSettingsTableDto,
} from "../types";

export const settingsService = {
	// ─── General settings ──────────────────────────────────────
	async get(): Promise<Settings> {
		const response = await apiClient.get<Settings>("/settings");
		return response.data;
	},

	async update(data: UpdateSettingsDto): Promise<Settings> {
		const response = await apiClient.patch<Settings>("/settings", data);
		return response.data;
	},

	// ─── Tables ────────────────────────────────────────────────
	async getTables(): Promise<SettingsTable[]> {
		const response = await apiClient.get<SettingsTable[]>("/settings/tables");
		return response.data;
	},

	async createTable(data: CreateSettingsTableDto): Promise<SettingsTable> {
		const response = await apiClient.post<SettingsTable>("/settings/tables", data);
		return response.data;
	},

	async updateTable(tableId: string, data: UpdateSettingsTableDto): Promise<SettingsTable> {
		const response = await apiClient.patch<SettingsTable>(`/settings/tables/${tableId}`, data);
		return response.data;
	},

	async deleteTable(tableId: string): Promise<void> {
		await apiClient.delete(`/settings/tables/${tableId}`);
	},
};
