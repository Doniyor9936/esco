import type { ShiftSummaryReport, ShiftWithStats } from "../types";

interface ZReportReceiptProps {
	closedShift: ShiftWithStats;
	summary?: ShiftSummaryReport | null;
	cashierLabel?: string;
}

function fmtSom(n: number) {
	return `${n.toLocaleString("uz-UZ")} so'm`;
}

function fmtDateTime(iso: string) {
	const d = new Date(iso);
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	const hh = String(d.getHours()).padStart(2, "0");
	const min = String(d.getMinutes()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function calcDuration(openedAt: string, closedAt: string | null): string {
	const end = closedAt ? new Date(closedAt).getTime() : Date.now();
	const ms = end - new Date(openedAt).getTime();
	const h = Math.floor(ms / 3_600_000);
	const m = Math.floor((ms % 3_600_000) / 60_000);
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "baseline",
				width: "100%",
				gap: 6,
				fontWeight: bold ? 700 : 400,
				fontSize: bold ? 13 : 12,
				lineHeight: "1.7",
				color: "#000",
			}}
		>
			<span style={{ flex: "1 1 0", minWidth: 0, color: "#000" }}>{label}</span>
			<span style={{ flex: "0 0 auto", whiteSpace: "nowrap", color: "#000", textAlign: "right" }}>
				{value}
			</span>
		</div>
	);
}

function SectionTitle({ children }: { children: string }) {
	return (
		<div
			style={{
				fontWeight: 700,
				fontSize: 11,
				letterSpacing: "0.07em",
				textTransform: "uppercase",
				color: "#000",
				width: "100%",
				marginTop: 7,
				marginBottom: 2,
			}}
		>
			{children}
		</div>
	);
}

function SolidLine() {
	return <div style={{ borderTop: "1px solid #000", margin: "5px 0", width: "100%" }} />;
}

function DashedLine() {
	return <div style={{ borderTop: "1px dashed #000", margin: "4px 0", width: "100%" }} />;
}

export function ZReportReceipt({ closedShift, summary, cashierLabel }: ZReportReceiptProps) {
	const { shift, stats } = closedShift;

	const totalRevenue = stats.totalCash + stats.totalCard + stats.totalClick;
	const gameRevenue = summary?.gameRevenue ?? 0;
	const productRevenue = summary?.productRevenue ?? 0;
	const serviceCharge = productRevenue > 0 ? Math.round(productRevenue * 0.1) : 0;
	const productNet = productRevenue;
	const totalChecks = summary?.totalChecks ?? stats.totalReceipts;
	const _successChecks = totalChecks - stats.cancelledReceipts;

	return (
		<>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

        /* Ekranda chek konteynerini to'liq kenglikka chiqarish */
        #z-receipt-root {
          font-family: 'Courier Prime', 'Courier New', Courier, monospace !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          box-sizing: border-box;
          width: 100% !important;
        }
        #z-receipt-root * {
          box-sizing: border-box;
        }

        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }

          html, body {
            width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hamma narsani yashir */
          body > * { visibility: hidden !important; }

          /* Faqat chekni ko'rsat */
          #z-receipt-root,
          #z-receipt-root * {
            visibility: visible !important;
          }

          #z-receipt-root {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 80mm !important;
            padding: 3mm 4mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #fff !important;
            color: #000 !important;
          }

          #z-receipt-root * {
            color: #000 !important;
            background: transparent !important;
            border-color: #000 !important;
          }

          .no-print { display: none !important; }
        }
      `}</style>

			<div
				id="z-receipt-root"
				style={{
					fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
					fontSize: 12,
					color: "#000",
					background: "#fff",
					width: "100%",
					padding: "14px 16px",
					lineHeight: 1.6,
					boxShadow: "0 2px 14px rgba(0,0,0,0.12)",
					borderRadius: 3,
				}}
			>
				<div style={{ textAlign: "center", marginBottom: 8, width: "100%" }}>
					<div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "0.18em", color: "#000" }}>
						BILLIARD
					</div>
					<div style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", color: "#000" }}>
						BARCHA TUSHUMLAR
					</div>
					<div style={{ fontSize: 11, letterSpacing: "0.05em", color: "#000" }}>Hisobot</div>
					<div style={{ fontSize: 11, color: "#000", marginTop: 3 }}>
						Chiqarildi: {fmtDateTime(shift.closedAt ?? new Date().toISOString())}
					</div>
				</div>

				<SolidLine />

				{cashierLabel && <Row label="Kassir" value={cashierLabel} />}
				<Row label="Davomiyligi" value={calcDuration(shift.openedAt, shift.closedAt)} />

				<DashedLine />

				<SectionTitle>TO'LOV USULLARI</SectionTitle>
				<Row label="Naqd" value={fmtSom(stats.totalCash)} />
				<Row label="Plastik" value={fmtSom(stats.totalCard)} />
				<Row label="Click" value={fmtSom(stats.totalClick)} />
				<Row label="Payme" value={fmtSom(0)} />
				{/* <DashedLine />


        {/* MAHSULOTLAR */}
				<SectionTitle>MAHSULOTLAR</SectionTitle>
				<Row label="Mahsulotlar" value={fmtSom(productNet)} />
				{serviceCharge > 0 && <Row label="Xizmat haqqi (10%)" value={fmtSom(serviceCharge)} />}
				{/* <Row label='Jami' value={fmtSom(productRevenue)} bold /> */}

				<SolidLine />

				<SectionTitle>JAMI TUSHUMLAR</SectionTitle>
				{
					<>
						<Row label="Jami stollar" value={fmtSom(gameRevenue)} />
						<Row label="Jami mahsulotlar" value={fmtSom(productNet)} />
						{serviceCharge > 0 && <Row label="Jami xizmat haqqi" value={fmtSom(serviceCharge)} />}
					</>
				}

				<SolidLine />

				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						width: "100%",
						fontWeight: 700,
						fontSize: 14,
						color: "#000",
						letterSpacing: "0.02em",
						padding: "3px 0",
					}}
				>
					<span>UMUMIY TUSHUM</span>
					<span>{fmtSom(totalRevenue)}</span>
				</div>

				<SolidLine />

				<div
					style={{
						textAlign: "center",
						color: "#000",
						fontSize: 12,
						letterSpacing: "0.05em",
						lineHeight: 1.9,
						marginTop: 6,
						width: "100%",
					}}
				>
					<div style={{ fontSize: 15, letterSpacing: "0.35em", color: "#000" }}>
						★&nbsp;&nbsp;★&nbsp;&nbsp;★
					</div>
					<div style={{ color: "#000" }}>BILLIARD boshqaruv tizimi</div>
				</div>
			</div>
		</>
	);
}
