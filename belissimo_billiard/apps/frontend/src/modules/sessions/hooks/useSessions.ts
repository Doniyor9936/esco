import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { sessionsService } from "../services/sessions.service";
import type {
	CreateSessionDto,
	SessionsQueryParams,
	UpdateDiscountDto,
	UpdateRateDto,
} from "../types/sessions.types";

export const sessionKeys = {
	all: ["sessions"] as const,
	list: (p?: SessionsQueryParams) => ["sessions", "list", p] as const,
	detail: (id: string) => ["sessions", "detail", id] as const,
	byTable: (tableId: string) => ["sessions", "by-table", tableId] as const,
};

// ─── GET ALL ─────────────────────────────────────────────────
export function useSessions(params?: SessionsQueryParams) {
	return useQuery({
		queryKey: sessionKeys.list(params),
		queryFn: () => sessionsService.getAll(params),
		staleTime: 15_000,
	});
}

// ─── GET ONE ─────────────────────────────────────────────────
export function useSession(id: string) {
	return useQuery({
		queryKey: sessionKeys.detail(id),
		queryFn: () => sessionsService.getById(id),
		enabled: !!id,
		refetchInterval: (query) => (query.state.data?.status === "active" ? 30_000 : false),
	});
}

// ─── GET ACTIVE BY TABLE ──────────────────────────────────────
export function useActiveSessionByTable(tableId: string) {
	return useQuery({
		queryKey: sessionKeys.byTable(tableId),
		queryFn: () => sessionsService.getActiveByTable(tableId),
		enabled: !!tableId,
	});
}

// ─── CREATE ──────────────────────────────────────────────────
export function useCreateSession() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateSessionDto) => sessionsService.create(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: sessionKeys.all });
			qc.invalidateQueries({ queryKey: ["tables"] });
			message.success("Sessiya muvaffaqiyatli ochildi!");
		},
		onError: () => message.error("Sessiya ochishda xatolik yuz berdi"),
	});
}

// ─── PAUSE ───────────────────────────────────────────────────
export function usePauseSession() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => sessionsService.pause(id),
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: sessionKeys.detail(data.id) });
			qc.invalidateQueries({ queryKey: sessionKeys.all });
			message.success("Sessiya pauza qilindi");
		},
		onError: () => message.error("Pauza qilishda xatolik yuz berdi"),
	});
}

// ─── RESUME ──────────────────────────────────────────────────
export function useResumeSession() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => sessionsService.resume(id),
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: sessionKeys.detail(data.id) });
			qc.invalidateQueries({ queryKey: sessionKeys.all });
			message.success("O'yin davom ettirildi");
		},
		onError: () => message.error("Davom ettirishda xatolik yuz berdi"),
	});
}

// ─── UPDATE RATE ─────────────────────────────────────────────
export function useUpdateSessionRate() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRateDto }) =>
			sessionsService.updateRate(id, data),
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: sessionKeys.detail(data.id) });
			message.success("Tarif yangilandi");
		},
		onError: () => message.error("Tarif yangilashda xatolik yuz berdi"),
	});
}

// ─── UPDATE DISCOUNT ─────────────────────────────────────────
export function useUpdateSessionDiscount() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateDiscountDto }) =>
			sessionsService.updateDiscount(id, data),
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: sessionKeys.detail(data.id) });
			message.success("Chegirma qo'shildi");
		},
		onError: () => message.error("Chegirma qo'shishda xatolik yuz berdi"),
	});
}

// ─── CLOSE ───────────────────────────────────────────────────
export function useCloseSession() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => sessionsService.close(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: sessionKeys.all });
			qc.invalidateQueries({ queryKey: ["tables"] });
			message.success("Sessiya yopildi, to'lovga tayyor");
		},
		onError: () => message.error("Sessiyani yopishda xatolik yuz berdi"),
	});
}

// ─── CANCEL ──────────────────────────────────────────────────
export function useCancelSession() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => sessionsService.cancel(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: sessionKeys.all });
			qc.invalidateQueries({ queryKey: ["tables"] });
			message.success("Sessiya bekor qilindi");
		},
		onError: () => message.error("Bekor qilishda xatolik yuz berdi"),
	});
}
