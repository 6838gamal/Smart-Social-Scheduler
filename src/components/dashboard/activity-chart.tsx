'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useI18n } from '@/contexts/i18n-provider';
import { Activity } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { Report } from '@/app/(app)/reports/page';
import { useMemo } from 'react';
import { subDays, format, startOfDay } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

interface ActivityChartProps {
  reports: Report[] | null;
  isLoading: boolean;
}

export function ActivityChart({ reports, isLoading }: ActivityChartProps) {
  const { dictionary } = useI18n();

  const chartData = useMemo(() => {
    if (!reports) return [];

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), i);
      return format(startOfDay(d), 'yyyy-MM-dd');
    }).reverse();

    const reportsByDay = reports.reduce((acc, report) => {
      const date = format(startOfDay(new Date(report.generatedAt)), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return last7Days.map(date => ({
        date,
        reports: reportsByDay[date] || 0
    }));

  }, [reports]);

  const chartConfig = {
    reports: {
      label: dictionary.pages.dashboard.activity.reports,
      color: 'hsl(var(--primary))',
    },
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Activity /> {dictionary.pages.dashboard.activity.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Activity /> {dictionary.pages.dashboard.activity.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(dictionary.locale === 'ar' ? 'ar-EG' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                })
              }
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="reports" fill="var(--color-reports)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
