import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { settingsService } from "../services/settings.service";
import type { CreateSettingsTableDto, UpdateSettingsDto, UpdateSettingsTableDto } from "../types";

export const settingsKeys = {
	all: ["settings"] as const,
	global: ["settings", "global"] as const,
	tables: ["settings", "tables"] as const,
};

// ─── GET SETTINGS ────────────────────────────────────────────
export function useSettings() {
	return useQuery({
		queryKey: settingsKeys.global,
		queryFn: () => settingsService.get(),
		staleTime: 60_000,
	});
}

// ─── UPDATE SETTINGS ─────────────────────────────────────────
export function useUpdateSettings() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateSettingsDto) => settingsService.update(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.global });
			message.success("Sozlamalar saqlandi");
		},
		onError: () => message.error("Saqlashda xatolik yuz berdi"),
	});
}

// ─── GET TABLES ──────────────────────────────────────────────
export function useSettingsTables() {
	return useQuery({
		queryKey: settingsKeys.tables,
		queryFn: () => settingsService.getTables(),
		staleTime: 30_000,
	});
}

// ─── CREATE TABLE ────────────────────────────────────────────
export function useCreateSettingsTable() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateSettingsTableDto) => settingsService.createTable(data),
		onSuccess: (t) => {
			qc.invalidateQueries({ queryKey: settingsKeys.tables });
			qc.invalidateQueries({ queryKey: ["tables"] });
			message.success(`"${t.name}" qo'shildi`);
		},
		onError: () => message.error("Stol qo'shishda xatolik"),
	});
}

// ─── UPDATE TABLE ────────────────────────────────────────────
export function useUpdateSettingsTable() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateSettingsTableDto }) =>
			settingsService.updateTable(id, data),
		onSuccess: (t) => {
			qc.invalidateQueries({ queryKey: settingsKeys.tables });
			qc.invalidateQueries({ queryKey: ["tables"] });
			message.success(`"${t.name}" yangilandi`);
		},
		onError: () => message.error("Yangilashda xatolik"),
	});
}

// ─── DELETE TABLE ────────────────────────────────────────────
export function useDeleteSettingsTable() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => settingsService.deleteTable(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: settingsKeys.tables });
			qc.invalidateQueries({ queryKey: ["tables"] });
			message.success("Stol o'chirildi");
		},
		onError: () => message.error("O'chirishda xatolik"),
	});
}
