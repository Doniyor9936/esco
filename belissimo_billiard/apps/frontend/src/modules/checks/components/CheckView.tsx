import { CardSim, Check as CheckIcon, QrCode, Sliders } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import type { Check, PaymentMethod } from "../types";

type Props = {
	check: Check;
	loading?: boolean;
	onPay: (method: PaymentMethod, receivedAmount: number) => void;
	onCancel: () => void;
};

function fmtSom(val: number) {
	return val.toLocaleString("uz-UZ");
}

function fmtDur(minutes: number) {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return h > 0 ? `${h}s ${m}d` : `${m}d`;
}

function fmtDate(iso: string) {
	const d = new Date(iso);
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const yyyy = d.getFullYear();
	const hh = String(d.getHours()).padStart(2, "0");
	const min = String(d.getMinutes()).padStart(2, "0");
	return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

export const CheckView: React.FC<Props> = ({ check, onPay, onCancel, loading }) => {
	const [payMethod, setPayMethod] = useState<PaymentMethod>("naqd");
	const [receivedAmount, setReceivedAmount] = useState<string>(check.total.toString());

	const received = Number(receivedAmount || 0);
	const change = useMemo(() => received - check.total, [received, check.total]);

	const table = check.session?.tableType || "Table";
	const checkNum = check.id.slice(-4);

	const payMethodLabel: Record<PaymentMethod, string> = {
		naqd: "Naqd",
		karta: "Karta",
		click: "Click",
		payme: "Payme",
		bolib_tolash: "Bo'lib to'lash",
	};

	return (
		<div className="check-layout">
			{/* ───────── PAY PANEL (LEFT) ───────── */}
			<div className="pay-panel">
				<div className="card" style={{ padding: 22 }}>
					<h3 style={{ fontSize: 22, marginBottom: 4 }}>To'lov</h3>

					<div
						style={{
							fontSize: 12,
							color: "var(--ink-500)",
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							marginBottom: 18,
						}}
					>
						{table} · Chek #{checkNum}
					</div>

					{/* TOTAL */}
					<div className="pay-total">
						<div className="pt-lbl">Jami to'lanadi</div>
						<div className="pt-val">
							{fmtSom(check.total)}{" "}
							<span style={{ fontSize: 18, color: "var(--ink-500)" }}>so'm</span>
						</div>
					</div>

					{/* METHODS */}
					<div className="pay-methods">
						<div className="m-lbl" style={{ marginBottom: 10 }}>
							To'lov usuli
						</div>

						<div className="method-grid">
							<button
								className={`method ${payMethod === "naqd" ? "active" : ""}`}
								onClick={() => setPayMethod("naqd")}
							>
								<CardSim size={22} />
								<span>Naqd</span>
							</button>

							<button
								className={`method ${payMethod === "karta" ? "active" : ""}`}
								onClick={() => setPayMethod("karta")}
							>
								<CardSim size={22} />
								<span>Karta</span>
							</button>

							<button
								className={`method ${payMethod === "click" ? "active" : ""}`}
								onClick={() => setPayMethod("click")}
							>
								<QrCode size={22} />
								<span>Click/Payme</span>
							</button>

							<button
								className={`method ${payMethod === "bolib_tolash" ? "active" : ""}`}
								onClick={() => setPayMethod("bolib_tolash")}
							>
								<Sliders size={22} />
								<span>Bo'lib</span>
							</button>
						</div>
					</div>

					{/* CASH */}
					{payMethod === "naqd" && (
						<div className="cash-panel">
							<div className="field" style={{ marginBottom: 8 }}>
								<label>Qabul qilindi</label>
								<input
									type="text"
									value={receivedAmount}
									inputMode="numeric"
									onChange={(e) => {
										const val = e.target.value;
										if (/^\d*$/.test(val)) {
											setReceivedAmount(val);
										}
									}}
								/>
							</div>

							<div className="cash-change">
								<span>Qaytim</span>
								<span className="font-mono">{fmtSom(change > 0 ? change : 0)} so'm</span>
							</div>

							<div className="quick-cash">
								{[50000, 100000, 200000, 500000].map((v) => (
									<button
										key={v}
										className="btn btn-ghost btn-sm"
										onClick={() => setReceivedAmount(v.toString())}
									>
										{fmtSom(v)}
									</button>
								))}
							</div>
						</div>
					)}

					{/* CARD / QR */}
					{payMethod !== "naqd" && (
						<div className="cash-panel">
							<div
								style={{
									padding: 16,
									background: "var(--ivory-50)",
									borderRadius: 6,
									textAlign: "center",
									fontSize: 13,
									color: "var(--ink-600)",
								}}
							>
								Terminal / QR to'lov
								<div
									style={{
										marginTop: 8,
										fontFamily: "JetBrains Mono",
										fontSize: 11,
										color: "var(--ink-500)",
									}}
								>
									UzCard · Humo · Visa · MC
								</div>
							</div>
						</div>
					)}

					{/* ACTIONS */}
					<div style={{ display: "flex", gap: 10, marginTop: 18 }}>
						<button className="btn btn-ghost btn-lg" onClick={onCancel}>
							Bekor
						</button>

						<button
							className="btn btn-gold btn-lg"
							style={{ flex: 1, justifyContent: "center" }}
							disabled={loading}
							onClick={() => onPay(payMethod, payMethod === "naqd" ? received : check.total)}
						>
							<CheckIcon size={17} /> Qabul qilish va chop etish
						</button>
					</div>
				</div>
			</div>

			{/* ───────── RECEIPT (RIGHT) ───────── */}
			<div className="receipt-panel">
				<div className="receipt-label">Oldindan ko'rish</div>

				<div className="receipt">
					{/* HEAD */}
					<div className="r-head">
						<div className="r-logo">
							<div className="r-8ball">8</div>
						</div>

						<div className="r-biz"> BILLIARD</div>
					</div>

					<div className="r-sep"></div>

					{/* META */}
					<div className="r-meta-block">
						<div className="r-meta">
							<span>Chek №</span>
							<span className="font-mono">{checkNum}</span>
						</div>
						<div className="r-meta">
							<span>Sana</span>
							<span className="font-mono">{fmtDate(check.createdAt)}</span>
						</div>
						<div className="r-meta">
							<span>Stol</span>
							<span className="font-mono">{table}</span>
						</div>
						{check.session?.guestName && (
							<div className="r-meta">
								<span>Mijoz</span>
								<span className="font-mono">{check.session.guestName}</span>
							</div>
						)}
					</div>

					<div className="r-sep dashed"></div>

					{/* ITEMS HEADER */}
					<div className="r-items-header">
						<span>NOMI</span>
						<span>MIQDOR</span>
						<span>NARX</span>
						<span>JAMI</span>
					</div>

					<div className="r-sep dashed"></div>

					{/* GAME ROW */}
					{check.gameMinutes > 0 && (
						<div className="r-item">
							<span>O'yin: {table}</span>
							<span>{fmtDur(check.gameMinutes)}</span>
							<span>{fmtSom(check.session?.hourlyRate ?? 0)}</span>
							<span>{fmtSom(check.gameAmount)}</span>
						</div>
					)}

					{/* ORDER ITEMS */}
					{check.orders.map((order) =>
						order.items.map((it, idx) => (
							<div key={`${order.id}-${idx}`} className="r-item">
								<span>{it.productName}</span>
								<span>{it.quantity}</span>
								<span>{fmtSom(it.unitPrice)}</span>
								<span>{fmtSom(it.totalPrice)}</span>
							</div>
						))
					)}

					<div className="r-sep dashed"></div>

					{/* SUBTOTALS */}
					<div className="r-totals">
						<div className="r-t-row">
							<span>Oraliq jami</span>
							<span>{fmtSom(check.subtotal)}</span>
						</div>

						{check.serviceChargeAmount > 0 && (
							<div className="r-t-row">
								<span>Xizmat haqqi {check.serviceCharge}%</span>
								<span>{fmtSom(check.serviceChargeAmount)}</span>
							</div>
						)}

						{check.discount > 0 && (
							<div className="r-t-row discount">
								<span>Chegirma</span>
								<span>-{fmtSom(check.discount)}</span>
							</div>
						)}
					</div>

					<div className="r-sep"></div>

					{/* TOTAL */}
					<div className="r-totals">
						<div className="r-t-row big">
							<span>JAMI</span>
							<span>{fmtSom(check.total)} so'm</span>
						</div>
					</div>

					<div className="r-sep"></div>

					{/* PAYMENT */}
					<div className="r-pay">
						<div className="r-t-row">
							<span>To'lov turi</span>
							<span>{payMethodLabel[payMethod]}</span>
						</div>
						{payMethod === "naqd" && received > 0 && (
							<>
								<div className="r-t-row">
									<span>Qabul qilindi</span>
									<span>{fmtSom(received)} so'm</span>
								</div>
								<div className="r-t-row">
									<span>Qaytim</span>
									<span>{fmtSom(change > 0 ? change : 0)} so'm</span>
								</div>
							</>
						)}
					</div>

					<div className="r-sep dashed"></div>

					{/* QR + THANKS */}
					<div className="r-footer">
						<div className="r-qr-placeholder">
							{/* 5×5 QR placeholder squares */}
							{Array.from({ length: 25 }).map((_, i) => (
								<div key={i} className="r-qr-cell" />
							))}
						</div>
						<div className="r-thanks">
							<p>Tashrifingiz uchun rahmat!</p>
							<p>QR kod orqali chekingizni tekshiring.</p>
							<p className="r-stars">* * * * *</p>
						</div>
					</div>

					{/* SITE FOOTER */}
					<div className="r-site">fisk.ofd.uz · 2026</div>
				</div>
			</div>
		</div>
	);
};
