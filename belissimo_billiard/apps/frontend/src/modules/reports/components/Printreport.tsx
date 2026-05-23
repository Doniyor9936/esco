import type { ReportParams, Shift, ShiftReport, TableRevenue, TopProduct } from "../types";
import type { ExportType } from "./Exportmodal ";

// ─── Types ────────────────────────────────────────────────────

export interface PrintReportData {
	params: ReportParams;
	exportType: ExportType;
	cashierName?: string;
	cashierPhone?: string;
	shiftReport?: ShiftReport;
	shift?: Pick<Shift, "id" | "openedAt" | "closedAt" | "status" | "openingCash">;
	tablesRevenue?: TableRevenue[];
	products?: TopProduct[];
	serviceChargePct?: number;
	serviceChargeEnabled?: boolean;
	clubName?: string;
}

interface TableRevenueExtended extends TableRevenue {
	totalMinutes?: number;
}

// ─── Formatters ───────────────────────────────────────────────

function fmt(n: number): string {
	return n.toLocaleString("uz-UZ");
}

function fmtDate(iso: string): string {
	return new Date(iso).toLocaleDateString("uz-UZ", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function fmtDateTime(iso?: string | null) {
	if (!iso) {
		return "—";
	}

	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) {
		return "—";
	}

	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	const hh = String(d.getHours()).padStart(2, "0");
	const min = String(d.getMinutes()).padStart(2, "0");

	return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function buildPeriodLabel(params: ReportParams, shift?: PrintReportData["shift"]): string {
	if (params.shiftId && shift) {
		const opened = fmtDateTime(shift.openedAt);
		const closed = shift.closedAt ? fmtDateTime(shift.closedAt) : "Ochiq";
		return `${opened} — ${closed}`;
	}
	if (params.shiftId) {
		return "Smena hisoboti";
	}
	if (params.period === "custom" && params.from && params.to) {
		return `${fmtDate(params.from)} — ${fmtDate(params.to)}`;
	}
	const map: Record<string, string> = {
		daily: "Kunlik hisobot",
		weekly: "Haftalik hisobot",
		monthly: "Oylik hisobot",
	};
	return map[params.period ?? "weekly"] ?? "Hisobot";
}

function exportTypeLabel(type: ExportType): string {
	const map: Record<ExportType, string> = {
		billiard: "BILLIARD STOL TUSHUMLARI",
		menu: "MENYU TUSHUMLARI",
		all: "BARCHA TUSHUMLAR",
	};
	return map[type];
}

// ─── HTML Sections ────────────────────────────────────────────

function shiftInfoSection(
	shift: NonNullable<PrintReportData["shift"]>,
	cashierName: string
): string {
	const closedRow = shift.closedAt
		? `<tr><td class="lbl">Yopildi</td><td class="rgt">${fmtDateTime(shift.closedAt)}</td></tr>`
		: `<tr><td class="lbl">Holat</td><td class="rgt">🟢 Smena ochiq</td></tr>`;

	const openingCashRow =
		shift.openingCash > 0
			? `<tr>
         <td class="lbl">Boshlang'ich naqd</td>
         <td class="rgt">${fmt(shift.openingCash)} so'm</td>
       </tr>`
			: "";

	return `
    <div class="sec-title">SMENA MA'LUMOTLARI</div>
    <table class="tbl">
      <tbody>
        <tr><td class="lbl">Kassir</td><td class="rgt">${cashierName}</td></tr>
        <tr><td class="lbl">Ochildi</td><td class="rgt">${fmtDateTime(shift.openedAt)}</td></tr>
        ${closedRow}
        ${openingCashRow}
      </tbody>
    </table>`;
}

function shiftPaymentSection(report: ShiftReport): string {
	const methods = [
		{ label: "Naqd", val: report.naqdAmount },
		{ label: "Plastik", val: report.kartaAmount },
		{ label: "Click", val: report.clickAmount },
		{ label: "Payme", val: report.paymeAmount },
	].filter((m) => m.val > 0);

	const rows = methods
		.map(
			(m) => `
    <tr>
      <td class="lbl">${m.label}</td>
      <td class="rgt">${fmt(m.val)} so'm</td>
    </tr>`
		)
		.join("");

	const emptyRow = methods.length
		? ""
		: `<tr><td class="lbl" colspan="2">To'lov mavjud emas</td></tr>`;

	return `
    <div class="divider"></div>
    <div class="sec-title">TO'LOV USULLARI</div>
    <table class="tbl">
      <tbody>${rows}${emptyRow}</tbody>
      <tfoot>
        <tr>
          <td class="lbl">Jami to'lovlar</td>
          <td class="rgt bold">${fmt(report.totalRevenue)} so'm</td>
        </tr>
      </tfoot>
    </table>`;
}

function shiftTotalsSection(report: ShiftReport, exportType: ExportType): string {
	const showBilliard = exportType === "billiard" || exportType === "all";
	const showMenu = exportType === "menu" || exportType === "all";

	const billiardRow = showBilliard
		? `<tr><td class="lbl">Billiard stollar</td><td class="rgt">${fmt(report.gameRevenue)} so'm</td></tr>`
		: "";
	const menuRow = showMenu
		? `<tr><td class="lbl">Menyu buyurtmalar</td><td class="rgt">${fmt(report.productRevenue)} so'm</td></tr>`
		: "";

	let shownTotal = 0;
	if (showBilliard && showMenu) {
		shownTotal = report.totalRevenue;
	} else if (showBilliard) {
		shownTotal = report.gameRevenue;
	} else if (showMenu) {
		shownTotal = report.productRevenue;
	}

	const checksRow =
		report.totalChecks > 0
			? `<tr><td class="lbl">Jami cheklar</td><td class="rgt">${fmt(report.totalChecks)} ta</td></tr>`
			: "";

	return `
    <div class="divider"></div>
    <div class="sec-title">DAROMAD TAQSIMOTI</div>
    <table class="tbl">
      <tbody>
        ${billiardRow}
        ${menuRow}
        ${checksRow}
      </tbody>
      <tfoot>
        <tr>
          <td class="lbl">JAMI TUSHUM</td>
          <td class="rgt bold">${fmt(shownTotal)} so'm</td>
        </tr>
      </tfoot>
    </table>`;
}

function periodPaymentSection(
	cashierName: string,
	tables: TableRevenueExtended[],
	products: TopProduct[]
): string {
	const naqdTotal = tables.reduce((s, t) => s + (t.naqdAmount ?? 0), 0);
	const kartaTotal = tables.reduce((s, t) => s + (t.kartaAmount ?? 0), 0);
	const clickTotal = tables.reduce((s, t) => s + (t.clickAmount ?? 0), 0);

	const methods = [
		{ label: "Naqd", val: naqdTotal },
		{ label: "Plastik", val: kartaTotal },
		{ label: "Click", val: clickTotal },
	].filter((m) => m.val > 0);

	const rows = methods
		.map(
			(m) => `
    <tr>
      <td class="lbl">${m.label}</td>
      <td class="rgt">${fmt(m.val)} so'm</td>
    </tr>`
		)
		.join("");

	return `
    <div class="divider"></div>
    <table class="tbl">
      <tbody>
        <tr><td class="lbl">Kassir</td><td class="rgt">${cashierName}</td></tr>
      </tbody>
    </table>
    ${
			rows
				? `
    <div class="divider"></div>
    <div class="sec-title">TO'LOV USULLARI</div>
    <table class="tbl">
      <tbody>${rows}</tbody>
    </table>`
				: ""
		}`;
}

function periodTablesSection(tables: TableRevenueExtended[]): string {
	const active = tables.filter((t) => t.totalAmount > 0);
	if (!active.length) {
		return "";
	}

	const sorted = [...active].sort((a, b) => a.tableNumber - b.tableNumber);
	const totalAmount = sorted.reduce((s, t) => s + t.totalAmount, 0);

	const rows = sorted
		.map(
			(t) => `
    <tr>
      <td class="lbl">${t.tableName}</td>
      <td class="rgt">${fmt(t.totalAmount)} so'm</td>
    </tr>`
		)
		.join("");

	return `
    <div class="divider"></div>
    <div class="sec-title">STOLLAR BO'YICHA DAROMAD</div>
    <table class="tbl">
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td class="lbl">Jami stollar</td>
          <td class="rgt bold">${fmt(totalAmount)} so'm</td>
        </tr>
      </tfoot>
    </table>`;
}

function periodProductsSection(
	products: TopProduct[],
	serviceChargePct: number,
	serviceChargeEnabled: boolean
): string {
	if (!products.length) {
		return "";
	}

	const totalQty = products.reduce((s, p) => s + p.quantity, 0);
	const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
	const serviceFee =
		serviceChargeEnabled && serviceChargePct > 0
			? Math.round((totalRevenue * serviceChargePct) / 100)
			: 0;

	const rows = products
		.map(
			(p) => `
    <tr>
      <td class="lbl">${p.productName}</td>
      <td class="cnt">${p.quantity} ta</td>
      <td class="rgt">${fmt(p.revenue)} so'm</td>
    </tr>`
		)
		.join("");

	const serviceFeeRow =
		serviceFee > 0
			? `<tr>
         <td class="lbl">Xizmat haqqi (${serviceChargePct}%)</td>
         <td class="cnt"></td>
         <td class="rgt">${fmt(serviceFee)} so'm</td>
       </tr>`
			: "";

	return `
    <div class="divider"></div>
    <div class="sec-title">MAHSULOTLAR</div>
    <table class="tbl">
      <tbody>${rows}${serviceFeeRow}</tbody>
      <tfoot>
        <tr>
          <td class="lbl">Jami mahsulotlar</td>
          <td class="cnt">${totalQty} ta</td>
          <td class="rgt bold">${fmt(totalRevenue + serviceFee)} so'm</td>
        </tr>
      </tfoot>
    </table>`;
}

function periodGrandTotalSection(opts: {
	tableTotal: number;
	productTotal: number;
	serviceFee: number;
	showBilliard: boolean;
	showMenu: boolean;
	serviceChargePct: number;
}): string {
	const { tableTotal, productTotal, serviceFee, showBilliard, showMenu, serviceChargePct } = opts;
	const grand = tableTotal + productTotal + serviceFee;

	const billiardRow = showBilliard
		? `<tr><td class="lbl">Stollar jami</td><td class="rgt">${fmt(tableTotal)} so'm</td></tr>`
		: "";
	const menuRow = showMenu
		? `<tr><td class="lbl">Mahsulotlar jami</td><td class="rgt">${fmt(productTotal)} so'm</td></tr>`
		: "";
	const feeRow =
		serviceFee > 0
			? `<tr>
         <td class="lbl">Xizmat haqqi (${serviceChargePct}%)</td>
         <td class="rgt">${fmt(serviceFee)} so'm</td>
       </tr>`
			: "";

	return `
    <div class="divider"></div>
    <div class="sec-title">UMUMIY HISOBOT</div>
    <table class="tbl">
      <tbody>${billiardRow}${menuRow}${feeRow}</tbody>
      <tfoot>
        <tr>
          <td class="lbl">JAMI TUSHUM</td>
          <td class="rgt bold">${fmt(grand)} so'm</td>
        </tr>
      </tfoot>
    </table>`;
}

// ─── HTML Builder ─────────────────────────────────────────────

function buildHtml(data: PrintReportData): string {
	const {
		params,
		exportType,
		cashierName = "Noma'lum",
		shiftReport,
		shift,
		tablesRevenue = [],
		products = [],
		serviceChargePct = 0,
		serviceChargeEnabled = false,
		clubName: rawClubName,
	} = data;

	const clubName = rawClubName ? rawClubName.toUpperCase() : "";

	const isShiftMode = !!params.shiftId && !!shiftReport;
	const showBilliard = exportType === "billiard" || exportType === "all";
	const showMenu = exportType === "menu" || exportType === "all";

	const now = new Date().toLocaleString("uz-UZ", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
	const periodStr = buildPeriodLabel(params, shift);

	let sections: string;

	if (isShiftMode && shiftReport) {
		sections = [
			shift ? shiftInfoSection(shift, cashierName) : "",
			shiftPaymentSection(shiftReport),
			shiftTotalsSection(shiftReport, exportType),
		]
			.filter(Boolean)
			.join("\n");
	} else {
		const extendedTables = tablesRevenue as TableRevenueExtended[];
		const tableTotal = extendedTables.reduce((s, t) => s + t.totalAmount, 0);
		const productTotal = products.reduce((s, p) => s + p.revenue, 0);
		const serviceFee =
			showMenu && serviceChargeEnabled && serviceChargePct > 0
				? Math.round((productTotal * serviceChargePct) / 100)
				: 0;

		sections = [
			periodPaymentSection(cashierName, extendedTables, products),
			showBilliard && extendedTables.length ? periodTablesSection(extendedTables) : "",
			showMenu && products.length
				? periodProductsSection(products, serviceChargePct, serviceChargeEnabled)
				: "",
			periodGrandTotalSection({
				tableTotal,
				productTotal,
				serviceFee,
				showBilliard,
				showMenu,
				serviceChargePct,
			}),
		]
			.filter(Boolean)
			.join("\n");
	}

	return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <title>${clubName} — Hisobot</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px; font-weight: 700;
      background: #fff; color: #000; padding: 20px;
    }
    .receipt   { max-width: 380px; margin: 0 auto; }
    .header    { text-align: center; padding-bottom: 10px; margin-bottom: 6px; border-bottom: 2px solid #000; }
    .brand     { font-size: 18px; font-weight: 900; letter-spacing: 2px; }
    .sub       { font-size: 11px; letter-spacing: 1px; margin-top: 2px; }
    .period    { font-size: 11px; margin-top: 2px; }
    .printed   { font-size: 10px; margin-top: 4px; }
    .sec-title { font-size: 10px; font-weight: 900; letter-spacing: 1px; margin: 8px 0 4px; text-transform: uppercase; }
    .divider   { border-top: 1px dashed #000; margin: 8px 0; }
    .tbl       { width: 100%; border-collapse: collapse; font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: 700; }
    .tbl td    { padding: 3px 0; border-bottom: 1px dotted #ccc; }
    .tbl tfoot td { border-top: 2px solid #000; border-bottom: none; padding-top: 5px; }
    .lbl  { text-align: left; }
    .rgt  { text-align: right; }
    .cnt  { text-align: center; }
    .bold { font-weight: 900; font-size: 14px; }
    .footer { text-align: center; margin-top: 14px; padding-top: 10px; border-top: 2px solid #000; font-size: 10px; }
    .stars  { font-size: 14px; letter-spacing: 4px; }
    @media print { body { padding: 0; } @page { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="brand">Billiard</div>
      <div class="sub">${exportTypeLabel(exportType)}</div>
      <div class="period">${periodStr}</div>
      <div class="printed">Chiqarildi: ${now}</div>
    </div>
    ${sections}
    <div class="footer">
      <div class="stars">★ ★ ★</div>
      ${clubName ? `<div style="margin-top:4px">${clubName} boshqaruv tizimi</div>` : ""}
    </div>
  </div>
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────

export function openPrintWindow(data: PrintReportData): void {
	const html = buildHtml(data);
	const blob = new Blob([html], { type: "text/html;charset=utf-8" });
	const blobUrl = URL.createObjectURL(blob);
	const cleanup = () => URL.revokeObjectURL(blobUrl);

	const IFRAME_ID = "__hisobot_print_frame__";
	let iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;
	if (!iframe) {
		iframe = document.createElement("iframe");
		iframe.id = IFRAME_ID;
		iframe.style.display = "none";
		document.body.appendChild(iframe);
	}
	iframe.onload = () => {
		try {
			iframe?.contentWindow?.focus();
			iframe?.contentWindow?.print();
			setTimeout(cleanup, 5000);
		} catch {
			cleanup();
			const win = window.open(blobUrl, "_blank", "width=480,height=900");
			if (!win) {
				return;
			}
			win.onload = () => {
				win.focus();
				win.print();
			};
		}
	};
	iframe.src = blobUrl;
}

export function downloadReportHtml(data: PrintReportData, filename?: string): void {
	const html = buildHtml(data);
	const blob = new Blob([html], { type: "text/html;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename ?? `hisobot-${new Date().toISOString().slice(0, 10)}.html`;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 3000);
}
