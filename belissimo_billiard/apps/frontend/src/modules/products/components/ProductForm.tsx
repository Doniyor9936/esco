import { Form, Input, InputNumber, Select, Switch } from "antd";
import { CATEGORY_LABEL, UNIT_LABEL } from "../constants";

interface Props {
	form: ReturnType<typeof Form.useForm>[0];
}

export function ProductForm({ form }: Props) {
	return (
		<Form form={form} layout="vertical" style={{ marginTop: 8 }}>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
				<Form.Item
					name="name"
					label="Nomi"
					rules={[{ required: true }]}
					style={{ gridColumn: "1 / -1" }}
				>
					<Input placeholder="Pivo «Sarbast» 0.5" />
				</Form.Item>

				<Form.Item name="category" label="Kategoriya" rules={[{ required: true }]}>
					<Select
						options={Object.entries(CATEGORY_LABEL).map(([v, l]) => ({ value: v, label: l }))}
					/>
				</Form.Item>

				<Form.Item name="unit" label="O'lchov" rules={[{ required: true }]}>
					<Select options={Object.entries(UNIT_LABEL).map(([v, l]) => ({ value: v, label: l }))} />
				</Form.Item>

				<Form.Item name="sellingPrice" label="Sotuv narxi" rules={[{ required: true }]}>
					<InputNumber
						style={{ width: "100%" }}
						min={1}
						addonAfter="so'm"
						formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
					/>
				</Form.Item>

				<Form.Item name="costPrice" label="Tan narxi">
					<InputNumber
						style={{ width: "100%" }}
						min={1}
						addonAfter="so'm"
						formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
					/>
				</Form.Item>

				<Form.Item name="stockQuantity" label="Qoldiq">
					<InputNumber style={{ width: "100%" }} min={0} />
				</Form.Item>

				<Form.Item name="minStock" label="Minimum qoldiq">
					<InputNumber style={{ width: "100%" }} min={0} />
				</Form.Item>

				<Form.Item name="isAvailable" label="Mavjud" valuePropName="checked" initialValue={true}>
					<Switch />
				</Form.Item>

				<Form.Item
					name="isSoldSeparately"
					label="Alohida sotiladi"
					valuePropName="checked"
					initialValue={true}
				>
					<Switch />
				</Form.Item>

				<Form.Item name="description" label="Tavsif" style={{ gridColumn: "1 / -1" }}>
					<Input.TextArea rows={2} />
				</Form.Item>
			</div>
		</Form>
	);
}
