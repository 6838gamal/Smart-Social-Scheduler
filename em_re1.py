import os
import pickle
import base64
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from datetime import datetime

# نطاق القراءة فقط
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# بيانات Google Cloud الخاصة بك
CLIENT_ID = "1015270124270-a8v1ujjtq41e82vjj4l3tli5e949ftkl.apps.googleusercontent.com"
CLIENT_SECRET = "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"

def get_gmail_service():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            client_config = {
                "installed": {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["http://localhost:8080/"]
                }
            }
            flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            creds = flow.run_local_server(port=8080)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    return build('gmail', 'v1', credentials=creds)


def list_emails(max_results=10, save_to_file=True):
    service = get_gmail_service()
    results = service.users().messages().list(userId='me', maxResults=max_results).execute()
    messages = results.get('messages', [])

    if not messages:
        print('📭 لا توجد رسائل.')
        return

    all_data = []

    print(f"\n📬 آخر {max_results} رسائل من Gmail:\n" + "-"*50)

    for i, msg in enumerate(messages, 1):
        msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
        headers = msg_data['payload'].get('headers', [])
        frm = next((h['value'] for h in headers if h['name'] == 'From'), "غير معروف")
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "(بدون عنوان)")
        date = next((h['value'] for h in headers if h['name'] == 'Date'), "غير معروف")
        snippet = msg_data.get('snippet', '')

        print(f"\n✉️ الرسالة رقم {i}:")
        print(f"المرسل: {frm}")
        print(f"العنوان: {subject}")
        print(f"التاريخ: {date}")
        print(f"المحتوى المختصر: {snippet[:120]}...")

        all_data.append({
            "index": i,
            "from": frm,
            "subject": subject,
            "date": date,
            "snippet": snippet
        })

    if save_to_file:
        save_emails(all_data)


def save_emails(messages):
    """يحفظ الرسائل في ملف نصي منسق."""
    file_name = f"gmail_inbox_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(file_name, "w", encoding="utf-8") as f:
        for msg in messages:
            f.write(f"--- الرسالة رقم {msg['index']} ---\n")
            f.write(f"المرسل: {msg['from']}\n")
            f.write(f"العنوان: {msg['subject']}\n")
            f.write(f"التاريخ: {msg['date']}\n")
            f.write(f"النص المختصر: {msg['snippet']}\n")
            f.write("\n\n")
    print(f"\n✅ تم حفظ الرسائل في الملف: {file_name}\n")


if __name__ == "__main__":
    list_emails(max_results=10)
