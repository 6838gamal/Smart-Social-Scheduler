// src/ai/flows/ai-content-library-search.ts
'use server';

/**
 * @fileOverview A content library search AI agent.
 *
 * - aiContentLibrarySearch - A function that handles the content library search process.
 * - AIContentLibrarySearchInput - The input type for the aiContentLibrarySearch function.
 * - AIContentLibrarySearchOutput - The return type for the aiContentLibrarySearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIContentLibrarySearchInputSchema = z.object({
  query: z.string().describe('The search query in natural language.'),
});
export type AIContentLibrarySearchInput = z.infer<typeof AIContentLibrarySearchInputSchema>;

const AIContentLibrarySearchOutputSchema = z.object({
  results: z.array(z.string()).describe('A list of content snippets that match the search query.'),
});
export type AIContentLibrarySearchOutput = z.infer<typeof AIContentLibrarySearchOutputSchema>;

export async function aiContentLibrarySearch(input: AIContentLibrarySearchInput): Promise<AIContentLibrarySearchOutput> {
  return aiContentLibrarySearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiContentLibrarySearchPrompt',
  input: {schema: AIContentLibrarySearchInputSchema},
  output: {schema: AIContentLibrarySearchOutputSchema},
  prompt: `You are an AI assistant designed to search a content library and return relevant snippets based on a natural language query.

  Return a JSON array of content snippets that match the following query:

  {{query}}
  `,
});

const aiContentLibrarySearchFlow = ai.defineFlow(
  {
    name: 'aiContentLibrarySearchFlow',
    inputSchema: AIContentLibrarySearchInputSchema,
    outputSchema: AIContentLibrarySearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
