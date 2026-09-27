# أداة تصميم الشقة 3D (مطبخ • حمامات • أوض • شقة كاملة)

أداة ويب في ملف واحد (three.js r128) لتصميم المطبخ والحمامات والأوض وربطهم في شقة، مع رسومات تنفيذ وقوايم مشتريات.

## الهيكل
```
src/index.html        HTML + CSS (فيه مكان للكود: /*__APP_JS__*/)
src/js/ORDER.txt      ترتيب تجميع الموديولز (مهم: كلهم في نفس الـ scope)
src/js/01-config.js   القوالب والإعدادات الافتراضية والـ SCHEMA
src/js/02-three-setup.js
src/js/03-helpers.js  الخامات والأشكال ووحدات الدواليب والأجهزة والنقط
src/js/04-room.js     رسم الحيطان والفتحات والأسقف
src/js/05-bathroom-mode.js
src/js/06-apartment-...js   الشقة: المسقط والربط والسباكة والكهربا والمناسيب والـ 3D
src/js/07-living-rooms-...js الأثاث والدواليب المفصّلة
src/js/08-cut-corners-...js  الأوض اللي شكلها L والحيطان المايلة
src/js/09-lighting-...js     الإضاءة والجبس والتجاليد والستاير والكميات
src/js/10-gypsum-board-ceilings-flat.js  الأسقف الجبس (فلات / بيت النور)
src/js/11-backup.js
src/js/11-shopping-...js     المشتريات والميزانية
src/js/12-build.js    محرك التوزيع (build) للمطبخ والحمام والأوض
src/js/13-camera.js   الكاميرا والمشي والسحب
src/js/14-ui.js       التابات والمعالج والمشاريع
build.py              بيجمّع كل ده في dist/kitchen-3d.html
tests/smoke_test.py   اختبارات headless (30 اختبار)
```

## التشغيل
```bash
python3 build.py                      # dist/kitchen-3d.html
pip install playwright && playwright install chromium
python3 tests/smoke_test.py           # بينزّل three@0.128.0 من npm لو مش موجود
```

## ملاحظات للتطوير
- الموديولز بتتجمّع كسكريبت واحد (مش ES modules)، فالمتغيرات العامة مشتركة. لو هتحوّلها لـ ES modules ابدأ بـ 01/02/03.
- الحفظ عن طريق `window.storage` (مخزن Claude artifacts) مع نسخة في الذاكرة `MEMS` لو فشل. لو هتنشرها برة Claude استبدل `stGet/stSet/stDel` بـ localStorage أو API.
- الحسابات (ميول الصرف، أطوال المواسير والسلك، الأحمال) تخطيطية تقريبية ومش بديل عن مهندس.
