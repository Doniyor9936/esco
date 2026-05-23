export const PAGE_SIZE = 20;

export function fmtSom(n: number) {
	return n.toLocaleString("uz-UZ");
}

export function getInitials(fullname: string) {
	return fullname
		.split(" ")
		.map((x) => x[0])
		.slice(0, 2)
		.join("");
}

export function fmtDate(iso: string) {
	return new Date(iso).toLocaleDateString("uz-UZ", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}
