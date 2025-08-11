# Skilloo Educational App | تطبيق سكيلو التعليمي

<div align="center">

![Skilloo Logo](public/logo.svg)

**An interactive Arabic educational platform for children aged 3-12**

**منصة تعليمية تفاعلية باللغة العربية للأطفال من سن 3-12 سنة**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5.0-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.6-38B2AC.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-green.svg)](https://www.w3.org/WAI/WCAG21/quickref/)

[🎮 Live Demo](https://skilloo.netlify.app) • [📚 Documentation](https://docs.skilloo.com) • [🐛 Report Bug](https://github.com/skilloo/skilloo/issues) • [✨ Request Feature](https://github.com/skilloo/skilloo/issues)

</div>

## Table of Contents | جدول المحتويات

- [About](#about--حول)
- [Features](#features--الميزات)
- [Demo](#demo--العرض-التوضيحي)
- [Getting Started](#getting-started--البدء)
- [Installation](#installation--التثبيت)
- [Usage](#usage--الاستخدام)
- [Games & Activities](#games--activities--الألعاب-والأنشطة)
- [Technology Stack](#technology-stack--المكدس-التقني)
- [Contributing](#contributing--المساهمة)
- [Accessibility](#accessibility--إمكانية-الوصول)
- [Performance](#performance--الأداء)
- [Security](#security--الأمان)
- [License](#license--الترخيص)
- [Support](#support--الدعم)

## About | حول

Skilloo is a modern, interactive educational web application designed specifically for Arabic-speaking children. Our mission is to make learning fun, engaging, and accessible through games, stories, and interactive activities that promote cognitive development and Arabic language skills.

سكيلو هو تطبيق ويب تعليمي حديث وتفاعلي مصمم خصيصاً للأطفال الناطقين بالعربية. مهمتنا هي جعل التعلم ممتعاً وجذاباً ومتاحاً من خلال الألعاب والقصص والأنشطة التفاعلية التي تعزز التطور المعرفي ومهارات اللغة العربية.

### Why Skilloo? | لماذا سكيلو؟

- **🎯 Age-Appropriate**: Designed specifically for children aged 3-12
- **🌍 Arabic-First**: Native Arabic language support with cultural relevance
- **🎮 Gamified Learning**: Learning through play and interactive experiences
- **📱 Cross-Platform**: Works on all devices - phones, tablets, and computers
- **♿ Accessible**: WCAG 2.1 AA compliant for children with different abilities
- **🔒 Safe & Private**: COPPA compliant with no data collection from children
- **🎨 Beautiful Design**: Child-friendly interface with engaging animations
- **📚 Educational**: Curriculum-aligned content developed with educators

## 🆕 آخر التحديثات (يناير 2025) ✨

**تحديث شامل - المشروع جاهز للإنتاج! 🚀**

- ✅ **إصلاح شامل لحفظ البيانات** - جميع البيانات تُحفظ بأمان
- ✅ **نظام مصادقة محترف** - تكامل كامل مع Supabase Auth
- ✅ **حفظ بيانات الأطفال** - كل طفل مرتبط بحساب الوالدين
- ✅ **كلمات مرور آمنة** - تشفير تلقائي وحماية شاملة
- ✅ **مزامنة فورية** - البيانات متزامنة عبر جميع الأجهزة
- ✅ **قاعدة بيانات محترفة** - 7 جداول محسنة ومترابطة

**📚 أدلة جديدة:**
- `SETUP_AND_RUN_GUIDE.md` - دليل الإعداد الكامل
- `TEST_INTEGRATION.md` - دليل اختبار النظام
- `FINAL_STATUS_SUMMARY.md` - ملخص شامل للتحديثات

## 🚀 البدء السريع

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. إعداد البيئة
```bash
# نسخ ملف الإعدادات
npm run setup:env

# تعديل ملف .env بالقيم الحقيقية
```

### 3. تشغيل المشروع
```bash
npm run dev
```

الآن افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 📋 الأوامر المتاحة

### التطوير
- `npm run dev` - تشغيل خادم التطوير
- `npm run build` - بناء المشروع للإنتاج
- `npm run preview` - معاينة البناء محلياً
- `npm run lint` - فحص الكود
- `npm run type-check` - فحص TypeScript

### النشر والإدارة
- `npm run deploy` - أداة النشر التفاعلية
- `npm run deploy:vercel` - نشر على Vercel
- `npm run deploy:netlify` - نشر على Netlify
- `npm run backup` - إنشاء نسخة احتياطية

### الصيانة
- `npm run clean` - تنظيف ملفات البناء
- `npm run reinstall` - إعادة تثبيت المكتبات
- `npm run update:deps` - تحديث المكتبات

## 🎯 الميزات

- ✅ **ألعاب متنوعة**: الحروف، الأرقام، الألوان، الأشكال
- ✅ **واجهة سهلة**: مصممة خصيصاً للأطفال
- ✅ **تتبع التقدم**: حفظ مستوى الطفل وإنجازاته
- ✅ **أصوات تفاعلية**: تعليم النطق الصحيح
- ✅ **مكافآت وشهادات**: تحفيز الطفل على التعلم
- ✅ **متعدد اللغات**: دعم العربية والإنجليزية

## 🛠️ التقنيات المستخدمة

- **React 18** - مكتبة الواجهة
- **TypeScript** - لغة البرمجة
- **Tailwind CSS** - تصميم الواجهة
- **Vite** - أداة البناء
- **Framer Motion** - الحركات والانتقالات

## 📁 بنية المشروع

```
src/
├── components/          # مكونات الواجهة
│   ├── games/          # ألعاب مختلفة
│   ├── ui/             # مكونات الواجهة الأساسية
│   └── auth/           # مكونات المصادقة
├── services/           # خدمات التطبيق
├── types/              # تعريفات TypeScript
├── constants/          # الثوابت
└── styles/             # ملفات التصميم
```

## 🔧 الإعداد المتقدم

### قاعدة البيانات
يدعم المشروع:
- **Supabase** (مُوصى به)
- **Firebase**
- **قاعدة بيانات محلية**

### نظام الاشتراكات
- **Stripe** للمدفوعات
- خطط شهرية وسنوية
- حماية المحتوى المتقدم

### المراقبة
- **Google Analytics** لتتبع الاستخدام
- **Sentry** لمراقبة الأخطاء

## 📚 الأدلة التفصيلية

- 📖 [دليل النشر الشامل](./DEPLOYMENT_GUIDE.md)
- 🔧 [دليل نظام الاشتراكات](./SUBSCRIPTION_GUIDE.md)
- 🎮 [دليل إضافة ألعاب جديدة](./guidelines/Guidelines.md)

## 🆘 الدعم والمساعدة

### مشاكل شائعة

**المشروع لا يعمل؟**
```bash
npm run clean
npm run reinstall
npm run dev
```

**أخطاء في TypeScript؟**
```bash
npm run type-check
```

**مشاكل في التصميم؟**
```bash
npm run lint
```

### الحصول على المساعدة
- 📧 البريد الإلكتروني: support@example.com
- 💬 Discord: [رابط الخادم]
- 📱 Telegram: [@support_channel]

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى:
1. عمل Fork للمشروع
2. إنشاء branch جديد للميزة
3. إضافة التغييرات
4. إرسال Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🎉 شكر خاص

- فريق React لتطوير مكتبة رائعة
- مجتمع Tailwind CSS للتصميم الجميل
- جميع المساهمين في المشروع

---

**صُنع بـ ❤️ للأطفال العرب**

> "التعليم هو أقوى سلاح يمكن استخدامه لتغيير العالم" - نيلسون مانديلا