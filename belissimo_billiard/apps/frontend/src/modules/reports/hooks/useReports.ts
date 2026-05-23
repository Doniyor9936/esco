import { useQuery } from "@tanstack/react-query";
import { reportsService } from "../services/reports.service";
import type { ReportParams } from "../types";

// ─── Query Keys ───────────────────────────────────────────────

export const reportKeys = {
	all: ["reports"] as const,
	summary: (p?: ReportParams) => ["reports", "summary", p] as const,
	revenue: (p?: ReportParams) => ["reports", "revenue", p] as const,
	tablesOccupancy: (p?: ReportParams) => ["reports", "tables", "occupancy", p] as const,
	tablesRevenue: (p?: ReportParams) => ["reports", "tables", "revenue", p] as const,
	payments: (p?: ReportParams) => ["reports", "payments", p] as const,
	products: (p?: ReportParams) => ["reports", "products", p] as const,
	orders: (p?: ReportParams) => ["reports", "orders", p] as const,
	shifts: (from?: string, to?: string) => ["reports", "shifts", from, to] as const,
};

// ─── Report Hooks ─────────────────────────────────────────────

export function useReportSummary(params?: ReportParams) {
	return useQuery({
		queryKey: reportKeys.summary(params),
		queryFn: () => reportsService.getSummary(params),
		staleTime: 60_000,
	});
}

export function useReportRevenue(params?: ReportParams) {
	return useQuery({
		queryKey: reportKeys.revenue(params),
		queryFn: () => reportsService.getRevenue(params),
		staleTime: 60_000,
	});
}

export function useReportTablesOccupancy(params?: ReportParams) {
	return useQuery({
		queryKey: reportKeys.tablesOccupancy(params),
		queryFn: () => reportsService.getTablesOccupancy(params),
		staleTime: 60_000,
	});
}

export function useReportTablesRevenue(params?: ReportParams) {
	return useQuery({
		queryKey: reportKeys.tablesRevenue(params),
		queryFn: () => reportsService.getTablesRevenue(params),
		staleTime: 60_000,
	});
}

export function useReportPayments(params?: ReportParams) {
	return useQuery({
		queryKey: reportKeys.payments(params),
		queryFn: () => reportsService.getPayments(params),
		staleTime: 60_000,
	});
}

export function useReportProducts(params?: ReportParams) {
	return useQuery({
		queryKey: reportKeys.products(params),
		queryFn: () => reportsService.getProducts(params),
		staleTime: 60_000,
	});
}

export function useReportOrders(params?: ReportParams) {
	return useQuery({
		queryKey: reportKeys.orders(params),
		queryFn: () => reportsService.getOrders(params),
		staleTime: 60_000,
	});
}

// ─── Shifts Hook ──────────────────────────────────────────────

/**
 * Smena dropdown uchun — so'nggi 30 kunlik smenalar
 * from/to ixtiyoriy (default: oxirgi 30 kun)
 */
export function useShifts(from?: string, to?: string) {
	const today = new Date();
	const fmt = (d: Date) => d.toISOString().slice(0, 10);

	const defaultTo = fmt(today);
	const defaultFrom = (() => {
		const d = new Date(today);
		d.setDate(d.getDate() - 30);
		return fmt(d);
	})();

	const resolvedFrom = from ?? defaultFrom;
	const resolvedTo = to ?? defaultTo;

	return useQuery({
		queryKey: reportKeys.shifts(resolvedFrom, resolvedTo),
		queryFn: () => reportsService.getShifts(resolvedFrom, resolvedTo),
		staleTime: 60_000,
	});
}
