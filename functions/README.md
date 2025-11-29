# Backend Functions for Smart Social Scheduler

This directory contains the Cloud Functions that power the backend logic for the application, including integrations with third-party services like Google and Telegram.

## Environment Configuration

These functions require certain secret keys and credentials to be set up as environment variables. You should create a `.env` file in the **root directory** of your Next.js project.

### Required Variables

- `GOOGLE_CLIENT_ID`: Your OAuth 2.0 Client ID from the Google Cloud Console.
- `GOOGLE_CLIENT_SECRET`: Your OAuth 2.0 Client Secret.
- `API_ID`: Your Telegram API ID from my.telegram.org.
- `API_HASH`: Your Telegram API Hash from my.telegram.org.

**Important:** The `.env` file contains sensitive information and should **never** be committed to version control (e.g., Git). A `.gitignore` file is included to prevent this automatically.
