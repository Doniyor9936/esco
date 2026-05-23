import { DatePicker, Select } from "antd";
import type dayjs from "dayjs";
import { Download, Printer, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useShifts } from "../hooks/useReports";
import type { ReportPeriod, Shift } from "../types";

const { RangePicker } = DatePicker;

export type ExportType = "billiard" | "menu" | "all";
export type ExportPeriod = "daily" | "weekly" | "monthly" | "custom" | "shift";

export interface ExportOptions {
	exportType: ExportType;
	exportPeriod: ExportPeriod;
	range: [dayjs.Dayjs | null, dayjs.Dayjs | null];
	shiftId?: string;
}

interface ExportModalProps {
	open: boolean;
	onClose: () => void;
	onExport: (opts: ExportOptions) => void;
	onPrint: (opts: ExportOptions) => void;
	currentPeriod?: ReportPeriod;
	/** ReportsView da tanlangan smena — modal ochilganda avtomatik o'rnatiladi */
	selectedShiftId?: string;
}

const PERIOD_OPTIONS: { key: ExportPeriod; label: string }[] = [
	{ key: "daily", label: "Kunlik" },
	{ key: "weekly", label: "Haftalik" },
	{ key: "monthly", label: "Oylik" },
	{ key: "shift", label: "Smena" },
	{ key: "custom", label: "Ixtiyoriy" },
];

const TYPE_OPTIONS: { key: ExportType; label: string; desc: string }[] = [
	{
		key: "billiard",
		label: "Billiard stol tushumlari",
		desc: "Faqat billiard stollardan tushgan daromad",
	},
	{
		key: "menu",
		label: "Menyu tushumlari",
		desc: "Faqat menyu buyurtmalaridan tushgan daromad",
	},
	{
		key: "all",
		label: "Barcha tushumlar",
		desc: "Billiard va menyu tushumlari birgalikda",
	},
];

function fmtShiftLabel(shift: Shift): string {
	const opened = new Date(shift.openedAt).toLocaleString("uz-UZ", {
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
	const closed = shift.closedAt
		? new Date(shift.closedAt).toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
		: null;
	const status = shift.status === "open" ? "🟢 Ochiq" : `⚫ ${closed ?? "Yopilgan"}`;
	return `${opened} — ${status}`;
}

export function ExportModal({
	open,
	onClose,
	onExport,
	onPrint,
	currentPeriod = "weekly",
	selectedShiftId,
}: ExportModalProps) {
	// Agar tashqaridan smena tanlangan bo'lsa — "shift" rejimidan boshlaymiz
	const initialPeriod: ExportPeriod = selectedShiftId
		? "shift"
		: currentPeriod === "custom"
			? "custom"
			: (currentPeriod as ExportPeriod);

	const [exportPeriod, setExportPeriod] = useState<ExportPeriod>(initialPeriod);
	const [exportType, setExportType] = useState<ExportType>("all");
	const [range, setRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
	// shiftId: tashqaridan kelgan yoki modal ichida tanlangan
	const [shiftId, setShiftId] = useState<string | undefined>(selectedShiftId);

	const { data: shifts = [], isLoading: shiftsLoading } = useShifts();

	// Modal qayta ochilganda state ni sinxronlashtirish
	useEffect(() => {
		if (open) {
			if (selectedShiftId) {
				setExportPeriod("shift");
				setShiftId(selectedShiftId);
			} else {
				const p: ExportPeriod =
					currentPeriod === "custom" ? "custom" : (currentPeriod as ExportPeriod);
				setExportPeriod(p);
				setShiftId(undefined);
			}
			setExportType("all");
			setRange([null, null]);
		}
	}, [open, selectedShiftId, currentPeriod]);

	if (!open) {
		return null;
	}

	const isCustomValid = exportPeriod !== "custom" || (range[0] !== null && range[1] !== null);
	const isShiftValid = exportPeriod !== "shift" || !!shiftId;
	const canSubmit = isCustomValid && isShiftValid;

	const currentOpts: ExportOptions = {
		exportType,
		exportPeriod,
		range,
		shiftId: exportPeriod === "shift" ? shiftId : undefined,
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Hisobotni eksport qilish"
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.45)",
				zIndex: 1000,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
			onKeyDown={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				style={{
					background: "var(--color-background-primary, #fff)",
					borderRadius: 12,
					padding: "24px",
					width: 440,
					maxWidth: "calc(100vw - 32px)",
					boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
				}}
			>
				{/* Header */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: 20,
					}}
				>
					<span style={{ fontWeight: 500, fontSize: 16 }}>Hisobotni eksport qilish</span>
					<button
						onClick={onClose}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							padding: 4,
							color: "var(--color-text-secondary)",
							display: "flex",
							alignItems: "center",
						}}
					>
						<X size={18} />
					</button>
				</div>

				{/* Davr tanlov */}
				<div style={{ marginBottom: 20 }}>
					<p
						style={{
							fontSize: 13,
							color: "var(--color-text-secondary)",
							fontWeight: 500,
							margin: "0 0 8px",
						}}
					>
						Davr
					</p>
					<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
						{PERIOD_OPTIONS.map((p) => {
							const active = exportPeriod === p.key;
							return (
								<button
									key={p.key}
									onClick={() => {
										setExportPeriod(p.key);
										// Smena rejimidan chiqqanda shiftId ni tozalash
										if (p.key !== "shift") {
											setShiftId(undefined);
										}
									}}
									style={{
										flex: "1 1 auto",
										padding: "8px 4px",
										borderRadius: 8,
										border: `1.5px solid ${active ? "var(--color-text-info, #185FA5)" : "var(--color-border-secondary)"}`,
										background: active ? "var(--color-background-info)" : "transparent",
										color: active ? "var(--color-text-info)" : "var(--color-text-primary)",
										fontWeight: active ? 500 : 400,
										fontSize: 13,
										cursor: "pointer",
										transition: "all .15s",
									}}
								>
									{p.label}
								</button>
							);
						})}
					</div>

					{/* Smena tanlov dropdown */}
					{exportPeriod === "shift" && (
						<div style={{ marginTop: 10 }}>
							<Select
								style={{ width: "100%" }}
								placeholder="Smenani tanlang"
								loading={shiftsLoading}
								value={shiftId}
								onChange={(val) => setShiftId(val)}
								options={shifts.map((s) => ({
									value: s.id,
									label: fmtShiftLabel(s),
								}))}
								notFoundContent="Smena topilmadi"
							/>
							{shiftId && (
								<p
									style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "6px 0 0" }}
								>
									✅ Faqat shu smenadagi tushumlar chiqariladi
								</p>
							)}
						</div>
					)}

					{/* Custom sana oralig'i */}
					{exportPeriod === "custom" && (
						<div style={{ marginTop: 10 }}>
							<RangePicker
								value={range}
								onChange={(vals) => setRange(vals ?? [null, null])}
								format="DD.MM.YYYY"
								style={{ width: "100%" }}
								placeholder={["Boshlanish", "Tugash"]}
							/>
						</div>
					)}
				</div>

				{/* Tushum turi */}
				<div style={{ marginBottom: 24 }}>
					<p
						style={{
							fontSize: 13,
							color: "var(--color-text-secondary)",
							fontWeight: 500,
							margin: "0 0 8px",
						}}
					>
						Tushum turi
					</p>
					<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
						{TYPE_OPTIONS.map((opt) => {
							const active = exportType === opt.key;
							return (
								<label
									key={opt.key}
									style={{
										display: "flex",
										alignItems: "flex-start",
										gap: 12,
										padding: "12px 14px",
										borderRadius: 8,
										border: `1.5px solid ${active ? "var(--color-text-info, #185FA5)" : "var(--color-border-secondary)"}`,
										background: active ? "var(--color-background-info)" : "transparent",
										cursor: "pointer",
										transition: "all .15s",
									}}
								>
									<input
										type="radio"
										name="exportType"
										value={opt.key}
										checked={active}
										onChange={() => setExportType(opt.key)}
										style={{ marginTop: 2, accentColor: "var(--color-text-info)" }}
									/>
									<div>
										<p
											style={{
												fontWeight: 500,
												fontSize: 14,
												color: active ? "var(--color-text-info)" : "var(--color-text-primary)",
												margin: 0,
											}}
										>
											{opt.label}
										</p>
										<p
											style={{
												fontSize: 12,
												color: "var(--color-text-secondary)",
												margin: "2px 0 0",
											}}
										>
											{opt.desc}
										</p>
									</div>
								</label>
							);
						})}
					</div>
				</div>

				{/* Footer */}
				<div style={{ display: "flex", gap: 8 }}>
					<button className="btn btn-ghost btn-sm" onClick={onClose} style={{ flex: 1 }}>
						Bekor qilish
					</button>
					<button
						className="btn btn-ghost btn-sm"
						onClick={() => onPrint(currentOpts)}
						disabled={!canSubmit}
						style={{
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 6,
						}}
					>
						<Printer size={14} /> Chop etish
					</button>
					<button
						className="btn btn-primary btn-sm"
						onClick={() => onExport(currentOpts)}
						disabled={!canSubmit}
						style={{
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 6,
						}}
					>
						<Download size={14} /> Yuklab olish
					</button>
				</div>
			</div>
		</div>
	);
}
