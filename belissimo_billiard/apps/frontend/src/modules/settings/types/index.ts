// ─── Settings ────────────────────────────────────────────────
export interface Settings {
	id: string;
	clubName: string;
	address: string | null;
	phone: string | null;
	website: string | null;
	currency: string;
	currencySymbol: string;
	timezone: string;
	language: string;
	openTime: string;
	closeTime: string;
	serviceChargePct: number;
	serviceChargeEnabled: boolean;
	cashEnabled: boolean;
	cardEnabled: boolean;
	clickEnabled: boolean;
	paymeEnabled: boolean;
	installmentEnabled: boolean;
	loyaltyEnabled: boolean;
	pointsPer1000: number;
	bronzeThreshold: number;
	silverThreshold: number;
	goldThreshold: number;
	bronzeCashbackPct: number;
	bronzeTableDiscountPct: number;
	bronzeBirthdayBonus: number;
	silverCashbackPct: number;
	silverTableDiscountPct: number;
	silverBirthdayBonus: number;
	goldCashbackPct: number;
	goldTableDiscountPct: number;
	goldBirthdayBonus: number;
	receiptHeader: string | null;
	receiptFooter: string | null;
	receiptShowLogo: boolean;
	taxEnabled: boolean;
	ofdEnabled: boolean;
	ofdEndpoint: string | null;
	createdAt: string;
	updatedAt: string;
}

export type UpdateSettingsDto = Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>;

// ─── Settings Tables ─────────────────────────────────────────
export type SettingsTableType = "america" | "rus_piramida" | "snooker";
export type SettingsTableCategory = "standard" | "vip";
export type SettingsTableStatus = "bosh" | "band" | "bron" | "yopiq";

export interface SettingsTable {
	id: string;
	name: string;
	number: number;
	type: SettingsTableType;
	category: SettingsTableCategory;
	hourlyRate: number;
	eveningRate: number | null;
	minRate: number | null;
	isVip: boolean;
	isActive: boolean;
	sortOrder: number;
	description: string | null;
	status: SettingsTableStatus;
}

export interface CreateSettingsTableDto {
	name: string;
	number: number;
	type: SettingsTableType;
	hourlyRate: number;
	category?: SettingsTableCategory;
	eveningRate?: number;
	minRate?: number;
	isVip?: boolean;
	sortOrder?: number;
	description?: string;
}

export type UpdateSettingsTableDto = Partial<CreateSettingsTableDto>;
