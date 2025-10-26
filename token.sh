#!/usr/bin/env bash
# smart_shell_bot_autosetup.sh
# سكربت تهيئة تلقائي شامل لبوت تلغرام وGoogle OAuth
# يقوم بكل الخطوات دون تدخل المستخدم
# استخدام: chmod +x smart_shell_bot_autosetup.sh && ./smart_shell_bot_autosetup.sh

set -euo pipefail
IFS=$'\n\t'

ENV_FILE="$HOME/.smart_bot_env"
BASHRC="$HOME/.bashrc"
BACKUP_BASHRC="$HOME/.bashrc.smart_bot_backup"

# القيم الافتراضية (يتم استبدالها حسب الحاجة)
BOT_TOKEN="8402278212:AAFmTWzAtrvF9SOy9sdwduz1LmNrT_oqHmo"
GOOGLE_CLIENT_ID="1015270124270-fg53ehvs093roual651kppfq5rpmm56t.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
API_ID="20200731"
API_HASH="debec87745352ef7c5fdcae9622930a1"
ADMIN_CHAT_ID=""

# إنشاء ملف البيئة
mkdir -p "$HOME"
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"
cat > "$ENV_FILE" <<EOF
# ملف متغيرات البيئة الخاص ببوت Smart Shell
BOT_TOKEN="$BOT_TOKEN"
GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
API_ID="$API_ID"
API_HASH="$API_HASH"
ADMIN_CHAT_ID="$ADMIN_CHAT_ID"
EOF

# نسخ احتياطي للباش أر سي
if [ -f "$BASHRC" ]; then
  cp "$BASHRC" "$BACKUP_BASHRC"
fi

# إضافة تحميل الملف للباش أر سي إن لم يكن موجودًا
MARKER="# >>> smart_shell_bot_env >>>"
if ! grep -q "$MARKER" "$BASHRC" 2>/dev/null; then
  cat >> "$BASHRC" <<EOF

$MARKER
# تحميل متغيرات البيئة الخاصة ببوت Smart Shell
if [ -f \"$ENV_FILE\" ]; then
  set -a
  source \"$ENV_FILE\"
  set +a
fi
# <<< smart_shell_bot_env <<<
EOF
fi

# تحميل المتغيرات فورًا
set -a
source "$ENV_FILE"
set +a

# عرض النتائج
clear
echo "=================================="
echo "✅ تم إعداد البيئة بنجاح!"
echo "📦 ملف البيئة: $ENV_FILE"
echo "🔐 تم تأمين الملف بصلاحيات 600"
echo "🧩 تم تحديث ~/.bashrc واستدعاء المتغيرات"
echo "=================================="
echo

# اختبار سريع للقيم
if [[ -n "$BOT_TOKEN" && -n "$API_ID" && -n "$API_HASH" ]]; then
  echo "✅ التحقق من القيم تم بنجاح. يمكنك الآن تشغيل البوت."
else
  echo "⚠️ لم يتم العثور على بعض المتغيرات، تحقق من $ENV_FILE"
fi

echo
read -p "هل ترغب بتشغيل البوت الآن؟ (y/N): " run_now
if [[ "$run_now" =~ ^[Yy]$ ]]; then
  if [ -f "bot.py" ]; then
    echo "🚀 جاري تشغيل البوت..."
    python3 bot.py
  else
    echo "❌ لم يتم العثور على ملف bot.py في المجلد الحالي."
  fi
else
  echo "تم إنهاء الإعداد. يمكنك تشغيل البوت يدويًا بالأمر:"
  echo "python3 bot.py"
fi
