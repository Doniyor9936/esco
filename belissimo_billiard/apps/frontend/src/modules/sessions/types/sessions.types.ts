export type SessionStatus = "active" | "paused" | "closed" | "cancelled";

export interface Session {
	id: string;
	tableId: string;
	cashierId: string;
	customerId: string | null;
	shiftId: string;
	guestCount: number;
	guestName: string | null;
	tableType: string;
	startedAt: string;
	pausedAt: string | null;
	endedAt: string | null;
	totalMinutes: number | null;
	hourlyRate: number;
	gameAmount: number | null;
	orderAmount: number;
	serviceChargePct: number;
	serviceChargeAmount: number | null;
	discountAmount: number;
	totalAmount: number | null;
	status: SessionStatus;
	discountReason: string | null;
	loyaltyPointsEarned: number;
	loyaltyPointsUsed: number;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	// computed
	tableName: string;
	elapsedMinutes: number;
	currentGameAmount: number;
	currentTotal: number;
}

export interface SessionsMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface SessionsListResponse {
	data: Session[];
	meta: SessionsMeta;
}

export interface SessionsQueryParams {
	search?: string;
	status?: SessionStatus;
	tableId?: string;
	shiftId?: string;
	page?: number;
	limit?: number;
}

export interface CreateSessionDto {
	tableId: string;
	guestCount?: number;
	guestName?: string;
	customerId?: string;
}

export interface UpdateRateDto {
	hourlyRate: number;
}

export interface UpdateDiscountDto {
	discountAmount: number;
	discountReason?: string;
}
