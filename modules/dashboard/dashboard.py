from telegram import InlineKeyboardButton, InlineKeyboardMarkup

# --- عرض لوحة الداشبورد ---
async def show_dashboard(update, context):
    text = "📊 مرحباً بك في لوحة التحكم!\nاختر نوع الإحصائيات التي تريد عرضها:"
    keyboard = [
        [InlineKeyboardButton("📊 إحصائيات عامة", callback_data="stats_general")],
        [InlineKeyboardButton("📅 النشاط الأسبوعي", callback_data="stats_weekly")],
        [InlineKeyboardButton("🚀 الأداء الأخير", callback_data="stats_recent")],
        [InlineKeyboardButton("↩️ العودة", callback_data="main_menu")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # دعم كلا الحالتين: رسالة جديدة أو زر
    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup)
    elif update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup)

# --- التعامل مع الأزرار الفرعية للداشبورد ---
async def handle_dashboard_selection(update, context):
    query = update.callback_query
    data = query.data

    if data == "stats_general":
        text = (
            "📊 *الإحصائيات العامة*\n"
            "─────────────────────────\n"
            "👥 عدد المستخدمين: 1,245\n"
            "🗓️ المنشورات المجدولة: 328\n"
            "💬 الردود التلقائية: 58\n"
            "⏰ آخر تحديث: اليوم"
        )
    elif data == "stats_weekly":
        text = (
            "📅 *النشاط الأسبوعي*\n"
            "─────────────────────────\n"
            "السبت: 12 منشور\n"
            "الأحد: 8 منشورات\n"
            "الإثنين: 14 منشور\n"
            "الثلاثاء: 6 منشورات\n"
            "الأربعاء: 10 منشورات\n"
            "الخميس: 7 منشورات\n"
            "الجمعة: 5 منشورات"
        )
    elif data == "stats_recent":
        text = (
            "🚀 *أداء آخر أسبوع*\n"
            "─────────────────────────\n"
            "📈 معدل التفاعل: +14%\n"
            "💡 أفضل منشور: 'نصائح لإدارة الوقت'\n"
            "⭐ متوسط الإعجابات: 230\n"
            "💬 متوسط التعليقات: 45"
        )
    elif data == "go_back_main" or data == "main_menu":
        from bot import show_main_menu
        await show_main_menu(update, context)
        return
    else:
        text = "🚧 هذا القسم في طور التحسين"

    # تحديث الرسالة في حال كان الضغط من زر
    await query.edit_message_text(text=text, parse_mode="Markdown")
