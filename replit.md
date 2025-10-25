# Smart Social Scheduler - Telegram Bot

## Overview
Smart Social Scheduler is a Telegram bot application for managing social media content, scheduling posts, tracking performance, and handling messages. The bot provides features for dashboard analytics, inbox management (Email & Telegram), custom auto-replies, post scheduling, events, AI assistant, tracker, level system, and reports.

## Project Type
- **Type**: Python Telegram Bot (console application)
- **Framework**: python-telegram-bot (v20+)
- **Language**: Python 3.11

## Recent Changes (October 25, 2025)
- Imported from GitHub and configured for Replit environment
- Removed hardcoded API keys from `bot.sh` and `config.py` for security
- Created `requirements.txt` with all dependencies
- Created `.gitignore` for Python project
- Configured workflow to run the bot
- All required secrets added to Replit Secrets

## Required Environment Variables
The following secrets must be set in Replit Secrets (Tools → Secrets):

1. **SMART_SCHEDULER_TOKEN** - Telegram Bot token from @BotFather
2. **API_ID** - Telegram API ID from my.telegram.org
3. **API_HASH** - Telegram API Hash from my.telegram.org
4. **GOOGLE_CLIENT_ID** - Google OAuth client ID for Gmail integration
5. **GOOGLE_CLIENT_SECRET** - Google OAuth client secret

## Project Structure
```
.
├── bot.py                    # Main bot entry point
├── config.py                 # Configuration and messages
├── requirements.txt          # Python dependencies
├── modules/                  # Bot modules
│   ├── dashboard/           # Dashboard analytics
│   ├── inbox/               # Email & Telegram inbox management
│   ├── custom_reply/        # Auto-reply system
│   ├── add_post/            # Post scheduling
│   ├── settings/            # Bot settings
│   ├── events/              # Events management
│   ├── ai_assistant/        # AI assistant features
│   ├── tracker/             # Performance tracking
│   ├── level/               # User level system
│   └── reports/             # Reporting features
└── translations.json         # Multi-language support
```

## Dependencies
- **python-telegram-bot** (>=20.0) - Telegram bot framework
- **google-api-python-client** - Gmail API integration
- **google-auth-oauthlib** - Google OAuth authentication
- **telethon** - Telegram client for inbox functionality

## Running the Bot
The bot runs automatically via the configured workflow:
- **Command**: `python bot.py`
- **Status**: Bot runs continuously in console mode
- The bot connects to Telegram and waits for commands

## Main Features
1. **Dashboard** (📊) - Analytics and statistics overview
2. **Inbox** (📥) - Email and Telegram message management
3. **Custom Replies** (💬) - Automated response system
4. **Add Post** (📰) - Schedule social media posts
5. **Settings** (⚙️) - Bot configuration
6. **Events** (🗓️) - Event management
7. **AI Assistant** (🤖) - AI-powered assistance
8. **Tracker** (📈) - Performance tracking
9. **Level System** (🎯) - User progression
10. **Reports** (📑) - Detailed reports

## User Preferences
- Language: Arabic (العربية) is the primary language
- Session files (.session) are gitignored for security

## Notes
- The bot uses Telethon for advanced Telegram client features
- Gmail integration requires Google OAuth flow
- Session files are created for Telegram authentication
- All sensitive data is stored in Replit Secrets, not in code
