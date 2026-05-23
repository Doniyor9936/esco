import { Form, Spin, Switch } from "antd";
import { useSettings, useUpdateSettings } from "../../hooks/useSettings";

const METHODS = [
	{ key: "cashEnabled", label: "Naqd pul" },
	{ key: "cardEnabled", label: "Karta (UzCard/Humo)" },
	{ key: "clickEnabled", label: "Click" },
	{ key: "paymeEnabled", label: "Payme" },
	{ key: "installmentEnabled", label: "Bo'lib to'lash" },
] as const;

export function PaymentTab() {
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
				<h3>To'lov usullari</h3>
				<button
					className="btn btn-primary"
					style={{ marginLeft: "auto" }}
					onClick={() => form.validateFields().then((v) => save(v))}
					disabled={isPending}
				>
					{isPending ? "Saqlanmoqda…" : "Saqlash"}
				</button>
			</div>
			<div className="card-body">
				<Form form={form} initialValues={settings}>
					{METHODS.map(({ key, label }) => (
						<div
							key={key}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 14,
								padding: "14px 0",
								borderBottom: "1px solid var(--ivory-200)",
							}}
						>
							<div style={{ flex: 1, fontWeight: 600 }}>{label}</div>
							<Form.Item name={key} valuePropName="checked" style={{ margin: 0 }}>
								<Switch />
							</Form.Item>
						</div>
					))}
				</Form>
			</div>
		</div>
	);
}
