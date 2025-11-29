
"use client";

import { PageHeader } from '@/components/app/page-header';
import { user } from '@/lib/data';
import PerformanceSnapshot from '@/components/app/dashboard/performance-snapshot';
import UpcomingPosts from '@/components/app/dashboard/upcoming-posts';
import RecentInteractions from '@/components/app/dashboard/recent-interactions';
import AiInsights from '@/components/app/dashboard/ai-insights';
import SystemHealth from '@/components/app/dashboard/system-health';
import { useLanguage } from '@/app/(app)/layout';


const translations = {
    en: {
        goodMorning: "Good morning",
        goodAfternoon: "Good afternoon",
        goodEvening: "Good evening",
        description: "Here's a summary of your social media performance.",
    },
    ar: {
        goodMorning: "صباح الخير",
        goodAfternoon: "مساء الخير",
        goodEvening: "مساء الخير",
        description: "إليك ملخص أداء وسائل التواصل الاجتماعي الخاصة بك.",
    }
};

export default function DashboardPage() {
    const { lang } = useLanguage();
    const t = translations[lang];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t.goodMorning;
        if (hour < 18) return t.goodAfternoon;
        return t.goodEvening;
    }

  return (
    <div className="space-y-6">
      <PageHeader title={`${getGreeting()}, ${user.name} 👋`} description={t.description} />
      <PerformanceSnapshot />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <UpcomingPosts />
            <RecentInteractions />
        </div>
        <div className="lg:col-span-1 space-y-6">
            <AiInsights />
            <SystemHealth />
        </div>
      </div>
    </div>
  );
}
