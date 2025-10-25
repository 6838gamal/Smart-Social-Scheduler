from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ContextTypes

async def show_level(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = "🎯 *مستواي الشخصي*\nهنا يمكنك معرفة تقدمك العام بناءً على نشاطاتك داخل النظام."
    keyboard = [
        [InlineKeyboardButton("📈 عرض المستوى", callback_data="level_view")],
        [InlineKeyboardButton("🏆 كيف أرفع مستواي؟", callback_data="level_tips")],
        [InlineKeyboardButton("↩️ العودة", callback_data="main_menu")]
    ]
    markup = InlineKeyboardMarkup(keyboard)

    if update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=markup, parse_mode="Markdown")
    else:
        await update.message.reply_text(text, reply_markup=markup, parse_mode="Markdown")

async def handle_level_selection(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    data = query.data

    if data == "level_view":
        await query.edit_message_text("📊 مستواك الحالي: المستوى 3 (Intermediate)")
    elif data == "level_tips":
        await query.edit_message_text("💡 يمكنك رفع مستواك عبر استخدام أقسام التتبع يوميًا!")
    else:
        await query.edit_message_text("⚠️ خيار غير معروف في المستويات.")
