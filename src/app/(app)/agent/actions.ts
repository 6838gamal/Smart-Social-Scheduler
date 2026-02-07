'use server';

import { ai } from '@/ai/genkit';
import { Message } from '@genkit-ai/ai/model';
import { z } from 'zod';
import { transcribeAudio as transcribeAudioFlow } from '@/ai/flows/transcribe-audio';

// Define the report schema here to avoid client/server import issues
const GeneratePerformanceReportOutputSchema = z.object({
  reportTitle: z.string(),
  generatedAt: z.string(),
  sourcePage: z.string(),
  summary: z.string(),
  trends: z.string(),
  optimalPostingTimes: z.string(),
  contentStrategies: z.string(),
});

const ReportSchema = GeneratePerformanceReportOutputSchema.extend({
  id: z.string(),
  uid: z.string(),
});
const ReportsSchema = z.array(ReportSchema).nullable();

const HistorySchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })
);

export async function transcribeAudio(audioDataUri: string) {
  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE'
  ) {
    throw new Error(
      'The Gemini API key is not configured. Please add it to your .env file.'
    );
  }
  try {
    const { text } = await transcribeAudioFlow({ audioDataUri });
    return text;
  } catch (e) {
    console.error('Error during audio transcription:', e);
    throw new Error('Failed to transcribe audio.');
  }
}

// This function will be called from the client to get the AI response stream.
export async function getAgentResponse(
  history: z.infer<typeof HistorySchema>,
  reports: z.infer<typeof ReportsSchema>
) {
  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE'
  ) {
    throw new Error(
      'The Gemini API key is not configured. Please add it to your .env file.'
    );
  }

  // Guard against empty or invalid history
  if (!history || history.length === 0) {
    // This prevents sending an invalid request to the AI service.
    throw new Error('INVALID_ARGUMENT: Message history is empty.');
  }

  // Filter out any malformed messages
  const cleanHistory = history.filter(
    (msg) => msg && typeof msg.content === 'string' && typeof msg.role === 'string'
  );

  if (cleanHistory.length === 0) {
    throw new Error('INVALID_ARGUMENT: History is empty after filtering malformed messages.');
  }
  
  const historyForGenkit: Message[] = cleanHistory.map((msg) => ({
    role: msg.role,
    content: [{ text: msg.content }],
  }));

  // Detect language from the last user message.
  const lastUserMessage = cleanHistory[cleanHistory.length - 1].content;
  const language = /[\u0600-\u06FF]/.test(lastUserMessage)
    ? 'Arabic'
    : 'English';

  const reportsContext =
    reports && reports.length > 0
      ? `
Here is a summary of the user's recently generated reports. Use this information to provide contextual answers about their performance and data. If the user asks something not covered in the reports, state that you don't have that information.
${reports
  .map((r) => {
    if (!r || !r.reportTitle || !r.sourcePage || !r.generatedAt || !r.summary) {
      return null; // Skip incomplete or malformed reports
    }
    try {
      // Ensure date is valid before trying to format it
      const reportDate = new Date(r.generatedAt);
      if (isNaN(reportDate.getTime())) {
        return null; // Skip if date is invalid
      }
      return `- "${r.reportTitle}" (Source: ${r.sourcePage}, Generated on: ${reportDate.toLocaleDateString()}): ${r.summary}`;
    } catch (e) {
      console.error('Error processing report for agent context:', e);
      return null; // Skip report if any error occurs during processing
    }
  })
  .filter(Boolean) // Filter out any null entries
  .join('\n')}
`
      : 'The user has not generated any reports yet.';

  const systemPrompt = `You are the AI assistant for "Smart Social Scheduler". Your name is "Smart Agent". Your purpose is to help users with their social media strategy, content ideas, and understanding their analytics data within this app. You are not a general-purpose assistant.
    
    ${reportsContext}
    
    If the user asks about a feature that doesn't exist, tell them it's part of your plans for the app and will be added soon.
    
    Respond in the same language as the user's query, which appears to be ${language}. Be concise, friendly, and helpful. Answer only the question asked.`;

  const { stream, response } = ai.generateStream({
    model: 'googleai/gemini-2.5-flash',
    system: systemPrompt,
    history: historyForGenkit,
  });

  // Transform the stream and handle the final response promise correctly.
  async function* transformStream(): AsyncGenerator<string> {
    try {
      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
      // After the stream is fully consumed, wait for the final response promise.
      // This ensures any remaining processing or error reporting is completed.
      await response;
    } catch (e) {
      console.error('Error during agent response generation:', e);
      // Propagate a user-friendly error message to the client by throwing an error.
      let message = 'An error occurred while communicating with the AI agent.';
      if (e instanceof Error) {
        message = e.message;
      } else if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
        message = (e as any).message;
      } else if (typeof e === 'string') {
        message = e;
      }
      throw new Error(message);
    }
  }

  return transformStream();
}
