from telegram import InlineKeyboardButton, InlineKeyboardMarkup

# --- عرض قائمة إضافة منشور ---
async def show_add_post(update, context):
    text = "📰 *نشر منشور جديد*\nاختر نوع المنشور الذي تريد إضافته:"
    keyboard = [
        [InlineKeyboardButton("📝 نص فقط", callback_data="post_text")],
        [InlineKeyboardButton("📸 صورة مع نص", callback_data="post_image")],
        [InlineKeyboardButton("🎥 فيديو مع نص", callback_data="post_video")],
        [InlineKeyboardButton("↩️ العودة", callback_data="main_menu")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")


# --- التعامل مع الخيارات الفرعية لإضافة منشور ---
async def handle_add_post_selection(update, context):
    query = update.callback_query
    data = query.data

    if data == "post_text":
        text = "📝 *إضافة منشور نصي*\nاكتب النص الذي تريد نشره (ميزة افتراضية حالياً)."
    elif data == "post_image":
        text = "📸 *إضافة منشور بصورة*\nارفق الصورة والنص (ميزة افتراضية حالياً)."
    elif data == "post_video":
        text = "🎥 *إضافة منشور فيديو*\nارفق الفيديو والنص (ميزة افتراضية حالياً)."
    elif data == "main_menu":
        from bot import show_main_menu
        await show_main_menu(update, context)
        return
    else:
        text = "🚧 هذا الخيار في طور التحسين"

    await query.edit_message_text(text=text, parse_mode="Markdown")
