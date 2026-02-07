'use server';
/**
 * @fileOverview A flow for generating reports from user emails.
 *
 * - generateEmailReport - A function that generates an email report.
 * - GenerateEmailReportInput - The input type for the generateEmailReport function.
 * - GenerateEmailReportOutput - The return type for the generateEmailReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmailSchema = z.object({
  id: z.string(),
  from: z.string(),
  subject: z.string(),
  snippet: z.string(),
});

const GenerateEmailReportInputSchema = z.object({
  emails: z.array(EmailSchema).describe('A list of emails to analyze.'),
});
export type GenerateEmailReportInput = z.infer<typeof GenerateEmailReportInputSchema>;

// Re-using the output schema from the performance report for consistency.
const ReportOutputSchema = z.object({
  reportTitle: z.string().describe('A unique and descriptive title for the report, based on the email content.'),
  generatedAt: z.string().describe('The ISO 8601 timestamp of when the report was generated.'),
  sourcePage: z.string().describe('The page from which the report was generated (e.g., Analytics, Email).'),
  summary: z.string().describe('A summary of the email content and activity.'),
  trends: z.string().describe('Identified trends, key topics, and common senders.'),
  optimalPostingTimes: z.string().describe('Suggested actions or follow-ups based on the email content.'), // Re-using field for "suggested actions"
  contentStrategies: z.string().describe('General insights or observations.'), // Re-using field for "insights"
});
export type GenerateEmailReportOutput = z.infer<typeof ReportOutputSchema>;

export async function generateEmailReport(input: GenerateEmailReportInput): Promise<GenerateEmailReportOutput> {
  return generateEmailReportFlow(input);
}

const emailReportPrompt = ai.definePrompt({
  name: 'emailReportPrompt',
  input: {
    schema: GenerateEmailReportInputSchema.extend({
      generatedAt: z.string(),
      sourcePage: z.string(),
    }),
  },
  output: {schema: ReportOutputSchema},
  prompt: `You are an expert data analyst specializing in email communication.

You will analyze a list of emails and generate a report with key insights.

Generate a unique and descriptive title for the report.
The report was generated at: {{{generatedAt}}}
The report was generated from the '{{{sourcePage}}}' page.

Analyze the following emails:
{{#each emails}}
From: {{from}}
Subject: {{subject}}
Snippet: {{snippet}}
---
{{/each}}

Based on the provided emails, provide a comprehensive report that includes:
- A summary of email activity.
- Identified trends, such as key topics discussed and most common senders.
- Suggested actions or follow-ups based on email content.
- General insights or observations about the user's inbox.

Rename the "suggested actions" as "Optimal Posting Times" and "general insights" as "Content Strategies" in the output to match the schema.

Ensure that the report is clear, concise, and actionable.

Return the generatedAt and sourcePage values you were given.
`,
});

const generateEmailReportFlow = ai.defineFlow(
  {
    name: 'generateEmailReportFlow',
    inputSchema: GenerateEmailReportInputSchema,
    outputSchema: ReportOutputSchema,
  },
  async input => {
    const promptInput = {
      ...input,
      generatedAt: new Date().toISOString(),
      sourcePage: 'Email',
    };
    const {output} = await emailReportPrompt(promptInput);
    return output!;
  }
);
