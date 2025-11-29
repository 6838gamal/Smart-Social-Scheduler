
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performance } from '@/lib/data';
import { ArrowUpRight, BarChart, Heart, MessageCircle, Users } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/app/(app)/layout';


const translations = {
    en: {
        engagementRate: "Engagement Rate",
        fromLastMonth: "from last month",
        followers: "Followers",
        thisMonth: "this month",
        topPerformingPost: "Top Performing Post",
    },
    ar: {
        engagementRate: "معدل التفاعل",
        fromLastMonth: "من الشهر الماضي",
        followers: "المتابعون",
        thisMonth: "هذا الشهر",
        topPerformingPost: "المنشور الأفضل أداءً",
    }
};

export default function PerformanceSnapshot() {
    const { lang } = useLanguage();
    const t = translations[lang];
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.engagementRate}</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.engagementRate.value}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              {performance.engagementRate.change} {t.fromLastMonth}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.followers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.followers.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{performance.followers.change} {t.thisMonth}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.topPerformingPost}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Image
              src={performance.topPost.image.imageUrl}
              alt="Top post"
              width={100}
              height={66}
              className="rounded-md object-cover"
              data-ai-hint={performance.topPost.image.imageHint}
            />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center"><Heart className="h-4 w-4 mr-1" /> {performance.topPost.metrics.likes}</span>
              <span className="flex items-center"><MessageCircle className="h-4 w-4 mr-1" /> {performance.topPost.metrics.comments}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
