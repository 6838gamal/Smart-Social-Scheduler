'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Report } from '@/app/(app)/reports/page';
import {
  Loader2,
  Wand2,
  FileText,
  TrendingUp,
  Clock,
  Lightbulb,
  Download,
} from 'lucide-react';
import { useI18n } from '@/contexts/i18n-provider';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { downloadReportAsCSV, downloadReportAsXLSX } from '@/lib/download';

interface ReportDisplayProps {
  report: Report | null;
  isPending: boolean;
}

export function ReportDisplay({ report, isPending }: ReportDisplayProps) {
  const { dictionary } = useI18n();

  if (isPending) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>{dictionary.pages.reports.display.generating}</p>
        </div>
      </div>
    );
  }

  if (report) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{report.reportTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {dictionary.pages.reports.display.generatedAt}{' '}
              {format(new Date(report.generatedAt), 'PPP p')} (
              {report.sourcePage})
            </p>
          </CardHeader>
          <CardFooter className="border-t px-6 py-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  {dictionary.pages.reports.display.download}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => downloadReportAsCSV(report)}>
                  {dictionary.pages.reports.display.downloadCSV}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadReportAsXLSX(report)}>
                  {dictionary.pages.reports.display.downloadXLSX}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <FileText /> {dictionary.pages.reports.display.summary}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{report.summary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <TrendingUp /> {dictionary.pages.reports.display.trends}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{report.trends}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Clock /> {dictionary.pages.reports.display.optimalTimes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {report.optimalPostingTimes}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Lightbulb /> {dictionary.pages.reports.display.strategies}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{report.contentStrategies}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Wand2 className="h-8 w-8" />
        <p>{dictionary.pages.reports.display.placeholder}</p>
      </div>
    </div>
  );
}
