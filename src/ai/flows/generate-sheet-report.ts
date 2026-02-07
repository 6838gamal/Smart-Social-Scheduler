'use server';
/**
 * @fileOverview A flow for generating reports from Google Sheet data.
 *
 * - generateSheetReport - A function that generates a report from sheet data.
 * - GenerateSheetReportInput - The input type for the generateSheetReport function.
 * - GenerateSheetReportOutput - The return type for the generateSheetReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { type GeneratePerformanceReportOutput } from './generate-performance-reports';

// Copied from generate-performance-reports.ts to avoid import issues with 'use server'
const GeneratePerformanceReportOutputSchema = z.object({
  reportTitle: z.string().describe('A unique and descriptive title for the report, based on the content and platform.'),
  generatedAt: z.string().describe('The ISO 8601 timestamp of when the report was generated.'),
  sourcePage: z.string().describe('The page from which the report was generated (e.g., Reports, Email).'),
  summary: z.string().describe('A summary of the social media post performance.'),
  trends: z.string().describe('Identified trends in posting times and content strategies.'),
  optimalPostingTimes: z.string().describe('Recommended optimal posting times based on engagement.'),
  contentStrategies: z.string().describe('Suggested content strategies to improve engagement.'),
});

const GenerateSheetReportInputSchema = z.object({
  sheetName: z.string().describe('The name of the Google Sheet.'),
  sheetData: z
    .string()
    .describe('The data from the sheet, in CSV format.'),
});
export type GenerateSheetReportInput = z.infer<typeof GenerateSheetReportInputSchema>;

export type GenerateSheetReportOutput = GeneratePerformanceReportOutput;

export async function generateSheetReport(input: GenerateSheetReportInput): Promise<GenerateSheetReportOutput> {
  return generateSheetReportFlow(input);
}

const sheetReportPrompt = ai.definePrompt({
  name: 'sheetReportPrompt',
  input: {
    schema: GenerateSheetReportInputSchema.extend({
      generatedAt: z.string(),
      sourcePage: z.string(),
    }),
  },
  output: {schema: GeneratePerformanceReportOutputSchema},
  prompt: `You are an expert data analyst.

You will analyze data from a Google Sheet and generate a report with key insights.

Generate a unique and descriptive title for the report based on the sheet name and its data.
The report was generated at: {{{generatedAt}}}
The report was generated from the '{{{sourcePage}}}' page, for the sheet named '{{{sheetName}}}'.

Analyze the following sheet data (in CSV format):
{{{sheetData}}}

Based on the provided data, provide a comprehensive report that includes:
- A summary of the data.
- Identified trends or key findings.
- Suggested actions or insights based on the analysis (as 'Optimal Posting Times').
- General observations (as 'Content Strategies').

Ensure that the report is clear, concise, and actionable.

Return the generatedAt and sourcePage values you were given.
`,
});

const generateSheetReportFlow = ai.defineFlow(
  {
    name: 'generateSheetReportFlow',
    inputSchema: GenerateSheetReportInputSchema,
    outputSchema: GeneratePerformanceReportOutputSchema,
  },
  async input => {
    const promptInput = {
      ...input,
      generatedAt: new Date().toISOString(),
      sourcePage: 'Google Sheets',
    };
    const {output} = await sheetReportPrompt(promptInput);
    return output!;
  }
);
