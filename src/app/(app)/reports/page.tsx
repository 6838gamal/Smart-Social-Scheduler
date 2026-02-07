'use client';

import { useState } from 'react';
import {
  generatePerformanceReport,
  type GeneratePerformanceReportOutput,
} from '@/ai/flows/generate-performance-reports';
import { ReportForm, type FormValues } from '@/components/reports/report-form';
import { ReportDisplay } from '@/components/reports/report-display';
import { useI18n, useUser, useCollection, useAuth } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ReportList } from '@/components/reports/report-list';
import { useToast } from '@/hooks/use-toast';

// Define the Report type based on the backend.json entity
export interface Report extends GeneratePerformanceReportOutput {
  id: string;
  uid: string;
}

export default function ReportsPage() {
  const { dictionary } = useI18n();
  const { user } = useUser();
  const { firestore } = useAuth();
  const { toast } = useToast();

  // Fetch reports for the current user
  const { data: reports, loading: reportsLoading } = useCollection<Report>(
    user ? `users/${user.uid}/reports` : null
  );

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // When a report is selected from the list, display it
  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
  };

  // When a new report is generated from the form
  const handleFormSubmit = async (data: FormValues) => {
    if (!firestore || !user) return;
    setIsGenerating(true);
    try {
      const result = await generatePerformanceReport(data);
      const reportData = {
        ...result,
        uid: user.uid,
      };
      const reportsCollection = collection(
        firestore,
        `users/${user.uid}/reports`
      );
      const newReportRef = await addDoc(reportsCollection, reportData);
      // Select the newly created report to display it
      setSelectedReport({ ...reportData, id: newReportRef.id });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: 'destructive',
        title: dictionary.errors.genericTitle,
        description: dictionary.errors.aiError,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold tracking-tight">
            {dictionary.pages.reports.title}
          </h2>
          <p className="text-muted-foreground">
            {dictionary.pages.reports.description}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ReportForm onSubmit={handleFormSubmit} isPending={isGenerating} />
          <div className="mt-6">
            <ReportList
              reports={reports}
              isLoading={reportsLoading}
              onSelectReport={handleSelectReport}
              selectedReportId={selectedReport?.id}
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <ReportDisplay
            report={selectedReport}
            isPending={isGenerating || (reportsLoading && !reports)}
          />
        </div>
      </div>
    </div>
  );
}
