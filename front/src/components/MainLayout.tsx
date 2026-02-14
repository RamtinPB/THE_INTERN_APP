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
import { navItems } from "@/config/sidebar";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface MainLayoutProps {
	children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
	const router = useRouter();
	const currentPath = router.pathname;

	return (
		<SidebarProvider defaultOpen={true} dir="rtl">
			<Sidebar>
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

				<SidebarFooter>{/* User profile / logout */}</SidebarFooter>
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
