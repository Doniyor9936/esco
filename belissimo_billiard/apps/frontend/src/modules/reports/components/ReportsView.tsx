import { DatePicker, Select } from "antd";
import type dayjs from "dayjs";
import { Calendar, Download } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import {
	useReportProducts,
	useReportRevenue,
	useReportSummary,
	useReportTablesOccupancy,
	useShifts,
} from "../hooks/useReports";
import { reportsService } from "../services/reports.service";
import type {
	ReportParams,
	ReportPeriod,
	ReportSummary,
	Shift,
	TableRevenue,
	TopProduct,
} from "../types";
import { ExportModal, type ExportOptions } from "./Exportmodal ";
import { downloadReportHtml, openPrintWindow, type PrintReportData } from "./Printreport";
import { RevenueChart } from "./RevenueChart";
import { SummaryKpi } from "./SummaryKpi";
import { TablesOccupancy } from "./TablesOccupancy";
import { TopProducts } from "./TopProducts";

const { RangePicker } = DatePicker;

const PERIOD_TABS: { key: ReportPeriod; label: string }[] = [
	{ key: "daily", label: "Kunlik" },
	{ key: "weekly", label: "Haftalik" },
	{ key: "monthly", label: "Oylik" },
	{ key: "custom", label: "Ixtiyoriy" },
];

const PERIOD_LABEL: Record<ReportPeriod, string> = {
	daily: "kunlik",
	weekly: "haftalik",
	monthly: "oylik",
	custom: "ixtiyoriy",
};

const EMPTY_SUMMARY: ReportSummary = {
	totalRevenue: 0,
	totalRevenueChange: 0,
	profit: 0,
	profitPct: 0,
	totalChecks: 0,
	avgCheck: 0,
	avgOccupancy: 0,
	avgOccupancyChange: 0,
	gameRevenue: 0,
	productRevenue: 0,
};

function fmtShiftOption(shift: Shift): string {
	const opened = new Date(shift.openedAt).toLocaleString("uz-UZ", {
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
	return shift.status === "open" ? `🟢 ${opened} (ochiq)` : `⚫ ${opened}`;
}

// ExportOptions → ReportParams
function optsToParams(opts: ExportOptions, allShifts: Shift[]): ReportParams {
	if (opts.exportPeriod === "shift" && opts.shiftId) {
		const shift = allShifts.find((s) => s.id === opts.shiftId);
		return {
			shiftId: opts.shiftId,
			shiftOpenedAt: shift?.openedAt,
			shiftClosedAt: shift?.closedAt ?? undefined,
		};
	}
	if (opts.exportPeriod === "custom" && opts.range[0] && opts.range[1]) {
		return {
			period: "custom",
			from: opts.range[0].format("YYYY-MM-DD"),
			to: opts.range[1].format("YYYY-MM-DD"),
		};
	}
	return { period: opts.exportPeriod as ReportPeriod };
}

function getSettled<T>(r: PromiseSettledResult<T | undefined>): T | undefined {
	return r.status === "fulfilled" ? r.value : undefined;
}

// ─── Component ───────────────────────────────────────────────

export function ReportsView() {
	const [period, setPeriod] = useState<ReportPeriod>("weekly");
	const [range, setRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
	const [selectedShiftId, setSelectedShiftId] = useState<string | undefined>(undefined);
	const [exportOpen, setExportOpen] = useState(false);

	const user = useAuthStore((s) => s.user);
	const { data: settings } = useSettings();
	const { data: shifts = [], isLoading: shiftsLoading } = useShifts();

	const selectedShift = shifts.find((s) => s.id === selectedShiftId);

	// Smena tanlangan bo'lsa shiftId bo'yicha, aks holda period/custom
	const params: ReportParams =
		selectedShiftId && selectedShift
			? {
					shiftId: selectedShiftId,
					shiftOpenedAt: selectedShift.openedAt,
					shiftClosedAt: selectedShift.closedAt ?? undefined,
				}
			: {
					period,
					...(period === "custom" && range[0] && { from: range[0].format("YYYY-MM-DD") }),
					...(period === "custom" && range[1] && { to: range[1].format("YYYY-MM-DD") }),
				};

	const { data: summary, isLoading: summaryLoading } = useReportSummary(params);
	const { data: revenue, isLoading: revenueLoading } = useReportRevenue(params);
	const { data: tables, isLoading: tablesLoading } = useReportTablesOccupancy(params);
	const { data: products, isLoading: productsLoading } = useReportProducts(params);

	const activePeriodLabel = selectedShift
		? fmtShiftOption(selectedShift)
		: period !== "custom"
			? PERIOD_LABEL[period]
			: range[0] && range[1]
				? `${range[0].format("DD.MM")} — ${range[1].format("DD.MM")}`
				: "Sana tanlang";

	const handlePeriodChange = (key: ReportPeriod) => {
		setPeriod(key);
		setSelectedShiftId(undefined);
	};

	// ─── Eksport uchun data yuklash ──────────────────────────
	async function fetchExportData(opts: ExportOptions): Promise<PrintReportData> {
		const exportParams = optsToParams(opts, shifts);
		const isShiftMode = opts.exportPeriod === "shift" && !!opts.shiftId;
		const showBilliard = opts.exportType === "billiard" || opts.exportType === "all";
		const showMenu = opts.exportType === "menu" || opts.exportType === "all";

		// Smena meta
		const shiftMeta = opts.shiftId ? shifts.find((s) => s.id === opts.shiftId) : undefined;

		if (isShiftMode && opts.shiftId) {
			// ── SMENA REJIMI ─────────────────────────────────────
			// /api/reports/shifts?shiftId=... — faqat shu smena summasi
			const shiftReport = await reportsService.getShiftReport(opts.shiftId);

			return {
				params: exportParams,
				exportType: opts.exportType,
				cashierName: user?.phone ?? "Noma'lum",
				shiftReport: shiftReport ?? undefined,
				shift: shiftMeta
					? {
							id: shiftMeta.id,
							openedAt: shiftMeta.openedAt,
							closedAt: shiftMeta.closedAt,
							status: shiftMeta.status,
							openingCash: shiftMeta.openingCash,
						}
					: undefined,
				serviceChargePct: settings?.serviceChargePct ?? 0,
				serviceChargeEnabled: settings?.serviceChargeEnabled ?? false,
				clubName: settings?.clubName ?? "Billiard",
			};
		}

		// ── PERIOD REJIMI ───────────────────────────────────────
		// Alohida endpointlar — period/custom bo'yicha filtrlangan
		const [tablesRes, productsRes] = await Promise.allSettled([
			showBilliard ? reportsService.getTablesRevenue(exportParams) : Promise.resolve(undefined),
			showMenu ? reportsService.getProducts(exportParams) : Promise.resolve(undefined),
		] as const);

		return {
			params: exportParams,
			exportType: opts.exportType,
			cashierName: user?.phone ?? "Noma'lum",
			tablesRevenue: getSettled<TableRevenue[]>(tablesRes),
			products: getSettled<TopProduct[]>(productsRes),
			serviceChargePct: settings?.serviceChargePct ?? 0,
			serviceChargeEnabled: settings?.serviceChargeEnabled ?? false,
			clubName: settings?.clubName ?? "Billiard",
		};
	}

	const handlePrint = async (opts: ExportOptions) => {
		setExportOpen(false);
		const data = await fetchExportData(opts);
		openPrintWindow(data);
	};

	const handleDownload = async (opts: ExportOptions) => {
		setExportOpen(false);
		const data = await fetchExportData(opts);
		downloadReportHtml(data);
	};

	return (
		<>
			<div className="tabs" style={{ flexWrap: "wrap", gap: 8, alignItems: "center" }}>
				{PERIOD_TABS.map(({ key, label }) => (
					<button
						key={key}
						className={`tab ${period === key && !selectedShiftId ? "active" : ""}`}
						onClick={() => handlePeriodChange(key)}
					>
						{label}
					</button>
				))}

				<div
					style={{
						marginLeft: "auto",
						display: "flex",
						gap: 8,
						alignItems: "center",
						flexWrap: "wrap",
						paddingBottom: 8,
					}}
				>
					{period === "custom" && !selectedShiftId && (
						<RangePicker
							value={range}
							onChange={(vals) => setRange(vals ?? [null, null])}
							format="DD.MM.YYYY"
						/>
					)}

					{/* Smena dropdown */}
					<Select
						style={{ minWidth: 220 }}
						placeholder="Smena bo'yicha filter..."
						loading={shiftsLoading}
						allowClear
						value={selectedShiftId}
						onChange={(val) => setSelectedShiftId(val)}
						options={shifts.map((s) => ({ value: s.id, label: fmtShiftOption(s) }))}
						notFoundContent="Smena topilmadi"
					/>

					<button className="btn btn-ghost btn-sm">
						<Calendar size={14} />
						{activePeriodLabel}
					</button>

					<button className="btn btn-ghost btn-sm" onClick={() => setExportOpen(true)}>
						<Download size={14} /> Eksport
					</button>
				</div>
			</div>

			<SummaryKpi data={summary ?? EMPTY_SUMMARY} isLoading={summaryLoading} />

			<div className="reports-grid">
				<RevenueChart
					data={revenue ?? []}
					isLoading={revenueLoading}
					periodLabel={selectedShiftId ? "smena" : PERIOD_LABEL[period]}
				/>
				<TablesOccupancy
					data={tables ?? []}
					isLoading={tablesLoading}
					periodLabel={selectedShiftId ? "smena" : PERIOD_LABEL[period]}
				/>
				<TopProducts data={products ?? []} isLoading={productsLoading} />
			</div>

			<ExportModal
				open={exportOpen}
				onClose={() => setExportOpen(false)}
				currentPeriod={period}
				selectedShiftId={selectedShiftId}
				onPrint={handlePrint}
				onExport={handleDownload}
			/>
		</>
	);
}
