 HEAD
# الصندوق الاجتماعي التنموي — تطبيق React Native

تطبيق أندرويد حقيقي (React Native) لإدارة صندوق اجتماعي تنموي، جاهز للفتح والتطوير والبناء عبر **Android Studio** لإنتاج ملف **APK**.

---

## 📋 المتطلبات قبل البدء

قم بتثبيت البرامج التالية على جهاز الكمبيوتر (ويندوز/ماك/لينكس):

| البرنامج | الرابط | ملاحظة |
|---|---|---|
| **Node.js** (نسخة 18 أو أحدث) | https://nodejs.org | يشمل npm |
| **Java JDK 17** | https://adoptium.net | مطلوب لـ Gradle |
| **Android Studio** | https://developer.android.com/studio | يشمل Android SDK |
| **Git** (اختياري) | https://git-scm.com | لإدارة الإصدارات |

بعد تثبيت Android Studio، من داخله:
1. افتح **Settings → Languages & Frameworks → Android SDK**
2. تأكد من تثبيت: **Android 14 (API 34)**، **Android SDK Build-Tools 34**، **Android SDK Platform-Tools**، **Android Emulator**
3. أضف متغيرات البيئة (Environment Variables):
   - `ANDROID_HOME` = مسار مجلد Android SDK (مثال: `C:\Users\YourName\AppData\Local\Android\Sdk`)
   - أضف إلى `PATH`: `%ANDROID_HOME%\platform-tools`

---

## 🚀 خطوات التشغيل

### 1) فتح المشروع وتثبيت الحزم

افتح **Terminal / CMD** داخل مجلد المشروع `SocialFundApp` ونفّذ:

```bash
npm install
```

سيقوم هذا بتحميل جميع مكتبات React Native والتنقل والأيقونات وغيرها المذكورة في `package.json`.

### 2) فتح المشروع في Android Studio

- افتح **Android Studio**
- اختر **Open**
- انتقل إلى مجلد المشروع واختر المجلد الفرعي **`android`** فقط (لا تفتح المجلد الرئيسي)
- انتظر حتى ينتهي **Gradle Sync** (قد يستغرق بضع دقائق في أول مرة)

### 3) تشغيل التطبيق على محاكي أو جهاز حقيقي

**الطريقة الأولى (سطر الأوامر - الأسهل):**

من داخل مجلد المشروع الرئيسي (وليس مجلد android)، في نافذتي Terminal منفصلتين:

نافذة 1 — تشغيل خادم Metro (JavaScript bundler):
```bash
npm start
```

نافذة 2 — بناء وتشغيل على المحاكي/الجهاز:
```bash
npm run android
```

**الطريقة الثانية (من داخل Android Studio):**
- شغّل محاكي Android من **Device Manager** أو وصّل جهاز حقيقي (مع تفعيل وضع المطوّر + USB Debugging)
- من Android Studio اضغط زر **Run ▶** (سيتم تشغيل Gradle وتثبيت التطبيق تلقائياً)
- في نافذة Terminal منفصلة نفّذ `npm start` لتشغيل خادم Metro

---

## 📦 بناء ملف APK للتوزيع

### APK تجريبي (Debug) — للاختبار السريع

```bash
cd android
./gradlew assembleDebug        # على ماك/لينكس
gradlew.bat assembleDebug      # على ويندوز
```

الملف الناتج:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### APK نهائي (Release) — للتوزيع الحقيقي

قبل بناء نسخة الإصدار (Release)، يجب توليد مفتاح توقيع (Keystore) خاص بك بدلاً من مفتاح debug:

```bash
cd android/app
keytool -genkeypair -v -keystore release.keystore -alias socialfund -keyalg RSA -keysize 2048 -validity 10000
```

سيطلب منك كلمة مرور واسم المؤسسة، احفظها في مكان آمن.

ثم عدّل ملف `android/app/build.gradle` وأضف في `signingConfigs`:

```gradle
release {
    storeFile file('release.keystore')
    storePassword 'كلمة_مرورك'
    keyAlias 'socialfund'
    keyPassword 'كلمة_مرورك'
}
```

وفي `buildTypes.release` غيّر `signingConfig` إلى `signingConfigs.release`.

بعد ذلك:
```bash
cd android
./gradlew assembleRelease
```

الملف الناتج (هذا هو ملف APK الجاهز للتوزيع/النشر):
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🗂️ هيكل المشروع

```
SocialFundApp/
├── App.js                     ← نقطة الدخول الرئيسية (Providers + Navigation)
├── index.js                   ← تسجيل التطبيق لدى React Native
├── app.json                   ← اسم التطبيق
├── package.json                ← الحزم والاعتماديات
├── babel.config.js
├── metro.config.js
├── android/                   ← المشروع الأندرويد الأصلي (Java/Gradle) — هذا ما تفتحه في Android Studio
│   ├── app/
│   │   ├── build.gradle       ← إعدادات التطبيق (اسم الحزمة، الإصدار، التوقيع)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/socialfund/
│   │       │   ├── MainActivity.java
│   │       │   └── MainApplication.java
│   │       └── res/           ← الأيقونات والألوان (XML)
│   └── build.gradle
└── src/
    ├── theme/                 ← الألوان (فاتح/داكن)
    ├── icons/                 ← مكتبة الأيقونات SVG
    ├── data/                  ← البيانات التجريبية (الأعضاء، المساعدات، إلخ)
    ├── context/               ← ThemeContext + DataContext (إدارة الحالة العامة + حفظ AsyncStorage)
    ├── components/             ← عناصر مشتركة: Badge, Sheet, Field, Btn, Toggle, Card
    │   └── charts/             ← Donut, BarChart, LineChart (رسوم SVG لتحليل البيانات)
    ├── navigation/
    │   ├── RootNavigator.js     ← القائمة الجانبية (Drawer) + رأس كل شاشة بزر القائمة ☰
    │   └── DrawerContent.js     ← محتوى القائمة الجانبية: صورة المستخدم وكل الشاشات مصنّفة بأقسام
    └── screens/                ← جميع الشاشات:
        ├── LoginScreen.js       (تسجيل الدخول: كلمة مرور + بصمة + OTP)
        ├── DashboardScreen.js   (لوحة تحكم تحليلية: مؤشرات، مخططات اتجاه، أكثر الأعضاء مساهمة)
        ├── MembersScreen.js     (الأعضاء)
        ├── SubscriptionsScreen.js (الاشتراكات)
        ├── AidScreen.js         (طلبات المساعدة)
        ├── TreasuryScreen.js    (الخزينة)
        ├── VouchersScreen.js    (سندات القبض والصرف)
        ├── MessagesScreen.js    (الرسائل الداخلية)
        ├── SchedulerScreen.js   (المواعيد والجدول)
        ├── ReportsScreen.js     (التقارير)
        ├── FundInfoScreen.js    (بيانات الصندوق: الاسم، الشعار، الهاتف، البريد — قابلة للتعديل)
        └── SettingsScreen.js    (الإعدادات + الوضع الداكن + رابط بيانات الصندوق)
```

### التنقل: القائمة الجانبية (Drawer)

كل شاشات التطبيق متاحة من قائمة جانبية تنزلق من الجانب (اضغط زر ☰ في أعلى كل شاشة، أو اسحب من
حافة الشاشة). القائمة مقسّمة إلى: الرئيسية، العمليات (الأعضاء، الاشتراكات، المساعدات، الخزينة،
السندات)، التواصل والتنظيم (الرسائل، المواعيد، التقارير)، والنظام (بيانات الصندوق، الإعدادات).
تعرض القائمة أيضاً صورة/اسم/دور المستخدم الحالي في أعلاها، وشارات العدّاد (طلبات معلقة، رسائل
غير مقروءة) على العناصر المناسبة.

---

## 🔌 الاتصال بالخادم الخلفي (SocialFundBackend)

هذا التطبيق **مربوط الآن بخادم FastAPI حقيقي** (مشروع `SocialFundBackend` المنفصل)، وليس ببيانات وهمية محلية فقط.

### 1) شغّل الخادم أولاً

اتبع تعليمات `SocialFundBackend/README.md` لتشغيل الخادم (PostgreSQL + `uvicorn app.main:app`)، ونفّذ `python seed.py` لإنشاء أول حساب مدير:

```
اسم المستخدم: admin
كلمة المرور:  ChangeMe123!
```

**غيّر كلمة المرور فوراً** من داخل التطبيق (الإعدادات → تغيير كلمة المرور) بعد أول دخول.

### 2) اضبط عنوان الخادم في التطبيق

عدّل `API_BASE_URL` في `src/api/client.js`:

```js
export const API_BASE_URL = 'http://10.0.2.2:8000';
```

| البيئة | القيمة المطلوبة |
|---|---|
| محاكي Android (Emulator) والخادم يعمل على نفس الكمبيوتر | `http://10.0.2.2:8000` (القيمة الافتراضية — عنوان خاص يُترجم تلقائياً إلى `localhost` الكمبيوتر) |
| جهاز أندرويد حقيقي على نفس شبكة الواي فاي | `http://<عنوان IP المحلي للكمبيوتر>:8000` مثل `http://192.168.1.50:8000` |
| نشر فعلي (خادم سحابي) | عنوان الخادم الحقيقي عبر HTTPS، مثل `https://api.yourfund.org` |

### 3) رمز التحقق الثنائي (OTP) في وضع التطوير

الخادم لا يرسل رسالة SMS حقيقية بعد (راجع ملاحظات `SocialFundBackend/README.md`) — رمز التحقق يُطبع في نافذة الطرفية (Terminal) التي يعمل بها الخادم. راقبها بعد كل محاولة دخول لمعرفة الرمز.

الدخول بالبصمة في هذا الإصدار وسيلة راحة لفتح **جلسة محفوظة بالفعل** فقط (لا يستبدل تسجيل الدخول الأول عبر كلمة المرور + OTP)؛ لتفعيل بصمة الجهاز الفعلية استخدم مكتبة `react-native-biometrics` أو `react-native-touch-id`.

### 4) المزامنة والعمل بدون إنترنت

كل تعديل (إضافة عضو، اشتراك، مساعدة، سند، ...) يُطبَّق محلياً فوراً ثم يُضاف لطابور مزامنة (Outbox) مخزّن في `AsyncStorage`. من شاشة **الإعدادات → المزامنة** يمكن رؤية عدد العمليات التي لم تُزامَن بعد وتشغيل مزامنة يدوية، وتتم المزامنة تلقائياً أيضاً عند كل تسجيل دخول. عند فقدان الاتصال، تستمر كل الشاشات بالعمل بشكل طبيعي محلياً وتُزامَن العمليات المعلّقة تلقائياً عند عودة الاتصال.

---

## ⚙️ تغيير اسم الحزمة (Package Name) واسم التطبيق

اسم الحزمة الحالي: `com.socialfund`

لتغييره (مثلاً لنشره على Google Play باسم مؤسستك):
1. غيّر `applicationId` و `namespace` في `android/app/build.gradle`
2. غيّر مسار المجلد `android/app/src/main/java/com/socialfund/` إلى المسار الجديد المطابق
3. غيّر `package com.socialfund;` في أعلى `MainActivity.java` و `MainApplication.java`

اسم التطبيق الظاهر للمستخدم: عدّل `app_name` في `android/app/src/main/res/values/strings.xml` و `displayName` في `app.json`.

---

## 🎨 تغيير أيقونة التطبيق

المشروع يأتي بأيقونة افتراضية بسيطة (شعار درع أخضر/ذهبي) مبنية بصيغة **Vector Drawable** بدون ملفات PNG، موجودة في:
```
android/app/src/main/res/drawable/ic_launcher_background.xml
android/app/src/main/res/drawable/ic_launcher_foreground.xml
android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml
```

**لاستبدالها بشعار مؤسستك الحقيقي (الطريقة الموصى بها):**

1. من داخل Android Studio، كليك يمين على مجلد `app/src/main/res` → **New → Image Asset**
2. اختر **Launcher Icons (Adaptive and Legacy)**
3. ارفع صورة الشعار الخاصة بك (يُفضّل PNG شفاف بحجم 512×512 أو أكبر)
4. اضغط **Next → Finish** — ستقوم الأداة تلقائياً بتوليد جميع الأحجام والمجلدات المطلوبة (`mipmap-mdpi` وحتى `mipmap-xxxhdpi`) وتستبدل الملفات الحالية

هذا هو الأسلوب الأسهل والأضمن لأنه يضمن توافق الأيقونة مع جميع كثافات الشاشات وإصدارات أندرويد القديمة والحديثة معاً.

---

## 🩹 حل المشاكل الشائعة

**"SDK location not found"**: أنشئ ملف `android/local.properties` وأضف:
```
sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

**"Unable to load script"**: تأكد أن خادم Metro يعمل (`npm start`) قبل تشغيل `npm run android`.

**خطأ Gradle Sync**: من Android Studio، جرّب **File → Invalidate Caches / Restart**.

**التطبيق لا يدعم RTL بشكل صحيح على بعض الأجهزة**: تأكد من `android:supportsRtl="true"` في `AndroidManifest.xml` (موجود مسبقاً في هذا المشروع).

---

## 📝 ملاحظات

- **البيانات محفوظة الآن محلياً على الجهاز** عبر `AsyncStorage`: كل تعديل (إضافة عضو، اشتراك، مساعدة، سند، رسالة، حدث) يُحفظ تلقائياً ويبقى بعد إغلاق التطبيق وإعادة فتحه. جلسة الدخول (المستخدم الحالي) محفوظة أيضاً فلن تحتاج لتسجيل الدخول من جديد في كل مرة.
- لإعادة تعيين جميع البيانات إلى الحالة الافتراضية التجريبية، استخدم **الإعدادات → البيانات → إعادة تعيين البيانات**.
- لربط التطبيق بخادم حقيقي بدلاً من التخزين المحلي (مثل Firebase أو REST API خاص بمؤسستك)، استبدل عمليات `AsyncStorage` داخل `src/context/DataContext.js` باستدعاءات API، مع الإبقاء على نفس الواجهة (`useData()`) حتى لا تحتاج لتعديل الشاشات.

# SocialFundApp
 6b3eabf0ece8e95459b32eaefc9e18d2e195c62c
