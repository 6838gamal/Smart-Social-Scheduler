# ================================
# 📩 EMAIL INBOX MODULE (FINAL + HTML SAFE VERSION)
# ================================

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ContextTypes
import os
import pickle
import csv
import html
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# ---------------------------
# إعدادات Google OAuth
# ---------------------------
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
TOKEN_PATH = "token_gmail.pickle"

CLIENT_CONFIG = {
    "installed": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob"]
    }
}

# ===========================
# عرض واجهة البريد الإلكتروني
# ===========================
async def show_email_inbox(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "✉️ <b>واجهة البريد الإلكتروني</b>\n"
        "───────────────\n"
        "اضغط الزر أدناه لاختيار حساب Google لعرض آخر الرسائل."
    )

    keyboard = [
        [InlineKeyboardButton("🔑 الاتصال بحساب Google", callback_data="email_connect_google")],
        [InlineKeyboardButton("↩️ العودة", callback_data="inbox_back")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup, parse_mode="HTML")
    elif update.message:
        await update.message.reply_text(text=text, reply_markup=reply_markup, parse_mode="HTML")

# ===========================
# التعامل مع الأزرار
# ===========================
async def handle_email_inbox_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    data = query.data
    await query.answer()
    print("📩 CALLBACK DATA:", data)

    if data == "email_connect_google":
        await start_google_auth(update, context)
    elif data == "inbox_back":
        from modules.inbox.inbox import show_inbox
        await show_inbox(update, context)
    else:
        await query.answer("⚠️ هذا الخيار غير معروف أو قديم.", show_alert=True)

# ===========================
# بدء عملية الاتصال بحساب Google
# ===========================
async def start_google_auth(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.edit_message_text("🔑 جاري إنشاء رابط الاتصال...")

    # إذا كان هناك توكن سابق وصالح
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, "rb") as token:
            creds = pickle.load(token)
        if creds and creds.valid:
            await query.edit_message_text("✅ تم الاتصال مسبقًا! جاري سحب آخر 10 رسائل...")
            await pull_last_10_emails(update, context, creds)
            return
        elif creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(TOKEN_PATH, "wb") as token:
                pickle.dump(creds, token)
            await query.edit_message_text("♻️ تم تحديث الاتصال بنجاح! جاري سحب الرسائل...")
            await pull_last_10_emails(update, context, creds)
            return

    # إنشاء تدفق جديد في حال عدم وجود توكن
    try:
        flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, SCOPES)
        auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline')

        # تأمين الرابط ضد مشاكل Markdown
        safe_url = html.escape(auth_url)

        text = (
            "🔗 <b>رابط الاتصال بحساب Google:</b>\n\n"
            f"<a href=\"{safe_url}\">اضغط هنا لفتح الرابط</a>\n\n"
            "بعد تسجيل الدخول:\n"
            "1️⃣ انسخ الكود الذي سيظهر لك.\n"
            "2️⃣ أرسله هنا في الدردشة.\n\n"
            "📌 ملاحظة: البيانات آمنة ولن يتم حفظ أي معلومات غير ضرورية."
        )

        context.user_data["google_flow"] = flow

        keyboard = [[InlineKeyboardButton("↩️ العودة", callback_data="inbox_back")]]
        await query.edit_message_text(text=text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="HTML", disable_web_page_preview=True)

    except Exception as e:
        await query.edit_message_text(f"❌ فشل إنشاء رابط الاتصال:\n\n{html.escape(str(e))}")

# ===========================
# استقبال الكود من المستخدم
# ===========================
async def finish_google_auth(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "google_flow" not in context.user_data:
        await update.message.reply_text("⚠️ لم تبدأ عملية الاتصال بعد، اضغط الزر أولاً.")
        return

    flow = context.user_data["google_flow"]
    code = update.message.text.strip()

    try:
        flow.fetch_token(code=code)
        creds = flow.credentials

        with open(TOKEN_PATH, "wb") as token:
            pickle.dump(creds, token)

        await update.message.reply_text("✅ تم الاتصال بنجاح! جاري سحب آخر 10 رسائل...")
        await pull_last_10_emails(update, context, creds)

    except Exception as e:
        await update.message.reply_text(f"❌ فشل الاتصال بحساب Google:\n\n{e}")

# ===========================
# سحب آخر 10 رسائل Gmail
# ===========================
async def pull_last_10_emails(update: Update, context: ContextTypes.DEFAULT_TYPE, creds):
    try:
        service = build("gmail", "v1", credentials=creds)
        results = service.users().messages().list(userId="me", maxResults=10).execute()
        messages = results.get("messages", [])

        if not messages:
            await update.message.reply_text("📭 لا توجد رسائل في البريد.")
            return

        emails = []
        for msg in messages:
            msg_data = service.users().messages().get(userId="me", id=msg["id"]).execute()
            headers = msg_data.get("payload", {}).get("headers", [])
            subject = next((h["value"] for h in headers if h["name"] == "Subject"), "بدون عنوان")
            sender = next((h["value"] for h in headers if h["name"] == "From"), "غير معروف")
            emails.append({"From": sender, "Subject": subject})

        # حفظ النتائج في ملف CSV
        with open("emails.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["From", "Subject"])
            writer.writeheader()
            writer.writerows(emails)

        text = "✅ <b>تم سحب آخر 10 رسائل:</b>\n\n"
        for i, email in enumerate(emails, start=1):
            safe_from = html.escape(email['From'])
            safe_subject = html.escape(email['Subject'])
            text += f"{i}. <b>{safe_from}</b> — {safe_subject}\n"
        text += "\n📁 تم حفظها في ملف <code>emails.csv</code>"

        await update.message.reply_text(text, parse_mode="HTML", disable_web_page_preview=True)

    except Exception as e:
        await update.message.reply_text(f"❌ حدث خطأ أثناء جلب الرسائل:\n\n{html.escape(str(e))}", parse_mode="HTML")
