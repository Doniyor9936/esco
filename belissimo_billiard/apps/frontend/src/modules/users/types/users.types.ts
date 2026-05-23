export interface User {
	id: string;
	fullname: string;
	phone: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UsersMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface UsersListResponse {
	success: boolean;
	data: {
		items: User[];
		meta: UsersMeta;
	};
}

export interface UsersQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}

export interface CreateUserDto {
	fullname: string;
	phone: string;
	password: string;
}

export interface UpdateUserDto {
	fullname?: string;
	phone?: string;
	password?: string;
	isActive?: boolean;
}
