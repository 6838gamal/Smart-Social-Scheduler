# ================================
# 📩 EMAIL INBOX MODULE (DESKTOP APP)
# ================================

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ContextTypes
import os
import pickle
import csv
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# ---------------------------
# إعدادات Google OAuth
# ---------------------------
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
TOKEN_PATH = "token_gmail.pickle"

CLIENT_CONFIG = {
    "installed": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob"],  # Desktop App flow
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
    }
}

# ===========================
# عرض واجهة البريد الإلكتروني
# ===========================
async def show_email_inbox(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "✉️ رسائل البريد الإلكتروني\n"
        "───────────────\n"
        "اضغط الزر أدناه لاختيار حساب Google للسحب من البريد."
    )

    keyboard = [
        [InlineKeyboardButton("🔑 الاتصال بحساب Google", callback_data="email_connect_google")],
        [InlineKeyboardButton("↩️ العودة", callback_data="inbox_back")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.callback_query:
        await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup)
    elif update.message:
        await update.message.reply_text(text=text, reply_markup=reply_markup)

# ===========================
# التعامل مع أزرار البريد الإلكتروني
# ===========================
async def handle_email_inbox_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    data = query.data
    await query.answer()
    print("📩 CALLBACK DATA:", repr(data))

    if data == "email_connect_google":
        await start_google_auth(update, context)
    elif data == "inbox_back":
        from modules.inbox.inbox import show_inbox
        await show_inbox(update, context)
    else:
        await query.answer("⚠️ هذا الخيار غير معروف أو قديم.", show_alert=True)

# ===========================
# بدء الاتصال بحساب Google (رابط OAuth)
# ===========================
async def start_google_auth(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if query:
        await query.edit_message_text("🔑 جاري إعداد الاتصال بحساب Google...")

    try:
        flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, SCOPES)
        auth_url, _ = flow.authorization_url(prompt='consent')

        text = (
            "🔗 لربط حساب Google مع البوت، افتح الرابط التالي في أي متصفح:\n\n"
            f"{auth_url}\n\n"
            "بعد تسجيل الدخول، انسخ الكود بالكامل وأرسله هنا."
        )

        keyboard = [[InlineKeyboardButton("↩️ العودة", callback_data="inbox_back")]]
        reply_markup = InlineKeyboardMarkup(keyboard)

        # إرسال النص بدون Markdown لتجنب مشاكل الروابط
        await query.edit_message_text(text=text, reply_markup=reply_markup)

        # حفظ flow في context لاستخدامه عند إدخال الكود
        context.user_data['google_flow'] = flow

    except Exception as e:
        if query:
            await query.edit_message_text(f"❌ فشل إعداد الاتصال بحساب Google:\n\n{e}")

# ===========================
# استلام الكود من المستخدم
# ===========================
async def finish_google_auth(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if 'google_flow' not in context.user_data:
        await update.message.reply_text("⚠️ لم يتم بدء عملية الاتصال بحساب Google، اضغط الزر أولاً.")
        return

    flow = context.user_data['google_flow']
    code = update.message.text.strip()

    try:
        flow.fetch_token(code=code)
        creds = flow.credentials

        # حفظ الاتصال
        with open(TOKEN_PATH, 'wb') as token:
            pickle.dump(creds, token)

        await update.message.reply_text("✅ تم الاتصال بحساب Google بنجاح!\nجارٍ سحب آخر 10 رسائل...")

        await pull_last_10_emails(update, context, creds)

    except Exception as e:
        await update.message.reply_text(f"❌ فشل الاتصال بحساب Google:\n\n{e}")

# ===========================
# سحب آخر 10 رسائل Gmail
# ===========================
async def pull_last_10_emails(update: Update, context: ContextTypes.DEFAULT_TYPE, creds):
    try:
        service = build('gmail', 'v1', credentials=creds)
        results = service.users().messages().list(userId='me', maxResults=10).execute()
        messages = results.get('messages', [])

        if not messages:
            if update.callback_query:
                await update.callback_query.edit_message_text("📭 لا توجد رسائل في البريد.")
            else:
                await update.message.reply_text("📭 لا توجد رسائل في البريد.")
            return

        emails = []
        for msg in messages:
            msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
            headers = msg_data.get('payload', {}).get('headers', [])
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'بدون عنوان')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'غير معروف')
            emails.append({'From': sender, 'Subject': subject})

        # حفظ في CSV
        with open("emails.csv", "w", newline='', encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["From", "Subject"])
            writer.writeheader()
            writer.writerows(emails)

        # عرض النتائج
        text = "✅ تم سحب آخر 10 رسائل:\n\n"
        for i, email in enumerate(emails, start=1):
            text += f"{i}. {email['From']} — {email['Subject']}\n"
        text += "\n📁 تم حفظها أيضًا في ملف emails.csv"

        keyboard = [[InlineKeyboardButton("↩️ العودة", callback_data="inbox_back")]]
        reply_markup = InlineKeyboardMarkup(keyboard)

        if update.callback_query:
            await update.callback_query.edit_message_text(text=text, reply_markup=reply_markup)
        else:
            await update.message.reply_text(text=text, reply_markup=reply_markup)

    except Exception as e:
        if update.callback_query:
            await update.callback_query.edit_message_text(f"❌ حدث خطأ أثناء جلب الرسائل:\n\n{e}")
        else:
            await update.message.reply_text(f"❌ حدث خطأ أثناء جلب الرسائل:\n\n{e}")
