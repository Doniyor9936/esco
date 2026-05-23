import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { usersService } from "../services/users.service";
import type { CreateUserDto, UpdateUserDto, UsersQueryParams } from "../types/users.types";

export const userKeys = {
	all: ["users"] as const,
	list: (p?: UsersQueryParams) => ["users", "list", p] as const,
	detail: (id: string) => ["users", "detail", id] as const,
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────

export function useUsers(params?: UsersQueryParams) {
	return useQuery({
		queryKey: userKeys.list(params),
		queryFn: () => usersService.getAll(params),
		staleTime: 30_000,
	});
}

// ─── GET ONE ──────────────────────────────────────────────────────────────────

export function useUser(id: string) {
	return useQuery({
		queryKey: userKeys.detail(id),
		queryFn: () => usersService.getById(id),
		enabled: !!id,
	});
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export function useCreateUser() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateUserDto) => usersService.create(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: userKeys.all });
			message.success("Foydalanuvchi qo'shildi");
		},
		onError: () => message.error("Foydalanuvchi qo'shishda xatolik yuz berdi"),
	});
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export function useUpdateUser() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
			usersService.update(id, data),
		onSuccess: (user) => {
			qc.invalidateQueries({ queryKey: userKeys.detail(user.id) });
			qc.invalidateQueries({ queryKey: userKeys.all });
			message.success("Foydalanuvchi yangilandi");
		},
		onError: () => message.error("Foydalanuvchini yangilashda xatolik yuz berdi"),
	});
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export function useDeleteUser() {
	const { message } = App.useApp();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => usersService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: userKeys.all });
			message.success("Foydalanuvchi o'chirildi");
		},
		onError: () => message.error("O'chirishda xatolik yuz berdi"),
	});
}
