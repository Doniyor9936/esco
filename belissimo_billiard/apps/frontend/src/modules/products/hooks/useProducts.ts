import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { productsService } from "../services/products.service";
import type { CreateProductDto, ProductsQueryParams, StockInDto, UpdateProductDto } from "../types";

export const productKeys = {
	all: ["products"] as const,
	list: (p?: ProductsQueryParams) => ["products", "list", p] as const,
	detail: (id: string) => ["products", "detail", id] as const,
};

// ─── GET ALL ─────────────────────────────────────────────────
export function useProducts(params?: ProductsQueryParams) {
	return useQuery({
		queryKey: productKeys.list(params),
		queryFn: () => productsService.getAll(params),
		staleTime: 30_000,
	});
}

// ─── GET ONE ─────────────────────────────────────────────────
export function useProduct(id: string) {
	return useQuery({
		queryKey: productKeys.detail(id),
		queryFn: () => productsService.getById(id),
		enabled: !!id,
	});
}

// ─── CREATE ──────────────────────────────────────────────────
export function useCreateProduct() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateProductDto) => productsService.create(data),
		onSuccess: (p) => {
			qc.invalidateQueries({ queryKey: productKeys.all });
			message.success(`"${p.name}" muvaffaqiyatli qo'shildi`);
		},
		onError: () => message.error("Mahsulot qo'shishda xatolik"),
	});
}

// ─── UPDATE ──────────────────────────────────────────────────
export function useUpdateProduct() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
			productsService.update(id, data),
		onSuccess: (p) => {
			qc.invalidateQueries({ queryKey: productKeys.detail(p.id) });
			qc.invalidateQueries({ queryKey: productKeys.all });
			message.success(`"${p.name}" yangilandi`);
		},
		onError: () => message.error("Yangilashda xatolik"),
	});
}

// ─── DELETE ──────────────────────────────────────────────────
export function useDeleteProduct() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => productsService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: productKeys.all });
			message.success("Mahsulot o'chirildi");
		},
		onError: () => message.error("O'chirishda xatolik"),
	});
}

// ─── STOCK IN ────────────────────────────────────────────────
export function useStockIn() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: StockInDto }) =>
			productsService.stockIn(id, data),
		onSuccess: (p) => {
			qc.invalidateQueries({ queryKey: productKeys.detail(p.id) });
			qc.invalidateQueries({ queryKey: productKeys.all });
			message.success("Ombor yangilandi");
		},
		onError: () => message.error("Ombor yangilashda xatolik"),
	});
}
