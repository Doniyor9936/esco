import apiClient from "@/app/api/client";
import type {
	CreateProductDto,
	Product,
	ProductsQueryParams,
	ProductsResponse,
	StockInDto,
	UpdateProductDto,
} from "../types";

export const productsService = {
	async getAll(params?: ProductsQueryParams): Promise<ProductsResponse> {
		const response = await apiClient.get<ProductsResponse>("/products", { params });
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
