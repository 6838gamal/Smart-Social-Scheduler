# telegram_inbox_module.py
# =========================================
# Telegram Inbox Module
# - يسحب آخر 10 رسائل فقط من كل دردشة
# - تسجيل دخول Telethon تفاعلي عند الحاجة
# - حفظ النتائج في JSON
# =========================================

import os
import json
import asyncio
import logging
from typing import List, Dict, Any
from telethon import TelegramClient, errors
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

# ---------- logging ----------
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger("telegram_inbox_module")

# ---------- Telethon config ----------
API_ID = int(os.getenv("API_ID", 0))
API_HASH = os.getenv("API_HASH", "")
SESSION_NAME = os.getenv("SESSION_NAME", "telegram_inbox_session")
DATA_FILE = os.getenv("DATA_FILE", "telegram_inbox.json")

# ---------- Telethon client ----------
client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

# ---------- persistent store ----------
if os.path.exists(DATA_FILE):
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            user_inboxes = json.load(f)
    except Exception:
        user_inboxes = {}
else:
    user_inboxes = {}

def save_data():
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(user_inboxes, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.exception("Failed to save data: %s", e)

# ---------- interactive Telethon sign-in ----------
async def ensure_telethon_authorized() -> bool:
    try:
        if not client.is_connected():
            await client.connect()

        if await client.is_user_authorized():
            return True

        print("\n[Telethon] تسجيل الدخول لأول مرة...")
        phone = input("📱 أدخل رقم هاتفك (مثلاً +9677...): ").strip()
        await client.send_code_request(phone)
        code = input("🔢 أدخل الكود الذي وصلك على التليجرام: ").strip()

        try:
            await client.sign_in(phone, code)
        except errors.SessionPasswordNeededError:
            pwd = input("🔒 الحساب محمي بكلمة مرور، أدخلها: ").strip()
            await client.sign_in(password=pwd)

        return await client.is_user_authorized()

    except Exception as e:
        logger.exception("Authorization failed: %s", e)
        return False

# ---------- show inbox button ----------
async def show_telegram_inbox(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("▶️ سحب آخر 10 رسائل من كل دردشة", callback_data="start_telegram")],
        [InlineKeyboardButton("🔙 رجوع", callback_data="back_to_main")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    text = "💬 اضغط الزر أدناه لسحب آخر 10 رسائل فقط من كل دردشة"

    if update.message:
        await update.message.reply_text(text=text, reply_markup=reply_markup)
    elif update.callback_query:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup)

# ---------- main handler ----------
async def handle_inbox_selection(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if not query:
        return

    data = query.data

    if data == "start_telegram":
        await query.edit_message_text("⏳ جاري سحب آخر 10 رسائل من كل دردشة...")
        await fetch_all_dialogs(update, context)

    elif data.startswith("open_chat_"):
        chat_id = int(data.split("_")[-1])
        await open_chat(update, context, chat_id)

    elif data == "next_msg":
        await navigate_messages(update, context, "next")

    elif data == "prev_msg":
        await navigate_messages(update, context, "prev")

    elif data == "back_to_list":
        await show_dialog_list(update, context)

    else:
        await query.answer("❌ الخيار غير معروف", show_alert=True)

# ---------- fetch dialogs (limit 10 messages) ----------
async def fetch_all_dialogs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        ok = await ensure_telethon_authorized()
        if not ok:
            await update.callback_query.edit_message_text("❌ لم يتم تسجيل الدخول إلى Telethon.")
            return

        dialogs = await client.get_dialogs(limit=None)
        user_key = str(update.effective_user.id)
        user_store: Dict[str, Any] = {"dialogs": [], "messages": {}}

        for d in dialogs:
            d_id = d.id
            d_name = d.name or getattr(d.entity, "username", "") or "بدون اسم"
            d_type = "user" if d.is_user else "group" if d.is_group else "channel"

            messages_list: List[Dict[str, Any]] = []
            async for msg in client.iter_messages(d_id, limit=10):
                messages_list.append({
                    "id": msg.id,
                    "date": msg.date.isoformat() if msg.date else None,
                    "text": msg.text or "[بدون نص]"
                })

            user_store["dialogs"].append({
                "id": d_id,
                "name": d_name,
                "type": d_type,
                "total_messages_fetched": len(messages_list)
            })
            user_store["messages"][str(d_id)] = messages_list

        user_inboxes[user_key] = user_store
        save_data()

        await update.callback_query.edit_message_text("✅ تم سحب آخر 10 رسائل من كل دردشة.\n📂 جارٍ عرض القائمة...")
        context.user_data["dialogs"] = dialogs

        await show_dialog_list(update, context)

    except Exception as e:
        logger.exception("Error in fetch_all_dialogs: %s", e)
        await update.callback_query.edit_message_text("❌ حدث خطأ أثناء السحب.")
    finally:
        if client.is_connected():
            await client.disconnect()

# ---------- show chat list ----------
async def show_dialog_list(update: Update, context: ContextTypes.DEFAULT_TYPE):
    dialogs = context.user_data.get("dialogs", [])
    keyboard = []
    for d in dialogs:
        name = d.name or "بدون اسم"
        if len(name) > 30:
            name = name[:27] + "..."
        t = "👤" if d.is_user else "👥" if d.is_group else "📢"
        keyboard.append([InlineKeyboardButton(f"{t} {name}", callback_data=f"open_chat_{d.id}")])

    keyboard.append([InlineKeyboardButton("🔙 رجوع", callback_data="back_to_main")])
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.callback_query:
        await update.callback_query.edit_message_text("💬 قائمة الدردشات:", reply_markup=reply_markup)
    elif update.message:
        await update.message.reply_text("💬 قائمة الدردشات:", reply_markup=reply_markup)

# ---------- open a specific chat ----------
async def open_chat(update: Update, context: ContextTypes.DEFAULT_TYPE, chat_id: int):
    user_key = str(update.effective_user.id)
    messages = user_inboxes.get(user_key, {}).get("messages", {}).get(str(chat_id), [])

    if not messages:
        await update.callback_query.answer("لا توجد رسائل.", show_alert=True)
        return

    context.user_data["messages"] = messages
    context.user_data["msg_index"] = 0
    await display_message(update, context, messages[0])

# ---------- display message ----------
async def display_message(update: Update, context: ContextTypes.DEFAULT_TYPE, msg):
    index = context.user_data.get("msg_index", 0)
    messages = context.user_data.get("messages", [])
    total = len(messages)

    text = f"🕓 {msg.get('date', '[بدون تاريخ]')}\n\n{msg.get('text', '[بدون نص]')}"
    buttons = []

    if index > 0:
        buttons.append(InlineKeyboardButton("⬅️ السابق", callback_data="prev_msg"))
    if index < total - 1:
        buttons.append(InlineKeyboardButton("التالي ➡️", callback_data="next_msg"))
    buttons.append(InlineKeyboardButton("🔙 رجوع", callback_data="back_to_list"))

    reply_markup = InlineKeyboardMarkup([buttons])

    if update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup)
    elif update.message:
        await update.message.reply_text(text=text, reply_markup=reply_markup)

# ---------- navigate between messages ----------
async def navigate_messages(update: Update, context: ContextTypes.DEFAULT_TYPE, direction: str):
    index = context.user_data.get("msg_index", 0)
    messages = context.user_data.get("messages", [])
    if not messages:
        await update.callback_query.answer("لا توجد رسائل.", show_alert=True)
        return

    if direction == "next" and index < len(messages) - 1:
        context.user_data["msg_index"] += 1
    elif direction == "prev" and index > 0:
        context.user_data["msg_index"] -= 1

    await display_message(update, context, messages[context.user_data["msg_index"]])

# =========================================
# نهاية الملف
# =========================================
