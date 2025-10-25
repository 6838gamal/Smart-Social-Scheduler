from telegram import InlineKeyboardButton, InlineKeyboardMarkup

# --- عرض قائمة الفعاليات والملاحظات المهمة ---
async def show_events(update, context):
    text = "🗓️ *الفعاليات والملاحظات المهمة*\nاختر ما تريد عرضه:"
    keyboard = [
        [InlineKeyboardButton("📌 أهم الملاحظات", callback_data="events_notes")],
        [InlineKeyboardButton("🎯 الفعاليات القادمة", callback_data="events_upcoming")],
        [InlineKeyboardButton("↩️ العودة", callback_data="main_menu")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")


# --- التعامل مع الخيارات الفرعية للفعاليات ---
async def handle_events_selection(update, context):
    query = update.callback_query
    data = query.data

    if data == "events_notes":
        text = (
            "📌 *أهم الملاحظات*\n"
            "─────────────────────────\n"
            "1️⃣ تذكير بمراجعة الردود التلقائية يومياً.\n"
            "2️⃣ فحص النشر المجدول قبل الساعة 8 صباحاً.\n"
            "3️⃣ متابعة أداء المنشورات الأسبوعية."
        )
    elif data == "events_upcoming":
        text = (
            "🎯 *الفعاليات القادمة*\n"
            "─────────────────────────\n"
            "1️⃣ ورشة عمل: إدارة الوقت - 25 أكتوبر\n"
            "2️⃣ بث مباشر: نصائح للنشر الرقمي - 28 أكتوبر\n"
            "3️⃣ تحديث النظام الجديد - 30 أكتوبر"
        )
    elif data == "main_menu":
        from bot import show_main_menu
        await show_main_menu(update, context)
        return
    else:
        text = "🚧 هذا الخيار في طور التحسين"

    await query.edit_message_text(text=text, parse_mode="Markdown")
