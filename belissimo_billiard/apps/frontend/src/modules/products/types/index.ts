export type ProductCategory = "taom" | "zakuska" | "ichimlik" | "choy_qahva" | "kalyan" | "boshqa";
export type ProductUnit = "shisha" | "kg" | "dona" | "paket" | "litr";

export interface Product {
	id: string;
	name: string;
	category: ProductCategory;
	unit: ProductUnit;
	costPrice: number;
	sellingPrice: number;
	stockQuantity: number;
	minStock: number;
	isAvailable: boolean;
	isSoldSeparately: boolean;
	sortOrder: number;
	description: string | null;
	imageUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ProductsMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ProductsResponse {
	data: Product[];
	meta: ProductsMeta;
}

export interface ProductsQueryParams {
	search?: string;
	category?: ProductCategory;
	isAvailable?: boolean;
	lowStock?: boolean;
	page?: number;
	limit?: number;
}

export interface CreateProductDto {
	name: string;
	category: ProductCategory;
	unit: ProductUnit;
	sellingPrice: number;
	costPrice?: number;
	stockQuantity?: number;
	minStock?: number;
	isAvailable?: boolean;
	isSoldSeparately?: boolean;
	sortOrder?: number;
	description?: string;
	imageUrl?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface StockInDto {
	quantity: number;
	unitCost?: number;
	reason?: string;
}
