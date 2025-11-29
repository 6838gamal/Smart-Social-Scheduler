
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Bell, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. Create Language Context
type Language = "ar" | "en";
type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
};
const LanguageContext = createContext<LanguageContextType | null>(null);

// 2. Create a custom hook for easy access
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

const headerTranslations = {
    en: {
        refreshData: "Refresh Data",
        newPost: "New Post",
        language: "Language",
    },
    ar: {
        refreshData: "تحديث البيانات",
        newPost: "منشور جديد",
        language: "اللغة",
    }
}


function Header() {
    const { lang, setLang } = useLanguage();
    const t = headerTranslations[lang];

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
             <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Select value={lang} onValueChange={(value: Language) => setLang(value)}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder={t.language} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t.refreshData}
                </Button>
                <Button asChild size="sm" className="glow-lavender">
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.newPost}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">3</span>
                    <span className="sr-only">Notifications</span>
                </Button>
            </div>
        </header>
    )
}

function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>('ar');
    
    useEffect(() => {
        const root = window.document.documentElement;
        root.lang = lang;
        root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, idToken, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <p>Loading...</p>
            </div>
        </div>
    );
  }
  
  return (
    <LanguageProvider>
        <SidebarProvider>
          <SidebarNav />
          <SidebarInset>
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
    </LanguageProvider>
  );
}
