import { create } from "zustand";
import type { Session, SessionStatus, SessionsQueryParams } from "../types/sessions.types";

interface SessionsState {
	filters: SessionsQueryParams;
	activeSession: Session | null;
	activeStatus: SessionStatus | "all";
	search: string;

	setFilter: <K extends keyof SessionsQueryParams>(key: K, val: SessionsQueryParams[K]) => void;
	setActiveSession: (session: Session | null) => void;
	setActiveStatus: (status: SessionStatus | "all") => void;
	setSearch: (search: string) => void;
	resetFilters: () => void;
}

const DEFAULT_FILTERS: SessionsQueryParams = { page: 1, limit: 20 };

export const useSessionsStore = create<SessionsState>((set, get) => ({
	filters: DEFAULT_FILTERS,
	activeSession: null,
	activeStatus: "all",
	search: "",

	setFilter: (key, val) => set((state) => ({ filters: { ...state.filters, [key]: val, page: 1 } })),

	setActiveSession: (session) => set({ activeSession: session }),

	setActiveStatus: (status) => {
		set({ activeStatus: status });
		get().setFilter("status", status === "all" ? undefined : status);
	},

	setSearch: (search) => {
		set({ search });
		get().setFilter("search", search || undefined);
	},

	resetFilters: () => set({ filters: DEFAULT_FILTERS, activeStatus: "all", search: "" }),
}));
