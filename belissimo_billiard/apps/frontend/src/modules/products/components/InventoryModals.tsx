import { Form, Input, InputNumber, Modal } from "antd";
import { useState } from "react";
import { UNIT_LABEL } from "../constants";
import type { CreateProductDto, Product, StockInDto } from "../types";
import { ProductForm } from "./ProductForm";

// ─── Create Modal ─────────────────────────────────────────────

interface CreateModalProps {
	open: boolean;
	creating: boolean;
	onClose: () => void;
	onCreate: (vals: CreateProductDto) => void;
}

export function CreateProductModal({ open, creating, onClose, onCreate }: CreateModalProps) {
	const [form] = Form.useForm();

	const handleOk = () => {
		form.validateFields().then((vals: CreateProductDto) => {
			onCreate(vals);
			form.resetFields();
		});
	};

	const handleCancel = () => {
		onClose();
		form.resetFields();
	};

	return (
		<Modal
			title="Yangi mahsulot qo'shish"
			open={open}
			onCancel={handleCancel}
			onOk={handleOk}
			okText="Qo'shish"
			cancelText="Bekor"
			confirmLoading={creating}
			width={560}
			okButtonProps={{
				style: {
					background: "var(--felt-800)",
					borderColor: "var(--felt-800)",
					color: "#fff",
					borderRadius: 6,
				},
			}}
			cancelButtonProps={{
				style: {
					background: "var(--ivory-200)",
					borderColor: "var(--ivory-300)",
					color: "var(--ink-800)",
					borderRadius: 6,
				},
			}}
		>
			<ProductForm form={form} />
		</Modal>
	);
}

// ─── Edit Modal ───────────────────────────────────────────────

interface EditModalProps {
	product: Product | null;
	updating: boolean;
	onClose: () => void;
	onUpdate: (id: string, vals: Partial<Product>) => void;
}

export function EditProductModal({ product, updating, onClose, onUpdate }: EditModalProps) {
	const [form] = Form.useForm();

	if (product) {
		form.setFieldsValue(product);
	}

	const handleOk = () => {
		if (!product) {
			return;
		}
		form.validateFields().then((vals) => {
			onUpdate(product.id, vals);
			form.resetFields();
		});
	};

	const handleCancel = () => {
		onClose();
		form.resetFields();
	};

	return (
		<Modal
			title="Mahsulotni tahrirlash"
			open={!!product}
			onCancel={handleCancel}
			onOk={handleOk}
			okText="Saqlash"
			cancelText="Bekor"
			confirmLoading={updating}
			width={560}
			okButtonProps={{
				style: {
					background: "var(--felt-800)",
					borderColor: "var(--felt-800)",
					color: "#fff",
					borderRadius: 6,
				},
			}}
			cancelButtonProps={{
				style: {
					background: "var(--ivory-200)",
					borderColor: "var(--ivory-300)",
					color: "var(--ink-800)",
					borderRadius: 6,
				},
			}}
		>
			<ProductForm form={form} />
		</Modal>
	);
}

// ─── Stock-in Modal ───────────────────────────────────────────

interface StockModalProps {
	product: Product | null;
	stocking: boolean;
	onClose: () => void;
	onStockIn: (id: string, dto: StockInDto) => void;
}

export function StockInModal({ product, stocking, onClose, onStockIn }: StockModalProps) {
	const [qty, setQty] = useState<number | null>(null);
	const [cost, setCost] = useState<number | null>(null);
	const [reason, setReason] = useState("");

	const handleOk = () => {
		if (!(product && qty)) {
			return;
		}
		onStockIn(product.id, {
			quantity: qty,
			...(cost && { unitCost: cost }),
			...(reason && { reason }),
		});
	};

	const handleCancel = () => {
		onClose();
		setQty(null);
		setCost(null);
		setReason("");
	};

	return (
		<Modal
			title={`Keltirish: ${product?.name ?? ""}`}
			open={!!product}
			onCancel={handleCancel}
			onOk={handleOk}
			okText="Omborga qo'shish"
			cancelText="Bekor"
			confirmLoading={stocking}
			okButtonProps={{
				style: {
					background: "var(--felt-800)",
					borderColor: "var(--felt-800)",
					color: "#fff",
					borderRadius: 6,
				},
			}}
			cancelButtonProps={{
				style: {
					background: "var(--ivory-200)",
					borderColor: "var(--ivory-300)",
					color: "var(--ink-800)",
					borderRadius: 6,
				},
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
				<div>
					<div className="m-lbl" style={{ marginBottom: 6 }}>
						Miqdor *
					</div>
					<InputNumber
						style={{ width: "100%" }}
						value={qty}
						onChange={setQty}
						min={1}
						addonAfter={product ? UNIT_LABEL[product.unit] : ""}
					/>
				</div>
				<div>
					<div className="m-lbl" style={{ marginBottom: 6 }}>
						Tan narx (ixtiyoriy)
					</div>
					<InputNumber
						style={{ width: "100%" }}
						value={cost}
						onChange={setCost}
						min={1}
						addonAfter="so'm"
						formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
					/>
				</div>
				<div>
					<div className="m-lbl" style={{ marginBottom: 6 }}>
						Sabab
					</div>
					<Input
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="Yangi partiya"
					/>
				</div>
			</div>
		</Modal>
	);
}
