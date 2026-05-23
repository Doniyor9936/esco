import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { ordersService, productsService } from "../services/menu.service";
import type {
	CreateOrderDto,
	CreateProductDto,
	ProductsQueryParams,
	StockInDto,
	UpdateOrderItemDto,
	UpdateProductDto,
} from "../types/menu.types";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const productKeys = {
	all: ["products"] as const,
	list: (p?: ProductsQueryParams) => ["products", "list", p] as const,
	detail: (id: string) => ["products", "detail", id] as const,
};

export const orderKeys = {
	all: ["orders"] as const,
	bySession: (sessionId: string) => ["orders", "session", sessionId] as const,
};

// ─── Products ─────────────────────────────────────────────────────────────────

export function useProducts(params?: ProductsQueryParams) {
	return useQuery({
		queryKey: productKeys.list(params),
		queryFn: () => productsService.getAll(params),
		staleTime: 30_000,
	});
}

export function useProduct(id: string) {
	return useQuery({
		queryKey: productKeys.detail(id),
		queryFn: () => productsService.getById(id),
		enabled: !!id,
	});
}

export function useCreateProduct() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateProductDto) => productsService.create(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: productKeys.all });
			message.success("Mahsulot qo'shildi");
		},
		onError: () => message.error("Mahsulot qo'shishda xatolik yuz berdi"),
	});
}

export function useUpdateProduct() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
			productsService.update(id, data),
		onSuccess: (product) => {
			qc.invalidateQueries({ queryKey: productKeys.detail(product.id) });
			qc.invalidateQueries({ queryKey: productKeys.all });
			message.success("Mahsulot yangilandi");
		},
		onError: () => message.error("Mahsulotni yangilashda xatolik yuz berdi"),
	});
}

export function useDeleteProduct() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => productsService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: productKeys.all });
			message.success("Mahsulot o'chirildi");
		},
		onError: () => message.error("Mahsulotni o'chirishda xatolik yuz berdi"),
	});
}

export function useStockIn() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: StockInDto }) =>
			productsService.stockIn(id, data),
		onSuccess: (product) => {
			qc.invalidateQueries({ queryKey: productKeys.detail(product.id) });
			qc.invalidateQueries({ queryKey: productKeys.all });
			message.success("Ombor yangilandi");
		},
		onError: () => message.error("Omborni yangilashda xatolik yuz berdi"),
	});
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useSessionOrder(sessionId: string) {
	return useQuery({
		queryKey: orderKeys.bySession(sessionId),
		queryFn: () => ordersService.getBySession(sessionId),
		enabled: !!sessionId,
		staleTime: 10_000,
	});
}

export function useCreateOrder() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateOrderDto) => ordersService.create(data),
		onSuccess: (order) => {
			qc.invalidateQueries({ queryKey: orderKeys.bySession(order.sessionId) });
			qc.invalidateQueries({ queryKey: ["sessions"] });
			message.success("Buyurtma qabul qilindi!");
		},
		onError: () => message.error("Buyurtma yuborishda xatolik yuz berdi"),
	});
}

export function useUpdateOrderItem() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ itemId, data }: { itemId: string; data: UpdateOrderItemDto }) =>
			ordersService.updateItem(itemId, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: orderKeys.all });
			qc.invalidateQueries({ queryKey: ["sessions"] });
		},
		onError: () => message.error("Miqdor yangilashda xatolik yuz berdi"),
	});
}

export function useDeleteOrderItem() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (itemId: string) => ordersService.deleteItem(itemId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: orderKeys.all });
			qc.invalidateQueries({ queryKey: ["sessions"] });
			message.success("Mahsulot o'chirildi");
		},
		onError: () => message.error("O'chirishda xatolik yuz berdi"),
	});
}
