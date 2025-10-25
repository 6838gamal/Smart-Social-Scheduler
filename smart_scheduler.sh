#!/bin/bash

# =============================================
# SMART SCHEDULER SCRIPT
# =============================================

# الألوان للعرض
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# المتغيرات الحساسة (يتم تعبئتها من ملف .env)
SMART_SCHEDULER_TOKEN=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# دوال المساعدة
log() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warn() {
    echo -e "${YELLOW}!${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# تحميل المتغيرات من ملف .env
load_env() {
    if [ -f ".env" ]; then
        # قراءة ملف .env وتجنب التعليقات والاسطر الفارغة
        while IFS= read -r line; do
            # تخطي التعليقات والاسطر الفارغة
            if [[ ! $line =~ ^# && ! -z $line ]]; then
                export "$line"
            fi
        done < ".env"
        
        # تعيين المتغيرات المحلية
        SMART_SCHEDULER_TOKEN="${SMART_SCHEDULER_TOKEN:-$1}"
        GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-$2}"
        GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-$3}"
        
        log "تم تحميل الإعدادات من ملف .env"
    else
        warn "ملف .env غير موجود - سيتم استخدام القيم الافتراضية"
    fi
}

# التحقق من المتغيرات المطلوبة
check_required_vars() {
    local missing_vars=()
    
    if [ -z "$SMART_SCHEDULER_TOKEN" ]; then
        missing_vars+=("SMART_SCHEDULER_TOKEN")
    fi
    
    if [ -z "$GOOGLE_CLIENT_ID" ]; then
        missing_vars+=("GOOGLE_CLIENT_ID")
    fi
    
    if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
        missing_vars+=("GOOGLE_CLIENT_SECRET")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        error "المتغيرات المطلوبة غير موجودة: ${missing_vars[*]}"
        return 1
    fi
    
    return 0
}

# عرض المعلومات (بدون القيم الكاملة)
show_info() {
    echo "=== معلومات التطبيق ==="
    echo "📱 Telegram Bot: ${SMART_SCHEDULER_TOKEN:0:10}..."
    echo "🔐 Google Client ID: ${GOOGLE_CLIENT_ID:0:10}..."
    echo "🔑 Google Client Secret: ${GOOGLE_CLIENT_SECRET:0:10}..."
    echo "========================="
}

# التحقق من صحة توكن التليجرام
check_telegram_token() {
    info "التحقق من صحة توكن التليجرام..."
    
    local response
    response=$(curl -s "https://api.telegram.org/bot${SMART_SCHEDULER_TOKEN}/getMe")
    
    if echo "$response" | grep -q '"ok":true'; then
        local bot_name
        bot_name=$(echo "$response" | grep -o '"username":"[^"]*' | cut -d'"' -f4)
        log "التوكن صالح - اسم البوت: @$bot_name"
        return 0
    else
        error "التوكن غير صالح"
        return 1
    fi
}

# إنشاء ملف .env إذا لم يكن موجوداً
create_env_file() {
    cat > .env << ENV_CONTENT
SMART_SCHEDULER_TOKEN=8402278212:AAFmTWzAtrvF9SOy9sdwduz1LmNrT_oqHmo
GOOGLE_CLIENT_ID=1015270124270-fg53ehvs093roual651kppfq5rpmm56t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
ENV_CONTENT
    
    log "تم إنشاء ملف .env"
    chmod 600 .env
    warn "⚠️  يرجى تحديث القيم في ملف .env بالقيم الحقيقية"
}

# الدالة الرئيسية
main() {
    echo "🚀 بدء تشغيل Smart Scheduler..."
    
    # تحميل الإعدادات
    load_env
    
    # التحقق من المتغيرات المطلوبة
    if ! check_required_vars; then
        error "المتغيرات المطلوبة غير موجودة"
        read -p "هل تريد إنشاء ملف .env؟ (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_env_file
            load_env
        else
            error "لا يمكن المتابعة بدون المتغيرات المطلوبة"
            exit 1
        fi
    fi
    
    # عرض المعلومات
    show_info
    
    # التحقق من التوكن
    if check_telegram_token; then
        log "البوت جاهز للاستخدام!"
    else
        error "هناك مشكلة في توكن البوت"
    fi
    
    # هنا يمكنك إضافة المزيد من الوظائف
    info "التطبيق جاهز للعمل 🎯"
}

# معالجة الأوامر
case "${1:-}" in
    "init")
        create_env_file
        ;;
    "check")
        load_env
        check_telegram_token
        ;;
    "info")
        load_env
        show_info
        ;;
    "help"|"-h"|"--help")
        echo "الاستخدام: $0 [command]"
        echo ""
        echo "الأوامر المتاحة:"
        echo "  init     - إنشاء ملف .env"
        echo "  check    - التحقق من صحة التوكن"
        echo "  info     - عرض المعلومات"
        echo "  help     - عرض هذه المساعدة"
        echo "  (بدون أمر) - تشغيل الوضع العادي"
        ;;
    *)
        main
        ;;
esac
