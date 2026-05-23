import type { User } from "../types/users.types";
import { fmtSom } from "./constants";

interface Props {
	users: User[];
	total: number;
	isLoading: boolean;
}

export function UsersKPIRow({ users, total, isLoading }: Props) {
	const dash = isLoading ? "—" : null;

	return (
		<div className="kpi-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
			<div className="kpi">
				<div className="lbl">Jami foydalanuvchilar</div>
				<div className="val">{dash ?? fmtSom(total)}</div>
			</div>
			<div className="kpi">
				<div className="lbl">Aktiv</div>
				<div className="val" style={{ color: "var(--felt-700)" }}>
					{dash ?? users.filter((u) => u.isActive).length}
				</div>
			</div>
			<div className="kpi">
				<div className="lbl">Nofaol</div>
				<div className="val" style={{ color: "var(--ink-400)" }}>
					{dash ?? users.filter((u) => !u.isActive).length}
				</div>
			</div>
			<div className="kpi">
				<div className="lbl">Sahifadagi</div>
				<div className="val">{dash ?? users.length}</div>
			</div>
		</div>
	);
}
