'use server';

/**
 * @fileOverview Provides AI-driven recommendations for optimal posting times and content types based on analytics.
 *
 * - `getAnalyticsRecommendations` - A function that retrieves AI recommendations for posting strategy.
 * - `AnalyticsRecommendationsInput` - The input type for the `getAnalyticsRecommendations` function.
 * - `AnalyticsRecommendationsOutput` - The return type for the `getAnalyticsRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyticsRecommendationsInputSchema = z.object({
  engagementPerDay: z.string().describe('Bar chart data for engagement per day, as a stringified JSON array of objects with date and engagement properties.'),
  contentTypePerformance: z.string().describe('Pie chart data for content type performance, as a stringified JSON array of objects with type and engagement properties.'),
  followerGrowth: z.string().describe('Line chart data for follower growth, as a stringified JSON array of objects with date and follower count properties.'),
  currentDate: z.string().describe('The current date, to provide context for the recommendations.'),
});
export type AnalyticsRecommendationsInput = z.infer<typeof AnalyticsRecommendationsInputSchema>;

const AnalyticsRecommendationsOutputSchema = z.object({
  bestTimeToPost: z.string().describe('Recommended time range to post for optimal engagement.'),
  contentSuggestions: z.string().describe('Suggestions for the type of content to post based on performance.'),
  overallStrategy: z.string().describe('An overall posting strategy recommendation incorporating time and content type.'),
});
export type AnalyticsRecommendationsOutput = z.infer<typeof AnalyticsRecommendationsOutputSchema>;

export async function getAnalyticsRecommendations(input: AnalyticsRecommendationsInput): Promise<AnalyticsRecommendationsOutput> {
  return analyticsRecommendationsFlow(input);
}

const analyticsRecommendationsPrompt = ai.definePrompt({
  name: 'analyticsRecommendationsPrompt',
  input: {schema: AnalyticsRecommendationsInputSchema},
  output: {schema: AnalyticsRecommendationsOutputSchema},
  prompt: `You are an AI social media strategist that analyzes social media analytics and provides posting recommendations.

  Today's date is {{currentDate}}.

  Analyze the following analytics data and provide actionable recommendations for the best time to post and what type of content to post.

  Engagement Per Day: {{{engagementPerDay}}}
  Content Type Performance: {{{contentTypePerformance}}}
  Follower Growth: {{{followerGrowth}}}

  Based on this data, provide:
  1.  A specific time range (e.g., 8-10 PM) for the bestTimeToPost.  This should be in the user's local timezone.
  2.  Content suggestions for the contentSuggestions that are short and actionable (e.g., "Focus on posting more motivational content on Sundays").
  3.  An overall posting strategy in the overallStrategy field, incorporating both the best time and content suggestions to maximize engagement and follower growth.
  `,
});

const analyticsRecommendationsFlow = ai.defineFlow(
  {
    name: 'analyticsRecommendationsFlow',
    inputSchema: AnalyticsRecommendationsInputSchema,
    outputSchema: AnalyticsRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await analyticsRecommendationsPrompt(input);
    return output!;
  }
);
