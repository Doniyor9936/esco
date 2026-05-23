// ─── Report Period & Params ───────────────────────────────────

export type ReportPeriod = "daily" | "weekly" | "monthly" | "custom";

export interface ReportParams {
	period?: ReportPeriod;
	from?: string; // YYYY-MM-DD
	to?: string; // YYYY-MM-DD
	shiftId?: string; // UUID — smena bo'yicha filter
	cashierId?: string; // UUID — kassir bo'yicha filter
	shiftOpenedAt?: string; // ISO — buildQueryParams uchun
	shiftClosedAt?: string; // ISO — buildQueryParams uchun
}

// ─── Summary ─────────────────────────────────────────────────

export interface ReportSummary {
	totalRevenue: number;
	totalRevenueChange: number;
	profit: number;
	profitPct: number;
	totalChecks: number;
	avgCheck: number;
	avgOccupancy: number;
	avgOccupancyChange: number;
	gameRevenue: number;
	productRevenue: number;
}

// ─── Revenue ─────────────────────────────────────────────────

export interface RevenuePoint {
	date: string;
	day: string;
	amount: number;
}

// ─── Tables ──────────────────────────────────────────────────

export interface TableOccupancy {
	tableId: string;
	tableName: string;
	occupancyPct: number;
}

export interface TableRevenue {
	tableId: string;
	tableName: string;
	tableNumber: number;
	tableType: string;
	naqdAmount: number;
	kartaAmount: number;
	clickAmount: number;
	totalAmount: number;
	paymentCount: number;
}

// ─── Payments ────────────────────────────────────────────────

export interface PaymentStats {
	naqd: number;
	karta: number;
	click: number;
	payme: number;
	bolibTolash: number;
	total: number;
	naqdPct: number;
	kartaPct: number;
	clickPct: number;
	paymePct: number;
	bolibTolashPct: number;
}

// ─── Products ────────────────────────────────────────────────

export interface TopProduct {
	rank: number;
	productId: string;
	productName: string;
	quantity: number;
	revenue: number;
	sharePct: number;
}

// ─── Orders ──────────────────────────────────────────────────

export interface OrderStats {
	totalOrders: number;
	totalItems: number;
	totalRevenue: number;
	avgOrderAmount: number;
	byStatus: { status: string; count: number; amount: number }[];
	byHour: { hour: number; count: number; amount: number }[];
}

// ─── Shifts ──────────────────────────────────────────────────

export interface Shift {
	id: string;
	cashierId: string;
	openedAt: string;
	closedAt: string | null;
	status: "open" | "closed";
	totalCash: number;
	totalCard: number;
	totalClick: number;
	totalReceipts: number;
	openingCash: number;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * /api/reports/shifts endpointi qaytaradigan ma'lumot.
 * Smena bo'yicha aniq summalar — chek chiqarishda ishlatiladi.
 */
export interface ShiftReport {
	shiftId: string;
	openedAt: string;
	closedAt: string | null;
	totalRevenue: number; // umumiy tushum
	gameRevenue: number; // billiard stol tushumlari
	productRevenue: number; // menyu tushumlari
	totalChecks: number; // cheklar soni
	naqdAmount: number; // naqd to'lov
	kartaAmount: number; // plastik to'lov
	clickAmount: number; // click to'lov
	paymeAmount: number; // payme to'lov
}

export interface Cashier {
	id: string;
	name: string;
	phone?: string;
}
