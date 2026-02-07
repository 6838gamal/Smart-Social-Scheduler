
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarPlus, Inbox, AreaChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-provider';

export function AppBottomNav() {
  const pathname = usePathname();
  const { dictionary } = useI18n();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: dictionary.sidebar.dashboard },
    { href: '/schedule', icon: CalendarPlus, label: dictionary.sidebar.schedule },
    { href: '/reports', icon: AreaChart, label: dictionary.sidebar.reports },
    { href: '/inbox/email', icon: Inbox, label: dictionary.sidebar.inbox },
  ];


  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
      <div className="grid h-full grid-cols-4 mx-auto">
        {navItems.map((item) => {
          const isActive = item.href.startsWith('/inbox')
            ? pathname.startsWith('/inbox')
            : pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-2 text-center text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
