import { Popconfirm } from "antd";
import { AlertTriangle, ChevronLeft, ChevronRight, Edit, Plus } from "lucide-react";
import { CATEGORY_LABEL, fmtSom, PAGE_SIZE, TABS, type TabKey, UNIT_LABEL } from "../constants";
import type { Product } from "../types";

interface Props {
	products: Product[];
	isLoading: boolean;
	isError: boolean;
	tab: TabKey;
	search: string;
	page: number;
	total: number;
	totalPages: number;
	lowCount: number;
	onTabChange: (key: TabKey) => void;
	onSearchChange: (v: string) => void;
	onPageChange: (p: number) => void;
	onAddClick: () => void;
	onStockClick: (p: Product) => void;
	onEditClick: (p: Product) => void;
	onDelete: (id: string) => void;
}

export function InventoryTable({
	products,
	isLoading,
	isError,
	tab,
	search,
	page,
	total,
	totalPages,
	lowCount,
	onTabChange,
	onSearchChange,
	onPageChange,
	onAddClick,
	onStockClick,
	onEditClick,
	onDelete,
}: Props) {
	return (
		<div className="card">
			{/* Toolbar */}
			<div className="card-hd">
				<div className="tabs" style={{ borderBottom: "none", marginBottom: 0 }}>
					{TABS.map(({ key, label }) => (
						<button
							key={key}
							className={`tab ${tab === key ? "active" : ""}`}
							onClick={() => onTabChange(key)}
						>
							{label}
							{key === "low" && lowCount > 0 && (
								<span
									style={{
										marginLeft: 4,
										background: "var(--warn)",
										color: "#fff",
										padding: "1px 6px",
										borderRadius: 10,
										fontSize: 10,
									}}
								>
									{lowCount}
								</span>
							)}
						</button>
					))}
				</div>

				<div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
					<input
						placeholder="Qidirish…"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						style={{
							padding: "4px 10px",
							borderRadius: 6,
							border: "1px solid var(--ivory-300)",
							fontSize: 13,
						}}
					/>
					<button className="btn btn-primary btn-sm" onClick={onAddClick}>
						<Plus size={14} /> Qo'shish
					</button>
				</div>
			</div>

			{/* Body */}
			{isLoading ? (
				<div style={{ padding: 48, textAlign: "center", color: "var(--ink-500)" }}>
					Yuklanmoqda…
				</div>
			) : isError ? (
				<div style={{ padding: 48, textAlign: "center", color: "var(--ink-500)" }}>
					Xatolik yuz berdi.
				</div>
			) : (
				<>
					<table className="tbl">
						<thead>
							<tr>
								<th>Mahsulot</th>
								<th>Kategoriya</th>
								<th className="num">Qoldiq</th>
								<th className="num">Min.</th>
								<th className="num">Tan narx</th>
								<th className="num">Sotuv</th>
								<th className="num">Qiymat</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{products.map((p) => {
								const isLow = p.stockQuantity <= p.minStock;
								return (
									<tr key={p.id}>
										<td>
											<div
												style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
											>
												{isLow && <AlertTriangle size={13} style={{ color: "var(--warn)" }} />}
												{p.name}
											</div>
											<div style={{ fontSize: 11, color: "var(--ink-500)" }}>
												{UNIT_LABEL[p.unit]}
												{!p.isAvailable && (
													<span style={{ marginLeft: 6, color: "var(--ink-400)" }}>
														· Mavjud emas
													</span>
												)}
											</div>
										</td>
										<td>
											<span className="chip neutral">{CATEGORY_LABEL[p.category]}</span>
										</td>
										<td className="num">
											<span className={isLow ? "stock-bad" : "stock-ok"}>{p.stockQuantity}</span>
										</td>
										<td className="num" style={{ color: "var(--ink-500)" }}>
											{p.minStock}
										</td>
										<td className="num font-mono">{fmtSom(p.costPrice)}</td>
										<td className="num font-mono">{fmtSom(p.sellingPrice)}</td>
										<td className="num font-mono" style={{ fontWeight: 600 }}>
											{fmtSom(p.stockQuantity * p.costPrice)}
										</td>
										<td>
											<div style={{ display: "flex", gap: 4 }}>
												<button
													className="btn btn-ghost btn-sm"
													onClick={() => onStockClick(p)}
													title="Keltirish"
												>
													<Plus size={13} />
												</button>
												<button
													className="btn btn-ghost btn-sm"
													onClick={() => onEditClick(p)}
													title="Tahrirlash"
												>
													<Edit size={13} />
												</button>
												<Popconfirm
													title="Mahsulotni o'chirasizmi?"
													onConfirm={() => onDelete(p.id)}
													okText="Ha"
													cancelText="Yo'q"
													okType="danger"
												>
													<button
														className="btn btn-ghost btn-sm"
														style={{ color: "var(--danger)" }}
													>
														✕
													</button>
												</Popconfirm>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					{/* Pagination */}
					{totalPages > 1 && (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								padding: "12px 18px",
								borderTop: "1px solid var(--ivory-200)",
							}}
						>
							<span style={{ fontSize: 13, color: "var(--ink-500)" }}>
								{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total} ta
							</span>

							<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
								<button
									className="btn btn-ghost btn-sm"
									onClick={() => onPageChange(Math.max(1, page - 1))}
									disabled={page === 1}
								>
									<ChevronLeft size={15} />
								</button>

								{Array.from({ length: totalPages }, (_, i) => i + 1)
									.filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
									.reduce<(number | "dot")[]>((acc, n, idx, arr) => {
										if (idx > 0 && n - (arr[idx - 1] as number) > 1) {
											acc.push("dot");
										}
										acc.push(n);
										return acc;
									}, [])
									.map((item, idx) =>
										item === "dot" ? (
											<span
												key={`dot-${idx}`}
												style={{ padding: "0 4px", color: "var(--ink-400)" }}
											>
												…
											</span>
										) : (
											<button
												key={item}
												onClick={() => onPageChange(item as number)}
												style={{
													minWidth: 32,
													height: 32,
													borderRadius: 6,
													border: "none",
													fontSize: 13,
													fontWeight: page === item ? 600 : 400,
													cursor: "pointer",
													background: page === item ? "var(--felt-700)" : "transparent",
													color: page === item ? "#fff" : "var(--ink-700)",
												}}
											>
												{item}
											</button>
										)
									)}

								<button
									className="btn btn-ghost btn-sm"
									onClick={() => onPageChange(Math.min(totalPages, page + 1))}
									disabled={page === totalPages}
								>
									<ChevronRight size={15} />
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
