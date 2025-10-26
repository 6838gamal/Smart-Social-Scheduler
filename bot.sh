#!/usr/bin/env bash
# smart_shell_bot_setup.sh
# سكربت تهيئة آمن لبوت تلغرام وGoogle OAuth
# يُنشئ ملف .env مؤمن ويضيف سطرًا لاستدعائه من ~/.bashrc (اختياري)
# استخدام: chmod +x smart_shell_bot_setup.sh && ./smart_shell_bot_setup.sh

set -euo pipefail
IFS=$'\n\t'

ENV_FILE="$HOME/.smart_bot_env"
BASHRC="$HOME/.bashrc"
BACKUP_BASHRC="$HOME/.bashrc.smart_bot_backup"

prompt_secret() {
  local var_name="$1"
  local current
  current="$(grep -E "^${var_name}=" "$ENV_FILE" 2>/dev/null || true)"
  if [[ -n "$current" ]]; then
    echo "موجود: متغير $var_name موجود في $ENV_FILE. هل تريد استبداله؟ [y/N]"
    read -r ans
    if [[ ! "$ans" =~ ^[Yy] ]]; then
      echo "تخطي $var_name"
      return
    fi
  fi
  echo -n "أدخل قيمة $var_name (لن تظهر على الشاشة): "
  read -rs value
  echo
  # Escape any existing double quotes and backslashes
  escaped_value="${value//\\/\\\\}"
  escaped_value="${escaped_value//\"/\\\"}"
  # Remove existing line and append
  sed -i.bak "/^${var_name}=/d" "$ENV_FILE" 2>/dev/null || true
  printf "%s=\"%s\"\n" "$var_name" "$escaped_value" >> "$ENV_FILE"
  echo "✅ تم حفظ $var_name في $ENV_FILE"
}

ensure_env_file() {
  if [[ ! -f "$ENV_FILE" ]]; then
    touch "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    echo "# ملف متغيرات البيئة لبوتات Smart Shell" > "$ENV_FILE"
    echo "# لا تشارك هذا الملف مع أي شخص" >> "$ENV_FILE"
    echo "✅ تم إنشاء $ENV_FILE وحمايته بصلاحيات 600"
  else
    chmod 600 "$ENV_FILE" || true
    echo "ℹ️ يوجد $ENV_FILE — تم ضبط الصلاحيات على 600"
  fi
}

add_source_to_bashrc() {
  local marker="# >>> smart_shell_bot_env >>>"
  if grep -q "$marker" "$BASHRC" 2>/dev/null; then
    echo "ℹ️ يبدو أن $BASHRC يحتوي بالفعل على سطر تحميل متغيرات Smart Shell"
    return
  fi
  cp "$BASHRC" "$BACKUP_BASHRC"
  cat >> "$BASHRC" <<EOF

$marker
# تحميل متغيرات البيئة الخاصة ببوت Smart Shell
if [ -f \"$ENV_FILE\" ]; then
  # تصدير ما ورد في الملف (سطر بصيغة VAR="value")
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi
# <<< smart_shell_bot_env <<<
EOF
  echo "✅ تمت إضافة استدعاء $ENV_FILE إلى $BASHRC (نسخة احتياطية: $BACKUP_BASHRC)"
}

print_summary() {
  echo
  echo "============================"
  echo "ملف الإعداد: $ENV_FILE"
  echo "صلاحيات الملف: $(stat -c '%a' "$ENV_FILE" 2>/dev/null || stat -f '%A' "$ENV_FILE")"
  echo "لمعرفة القيم الحالية (آمن):"
  grep -E "^[A-Z_]+=\".*\"$" "$ENV_FILE" | sed -E 's/(=)\".*\"/\1"••••"/' || true
  echo "============================"
  echo
}

remove_secrets() {
  echo "هل تريد إزالة جميع متغيرات Smart Shell من $ENV_FILE؟ [y/N]"
  read -r ans
  if [[ "$ans" =~ ^[Yy] ]]; then
    > "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    echo "✅ تم تنظيف $ENV_FILE (الأصل محفوظ في ${ENV_FILE}.bak إذا لزم)"
  else
    echo "إلغاء الإزالة"
  fi
}

show_menu() {
  cat <<'MENU'

======== Smart Shell Bot Setup ========
اختر خيارًا:
1) تهيئة ملف .env مؤمن (إنشاء/تحديث)
2) إضافة استدعاء الملف إلى ~/.bashrc (آمن)
3) إضافة متغيرات تليغرام وGoogle (مطابق لمتغيراتك)
4) حذف كل المتغيرات من الملف
5) طباعة ملخص
6) الخروج
MENU
}

# ابدأ
ensure_env_file
while true; do
  show_menu
  echo -n "اختر رقم: "
  read -r choice
  case "$choice" in
    1)
      echo "✅ ملف البيئة موجود: $ENV_FILE"
      ;;
    2)
      add_source_to_bashrc
      ;;
    3)
      echo "ستتم مطالبتك بإدخال المتغيرات التالية (لن تظهر أثناء الكتابة):"
      echo "- BOT_TOKEN (مثال: 123:ABC..)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- API_ID
- API_HASH
- OPTIONAL: ADMIN_CHAT_ID (لإشعارات)
"
      prompt_secret "BOT_TOKEN"
      prompt_secret "GOOGLE_CLIENT_ID"
      prompt_secret "GOOGLE_CLIENT_SECRET"
      prompt_secret "API_ID"
      prompt_secret "API_HASH"
      prompt_secret "ADMIN_CHAT_ID"
      echo "✅ تم إضافة المتغيرات المطلوبة. تذكر عدم مشاركة الملف أو صورة من الشاشة التي تحتويه."
      ;;
    4)
      remove_secrets
      ;;
    5)
      print_summary
      ;;
    6)
      echo "مع السلامة 👋"
      exit 0
      ;;
    *)
      echo "خيار غير صالح. حاول مرة أخرى."
      ;;
  esac
done
