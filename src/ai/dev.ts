import { config } from 'dotenv';
config();

import '@/ai/flows/generate-performance-reports.ts';
import '@/ai/flows/suggest-content-improvements.ts';
import '@/ai/flows/generate-email-report.ts';
import '@/ai/flows/generate-sheet-report.ts';
import '@/ai/flows/transcribe-audio.ts';
