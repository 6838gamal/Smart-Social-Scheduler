
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { analyticsData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { getAnalyticsRecommendations } from "@/ai/flows/ai-analytics-recommendations";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/app/(app)/layout";


const translations = {
    en: {
        pageTitle: "Analytics & Insights",
        pageDescription: "Visualize performance trends and get AI-driven recommendations.",
        downloadReport: "Download Report",
        totalEngagement: "Total Engagement",
        last7days: "Last 7 days",
        fromLastWeek: "from last week",
        followerGrowthRate: "Follower Growth Rate",
        thisMonth: "This month",
        trendingUp: "Trending up vs. last month's",
        platformComparison: "Platform Comparison",
        engagementThisWeek: "Engagement this week",
        engagementPerDay: "Engagement Per Day",
        followerGrowth: "Follower Growth",
        thisYear: "This year",
        contentTypePerformance: "Content Type Performance",
        engagementShare: "Engagement share by post type",
        aiRecommendations: "AI Recommendations",
        generate: "Generate",
        bestTimeToPost: "Best Time to Post",
        contentSuggestions: "Content Suggestions",
        overallStrategy: "Overall Strategy",
        aiRecommendationsUpdated: "AI Recommendations Updated!",
        failedToGetRecommendations: "Failed to get recommendations",
        aiCouldNotGenerate: "The AI assistant could not generate recommendations at this time.",
    },
    ar: {
        pageTitle: "التحليلات والرؤى",
        pageDescription: "تصور اتجاهات الأداء واحصل على توصيات مدفوعة بالذكاء الاصطناعي.",
        downloadReport: "تنزيل التقرير",
        totalEngagement: "إجمالي التفاعل",
        last7days: "آخر 7 أيام",
        fromLastWeek: "من الأسبوع الماضي",
        followerGrowthRate: "معدل نمو المتابعين",
        thisMonth: "هذا الشهر",
        trendingUp: "في اتجاه تصاعدي مقارنة بالشهر الماضي",
        platformComparison: "مقارنة المنصات",
        engagementThisWeek: "التفاعل هذا الأسبوع",
        engagementPerDay: "التفاعل اليومي",
        followerGrowth: "نمو المتابعين",
        thisYear: "هذا العام",
        contentTypePerformance: "أداء نوع المحتوى",
        engagementShare: "حصة التفاعل حسب نوع المنشور",
        aiRecommendations: "توصيات الذكاء الاصطناعي",
        generate: "إنشاء",
        bestTimeToPost: "أفضل وقت للنشر",
        contentSuggestions: "اقتراحات المحتوى",
        overallStrategy: "الاستراتيجية العامة",
        aiRecommendationsUpdated: "تم تحديث توصيات الذكاء الاصطناعي!",
        failedToGetRecommendations: "فشل في الحصول على توصيات",
        aiCouldNotGenerate: "لم يتمكن مساعد الذكاء الاصطناعي من إنشاء توصيات في هذا الوقت.",
    }
}

const engagementChartConfig = {
  engagement: {
    label: "Engagement",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const contentChartConfig = {
  engagement: {
    label: "Engagement",
  },
  Image: {
    label: "Image",
    color: "hsl(var(--chart-2))",
  },
  Video: {
    label: "Video",
    color: "hsl(var(--chart-1))",
  },
  Text: {
    label: "Text",
    color: "hsl(var(--chart-3))",
  },
  Link: {
    label: "Link",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const followerChartConfig = {
    followers: {
        label: "Followers",
        color: "hsl(var(--chart-1))",
    }
} satisfies ChartConfig;


function AiRecommendations() {
    const [recommendations, setRecommendations] = useState({
        bestTimeToPost: '8-10 PM',
        contentSuggestions: 'Try more motivational content on Sundays.',
        overallStrategy: 'Focus on image-based motivational posts during evening hours on weekends for maximum impact.',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { lang } = useLanguage();
    const t = translations[lang];

    const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
            const input = {
                engagementPerDay: JSON.stringify(analyticsData.engagementPerDay),
                contentTypePerformance: JSON.stringify(analyticsData.contentTypePerformance),
                followerGrowth: JSON.stringify(analyticsData.followerGrowth),
                currentDate: new Date().toISOString(),
            }
            const result = await getAnalyticsRecommendations(input);
            setRecommendations(result);
            toast({ title: t.aiRecommendationsUpdated });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: t.failedToGetRecommendations,
                description: t.aiCouldNotGenerate,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> {t.aiRecommendations}</span>
                    <Button onClick={fetchRecommendations} disabled={isLoading} variant="ghost" size="sm">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : t.generate}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold text-sm">{t.bestTimeToPost}</h3>
                    <p className="text-muted-foreground text-sm">{recommendations.bestTimeToPost}</p>
                </div>
                 <div>
                    <h3 className="font-semibold text-sm">{t.contentSuggestions}</h3>
                    <p className="text-muted-foreground text-sm">{recommendations.contentSuggestions}</p>
                </div>
                 <div>
                    <h3 className="font-semibold text-sm">{t.overallStrategy}</h3>
                    <p className="text-muted-foreground text-sm">{recommendations.overallStrategy}</p>
                </div>
            </CardContent>
        </Card>
    );
}


export default function AnalyticsPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pageTitle}
        description={t.pageDescription}
      >
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t.downloadReport}
        </Button>
      </PageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t.totalEngagement}</CardTitle>
            <CardDescription>{t.last7days}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15,329</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-4 w-4 text-green-500" /> +18.2% {t.fromLastWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.followerGrowthRate}</CardTitle>
            <CardDescription>{t.thisMonth}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+5.8%</div>
            <p className="text-xs text-muted-foreground">{t.trendingUp} +4.1%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.platformComparison}</CardTitle>
            <CardDescription>{t.engagementThisWeek}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">X: <span className="text-primary">65%</span></div>
            <div className="text-xl font-bold">Telegram: <span className="text-accent">35%</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
             <Card>
                <CardHeader>
                <CardTitle>{t.engagementPerDay}</CardTitle>
                <CardDescription>{t.last7days}</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={engagementChartConfig} className="h-[250px] w-full">
                    <BarChart data={analyticsData.engagementPerDay}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="engagement" fill="var(--color-engagement)" radius={4} />
                    </BarChart>
                </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>{t.followerGrowth}</CardTitle>
                <CardDescription>{t.thisYear}</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={followerChartConfig} className="h-[250px] w-full">
                    <LineChart data={analyticsData.followerGrowth}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="followers" stroke="var(--color-followers)" strokeWidth={2} dot={false} />
                    </LineChart>
                </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                <CardTitle>{t.contentTypePerformance}</CardTitle>
                <CardDescription>{t.engagementShare}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <ChartContainer config={contentChartConfig} className="h-[250px] w-full">
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent nameKey="engagement" />} />
                            <Pie data={analyticsData.contentTypePerformance} dataKey="engagement" nameKey="type" innerRadius={60} strokeWidth={5}>
                                {analyticsData.contentTypePerformance.map((entry) => (
                                    <Cell key={`cell-${entry.type}`} fill={entry.fill} />
                                ))}
                            </Pie>
                             <ChartLegend content={<ChartLegendContent nameKey="type" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <AiRecommendations />
        </div>
      </div>
    </div>
  );
}
