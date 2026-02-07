'use client';

import { StatsCards } from '@/components/dashboard/stats-cards';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { UpcomingPosts } from '@/components/dashboard/upcoming-posts';
import { useUser, useCollection } from '@/firebase';
import type { GeneratePerformanceReportOutput } from '@/ai/flows/generate-performance-reports';

export interface Report extends GeneratePerformanceReportOutput {
  id: string;
  uid: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { data: reports, loading: reportsLoading } = useCollection<Report>(
    user ? `users/${user.uid}/reports` : null
  );

  return (
    <div className="grid gap-6">
      <StatsCards reports={reports} isLoading={reportsLoading} />
      <ActivityChart reports={reports} isLoading={reportsLoading} />
      <UpcomingPosts reports={reports} isLoading={reportsLoading} />
    </div>
  );
}
