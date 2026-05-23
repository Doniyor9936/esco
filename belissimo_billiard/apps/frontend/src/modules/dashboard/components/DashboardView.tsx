import { Plus } from "lucide-react";
import { useState } from "react";
import { useTables } from "../hooks/useTables";
import type { FilterTab, Table, TablesQueryParams } from "../types";
import { TableCard } from "./TableCard";

interface DashboardViewProps {
	go?: (route: string, state?: unknown) => void;
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
	{ key: "all", label: "Barchasi" },
	{ key: "band", label: "Band" },
	{ key: "bosh", label: "Bo'sh" },
	{ key: "vip", label: "VIP" },
];

export function DashboardView({ go }: DashboardViewProps) {
	const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
	const [searchQuery] = useState("");

	const queryParams: TablesQueryParams = {
		limit: 50,
		page: 1,
		...(activeFilter === "band" && { status: "band" }),
		...(activeFilter === "bosh" && { status: "bosh" }),
		...(activeFilter === "vip" && { category: "vip" }),
		...(searchQuery && { search: searchQuery }),
	};

	const { data, isLoading, isError } = useTables(queryParams);
	const tables = data?.data ?? [];

	const { data: allData } = useTables({ limit: 100, page: 1 });
	const allTables = allData?.data ?? [];
	const busyCount = allTables.filter((t) => t.status === "band").length;
	const occupancy = allTables.length > 0 ? Math.round((busyCount / allTables.length) * 100) : 0;
	const totalGuests = busyCount;

	const countByFilter: Partial<Record<FilterTab, number>> = {
		all: allTables.length,
		band: allTables.filter((t) => t.status === "band").length,
		bosh: allTables.filter((t) => t.status === "bosh").length,
		bron: allTables.filter((t) => t.status === "bron").length,
		yopiq: allTables.filter((t) => t.status === "yopiq").length,
		vip: allTables.filter((t) => t.category === "vip").length,
	};

	const handleTableOpen = (table: Table) => {
		if (table.status === "band") {
			go?.(`sessions/by-table/${table.id}`);
		} else {
			go?.("sessions/new", { tableId: table.id, tableName: table.name });
		}
	};

	return (
		<>
			{/* KPI row */}
			<div className="kpi-row-d">
				{/* <div className="kpi">
					<div className="lbl">Bugungi tushum</div>
					<div className="val">
						{fmtSom(4_820_000)} <span className="unit">so'm</span>
					</div>
					<div className="delta">↑ 12.4% kecha bilan</div>
				</div> */}
				<div className="kpi">
					<div className="lbl">Bandlik</div>
					<div className="val">
						{occupancy}
						<span className="unit">%</span>
					</div>
					<div className="delta">
						{busyCount} ta {allTables.length} dan
					</div>
				</div>
				<div className="kpi">
					<div className="lbl">Aktiv sessiyalar</div>
					<div className="val">{busyCount}</div>
					<div className="delta">O'rtacha 82 daq.</div>
				</div>
				<div className="kpi">
					<div className="lbl">Mehmonlar</div>
					<div className="val">{totalGuests}</div>
					<div className="delta">Peak kuzatilmoqda</div>
				</div>
			</div>

			{/* Toolbar */}
			<div className="tables-toolbar">
				<div className="filter-group">
					{FILTER_TABS.map(({ key, label }) => (
						<button
							key={key}
							type="button"
							className={`filter-chip ${activeFilter === key ? "active" : ""}`}
							onClick={() => setActiveFilter(key)}
						>
							{label} <span className="ct">{countByFilter[key] ?? 0}</span>
						</button>
					))}
				</div>
				<div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
					<button type="button" className="btn btn-primary" onClick={() => go?.("sessions/new")}>
						<Plus size={15} /> Yangi sessiya
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="tables-grid">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={`skeleton-${i}`} className="table-card skeleton" style={{ height: 220 }} />
					))}
				</div>
			) : isError ? (
				<div style={{ padding: "48px", textAlign: "center", color: "var(--ink-500)" }}>
					Ma'lumotlarni yuklashda xatolik. Sahifani yangilang.
				</div>
			) : tables.length === 0 ? (
				<div style={{ padding: "48px", textAlign: "center", color: "var(--ink-500)" }}>
					Hech qanday stol topilmadi.
				</div>
			) : (
				<div className="tables-grid">
					{tables.map((table) => (
						<TableCard key={table.id} table={table} onOpen={handleTableOpen} />
					))}
				</div>
			)}
		</>
	);
}
