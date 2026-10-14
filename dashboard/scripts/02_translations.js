          const CURRENT_VERSION = "__CURRENT_VERSION__";
          const i18n = {
              en: {
                  title: "Nahan Gateway", pass_ph: "Master Key", login_btn: "Authenticate", err_pass: "Access Denied", missing_db: "⚠️ IOT_DB namespace missing! Settings won't save.", system_online: "System online",
                  logout: "Disconnect", tab_overview: "Dashboard", tab_info: "Endpoints", tab_status: "Metrics", tab_settings: "System", tab_adv: "Advanced", tab_logs: "Logs", tab_help: "Help & FAQ",
                  tab_optimiser: "CF Optimizer",
                  tab_more: "More",
                  drawer_title: "Navigation & Tools",
                  quick_copy_sub: "Copy Sub URL",
                  ov_hub_title: "Universal Subscription Hub",
                  ov_hub_subtitle: "Cloudflare Edge Tunnel Active",
                  ov_hub_desc: "Connect seamlessly with Sing-Box, Clash, or V2Ray. Use CF Optimizer to inject Fragment & ECH.",
                  user_limit_label: "Subscriber Limit:",
                  user_cap_quota: "Subscriber Capacity Limit",
                  user_cap_desc: "Up to 5 active client subscriptions are allowed per gateway instance for optimal edge isolation.",
                  user_cap_reached: "⚠️ Maximum limit of 5 users reached.",
                  optimiser_title: "Subscription Auto-Optimizer & Anti-Censorship",
                  opt_auto_apply_lbl: "Auto-Apply to All Subscription Links",
                  opt_auto_apply_desc: "Inject selected fragment rules and cipher suites directly into subscriber links",
                  opt_tuning_title: "Anti-Filtering Parameters Tuning",
                  opt_preview_title: "Live Optimized Sublink & Configs Preview",
                  opt_active_sub_lbl: "Universal Subscription URL",
                  opt_sample_cfg_lbl: "Generated Anti-Censorship Config Preview",
                  opt_copy_sample: "Copy Sample Config",

                  optimiser_desc: "Inject anti-censorship Fragment parameters, modern Cipher Suites, and convert to ECH (Encrypted Client Hello) to bypass severe network throttling.",
                  opt_tab_fragment: "Fragment & Cipher Suites",
                  opt_tab_ech: "Convert to ECH",
                  opt_load_nahan: "Import My Nahan Configs",
                  opt_input_title: "Input Configs & Subscriptions",
                  opt_paste: "Paste",
                  opt_file: "File",
                  opt_clear: "Clear",
                  opt_adv_title: "Advanced Fragment, Cipher & ECH Tuning",
                  opt_addr: "Server Address Override (Optional)",
                  opt_addr_hint: "Leave empty to keep original server IP or hostname.",
                  opt_fp: "TLS Fingerprint",
                  opt_cs: "Cipher Suites (cs)",
                  opt_fm: "FinalMask (fm) Fragment JSON",
                  opt_ech_dns: "Cloudflare ECH DNS Resolvers",
                  opt_ech_suffix: "Remark Suffix Template",
                  opt_optimize_btn: "Optimize & Generate Configs",
                  opt_output_title: "Optimized Output",
                  opt_copy_all: "Copy All",
                  opt_download_txt: "Download TXT",
                  opt_export_json: "Export Client JSON",
                  opt_apps_title: "Recommended Compatible Clients",
                  nav_sec_main: "Main Control",
                  nav_sec_connect: "Connectivity",
                  nav_sec_mgmt: "System & Rules",
                  qr_title: "Direct Stream Link", badge_multi: "Dual-Core Multiplexed", copy: "Copy", copied: "Copied to clipboard!", sync_link: "Cloud Sync URL", active_id: "Hardware ID",
                  stat_ip: "Origin IP", stat_dc: "Edge Node", stat_loc: "Data Region",
                  lbl_proto: "Primary Display Mode", lbl_port: "Data Port", lbl_id: "Device UUID (Empty=Auto)",
                  lbl_path: "API Route (Hidden Path)", lbl_pass: "Master Key", lbl_fp: "TLS Signature", lbl_dns: "Resolver IP",
                  lbl_clean_ips: "Clean IPs (Multi-Generator)", ph_clean_ips: "1.1.1.1, 2.2.2.2", desc_clean_ips: "Separate IPs by comma or new line. The Sync URL will multiply configs for all IPs.",
                  lbl_fake: "Maintenance Hosts (Camouflage)", lbl_relay: "Backup Relay IP", lbl_tfo: "TCP Fast Open", lbl_ech: "Secure Hello (ECH)",
                  lbl_fake_configs: "Subscription Fake Entries", desc_fake_configs: "Customize info entries shown in subscription profiles. Use {usage} and {expiry} for dynamic values.", btn_add_entry: "Add Entry",                   lbl_tg_token: "Telegram Bot Token", lbl_tg_chat: "Telegram Chat ID", lbl_tg_admin: "Authorized Telegram Admin ID", desc_tg_admin: "Only this Telegram User ID can manage the panel via bot. Leave empty to use Chat ID.", desc_tg_bot: "Set these values to receive login alerts via Telegram.",
                  lbl_cf_acc: "Cloudflare Account ID", lbl_cf_token: "Cloudflare API Token", desc_cf_api: "Optional: Monitor Worker daily usage limit (100k/day). Requires Account Analytics read permission.",
                  lbl_silent: "Silent UI Alerts", lbl_pause: "Kill Switch (Pause System)",
                  lbl_sub_ua: "Custom Subscription User-Agent", desc_sub_ua: "Allow specific browser User-Agent containing this text to bypass camouflage and retrieve profile data directly in web browser.",
                  tab_users: "Clients",
                  user_mgt_title: "User Management", user_mgt_desc: "Manage multiple users, set traffic limits, and expiration dates.", btn_add_user: "+ Add New User",
                  tbl_name: "Name", tbl_uuid: "UUID", tbl_traffic: "Traffic (Used / Limit)", tbl_exp: "Expiration", tbl_action: "Action", no_users: "No users found. Create one above.",
                  modal_add_title: "Add New User", lbl_u_name: "Name (Required)", lbl_u_gb: "Traffic Limit (GB) - Optional", lbl_u_days: "Duration (Days) - Optional", btn_cancel: "Cancel", btn_confirm: "Add User",
                  limit_total: "Traffic (GB) Limit (Leave empty for unlimited)", limit_daily: "Daily Requests Limit (Leave empty for unlimited)",
                  limit_days: "Expiration limit (Days) - Leave empty for unlimited", edit_sub: "Edit Subscriber", lbl_name_ph: "Name or UUID",
                  btn_save_changes: "Save Changes", save_btn_user: "Save User", save_btn: "Save Config", msg_saving: "Saving...", msg_saved: "Saved!", msg_err: "Connection Error", status_active: "Active", status_paused: "Paused", status_expired: "Expired",
                  stat_total_subscribers: "Total Subscribers", stat_active_paused: "Active / Paused", stat_cumulative_traffic: "Cumulative Traffic", stat_auto_disabled: "Auto-Disabled",
                  sub_directory_title: "Subscriber Directory", sub_directory_desc: "Search, modify bounds, toggle traffic limits or clear billing sessions.", user_search_placeholder: "🔍 Find by Name or UUID...",
                  filter_all: "All Users", filter_active: "Active", filter_paused: "Paused", filter_auto_disabled: "Auto-Disabled",
                  disabled_panel_title: "Recently Disabled Users", disabled_panel_desc: "Users automatically disabled due to quota or expiration limits",
                  lbl_u_Protocol:"Protocol Mode (Leave empty to use global setting)",
                  lbl_u_ports:"Custom Ports (Optional - overrides global ports, comma separated e.g. 443,80",
                  lbl_u_max_config:"Max Configs",
                  login_password:"Password",
                  lbl_u_ipproxy:"User Proxy IP(s) (Optional - overrides global Clean IP, comma/newline separated)",
                   lbl_custom_panel_url:"Custom Panel URL / Subscription Domain",
                   lbl_api_keys: "Panel API Keys", desc_api_keys: "Generate API keys to securely connect remote panels. Remote panels use these keys instead of sharing your master key.",
                   btn_generate_key: "Generate Key", api_key_created: "API Key Created! Copy it now — it won't be shown again.",
                   api_keys_empty: "No API keys generated yet.", enter_key_name: "Enter a name for this API key:",
                   confirm_revoke: "Revoke this API key? The remote panel will lose access.", revoke: "Revoke",
                   created: "Created", last_used: "Last used", never: "Never",
                   v_pop_title: "Release Notice", v_pop_whatsnew: "What's New", v_pop_headline: "New Features & Improvements",
                  v_pop_btn: "Got it!",
                  changelog_title: "Release Notes & Changelog:",
                  changelog_added: "Added", changelog_fixed: "Fixed", changelog_improved: "Improved", changelog_changed: "Changed", changelog_note: "Important Notes",
                  ov_total_users: "Total Users", ov_active_users: "Active", ov_paused_users: "Paused", ov_auto_disabled: "Auto-Disabled", ov_expired_users: "Expired",
                  ov_total_traffic: "Total Traffic", ov_today_traffic: "Today's Traffic", ov_requests: "requests", ov_active_conns: "Active Connections",
                  ov_system: "Settings", ov_recent_activity: "Recent Activity", ov_view_all: "View All →", ov_loading: "Loading...",
                   ov_quick_actions: "Quick Actions", ov_add_user: "Add User", ov_backup_config: "Backup Config", ov_refresh: "Refresh Statistics", ov_manage_users: "Manage Users",
                   ov_gb_unit: "GB",
                    lbl_allow_sync:"Allow Sync",
                    other_nodes_title: "Other Nodes", other_nodes_desc: "External nodes (URL + API Key) for cross-panel management.",
                    add_node_title: "Add External Node", add_node_desc: "Enter the URL and API Key of the external panel.",
                    add_node_url: "Node URL", add_node_apikey: "API Key", add_node_confirm: "Add Node", add_node_invalid: "Please enter both URL and API Key.",
                    node_added: "Node added successfully!", node_removed: "Node removed.",
                    deploy_btn: "Deploy Now", update_deploying: "Deploying update...",
                   update_success: "Update successful! Reloading...", update_error: "Update failed",
                   lbl_cf_worker: "CF Worker Script Name", desc_cf_worker: "Required for in-panel updates. The script name shown in your Cloudflare Workers dashboard.",
                   view_github: "View on GitHub",
                    cf_help_title: "Need help getting these? Beginner's Step-by-Step Guide",
                    lbl_update_format: "Update Format & Obfuscated Options:",
                    desc_update_format: "Deploy clean source code, or encrypt using dynamic XOR byte-shifting to avoid network interception.",
                    format_normal: "Normal (_worker.js)",
                    format_obfuscated: "Obfuscated (UTF-8 + XOR)",
                     btn_redeploy_force: "Force Redeploy / Switch Format",
                    adv_network_dns: "Network & DNS", adv_proxy_relay: "Proxy & Relay", adv_subscription: "Subscription",
                    adv_upstream_title: "Upstream VLESS", adv_upstream_badge: "Sing-Box / Clash",
                    adv_upstream_desc1: "<strong>What does this do?</strong><br>It lets you use a free VLESS server (from sites like RaceVPN or SSHMax) so all your traffic goes through that server. Your exit IP becomes the server's IP.",
                    adv_upstream_desc2: "<strong>Why is it useful?</strong><br>Sometimes you need an IP from a specific country (like Germany or USA) but don't want to buy a server. This lets you use that country's IP for free.",
                    adv_upstream_desc3: "<strong>How to use?</strong><br>1. Get a VLESS link from one of the sites below<br>2. Paste it here<br>3. Click Save<br>4. Use the subscription link (Sing-Box or Clash format)",
                    adv_upstream_label: "VLESS Server Link", adv_upstream_hint: "Copy a VLESS link from one of these sites and paste it here:",
                    adv_upstream_providers: "Free VLESS Providers:", adv_upstream_warning: "Free configs usually expire after a few days. If the connection drops, get a new link and replace it. Also only works with Sing-Box and Clash formats.",
                    adv_routing_title: "Custom Routing", adv_routing_desc: "<strong>What does this do?</strong><br>Some sites or addresses you want to access directly without proxy. Add them here so their traffic goes through the normal path instead of the proxy.", adv_routing_label: "Custom Direct Routing", adv_routing_hint: "One domain, IP, geoip (e.g., geoip:ir) or geosite (e.g., geosite:ir) per line.", adv_routing_warning: "Wrong entries or bad formatting can break connections. Double check before saving.",
                    adv_protocol: "Protocol", adv_telegram: "Telegram Bot", adv_cloudflare: "Cloudflare",
                    stat_datetime: "Date Time",
                    desc_custom_panel_url: "Optionally specify a custom domain/URL to be used for subscription/sync links. If empty, the default Worker address will be used.",
                    lbl_custom_config_name: "Custom Config Name",
                    lbl_traffic_limit_gb: "Traffic Limit (GB)",
                    lbl_daily_limit_gb: "Daily Limit (GB)",
                    lbl_expiration_days: "Expiration (Days)",
                    loading_logs: "Loading activity logs...", show_qr: "Show QR Code",
                    no_matching_users: "No matching subscribers found", no_active_conn: "No active connection data yet.",
                    qr_subtitle: "Scan with your V-Core or T-Core client",
                    no_activity_logs: "No activity logs found.", no_recent_activity: "No recent activity.",
                    no_ips_advanced: "No IPs added in Advanced Tab", no_nodes_advanced: "No slave nodes in Advanced Tab",
                    no_changelog: "No changelog available for this version.", no_changes: "No changes documented.",
                    update_requires_cf: "Set CF Account ID, API Token, and Worker Name to enable in-panel deploy.",
                    section_basic_info: "Basic Info", section_limits: "Limits", section_network: "Network", section_advanced: "Advanced",
                    section_advanced_tag: "(Advanced)", section_advanced_subtag: "(Protocol & Ports)", unlimited: "Unlimited", placeholder_user_name: "e.g. Ali", placeholder_config_name: "Leave empty to use user name", desc_user_name: "Name shown in the user list", placeholder_name: "Name",
                    placeholder_user_name: "e.g. Ali", placeholder_config_name: "Leave empty to use user name", desc_user_name: "Name shown in the user list", placeholder_name: "Name",
                    lbl_nat64: "NAT64 Prefix", desc_nat64: "Optional. Converts IPv4 Proxy IPs to NAT64 IPv6 addresses. Supports multiple prefixes.",
                    lbl_direct_configs: "Include Direct Configs", desc_direct_configs: "Generate configs without Proxy IP alongside relay configs",
                    lbl_sync_api_key: "Sync API Key (Slave Push)", desc_sync_api_key: "API key from a slave panel. Main uses this to push config. Same key must exist on each slave's Panel API Keys.",
                    lbl_auto_update: "Auto-Update", desc_auto_update: "Automatically deploy when a new version is detected",
                    lbl_auto_update_format: "Update Format", format_normal_label: "Normal", format_obfuscated_label: "Obfuscated",
                    desc_format_normal: "Standard _worker.js", desc_format_obfuscated: "XOR byte-shifting",
                    lbl_prefix: "Custom Name Prefix", html_desc_prefix_note: "This prefix is injected where the <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{PREFIX}</code> tag is used in your naming strategy.", lbl_clean_ips: "Clean IPs", lbl_proxy_ips: "Proxy IPs", lbl_assigned_nodes: "Assigned Nodes",
                    lbl_protocol_mode: "Protocol Mode", lbl_max_configs: "Max Configs",
                    desc_assigned_nodes: "Custom Nodes (comma/newline, empty = all nodes)",
                    desc_nat64_user: "Optional. Converts IPv4 Proxy IPs to NAT64 IPv6 addresses.",
                    desc_proxy_ips: "Custom Proxy IPs (comma/newline)",
                    desc_clean_ips_modal: "Custom Clean IPs (comma/newline)",
                    btn_generate_uuid: "Generate UUID",
                    lbl_conn_limit: "Connection Limit", desc_conn_limit: "Max simultaneous connections per user. Leave empty for unlimited.",
                    lbl_user_panel_url: "Main Panel URL", desc_user_panel_url: "Main panel domain for custom nodes. If empty, default panel URL is used.",
                    html_desc_strategy: "<details><summary class='cursor-pointer text-primary'>View supported placeholders...</summary><div class='mt-2'>Supported placeholders: <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{FLAG}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{COUNTRY}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{CITY}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{ISP}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{PROTOCOL}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{USER}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{PORT}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{PREFIX}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{IP}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{IP_NAME}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{HOST}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{DATE}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{INDEX}</code>, <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{WORKER}</code>.<br><span class='text-[10px] text-slate-400 dark:text-slate-500 leading-snug'>• <b>{FLAG}</b>: Country flag emoji (e.g. 🇺🇸).<br>• <b>{COUNTRY}</b>: Country name.<br>• <b>{CITY}</b>: City name.<br>• <b>{ISP}</b>: ISP / ASN org.<br>• <b>{PROTOCOL}</b>: Core mode (VLESS / Trojan).<br>• <b>{USER}</b>: Subscriber name.<br>• <b>{PORT}</b>: Active port.<br>• <b>{PREFIX}</b>: Custom prefix.<br>• <b>{IP}</b>: Clean IP address.<br>• <b>{IP_NAME}</b>: Clean IP name.<br>• <b>{HOST}</b>: Hostname.<br>• <b>{DATE}</b>: Current date.<br>• <b>{INDEX}</b>: Config index.<br>• <b>{WORKER}</b>: Worker name.</span><br>Pre-defined strategies: <code>default</code>, <code>type-user-port</code>, <code>user-port</code>, <code>host-port-user</code>, <code>prefix-user-port</code>, <code>ip</code>.</div></details>",
               },
              fa: {
                  title: "دروازه نهان", pass_ph: "کلید اصلی", login_btn: "ورود به سیستم", err_pass: "دسترسی مسدود شد", missing_db: "⚠️ فضای پایگاه داده یافت نشد! تنظیمات ذخیره نمی‌شوند.", system_online: "سیستم فعال است",
                  logout: "خروج", tab_overview: "نمای کلی", tab_info: "نودها", tab_status: "شبکه", tab_settings: "تنظیمات", tab_adv: "پیشرفته", tab_logs: "گزارش فعالیت", tab_help: "راهنما و سوالات",
                  tab_optimiser: "بهینه‌ساز کانفیگ",
                  tab_more: "بیشتر",
                  drawer_title: "ناوبری و ابزارها",
                  quick_copy_sub: "کپی لینک ساب",
                  ov_hub_title: "مرکز اشتراک و اتصال مستقیم",
                  ov_hub_subtitle: "دروازه لبه کلودفلر فعال است",
                  ov_hub_desc: "اتصال سریع با Sing-Box، Clash یا V2Ray. با بهینه‌ساز فرگمنت و ECH فیلترینگ شدید را دور بزنید.",
                  user_limit_label: "سقف کاربران:",
                  user_cap_quota: "سقف مجاز ایجاد مشترکین",
                  user_cap_desc: "حداکثر ۵ کاربر فعال برای تضمین پایداری و عدم مسدودیت مجاز است.",
                  user_cap_reached: "⚠️ سقف مجاز ۵ کاربر تکمیل شده است.",
                  optimiser_title: "بهینه‌ساز خودکار لینک اشتراک و دور زدن فیلترینگ",
                  opt_auto_apply_lbl: "اعمال خودکار به تمام لینک‌های ساب",
                  opt_auto_apply_desc: "تزریق مستقیم قوانین فرگمنت، سایفرها و ECH به لینک‌های ساب مشترکین",
                  opt_tuning_title: "تنظیم پارامترهای ضد فیلترینگ",
                  opt_preview_title: "پیش‌نمایش زنده لینک ساب و کانفیگ‌ها",
                  opt_active_sub_lbl: "لینک اشتراک جامع (Universal Sublink)",
                  opt_sample_cfg_lbl: "پیش‌نمایش نمونه کانفیگ ضد فیلترینگ",
                  opt_copy_sample: "کپی نمونه کانفیگ",

                  optimiser_desc: "تزریق پارامترهای پیشرفته فرگمنت (Fragment)، امضای سایفرها (Cipher Suites) و تبدیل به ECH برای رفع اختلال و فیلترینگ.",
                  opt_tab_fragment: "بهینه‌ساز فرگمنت و سایفر",
                  opt_tab_ech: "تبدیل به ECH",
                  opt_load_nahan: "دریافت خودکار کانفیگ‌های فعال نهان",
                  opt_input_title: "کانفیگ‌ها و لینک‌های ورودی",
                  opt_paste: "چسباندن",
                  opt_file: "فایل",
                  opt_clear: "پاک کردن",
                  opt_adv_title: "تنظیمات پیشرفته فرگمنت، سایفر و ECH",
                  opt_addr: "آدرس سرور جایگزین (اختیاری)",
                  opt_addr_hint: "خالی = آدرس سرور یا دامنه اصلی دست‌نخورده باقی می‌ماند.",
                  opt_fp: "امضای امنیتی (TLS Fingerprint)",
                  opt_cs: "لیست سایفرها (Cipher Suites)",
                  opt_fm: "تنظیمات فرگمنت FinalMask (JSON)",
                  opt_ech_dns: "سرورهای DNS ECH کلودفلر",
                  opt_ech_suffix: "الگوی پسوند نام کانفیگ",
                  opt_optimize_btn: "بهینه‌سازی و تولید کانفیگ‌ها",
                  opt_output_title: "خروجی بهینه‌شده",
                  opt_copy_all: "کپی همه",
                  opt_download_txt: "دانلود فایل متنی (TXT)",
                  opt_export_json: "صدور خروجی JSON کلاینت",
                  opt_apps_title: "کلاینت‌های پیشنهادی سازگار",
                  nav_sec_main: "کنترل اصلی",
                  nav_sec_connect: "اتصال و شبکه",
                  nav_sec_mgmt: "سیستم و قواعد",
                  qr_title: "لینک اتصال مستقیم", badge_multi: "ترکیب ترانزیت پیشرفته دوگانه", copy: "کپی", copied: "در حافظه کپی شد!", sync_link: "لینک ساب (همگام سازی ابری)", active_id: "شناسه سخت‌افزار",
                  stat_ip: "آی‌پی مبدا", stat_dc: "گره لبه", stat_loc: "منطقه داده",
                  lbl_proto: "پروتکل نمایش مستقیم", lbl_port: "پورت داده", lbl_id: "شناسه یکتا (خالی=خودکار)",
                  lbl_path: "مسیر مخفی آی‌پی‌آی", lbl_pass: "کلید اصلی", lbl_fp: "امضای امنیتی", lbl_dns: "آی‌پی تحلیلگر",
                  lbl_clean_ips: "آی‌پی‌های تمیز (مولد چندگانه)", ph_clean_ips: "1.1.1.1, 2.2.2.2", desc_clean_ips: "آی‌پی ها را با کاما یا خط جدید جدا کنید. لینک ساب برای همه ترکیب می‌سازد.",
                  lbl_fake: "سایت‌های استتار (حالت مخفی)", lbl_relay: "آی‌پی جایگزین (کمکی)", lbl_tfo: "اتصال سریع", lbl_ech: "سلام امن",
                  lbl_fake_configs: "ورودی‌های اطلاعاتی اشتراک", desc_fake_configs: "متن نمایشی ورودی‌ها در پروفایل اشتراک را سفارشی کنید. از {usage} و {expiry} برای مقادیر پویا استفاده کنید.", btn_add_entry: "افزودن ورودی", lbl_tg_token: "توکن ربات تلگرام", lbl_tg_chat: "شناسه عددی تلگرام", lbl_tg_admin: "شناسه مدیر تلگرام", desc_tg_admin: "فقط این شناسه کاربری تلگرام می‌تواند پنل را از طریق ربات مدیریت کند. خالی بگذارید برای استفاده از شناسه چت.", desc_tg_bot: "با تنظیم این مقادیر، جزئیات ورود به پنل به تلگرام ارسال می‌شود.",
                  lbl_cf_acc: "شناسه اکانت ابری", lbl_cf_token: "توکن دسترسی کاربری", desc_cf_api: "اختیاری: برای نمایش میزان مصرف روزانه کارگر از صد هزار درخواست رایگان در پیام‌های تلگرام.",
                  lbl_silent: "هشدار و پیغام خاموش", lbl_pause: "کلید توقف اضطراری",
                   lbl_sub_ua: "یوزراجنت سفارشی ساب", desc_sub_ua: "درخواست‌های مرورگر که حاوی این متن باشند، استتار را خنثی کرده و مستقیم به ساب دسترسی پیدا می‌کنند.",
                   lbl_api_keys: "کلیدهای API پنل", desc_api_keys: "کلیدهای API برای اتصال امن پنل‌های راهدور ایجاد کنید. پنل‌های راهدور به جای اشتراک‌گذاری کلید اصلی، از این کلیدها استفاده می‌کنند.",
                   btn_generate_key: "ایجاد کلید", api_key_created: "کلید API ایجاد شد! آن را کپی کنید — دوباره نمایش داده نخواهد شد.",
                   api_keys_empty: "هنوز کلید API ایجاد نشده.", enter_key_name: "نامی برای این کلید API وارد کنید:",
                   confirm_revoke: "این کلید API لغو شود؟ پنل راهدور دسترسی خود را از دست خواهد داد.", revoke: "لغو",
                   created: "ایجاد شده", last_used: "آخرین استفاده", never: "هرگز",
                   tab_users: "کاربران",
                  user_mgt_title: "مدیریت کاربران", user_mgt_desc: "مدیریت کاربران متعدد، تنظیم محدودیت ترافیک، و تاریخ انقضا.", btn_add_user: "+ افزودن کاربر جدید",
                  tbl_name: "نام", tbl_uuid: "شناسه یکتا", tbl_traffic: "ترافیک (مصرفی/محدودیت)", tbl_exp: "انقضا", tbl_action: "عملیات", no_users: "کاربری یافت نشد. از دکمه بالا یک کاربر ایجاد کنید.",
                  modal_add_title: "افزودن کاربر جدید", lbl_u_name: "نام (الزامی)", lbl_u_gb: "محدودیت ترافیک (گیگابایت) - اختیاری", lbl_u_days: "مدت زمان اعتبار (روز) - اختیاری", btn_cancel: "انصراف", btn_confirm: "افزودن کاربر",
                  save_btn: "ذخیره تنظیمات", msg_saving: "در حال ثبت...", msg_saved: "موفق!", msg_err: "خطای ارتباط",
                  backup_restore_title: "پشتیبان‌گیری و بازیابی", ping_test_title: "عیب‌یابی تاخیر شبکه", ping_test_desc: "تاخیر پاسخ‌دهی را به آی‌پی تمیز فعال اندازه بگیرید.",
                  lbl_github_repo: "مخزن منبع جهت بروزرسانی", update_avail: "بروزرسانی جدید در دسترس است!", update_btn: "دریافت آخرین کد",
                    cf_help_title: "آموزش بدست آوردن این اطلاعات برای کاربران مبتدی",
                    lbl_update_format: "قالب بروزرسانی و حذف ردگیری:",
                    desc_update_format: "سورس کد معمولی را دپلوی کنید یا از مبهم‌سازی بایت‌ها با کلید متغیر XOR برای عدم فیلترینگ استفاده نمایید.",
                    format_normal: "معمولی (_worker.js)",
                    format_obfuscated: "مبهم‌سازی شده (UTF-8 + XOR)",
                    btn_redeploy_force: "تفویض مجدد / تغییر قالب پنل",
                    adv_network_dns: "شبکه و DNS", adv_proxy_relay: "پروکسی و رله", adv_subscription: "اشتراک",
                    adv_upstream_title: "آپ‌استریم VLESS", adv_upstream_badge: "Sing-Box / Clash",
                    adv_upstream_desc1: "<strong>این بخش چیکار میکنه؟</strong><br>یه سرور رایگان VLESS (مثلاً از سایت‌هایی مثل RaceVPN یا SSHMax) به پنل معرفی می‌کنی تا تمام ترافیکت از اون سوراخ رد بشه. یعنی IP خروجیت میشه IP اون سرور.",
                    adv_upstream_desc2: "<strong>چرا لازمه؟</strong><br>بعضی وقتا به IP یه کشور خاص (مثلاً آلمان یا آمریکا) نیاز داری ولی نمی‌خوای سرور بخری. با این بخش می‌تونی رایگان از IP اون کشور استفاده کنی.",
                    adv_upstream_desc3: "<strong>چطوری استفاده کنم؟</strong><br>۱. از یکی از سایت‌های زیر یه لینک VLESS بگیر<br>۲. لینک رو اینجا paste کن<br>۳. Save کن<br>۴. از لینک سابسکریپشن (فرمت Sing-Box یا Clash) استفاده کن",
                    adv_upstream_label: "لینک سرور VLESS", adv_upstream_hint: "لینک VLESS رو از سایت‌های زیر کپی کن و اینجا بذار:",
                    adv_upstream_providers: "سایت‌های دریافت لینک رایگان:", adv_upstream_warning: "کانفیگ‌های رایگان معمولاً چند روز بیشتر دوام ندارن. اگه اتصال قطع شد، لینک جدید بگیر و جایگزین کن. همچنین فقط با فرمت‌های Sing-Box و Clash کار می‌کنه.",
                    adv_routing_title: "مسیریابی سفارشی", adv_routing_desc: "<strong>این بخش چیکار میکنه؟</strong><br>بعضی سایت‌ها یا آدرس‌ها رو می‌خوای بدون پروکسی باز کنی (مستقیم وصل بشی). اینجا آدرس‌ها رو بنویس تا ترافیکشون از مسیر عادی رد بشه.", adv_routing_label: "مسیریابی مستقیم سفارشی", adv_routing_hint: "هر خط یه آدرس، IP، geoip (مثلاً geoip:ir) یا geosite (مثلاً geosite:ir) باشه.", adv_routing_warning: "اگه آدرس اشتباه بنویسی یا فرمت درست نباشه، اتصال قطع میشه. قبل از ذخیره حتماً چک کن.",
                    adv_protocol: "پروتکل", adv_telegram: "ربات تلگرام", adv_cloudflare: "کلودفلر",
                    stat_datetime: "تاریخ و زمان",
                    desc_custom_panel_url: "اختیاری. یک دامنه/آدرس سفارشی برای لینک‌های ساب/همگام‌سازی وارد کنید. اگر خالی باشد، آدرس پیش‌فرض ورکر استفاده می‌شود.",
                    lbl_custom_config_name: "نام/پیشوند سفارشی کانفیگ",
                    lbl_traffic_limit_gb: "محدودیت ترافیک (GB)",
                    lbl_daily_limit_gb: "محدودیت روزانه (GB)",
                    lbl_expiration_days: "تاریخ انقضا (روز)",
                    loading_logs: "در حال بارگذاری گزارش‌ها...", show_qr: "نمایش کد QR",
                    no_matching_users: "کاربری مطابقت نداشت", no_active_conn: "هنوز داده اتصال فعالی ثبت نشده.",
                    qr_subtitle: "با کلاینت V-Core یا T-Core اسکن کنید",
                    no_activity_logs: "گزارش فعالیتی یافت نشد.", no_recent_activity: "فعالیت اخیری ثبت نشده.",
                    no_ips_advanced: "آی‌پی‌ای در بخش پیشرفته اضافه نشده", no_nodes_advanced: "نود فرعی‌ای در بخش پیشرفته اضافه نشده",
                    no_changelog: "گزارش تغییراتی برای این نسخه موجود نیست.", no_changes: "تغییراتی ثبت نشده.",
                    section_basic_info: "اطلاعات پایه", section_limits: "محدودیت‌ها", section_network: "شبکه", section_advanced: "پیشرفته",
                    section_advanced_tag: "(پیشرفته)", section_advanced_subtag: "(پروتکل و پورت)", unlimited: "نامحدود", placeholder_user_name: "مثلاً: علی", placeholder_config_name: "خالی = از نام کاربر استفاده بشه", desc_user_name: "نامی که در لیست کاربران نمایش داده میشه", placeholder_name: "نام",
                    placeholder_user_name: "مثلاً: علی", placeholder_config_name: "خالی = از نام کاربر استفاده بشه", desc_user_name: "نامی که در لیست کاربران نمایش داده میشه", placeholder_name: "نام",
                    lbl_nat64: "پیشوند NAT64", desc_nat64: "اختیاری. آی‌پی‌های پروکسی IPv4 را به آدرس‌های NAT64 IPv6 تبدیل می‌کند. چند پیشوند پشتیبانی می‌شود.",
                    lbl_direct_configs: "شامل کانفیگ‌های مستقیم", desc_direct_configs: "تولید کانفیگ‌ها بدون آی‌پی پروکسی در کنار کانفیگ‌های رله",
                    lbl_sync_api_key: "کلید API همگام‌سازی (ارسال به اسلیو)", desc_sync_api_key: "کلید API از پنل اسلیو. پنل اصلی با این کلید کانفیگ را ارسال می‌کند. این کلید باید در کلیدهای API پنل اسلیو وجود داشته باشد.",
                    lbl_auto_update: "بروزرسانی خودکار", desc_auto_update: "دپلوی خودکار هنگام شناسایی نسخه جدید",
                    lbl_auto_update_format: "قالب بروزرسانی", format_normal_label: "معمولی", format_obfuscated_label: "مبهم‌سازی شده",
                    desc_format_normal: "استاندارد _worker.js", desc_format_obfuscated: "جابجایی بایت XOR",
                    lbl_clean_ips: "آی‌پی‌های تمیز", lbl_proxy_ips: "آی‌پی‌های پروکسی", lbl_assigned_nodes: "نودهای اختصاصی",
                    lbl_protocol_mode: "پروتکل", lbl_max_configs: "حداکثر کانفیگ",
                    desc_assigned_nodes: "نودهای سفارشی (کاما/خط جدید، خالی = همه نودها)",
                    desc_nat64_user: "اختیاری. آی‌پی‌های پروکسی IPv4 را به آدرس‌های NAT64 IPv6 تبدیل می‌کند.",
                    desc_proxy_ips: "آی‌پی‌های پروکسی سفارشی (کاما/خط جدید)",
                    desc_clean_ips_modal: "آی‌پی‌های تمیز سفارشی (کاما/خط جدید)",
                    btn_generate_uuid: "تولید UUID",
                    lbl_conn_limit: "محدودیت اتصال همزمان", desc_conn_limit: "حداکثر اتصالات همزمان برای هر کاربر. برای نامحدود خالی بگذارید.",
                    lbl_user_panel_url: "آدرس پنل اصلی (نودهای سفارشی)", desc_user_panel_url: "دامنه پنل اصلی برای نودهای سفارشی. اگر خالی باشد، آدرس پنل پیش‌فرض استفاده می‌شود.",
                  metrics_live: "وضعیت زنده مصرف اتصالات و پردازش", no_metrics: "هنوز داده‌ای از تراکنش و اتصالات فعال ثبت نشده است.", run_diagnostics: "⚡ اجرای عیب‌یابی شبکه",
                  target_node: "هدف گره شبکه", response: "مدت زمان تاخیر پاسخگویی", status: "وضعیت گره", local_port: "درگاه محلی",
                  lbl_doh: "تحلیل‌گر تخصصی آدرس‌یابی عددی", lbl_strategy: "روش نام‌گذاری کانفیگ‌ها", lbl_prefix: "پیشوند نام کانفیگ‌ها", html_desc_prefix_note: "این پیشوند در هر جایی از طرح نام‌گذاری که متغیر <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{PREFIX}</code> قرار داشته باشد جایگزین می‌شود.",
                    
                  slave_title: "سایر نودهای موازی", slave_desc: "آدرس دامنه سایر ورکرها را وارد نمایید (هر خط یک آدرس). نود اصلی تنظیمات و مشترکین را به صورت خودکار با آن‌ها هماهنگ می‌کند!",
                  force_sync: "همگام‌سازی اجباری نودها", limit_total: "محدودیت تعداد کل درخواست‌ها (GB)  (برای نامحدود خالی بگذارید)", limit_daily: "محدودیت درخواست‌های روزانه (GB)  (برای نامحدود خالی بگذارید)",
                  limit_days: "مدت زمان اعتبار قانونی (روز) - برای نامحدود خالی بگذارید", edit_sub: "ویرایش مشترک", lbl_name_ph: "نام یا شناسه یکتا",
                  btn_save_changes: "ذخیره تغییرات", save_btn_user: "ثبت کاربر جدید", status_active: "فعال", status_paused: "متوقف شده", status_expired: "منقضی شده",
                  export_btn: "📥 برون‌بری فایل پیکربندی (نسخه پشتیبان)", import_btn: "📤 درون‌ریزی فایل پیکربندی (نسخه پشتیبان)",
                  stat_total_subscribers: "کل مشترکین", stat_active_paused: "فعال / متوقف شده", stat_cumulative_traffic: "ترافیک کل انباشته", stat_auto_disabled: "غیرفعال خودکار",
                  sub_directory_title: "فهرست مشترکین", sub_directory_desc: "جستجو، اصلاح محدودیت‌ها، تغییر محدودیت‌های ترافیک یا پاک کردن جلسات حسابداری.", user_search_placeholder: "🔍 جستجو بر اساس نام یا شناسه...",
                  filter_all: "همه کاربران", filter_active: "فعال", filter_paused: "متوقف شده", filter_auto_disabled: "غیرفعال خودکار",
                  disabled_panel_title: "کاربران اخیراً غیرفعال شده", disabled_panel_desc: "کاربرانی که به دلیل اتمام سهمیه یا تاریخ انقضا غیرفعال شده‌اند",
                  lbl_u_Protocol:"نوع پروتکل(خالی بر اساس تنظیمات کلی)",
                  lbl_u_ports:"نوع پورت",
                  lbl_u_max_config:"حداکثر تعداد کانفیگ",
                  login_password:"رمز ورود",
                  lbl_u_ipproxy:"آی‌پی(های) پروکسی کاربر (اختیاری - آی‌پی پاک سراسری را نادیده می‌گیرد، با کاما/خط جدید از هم جدا می‌شوند)",
                  v_pop_title: "اطلاعیه تعمیرات", v_pop_whatsnew: "ویژگی‌های جدید", v_pop_headline: "امکانات جدید و بهبودها",
                  v_pop_btn: "متوجه شدم!",
                  changelog_title: "گزارش تغییرات و توضیحات نسخه جدید:",
                   changelog_added: "اضافه شده", changelog_fixed: "رفع شده", changelog_improved: "بهبود یافته", changelog_changed: "تغییر یافته", changelog_note: "نکات مهم",
                   ov_total_users: "کل کاربران", ov_active_users: "فعال", ov_paused_users: "متوقف", ov_auto_disabled: "غیرفعال خودکار", ov_expired_users: "منقضی",
                   ov_total_traffic: "ترافیک کل", ov_today_traffic: "ترافیک امروز", ov_requests: "درخواست", ov_active_conns: "اتصالات فعال",
                   ov_system: "سیستم", ov_recent_activity: "فعالیت‌های اخیر", ov_view_all: "مشاهده همه ←", ov_loading: "در حال بارگذاری...",
                   ov_quick_actions: "عملیات سریع", ov_add_user: "افزودن کاربر", ov_backup_config: "پشتیبان‌گیری", ov_refresh: "بروزرسانی آمار", ov_manage_users: "مدیریت کاربران",
                   ov_gb_unit: "گیگابایت",
                     lbl_allow_sync:"اجازه همگام سازی",
                     other_nodes_title: "سایر نودها", other_nodes_desc: "نودهای خارجی (URL + کلید API) برای مدیریت بین پنل‌ها.",
                     add_node_title: "افزودن نود خارجی", add_node_desc: "آدرس URL و کلید API پنل خارجی را وارد کنید.",
                     add_node_url: "آدرس نود", add_node_apikey: "کلید API", add_node_confirm: "افزودن نود", add_node_invalid: "لطفاً URL و کلید API را وارد کنید.",
                     node_added: "نود با موفقیت اضافه شد!", node_removed: "نود حذف شد.",
                      deploy_btn: "هم‌اکنون نصب کن", update_deploying: "در حال نصب بروزرسانی...",
                      update_success: "بروزرسانی موفق! در حال بارگذاری...", update_error: "خطا در بروزرسانی",
                      lbl_cf_worker: "نام اسکریپت کارگر ابری", desc_cf_worker: "برای بروزرسانی خودکار الزامی است. نام اسکریپت در داشبورد کارگرهای ابری.",
                      view_github: "مشاهده در گیت‌هاب",
                     update_requires_cf: "برای نصب خودکار، شناسه اکانت، توکن API و نام کارگر را تنظیم کنید.",
                     html_desc_strategy: "<details><summary class='cursor-pointer text-primary'>مشاهده متغیرهای پشتیبانی شده...</summary><div class='mt-2'>متغیرهای پشتیبانی شده: <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{FLAG}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{COUNTRY}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{CITY}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{ISP}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{PROTOCOL}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{USER}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{PORT}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{PREFIX}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{IP}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{IP_NAME}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{HOST}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{DATE}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{INDEX}</code>، <code class='bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-rose-500 font-mono'>{WORKER}</code>.<br><span class='text-[10px] text-slate-400 dark:text-slate-500 leading-snug'>• <b>{FLAG}</b>: ایموجی پرچم.<br>• <b>{COUNTRY}</b>: نام کشور.<br>• <b>{CITY}</b>: نام شهر.<br>• <b>{ISP}</b>: نام ارائه‌دهنده اینترنت.<br>• <b>{PROTOCOL}</b>: پروتکل اصلی.<br>• <b>{USER}</b>: نام مشترک.<br>• <b>{PORT}</b>: پورت فعال.<br>• <b>{PREFIX}</b>: پیشوند دلخواه.<br>• <b>{IP}</b>: آی‌پی تمیز.<br>• <b>{IP_NAME}</b>: نام آی‌پی تمیز.<br>• <b>{HOST}</b>: نام دامنه.<br>• <b>{DATE}</b>: تاریخ.<br>• <b>{INDEX}</b>: شماره ردیف کانفیگ.<br>• <b>{WORKER}</b>: نام اسکریپت.</span><br>طرح‌های پیش‌فرض: <code>default</code>، <code>type-user-port</code>، <code>user-port</code>، <code>host-port-user</code>، <code>prefix-user-port</code>، <code>ip</code>.</div></details>",
                }
          };

          const CHANGELOG_DATA = {

              "3.0.0": {
                  headline: { en: "Upstream VLESS, Redesigned User Management & Better UX", fa: "Upstream VLESS، بازطراحی مدیریت کاربران و تجربه کاربری بهتر" },
                  added: [
                      { en: "Upstream VLESS / Proxy Chaining — you can now chain your panel with another VLESS server to bypass restrictions", fa: "قابلیت Upstream VLESS / پروکسی زنجیره‌ای — حالا می‌تونی پنلت رو با یه سرور VLESS دیگه زنجیره کنی تا محدودیت‌ها دور زده بشه" },
                      { en: "Upstream VLESS section with simple explanations and links to free config providers", fa: "بخش Upstream VLESS با توضیحات ساده و لینک سایت‌های دریافت کانفیگ رایگان" },
                      { en: "v2rayN JSON subscription format (?flag=vjson) added to subscription page", fa: "فرمت سابسکریپشن v2rayN JSON (?flag=vjson) به صفحه سابسکریپشن اضافه شد" },
                      { en: "Custom Routing section now has bilingual descriptions (Farsi + English)", fa: "بخش مسیریابی سفارشی حالا توضیحات دوزبانه داره (فارسی + انگلیسی)" },
                      { en: "Custom confirm modal instead of browser's default alert/confirm dialogs", fa: "مودال تأیید سفارشی به جای دیالوگ‌های پیش‌فرض مرورگر" },
                      { en: "Draft save for Add User form — if you close the page, your data won't be lost", fa: "ذخیره خودکار پیش‌نویس فرم اضافه کردن کاربر — اگه صفحه رو ببندی، اطلاعاتت از بین نمیره" },
                      { en: "Auto-copy subscription link after creating a new user", fa: "کپی خودکار لینک سابسکریپشن بعد از ساخت کاربر جدید" },
                      { en: "Toast notifications for actions like save, copy, and delete", fa: "اعلان‌های Toast برای اعمالی مثل ذخیره، کپی و حذف" }
                  ],
                  fixed: [
                      { en: "Language switching now updates all text instantly without page refresh", fa: "تغییر زبان حالا همه متن‌ها رو فوری آپدیت می‌کنه بدون نیاز به رفرش صفحه" },
                      { en: "FAQ section text contrast improved in dark mode", fa: "کنتراست متن‌های بخش سؤالات متداول در حالت تاریک بهتر شد" },
                      { en: "Fixed RTL layout issues on subscription page — boxes and buttons stay in correct position", fa: "رفع مشکل لایوت RTL در صفحه سابسکریپشن — باکس‌ها و دکمه‌ها در جای درست خودشون میمونن" },
                      { en: "Fixed FAQ English answer boxes now display LTR correctly", fa: "رفع مشکل نمایش باکس‌های پاسخ انگلیسی FAQ که حالا درست از چپ به راست نمایش داده میشن" },
                      { en: "Fixed sidebar hover color — now white in dark mode", fa: "رفع رنگ هاور سایدبار — حالا در حالت تاریک سفید میشه" },
                      { en: "Fixed mobile Nodes tab icon alignment with other sidebar items", fa: "رفع هم‌تراشی آیکون تب نودها در موبایل با بقیه آیتم‌های سایدبار" },
                      { en: "Settings tab now uses full width instead of half-empty layout", fa: "تب تنظیمات حالا تمام عرض صفحه رو اشغال میکنه به جای لایوت نصفه" }
                  ],
                  improved: [
                      { en: "Redesigned Add/Edit User forms — numbered sections with collapsible advanced settings", fa: "بازطراحی فرم‌های اضافه/ویرایش کاربر — بخش‌های شماره‌گذاری شده با تنظیمات پیشرفته جمع‌شونده" },
                      { en: "Modern toggle switches for protocol selection (VLESS/Trojan) instead of plain checkboxes", fa: "سوئیچ‌های مدرن برای انتخاب پروتکل (VLESS/Trojan) به جای چک‌باکس‌های ساده" },
                      { en: "Redesigned user cards with status badges (Active/Paused/Expired), UUID display, and action buttons with labels", fa: "بازطراحی کارت‌های کاربر با بج وضعیت (فعال/متوقف/منقضی)، نمایش UUID و دکمه‌های عملیات با لیبل" },
                      { en: "Improved user card action buttons with hover effects and Farsi/English labels", fa: "بهبود دکمه‌های عملیات کارت کاربر با افکت‌های Hover و لیبل‌های فارسی/انگلیسی" },
                      { en: "All form labels and placeholders are now fully bilingual (Farsi + English)", fa: "همه لیبل‌ها و placeholder های فرم حالا کاملاً دوزبانه هستن (فارسی + انگلیسی)" },
                      { en: "Form field validation with visual feedback (red border on error)", fa: "اعتبارسنجی فیلدهای فرم با بازخورد بصری (حاشیه قرمز در صورت خطا)" },
                      { en: "Smooth CSS animations for accordion sections and UI transitions", fa: "انیمیشن‌های CSS نرم برای بخش‌های آکاردئون و انتقال‌های رابط کاربری" }
                  ],
                  changed: [
                      { en: "Version upgraded from 2.9.4 to 3.0.0", fa: "ارتقای ورژن از ۲.۹.۴ به ۳.۰.۰" }
                  ],
                  notes: []
              },

              "2.9.4": {
                  headline: { en: "Live Active Connections, Auto-Update Cron & v2rayN JSON", fa: "اتصالات زنده، کرون‌جاب آپدیت خودکار و خروجی v2rayN JSON" },
                  added: [
                      { en: "Added maxConfigs option per user to limit the number of generated configurations", fa: "افزودن قابلیت maxConfigs برای محدود کردن تعداد کانفیگ‌های تولید شده هر کاربر" },
                      { en: "Live active connections stream count in the dashboard for each user/profile", fa: "تعداد لحظه‌ای اتصالات استریم زنده در داشبورد برای هر کاربر/پروفایل" },
                      { en: "Added scheduled cron job capability for automatic Cloudflare worker updates", fa: "افزودن قابلیت برنامه‌ریزی کرون‌جاب (cron) برای بروزرسانی خودکار ورکر Cloudflare" },
                      { en: "Added ?format=vjson parameter support for raw V2Ray/v2rayN JSON configuration outputs", fa: "پشتیبانی از پارامتر ?format=vjson برای خروجی پیکربندی‌های خام V2Ray/v2rayN JSON" },
                      { en: "Dashboard HTML & Subscription Info HTML are now dynamically fetched reducing worker size", fa: "فایل‌های HTML داشبورد و صفحه اشتراک اکنون به صورت داینامیک دریافت می‌شوند که حجم ورکر را به شدت کاهش می‌دهد" }
                  ],
                  fixed: [
                      { en: "Fixed activeConnections tracking limit logic and decrements upon WebSocket close", fa: "رفع مشکل منطق محدودیت activeConnections و کاهش آن هنگام بسته شدن وب‌ساکت" },
                      { en: "Security: Removed url authentication key fallback to prevent potential API key logging", fa: "امنیت: حذف جستجوی کلید احراز هویت از پارامتر URL برای جلوگیری از ثبت در لاگ‌ها" }
                  ],
                  improved: [
                      { en: "Added auto-refreshing dashboard stats using setInterval on dashboard intervals", fa: "اضافه شدن تازه‌سازی خودکار آمار داشبورد با استفاده از کرون زمان‌بندی داخلی داشبورد" },
                      { en: "Added memory management limit that clears configRegistry if it exceeds 10,000 entries", fa: "افزودن محدودیت مدیریت حافظه که configRegistry را پس از ۱۰ هزار ورود پاک می‌کند" }
                  ],
                  notes: []
              },
              "2.9.0": {
                  headline: { en: "Protocol Fix & Per-Config Node Routing", fa: "رفع پروتکل و مسیریابی نود به‌ازای هر کانفیگ" },
                  added: [
                      { en: "Per-config node routing for beta protocol via WebSocket path payload — beta nodes now route through their designated gateway IP just like alpha", fa: "مسیریابی نود به‌ازای هر کانفیگ پروتکل بتا از طریق مسیر وب‌ساکت — نودهای بتا اکنون مانند آلفا از طریق آدرس دروازه تعیین‌شده مسیریابی می‌کنند" },
                      { en: "Server-side node index extraction with triple fallback: query parameter → numeric path segment → base64 JSON payload", fa: "استخراج شاخص نود سمت سرور با زنجیره سه‌گانه بازگشت: پارامتر کوئری → بخش عددی مسیر → بار پیلود JSON باینری" },
                      { en: "Device connection limit per user (connLimit) — cap simultaneous connections per subscriber", fa: "محدودیت اتصال دستگاه به‌ازای هر کاربر (connLimit) — محدود کردن اتصالات همزمان هر مشترک" },
                      { en: "Panel API key system for secure node-to-panel authentication", fa: "سیستم کلید API پنل برای احراز هویت امن اتصال نود به پنل" },
                      { en: "Mobile-friendly add/edit user modals with improved responsive layout", fa: "فرم‌های افزودن/ویرایش کاربر سازگار با موبایل با طرح‌بندی واکنش‌گرا بهبودیافته" }
                  ],
                  fixed: [
                      { en: "Fixed beta protocol header offset parsing — beta connections were silently dropping payload data after the port field", fa: "رفع خطای اندازه‌گیری افست هدر پروتکل بتا — اتصالات بتا به‌طور خاموش داده پس از فیلد پورت را حذف می‌کردند" },
                      { en: "Fixed beta protocol authentication — password was set to generated internal ID instead of raw user identifier, causing permanent auth failure", fa: "رفع احراز هویت پروتکل بتا — رمز عبور به‌جای شناسه داخلی تولیدشده از شناسه خام کاربر استفاده می‌کند" },
                      { en: "Added SHA224 hash registration in configRegistry so beta lookup works when isolate is warm", fa: "افزودن ثبت هش SHA224 در configRegistry تا جستجوی بتا در isolate گرم کار کند" },
                      { en: "Removed Maintenance Hosts and Sync API Key fields from Advanced tab network section as requested", fa: "حذف فیلدهای میزبان‌های نگهداری و کلید API همگام‌سازی از بخش شبکه پیشرفته" }
                  ],
                  improved: [
                      { en: "Beta node routing now uses the same base64 JSON WebSocket path payload format as alpha for maximum client compatibility", fa: "مسیریابی نود بتا اکنون از همان قالب پیلود مسیر وب‌ساکت JSON باینری آلفا برای حداکثر سازگاری استفاده می‌کند" },
                      { en: "Node resolution uses getEffectivePips with NAT64 awareness for both alpha and beta protocols", fa: "解析 نود از getEffectivePips با آگاهی NAT64 برای هر دو پروتکل آلفا و بتا استفاده می‌کند" },
                      { en: "Added reqPath variable to buildYamlProfile for consistent path generation", fa: "افزودن متغیر reqPath به buildYamlProfile برای تولید مسیر یکپارچه" }
                  ],
                  notes: []
              },
              "2.6.0": {
                  headline: { en: "Bilingual Subscription Page & NAT64 Support", fa: "صفحه اشتراک چندزبانه و پشتیبانی NAT64" },
                  added: [
                      { en: "Full Persian and English language support on the subscription info page with RTL layout", fa: "پشتیبانی کامل از فارسی و انگلیسی در صفحه اطلاعات اشتراک با چیدمان RTL" },
                      { en: "Dark and light mode toggle on the subscription page with saved preference", fa: "قابلیت تغییر حالت تاریک/روشن در صفحه اشتراک با ذخیره ترجیح کاربر" },
                      { en: "NAT64 support for automatic IPv4 to IPv6 address conversion", fa: "پشتیبانی NAT64 برای تبدیل خودکار آدرس IPv4 به IPv6" },
                      { en: "Per-user custom hostnames for multi-region deployments", fa: "هاست‌های اختصاصی برای هر کاربر جهت استقرار چند منطقه‌ای" },
                      { en: "Direct connection configs that work without gateway IPs", fa: "کانفیگ‌های اتصال مستقیم بدون نیاز به آدرس دروازه" },
                      { en: "Auto update from GitHub directly inside the dashboard", fa: "بروزرسانی خودکار از GitHub مستقیماً از داشبورد" },
                      { en: "Customizable fake subscription entries with usage and expiry display", fa: "ورودی‌های اشتراک جعلی سفارشی با نمایش مصرف و انقضا" },
                      { en: "Full gateway management via Telegram inline buttons", fa: "مدیریت کامل دروازه از طریق دکمه‌های اینلاین تلگرام" }
                  ],
                  fixed: [
                      { en: "Fixed garbled Persian text in the user interface", fa: "اصلاح متن‌های فارسی نادرست در رابط کاربری" },
                      { en: "Fixed subscription page not loading properly", fa: "رفع مشکل بارگذاری صفحه اشتراک" }
                  ],
                  improved: [
                      { en: "Significantly faster dashboard scrolling and page loading", fa: "سرعت اسکرول و بارگذاری صفحات داشبورد بهبود چشمگیر یافت" },
                      { en: "Rewritten config generators for better compatibility", fa: "بازنویسی مولدهای کانفیگ برای سازگاری بهتر" },
                      { en: "Faster and more accurate country flag detection", fa: "سرعت و دقت نمایش پرچم کشورها بهبود یافت" },
                      { en: "New config naming tags: country, city, ISP, date, and worker name", fa: "تگ‌های جدید نامگذاری: کشور، شهر، ارائه‌دهنده، تاریخ و نام ورکر" }
                  ],
                  notes: []
              },
              "2.5.8": {
                  headline: { en: "Advanced Naming Tags & GeoIP Tag Engine", fa: "موتور نامگذاری پیشرفته با تگ‌های جغرافیایی" },
                  added: [
                      { en: "Added 7 new config naming placeholders: {COUNTRY}, {CITY}, {ISP}, {HOST}, {DATE}, {INDEX}, {WORKER}", fa: "اضافه شدن ۷ متغیر جدید نامگذاری: {COUNTRY}، {CITY}، {ISP}، {HOST}، {DATE}، {INDEX}، {WORKER}" },
                      { en: "Replaced single-purpose flag API with batch ip-api.com GeoIP enrichment for country, city, and ISP data", fa: "جایگزینی API پرچم با غنی‌سازی GeoIP دسته‌ای ip-api.com برای داده‌های کشور، شهر و ارائه‌دهنده اینترنت" },
                      { en: "Added tag validation engine that detects and reports unknown/invalid tags in naming strategies", fa: "افزودن موتور اعتبارسنجی تگ که تگ‌های ناشناخته یا نامعتبر در استراتژی نامگذاری را شناسایی و گزارش می‌کند" }
                  ],
                  fixed: [
                      { en: "GeoIP cache now stores full geo metadata (country, city, ISP) instead of only flag emoji", fa: "کش GeoIP اکنون فراداده‌های کامل جغرافیایی (کشور، شهر، ارائه‌دهنده) را به جای فقط ایموجی پرچم ذخیره می‌کند" }
                  ],
                  improved: [
                      { en: "Config name generation now receives config index for sequential naming patterns via {INDEX}", fa: "تولید نام کانفیگ اکنون شماره ردیف را برای الگوهای نامگذاری متوالی از طریق {INDEX} دریافت می‌کند" },
                      { en: "Updated dashboard documentation with full list of all 13 supported naming tags in English and Persian", fa: "به‌روزرسانی مستندات داشبورد با لیست کامل ۱۳ تگ نامگذاری پشتیبانی شده در فارسی و انگلیسی" }
                  ],
                  notes: []
              },
              "2.5.7": {
                  headline: { en: "Dynamic Multi-IP Failover & Keyless Country Flagging", fa: "لینک هوشمند آی‌پی‌ها، بهبود کلودفلر و نگاشت پرچم بدون تحریم" },
                  added: [
                      { en: "Support entering custom clean IPs, gateway IPs, and custom config names for each subscriber dynamically in Add/Edit user modals, with automatic extraction and seamless database merging", fa: "امکان ثبت آی‌پی تمیز دلخواه، آی‌پی دروازه دلخواه و نام کانفیگ دلخواه برای هر کاربر به صورت مجزا با قابلیت استخراج خودکار و ادغام هوشمند" },
                      { en: "Integrated free, open-source and keyless api.country.is for country flag mapping of IP addresses", fa: "یکپارچه‌سازی وب‌سرویس رایگان و متن‌باز api.country.is جهت نگاشت پرچم کشورهای مربوط به آدرس‌های آی‌پی" }
                  ],
                  fixed: [
                      { en: "Resolved Cloudflare API compatibility flag error ('No such compatibility flag: unsafe-eval' and startup 'Uncaught EvalError') by updating to 'allow_eval_during_startup'", fa: "رفع خطای ناسازگاری فلگ کلودفلر (خطای عدم وجود فلگ unsafe-eval و خطای زمان شروع کار EvalError) در بخش استقرار خودکار با بازنویسی به فلگ مدرن allow_eval_during_startup" },
                      { en: "Fixed a critical issue where selecting multiple gateway IPs for a user caused session disruptions (IP splitting) on sites behind Cloudflare, resolved via user-consistent hashing and smart gateway failover", fa: "رفع مشکل عدم باز شدن وب‌سایت‌های پشت کلودفلر هنگام انتخاب چندین آی‌پی دروازه با پیاده‌سازی مکانیزم Hashing پایدار کاربر و سوییچ خودکار (Failover) بر روی دروازه‌های جایگزین" },
                      { en: "Fixed client-side regular expression parsing to correctly split global IPs separated by backslashes, tabs, commas, or semicolons in the browser", fa: "اصلاح عبارات منظم فرانت‌اند در مروگر جهت تفکیک صحیح لیست آی‌پی‌های تفکیک شده با اینتر، ویرگول، نقطه ویرگول یا بک‌اسلش" }
                  ],
                  improved: [
                      { en: "Enhanced reliability of user management dashboard modals and subscription validation logic", fa: "بهبود پایداری پنجره‌های مدیریتی داشبورد و منطق بررسی اعتبار اشتراک‌ها" }
                  ],
                  notes: []
              },
              "2.5.6.1": {
                  headline: { en: "Multi-IP Management & Crucial Bug Fixes", fa: "مدیریت آی‌پی‌های چندگانه و رفع خطاهای بحرانی" },
                  added: [
                       { en: "Support setting custom config name, custom gateway IP, and custom clean IP for each user dynamically in the Add User modal", fa: "اضافه شدن امکان ثبت نام کانفیگ دلخواه، آی‌پی دروازه اختصاصی و آی‌پی تمیز اختصاصی به صورت مجزا برای هر کاربر در پنجره افزودن کاربر" }
                  ],
                  fixed: [
                      { en: "Fixed a critical JavaScript rollback error ('ReferenceError: proxyIp is not defined') when adding a new user", fa: "رفع خطای بحرانی جاوااسکریپت ('ReferenceError: proxyIp is not defined') هنگام تلاش برای افزودن یک کاربر جدید" }
                  ],
                  improved: [
                      { en: "Streamlined alignment of custom user values with subscription generation", fa: "بهبود همگام‌سازی مقادیر اختصاصی کاربران با فرایند ساخت کانفیگ‌ها در اشتراک" }
                  ],
                  notes: []
              },
              "2.5.6": {
                  headline:                { en: "Multiple Gateway IPs & Flag Matching", fa: "آی‌پی‌های دروازه متعدد و انطباق پرچم" },
                  added: [
                      { en: "Support multi-gateway IP lists (rotated/distributed across generated configs to bypass Cloudflare limits)", fa: "پشتیبانی از لیست‌های آی‌پی دروازه چندگانه (چرخش و توزیع خودکار میان کانفیگ‌ها برای عبور از محدودیت‌های کلودفلر)" },
                      { en: "Proper country flag matching for configs based on the actual gateway IP used", fa: "انطباق صحیح پرچم کشور برای کانفیگ‌ها بر اساس آی‌پی دروازه واقعی استفاده‌شده" }
                  ],
                  fixed: [
                      { en: "Fixed outbound transport and websocket configurations formatting errors", fa: "رفع خطاهای فرمت‌دهی در کانفیگ‌های حمل و نقل خروجی و وب‌ساکت" }
                  ],
                  improved: [
                      { en: "Distributed multiple gateway IPs evenly across subscription sub-configs", fa: "توزیع یکنواخت چندین آی‌پی دروازه میان زیرکانفیگ‌های اشتراک" },
                      { en: "Enhanced IP API resolving and flag caching logic", fa: "بهبود منطق حل‌وفصل و کش پرچم برای آی‌پی‌ها" }
                  ],
                  notes: []
              },
              "2.5.5": {
                  headline: { en: "One-Click Panel Update", fa: "بروزرسانی پنل با یک کلیک" },
                  added: [
                      { en: "Update the panel directly from the admin panel — no need to use Cloudflare dashboard", fa: "بروزرسانی پنل مستقیماً از پنل مدیریت — بدون نیاز به داشبورد کلودفلر" },
                      { en: "One-click deployment inside the panel for quick and easy updates", fa: "نصب با یک کلیک داخل پنل برای بروزرسانی سریع و آسان" },
                  ],
                  fixed: [],
                  improved: [
                      { en: "Improved stability and reliability of the update system", fa: "بهبود پایداری و اطمینان سیستم بروزرسانی" },
                  ],
                  notes: []
              },
              "2.5.4.2": {
                  headline: { en: "Performance Optimization & Background Processing", fa: "بهینه‌سازی عملکرد و پردازش پس‌زمینه" },
                  added: [],
                  fixed: [],
                  improved: [
                      { en: "Improved system performance using smart caching (faster responses and less database load)", fa: "بهبود عملکرد سیستم با استفاده از کش هوشمند (پاسخ‌ سریع‌تر و بار کمتر روی پایگاه داده)" },
                      { en: "Added smart caching system (TTL) for configuration and usage data", fa: "افزودن سیستم کش هوشمند (TTL) برای داده‌های تنظیمات و مصرف" },
                      { en: "Reduced database calls to make the panel faster and more efficient", fa: "کاهش درخواست‌ها به پایگاه داده برای سریع‌تر و کاراتر شدن پنل" },
                      { en: "Background processing added for non-critical tasks to improve speed", fa: "افزودن پردازش پس‌زمینه برای کارهای غیربحرانی جهت بهبود سرعت" },
                  ],
                  notes: []
              },
              "2.5.4.1": {
                  headline: { en: "Security Hotfix — Bot Authorization", fa: "اصلاح امنیتی — احراز هویت ربات" },
                  added: [],
                  fixed: [
                      { en: "Fixed critical issue where unauthorized users could access bot and panel data via Worker", fa: "رفع مشکل بحرانی دسترسی کاربران غیرمجاز به اطلاعات ربات و پنل از طریق Worker" },
                      { en: "Added proper Telegram user ID validation for all Worker-related requests", fa: "افزودن بررسی صحیح آیدی عددی تلگرام برای تمام درخواست‌های مربوط به Worker" },
                  ],
                  improved: [
                      { en: "Only users with approved admin IDs can interact with the bot and access panel data", fa: "فقط کاربرانی که آیدی آن‌ها در لیست ادمین‌ها ثبت شده باشد اجازه دسترسی به ربات و اطلاعات پنل را دارند" },
                      { en: "Unauthorized users now receive a clear access denied message", fa: "کاربران غیرمجاز اکنون پیام خطای دسترسی مناسب دریافت می‌کنند" },
                  ],
                  notes: [
                      { en: "Security update — recommended for all users", fa: "به‌روزرسانی امنیتی — توصیه‌شده برای تمام کاربران" },
                  ]
              },
              "2.5.4": {
                  headline: { en: "Overview Dashboard & Mobile Improvements", fa: "داشبورد نمای کلی و بهبود نمایش در موبایل" },
                  added: [
                      { en: "Added Overview Dashboard as the default home page", fa: "اضافه شدن داشبورد نمای کلی به عنوان صفحه اصلی پنل" },
                      { en: "Added quick statistics and recent activity section", fa: "اضافه شدن بخش آمار سریع و فعالیت‌های اخیر" },
                  ],
                  fixed: [],
                  improved: [
                      { en: "Improved mobile responsiveness of the Overview page", fa: "بهبود نمایش صفحه نمای کلی در موبایل" },
                      { en: "Localized traffic units for Persian language", fa: "نمایش واحد ترافیک به فارسی در صفحه نمای کلی" },
                  ],
                  notes: []
              },
              "2.5.3": {
                  headline: { en: "Telegram Bot Fixes & Formatting Cleanup", fa: "رفع مشکلات ربات تلگرام و اصلاح فرمت‌بندی" },
                  added: [],
                  fixed: [
                      { en: "Fixed admin buttons not showing immediately after /start in some cases", fa: "رفع مشکل نمایش ندادن دکمه‌های مدیر بلافاصله پس از /start در بعضی موارد" },
                      { en: "Fixed subscription link button returning per-user links instead of master link", fa: "رفع مشکل بازگشت لینک‌های کاربری به جای لینک اصلی هنگام فشردن دکمه لینک اشتراک" },
                      { en: "Fixed duplicate messages when clicking Update Usage with unchanged stats", fa: "رفع مشکل ارسال پیام تکراری هنگام فشردن بروزرسانی مصرف بدون تغییر آمار" },
                      { en: "Fixed <code> tags showing as raw text in Telegram messages", fa: "رفع مشکل نمایش تگ‌های <code> به صورت متن خام در پیام‌های تلگرام" },
                      { en: "Fixed subscription links not being clickable in Telegram", fa: "رفع مشکل غیرقابل کلیک بودن لینک‌های اشتراک در تلگرام" },
                  ],
                  improved: [
                      { en: "Subscription links now use tap-to-copy formatting in Telegram", fa: "لینک‌های اشتراک اکنون با فرمت کپی با یک لمس در تلگرام نمایش داده می‌شوند" },
                      { en: "UUIDs now use tap-to-copy formatting in user lists and detail views", fa: "شناسه‌های یکتا اکنون با فرمت کپی با یک لمس در لیست و جزئیات کاربران نمایش داده می‌شوند" },
                      { en: "Bot menu now correctly shows admin options on first interaction after login", fa: "منوی ربات اکنون گزینه‌های مدیریتی را در اولین تعامل پس از ورود به درستی نمایش می‌دهد" },
                      { en: "Update Usage button now edits the existing message instead of sending a new one", fa: "دکمه بروزرسانی مصرف اکنون پیام موجود را ویرایش می‌کند به جای ارسال پیام جدید" },
                  ],
                  notes: [
                      { en: "No breaking changes — fully backward compatible", fa: "بدون تغییرات ناسازگار — کاملاً سازگار با نسخه‌های قبلی" },
                  ]
              },
              "2.5.2": {
                  headline: { en: "Modal Responsiveness & Mobile UX", fa: "واکنش‌گرایی مودال و تجربه کاربری موبایل" },
                  added: [],
                  fixed: [],
                  improved: [
                      { en: "Improved Add/Edit User modal responsiveness on all screen sizes", fa: "بهبود واکنش‌گرایی مودال افزودن/ویرایش کاربر در تمام اندازه‌های صفحه" },
                      { en: "Added sticky action buttons in modals for better mobile support", fa: "افزودن دکمه‌های شناور در مودال‌ها برای پشتیبانی بهتر از موبایل" },
                      { en: "Enhanced scrolling behavior — form content scrolls independently while buttons stay visible", fa: "بهبود رفتار اسکرول — محتوای فرم به‌طور مستقل اسکرول می‌شود در حالی که دکمه‌ها قابل مشاهده باقی می‌مانند" },
                      { en: "Improved overall user experience when managing subscribers", fa: "بهبود تجربه کاربری هنگام مدیریت مشترکین" },
                  ],
                  notes: [
                      { en: "No breaking changes — fully backward compatible", fa: "بدون تغییرات ناسازگار — کاملاً سازگار با نسخه‌های قبلی" },
                  ]
              },
              "2.5.1": {
                  headline: { en: "Simplified Panel Management & Bot Stability", fa: "مدیریت ساده‌شده پنل و پایداری ربات" },
                  added: [
                      { en: "Web login signal system — bot auto-detects the last active web-logged panel", fa: "سیستم سیگنال ورود وب — ربات به‌طور خودکار آخرین پنل واردشده از وب را شناسایی می‌کند" },
                      { en: "Login sync endpoint (/tg/sync_panel) for remote panels to notify the hub on admin login", fa: "نقطه پایانی همگام‌سازی ورود (/tg/sync_panel) برای اطلاع‌رسانی پنل‌های راهدور به هاب هنگام ورود مدیر" },
                      { en: "Hub panel URL config (hubPanelUrl) for remote panels to signal login events", fa: "پیکربندی آدرس هاب پنل (hubPanelUrl) برای ارسال سیگنال ورود از پنل‌های راهدور" },
                      { en: "Full user management via Telegram bot (create, edit, delete, search, disable, re-enable)", fa: "مدیریت کامل کاربران از طریق ربات تلگرام (ایجاد، ویرایش، حذف، جستجو، غیرفعال‌سازی، فعال‌سازی مجدد)" },
                      { en: "HTTP REST API for all user operations at /api/users (GET, POST, PUT, DELETE)", fa: "API جدید REST برای تمام عملیات کاربران در /api/users" },
                      { en: "Statistics API at /api/stats with user counts, traffic totals, and system status", fa: "API آمار در /api/stats با تعداد کاربران، مجموع ترافیک و وضعیت سیستم" },
                  ],
                  fixed: [
                      { en: "Removed multi-panel selection system that caused session confusion and incorrect panel switching", fa: "حذف سیستم انتخاب چندپنلی که باعث سردرگمی نشست و جابجایی نادرست پنل می‌شد" },
                      { en: "Fixed bot not responding after pressing /start due to stale step state", fa: "رفع مشکل پاسخ ندادن ربات پس از فشار دادن /start به دلیل وضعیت مرحله قدیمی" },
                      { en: "Fixed panel context mixing when switching between panels", fa: "رفع مشکل ترکیب زمینه پنل هنگام جابجایی بین پنل‌ها" },
                      { en: "Fixed race condition in bot state persistence from non-blocking D1 writes", fa: "رفع مشکل شرایط مسابقه در ماندگاری وضعیت ربات ناشی از نوشتن غیرهمزمان D1" },
                  ],
                  improved: [
                      { en: "/start now directly opens panel management based on last web login — no panel selection menu", fa: "/start اکنون مستقیماً مدیریت پنل را بر اساس آخرین ورود وب باز می‌کند — بدون منوی انتخاب پنل" },
                      { en: "Bot automatically links Telegram session to the last active web-logged panel", fa: "ربات به‌طور خودکار نشست تلگرام را به آخرین پنل فعال واردشده از وب متصل می‌کند" },
                      { en: "Simplified bot logic with clean 1-to-1 mapping between web login and Telegram session", fa: "ساده‌سازی منطق ربات با نگاشت یک‌به‌یک بین ورود وب و نشست تلگرام" },
                      { en: "Telegram bot main menu redesigned with inline keyboard layout for mobile-first management", fa: "منوی اصلی ربات تلگرام با طرح‌بندی کیبورد درون‌خطی برای مدیریت موبایل‌محور بازطراحی شد" },
                  ],
                  notes: [
                      { en: "Single-panel mode works more reliably — it is recommended to use one Telegram bot per panel for best stability", fa: "حالت تک‌پنلی پایدارتر است — توصیه می‌شود برای بهترین پایداری از یک ربات تلگرام برای هر پنل استفاده کنید" },
                      { en: "For multi-panel setups: set hubPanelUrl on each remote panel to enable automatic login sync", fa: "برای تنظیمات چندپنلی: hubPanelUrl را روی هر پنل راهدور تنظیم کنید تا همگام‌سازی خودکار ورود فعال شود" },
                      { en: "Each panel having its own dedicated bot improves session accuracy and prevents panel mix-up issues", fa: "داشتن ربات اختصاصی برای هر پنل، دقت نشست را بهبود می‌دهد و از مشکلات ترکیب پنل جلوگیری می‌کند" },
                      { en: "API endpoints are authenticated via Master Key (Bearer token or ?key= parameter)", fa: "نقاط پایانی API از طریق کلید اصلی احراز هویت می‌شوند (توکن Bearer یا پارامتر ?key=)" },
                  ]
              },
              "2.5.0": {
                  headline: { en: "User Auto-Disable & Management Improvements", fa: "غیرفعال‌سازی خودکار کاربر و بهبود مدیریت" },
                  added: [
                      { en: "Automatic user disable on traffic limit exceeded", fa: "غیرفعال‌سازی خودکار کاربر هنگام اتمام محدودیت ترافیک" },
                      { en: "Automatic user disable on expiration date reached", fa: "غیرفعال‌سازی خودکار کاربر هنگام رسیدن به تاریخ انقضا" },
                      { en: "Activity log and Telegram notification for auto-disabled users", fa: "ثبت در گزارش فعالیت و ارسال اعلان تلگرام برای کاربران غیرفعال شده خودکار" },
                      { en: "Recently Disabled Users notification panel in Users tab", fa: "پنل اعلان کاربران اخیراً غیرفعال شده در بخش کاربران" },
                      { en: "Status filter dropdown (All/Active/Paused/Auto-Disabled)", fa: "فیلتر وضعیت (همه/فعال/متوقف/غیرفعال خودکار)" },
                      { en: "Auto-Disabled statistics card in dashboard", fa: "کارت آمار غیرفعال‌سازی خودکار در داشبورد" },
                  ],
                  fixed: [
                      { en: "Expired users are now disabled instead of deleted", fa: "کاربران منقضی شده اکنون غیرفعال می‌شوند به جای حذف" },
                      { en: "Users exceeding traffic limits are preserved in panel", fa: "کاربرانی که محدودیت ترافیک را رد می‌کنند در پنل حفظ می‌شوند" },
                  ],
                  improved: [
                      { en: "User data, statistics, and history are now preserved", fa: "داده‌ها، آمار و تاریخچه کاربران اکنون حفظ می‌شود" },
                      { en: "Account renewal workflow for administrators", fa: "فرآیند تمدید حساب برای مدیران" },
                  ],
                  notes: [
                      { en: "Re-enabling a user clears the auto-disable reason", fa: "فعال‌سازی مجدد کاربر، دلیل غیرفعال‌سازی خودکار را پاک می‌کند" },
                  ]
              },
              "2.4.9": {
                  headline: { en: "Custom Protocol & Port Configuration", fa: "پیکربندی پروتکل و پورت سفارشی" },
                  added: [
                      { en: "Custom protocol mode per user (VLESS/Beta/Both)", fa: "حالت پروتکل سفارشی برای هر کاربر (VLESS/Beta/هر دو)" },
                      { en: "Custom port configuration per user", fa: "پیکربندی پورت سفارشی برای هر کاربر" },
                      { en: "Maximum configs limit per user", fa: "محدودیت حداکثر کانفیگ برای هر کاربر" },
                  ],
                  fixed: [],
                  improved: [
                      { en: "User management panel interface", fa: "رابط کاربری پنل مدیریت کاربران" },
                  ],
                  notes: []
              }
          };

          function renderChangelog(version) {
              const container = document.getElementById('modal-changelog-container');
              if (!container) return;

              const data = CHANGELOG_DATA[version];
              if (!data) {
                  container.innerHTML = '<p class="text-slate-400 text-xs">' + (i18n[lang]?.no_changelog || 'No changelog available for this version.') + '</p>';
                  return;
              }

              const t = (key) => i18n[lang]?.[key] || i18n['en']?.[key] || key;
              let html = '';

              if (data.headline) {
                  const headlineEl = document.getElementById('modal-version-headline');
                  if (headlineEl) headlineEl.textContent = data.headline[lang] || data.headline['en'];
              }

              const sections = [
                  { key: 'added', icon: '✨', color: 'emerald', items: data.added },
                  { key: 'fixed', icon: '🔧', color: 'blue', items: data.fixed },
                  { key: 'improved', icon: '⚡', color: 'violet', items: data.improved },
                  { key: 'changed', icon: '🔄', color: 'amber', items: data.changed },
                  { key: 'note', icon: '⚠️', color: 'red', items: data.notes },
              ];

              sections.forEach(section => {
                  if (section.items && section.items.length > 0) {
                      html += '<div class="mb-4">';
                      html += '<div class="flex items-center gap-2 mb-2">';
                      html += '<span class="text-sm">' + section.icon + '</span>';
                      html += '<h5 class="text-xs font-bold text-' + section.color + '-600 dark:text-' + section.color + '-400 uppercase tracking-wider">' + t('changelog_' + section.key) + '</h5>';
                      html += '</div>';
                      html += '<div class="space-y-1.5 ps-6">';
                      section.items.forEach(item => {
                          html += '<div class="flex items-start gap-2">';
                          html += '<span class="text-' + section.color + '-400 mt-1.5">•</span>';
                          html += '<span class="text-xs text-slate-600 dark:text-slate-300">' + (item[lang] || item['en']) + '</span>';
                          html += '</div>';
                      });
                      html += '</div></div>';
                  }
              });

              container.innerHTML = html || '<p class="text-slate-400 text-xs">' + (i18n[lang]?.no_changes || 'No changes documented.') + '</p>';
          }

