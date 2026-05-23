import { Navigate, type RouteObject } from "react-router-dom";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import CheckPage from "@/modules/checks/pages/CheckPage";
import TablesPage from "@/modules/dashboard/pages/TablesPage";
import { MenuPage } from "@/modules/menu";
import { ProductsPage } from "@/modules/products";
import { ReportsPage } from "@/modules/reports/pages/ReportsPage";
import {
	NewSessionPage,
	SessionByTablePage,
	SessionPage,
} from "@/modules/sessions/pages/SessionsPage";
import { SettingsPage } from "@/modules/settings";
import { ShiftPage } from "@/modules/shifts";
import { UsersPage } from "@/modules/users";
import { AuthLayout } from "@/shared/components/layouts/AuthLayout";
import { MainLayout } from "@/shared/components/layouts/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./Roleroute";

const ADMIN_ONLY = ["admin"];
const ALL_ROLES = ["admin", "kassir"];

export const routes: RouteObject[] = [
	// ── Public ──────────────────────────────────────────────────
	{
		path: "/login",
		element: <AuthLayout />,
		children: [{ index: true, element: <LoginPage /> }],
	},

	// ── Protected ────────────────────────────────────────────────
	{
		path: "/",
		element: (
			<ProtectedRoute>
				<MainLayout />
			</ProtectedRoute>
		),
		children: [
			{
				index: true,
				element: <Navigate to="/dashboard" replace />,
			},

			// ── Barcha rollar (admin + cashier) ────────────────────
			{
				path: "dashboard",
				element: (
					<RoleRoute roles={ALL_ROLES}>
						<TablesPage />
					</RoleRoute>
				),
			},
			{
				path: "sessions/new",
				element: (
					<RoleRoute roles={ALL_ROLES}>
						<NewSessionPage />
					</RoleRoute>
				),
			},
			{
				path: "sessions/by-table/:tableId",
				element: (
					<RoleRoute roles={ALL_ROLES}>
						<SessionByTablePage />
					</RoleRoute>
				),
			},
			{
				path: "sessions/:sessionId",
				element: (
					<RoleRoute roles={ALL_ROLES}>
						<SessionPage />
					</RoleRoute>
				),
			},
			{
				path: "sessions/:sessionId/menu",
				element: (
					<RoleRoute roles={ALL_ROLES}>
						<MenuPage />
					</RoleRoute>
				),
			},
			{
				path: "checks/:id",
				element: (
					<RoleRoute roles={ALL_ROLES}>
						<CheckPage />
					</RoleRoute>
				),
			},
			{
				path: "shifts",
				element: (
					<RoleRoute roles={ALL_ROLES}>
						<ShiftPage />
					</RoleRoute>
				),
			},

			// ── Faqat admin ────────────────────────────────────────
			{
				path: "products",
				element: (
					<RoleRoute roles={ADMIN_ONLY}>
						<ProductsPage />
					</RoleRoute>
				),
			},
			{
				path: "users",
				element: (
					<RoleRoute roles={ADMIN_ONLY}>
						<UsersPage />
					</RoleRoute>
				),
			},
			{
				path: "settings",
				element: (
					<RoleRoute roles={ADMIN_ONLY}>
						<SettingsPage />
					</RoleRoute>
				),
			},
			{
				path: "reports",
				element: (
					<RoleRoute roles={ALL_ROLES}>
						<ReportsPage />
					</RoleRoute>
				),
			},
		],
	},

	// ── 404 ─────────────────────────────────────────────────────
	{
		path: "*",
		element: <Navigate to="/" replace />,
	},
];
