export type TableStatus = "bosh" | "band" | "bron" | "yopiq";
export type TableCategory = "standard" | "vip";
export type TableType = "america" | "rus_piramida" | "snooker";

export interface Table {
	id: string;
	name: string;
	number: number;
	type: TableType;
	category: TableCategory;
	hourlyRate: number;
	minRate: number | null;
	status: TableStatus;
	sortOrder: number;
	isActive: boolean;
	description: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface TablesMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface TablesResponse {
	data: Table[];
	meta: TablesMeta;
}

export interface CreateTableDto {
	name: string;
	number: number;
	type: TableType;
	category?: TableCategory;
	hourlyRate: number;
	minRate?: number;
	sortOrder?: number;
	description?: string;
}

export interface UpdateTableDto {
	name?: string;
	number?: number;
	type?: TableType;
	category?: TableCategory;
	hourlyRate?: number;
	minRate?: number;
	sortOrder?: number;
	description?: string;
}

export interface TablesQueryParams {
	status?: TableStatus;
	category?: TableCategory;
	limit?: number;
	page?: number;
	search?: string;
}

// ─── UI uchun local tiplar ───────────────────────────────────
export type FilterTab = "all" | TableStatus | "vip";
