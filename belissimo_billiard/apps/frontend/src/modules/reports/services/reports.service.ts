import apiClient from "@/app/api/client";
import type {
	OrderStats,
	PaymentStats,
	ReportParams,
	ReportSummary,
	RevenuePoint,
	Shift,
	ShiftReport,
	TableOccupancy,
	TableRevenue,
	TopProduct,
} from "../types";

// ─── Query Builder ────────────────────────────────────────────

function buildQueryParams(params?: ReportParams): Record<string, string> {
	if (!params) {
		return {};
	}

	const today = new Date();
	const fmt = (d: Date) => d.toISOString().slice(0, 10);
	const result: Record<string, string> = {};

	if (params.cashierId) {
		result.cashierId = params.cashierId;
	}

	if (params.shiftId) {
		result.shiftId = params.shiftId;
		if (params.shiftOpenedAt) {
			result.from = params.shiftOpenedAt.slice(0, 10);
			result.to = params.shiftClosedAt ? params.shiftClosedAt.slice(0, 10) : fmt(today);
		}
		return result;
	}

	if (params.from && params.to) {
		result.from = params.from.slice(0, 10);
		result.to = params.to.slice(0, 10);
		return result;
	}

	const to = fmt(today);
	if (params.period === "daily") {
		result.from = to;
		result.to = to;
	} else if (params.period === "weekly") {
		const from = new Date(today);
		from.setDate(from.getDate() - 6);
		result.from = fmt(from);
		result.to = to;
	} else if (params.period === "monthly") {
		result.from = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
		result.to = to;
	}

	return result;
}

// ─── Reports Service ──────────────────────────────────────────

export const reportsService = {
	async getSummary(params?: ReportParams): Promise<ReportSummary> {
		const res = await apiClient.get<ReportSummary>("/reports/summary", {
			params: buildQueryParams(params),
		});
		return res.data;
	},

	async getRevenue(params?: ReportParams): Promise<RevenuePoint[]> {
		const res = await apiClient.get<RevenuePoint[]>("/reports/revenue", {
			params: buildQueryParams(params),
		});
		return res.data;
	},

	async getTablesOccupancy(params?: ReportParams): Promise<TableOccupancy[]> {
		const res = await apiClient.get<TableOccupancy[]>("/reports/tables/occupancy", {
			params: buildQueryParams(params),
		});
		return res.data;
	},

	async getTablesRevenue(params?: ReportParams): Promise<TableRevenue[]> {
		const res = await apiClient.get<TableRevenue[]>("/reports/tables/revenue", {
			params: buildQueryParams(params),
		});
		return res.data;
	},

	async getPayments(params?: ReportParams): Promise<PaymentStats> {
		const res = await apiClient.get<PaymentStats>("/reports/payments", {
			params: buildQueryParams(params),
		});
		return res.data;
	},

	async getProducts(params?: ReportParams): Promise<TopProduct[]> {
		const res = await apiClient.get<TopProduct[]>("/reports/products", {
			params: buildQueryParams(params),
		});
		return res.data;
	},

	async getOrders(params?: ReportParams): Promise<OrderStats> {
		const res = await apiClient.get<OrderStats>("/reports/orders", {
			params: buildQueryParams(params),
		});
		return res.data;
	},

	async getShiftReport(shiftId: string): Promise<ShiftReport | null> {
		const res = await apiClient.get<ShiftReport[]>("/reports/shifts", {
			params: { shiftId },
		});
		// Backend massiv qaytaradi — bizga shu shiftId ga tegishli birinchisi kerak
		return res.data.find((r) => r.shiftId === shiftId) ?? res.data[0] ?? null;
	},

	async getShiftReports(params?: {
		from?: string;
		to?: string;
		shiftId?: string;
		cashierId?: string;
	}): Promise<ShiftReport[]> {
		const query: Record<string, string> = {};
		if (params?.from) {
			query.from = params.from;
		}
		if (params?.to) {
			query.to = params.to;
		}
		if (params?.shiftId) {
			query.shiftId = params.shiftId;
		}
		if (params?.cashierId) {
			query.cashierId = params.cashierId;
		}

		const res = await apiClient.get<ShiftReport[]>("/reports/shifts", { params: query });
		return res.data;
	},

	// ─── Shifts list (smena dropdown uchun) ───────────────────

	async getShifts(from?: string, to?: string): Promise<Shift[]> {
		const p: Record<string, string> = {};
		if (from) {
			p.startDate = `${from}T00:00:00Z`;
		}
		if (to) {
			p.endDate = `${to}T23:59:59Z`;
		}
		const res = await apiClient.get<Shift[]>("/shifts", { params: p });
		return res.data;
	},
};
