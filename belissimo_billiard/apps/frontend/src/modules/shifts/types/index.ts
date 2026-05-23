// ─── Shift ───────────────────────────────────────────────────
export type ShiftStatus = "open" | "closed";

export interface Shift {
	id: string;
	cashierId: string;
	openedAt: string;
	closedAt: string | null;
	scheduledClose: string | null;
	openingCash: number;
	totalCash: number;
	totalCard: number;
	totalClick: number;
	totalReceipts: number;
	cancelledReceipts: number;
	status: ShiftStatus;
	xReportPrintedAt: string | null;
	zReportData: unknown | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ShiftStats {
	totalCash: number;
	totalCard: number;
	totalClick: number;
	totalReceipts: number;
	cancelledReceipts: number;
}

export interface ShiftWithStats {
	shift: Shift;
	stats: ShiftStats;
}

// ─── DTOs ────────────────────────────────────────────────────
export interface OpenShiftDto {
	openingCash?: number;
}

export type CashType = "kirim" | "chiqim";

export interface CashTransactionDto {
	amount: number;
	type: CashType;
	reason?: string;
}

export interface CashTransaction {
	id: string;
	shiftId: string;
	userId: string;
	type: CashType;
	amount: number;
	reason: string | null;
	createdAt: string;
}

export interface ShiftOperation {
	id: string;
	time: string;
	tableName: string;
	paymentMethod: string;
	totalAmount: number;
	status: string;
}

// ─── Payments ────────────────────────────────────────────────
export type PaymentMethod = "naqd" | "karta" | "click" | "payme" | "installment";
export type PaymentStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface ShiftPayment {
	id: string;
	receiptNumber: string;
	totalAmount: number;
	paymentMethod: PaymentMethod;
	status: PaymentStatus;
	createdAt: string;
	check: {
		session: {
			table: {
				name: string;
			};
		};
	};
}
export interface ShiftSummaryReport {
	totalRevenue: number;
	totalRevenueChange: number;
	gameRevenue: number;
	productRevenue: number;
	profit: number;
	profitPct: number;
	totalChecks: number;
	avgCheck: number;
	avgOccupancy: number;
	avgOccupancyChange: number;
}

export interface ClosedShiftDetail extends Shift {
	// /api/shifts response dan keladi (Shift + qo'shimcha maydonlar)
	totalChangeAmount: number;
	returnedChangeAmount: number;
	cancelledChangeAmount: number;
}
