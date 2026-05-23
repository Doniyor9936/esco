import { Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import { useCreateSettingsTable, useUpdateSettingsTable } from "../../hooks/useSettings";
import type { CreateSettingsTableDto, SettingsTable, SettingsTableType } from "../../types";

const TABLE_TYPE_LABELS: Record<SettingsTableType, string> = {
	america: "Amerika",
	rus_piramida: "Rus piramidasi",
	snooker: "Snooker",
};

interface Props {
	open: boolean;
	initial?: SettingsTable | null;
	onClose: () => void;
}

export function TableModal({ open, initial, onClose }: Props) {
	const [form] = Form.useForm();
	const { mutate: create, isPending: creating } = useCreateSettingsTable();
	const { mutate: update, isPending: updating } = useUpdateSettingsTable();
	const isEdit = !!initial;

	const handleOk = () => {
		form.validateFields().then((vals: CreateSettingsTableDto) => {
			if (isEdit) {
				update(
					{ id: initial?.id, data: vals },
					{
						onSuccess: () => {
							form.resetFields();
							onClose();
						},
					}
				);
			} else {
				create(vals, {
					onSuccess: () => {
						form.resetFields();
						onClose();
					},
				});
			}
		});
	};

	return (
		<Modal
			title={isEdit ? "Stolni tahrirlash" : "Yangi stol qo'shish"}
			open={open}
			onCancel={() => {
				form.resetFields();
				onClose();
			}}
			onOk={handleOk}
			okText={isEdit ? "Saqlash" : "Qo'shish"}
			cancelText="Bekor"
			confirmLoading={creating || updating}
			afterOpenChange={(o) => {
				if (o && initial) {
					form.setFieldsValue(initial);
				}
			}}
			width={480}
		>
			<Form form={form} layout="vertical" style={{ marginTop: 8 }}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
					<Form.Item
						name="name"
						label="Nomi"
						rules={[{ required: true }]}
						style={{ gridColumn: "1 / -1" }}
					>
						<Input placeholder="Stol 1" />
					</Form.Item>
					<Form.Item name="number" label="Raqam" rules={[{ required: true }]}>
						<InputNumber style={{ width: "100%" }} min={1} />
					</Form.Item>
					<Form.Item name="type" label="Turi" rules={[{ required: true }]}>
						<Select
							options={Object.entries(TABLE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
						/>
					</Form.Item>
					<Form.Item name="category" label="Kategoriya">
						<Select
							options={[
								{ value: "standard", label: "Standard" },
								{ value: "vip", label: "VIP" },
							]}
						/>
					</Form.Item>
					<Form.Item name="hourlyRate" label="Tarif / soat" rules={[{ required: true }]}>
						<InputNumber
							style={{ width: "100%" }}
							min={1}
							addonAfter="so'm"
							formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
						/>
					</Form.Item>
					<Form.Item name="eveningRate" label="Kechki tarif">
						<InputNumber
							style={{ width: "100%" }}
							min={1}
							addonAfter="so'm"
							formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
						/>
					</Form.Item>
					<Form.Item name="minRate" label="Min. tarif">
						<InputNumber
							style={{ width: "100%" }}
							min={1}
							addonAfter="so'm"
							formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
						/>
					</Form.Item>
					<Form.Item name="sortOrder" label="Tartib">
						<InputNumber style={{ width: "100%" }} min={0} />
					</Form.Item>
					<Form.Item name="isVip" label="VIP" valuePropName="checked">
						<Switch />
					</Form.Item>
					<Form.Item name="description" label="Tavsif" style={{ gridColumn: "1 / -1" }}>
						<Input.TextArea rows={2} />
					</Form.Item>
				</div>
			</Form>
		</Modal>
	);
}
