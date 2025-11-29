
import { Api } from 'telegram';
import { StringSession } from 'telegram/sessions';

// This function creates and returns a new Telegram client and session.
// We create a new one for each login attempt to ensure a clean state.
export function getTelegramClient(sessionKey: string = ''): { client: Api.Client, session: StringSession } {
    const apiId = parseInt(process.env.API_ID || "0", 10);
    const apiHash = process.env.API_HASH || "";

    if (!apiId || !apiHash) {
        throw new Error("Telegram API ID and Hash must be set in environment variables.");
    }

    const stringSession = new StringSession(sessionKey);

    const client = new Api.Client(stringSession, apiId, apiHash, {
        connectionRetries: 5,
        // Using a longer timeout can help in serverless environments
        requestTimeout: 10000, 
    });

    return { client, session: stringSession };
}
