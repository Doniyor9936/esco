import apiClient from "@/app/api/client";
import type {
	CreateOrderDto,
	CreateProductDto,
	Order,
	OrderItem,
	Product,
	ProductsListResponse,
	ProductsQueryParams,
	StockInDto,
	UpdateOrderItemDto,
	UpdateProductDto,
} from "../types/menu.types";

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsService = {
	async getAll(params?: ProductsQueryParams): Promise<ProductsListResponse> {
		const response = await apiClient.get<ProductsListResponse>("/products", { params });
		return response.data;
	},

	async getById(id: string): Promise<Product> {
		const response = await apiClient.get<Product>(`/products/${id}`);
		return response.data;
	},

	async create(data: CreateProductDto): Promise<Product> {
		const response = await apiClient.post<Product>("/products", data);
		return response.data;
	},

	async update(id: string, data: UpdateProductDto): Promise<Product> {
		const response = await apiClient.patch<Product>(`/products/${id}`, data);
		return response.data;
	},

	async remove(id: string): Promise<void> {
		await apiClient.delete(`/products/${id}`);
	},

	async stockIn(id: string, data: StockInDto): Promise<Product> {
		const response = await apiClient.post<Product>(`/products/${id}/stock-in`, data);
		return response.data;
	},
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersService = {
	async getBySession(sessionId: string): Promise<Order> {
		const response = await apiClient.get<Order>(`/orders/session/${sessionId}`);
		return response.data;
	},

	async create(data: CreateOrderDto): Promise<Order> {
		const response = await apiClient.post<Order>("/orders", data);
		return response.data;
	},

	async updateItem(itemId: string, data: UpdateOrderItemDto): Promise<OrderItem> {
		const response = await apiClient.patch<OrderItem>(`/orders/items/${itemId}`, data);
		return response.data;
	},

	async deleteItem(itemId: string): Promise<void> {
		await apiClient.delete(`/orders/items/${itemId}`);
	},
};
