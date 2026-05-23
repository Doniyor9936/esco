import type { TableOccupancy } from "../types";

interface Props {
	data: TableOccupancy[];
	isLoading: boolean;
	periodLabel: string;
}

export function TablesOccupancy({ data, isLoading, periodLabel }: Props) {
	return (
		<div className="card">
			<div className="card-hd">
				<h3>Stollar bandligi</h3>
				<span className="sub">{periodLabel} %</span>
			</div>
			<div className="card-body">
				{isLoading ? (
					<div style={{ padding: 24, textAlign: "center", color: "var(--ink-400)" }}>
						Yuklanmoqda…
					</div>
				) : data.length === 0 ? (
					<div style={{ padding: 24, textAlign: "center", color: "var(--ink-400)" }}>
						Ma'lumot yo'q
					</div>
				) : (
					data.map((t) => (
						<div key={t.tableId} className="occ-row">
							<div className="occ-name">{t.tableName}</div>
							<div className="occ-bar">
								<div
									className="occ-fill"
									style={{
										width: `${t.occupancyPct}%`,
										background:
											t.occupancyPct > 80
												? "var(--felt-700)"
												: t.occupancyPct > 55
													? "var(--gold-500)"
													: "var(--ink-400)",
									}}
								/>
							</div>
							<div className="occ-val font-mono">{t.occupancyPct}%</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
