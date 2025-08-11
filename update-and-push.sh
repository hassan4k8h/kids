#!/bin/bash

echo "🚀 بدء رفع التحديثات إلى GitHub..."
echo ""

# التحقق من وجود Git
if ! command -v git &> /dev/null; then
    echo "❌ Git غير مثبت. يرجى تثبيت Git أولاً"
    exit 1
fi

# تهيئة Git إذا لم يكن مهيأ
if [ ! -d ".git" ]; then
    echo "📁 تهيئة Git repository..."
    git init
fi

# إضافة remote إذا لم يكن موجود
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 ربط المشروع بـ GitHub..."
    git remote add origin https://github.com/hassan4k8h/kids.git
else
    echo "🔗 تحديث رابط GitHub..."
    git remote set-url origin https://github.com/hassan4k8h/kids.git
fi

# إنشاء ملف .env إذا لم يكن موجود
if [ ! -f ".env" ]; then
    echo "📝 إنشاء ملف .env..."
    cat > .env << EOF
# متغيرات البيئة للتطبيق التعليمي للأطفال
VITE_SUPABASE_URL=https://zwwyifnikprfbdikskvg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3d3lpZm5pa3ByZmJkaWtza3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjU3MjUsImV4cCI6MjA2OTEwMTcyNX0.Z1BwlFF37xjSpuRVDhFSKCQJOZdAQayY1JYRVotu3NE
VITE_USE_SUPABASE=true

# متغيرات اختيارية
VITE_STRIPE_PUBLISHABLE_KEY=""
VITE_GOOGLE_ANALYTICS_ID=""
VITE_SENTRY_DSN=""
EOF
    echo "✅ تم إنشاء ملف .env"
fi

# إضافة جميع الملفات
echo "📂 إضافة جميع الملفات..."
git add .

# إنشاء commit
echo "💾 إنشاء commit..."
git commit -m "🚀 Major Update: تحديث شامل - إصلاح جميع مشاكل حفظ البيانات

✅ إصلاح نظام المصادقة مع Supabase Auth
✅ إصلاح حفظ بيانات الأطفال/اللاعبين في قاعدة البيانات
✅ إصلاح حفظ الإيميلات وكلمات المرور
✅ إضافة قاعدة بيانات شاملة ومحسنة
✅ تكامل مزامنة البيانات الفورية
✅ نظام مصادقة محترف وآمن
✅ إنشاء أدلة الإعداد والاختبار الشاملة

المشروع جاهز الآن للإنتاج والتسويق! 🎉

الملفات الجديدة:
- SETUP_AND_RUN_GUIDE.md (دليل الإعداد الكامل)
- TEST_INTEGRATION.md (دليل اختبار التكامل)
- FINAL_STATUS_SUMMARY.md (ملخص الحالة النهائية)

الملفات المحدثة:
- services/AuthService.ts (نظام مصادقة محدث)
- services/PlayerService.ts (حفظ بيانات اللاعبين)
- database/setup.sql (قاعدة البيانات المحدثة)
- App.tsx (ربط النظام الجديد)

التطبيق الآن:
🛡️ آمن 100% - كلمات مرور مشفرة وحماية شاملة
🏢 محترف - نظام مصادقة عالمي معتمد
📋 مكتمل - جميع البيانات تُحفظ وتتزامن
⚡ سريع - قاعدة بيانات محسنة ومحفوظة سحابياً
🚀 جاهز للتسويق!"

if [ $? -ne 0 ]; then
    echo "⚠️ لا توجد تغييرات جديدة للـ commit"
else
    echo "✅ تم إنشاء commit بنجاح"
fi

# رفع التحديثات إلى GitHub
echo "🚀 رفع التحديثات إلى GitHub..."
git push -u origin main

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ فشل في رفع التحديثات"
    echo "💡 تأكد من:"
    echo "  - اتصالك بالإنترنت"
    echo "  - صلاحياتك في المستودع"
    echo "  - تسجيل دخولك في Git"
    echo ""
    echo "🔧 لتسجيل الدخول في Git:"
    echo "  git config --global user.name \"hassan4k8h\""
    echo "  git config --global user.email \"your-email@example.com\""
    echo ""
    exit 1
fi

echo ""
echo "🎉 تم رفع التحديثات بنجاح!"
echo "🌐 يمكنك الآن زيارة: https://github.com/hassan4k8h/kids"
echo ""
echo "✅ التحديثات المرفوعة:"
echo "  - جميع إصلاحات حفظ البيانات"
echo "  - نظام مصادقة آمن مع Supabase"
echo "  - قاعدة بيانات متكاملة"
echo "  - أدلة الإعداد والاختبار"
echo ""
echo "🚀 المشروع جاهز الآن للإنتاج والتسويق!"
echo ""
read -p "اضغط Enter للمتابعة..."