import {
	DeleteOutlined,
	MinusOutlined,
	PlusOutlined,
	PrinterOutlined,
	StopOutlined,
} from "@ant-design/icons";
import { Alert, Button, Input, InputNumber, Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import { useDeleteOrderItem, useSessionOrder, useUpdateOrderItem } from "../../menu/hooks/useMenu";
import {
	useCloseSession,
	useSession,
	useUpdateSessionDiscount,
	useUpdateSessionRate,
} from "../hooks/useSessions";
import type { Session } from "../types/sessions.types";

// ─── Helpers ─────────────────────────────────────────────────
function fmtSom(n: number) {
	return n.toLocaleString("uz-UZ");
}

function fmtDur(seconds: number) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcElapsedSeconds(startedAt: string, elapsedMinutes: number, isRunning: boolean) {
	if (!isRunning) {
		return elapsedMinutes * 60;
	}
	return Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
}

const TYPE_LABEL: Record<string, string> = {
	america: "Amerika",
	rus_piramida: "Rus piramidasi",
	snooker: "Snooker",
};

interface SessionViewProps {
	sessionId: string;
	onBack?: () => void;
	onCheckout?: (session: Session) => void;
	onAddMenu?: () => void;
	checkoutPending?: boolean;
}

export function SessionView({
	sessionId,
	onBack,
	onCheckout,
	onAddMenu,
	checkoutPending,
}: SessionViewProps) {
	const [, setTick] = useState(0);
	useEffect(() => {
		const t = setInterval(() => setTick((x) => x + 1), 1000);
		return () => clearInterval(t);
	}, []);

	const { data: session, isLoading, isError, refetch } = useSession(sessionId);
	const { mutate: close } = useCloseSession();
	const { mutate: setRate, isPending: ratingBusy } = useUpdateSessionRate();
	const { mutate: setDiscount } = useUpdateSessionDiscount();

	// ── Buyurtmalar ──
	const { data: existingOrder, isLoading: orderLoading } = useSessionOrder(sessionId);
	const { mutate: updateItem } = useUpdateOrderItem();
	const { mutate: deleteItem } = useDeleteOrderItem();

	const [rateModal, setRateModal] = useState(false);
	const [discountModal, setDiscountModal] = useState(false);
	const [newRate, setNewRate] = useState<number | null>(null);
	const [discountAmt, setDiscountAmt] = useState<number | null>(null);
	const [discountNote, setDiscountNote] = useState("");

	if (isLoading) {
		return (
			<div className="session-loading">
				<Spin size="large" />
			</div>
		);
	}

	if (isError || !session) {
		return (
			<Alert
				type="error"
				title="Sessiya topilmadi"
				description="Ma'lumot yuklashda xatolik yuz berdi."
				action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
			/>
		);
	}

	const isActive = session.status === "active";
	const isPaused = session.status === "paused";
	const isRunning = isActive || isPaused;

	const elapsedSeconds = calcElapsedSeconds(session.startedAt, session.elapsedMinutes, isRunning);

	const gameAmount = isRunning
		? Math.floor((elapsedSeconds / 3600) * session.hourlyRate)
		: session.currentGameAmount;

	const orderAmount = session.orderAmount;
	const subtotal = gameAmount + orderAmount;
	const serviceCharge = Math.round(orderAmount * (session.serviceChargePct / 100));

	const total = subtotal + serviceCharge - session.discountAmount;

	const handleClose = () => {
		close(session.id);
	};

	const handleCheckout = () => {
		onCheckout?.(session);
	};

	return (
		<div className="session-layout">
			{/* ── Chap ustun ── */}
			<div className="session-col">
				<div className="card">
					<div className="session-hero">
						<div className="hero-title">
							<div className="hero-name">{session.tableName}</div>
							<div className="hero-sub">
								{TYPE_LABEL[session.tableType] ?? session.tableType}
								{session.guestCount ? ` · ${session.guestCount} mehmon` : ""}
								{session.guestName ? ` · ${session.guestName}` : ""}
							</div>
						</div>
						{/* {statusChip} */}
					</div>

					<div className="timer-panel">
						<div className="felt-big">
							<span className="pocket p-tl" />
							<span className="pocket p-tr" />
							<span className="pocket p-bl" />
							<span className="pocket p-br" />
							<span className="pocket p-tm" />
							<span className="pocket p-bm" />
							<div className="felt-big-inner">
								<div className="timer-display">
									<div className="t-lbl">O'yin vaqti</div>
									<div className="t-val font-mono">{fmtDur(elapsedSeconds)}</div>
									<div className="t-rate">{fmtSom(session.hourlyRate)} so'm / soat</div>
								</div>
								<div className="balls-rack">
									{[
										{ bg: "radial-gradient(circle at 30% 30%, #fff, #e8e1cf)", txt: "" },
										{ bg: "radial-gradient(circle at 30% 30%, #f1d087, #b8893c)", txt: "1" },
										{ bg: "radial-gradient(circle at 30% 30%, #6aa0d8, #2a5a8e)", txt: "2" },
										{ bg: "radial-gradient(circle at 30% 30%, #d86a6a, #8e2a2a)", txt: "3" },
										{ bg: "radial-gradient(circle at 30% 30%, #9b6ad8, #5a2a8e)", txt: "4" },
										{ bg: "radial-gradient(circle at 30% 30%, #d89966, #9e5a25)", txt: "5" },
										{ bg: "radial-gradient(circle at 30% 30%, #6ac07d, #2a7a3e)", txt: "6" },
										{ bg: "radial-gradient(circle at 30% 30%, #d8a96a, #7e4e1a)", txt: "7" },
										{
											bg: "radial-gradient(circle at 30% 30%, #2a2620, #000)",
											txt: "8",
											white: true,
										},
									].map((b, i) => (
										<span
											key={i}
											className="ball-m"
											style={{ background: b.bg, color: b.white ? "#fff" : undefined }}
										>
											{b.txt}
										</span>
									))}
								</div>
							</div>
						</div>

						<div className="timer-actions">
							{isRunning && (
								<button
									className="btn btn-danger"
									style={{ marginLeft: "auto" }}
									onClick={handleClose}
								>
									<StopOutlined /> Sessiyani yopish
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="card" style={{ marginTop: 14 }}>
					<div className="card-hd">
						<h3>Sessiya detallari</h3>
					</div>
					<div className="card-body">
						<div className="detail-grid">
							<div>
								<div className="m-lbl">Boshlangan</div>
								<div className="m-val">
									{new Date(session.startedAt).toLocaleTimeString("uz-UZ", {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</div>
							</div>
							<div>
								<div className="m-lbl">O'yin turi</div>
								<div className="m-val">{TYPE_LABEL[session.tableType] ?? session.tableType}</div>
							</div>
							<div>
								<div className="m-lbl">Mehmon ismi</div>
								<div className="m-val">{session.guestName ?? "—"}</div>
							</div>
							<div>
								<div className="m-lbl">Mehmonlar soni</div>
								<div className="m-val">{session.guestCount}</div>
							</div>
							<div>
								<div className="m-lbl">Chegirma</div>
								<div className="m-val">
									{session.discountAmount > 0 ? `${fmtSom(session.discountAmount)} so'm` : "—"}
								</div>
							</div>
							<div>
								<div className="m-lbl">Xizmat haqqi</div>
								<div className="m-val">{session.serviceChargePct}%</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ── O'ng ustun ── */}
			<div className="session-col">
				<div className="card">
					<div className="card-hd">
						<h3>Buyurtma</h3>
						<button
							className="btn btn-ghost btn-sm"
							style={{ marginLeft: "auto" }}
							onClick={onAddMenu}
						>
							<PlusOutlined /> Mahsulot qo'shish
						</button>
					</div>

					{/* ── Buyurtma ro'yxati ── */}
					<div className="flex flex-col max-h-[400px] overflow-y-auto">
						{orderLoading ? (
							<div className="p-4 text-center">
								<Spin size="small" />
							</div>
						) : existingOrder?.items?.length ? (
							existingOrder.items.map((item) => (
								<div
									key={item.id}
									className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center py-[11px] px-[18px] border-b border-[var(--ivory-200)] hover:bg-[rgba(245,240,228,0.4)] transition-colors text-[13px]"
								>
									{/* Mahsulot nomi va narxi */}
									<div className="min-w-0">
										<div className="font-semibold text-[var(--ink-900)] truncate">
											{item.productName}
										</div>
										<div className="text-[11px] text-[var(--ink-500)] mt-px">
											{fmtSom(item.unitPrice)} so'm
										</div>
									</div>

									{/* Soni boshqarish (Rasmga moslangan) */}
									<div className="flex items-center gap-3">
										<button
											onClick={() => {
												if (item.quantity <= 1) {
													deleteItem(item.id);
												} else {
													updateItem({ itemId: item.id, data: { quantity: item.quantity - 1 } });
												}
											}}
											className="w-7 h-7 flex items-center justify-center bg-[#f5f4f0] border border-[var(--ivory-300)] rounded-[6px] text-[#555] hover:bg-[var(--ivory-200)] transition-all active:scale-95"
										>
											<MinusOutlined style={{ fontSize: 10 }} />
										</button>

										<span className="min-w-[20px] text-center font-bold font-mono text-[var(--ink-900)] text-sm">
											{item.quantity}
										</span>

										<button
											onClick={() =>
												updateItem({ itemId: item.id, data: { quantity: item.quantity + 1 } })
											}
											className="w-7 h-7 flex items-center justify-center bg-[#f5f4f0] border border-[var(--ivory-300)] rounded-[6px] text-[#555] hover:bg-[var(--ivory-200)] transition-all active:scale-95"
										>
											<PlusOutlined style={{ fontSize: 10 }} />
										</button>
									</div>

									{/* Umumiy summa */}
									<div className="font-semibold font-mono min-w-[90px] text-right text-[var(--ink-900)]">
										{fmtSom(item.unitPrice * item.quantity)}
									</div>

									{/* O'chirish */}
									<button
										className="p-1 text-[var(--ink-400)] hover:text-[var(--danger)] transition-colors"
										onClick={() => deleteItem(item.id)}
									>
										<DeleteOutlined style={{ fontSize: 13 }} />
									</button>
								</div>
							))
						) : (
							<div className="py-6 px-[18px] text-center text-[var(--ink-400)]">
								Buyurtmalar mavjud emas
							</div>
						)}
					</div>

					<div className="order-summary">
						<div className="sum-row">
							<span>O'yin vaqti · {fmtDur(elapsedSeconds)}</span>
							<span className="font-mono">{fmtSom(gameAmount)}</span>
						</div>
						<div className="sum-row">
							<span>Mahsulotlar</span>
							<span className="font-mono">{fmtSom(orderAmount)}</span>
						</div>
						<div className="sum-row">
							<span>Xizmat haqqi ({session.serviceChargePct}%)</span>
							<span className="font-mono">{fmtSom(serviceCharge)}</span>
						</div>
						{session.discountAmount > 0 && (
							<div className="sum-row" style={{ color: "#16a34a" }}>
								<span>Chegirma{session.discountReason ? ` · ${session.discountReason}` : ""}</span>
								<span className="font-mono">−{fmtSom(session.discountAmount)}</span>
							</div>
						)}
						<div className="sum-row total">
							<span>Jami</span>
							<span className="font-mono">
								{fmtSom(Math.max(0, total))}{" "}
								<span style={{ fontSize: 12, color: "var(--ink-500)" }}>so'm</span>
							</span>
						</div>
					</div>

					{isRunning && (
						<div style={{ padding: "0 16px 12px" }}>
							<button
								className="btn btn-ghost"
								style={{ width: "100%" }}
								onClick={() => {
									setDiscountAmt(session.discountAmount);
									setDiscountModal(true);
								}}
							>
								Chegirma qo'shish / o'zgartirish
							</button>
						</div>
					)}

					<div className="order-actions">
						<button className="btn btn-ghost btn-lg">
							<PrinterOutlined /> Pre-chek
						</button>
						<button
							className="btn btn-gold btn-lg"
							style={{ flex: 1 }}
							onClick={handleCheckout}
							disabled={checkoutPending}
						>
							To'lovga o'tish
						</button>
					</div>
				</div>
			</div>

			{/* ── Rate Modal ── */}
			<Modal
				title="Tarifni o'zgartirish"
				open={rateModal}
				onCancel={() => setRateModal(false)}
				onOk={() => {
					if (!newRate) {
						return;
					}
					setRate(
						{ id: session.id, data: { hourlyRate: newRate } },
						{ onSuccess: () => setRateModal(false) }
					);
				}}
				okText="Saqlash"
				cancelText="Bekor"
				confirmLoading={ratingBusy}
			>
				<InputNumber
					style={{ width: "100%" }}
					value={newRate}
					onChange={(v) => setNewRate(v)}
					min={1}
					addonAfter="so'm / soat"
					formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
				/>
			</Modal>

			{/* ── Discount Modal ── */}
			<Modal
				title="Chegirma qo'shish"
				open={discountModal}
				onCancel={() => setDiscountModal(false)}
				onOk={() => {
					if (discountAmt == null) {
						return;
					}
					setDiscount(
						{ id: session.id, data: { discountAmount: discountAmt, discountReason: discountNote } },
						{ onSuccess: () => setDiscountModal(false) }
					);
				}}
				okText="Saqlash"
				cancelText="Bekor"
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					<InputNumber
						style={{ width: "100%" }}
						value={discountAmt}
						onChange={(v) => setDiscountAmt(v)}
						min={0}
						addonAfter="so'm"
						placeholder="Chegirma miqdori"
						formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
					/>
					<Input
						value={discountNote}
						onChange={(e) => setDiscountNote(e.target.value)}
						placeholder="Chegirma sababi (ixtiyoriy)"
					/>
				</div>
			</Modal>
		</div>
	);
}
