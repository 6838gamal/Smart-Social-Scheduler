'use client';

import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUser, useI18n } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { AppBottomNav } from '@/components/app-bottom-nav';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { dictionary } = useI18n();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const showFab = pathname !== '/agent';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 pb-20 md:p-6">{children}</main>
      </SidebarInset>
      <AppBottomNav />
      {showFab && (
        <Button
          asChild
          className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg md:bottom-6 md:right-6 rtl:right-auto rtl:left-4 md:rtl:left-6"
          size="icon"
          aria-label={dictionary.sidebar.agent}
        >
          <Link href="/agent">
            <Bot className="h-7 w-7" />
          </Link>
        </Button>
      )}
    </SidebarProvider>
  );
}
