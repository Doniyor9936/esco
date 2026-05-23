export function fmtSom(n: number): string {
	return new Intl.NumberFormat("uz-UZ").format(n);
}

export function fmtDur(ms: number): string {
	const mins = Math.floor(ms / 60000);
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function calcSessionCost(startIso: string | null, hourlyRate: number): number {
	if (!startIso) {
		return 0;
	}
	const elapsed = Date.now() - new Date(startIso).getTime();
	const mins = elapsed / 60000;
	return Math.round((mins / 60) * hourlyRate);
}

export const TABLE_TYPE_LABELS: Record<string, string> = {
	america: "Amerika",
	rus_piramida: "Rus piramidasi",
	snooker: "Snooker",
};

export const STATUS_CONFIG = {
	bosh: { label: "Bo'sh", chipClass: "ok" },
	band: { label: "Band", chipClass: "busy" },
	bron: { label: "Bron", chipClass: "warn" },
	yopiq: { label: "Tozalash", chipClass: "neutral" },
} as const;
