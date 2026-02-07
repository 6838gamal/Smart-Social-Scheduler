'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import type { Report } from '@/app/(app)/reports/page';
import { useI18n } from '@/contexts/i18n-provider';

interface ReportListProps {
  reports: Report[] | null;
  isLoading: boolean;
  onSelectReport: (report: Report) => void;
  selectedReportId?: string;
}

export function ReportList({
  reports,
  isLoading,
  onSelectReport,
  selectedReportId,
}: ReportListProps) {
  const { dictionary } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.pages.reports.list.title}</CardTitle>
        <CardDescription>{dictionary.pages.reports.list.description}</CardDescription>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {reports && reports.length > 0 ? (
              reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()).map((report) => (
                <button
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors',
                    selectedReportId === report.id
                      ? 'bg-primary/10'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <FileText className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="font-medium truncate">{report.reportTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(report.generatedAt), 'MMM d, yyyy')} - {report.sourcePage}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                {dictionary.pages.reports.list.noReports}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
