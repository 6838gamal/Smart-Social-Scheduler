from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from modules.inbox.all_inbox import show_all_inbox
from modules.inbox.email_inbox import show_email_inbox
from modules.inbox.telegram_inbox import show_telegram_inbox

# ===========================
# عرض القائمة الرئيسية للبريد الوارد
# ===========================
async def show_inbox(update: Update, context):
    text = "📥 *البريد الوارد*\nاختر القسم الذي تريد عرضه:"
    keyboard = [
        [InlineKeyboardButton("📋 كل الرسائل", callback_data="inbox_all")],
        [InlineKeyboardButton("✉️ رسائل البريد الإلكتروني", callback_data="inbox_email")],
        [InlineKeyboardButton("💬 رسائل التليجرام", callback_data="inbox_telegram")],
        [InlineKeyboardButton("↩️ العودة", callback_data="main_menu")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")

# ===========================
# التعامل مع أزرار البريد الوارد
# ===========================
async def handle_inbox_selection(update: Update, context):
    query = update.callback_query
    data = query.data
    await query.answer()

    if data == "inbox_all":
        await show_all_inbox(update, context)

    elif data == "inbox_email":
        await show_email_inbox(update, context)

    elif data == "inbox_telegram":
        await show_telegram_inbox(update, context)

    elif data == "show_inbox":
        await show_inbox(update, context)

    elif data == "main_menu":
        # استدعاء داخلي لتجنب circular import
        from modules.main_menu import show_main_menu
        await show_main_menu(update, context)

    else:
        # أي خيار آخر غير معروف
        await query.answer("🚧 هذا القسم في طور التحسين", show_alert=True)
