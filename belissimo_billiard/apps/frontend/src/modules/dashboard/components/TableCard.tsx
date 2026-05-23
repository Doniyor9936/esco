import { Star } from "lucide-react";
import type { Table } from "../types";
import { fmtSom, STATUS_CONFIG, TABLE_TYPE_LABELS } from "../utils/format";

interface TableCardProps {
	table: Table;
	onOpen?: (table: Table) => void;
}

export function TableCard({ table, onOpen }: TableCardProps) {
	const statusCfg = STATUS_CONFIG[table.status];
	const isVip = table.category === "vip";

	const feltStyle: React.CSSProperties =
		table.status === "band"
			? { background: "linear-gradient(135deg, var(--felt-700), var(--felt-800))" }
			: table.status === "bosh"
				? { background: "linear-gradient(135deg, var(--felt-600), var(--felt-700))", opacity: 0.85 }
				: { background: "linear-gradient(135deg, var(--ink-600), var(--ink-700))", opacity: 0.7 };

	const feltContent = () => {
		if (table.status === "band") {
			return (
				<div className="felt-balls">
					<span className="ball r" />
					<span className="ball y" />
					<span className="ball g" />
					<span className="ball b" />
					<span className="ball bc" />
				</div>
			);
		}
		if (table.status === "bosh") {
			return <div className="felt-label">BO'SH</div>;
		}
		if (table.status === "bron") {
			return <div className="felt-label">BRON</div>;
		}
		if (table.status === "yopiq") {
			return <div className="felt-label">YOPIQ</div>;
		}
		return null;
	};

	return (
		<div
			className={`table-card ${table.status}`}
			role="button"
			tabIndex={0}
			onClick={() => onOpen?.(table)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onOpen?.(table);
				}
			}}
		>
			<div className="table-top">
				<div className="tc-head">
					<div className="tc-name">
						{isVip && (
							<Star
								size={14}
								style={{ color: "var(--gold-500)", fill: "var(--gold-500)", marginRight: 4 }}
							/>
						)}
						{table.name}
					</div>
					<div className="tc-kind">{TABLE_TYPE_LABELS[table.type] ?? table.type}</div>
				</div>
				<span className={`chip ${statusCfg.chipClass}`}>{statusCfg.label}</span>
			</div>

			<div className="felt" style={feltStyle}>
				<div className="felt-inner">
					<span className="pocket p-tl" />
					<span className="pocket p-tr" />
					<span className="pocket p-bl" />
					<span className="pocket p-br" />
					<span className="pocket p-tm" />
					<span className="pocket p-bm" />
					{feltContent()}
				</div>
			</div>

			<div className="tc-foot">
				<div className="tc-rate">
					<div className="m-lbl">Tarif</div>
					<div className="m-val">{fmtSom(table.hourlyRate)} / soat</div>
				</div>
				{table.status === "band" && (
					<div className="tc-metric">
						<div className="m-lbl">Holat</div>
						<div className="m-val" style={{ color: "var(--felt-700)", fontWeight: 600 }}>
							Aktiv
						</div>
					</div>
				)}
				{table.status === "bron" && (
					<div className="tc-metric">
						<div className="m-lbl">Holat</div>
						<div className="m-val" style={{ color: "var(--gold-500)", fontWeight: 600 }}>
							Bron
						</div>
					</div>
				)}
			</div>

			{table.description && <div className="tc-note">{table.description}</div>}
		</div>
	);
}
