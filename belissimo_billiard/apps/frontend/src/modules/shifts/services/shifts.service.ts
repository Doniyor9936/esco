import apiClient from "@/app/api/client";
// PaymentMethod ni re-export qilamiz — service ichida ishlatilgani uchun
import type {
	CashTransaction,
	CashTransactionDto,
	ClosedShiftDetail,
	OpenShiftDto,
	PaymentMethod,
	Shift,
	ShiftOperation,
	ShiftPayment,
	ShiftSummaryReport,
	ShiftWithStats,
} from "../types";

export const shiftsService = {
	async getActive(): Promise<ShiftWithStats> {
		const response = await apiClient.get<ShiftWithStats>("/shifts/active");
		return response.data;
	},

	// ─── Shift by ID (yopilgan smena ma'lumotlari) ───────────
	async getShiftById(id: string): Promise<ClosedShiftDetail> {
		// startDate/endDate parametrlarini umuman bermang
		const response = await apiClient.get<ClosedShiftDetail[]>("/shifts");
		const found = response.data.find((s) => s.id === id);
		if (!found) {
			throw new Error(`Shift ${id} not found`);
		}
		return found;
	},

	// ─── Summary report (yopilish vaqtidagi hisobot) ─────────
	async getShiftSummary(shiftId: string): Promise<ShiftSummaryReport> {
		const response = await apiClient.get<ShiftSummaryReport>("/reports/summary", {
			params: { shiftId },
		});
		return response.data;
	},

	async open(data?: OpenShiftDto): Promise<Shift> {
		const response = await apiClient.post<Shift>("/shifts/open", data ?? {});
		return response.data;
	},

	async cash(id: string, data: CashTransactionDto): Promise<CashTransaction> {
		const response = await apiClient.post<CashTransaction>(`/shifts/${id}/cash`, data);
		return response.data;
	},

	async close(id: string): Promise<ShiftWithStats> {
		const response = await apiClient.post<ShiftWithStats>(`/shifts/${id}/close`);
		return response.data;
	},

	async xReport(id: string): Promise<ShiftWithStats> {
		const response = await apiClient.get<ShiftWithStats>(`/shifts/${id}/x-report`);
		return response.data;
	},

	async getOperations(id: string): Promise<ShiftOperation[]> {
		const response = await apiClient.get<ShiftOperation[]>(`/shifts/${id}/operations`);
		return response.data;
	},

	async getPayments(shiftId: string): Promise<ShiftPayment[]> {
		const response = await apiClient.get<ShiftPayment[]>(`/payments/shift/${shiftId}`);
		return response.data;
	},

	async changePaymentMethod(
		paymentId: string,
		data: { paymentMethod: PaymentMethod }
	): Promise<ShiftPayment> {
		const response = await apiClient.patch<ShiftPayment>(`/payments/${paymentId}/change`, data);
		return response.data;
	},
	async getLastClosed(): Promise<Shift | null> {
		const response = await apiClient.get<Shift[]>("/shifts");
		const closed = response.data
			.filter((s) => s.status === "closed")
			.sort((a, b) => new Date(b.closedAt!).getTime() - new Date(a.closedAt!).getTime());
		return closed[0] ?? null;
	},
};
