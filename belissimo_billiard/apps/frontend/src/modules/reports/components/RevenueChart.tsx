import type { RevenuePoint } from "../types";
import { SparkBar } from "./SparkBar";

interface Props {
	data: RevenuePoint[];
	isLoading: boolean;
	periodLabel: string;
}

export function RevenueChart({ data, isLoading, periodLabel }: Props) {
	return (
		<div className="card">
			<div className="card-hd">
				<h3>Tushum dinamikasi</h3>
				<span className="sub">{periodLabel} · so'm</span>
			</div>
			<div className="card-body" style={{ paddingBottom: 10 }}>
				{isLoading ? (
					<div
						style={{
							height: 120,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "var(--ink-400)",
						}}
					>
						Yuklanmoqda…
					</div>
				) : data.length === 0 ? (
					<div
						style={{
							height: 120,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "var(--ink-400)",
						}}
					>
						Ma'lumot yo'q
					</div>
				) : (
					<SparkBar data={data} />
				)}
			</div>
		</div>
	);
}
