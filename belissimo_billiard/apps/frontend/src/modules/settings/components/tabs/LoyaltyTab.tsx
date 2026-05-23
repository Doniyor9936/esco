import { Form, InputNumber, Spin, Switch } from "antd";
import { useSettings, useUpdateSettings } from "../../hooks/useSettings";

const TIERS = [
	{
		key: "bronze",
		label: "Bronze",
		color: "var(--wood-600, #7c5c3a)",
		fields: [
			{ name: "bronzeThreshold", label: "Chegara (so'm)", suffix: "so'm" },
			{ name: "bronzeCashbackPct", label: "Keshbek", suffix: "%" },
			{ name: "bronzeTableDiscountPct", label: "Stol chegirmasi", suffix: "%" },
			{ name: "bronzeBirthdayBonus", label: "Tug'ilgan kun", suffix: "so'm" },
		],
	},
	{
		key: "silver",
		label: "Silver",
		color: "var(--ink-500)",
		fields: [
			{ name: "silverThreshold", label: "Chegara (so'm)", suffix: "so'm" },
			{ name: "silverCashbackPct", label: "Keshbek", suffix: "%" },
			{ name: "silverTableDiscountPct", label: "Stol chegirmasi", suffix: "%" },
			{ name: "silverBirthdayBonus", label: "Tug'ilgan kun", suffix: "so'm" },
		],
	},
	{
		key: "gold",
		label: "★ Gold",
		color: "var(--gold-600, #b7791f)",
		fields: [
			{ name: "goldThreshold", label: "Chegara (so'm)", suffix: "so'm" },
			{ name: "goldCashbackPct", label: "Keshbek", suffix: "%" },
			{ name: "goldTableDiscountPct", label: "Stol chegirmasi", suffix: "%" },
			{ name: "goldBirthdayBonus", label: "Tug'ilgan kun", suffix: "so'm" },
		],
	},
] as const;

export function LoyaltyTab() {
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
				<h3>Sadoqat dasturi</h3>
				<div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
					<Form form={form} initialValues={settings} component={false}>
						<Form.Item name="loyaltyEnabled" valuePropName="checked" style={{ margin: 0 }}>
							<Switch />
						</Form.Item>
					</Form>
					<button
						className="btn btn-primary btn-sm"
						onClick={() => form.validateFields().then((v) => save(v))}
						disabled={isPending}
					>
						{isPending ? "Saqlanmoqda…" : "Saqlash"}
					</button>
				</div>
			</div>
			<div className="card-body">
				<Form form={form} layout="vertical" initialValues={settings}>
					<div style={{ marginBottom: 16 }}>
						<Form.Item name="pointsPer1000" label="1 000 so'm uchun ball">
							<InputNumber style={{ width: 200 }} min={0} addonAfter="ball" />
						</Form.Item>
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
						{TIERS.map(({ key, label, color, fields }) => (
							<div
								key={key}
								style={{
									border: `1px solid ${key === "gold" ? "var(--gold-500)" : "var(--ivory-300)"}`,
									borderRadius: 8,
									padding: 16,
								}}
							>
								<div
									style={{
										fontFamily: "Cormorant Garamond, serif",
										fontSize: 22,
										fontWeight: 600,
										color,
										marginBottom: 12,
									}}
								>
									{label}
								</div>
								{fields.map(({ name, label: lbl, suffix }) => (
									<Form.Item key={name} name={name} label={lbl} style={{ marginBottom: 10 }}>
										<InputNumber
											style={{ width: "100%" }}
											min={0}
											addonAfter={suffix}
											formatter={(v) =>
												suffix === "so'm" ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : `${v}`
											}
										/>
									</Form.Item>
								))}
							</div>
						))}
					</div>
				</Form>
			</div>
		</div>
	);
}
