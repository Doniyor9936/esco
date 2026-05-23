import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { tablesService } from "../services/tables.service";
import type { CreateTableDto, TablesQueryParams, UpdateTableDto } from "../types";

export const tablesKeys = {
	all: ["tables"] as const,
	list: (params?: TablesQueryParams) => [...tablesKeys.all, "list", params] as const,
};

export function useTables(params?: TablesQueryParams) {
	return useQuery({
		queryKey: tablesKeys.list(params),
		queryFn: () => tablesService.getAll(params),
		staleTime: 30_000,
		refetchInterval: 60_000,
	});
}

export function useCreateTable() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTableDto) => tablesService.create(data),
		onSuccess: (t) => {
			qc.invalidateQueries({ queryKey: tablesKeys.all });
			message.success(`"${t.name}" muvaffaqiyatli qo'shildi`);
		},
		onError: () => message.error("Stol yaratishda xatolik yuz berdi"),
	});
}

export function useUpdateTable() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateTableDto }) =>
			tablesService.update(id, data),
		onSuccess: (t) => {
			qc.invalidateQueries({ queryKey: tablesKeys.all });
			message.success(`"${t.name}" yangilandi`);
		},
		onError: () => message.error("Yangilashda xatolik yuz berdi"),
	});
}

export function useDeleteTable() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => tablesService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: tablesKeys.all });
			message.success("Stol o'chirildi");
		},
		onError: () => message.error("O'chirishda xatolik yuz berdi"),
	});
}
