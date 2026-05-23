import {
	ArrowDownOutlined,
	ArrowUpOutlined,
	ShopOutlined,
	ShoppingCartOutlined,
	StopOutlined,
	TableOutlined,
} from "@ant-design/icons";
import { Input, InputNumber, Modal, Popconfirm, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import {
	useActiveShift,
	useCashTransaction,
	useCloseShift,
	useLastClosedShift,
	useOpenShift,
	useShiftPayments,
	useShiftSummary,
} from "../hooks/useShifts";
import type { CashType } from "../types";
import { ZReportReceipt } from "./Zreportreceipt ";

// ─── Helpers ──────────────────────────────────────────────────
function fmtSom(n: number) {
	return n.toLocaleString("uz-UZ");
}
function fmtTime(iso: string) {
	return new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}
function _fmtDate(iso: string) {
	return new Date(iso).toLocaleDateString("uz-UZ", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}
function calcDuration(openedAt: string, closedAt?: string | null): string {
	const ms = (closedAt ? new Date(closedAt).getTime() : Date.now()) - new Date(openedAt).getTime();
	const h = Math.floor(ms / 3_600_000);
	const m = Math.floor((ms % 3_600_000) / 60_000);
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const PAY_METHOD_LABEL: Record<string, string> = {
	naqd: "Naqd",
	karta: "Karta",
	click: "Click",
	payme: "Payme",
	installment: "Bo'lib",
};

// ─── Mini stat card ───────────────────────────────────────────
function StatCard({
	icon,
	label,
	value,
	sub,
	color = "#f0f7f3",
	iconColor = "var(--felt-700)",
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
	sub?: React.ReactNode;
	color?: string;
	iconColor?: string;
}) {
	return (
		<div
			style={{
				padding: "14px 16px",
				background: "var(--ivory-50)",
				border: "1px solid var(--ivory-200)",
				borderRadius: 8,
				display: "flex",
				alignItems: "center",
				gap: 12,
			}}
		>
			<div
				style={{
					width: 40,
					height: 40,
					borderRadius: 10,
					background: color,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					fontSize: 18,
					color: iconColor,
				}}
			>
				{icon}
			</div>
			<div style={{ minWidth: 0 }}>
				<div style={{ fontSize: 11, color: "var(--ink-500)", marginBottom: 2 }}>{label}</div>
				<div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
				{sub && <div style={{ fontSize: 11, color: "var(--danger)", marginTop: 2 }}>{sub}</div>}
			</div>
		</div>
	);
}

// ─── PrintView ────────────────────────────────────────────────
function PrintView({
	closedShift,
	onDone,
}: {
	closedShift: NonNullable<ReturnType<typeof useCloseShift>["closedShiftData"]>;
	onDone: () => void;
}) {
	const { data: summary, isLoading } = useShiftSummary(closedShift.shift.id);

	useEffect(() => {
		if (isLoading) {
			return;
		}
		const t = setTimeout(() => {
			window.print();
			onDone();
		}, 300);
		return () => clearTimeout(t);
	}, [isLoading, onDone]);

	return (
		<>
			<div
				className="no-print"
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 1000,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: "rgba(255,255,255,0.88)",
					gap: 16,
				}}
			>
				<Spin size="large" />
				<div style={{ fontSize: 15, color: "var(--ink-600)", fontWeight: 500 }}>
					{isLoading ? "Hisobot yuklanmoqda..." : "Chek chop etilmoqda..."}
				</div>
			</div>
			<div
				style={{
					position: "fixed",
					top: 0,
					left: "-9999px",
					width: 302,
					pointerEvents: "none",
					overflow: "hidden",
				}}
			>
				<ZReportReceipt closedShift={closedShift} summary={summary ?? null} />
			</div>
		</>
	);
}

function LastShift() {
	const [openingCash, _setOpeningCash] = useState<number | null>(0);
	const { mutate: open, isPending: opening } = useOpenShift();
	const [, setPrintLastShift] = useState(false);

	return (
		<>
			<div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "end" }}>
				{/* Check (Z-report) tugmasi — oxirgi smena ID si bilan */}
				<Popconfirm
					title="Hisobotni chiqarish"
					description="Oxirgi smena uchun Z-hisobot chiqarilsinmi?"
					onConfirm={() => setPrintLastShift(true)}
					okText="Ha"
					cancelText="Yo'q"
				>
					<button className="btn btn-ghost btn-sm">Z-hisobot</button>
				</Popconfirm>

				{/* Smenani ochish tugmasi */}
				<button
					className="btn btn-primary btn-lg"
					onClick={() => open({ openingCash: openingCash ?? 0 })}
					disabled={opening}
				>
					{opening ? "Ochilmoqda..." : "Smenani ochish"}
				</button>
			</div>
		</>
	);
}

// ─── LastShiftPanel — yopilgan oxirgi smena ───────────────────
function LastShiftPanel() {
	const { data: lastShift, isLoading } = useLastClosedShift();
	const { data: payments, isLoading: pLoading } = useShiftPayments(lastShift?.id ?? "");
	const { mutate: open, isPending: opening } = useOpenShift();
	const { closedShiftData, clearClosedShift } = useCloseShift();

	const [openingCash, _setOpeningCash] = useState<number | null>(0);
	const [printLastShift, setPrintLastShift] = useState(false);
	// const { data: lastShiftSummary } = useShiftSummary(printLastShift ? (lastShift?.id ?? "") : "");
	// ✅ Print overlay
	if (closedShiftData) {
		return <PrintView closedShift={closedShiftData} onDone={clearClosedShift} />;
	}
	if (isLoading) {
		return (
			<div style={{ padding: 24, textAlign: "center" }}>
				<Spin size="small" />
			</div>
		);
	}

	if (!lastShift) {
		return (
			<div
				style={{
					padding: "20px 0",
					textAlign: "center",
					color: "var(--ink-400)",
					fontSize: 13,
				}}
			>
				Oldingi smena mavjud emas
			</div>
		);
	}

	if (printLastShift && lastShift) {
		const fakeClosedShift = {
			shift: lastShift,
			stats: {
				totalCash: lastShift.totalCash ?? 0,
				totalCard: lastShift.totalCard ?? 0,
				totalClick: lastShift.totalClick ?? 0,
				totalReceipts: lastShift.totalReceipts ?? 0,
				cancelledReceipts: lastShift.cancelledReceipts ?? 0,
			},
		} as NonNullable<ReturnType<typeof useCloseShift>["closedShiftData"]>;

		return <PrintView closedShift={fakeClosedShift} onDone={() => setPrintLastShift(false)} />;
	}

	const totalRevenue =
		(lastShift.totalCash ?? 0) + (lastShift.totalCard ?? 0) + (lastShift.totalClick ?? 0);
	const activePays =
		payments?.filter((p) => p.status !== "cancelled" && p.status !== "refunded") ?? [];
	const cancelledPays =
		payments?.filter((p) => p.status === "cancelled" || p.status === "refunded") ?? [];
	const uniqueTables = new Set(payments?.map((p) => p.check.session.table.name) ?? []);

	return (
		<div className="shift-layot">
			<div style={{ display: "flex", gap: 14 }}>
				<div className="card" style={{ flex: 1 }}>
					<div className="card-hd">
						<h3>Aktiv smena</h3>
						<span className="chip ok" style={{ marginLeft: 8 }}>
							● Ochiq
						</span>
					</div>

					<div className="card-body">
						{/* Meta */}
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(4,1fr)",
								gap: 18,
								marginBottom: 20,
							}}
						>
							{[
								{ lbl: "Ochilgan", val: fmtTime(lastShift.openedAt) },
								{ lbl: "Davomiyligi", val: calcDuration(lastShift.openedAt) },
								{
									lbl: "Boshlang'ich naqd",
									val: `${fmtSom(lastShift.openingCash)} so'm`,
								},
								{
									lbl: "Rejalashtirilgan yopilish",
									val: lastShift.scheduledClose ? fmtTime(lastShift.scheduledClose) : "—",
								},
							].map(({ lbl, val }) => (
								<div key={lbl}>
									<div className="m-lbl">{lbl}</div>
									<div
										style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}
										className="font-mono"
									>
										{val}
									</div>
								</div>
							))}
						</div>

						{/* Statistika kartalar */}
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(3,1fr)",
								gap: 12,
								marginBottom: 16,
							}}
						>
							<StatCard
								icon={<ShoppingCartOutlined />}
								label="Sotilgan cheklar"
								value={activePays.length ? <Spin size="small" /> : activePays.length}
								sub={cancelledPays.length > 0 ? `${cancelledPays.length} ta bekor` : undefined}
								color="var(--felt-100, #d1ead9)"
								iconColor="var(--felt-700, #2e7d50)"
							/>
							<StatCard
								icon={<TableOutlined />}
								label="Xizmat qilingan stollar"
								value={activePays.length ? <Spin size="small" /> : uniqueTables.size}
								color="#e8f4fd"
								iconColor="#1890ff"
							/>
							<div
								style={{
									padding: "14px 16px",
									background: "var(--felt-50, #f0f7f3)",
									border: "1px solid var(--felt-200, #c5dfd0)",
									borderRadius: 8,
									display: "flex",
									alignItems: "center",
									gap: 12,
								}}
							>
								<div
									style={{
										width: 40,
										height: 40,
										borderRadius: 10,
										background: "var(--felt-200, #c5dfd0)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
										fontSize: 18,
										color: "var(--felt-700)",
									}}
								>
									<ShopOutlined />
								</div>
								<div>
									<div style={{ fontSize: 11, color: "var(--ink-500)", marginBottom: 2 }}>
										Jami tushum
									</div>
									<div
										style={{
											fontSize: 16,
											fontWeight: 700,
											color: "var(--felt-700)",
											lineHeight: 1.2,
										}}
									>
										{fmtSom(totalRevenue)}
										<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 3 }}>so'm</span>
									</div>
								</div>
							</div>
						</div>

						{/* KPI */}
						<div className="kpi-row" style={{ marginBottom: 0 }}>
							<div className="kpi">
								<div className="lbl">Naqd kassa</div>
								<div className="val">
									{fmtSom(lastShift.totalCash)} <span className="unit">so'm</span>
								</div>
								<div className="delta">Boshlang'ich: {fmtSom(lastShift.openingCash)}</div>
							</div>
							<div className="kpi">
								<div className="lbl">Karta tushum</div>
								<div className="val">{fmtSom(lastShift.totalCard)}</div>
							</div>
							<div className="kpi">
								<div className="lbl">QR / Click</div>
								<div className="val">{fmtSom(lastShift.totalClick)}</div>
							</div>
							<div className="kpi">
								<div className="lbl">Cheklar soni</div>
								<div className="val">{lastShift.totalReceipts}</div>
								<div className="delta">{lastShift.cancelledReceipts} tasi bekor qilindi</div>
							</div>
						</div>

						{/* Jami banner */}
						<div
							style={{
								marginTop: 16,
								padding: "12px 16px",
								background: "var(--felt-50, #f0f7f3)",
								border: "1px solid var(--felt-200, #c5dfd0)",
								borderRadius: 8,
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<span style={{ fontWeight: 600, color: "var(--ink-700)" }}>Jami tushum</span>
							<span style={{ fontWeight: 700, fontSize: 18, color: "var(--felt-700)" }}>
								{fmtSom(totalRevenue)} so'm
							</span>
						</div>

						{/* Yopish */}
						<div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "end" }}>
							{/* Check (Z-report) tugmasi — oxirgi smena ID si bilan */}
							<Popconfirm
								title="Hisobotni chiqarish"
								description="Oxirgi smena uchun Z-hisobot chiqarilsinmi?"
								onConfirm={() => setPrintLastShift(true)}
								okText="Ha"
								cancelText="Yo'q"
							>
								<button className="btn btn-ghost btn-sm">Z-hisobot</button>
							</Popconfirm>

							{/* Smenani ochish tugmasi */}
							<button
								className="btn btn-primary btn-lg"
								onClick={() => open({ openingCash: openingCash ?? 0 })}
								disabled={opening}
							>
								{opening ? "Ochilmoqda..." : "Smenani ochish"}
							</button>
						</div>
					</div>
				</div>

				{/* ── O'ng: oxirgi to'lovlar ── */}
				<div className="card" style={{ minWidth: "500px" }}>
					<div className="card-hd">
						<h3>Oxirgi to'lovlar</h3>
						{payments && (
							<span style={{ fontSize: 12, color: "var(--ink-400)", marginLeft: "auto" }}>
								{payments.length} ta
							</span>
						)}
					</div>
					<div className="card-body" style={{ padding: 0, maxHeight: 520, overflow: "auto" }}>
						{pLoading ? (
							<div style={{ padding: 24, textAlign: "center" }}>
								<Spin size="small" />
							</div>
						) : payments?.length ? (
							payments.map((p) => {
								const isNeg = p.status === "cancelled" || p.status === "refunded";
								return (
									<div
										key={p.id}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 10,
											padding: "11px 18px",
											borderBottom: "1px solid var(--ivory-200)",
											fontSize: 13,
										}}
									>
										<span
											className="font-mono"
											style={{ color: "var(--ink-500)", width: 40, fontSize: 12 }}
										>
											{fmtTime(p.createdAt)}
										</span>
										<span style={{ flex: 1, fontWeight: 500 }}>
											{isNeg ? "Bekor" : "Chek"} · {p.check.session.table.name}
										</span>
										<span style={{ fontSize: 11, color: "var(--ink-400)", marginRight: 2 }}>
											#{p.receiptNumber}
										</span>
										<span style={{ fontSize: 11, color: "var(--ink-500)" }}>
											{PAY_METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
										</span>
										<span
											className="font-mono"
											style={{
												fontWeight: 600,
												color: isNeg ? "var(--danger)" : "var(--ink-900)",
												minWidth: 90,
												textAlign: "right",
											}}
										>
											{isNeg ? "−" : ""}
											{fmtSom(p.totalAmount)}
										</span>
									</div>
								);
							})
						) : (
							<div
								style={{
									padding: 24,
									textAlign: "center",
									color: "var(--ink-400)",
									fontSize: 13,
								}}
							>
								To'lovlar mavjud emas
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── ShiftView — asosiy komponent ────────────────────────────
export function ShiftView() {
	const [, setTick] = useState(0);
	useEffect(() => {
		const t = setInterval(() => setTick((x) => x + 1), 60_000);
		return () => clearInterval(t);
	}, []);

	const { data, isLoading, isError } = useActiveShift();
	const { mutate: close, isPending: closing, closedShiftData, clearClosedShift } = useCloseShift();
	const { mutate: cashTx, isPending: cashPending } = useCashTransaction();

	const [cashModal, setCashModal] = useState(false);
	const [cashType, setCashType] = useState<CashType>("kirim");
	const [cashAmount, setCashAmount] = useState<number | null>(null);
	const [cashReason, setCashReason] = useState("");

	const shiftId = data?.shift?.id ?? "";
	const { data: payments, isLoading: paymentsLoading } = useShiftPayments(shiftId);

	const handleCash = () => {
		if (!cashAmount) {
			return;
		}
		cashTx(
			{
				id: shiftId,
				data: { type: cashType, amount: cashAmount, reason: cashReason || undefined },
			},
			{
				onSuccess: () => {
					setCashModal(false);
					setCashAmount(null);
					setCashReason("");
				},
			}
		);
	};

	if (isLoading) {
		return (
			<div className="session-loading">
				<Spin size="large" />
			</div>
		);
	}

	// ── Print overlay (smena yopilgandan keyin) ──
	if (closedShiftData) {
		return <PrintView closedShift={closedShiftData} onDone={clearClosedShift} />;
	}

	if (isError || !data) {
		return <LastShiftPanel />;
	}
	if (!data?.shift === null) {
		return <LastShift />;
	}

	// ── Smena OCHIQ ──
	const { shift, stats } = data;
	const totalRevenue = stats.totalCash + stats.totalCard + stats.totalClick;
	const activePays =
		payments?.filter((p) => p.status !== "cancelled" && p.status !== "refunded") ?? [];
	const cancelledPays =
		payments?.filter((p) => p.status === "cancelled" || p.status === "refunded") ?? [];
	const uniqueTables = new Set(payments?.map((p) => p.check.session.table.name) ?? []);

	return (
		<div className="shift-layout">
			{/* ── Chap: aktiv smena ── */}
			<div className="card" style={{ flex: 1 }}>
				<div className="card-hd">
					<h3>Aktiv smena</h3>
					<span className="chip ok" style={{ marginLeft: 8 }}>
						● Ochiq
					</span>
				</div>

				<div className="card-body">
					{/* Meta */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(4,1fr)",
							gap: 18,
							marginBottom: 20,
						}}
					>
						{[
							{ lbl: "Ochilgan", val: fmtTime(shift.openedAt) },
							{ lbl: "Davomiyligi", val: calcDuration(shift.openedAt) },
							{
								lbl: "Boshlang'ich naqd",
								val: `${fmtSom(shift.openingCash)} so'm`,
							},
							{
								lbl: "Rejalashtirilgan yopilish",
								val: shift.scheduledClose ? fmtTime(shift.scheduledClose) : "—",
							},
						].map(({ lbl, val }) => (
							<div key={lbl}>
								<div className="m-lbl">{lbl}</div>
								<div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }} className="font-mono">
									{val}
								</div>
							</div>
						))}
					</div>

					{/* Statistika kartalar */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(3,1fr)",
							gap: 12,
							marginBottom: 16,
						}}
					>
						<StatCard
							icon={<ShoppingCartOutlined />}
							label="Sotilgan cheklar"
							value={paymentsLoading ? <Spin size="small" /> : activePays.length}
							sub={cancelledPays.length > 0 ? `${cancelledPays.length} ta bekor` : undefined}
							color="var(--felt-100, #d1ead9)"
							iconColor="var(--felt-700, #2e7d50)"
						/>
						<StatCard
							icon={<TableOutlined />}
							label="Xizmat qilingan stollar"
							value={paymentsLoading ? <Spin size="small" /> : uniqueTables.size}
							color="#e8f4fd"
							iconColor="#1890ff"
						/>
						<div
							style={{
								padding: "14px 16px",
								background: "var(--felt-50, #f0f7f3)",
								border: "1px solid var(--felt-200, #c5dfd0)",
								borderRadius: 8,
								display: "flex",
								alignItems: "center",
								gap: 12,
							}}
						>
							<div
								style={{
									width: 40,
									height: 40,
									borderRadius: 10,
									background: "var(--felt-200, #c5dfd0)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
									fontSize: 18,
									color: "var(--felt-700)",
								}}
							>
								<ShopOutlined />
							</div>
							<div>
								<div style={{ fontSize: 11, color: "var(--ink-500)", marginBottom: 2 }}>
									Jami tushum
								</div>
								<div
									style={{
										fontSize: 16,
										fontWeight: 700,
										color: "var(--felt-700)",
										lineHeight: 1.2,
									}}
								>
									{fmtSom(totalRevenue)}
									<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 3 }}>so'm</span>
								</div>
							</div>
						</div>
					</div>

					{/* KPI */}
					<div className="kpi-row" style={{ marginBottom: 0 }}>
						<div className="kpi">
							<div className="lbl">Naqd kassa</div>
							<div className="val">
								{fmtSom(stats.totalCash)} <span className="unit">so'm</span>
							</div>
							<div className="delta">Boshlang'ich: {fmtSom(shift.openingCash)}</div>
						</div>
						<div className="kpi">
							<div className="lbl">Karta tushum</div>
							<div className="val">{fmtSom(stats.totalCard)}</div>
						</div>
						<div className="kpi">
							<div className="lbl">QR / Click</div>
							<div className="val">{fmtSom(stats.totalClick)}</div>
						</div>
						<div className="kpi">
							<div className="lbl">Cheklar soni</div>
							<div className="val">{stats.totalReceipts}</div>
							<div className="delta">{stats.cancelledReceipts} tasi bekor qilindi</div>
						</div>
					</div>

					{/* Jami banner */}
					<div
						style={{
							marginTop: 16,
							padding: "12px 16px",
							background: "var(--felt-50, #f0f7f3)",
							border: "1px solid var(--felt-200, #c5dfd0)",
							borderRadius: 8,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<span style={{ fontWeight: 600, color: "var(--ink-700)" }}>Jami tushum</span>
						<span style={{ fontWeight: 700, fontSize: 18, color: "var(--felt-700)" }}>
							{fmtSom(totalRevenue)} so'm
						</span>
					</div>

					{/* Tranzaksiya */}
					<div
						style={{
							marginTop: 16,
							padding: 16,
							background: "var(--ivory-50)",
							border: "1px dashed var(--ivory-300)",
							borderRadius: 6,
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
							<div style={{ flex: 1 }}>
								<div style={{ fontWeight: 600 }}>Kassadan olish / qo'shish</div>
								<div style={{ fontSize: 12, color: "var(--ink-500)" }}>
									Kassadagi pulni hisobotga olish
								</div>
							</div>
							<button className="btn btn-ghost btn-sm" onClick={() => setCashModal(true)}>
								Tranzaksiya
							</button>
						</div>
					</div>

					{/* Yopish */}
					<div style={{ marginTop: 14, display: "flex" }}>
						{/* bu "check" tugmasini olib tashlang yoki Z-hisobot qiling */}
						<Popconfirm
							title="Smenani yopish"
							description="Haqiqatan ham smenani yopmoqchimisiz?"
							onConfirm={() => close(shift.id)}
							okText="Ha, yopish"
							cancelText="Yo'q"
						>
							<button
								className="btn btn-danger btn-lg"
								style={{ marginLeft: "auto" }}
								disabled={closing}
							>
								<StopOutlined /> {closing ? "Yopilmoqda..." : "Smenani yopish"}
							</button>
						</Popconfirm>
					</div>
				</div>
			</div>

			{/* ── O'ng: oxirgi to'lovlar ── */}
			<div className="card">
				<div className="card-hd">
					<h3>Oxirgi to'lovlar</h3>
					{payments && (
						<span style={{ fontSize: 12, color: "var(--ink-400)", marginLeft: "auto" }}>
							{payments.length} ta
						</span>
					)}
				</div>
				<div className="card-body" style={{ padding: 0, maxHeight: 520, overflow: "auto" }}>
					{paymentsLoading ? (
						<div style={{ padding: 24, textAlign: "center" }}>
							<Spin size="small" />
						</div>
					) : payments?.length ? (
						payments.map((p) => {
							const isNeg = p.status === "cancelled" || p.status === "refunded";
							return (
								<div
									key={p.id}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 10,
										padding: "11px 18px",
										borderBottom: "1px solid var(--ivory-200)",
										fontSize: 13,
									}}
								>
									<span
										className="font-mono"
										style={{ color: "var(--ink-500)", width: 40, fontSize: 12 }}
									>
										{fmtTime(p.createdAt)}
									</span>
									<span style={{ flex: 1, fontWeight: 500 }}>
										{isNeg ? "Bekor" : "Chek"} · {p.check.session.table.name}
									</span>
									<span style={{ fontSize: 11, color: "var(--ink-400)", marginRight: 2 }}>
										#{p.receiptNumber}
									</span>
									<span style={{ fontSize: 11, color: "var(--ink-500)" }}>
										{PAY_METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
									</span>
									<span
										className="font-mono"
										style={{
											fontWeight: 600,
											color: isNeg ? "var(--danger)" : "var(--ink-900)",
											minWidth: 90,
											textAlign: "right",
										}}
									>
										{isNeg ? "−" : ""}
										{fmtSom(p.totalAmount)}
									</span>
								</div>
							);
						})
					) : (
						<div
							style={{
								padding: 24,
								textAlign: "center",
								color: "var(--ink-400)",
								fontSize: 13,
							}}
						>
							To'lovlar mavjud emas
						</div>
					)}
				</div>
			</div>

			{/* ── Cash Modal ── */}
			<Modal
				title="Kassa tranzaksiyasi"
				open={cashModal}
				onCancel={() => setCashModal(false)}
				onOk={handleCash}
				okText="Amalga oshirish"
				cancelText="Bekor"
				confirmLoading={cashPending}
				okButtonProps={{ disabled: !cashAmount }}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
					<div>
						<div className="m-lbl" style={{ marginBottom: 6 }}>
							Tur
						</div>
						<Select
							style={{ width: "100%" }}
							value={cashType}
							onChange={setCashType}
							options={[
								{
									value: "kirim",
									label: (
										<span style={{ color: "var(--felt-700)" }}>
											<ArrowDownOutlined style={{ marginRight: 6 }} />
											Kirim (kassaga qo'shish)
										</span>
									),
								},
								{
									value: "chiqim",
									label: (
										<span style={{ color: "var(--danger, #e53e3e)" }}>
											<ArrowUpOutlined style={{ marginRight: 6 }} />
											Chiqim (kassadan olish)
										</span>
									),
								},
							]}
						/>
					</div>
					<div>
						<div className="m-lbl" style={{ marginBottom: 6 }}>
							Miqdor *
						</div>
						<InputNumber
							style={{ width: "100%" }}
							value={cashAmount}
							onChange={setCashAmount}
							min={1}
							addonAfter="so'm"
							formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
						/>
					</div>
					<div>
						<div className="m-lbl" style={{ marginBottom: 6 }}>
							Sabab
						</div>
						<Input
							value={cashReason}
							onChange={(e) => setCashReason(e.target.value)}
							placeholder="Mayda pul uchun (ixtiyoriy)"
						/>
					</div>
				</div>
			</Modal>
		</div>
	);
}
