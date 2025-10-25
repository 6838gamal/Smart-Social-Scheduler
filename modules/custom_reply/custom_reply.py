from telegram import InlineKeyboardButton, InlineKeyboardMarkup

# استدعاء الدوال من الصفحات الفرعية
from .view import show_reply_page
from .add import reply_add_page, handle_add_reply_messages, handle_add_reply_callbacks
from .edit import edit_reply_page

# ================================
# 📩 القائمة الرئيسية للردود التلقائية
# ================================
async def show_custom_reply(update, context):
    text = "💬 *الردود التلقائية*\nاختر الإجراء الذي تريد القيام به:"
    keyboard = [
        [InlineKeyboardButton("📩 عرض الردود الحالية", callback_data="reply_show_page")],
        [InlineKeyboardButton("➕ إضافة رد جديد", callback_data="reply_add_page")],
        [InlineKeyboardButton("✏️ تعديل رد موجود", callback_data="reply_edit_page")],
        [InlineKeyboardButton("↩️ العودة", callback_data="main_menu")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="Markdown")


# ================================
# 🧭 التحكم بالتنقل بين الصفحات والزر الديناميكي
# ================================
async def handle_custom_reply_selection(update, context):
    query = update.callback_query
    data = query.data

    # --- عرض الردود ---
    if data == "reply_show_page":
        await show_reply_page(update, context)

    # --- صفحة إضافة الرد ---
    elif data == "reply_add_page":
        await reply_add_page(update, context)

    # --- بدء إدخال الرد الجديد (زر داخل صفحة add) ---
    elif data == "start_add_reply":
        await start_add_reply(update, context)

    # --- تعديل الرد ---
    elif data == "reply_edit_page":
        await edit_reply_page(update, context)

    # --- العودة للقائمة الرئيسية ---
    elif data == "reply_back_main":
        await show_custom_reply(update, context)

    # --- العودة للصفحة الرئيسية للبوت ---
    elif data == "main_menu":
        from bot import show_main_menu
        await show_main_menu(update, context)

    else:
        await query.edit_message_text(text="🚧 هذا الخيار غير معروف.", parse_mode="Markdown")
