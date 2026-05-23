import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { checksService } from "../services/checks.service";
import type { CreateCheckDto, PayCheckDto } from "../types";

export const checkKeys = {
	all: ["checks"] as const,
	byId: (id: string) => ["checks", id] as const,
};

// ─── GET BY ID ───────────────────────────────────────────────
export function useCheck(id: string) {
	return useQuery({
		queryKey: checkKeys.byId(id),
		queryFn: () => checksService.getById(id),
		enabled: !!id,
		staleTime: 10_000,
	});
}

// ─── CREATE ──────────────────────────────────────────────────
export function useCreateCheck() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCheckDto) => checksService.create(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: checkKeys.all });
			message.success("Chek muvaffaqiyatli yaratildi");
		},
		onError: () => message.error("Chek yaratishda xatolik yuz berdi"),
	});
}

// ─── PAY ─────────────────────────────────────────────────────
export function usePayCheck() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: PayCheckDto }) => checksService.pay(id, data),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: checkKeys.byId(id) });
			qc.invalidateQueries({ queryKey: checkKeys.all });
			message.success("To'lov muvaffaqiyatli amalga oshirildi");
		},
		onError: () => message.error("To'lovda xatolik yuz berdi"),
	});
}
