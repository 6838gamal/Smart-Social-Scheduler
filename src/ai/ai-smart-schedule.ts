// This file implements the AI-powered smart schedule feature for SoloStream.
'use server';
/**
 * @fileOverview AI-powered smart schedule feature for SoloStream, which automatically picks the optimal time to schedule a post.
 *
 * - getSmartScheduleSuggestion - A function that returns a suggested post schedule time.
 * - SmartScheduleInput - The input type for the getSmartScheduleSuggestion function.
 * - SmartScheduleOutput - The return type for the getSmartScheduleSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartScheduleInputSchema = z.object({
  postContent: z.string().describe('The content of the post to be scheduled.'),
  platform: z.enum(['Telegram', 'X']).describe('The social media platform for the post.'),
  pastPostPerformance: z.string().optional().describe("Summary of past post performances, e.g., 'Posts with images perform better on platform X.'"),
});
export type SmartScheduleInput = z.infer<typeof SmartScheduleInputSchema>;

const SmartScheduleOutputSchema = z.object({
  suggestedTime: z.string().describe('The suggested time to schedule the post in ISO 8601 format.'),
  reasoning: z.string().describe('The AI reasoning behind the suggested time.'),
});
export type SmartScheduleOutput = z.infer<typeof SmartScheduleOutputSchema>;

export async function getSmartScheduleSuggestion(input: SmartScheduleInput): Promise<SmartScheduleOutput> {
  return smartScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSchedulePrompt',
  input: {schema: SmartScheduleInputSchema},
  output: {schema: SmartScheduleOutputSchema},
  prompt: `You are an AI assistant that suggests the best time to schedule a social media post.

  Given the following information, determine the optimal time to schedule the post. Return the time in ISO 8601 format. Also, explain your reasoning for choosing that time.

  Post Content: {{{postContent}}}
  Platform: {{{platform}}}

  {{#if pastPostPerformance}}
  Past Post Performance: {{{pastPostPerformance}}}
  {{/if}}

  Consider factors such as audience activity patterns, content type, and platform-specific best practices. Remember to respond with properly formatted JSON.

  Here's the schema for the output:
  ${JSON.stringify(SmartScheduleOutputSchema.description)}
  `,
});

const smartScheduleFlow = ai.defineFlow(
  {
    name: 'smartScheduleFlow',
    inputSchema: SmartScheduleInputSchema,
    outputSchema: SmartScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
