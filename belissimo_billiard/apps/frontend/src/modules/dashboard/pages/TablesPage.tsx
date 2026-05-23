import { useNavigate } from "react-router-dom";
import { DashboardView } from "../components/DashboardView";

export default function TablesPage() {
	const navigate = useNavigate();

	const handleGo = (route: string, state?: unknown) => {
		navigate(`/${route}`, { state });
	};

	return <DashboardView go={handleGo} />;
}
