'use server';

/**
 * @fileOverview AI-powered caption generation for social media posts.
 *
 * This file defines a Genkit flow to generate relevant captions for social media posts based on user-provided content and desired tone.
 *
 * - `generateAiCaption`: Asynchronous function to generate a caption.
 * - `AiCaptionInput`: Input type for the `generateAiCaption` function.
 * - `AiCaptionOutput`: Output type for the `generateAiCaption` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCaptionInputSchema = z.object({
  content: z
    .string()
    .describe('The content of the post, including text and any relevant context.'),
  tone: z
    .string()
    .describe(
      'The desired tone of the caption (e.g., Inspirational, Technical, Promotional).'
    ),
});
export type AiCaptionInput = z.infer<typeof AiCaptionInputSchema>;

const AiCaptionOutputSchema = z.object({
  caption: z.string().describe('The generated caption for the social media post.'),
});
export type AiCaptionOutput = z.infer<typeof AiCaptionOutputSchema>;

export async function generateAiCaption(
  input: AiCaptionInput
): Promise<AiCaptionOutput> {
  return aiSuggestedCaptionFlow(input);
}

const aiSuggestedCaptionPrompt = ai.definePrompt({
  name: 'aiSuggestedCaptionPrompt',
  input: {schema: AiCaptionInputSchema},
  output: {schema: AiCaptionOutputSchema},
  prompt: `You are an AI social media assistant that generates engaging captions.

  Generate a caption based on the following content and desired tone. The caption should be appropriate for platforms like Telegram and X.

  Content: {{{content}}}
  Tone: {{{tone}}}

  Caption:`, // No function calls allowed in Handlebars
});

const aiSuggestedCaptionFlow = ai.defineFlow(
  {
    name: 'aiSuggestedCaptionFlow',
    inputSchema: AiCaptionInputSchema,
    outputSchema: AiCaptionOutputSchema,
  },
  async input => {
    const {output} = await aiSuggestedCaptionPrompt(input);
    return output!;
  }
);
