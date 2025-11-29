
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  LayoutDashboard,
  Library,
  MessagesSquare,
  PlusCircle,
  Settings,
  Mail,
  Send,
  PanelLeft,
  Users,
  Bot,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUser } from "@/firebase/auth/use-user";

// You can control the language by changing this variable
const lang = "ar"; // "en" or "ar"

const translations = {
  en: {
    dashboard: "Dashboard",
    createPost: "Create Post",
    inbox: "Inbox",
    all: "All",
    email: "Email",
    telegram: "Telegram",
    library: "Content Library",
    analytics: "Analytics",
    autoReply: "Auto-Reply",
    accounts: "Accounts",
    settings: "Settings",
    helpAndFeedback: "Help & Feedback",
  },
  ar: {
    dashboard: "لوحة التحكم",
    createPost: "إنشاء منشور",
    inbox: "البريد الوارد",
    all: "الكل",
    email: "البريد الإلكتروني",
    telegram: "تليجرام",
    library: "مكتبة المحتوى",
    analytics: "التحليلات",
    autoReply: "الرد التلقائي",
    accounts: "الحسابات",
    settings: "الإعدادات",
    helpAndFeedback: "المساعدة والملاحظات",
  },
};

const t = translations[lang];

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user: authUser } = useUser();
  
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
    { href: "/create", icon: PlusCircle, label: t.createPost },
    {
      label: t.inbox,
      icon: MessagesSquare,
      href: "/inbox",
      subItems: [
        { href: "/inbox/all", icon: Mail, label: t.all },
        { href: "/inbox/email", icon: Mail, label: t.email },
        { href: "/inbox/telegram", icon: Send, label: t.telegram },
      ],
    },
    { href: "/library", icon: Library, label: t.library },
    { href: "/analytics", icon: BarChart2, label: t.analytics },
    { href: "/auto-reply", icon: Bot, label: t.autoReply },
    {
      label: t.accounts,
      icon: Users,
      subItems: [
        { href: "#", icon: Mail, label: t.email },
        { href: "#", icon: Send, label: t.telegram },
      ],
    },
    { href: "/settings", icon: Settings, label: t.settings },
  ];


  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex items-center justify-between">
        {authUser && (
             <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={authUser.photoURL || undefined} alt={authUser.displayName || ""} />
                    <AvatarFallback>{authUser.displayName?.charAt(0) || authUser.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{authUser.displayName || authUser.email}</span>
            </div>
        )}
        <SidebarTrigger>
            <PanelLeft />
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItems.map((item, index) => (
             <SidebarMenuItem key={index}>
                {item.subItems ? (
                  <>
                    <SidebarMenuButton asChild={!!item.href} isActive={pathname.startsWith(item.href || '---')} tooltip={item.label}>
                      {item.href ? (
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <div>
                          <item.icon />
                          <span>{item.label}</span>
                        </div>
                      )}
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      {item.subItems.map((subItem, subIndex) => (
                        <SidebarMenuItem key={subIndex}>
                          <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                            <Link href={subItem.href}>
                              <subItem.icon />
                              <span>{subItem.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenuSub>
                  </>
                ) : (
                  <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                  >
                      <Link href={item.href!}>
                          <item.icon />
                          <span>{item.label}</span>
                      </Link>
                  </SidebarMenuButton>
                )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="outline" className="w-full">
          {t.helpAndFeedback}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
