import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Spin } from "antd";
import { useState } from "react";
import { useCreateOrder, useDeleteOrderItem, useProducts, useSessionOrder } from "../hooks/useMenu";
import { useCartStore } from "../store/cart.store";
import type { Product, ProductCategory } from "../types/menu.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtSom(n: number) {
	return n.toLocaleString("uz-UZ");
}

// ─── Category config ──────────────────────────────────────────────────────────

const CAT_LABELS: Record<ProductCategory, string> = {
	taom: "Taomlar",
	zakuska: "Zakuskalar",
	ichimlik: "Ichimliklar",
	choy_qahva: "Choy & Qahva",
	kalyan: "Kalyan",
	boshqa: "Boshqa",
};

const ALL_CATS = Object.keys(CAT_LABELS) as ProductCategory[];

// ─── Props ────────────────────────────────────────────────────────────────────

interface MenuViewProps {
	sessionId: string;
	tableName?: string;
	onBack?: () => void;
}

// ─── Item tile ────────────────────────────────────────────────────────────────

function ItemTile({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
	const isLow = product.stockQuantity < 10;
	const isOut = product.stockQuantity === 0 || !product.isAvailable;

	return (
		<button
			className={`item-tile${isOut ? " disabled" : ""}`}
			onClick={() => !isOut && onAdd(product)}
			disabled={isOut}
			style={{ opacity: isOut ? 0.5 : 1 }}
		>
			<div className="item-img">
				<svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
					<defs>
						<pattern id={`p${product.id}`} patternUnits="userSpaceOnUse" width="8" height="8">
							<path d="M0,8 L8,0" stroke="rgba(139,111,71,0.15)" strokeWidth="1" />
						</pattern>
					</defs>
					<rect width="100" height="60" fill="var(--ivory-200)" />
					<rect width="100" height="60" fill={`url(#p${product.id})`} />
				</svg>
				{isLow && !isOut && <span className="low-tag">{product.stockQuantity} qoldi</span>}
				{isOut && (
					<span className="low-tag" style={{ background: "var(--danger)" }}>
						Tugagan
					</span>
				)}
			</div>
			<div className="item-body">
				<div className="item-name">{product.name}</div>
				<div className="item-price">
					{fmtSom(product.sellingPrice)}{" "}
					<span style={{ fontSize: 10, color: "var(--ink-500)" }}>so'm</span>
				</div>
			</div>
		</button>
	);
}

// ─── Cart row ─────────────────────────────────────────────────────────────────

interface CartRowProps {
	productId: string;
	name: string;
	price: number;
	quantity: number;
	onQtyChange: (qty: number) => void;
	onRemove: () => void;
}

function CartRow({ name, price, quantity, onQtyChange, onRemove }: CartRowProps) {
	return (
		<div className="order-row">
			<div className="or-main">
				<div className="or-name">{name}</div>
				<div className="or-price">{fmtSom(price)} so'm</div>
			</div>
			<div className="or-total">{fmtSom(price * quantity)}</div>
			<button className="or-del" onClick={onRemove}>
				<DeleteOutlined style={{ fontSize: 13 }} />
			</button>
		</div>
	);
}

// ─── Saved order row (from backend) ───────────────────────────────────────────

interface SavedOrderRowProps {
	itemId: string;
	name: string;
	price: number;
	quantity: number;
	sessionId: string;
}

function SavedOrderRow({ itemId, name, price, quantity }: SavedOrderRowProps) {
	const { mutate: deleteItem } = useDeleteOrderItem();

	return (
		<div className="order-row">
			<div className="or-main">
				<div className="or-name">{name}</div>
				<div className="or-price">{fmtSom(price)} so'm</div>
			</div>

			<div className="or-total">{fmtSom(price * quantity)}</div>
			<button className="or-del" onClick={() => deleteItem(itemId)}>
				<DeleteOutlined style={{ fontSize: 13 }} />
			</button>
		</div>
	);
}

export function MenuView({ sessionId, tableName, onBack }: MenuViewProps) {
	const [activeCat, setActiveCat] = useState<ProductCategory>("taom");
	const [search, setSearch] = useState("");

	const { data: productsData, isLoading: productsLoading } = useProducts({
		category: activeCat,
		isAvailable: true,
		limit: 100,
	});

	const { data: existingOrder, isLoading: orderLoading } = useSessionOrder(sessionId);
	const { mutate: createOrder, isPending: submitting } = useCreateOrder();

	// Cart state
	const { items: cartItems, addItem, updateQty, removeItem, clearCart, total } = useCartStore();

	const filteredProducts = (productsData?.data ?? []).filter(
		(p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
	);

	const catCounts = (productsData?.data ?? []).reduce<Record<string, number>>((acc, p) => {
		acc[p.category] = (acc[p.category] ?? 0) + 1;
		return acc;
	}, {});

	const cartTotal = total();
	const savedTotal = existingOrder?.items.reduce((s, i) => s + i.totalPrice, 0) ?? 0;
	const grandTotal = cartTotal + savedTotal;

	const handleSubmit = () => {
		if (cartItems.length === 0) {
			return;
		}
		createOrder(
			{
				sessionId,
				items: cartItems.map((i) => ({
					productId: i.product.id,
					quantity: i.quantity,
					notes: i.notes,
				})),
			},
			{
				onSuccess: () => {
					clearCart();
				},
			}
		);
	};

	return (
		<div className="menu-layout">
			{/* ── Chap ustun: mahsulotlar ── */}
			<div className="menu-left">
				<div className="menu-search">
					<SearchOutlined style={{ color: "var(--ink-500)", fontSize: 16 }} />
					<input
						placeholder="Mahsulot qidirish..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className="cat-list">
					{ALL_CATS.map((cat) => (
						<button
							key={cat}
							className={`cat-btn${activeCat === cat ? " active" : ""}`}
							onClick={() => {
								setActiveCat(cat);
								setSearch("");
							}}
						>
							<span className="cat-name">{CAT_LABELS[cat]}</span>
							{activeCat === cat && catCounts[cat] != null && (
								<span className="cat-count">{catCounts[cat]}</span>
							)}
						</button>
					))}
				</div>

				{productsLoading ? (
					<div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
						<Spin size="large" />
					</div>
				) : filteredProducts.length === 0 ? (
					<Alert type="info" message="Mahsulotlar topilmadi" style={{ margin: "20px 0" }} />
				) : (
					<div className="items-grid">
						{filteredProducts.map((product) => (
							<ItemTile key={product.id} product={product} onAdd={(p) => addItem(p)} />
						))}
					</div>
				)}
			</div>

			{/* ── O'ng ustun: savat ── */}
			<div className="menu-right">
				<div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
					<div className="card-hd">
						<h3>{tableName ? `${tableName} · Savat` : "Savat"}</h3>
						<button
							className="btn btn-ghost btn-sm"
							style={{ marginLeft: "auto" }}
							onClick={onBack}
						>
							Sessiyaga qaytish
						</button>
					</div>

					<div className="order-list" style={{ flex: 1, overflow: "auto" }}>
						{/* Avvalgi saqlangan buyurtmalar */}
						{orderLoading ? (
							<div style={{ padding: 16, textAlign: "center" }}>
								<Spin size="small" />
							</div>
						) : (
							existingOrder?.items.map((item) => (
								<SavedOrderRow
									key={item.id}
									itemId={item.id}
									name={item.productName}
									price={item.unitPrice}
									quantity={item.quantity}
									sessionId={sessionId}
								/>
							))
						)}

						{/* Yangi qo'shilganlar (hali yuborilmagan) */}
						{cartItems.length > 0 && (
							<>
								{(existingOrder?.items?.length ?? 0) > 0 && (
									<div
										style={{
											padding: "6px 18px",
											fontSize: 11,
											color: "var(--ink-400)",
											background: "var(--ivory-50)",
											borderTop: "1px solid var(--ivory-200)",
										}}
									>
										Yangi qo'shilmoqda
									</div>
								)}
								{cartItems.map((item) => (
									<CartRow
										key={item.product.id}
										productId={item.product.id}
										name={item.product.name}
										price={item.product.sellingPrice}
										quantity={item.quantity}
										onQtyChange={(qty) => updateQty(item.product.id, qty)}
										onRemove={() => removeItem(item.product.id)}
									/>
								))}
							</>
						)}

						{(existingOrder?.items?.length ?? 0) === 0 && cartItems.length === 0 && (
							<div
								style={{
									padding: "40px 18px",
									textAlign: "center",
									color: "var(--ink-400)",
									fontSize: 13,
								}}
							>
								Savat bo'sh
							</div>
						)}
					</div>

					<div
						style={{
							padding: 14,
							borderTop: "1px solid var(--ivory-200)",
							background: "var(--ivory-50)",
						}}
					>
						{savedTotal > 0 && (
							<div className="sum-row" style={{ fontSize: 12, color: "var(--ink-500)" }}>
								<span>Avvalgi buyurtmalar</span>
								<span className="font-mono">{fmtSom(savedTotal)}</span>
							</div>
						)}
						{cartItems.length > 0 && (
							<div className="sum-row" style={{ fontSize: 12, color: "var(--ink-500)" }}>
								<span>Yangi qo'shilmoqda</span>
								<span className="font-mono">{fmtSom(cartTotal)}</span>
							</div>
						)}
						<div className="sum-row total" style={{ fontSize: 16 }}>
							<span>Jami</span>
							<span className="font-mono">{fmtSom(grandTotal)} so'm</span>
						</div>

						{cartItems.length > 0 && (
							<Button
								type="primary"
								className="btn btn-gold btn-lg"
								style={{ width: "100%", marginTop: 10, justifyContent: "center" }}
								onClick={handleSubmit}
								loading={submitting}
							>
								Buyurtma berish ({cartItems.reduce((s, i) => s + i.quantity, 0)} ta)
							</Button>
						)}

						{cartItems.length === 0 && (
							<button
								className="btn btn-ghost btn-lg"
								style={{ width: "100%", marginTop: 10, justifyContent: "center" }}
								onClick={onBack}
							>
								Sessiyaga qaytish
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
