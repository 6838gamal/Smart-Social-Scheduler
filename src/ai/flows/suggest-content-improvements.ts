'use server';

/**
 * @fileOverview Provides AI-powered suggestions for content improvements, including hashtags and posting times, based on high-engagement similar posts.
 *
 * - suggestContentImprovements - A function that suggests hashtags and posting times.
 * - SuggestContentImprovementsInput - The input type for the suggestContentImprovements function.
 * - SuggestContentImprovementsOutput - The return type for the suggestContentImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestContentImprovementsInputSchema = z.object({
  postContent: z.string().describe('The content of the social media post.'),
  platform: z.enum(['Email', 'WhatsApp', 'Telegram', 'Notion']).describe('The platform for the post.'),
  topic: z.string().describe('The general topic of the post.'),
});
export type SuggestContentImprovementsInput = z.infer<typeof SuggestContentImprovementsInputSchema>;

const SuggestContentImprovementsOutputSchema = z.object({
  suggestedHashtags: z.array(z.string()).describe('An array of suggested hashtags to improve post visibility.'),
  suggestedPostingTimes: z.array(z.string()).describe('An array of suggested posting times to maximize engagement, in ISO format.'),
  explanation: z.string().describe('Explanation of why the hashtags and posting times are suggested.'),
});
export type SuggestContentImprovementsOutput = z.infer<typeof SuggestContentImprovementsOutputSchema>;

export async function suggestContentImprovements(input: SuggestContentImprovementsInput): Promise<SuggestContentImprovementsOutput> {
  return suggestContentImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestContentImprovementsPrompt',
  input: {schema: SuggestContentImprovementsInputSchema},
  output: {schema: SuggestContentImprovementsOutputSchema},
  prompt: `You are a social media expert. Analyze the following social media post content and suggest hashtags and posting times based on the performance of similar posts with high user engagement.

  Post Content: {{{postContent}}}
  Platform: {{{platform}}}
  Topic: {{{topic}}}

  Consider the platform, topic and content when generating suggestions.

  Return suggestedPostingTimes as ISO format.

  Explain why you are suggesting these hashtags and posting times.
  `,
});

const suggestContentImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestContentImprovementsFlow',
    inputSchema: SuggestContentImprovementsInputSchema,
    outputSchema: SuggestContentImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
