import { Form, Input, InputNumber, Spin, Switch, TimePicker } from "antd";
import dayjs from "dayjs";
import { useSettings, useUpdateSettings } from "../../hooks/useSettings";
import type { UpdateSettingsDto } from "../../types";

export function GeneralTab() {
	const { data: settings, isLoading } = useSettings();
	const { mutate: save, isPending } = useUpdateSettings();
	const [form] = Form.useForm<UpdateSettingsDto>();

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

	const handleSave = () => {
		form.validateFields().then((vals) => {
			save({
				...vals,
				openTime: vals.openTime
					? dayjs(vals.openTime as unknown as dayjs.Dayjs).format("HH:mm")
					: undefined,
				closeTime: vals.closeTime
					? dayjs(vals.closeTime as unknown as dayjs.Dayjs).format("HH:mm")
					: undefined,
			});
		});
	};

	return (
		<div className="card">
			<div className="card-hd">
				<h3>Umumiy sozlamalar</h3>
				<button
					className="btn btn-primary btn-sm"
					style={{ marginLeft: "auto" }}
					onClick={handleSave}
					disabled={isPending}
				>
					{isPending ? "Saqlanmoqda…" : "Saqlash"}
				</button>
			</div>
			<div className="card-body">
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						...settings,
						openTime: settings.openTime ? dayjs(settings.openTime, "HH:mm") : null,
						closeTime: settings.closeTime ? dayjs(settings.closeTime, "HH:mm") : null,
					}}
				>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
						<Form.Item name="clubName" label="Klub nomi" rules={[{ required: true }]}>
							<Input />
						</Form.Item>
						<Form.Item name="address" label="Manzil">
							<Input />
						</Form.Item>
						<Form.Item name="phone" label="Telefon">
							<Input placeholder="+998 71 200-00-08" />
						</Form.Item>
						<Form.Item name="website" label="Veb-sayt">
							<Input placeholder="bellissimo.uz" />
						</Form.Item>
						<Form.Item name="currency" label="Valyuta">
							<Input placeholder="UZS" />
						</Form.Item>
						<Form.Item name="currencySymbol" label="Valyuta belgisi">
							<Input placeholder="so'm" />
						</Form.Item>
						<Form.Item name="openTime" label="Ish boshlanish">
							<TimePicker style={{ width: "100%" }} format="HH:mm" />
						</Form.Item>
						<Form.Item name="closeTime" label="Ish tugash">
							<TimePicker style={{ width: "100%" }} format="HH:mm" />
						</Form.Item>
						<Form.Item name="serviceChargePct" label="Xizmat haqqi (%)">
							<InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
						</Form.Item>
						<Form.Item
							name="serviceChargeEnabled"
							label="Xizmat haqqini yoqish"
							valuePropName="checked"
						>
							<Switch />
						</Form.Item>
					</div>
				</Form>
			</div>
		</div>
	);
}
