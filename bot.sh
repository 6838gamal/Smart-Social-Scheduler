#!/bin/bash

# المتغيرات بنفس الأسماء المستخدمة في المحادثة
SMART_SCHEDULER_TOKEN="8402278212:AAFmTWzAtrvF9SOy9sdwduz1LmNrT_oqHmo"
GOOGLE_CLIENT_ID="1015270124270-fg53ehvs093roual651kppfq5rpmm56t.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# استخدام المتغيرات
echo "=== إعدادات البوت ==="
echo "التوكن: ${SMART_SCHEDULER_TOKEN:0:10}..."
echo "العميل: ${GOOGLE_CLIENT_ID:0:10}..."
echo "السر: ${GOOGLE_CLIENT_SECRET:0:10}..."
echo "✅ جاهز للاستخدام"
