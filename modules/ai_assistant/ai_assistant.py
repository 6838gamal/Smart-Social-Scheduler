from telegram import InlineKeyboardButton, InlineKeyboardMarkup

# --- عرض قائمة المساعد الذكي ---
async def show_ai_assistant(update, context):
    text = "🤖 *المساعد الذكي*\nاختر الخدمة التي تريد استخدامها:"
    keyboard = [
        [InlineKeyboardButton("💡 اقتراح أفكار", callback_data="ai_ideas")],
        [InlineKeyboardButton("✍️ كتابة محتوى", callback_data="ai_write")],
        [InlineKeyboardButton("📊 تحليل بيانات", callback_data="ai_analyze")],
        [InlineKeyboardButton("↩️ العودة", callback_data="main_menu")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")


# --- التعامل مع الخيارات الفرعية للمساعد الذكي ---
async def handle_ai_assistant_selection(update, context):
    query = update.callback_query
    data = query.data

    if data == "ai_ideas":
        text = (
            "💡 *اقتراح أفكار*\n"
            "يمكنك طلب اقتراح أفكار لمشاريع، محتوى، أو حلول لمشاكل معينة.\n"
            "_مثال: اعطني 5 أفكار لمشروع رقمي._"
        )
    elif data == "ai_write":
        text = (
            "✍️ *كتابة محتوى*\n"
            "يمكنك طلب كتابة نصوص، مقالات، منشورات أو رسائل جاهزة.\n"
            "_مثال: اكتب منشور تحفيزي حول إدارة الوقت._"
        )
    elif data == "ai_analyze":
        text = (
            "📊 *تحليل بيانات*\n"
            "يمكنك إدخال بيانات لتلقي تحليل أو ملخص افتراضي.\n"
            "_مثال: حلل أداء آخر منشورات الأسبوع._"
        )
    elif data == "main_menu":
        from bot import show_main_menu
        await show_main_menu(update, context)
        return
    else:
        text = "🚧 هذا الخيار في طور التحسين"

    await query.edit_message_text(text=text, parse_mode="Markdown")
