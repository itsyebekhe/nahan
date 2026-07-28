# گزارش تغییرات | Changelog

<!-- LANG:FA -->
تمام تغییرات و بروزرسانی‌های پروژه نهان (Project Nahan) در این فایل مستند خواهند شد.
<!-- LANG:FA -->
<!-- LANG:EN -->
All notable changes to Project Nahan will be documented in this file.
<!-- LANG:EN -->


## [3.0.0] - ۱۴۰۵-۰۵-۰۶ (2026-07-27)

<!-- LANG:FA -->
### اضافه شده (Added)
- **Upstream VLESS / پروکسی زنجیره‌ای**: قابلیت اتصال پنل به یه سرور VLESS دیگه به عنوان upstream تا ترافیک از مسیر اون سرور رد بشه و محدودیت‌ها دور زده بشه.
- **توضیحات ساده Upstream VLESS**: بخشی با توضیحات فارسی ساده و لینک سایت‌های دریافت کانفیگ رایگان.
- **فرمت v2rayN JSON**: اضافه شدن فرمت سابسکریپشن v2rayN JSON (`?flag=vjson`) به صفحه ساب.
- **توضیحات دوزبانه Custom Routing**: بخش مسیریابی سفارشی حالا توضیحات فارسی و انگلیسی داره.
- **مودال تأیید سفارشی**: به جای دیالوگ‌های پیش‌فرض مرورگر، یه مودال زیبا و سفارشی اضافه شد.
- **ذخیره خودکار پیش‌نویس**: فرم اضافه کردن کاربر حالا اطلاعات رو خودکار ذخیره می‌کنه. اگه صفحه رو ببندی و برگردی، اطلاعات باقی می‌مونه.
- **کپی خودکار لینک ساب**: بعد از ساخت کاربر جدید، لینک سابسکریپشن خودکار کپی میشه.
- **اعلان‌های Toast**: پیام‌های موفقیت و خطا به صورت اعلان ظاهر میشن.

### رفع شده (Fixed)
- **تغییر زبان فوری**: حالا وقتی زبان رو عوض می‌کنی، همه متن‌ها فوری آپدیت میشن بدون نیاز به رفرش صفحه.
- **کنتراست FAQ**: متن‌های بخش سؤالات متداول در حالت تاریک بهتر شد.
- **لایوت RTL صفحه ساب**: باکس‌ها و دکمه‌ها دیگه با تغییر زبان برعکس نمیشن.
- **FAQ انگلیسی**: باکس‌های پاسخ انگلیسی حالا درست از چپ به راست نمایش داده میشن.
- **هاور سایدبار**: رنگ هاور آیتم‌های سایدبار در حالت تاریک حالا سفید هست.
- **آیکون نودها**: آیکون تب نودها در موبایل با بقیه آیتم‌ها هم‌تراز شد.
- **تب Settings**: بخش تنظیمات حالا تمام عرض صفحه رو اشغال می‌کنه.

### بهبود یافته (Improved)
- **بازطراحی فرم اضافه/ویرایش کاربر**: فرم‌ها به ۴ بخش شماره‌گذاری شده تقسیم شدن با بخش‌های پیشرفته جمع‌شونده (Accordion).
- **سوئیچ پروتکل**: به جای چک‌باکس‌های ساده، حالا toggle switch مدرن برای انتخاب VLESS/Trojan هست.
- **بازطراحی کارت کاربران**: کارت‌ها حالا بج وضعیت (فعال/متوقف/منقضی)، UUID با دکمه کپی، و دکمه‌های عملیات با لیبل دارن.
- **دوزبانه بودن کامل**: همه لیبل‌ها، placeholder ها و دکمه‌ها حالا فارسی و انگلیسی هستن.
- **اعتبارسنجی فرم**: فیلد نام کاربر الزامی شده و در صورت خطا حاشیه قرمز نمایش داده میشه.
- **انیمیشن‌ها**: انیمیشن‌های نرم CSS برای باز/بسته شدن بخش‌ها و انتقال‌های UI.

### تغییرات (Changed)
- **ارتقای ورژن**: از ۲.۹.۴ به ۳.۰.۰ ارتقا یافت.
<!-- LANG:FA -->

<!-- LANG:EN -->
### Added
- **Upstream VLESS / Proxy Chaining**: You can now connect your panel to another VLESS server as an upstream so traffic routes through that server and restrictions can be bypassed.
- **Upstream VLESS Explanations**: A dedicated section with simple Farsi explanations and links to free config provider websites.
- **v2rayN JSON Format**: Added `?flag=vjson` subscription format to the subscription page.
- **Bilingual Custom Routing**: The custom routing section now has both Farsi and English descriptions.
- **Custom Confirm Modal**: Replaced browser's default alert/confirm dialogs with a styled custom modal.
- **Draft Auto-Save**: The Add User form now auto-saves your input. If you close the page and come back, your data is still there.
- **Auto-Copy Subscription Link**: After creating a new user, the subscription link is automatically copied to your clipboard.
- **Toast Notifications**: Success and error messages now appear as toast notifications.

### Fixed
- **Instant Language Switching**: Switching language now updates all text immediately without needing to refresh the page.
- **FAQ Text Contrast**: Improved text contrast in the FAQ section for dark mode.
- **Subscription Page RTL Layout**: Boxes and buttons no longer flip when switching languages.
- **FAQ English Boxes**: English answer boxes now display correctly left-to-right.
- **Sidebar Hover Color**: Hover color on sidebar items is now white in dark mode.
- **Nodes Tab Alignment**: The mobile Nodes tab icon is now aligned with other sidebar items.
- **Settings Tab Width**: The Settings section now takes full width instead of half-empty layout.

### Improved
- **Redesigned Add/Edit User Forms**: Forms split into 4 numbered sections with collapsible advanced settings.
- **Modern Protocol Toggle**: Plain checkboxes replaced with toggle switches for VLESS/Trojan selection.
- **Redesigned User Cards**: Cards now show status badges (Active/Paused/Expired), UUID with copy button, and labeled action buttons.
- **Full Bilingual Support**: All labels, placeholders, and buttons are now in both Farsi and English.
- **Form Validation**: User name field is now required with visual error feedback (red border).
- **Smooth Animations**: CSS animations for accordion sections and UI transitions.

### Changed
- **Version Bump**: Upgraded from 2.9.4 to 3.0.0.
<!-- LANG:EN -->

---

## [2.9.4] - 2026-07-06

<!-- LANG:FA -->
### اضافه شده (Added)
- **محدودیت کانفیگ (maxConfigs)**: افزودن قابلیت maxConfigs برای محدود کردن تعداد کانفیگ‌های تولید شده هر کاربر.
- **ردیابی اتصالات زنده**: تعداد لحظه‌ای اتصالات استریم زنده در داشبورد برای هر کاربر/پروفایل اضافه شد.
- **کرون‌جاب آپدیت خودکار**: افزودن قابلیت برنامه‌ریزی کرون‌جاب (cron) برای بروزرسانی خودکار ورکر Cloudflare.
- **پشتیبانی از v2rayN JSON**: پشتیبانی از پارامتر `?format=vjson` برای خروجی پیکربندی‌های خام V2Ray/v2rayN JSON.
- **دریافت داینامیک رابط کاربری**: فایل‌های HTML داشبورد و صفحه اشتراک اکنون به صورت داینامیک دریافت می‌شوند که حجم ورکر را به شدت کاهش می‌دهد.

### رفع شده (Fixed)
- **منطق محدودیت اتصالات**: رفع مشکل منطق محدودیت `activeConnections` و کاهش صحیح آن هنگام بسته شدن وب‌ساکت.
- **امنیت احراز هویت**: حذف جستجوی کلید احراز هویت از پارامتر URL برای جلوگیری از ثبت در لاگ‌های سرور.

### بهبود یافته (Improved)
- **بروزرسانی خودکار داشبورد**: اضافه شدن تازه‌سازی خودکار آمار داشبورد با استفاده از کرون زمان‌بندی داخلی.
- **مدیریت حافظه**: افزودن محدودیت مدیریت حافظه که `configRegistry` را پس از ۱۰ هزار ورود پاک می‌کند تا از خطاهای حافظه جلوگیری شود.
<!-- LANG:FA -->

<!-- LANG:EN -->
### Added
- **maxConfigs per user**: Added maxConfigs option per user to limit the number of generated configurations.
- **Live active connections**: Live active connections stream count in the dashboard for each user/profile.
- **Auto-Update Cron**: Added scheduled cron job capability for automatic Cloudflare worker updates.
- **v2rayN JSON output**: Added `?format=vjson` parameter support for raw V2Ray/v2rayN JSON configuration outputs.
- **Dynamic UI Fetching**: Dashboard HTML & Subscription Info HTML are now dynamically fetched, drastically reducing worker payload size.

### Fixed
- **Connection limit tracking**: Fixed activeConnections tracking limit logic and decrements upon WebSocket close.
- **Security enhancement**: Removed url authentication key fallback to prevent potential API key logging in server access logs.

### Improved
- **Dashboard auto-refresh**: Added auto-refreshing dashboard stats using setInterval on dashboard intervals.
- **Memory management**: Added memory management limit that clears configRegistry if it exceeds 10,000 entries.
<!-- LANG:EN -->

---

## [2.9.1] - ۱۴۰۵-۰۴-۰۴ (2026-06-26)

<!-- LANG:FA -->
### اضافه شده (Added)
- **مسیریابی آی‌پی رله به‌ازای هر کانفیگ تروjan**: نودهای تروjan اکنون از طریق پیلود مسیر وب‌ساکت، آی‌پی رله تعیین‌شده خود را دریافت می‌کنند (مانند VLESS).
- **زنجیره بازگشت سه‌گانه استخراج شاخص رله**: پارامتر کوئری → بخش عددی مسیر → پیلود JSON باینری.
- **محدودیت اتصال دستگاه برای هر کاربر (connLimit)**: محدود کردن اتصالات همزمان هر مشترک.
- **سیستم کلید API پنل**: احراز هویت امن اتصال نود به پنل.
- **فرم‌های کاربر سازگار با موبایل**: طرح‌بندی واکنش‌گرا بهبودیافته برای فرم‌های افزودن/ویرایش.

### رفع شده (Fixed)
- **رفع خطای افست هدر تروjan** (hPos+2 → hPos+4): اتصالات تروjan ۲ بایت اول پس از فیلد پورت را حذف می‌کردند.
- **رفع رمز عبور تروjan**: رمز عبور به‌جای configUuid تولیدشده از UUID خام کاربر استفاده می‌کند.
- **ثبت هش SHA224**: افزودن هش SHA224 در configRegistry برای جستجوی تروjan.
- **حذف فیلدهای اضافی**: حذف میزبان‌های نگهداری و کلید API همگام‌سازی از بخش آدرس پروکسی پیشرفته.

### بهبود یافته (Improved)
- **مسیریابی آی‌پی رله تروjan**: استفاده از قالب پیلود JSON باینری مسیر وب‌ساکت مانند VLESS.
- **解析 آدرس رله**: استفاده از getEffectivePips با پشتیبانی NAT64 برای هر دو پروتکل.
- **متغیر reqPath**: افزودن به buildYamlProfile برای تولید مسیر یکپارچه.
<!-- LANG:FA -->

<!-- LANG:EN -->
### Added
- **Per-config relay IP routing for Trojan**: Trojan nodes now route through their designated relay IP via WebSocket path payload, matching VLESS behavior (USA→USA, Germany→Germany).
- **Triple-fallback relay index extraction**: Query parameter → numeric path segment → base64 JSON payload.
- **Device connection limit per user (connLimit)**: Cap simultaneous connections per subscriber.
- **Panel API key system**: Secure node-to-panel authentication with multiple key support.
- **Mobile-friendly user modals**: Improved responsive layout for add/edit user forms.

### Fixed
- **Trojan header offset parsing** (hPos+2 → hPos+4): Trojan connections were silently dropping the first 2 bytes of payload after the port field.
- **Trojan password regression**: Password was set to generated configUuid instead of raw user UUID — clients could never authenticate because SHA224(configUuid) ≠ SHA224(p.id).
- **SHA224 hash registration**: Added to configRegistry so Trojan lookup works when isolate is warm.
- **Advanced tab cleanup**: Removed Maintenance Hosts (Camouflage) and Sync API Key (Slave Push) from Proxy Relay IP section.

### Improved
- **Trojan relay IP routing**: Uses same base64 JSON WebSocket path payload as VLESS for maximum client compatibility.
- **Relay IP resolution**: Uses getEffectivePips with NAT64 awareness for both VLESS and Trojan protocols.
- **reqPath variable**: Added to buildYamlProfile for consistent path generation.
<!-- LANG:EN -->

---

## [2.6.0] - ۱۴۰۵-۰۴-۰۳ (2026-06-24)

<!-- LANG:FA -->
### اضافه شده (Added)
- **صفحه اشتراک چندزبانه با حالت تاریک/روشن**: صفحه اطلاعات اشتراک کاربر با پشتیبانی کامل از فارسی و انگلیسی، چیدمان RTL و قابلیت تغییر تم.
- **پشتیبانی NAT64**: تبدیل خودکار آدرس‌های IPv4 به IPv6 با قابلیت تنظیم چندین پیشوند.
- **نودهای اختصاصی کاربر**: امکان تعریف هاست اختصاصی برای هر مشترک به‌صورت جداگانه.
- **کانفیگ‌های مستقیم**: تولید کانفیگ‌های اضافی بدون نیاز به آدرس پروکسی.
- **بروزرسانی خودکار**: دریافت و استقرار نسخه‌های جدید مستقیماً از داشبورد.
- **کانفیگ‌های جعلی قابل تنظیم**: ورودی‌های اشتراک سفارشی با نمایش مصرف و انقضا.
- **اتصال ربات تلگرام از داشبورد**: مدیریت کامل دروازه از طریق دکمه‌های تلگرام.

### بهبود یافته (Improved)
- **عملکرد داشبورد**: بهبود چشمگیر سرعت اسکرول و بارگذاری صفحات.
- **تولید کانفیگ‌ها**: بازنویسی کامل تمام فرمت‌های خروجی (URI، YAML، Clash، SingBox).
- **تشخیص موقعیت آدرس‌ها**: بهبود سرعت و دقت نمایش پرچم کشورها.
- **نام‌گذاری هوشمند کانفیگ‌ها**: پشتیبانی از تگ‌های جدید شامل کشور، شهر، ارائه‌دهنده، تاریخ و نام ورکر.

### رفع شده (Fixed)
- **ترجمه‌های فارسی معیوب**: اصلاح تمام متن‌های نادرست رابط کاربری فارسی.
- **خطای صفحه اشتراک**: رفع خطای نمایش صفحه اطلاعات اشتراک.
<!-- LANG:FA -->

<!-- LANG:EN -->
### Added
- **Bilingual Subscription Page with Dark/Light Mode**: Full Persian and English support, RTL layout, and theme toggle on the subscription info page.
- **NAT64 Support**: Automatic IPv4-to-IPv6 address conversion with multiple prefix support.
- **Per-User Custom Nodes**: Define dedicated hostnames for each subscriber independently.
- **Direct Configs**: Generate additional subscription entries that connect directly without proxy IPs.
- **Auto Update**: Receive and deploy new versions directly from the dashboard.
- **Customizable Fake Configs**: Custom subscription entries showing usage and expiry information.
- **Telegram Bot from Dashboard**: Full gateway management via inline Telegram buttons.

### Improved
- **Dashboard Performance**: Significant speed improvements for scrolling and page loading.
- **Config Generation**: Complete rewrite of all output formats (URI, YAML, Clash, SingBox).
- **Geo-Location Detection**: Faster and more accurate country flag display for IP addresses.
- **Smart Config Naming**: New tags for country, city, ISP, date, and worker name.

### Fixed
- **Garbled Persian Translations**: Corrected all incorrect UI text in the Persian interface.
- **Subscription Page Error**: Fixed the subscription info page display issue.
<!-- LANG:EN -->

---

## [2.5.7] - ۱۴۰۵-۰۳-۲۹ (2026-06-19)

<!-- LANG:FA -->
### اضافه شده (Added)
- **پشتیبان‌گیری هوشمند از مقادیر اختصاصی کاربر**: امکان تنظیم آی‌پی تمیز دلخواه، آی‌پی پروکسی دلخواه و نام کانفیگ دلخواه با قابلیت استخراج خودکار و ادغام هوشمند با مقادیر تنظیم شده جهانی در پنجره‌های ویرایش و افزودن کاربر.
- **نگاشت بلادرنگ پرچم‌ها با api.country.is**: یکپارچه‌سازی وب‌سرویس متن‌باز، رایگان و بدون تحریم api.country.is جهت استخراج پرچم دقیق کشورها برای آدرس‌های آی‌پی پروکسی و تمیز.

### رفع شده (Fixed)
- **حل ناسازگاری آدرس‌های پشت کلودفلر**: رفع خطای عدم لود کامل صفحات و فایل‌های ایستای وب‌سایت‌های پشت کلودفلر (بلاک شدن اتصال به دلیل پراکندگی سشن‌ها) بر روی کلاینت‌هایی با آی‌پی‌های پروکسی متعدد؛ حل شده به کمک مکانیزم هش یکنواخت کاربر (Consistent Per-User Session Hashing) و سوییچ خودکار (Failover) به پروکسی‌های کلاینت دیگر.
- **تفکیک صحیح آی‌پی‌های جهانی**: تصحیح فیلتر و عبارات منظم فرانت‌اند در مروگر جهت تفکیک دقیق لیست آی‌پی‌های لبه سراسری که با اینتر، ویرگول، نقطه ویرگول یا بک‌اسلش از هم جدا شده‌اند.
- **حل خطای فلگ سازگاری کلودفلر**: برطرف کردن خطای بروزرسانی و استقرار خودکار پنل کلودفلر با جایگزینی فلگ منسوخ‌شده `unsafe-eval` با فلگ پیشرفته `allow_eval_during_startup` جهت عدم بروز کرش در شروع به کار.

### بهبود یافته (Improved)
- **پایداری فرم‌‌ها و اشتراک**: افزایش پایداری و اصلاح کنترل اعتبارهای سمت سرور و فرانت‌اند برای ارتقای امنیت و سرعت پنل نهان.
<!-- LANG:FA -->

<!-- LANG:EN -->
### Added
- **Smart User-Specific Backups**: Support entering custom clean IPs, proxy IPs, and custom config names for each subscriber in Add/Edit modals, with automatic extraction and seamless database merging.
- **Real-time Country Flagging via api.country.is**: Integrated free, open-source and keyless api.country.is service for mapping IP addresses to country flags.

### Fixed
- **Cloudflare Compatibility Flag Fix**: Resolved update and deployment error (`No such compatibility flag: unsafe-eval` & startup `Uncaught EvalError`) by updating the compatibility flag to the modern `allow_eval_during_startup`.
- **Cloudflare IP Splitting Fix**: Resolved session disruptions and partial page loads for sites behind Cloudflare by implementing Consistent Per-User Session Hashing and automated failover.
- **Browser-Side IP Parsing**: Fixed UI regular expressions to split global IP lists separated by commas, semicolons, tabs, or backslashes.

### Improved
- **Robustness & Validation**: Enhanced stability of user management modals and subscription validation logic inside the control panel.
<!-- LANG:EN -->

---

## [2.5.6.1] - ۱۴۰۵-۰۳-۲۸ (2026-06-18)

<!-- LANG:FA -->
### اضافه شده (Added)
- **تنظیمات اختصاصی کاربر جدید**: امکان تعیین نام کانفیگ دلخواه، آی‌پی پروکسی اختصاصی و آی‌پی تمیز (Clean IP) به صورت مجزا برای هر کاربر در پنجره افزودن کاربر (Add User Modal) فراهم شد.

### رفع شده (Fixed)
- **رفع خطای بحرانی جاوااسکریپت**: رفع خطای بروز داده شده هنگام ثبت کاربر جدید مربوط به عدم تعریف صحیح متغیر آی‌پی پروکسی (`ReferenceError: proxyIp is not defined`).

### بهبود یافته (Improved)
- **هماهنگ‌سازی مقادیر اختصاصی**: بهبود فرایند ساخت کانفیگ‌های اشتراک و همگام‌سازی بی‌نقص مقادیر کاربری با پیکربندی‌های خروجی.
<!-- LANG:FA -->

<!-- LANG:EN -->
### Added
- **User-Specific Dynamic Settings**: Added options to set custom proxy IP, custom clean IP, and config name per subscriber in the Add User modal.

### Fixed
- **JavaScript Critical Fix**: Fixed a critical client-side error (`ReferenceError: proxyIp is not defined`) occurring during new user registration.

### Improved
- **Sync Optimization**: Enhanced subscription generation and alignment of custom user values.
<!-- LANG:EN -->

---

## [2.5.6] - ۱۴۰۵-۰۳-۲۸ (2026-06-18)

<!-- LANG:FA -->
### اضافه شده (Added)
- **توزیع بار آی‌پی‌های پروکسی چندگانه**: پشتیبانی از لیست آی‌پی‌های پروکسی چندگانه (بخش‌بندی شده با کاما، نقطه ویرگول یا خط جدید) در تنظیمات پروفایل برای توزیع و چرخش خودکار بین کانفیگ‌ها به منظور عبور از محدودیت‌های کلودفلر.
- **تطبیق دقیق پرچم کشور**: پیاده‌سازی تشخیص خودکار و بلادرنگ پرچم کشور بر اساس آی‌پی پروکسی فعال استفاده‌شده در کانفیگ‌های خروجی.

### رفع شده (Fixed)
- **فرمت حمل‌ونقل وب‌ساکت**: تصحیح و حل ناسازگاری‌های مربوط به فرمت‌های خروجی وب‌ساکت در Vless و Trojan برای کلاینت‌های Clash و Sing-Box.
- **کش اطلاعات پیش‌فرض**: تصحیح خطاهای کش پرچم در بارگذاری اولیه اشتراک‌ها.
<!-- LANG:FA -->

<!-- LANG:EN -->
### Added
- **Load Balancing Over Multi-Proxy IPs**: Automated rotating and load balancing across multi-proxy lists to bypass Cloudflare request limits.
- **Dynamic Flag Resolution**: Automatic country flag matching based on the active proxy IP coordinates in generated nodes.

### Fixed
- **Transport Configurations**: Corrected formatting errors in outbound VLESS/Trojan WebSocket settings for Clash and Sing-Box.
- **Cache Invalidation**: Rectified early flag rendering cache errors during initial subscription feed load.
<!-- LANG:EN -->
