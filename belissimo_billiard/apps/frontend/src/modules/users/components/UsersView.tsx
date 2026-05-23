import { Alert, Button } from "antd";
import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import type { User, UsersQueryParams } from "../types/users.types";
import { PAGE_SIZE } from "./constants";
import { CreateUserModal, UserDetailModal } from "./UserModals";
import { UsersKPIRow } from "./UsersKPIRow";
import { UsersTable } from "./UsersTable";

export function UsersView() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [createOpen, setCreateOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const handleSearch = (v: string) => {
		setSearch(v);
		setPage(1);
	};

	const queryParams: UsersQueryParams = { page, limit: PAGE_SIZE, search: search || undefined };
	const { data, isLoading, isError, refetch } = useUsers(queryParams);

	const users = data?.data.items ?? [];
	const meta = data?.data.meta;
	const total = meta?.total ?? 0;
	const totalPages = meta?.totalPages ?? 1;

	if (isError) {
		return (
			<Alert
				type="error"
				message="Xatolik"
				description="Ma'lumot yuklashda xatolik yuz berdi"
				action={
					<Button size="small" onClick={() => refetch()}>
						Qayta urinish
					</Button>
				}
			/>
		);
	}

	return (
		<>
			<UsersKPIRow users={users} total={total} isLoading={isLoading} />

			<UsersTable
				users={users}
				isLoading={isLoading}
				search={search}
				page={page}
				total={total}
				totalPages={totalPages}
				onSearchChange={handleSearch}
				onPageChange={setPage}
				onAddClick={() => setCreateOpen(true)}
				onEditClick={setSelectedUser}
			/>

			<CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />

			{selectedUser && (
				<UserDetailModal
					user={selectedUser}
					open={!!selectedUser}
					onClose={() => setSelectedUser(null)}
				/>
			)}
		</>
	);
}
