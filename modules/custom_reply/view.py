from telegram import InlineKeyboardButton, InlineKeyboardMarkup

async def show_reply_page(update, context):
    text = (
        "📋 *الردود الحالية:*\n"
        "─────────────────────────\n"
        "1️⃣ مرحبًا! كيف يمكنني مساعدتك اليوم؟\n"
        "2️⃣ شكرًا لتواصلك معنا، سنرد عليك قريبًا.\n"
        "3️⃣ تم تسجيل طلبك وسيتم معالجته."
    )
    keyboard = [
        [InlineKeyboardButton("↩️ العودة", callback_data="reply_back_main")]
    ]
    await update.callback_query.edit_message_text(
        text=text,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )
