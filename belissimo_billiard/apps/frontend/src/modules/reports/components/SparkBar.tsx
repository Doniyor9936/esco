import type { RevenuePoint } from "../types";

function fmtSom(n: number) {
	return n.toLocaleString("uz-UZ");
}

interface Props {
	data: RevenuePoint[];
	color?: string;
}

export function SparkBar({ data, color = "var(--felt-700)" }: Props) {
	const max = Math.max(...data.map((d) => d.amount), 1);

	// Label: kun yoki sana
	const getLabel = (dateStr: string) => {
		const d = new Date(dateStr);
		return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" });
	};

	return (
		<div>
			<div className="spark-bar">
				{data.map((d, i) => (
					<div key={i} className="sb-col" title={`${getLabel(d.date)}: ${fmtSom(d.amount)}`}>
						<div
							className="sb-fill"
							style={{ height: `${(d.amount / max) * 100}%`, background: color }}
						/>
					</div>
				))}
			</div>
			<div className="spark-labels">
				{data.map((d, i) => (
					<span key={i}>{getLabel(d.date)}</span>
				))}
			</div>
		</div>
	);
}
