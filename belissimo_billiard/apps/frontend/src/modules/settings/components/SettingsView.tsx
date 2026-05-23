import { useState } from "react";
import { GeneralTab } from "./tabs/GeneralTab";
import { LoyaltyTab } from "./tabs/LoyaltyTab";
import { PaymentTab } from "./tabs/PaymentTab";
import { ReceiptTab } from "./tabs/ReceiptTab";
import { TablesTab } from "./tabs/TablesTab";

const NAV_ITEMS = [
	{ id: "general", label: "Umumiy" },
	{ id: "tables", label: "Stollar va tariflar" },
	{ id: "payment", label: "To'lov usullari" },
	{ id: "loyalty", label: "Sadoqat dasturi" },
	{ id: "receipt", label: "Printer va chek" },
] as const;

type TabId = (typeof NAV_ITEMS)[number]["id"];

const TAB_MAP: Record<TabId, React.ReactNode> = {
	general: <GeneralTab />,
	tables: <TablesTab />,
	payment: <PaymentTab />,
	loyalty: <LoyaltyTab />,
	receipt: <ReceiptTab />,
};

export function SettingsView() {
	const [tab, setTab] = useState<TabId>("general");

	return (
		<div className="settings-layout">
			<div className="settings-nav">
				{NAV_ITEMS.map((item) => (
					<button
						key={item.id}
						className={`snav-item ${tab === item.id ? "active" : ""}`}
						onClick={() => setTab(item.id)}
					>
						{item.label}
					</button>
				))}
			</div>

			<div className="settings-body">{TAB_MAP[tab]}</div>
		</div>
	);
}
