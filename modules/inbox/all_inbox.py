from telegram import InlineKeyboardButton, InlineKeyboardMarkup

async def show_all_inbox(update, context):
    text = (
        "📋 *كل الرسائل*\n"
        "─────────────────────────\n"
        "1️⃣ رسالة من أحمد: مرحبًا، كيف حالك؟\n"
        "2️⃣ رسالة من سارة: هل يمكننا التحدث عن المشروع؟\n"
        "3️⃣ رسالة من فريق الدعم: تم حل مشكلتك."
    )

    keyboard = [[InlineKeyboardButton("↩️ العودة", callback_data="show_inbox")]]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.message:
        await update.message.reply_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")
