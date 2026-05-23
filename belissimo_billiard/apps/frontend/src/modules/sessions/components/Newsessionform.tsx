import { Button, Form, Input, InputNumber, Select, Spin } from "antd";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type Table, type TablesResponse, useTables } from "@/modules/dashboard";
import { useCreateSession } from "../hooks/useSessions";
import type { CreateSessionDto } from "../types/sessions.types";

interface LocationState {
	tableId?: string;
	tableName?: string;
}

export function NewSessionForm() {
	const navigate = useNavigate();
	const location = useLocation();
	const state = (location.state ?? {}) as LocationState;
	const { mutate: create, isPending } = useCreateSession();
	const [form] = Form.useForm();

	const { data: tablesResponse, isLoading: tablesLoading } = useTables();

	// ✅ Button orqali kelsa — formga tableId ni set qilamiz
	useEffect(() => {
		if (state.tableId) {
			form.setFieldValue("tableId", state.tableId);
		}
	}, [state.tableId, form]);

	const onFinish = (values: CreateSessionDto) => {
		create(values, {
			onSuccess: (session) => {
				navigate(`/sessions/${session.id}`, { replace: true });
			},
		});
	};

	return (
		<div className="card" style={{ maxWidth: 480, margin: "40px auto", padding: 32 }}>
			<h2 style={{ marginBottom: 24 }}>Yangi sessiya ochish</h2>
			<Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ guestCount: 1 }}>
				{/* ✅ Bitta Form.Item — ichida shartli render */}
				<Form.Item
					label="Stol"
					name="tableId"
					rules={[{ required: true, message: "Stol tanlanmagan" }]}
				>
					{state.tableId ? (
						// Ekranda nom ko'rsatamiz — lekin forma tableId ni useEffect dan olgan
						<div
							style={{
								padding: "6px 12px",
								border: "1px solid #d9d9d9",
								borderRadius: 6,
								background: "#f5f5f5",
								color: "var(--felt-700)",
								fontWeight: 500,
							}}
						>
							{state.tableName ?? state.tableId}
						</div>
					) : (
						<Select
							placeholder="Stol tanlang"
							loading={tablesLoading}
							notFoundContent={tablesLoading ? <Spin size="small" /> : "Stollar topilmadi"}
							options={(tablesResponse as TablesResponse)?.data?.map((table: Table) => ({
								value: table.id,
								label: table.name,
							}))}
						/>
					)}
				</Form.Item>

				<Form.Item label="Mehmonlar soni" name="guestCount">
					<InputNumber min={1} max={20} style={{ width: "100%" }} />
				</Form.Item>

				<Form.Item label="Mehmon ismi" name="guestName">
					<Input placeholder="Temur aka (ixtiyoriy)" />
				</Form.Item>

				<div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
					<Button className="btn-danger" onClick={() => navigate("/dashboard")}>
						Bekor
					</Button>
					<Button className="btn-primary" type="primary" htmlType="submit" loading={isPending}>
						Sessiya ochish
					</Button>
				</div>
			</Form>
		</div>
	);
}
