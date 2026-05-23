import { fmtSom } from "../constants";
import type { Product } from "../types";

interface Props {
	products: Product[];
}

export function InventoryKPIRow({ products }: Props) {
	const lowCount = products.filter((p) => p.stockQuantity <= p.minStock).length;
	const totalValue = products.reduce((s, p) => s + p.stockQuantity * p.costPrice, 0);

	return (
		<div className="kpi-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
			<div className="kpi">
				<div className="lbl">Ombor qiymati</div>
				<div className="val">
					{fmtSom(totalValue)} <span className="unit">so'm</span>
				</div>
			</div>

			<div className="kpi">
				<div className="lbl">Pozitsiyalar</div>
				<div className="val">{products.length}</div>
			</div>

			<div className="kpi">
				<div className="lbl">Kam qolgan</div>
				<div className="val" style={{ color: lowCount > 0 ? "var(--warn)" : "var(--ok)" }}>
					{lowCount}
				</div>
				<div className={`delta ${lowCount > 0 ? "down" : ""}`}>
					{lowCount > 0 ? "E'tibor bering" : "Hammasi joyida"}
				</div>
			</div>
		</div>
	);
}
