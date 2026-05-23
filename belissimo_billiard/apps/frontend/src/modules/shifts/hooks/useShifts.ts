import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useState } from "react";
import { shiftsService } from "../services/shifts.service";
import type { CashTransactionDto, OpenShiftDto, PaymentMethod, ShiftWithStats } from "../types";

export const shiftKeys = {
	all: ["shifts"] as const,
	active: ["shifts", "active"] as const,
	operations: (id: string) => ["shifts", "operations", id] as const,
	payments: (id: string) => ["shifts", "payments", id] as const,
	xReport: (id: string) => ["shifts", "x-report", id] as const,
	summary: (id: string) => ["shifts", "summary", id] as const,
};

export function useActiveShift() {
	return useQuery({
		queryKey: shiftKeys.active,
		queryFn: () => shiftsService.getActive(),
		staleTime: 30_000,
		retry: false,
	});
}

export function useXReport(id: string) {
	return useQuery({
		queryKey: shiftKeys.xReport(id),
		queryFn: () => shiftsService.xReport(id),
		enabled: !!id,
	});
}

export function useShiftSummary(shiftId: string) {
	return useQuery({
		queryKey: shiftKeys.summary(shiftId),
		queryFn: () => shiftsService.getShiftSummary(shiftId),
		enabled: !!shiftId,
		staleTime: Infinity,
	});
}

export function useOpenShift() {
	const { message } = App.useApp();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data?: OpenShiftDto) => shiftsService.open(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: shiftKeys.all });
			message.success("Smena muvaffaqiyatli ochildi!");
		},
		onError: () => message.error("Smena ochishda xatolik yuz berdi"),
	});
}

export function useCashTransaction() {
	const { message } = App.useApp();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: CashTransactionDto }) =>
			shiftsService.cash(id, data),
		onSuccess: (_, { data }) => {
			qc.invalidateQueries({ queryKey: shiftKeys.active });
			message.success(data.type === "kirim" ? "Kirim amalga oshirildi" : "Chiqim amalga oshirildi");
		},
		onError: () => message.error("Tranzaksiyada xatolik yuz berdi"),
	});
}

// ─── CLOSE — yopilgandan keyin closedShiftData saqlanadi ─────
// ShiftView shu datani ko'rib chekni render qiladi → window.print()
export function useCloseShift() {
	const { message } = App.useApp();
	const qc = useQueryClient();
	const [closedShiftData, setClosedShiftData] = useState<ShiftWithStats | null>(null);

	const mutation = useMutation({
		mutationFn: (id: string) => shiftsService.close(id),
		onSuccess: (data) => {
			setClosedShiftData(data);
			qc.invalidateQueries({ queryKey: shiftKeys.all });
			message.success("Smena yopildi");
		},
		onError: () => message.error("Smenani yopishda xatolik yuz berdi"),
	});

	return {
		...mutation,
		closedShiftData,
		clearClosedShift: () => setClosedShiftData(null),
	};
}

export function useShiftOperations(id: string) {
	return useQuery({
		queryKey: shiftKeys.operations(id),
		queryFn: () => shiftsService.getOperations(id),
		enabled: !!id,
		refetchInterval: 30_000,
	});
}

export function useShiftPayments(shiftId: string) {
	return useQuery({
		queryKey: shiftKeys.payments(shiftId),
		queryFn: () => shiftsService.getPayments(shiftId),
		enabled: !!shiftId,
		refetchInterval: 30_000,
	});
}

export function useChangePaymentMethod() {
	const { message } = App.useApp();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			paymentId,
			method,
		}: {
			paymentId: string;
			shiftId: string;
			method: PaymentMethod;
		}) => shiftsService.changePaymentMethod(paymentId, { paymentMethod: method }),
		onSuccess: (_, { shiftId }) => {
			qc.invalidateQueries({ queryKey: shiftKeys.payments(shiftId) });
			message.success("To'lov usuli o'zgartirildi");
		},
		onError: () => message.error("To'lov usulini o'zgartirishda xatolik"),
	});
}
export function useLastClosedShift() {
	return useQuery({
		queryKey: ["shifts", "last-closed"],
		queryFn: () => shiftsService.getLastClosed(),
		staleTime: 60_000,
	});
}
