// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview A flow for generating performance reports on social media posts using AI.
 *
 * - generatePerformanceReport - A function that generates the performance report.
 * - GeneratePerformanceReportInput - The input type for the generatePerformanceReport function.
 * - GeneratePerformanceReportOutput - The return type for the generatePerformanceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePerformanceReportInputSchema = z.object({
  platform: z.string().describe('The social media platform to analyze (e.g., Facebook, Twitter, Instagram).'),
  dateRange: z.string().describe('The date range for the report (e.g., last 7 days, last 30 days).'),
  metrics: z.array(z.string()).describe('The metrics to include in the report (e.g., likes, comments, shares, impressions).'),
  postContent: z.string().describe('Example post content for analysis.'),
});
export type GeneratePerformanceReportInput = z.infer<typeof GeneratePerformanceReportInputSchema>;

const GeneratePerformanceReportOutputSchema = z.object({
  reportTitle: z.string().describe('A unique and descriptive title for the report, based on the content and platform.'),
  generatedAt: z.string().describe('The ISO 8601 timestamp of when the report was generated.'),
  sourcePage: z.string().describe('The page from which the report was generated (e.g., Reports, Email).'),
  summary: z.string().describe('A summary of the social media post performance.'),
  trends: z.string().describe('Identified trends in posting times and content strategies.'),
  optimalPostingTimes: z.string().describe('Recommended optimal posting times based on engagement.'),
  contentStrategies: z.string().describe('Suggested content strategies to improve engagement.'),
});
export type GeneratePerformanceReportOutput = z.infer<typeof GeneratePerformanceReportOutputSchema>;

export async function generatePerformanceReport(input: GeneratePerformanceReportInput): Promise<GeneratePerformanceReportOutput> {
  return generatePerformanceReportFlow(input);
}

const performanceReportPrompt = ai.definePrompt({
  name: 'performanceReportPrompt',
  input: {
    schema: GeneratePerformanceReportInputSchema.extend({
      generatedAt: z.string(),
      sourcePage: z.string(),
    }),
  },
  output: {schema: GeneratePerformanceReportOutputSchema},
  prompt: `You are an expert marketing analyst specializing in social media performance.

You will analyze the performance of social media posts and generate a report with key insights.

Generate a unique and descriptive title for the report based on the provided data.
The report was generated at: {{{generatedAt}}}
The report was generated from the '{{{sourcePage}}}' page.

Analyze the following data to provide a comprehensive report:

Platform: {{{platform}}}
Date Range: {{{dateRange}}}
Metrics: {{{metrics}}}
Example Post Content: {{{postContent}}}

Based on the provided data, identify trends, optimal posting times, and content strategies to improve engagement.

Consider factors such as audience demographics, content type, and posting frequency.

Provide a summary of the social media post performance, identified trends, recommended optimal posting times, and suggested content strategies.

Ensure that the report is clear, concise, and actionable.

Return the generatedAt and sourcePage values you were given.
`,
});

const generatePerformanceReportFlow = ai.defineFlow(
  {
    name: 'generatePerformanceReportFlow',
    inputSchema: GeneratePerformanceReportInputSchema,
    outputSchema: GeneratePerformanceReportOutputSchema,
  },
  async input => {
    const promptInput = {
      ...input,
      generatedAt: new Date().toISOString(),
      sourcePage: 'Reports',
    };
    const {output} = await performanceReportPrompt(promptInput);
    return output!;
  }
);
