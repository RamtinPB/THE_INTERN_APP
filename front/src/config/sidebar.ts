import {
	User,
	LayoutDashboard,
	Building2,
	CreditCard,
	FileText,
	Settings,
} from "lucide-react";

interface NavItem {
	key: string;
	name: string;
	icon: React.ComponentType | any;
	disable?: boolean;
	subNavItems: SubNavItem[];
}

interface SubNavItem {
	key: string;
	name: string;
	icon: React.ComponentType | any;
	href: string;
	disable?: boolean;
	children?: SubNavItem[];
}

export const navItems: NavItem[] = [
	{
		key: "dashboard",
		name: "داشبورد",
		icon: User,
		subNavItems: [],
	},
	{
		key: "wallet",
		name: "کیف پول",
		icon: Building2,
		subNavItems: [
			{
				key: "wallet-manager",
				name: "مدیریت کیف پول ها",
				href: "",
				icon: undefined,
			},
		],
	},
];
