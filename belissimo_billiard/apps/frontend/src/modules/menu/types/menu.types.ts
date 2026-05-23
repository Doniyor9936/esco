// ─── Products ─────────────────────────────────────────────────────────────────

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

export interface ProductsListResponse {
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
	description?: string;
	imageUrl?: string;
	isAvailable?: boolean;
	isSoldSeparately?: boolean;
	minStock?: number;
	sortOrder?: number;
	stockQuantity?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface StockInDto {
	quantity: number;
	reason?: string;
	unitCost?: number;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItem {
	id: string;
	orderId: string;
	productId: string;
	productName: string;
	unitPrice: number;
	quantity: number;
	totalPrice: number;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Order {
	id: string;
	sessionId: string;
	cashierId: string;
	subtotal: number;
	totalAmount: number;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	items: OrderItem[];
}

export interface CreateOrderItemDto {
	productId: string;
	quantity: number;
	notes?: string;
}

export interface CreateOrderDto {
	sessionId: string;
	items: CreateOrderItemDto[];
}

export interface UpdateOrderItemDto {
	quantity: number;
}

// ─── Cart (local state) ───────────────────────────────────────────────────────

export interface CartItem {
	product: Product;
	quantity: number;
	notes?: string;
}
