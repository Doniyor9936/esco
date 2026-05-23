import { Form, Input, Spin, Switch } from "antd";
import { useSettings, useUpdateSettings } from "../../hooks/useSettings";

export function ReceiptTab() {
	const { data: settings, isLoading } = useSettings();
	const { mutate: save, isPending } = useUpdateSettings();
	const [form] = Form.useForm();

	if (isLoading) {
		return (
			<div style={{ padding: 40, textAlign: "center" }}>
				<Spin />
			</div>
		);
	}
	if (!settings) {
		return null;
	}

	return (
		<div className="card">
			<div className="card-hd">
				<h3>Printer va chek</h3>
				<button
					className="btn btn-primary btn-sm"
					style={{ marginLeft: "auto" }}
					onClick={() => form.validateFields().then((v) => save(v))}
					disabled={isPending}
				>
					{isPending ? "Saqlanmoqda…" : "Saqlash"}
				</button>
			</div>
			<div className="card-body">
				<Form form={form} layout="vertical" initialValues={settings}>
					<Form.Item name="receiptHeader" label="Chek sarlavhasi">
						<Input.TextArea rows={2} placeholder="Tashrifingiz uchun rahmat!" />
					</Form.Item>
					<Form.Item name="receiptFooter" label="Chek pastki matni">
						<Input.TextArea rows={2} placeholder="bellissimo.uz" />
					</Form.Item>
					<Form.Item name="receiptShowLogo" label="Logotip ko'rsatish" valuePropName="checked">
						<Switch />
					</Form.Item>
				</Form>
			</div>
		</div>
	);
}
