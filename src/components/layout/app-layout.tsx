"use client";

import type { ReactNode } from "react";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { CampusPulseLogo } from "@/components/icons/logo";
import { UserNav } from "@/components/layout/user-nav";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2 } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { useAuth } from "@/context/auth-context";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const { role, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    // Ensure this runs only on the client
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    // If auth state has loaded and there's no role, redirect to login.
    if (!isAuthLoading && !role) {
      router.push("/login");
    }
  }, [isAuthLoading, role, router]);

  const navItemsToRender = useMemo(() => {
    if (isAuthLoading) {
      // Show skeletons for all defined NAV_ITEMS while auth state is loading
      return NAV_ITEMS.map((item) => ({
        ...item,
        isSkeleton: true,
      }));
    }

    return NAV_ITEMS.filter((item) => {
      if (item.roles) {
        // If roles are specified for the item
        return role && item.roles.includes(role); // User's role must be in the item's roles array
      }
      return true; // If no roles specified, item is visible to all authenticated users
    }).map((item) => ({
      ...item,
      // Use the disabled flag directly from NAV_ITEMS.
      // If an item is filtered out by role, it won't be mapped.
      // If it's included, its `disabled` status is respected.
      disabled: item.disabled,
    }));
  }, [role, isAuthLoading]);

  const renderNavItems = (
    items: (NavItem & { isSkeleton?: boolean })[],
    isSubmenu = false
  ) => {
    return items.map((item, index) => {
      if (item.isSkeleton) {
        return (
          <SidebarMenuItem key={`skeleton-${item.title}-${index}`}>
            <SidebarMenuSkeleton showIcon={true} />
          </SidebarMenuItem>
        );
      }

      const isActive =
        pathname === item.href ||
        (item.href !== "/" &&
          pathname.startsWith(item.href) &&
          item.href !== "/dashboard");
      const isDashboardActive =
        item.href === "/dashboard" && pathname === "/dashboard";
      const itemIsActive =
        item.href === "/dashboard" ? isDashboardActive : isActive;

      if (item.items && item.items.length > 0) {
        const isParentOfActiveSubItem = item.items.some(
          (subItem) => pathname === subItem.href
        );
        return (
          <Accordion.Root
            key={item.title}
            type="single"
            collapsible
            className="w-full"
            defaultValue={isParentOfActiveSubItem ? item.title : undefined}
          >
            <Accordion.Item value={item.title} className="border-none">
              <Accordion.Trigger asChild>
                <SidebarMenuButton
                  className={cn(
                    "justify-between w-full",
                    (itemIsActive || isParentOfActiveSubItem) && !item.disabled
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : ""
                  )}
                  disabled={item.disabled}
                  isActive={itemIsActive && !item.items}
                  aria-expanded={pathname.startsWith(item.href)}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </SidebarMenuButton>
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <SidebarMenuSub className="ml-4 pl-2 border-l border-sidebar-border/50 py-1">
                  {item.items.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <Link href={subItem.href} legacyBehavior passHref>
                          <SidebarMenuSubButton
                            asChild={false}
                            isActive={isSubActive}
                            disabled={subItem.disabled}
                            className={cn(
                              isSubActive && !subItem.disabled
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                : "hover:bg-sidebar-accent/80"
                            )}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </Link>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        );
      }

      return (
        <SidebarMenuItem key={item.title}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              asChild={false}
              isActive={itemIsActive}
              disabled={item.disabled}
              tooltip={item.title}
              className={cn(
                itemIsActive && !item.disabled
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : ""
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
              {item.label && (
                <span className="ml-auto text-xs bg-sidebar-accent text-sidebar-accent-foreground px-1.5 py-0.5 rounded-sm">
                  {item.label}
                </span>
              )}
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      );
    });
  };

  if (isAuthLoading || !role) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border shadow-lg"
      >
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <CampusPulseLogo className="h-8 w-auto" />
          </Link>
        </SidebarHeader>
        <ScrollArea className="h-[calc(100vh-var(--sidebar-header-height)-var(--sidebar-footer-height)-2px)]">
          <SidebarContent className="p-2">
            <SidebarMenu>{renderNavItems(navItemsToRender)}</SidebarMenu>
          </SidebarContent>
        </ScrollArea>
        <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
          {currentYear !== null && (
            <p className="text-xs text-sidebar-foreground/70 text-center">
              &copy; {currentYear} CampusPulse
            </p>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center">
            <SidebarTrigger className="mr-2 md:hidden" />
            <h1 className="text-xl font-semibold text-foreground">
              {NAV_ITEMS.find(
                (item) =>
                  item.href === pathname ||
                  (pathname.startsWith(item.href) && item.href !== "/")
              )?.title ||
                NAV_ITEMS.find((item) => item.href === "/dashboard")?.title ||
                "CampusPulse"}
            </h1>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
