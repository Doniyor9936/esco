import { useState } from "react";
import { PAGE_SIZE, type TabKey } from "../constants";
import {
	useCreateProduct,
	useDeleteProduct,
	useProducts,
	useStockIn,
	useUpdateProduct,
} from "../hooks/useProducts";
import type { CreateProductDto, Product, ProductsQueryParams, StockInDto } from "../types";
import { InventoryKPIRow } from "./InventoryKPIRow";
import { CreateProductModal, EditProductModal, StockInModal } from "./InventoryModals";
import { InventoryTable } from "./InventoryTable";

export function InventoryView() {
	// ── Filter / pagination state ──
	const [tab, setTab] = useState<TabKey>("all");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const handleTabChange = (key: TabKey) => {
		setTab(key);
		setPage(1);
	};
	const handleSearch = (v: string) => {
		setSearch(v);
		setPage(1);
	};

	// ── Modal state ──
	const [createOpen, setCreateOpen] = useState(false);
	const [editProduct, setEditProduct] = useState<Product | null>(null);
	const [stockProduct, setStockProduct] = useState<Product | null>(null);

	// ── Queries ──
	const queryParams: ProductsQueryParams = {
		limit: PAGE_SIZE,
		page,
		...(search && { search }),
		...(tab !== "all" && tab !== "low" && { category: tab }),
		...(tab === "low" && { lowStock: true }),
	};

	const { data, isLoading, isError } = useProducts(queryParams);
	const products = data?.data ?? [];
	const meta = data?.meta;

	// KPI için tüm ürünler (sayfalama yok)
	const { data: allData } = useProducts({ limit: 100, page: 1 });
	const allProducts = allData?.data ?? [];
	const lowCount = allProducts.filter((p) => p.stockQuantity <= p.minStock).length;

	// ── Mutations ──
	const { mutate: create, isPending: creating } = useCreateProduct();
	const { mutate: update, isPending: updating } = useUpdateProduct();
	const { mutate: remove } = useDeleteProduct();
	const { mutate: stockIn, isPending: stocking } = useStockIn();

	const handleCreate = (vals: CreateProductDto) => {
		create(vals, { onSuccess: () => setCreateOpen(false) });
	};

	const handleUpdate = (id: string, vals: Partial<Product>) => {
		const data = Object.fromEntries(
			Object.entries(vals).filter(([, v]) => v !== null)
		) as Partial<CreateProductDto>;
		update({ id, data }, { onSuccess: () => setEditProduct(null) });
	};

	const handleStockIn = (id: string, dto: StockInDto) => {
		stockIn({ id, data: dto }, { onSuccess: () => setStockProduct(null) });
	};

	return (
		<>
			<InventoryKPIRow products={allProducts} />

			<InventoryTable
				products={products}
				isLoading={isLoading}
				isError={isError}
				tab={tab}
				search={search}
				page={page}
				total={meta?.total ?? 0}
				totalPages={meta?.totalPages ?? 1}
				lowCount={lowCount}
				onTabChange={handleTabChange}
				onSearchChange={handleSearch}
				onPageChange={setPage}
				onAddClick={() => setCreateOpen(true)}
				onStockClick={setStockProduct}
				onEditClick={setEditProduct}
				onDelete={remove}
			/>

			<CreateProductModal
				open={createOpen}
				creating={creating}
				onClose={() => setCreateOpen(false)}
				onCreate={handleCreate}
			/>

			<EditProductModal
				product={editProduct}
				updating={updating}
				onClose={() => setEditProduct(null)}
				onUpdate={handleUpdate}
			/>

			<StockInModal
				product={stockProduct}
				stocking={stocking}
				onClose={() => setStockProduct(null)}
				onStockIn={handleStockIn}
			/>
		</>
	);
}
