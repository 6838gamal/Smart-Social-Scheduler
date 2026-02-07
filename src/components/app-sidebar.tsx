
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppWindow,
  AreaChart,
  CalendarPlus,
  ChevronRight,
  FileSpreadsheet,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Phone,
  Settings,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Logo, Telegram, WhatsApp, Mail as ContactMailIcon } from '@/components/icons';
import { useI18n } from '@/contexts/i18n-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AppSidebar() {
  const pathname = usePathname();
  const { dictionary } = useI18n();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: dictionary.sidebar.dashboard },
    { href: '/schedule', icon: CalendarPlus, label: dictionary.sidebar.schedule },
    { href: '/reports', icon: AreaChart, label: dictionary.sidebar.reports },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <span className="font-headline text-lg font-semibold">{dictionary.sidebar.smartSocial}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <Collapsible asChild>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={dictionary.sidebar.inbox}
                  className="group/trigger"
                >
                  <Inbox />
                  <span>{dictionary.sidebar.inbox}</span>
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/trigger:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname.startsWith('/inbox/whatsapp')}>
                      <Link href="/inbox/whatsapp">
                        <MessageSquare />
                        <span>{dictionary.sidebar.whatsapp}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname.startsWith('/inbox/telegram')}>
                      <Link href="/inbox/telegram">
                        <MessageSquare />
                        <span>{dictionary.sidebar.telegram}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                   <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname.startsWith('/inbox/email')}>
                      <Link href="/inbox/email">
                        <Mail />
                        <span>{dictionary.sidebar.email}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          <Collapsible asChild>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={dictionary.sidebar.myApps}
                  className="group/trigger"
                >
                  <AppWindow />
                  <span>{dictionary.sidebar.myApps}</span>
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/trigger:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname.startsWith('/apps/google-sheets')}>
                      <Link href="/apps/google-sheets">
                        <FileSpreadsheet />
                        <span>{dictionary.sidebar.googleSheets}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={dictionary.sidebar.settings}>
              <Settings />
              <span>{dictionary.sidebar.settings}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip={dictionary.sidebar.contactDeveloper}>
                  <Phone />
                  <span>{dictionary.sidebar.contactDeveloper}</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{dictionary.contactDialog.title}</DialogTitle>
                  <DialogDescription>
                    {dictionary.contactDialog.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4">
                    <WhatsApp className="h-6 w-6 text-green-500" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{dictionary.contactDialog.whatsapp}</span>
                      <a href="https://wa.me/967774440982" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        +967 774 440 982
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Telegram className="h-6 w-6 text-sky-500" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{dictionary.contactDialog.telegram}</span>
                      <a href="https://t.me/GamalsSolutions" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        @GamalsSolutions
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ContactMailIcon className="h-6 w-6 text-gray-500" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{dictionary.contactDialog.email}</span>
                      <a href="mailto:applicationsdeveloper6838@gmail.com" className="text-sm text-primary hover:underline">
                        applicationsdeveloper6838@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
