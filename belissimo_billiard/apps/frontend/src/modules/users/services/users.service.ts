import apiClient from "@/app/api/client";
import type {
	CreateUserDto,
	UpdateUserDto,
	User,
	UsersListResponse,
	UsersQueryParams,
} from "../types/users.types";

export const usersService = {
	async getAll(params?: UsersQueryParams): Promise<UsersListResponse> {
		const response = await apiClient.get<UsersListResponse>("/users", { params });
		return response.data;
	},

	async getById(id: string): Promise<User> {
		const response = await apiClient.get<User>(`/users/${id}`);
		return response.data;
	},

	async create(data: CreateUserDto): Promise<User> {
		const response = await apiClient.post<User>("/users", data);
		return response.data;
	},

	async update(id: string, data: UpdateUserDto): Promise<User> {
		const response = await apiClient.patch<User>(`/users/${id}`, data);
		return response.data;
	},

	async remove(id: string): Promise<void> {
		await apiClient.delete(`/users/${id}`);
	},
};
