'use server';
/**
 * @fileOverview AI-powered reply suggestions for the unified inbox.
 *
 * This file defines a Genkit flow that takes a message as input and returns AI-generated reply suggestions.
 *
 * @fileOverview AI-powered reply suggestions for the unified inbox.
 *
 * - generateReplySuggestions - A function that generates reply suggestions for a given message.
 * - GenerateReplySuggestionsInput - The input type for the generateReplySuggestions function.
 * - GenerateReplySuggestionsOutput - The return type for the generateReplySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReplySuggestionsInputSchema = z.object({
  message: z.string().describe('The message to generate reply suggestions for.'),
});
export type GenerateReplySuggestionsInput = z.infer<typeof GenerateReplySuggestionsInputSchema>;

const GenerateReplySuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of reply suggestions.'),
});
export type GenerateReplySuggestionsOutput = z.infer<typeof GenerateReplySuggestionsOutputSchema>;

export async function generateReplySuggestions(input: GenerateReplySuggestionsInput): Promise<GenerateReplySuggestionsOutput> {
  return generateReplySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReplySuggestionsPrompt',
  input: {schema: GenerateReplySuggestionsInputSchema},
  output: {schema: GenerateReplySuggestionsOutputSchema},
  prompt: `You are an AI assistant that suggests replies to messages.

  Generate 3 reply suggestions for the following message:
  {{message}}

  The suggestions should be short and relevant to the message.
  Format the output as a JSON array of strings.`,
});

const generateReplySuggestionsFlow = ai.defineFlow(
  {
    name: 'generateReplySuggestionsFlow',
    inputSchema: GenerateReplySuggestionsInputSchema,
    outputSchema: GenerateReplySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
