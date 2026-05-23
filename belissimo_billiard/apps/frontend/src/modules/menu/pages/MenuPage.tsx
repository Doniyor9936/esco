import { useNavigate, useParams } from "react-router-dom";
import { MenuView } from "../components/MenuView";

export function MenuPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();

	if (!sessionId) {
		return <div>Session topilmadi</div>;
	}

	return <MenuView sessionId={sessionId} onBack={() => navigate(`/sessions/${sessionId}`)} />;
}
