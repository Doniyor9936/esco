import type { ReportSummary } from "../types";

function fmtSom(n: number) {
	return n.toLocaleString("uz-UZ");
}

interface Props {
	data: ReportSummary;
	isLoading: boolean;
}

export function SummaryKpi({ data, isLoading }: Props) {
	if (isLoading) {
		return (
			<div className="kpi-row">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="kpi">
						<div className="lbl">—</div>
						<div className="val" style={{ opacity: 0.3 }}>
							—
						</div>
					</div>
				))}
			</div>
		);
	}

	const revenueUp = data.totalRevenueChange >= 0;
	const occupancyUp = data.avgOccupancyChange >= 0;

	// gameRevenue va productRevenue ulush foizlari
	const gamePct =
		data.totalRevenue > 0 ? Math.round((data.gameRevenue / data.totalRevenue) * 100) : 0;
	const productPct =
		data.totalRevenue > 0 ? Math.round((data.productRevenue / data.totalRevenue) * 100) : 0;

	return (
		<div className="kpi-row">
			{/* Karta 1: Umumiy tushum */}
			<div className="kpi">
				<div className="lbl">Umumiy tushum</div>
				<div className="val">
					{fmtSom(data.totalRevenue)} <span className="unit">so'm</span>
				</div>
				<div className={`delta ${revenueUp ? "" : "down"}`}>
					{revenueUp ? "↑" : "↓"} {Math.abs(data.totalRevenueChange)}% o'tgan davrdan
				</div>
			</div>

			{/* Karta 2: Billiard / Menyu tushumi */}
			<div className="kpi">
				<div className="lbl">Billiard tushumi</div>
				<div className="val">
					{fmtSom(data.gameRevenue)} <span className="unit">so'm</span>
				</div>
				<div className="delta">{gamePct}% umumiy tushumdan</div>
			</div>

			{/* Karta 3: Menyu tushumi */}
			<div className="kpi">
				<div className="lbl">Menyu tushumi</div>
				<div className="val">
					{fmtSom(data.productRevenue)} <span className="unit">so'm</span>
				</div>
				<div className="delta">{productPct}% umumiy tushumdan</div>
			</div>

			{/* Karta 4: O'rtacha bandlik */}
			<div className="kpi">
				<div className="lbl">O'rtacha bandlik</div>
				<div className="val">
					{data.avgOccupancy}
					<span className="unit">%</span>
				</div>
				<div className={`delta ${occupancyUp ? "" : "down"}`}>
					{occupancyUp ? "↑" : "↓"} {Math.abs(data.avgOccupancyChange)}% o'tgan davrdan
				</div>
			</div>
		</div>
	);
}
