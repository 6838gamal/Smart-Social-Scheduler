
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Languages,
  LifeBuoy,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useI18n } from '@/contexts/i18n-provider';

const getTitleFromPathname = (pathname: string, dictionary: any) => {
  const pathMap: Record<string, string> = {
    '/dashboard': dictionary.sidebar.dashboard,
    '/schedule': dictionary.sidebar.schedule,
    '/reports': dictionary.sidebar.reports,
    '/inbox/whatsapp': dictionary.sidebar.whatsapp,
    '/inbox/telegram': dictionary.sidebar.telegram,
    '/inbox/email': dictionary.sidebar.email,
    '/apps/google-sheets': dictionary.sidebar.googleSheets,
    '/agent': dictionary.sidebar.agent,
  };

  for (const path in pathMap) {
    if (pathname.startsWith(path)) {
      return pathMap[path];
    }
  }

  const segment = pathname.split('/').pop();
  if (!segment) return dictionary.sidebar.dashboard;
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
  const { auth } = useAuth();
  const { user } = useUser();
  const { locale, setLocale, dictionary } = useI18n();

  const title = getTitleFromPathname(pathname, dictionary);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-headline text-xl font-semibold md:text-2xl">
          {title}
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleLanguage}
          aria-label={dictionary.appHeader.toggleDirection}
        >
          <Languages className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
            <div className="hidden flex-col items-end text-right md:flex">
              <p className="text-sm font-medium leading-none">{user?.displayName || dictionary.appHeader.schedulerUser}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email || dictionary.appHeader.userEmail}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    {user?.photoURL ? (
                      <AvatarImage
                        src={user.photoURL}
                        alt={user.displayName || 'User Avatar'}
                        width={40}
                        height={40}
                      />
                    ) : userAvatar ? (
                      <AvatarImage
                        src={userAvatar.imageUrl}
                        alt={userAvatar.description}
                        width={40}
                        height={40}
                        data-ai-hint={userAvatar.imageHint}
                      />
                    ): null }
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="md:hidden">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || dictionary.appHeader.schedulerUser}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || dictionary.appHeader.userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="md:hidden"/>
                <DropdownMenuItem>
                  <User className="mr-2" />
                  <span>{dictionary.appHeader.profile}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2" />
                  <span>{dictionary.appHeader.settings}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LifeBuoy className="mr-2" />
                  <span>{dictionary.appHeader.support}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2" />
                  <span>{dictionary.appHeader.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
