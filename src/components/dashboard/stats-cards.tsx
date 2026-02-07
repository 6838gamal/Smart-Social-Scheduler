'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/contexts/i18n-provider';
import { FileText, Mail, FileSpreadsheet } from 'lucide-react';
import type { Report } from '@/app/(app)/reports/page';

interface StatsCardsProps {
  reports: Report[] | null;
  isLoading: boolean;
}

export function StatsCards({ reports, isLoading }: StatsCardsProps) {
  const { dictionary } = useI18n();

  const totalReports = reports?.length ?? 0;
  const emailReports = reports?.filter(r => r.sourcePage === 'Email').length ?? 0;
  const sheetReports = reports?.filter(r => r.sourcePage === 'Google Sheets').length ?? 0;

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {dictionary.pages.dashboard.stats.totalReports}
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReports}</div>
          <p className="text-xs text-muted-foreground">
            {dictionary.pages.dashboard.stats.allTime}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {dictionary.pages.dashboard.stats.emailReports}
          </CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{emailReports}</div>
          <p className="text-xs text-muted-foreground">
            {dictionary.pages.dashboard.stats.fromEmailInbox}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {dictionary.pages.dashboard.stats.sheetReports}
          </CardTitle>
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sheetReports}</div>
          <p className="text-xs text-muted-foreground">
            {dictionary.pages.dashboard.stats.fromGoogleSheets}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
