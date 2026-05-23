import { App, Spin } from "antd";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateCheck } from "@/modules/checks/hooks/useChecks";
import { NewSessionForm } from "../components/Newsessionform";
import { SessionView } from "../components/SessionView";
import { useActiveSessionByTable, useCloseSession } from "../hooks/useSessions";
import type { Session } from "../types/sessions.types";

// ─── /sessions/:sessionId ─────────────────────────────────────
export function SessionPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const { message } = App.useApp();
	const { mutateAsync: createCheck, isPending: creatingCheck } = useCreateCheck();
	const { mutateAsync: closeSession } = useCloseSession();

	const handleCheckout = async (session: Session) => {
		try {
			const check = await createCheck({
				sessionId: session.id,
			});

			navigate(`/checks/${check.id}`);

			if (session.status === "active" || session.status === "paused") {
				closeSession(session.id);
			}
		} catch (_err) {
			message.error("Checkout error");
		}
	};

	return (
		<SessionView
			sessionId={sessionId ?? ""}
			onBack={() => navigate("/dashboard")}
			onCheckout={handleCheckout}
			onAddMenu={() => navigate(`/sessions/${sessionId}/menu`)}
			checkoutPending={creatingCheck}
		/>
	);
}

// ─── /sessions/new ───────────────────────────────────────────
export function NewSessionPage() {
	return <NewSessionForm />;
}

// ─── /sessions/by-table/:tableId ─────────────────────────────
export function SessionByTablePage() {
	const { tableId } = useParams<{ tableId: string }>();
	const navigate = useNavigate();
	const { data: session, isLoading } = useActiveSessionByTable(tableId ?? "");

	useEffect(() => {
		if (isLoading) {
			return;
		}
		if (session) {
			navigate(`/sessions/${session.id}`, { replace: true });
		} else {
			navigate("/sessions/new", { replace: true, state: { tableId } });
		}
	}, [isLoading, session, navigate, tableId]);

	return (
		<div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
			<Spin size="large" />
		</div>
	);
}
