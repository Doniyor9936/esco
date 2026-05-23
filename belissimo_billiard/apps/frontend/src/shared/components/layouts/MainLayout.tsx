import {
	FileSearchOutlined,
	LogoutOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	ProductOutlined,
	SafetyOutlined,
	ScheduleOutlined,
	SettingOutlined,
	UserOutlined,
} from "@ant-design/icons";
import type { UserRoleType } from "@shared/types";
import { Avatar, Button, Dropdown, Layout, Menu, Typography } from "antd";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "@/modules/auth/hooks/useAuth";
import { useAuthStore } from "@/modules/auth/store/auth.store";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const ALL_MENU_ITEMS: {
	key: string;
	icon: React.ReactNode;
	label: string;
	roles: UserRoleType[];
}[] = [
	{ key: "/dashboard", icon: <ScheduleOutlined />, label: "Stollar", roles: ["admin", "kassir"] },
	{ key: "/shifts", icon: <SafetyOutlined />, label: "Navbatchilik", roles: ["admin", "kassir"] },
	{ key: "/products", icon: <ProductOutlined />, label: "Mahsulotlar", roles: ["admin"] },
	{ key: "/users", icon: <UserOutlined />, label: "Foydalanuvchilar", roles: ["admin"] },
	{
		key: "/reports",
		icon: <FileSearchOutlined />,
		label: "Hisobotlar",
		roles: ["admin", "kassir"],
	},
	{ key: "/settings", icon: <SettingOutlined />, label: "Sozlamalar", roles: ["admin"] },
];

export function MainLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const user = useAuthStore((state) => state.user);
	const { mutate: logout } = useLogout();

	const menuItems = ALL_MENU_ITEMS.filter((item) =>
		user?.role ? item.roles.includes(user.role as UserRoleType) : false
	);

	const userMenuItems = [
		{ key: "logout", icon: <LogoutOutlined />, label: "Chiqish", danger: true },
	];

	const handleUserMenuClick = ({ key }: { key: string }) => {
		if (key === "logout") {
			logout();
		}
		if (key === "profile") {
			navigate("/profile");
		}
	};

	const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.currentTarget.style.background = "var(--ivory-200)";
	};

	const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.currentTarget.style.background = "var(--ivory-100)";
	};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sider
				trigger={null}
				collapsible
				collapsed={collapsed}
				style={{
					background: "linear-gradient(180deg, var(--felt-800) 0%, var(--felt-900) 100%)",
					boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04)",
					borderRight: "1px solid rgba(0,0,0,0.2)",
				}}
			>
				<div
					style={{
						height: 64,
						display: "flex",
						alignItems: "center",
						justifyContent: collapsed ? "center" : "flex-start",
						padding: collapsed ? 0 : "0 20px",
						gap: 12,
						borderBottom: "1px solid rgba(255,255,255,0.07)",
					}}
				>
					<div
						style={{
							width: 36,
							height: 36,
							borderRadius: "50%",
							background: "var(--felt-700)",
							border: "2px solid var(--gold-500)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontWeight: 700,
							fontSize: 15,
							color: "var(--gold-300)",
						}}
					>
						B
					</div>

					{!collapsed && (
						<div>
							<div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Bellissimo</div>
							<div style={{ fontSize: 10, color: "var(--gold-400)" }}>Billiard Club</div>
						</div>
					)}
				</div>

				{/* MENU */}
				<Menu
					mode="inline"
					selectedKeys={[location.pathname]}
					items={menuItems}
					onClick={({ key }) => navigate(key)}
					theme="dark"
					style={{ background: "transparent", border: "none", marginTop: 8 }}
				/>

				{!collapsed && user?.role && (
					<div
						style={{
							position: "absolute",
							bottom: 16,
							left: 12,
							right: 12,
							padding: "6px 10px",
							borderRadius: 6,
							background: "rgba(255,255,255,0.06)",
							fontSize: 11,
							textAlign: "center",
						}}
					>
						{user.role}
					</div>
				)}
			</Sider>

			<Layout style={{ height: "100vh" }}>
				<Header
					style={{
						background: "var(--paper)",
						padding: "0 20px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						borderBottom: "1px solid var(--ivory-300)",
						height: 56,
						flexShrink: 0,
					}}
				>
					<Button
						type="text"
						icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						onClick={() => setCollapsed(!collapsed)}
					/>

					<Dropdown
						menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
						trigger={["click"]}
					>
						<button
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 8,
								padding: "4px 10px",
								borderRadius: 6,
								border: "none",
								cursor: "pointer",
							}}
						>
							<Avatar icon={<UserOutlined />} size={28} />
							<Text>{user?.phone}</Text>
						</button>
					</Dropdown>
				</Header>

				<Content
					style={{
						padding: 24,
						background: "var(--ivory-100)",
						flex: 1,
						overflowY: "auto",
					}}
				>
					<Outlet />
				</Content>
			</Layout>
		</Layout>
	);
}
