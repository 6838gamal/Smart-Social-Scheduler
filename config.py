# config.py
import os

BOT_TOKEN = os.getenv("BOT_TOKEN", "8402278212:AAFmTWzAtrvF9SOy9sdwduz1LmNrT_oqHmo")
PROJECT_NAME = "Smart Social Scheduler"

MESSAGES = {
    "welcome": (
        "👋 مرحباً بك في *Smart Social Scheduler!*\n\n"
        "نظام ذكي لإدارة محتواك وجدولة منشوراتك ومتابعة أداءك.\n\n"
        "اختر من القائمة أدناه القسم الذي ترغب بفتحه 👇"
    ),
    "back": "⬅️ رجوع إلى القائمة السابقة",
    "not_ready": "🚧 هذا القسم في طور التحسين لاحقًا.",
}
