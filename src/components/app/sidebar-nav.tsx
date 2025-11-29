
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart2,
  LayoutDashboard,
  MessagesSquare,
  PlusCircle,
  Settings,
  PanelLeft,
  Bot,
  LogOut,
  Calendar,
  Sparkles,
  Target,
  User,
  FileText,
  Mail,
  Send,
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUser } from "@/firebase/auth/use-user";
import { useLanguage } from "@/app/(app)/layout";
import { useFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const translations = {
  en: {
    dashboard: "Dashboard",
    inbox: "Inbox",
    all: "All",
    email: "Email",
    telegram: "Telegram",
    autoReply: "Auto-Replies",
    addPost: "Add Post",
    settings: "Settings",
    events: "Events",
    aiAssistant: "AI Assistant",
    tracker: "Tracker",
    myLevel: "My Level",
    reports: "Reports",
    helpAndFeedback: "Help & Feedback",
    logout: "Log Out",
    logoutSuccess: "Logged out successfully",
    logoutError: "Logout failed",
  },
  ar: {
    dashboard: "Dashboard",
    inbox: "Inbox",
    all: "الكل",
    email: "البريد الإلكتروني",
    telegram: "تليجرام",
    autoReply: "الردود التلقائية",
    addPost: "Add Post",
    settings: "Settings",
    events: "Events",
    aiAssistant: "AI Assistant",
    tracker: "Tracker",
    myLevel: "مستواي",
    reports: "التقارير",
    helpAndFeedback: "المساعدة والملاحظات",
    logout: "تسجيل الخروج",
    logoutSuccess: "تم تسجيل الخروج بنجاح",
    logoutError: "فشل تسجيل الخروج",
  },
};

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const { user: authUser } = useUser();
  const { lang } = useLanguage();
  const t = translations[lang];
  
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: t.logoutSuccess });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ variant: 'destructive', title: t.logoutError });
    }
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
    { 
      href: "/inbox", 
      icon: MessagesSquare, 
      label: t.inbox,
      subItems: [
        { href: "/inbox/all", icon: Mail, label: t.all },
        { href: "/inbox/email", icon: Mail, label: t.email },
        { href: "/inbox/telegram", icon: Send, label: t.telegram },
      ]
    },
    { 
      href: "/auto-reply", 
      icon: Bot, 
      label: t.autoReply,
      subItems: [
        { href: "/auto-reply/all", icon: Mail, label: t.all },
        { href: "/auto-reply/telegram", icon: Send, label: t.telegram },
      ]
    },
    { href: "/create", icon: PlusCircle, label: t.addPost },
    { href: "/settings", icon: Settings, label: t.settings },
    { href: "/events", icon: Calendar, label: t.events },
    { href: "/ai-assistant", icon: Sparkles, label: t.aiAssistant },
    { href: "/tracker", icon: Target, label: t.tracker },
    { href: "/my-level", icon: User, label: t.myLevel },
    { href: "/reports", icon: BarChart2, label: t.reports },
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
      <SidebarFooter className="p-4 flex flex-col gap-2">
        <Button variant="outline" className="w-full">
          {t.helpAndFeedback}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          {t.logout}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
