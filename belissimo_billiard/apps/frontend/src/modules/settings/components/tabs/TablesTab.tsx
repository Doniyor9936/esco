import { Popconfirm, Spin } from "antd";
import { Edit, Plus, Star } from "lucide-react";
import { useState } from "react";
import { useDeleteSettingsTable, useSettingsTables } from "../../hooks/useSettings";
import type { SettingsTable, SettingsTableType } from "../../types";
import { TableModal } from "../modals/TableModal";

const TABLE_TYPE_LABELS: Record<SettingsTableType, string> = {
	america: "Amerika",
	rus_piramida: "Rus piramidasi",
	snooker: "Snooker",
};

function fmtSom(n: number) {
	return n.toLocaleString("uz-UZ");
}

export function TablesTab() {
	const { data: tables, isLoading } = useSettingsTables();
	const { mutate: remove } = useDeleteSettingsTable();
	const [modal, setModal] = useState(false);
	const [editTable, setEditTable] = useState<SettingsTable | null>(null);

	if (isLoading) {
		return (
			<div style={{ padding: 40, textAlign: "center" }}>
				<Spin />
			</div>
		);
	}

	return (
		<>
			<div className="card">
				<div className="card-hd">
					<h3>Stollar va tariflar</h3>
					<button
						className="btn btn-primary btn-sm"
						style={{ marginLeft: "auto" }}
						onClick={() => {
							setEditTable(null);
							setModal(true);
						}}
					>
						<Plus size={14} /> Stol qo'shish
					</button>
				</div>
				<table className="tbl">
					<thead>
						<tr>
							<th>Nomi</th>
							<th>Turi</th>
							<th className="num">Tarif / soat</th>
							<th className="num">Kechki tarif</th>
							<th className="num">Min. tarif</th>
							<th>VIP</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{(tables ?? []).map((t) => (
							<tr key={t.id}>
								<td style={{ fontWeight: 600 }}>{t.name}</td>
								<td>{TABLE_TYPE_LABELS[t.type]}</td>
								<td className="num font-mono">{fmtSom(t.hourlyRate)}</td>
								<td className="num font-mono" style={{ color: "var(--ink-500)" }}>
									{t.eveningRate ? fmtSom(t.eveningRate) : "—"}
								</td>
								<td className="num font-mono" style={{ color: "var(--ink-500)" }}>
									{t.minRate ? fmtSom(t.minRate) : "—"}
								</td>
								<td>
									{t.isVip ? (
										<span className="chip vip">
											<Star size={10} style={{ marginRight: 3 }} />
											VIP
										</span>
									) : (
										<span style={{ color: "var(--ink-400)" }}>—</span>
									)}
								</td>
								<td>
									<div style={{ display: "flex", gap: 4 }}>
										<button
											className="btn btn-ghost btn-sm"
											onClick={() => {
												setEditTable(t);
												setModal(true);
											}}
										>
											<Edit size={13} />
										</button>
										<Popconfirm
											title="Stolni o'chirasizmi?"
											onConfirm={() => remove(t.id)}
											okText="Ha"
											cancelText="Yo'q"
											okType="danger"
										>
											<button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }}>
												✕
											</button>
										</Popconfirm>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<TableModal
				open={modal}
				initial={editTable}
				onClose={() => {
					setModal(false);
					setEditTable(null);
				}}
			/>
		</>
	);
}
