"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { navItems } from "@/config/sidebar";

import {
	ChevronLeft,
	User,
	Settings,
	LogOut,
	ChevronsUpDown,
} from "lucide-react";
import { useAuthUser, useLogout } from "@/hooks/useAuth";

interface MainLayoutProps {
	children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
	const router = useRouter();
	const currentPath = router.pathname;
	const user = useAuthUser();
	const logout = useLogout();

	// Get initials for avatar fallback
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	return (
		<SidebarProvider defaultOpen={true} dir="rtl">
			<Sidebar side="right">
				<SidebarHeader className="p-4">
					<h2 className="text-lg font-bold">پنل مدیریت</h2>
				</SidebarHeader>

				<SidebarContent>
					<SidebarMenu>
						{navItems.map((item) => (
							<SidebarMenuItem key={item.key}>
								<SidebarMenuButton
									asChild={item.subNavItems.length === 0}
									isActive={currentPath === `/${item.key}`}
									disabled={item.disable}
								>
									{/* Parent item */}
									{item.subNavItems.length === 0 ? (
										<Link href={`/${item.key}`}>
											{item.icon && <item.icon className="w-4 h-4" />}
											<span>{item.name}</span>
										</Link>
									) : (
										// Has sub-items - use Collapsible
										<Collapsible defaultOpen={false}>
											<CollapsibleTrigger className="flex w-full items-center justify-between">
												<span className="flex items-center gap-2">
													{item.icon && <item.icon className="w-4 h-4" />}
													<span>{item.name}</span>
												</span>
												<ChevronLeft className="h-4 w-4 transition-transform Collapsible-trigger" />
											</CollapsibleTrigger>

											<CollapsibleContent>
												<SidebarMenuSub>
													{item.subNavItems.map((subItem) => (
														<SidebarMenuSubItem key={subItem.key}>
															<SidebarMenuSubButton
																asChild
																isActive={currentPath === subItem.href}
															>
																<Link href={subItem.href}>
																	{subItem.icon && (
																		<subItem.icon className="w-4 h-4" />
																	)}
																	<span>{subItem.name}</span>
																</Link>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													))}
												</SidebarMenuSub>
											</CollapsibleContent>
										</Collapsible>
									)}
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarContent>

				<SidebarFooter>
					{/* User profile dropdown */}
					<DropdownMenu dir="rtl">
						<DropdownMenuTrigger asChild>
							<button className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors">
								<Avatar className="h-8 w-8">
									<AvatarFallback className="bg-primary text-primary-foreground text-xs">
										{user?.phoneNumber ? user.phoneNumber.slice(-2) : "?"}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col items-start text-sm">
									<span className="font-medium">
										{user?.phoneNumber || "کاربر"}
									</span>
									<span className="text-xs text-muted-foreground">
										{user?.role === "BUSINESS" ? "کسب و کار" : "شخصی"}
									</span>
								</div>
								<ChevronsUpDown className="mr-auto h-4 w-4 text-muted-foreground" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<User className="ml-2 h-4 w-4" />
								<span>پروفایل</span>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings className="ml-2 h-4 w-4" />
								<span>تنظیمات</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleLogout}
								className="text-red-600 focus:text-red-600 focus:bg-red-50"
							>
								<LogOut className="ml-2 h-4 w-4" />
								<span>خروج</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger />
				</header>
				<div className="p-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
