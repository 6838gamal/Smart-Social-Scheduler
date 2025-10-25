import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    CallbackQueryHandler,
MessageHandler,
    ContextTypes,
filters
)

# ---------------------------
# استيراد الأقسام
# ---------------------------
from modules.dashboard.dashboard import show_dashboard
from modules.inbox.inbox import show_inbox, handle_inbox_selection
from modules.custom_reply.custom_reply import show_custom_reply, handle_custom_reply_selection
from modules.custom_reply.add import handle_add_reply_messages, handle_add_reply_callbacks, reply_add_page
from modules.add_post.add_post import show_add_post, handle_add_post_selection
from modules.settings.settings import show_settings, handle_settings_selection
from modules.events.events import show_events, handle_events_selection
from modules.ai_assistant.ai_assistant import show_ai_assistant, handle_ai_assistant_selection
from modules.inbox.email_inbox import handle_email_inbox_callback
from modules.inbox.telegram_inbox import show_telegram_inbox, handle_inbox_selection as handle_telegram_inbox_callback

# 🆕 الأقسام الجديدة
from modules.tracker.tracker import show_tracker, handle_tracker_selection
from modules.level.level import show_level, handle_level_selection
from modules.reports.reports import show_reports, handle_reports_selection

# ---------------------------
# إعدادات logging
# ---------------------------
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)

# ===========================
# القائمة الرئيسية
# ===========================
async def show_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = "🏠 *القائمة الرئيسية - Smart Social Scheduler*\nاختر القسم:"
    keyboard = [
        [InlineKeyboardButton("📊 Dashboard", callback_data="dashboard")],
        [InlineKeyboardButton("📥 Inbox", callback_data="inbox")],
        [InlineKeyboardButton("💬 الردود التلقائية", callback_data="custom_reply")],
        [InlineKeyboardButton("📰 Add Post", callback_data="add_post")],
        [InlineKeyboardButton("⚙️ Settings", callback_data="settings")],
        [InlineKeyboardButton("🗓️ Events", callback_data="events")],
        [InlineKeyboardButton("🤖 AI Assistant", callback_data="ai_assistant")],
        [InlineKeyboardButton("📈 Tracker", callback_data="tracker")],
        [InlineKeyboardButton("🎯 مستواي", callback_data="level")],
        [InlineKeyboardButton("📑 التقارير", callback_data="reports")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    try:
        if update.message:
            await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
        elif update.callback_query:
            await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")
    except Exception as e:
        logging.warning(f"تعذر تحديث القائمة الرئيسية: {e}")
        try:
            await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
        except:
            pass

# ===========================
# الأوامر الأساسية
# ===========================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await show_main_menu(update, context)

# ===========================
# CallbackQueryHandler عام
# ===========================
async def callbacks(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data

    try:
        main_mapping = {
            "dashboard": show_dashboard,
            "inbox": show_inbox,
            "custom_reply": show_custom_reply,
            "add_post": show_add_post,
            "settings": show_settings,
            "events": show_events,
            "ai_assistant": show_ai_assistant,
            "tracker": show_tracker,
            "level": show_level,
            "reports": show_reports,
            "main_menu": show_main_menu
        }

        if data in main_mapping:
            await main_mapping[data](update, context)
            return

        # الأقسام الفرعية
        if data.startswith("inbox_"):
            await handle_inbox_selection(update, context)
        elif data.startswith("reply_"):
            await handle_custom_reply_selection(update, context)
        elif data.startswith("post_"):
            await handle_add_post_selection(update, context)
        elif data.startswith("settings_"):
            await handle_settings_selection(update, context)
        elif data.startswith("events_"):
            await handle_events_selection(update, context)
        elif data.startswith("ai_"):
            await handle_ai_assistant_selection(update, context)
        elif data.startswith("tracker_"):
            await handle_tracker_selection(update, context)
        elif data.startswith("level_"):
            await handle_level_selection(update, context)
        elif data.startswith("reports_"):
            await handle_reports_selection(update, context)
        else:
            await query.edit_message_text("⚠️ هذا الخيار غير معروف أو قديم، يرجى اختيار خيار من القائمة.")
    except Exception as e:
        logging.error(f"حدث خطأ أثناء معالجة الأمر: {e}")
        try:
            await query.edit_message_text("❌ حدث خطأ أثناء معالجة هذا الخيار.")
        except:
            pass

# ===========================
# Main
# ===========================
if __name__ == "__main__":
    TOKEN = os.environ.get("SMART_SCHEDULER_TOKEN")
    if not TOKEN:
        raise ValueError("❌ لم يتم تعيين متغير البيئة SMART_SCHEDULER_TOKEN")

    app = ApplicationBuilder().token(TOKEN).build()

    # ---------- Commands ----------
    app.add_handler(CommandHandler("start", start))

    # ---------- CallbackQueryHandlers ----------
    app.add_handler(CallbackQueryHandler(handle_email_inbox_callback, pattern="^email_"))
    app.add_handler(CallbackQueryHandler(show_telegram_inbox, pattern="^telegram_"))
    app.add_handler(CallbackQueryHandler(handle_telegram_inbox_callback, pattern="^(start_telegram|back_to_main|open_chat_|next_msg|prev_msg|back_to_list)"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_add_reply_messages))
    app.add_handler(CallbackQueryHandler(handle_add_reply_callbacks, pattern="^scope_"))
#    app.add_handler(CallbackQueryHandler(handle_custom_reply_selection))



    app.add_handler(CallbackQueryHandler(callbacks))

    print("✅ Smart Social Scheduler يعمل الآن...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)
