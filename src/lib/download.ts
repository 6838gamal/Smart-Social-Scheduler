'use client';

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { type Report } from '@/app/(app)/reports/page';

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const formatReportData = (report: Report) => {
  // Flatten the report object into a key-value array
  return [
    { key: 'Report Title', value: report.reportTitle },
    { key: 'Generated At', value: report.generatedAt },
    { key: 'Source Page', value: report.sourcePage },
    { key: 'Summary', value: report.summary },
    { key: 'Trends', value: report.trends },
    { key: 'Optimal Posting Times', value: report.optimalPostingTimes },
    { key: 'Content Strategies', value: report.contentStrategies },
  ];
};

export const downloadReportAsCSV = (report: Report) => {
  const data = formatReportData(report);
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${report.reportTitle.replace(/ /g, '_')}.csv`);
};

export const downloadReportAsXLSX = (report: Report) => {
  const data = formatReportData(report).map(item => [item.key, item.value]);
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  downloadFile(blob, `${report.reportTitle.replace(/ /g, '_')}.xlsx`);
};
