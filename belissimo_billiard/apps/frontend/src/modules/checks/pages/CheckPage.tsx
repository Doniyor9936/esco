import { App, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { CheckView } from "../components/CheckView";
import { useCheck, usePayCheck } from "../hooks/useChecks";
import type { PaymentMethod } from "../types";

export default function CheckPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { message } = App.useApp();

	const { data: check, isLoading, isError } = useCheck(id ?? "");
	const payMutation = usePayCheck();

	if (isLoading) {
		return <Spin style={{ display: "flex", justifyContent: "center", marginTop: 100 }} />;
	}

	if (isError || !check) {
		return <div>Chek topilmadi</div>;
	}

	const handlePay = (method: PaymentMethod, receivedAmount: number) => {
		if (!id) {
			return;
		}

		payMutation.mutate(
			{
				id,
				data: {
					paymentMethod: method,
					receivedAmount,
				},
			},
			{
				onSuccess: () => {
					message.success("To'lov amalga oshirildi");
					navigate(-1);
				},
			}
		);
	};

	return (
		<CheckView
			check={check}
			onPay={handlePay}
			onCancel={() => navigate(-1)}
			loading={payMutation.isPending}
		/>
	);
}
