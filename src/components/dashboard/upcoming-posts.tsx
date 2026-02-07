'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/contexts/i18n-provider';
import type { Report } from '@/app/(app)/reports/page';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RecentReportsProps {
  reports: Report[] | null;
  isLoading: boolean;
}

export function UpcomingPosts({ reports, isLoading }: RecentReportsProps) {
  const { dictionary } = useI18n();

  const recentReports = reports
    ? [...reports]
        .sort(
          (a, b) =>
            new Date(b.generatedAt).getTime() -
            new Date(a.generatedAt).getTime()
        )
        .slice(0, 5)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          {dictionary.pages.dashboard.recentReports.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {dictionary.pages.dashboard.recentReports.reportTitle}
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                {dictionary.pages.dashboard.recentReports.source}
              </TableHead>
              <TableHead className="text-right">
                {dictionary.pages.dashboard.recentReports.date}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-1/2" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : recentReports.length > 0 ? (
              recentReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="max-w-xs truncate font-medium">
                    {report.reportTitle}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {report.sourcePage}
                  </TableCell>
                  <TableCell className="text-right">
                    {format(new Date(report.generatedAt), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  {dictionary.pages.dashboard.recentReports.noReports}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="ml-auto">
          <Link href="/reports">
            {dictionary.pages.dashboard.recentReports.viewAll}
            <ArrowRight className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
