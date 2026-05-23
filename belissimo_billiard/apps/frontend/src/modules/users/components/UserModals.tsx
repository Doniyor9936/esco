import { UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Switch } from "antd";
import { useCreateUser, useDeleteUser, useUpdateUser } from "../hooks/useUsers";
import type { UpdateUserDto, User } from "../types/users.types";

// ─── CreateUserModal ──────────────────────────────────────────

interface CreateUserModalProps {
	open: boolean;
	onClose: () => void;
}

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
	const [form] = Form.useForm();
	const { mutate: create, isPending } = useCreateUser();

	const handleOk = () => {
		form.validateFields().then((values) => {
			create(values, {
				onSuccess: () => {
					form.resetFields();
					onClose();
				},
			});
		});
	};

	return (
		<Modal
			title="Yangi foydalanuvchi qo'shish"
			open={open}
			onCancel={onClose}
			footer={
				<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
					<Button onClick={onClose}>Bekor</Button>
					<Button type="primary" onClick={handleOk} loading={isPending}>
						Qo'shish
					</Button>
				</div>
			}
		>
			<Form form={form} layout="vertical" style={{ marginTop: 16 }}>
				<Form.Item
					label="Ism familiya"
					name="fullname"
					rules={[{ required: true, message: "To'ldiring" }]}
				>
					<Input prefix={<UserOutlined />} placeholder="Abdullayev Sardor" />
				</Form.Item>
				<Form.Item
					label="Telefon"
					name="phone"
					rules={[
						{ required: true, message: "To'ldiring" },
						{ pattern: /^\+?[1-9]\d{1,14}$/, message: "Telefon noto'g'ri" },
					]}
				>
					<Input placeholder="+998901234567" />
				</Form.Item>
				<Form.Item
					label="Parol"
					name="password"
					rules={[
						{ required: true, message: "To'ldiring" },
						{ min: 4, message: "Kamida 4 ta belgi" },
					]}
				>
					<Input.Password placeholder="••••••••" />
				</Form.Item>
			</Form>
		</Modal>
	);
}

// ─── UserDetailModal ──────────────────────────────────────────

interface UserDetailModalProps {
	user: User;
	open: boolean;
	onClose: () => void;
}

export function UserDetailModal({ user, open, onClose }: UserDetailModalProps) {
	const [form] = Form.useForm<UpdateUserDto>();
	const { mutate: update, isPending: updating } = useUpdateUser();
	const { mutate: remove, isPending: deleting } = useDeleteUser();

	const handleSave = () => {
		form.validateFields().then((values) => {
			const payload: UpdateUserDto = { ...values };
			if (!payload.password) {
				delete payload.password;
			}
			update({ id: user.id, data: payload }, { onSuccess: onClose });
		});
	};

	const handleDelete = () => {
		Modal.confirm({
			title: "Foydalanuvchini o'chirish",
			content: `${user.fullname} — rostdan ham o'chirilsinmi?`,
			okText: "O'chirish",
			okButtonProps: { danger: true },
			cancelText: "Bekor",
			onOk: () => remove(user.id, { onSuccess: onClose }),
		});
	};

	return (
		<Modal
			title={user.fullname}
			open={open}
			onCancel={onClose}
			footer={
				<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
					<Button danger onClick={handleDelete} loading={deleting} style={{ marginRight: "auto" }}>
						O'chirish
					</Button>
					<Button onClick={onClose}>Bekor</Button>
					<Button type="primary" onClick={handleSave} loading={updating}>
						Saqlash
					</Button>
				</div>
			}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={{ fullname: user.fullname, phone: user.phone, isActive: user.isActive }}
				style={{ marginTop: 16 }}
			>
				<Form.Item
					label="Ism familiya"
					name="fullname"
					rules={[{ required: true, message: "To'ldiring" }]}
				>
					<Input prefix={<UserOutlined />} />
				</Form.Item>
				<Form.Item
					label="Telefon"
					name="phone"
					rules={[
						{ required: true, message: "To'ldiring" },
						{ pattern: /^\+?[1-9]\d{1,14}$/, message: "Telefon noto'g'ri" },
					]}
				>
					<Input placeholder="+998901234567" />
				</Form.Item>
				<Form.Item label="Yangi parol (ixtiyoriy)" name="password">
					<Input.Password placeholder="O'zgartirmasangiz bo'sh qoldiring" />
				</Form.Item>
				<Form.Item label="Aktiv" name="isActive" valuePropName="checked">
					<Switch />
				</Form.Item>
			</Form>
		</Modal>
	);
}
