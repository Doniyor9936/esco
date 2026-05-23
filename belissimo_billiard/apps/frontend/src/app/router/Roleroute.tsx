import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/modules/auth/store/auth.store";

interface RoleRouteProps {
	children: React.ReactNode;
	roles: string[];
}

export function RoleRoute({ children, roles }: RoleRouteProps) {
	const user = useAuthStore((s) => s.user);

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (!roles.includes(user.role)) {
		return <Navigate to="/dashboard" replace />;
	}

	return <>{children}</>;
}
