import json
import os
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ContextTypes

# ملف JSON لتخزين الردود
DATA_FILE = "modules/custom_reply/custom_replies.json"

# إنشاء الملف إذا لم يكن موجودًا
os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False, indent=2)


# ====== الصفحة الأولى ======
async def reply_add_page(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """عرض صفحة البداية لإضافة رد"""
    query = update.callback_query
    await query.edit_message_text("📝 أرسل الكلمة المفتاحية التي تريد الرد عليها:")
    context.user_data["state"] = "await_keyword"


# ====== استقبال الرسائل ======
async def handle_add_reply_messages(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """التعامل مع الرسائل أثناء الإضافة"""
    text = update.message.text.strip()
    state = context.user_data.get("state")

    # الخطوة 1: الكلمة المفتاحية
    if state == "await_keyword":
        context.user_data["keyword"] = text
        context.user_data["state"] = "await_response"
        await update.message.reply_text("💬 أرسل الآن الرد الذي تريد أن يرسله البوت:")
        return

    # الخطوة 2: الرد
    elif state == "await_response":
        context.user_data["response"] = text
        context.user_data["state"] = "await_scope"

        keyboard = [
            [
                InlineKeyboardButton("👥 المجموعات", callback_data="scope_group"),
                InlineKeyboardButton("👤 الدردشات الخاصة", callback_data="scope_private"),
            ]
        ]
        await update.message.reply_text(
            "🌍 اختر مكان تفعيل الرد:",
            reply_markup=InlineKeyboardMarkup(keyboard),
        )
        return


# ====== استقبال نوع النطاق ======
async def handle_add_reply_callbacks(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """التعامل مع ضغط الأزرار أثناء الإضافة"""
    query = update.callback_query
    data = query.data

    if data in ["scope_group", "scope_private"]:
        scope = "group" if data == "scope_group" else "private"
        context.user_data["scope"] = scope

        # حفظ الرد مباشرة
        await save_reply(query, context)

    elif data == "reply_manage_home":
        # العودة إلى صفحة إدارة الردود
        from .custom_reply import show_custom_reply
        await show_custom_reply(update, context)

    else:
        await query.answer("🚧 خيار غير معروف")


# ====== حفظ الرد ======
async def save_reply(query, context):
    """حفظ الرد في ملف JSON"""
    keyword = context.user_data.get("keyword")
    response = context.user_data.get("response")
    scope = context.user_data.get("scope")

    if not (keyword and response and scope):
        await query.edit_message_text("⚠️ البيانات غير مكتملة، أعد المحاولة.")
        return

    # تحميل البيانات الحالية
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        replies = json.load(f)

    replies.append({
        "keyword": keyword,
        "response": response,
        "scope": scope
    })

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(replies, f, ensure_ascii=False, indent=2)

    await query.edit_message_text(
        f"✅ تم حفظ الرد بنجاح!\n\n📄 عدد الردود الآن: {len(replies)}",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("↩️ العودة", callback_data="reply_manage_home")]
        ])
    )
    context.user_data.clear()
