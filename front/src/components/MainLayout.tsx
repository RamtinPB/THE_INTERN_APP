"use client";

import { ReactNode, useState } from "react";
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
	SidebarGroup,
	SidebarGroupContent,
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

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	// Check if a nav item should be open based on current path
	const isPathActive = (href: string) => {
		if (!href) return false;
		return currentPath.includes(href);
	};

	return (
		<SidebarProvider defaultOpen={true} dir="rtl">
			<Sidebar side="right" className="">
				<SidebarHeader className="p-4">
					<h2 className="text-lg font-bold">پنل مدیریت</h2>
				</SidebarHeader>

				<SidebarContent className="overflow-y-auto [&::-webkit-scrollbar]:w-2">
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu className="flex flex-col gap-2">
								{navItems.map((item) => (
									<Collapsible
										key={item.key}
										className={`group/collapsible ${item.disable ? "hidden" : ""}`}
										defaultOpen={isPathActive(item.href) ? true : false}
									>
										<SidebarMenuItem>
											<CollapsibleTrigger
												className="w-full hover:bg-sidebar-accent rounded-md gap-2 flex items-center justify-between"
												asChild
											>
												<SidebarMenuButton
													className={`${
														isPathActive(`/${item.key}`)
															? "bg-sidebar-accent!"
															: ""
													}`}
													asChild
													isActive={isPathActive(`/${item.key}`)}
												>
													<Link
														className={`w-full flex justify-start items-center ${
															item.disable ? "hidden" : ""
														}`}
														href={item.href || "#"}
													>
														{item.icon && <item.icon className="w-4 h-4" />}
														<p className="">{item.name}</p>
														{item.subNavItems.length > 0 && (
															<ChevronLeft className="h-4 w-4 mr-auto transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90" />
														)}
													</Link>
												</SidebarMenuButton>
											</CollapsibleTrigger>

											{item.subNavItems.length > 0 && (
												<CollapsibleContent className="gap-2">
													<SidebarMenuSub>
														{item.subNavItems.map((subItem) => (
															<SidebarMenuSubItem key={subItem.key}>
																<SidebarMenuSubButton
																	isActive={isPathActive(subItem.href)}
																	asChild
																>
																	<Link
																		className={`flex justify-start items-center gap-2 ${
																			subItem.disable ? "hidden" : ""
																		}`}
																		href={subItem.disable ? "#" : subItem.href}
																	>
																		{subItem.icon && (
																			<subItem.icon className="w-4 h-4" />
																		)}
																		<p className="text-sm">{subItem.name}</p>
																	</Link>
																</SidebarMenuSubButton>
															</SidebarMenuSubItem>
														))}
													</SidebarMenuSub>
												</CollapsibleContent>
											)}
										</SidebarMenuItem>
									</Collapsible>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
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
