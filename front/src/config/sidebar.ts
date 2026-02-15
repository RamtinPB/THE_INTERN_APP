import {
	LayoutDashboard,
	CreditCard,
	Settings,
	Wallet,
	PlusCircle,
	ShoppingCart,
} from "lucide-react";

interface NavItem {
	key: string;
	name: string;
	href: string;
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
		icon: LayoutDashboard,
		subNavItems: [],
		href: "/",
	},
	{
		key: "business",
		name: "خرید از فروشگاه",
		icon: ShoppingCart,
		subNavItems: [],
		href: "/business",
	},
	{
		key: "wallet",
		name: "کیف پول",
		icon: CreditCard,
		subNavItems: [
			{
				key: "wallets",
				name: "مدیریت کیف پول‌ها",
				icon: Wallet,
				href: "/wallets",
			},
		],
		href: "",
	},
];
