export type PaymentMethod = "naqd" | "karta" | "click" | "payme" | "bolib_tolash";

export type CheckStatus = "pending" | "paid" | "cancelled";

export interface CheckSessionInfo {
	id: string;
	tableType: string;
	startedAt: string;
	hourlyRate: number;
	guestCount: number;
	guestName: string | null;
}

export interface CheckOrderItem {
	productName: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
}

export interface CheckOrder {
	id: string;
	subtotal: number;
	items: CheckOrderItem[];
}

export interface Check {
	id: string;
	sessionId: string;
	cashierId: string;
	gameAmount: number;
	orderAmount: number;
	subtotal: number;
	serviceFee: number;
	discount: number;
	total: number;
	paymentMethod: PaymentMethod;
	receivedAmount: number | null;
	change: number;
	status: CheckStatus;
	createdAt: string;
	updatedAt: string;
	session: CheckSessionInfo;
	orders: CheckOrder[];
	gameMinutes: number;
	ordersAmount: number;
	serviceCharge: number;
	serviceChargeAmount: number;
	totalAmount: number;
}

export interface CreateCheckDto {
	sessionId: string;
}

export interface PayCheckDto {
	paymentMethod: PaymentMethod;
	receivedAmount: number;
}
