import type { ProductCategory } from "./types";

export const PAGE_SIZE = 20;

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
	taom: "Taom",
	zakuska: "Zakuska",
	ichimlik: "Ichimlik",
	choy_qahva: "Choy/Qahva",
	kalyan: "Kalyan",
	boshqa: "Boshqa",
};

export const UNIT_LABEL = {
	shisha: "shisha",
	kg: "kg",
	dona: "dona",
	paket: "paket",
	litr: "litr",
} as const;

export type TabKey = "all" | ProductCategory | "low";

export const TABS: { key: TabKey; label: string }[] = [
	{ key: "all", label: "Barchasi" },
	{ key: "ichimlik", label: "Ichimlik" },
	{ key: "taom", label: "Taom" },
	{ key: "zakuska", label: "Zakuska" },
	{ key: "choy_qahva", label: "Choy/Qahva" },
	{ key: "kalyan", label: "Kalyan" },
	{ key: "low", label: "Kam qolgan" },
];

export function fmtSom(n: number) {
	return n.toLocaleString("uz-UZ");
}
