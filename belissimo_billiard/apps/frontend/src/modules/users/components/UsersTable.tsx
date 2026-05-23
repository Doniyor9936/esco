import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { User } from "../types/users.types";
import { fmtDate, getInitials, PAGE_SIZE } from "./constants";

interface Props {
	users: User[];
	isLoading: boolean;
	search: string;
	page: number;
	total: number;
	totalPages: number;
	onSearchChange: (v: string) => void;
	onPageChange: (p: number) => void;
	onAddClick: () => void;
	onEditClick: (user: User) => void;
}

export function UsersTable({
	users,
	isLoading,
	search,
	page,
	total,
	totalPages,
	onSearchChange,
	onPageChange,
	onAddClick,
	onEditClick,
}: Props) {
	return (
		<div className="card">
			{/* Toolbar */}
			<div className="card-hd">
				<h3>Foydalanuvchilar bazasi</h3>
				<div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
					<div className="menu-search" style={{ margin: 0, width: 260 }}>
						<SearchOutlined style={{ color: "var(--ink-500)", fontSize: 15 }} />
						<input
							placeholder="Ism yoki telefon..."
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
					</div>
					<button className="btn btn-primary btn-sm" onClick={onAddClick}>
						<PlusOutlined style={{ fontSize: 13 }} /> Yangi foydalanuvchi
					</button>
				</div>
			</div>

			{/* Body */}
			{isLoading ? (
				<div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
					<Spin size="large" />
				</div>
			) : users.length === 0 ? (
				<div
					style={{
						padding: "40px 18px",
						textAlign: "center",
						color: "var(--ink-400)",
						fontSize: 13,
					}}
				>
					Foydalanuvchilar topilmadi
				</div>
			) : (
				<>
					<table className="tbl">
						<thead>
							<tr>
								<th>Foydalanuvchi</th>
								<th>Telefon</th>
								<th>Status</th>
								<th>Ro'yxatdan o'tgan</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id}>
									<td>
										<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
											<div
												className="cust-avatar"
												style={{
													background: user.isActive ? "var(--felt-700)" : "var(--ink-400)",
												}}
											>
												{getInitials(user.fullname)}
											</div>
											<div style={{ fontWeight: 600 }}>{user.fullname}</div>
										</div>
									</td>
									<td className="font-mono" style={{ fontSize: 12 }}>
										{user.phone}
									</td>
									<td>
										<span className={`chip ${user.isActive ? "ok" : "neutral"}`}>
											{user.isActive ? "● Aktiv" : "○ Nofaol"}
										</span>
									</td>
									<td style={{ color: "var(--ink-500)", fontSize: 12 }}>
										{fmtDate(user.createdAt)}
									</td>
									<td>
										<button
											className="btn btn-ghost btn-sm"
											onClick={() => onEditClick(user)}
											title="Tahrirlash"
										>
											<EditOutlined style={{ fontSize: 13 }} />
										</button>
									</td>
								</tr>
							))}
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
