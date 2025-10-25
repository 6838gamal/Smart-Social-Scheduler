import os
import json
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ContextTypes

# --- تحميل الترجمة ---
JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "translations.json")

def load_translations():
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        return {
            "ar": {
                "settings_title": "⚙️ الإعدادات",
                "choose_option": "اختر أحد الإعدادات التالية:",
                "notifications": "الإشعارات والتنبيهات",
                "auto_replies": "الردود التلقائية",
                "language": "اللغة",
                "back": "⬅️ عودة"
            },
            "en": {
                "settings_title": "⚙️ Settings",
                "choose_option": "Choose one of the following:",
                "notifications": "Notifications & Alerts",
                "auto_replies": "Auto Replies",
                "language": "Language",
                "back": "⬅️ Back"
            }
        }

translations = load_translations()
DEFAULT_LANG = "ar"

def get_user_language(update: Update) -> str:
    # مستقبلاً يمكن تخزين اللغة في قاعدة بيانات
    return DEFAULT_LANG


# --- عرض قائمة الإعدادات ---
async def show_settings(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = get_user_language(update)
    t = translations.get(lang, translations[DEFAULT_LANG])

    text = f"{t['settings_title']}\n\n{t['choose_option']}"

    keyboard = [
        [InlineKeyboardButton(t["notifications"], callback_data="settings_notifications")],
        [InlineKeyboardButton(t["auto_replies"], callback_data="settings_auto_replies")],
        [InlineKeyboardButton(t["language"], callback_data="settings_language")],
        [InlineKeyboardButton(t["back"], callback_data="back_main")]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.message:
        # إذا كان من أمر /settings
        await update.message.reply_text(text, reply_markup=reply_markup)
    elif update.callback_query:
        # إذا كان من زر داخل البوت
        await update.callback_query.message.edit_text(text, reply_markup=reply_markup)


# --- التعامل مع اختيارات المستخدم داخل الإعدادات ---
async def handle_settings_selection(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    data = query.data

    lang = get_user_language(update)
    t = translations.get(lang, translations[DEFAULT_LANG])

    if data == "settings_notifications":
        await query.message.edit_text(f"🔔 {t['notifications']} — لم يتم تفعيلها بعد.")
    elif data == "settings_auto_replies":
        await query.message.edit_text(f"🤖 {t['auto_replies']} — لم يتم إعدادها بعد.")
    elif data == "settings_language":
        # عرض خيارات اللغة
        keyboard = [
            [InlineKeyboardButton("العربية 🇸🇦", callback_data="lang_ar")],
            [InlineKeyboardButton("English 🇬🇧", callback_data="lang_en")],
            [InlineKeyboardButton(t["back"], callback_data="settings_back")]
        ]
        await query.message.edit_text(f"{t['language']}:", reply_markup=InlineKeyboardMarkup(keyboard))
    elif data == "settings_back" or data == "back_main":
        from bot import show_main_menu
        await show_main_menu(update, context)
    elif data.startswith("lang_"):
        chosen_lang = data.split("_")[1]
        await query.answer(f"✅ Language set to {'العربية' if chosen_lang == 'ar' else 'English'}", show_alert=True)
        await show_settings(update, context)
    else:
        await query.answer("❗ خيار غير معروف", show_alert=True)
