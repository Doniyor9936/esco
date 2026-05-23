import type { TopProduct } from "../types";

function fmtSom(n: number) {
	return n.toLocaleString("uz-UZ");
}

interface Props {
	data: TopProduct[];
	isLoading: boolean;
}

export function TopProducts({ data, isLoading }: Props) {
	const maxRevenue = data[0]?.revenue ?? 1;

	return (
		<div className="card" style={{ gridColumn: "span 2" }}>
			<div className="card-hd">
				<h3>Eng ko'p sotilganlar</h3>
				<span className="sub">TOP 6</span>
			</div>
			{isLoading ? (
				<div style={{ padding: 40, textAlign: "center", color: "var(--ink-400)" }}>
					Yuklanmoqda…
				</div>
			) : data.length === 0 ? (
				<div style={{ padding: 40, textAlign: "center", color: "var(--ink-400)" }}>
					Ma'lumot yo'q
				</div>
			) : (
				<table className="tbl">
					<thead>
						<tr>
							<th style={{ width: 40 }}>#</th>
							<th>Nomi</th>
							<th className="num">Soni</th>
							<th className="num">Tushum</th>
							<th className="num">Ulush</th>
							<th style={{ width: "30%" }}></th>
						</tr>
					</thead>
					<tbody>
						{data.map((it) => (
							<tr key={it.productId}>
								<td
									style={{
										fontFamily: "Cormorant Garamond, serif",
										fontSize: 18,
										color: "var(--gold-600)",
										fontWeight: 600,
									}}
								>
									{it.rank}
								</td>
								<td style={{ fontWeight: 600 }}>{it.productName}</td>
								<td className="num">{it.quantity}</td>
								<td className="num font-mono">{fmtSom(it.revenue)}</td>
								<td className="num">{it.sharePct}%</td>
								<td>
									<div className="occ-bar" style={{ margin: 0 }}>
										<div
											className="occ-fill"
											style={{
												width: `${(it.revenue / maxRevenue) * 100}%`,
												background: "var(--felt-700)",
											}}
										/>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
