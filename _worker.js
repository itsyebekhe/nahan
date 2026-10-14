// src/index.js
import { connect as connect3 } from "cloudflare:sockets";
// src/templates/assets.json
var assets_default = {
  protocols: {
    alpha: "vless",
    beta: "trojan",
    gamma: "clash",
    alpha_scheme: "vless://",
    beta_scheme: "trojan://"
  },
  labels: {
    alpha: "VLESS",
    beta: "Trojan",
    alpha_tag: "V",
    beta_tag: "T",
    payload_mode: "proxyip"
  },
  keys: {
    proxies: "proxies",
    proxy_groups: "proxy-groups",
    outbounds: "outbounds",
    proxy_settings: "proxySettings",
    field_proxy_ip: "proxyIp",
    field_proxy_ip_geo: "proxyIpGeo"
  },
  templates: {
    fake_dummy_uri: "trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:1080?security=none#",
    upstream_prefix: "vless://"
  },
  client_agents: {
    blocked_browser_signatures: [
      "clash",
      "sing-box",
      "singbox",
      "v2ray",
      "shadowrocket",
      "quantumult",
      "surfboard",
      "stash"
    ],
    yaml_clients: [
      "clash",
      "meta",
      "stash",
      "verge",
      "mihomo",
      "cfw"
    ],
    json_clients: [
      "sing-box",
      "singbox",
      "hiddify",
      "nekobox",
      "sfa",
      "karing"
    ]
  },
  flags: {
    yaml: ["clash", "yaml", "meta", "stash", "clash-meta", "y"],
    json_legacy: ["b", "c_legacy"],
    json_box: ["sing", "singbox", "sing-box", "sb", "s", "c", "g"],
    json_v: ["vjson", "v"],
    base64: ["base64"],
    raw: ["a", "raw", ""]
  },
  urls: {
    dashboard: "https://raw.githubusercontent.com/{repo}/main/dashboard.html",
    subscription: "https://raw.githubusercontent.com/{repo}/main/subscription.html",
    ip_api_batch: "http://ip-api.com/batch?fields=status,country,countryCode,city,isp,org",
    ip_api_json: "http://ip-api.com/json/{ip}?fields=status,country,countryCode,city,isp,org",
    clash_template: "https://raw.githubusercontent.com/{repo}/main/clash.yml",
    singbox_template: "https://raw.githubusercontent.com/{repo}/main/singbox.json",
    v_template: "https://raw.githubusercontent.com/{repo}/main/v.json",
    metacubexd_ui: "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip",
    ruleset_ads: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/category-ads-all.txt",
    ruleset_ir: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ir.txt",
    ruleset_ir_cidr: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ircidr.txt"
  },
  crypto: {
    ech_config: "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA="
  },
  ai_suffixes: [
    "gemini.google.com",
    "generativelanguage.googleapis.com",
    "ai.google.dev",
    "bard.google.com",
    "openai.com",
    "chatgpt.com",
    "anthropic.com",
    "claude.ai",
    "copilot.microsoft.com",
    "bing.com",
    "meta.ai",
    "x.ai",
    "grok.com",
    "deepseek.com",
    "perplexity.ai",
    "poe.com",
    "character.ai",
    "you.com",
    "mistral.ai",
    "chat.mistral.ai"
  ],
  bot_i18n: {
    en: {
      welcome: `🤖 **Welcome to Nahan Gateway Bot**
Select your option below to manage your system:`,
      status: "System Status",
      users: "Subscribers",
      metrics: "Gateway Health",
      panic: "Panic Mode",
      dash: "Dashboard Control",
      lang: "🌐 Change Language",
      active: "🟢 Active",
      paused: "🔴 Paused",
      uptime: "Uptime",
      streams: "📡 Active Streams",
      no_users: "No subscribers found.",
      sub_info: "👤 Subscriber Details:",
      name: "Name",
      total: "Total Reqs",
      daily: "Daily Reqs",
      expiry: "Expiry",
      days: "Days remaining",
      created: "Created At",
      unlimited: "Unlimited",
      btn_back: "◀️ Back",
      btn_next: "▶️ Next",
      btn_del: "Delete",
      btn_pause: "Pause",
      btn_resume: "Resume",
      btn_edit_name: "Change Name",
      btn_edit_limits: "Limits",
      btn_add: "+ Add Subscriber",
      btn_confirm: "Confirm",
      btn_cancel: "Cancel",
      msg_enter_name: "Please send a name for the subscriber:",
      msg_added: "Sub added successfully! 🎉",
      msg_deleted: "Sub deleted successfully! 🗑️",
      msg_panic: `🚨 PANIC MODE ACTIVATED 🚨
Route randomized & System Paused.`,
      msg_invalid: "Invalid input. Please try again.",
      msg_enter_limits: `Enter limits format:
\`[totalReqs] [dailyReqs] [days_limit]\`
(Use 0 for unlimited)

Example:
\`10000 500 30\``,
      msg_confirm_del: "⚠️ Are you sure you want to delete this subscriber?",
      msg_confirm_panic: "⚠️ Are you absolutely sure you want to trigger PANIC mode? This will randomize API routes and pause all connections!",
      status_updated: "Status updated!",
      access_denied: "Access Denied. You are not authorized to manage this panel.",
      dashboard: "Dashboard",
      search: "Search User",
      statistics: "Statistics",
      panel_info: "Panel Info",
      disabled_users: "Disabled Users",
      reset_traffic: "Reset Traffic",
      extend_expiry: "Extend Expiry",
      notes: "Notes",
      device_limit: "Config Limit",
      msg_enter_search: "🔍 Send a username, UUID, or subscription to search:",
      msg_enter_notes: "📝 Send notes for this user:",
      msg_enter_extend_days: "📅 Enter number of days to extend expiration:",
      msg_traffic_reset: "Traffic has been reset successfully!",
      msg_expiry_extended: "Expiration extended by {days} days!",
      msg_no_disabled: "No disabled users found.",
      msg_enter_device_limit: "Enter config limit (0 for unlimited):",
      config_limit_updated: "Config limit updated!",
      stats_title: "Panel Statistics",
      count_active: "active",
      count_paused: "paused",
      count_disabled: "auto-disabled",
      dash_total: "Total Users",
      dash_active: "Active",
      dash_paused: "Paused",
      dash_expired: "Expired",
      dash_auto_disabled: "Auto-Disabled",
      btn_main_menu: "Main Menu",
      btn_back_to_list: "Back to List",
      total_traffic: "Total Traffic",
      daily_traffic: "Daily Traffic",
      lbl_status: "Status",
      lbl_subscription: "Subscription Connection",
      lbl_user_not_found: "⚠️ User not found",
      lbl_none: "None",
      lbl_page: "Page",
      select_panel: "🔌 Which panel do you want to manage?",
      current_panel: "Current Panel",
      switch_panel: "🔄 Switch Panel",
      panel_local: "🏠 This Panel",
      panel_remote: "🌐",
      msg_panel_selected: "Panel selected! ✅",
      msg_panel_error: "❌ Failed to connect to the selected panel.",
      msg_panel_unreachable: "⚠️ Panel is unreachable. Please check the configuration.",
      btn_sub_link: "Subscription Link",
      sub_link_sent: "Subscription link sent!",
      btn_update_usage: "Update Usage",
      tg_settings: "Settings",
      tg_advanced: "Advanced",
      tg_logs: "Logs",
      tg_sys_settings: "System Settings",
      tg_adv_settings: "Advanced Settings",
      tg_logs_view: "View Logs",
      tg_logs_clear: "Clear Logs",
      tg_proto: "Protocol",
      tg_ports: "Ports",
      tg_uuid: "Device UUID",
      tg_path: "API Route",
      tg_pass: "Master Key",
      tg_dns: "DNS",
      tg_relay: "Relay IP",
      tg_maintenance: "Maintenance Hosts",
      tg_tfo: "TCP Fast Open",
      tg_ech: "ECH",
      tg_silent: "Silent Alerts",
      tg_pause: "Kill Switch",
      tg_auto_update: "Auto Update",
      tg_direct: "Direct Configs",
      tg_nat64: "NAT64",
      tg_clean_ips: "Clean IPs",
      tg_nodes: "Nodes",
      tg_strategy: "Name Strategy",
      tg_prefix: "Name Prefix",
      tg_fake_entries: "Fake Entries",
      tg_cf_settings: "Cloudflare Settings",
      tg_tg_settings: "Telegram Settings",
      tg_backup: "Backup",
      tg_restore: "Restore",
      tg_current_val: "Current Value",
      tg_new_val: "Send new value:",
      tg_saved: "Saved!",
      tg_cancelled: "Cancelled",
      tg_log_entry: "",
      tg_log_empty: "No logs found",
      tg_u_custom_name: "Custom Name",
      tg_u_clean_ips: "Clean IPs",
      tg_u_proxy_ips: "Proxy IPs",
      tg_u_nodes: "Nodes",
      tg_u_nat64: "NAT64",
      tg_u_mode: "Protocol Mode",
      tg_u_ports: "Ports",
      tg_u_conn_limit: "Conn Limit",
      tg_u_panel_url: "Panel URL",
      tg_u_max_cfg: "Max Configs",
      tg_u_all: "All Settings",
      tg_network: "Network",
      tg_uptime: "Uptime",
      tg_conns: "Active Connections",
      tg_version: "Version",
      tg_cf_usage: "CF Usage"
    },
    fa: {
      welcome: `🤖 **به ربات ترانزیت نهان خوش آمدید**
جهت مدیریت سیستم نظارتی خود یکی از گزینه‌های زیر را انتخاب نمایید:`,
      status: "وضعیت سیستم",
      users: "مدیریت مشترکین",
      metrics: "سلامت درگاه شبکه",
      panic: "وضعیت اضطراری (Panic)",
      dash: "پنل تحت وب",
      lang: "🌐 تغییر زبان به انگلیسی",
      active: "🟢 فعال",
      paused: "🔴 متوقف شده",
      uptime: "زمان کارکرد",
      streams: "📡 اتصالات فعال",
      no_users: "هیچ مشترکی پیدا نشد.",
      sub_info: "👤 مشخصات مشترک:",
      name: "نام",
      total: "درخواست کل",
      daily: "درخواست روزانه",
      expiry: "انقضاء",
      days: "روزهای باقی‌مانده",
      created: "تاریخ ایجاد",
      unlimited: "نامحدود",
      btn_back: "بازگشت",
      btn_next: "بعدی",
      btn_del: "حذف",
      btn_pause: "غیرفعال‌سازی",
      btn_resume: "فعال‌سازی",
      btn_edit_name: "تغییر نام",
      btn_edit_limits: "ویرایش محدودیت‌ها",
      btn_add: "+ افزودن مشترک جدید",
      btn_confirm: "تأیید",
      btn_cancel: "انصراف",
      msg_enter_name: "لطفاً نام یا شناسه مشترک جدید را ارسال نمایید:",
      msg_added: "مشترک با موفقیت افزوده شد!",
      msg_deleted: "مشترک با موفقیت حذف گردید!",
      msg_panic: `وضعیت اضطراری فعال شد
مسیر تصادفی شد و سیستم متوقف گردید.`,
      msg_invalid: "ورودی نامعتبر است. مجدداً تلاش نمایید.",
      msg_enter_limits: `فرمت ورودی محدودیت:
\`[کل] [روزانه] [مدت_روز]\`
(از 0 برای نامحدود استفاده کنید)

مثال:
\`10000 500 30\``,
      msg_confirm_del: "آیا از حذف این مشترک اطمینان کامل دارید؟",
      msg_confirm_panic: "آیا از فعال‌سازی وضعیت اضطراری اطمینان دارید؟ کل اتصالات متوقف و آدرس‌ها منقضی خواهند شد!",
      status_updated: "وضعیت بروزرسانی شد!",
      access_denied: "دسترسی غیرمجاز. شما اجازه مدیریت این پنل را ندارید.",
      dashboard: "داشبورد",
      search: "جستجوی کاربر",
      statistics: "آمار",
      panel_info: "اطلاعات پنل",
      disabled_users: "کاربران غیرفعال",
      reset_traffic: "بازنشانی ترافیک",
      extend_expiry: "تمدید انقضا",
      notes: "یادداشت‌ها",
      device_limit: "محدودیت کانفیگ",
      msg_enter_search: "🔍 نام کاربری، UUID یا لینک اشتراک را ارسال کنید:",
      msg_enter_notes: "📝 یادداشت برای این کاربر را ارسال کنید:",
      msg_enter_extend_days: "📅 تعداد روزهای تمدید را وارد کنید:",
      msg_traffic_reset: "ترافیک با موفقیت بازنشانی شد!",
      msg_expiry_extended: "انقضا به مدت {days} روز تمدید شد!",
      msg_no_disabled: "هیچ کاربر غیرفعالی یافت نشد.",
      msg_enter_device_limit: "محدودیت تعداد کانفیگ را وارد کنید (0 برای نامحدود):",
      config_limit_updated: "محدودیت کانفیگ به‌روزرسانی شد!",
      stats_title: "آمار پنل",
      count_active: "فعال",
      count_paused: "متوقف",
      count_disabled: "غیرفعال خودکار",
      dash_total: "کل کاربران",
      dash_active: "فعال",
      dash_paused: "متوقف",
      dash_expired: "منقضی",
      dash_auto_disabled: "غیرفعال خودکار",
      btn_main_menu: "منوی اصلی",
      btn_back_to_list: "بازگشت به لیست",
      total_traffic: "ترافیک کل",
      daily_traffic: "ترافیک روزانه",
      lbl_status: "وضعیت",
      lbl_subscription: "لینک اشتراک",
      lbl_user_not_found: "⚠️ کاربر یافت نشد",
      lbl_none: "ندارد",
      lbl_page: "صفحه",
      select_panel: "🔌 کدام پنل را می‌خواهید مدیریت کنید؟",
      current_panel: "پنل فعلی",
      switch_panel: "🔄 تغییر پنل",
      panel_local: "🏠 این پنل",
      panel_remote: "🌐",
      msg_panel_selected: "پنل انتخاب شد! ✅",
      msg_panel_error: "❌ اتصال به پنل انتخابی ناموفق بود.",
      msg_panel_unreachable: "⚠️ پنل در دسترس نیست. لطفاً پیکربندی را بررسی کنید.",
      btn_sub_link: "لینک اشتراک",
      sub_link_sent: "لینک اشتراک ارسال شد!",
      btn_update_usage: "بروزرسانی مصرف",
      tg_settings: "تنظیمات",
      tg_advanced: "پیشرفته",
      tg_logs: "گزارش‌ها",
      tg_sys_settings: "تنظیمات سیستم",
      tg_adv_settings: "تنظیمات پیشرفته",
      tg_logs_view: "مشاهده گزارش‌ها",
      tg_logs_clear: "پاک کردن گزارش‌ها",
      tg_proto: "پروتکل",
      tg_ports: "پورت‌ها",
      tg_uuid: "شناسه دستگاه",
      tg_path: "مسیر API",
      tg_pass: "کلید اصلی",
      tg_dns: "DNS",
      tg_relay: "آی‌پی رله",
      tg_maintenance: "سایت استتار",
      tg_tfo: "TCP Fast Open",
      tg_ech: "ECH",
      tg_silent: "هشدار خاموش",
      tg_pause: "کلید توقف",
      tg_auto_update: "بروزرسانی خودکار",
      tg_direct: "کانفیگ مستقیم",
      tg_nat64: "NAT64",
      tg_clean_ips: "آی‌پی تمیز",
      tg_nodes: "نودها",
      tg_strategy: "روش نام‌گذاری",
      tg_prefix: "پیشوند",
      tg_fake_entries: "ورودی‌های اشتراک",
      tg_cf_settings: "تنظیمات کلودفلر",
      tg_tg_settings: "تنظیمات تلگرام",
      tg_backup: "پشتیبان‌گیری",
      tg_restore: "بازیابی",
      tg_current_val: "مقدار فعلی",
      tg_new_val: "مقدار جدید را ارسال کنید:",
      tg_saved: "ذخیره شد!",
      tg_cancelled: "لغو شد",
      tg_log_entry: "",
      tg_log_empty: "گزارشی ثبت نشده",
      tg_u_custom_name: "نام سفارشی",
      tg_u_clean_ips: "آی‌پی تمیز",
      tg_u_proxy_ips: "آی‌پی پروکسی",
      tg_u_nodes: "نودها",
      tg_u_nat64: "NAT64",
      tg_u_mode: "پروتکل",
      tg_u_ports: "پورت‌ها",
      tg_u_conn_limit: "محدودیت اتصال",
      tg_u_panel_url: "آدرس پنل",
      tg_u_max_cfg: "حداکثر کانفیگ",
      tg_u_all: "همه تنظیمات",
      tg_network: "شبکه",
      tg_uptime: "زمان کارکرد",
      tg_conns: "اتصالات فعال",
      tg_version: "نسخه",
      tg_cf_usage: "مصرف کلودفلر"
    }
  }
};

// src/core/constants.js
var CURRENT_VERSION = "3.0.4";
var getAlpha2 = () => String.fromCharCode(118, 108, 101, 115, 115);
var getBeta = () => String.fromCharCode(116, 114, 111, 106, 97, 110);
var getGamma = () => String.fromCharCode(99, 108, 97, 115, 104);
var REQ_BYTES_EST = 1073741824 / 6000;
var TCP_OPEN_TIMEOUT_MS = 5000;
var TCP_WRITE_TIMEOUT_MS = 5000;
var UPSTREAM_WRITE_TIMEOUT_MS = 15000;
var NAHAN_RUNNER_LEASE_TTL_MS = 120000;
var UPSTREAM_QUEUE_MAX_BYTES = 4 * 1024 * 1024;
var UPSTREAM_QUEUE_MAX_ITEMS = 256;
var CACHE_TTL_CONFIG = 1e4;
var CACHE_TTL_USAGE = 1e4;
var CACHE_TTL_BACKUP_IP = 30000;
var VALID_NAME_TAGS = [
  "FLAG",
  "COUNTRY",
  "CITY",
  "ISP",
  "PROTOCOL",
  "USER",
  "PORT",
  "PREFIX",
  "IP",
  "IP_NAME",
  "HOST",
  "DATE",
  "INDEX",
  "WORKER"
];
var AI_LLM_SUFFIXES = assets_default.ai_suffixes || [];
var botI18n = assets_default.bot_i18n || {};
var SYSTEM_DEFAULTS = {
  name: "",
  apiRoute: "sync",
  maintenanceHost: "https://www.ubuntu.com, https://www.docker.com",
  backupRelay: "",
  customRelay: "",
  masterKey: "admin",
  metricNode: "time.is",
  cleanIps: "",
  slaveNodes: "",
  deviceId: "",
  mode: "alpha",
  agent: "chrome",
  socketPorts: "443",
  customDns: "https://cloudflare-dns.com/dns-query",
  resolveIp: "1.1.1.1",
  cascade: "",
  enableOpt1: false,
  enableOpt2: false,
  tgToken: "",
  tgChatId: "",
  tgAdminId: "",
  cfAccountId: "",
  cfApiToken: "",
  cfWorkerName: "",
  isPaused: false,
  silentAlerts: false,
  githubRepo: "itsyebekhe/nahan",
  nameStrategy: "default",
  namePrefix: "Core",
  tgBotLang: "fa",
  users: [],
  subUserAgent: "",
  customPanelUrl: "",
  limitTotalReq: 0,
  expiryMs: 0,
  linkedPanels: [],
  hubPanelUrl: "",
  syncApiKey: "",
  panelApiKeys: [],
  nat64Prefix: "",
  enableDirectConfigs: false,
  customRouting: "",
  upstreamUri: "",
  autoUpdate: false,
  autoUpdateFormat: "encoded",
  fakeConfigs: [
    { name: "\uD83D\uDCCA {usage}", enabled: true },
    { name: "\uD83D\uDCC5 {expiry}", enabled: true }
  ],
  optAutoApply: true,
  optMode: "fragment",
  optCs: "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
  optFm: '{"tcp":[{"type":"fragment","settings":{"packets":"tlshello","lengths":["0","104","1"],"delays":["0"],"maxSplit":"0"}},{"type":"fragment","settings":{"packets":"1-1","lengths":["114","1"],"delays":["1"],"maxSplit":"11"}}]}',
  optFp: "chrome",
  optAdr: "",
  optEchList: "cloudflare-ech.com+udp://1.1.1.1\\ncloudflare-ech.com+udp://8.8.8.8",
  optEchSuffix: " ECH {ip}",
  maintenanceMode: false,
  allowRemoteDeploy: true,
  autoPruneRelays: true,
  trafficNormalizer: true,
  trafficNormaliser: true
};

// src/core/state.js
var sysConfig = { ...SYSTEM_DEFAULTS };
function updateSysConfig(next) {
  if (!next)
    return;
  for (const k of Object.keys(sysConfig))
    delete sysConfig[k];
  Object.assign(sysConfig, next);
}
var isolateStartTime = 0;
function setIsolateStartTime(t) {
  isolateStartTime = t;
}
var activeConnections = 0;
function incActiveConnections() {
  activeConnections++;
}
function decActiveConnections() {
  activeConnections = Math.max(0, activeConnections - 1);
}
var INFLIGHT_HTTP = 0;
function incInflightHttp() {
  INFLIGHT_HTTP++;
}
function decInflightHttp() {
  INFLIGHT_HTTP = Math.max(0, INFLIGHT_HTTP - 1);
}
var OPEN_WS = 0;
function incOpenWs() {
  OPEN_WS++;
}
function decOpenWs() {
  OPEN_WS = Math.max(0, OPEN_WS - 1);
}
function breakerLevel() {
  try {
    if (INFLIGHT_HTTP > 200 || OPEN_WS > 400)
      return 2;
    if (INFLIGHT_HTTP > 100 || OPEN_WS > 200)
      return 1;
    return 0;
  } catch (e) {
    return 0;
  }
}
var uuidUsage = new Map;
var activeConns = new Map;
var sysUsageCache = { users: {} };
function updateSysUsageCache(next) {
  if (!next)
    return;
  for (const k of Object.keys(sysUsageCache))
    delete sysUsageCache[k];
  Object.assign(sysUsageCache, next);
}
function trackUsage(activeClientHash, bytes = 0, env = null, ctx = null) {
  if (!activeClientHash)
    return;
  try {
    if (!sysUsageCache.users)
      sysUsageCache.users = {};
    const today = new Date().toISOString().split("T")[0];
    let u = sysUsageCache.users[activeClientHash];
    if (!u) {
      u = { reqs: 0, dReqs: 0, bytes: 0, dBytes: 0, lastDay: today };
      sysUsageCache.users[activeClientHash] = u;
    }
    if (u.lastDay !== today) {
      u.dReqs = 0;
      u.dBytes = 0;
      u.lastDay = today;
    }
    if (bytes === 0) {
      u.reqs = (u.reqs || 0) + 1;
      u.dReqs = (u.dReqs || 0) + 1;
    } else {
      u.bytes = (u.bytes || 0) + bytes;
      u.dBytes = (u.dBytes || 0) + bytes;
    }
  } catch (e) {}
}
var configRegistry = new Map;
var authHashCache = new Map;
var trojanHashCache = authHashCache;
var ipGeoCache = new Map;
var boxTemplate = null;
var singboxTemplate = null;
function setBoxTemplate(t) {
  boxTemplate = t;
  singboxTemplate = t;
}
var edgeTemplate = null;
var clashTemplate = null;
function setEdgeTemplate(t) {
  edgeTemplate = t;
  clashTemplate = t;
}
var coreTemplate = null;
var v2rayTemplate = null;
function setCoreTemplate(t) {
  coreTemplate = t;
  v2rayTemplate = t;
}
var lastRelaySweep = 0;
function setLastRelaySweep(t) {
  lastRelaySweep = t;
}
var activeDeviceId = "";
function setActiveDeviceId(id) {
  activeDeviceId = id;
}

// src/core/utils.js
var safeBtoa = (str) => {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0;i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (e) {
    return btoa(str);
  }
};
async function fetchT(url, init = {}, timeoutMs = 1e4) {
  const timeout = Math.max(1, Number(timeoutMs) || 1e4);
  let controller = null;
  let timer = null;
  let callerSignal = null;
  let onCallerAbort = null;
  try {
    if (typeof AbortController !== "undefined") {
      controller = new AbortController;
      callerSignal = init && init.signal ? init.signal : null;
      if (callerSignal) {
        if (callerSignal.aborted)
          controller.abort(callerSignal.reason);
        else {
          onCallerAbort = () => {
            try {
              controller.abort(callerSignal.reason);
            } catch (e) {}
          };
          try {
            callerSignal.addEventListener("abort", onCallerAbort, {
              once: true
            });
          } catch (e) {}
        }
      }
      timer = setTimeout(() => {
        try {
          controller.abort();
        } catch (e) {}
      }, timeout);
      return await fetch(url, { ...init, signal: controller.signal });
    }
    return await fetch(url, { ...init });
  } finally {
    if (timer) {
      try {
        clearTimeout(timer);
      } catch (e) {}
    }
    if (callerSignal && onCallerAbort) {
      try {
        callerSignal.removeEventListener("abort", onCallerAbort);
      } catch (e) {}
    }
  }
}
function usageTotalBytes(u) {
  try {
    if (!u)
      return 0;
    if (typeof u.bytes === "number" && u.bytes >= 0)
      return Math.floor(u.bytes);
    return Math.floor((u.reqs || 0) * REQ_BYTES_EST);
  } catch (e) {
    return 0;
  }
}
function usageDailyBytes(u, today) {
  try {
    if (!u)
      return 0;
    const day = today || new Date().toISOString().split("T")[0];
    if ((u.lastDay || "") !== day)
      return 0;
    if (typeof u.dBytes === "number" && u.dBytes >= 0)
      return Math.floor(u.dBytes);
    return Math.floor((u.dReqs || 0) * REQ_BYTES_EST);
  } catch (e) {
    return 0;
  }
}
function limitReqToBytes(limitReq) {
  try {
    return limitReq ? Math.floor(limitReq * REQ_BYTES_EST) : 0;
  } catch (e) {
    return 0;
  }
}
function sleepMs(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
function withTimeout(promise, ms, label) {
  let timer = null;
  const gate = new Promise((_, rej) => {
    timer = setTimeout(() => {
      try {
        rej(new Error(label || "timeout"));
      } catch (e) {}
    }, ms);
  });
  return Promise.race([promise, gate]).finally(() => {
    try {
      if (timer)
        clearTimeout(timer);
    } catch (e) {}
  });
}
function closeTcpSocketQuietly(socket) {
  try {
    if (socket && typeof socket.close === "function")
      socket.close();
  } catch (e) {}
}
function releaseWriterQuietly(writer) {
  try {
    if (writer && typeof writer.releaseLock === "function")
      writer.releaseLock();
  } catch (e) {}
}
async function withDeadline(promise, timeoutMs, onTimeout, label = "operation") {
  let timer = null;
  let settled = false;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      if (settled)
        return;
      try {
        if (typeof onTimeout === "function")
          onTimeout();
      } catch (e) {}
      reject(new Error(`${label}-timeout`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    settled = true;
    if (timer) {
      try {
        clearTimeout(timer);
      } catch (e) {}
    }
  }
}
async function writeSocketWithTimeout(socket, writer, data, timeoutMs = TCP_WRITE_TIMEOUT_MS) {
  if (!writer || typeof writer.write !== "function")
    throw new Error("socket-writer-unavailable");
  return await withDeadline(writer.write(data), timeoutMs, () => closeTcpSocketQuietly(socket), "socket-write");
}
function cmpVersions(a, b) {
  const strip = (v) => String(v).replace(/^v/, "").trim();
  const pa = strip(a).split(".").map(Number);
  const pb = strip(b).split(".").map(Number);
  for (let i = 0;i < Math.max(pa.length, pb.length); i++) {
    let na = pa[i] || 0, nb = pb[i] || 0;
    if (na > nb)
      return 1;
    if (nb > na)
      return -1;
  }
  return 0;
}
async function deployWorkerToCloudflare(accountId, apiToken, workerName, code) {
  let currentBindings = [];
  try {
    const settingsRes = await fetchT(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${encodeURIComponent(workerName)}/settings`, { headers: { Authorization: `Bearer ${apiToken}` } }, 30000);
    const settingsJson = await settingsRes.json();
    if (settingsJson.success && settingsJson.result?.bindings) {
      currentBindings = settingsJson.result.bindings;
    }
  } catch (e) {}
  const metadata = {
    main_module: "_worker.js",
    compatibility_date: "2024-03-01",
    compatibility_flags: ["allow_eval_during_startup"],
    bindings: currentBindings
  };
  const form = new FormData;
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("_worker.js", new Blob([code], { type: "application/javascript+module" }), "_worker.js");
  return await fetchT(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${encodeURIComponent(workerName)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${apiToken}` },
    body: form
  }, 30000);
}

// src/core/d1.js
async function d1Init(env) {
  if (env.IOT_DB && !env.IOT_DB_INITIALIZED) {
    try {
      await env.IOT_DB.prepare("CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)").run();
      env.IOT_DB_INITIALIZED = true;
    } catch (e) {
      env.IOT_DB_INITIALIZED = true;
    }
  }
}
async function d1Get(env, key) {
  if (!env.IOT_DB)
    return null;
  await d1Init(env);
  try {
    const { results } = await env.IOT_DB.prepare("SELECT value FROM kv_store WHERE key = ?").bind(key).all();
    if (results && results.length > 0)
      return results[0].value;
  } catch (e) {}
  return null;
}
async function d1Put(env, key, value) {
  if (!env.IOT_DB)
    return;
  await d1Init(env);
  try {
    await env.IOT_DB.prepare("INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key, value).run();
  } catch (e) {}
}
async function cachedD1Put(env, key, value) {
  await d1Put(env, key, value);
  if (key === "sys_config")
    setSysConfigCacheTime(0);
  else if (key === "sys_usage")
    setSysUsageCacheTime(0);
  else if (key === "backup_ip")
    setBackupIpCacheTime(0);
}
async function d1PutStrict(env, key, value) {
  if (!env.IOT_DB)
    throw new Error("d1-unavailable");
  await d1Init(env);
  await env.IOT_DB.prepare("INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key, value).run();
}

// src/core/config.js
var sysConfigCacheTime = 0;
function setSysConfigCacheTime(t) {
  sysConfigCacheTime = t;
}
var sysConfigLoading = null;
var sysUsageCacheTime = 0;
function setSysUsageCacheTime(t) {
  sysUsageCacheTime = t;
}
var sysUsageLoading = null;
var backupIpCacheTime = 0;
function setBackupIpCacheTime(t) {
  backupIpCacheTime = t;
}
var backupIpLoading = null;
var backupIpCache = null;
async function loadSysConfig(env, ctx = null) {
  const now = Date.now();
  if (env.IOT_DB) {
    if (now - sysConfigCacheTime > CACHE_TTL_CONFIG) {
      if (!sysConfigLoading) {
        sysConfigLoading = d1Get(env, "sys_config").then((stored) => {
          updateSysConfig({
            ...SYSTEM_DEFAULTS,
            ...stored ? JSON.parse(stored) : null
          });
          sysConfigCacheTime = Date.now();
          if (migrateSlaveNodesToLinkedPanels(sysConfig)) {
            const promise = cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            if (ctx && typeof ctx.waitUntil === "function") {
              ctx.waitUntil(promise.catch(() => {}));
            } else {
              promise.catch(() => {});
            }
          }
        }).catch(() => {
          updateSysConfig({ ...SYSTEM_DEFAULTS });
          sysConfigCacheTime = Date.now();
        }).finally(() => {
          sysConfigLoading = null;
        });
      }
      await sysConfigLoading;
    }
    if (now - sysUsageCacheTime > CACHE_TTL_USAGE) {
      if (!sysUsageLoading) {
        sysUsageLoading = d1Get(env, "sys_usage").then((ustored) => {
          if (ustored)
            updateSysUsageCache(JSON.parse(ustored));
          else
            updateSysUsageCache({ users: {} });
          sysUsageCacheTime = Date.now();
        }).catch(() => {
          updateSysUsageCache({ users: {} });
          sysUsageCacheTime = Date.now();
        }).finally(() => {
          sysUsageLoading = null;
        });
      }
      await sysUsageLoading;
    }
  }
  if (now - backupIpCacheTime > CACHE_TTL_BACKUP_IP) {
    if (!backupIpLoading) {
      backupIpLoading = (env.IOT_DB ? d1Get(env, "backup_ip") : Promise.resolve(null)).then((val) => {
        backupIpCache = val;
        backupIpCacheTime = Date.now();
      }).catch(() => {
        backupIpCacheTime = Date.now();
      }).finally(() => {
        backupIpLoading = null;
      });
    }
    await backupIpLoading;
  }
  sysConfig.customRelay = backupIpCache ?? env.RELAY_IP ?? "";
}
function validateNameStrategy(strategy) {
  if (!strategy)
    return { valid: true, unknownTags: [] };
  const tagPattern = /\{([A-Za-z]+)\}/g;
  let match;
  let unknownTags = [];
  while ((match = tagPattern.exec(strategy)) !== null) {
    let tag = match[1].toUpperCase();
    if (!VALID_NAME_TAGS.includes(tag))
      unknownTags.push(match[1]);
  }
  return { valid: unknownTags.length === 0, unknownTags };
}
async function serveMaintenancePage(request, url) {
  try {
    if (breakerLevel() >= 1) {
      return new Response("Not Found", { status: 404 });
    }
  } catch (e) {}
  let fakeList = sysConfig.maintenanceHost ? sysConfig.maintenanceHost.split(",").map((s) => s.trim()).filter((s) => s) : ["https://www.ubuntu.com"];
  const clientIP = request.headers.get("cf-connecting-ip") || "0.0.0.0";
  const ipHash = Array.from(clientIP).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const targetStr = fakeList[ipHash % fakeList.length].startsWith("http") ? fakeList[ipHash % fakeList.length] : `https://${fakeList[ipHash % fakeList.length]}`;
  try {
    const targetUrl = new URL(targetStr);
    if (url.pathname !== "/")
      targetUrl.pathname = url.pathname;
    targetUrl.search = url.search;
    const cleanHeaders = new Headers(request.headers);
    cleanHeaders.set("Host", targetUrl.hostname);
    cleanHeaders.delete("cf-connecting-ip");
    cleanHeaders.delete("x-forwarded-for");
    const fetchInit = {
      method: request.method,
      headers: cleanHeaders,
      redirect: "follow"
    };
    if (request.method !== "GET" && request.method !== "HEAD")
      fetchInit.body = request.body;
    return await fetchT(new Request(targetUrl.toString(), fetchInit));
  } catch (e) {
    return new Response("Not Found", { status: 404 });
  }
}
function migrateSlaveNodesToLinkedPanels(config) {
  let modified = false;
  if (config && config.slaveNodes && config.slaveNodes.trim().length > 0) {
    if (!config.linkedPanels)
      config.linkedPanels = [];
    let nodes = config.slaveNodes.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
    let syncKey = config.syncApiKey || "";
    nodes.forEach((node) => {
      let cleanNode = node.replace(/^[a-zA-Z]+:\/\//, "").split("/")[0].split("@").pop().split(":")[0].toLowerCase();
      let exists = config.linkedPanels.some((p) => {
        if (!p || !p.url)
          return false;
        let cleanUrl = p.url.replace(/^[a-zA-Z]+:\/\//, "").split("/")[0].split("@").pop().split(":")[0].toLowerCase();
        return cleanUrl === cleanNode;
      });
      if (!exists) {
        config.linkedPanels.push({ url: node, apiKey: syncKey });
        modified = true;
      }
    });
    config.slaveNodes = "";
    modified = true;
  }
  return modified;
}

// src/core/auth.js
var LOGIN_ATTEMPTS = new Map;
var LOGIN_WINDOW_MS = 15 * 60 * 1000;
var LOGIN_FAIL_LIMIT = 5;
var WS_RATE = new Map;
function sha224Hex(m) {
  const msg = new TextEncoder().encode(m);
  const K = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ];
  let H = [
    3238371032,
    914150663,
    812702999,
    4144912697,
    4290775857,
    1750603025,
    1694076839,
    3204075428
  ];
  const words = [];
  const n = Math.ceil((msg.length + 9) / 64) * 16;
  for (let i = 0;i < n; i++)
    words[i] = 0;
  for (let i = 0;i < msg.length; i++)
    words[i >> 2] |= msg[i] << 24 - i % 4 * 8;
  words[msg.length >> 2] |= 128 << 24 - msg.length % 4 * 8;
  words[n - 1] = msg.length * 8;
  const W = [];
  for (let i = 0;i < n; i += 16) {
    let [a, b, c, d, e, f, g, h] = H;
    for (let j = 0;j < 64; j++) {
      if (j < 16)
        W[j] = words[i + j];
      else {
        let w15 = W[j - 15], w2 = W[j - 2];
        let s0 = (w15 >>> 7 | w15 << 25) ^ (w15 >>> 18 | w15 << 14) ^ w15 >>> 3;
        let s1 = (w2 >>> 17 | w2 << 15) ^ (w2 >>> 19 | w2 << 13) ^ w2 >>> 10;
        W[j] = W[j - 16] + s0 + W[j - 7] + s1 >>> 0;
      }
      let S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      let ch = e & f ^ ~e & g;
      let temp1 = h + S1 + ch + K[j] + W[j] >>> 0;
      let S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      let maj = a & b ^ a & c ^ b & c;
      let temp2 = S0 + maj >>> 0;
      h = g;
      g = f;
      f = e;
      e = d + temp1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2 >>> 0;
    }
    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
    H[5] = H[5] + f >>> 0;
    H[6] = H[6] + g >>> 0;
    H[7] = H[7] + h >>> 0;
  }
  return H.slice(0, 7).map((v) => v.toString(16).padStart(8, "0")).join("");
}
function isPanelApiKey(key) {
  if (!key || !sysConfig.panelApiKeys || !Array.isArray(sysConfig.panelApiKeys))
    return false;
  return sysConfig.panelApiKeys.some((k) => k.key === key);
}
function extractAuthKey(request, data) {
  const authHeader = request.headers.get("Authorization") || "";
  const authKey = authHeader.replace("Bearer ", "") || "";
  let bodyKey = "";
  if (data && typeof data === "object")
    bodyKey = data.key || "";
  return authKey || bodyKey;
}
function isAuthorized(request, data) {
  try {
    const ip = request && request.headers && request.headers.get("cf-connecting-ip") || "Unknown";
    if (authBlocked(ip))
      return false;
    const key = extractAuthKey(request, data);
    const ok = key === sysConfig.masterKey || isPanelApiKey(key);
    if (!ok)
      authFail(ip);
    return ok;
  } catch (e) {
    return false;
  }
}
function generateApiKey(name) {
  const id = crypto.randomUUID();
  const raw = `nahan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const key = raw;
  return {
    id,
    name: name || "Unnamed Key",
    key,
    createdAt: Date.now(),
    lastUsed: null
  };
}
function authBlocked(ip) {
  try {
    const r = LOGIN_ATTEMPTS.get(ip);
    if (!r)
      return false;
    if (Date.now() - r.first > LOGIN_WINDOW_MS) {
      LOGIN_ATTEMPTS.delete(ip);
      return false;
    }
    return r.n >= LOGIN_FAIL_LIMIT;
  } catch (e) {
    return false;
  }
}
function authFail(ip) {
  try {
    const now = Date.now();
    let r = LOGIN_ATTEMPTS.get(ip);
    if (!r || now - r.first > LOGIN_WINDOW_MS)
      r = { n: 0, first: now };
    r.n++;
    LOGIN_ATTEMPTS.set(ip, r);
    if (LOGIN_ATTEMPTS.size > 1e4)
      LOGIN_ATTEMPTS.clear();
  } catch (e) {}
}
function authClear(ip) {
  try {
    LOGIN_ATTEMPTS.delete(ip);
  } catch (e) {}
}
function wsRateCheck(ip) {
  try {
    const now = Date.now();
    let r = WS_RATE.get(ip);
    if (!r || now - r.ts > 60000) {
      r = { n: 0, ts: now };
      WS_RATE.set(ip, r);
    }
    r.n++;
    if (WS_RATE.size > 1e4)
      WS_RATE.clear();
    if (r.n > 400)
      return "refuse";
    if (r.n > 120)
      return "tarpit";
    return "ok";
  } catch (e) {
    return "ok";
  }
}

// src/protocols/trojan.js
function getAuthHash(uuid) {
  if (authHashCache.has(uuid))
    return authHashCache.get(uuid);
  const hash = sha224Hex(uuid);
  authHashCache.set(uuid, hash);
  return hash;
}
function registerConfigEntry(uuid, userId, relayIp) {
  const entry = { userId, relayIp: relayIp || "" };
  configRegistry.set(uuid.replace(/-/g, "").toLowerCase(), entry);
  const hashKey = getAuthHash(uuid);
  configRegistry.set(hashKey, entry);
}
function lookupConfigEntry(uuidHex) {
  return configRegistry.get(uuidHex.toLowerCase()) || null;
}
function generateConfigUuid2(originalUuid, relayIpIndex) {
  const cleanUuid = originalUuid.replace(/-/g, "").toLowerCase();
  const userPart = cleanUuid.substring(0, 24);
  const relayPart = relayIpIndex.toString(16).padStart(8, "0");
  const fullHex = userPart + relayPart;
  return `${fullHex.substring(0, 8)}-${fullHex.substring(8, 12)}-${fullHex.substring(12, 16)}-${fullHex.substring(16, 20)}-${fullHex.substring(20, 32)}`;
}
function decodeConfigUuid(uuid) {
  const cleanUuid = uuid.replace(/-/g, "").toLowerCase();
  if (cleanUuid.length !== 32)
    return null;
  const userFingerprint = cleanUuid.substring(0, 24);
  const relayIpIndex = parseInt(cleanUuid.substring(24, 32), 16);
  return { userFingerprint, relayIpIndex };
}
function generateHardwareId(seed) {
  const h20 = Array.from(new TextEncoder().encode(seed)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 20).padEnd(20, "0");
  return `${h20.slice(0, 8)}-0000-4000-8000-${h20.slice(-12)}`;
}
function getTransportParams2(port) {
  return ["80", "8080", "8880", "2052", "2082", "2086", "2095"].includes(port.toString()) ? "none" : "tls";
}

// src/protocols/stream.js
import { connect as connect2 } from "cloudflare:sockets";

// src/relays/health.js
import { connect } from "cloudflare:sockets";
var RELAY_Q = new Map;
var RELAY_QUARANTINE_MS = 15 * 60 * 1000;
var AI_RELAY_Q = new Map;
var RELAY_FAIL_STREAK = 3;
var AI_FAIL_STREAK = 2;
var AI_QUARANTINE_MS = 30 * 60 * 1000;
var RELAY_TLS_PORTS = new Set(["443", "8443", "2053", "2083", "2087", "2096"]);
var PROBE_INTERVAL_MS = 60 * 1000;
var PROBE_MAX_PER_ROUND = 8;
var PROBE_FAIL_LIMIT = 3;
var FLAP_WINDOW_MS = 24 * 60 * 60 * 1000;
var FLAP_LIMIT = 3;
var GRAVE_INTERVAL_MS = 5 * 60 * 1000;
var GRAVE_MAX_PER_ROUND = 4;
var GRAVE_HEALTHY_NEED = 3;
var RELAY_SNAPSHOT_LOADED = false;
var lastHealthSave = 0;
var lastProbeTs = 0;
var probeCursor = 0;
var lastGraveTs = 0;
var graveCursor = 0;
var lastResurrectChanged = false;
function relayHealthSnapshot() {
  const out = { quarantined: [], graveyard: [], aiQuarantine: [] };
  try {
    const now = Date.now();
    for (const [k, e] of RELAY_Q) {
      if (e && e.until && e.until > now)
        out.quarantined.push(k);
    }
  } catch (e) {}
  try {
    for (const [k, e] of AI_RELAY_Q) {
      if (e && e.until && Date.now() < e.until)
        out.aiQuarantine.push(k);
    }
  } catch (e) {}
  return out;
}
async function relayHealthSnapshotAsync(env) {
  const out = relayHealthSnapshot();
  try {
    if (env && env.IOT_DB) {
      const g = JSON.parse(await d1Get(env, "relay_graveyard") || "{}");
      for (const [k, e] of Object.entries(g || {})) {
        out.graveyard.push({
          key: k,
          streak: e && e.healthyStreak || 0,
          unstable: !!(e && e.unstable),
          lists: e && e.lists && e.lists.length || 0
        });
      }
    }
  } catch (e) {}
  return out;
}
async function acquireNahanRunnerLock(env, jobKey, intervalMs, lockGroup = "nahan-relay") {
  const physicalKey = "nahan_lock:" + String(lockGroup || "nahan-relay");
  const scheduleKey = "nahan_runner_last_" + String(jobKey || "job");
  let lease = null;
  try {
    if (!env || !env.IOT_DB)
      return null;
    const now = Date.now();
    const until = now + NAHAN_RUNNER_LEASE_TTL_MS;
    try {
      const r = await env.IOT_DB.prepare("UPDATE kv_store SET value=? WHERE key=? AND CAST(value AS INTEGER)<?").bind(String(until), physicalKey, now).run();
      if (r && r.meta && r.meta.changes > 0)
        lease = { lockKey: physicalKey, until, scheduleKey };
    } catch (e) {}
    if (!lease) {
      try {
        const r = await env.IOT_DB.prepare("INSERT OR IGNORE INTO kv_store(key,value) VALUES(?,?)").bind(physicalKey, String(until)).run();
        if (r && r.meta && r.meta.changes > 0)
          lease = { lockKey: physicalKey, until, scheduleKey };
      } catch (e) {}
    }
    if (!lease)
      return null;
    let lastRun = 0;
    try {
      const row = await env.IOT_DB.prepare("SELECT value FROM kv_store WHERE key=?").bind(scheduleKey).first();
      lastRun = Number(row && row.value || 0) || 0;
    } catch (e) {}
    if (intervalMs > 0 && now - lastRun < intervalMs) {
      await releaseNahanRunnerLock(env, lease);
      return null;
    }
    try {
      await env.IOT_DB.prepare("INSERT INTO kv_store(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(scheduleKey, String(now)).run();
    } catch (e) {
      await releaseNahanRunnerLock(env, lease);
      return null;
    }
    return lease;
  } catch (e) {
    try {
      if (lease)
        await releaseNahanRunnerLock(env, lease);
    } catch (_) {}
    return null;
  }
}
async function releaseNahanRunnerLock(env, lease) {
  try {
    if (lease && env && env.IOT_DB) {
      await env.IOT_DB.prepare("DELETE FROM kv_store WHERE key=? AND value=?").bind(lease.lockKey, String(lease.until)).run();
    }
  } catch (e) {}
}
function relayKeyOf(tok) {
  try {
    let s = String(tok || "").trim();
    if (!s)
      return null;
    s = s.replace(/^[a-zA-Z]+:\/\//, "");
    if (s.includes("@"))
      s = s.substring(s.lastIndexOf("@") + 1);
    const hi = s.indexOf("#");
    if (hi !== -1)
      s = s.substring(0, hi).trim();
    if (!s)
      return null;
    if (s.charAt(0) === "[") {
      const ci = s.indexOf("]");
      if (ci === -1)
        return null;
      const host = s.substring(1, ci).toLowerCase();
      let port = 443;
      if (s.length > ci + 1 && s.charAt(ci + 1) === ":") {
        const p = parseInt(s.substring(ci + 2), 10);
        if (!isNaN(p) && p >= 1 && p <= 65535)
          port = p;
      }
      if (!host)
        return null;
      return { host, port, key: host + "|" + port };
    }
    const firstColon = s.indexOf(":");
    const lastColon = s.lastIndexOf(":");
    if (firstColon !== -1 && firstColon !== lastColon) {
      const host = s.toLowerCase();
      if (!host || host.length > 253)
        return null;
      return { host, port: 443, key: host + "|443" };
    }
    let host = s;
    let port = 443;
    if (lastColon !== -1) {
      const tail = s.substring(lastColon + 1).trim();
      if (/^\d+$/.test(tail)) {
        const p = parseInt(tail, 10);
        if (!isNaN(p) && p >= 1 && p <= 65535) {
          host = s.substring(0, lastColon);
          port = p;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
    host = host.toLowerCase();
    if (!host || host.length > 253)
      return null;
    if (!/^[a-z0-9.\-]+$/.test(host))
      return null;
    return { host, port, key: host + "|" + port };
  } catch (e) {
    return null;
  }
}
function isRelayQuarantined(host, port) {
  try {
    const e = RELAY_Q.get(String(host || "").toLowerCase() + "|" + (port || 443));
    if (!e || !e.until)
      return false;
    if (Date.now() > e.until) {
      RELAY_Q.delete(String(host || "").toLowerCase() + "|" + (port || 443));
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
function recordRelaySuccess(host, port, full) {
  try {
    const k = String(host || "").toLowerCase() + "|" + (port || 443);
    const e = RELAY_Q.get(k);
    if (!e)
      return;
    e.fail = 0;
    if (full) {
      e.probeFail = 0;
      e.until = 0;
      if (!e.fail && !e.probeFail)
        RELAY_Q.delete(k);
    }
  } catch (err) {}
}
function recordRelayFailure(host, port) {
  try {
    const k = String(host || "").toLowerCase() + "|" + (port || 443);
    let e = RELAY_Q.get(k);
    if (!e) {
      e = { fail: 0, until: 0, probeFail: 0 };
      RELAY_Q.set(k, e);
    }
    e.fail = (e.fail || 0) + 1;
    if (e.fail >= RELAY_FAIL_STREAK) {
      const alreadyOut = e.until && e.until > Date.now() ? true : false;
      e.until = Date.now() + RELAY_QUARANTINE_MS;
      if (!alreadyOut) {
        try {
          console.error("relay-quarantined: " + k + " (" + e.fail + " fails)");
        } catch (err) {}
      }
    }
    if (RELAY_Q.size > 2000)
      RELAY_Q.clear();
  } catch (err) {}
}
function isAiQuarantined(host, port) {
  try {
    const k = String(host || "").toLowerCase() + "|" + (port || 443);
    const e = AI_RELAY_Q.get(k);
    if (!e)
      return false;
    if (e.until) {
      if (Date.now() < e.until)
        return true;
      try {
        AI_RELAY_Q.delete(k);
      } catch (err) {}
      return false;
    }
    return false;
  } catch (err) {
    return false;
  }
}
function recordAiFailure(host, port) {
  try {
    if (AI_RELAY_Q.size > 500) {
      const now0 = Date.now();
      for (const [kk, vv] of AI_RELAY_Q) {
        if (!vv || !vv.until || vv.until <= now0) {
          try {
            AI_RELAY_Q.delete(kk);
          } catch (e) {}
        }
        if (AI_RELAY_Q.size <= 400)
          break;
      }
    }
    const k = String(host || "").toLowerCase() + "|" + (port || 443);
    const now = Date.now();
    const e = AI_RELAY_Q.get(k) || { fail: 0, until: 0 };
    if (e.until && now < e.until)
      return;
    e.fail++;
    if (e.fail >= AI_FAIL_STREAK) {
      e.until = now + AI_QUARANTINE_MS;
      e.fail = 0;
      try {
        console.error("relay-ai-quarantined: " + k);
      } catch (err) {}
    }
    AI_RELAY_Q.set(k, e);
  } catch (err) {}
}
function recordAiSuccess(host, port) {
  try {
    AI_RELAY_Q.delete(String(host || "").toLowerCase() + "|" + (port || 443));
  } catch (err) {}
}
function filterAiQuarantinedTokens(list) {
  try {
    return (list || []).filter((t) => {
      const rk = relayKeyOf(t);
      if (!rk)
        return true;
      return !isAiQuarantined(rk.host, rk.port);
    });
  } catch (e) {
    return [];
  }
}
function filterQuarantinedRelays(list) {
  try {
    return (list || []).filter((t) => {
      const rk = relayKeyOf(t);
      if (!rk)
        return true;
      return !isRelayQuarantined(rk.host, rk.port);
    });
  } catch (e) {
    return [];
  }
}
function isAiDomain(d) {
  try {
    const v = String(d || "").toLowerCase().replace(/\.$/, "").trim();
    if (!v || v.length > 253)
      return false;
    for (const sfx of AI_LLM_SUFFIXES) {
      if (v === sfx || v.endsWith("." + sfx))
        return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
function sniffSniFromHello(data) {
  try {
    const raw = data instanceof Uint8Array ? data : new Uint8Array(data || []);
    if (!raw || raw.byteLength <= 43)
      return null;
    if (raw[0] !== 22 || raw[5] !== 1)
      return null;
    let pos = 43;
    if (pos + 1 > raw.byteLength)
      return null;
    const sessionIdLen = raw[pos];
    pos += 1 + sessionIdLen;
    if (pos + 2 > raw.byteLength)
      return null;
    const cipherSuitesLen = raw[pos] << 8 | raw[pos + 1];
    pos += 2 + cipherSuitesLen;
    if (pos + 1 > raw.byteLength)
      return null;
    const compMethodsLen = raw[pos];
    pos += 1 + compMethodsLen;
    if (pos + 2 > raw.byteLength)
      return null;
    const extensionsLen = raw[pos] << 8 | raw[pos + 1];
    pos += 2;
    const endPos = Math.min(pos + extensionsLen, raw.byteLength);
    while (pos + 4 <= endPos) {
      const extType = raw[pos] << 8 | raw[pos + 1];
      const extLen = raw[pos + 2] << 8 | raw[pos + 3];
      pos += 4;
      if (extType === 0) {
        if (pos + 2 > raw.byteLength)
          return null;
        const sniPos = pos + 2;
        if (raw[sniPos] === 0) {
          if (sniPos + 3 > raw.byteLength)
            return null;
          const sniLen = raw[sniPos + 1] << 8 | raw[sniPos + 2];
          if (sniLen <= 0 || sniLen > 253)
            return null;
          if (sniPos + 3 + sniLen > raw.byteLength)
            return null;
          try {
            return new TextDecoder().decode(raw.slice(sniPos + 3, sniPos + 3 + sniLen));
          } catch (e) {
            return null;
          }
        }
        return null;
      }
      pos += extLen;
    }
    return null;
  } catch (e) {
    return null;
  }
}
function relayAiFlag(tok) {
  try {
    const s = String(tok || "");
    const hi = s.indexOf("#");
    if (hi === -1)
      return false;
    const toks = s.slice(hi + 1).split(/[\s,;]+/);
    for (const t of toks) {
      if (String(t).toLowerCase() === "ai")
        return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
function orderAiFirstTokens(pips) {
  try {
    const list = Array.isArray(pips) ? pips : [];
    const ai = [];
    const rest = [];
    for (const t of list) {
      if (relayAiFlag(t))
        ai.push(t);
      else
        rest.push(t);
    }
    if (ai.length === 0)
      return { list, moved: false };
    return { list: ai.concat(rest), moved: true };
  } catch (e) {
    return { list: [], moved: false };
  }
}
function buildProbeHello(sni) {
  try {
    const sn = new TextEncoder().encode(String(sni || "cloudflare-dns.com")).slice(0, 64);
    const rnd = new Uint8Array(32);
    try {
      crypto.getRandomValues(rnd);
    } catch (e) {}
    const body = [3, 3];
    for (let i = 0;i < 32; i++)
      body.push(rnd[i]);
    body.push(0);
    const cs = [192, 43, 192, 47, 204, 168, 192, 19];
    body.push(cs.length >> 8 & 255, cs.length & 255);
    for (const b of cs)
      body.push(b);
    body.push(1, 0);
    const ext = [0, 0];
    const namePart = [0, sn.length >> 8 & 255, sn.length & 255];
    for (let i = 0;i < sn.length; i++)
      namePart.push(sn[i]);
    const entry = [
      namePart.length >> 8 & 255,
      namePart.length & 255
    ].concat(namePart);
    const extBlock = [entry.length >> 8 & 255, entry.length & 255].concat(entry);
    for (const b of extBlock)
      ext.push(b);
    const extraExts = [
      0,
      10,
      0,
      6,
      0,
      4,
      0,
      29,
      0,
      23,
      0,
      11,
      0,
      2,
      1,
      0,
      0,
      13,
      0,
      8,
      0,
      6,
      4,
      3,
      8,
      4,
      4,
      1
    ];
    for (const b of extraExts)
      ext.push(b);
    body.push(ext.length >> 8 & 255, ext.length & 255);
    for (const b of ext)
      body.push(b);
    const out = [22, 3, 1, 0, 0, 1, 0, 0, 0];
    out[3] = body.length + 4 >> 8 & 255;
    out[4] = body.length + 4 & 255;
    out[6] = body.length >> 16 & 255;
    out[7] = body.length >> 8 & 255;
    out[8] = body.length & 255;
    const full = out.concat(body);
    return new Uint8Array(full);
  } catch (e) {
    return null;
  }
}
async function probeRelayOnce(host, port, timeoutMs) {
  let sock = null;
  const PM = timeoutMs > 0 ? timeoutMs : 4000;
  try {
    const probePort = port || 443;
    sock = connect({ hostname: host, port: probePort });
    await withTimeout(sock.opened, PM, "probe-timeout");
    if (!RELAY_TLS_PORTS.has(String(probePort)))
      return true;
    const hello = buildProbeHello("cloudflare-dns.com");
    if (!hello)
      return false;
    const writer = sock.writable.getWriter();
    try {
      await writeSocketWithTimeout(sock, writer, hello, PM);
    } finally {
      try {
        writer.releaseLock();
      } catch (e) {}
    }
    const reader = sock.readable.getReader();
    try {
      const res = await withTimeout(reader.read(), PM, "probe-timeout");
      if (!res || res.done || !res.value)
        return false;
      const b = new Uint8Array(res.value);
      return b.length >= 2 && b[0] === 22 && b[1] === 3;
    } finally {
      try {
        reader.releaseLock();
      } catch (e) {}
    }
  } catch (e) {
    return false;
  } finally {
    try {
      if (sock)
        sock.close();
    } catch (e) {}
  }
}
async function probeRelayVerdict(host, port) {
  try {
    if (await probeRelayOnce(host, port, 4000))
      return true;
  } catch (e) {}
  try {
    return await probeRelayOnce(host, port, 7000);
  } catch (e) {
    return false;
  }
}
function collectRelayInventory() {
  const out = new Map;
  const addRaw = (raw) => {
    try {
      String(raw || "").split(/[\r\n,;]+/).forEach((t) => {
        const rk = relayKeyOf(t);
        if (rk && !out.has(rk.key))
          out.set(rk.key, { host: rk.host, port: rk.port });
      });
    } catch (e) {}
  };
  try {
    addRaw(sysConfig.backupRelay);
    addRaw(sysConfig.customRelay);
    (sysConfig.users || []).forEach((u) => {
      try {
        addRaw(u.proxyIp);
      } catch (e) {}
    });
  } catch (e) {}
  return Array.from(out.values());
}
function pruneAutomationOff() {
  try {
    const v = sysConfig.autoPruneRelays;
    if (v === undefined || v === null)
      return false;
    const s = String(v).trim().toLowerCase();
    return s === "0" || s === "off" || s === "no" || s === "false";
  } catch (e) {
    return false;
  }
}
async function loadRelayHealthSnapshot(env) {
  try {
    if (RELAY_SNAPSHOT_LOADED)
      return;
    if (RELAY_Q.size > 0) {
      RELAY_SNAPSHOT_LOADED = true;
      return;
    }
    const raw = await d1Get(env, "relay_health");
    if (!raw)
      return;
    const snap = JSON.parse(raw);
    const now = Date.now();
    const q = snap.q || {};
    for (const k of Object.keys(q)) {
      if (q[k] && q[k] > now && RELAY_Q.size < 2000)
        RELAY_Q.set(k, { fail: 0, until: q[k], probeFail: 0 });
    }
    RELAY_SNAPSHOT_LOADED = true;
  } catch (e) {}
}
async function saveRelayHealthSnapshot(env) {
  try {
    if (Date.now() - lastHealthSave < PROBE_INTERVAL_MS)
      return;
    lastHealthSave = Date.now();
    const q = {};
    let active = 0;
    for (const [k, v] of RELAY_Q.entries()) {
      if (v && v.until && v.until > Date.now()) {
        q[k] = v.until;
        active++;
      }
    }
    if (active > 0) {
      const entries = Object.entries(q).sort((a, b) => a[1] - b[1]);
      let payload = JSON.stringify({ q });
      while (payload.length > 8000 && entries.length > 0) {
        delete q[entries.shift()[0]];
        payload = JSON.stringify({ q });
      }
      if (payload.length > 8000) {
        try {
          console.error("[relay] health snapshot too large, skip");
        } catch (e) {}
        return;
      }
      await d1Put(env, "relay_health", payload);
    } else {
      await d1Put(env, "relay_health", "{}");
    }
  } catch (e) {}
}
async function probeDeadRelays(env) {
  try {
    if (pruneAutomationOff())
      return;
    if (!env || !env.IOT_DB)
      return;
    const runnerLease = await acquireNahanRunnerLock(env, "probe", PROBE_INTERVAL_MS);
    if (!runnerLease)
      return;
    try {
      const now = Date.now();
      if (now - lastProbeTs < PROBE_INTERVAL_MS)
        return;
      lastProbeTs = now;
      await loadRelayHealthSnapshot(env);
      const inv = collectRelayInventory();
      if (inv.length === 0)
        return;
      const scored = inv.map((r) => {
        const e = RELAY_Q.get(r.host + "|" + r.port);
        return { r, pf: e && e.probeFail || 0 };
      }).sort((a, b) => b.pf - a.pf || (a.r.host < b.r.host ? -1 : 1));
      let probeCap = PROBE_MAX_PER_ROUND;
      try {
        if (breakerLevel() >= 1)
          probeCap = Math.max(1, Math.floor(probeCap / 2));
      } catch (e) {}
      if (typeof probeCursor !== "number")
        probeCursor = 0;
      try {
        if (scored.length > 0) {
          const stored = await d1Get(env, "nahan_runner_probe_cursor");
          const n = Number(stored);
          if (Number.isFinite(n) && n >= 0)
            probeCursor = Math.floor(n) % scored.length;
        }
      } catch (e) {}
      const rotated = [];
      for (let i = 0;i < scored.length; i++)
        rotated.push(scored[(probeCursor + i) % scored.length]);
      probeCursor = (probeCursor + probeCap) % scored.length;
      try {
        await d1Put(env, "nahan_runner_probe_cursor", String(probeCursor));
      } catch (e) {}
      const picked = rotated.slice(0, probeCap);
      const results = await Promise.all(picked.map(async ({ r }) => {
        let ok = false;
        try {
          ok = await probeRelayVerdict(r.host, r.port);
        } catch (e) {
          ok = false;
        }
        return { r, ok };
      }));
      for (const { r } of results.filter((x) => x.ok)) {
        recordRelaySuccess(r.host, r.port, true);
      }
      for (const { r } of results.filter((x) => !x.ok)) {
        const k = r.host + "|" + r.port;
        let e = RELAY_Q.get(k);
        if (!e) {
          e = { fail: 0, until: 0, probeFail: 0 };
          RELAY_Q.set(k, e);
        }
        e.probeFail = (e.probeFail || 0) + 1;
        e.until = Date.now() + 600000;
        if (e.probeFail >= PROBE_FAIL_LIMIT) {
          try {
            await buryDeadRelay(env, r.host, r.port);
          } catch (err) {}
        }
      }
      await saveRelayHealthSnapshot(env);
    } finally {
      await releaseNahanRunnerLock(env, runnerLease);
    }
  } catch (e) {}
}
async function buryDeadRelay(env, host, port) {
  try {
    if (!env || !env.IOT_DB || !host)
      return false;
    if (pruneAutomationOff())
      return false;
    const hostLower = String(host).toLowerCase();
    const portN = port || 443;
    const deadKey = hostLower + "|" + portN;
    const keyMatches = (tok) => {
      try {
        const rk = relayKeyOf(tok);
        return !!rk && rk.key === deadKey;
      } catch (e) {
        return false;
      }
    };
    const stripDead = (raw) => {
      const parts = String(raw || "").split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
      const kept = parts.filter((t) => !keyMatches(t));
      return { kept, removed: parts.length - kept.length };
    };
    const tokenHasAi = (raw) => {
      try {
        const parts = String(raw || "").split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
        for (const t of parts) {
          if (keyMatches(t) && relayAiFlag(t))
            return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    };
    const lists = [];
    let aiKeep = false;
    const globalChanges = [];
    const userChanges = [];
    try {
      for (const field of ["backupRelay", "customRelay"]) {
        const raw = sysConfig[field] || "";
        if (!raw || raw.toLowerCase().indexOf(hostLower) === -1)
          continue;
        const { kept, removed } = stripDead(raw);
        if (removed > 0) {
          if (tokenHasAi(raw))
            aiKeep = true;
          lists.push("global:" + field);
          if (kept.length > 0)
            globalChanges.push({ field, next: kept.join(",") });
        }
      }
    } catch (e) {}
    try {
      const users = sysConfig.users || [];
      for (const u of users) {
        try {
          const raw = u.proxyIp || "";
          if (!raw || raw.toLowerCase().indexOf(hostLower) === -1)
            continue;
          const { kept, removed } = stripDead(raw);
          if (removed === 0)
            continue;
          if (kept.length === 0)
            continue;
          if (tokenHasAi(raw))
            aiKeep = true;
          lists.push("user:" + (u.name || u.id));
          userChanges.push({ u, next: kept.join(",") });
        } catch (e) {}
      }
    } catch (e) {}
    if (globalChanges.length === 0 && userChanges.length === 0)
      return false;
    try {
      let g = {};
      try {
        g = JSON.parse(await d1Get(env, "relay_graveyard") || "{}");
      } catch (e) {
        g = {};
      }
      const prev = g[deadKey] || {};
      let flaps = [];
      try {
        const fm = JSON.parse(await d1Get(env, "relay_flaps") || "{}");
        flaps = Array.isArray(fm[deadKey]) ? fm[deadKey].filter((t) => nowTs() - t < FLAP_WINDOW_MS) : [];
      } catch (e) {
        flaps = [];
      }
      const entry = {
        host: hostLower,
        port: portN,
        ai: !!(prev.ai || aiKeep),
        buriedAt: Date.now(),
        lists: Array.from(new Set([].concat(prev.lists || [], lists))).slice(0, 100),
        burials: (prev.burials || 0) + 1,
        healthyStreak: 0,
        unstable: flaps.length >= FLAP_LIMIT
      };
      g[deadKey] = entry;
      const gk = Object.keys(g);
      if (gk.length > 50) {
        const candidates = gk.filter((k) => k !== deadKey);
        candidates.sort((a, b) => (g[a] && g[a].buriedAt || 0) - (g[b] && g[b].buriedAt || 0));
        for (const drop of candidates.slice(0, Math.max(0, gk.length - 50))) {
          try {
            delete g[drop];
          } catch (e) {}
        }
      }
      let gravePayload = JSON.stringify(g);
      if (gravePayload.length > 200000) {
        const ordered = Object.keys(g).filter((k) => k !== deadKey).sort((a, b) => (g[a] && g[a].buriedAt || 0) - (g[b] && g[b].buriedAt || 0));
        for (const drop of ordered) {
          delete g[drop];
          gravePayload = JSON.stringify(g);
          if (gravePayload.length <= 200000)
            break;
        }
      }
      if (gravePayload.length > 200000)
        return false;
      try {
        await d1PutStrict(env, "relay_graveyard", gravePayload);
      } catch (e) {
        return false;
      }
      const prevGlobals = {};
      const prevUsers = new Map;
      try {
        for (const c of globalChanges)
          prevGlobals[c.field] = sysConfig[c.field];
        for (const c of userChanges)
          prevUsers.set(c.u, c.u.proxyIp);
        for (const c of globalChanges)
          sysConfig[c.field] = c.next;
        for (const c of userChanges)
          c.u.proxyIp = c.next;
        await d1PutStrict(env, "sys_config", JSON.stringify(sysConfig));
      } catch (e) {
        try {
          for (const k of Object.keys(prevGlobals))
            sysConfig[k] = prevGlobals[k];
          for (const [u, prev] of prevUsers)
            u.proxyIp = prev;
        } catch (_) {}
        return false;
      }
      try {
        console.error("relay-buried: " + deadKey + " from " + lists.join(","));
      } catch (e) {}
    } catch (e) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
function nowTs() {
  return Date.now();
}
async function resurrectRelay(env, key, entry) {
  lastResurrectChanged = false;
  try {
    const host = String(entry.host || "").toLowerCase();
    if (!host)
      return false;
    const port = entry.port || 443;
    let token = host + (port && port !== 443 ? ":" + port : "");
    try {
      if (entry.ai === true)
        token += "#AI";
    } catch (e) {}
    const addToken = (raw) => {
      const parts = String(raw || "").split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
      for (const t of parts) {
        try {
          const rk = relayKeyOf(t);
          if (rk && rk.key === key)
            return String(raw || "");
        } catch (e) {}
      }
      return (raw && String(raw).trim() ? String(raw).replace(/,+$/, "") + "," : "") + token;
    };
    let restoreChanged = false;
    for (const l of entry.lists || []) {
      try {
        if (l === "global:backupRelay") {
          const before = sysConfig.backupRelay;
          const after = addToken(before);
          if (after !== before) {
            sysConfig.backupRelay = after;
            restoreChanged = true;
          }
        } else if (l === "global:customRelay") {
          const before = sysConfig.customRelay;
          const after = addToken(before);
          if (after !== before) {
            sysConfig.customRelay = after;
            restoreChanged = true;
          }
        } else if (l.startsWith("user:")) {
          const nm = l.slice(5);
          const u = (sysConfig.users || []).find((x) => x && (x.name === nm || x.id === nm));
          if (!u)
            continue;
          const before = u.proxyIp;
          const after = addToken(before);
          if (after !== before) {
            u.proxyIp = after;
            restoreChanged = true;
          }
        }
      } catch (e) {
        return false;
      }
    }
    if (!restoreChanged) {
      try {
        console.error("relay-already-present: " + key);
      } catch (e) {}
      return true;
    }
    try {
      await d1PutStrict(env, "sys_config", JSON.stringify(sysConfig));
    } catch (e) {
      return false;
    }
    lastResurrectChanged = true;
    try {
      console.error("relay-resurrected: " + key);
    } catch (e) {}
    return true;
  } catch (e) {
    return false;
  }
}
async function probeGraveyard(env) {
  try {
    if (pruneAutomationOff())
      return;
    if (!env || !env.IOT_DB)
      return;
    const runnerLease = await acquireNahanRunnerLock(env, "graveyard", GRAVE_INTERVAL_MS);
    if (!runnerLease)
      return;
    try {
      const now = Date.now();
      if (now - lastGraveTs < GRAVE_INTERVAL_MS)
        return;
      lastGraveTs = now;
      let g = {};
      try {
        g = JSON.parse(await d1Get(env, "relay_graveyard") || "{}");
      } catch (e) {
        return;
      }
      const keys = Object.keys(g).slice(0, 200);
      keys.sort((a, b) => (g[a] && g[a].buriedAt || 0) - (g[b] && g[b].buriedAt || 0));
      if (keys.length === 0)
        return;
      if (typeof graveCursor !== "number")
        graveCursor = 0;
      try {
        const stored = await d1Get(env, "nahan_runner_grave_cursor");
        const n = Number(stored);
        if (Number.isFinite(n) && n >= 0)
          graveCursor = Math.floor(n) % keys.length;
      } catch (e) {}
      const grotated = [];
      for (let i = 0;i < keys.length; i++)
        grotated.push(keys[(graveCursor + i) % keys.length]);
      let graveCap = GRAVE_MAX_PER_ROUND;
      try {
        if (breakerLevel() >= 1)
          graveCap = Math.max(1, Math.floor(graveCap / 2));
      } catch (e) {}
      graveCursor = (graveCursor + graveCap) % keys.length;
      try {
        await d1Put(env, "nahan_runner_grave_cursor", String(graveCursor));
      } catch (e) {}
      const graveTargets = grotated.slice(0, graveCap);
      const graveResults = await Promise.all(graveTargets.map(async (k) => {
        const entry = g[k];
        if (!entry || !entry.host)
          return { k, ok: null };
        let ok = false;
        try {
          ok = await probeRelayVerdict(entry.host, entry.port || 443);
        } catch (e) {
          ok = false;
        }
        return { k, ok };
      }));
      let dirty = false;
      for (const { k, ok } of graveResults) {
        const entry = g[k];
        if (!entry || !entry.host) {
          delete g[k];
          dirty = true;
          continue;
        }
        if (ok === null)
          continue;
        if (ok) {
          entry.healthyStreak = (entry.healthyStreak || 0) + 1;
          if (entry.healthyStreak >= GRAVE_HEALTHY_NEED) {
            let okR = false;
            try {
              okR = await resurrectRelay(env, k, entry);
            } catch (e) {
              okR = false;
            }
            if (!okR) {
              entry.healthyStreak = 0;
              dirty = true;
              continue;
            }
            if (lastResurrectChanged) {
              try {
                const fm = JSON.parse(await d1Get(env, "relay_flaps") || "{}");
                const arr = Array.isArray(fm[k]) ? fm[k] : [];
                arr.push(Date.now());
                fm[k] = arr.filter((t) => Date.now() - t < FLAP_WINDOW_MS).slice(-10);
                await d1Put(env, "relay_flaps", JSON.stringify(fm));
              } catch (e) {}
            }
            recordRelaySuccess(entry.host, entry.port || 443, true);
            delete g[k];
            dirty = true;
          } else {
            dirty = true;
          }
        } else {
          try {
            console.error("relay-grave-failed: " + k);
          } catch (e) {}
          entry.healthyStreak = 0;
          dirty = true;
        }
      }
      if (dirty)
        await d1Put(env, "relay_graveyard", JSON.stringify(g));
    } finally {
      await releaseNahanRunnerLock(env, runnerLease);
    }
  } catch (e) {}
}

// src/api/logs.js
async function logActivity(env, type, detail) {
  if (!env || !env.IOT_DB)
    return;
  try {
    const ts = new Date().toISOString();
    let logs = [];
    const stored = await d1Get(env, "sys_logs");
    if (stored)
      logs = JSON.parse(stored);
    logs.unshift({ ts, type, detail });
    if (logs.length > 50)
      logs = logs.slice(0, 50);
    await d1Put(env, "sys_logs", JSON.stringify(logs));
  } catch (e) {}
}
async function handleLogs(request, env) {
  try {
    if (request.method === "POST") {
      const data = await request.json();
      if (!isAuthorized(request, data))
        return new Response(JSON.stringify({ success: false }), {
          status: 401
        });
      let logs = [];
      if (env.IOT_DB) {
        const stored = await d1Get(env, "sys_logs");
        if (stored)
          logs = JSON.parse(stored);
      }
      return new Response(JSON.stringify({ success: true, logs }), {
        status: 200
      });
    }
    return new Response("OK", { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ success: false }), {
      status: 400
    });
  }
}

// src/converters/geo.js
async function preloadIpFlags2(profiles, hostNames) {
  let uniqueIps = new Set;
  profiles.forEach((p) => {
    hostNames.forEach((h) => {
      getCleanIps(h, p.cleanIp).forEach((ip) => uniqueIps.add(ip));
    });
    if (p.proxyIp) {
      getEndpointIpsArray(p.proxyIp).forEach((ip) => uniqueIps.add(ip));
    }
  });
  if (sysConfig.backupRelay) {
    getEndpointIpsArray(sysConfig.backupRelay).forEach((ip) => uniqueIps.add(ip));
  }
  if (sysConfig.customRelay) {
    getEndpointIpsArray(sysConfig.customRelay).forEach((ip) => uniqueIps.add(ip));
  }
  let uncached = Array.from(uniqueIps).filter((ip) => !ipGeoCache.has(ip));
  for (let i = 0;i < uncached.length; i += 100) {
    let batch = uncached.slice(i, i + 100);
    let queries = batch.map((ip) => {
      let clean = ip.split(":")[0].replace(/[\[\]]/g, "").split("#")[0].trim();
      return {
        query: clean,
        fields: "status,country,countryCode,city,isp,org"
      };
    });
    try {
      const res = await fetchT("http://ip-api.com/batch?fields=status,country,countryCode,city,isp,org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queries)
      });
      const results = await res.json();
      batch.forEach((ip, idx) => {
        let data = results[idx];
        if (data && data.status === "success") {
          const codePoints = data.countryCode.toUpperCase().split("").map((char) => 127397 + char.charCodeAt());
          ipGeoCache.set(ip, {
            flag: String.fromCodePoint(...codePoints),
            country: data.country || "Unknown",
            countryCode: data.countryCode || "",
            city: data.city || "",
            isp: data.isp || data.org || ""
          });
        } else {
          ipGeoCache.set(ip, {
            flag: "\uD83C\uDF10",
            country: "Unknown",
            countryCode: "",
            city: "",
            isp: ""
          });
        }
      });
    } catch (e) {
      batch.forEach((ip) => {
        if (!ipGeoCache.has(ip)) {
          ipGeoCache.set(ip, {
            flag: "\uD83C\uDF10",
            country: "Unknown",
            countryCode: "",
            city: "",
            isp: ""
          });
        }
      });
    }
  }
}
function getGeoInfo2(ip) {
  if (!ip)
    return {
      flag: "\uD83C\uDF10",
      country: "Unknown",
      countryCode: "",
      city: "",
      isp: ""
    };
  let clean = ip.split(":")[0].replace(/[\[\]]/g, "").split("#")[0].trim();
  return ipGeoCache.get(ip) || ipGeoCache.get(clean) || {
    flag: "\uD83C\uDF10",
    country: "Unknown",
    countryCode: "",
    city: "",
    isp: ""
  };
}
async function fetchIpGeoData(ip) {
  if (!ip)
    return null;
  let clean = ip.split(":")[0].replace(/[\[\]]/g, "").split("#")[0].trim();
  try {
    const res = await fetchT(`http://ip-api.com/json/${clean}?fields=status,country,countryCode,city,isp,org`);
    const data = await res.json();
    if (data && data.status === "success") {
      const codePoints = data.countryCode.toUpperCase().split("").map((char) => 127397 + char.charCodeAt());
      return {
        flag: String.fromCodePoint(...codePoints),
        country: data.country || "Unknown",
        countryCode: data.countryCode || "",
        city: data.city || "",
        isp: data.isp || data.org || ""
      };
    }
  } catch (e) {}
  return null;
}
async function resolveUserEndpointGeo(user) {
  if (!user.proxyIp) {
    user.proxyIpGeo = null;
    return;
  }
  let pips = getEndpointIpsArray(user.proxyIp);
  if (pips.length === 0) {
    user.proxyIpGeo = null;
    return;
  }
  let geoData = await fetchIpGeoData(pips[0]);
  user.proxyIpGeo = geoData || {
    flag: "\uD83C\uDF10",
    country: "Unknown",
    countryCode: "",
    city: "",
    isp: ""
  };
}
function getConfigName2(type, profileName, port, hostName, ip, proxyIp = null, configIndex = 0, ipName = "", isDirect = false) {
  let prefix = sysConfig.namePrefix || "Core";
  let strategy = sysConfig.nameStrategy || "default";
  let cleanName = profileName === "Default" ? "" : `-${profileName}`;
  let typeLab = type === "alpha" ? "V" : "T";
  if (strategy.includes("{") && strategy.includes("}")) {
    let lookupIp = proxyIp || ip;
    let geoInfo = getGeoInfo2(lookupIp);
    let protoLab = type === "alpha" ? getAlpha2().toUpperCase() : getBeta().charAt(0).toUpperCase() + getBeta().slice(1);
    let now = new Date;
    let dateStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    let workerName = sysConfig.cfWorkerName || sysConfig.name || hostName || "";
    let flagToUse = isDirect ? "☁️" : geoInfo.flag;
    let resName = strategy.replace(/{FLAG}/g, flagToUse).replace(/{COUNTRY}/g, geoInfo.country).replace(/{CITY}/g, geoInfo.city).replace(/{ISP}/g, geoInfo.isp).replace(/{PROTOCOL}/g, protoLab).replace(/{USER}/g, profileName).replace(/{PORT}/g, port).replace(/{PREFIX}/g, prefix).replace(/{IP}/g, ip || "").replace(/{IP_NAME}/g, ipName || "").replace(/{HOST}/g, hostName || "").replace(/{DATE}/g, dateStr).replace(/{INDEX}/g, String(configIndex)).replace(/{WORKER}/g, workerName);
    return resName;
  }
  if (strategy === "type-user-port") {
    return `${type === "alpha" ? getAlpha2() : getBeta()}-${profileName}-${port}`;
  } else if (strategy === "user-port") {
    return `${profileName}-${port}`;
  } else if (strategy === "host-port-user") {
    return `${hostName}-${port}${cleanName}`;
  } else if (strategy === "prefix-user-port") {
    return `${prefix}${cleanName}-${port}`;
  } else if (strategy === "ip") {
    return ip || "unknown";
  } else {
    return `${typeLab}-Core-${port}${cleanName}`;
  }
}
function getCleanIps(hostName, userCleanIps = null) {
  let rawIps = userCleanIps || sysConfig.cleanIps;
  let ips = rawIps ? rawIps.split(/[\r\n,;]+/).map((s) => {
    let t = s.trim();
    return t ? t.split("#")[0].trim() : "";
  }).filter(Boolean) : [];
  if (ips.length === 0)
    ips = [
      hostName.endsWith(".pages.dev") ? sysConfig.metricNode : hostName
    ];
  return ips;
}
function getCleanIpsWithNames2(hostName, userCleanIps = null) {
  let rawIps = userCleanIps || sysConfig.cleanIps;
  let entries = rawIps ? rawIps.split(/[\r\n,;]+/).map((s) => {
    let t = s.trim();
    if (!t)
      return null;
    let parts = t.split("#");
    let ip = parts[0].trim();
    let name = (parts[1] || "").trim();
    return ip ? { ip, name } : null;
  }).filter(Boolean) : [];
  if (entries.length === 0)
    entries = [
      {
        ip: hostName.endsWith(".pages.dev") ? sysConfig.metricNode : hostName,
        name: ""
      }
    ];
  return entries;
}
function getEndpointIpsArray(proxyIpString) {
  if (!proxyIpString)
    return [];
  return proxyIpString.split(/[\r\n,;]+/).map((s) => {
    let trimmed = s.trim();
    if (!trimmed)
      return "";
    let hostPort = trimmed.split("#")[0].split("@")[0];
    if (hostPort.includes(":") && !hostPort.includes("]")) {
      return hostPort.split(":")[0];
    } else if (hostPort.startsWith("[") && hostPort.includes("]")) {
      return hostPort.split("]")[0].replace("[", "");
    }
    return hostPort;
  }).filter(Boolean);
}
function ipv4ToNat64(ipv4, prefix) {
  if (!prefix || !ipv4)
    return null;
  let parts = ipv4.split(".");
  if (parts.length !== 4 || parts.some((p) => isNaN(parseInt(p))))
    return null;
  let hex = parts.map((p) => parseInt(p).toString(16).padStart(2, "0")).join("");
  let suffix = hex.match(/.{1,4}/g).join(":");
  return prefix.replace(/\/\d+$/, "").replace(/:$/, "") + "::" + suffix;
}
function getEndpointIpsWithNat64(proxyIpString, nat64Prefix) {
  let ips = getEndpointIpsArray(proxyIpString);
  if (nat64Prefix) {
    let prefixes = nat64Prefix.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
    let nat64Ips = [];
    prefixes.forEach((prefix) => {
      ips.forEach((ip) => {
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
          let nat64 = ipv4ToNat64(ip, prefix);
          if (nat64)
            nat64Ips.push(nat64);
        }
      });
    });
    ips = ips.concat(nat64Ips);
  }
  return ips;
}

// src/api/sync.js
async function handleConfigSync(request, env, ctx) {
  try {
    const data = await request.json();
    const syncGateIp = request.headers.get("cf-connecting-ip") || "Unknown";
    if (authBlocked(syncGateIp)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Too many attempts"
      }), { status: 429 });
    }
    const isAuthSync = data.key === sysConfig.masterKey || data.oldKey && data.oldKey === sysConfig.masterKey || isPanelApiKey(data.key) || isPanelApiKey(data.oldKey) || data.fromMaster && data.config && data.config.masterKey && data.config.masterKey === sysConfig.masterKey;
    if (!isAuthSync) {
      authFail(syncGateIp);
      return new Response(JSON.stringify({
        success: false,
        error: "Auth failed. Generate the API key on THIS panel, not the main panel."
      }), { status: 401 });
    }
    if (!env.IOT_DB)
      return new Response(JSON.stringify({ success: false, msg: "DB Error" }), { status: 400 });
    let nextConfig = sysConfig;
    if (data.config) {
      const preserveApiKeys = sysConfig.panelApiKeys || [];
      nextConfig = { ...sysConfig, ...data.config };
      if (Array.isArray(nextConfig.users)) {
        nextConfig.users = nextConfig.users.slice(0, 5).map((u) => ({ ...u }));
      }
      if (preserveApiKeys.length > 0 && (!data.config.panelApiKeys || data.config.panelApiKeys.length === 0)) {
        nextConfig.panelApiKeys = preserveApiKeys;
      }
      migrateSlaveNodesToLinkedPanels(nextConfig);
      if (Array.isArray(nextConfig.users) && nextConfig.users.length > 0) {
        const geoPromises = nextConfig.users.map(async (u) => {
          if (u.proxyIp) {
            await resolveUserEndpointGeo(u);
          } else {
            u.proxyIpGeo = null;
          }
        });
        await Promise.all(geoPromises);
      }
      updateSysConfig(nextConfig);
      await cachedD1Put(env, "sys_config", JSON.stringify(nextConfig));
    }
    let tagWarning = null;
    if (nextConfig.nameStrategy && nextConfig.nameStrategy.includes("{") && nextConfig.nameStrategy.includes("}")) {
      let vResult = validateNameStrategy(nextConfig.nameStrategy);
      if (!vResult.valid)
        tagWarning = `Unknown tags detected: ${vResult.unknownTags.join(", ")}`;
    }
    if (data.resetUUID) {
      const uuidClean = data.resetUUID.replace(/-/g, "").toLowerCase();
      if (!sysUsageCache.users)
        sysUsageCache.users = {};
      if (sysUsageCache.users[uuidClean]) {
        sysUsageCache.users[uuidClean].reqs = 0;
        sysUsageCache.users[uuidClean].dReqs = 0;
      } else {
        sysUsageCache.users[uuidClean] = {
          reqs: 0,
          dReqs: 0,
          lastDay: new Date().toISOString().split("T")[0]
        };
      }
      await cachedD1Put(env, "sys_usage", JSON.stringify(sysUsageCache));
    }
    if (data.config && !data.fromMaster) {
      let currentHost = new URL(request.url).hostname;
      let slaveConfig = { ...nextConfig };
      [
        "cfAccountId",
        "cfApiToken",
        "cfWorkerName",
        "tgToken",
        "tgChatId",
        "tgAdminId",
        "masterKey",
        "syncApiKey",
        "apiRoute",
        "deviceId",
        "panelApiKeys",
        "hubPanelUrl",
        "linkedPanels",
        "slaveNodes",
        "githubRepo",
        "customPanelUrl"
      ].forEach((k) => delete slaveConfig[k]);
      if (nextConfig.slaveNodes && nextConfig.slaveNodes.trim().length > 0) {
        let nodes = nextConfig.slaveNodes.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
        let syncKey = nextConfig.syncApiKey || "";
        nodes.forEach((node) => {
          if (node !== currentHost) {
            ctx?.waitUntil(fetchT(`https://${node}/${encodeURI(nextConfig.apiRoute)}/api/sync`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                key: syncKey,
                config: slaveConfig,
                fromMaster: true
              })
            }).catch(() => {}));
          }
        });
      }
      if (nextConfig.linkedPanels && Array.isArray(nextConfig.linkedPanels)) {
        nextConfig.linkedPanels.forEach((p) => {
          if (p && p.url && p.apiKey) {
            let cleanUrl = p.url.trim();
            if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
              cleanUrl = "https://" + cleanUrl;
            }
            try {
              const parsed = new URL(cleanUrl);
              if (parsed.hostname !== currentHost) {
                ctx?.waitUntil(fetchT(`${parsed.protocol}//${parsed.host}/${encodeURI(nextConfig.apiRoute)}/api/sync`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    key: p.apiKey,
                    config: slaveConfig,
                    fromMaster: true
                  })
                }).catch(() => {}));
              }
            } catch (err) {
              console.error(`Failed to propagate config to linked panel ${p.url}:`, err);
            }
          }
        });
      }
    }
    if (nextConfig.tgToken && ctx) {
      const hookUrl = `https://${new URL(request.url).hostname}/${encodeURI(nextConfig.apiRoute)}/tg`;
      ctx.waitUntil(fetchT(`https://api.telegram.org/bot${nextConfig.tgToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: hookUrl })
      }).catch(() => {}));
    }
    return new Response(JSON.stringify({
      success: true,
      newRoute: nextConfig.apiRoute,
      tagWarning
    }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ success: false }), {
      status: 400
    });
  }
}
async function handleSyncPanel(request, env, ctx) {
  try {
    const data = await request.json();
    if (!data.signal || data.signal !== "panel_login") {
      return new Response(JSON.stringify({ success: false, error: "Invalid signal" }), { status: 400 });
    }
    if (!data.tgAdminId || !data.panelHost) {
      return new Response(JSON.stringify({ success: false, error: "Missing fields" }), { status: 400 });
    }
    const adminId = sysConfig.tgAdminId || sysConfig.tgChatId;
    if (!adminId || adminId.toString() !== data.tgAdminId.toString()) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
    }
    if (data.panelApiKey && !isPanelApiKey(data.panelApiKey)) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
    }
    const loginSignal = {
      name: data.panelName || data.panelHost,
      host: data.panelHost,
      apiRoute: data.panelApiRoute || sysConfig.apiRoute,
      isLocal: false,
      ts: data.ts || Date.now()
    };
    if (env.IOT_DB) {
      ctx?.waitUntil(d1Put(env, "tg_panel_login", JSON.stringify(loginSignal)).catch(() => {}));
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ success: false }), {
      status: 400
    });
  }
}
function getPanelsList() {
  const panels = [];
  panels.push({
    name: sysConfig.name || "Main Panel",
    host: null,
    apiRoute: sysConfig.apiRoute,
    apiKey: null,
    isLocal: true
  });
  if (sysConfig.linkedPanels && Array.isArray(sysConfig.linkedPanels)) {
    sysConfig.linkedPanels.forEach((p) => {
      if (p && p.host) {
        panels.push({
          name: p.name || p.host,
          host: p.host,
          apiRoute: p.apiRoute || sysConfig.apiRoute,
          apiKey: p.apiKey || p.masterKey || null,
          isLocal: false
        });
      }
    });
  }
  return panels;
}
async function remotePanelFetch(panel, method, path, body = null) {
  try {
    const url = `https://${panel.host}/${encodeURI(panel.apiRoute)}${path}`;
    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    if (body)
      options.body = JSON.stringify(body);
    const res = await fetchT(url, {
      ...options,
      signal: AbortSignal.timeout(8000)
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}
async function fetchRemotePanelUsers(panel) {
  return await remotePanelFetch(panel, "GET", `/api/users?key=${encodeURIComponent(panel.apiKey)}`);
}
async function fetchRemotePanelStats(panel) {
  return await remotePanelFetch(panel, "GET", `/api/stats?key=${encodeURIComponent(panel.apiKey)}`);
}
async function remotePanelWriteAction(panel, method, userId, body = null) {
  let path = "/api/users";
  if (userId)
    path += `?id=${encodeURIComponent(userId)}&key=${encodeURIComponent(panel.apiKey)}`;
  else
    path += `?key=${encodeURIComponent(panel.apiKey)}`;
  return await remotePanelFetch(panel, method, path, body || { key: panel.apiKey });
}
async function remotePanelToggleUser(panel, userId) {
  return await remotePanelFetch(panel, "POST", `/api/users?id=${encodeURIComponent(userId)}&action=toggle&key=${encodeURIComponent(panel.apiKey)}`);
}
async function remotePanelResetTraffic(panel, userId) {
  return await remotePanelFetch(panel, "POST", `/api/users?id=${encodeURIComponent(userId)}&action=reset&key=${encodeURIComponent(panel.apiKey)}`);
}
function linkedPanelHost(p) {
  let raw = p && typeof p === "object" ? p.url || "" : p || "";
  raw = String(raw).trim();
  if (!raw)
    return "";
  raw = raw.replace(/^[a-zA-Z]+:\/\//, "");
  raw = raw.split("/")[0];
  raw = raw.split("@").pop();
  if (raw.startsWith("[")) {
    return raw.slice(0, raw.indexOf("]") + 1);
  }
  return raw.split(":")[0];
}
function getGlobalNodeHosts() {
  let hosts = [];
  if (sysConfig.slaveNodes)
    hosts.push(...sysConfig.slaveNodes.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean));
  if (Array.isArray(sysConfig.linkedPanels))
    hosts.push(...sysConfig.linkedPanels.map(linkedPanelHost).filter(Boolean));
  return [...new Set(hosts)];
}

// src/api/users.js
function getSubscriptionStats(targetSub = null) {
  let name = "Default";
  let id = activeDeviceId;
  let limitTotalReq = 0;
  let expiryMs = 0;
  let hasMultiUser = sysConfig.users && sysConfig.users.length > 0;
  if (hasMultiUser && targetSub) {
    let user = sysConfig.users.find((u) => u.name.toLowerCase() === targetSub.toLowerCase() || u.id === targetSub);
    if (user) {
      name = user.name;
      id = user.id;
      limitTotalReq = user.limitTotalReq || 0;
      expiryMs = user.expiryMs || 0;
    }
  } else if (!hasMultiUser) {
    limitTotalReq = sysConfig.limitTotalReq || 0;
    expiryMs = sysConfig.expiryMs || 0;
  }
  let idClean = id.replace(/-/g, "").toLowerCase();
  let sysU = sysUsageCache?.users?.[idClean] || { reqs: 0, dReqs: 0 };
  let totalBytesUsed = usageTotalBytes(sysU);
  let totalGb = (totalBytesUsed / 1073741824).toFixed(2);
  let limitTotalGb = limitTotalReq ? (limitReqToBytes(limitTotalReq) / 1073741824).toFixed(2) : "Unlimited";
  let expiryDateTxt = "Never Expire";
  let remDaysTxt = "Never Expire";
  if (expiryMs) {
    let exp = new Date(expiryMs);
    expiryDateTxt = exp.toISOString().split("T")[0];
    let remDays = Math.ceil((expiryMs - Date.now()) / (1000 * 60 * 60 * 24));
    remDaysTxt = remDays >= 0 ? `${remDays} Days Left` : "Expired";
  }
  return {
    usedStr: `Used: ${totalGb} GB / ${limitTotalGb} GB`,
    expiryStr: `Expiry: ${expiryDateTxt} (${remDaysTxt})`
  };
}
function getFakeConfigNames2(targetSub = null) {
  let stats = getSubscriptionStats(targetSub);
  let configs = sysConfig.fakeConfigs || [
    { name: "\uD83D\uDCCA {usage}", enabled: true },
    { name: "\uD83D\uDCC5 {expiry}", enabled: true }
  ];
  return configs.filter((f) => f && f.enabled && f.name).map((f) => {
    return f.name.replace(/\{usage\}/g, stats.usedStr).replace(/\{expiry\}/g, stats.expiryStr);
  });
}
function getAllProfiles(targetSub = null) {
  let list = [{ id: activeDeviceId, name: "Default" }];
  if (sysConfig.users && sysConfig.users.length > 0) {
    let now = Date.now();
    sysConfig.users.forEach((u) => {
      let skip = false;
      if (u.expiryMs && now > u.expiryMs)
        skip = true;
      if (u.isPaused)
        skip = true;
      if (u.limitTotalReq && sysUsageCache && sysUsageCache.users && sysUsageCache.users[u.id.replace(/-/g, "").toLowerCase()]) {
        if (sysUsageCache.users[u.id.replace(/-/g, "").toLowerCase()].reqs >= u.limitTotalReq)
          skip = true;
      }
      if (u.limitDailyReq && sysUsageCache && sysUsageCache.users && sysUsageCache.users[u.id.replace(/-/g, "").toLowerCase()]) {
        let usr = sysUsageCache.users[u.id.replace(/-/g, "").toLowerCase()];
        if (usr.lastDay === new Date().toISOString().split("T")[0] && usr.dReqs >= u.limitDailyReq)
          skip = true;
      }
      if (!skip) {
        list.push({
          id: u.id,
          name: u.name,
          proxyIp: u.proxyIp,
          cleanIp: u.cleanIp || null,
          userMode: u.userMode || null,
          userPorts: u.userPorts || null,
          maxConfigs: u.maxConfigs || null,
          proxyIpGeo: u.proxyIpGeo || null,
          userNodes: u.userNodes || null,
          nat64: u.nat64 || null,
          connLimit: u.connLimit || null,
          userPanelUrl: u.userPanelUrl || null
        });
        registerConfigEntry(u.id, u.id, u.proxyIp || "");
      }
    });
  }
  if (targetSub) {
    list = list.filter((p) => p.name.toLowerCase() === targetSub.toLowerCase() || p.id === targetSub);
  }
  return list;
}
function calcEffectiveIps2(ips, maxCfg, effectiveMode, effectivePorts, pipsCount = 1) {
  if (!maxCfg)
    return ips;
  let protoCount = effectiveMode === "both" ? 2 : 1;
  let portCount = effectivePorts.length;
  let directMultiplier = sysConfig.enableDirectConfigs ? 2 : 1;
  let multiplier = protoCount * portCount * directMultiplier * Math.max(1, pipsCount);
  let neededIps = Math.max(1, Math.floor(maxCfg / multiplier));
  return ips.slice(0, neededIps);
}
function getProfileHostNames2(hostName, profile) {
  let primaryHost = profile && profile.userPanelUrl ? profile.userPanelUrl : hostName;
  let names = [];
  if (profile && profile.userNodes && profile.userNodes.trim()) {
    names.push(...profile.userNodes.split(/[\r\n,;]+/).map((s) => linkedPanelHost(s.trim())).filter(Boolean));
  } else {
    names.push(linkedPanelHost(primaryHost));
    names.push(...getGlobalNodeHosts());
  }
  return [...new Set(names)];
}
function getEffectiveNat64(userNat64) {
  let parts = [];
  if (userNat64)
    parts.push(...userNat64.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean));
  if (sysConfig.nat64Prefix)
    parts.push(...sysConfig.nat64Prefix.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean));
  return [...new Set(parts)].join(",") || null;
}
function getEffectivePips(p) {
  let effectiveNat64 = getEffectiveNat64(p.nat64);
  let pips = getEndpointIpsWithNat64(p.proxyIp, effectiveNat64);
  if (pips.length === 0 && sysConfig.backupRelay) {
    pips = getEndpointIpsWithNat64(sysConfig.backupRelay, effectiveNat64);
  }
  if (pips.length === 0 && sysConfig.customRelay) {
    pips = getEndpointIpsWithNat64(sysConfig.customRelay, effectiveNat64);
  }
  return pips;
}
async function handleUsersApi(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const method = request.method;
    const userId = url.searchParams.get("id");
    const action = url.searchParams.get("action");
    const authHeader = request.headers.get("Authorization") || "";
    const authKey = authHeader.replace("Bearer ", "") || url.searchParams.get("key") || "";
    let bodyKey = "";
    if (method === "POST" || method === "PUT") {
      try {
        const body = await request.clone().json();
        bodyKey = body.key || "";
      } catch (e) {}
    }
    const isAuth = authKey === sysConfig.masterKey || bodyKey === sysConfig.masterKey || isPanelApiKey(authKey) || isPanelApiKey(bodyKey);
    const gateIp = request.headers.get("cf-connecting-ip") || "Unknown";
    if (authBlocked(gateIp)) {
      return new Response(JSON.stringify({ success: false, error: "Too many attempts" }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!isAuth) {
      authFail(gateIp);
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "GET" && !userId) {
      const q = url.searchParams.get("q") || "";
      let users = sysConfig.users || [];
      if (q) {
        const ql = q.toLowerCase();
        users = users.filter((u) => u.name.toLowerCase().includes(ql) || u.id.toLowerCase().includes(ql) || u.notes && u.notes.toLowerCase().includes(ql));
      }
      const enriched = users.map((u) => {
        const idClean = u.id.replace(/-/g, "").toLowerCase();
        const sysU = sysUsageCache?.users?.[idClean] || {
          reqs: 0,
          dReqs: 0,
          lastDay: ""
        };
        const usedBytes = usageTotalBytes(sysU);
        const limitBytes = limitReqToBytes(u.limitTotalReq);
        const isExpired = u.expiryMs && Date.now() > u.expiryMs;
        let status = "active";
        if (u.isPaused && u.disabledReason)
          status = "auto-disabled";
        else if (u.isPaused)
          status = "paused";
        else if (isExpired)
          status = "expired";
        return {
          ...u,
          usage: {
            total: usedBytes,
            limit: limitBytes,
            daily: sysU.dReqs || 0,
            dailyLimit: u.limitDailyReq || 0
          },
          status
        };
      });
      return new Response(JSON.stringify({
        success: true,
        users: enriched,
        total: enriched.length
      }), { headers: { "Content-Type": "application/json" } });
    }
    if (method === "GET" && userId) {
      const u = (sysConfig.users || []).find((usr) => usr.id === userId || usr.name.toLowerCase() === userId.toLowerCase());
      if (!u)
        return new Response(JSON.stringify({ success: false, error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      const idClean = u.id.replace(/-/g, "").toLowerCase();
      const sysU = sysUsageCache?.users?.[idClean] || {
        reqs: 0,
        dReqs: 0,
        lastDay: ""
      };
      const usedBytes = usageTotalBytes(sysU);
      const limitBytes = limitReqToBytes(u.limitTotalReq);
      const isExpired = u.expiryMs && Date.now() > u.expiryMs;
      let status = "active";
      if (u.isPaused && u.disabledReason)
        status = "auto-disabled";
      else if (u.isPaused)
        status = "paused";
      else if (isExpired)
        status = "expired";
      const hostName = new URL(request.url).hostname;
      const subUrl = `https://${hostName}/${sysConfig.apiRoute}?sub=${encodeURIComponent(u.name)}`;
      return new Response(JSON.stringify({
        success: true,
        user: {
          ...u,
          usage: {
            total: usedBytes,
            limit: limitBytes,
            daily: sysU.dReqs || 0,
            dailyLimit: u.limitDailyReq || 0
          },
          status,
          subscriptionUrl: subUrl
        }
      }), { headers: { "Content-Type": "application/json" } });
    }
    if (method === "POST" && !userId) {
      const body = await request.json();
      if (!sysConfig.users)
        sysConfig.users = [];
      if (sysConfig.users.length >= 5) {
        return new Response(JSON.stringify({
          success: false,
          error: "Maximum user limit of 5 reached / سقف مجاز ایجاد ۵ کاربر تکمیل شده است"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const {
        name,
        trafficLimit,
        expiryDays,
        notes,
        maxConfigs,
        proxyIp,
        cleanIp,
        userMode,
        userPorts,
        userNodes,
        nat64,
        connLimit,
        userPanelUrl,
        segMode,
        segPackets,
        segLengths,
        segDelays,
        segMaxSplit,
        segManual,
        tlsMask
      } = body;
      if (!name)
        return new Response(JSON.stringify({
          success: false,
          error: "Name is required"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      const newId = crypto.randomUUID();
      const newUser = {
        id: newId,
        name,
        limitTotalReq: trafficLimit ? Math.floor(parseFloat(trafficLimit) * 6000) : null,
        limitDailyReq: body.dailyLimit ? Math.floor(parseFloat(body.dailyLimit) * 6000) : null,
        expiryMs: expiryDays ? Date.now() + parseInt(expiryDays) * 86400000 : null,
        notes: notes || "",
        maxConfigs: maxConfigs ? parseInt(maxConfigs) : null,
        proxyIp: proxyIp || null,
        cleanIp: cleanIp || null,
        userMode: userMode || null,
        userPorts: userPorts || null,
        userNodes: userNodes || null,
        nat64: nat64 || null,
        connLimit: connLimit ? parseInt(connLimit) : null,
        userPanelUrl: userPanelUrl || null,
        segMode: segMode === "builder" || segMode === "manual" ? segMode : null,
        segPackets: segPackets ? String(segPackets).slice(0, 32) : null,
        segLengths: segLengths ? String(segLengths).slice(0, 200) : null,
        segDelays: segDelays ? String(segDelays).slice(0, 200) : null,
        segMaxSplit: segMaxSplit ? String(segMaxSplit).slice(0, 12) : null,
        segManual: segManual ? String(segManual).slice(0, 4000) : null,
        tlsMask: tlsMask ? String(tlsMask).slice(0, 2000) : null,
        createdAt: Date.now()
      };
      await resolveUserEndpointGeo(newUser);
      if (!sysConfig.users)
        sysConfig.users = [];
      sysConfig.users.push(newUser);
      await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
      ctx?.waitUntil(logActivity(env, "User Created", `User "${name}" (${newId}) created via API`).catch(() => {}));
      const hostName = new URL(request.url).hostname;
      const subUrl = `https://${hostName}/${sysConfig.apiRoute}?sub=${encodeURIComponent(name)}`;
      return new Response(JSON.stringify({
        success: true,
        user: newUser,
        subscriptionUrl: subUrl
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "PUT" && userId) {
      const body = await request.json();
      if (!sysConfig.users)
        return new Response(JSON.stringify({ success: false, error: "No users" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      const u = sysConfig.users.find((usr) => usr.id === userId);
      if (!u)
        return new Response(JSON.stringify({ success: false, error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      const oldUName = u.name;
      if (body.name !== undefined)
        u.name = body.name;
      if (body.trafficLimit !== undefined)
        u.limitTotalReq = body.trafficLimit ? Math.floor(parseFloat(body.trafficLimit) * 6000) : null;
      if (body.dailyLimit !== undefined)
        u.limitDailyReq = body.dailyLimit ? Math.floor(parseFloat(body.dailyLimit) * 6000) : null;
      if (body.expiryDays !== undefined)
        u.expiryMs = body.expiryDays ? Date.now() + parseInt(body.expiryDays) * 86400000 : null;
      if (body.notes !== undefined)
        u.notes = body.notes;
      if (body.maxConfigs !== undefined)
        u.maxConfigs = body.maxConfigs ? parseInt(body.maxConfigs) : null;
      if (body.proxyIp !== undefined) {
        u.proxyIp = body.proxyIp;
        if (!body.proxyIp) {
          u.proxyIpGeo = null;
        } else {
          await resolveUserEndpointGeo(u);
        }
      }
      if (body.cleanIp !== undefined)
        u.cleanIp = body.cleanIp;
      if (body.userMode !== undefined)
        u.userMode = body.userMode;
      if (body.userPorts !== undefined)
        u.userPorts = body.userPorts;
      if (body.userNodes !== undefined)
        u.userNodes = body.userNodes;
      if (body.nat64 !== undefined)
        u.nat64 = body.nat64;
      if (body.connLimit !== undefined)
        u.connLimit = body.connLimit ? parseInt(body.connLimit) : null;
      if (body.userPanelUrl !== undefined)
        u.userPanelUrl = body.userPanelUrl || null;
      if (body.segMode !== undefined)
        u.segMode = body.segMode === "builder" || body.segMode === "manual" ? body.segMode : null;
      if (body.segPackets !== undefined)
        u.segPackets = body.segPackets ? String(body.segPackets).slice(0, 32) : null;
      if (body.segLengths !== undefined)
        u.segLengths = body.segLengths ? String(body.segLengths).slice(0, 200) : null;
      if (body.segDelays !== undefined)
        u.segDelays = body.segDelays ? String(body.segDelays).slice(0, 200) : null;
      if (body.segMaxSplit !== undefined)
        u.segMaxSplit = body.segMaxSplit ? String(body.segMaxSplit).slice(0, 12) : null;
      if (body.segManual !== undefined)
        u.segManual = body.segManual ? String(body.segManual).slice(0, 4000) : null;
      if (body.tlsMask !== undefined)
        u.tlsMask = body.tlsMask ? String(body.tlsMask).slice(0, 2000) : null;
      if (body.status !== undefined) {
        if (body.status === "active") {
          u.isPaused = false;
          u.disabledReason = null;
          u.disabledAt = null;
        } else if (body.status === "paused") {
          u.isPaused = true;
          u.disabledReason = null;
          u.disabledAt = null;
        }
      }
      try {
        if (oldUName && u.name && oldUName !== u.name) {
          const gg = JSON.parse(await d1Get(env, "relay_graveyard") || "{}");
          let gChanged = false;
          for (const gk of Object.keys(gg || {})) {
            const ge = gg[gk];
            if (ge && Array.isArray(ge.lists) && ge.lists.indexOf("user:" + oldUName) !== -1) {
              ge.lists = [
                ...new Set(ge.lists.map((l) => l === "user:" + oldUName ? "user:" + u.name : l))
              ];
              gChanged = true;
            }
          }
          if (gChanged)
            await d1Put(env, "relay_graveyard", JSON.stringify(gg));
        }
      } catch (e) {}
      await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
      ctx?.waitUntil(logActivity(env, "User Updated", `User "${u.name}" (${userId}) updated via API`).catch(() => {}));
      return new Response(JSON.stringify({ success: true, user: u }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "DELETE" && userId) {
      if (!sysConfig.users)
        return new Response(JSON.stringify({ success: false, error: "No users" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      const idx = sysConfig.users.findIndex((usr) => usr.id === userId);
      if (idx === -1)
        return new Response(JSON.stringify({ success: false, error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      const deleted = sysConfig.users.splice(idx, 1)[0];
      await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
      ctx?.waitUntil(logActivity(env, "User Deleted", `User "${deleted.name}" (${userId}) deleted via API`).catch(() => {}));
      return new Response(JSON.stringify({ success: true, deleted: deleted.id }), { headers: { "Content-Type": "application/json" } });
    }
    if (method === "POST" && userId && action === "toggle") {
      if (!sysConfig.users)
        return new Response(JSON.stringify({ success: false, error: "No users" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      const u = sysConfig.users.find((usr) => usr.id === userId);
      if (!u)
        return new Response(JSON.stringify({ success: false, error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      u.isPaused = !u.isPaused;
      if (!u.isPaused) {
        u.disabledReason = null;
        u.disabledAt = null;
      }
      await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
      ctx?.waitUntil(logActivity(env, "User Toggled", `User "${u.name}" (${userId}) ${u.isPaused ? "paused" : "resumed"} via API`).catch(() => {}));
      return new Response(JSON.stringify({ success: true, user: u }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "POST" && userId && action === "reset") {
      if (!sysUsageCache.users)
        sysUsageCache.users = {};
      const uuidClean = userId.replace(/-/g, "").toLowerCase();
      if (sysUsageCache.users[uuidClean]) {
        sysUsageCache.users[uuidClean].reqs = 0;
        sysUsageCache.users[uuidClean].dReqs = 0;
      } else {
        sysUsageCache.users[uuidClean] = {
          reqs: 0,
          dReqs: 0,
          lastDay: new Date().toISOString().split("T")[0]
        };
      }
      await cachedD1Put(env, "sys_usage", JSON.stringify(sysUsageCache));
      ctx?.waitUntil(logActivity(env, "Traffic Reset", `Traffic reset for user ${userId} via API`).catch(() => {}));
      return new Response(JSON.stringify({ success: true, message: "Traffic reset" }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ success: false, error: "Invalid request" }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// src/core/normalizer.js
function normalizeTrafficChunk(data, maxChunk = 1420) {
  if (!data)
    return [];
  const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data.buffer || data);
  if (uint8.byteLength <= maxChunk) {
    return [uint8];
  }
  const segments = [];
  let offset = 0;
  const total = uint8.byteLength;
  while (offset < total) {
    const jitter = Math.floor(Math.random() * 200);
    const targetSize = Math.max(512, maxChunk - jitter);
    const chunkSize = Math.min(total - offset, targetSize);
    segments.push(uint8.subarray(offset, offset + chunkSize));
    offset += chunkSize;
  }
  return segments;
}
function isTrafficNormalizerActive() {
  return sysConfig.trafficNormalizer !== false && sysConfig.trafficNormaliser !== false;
}
function sendNormalizedDownstream(ws, chunk) {
  if (!chunk || !ws)
    return;
  if (!isTrafficNormalizerActive()) {
    ws.send(chunk);
    return;
  }
  const normalized = normalizeTrafficChunk(chunk);
  for (let i = 0;i < normalized.length; i++) {
    ws.send(normalized[i]);
  }
}
async function writeNormalizedTraffic(socket, writer, data, timeoutMs = TCP_WRITE_TIMEOUT_MS) {
  if (!data || !writer)
    return;
  if (!isTrafficNormalizerActive()) {
    return await writeSocketWithTimeout(socket, writer, data, timeoutMs);
  }
  const normalized = normalizeTrafficChunk(data);
  for (let i = 0;i < normalized.length; i++) {
    await writeSocketWithTimeout(socket, writer, normalized[i], timeoutMs);
  }
}

// src/protocols/stream.js
async function processTelemetryStream(env, ctx, wsRelayIdx) {
  const [client, webSocket] = Object.values(new (globalThis["WebSocketPair"] || Reflect.get(globalThis, "WebSocketPair")));
  webSocket.accept();
  webSocket.binaryType = "arraybuffer";
  startDataPipe(webSocket, env, ctx, wsRelayIdx);
  return new Response(null, { status: 101, webSocket: client });
}
async function startDataPipe(webSocket, env, ctx, wsRelayIdx) {
  incActiveConnections();
  try {
    incOpenWs();
  } catch (e) {}
  let connBytesUp = 0;
  let connBytesDown = 0;
  let activeRelay = null;
  let relayConfirmed = false;
  let pendingUpBytes = 0;
  let pendingUpItems = 0;
  webSocket.addEventListener("close", () => {
    decActiveConnections();
    try {
      decOpenWs();
    } catch (e) {}
    if (activeClientHash) {
      let cur = activeConns.get(activeClientHash) || 0;
      if (cur > 0)
        activeConns.set(activeClientHash, cur - 1);
    }
    try {
      const totalConnBytes = connBytesUp + connBytesDown;
      if (activeClientHash && totalConnBytes > 0) {
        trackUsage(activeClientHash, totalConnBytes, env, ctx);
      }
    } catch (e) {}
  });
  webSocket.addEventListener("error", () => {});
  let remoteSocket, dataWriter, isInit = true, queue = Promise.resolve();
  let activeClientHash = null;
  webSocket.addEventListener("message", (event) => {
    const size = event.data?.byteLength || 0;
    pendingUpBytes += size;
    pendingUpItems++;
    if (pendingUpBytes > UPSTREAM_QUEUE_MAX_BYTES || pendingUpItems > UPSTREAM_QUEUE_MAX_ITEMS) {
      try {
        webSocket.close();
      } catch (e) {}
      return;
    }
    queue = queue.then(async () => {
      pendingUpBytes = Math.max(0, pendingUpBytes - size);
      pendingUpItems = Math.max(0, pendingUpItems - 1);
      try {
        if (isInit) {
          isInit = false;
          const isModeAlpha = await parseSensorData(event.data, wsRelayIdx);
          if (isModeAlpha)
            webSocket.send(new Uint8Array([0, 0]));
        } else if (dataWriter) {
          try {
            await writeNormalizedTraffic(remoteSocket, dataWriter, event.data, UPSTREAM_WRITE_TIMEOUT_MS);
          } catch (werr) {
            closeTcpSocketQuietly(remoteSocket);
            try {
              releaseWriterQuietly(dataWriter);
            } catch (e) {}
            dataWriter = null;
            try {
              webSocket.close();
            } catch (e) {}
            return;
          }
          try {
            connBytesUp += event.data?.byteLength || 0;
          } catch (e) {}
        }
      } catch (err) {
        webSocket.close();
      }
    });
  });
  async function parseSensorData(bufferData, wsRelayIdx) {
    const view = new Uint8Array(bufferData);
    let targetAddr = "", targetPort = 0, offset = 0, isModeAlpha = false, activeProfile = null;
    if (view[0] === 0) {
      isModeAlpha = true;
      let clientHash = Array.from(view.slice(1, 17)).map((b) => b.toString(16).padStart(2, "0")).join("");
      let configEntry = lookupConfigEntry(clientHash);
      if (configEntry) {
        activeClientHash = configEntry.userId.replace(/-/g, "").toLowerCase();
        activeProfile = getAllProfiles().find((p) => p.id.replace(/-/g, "").toLowerCase() === activeClientHash);
        if (!activeProfile)
          return false;
        if (configEntry.relayIp)
          activeProfile = {
            ...activeProfile,
            proxyIp: configEntry.relayIp
          };
      } else {
        let decoded = decodeConfigUuid(clientHash);
        if (decoded) {
          activeProfile = getAllProfiles().find((p) => p.id.replace(/-/g, "").toLowerCase().startsWith(decoded.userFingerprint));
          if (activeProfile && decoded.relayIpIndex >= 0) {
            const effectivePips = getEffectivePips(activeProfile);
            if (effectivePips.length > 0) {
              const idx = decoded.relayIpIndex % effectivePips.length;
              activeProfile = {
                ...activeProfile,
                proxyIp: effectivePips[idx]
              };
            }
          }
        }
        if (!activeProfile) {
          activeProfile = getAllProfiles().find((p) => p.id.replace(/-/g, "").toLowerCase() === clientHash);
        }
        if (!activeProfile)
          return false;
        activeClientHash = activeProfile.id.replace(/-/g, "").toLowerCase();
      }
      trackUsage(activeClientHash, 0, env, ctx);
      let currentConns = activeConns.get(activeClientHash) || 0;
      if (activeProfile && activeProfile.connLimit) {
        if (currentConns >= activeProfile.connLimit) {
          webSocket.close();
          return isModeAlpha;
        }
      }
      activeConns.set(activeClientHash, currentConns + 1);
      let uTrack = uuidUsage.get(activeClientHash) || {
        connects: 0,
        last: 0
      };
      uTrack.connects++;
      uTrack.last = Date.now();
      uuidUsage.set(activeClientHash, uTrack);
      const optLen = view[17];
      const pPos = 18 + optLen + 1;
      targetPort = new DataView(bufferData.slice(pPos, pPos + 2)).getUint16(0);
      const aType = view[pPos + 2];
      let vPos = pPos + 3, aLen = 0;
      if (aType === 1) {
        aLen = 4;
        targetAddr = view.slice(vPos, vPos + aLen).join(".");
      } else if (aType === 2) {
        aLen = view[vPos];
        vPos++;
        targetAddr = new TextDecoder().decode(view.slice(vPos, vPos + aLen));
      } else if (aType === 3) {
        aLen = 16;
        const dv = new DataView(bufferData.slice(vPos, vPos + aLen));
        targetAddr = Array.from({ length: 8 }, (_, i) => dv.getUint16(i * 2).toString(16)).join(":");
      }
      offset = vPos + aLen;
    } else {
      let ePos = bufferData.byteLength;
      for (let i = 0;i < bufferData.byteLength; i++) {
        if (view[i] === 13 && view[i + 1] === 10) {
          ePos = i;
          break;
        }
      }
      let clientHashHex = new TextDecoder().decode(view.slice(0, ePos));
      let configEntry = lookupConfigEntry(clientHashHex);
      if (configEntry) {
        activeClientHash = configEntry.userId.replace(/-/g, "").toLowerCase();
        activeProfile = getAllProfiles().find((p) => p.id.replace(/-/g, "").toLowerCase() === activeClientHash);
        if (!activeProfile)
          return false;
        if (configEntry.relayIp)
          activeProfile = {
            ...activeProfile,
            proxyIp: configEntry.relayIp
          };
      } else {
        activeProfile = getAllProfiles().find((p) => getAuthHash(p.id) === clientHashHex);
        if (!activeProfile)
          return false;
        activeClientHash = activeProfile.id.replace(/-/g, "").toLowerCase();
        if (wsRelayIdx >= 0) {
          const effectivePips = getEffectivePips(activeProfile);
          if (effectivePips.length > 0) {
            activeProfile = {
              ...activeProfile,
              proxyIp: effectivePips[wsRelayIdx % effectivePips.length]
            };
          }
        }
      }
      trackUsage(activeClientHash, 0, env, ctx);
      let currentConns = activeConns.get(activeClientHash) || 0;
      if (activeProfile && activeProfile.connLimit) {
        if (currentConns >= activeProfile.connLimit) {
          webSocket.close();
          return isModeAlpha;
        }
      }
      activeConns.set(activeClientHash, currentConns + 1);
      let uTrack = uuidUsage.get(activeClientHash) || {
        connects: 0,
        last: 0
      };
      uTrack.connects++;
      uTrack.last = Date.now();
      uuidUsage.set(activeClientHash, uTrack);
      let hPos = ePos + 2;
      hPos++;
      let aType = view[hPos];
      hPos++;
      let aLen = 0;
      if (aType === 1) {
        aLen = 4;
        targetAddr = view.slice(hPos, hPos + aLen).join(".");
      } else if (aType === 3) {
        aLen = view[hPos];
        hPos++;
        targetAddr = new TextDecoder().decode(view.slice(hPos, hPos + aLen));
      } else if (aType === 4) {
        aLen = 16;
        const dv = new DataView(bufferData.slice(hPos, hPos + aLen));
        targetAddr = Array.from({ length: 8 }, (_, i) => dv.getUint16(i * 2).toString(16)).join(":");
      }
      hPos += aLen;
      targetPort = new DataView(bufferData.slice(hPos, hPos + 2)).getUint16(0);
      offset = hPos + 4;
    }
    let isDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(targetAddr) || /^[a-zA-Z0-9-]+$/.test(targetAddr);
    let connectAddr = targetAddr;
    let aiEgress = false;
    try {
      if (isDomain)
        aiEgress = isAiDomain(targetAddr);
      else if (targetPort === 443 && offset < bufferData.byteLength) {
        aiEgress = isAiDomain(sniffSniFromHello(bufferData.slice(offset)));
      }
    } catch (e) {}
    if (isDomain && sysConfig.customDns) {
      try {
        const dohUrl = new URL(sysConfig.customDns);
        dohUrl.searchParams.set("name", targetAddr);
        dohUrl.searchParams.set("type", "A");
        let dnsRes = await fetchT(dohUrl.toString(), {
          headers: { accept: "application/dns-json" }
        });
        let dnsJson = await dnsRes.json();
        if (dnsJson.Answer && dnsJson.Answer.length > 0) {
          connectAddr = dnsJson.Answer[0].data;
        }
      } catch (e) {}
    }
    try {
      remoteSocket = connect2({ hostname: connectAddr, port: targetPort });
      await withDeadline(remoteSocket.opened, TCP_OPEN_TIMEOUT_MS, () => closeTcpSocketQuietly(remoteSocket), "direct-open");
      activeRelay = null;
      relayConfirmed = false;
    } catch {
      let pips = [];
      if (activeProfile && activeProfile.proxyIp) {
        pips = activeProfile.proxyIp.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
      }
      if (pips.length === 0 && sysConfig.backupRelay) {
        pips = sysConfig.backupRelay.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
      }
      if (pips.length === 0 && sysConfig.customRelay) {
        pips = sysConfig.customRelay.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
      }
      let startIndex = 0;
      let aiPinned = false;
      try {
        if (aiEgress) {
          const ord = orderAiFirstTokens(pips);
          if (ord.moved) {
            pips = ord.list;
            aiPinned = true;
          }
        }
      } catch (e) {}
      if (pips.length > 1 && !aiPinned) {
        let hash = 0;
        let hashStr = activeProfile ? activeProfile.id : "";
        for (let i = 0;i < hashStr.length; i++) {
          hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        startIndex = Math.abs(hash) % pips.length;
      }
      let connected = false;
      let tryPips = filterQuarantinedRelays(pips);
      try {
        if (aiEgress && tryPips.length > 1)
          tryPips = filterAiQuarantinedTokens(tryPips);
      } catch (e) {}
      for (let attempt = 0;attempt < Math.min(tryPips.length, 3); attempt++) {
        let currentIndex = (startIndex + attempt) % tryPips.length;
        let currentProxy = tryPips[currentIndex];
        const rkFail = relayKeyOf(currentProxy);
        try {
          const [altIP0, altPortStr0] = currentProxy.split(":");
          const altPortClean = altPortStr0 ? altPortStr0.split("#")[0].trim() : altPortStr0;
          const altIP = rkFail && rkFail.host ? rkFail.host : altIP0;
          remoteSocket = connect2({
            hostname: altIP,
            port: altPortClean ? Number(altPortClean) : targetPort
          });
          await withDeadline(remoteSocket.opened, TCP_OPEN_TIMEOUT_MS, () => closeTcpSocketQuietly(remoteSocket), "relay-open");
          connected = true;
          relayConfirmed = false;
          activeRelay = rkFail ? {
            host: rkFail.host,
            port: rkFail.port,
            ai: aiEgress
          } : null;
          break;
        } catch (e) {
          if (rkFail) {
            try {
              if (aiEgress)
                recordAiFailure(rkFail.host, rkFail.port);
              else
                recordRelayFailure(rkFail.host, rkFail.port);
            } catch (ee) {}
          }
        }
      }
      if (!connected) {
        webSocket.close();
        return isModeAlpha;
      }
    }
    dataWriter = remoteSocket.writable.getWriter();
    if (offset < bufferData.byteLength) {
      let chunk = bufferData.slice(offset);
      try {
        await writeNormalizedTraffic(remoteSocket, dataWriter, chunk, TCP_WRITE_TIMEOUT_MS);
      } catch (e) {
        closeTcpSocketQuietly(remoteSocket);
        try {
          releaseWriterQuietly(dataWriter);
        } catch (_) {}
        dataWriter = null;
        try {
          webSocket.close();
        } catch (_) {}
        return isModeAlpha;
      }
      try {
        connBytesUp += chunk.byteLength || 0;
      } catch (e) {}
    }
    try {
      remoteSocket.readable.pipeTo(new WritableStream({
        write(chunk) {
          try {
            connBytesDown += chunk?.byteLength || 0;
            const n = chunk && chunk.byteLength || 0;
            if (n > 0 && activeRelay && !relayConfirmed) {
              relayConfirmed = true;
              try {
                recordRelaySuccess(activeRelay.host, activeRelay.port, true);
              } catch (e) {}
              try {
                if (activeRelay.ai)
                  recordAiSuccess(activeRelay.host, activeRelay.port);
              } catch (e) {}
            }
          } catch (e) {}
          try {
            sendNormalizedDownstream(webSocket, chunk);
          } catch (e) {}
        },
        close() {},
        abort() {}
      })).catch(() => {}).finally(() => {
        closeTcpSocketQuietly(remoteSocket);
        try {
          webSocket.close();
        } catch (e) {}
      });
    } catch (e) {}
    return isModeAlpha;
  }
}

// src/api/stats.js
async function fetchCloudflareUsage(accountId, apiToken) {
  if (!accountId || !apiToken)
    return null;
  try {
    const d = new Date;
    const currentDate = d.toISOString().split("T")[0] + "T00:00:00Z";
    const query = `query GetDailyUsage($accountId: String!, $start: ISO8601DateTime!) { viewer { accounts(filter: {accountTag: $accountId}) { workersInvocationsAdaptive(limit: 1, filter: { datetime_geq: $start }) { sum { requests } } } } }`;
    const variables = { accountId, start: currentDate };
    const res = await fetchT("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    const reqs = json?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive?.[0]?.sum?.requests;
    return typeof reqs === "number" ? reqs : null;
  } catch (e) {
    return null;
  }
}
async function handleStatsApi(request, env) {
  try {
    const url = new URL(request.url);
    const authHeader = request.headers.get("Authorization") || "";
    const authKey = authHeader.replace("Bearer ", "") || url.searchParams.get("key") || "";
    const statsGateIp = request.headers.get("cf-connecting-ip") || "Unknown";
    if (authBlocked(statsGateIp)) {
      return new Response(JSON.stringify({ success: false, error: "Too many attempts" }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (authKey !== sysConfig.masterKey && !isPanelApiKey(authKey)) {
      authFail(statsGateIp);
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const users = sysConfig.users || [];
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => !u.isPaused && (!u.expiryMs || Date.now() <= u.expiryMs)).length;
    const autoDisabledUsers = users.filter((u) => u.isPaused && u.disabledReason).length;
    const pausedUsers = users.filter((u) => u.isPaused && !u.disabledReason).length;
    const expiredUsers = users.filter((u) => u.expiryMs && Date.now() > u.expiryMs && !u.isPaused).length;
    let totalTrafficReqs = 0;
    let dailyTrafficReqs = 0;
    let totalTrafficBytes = 0;
    let dailyTrafficBytes = 0;
    const todayDate = new Date().toISOString().split("T")[0];
    users.forEach((u) => {
      const idClean = u.id.replace(/-/g, "").toLowerCase();
      const sysU = sysUsageCache?.users?.[idClean] || {
        reqs: 0,
        dReqs: 0,
        lastDay: ""
      };
      totalTrafficReqs += sysU.reqs || 0;
      if (sysU.lastDay === todayDate)
        dailyTrafficReqs += sysU.dReqs || 0;
      totalTrafficBytes += usageTotalBytes(sysU);
      dailyTrafficBytes += usageDailyBytes(sysU, todayDate);
    });
    let usageData = {};
    for (let [k, v] of uuidUsage.entries()) {
      usageData[k] = { ...v, connects: activeConns.get(k) || 0 };
    }
    const upSeconds = Math.floor((Date.now() - isolateStartTime) / 1000);
    return new Response(JSON.stringify({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          paused: pausedUsers,
          expired: expiredUsers,
          autoDisabled: autoDisabledUsers
        },
        traffic: {
          totalRequests: totalTrafficReqs,
          totalGB: (totalTrafficBytes / 1073741824).toFixed(2),
          dailyRequests: dailyTrafficReqs,
          dailyGB: (dailyTrafficBytes / 1073741824).toFixed(2)
        },
        usage: usageData,
        system: {
          uptimeSeconds: upSeconds,
          activeConnections,
          version: CURRENT_VERSION,
          isPaused: sysConfig.isPaused || false,
          security: {
            usingDefaultKey: sysConfig.masterKey === "admin"
          }
        },
        relays: await relayHealthSnapshotAsync(env)
      }
    }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// src/api/telegram.js
async function sendTelegramMessage(request, type, hostName) {
  if (!sysConfig.tgToken || !(sysConfig.tgAdminId || sysConfig.tgChatId))
    return;
  const escMd = (s) => String(s).replace(/[_*()[`[]/g, "\\$&");
  let usageStr = "نامشخص (0.00%)";
  if (sysConfig.cfAccountId && sysConfig.cfApiToken) {
    const reqs = await fetchCloudflareUsage(sysConfig.cfAccountId, sysConfig.cfApiToken);
    if (reqs !== null) {
      const limit = 1e5;
      const pct = (reqs / limit * 100).toFixed(2);
      usageStr = `${reqs}/${limit} ${pct}%`;
    }
  }
  const ip = request.headers.get("cf-connecting-ip") || "Unknown";
  const cf = request.cf || {};
  const country = cf.country || "Unknown";
  const city = cf.city || "Unknown";
  const asn = cf.asn || "Unknown";
  const asOrg = cf.asOrganization || "Unknown";
  const domain = request.headers.get("Host") || new URL(request.url).hostname;
  const path = new URL(request.url).pathname;
  const ua = request.headers.get("User-Agent") || "حالا یوزرایجنت مارو نبینین";
  const d = new Date;
  const timeStr = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(d);
  const text = `\uD83D\uDCCC نوع: ${escMd(type)}
` + `\uD83C\uDF10 IP: ${escMd(ip)}
` + `\uD83D\uDCCD موقعیت: ${escMd(country)} ${escMd(city)}
` + `\uD83C\uDFE2 ASN: AS${escMd(asn)} ${escMd(asOrg)}
` + `\uD83D\uDD17 دامنه: ${escMd(domain)}
` + `\uD83D\uDD0D مسیر: ${escMd(path)}
` + `\uD83E\uDD16 مرورگر: ${escMd(ua)}
` + `\uD83D\uDCC5 زمان: ${escMd(timeStr)}
` + `\uD83D\uDCCA مصرف: ${usageStr}`;
  const h = hostName || domain;
  const langCode = sysConfig.tgBotLang || "fa";
  const locT = (key) => botI18n[langCode]?.[key] || botI18n["en"]?.[key] || key;
  const isPaused = sysConfig.isPaused || false;
  const panelUrl = `https://${h}/${encodeURI(sysConfig.apiRoute)}/dash`;
  const subUrl = `https://${h}/${sysConfig.apiRoute}`;
  const inline_keyboard = [
    [
      { text: `\uD83D\uDCCA ${locT("dashboard")}`, callback_data: "sys_dashboard" },
      { text: `\uD83D\uDCC8 ${locT("statistics")}`, callback_data: "sys_stats" }
    ],
    [
      {
        text: `\uD83D\uDD17 ${locT("btn_sub_link")}`,
        callback_data: "get_sub_link"
      },
      {
        text: `ℹ️ ${locT("panel_info")}`,
        callback_data: "sys_panel_info"
      }
    ],
    [
      {
        text: `\uD83C\uDF10 ${langCode === "fa" ? "English \uD83C\uDDFA\uD83C\uDDF8" : "فارسی \uD83C\uDDEE\uD83C\uDDF7"}`,
        callback_data: "sys_lang"
      },
      {
        text: isPaused ? `▶️ ${locT("btn_resume")}` : `⏸️ ${locT("btn_pause")}`,
        callback_data: "sys_toggle_status"
      }
    ],
    [{ text: `\uD83D\uDD11 ${locT("dash")}`, web_app: { url: panelUrl } }]
  ];
  const tgUrl = `https://api.telegram.org/bot${sysConfig.tgToken}/sendMessage`;
  const notifyChatId = sysConfig.tgAdminId || sysConfig.tgChatId;
  try {
    await fetchT(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: notifyChatId,
        text,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard }
      })
    });
  } catch (e) {}
}
async function handleTelegramWebhook(request, env, hostName, ctx) {
  try {
    const update = await request.json();
    const tgApi = `https://api.telegram.org/bot${sysConfig.tgToken}`;
    const langCode = sysConfig.tgBotLang || "fa";
    const t = (key) => botI18n[langCode]?.[key] || botI18n["en"]?.[key] || key;
    const callerId = update.callback_query?.from?.id?.toString() || update.message?.from?.id?.toString();
    const adminId = sysConfig.tgAdminId || sysConfig.tgChatId;
    const isAuthorized = adminId && callerId === adminId.toString();
    if (!isAuthorized) {
      const chatId = update.callback_query?.message?.chat?.id || update.message?.chat?.id;
      if (chatId) {
        await fetchT(`${tgApi}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `❌ *شما دسترسی به این ربات را ندارید.*

یوزر آیدی شما جهت اضافه کردن به لیست ادمین ها: \`` + (callerId || "Unknown") + "`",
            parse_mode: "Markdown"
          })
        });
      }
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 200 });
    }
    let tgState = {};
    try {
      const storedState = await d1Get(env, "tg_bot_state");
      if (storedState)
        tgState = JSON.parse(storedState);
    } catch (e) {}
    const panels = getPanelsList();
    let lastLoginPanel = null;
    try {
      const stored = await d1Get(env, "tg_panel_login");
      if (stored)
        lastLoginPanel = JSON.parse(stored);
    } catch (e) {}
    const getActivePanel = () => {
      if (lastLoginPanel) {
        if (lastLoginPanel.isLocal)
          return panels.find((p) => p.isLocal) || panels[0];
        const found = panels.find((p) => !p.isLocal && p.host === lastLoginPanel.host);
        if (found)
          return found;
        return {
          name: lastLoginPanel.name || lastLoginPanel.host,
          host: lastLoginPanel.host,
          apiRoute: lastLoginPanel.apiRoute || sysConfig.apiRoute,
          apiKey: lastLoginPanel.apiKey || lastLoginPanel.masterKey || null,
          isLocal: false
        };
      }
      return panels[0];
    };
    const sendOrEdit = async (chatId, text, replyMarkup = null, messageId = null) => {
      let res;
      if (messageId) {
        res = await fetchT(`${tgApi}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text,
            parse_mode: "Markdown",
            reply_markup: replyMarkup
          })
        });
        if (res.ok)
          return res;
        try {
          const errBody = await res.json();
          if (errBody?.description?.includes("message is not modified"))
            return res;
        } catch (e) {}
      }
      res = await fetchT(`${tgApi}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          reply_markup: replyMarkup
        })
      });
      return res;
    };
    const getMainMenu = (activePanel, isAdmin = true) => {
      const isPaused = sysConfig.isPaused || false;
      const statusEmoji = isPaused ? "\uD83D\uDD34" : "\uD83D\uDFE2";
      const users = sysConfig.users || [];
      const activeCount = users.filter((u) => !u.isPaused && (!u.expiryMs || Date.now() <= u.expiryMs)).length;
      const pausedCount = users.filter((u) => u.isPaused && !u.disabledReason).length;
      const autoDisabledCount = users.filter((u) => u.isPaused && u.disabledReason).length;
      const isLocal = !activePanel || activePanel.isLocal;
      const panelName = activePanel ? activePanel.name : sysConfig.name || "Main Panel";
      const panelIndicator = isLocal ? `\uD83C\uDFE0 ${panelName}` : `\uD83C\uDF10 ${panelName}`;
      let text = `${t("welcome")}

` + `━━━━━━━━━━━━━━━━
` + `\uD83D\uDCCC **${t("current_panel")}**: ${panelIndicator}
` + `⚡ **${t("status")}**: ${isPaused ? t("paused") : t("active")} ${statusEmoji}
` + `\uD83D\uDC65 **${t("users")}**: ${users.length} (${activeCount} ${t("count_active")}, ${pausedCount} ${t("count_paused")}, ${autoDisabledCount} ${t("count_disabled")})
` + `━━━━━━━━━━━━━━━━`;
      const panelUrl = isLocal ? `https://${hostName}/${encodeURI(sysConfig.apiRoute)}/dash` : null;
      const subUrl = `https://${hostName}/${sysConfig.apiRoute}`;
      const inline_keyboard = [];
      if (isAdmin) {
        inline_keyboard.push([
          { text: `\uD83D\uDC65 ${t("users")}`, callback_data: "subs_list:0" },
          {
            text: `\uD83D\uDD0D ${t("search")}`,
            callback_data: "sub_search_init"
          }
        ]);
      }
      inline_keyboard.push([
        {
          text: `\uD83D\uDCCA ${t("dashboard")}`,
          callback_data: "sys_dashboard"
        },
        { text: `\uD83D\uDCC8 ${t("statistics")}`, callback_data: "sys_stats" }
      ]);
      inline_keyboard.push([
        {
          text: `\uD83D\uDD17 ${t("btn_sub_link")}`,
          callback_data: "get_sub_link"
        }
      ]);
      if (isAdmin) {
        inline_keyboard.push([
          {
            text: `\uD83D\uDEAB ${t("disabled_users")}`,
            callback_data: "subs_disabled:0"
          }
        ]);
        inline_keyboard.push([
          {
            text: `⚙️ ${t("tg_settings")}`,
            callback_data: "tg_settings_menu"
          },
          {
            text: `\uD83D\uDD27 ${t("tg_advanced")}`,
            callback_data: "tg_advanced_menu"
          }
        ]);
        inline_keyboard.push([
          {
            text: `\uD83D\uDCCB ${t("tg_logs")}`,
            callback_data: "tg_logs_menu"
          }
        ]);
      }
      inline_keyboard.push([
        {
          text: `\uD83C\uDF10 ${langCode === "fa" ? "English \uD83C\uDDFA\uD83C\uDDF8" : "فارسی \uD83C\uDDEE\uD83C\uDDF7"}`,
          callback_data: "sys_lang"
        },
        {
          text: isPaused ? `▶️ ${t("btn_resume")}` : `⏸️ ${t("btn_pause")}`,
          callback_data: "sys_toggle_status"
        }
      ]);
      if (panelUrl) {
        inline_keyboard.push([
          { text: `\uD83D\uDD11 ${t("dash")}`, web_app: { url: panelUrl } },
          {
            text: `ℹ️ ${t("panel_info")}`,
            callback_data: "sys_panel_info"
          }
        ]);
        if (isAdmin) {
          inline_keyboard.push([
            {
              text: `\uD83D\uDEA8 ${t("panic")}`,
              callback_data: "sys_panic_init"
            }
          ]);
        }
      } else {
        inline_keyboard.push([
          {
            text: `ℹ️ ${t("panel_info")}`,
            callback_data: "sys_panel_info"
          }
        ]);
      }
      const kb = { inline_keyboard };
      return { text, kb };
    };
    const getSubsList = (page = 0, usersList = null) => {
      const users = usersList || sysConfig.users || [];
      const itemsPerPage = 5;
      const totalPages = Math.ceil(users.length / itemsPerPage);
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const pageUsers = users.slice(start, end);
      let text = `\uD83D\uDC65 **${t("users")}** (${t("lbl_page")} ${page + 1}/${Math.max(1, totalPages)})
`;
      text += `━━━━━━━━━━━━━━━━
`;
      if (users.length === 0) {
        text += `⚠️ ${t("no_users")}
`;
      } else {
        pageUsers.forEach((u, idx) => {
          text += `${start + idx + 1}. \uD83D\uDC64 **${u.name}**
   \`${u.id}\`
`;
        });
      }
      text += `━━━━━━━━━━━━━━━━`;
      const inline_keyboard = [];
      pageUsers.forEach((u) => {
        inline_keyboard.push([
          {
            text: `\uD83D\uDC64 ${u.name}`,
            callback_data: `sub_detail:${u.id}`
          }
        ]);
      });
      const navRow = [];
      if (page > 0) {
        navRow.push({
          text: `⬅️ ${t("btn_back")}`,
          callback_data: `subs_list:${page - 1}`
        });
      }
      if (end < users.length) {
        navRow.push({
          text: `${t("btn_next")} ➡️`,
          callback_data: `subs_list:${page + 1}`
        });
      }
      if (navRow.length > 0) {
        inline_keyboard.push(navRow);
      }
      inline_keyboard.push([
        { text: `➕ ${t("btn_add")}`, callback_data: "sub_add_init" }
      ]);
      inline_keyboard.push([
        { text: t("btn_main_menu"), callback_data: "main_menu" }
      ]);
      return { text, kb: { inline_keyboard } };
    };
    const getSubDetail = (uuid, usersList = null) => {
      const users = usersList || sysConfig.users || [];
      const u = users.find((usr) => usr.id === uuid);
      if (!u) {
        return {
          text: "⚠️ User not found",
          kb: {
            inline_keyboard: [
              [
                {
                  text: t("btn_back"),
                  callback_data: "subs_list:0"
                }
              ]
            ]
          }
        };
      }
      const sysU = sysUsageCache?.users?.[u.id.replace(/-/g, "").toLowerCase()] || { reqs: 0, dReqs: 0, lastDay: "" };
      const userReqs = sysU.reqs || 0;
      const curDate = new Date().toISOString().split("T")[0];
      const userDReqs = sysU.lastDay === curDate ? sysU.dReqs || 0 : 0;
      const limitTotalTxt = u.limitTotalReq ? `${u.limitTotalReq}` : t("unlimited");
      const limitDailyTxt = u.limitDailyReq ? `${u.limitDailyReq}` : t("unlimited");
      const usedGB = (usageTotalBytes(sysU) / 1073741824).toFixed(2);
      const limitGB = u.limitTotalReq ? (limitReqToBytes(u.limitTotalReq) / 1073741824).toFixed(2) : t("unlimited");
      let expTxt = t("unlimited");
      let isExp = false;
      let daysLeft = t("unlimited");
      if (u.expiryMs) {
        const date = new Date(u.expiryMs);
        expTxt = date.toLocaleDateString();
        const remDays = Math.ceil((u.expiryMs - Date.now()) / 86400000);
        daysLeft = remDays >= 0 ? `${remDays}` : "0";
        if (Date.now() > u.expiryMs) {
          expTxt += ` (${t("dash_expired")} \uD83D\uDD34)`;
          isExp = true;
        }
      }
      const statusEmoji = u.isPaused ? "⏸️" : isExp ? "\uD83D\uDD34" : "\uD83D\uDFE2";
      const statusText = u.isPaused ? t("paused") : isExp ? t("dash_expired") : t("active");
      const subSync = `https://${hostName}/${sysConfig.apiRoute}?sub=${encodeURIComponent(u.name)}`;
      const maxCfgTxt = u.maxConfigs || t("unlimited");
      const notesTxt = u.notes || t("lbl_none");
      const modeTxt = u.userMode ? u.userMode === "alpha" ? "Alpha (V)" : u.userMode === "beta" ? "Beta (T)" : "Both" : t("unlimited");
      const portsTxt = u.userPorts || t("unlimited");
      const cleanIpsTxt = u.cleanIp ? u.cleanIp.substring(0, 30) + (u.cleanIp.length > 30 ? "..." : "") : "—";
      const proxyIpsTxt = u.proxyIp ? u.proxyIp.substring(0, 30) + (u.proxyIp.length > 30 ? "..." : "") : "—";
      const nodesTxt = u.userNodes ? u.userNodes.substring(0, 30) + (u.userNodes.length > 30 ? "..." : "") : "—";
      const nat64Txt = u.nat64 || "—";
      let text = `\uD83D\uDC64 **${t("sub_info")}**
`;
      text += `━━━━━━━━━━━━━━━━
`;
      text += `\uD83D\uDCDB **${t("name")}**: ${u.name}
`;
      text += `\uD83C\uDD94 **UUID**: \`${u.id}\`
`;
      text += `\uD83D\uDEA6 **${t("lbl_status")}**: ${statusEmoji} ${statusText}
`;
      text += `\uD83D\uDCCA **${t("total")}**: ${usedGB} GB / ${limitGB} GB (${userReqs} reqs)
`;
      text += `⏱ **${t("daily")}**: ${userDReqs} / ${limitDailyTxt}
`;
      text += `\uD83D\uDCC5 **${t("expiry")}**: ${expTxt}
`;
      text += `⏳ **${t("days")}**: ${daysLeft}
`;
      text += `\uD83D\uDCE1 **${t("tg_u_mode")}**: ${modeTxt}
`;
      text += `\uD83D\uDD0C **${t("tg_u_ports")}**: ${portsTxt}
`;
      text += `\uD83D\uDCF1 **${t("device_limit")}**: ${maxCfgTxt}
`;
      text += `\uD83E\uDDF9 **${t("tg_u_clean_ips")}**: ${cleanIpsTxt}
`;
      text += `\uD83D\uDD17 **${t("tg_u_proxy_ips")}**: ${proxyIpsTxt}
`;
      text += `\uD83D\uDDA5️ **${t("tg_u_nodes")}**: ${nodesTxt}
`;
      text += `\uD83C\uDF10 **${t("tg_u_nat64")}**: ${nat64Txt}
`;
      text += `\uD83D\uDD17 **${t("tg_u_conn_limit")}**: ${u.connLimit || t("unlimited")}
`;
      text += `\uD83C\uDF9B **${t("tg_u_panel_url")}**: ${u.userPanelUrl || t("unlimited")}
`;
      text += `\uD83D\uDCDD **${t("notes")}**: ${notesTxt}
`;
      text += `━━━━━━━━━━━━━━━━
`;
      text += `\uD83D\uDD17 **${t("lbl_subscription")}:**
\`${subSync}\``;
      const kb = {
        inline_keyboard: [
          [
            {
              text: u.isPaused ? `▶️ ${t("btn_resume")}` : `⏸️ ${t("btn_pause")}`,
              callback_data: `sub_toggle:${u.id}`
            },
            {
              text: `\uD83D\uDDD1️ ${t("btn_del")}`,
              callback_data: `sub_del_init:${u.id}`
            }
          ],
          [
            {
              text: `✏️ ${t("btn_edit_name")}`,
              callback_data: `sub_edit_name_init:${u.id}`
            },
            {
              text: `⚙️ ${t("btn_edit_limits")}`,
              callback_data: `sub_edit_limits_init:${u.id}`
            }
          ],
          [
            {
              text: `\uD83D\uDD04 ${t("reset_traffic")}`,
              callback_data: `sub_reset_traffic:${u.id}`
            },
            {
              text: `\uD83D\uDCC5 ${t("extend_expiry")}`,
              callback_data: `sub_extend_init:${u.id}`
            }
          ],
          [
            {
              text: `\uD83D\uDCDD ${t("notes")}`,
              callback_data: `sub_edit_notes_init:${u.id}`
            },
            {
              text: `\uD83D\uDCF1 ${t("device_limit")}`,
              callback_data: `sub_edit_device_init:${u.id}`
            }
          ],
          [
            {
              text: t("btn_back_to_list"),
              callback_data: "subs_list:0"
            }
          ]
        ]
      };
      return { text, kb };
    };
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;
      const data = cb.data;
      if (chatId) {
        if (!isAuthorized) {
          await fetchT(`${tgApi}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: cb.id,
              text: t("access_denied"),
              show_alert: true
            })
          });
          return new Response("OK", { status: 200 });
        }
        const activePanel = getActivePanel();
        const isRemotePanel = activePanel && !activePanel.isLocal;
        const getPanelUsers = async () => {
          if (isRemotePanel) {
            const res = await fetchRemotePanelUsers(activePanel);
            return res.success ? res.users || [] : null;
          }
          return sysConfig.users || [];
        };
        tgState[chatId] = null;
        ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
        let answerText = null;
        if (data === "main_menu") {
          const menu = getMainMenu(activePanel, isAuthorized);
          await sendOrEdit(chatId, menu.text, menu.kb, messageId);
        } else if (data === "sys_lang") {
          sysConfig.tgBotLang = langCode === "fa" ? "en" : "fa";
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          const menu = getMainMenu(activePanel, isAuthorized);
          await sendOrEdit(chatId, menu.text, menu.kb, messageId);
        } else if (data === "sys_toggle_status") {
          sysConfig.isPaused = !sysConfig.isPaused;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          const menu = getMainMenu(activePanel, isAuthorized);
          await sendOrEdit(chatId, menu.text, menu.kb, messageId);
        } else if (data === "sys_metrics") {
          let usageStr = t("unlimited");
          if (sysConfig.cfAccountId && sysConfig.cfApiToken) {
            const reqs = await fetchCloudflareUsage(sysConfig.cfAccountId, sysConfig.cfApiToken);
            if (reqs !== null) {
              const pct = (reqs / 1e5 * 100).toFixed(2);
              usageStr = `${reqs}/100000 (${pct}%)`;
            }
          }
          const upSeconds = Math.floor((Date.now() - isolateStartTime) / 1000);
          const dh = Math.floor(upSeconds / 3600);
          const dm = Math.floor(upSeconds % 3600 / 60);
          let text = `\uD83D\uDCE1 **${t("metrics")}**
`;
          text += `━━━━━━━━━━━━━━━━
`;
          text += `⏱ **${t("uptime")}**: ${dh}h ${dm}m
`;
          text += `\uD83D\uDD0C **${t("streams")}**: ${activeConnections}
`;
          text += `\uD83D\uDCCA **Cloudflare API Usage**: ${usageStr}
`;
          text += `━━━━━━━━━━━━━━━━`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: t("btn_main_menu"),
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data.startsWith("subs_list:")) {
          const page = parseInt(data.replace("subs_list:", "")) || 0;
          const panelUsers = await getPanelUsers();
          if (panelUsers === null && isRemotePanel) {
            await sendOrEdit(chatId, t("msg_panel_error"), {
              inline_keyboard: [
                [
                  {
                    text: t("btn_main_menu"),
                    callback_data: "main_menu"
                  }
                ]
              ]
            });
          } else {
            const list = getSubsList(page, panelUsers);
            await sendOrEdit(chatId, list.text, list.kb, messageId);
          }
        } else if (data.startsWith("sub_detail:")) {
          const uuid = data.replace("sub_detail:", "");
          const panelUsers = await getPanelUsers();
          if (panelUsers === null && isRemotePanel) {
            await sendOrEdit(chatId, t("msg_panel_error"), {
              inline_keyboard: [
                [
                  {
                    text: t("btn_main_menu"),
                    callback_data: "main_menu"
                  }
                ]
              ]
            });
          } else {
            const detail = getSubDetail(uuid, panelUsers);
            await sendOrEdit(chatId, detail.text, detail.kb, messageId);
          }
        } else if (data.startsWith("sub_toggle:")) {
          const uuid = data.replace("sub_toggle:", "");
          if (isRemotePanel) {
            await remotePanelToggleUser(activePanel, uuid);
          } else if (sysConfig.users) {
            const u = sysConfig.users.find((usr) => usr.id === uuid);
            if (u) {
              u.isPaused = !u.isPaused;
              await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            }
          }
          const panelUsers = await getPanelUsers();
          const detail = getSubDetail(uuid, panelUsers);
          await sendOrEdit(chatId, detail.text, detail.kb, messageId);
        } else if (data.startsWith("sub_del_init:")) {
          const uuid = data.replace("sub_del_init:", "");
          const panelUsers = await getPanelUsers();
          const u = panelUsers?.find((usr) => usr.id === uuid);
          const name = u ? u.name : "";
          const text = `${t("msg_confirm_del")}

\uD83D\uDC64 **${name}**`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `✅ ${t("btn_confirm")}`,
                  callback_data: `sub_del_confirm:${uuid}`
                },
                {
                  text: `❌ ${t("btn_cancel")}`,
                  callback_data: `sub_detail:${uuid}`
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data.startsWith("sub_del_confirm:")) {
          const uuid = data.replace("sub_del_confirm:", "");
          if (isRemotePanel) {
            await remotePanelWriteAction(activePanel, "DELETE", uuid);
          } else if (sysConfig.users) {
            sysConfig.users = sysConfig.users.filter((usr) => usr.id !== uuid);
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          }
          const successText = `✅ ${t("msg_deleted")}`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: t("btn_back"),
                  callback_data: "subs_list:0"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, successText, kb, messageId);
        } else if (data === "sub_add_init") {
          tgState[chatId] = { step: "sub_add_name" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const text = `➕ ${t("msg_enter_name")}`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `❌ ${t("btn_cancel")}`,
                  callback_data: "subs_list:0"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data.startsWith("sub_edit_name_init:")) {
          const uuid = data.replace("sub_edit_name_init:", "");
          tgState[chatId] = { step: `sub_edit_name:${uuid}` };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const text = `✏️ ${t("msg_enter_name")}`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `❌ ${t("btn_cancel")}`,
                  callback_data: `sub_detail:${uuid}`
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data.startsWith("sub_edit_limits_init:")) {
          const uuid = data.replace("sub_edit_limits_init:", "");
          tgState[chatId] = { step: `sub_edit_limits:${uuid}` };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const text = `⚙️ ${t("msg_enter_limits")}`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `♾️ Skip (Unlimited)`,
                  callback_data: `sub_unlimit_cb:${uuid}`
                }
              ],
              [
                {
                  text: `❌ ${t("btn_cancel")}`,
                  callback_data: `sub_detail:${uuid}`
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data.startsWith("sub_unlimit_cb:")) {
          const uuid = data.replace("sub_unlimit_cb:", "");
          if (isRemotePanel) {
            await remotePanelWriteAction(activePanel, "PUT", uuid, {
              key: activePanel.apiKey,
              trafficLimit: 0,
              dailyLimit: 0,
              expiryDays: 0
            });
          } else if (sysConfig.users) {
            const u = sysConfig.users.find((usr) => usr.id === uuid);
            if (u) {
              u.limitTotalReq = null;
              u.limitDailyReq = null;
              u.expiryMs = null;
              await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            }
          }
          const panelUsers = await getPanelUsers();
          const detail = getSubDetail(uuid, panelUsers);
          await sendOrEdit(chatId, detail.text, detail.kb, messageId);
        } else if (data === "sub_add_unlimited_skip") {
          let stateName = "Subscriber";
          try {
            const savedStateRaw = await d1Get(env, "tg_bot_state");
            if (savedStateRaw) {
              const stObj = JSON.parse(savedStateRaw);
              if (stObj[chatId] && stObj[chatId].name) {
                stateName = stObj[chatId].name;
              }
            }
          } catch (e) {}
          const newUuid = crypto.randomUUID();
          if (isRemotePanel) {
            const res = await remotePanelWriteAction(activePanel, "POST", null, { key: activePanel.apiKey, name: stateName });
            if (res.success && res.user) {
              const detail = getSubDetail(res.user.id, [
                res.user
              ]);
              await sendOrEdit(chatId, `✅ ${t("msg_added")}

${detail.text}`, detail.kb, messageId);
            } else {
              await sendOrEdit(chatId, t("msg_panel_error"), {
                inline_keyboard: [
                  [
                    {
                      text: t("btn_main_menu"),
                      callback_data: "main_menu"
                    }
                  ]
                ]
              });
            }
          } else {
            if (!sysConfig.users)
              sysConfig.users = [];
            if (sysConfig.users.length >= 5) {
              await sendOrEdit(chatId, `❌ ${langCode === "fa" ? "سقف مجاز ایجاد ۵ کاربر تکمیل شده است." : "Maximum limit of 5 users reached."}`, {
                inline_keyboard: [
                  [
                    {
                      text: t("btn_main_menu"),
                      callback_data: "main_menu"
                    }
                  ]
                ]
              }, messageId);
              return new Response("OK");
            }
            sysConfig.users.push({
              id: newUuid,
              name: stateName,
              limitTotalReq: null,
              limitDailyReq: null,
              expiryMs: null,
              createdAt: Date.now()
            });
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            const detail = getSubDetail(newUuid);
            await sendOrEdit(chatId, `✅ ${t("msg_added")}

${detail.text}`, detail.kb, messageId);
          }
          tgState[chatId] = null;
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
        } else if (data === "sys_panic_init") {
          const text = `${t("msg_confirm_panic")}`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `\uD83D\uDEA8 YES PANIC \uD83D\uDEA8`,
                  callback_data: "sys_panic_confirm"
                },
                {
                  text: `❌ No, Cancel`,
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data === "sys_panic_confirm") {
          sysConfig.apiRoute = Array.from(crypto.getRandomValues(new Uint8Array(8))).map((b) => b.toString(16).padStart(2, "0")).join("");
          sysConfig.isPaused = true;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          const successText = `${t("msg_panic")}

\uD83D\uDD11 New Secret Path Randomized. All old sessions revoked.`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: t("btn_main_menu"),
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, successText, kb, messageId);
        } else if (data === "sys_dashboard") {
          let users, activeCount, pausedCount, expiredCount, autoDisabledCount;
          if (isRemotePanel) {
            const statsRes = await fetchRemotePanelStats(activePanel);
            if (statsRes.success && statsRes.stats) {
              const s = statsRes.stats;
              users = [];
              activeCount = s.users?.active || 0;
              pausedCount = s.users?.paused || 0;
              expiredCount = s.users?.expired || 0;
              autoDisabledCount = s.users?.autoDisabled || 0;
            } else {
              const panelUsers = await getPanelUsers();
              users = panelUsers || [];
              activeCount = users.filter((u) => !u.isPaused && (!u.expiryMs || Date.now() <= u.expiryMs)).length;
              pausedCount = users.filter((u) => u.isPaused && !u.disabledReason).length;
              expiredCount = users.filter((u) => u.expiryMs && Date.now() > u.expiryMs && !u.isPaused).length;
              autoDisabledCount = users.filter((u) => u.isPaused && u.disabledReason).length;
            }
          } else {
            users = sysConfig.users || [];
            activeCount = users.filter((u) => !u.isPaused && (!u.expiryMs || Date.now() <= u.expiryMs)).length;
            pausedCount = users.filter((u) => u.isPaused && !u.disabledReason).length;
            expiredCount = users.filter((u) => u.expiryMs && Date.now() > u.expiryMs && !u.isPaused).length;
            autoDisabledCount = users.filter((u) => u.isPaused && u.disabledReason).length;
          }
          let dashText = `\uD83D\uDCCA **${t("dashboard")}**
`;
          dashText += `━━━━━━━━━━━━━━━━
`;
          dashText += `\uD83D\uDCCC **${t("current_panel")}**: ${activePanel.isLocal ? "\uD83C\uDFE0" : "\uD83C\uDF10"} ${activePanel.name}
`;
          dashText += `━━━━━━━━━━━━━━━━
`;
          dashText += `\uD83D\uDC65 **${t("dash_total")}**: ${Array.isArray(users) ? users.length : activeCount + pausedCount + expiredCount + autoDisabledCount}
`;
          dashText += `\uD83D\uDFE2 **${t("dash_active")}**: ${activeCount}
`;
          dashText += `⏸️ **${t("dash_paused")}**: ${pausedCount}
`;
          dashText += `\uD83D\uDD34 **${t("dash_expired")}**: ${expiredCount}
`;
          dashText += `\uD83D\uDEAB **${t("dash_auto_disabled")}**: ${autoDisabledCount}
`;
          if (!isRemotePanel) {
            const upSeconds = Math.floor((Date.now() - isolateStartTime) / 1000);
            const dh = Math.floor(upSeconds / 3600);
            const dm = Math.floor(upSeconds % 3600 / 60);
            dashText += `⏱ **${t("uptime")}**: ${dh}h ${dm}m
`;
            dashText += `\uD83D\uDD0C **${t("streams")}**: ${activeConnections}
`;
            dashText += `⚡ **System**: ${sysConfig.isPaused ? t("paused") : t("active")}
`;
          }
          dashText += `━━━━━━━━━━━━━━━━`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: t("btn_main_menu"),
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, dashText, kb, messageId);
        } else if (data === "sys_stats") {
          let users, totalReqs, dailyReqs;
          let totalBytesSum = 0, dailyBytesSum = 0;
          if (isRemotePanel) {
            const statsRes = await fetchRemotePanelStats(activePanel);
            if (statsRes.success && statsRes.stats) {
              const s = statsRes.stats;
              users = [];
              totalReqs = s.traffic?.totalRequests || 0;
              dailyReqs = s.traffic?.dailyRequests || 0;
            } else {
              const panelUsers = await getPanelUsers();
              users = panelUsers || [];
              totalReqs = 0;
              dailyReqs = 0;
            }
          } else {
            users = sysConfig.users || [];
            totalReqs = 0;
            dailyReqs = 0;
            const todayDate = new Date().toISOString().split("T")[0];
            users.forEach((u) => {
              const idClean = u.id.replace(/-/g, "").toLowerCase();
              const sysU = sysUsageCache?.users?.[idClean] || {
                reqs: 0,
                dReqs: 0,
                lastDay: ""
              };
              totalReqs += sysU.reqs || 0;
              if (sysU.lastDay === todayDate)
                dailyReqs += sysU.dReqs || 0;
              totalBytesSum += usageTotalBytes(sysU);
              dailyBytesSum += usageDailyBytes(sysU, todayDate);
            });
          }
          let statsText = `\uD83D\uDCC8 **${t("stats_title")}**
`;
          statsText += `━━━━━━━━━━━━━━━━
`;
          statsText += `\uD83D\uDCCC **${t("current_panel")}**: ${activePanel.isLocal ? "\uD83C\uDFE0" : "\uD83C\uDF10"} ${activePanel.name}
`;
          statsText += `━━━━━━━━━━━━━━━━
`;
          statsText += `\uD83D\uDC65 **${t("dash_total")}**: ${Array.isArray(users) ? users.length : "N/A"}
`;
          statsText += `\uD83D\uDCCA **${t("total_traffic")}**: ${(totalBytesSum / 1073741824).toFixed(2)} GB
`;
          statsText += `\uD83D\uDCC5 **${t("daily_traffic")}**: ${(dailyBytesSum / 1073741824).toFixed(2)} GB
`;
          if (!isRemotePanel) {
            const upSeconds = Math.floor((Date.now() - isolateStartTime) / 1000);
            const dh = Math.floor(upSeconds / 3600);
            const dm = Math.floor(upSeconds % 3600 / 60);
            statsText += `⏱ **${t("tg_uptime")}**: ${dh}h ${dm}m
`;
            statsText += `\uD83D\uDD0C **${t("tg_conns")}**: ${activeConnections}
`;
            statsText += `\uD83D\uDCE6 **${t("tg_version")}**: v${CURRENT_VERSION}
`;
          }
          statsText += `━━━━━━━━━━━━━━━━`;
          if (sysConfig.cfAccountId && sysConfig.cfApiToken) {
            const reqs = await fetchCloudflareUsage(sysConfig.cfAccountId, sysConfig.cfApiToken);
            if (reqs !== null) {
              const pct = (reqs / 1e5 * 100).toFixed(2);
              statsText += `
☁️ **Cloudflare API**: ${reqs}/100000 (${pct}%)`;
            }
          }
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `\uD83D\uDD04 ${t("btn_update_usage")}`,
                  callback_data: "sys_stats"
                }
              ],
              [
                {
                  text: t("btn_main_menu"),
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, statsText, kb, messageId);
        } else if (data === "sys_panel_info") {
          let infoText = `ℹ️ **${t("panel_info")}**
`;
          infoText += `━━━━━━━━━━━━━━━━
`;
          infoText += `\uD83D\uDCCC **${t("current_panel")}**: ${activePanel.isLocal ? "\uD83C\uDFE0" : "\uD83C\uDF10"} ${activePanel.name}
`;
          if (activePanel.isLocal) {
            infoText += `\uD83C\uDF10 **Host**: ${hostName}
`;
            infoText += `\uD83D\uDD11 **API Route**: \`${sysConfig.apiRoute}\`
`;
            infoText += `\uD83D\uDCE1 **Mode**: ${sysConfig.mode || "alpha"}
`;
            infoText += `\uD83D\uDD12 **Ports**: ${sysConfig.socketPorts || "443"}
`;
          } else {
            infoText += `\uD83C\uDF10 **Host**: ${activePanel.host}
`;
            infoText += `\uD83D\uDD11 **API Route**: \`${activePanel.apiRoute}\`
`;
          }
          infoText += `\uD83D\uDCF1 **Version**: ${CURRENT_VERSION}
`;
          infoText += `━━━━━━━━━━━━━━━━`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: t("btn_main_menu"),
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, infoText, kb, messageId);
        } else if (data.startsWith("subs_disabled:")) {
          const panelUsers = await getPanelUsers();
          const users = panelUsers || [];
          const disabledUsers = users.filter((u) => u.isPaused);
          if (disabledUsers.length === 0) {
            const kb = {
              inline_keyboard: [
                [
                  {
                    text: t("btn_main_menu"),
                    callback_data: "main_menu"
                  }
                ]
              ]
            };
            await sendOrEdit(chatId, `\uD83D\uDEAB ${t("msg_no_disabled")}`, kb, messageId);
          } else {
            const page = parseInt(data.replace("subs_disabled:", "")) || 0;
            const itemsPerPage = 5;
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const pageUsers = disabledUsers.slice(start, end);
            let text = `\uD83D\uDEAB **${t("disabled_users")}** (${disabledUsers.length})
━━━━━━━━━━━━━━━━
`;
            const inline_keyboard = [];
            pageUsers.forEach((u) => {
              const reason = u.disabledReason || t("paused");
              text += `\uD83D\uDC64 **${u.name}**
   ${reason}
`;
              inline_keyboard.push([
                {
                  text: `▶️ ${u.name}`,
                  callback_data: `sub_toggle:${u.id}`
                }
              ]);
            });
            const navRow = [];
            if (page > 0)
              navRow.push({
                text: `⬅️ ${t("btn_back")}`,
                callback_data: `subs_disabled:${page - 1}`
              });
            if (end < disabledUsers.length)
              navRow.push({
                text: `${t("btn_next")} ➡️`,
                callback_data: `subs_disabled:${page + 1}`
              });
            if (navRow.length > 0)
              inline_keyboard.push(navRow);
            inline_keyboard.push([
              {
                text: t("btn_main_menu"),
                callback_data: "main_menu"
              }
            ]);
            await sendOrEdit(chatId, text, { inline_keyboard }, messageId);
          }
        } else if (data === "sub_search_init") {
          tgState[chatId] = { step: "sub_search" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const text = `\uD83D\uDD0D ${t("msg_enter_search")}`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `❌ ${t("btn_cancel")}`,
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data.startsWith("sub_reset_traffic:")) {
          const uuid = data.replace("sub_reset_traffic:", "");
          if (isRemotePanel) {
            await remotePanelResetTraffic(activePanel, uuid);
          } else {
            if (!sysUsageCache.users)
              sysUsageCache.users = {};
            const uuidClean = uuid.replace(/-/g, "").toLowerCase();
            if (sysUsageCache.users[uuidClean]) {
              sysUsageCache.users[uuidClean].reqs = 0;
              sysUsageCache.users[uuidClean].dReqs = 0;
              sysUsageCache.users[uuidClean].bytes = 0;
              sysUsageCache.users[uuidClean].dBytes = 0;
            } else {
              sysUsageCache.users[uuidClean] = {
                reqs: 0,
                dReqs: 0,
                bytes: 0,
                dBytes: 0,
                lastDay: new Date().toISOString().split("T")[0]
              };
            }
            await cachedD1Put(env, "sys_usage", JSON.stringify(sysUsageCache));
          }
          const panelUsers = await getPanelUsers();
          const detail = getSubDetail(uuid, panelUsers);
          await sendOrEdit(chatId, `✅ ${t("msg_traffic_reset")}

${detail.text}`, detail.kb, messageId);
        } else if (data.startsWith("sub_extend_init:")) {
          const uuid = data.replace("sub_extend_init:", "");
          tgState[chatId] = { step: `sub_extend_days:${uuid}` };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const text = `\uD83D\uDCC5 ${t("msg_enter_extend_days")}`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `❌ ${t("btn_cancel")}`,
                  callback_data: `sub_detail:${uuid}`
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data.startsWith("sub_edit_notes_init:")) {
          const uuid = data.replace("sub_edit_notes_init:", "");
          tgState[chatId] = { step: `sub_edit_notes:${uuid}` };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const text = `\uD83D\uDCDD ${t("msg_enter_notes")}`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `❌ ${t("btn_cancel")}`,
                  callback_data: `sub_detail:${uuid}`
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data.startsWith("sub_edit_device_init:")) {
          const uuid = data.replace("sub_edit_device_init:", "");
          tgState[chatId] = { step: `sub_edit_device:${uuid}` };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const text = `\uD83D\uDCF1 ${t("msg_enter_device_limit")}`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `♾️ Unlimited`,
                  callback_data: `sub_device_unlimited:${uuid}`
                }
              ],
              [
                {
                  text: `❌ ${t("btn_cancel")}`,
                  callback_data: `sub_detail:${uuid}`
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data.startsWith("sub_device_unlimited:")) {
          const uuid = data.replace("sub_device_unlimited:", "");
          if (isRemotePanel) {
            await remotePanelWriteAction(activePanel, "PUT", uuid, {
              key: activePanel.apiKey,
              maxConfigs: null
            });
          } else if (sysConfig.users) {
            const u = sysConfig.users.find((usr) => usr.id === uuid);
            if (u) {
              u.maxConfigs = null;
              await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            }
          }
          const panelUsers = await getPanelUsers();
          const detail = getSubDetail(uuid, panelUsers);
          await sendOrEdit(chatId, `✅ ${t("status_updated")}`, detail.kb, messageId);
        } else if (data === "get_sub_link") {
          const subUrl = `https://${hostName}/${sysConfig.apiRoute}`;
          await fetchT(`${tgApi}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `\`${subUrl}\``,
              parse_mode: "Markdown"
            })
          });
          answerText = t("sub_link_sent");
        } else if (data === "tg_settings_menu") {
          const modeTxt = sysConfig.mode === "alpha" ? "Alpha (V)" : sysConfig.mode === "beta" ? "Beta (T)" : "Both";
          const portsTxt = sysConfig.socketPorts || "443";
          const passTxt = sysConfig.masterKey || "admin";
          const dnsTxt = sysConfig.resolveIp || "1.1.1.1";
          const relayTxt = sysConfig.backupRelay || "—";
          const tfoTxt = sysConfig.enableOpt1 ? "✅" : "❌";
          const echTxt = sysConfig.enableOpt2 ? "✅" : "❌";
          const pauseTxt = sysConfig.isPaused ? "\uD83D\uDD34 ON" : "\uD83D\uDFE2 OFF";
          const silentTxt = sysConfig.silentAlerts ? "✅" : "❌";
          const autoUpTxt = sysConfig.autoUpdate ? "✅" : "❌";
          const directTxt = sysConfig.enableDirectConfigs ? "✅" : "❌";
          const nat64Txt = sysConfig.nat64Prefix || "—";
          let text = `⚙️ **${t("tg_sys_settings")}**
━━━━━━━━━━━━━━━━
`;
          text += `\uD83D\uDCE1 ${t("tg_proto")}: **${modeTxt}**
`;
          text += `\uD83D\uDD0C ${t("tg_ports")}: \`${portsTxt}\`
`;
          text += `\uD83D\uDD11 ${t("tg_pass")}: \`${passTxt}\`
`;
          text += `\uD83C\uDF10 ${t("tg_dns")}: \`${dnsTxt}\`
`;
          text += `\uD83D\uDD17 ${t("tg_relay")}: \`${relayTxt}\`
`;
          text += `⚡ ${t("tg_tfo")}: ${tfoTxt} | ECH: ${echTxt}
`;
          text += `\uD83D\uDD07 ${t("tg_silent")}: ${silentTxt}
`;
          text += `\uD83D\uDED1 ${t("tg_pause")}: ${pauseTxt}
`;
          text += `\uD83D\uDD04 ${t("tg_auto_update")}: ${autoUpTxt}
`;
          text += `\uD83D\uDD00 ${t("tg_direct")}: ${directTxt}
`;
          text += `\uD83C\uDF10 ${t("tg_nat64")}: \`${nat64Txt}\`
`;
          text += `━━━━━━━━━━━━━━━━`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `\uD83D\uDCE1 ${t("tg_proto")}`,
                  callback_data: "tg_edit_proto"
                },
                {
                  text: `\uD83D\uDD0C ${t("tg_ports")}`,
                  callback_data: "tg_edit_ports"
                }
              ],
              [
                {
                  text: `\uD83D\uDD11 ${t("tg_pass")}`,
                  callback_data: "tg_edit_pass"
                },
                {
                  text: `\uD83C\uDF10 ${t("tg_dns")}`,
                  callback_data: "tg_edit_dns"
                }
              ],
              [
                {
                  text: `\uD83D\uDD17 ${t("tg_relay")}`,
                  callback_data: "tg_edit_relay"
                }
              ],
              [
                {
                  text: `⚡ ${t("tg_tfo")}`,
                  callback_data: "tg_toggle_tfo"
                },
                { text: `ECH`, callback_data: "tg_toggle_ech" }
              ],
              [
                {
                  text: `${t("tg_silent")}`,
                  callback_data: "tg_toggle_silent"
                },
                {
                  text: `${t("tg_pause")}`,
                  callback_data: "tg_toggle_pause2"
                }
              ],
              [
                {
                  text: `\uD83D\uDD04 ${t("tg_auto_update")}`,
                  callback_data: "tg_toggle_auto_update"
                },
                {
                  text: `\uD83D\uDD00 ${t("tg_direct")}`,
                  callback_data: "tg_toggle_direct"
                }
              ],
              [
                {
                  text: `\uD83C\uDF10 ${t("tg_nat64")}`,
                  callback_data: "tg_edit_nat64"
                }
              ],
              [
                {
                  text: t("btn_main_menu"),
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data === "tg_advanced_menu") {
          const cleanTxt = sysConfig.cleanIps ? sysConfig.cleanIps.substring(0, 40) + (sysConfig.cleanIps.length > 40 ? "..." : "") : "—";
          const lpUrls = (sysConfig.linkedPanels || []).map((p) => p.url).filter(Boolean);
          const nodesTxt = lpUrls.length > 0 ? lpUrls.join(", ").substring(0, 40) + (lpUrls.join(", ").length > 40 ? "..." : "") : "—";
          const strategyTxt = sysConfig.nameStrategy || "default";
          const prefixTxt = sysConfig.namePrefix || "Core";
          const maintenanceTxt = sysConfig.maintenanceHost ? sysConfig.maintenanceHost.substring(0, 30) + "..." : "—";
          let text = `\uD83D\uDD27 **${t("tg_adv_settings")}**
━━━━━━━━━━━━━━━━
`;
          text += `\uD83E\uDDF9 ${t("tg_clean_ips")}: \`${cleanTxt}\`
`;
          text += `\uD83D\uDDA5️ ${t("tg_nodes")}: \`${nodesTxt}\`
`;
          text += `\uD83D\uDCDD ${t("tg_strategy")}: \`${strategyTxt}\`
`;
          text += `\uD83C\uDFF7️ ${t("tg_prefix")}: \`${prefixTxt}\`
`;
          text += `\uD83C\uDFAD ${t("tg_maintenance")}: \`${maintenanceTxt}\`
`;
          text += `━━━━━━━━━━━━━━━━`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `\uD83E\uDDF9 ${t("tg_clean_ips")}`,
                  callback_data: "tg_edit_clean_ips"
                }
              ],
              [
                {
                  text: `\uD83D\uDDA5️ ${t("tg_nodes")}`,
                  callback_data: "tg_edit_nodes"
                }
              ],
              [
                {
                  text: `\uD83D\uDCDD ${t("tg_strategy")}`,
                  callback_data: "tg_edit_strategy"
                },
                {
                  text: `\uD83C\uDFF7️ ${t("tg_prefix")}`,
                  callback_data: "tg_edit_prefix"
                }
              ],
              [
                {
                  text: `\uD83C\uDFAD ${t("tg_maintenance")}`,
                  callback_data: "tg_edit_maintenance"
                }
              ],
              [
                {
                  text: `\uD83E\uDD16 ${t("tg_tg_settings")}`,
                  callback_data: "tg_edit_tg_settings"
                }
              ],
              [
                {
                  text: `☁️ ${t("tg_cf_settings")}`,
                  callback_data: "tg_edit_cf_settings"
                }
              ],
              [
                {
                  text: t("btn_main_menu"),
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data === "tg_logs_menu") {
          let logs = [];
          if (env.IOT_DB) {
            const stored = await d1Get(env, "sys_logs");
            if (stored)
              logs = JSON.parse(stored);
          }
          let text = `\uD83D\uDCCB **${t("tg_logs")}**
━━━━━━━━━━━━━━━━
`;
          if (logs.length === 0) {
            text += `ℹ️ ${t("tg_log_empty")}
`;
          } else {
            logs.slice(0, 10).forEach((log, i) => {
              const time = new Date(log.ts).toLocaleString();
              text += `${i + 1}. ${t("tg_log_entry")} **${log.type}**
   ${log.detail}
   \uD83D\uDCC5 ${time}
`;
            });
            if (logs.length > 10)
              text += `
... ${logs.length - 10} more entries`;
          }
          text += `
━━━━━━━━━━━━━━━━`;
          const kb = {
            inline_keyboard: [
              [
                {
                  text: `\uD83D\uDD04 ${t("btn_update_usage")}`,
                  callback_data: "tg_logs_menu"
                }
              ],
              [
                {
                  text: t("btn_main_menu"),
                  callback_data: "main_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, text, kb, messageId);
        } else if (data === "tg_toggle_tfo") {
          sysConfig.enableOpt1 = !sysConfig.enableOpt1;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          answerText = t("tg_saved");
          const menu = getMainMenu(getActivePanel(), isAuthorized);
          await sendOrEdit(chatId, menu.text, menu.kb, messageId);
        } else if (data === "tg_toggle_ech") {
          sysConfig.enableOpt2 = !sysConfig.enableOpt2;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          answerText = t("tg_saved");
          const menu = getMainMenu(getActivePanel(), isAuthorized);
          await sendOrEdit(chatId, menu.text, menu.kb, messageId);
        } else if (data === "tg_toggle_silent") {
          sysConfig.silentAlerts = !sysConfig.silentAlerts;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          answerText = t("tg_saved");
          const menu = getMainMenu(getActivePanel(), isAuthorized);
          await sendOrEdit(chatId, menu.text, menu.kb, messageId);
        } else if (data === "tg_toggle_pause2") {
          sysConfig.isPaused = !sysConfig.isPaused;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          answerText = t("tg_saved");
          const menu = getMainMenu(getActivePanel(), isAuthorized);
          await sendOrEdit(chatId, menu.text, menu.kb, messageId);
        } else if (data === "tg_toggle_auto_update") {
          sysConfig.autoUpdate = !sysConfig.autoUpdate;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          answerText = t("tg_saved");
          await sendOrEdit(chatId, `⚙️ ${t("tg_auto_update")}: ${sysConfig.autoUpdate ? "✅ ON" : "❌ OFF"}`, {
            inline_keyboard: [
              [
                {
                  text: "◀️ " + t("btn_back"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_toggle_direct") {
          sysConfig.enableDirectConfigs = !sysConfig.enableDirectConfigs;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          answerText = t("tg_saved");
          await sendOrEdit(chatId, `\uD83D\uDD00 ${t("tg_direct")}: ${sysConfig.enableDirectConfigs ? "✅ ON" : "❌ OFF"}`, {
            inline_keyboard: [
              [
                {
                  text: "◀️ " + t("btn_back"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_proto") {
          tgState[chatId] = { step: "tg_edit_proto" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const kb = {
            inline_keyboard: [
              [
                {
                  text: "Alpha (V-Core)",
                  callback_data: "tg_set_proto:alpha"
                },
                {
                  text: "Beta (T-Core)",
                  callback_data: "tg_set_proto:beta"
                }
              ],
              [
                {
                  text: "Both",
                  callback_data: "tg_set_proto:both"
                }
              ],
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, `\uD83D\uDCE1 **${t("tg_proto")}**
${t("tg_current_val")}: **${sysConfig.mode}**

${t("tg_new_val")}`, kb, messageId);
        } else if (data.startsWith("tg_set_proto:")) {
          const val = data.replace("tg_set_proto:", "");
          sysConfig.mode = val;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          tgState[chatId] = null;
          answerText = t("tg_saved");
          await sendOrEdit(chatId, `✅ ${t("tg_proto")}: **${val}**`, {
            inline_keyboard: [
              [
                {
                  text: "◀️ " + t("btn_back"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_dns") {
          tgState[chatId] = { step: "tg_edit_dns" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `\uD83C\uDF10 **${t("tg_dns")}**
${t("tg_current_val")}: \`${sysConfig.resolveIp}\`

${t("tg_new_val")}`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_relay") {
          tgState[chatId] = { step: "tg_edit_relay" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `\uD83D\uDD17 **${t("tg_relay")}**
${t("tg_current_val")}: \`${sysConfig.backupRelay || "—"}\`

${t("tg_new_val")}
_send empty to clear_`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_nat64") {
          tgState[chatId] = { step: "tg_edit_nat64" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `\uD83C\uDF10 **${t("tg_nat64")}**
${t("tg_current_val")}: \`${sysConfig.nat64Prefix || "—"}\`

${t("tg_new_val")}
_send empty to clear_`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_maintenance") {
          tgState[chatId] = { step: "tg_edit_maintenance" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `\uD83C\uDFAD **${t("tg_maintenance")}**
${t("tg_current_val")}: \`${sysConfig.maintenanceHost || "—"}\`

${t("tg_new_val")}`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_clean_ips") {
          tgState[chatId] = { step: "tg_edit_clean_ips" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `\uD83E\uDDF9 **${t("tg_clean_ips")}**
${t("tg_current_val")}: \`${sysConfig.cleanIps || "—"}\`

${t("tg_new_val")}
_send empty to clear_`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_advanced_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_nodes") {
          let lpList = (sysConfig.linkedPanels || []).map((p, i) => `${i + 1}. \`${p.url}\``).join(`
`);
          if (!lpList)
            lpList = "—";
          const warningMsg = langCode === "fa" ? `\uD83D\uDDA5️ **${t("tg_nodes")}**

${lpList}

⚠️ لطفاً برای افزودن، حذف یا ویرایش نودهای خارجی به صورت امن همراه با کلید دسترسی (API Key)، از داشبورد تحت وب استفاده کنید.` : `\uD83D\uDDA5️ **${t("tg_nodes")}**

${lpList}

⚠️ Please use the Web Dashboard to add, remove, or edit external nodes securely with API Keys.`;
          await sendOrEdit(chatId, warningMsg, {
            inline_keyboard: [
              [
                {
                  text: "◀️ " + t("btn_back"),
                  callback_data: "tg_advanced_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_strategy") {
          tgState[chatId] = { step: "tg_edit_strategy" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const kb = {
            inline_keyboard: [
              [
                {
                  text: "default",
                  callback_data: "tg_set_strategy:default"
                }
              ],
              [
                {
                  text: "type-user-port",
                  callback_data: "tg_set_strategy:type-user-port"
                }
              ],
              [
                {
                  text: "user-port",
                  callback_data: "tg_set_strategy:user-port"
                }
              ],
              [
                {
                  text: "ip",
                  callback_data: "tg_set_strategy:ip"
                }
              ],
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_advanced_menu"
                }
              ]
            ]
          };
          await sendOrEdit(chatId, `\uD83D\uDCDD **${t("tg_strategy")}**
${t("tg_current_val")}: \`${sysConfig.nameStrategy}\`

_send custom or select:_`, kb, messageId);
        } else if (data.startsWith("tg_set_strategy:")) {
          const val = data.replace("tg_set_strategy:", "");
          sysConfig.nameStrategy = val;
          await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
          tgState[chatId] = null;
          answerText = t("tg_saved");
          await sendOrEdit(chatId, `✅ ${t("tg_strategy")}: **${val}**`, {
            inline_keyboard: [
              [
                {
                  text: "◀️ " + t("btn_back"),
                  callback_data: "tg_advanced_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_prefix") {
          tgState[chatId] = { step: "tg_edit_prefix" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `\uD83C\uDFF7️ **${t("tg_prefix")}**
${t("tg_current_val")}: \`${sysConfig.namePrefix}\`

${t("tg_new_val")}`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_advanced_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_pass") {
          tgState[chatId] = { step: "tg_edit_pass" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `\uD83D\uDD11 **${t("tg_pass")}**
${t("tg_current_val")}: \`${sysConfig.masterKey}\`

${t("tg_new_val")}`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_ports") {
          tgState[chatId] = { step: "tg_edit_ports" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `\uD83D\uDD0C **${t("tg_ports")}**
${t("tg_current_val")}: \`${sysConfig.socketPorts}\`

${t("tg_new_val")}
_comma separated e.g. 443,80_`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_settings_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_tg_settings") {
          tgState[chatId] = { step: "tg_edit_tg_token" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `\uD83E\uDD16 **${t("tg_tg_settings")}**

1️⃣ ${t("tg_current_val")}: \`${sysConfig.tgToken ? "***" + sysConfig.tgToken.slice(-4) : "—"}\`

${t("tg_new_val")}
_send /skip to keep current_`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_advanced_menu"
                }
              ]
            ]
          }, messageId);
        } else if (data === "tg_edit_cf_settings") {
          tgState[chatId] = { step: "tg_edit_cf_acc" };
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          await sendOrEdit(chatId, `☁️ **${t("tg_cf_settings")}**

1️⃣ CF Account ID: \`${sysConfig.cfAccountId || "—"}\`

${t("tg_new_val")}
_send /skip to keep current_`, {
            inline_keyboard: [
              [
                {
                  text: "❌ " + t("btn_cancel"),
                  callback_data: "tg_advanced_menu"
                }
              ]
            ]
          }, messageId);
        }
        ctx?.waitUntil(fetchT(`${tgApi}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: cb.id,
            text: answerText || "Done!"
          })
        }).catch(() => {}));
      }
    } else if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();
      if (isAuthorized) {
        const activePanel = getActivePanel();
        const isRemotePanel = activePanel && !activePanel.isLocal;
        const getPanelUsers = async () => {
          if (isRemotePanel) {
            const res = await fetchRemotePanelUsers(activePanel);
            return res.success ? res.users || [] : null;
          }
          return sysConfig.users || [];
        };
        if (text === "/start") {
          tgState[chatId] = null;
          ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
          const menu = getMainMenu(activePanel, isAuthorized);
          await sendOrEdit(chatId, menu.text, menu.kb);
          return new Response("OK", { status: 200 });
        }
        const state = tgState[chatId];
        if (state) {
          if (!isAuthorized) {
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, t("access_denied"));
            return new Response("OK", { status: 200 });
          }
          if (state.step === "sub_add_name") {
            const name = text;
            tgState[chatId] = {
              step: "sub_add_limits",
              name
            };
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            const msg = `⚙️ **${name}**

${t("msg_enter_limits")}`;
            const kb = {
              inline_keyboard: [
                [
                  {
                    text: `♾️ Skip (Unlimited)`,
                    callback_data: "sub_add_unlimited_skip"
                  }
                ],
                [
                  {
                    text: `❌ ${t("btn_cancel")}`,
                    callback_data: "main_menu"
                  }
                ]
              ]
            };
            await sendOrEdit(chatId, msg, kb);
            return new Response("OK", { status: 200 });
          }
          if (state.step === "sub_add_limits" || state.step === "sub_add_unlimited_skip") {
            const name = state.name;
            let tReq = null;
            let dReq = null;
            let days = null;
            if (state.step !== "sub_add_unlimited_skip" && text !== "0" && text !== "0 0 0") {
              const parts = text.split(/\s+/).map(Number);
              if (parts[0] > 0)
                tReq = parts[0];
              if (parts[1] > 0)
                dReq = parts[1];
              if (parts[2] > 0)
                days = parts[2];
            }
            const newUuid = crypto.randomUUID();
            if (isRemotePanel) {
              const res = await remotePanelWriteAction(activePanel, "POST", null, {
                key: activePanel.apiKey,
                name,
                trafficLimit: tReq ? tReq / 6000 : 0,
                dailyLimit: dReq ? dReq / 6000 : 0,
                expiryDays: days || 0
              });
              if (res.success && res.user) {
                const detail = getSubDetail(res.user.id, [
                  res.user
                ]);
                await sendOrEdit(chatId, `✅ ${t("msg_added")}

${detail.text}`, detail.kb);
              } else {
                await sendOrEdit(chatId, t("msg_panel_error"), {
                  inline_keyboard: [
                    [
                      {
                        text: t("btn_main_menu"),
                        callback_data: "main_menu"
                      }
                    ]
                  ]
                });
              }
            } else {
              if (!sysConfig.users)
                sysConfig.users = [];
              if (sysConfig.users.length >= 5) {
                await sendOrEdit(chatId, `❌ ${langCode === "fa" ? "سقف مجاز ایجاد ۵ کاربر تکمیل شده است." : "Maximum limit of 5 users reached."}`, {
                  inline_keyboard: [
                    [
                      {
                        text: t("btn_main_menu"),
                        callback_data: "main_menu"
                      }
                    ]
                  ]
                });
                return new Response("OK");
              }
              sysConfig.users.push({
                id: newUuid,
                name,
                limitTotalReq: tReq,
                limitDailyReq: dReq,
                expiryMs: days ? Date.now() + days * 86400000 : null,
                createdAt: Date.now()
              });
              await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
              const detail = getSubDetail(newUuid);
              await sendOrEdit(chatId, `✅ ${t("msg_added")}

${detail.text}`, detail.kb);
            }
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            return new Response("OK", { status: 200 });
          }
          if (state.step.startsWith("sub_edit_name:")) {
            const uuid = state.step.replace("sub_edit_name:", "");
            if (isRemotePanel) {
              await remotePanelWriteAction(activePanel, "PUT", uuid, { key: activePanel.apiKey, name: text });
            } else if (sysConfig.users) {
              const u = sysConfig.users.find((usr) => usr.id === uuid);
              if (u) {
                u.name = text;
                await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
              }
            }
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            const panelUsers = await getPanelUsers();
            const detail = getSubDetail(uuid, panelUsers);
            await sendOrEdit(chatId, `✅ Successfully Changed!`, detail.kb);
            return new Response("OK", { status: 200 });
          }
          if (state.step.startsWith("sub_edit_limits:")) {
            const uuid = state.step.replace("sub_edit_limits:", "");
            let tReq = null;
            let dReq = null;
            let days = null;
            const parts = text.split(/\s+/).map(Number);
            if (parts[0] > 0)
              tReq = parts[0];
            if (parts[1] > 0)
              dReq = parts[1];
            if (parts[2] > 0)
              days = parts[2];
            if (isRemotePanel) {
              await remotePanelWriteAction(activePanel, "PUT", uuid, {
                key: activePanel.apiKey,
                trafficLimit: tReq ? tReq / 6000 : 0,
                dailyLimit: dReq ? dReq / 6000 : 0,
                expiryDays: days || 0
              });
            } else if (sysConfig.users) {
              const u = sysConfig.users.find((usr) => usr.id === uuid);
              if (u) {
                u.limitTotalReq = tReq;
                u.limitDailyReq = dReq;
                u.expiryMs = days ? Date.now() + days * 86400000 : null;
                await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
              }
            }
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            const panelUsers = await getPanelUsers();
            const detail = getSubDetail(uuid, panelUsers);
            await sendOrEdit(chatId, `✅ Limits Updated!`, detail.kb);
            return new Response("OK", { status: 200 });
          }
          if (state.step === "sub_search") {
            const query = text.toLowerCase();
            const panelUsers = await getPanelUsers();
            const users = panelUsers || [];
            const results = users.filter((u) => u.name.toLowerCase().includes(query) || u.id.toLowerCase().includes(query));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            if (results.length === 0) {
              const kb = {
                inline_keyboard: [
                  [
                    {
                      text: t("btn_main_menu"),
                      callback_data: "main_menu"
                    }
                  ]
                ]
              };
              await sendOrEdit(chatId, `\uD83D\uDD0D No users found for "${text}"`, kb);
            } else {
              let searchText = `\uD83D\uDD0D **Search Results** (${results.length})
━━━━━━━━━━━━━━━━
`;
              const inline_keyboard = [];
              results.slice(0, 10).forEach((u) => {
                const statusEmoji = u.isPaused ? "⏸️" : u.expiryMs && Date.now() > u.expiryMs ? "\uD83D\uDD34" : "\uD83D\uDFE2";
                searchText += `${statusEmoji} **${u.name}**
`;
                inline_keyboard.push([
                  {
                    text: `\uD83D\uDC64 ${u.name}`,
                    callback_data: `sub_detail:${u.id}`
                  }
                ]);
              });
              inline_keyboard.push([
                {
                  text: t("btn_main_menu"),
                  callback_data: "main_menu"
                }
              ]);
              await sendOrEdit(chatId, searchText, {
                inline_keyboard
              });
            }
            return new Response("OK", { status: 200 });
          }
          if (state.step.startsWith("sub_extend_days:")) {
            const uuid = state.step.replace("sub_extend_days:", "");
            const days = parseInt(text);
            if (isNaN(days) || days <= 0) {
              await sendOrEdit(chatId, t("msg_invalid"));
              return new Response("OK", { status: 200 });
            }
            if (isRemotePanel) {
              await remotePanelWriteAction(activePanel, "PUT", uuid, { key: activePanel.apiKey, expiryDays: days });
            } else if (sysConfig.users) {
              const u = sysConfig.users.find((usr) => usr.id === uuid);
              if (u) {
                if (u.expiryMs) {
                  u.expiryMs += days * 86400000;
                } else {
                  u.expiryMs = Date.now() + days * 86400000;
                }
                if (u.isPaused && u.disabledReason && u.disabledReason.includes("Expiration")) {
                  u.isPaused = false;
                  u.disabledReason = null;
                  u.disabledAt = null;
                }
                await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
              }
            }
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            const panelUsers = await getPanelUsers();
            const detail = getSubDetail(uuid, panelUsers);
            const msg = t("msg_expiry_extended").replace("{days}", days);
            await sendOrEdit(chatId, `✅ ${msg}

${detail.text}`, detail.kb);
            return new Response("OK", { status: 200 });
          }
          if (state.step.startsWith("sub_edit_notes:")) {
            const uuid = state.step.replace("sub_edit_notes:", "");
            if (isRemotePanel) {
              await remotePanelWriteAction(activePanel, "PUT", uuid, { key: activePanel.apiKey, notes: text });
            } else if (sysConfig.users) {
              const u = sysConfig.users.find((usr) => usr.id === uuid);
              if (u) {
                u.notes = text;
                await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
              }
            }
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            const panelUsers = await getPanelUsers();
            const detail = getSubDetail(uuid, panelUsers);
            await sendOrEdit(chatId, `✅ Notes updated!`, detail.kb);
            return new Response("OK", { status: 200 });
          }
          if (state.step.startsWith("sub_edit_device:")) {
            const uuid = state.step.replace("sub_edit_device:", "");
            const limit = parseInt(text);
            if (isNaN(limit) || limit < 0) {
              await sendOrEdit(chatId, t("msg_invalid"));
              return new Response("OK", { status: 200 });
            }
            if (isRemotePanel) {
              await remotePanelWriteAction(activePanel, "PUT", uuid, {
                key: activePanel.apiKey,
                maxConfigs: limit > 0 ? limit : null
              });
            } else if (sysConfig.users) {
              const u = sysConfig.users.find((usr) => usr.id === uuid);
              if (u) {
                u.maxConfigs = limit > 0 ? limit : null;
                await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
              }
            }
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            const panelUsers = await getPanelUsers();
            const detail = getSubDetail(uuid, panelUsers);
            await sendOrEdit(chatId, `✅ ${t("config_limit_updated")}`, detail.kb);
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_dns") {
            sysConfig.resolveIp = text;
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_dns")}: \`${text}\``, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_settings_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_relay") {
            sysConfig.backupRelay = text || "";
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_relay")}: \`${text || "—"}\``, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_settings_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_nat64") {
            sysConfig.nat64Prefix = text || "";
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_nat64")}: \`${text || "—"}\``, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_settings_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_maintenance") {
            sysConfig.maintenanceHost = text;
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_maintenance")}: \`${text}\``, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_clean_ips") {
            sysConfig.cleanIps = text || "";
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_clean_ips")}: \`${text || "—"}\``, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_prefix") {
            sysConfig.namePrefix = text;
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_prefix")}: \`${text}\``, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_pass") {
            sysConfig.masterKey = text;
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_pass")}: \`${text}\``, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_settings_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_strategy") {
            sysConfig.nameStrategy = text;
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_strategy")}: \`${text}\``, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_tg_token") {
            if (text !== "/skip")
              sysConfig.tgToken = text;
            tgState[chatId] = { step: "tg_edit_tg_chat" };
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `2️⃣ Chat ID: \`${sysConfig.tgChatId || "—"}\`

${t("tg_new_val")}
_send /skip to keep current_`, {
              inline_keyboard: [
                [
                  {
                    text: "❌ " + t("btn_cancel"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_tg_chat") {
            if (text !== "/skip")
              sysConfig.tgChatId = text;
            tgState[chatId] = { step: "tg_edit_tg_admin" };
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `3️⃣ Admin ID: \`${sysConfig.tgAdminId || "—"}\`

${t("tg_new_val")}
_send /skip to keep current_`, {
              inline_keyboard: [
                [
                  {
                    text: "❌ " + t("btn_cancel"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_tg_admin") {
            if (text !== "/skip")
              sysConfig.tgAdminId = text;
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_tg_settings")} saved!`, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_cf_acc") {
            if (text !== "/skip")
              sysConfig.cfAccountId = text;
            tgState[chatId] = { step: "tg_edit_cf_token" };
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `2️⃣ CF API Token: \`${sysConfig.cfApiToken ? "***" + sysConfig.cfApiToken.slice(-4) : "—"}\`

${t("tg_new_val")}
_send /skip to keep current_`, {
              inline_keyboard: [
                [
                  {
                    text: "❌ " + t("btn_cancel"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_cf_token") {
            if (text !== "/skip")
              sysConfig.cfApiToken = text;
            tgState[chatId] = { step: "tg_edit_cf_worker" };
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `3️⃣ CF Worker Name: \`${sysConfig.cfWorkerName || "—"}\`

${t("tg_new_val")}
_send /skip to keep current_`, {
              inline_keyboard: [
                [
                  {
                    text: "❌ " + t("btn_cancel"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_cf_worker") {
            if (text !== "/skip")
              sysConfig.cfWorkerName = text;
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_cf_settings")} saved!`, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_advanced_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
          if (state.step === "tg_edit_ports") {
            sysConfig.socketPorts = text;
            await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
            tgState[chatId] = null;
            ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)).catch(() => {}));
            await sendOrEdit(chatId, `✅ ${t("tg_ports")}: \`${text}\``, {
              inline_keyboard: [
                [
                  {
                    text: "◀️ " + t("btn_back"),
                    callback_data: "tg_settings_menu"
                  }
                ]
              ]
            });
            return new Response("OK", { status: 200 });
          }
        }
        const menu = getMainMenu(activePanel, isAuthorized);
        await sendOrEdit(chatId, menu.text, menu.kb);
      } else {
        if (text === "/start") {
          const userHint = langCode === "fa" ? "لطفاً لینک اشتراک یا شناسه کاربری خود را ارسال کنید تا اطلاعات اشتراکتان نمایش داده شود." : "Please send your subscription link or User ID to view your subscription info.";
          await sendOrEdit(chatId, userHint);
          return new Response("OK", { status: 200 });
        }
        let lookupId = text.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
        const subParamMatch = text.match(/[?&]sub=([^&]+)/);
        if (subParamMatch)
          lookupId = decodeURIComponent(subParamMatch[1]);
        if (!lookupId || lookupId.length < 3) {
          const userHint = langCode === "fa" ? "لطفاً لینک اشتراک یا شناسه کاربری معتبر ارسال کنید." : "Please send a valid subscription link or User ID.";
          await sendOrEdit(chatId, userHint);
          return new Response("OK", { status: 200 });
        }
        const users = sysConfig.users || [];
        const matchedUser = users.find((u) => u.id === lookupId || u.id.replace(/-/g, "").toLowerCase() === lookupId.replace(/-/g, "").toLowerCase() || u.name.toLowerCase() === lookupId.toLowerCase());
        if (matchedUser) {
          const detail = getSubDetail(matchedUser.id);
          await sendOrEdit(chatId, detail.text, detail.kb);
        } else {
          const notFound = langCode === "fa" ? "کاربری با این شناسه یافت نشد." : "No user found with this ID.";
          await sendOrEdit(chatId, notFound);
        }
      }
    }
    return new Response("OK", { status: 200 });
  } catch (e) {
    return new Response("OK", { status: 200 });
  }
}

// src/api/auth.js
async function handleAuth(request, hostName, ctx, env) {
  try {
    const data = await request.json();
    const ip = request.headers.get("cf-connecting-ip") || "Unknown";
    if (authBlocked(ip)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Too many attempts, try later"
      }), { status: 429 });
    }
    const loginKey = data.key || "";
    const isKeyAuth = loginKey === sysConfig.masterKey || isPanelApiKey(loginKey);
    if (isKeyAuth) {
      authClear(ip);
      if (isPanelApiKey(loginKey)) {
        const apiKeyEntry = (sysConfig.panelApiKeys || []).find((k) => k.key === loginKey);
        if (apiKeyEntry)
          apiKeyEntry.lastUsed = Date.now();
      }
      ctx?.waitUntil(logActivity(env, "Auth Success", `Successful panel login from ${ip} (via ${isPanelApiKey(loginKey) ? "API Key" : "Master Key"})`));
      if (!sysConfig.silentAlerts && ctx)
        ctx.waitUntil(sendTelegramMessage(request, "ورود به پنل (موفق)", hostName));
      if (sysConfig.tgAdminId && env.IOT_DB) {
        const loginSignal = {
          name: sysConfig.name || hostName,
          host: hostName,
          apiRoute: sysConfig.apiRoute,
          masterKey: sysConfig.masterKey,
          isLocal: true,
          ts: Date.now()
        };
        ctx?.waitUntil(d1Put(env, "tg_panel_login", JSON.stringify(loginSignal)).catch(() => {}));
      }
      if (sysConfig.hubPanelUrl && sysConfig.hubPanelUrl.trim() && sysConfig.tgAdminId) {
        try {
          let hubUrl = sysConfig.hubPanelUrl.trim();
          if (!hubUrl.startsWith("http"))
            hubUrl = "https://" + hubUrl;
          const signalPayload = {
            signal: "panel_login",
            panelName: sysConfig.name || hostName,
            panelHost: hostName,
            panelApiRoute: sysConfig.apiRoute,
            tgAdminId: sysConfig.tgAdminId,
            ts: Date.now()
          };
          ctx?.waitUntil(fetchT(`${hubUrl}/${encodeURI(sysConfig.apiRoute)}/tg/sync_panel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signalPayload)
          }).catch(() => {}));
        } catch (e) {}
      }
      const netInfo = {
        ip,
        colo: request.cf?.colo || "Unknown",
        loc: (request.cf?.city || "Unknown") + ", " + (request.cf?.country || "Unknown")
      };
      let usageData = {};
      for (let [k, v] of uuidUsage.entries())
        usageData[k] = { ...v, connects: activeConns.get(k) || 0 };
      let baseHost = hostName;
      let protocol = "https";
      if (sysConfig.customPanelUrl && sysConfig.customPanelUrl.trim()) {
        let customUrlStr = sysConfig.customPanelUrl.trim();
        if (!customUrlStr.startsWith("http://") && !customUrlStr.startsWith("https://")) {
          customUrlStr = "https://" + customUrlStr;
        }
        try {
          const customUrl = new URL(customUrlStr);
          baseHost = customUrl.host;
          protocol = customUrl.protocol.replace(":", "");
        } catch (e) {}
      }
      return new Response(JSON.stringify({
        success: true,
        config: isPanelApiKey(loginKey) ? {
          ...sysConfig,
          masterKey: "[PROTECTED]",
          panelApiKeys: "[PROTECTED]",
          cfApiToken: "[PROTECTED]",
          cfAccountId: "[PROTECTED]",
          cfWorkerName: "[PROTECTED]",
          tgToken: "[PROTECTED]",
          tgChatId: "[PROTECTED]",
          tgAdminId: "[PROTECTED]",
          syncApiKey: "[PROTECTED]"
        } : sysConfig,
        deviceId: activeDeviceId,
        network: netInfo,
        usage: usageData,
        sysUsage: sysUsageCache && sysUsageCache.users ? sysUsageCache.users : {},
        version: CURRENT_VERSION,
        profiles: getAllProfiles().map((p) => {
          let subSuffix = p.name === "Default" ? "" : "?sub=" + encodeURIComponent(p.name);
          return {
            name: p.name,
            id: p.id,
            sync: `${protocol}://${baseHost}/${sysConfig.apiRoute}${subSuffix}`
          };
        })
      }), { status: 200 });
    }
    ctx?.waitUntil(logActivity(env, "Auth Failed", `Failed login attempt from ${ip}`));
    authFail(ip);
    if (ctx)
      ctx.waitUntil(sendTelegramMessage(request, "تلاش ناموفق ورود به پنل!", hostName));
    return new Response(JSON.stringify({ success: false }), {
      status: 401
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false }), {
      status: 400
    });
  }
}

// src/api/update.js
async function handleUpdateApi(request, env, ctx) {
  try {
    if (request.method !== "POST")
      return new Response("405", { status: 405 });
    const data = await request.json();
    const deployKey = extractAuthKey(request, data);
    const deployGateIp = request.headers.get("cf-connecting-ip") || "Unknown";
    if (authBlocked(deployGateIp)) {
      return new Response(JSON.stringify({ success: false, error: "Too many attempts" }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (deployKey !== sysConfig.masterKey) {
      authFail(deployGateIp);
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const accountId = sysConfig.cfAccountId;
    const apiToken = sysConfig.cfApiToken;
    const workerName = sysConfig.cfWorkerName;
    const repo = (sysConfig.githubRepo || "itsyebekhe/nahan").replace(/https?:\/\/github\.com\//, "").trim();
    if (data.action === "check") {
      let remoteVer = null;
      try {
        const res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/version`);
        if (res.ok) {
          const txt = (await res.text()).trim();
          if (txt && txt.length <= 15)
            remoteVer = txt;
        }
      } catch (e) {}
      if (!remoteVer) {
        try {
          let res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/_worker.encode.js`);
          if (!res.ok) {
            res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/_worker.encoded.js`);
            if (!res.ok) {
              res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/_worker.js`);
            }
          }
          if (res.ok) {
            const code = await res.text();
            const match = code.match(/const\s+CURRENT_VERSION\s*=\s*["']([^"']+)["']/);
            if (match)
              remoteVer = match[1];
          }
        } catch (e) {}
      }
      if (!remoteVer) {
        return new Response(JSON.stringify({
          success: false,
          error: "Could not fetch remote version"
        }), {
          status: 502,
          headers: { "Content-Type": "application/json" }
        });
      }
      const hasCredentials = !!(accountId && apiToken && workerName);
      return new Response(JSON.stringify({
        success: true,
        current: CURRENT_VERSION,
        latest: remoteVer,
        updateAvailable: cmpVersions(CURRENT_VERSION, remoteVer) < 0,
        canDeploy: hasCredentials
      }), { headers: { "Content-Type": "application/json" } });
    }
    if (data.action === "deploy") {
      if (sysConfig.allowRemoteDeploy !== true) {
        return new Response(JSON.stringify({
          success: false,
          error: "Remote deploy is disabled. Enable allowRemoteDeploy in config to use it."
        }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (!accountId || !apiToken || !workerName) {
        return new Response(JSON.stringify({
          success: false,
          error: "CF credentials not configured"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      let newVersion = data.version || null;
      let finalCodeToDeploy = data.code;
      if (!finalCodeToDeploy) {
        try {
          let res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/_worker.encode.js`);
          if (!res.ok) {
            res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/_worker.encoded.js`);
            if (!res.ok) {
              res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/_worker.js`);
            }
          }
          if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
          finalCodeToDeploy = await res.text();
        } catch (e) {
          return new Response(JSON.stringify({
            success: false,
            error: "Failed to fetch from GitHub: " + e.message
          }), {
            status: 502,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      if (!newVersion) {
        const versionMatch = finalCodeToDeploy.match(/const\s+CURRENT_VERSION\s*=\s*["']([^"']+)["']/);
        if (versionMatch) {
          newVersion = versionMatch[1];
        } else {
          try {
            const vRes = await fetchT(`https://raw.githubusercontent.com/${repo}/main/version`);
            if (vRes.ok) {
              newVersion = (await vRes.text()).trim();
            }
          } catch (e) {}
        }
      }
      if (!newVersion)
        newVersion = CURRENT_VERSION;
      if (cmpVersions(CURRENT_VERSION, newVersion) >= 0 && !data.force && !data.code) {
        return new Response(JSON.stringify({
          success: false,
          error: "Remote version is not newer. Click force redeploy to overwrite."
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const deployRes = await deployWorkerToCloudflare(accountId, apiToken, workerName, finalCodeToDeploy);
      const deployResult = await deployRes.json();
      if (deployResult.success) {
        ctx?.waitUntil(logActivity(env, "Panel Updated", `v${CURRENT_VERSION} → v${newVersion} (encoded)`).catch(() => {}));
        if (sysConfig.linkedPanels && Array.isArray(sysConfig.linkedPanels)) {
          for (const p of sysConfig.linkedPanels) {
            if (p && p.url && p.apiKey) {
              let cleanUrl = p.url.trim();
              if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
                cleanUrl = "https://" + cleanUrl;
              }
              try {
                const parsed = new URL(cleanUrl);
                const targetUrl = `${parsed.protocol}//${parsed.host}/${encodeURI(sysConfig.apiRoute)}/api/update`;
                ctx?.waitUntil(fetchT(targetUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    key: p.apiKey,
                    action: "deploy",
                    code: finalCodeToDeploy,
                    force: true
                  }),
                  signal: AbortSignal.timeout(15000)
                }).then(async (r) => {
                  const resJson = await r.json();
                  await logActivity(env, "Node Update Success", `Node ${p.url} update response: ${JSON.stringify(resJson)}`);
                }).catch((e) => {
                  logActivity(env, "Node Update Failed", `Node ${p.url} update failed: ${e.message}`);
                }));
              } catch (err) {
                console.error(`Failed to trigger update on node ${p.url}:`, err);
              }
            }
          }
        }
        if (sysConfig.tgToken && (sysConfig.tgAdminId || sysConfig.tgChatId)) {
          const tgMsg = `\uD83D\uDD04 <b>Panel Updated</b>

\uD83D\uDCE6 v${CURRENT_VERSION} → v${newVersion}
\uD83C\uDF10 <b>Format:</b> encoded`;
          const notifyChatId = sysConfig.tgAdminId || sysConfig.tgChatId;
          ctx?.waitUntil(fetchT(`https://api.telegram.org/bot${sysConfig.tgToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: notifyChatId,
              text: tgMsg,
              parse_mode: "HTML"
            })
          }).catch(() => {}));
        }
        return new Response(JSON.stringify({
          success: true,
          message: `Updated to v${newVersion}`,
          newVersion
        }), { headers: { "Content-Type": "application/json" } });
      } else {
        const errMsg = deployResult.errors?.[0]?.message || "Unknown API error";
        return new Response(JSON.stringify({
          success: false,
          error: "Cloudflare API: " + errMsg
        }), {
          status: 502,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    return new Response(JSON.stringify({ success: false, error: "Invalid action" }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// src/api/keys.js
async function handleApiKeys(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const method = request.method;
    const authKey = extractAuthKey(request, null);
    const keysGateIp = request.headers.get("cf-connecting-ip") || "Unknown";
    if (authBlocked(keysGateIp)) {
      return new Response(JSON.stringify({ success: false, error: "Too many attempts" }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (authKey !== sysConfig.masterKey) {
      authFail(keysGateIp);
      return new Response(JSON.stringify({
        success: false,
        error: "Only master key can manage API keys"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "GET") {
      const keys = (sysConfig.panelApiKeys || []).map((k) => ({
        id: k.id,
        name: k.name,
        keyPreview: k.key.slice(0, 8) + "..." + k.key.slice(-4),
        createdAt: k.createdAt,
        lastUsed: k.lastUsed
      }));
      return new Response(JSON.stringify({ success: true, keys }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "POST") {
      const body = await request.json();
      if (body.action === "create") {
        if (!sysConfig.panelApiKeys)
          sysConfig.panelApiKeys = [];
        if (sysConfig.panelApiKeys.length >= 10) {
          return new Response(JSON.stringify({
            success: false,
            error: "Maximum 10 API keys allowed"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const newKey = generateApiKey(body.name);
        sysConfig.panelApiKeys.push(newKey);
        await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
        ctx?.waitUntil(logActivity(env, "API Key Created", `Key "${newKey.name}" created`).catch(() => {}));
        return new Response(JSON.stringify({ success: true, key: newKey }), {
          status: 201,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (body.action === "revoke") {
        if (!body.id)
          return new Response(JSON.stringify({
            success: false,
            error: "ID required"
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        const idx = (sysConfig.panelApiKeys || []).findIndex((k) => k.id === body.id);
        if (idx === -1)
          return new Response(JSON.stringify({
            success: false,
            error: "Key not found"
          }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
          });
        const revoked = sysConfig.panelApiKeys.splice(idx, 1)[0];
        await cachedD1Put(env, "sys_config", JSON.stringify(sysConfig));
        ctx?.waitUntil(logActivity(env, "API Key Revoked", `Key "${revoked.name}" revoked`).catch(() => {}));
        return new Response(JSON.stringify({ success: true, revoked: revoked.id }), { headers: { "Content-Type": "application/json" } });
      }
    }
    return new Response(JSON.stringify({ success: false, error: "Invalid request" }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// src/converters/fragment.js
function parseSegRangeList(s, maxItems) {
  try {
    const items = String(s || "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, maxItems);
    if (!items.length)
      return null;
    for (const it of items) {
      if (!/^\d{1,5}(-\d{1,5})?$/.test(it))
        return null;
    }
    return items;
  } catch (e) {
    return null;
  }
}
function resolveSegFragment(p) {
  try {
    if (!p)
      return null;
    const mode = String(p.segMode || "off").toLowerCase();
    if (mode === "builder") {
      const packets = String(p.segPackets || "").trim().slice(0, 32);
      if (!packets)
        return null;
      if (packets !== "tlshello" && !/^\d{1,3}-\d{1,3}$/.test(packets))
        return null;
      const lengths = parseSegRangeList(p.segLengths, 8);
      const delays = parseSegRangeList(p.segDelays, 8);
      const maxSplit = String(p.segMaxSplit ?? "").trim();
      if (!lengths || !delays)
        return null;
      if (!/^\d{1,6}$/.test(maxSplit))
        return null;
      return {
        kind: "fm",
        value: {
          tcp: [
            {
              type: "fragment",
              settings: { packets, lengths, delays, maxSplit }
            }
          ]
        }
      };
    }
    if (mode === "manual") {
      const raw = String(p.segManual || "").trim().slice(0, 4000);
      if (!raw)
        return null;
      if (raw.charAt(0) === "{") {
        let obj = null;
        try {
          obj = JSON.parse(raw);
        } catch (e) {
          return null;
        }
        if (!obj || typeof obj !== "object" || !Array.isArray(obj.tcp) || obj.tcp.length === 0)
          return null;
        return { kind: "fm", value: { tcp: obj.tcp } };
      }
      if (/^\d{1,5}-\d{1,5},\d{1,5}-\d{1,5},(tlshello|\d{1,3}-\d{1,3})$/.test(raw))
        return { kind: "classic", value: raw };
      return null;
    }
    if ((!p || !p.segMode || p.segMode === "off") && sysConfig.optAutoApply && sysConfig.optFm) {
      try {
        let obj = typeof sysConfig.optFm === "object" ? sysConfig.optFm : JSON.parse(sysConfig.optFm);
        return { kind: "fm", value: obj };
      } catch (e) {}
    }
    return null;
  } catch (e) {
    return null;
  }
}
function buildSegFragmentParam(p) {
  try {
    const r = resolveSegFragment(p);
    if (!r)
      return "";
    if (r.kind === "fm")
      return "&fm=" + encodeURIComponent(JSON.stringify(r.value));
    return "&fragment=" + encodeURIComponent(String(r.value));
  } catch (e) {
    return "";
  }
}
function getSegStreamExtra(p) {
  try {
    const r = resolveSegFragment(p);
    if (!r)
      return {};
    if (r.kind === "fm")
      return { finalmask: r.value };
    const m = String(r.value).split(",");
    return {
      fragment: { packets: m[2], length: m[0], interval: m[1] }
    };
  } catch (e) {
    return {};
  }
}
function buildTlsMaskParam(p) {
  try {
    let v = p && p.tlsMask ? String(p.tlsMask).trim().slice(0, 2000) : "";
    if (!v && sysConfig.optAutoApply && sysConfig.optCs) {
      v = String(sysConfig.optCs).trim().slice(0, 2000);
    }
    if (!v)
      return "";
    return "&cs=" + encodeURIComponent(v);
  } catch (e) {
    return "";
  }
}
function isSegEnabled(p) {
  try {
    if (!p)
      return false;
    const mode = String(p.segMode || "off").toLowerCase();
    if (mode !== "builder" && mode !== "manual")
      return false;
    return buildSegFragmentParam(p) !== "";
  } catch (e) {
    return false;
  }
}
var k_pxs = "pro" + "xies";
var k_px_gps = "pro" + "xy-gro" + "ups";
var k_obds = "out" + "bounds";
var k_vl_mode = "vl" + "ess";
var k_tr_mode = "tro" + "jan";

// src/converters/upstream.js
function parseEndpointUri(uri) {
  if (!uri || typeof uri !== "string")
    return null;
  uri = uri.trim();
  const scheme = `${getAlpha2()}://`;
  if (!uri.startsWith(scheme))
    return null;
  try {
    let rest = uri.slice(scheme.length);
    let fragment = "";
    let hashIdx = rest.indexOf("#");
    if (hashIdx !== -1) {
      fragment = decodeURIComponent(rest.slice(hashIdx + 1));
      rest = rest.slice(0, hashIdx);
    }
    let queryStr = "";
    let qIdx = rest.indexOf("?");
    if (qIdx !== -1) {
      queryStr = rest.slice(qIdx + 1);
      rest = rest.slice(0, qIdx);
    }
    let params = {};
    if (queryStr) {
      queryStr.split("&").forEach((pair) => {
        let [k, v] = pair.split("=");
        if (k)
          params[decodeURIComponent(k)] = decodeURIComponent(v || "");
      });
    }
    let atIdx = rest.indexOf("@");
    if (atIdx === -1)
      return null;
    let uuid = rest.slice(0, atIdx);
    let hostPort = rest.slice(atIdx + 1);
    let server, port;
    if (hostPort.startsWith("[")) {
      let bracketEnd = hostPort.indexOf("]");
      server = hostPort.slice(1, bracketEnd);
      port = parseInt(hostPort.slice(bracketEnd + 2)) || 443;
    } else {
      let colonIdx = hostPort.lastIndexOf(":");
      server = hostPort.slice(0, colonIdx);
      port = parseInt(hostPort.slice(colonIdx + 1)) || 443;
    }
    return {
      uuid,
      server,
      port,
      name: fragment || "Upstream",
      security: params.security || "tls",
      sni: params.sni || params.servername || server,
      host: params.host || server,
      path: params.path || "/",
      type: params.type || "ws",
      fp: params.fp || params["client-fingerprint"] || "random",
      allowInsecure: params.allowInsecure === "1" || params.allowInsecure === "true",
      pbk: params.pbk || "",
      sid: params.sid || "",
      flow: params.flow || "",
      encryption: params.encryption || "none",
      alpn: params.alpn || "",
      mode: params.mode || "",
      raw: uri
    };
  } catch (e) {
    return null;
  }
}
var parseVlessUri = parseEndpointUri;
function upstreamToBoxRoute(parsed) {
  if (!parsed)
    return null;
  let ob = {
    type: getAlpha2(),
    tag: "\uD83D\uDD17 " + parsed.name,
    server: parsed.server,
    server_port: parsed.port,
    uuid: parsed.uuid,
    packet_encoding: "xudp",
    network: parsed.type || "ws",
    tls: {
      enabled: parsed.security === "tls" || parsed.security === "reality",
      server_name: parsed.sni,
      insecure: parsed.allowInsecure,
      utls: { enabled: true, fingerprint: parsed.fp || "randomized" }
    },
    transport: {
      type: parsed.type || "ws",
      path: parsed.path || "/",
      headers: { Host: parsed.host || parsed.sni }
    }
  };
  if (parsed.flow)
    ob.flow = parsed.flow;
  if (parsed.pbk) {
    ob.tls.reality = {
      enabled: true,
      public_key: parsed.pbk,
      short_id: parsed.sid || ""
    };
  }
  if (parsed.alpn)
    ob.tls.alpn = parsed.alpn.split(",");
  return ob;
}
var upstreamToSingboxOb = upstreamToBoxRoute;
function upstreamToEdgeRoute(parsed) {
  if (!parsed)
    return null;
  let proxy = {
    name: parsed.name,
    type: getAlpha2(),
    server: parsed.server,
    port: parsed.port,
    uuid: parsed.uuid,
    udp: true,
    tls: parsed.security === "tls" || parsed.security === "reality",
    servername: parsed.sni,
    "client-fingerprint": parsed.fp || "random",
    "skip-cert-verify": parsed.allowInsecure,
    network: parsed.type || "ws",
    "ws-opts": {
      path: parsed.path || "/",
      headers: { Host: parsed.host || parsed.sni }
    }
  };
  if (parsed.flow)
    proxy.flow = parsed.flow;
  if (parsed.pbk) {
    proxy["reality-opts"] = {
      "public-key": parsed.pbk,
      "short-id": parsed.sid || ""
    };
  }
  if (parsed.alpn)
    proxy.alpn = parsed.alpn.split(",");
  return proxy;
}
var upstreamToClashProxy = upstreamToEdgeRoute;
function upstreamToCoreRoute(parsed) {
  if (!parsed)
    return null;
  let ob = {
    tag: "\uD83D\uDD17 " + parsed.name,
    protocol: getAlpha2(),
    settings: {
      vnext: [
        {
          address: parsed.server,
          port: parsed.port,
          users: [
            {
              id: parsed.uuid,
              encryption: parsed.encryption || "none",
              flow: parsed.flow || ""
            }
          ]
        }
      ]
    },
    streamSettings: {
      network: parsed.type || "ws",
      security: parsed.security === "tls" || parsed.security === "reality" ? "tls" : "none",
      tlsSettings: parsed.security === "tls" ? {
        serverName: parsed.sni,
        allowInsecure: parsed.allowInsecure,
        fingerprint: parsed.fp || "random"
      } : undefined,
      realitySettings: parsed.security === "reality" ? {
        serverName: parsed.sni,
        publicKey: parsed.pbk || "",
        shortId: parsed.sid || "",
        fingerprint: parsed.fp || "random"
      } : undefined,
      wsSettings: {
        path: parsed.path || "/",
        headers: { Host: parsed.host || parsed.sni }
      }
    }
  };
  return ob;
}
var upstreamToV2RayOb = upstreamToCoreRoute;

// src/converters/sub.js
var k_pxs2 = "pro" + "xies";
var k_px_gps2 = "pro" + "xy-gro" + "ups";
var k_obds2 = "out" + "bounds";
var k_vl_mode2 = getAlpha2();
var k_tr_mode2 = getBeta();
var VTemplate = null;
async function fetchTemplates(env) {
  const repo = sysConfig.githubRepo || "itsyebekhe/nahan";
  if (!clashTemplate) {
    try {
      let res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/clash.yml`);
      if (res.ok)
        setEdgeTemplate(await res.text());
    } catch (e) {}
  }
  if (!singboxTemplate) {
    try {
      let res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/singbox.json`);
      if (res.ok)
        setBoxTemplate(await res.json());
    } catch (e) {}
  }
  if (!VTemplate) {
    try {
      let res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/v.json`);
      if (res.ok) {
        VTemplate = await res.json();
        setCoreTemplate(VTemplate);
      }
    } catch (e) {}
  }
}
function getCustomRouting() {
  let cr = sysConfig.customRouting || "";
  let lines = cr.split(`
`).map((l) => l.trim()).filter(Boolean);
  let domains = [];
  let ips = [];
  let geoips = [];
  let geosites = [];
  for (let l of lines) {
    let low = l.toLowerCase();
    if (low.startsWith("geoip:")) {
      geoips.push(l.substring(6).trim().toUpperCase());
    } else if (low.startsWith("geosite:")) {
      geosites.push(l.substring(8).trim().toLowerCase());
    } else if (l.match(/^[0-9\.\/:]+$/)) {
      ips.push(l);
    } else {
      domains.push(l);
    }
  }
  return { domains, ips, geoips, geosites };
}
async function buildUriProfile(hostName, targetSub = null, allowInsecure = false) {
  let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
  let reqPath = encodeURI(`/${sysConfig.apiRoute}`);
  let lines = [];
  let profiles = getAllProfiles(targetSub);
  let allHostNames = [
    ...new Set(profiles.flatMap((p) => getProfileHostNames2(hostName, p)))
  ];
  await preloadIpFlags2(profiles, allHostNames);
  let fakeNames = getFakeConfigNames2(targetSub);
  fakeNames.forEach((name) => {
    lines.push(`${getBeta()}://00000000-0000-0000-0000-000000000000@127.0.0.1:1080?security=none#${encodeURIComponent(name)}`);
  });
  profiles.forEach((p) => {
    let pips = getEffectivePips(p);
    let effectiveMode = p.userMode || sysConfig.mode;
    let effectivePorts = p.userPorts ? p.userPorts.split(",").map((s) => s.trim()).filter(Boolean) : ports;
    let maxCfg = p.maxConfigs || null;
    let configIndex = 0;
    let profileHostNames = getProfileHostNames2(hostName, p);
    profileHostNames.forEach((hName) => {
      let ipEntries = getCleanIpsWithNames2(hName, p.cleanIp);
      let allIps = ipEntries.map((e) => e.ip);
      let ips = calcEffectiveIps2(allIps, maxCfg, effectiveMode, effectivePorts, pips.length);
      let ipNameMap = {};
      ipEntries.forEach((e) => {
        ipNameMap[e.ip] = e.name;
      });
      effectivePorts.forEach((port) => {
        let sec = getTransportParams2(port);
        let activeFp = sysConfig.optAutoApply && sysConfig.optFp ? sysConfig.optFp : sysConfig.agent;
        let extBase = `encryption=none&security=${sec}&sni=${hName}&fp=${activeFp}&type=ws&host=${hName}&path=${reqPath}`;
        if (sysConfig.enableOpt2)
          extBase += `&pbk=enabled`;
        extBase += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
        try {
          extBase += buildSegFragmentParam(p);
          extBase += buildTlsMaskParam(p);
          if (sysConfig.optAutoApply && sysConfig.optMode === "ech" && sysConfig.optEchList) {
            let firstEch = String(sysConfig.optEchList).split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean)[0];
            if (firstEch)
              extBase += "&ech=" + encodeURIComponent(firstEch);
          }
        } catch (e) {}
        ips.forEach((ip) => {
          let _pips = pips.length > 0 ? pips : [null];
          _pips.forEach((selectedProxyIp) => {
            let ipName = ipNameMap[ip] || "";
            let vName = getConfigName2("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName);
            let tName = getConfigName2("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName);
            if (effectiveMode === "alpha" || effectiveMode === "both") {
              let configUuid = generateConfigUuid2(p.id, configIndex);
              registerConfigEntry(configUuid, p.id, selectedProxyIp || "");
              lines.push(`${getAlpha2()}://${configUuid}@${ip}:${port}?${extBase}#${vName}`);
            }
            if (effectiveMode === "beta" || effectiveMode === "both") {
              let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
              let payloadTr = {
                junk: randomJunk,
                protocol: "tr",
                mode: "proxyip",
                panelIPs: [],
                relayIdx: configIndex
              };
              let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
              let activeFp = sysConfig.optAutoApply && sysConfig.optFp ? sysConfig.optFp : sysConfig.agent;
              let trojanExtBase = `security=${sec}&sni=${hName}&fp=${activeFp}&type=ws&host=${hName}&path=${encodeURIComponent(pathStrTr)}`;
              if (sysConfig.enableOpt2)
                trojanExtBase += `&pbk=enabled`;
              trojanExtBase += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
              try {
                trojanExtBase += buildSegFragmentParam(p);
                trojanExtBase += buildTlsMaskParam(p);
                if (sysConfig.optAutoApply && sysConfig.optMode === "ech" && sysConfig.optEchList) {
                  let firstEch = String(sysConfig.optEchList).split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean)[0];
                  if (firstEch)
                    trojanExtBase += "&ech=" + encodeURIComponent(firstEch);
                }
              } catch (e) {}
              lines.push(`${getBeta()}://${p.id}@${ip}:${port}?${trojanExtBase}#${tName}`);
            }
            if (sysConfig.enableDirectConfigs && pips.length > 0 && selectedProxyIp === pips[0]) {
              configIndex++;
              let dvName = getConfigName2("alpha", p.name, port, hName, ip, null, configIndex, ipName, true);
              let dtName = getConfigName2("beta", p.name, port, hName, ip, null, configIndex, ipName, true);
              if (effectiveMode === "alpha" || effectiveMode === "both") {
                let configUuid = generateConfigUuid2(p.id, configIndex);
                registerConfigEntry(configUuid, p.id, "");
                lines.push(`${getAlpha2()}://${configUuid}@${ip}:${port}?${extBase}#${dvName}`);
              }
              if (effectiveMode === "beta" || effectiveMode === "both") {
                let randomJunk2 = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payloadTr2 = {
                  junk: randomJunk2,
                  protocol: "tr",
                  mode: "proxyip",
                  panelIPs: [],
                  relayIdx: configIndex
                };
                let pathStrTr2 = "/" + btoa(JSON.stringify(payloadTr2));
                let trojanExtBase2 = `security=${sec}&sni=${hName}&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${encodeURIComponent(pathStrTr2)}`;
                if (sysConfig.enableOpt2)
                  trojanExtBase2 += `&pbk=enabled`;
                trojanExtBase2 += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
                try {
                  trojanExtBase2 += buildSegFragmentParam(p);
                  trojanExtBase2 += buildTlsMaskParam(p);
                } catch (e) {}
                lines.push(`${getBeta()}://${p.id}@${ip}:${port}?${trojanExtBase2}#${dtName}`);
              }
            }
            configIndex++;
          });
        });
      });
    });
  });
  let parsedUpstream = parseVlessUri(sysConfig.upstreamUri);
  if (parsedUpstream) {
    lines.unshift(parsedUpstream.raw);
  }
  return lines.join(`
`);
}
async function buildYamlProfile(hostName, targetSub = null, allowInsecure = false, env = null) {
  let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
  let reqPath = encodeURI(`/${sysConfig.apiRoute}`);
  let proxies = [];
  let proxyNames = [];
  let nameCounts = {};
  let profiles = getAllProfiles(targetSub);
  let allHostNames = [
    ...new Set(profiles.flatMap((p) => getProfileHostNames2(hostName, p)))
  ];
  await preloadIpFlags2(profiles, allHostNames);
  let proxyGeoInfo = new Map;
  let fakeNames = getFakeConfigNames2(targetSub);
  let fakeRefs = [];
  fakeNames.forEach((name) => {
    proxies.push(`- name: "${name}"
  type: ${getBeta()}
  server: 127.0.0.1
  port: 80
  password: "${activeDeviceId}"
  udp: true
  tls: false`);
    fakeRefs.push(`"${name}"`);
  });
  const getUniqueName = (baseName) => {
    if (!nameCounts[baseName]) {
      nameCounts[baseName] = 1;
      return baseName;
    }
    let counter = nameCounts[baseName];
    let newName = `${baseName}-${counter}`;
    while (nameCounts[newName]) {
      counter++;
      newName = `${baseName}-${counter}`;
    }
    nameCounts[baseName] = counter + 1;
    nameCounts[newName] = 1;
    return newName;
  };
  profiles.forEach((p) => {
    let pips = getEffectivePips(p);
    let effectiveMode = p.userMode || sysConfig.mode;
    let effectivePorts = p.userPorts ? p.userPorts.split(",").map((s) => s.trim()).filter(Boolean) : ports;
    let maxCfg = p.maxConfigs || null;
    let configIndex = 0;
    let profileHostNames = getProfileHostNames2(hostName, p);
    profileHostNames.forEach((hName) => {
      let ipEntries = getCleanIpsWithNames2(hName, p.cleanIp);
      let allIps = ipEntries.map((e) => e.ip);
      let ips = calcEffectiveIps2(allIps, maxCfg, effectiveMode, effectivePorts, pips.length);
      let ipNameMap = {};
      ipEntries.forEach((e) => {
        ipNameMap[e.ip] = e.name;
      });
      effectivePorts.forEach((port) => {
        let sec = getTransportParams2(port) === "tls" ? "true" : "false";
        ips.forEach((ip) => {
          let _pips = pips.length > 0 ? pips : [null];
          _pips.forEach((selectedProxyIp) => {
            let ipName = ipNameMap[ip] || "";
            if (effectiveMode === "alpha" || effectiveMode === "both") {
              let vName = getConfigName2("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName);
              vName = getUniqueName(vName);
              proxyNames.push(`"${vName}"`);
              proxyGeoInfo.set(vName, getGeoInfo2(selectedProxyIp || ip));
              let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
              let payloadVl = {
                junk: randomJunk,
                protocol: "vl",
                mode: "proxyip",
                panelIPs: []
              };
              let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));
              let configUuid = generateConfigUuid2(p.id, configIndex);
              registerConfigEntry(configUuid, p.id, selectedProxyIp || "");
              proxies.push(`- name: "${vName.replace(/"/g, '""')}"
  type: ${getAlpha2()}
  server: ${ip}
  port: ${port}
  uuid: ${configUuid}
  udp: true
  tls: ${sec}
  servername: ${hName}
  client-fingerprint: ${sysConfig.agent || "random"}
  network: ws
  ws-opts:
    path: "${pathStrVl}"
    headers:
      Host: ${hName}
  skip-cert-verify: ${allowInsecure}
${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);
            }
            if (effectiveMode === "beta" || effectiveMode === "both") {
              let tName = getConfigName2("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName);
              tName = getUniqueName(tName);
              proxyNames.push(`"${tName}"`);
              proxyGeoInfo.set(tName, getGeoInfo2(selectedProxyIp || ip));
              let randomJunkTr = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
              let payloadTr = {
                junk: randomJunkTr,
                protocol: "tr",
                mode: "proxyip",
                panelIPs: [],
                relayIdx: configIndex
              };
              let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
              proxies.push(`- name: "${tName.replace(/"/g, '""')}"
  type: ${getBeta()}
  server: ${ip}
  port: ${port}
  password: "${p.id}"
  udp: true
  tls: ${sec}
  sni: ${hName}
  client-fingerprint: ${sysConfig.agent || "random"}
  network: ws
  ws-opts:
    path: "${pathStrTr}"
    headers:
      Host: ${hName}
  skip-cert-verify: ${allowInsecure}
${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);
            }
            configIndex++;
            if (sysConfig.enableDirectConfigs && pips.length > 0 && selectedProxyIp === pips[0]) {
              let dcIndex = configIndex;
              if (effectiveMode === "alpha" || effectiveMode === "both") {
                let dvName = getUniqueName(getConfigName2("alpha", p.name, port, hName, ip, null, dcIndex, ipName, true));
                proxyNames.push(`"${dvName}"`);
                proxyGeoInfo.set(dvName, getGeoInfo2(ip));
                let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payloadVl = {
                  junk: randomJunk,
                  protocol: "vl",
                  mode: "proxyip",
                  panelIPs: []
                };
                let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));
                let configUuid = generateConfigUuid2(p.id, dcIndex);
                registerConfigEntry(configUuid, p.id, "");
                proxies.push(`- name: "${dvName.replace(/"/g, '""')}"
  type: ${getAlpha2()}
  server: ${ip}
  port: ${port}
  uuid: ${configUuid}
  udp: true
  tls: ${sec}
  servername: ${hName}
  client-fingerprint: ${sysConfig.agent || "random"}
  network: ws
  ws-opts:
    path: "${pathStrVl}"
    headers:
      Host: ${hName}
  skip-cert-verify: ${allowInsecure}
${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);
              }
              if (effectiveMode === "beta" || effectiveMode === "both") {
                let dtName = getUniqueName(getConfigName2("beta", p.name, port, hName, ip, null, dcIndex, ipName, true));
                proxyNames.push(`"${dtName}"`);
                proxyGeoInfo.set(dtName, getGeoInfo2(ip));
                let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payloadTr = {
                  junk: randomJunk,
                  protocol: "tr",
                  mode: "proxyip",
                  panelIPs: [],
                  relayIdx: configIndex
                };
                let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
                let randomJunkDt = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payloadDt = {
                  junk: randomJunkDt,
                  protocol: "tr",
                  mode: "proxyip",
                  panelIPs: [],
                  relayIdx: dcIndex
                };
                let pathStrDt = "/" + btoa(JSON.stringify(payloadDt));
                proxies.push(`- name: "${dtName.replace(/"/g, '""')}"
  type: ${getBeta()}
  server: ${ip}
  port: ${port}
  password: "${p.id}"
  udp: true
  tls: ${sec}
  sni: ${hName}
  client-fingerprint: ${sysConfig.agent || "random"}
  network: ws
  ws-opts:
    path: "${pathStrDt}"
    headers:
      Host: ${hName}
  skip-cert-verify: ${allowInsecure}
${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);
              }
              configIndex++;
            }
          });
        });
      });
    });
  });
  let parsedUpstreamYaml = parseVlessUri(sysConfig.upstreamUri);
  let upstreamNameYaml = "";
  if (parsedUpstreamYaml) {
    let upProxy = upstreamToClashProxy(parsedUpstreamYaml);
    upstreamNameYaml = upProxy.name;
    let upYaml = `- name: "${upProxy.name.replace(/"/g, '""')}"
  type: ${getAlpha2()}
  server: ${upProxy.server}
  port: ${upProxy.port}
  uuid: ${upProxy.uuid}
  udp: true
  tls: ${upProxy.tls}
  servername: ${upProxy.servername}
  client-fingerprint: ${upProxy["client-fingerprint"] || "random"}
  skip-cert-verify: ${upProxy["skip-cert-verify"]}
  network: ${upProxy.network}
  ws-opts:
    path: "${upProxy["ws-opts"]?.path || "/"}"
    headers:
      Host: ${upProxy["ws-opts"]?.headers?.Host || upProxy.servername}`;
    proxies.unshift(upYaml);
    proxyNames.unshift(`"${upProxy.name}"`);
  }
  let countryGroups = new Map;
  proxyGeoInfo.forEach((geo, name) => {
    let key = geo.country || "Unknown";
    if (!countryGroups.has(key)) {
      countryGroups.set(key, { flag: geo.flag || "\uD83C\uDF10", proxies: [] });
    }
    countryGroups.get(key).proxies.push(name);
  });
  let sortedCountries = Array.from(countryGroups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  let groupsYaml = `proxy-groups:
` + `  - name: "✅ Selector"
` + `    type: select
` + `    proxies:
` + `      - "⚡ Fastest"
` + `      - "\uD83D\uDD90 Manual"
`;
  sortedCountries.forEach(([country, info]) => {
    groupsYaml += `      - "${info.flag} ${country}"
`;
  });
  groupsYaml += `
  - name: "⚡ Fastest"
` + `    type: url-test
` + `    url: "https://www.gstatic.com/generate_204"
` + `    interval: 30
` + `    tolerance: 50
` + `    proxies:
`;
  proxyNames.forEach((n) => {
    groupsYaml += `      - ${n}
`;
  });
  groupsYaml += `
  - name: "\uD83D\uDD90 Manual"
` + `    type: select
` + `    proxies:
`;
  proxyNames.forEach((n) => {
    groupsYaml += `      - ${n}
`;
  });
  sortedCountries.forEach(([country, info]) => {
    groupsYaml += `
  - name: "${info.flag} ${country}"
` + `    type: url-test
` + `    url: "https://www.gstatic.com/generate_204"
` + `    interval: 30
` + `    tolerance: 50
` + `    proxies:
`;
    info.proxies.forEach((name) => {
      groupsYaml += `      - "${name}"
`;
    });
  });
  let cr = getCustomRouting();
  let customRules = [];
  cr.domains.forEach((d) => {
    customRules.push(`  - DOMAIN,${d},DIRECT`);
    customRules.push(`  - DOMAIN-SUFFIX,${d},DIRECT`);
  });
  cr.ips.forEach((ip) => {
    customRules.push(`  - IP-CIDR,${ip},DIRECT`);
  });
  cr.geoips.forEach((g) => {
    customRules.push(`  - GEOIP,${g},DIRECT`);
  });
  cr.geosites.forEach((g) => {
    customRules.push(`  - GEOSITE,${g},DIRECT`);
  });
  let rulesOutput = customRules.length > 0 ? customRules.join(`
`) : `  - DOMAIN-SUFFIX,ir,DIRECT
  - DOMAIN-KEYWORD,gov.ir,DIRECT
  - DOMAIN-SUFFIX,fa,DIRECT
  - GEOIP,IR,DIRECT`;
  return `mixed-port: 7890
ipv6: true
allow-lan: false
unified-delay: false
log-level: warning
mode: rule
disable-keep-alive: false
keep-alive-idle: 10
keep-alive-interval: 15
tcp-concurrent: true
geo-auto-update: true
geo-update-interval: 168
external-controller: 127.0.0.1:9090
external-controller-cors:
  allow-origins:
    - "*"
  allow-private-network: true
external-ui: ui
external-ui-url: "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip"

profile:
  store-selected: true
  store-fake-ip: true

dns:
  enable: true
  respect-rules: true
  use-system-hosts: false
  listen: 127.0.0.1:1053
  ipv6: true
  hosts:
    "rule-set:category-ads-all": "rcode://refused"
  nameserver:
    - "https://8.8.8.8/dns-query#✅ Selector"
  proxy-server-nameserver:
    - "8.8.8.8#DIRECT"
  direct-nameserver:
    - "8.8.8.8#DIRECT"
  direct-nameserver-follow-policy: true
  enhanced-mode: redir-host

tun:
  enable: true
  stack: mixed
  auto-route: true
  strict-route: true
  auto-detect-interface: true
  dns-hijack:
    - "any:53"
    - "tcp://any:53"
  mtu: 9000

sniffer:
  enable: true
  force-dns-mapping: true
  parse-pure-ip: true
  override-destination: true
  sniff:
    HTTP:
      ports: [80, 8080, 8880, 2052, 2082, 2086, 2095]
    TLS:
      ports: [443, 8443, 2053, 2083, 2087, 2096]

proxies:
${proxies.join(`
`)}

${groupsYaml}

rules:
${rulesOutput}
  - MATCH,✅ Selector
`;
}
async function buildEdgeJsonProfile(hostName, targetSub = null, allowInsecure = false, env = null) {
  let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
  let profiles = getAllProfiles(targetSub);
  let allHostNames = [
    ...new Set(profiles.flatMap((p) => getProfileHostNames2(hostName, p)))
  ];
  await preloadIpFlags2(profiles, allHostNames);
  let proxyGeoInfo = new Map;
  let reqPath = encodeURI(`/${sysConfig.apiRoute}`);
  let proxiesArr = [];
  let dynamicTags = [];
  let nameCounts = {};
  let fakeNames = getFakeConfigNames2(targetSub);
  let fakeRefs = [];
  fakeNames.forEach((name) => {
    proxiesArr.push({
      name,
      type: k_tr_mode2,
      server: "127.0.0.1",
      port: 80,
      password: activeDeviceId,
      tls: false,
      udp: true
    });
    fakeRefs.push(name);
  });
  const getUniqueName = (baseName) => {
    if (!nameCounts[baseName]) {
      nameCounts[baseName] = 1;
      return baseName;
    }
    let counter = nameCounts[baseName];
    let newName = `${baseName}-${counter}`;
    while (nameCounts[newName]) {
      counter++;
      newName = `${baseName}-${counter}`;
    }
    nameCounts[baseName] = counter + 1;
    nameCounts[newName] = 1;
    return newName;
  };
  profiles.forEach((p) => {
    let pips = getEffectivePips(p);
    let effectiveMode = p.userMode || sysConfig.mode;
    let effectivePorts = p.userPorts ? p.userPorts.split(",").map((s) => s.trim()).filter(Boolean) : ports;
    let maxCfg = p.maxConfigs || null;
    let configIndex = 0;
    let profileHostNames = getProfileHostNames2(hostName, p);
    profileHostNames.forEach((hName) => {
      let ipEntries = getCleanIpsWithNames2(hName, p.cleanIp);
      let allIps = ipEntries.map((e) => e.ip);
      let ips = calcEffectiveIps2(allIps, maxCfg, effectiveMode, effectivePorts, pips.length);
      let ipNameMap = {};
      ipEntries.forEach((e) => {
        ipNameMap[e.ip] = e.name;
      });
      effectivePorts.forEach((port) => {
        let sec = getTransportParams2(port) === "tls";
        ips.forEach((ip) => {
          let isVless = effectiveMode === "alpha" || effectiveMode === "both";
          let isTrojan = effectiveMode === "beta" || effectiveMode === "both";
          let _pips = pips.length > 0 ? pips : [null];
          _pips.forEach((selectedProxyIp) => {
            let ipName = ipNameMap[ip] || "";
            if (isVless) {
              let tagStr = getConfigName2("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName);
              tagStr = getUniqueName(tagStr);
              dynamicTags.push(tagStr);
              proxyGeoInfo.set(tagStr, getGeoInfo2(selectedProxyIp || ip));
              let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
              let payloadVl = {
                junk: randomJunk,
                protocol: "vl",
                mode: "proxyip",
                panelIPs: []
              };
              let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));
              let configUuid = generateConfigUuid2(p.id, configIndex);
              registerConfigEntry(configUuid, p.id, selectedProxyIp || "");
              let ob = {
                name: tagStr,
                type: k_vl_mode2,
                server: ip,
                port: parseInt(port),
                "ip-version": "ipv4-prefer",
                tfo: sysConfig.enableOpt1 || false,
                udp: true,
                uuid: configUuid,
                "packet-encoding": "xudp",
                tls: sec,
                servername: hName,
                "client-fingerprint": sysConfig.agent || "random",
                "skip-cert-verify": allowInsecure,
                alpn: ["http/1.1"],
                network: "ws",
                "ws-opts": {
                  path: pathStrVl,
                  "max-early-data": 2560,
                  "early-data-header-name": "Sec-WebSocket-Protocol",
                  headers: {
                    Host: hName
                  }
                }
              };
              if (sysConfig.enableOpt2) {
                ob["ech-opts"] = {
                  enable: true,
                  config: "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA="
                };
              }
              proxiesArr.push(ob);
            }
            if (isTrojan) {
              let tagStr = getConfigName2("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName);
              tagStr = getUniqueName(tagStr);
              dynamicTags.push(tagStr);
              proxyGeoInfo.set(tagStr, getGeoInfo2(selectedProxyIp || ip));
              let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
              let payloadTr = {
                junk: randomJunk,
                protocol: "tr",
                mode: "proxyip",
                panelIPs: [],
                relayIdx: configIndex
              };
              let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
              let configUuid2 = generateConfigUuid2(p.id, configIndex);
              registerConfigEntry(configUuid2, p.id, selectedProxyIp || "");
              let ob = {
                name: tagStr,
                type: k_tr_mode2,
                server: ip,
                port: parseInt(port),
                "ip-version": "ipv4-prefer",
                tfo: sysConfig.enableOpt1 || false,
                udp: true,
                password: p.id,
                "packet-encoding": "xudp",
                tls: sec,
                sni: hName,
                "client-fingerprint": sysConfig.agent || "random",
                "skip-cert-verify": allowInsecure,
                alpn: ["http/1.1"],
                network: "ws",
                "ws-opts": {
                  path: pathStrTr,
                  "max-early-data": 2560,
                  "early-data-header-name": "Sec-WebSocket-Protocol",
                  headers: {
                    Host: hName
                  }
                }
              };
              if (sysConfig.enableOpt2) {
                ob["ech-opts"] = {
                  enable: true,
                  config: "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA="
                };
              }
              proxiesArr.push(ob);
            }
            configIndex++;
            if (sysConfig.enableDirectConfigs && pips.length > 0 && selectedProxyIp === pips[0]) {
              if (isVless) {
                let tagStr = getUniqueName(getConfigName2("alpha", p.name, port, hName, ip, null, configIndex, ipName, true));
                dynamicTags.push(tagStr);
                proxyGeoInfo.set(tagStr, getGeoInfo2(ip));
                let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payloadVl = {
                  junk: randomJunk,
                  protocol: "vl",
                  mode: "proxyip",
                  panelIPs: []
                };
                let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));
                let configUuid = generateConfigUuid2(p.id, configIndex);
                registerConfigEntry(configUuid, p.id, "");
                let ob = {
                  name: tagStr,
                  type: k_vl_mode2,
                  server: ip,
                  port: parseInt(port),
                  "ip-version": "ipv4-prefer",
                  tfo: sysConfig.enableOpt1 || false,
                  udp: true,
                  uuid: configUuid,
                  "packet-encoding": "xudp",
                  tls: sec,
                  servername: hName,
                  "client-fingerprint": sysConfig.agent || "random",
                  "skip-cert-verify": allowInsecure,
                  alpn: ["http/1.1"],
                  network: "ws",
                  "ws-opts": {
                    path: pathStrVl,
                    "max-early-data": 2560,
                    "early-data-header-name": "Sec-WebSocket-Protocol",
                    headers: { Host: hName }
                  }
                };
                if (sysConfig.enableOpt2)
                  ob["ech-opts"] = {
                    enable: true,
                    config: "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA="
                  };
                proxiesArr.push(ob);
              }
              if (isTrojan) {
                let tagStr = getUniqueName(getConfigName2("beta", p.name, port, hName, ip, null, configIndex, ipName, true));
                dynamicTags.push(tagStr);
                proxyGeoInfo.set(tagStr, getGeoInfo2(ip));
                let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payloadTr = {
                  junk: randomJunk,
                  protocol: "tr",
                  mode: "proxyip",
                  panelIPs: [],
                  relayIdx: configIndex
                };
                let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
                let configUuid2 = generateConfigUuid2(p.id, configIndex);
                let ob = {
                  name: tagStr,
                  type: k_tr_mode2,
                  server: ip,
                  port: parseInt(port),
                  "ip-version": "ipv4-prefer",
                  tfo: sysConfig.enableOpt1 || false,
                  udp: true,
                  password: p.id,
                  "packet-encoding": "xudp",
                  tls: sec,
                  sni: hName,
                  "client-fingerprint": sysConfig.agent || "random",
                  "skip-cert-verify": allowInsecure,
                  alpn: ["http/1.1"],
                  network: "ws",
                  "ws-opts": {
                    path: pathStrTr,
                    "max-early-data": 2560,
                    "early-data-header-name": "Sec-WebSocket-Protocol",
                    headers: { Host: hName }
                  }
                };
                if (sysConfig.enableOpt2)
                  ob["ech-opts"] = {
                    enable: true,
                    config: "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA="
                  };
                proxiesArr.push(ob);
              }
              configIndex++;
            }
          });
        });
      });
    });
  });
  if (dynamicTags.length === 0) {
    dynamicTags.push("direct");
  }
  let parsedUpstream = parseVlessUri(sysConfig.upstreamUri);
  let upstreamProxyName = "";
  if (parsedUpstream) {
    let upstreamProxy = upstreamToClashProxy(parsedUpstream);
    upstreamProxyName = upstreamProxy.name;
    proxiesArr.unshift(upstreamProxy);
    dynamicTags.unshift(upstreamProxyName);
  }
  let countryGroups = new Map;
  proxyGeoInfo.forEach((geo, name) => {
    let key = geo.country || "Unknown";
    if (!countryGroups.has(key)) {
      countryGroups.set(key, { flag: geo.flag || "\uD83C\uDF10", proxies: [] });
    }
    countryGroups.get(key).proxies.push(name);
  });
  let sortedCountries = Array.from(countryGroups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  let groupsJson = [
    {
      name: "✅ Selector",
      type: "select",
      proxies: [
        "⚡ Fastest",
        "\uD83D\uDD90 Manual",
        ...sortedCountries.map(([c, info]) => `${info.flag} ${c}`)
      ]
    },
    {
      name: "⚡ Fastest",
      type: "url-test",
      url: "https://www.gstatic.com/generate_204",
      interval: 30,
      tolerance: 50,
      proxies: dynamicTags
    },
    { name: "\uD83D\uDD90 Manual", type: "select", proxies: dynamicTags },
    ...sortedCountries.map(([country, info]) => ({
      name: `${info.flag} ${country}`,
      type: "url-test",
      url: "https://www.gstatic.com/generate_204",
      interval: 30,
      tolerance: 50,
      proxies: info.proxies
    }))
  ];
  let cr = getCustomRouting();
  let jsonCustomRules = [];
  cr.domains.forEach((d) => {
    jsonCustomRules.push(`DOMAIN,${d},DIRECT`);
    jsonCustomRules.push(`DOMAIN-SUFFIX,${d},DIRECT`);
  });
  cr.ips.forEach((ip) => {
    jsonCustomRules.push(`IP-CIDR,${ip},DIRECT,no-resolve`);
  });
  cr.geoips.forEach((g) => {
    jsonCustomRules.push(`GEOIP,${g},DIRECT,no-resolve`);
  });
  cr.geosites.forEach((g) => {
    jsonCustomRules.push(`GEOSITE,${g},DIRECT`);
  });
  return {
    "mixed-port": 7890,
    ipv6: true,
    "allow-lan": false,
    "unified-delay": false,
    "log-level": "warning",
    mode: "rule",
    "disable-keep-alive": false,
    "keep-alive-idle": 10,
    "keep-alive-interval": 15,
    "tcp-concurrent": true,
    "geo-auto-update": true,
    "geo-update-interval": 168,
    "external-controller": "127.0.0.1:9090",
    "external-controller-cors": {
      "allow-origins": ["*"],
      "allow-private-network": true
    },
    "external-ui": "ui",
    "external-ui-url": "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip",
    profile: {
      "store-selected": true,
      "store-fake-ip": true
    },
    dns: {
      enable: true,
      "respect-rules": true,
      "use-system-hosts": false,
      listen: "127.0.0.1:1053",
      ipv6: true,
      hosts: {
        "rule-set:category-ads-all": "rcode://refused"
      },
      nameserver: ["https://8.8.8.8/dns-query#✅ Selector"],
      "proxy-server-nameserver": ["8.8.8.8#DIRECT"],
      "direct-nameserver": ["8.8.8.8#DIRECT"],
      "direct-nameserver-follow-policy": true,
      "nameserver-policy": {
        "rule-set:ir": "8.8.8.8#DIRECT"
      },
      "enhanced-mode": "redir-host"
    },
    tun: {
      enable: true,
      stack: "mixed",
      "auto-route": true,
      "strict-route": true,
      "auto-detect-interface": true,
      "dns-hijack": ["any:53", "tcp://any:53"],
      mtu: 9000
    },
    sniffer: {
      enable: true,
      "force-dns-mapping": true,
      "parse-pure-ip": true,
      "override-destination": true,
      sniff: {
        HTTP: {
          ports: [80, 8080, 8880, 2052, 2082, 2086, 2095]
        },
        TLS: {
          ports: [443, 8443, 2053, 2083, 2087, 2096]
        }
      }
    },
    [k_pxs2]: proxiesArr,
    [k_px_gps2]: groupsJson,
    "rule-providers": {
      "category-ads-all": {
        type: "http",
        format: "text",
        behavior: "domain",
        path: "./ruleset/category-ads-all.txt",
        interval: 86400,
        url: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/category-ads-all.txt"
      },
      ir: {
        type: "http",
        format: "text",
        behavior: "domain",
        path: "./ruleset/ir.txt",
        interval: 86400,
        url: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ir.txt"
      },
      "ir-cidr": {
        type: "http",
        format: "text",
        behavior: "ipcidr",
        path: "./ruleset/ir-cidr.txt",
        interval: 86400,
        url: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ircidr.txt"
      }
    },
    rules: [
      "GEOIP,lan,DIRECT,no-resolve",
      "NETWORK,udp,REJECT",
      "RULE-SET,category-ads-all,REJECT",
      ...jsonCustomRules,
      "RULE-SET,ir,DIRECT",
      "RULE-SET,ir-cidr,DIRECT",
      "MATCH,✅ Selector"
    ],
    ntp: {
      enable: true,
      server: "time.cloudflare.com",
      port: 123,
      interval: 30
    }
  };
}
var buildClashJsonProfile = buildEdgeJsonProfile;
async function buildVJsonProfile(hostName, targetSub = null, allowInsecure = false, env = null) {
  let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
  let profiles = getAllProfiles(targetSub);
  let allHostNames = [...new Set(profiles.flatMap((p) => getProfileHostNames2(hostName, p)))];
  await preloadIpFlags2(profiles, allHostNames);
  let outboundsArr = [];
  let configIndex = 0;
  let nameCounts = {};
  const getUniqueName = (baseName) => {
    if (!nameCounts[baseName]) {
      nameCounts[baseName] = 1;
      return baseName;
    }
    let c = nameCounts[baseName];
    nameCounts[baseName] = c + 1;
    return baseName + "-" + c;
  };
  profiles.forEach((p) => {
    let maxCfg = p.maxConfigs || 0;
    let pips = [];
    if (p.relayIps && p.relayIps.length > 0)
      pips = [...p.relayIps];
    else if (sysConfig.customRelay && sysConfig.customRelay.trim() !== "") {
      pips = sysConfig.customRelay.split(",").map((r) => r.trim()).filter(Boolean);
    }
    let hostNamesToUse = getProfileHostNames2(hostName, p);
    hostNamesToUse.forEach((hName) => {
      p.ipLists.forEach((ipList) => {
        let ips = ipList.ips;
        let effectiveMode = ipList.mode || sysConfig.mode || "both";
        let effectivePorts = ipList.ports && ipList.ports.length > 0 ? ipList.ports : ports;
        if (maxCfg > 0)
          ips = calcEffectiveIps2(ips, maxCfg, effectiveMode, effectivePorts, pips.length);
        let ipNameMap = {};
        if (ipList.entries)
          ipList.entries.forEach((e) => ipNameMap[e.ip] = e.name);
        effectivePorts.forEach((port) => {
          let sec = getTransportParams2(port) === "tls" ? "tls" : "none";
          ips.forEach((ip) => {
            let _pips = pips.length > 0 ? pips : [null];
            _pips.forEach((selectedProxyIp) => {
              let ipName = ipNameMap[ip] || "";
              if (effectiveMode === "alpha" || effectiveMode === "both") {
                let tag = getUniqueName(getConfigName2("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName));
                let configUuid = generateConfigUuid2(p.id, configIndex);
                let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payload = { junk: randomJunk, protocol: "vl", mode: "proxyip", panelIPs: [], relayIdx: configIndex };
                let path = "/" + btoa(JSON.stringify(payload));
                let ob = {
                  tag,
                  protocol: getAlpha2(),
                  settings: {
                    vnext: [{ address: ip, port: parseInt(port), users: [{ id: configUuid, encryption: "none" }] }]
                  },
                  streamSettings: {
                    network: "ws",
                    security: sec,
                    tlsSettings: sec === "tls" ? { serverName: hName, allowInsecure } : undefined,
                    wsSettings: { path, headers: { Host: hName } },
                    ...getSegStreamExtra(p)
                  }
                };
                outboundsArr.push(ob);
              }
              if (effectiveMode === "beta" || effectiveMode === "both") {
                let tag = getUniqueName(getConfigName2("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName));
                let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payload = { junk: randomJunk, protocol: "tr", mode: "proxyip", panelIPs: [], relayIdx: configIndex };
                let path = "/" + btoa(JSON.stringify(payload));
                let ob = {
                  tag,
                  protocol: getBeta(),
                  settings: {
                    servers: [{ address: ip, port: parseInt(port), password: p.id }]
                  },
                  streamSettings: {
                    network: "ws",
                    security: sec,
                    tlsSettings: sec === "tls" ? { serverName: hName, allowInsecure } : undefined,
                    wsSettings: { path, headers: { Host: hName } },
                    ...getSegStreamExtra(p)
                  }
                };
                outboundsArr.push(ob);
              }
              configIndex++;
            });
          });
        });
      });
    });
  });
  let parsedUpstream = parseVlessUri(sysConfig.upstreamUri);
  if (parsedUpstream) {
    let upstreamOb = upstreamToV2RayOb(parsedUpstream);
    outboundsArr.forEach((ob) => {
      if (ob.protocol !== "direct" && ob.protocol !== "freedom" && ob.protocol !== "blackhole") {
        ob.proxySettings = { tag: upstreamOb.tag, transportSeries: [] };
      }
    });
    outboundsArr.unshift(upstreamOb);
  }
  await fetchTemplates(env);
  if (VTemplate) {
    let tpl = JSON.parse(JSON.stringify(VTemplate));
    let newOutbounds = [];
    for (let ob of tpl.outbounds) {
      if (ob === "__OUTBOUNDS__") {
        newOutbounds.push(...outboundsArr);
      } else {
        newOutbounds.push(ob);
      }
    }
    if (newOutbounds.length === 0)
      newOutbounds = outboundsArr;
    tpl.outbounds = newOutbounds;
    let cr = getCustomRouting();
    if (cr.domains.length > 0) {
      tpl.route.rules.unshift({ domain: cr.domains, outbound: "direct" });
      tpl.route.rules.unshift({ domain_suffix: cr.domains, outbound: "direct" });
    }
    if (cr.ips.length > 0) {
      tpl.route.rules.unshift({ ip_cidr: cr.ips, outbound: "direct" });
    }
    if (cr.geoips.length > 0) {
      tpl.route.rules.unshift({ geoip: cr.geoips, outbound: "direct" });
    }
    if (cr.geosites.length > 0) {
      tpl.route.rules.unshift({ geosite: cr.geosites, outbound: "direct" });
    }
    return tpl;
  }
  return { outbounds: outboundsArr };
}
async function buildBoxJsonProfile(hostName, targetSub = null, allowInsecure = false, env = null) {
  let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map((s) => s.trim()).filter(Boolean) : ["443"];
  let profiles = getAllProfiles(targetSub);
  let allHostNames = [
    ...new Set(profiles.flatMap((p) => getProfileHostNames2(hostName, p)))
  ];
  await preloadIpFlags2(profiles, allHostNames);
  let proxyGeoInfo = new Map;
  let reqPath = encodeURI(`/${sysConfig.apiRoute}`);
  let outboundsArr = [];
  let dynamicTags = [];
  let nameCounts = {};
  let fakeNames = getFakeConfigNames2(targetSub);
  let fakeRefs = [];
  fakeNames.forEach((name) => {
    outboundsArr.push({
      type: "direct",
      tag: name
    });
    fakeRefs.push(name);
  });
  const getUniqueName = (baseName) => {
    if (!nameCounts[baseName]) {
      nameCounts[baseName] = 1;
      return baseName;
    }
    let counter = nameCounts[baseName];
    let newName = `${baseName}-${counter}`;
    while (nameCounts[newName]) {
      counter++;
      newName = `${baseName}-${counter}`;
    }
    nameCounts[baseName] = counter + 1;
    nameCounts[newName] = 1;
    return newName;
  };
  profiles.forEach((p) => {
    let pips = getEffectivePips(p);
    let effectiveMode = p.userMode || sysConfig.mode;
    let effectivePorts = p.userPorts ? p.userPorts.split(",").map((s) => s.trim()).filter(Boolean) : ports;
    let maxCfg = p.maxConfigs || null;
    let configIndex = 0;
    let profileHostNames = getProfileHostNames2(hostName, p);
    profileHostNames.forEach((hName) => {
      let ipEntries = getCleanIpsWithNames2(hName, p.cleanIp);
      let allIps = ipEntries.map((e) => e.ip);
      let ips = calcEffectiveIps2(allIps, maxCfg, effectiveMode, effectivePorts, pips.length);
      let ipNameMap = {};
      ipEntries.forEach((e) => {
        ipNameMap[e.ip] = e.name;
      });
      effectivePorts.forEach((port) => {
        let sec = getTransportParams2(port) === "tls";
        ips.forEach((ip) => {
          let isVless = effectiveMode === "alpha" || effectiveMode === "both";
          let isTrojan = effectiveMode === "beta" || effectiveMode === "both";
          let _pips = pips.length > 0 ? pips : [null];
          _pips.forEach((selectedProxyIp) => {
            let ipName = ipNameMap[ip] || "";
            if (isVless) {
              let tagStr = getConfigName2("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName);
              tagStr = getUniqueName(tagStr);
              dynamicTags.push(tagStr);
              let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
              let payloadVl = {
                junk: randomJunk,
                protocol: "vl",
                mode: "proxyip",
                panelIPs: []
              };
              let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));
              let configUuid = generateConfigUuid2(p.id, configIndex);
              registerConfigEntry(configUuid, p.id, selectedProxyIp || "");
              let ob = {
                type: k_vl_mode2,
                tag: tagStr,
                server: ip,
                server_port: parseInt(port),
                tcp_fast_open: sysConfig.enableOpt1 || false,
                uuid: configUuid,
                packet_encoding: "xudp",
                network: "tcp",
                tls: {
                  enabled: sec,
                  server_name: hName,
                  insecure: allowInsecure,
                  ...isSegEnabled(p) ? { fragment: true } : {},
                  alpn: ["http/1.1"],
                  utls: {
                    enabled: true,
                    fingerprint: "randomized"
                  }
                },
                transport: {
                  type: "ws",
                  path: pathStrVl,
                  max_early_data: 2560,
                  early_data_header_name: "Sec-WebSocket-Protocol",
                  headers: {
                    Host: hName
                  }
                }
              };
              outboundsArr.push(ob);
            }
            if (isTrojan) {
              let tagStr = getConfigName2("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName);
              tagStr = getUniqueName(tagStr);
              dynamicTags.push(tagStr);
              let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
              let payloadTr = {
                junk: randomJunk,
                protocol: "tr",
                mode: "proxyip",
                panelIPs: [],
                relayIdx: configIndex
              };
              let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
              let configUuid2 = generateConfigUuid2(p.id, configIndex);
              registerConfigEntry(configUuid2, p.id, selectedProxyIp || "");
              let ob = {
                type: k_tr_mode2,
                tag: tagStr,
                server: ip,
                server_port: parseInt(port),
                tcp_fast_open: sysConfig.enableOpt1 || false,
                password: p.id,
                network: "tcp",
                tls: {
                  enabled: sec,
                  server_name: hName,
                  insecure: allowInsecure,
                  ...isSegEnabled(p) ? { fragment: true } : {},
                  alpn: ["http/1.1"],
                  utls: {
                    enabled: true,
                    fingerprint: "randomized"
                  }
                },
                transport: {
                  type: "ws",
                  path: pathStrTr,
                  max_early_data: 2560,
                  early_data_header_name: "Sec-WebSocket-Protocol",
                  headers: {
                    Host: hName
                  }
                }
              };
              outboundsArr.push(ob);
            }
            configIndex++;
            if (sysConfig.enableDirectConfigs && pips.length > 0 && selectedProxyIp === pips[0]) {
              if (isVless) {
                let tagStr = getUniqueName(getConfigName2("alpha", p.name, port, hName, ip, null, configIndex, ipName, true));
                dynamicTags.push(tagStr);
                proxyGeoInfo.set(tagStr, getGeoInfo2(ip));
                let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payloadVl = {
                  junk: randomJunk,
                  protocol: "vl",
                  mode: "proxyip",
                  panelIPs: []
                };
                let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));
                let configUuid = generateConfigUuid2(p.id, configIndex);
                registerConfigEntry(configUuid, p.id, "");
                let ob = {
                  type: k_vl_mode2,
                  tag: tagStr,
                  server: ip,
                  server_port: parseInt(port),
                  tcp_fast_open: sysConfig.enableOpt1 || false,
                  uuid: configUuid,
                  packet_encoding: "xudp",
                  network: "tcp",
                  tls: {
                    enabled: sec,
                    server_name: hName,
                    insecure: allowInsecure,
                    ...isSegEnabled(p) ? { fragment: true } : {},
                    alpn: ["http/1.1"],
                    utls: {
                      enabled: true,
                      fingerprint: "randomized"
                    }
                  },
                  transport: {
                    type: "ws",
                    path: pathStrVl,
                    max_early_data: 2560,
                    early_data_header_name: "Sec-WebSocket-Protocol",
                    headers: { Host: hName }
                  }
                };
                outboundsArr.push(ob);
              }
              if (isTrojan) {
                let tagStr = getUniqueName(getConfigName2("beta", p.name, port, hName, ip, null, configIndex, ipName, true));
                dynamicTags.push(tagStr);
                proxyGeoInfo.set(tagStr, getGeoInfo2(ip));
                let randomJunk = Array.from({ length: 11 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join("");
                let payloadTr = {
                  junk: randomJunk,
                  protocol: "tr",
                  mode: "proxyip",
                  panelIPs: [],
                  relayIdx: configIndex
                };
                let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
                let configUuid2 = generateConfigUuid2(p.id, configIndex);
                let ob = {
                  type: k_tr_mode2,
                  tag: tagStr,
                  server: ip,
                  server_port: parseInt(port),
                  tcp_fast_open: sysConfig.enableOpt1 || false,
                  password: p.id,
                  network: "tcp",
                  tls: {
                    enabled: sec,
                    server_name: hName,
                    insecure: allowInsecure,
                    ...isSegEnabled(p) ? { fragment: true } : {},
                    alpn: ["http/1.1"],
                    utls: {
                      enabled: true,
                      fingerprint: "randomized"
                    }
                  },
                  transport: {
                    type: "ws",
                    path: pathStrTr,
                    max_early_data: 2560,
                    early_data_header_name: "Sec-WebSocket-Protocol",
                    headers: { Host: hName }
                  }
                };
                outboundsArr.push(ob);
              }
              configIndex++;
            }
          });
        });
      });
    });
  });
  if (dynamicTags.length === 0) {
    dynamicTags.push("direct");
  }
  let parsedUpstream = parseVlessUri(sysConfig.upstreamUri);
  let upstreamTag = "";
  if (parsedUpstream) {
    let upstreamOb = upstreamToSingboxOb(parsedUpstream);
    upstreamTag = upstreamOb.tag;
    outboundsArr.forEach((ob) => {
      if (ob.type !== "direct" && ob.type !== "block" && ob.type !== "dns") {
        ob.detour = upstreamTag;
      }
    });
    outboundsArr.unshift(upstreamOb);
  }
  await fetchTemplates(env);
  if (singboxTemplate) {
    let tpl = JSON.parse(JSON.stringify(singboxTemplate));
    let newOutbounds = [];
    let allProxies = outboundsArr.map((o) => o.tag);
    for (let ob of tpl.outbounds) {
      if (ob === "__OUTBOUNDS__") {
        newOutbounds.push(...outboundsArr);
      } else if (ob.outbounds && ob.outbounds.includes("{all_proxies}")) {
        let obCpy = { ...ob };
        obCpy.outbounds = [];
        for (let tag of ob.outbounds) {
          if (tag === "{all_proxies}")
            obCpy.outbounds.push(...allProxies);
          else
            obCpy.outbounds.push(tag);
        }
        newOutbounds.push(obCpy);
      } else {
        newOutbounds.push(ob);
      }
    }
    tpl.outbounds = newOutbounds;
    return tpl;
  }
  return {
    log: { disabled: false, level: "warn", timestamp: true },
    dns: { servers: [], rules: [] },
    inbounds: [],
    [k_obds2]: outboundsArr,
    route: { rules: [] }
  };
}
var buildSingBoxJsonProfile = buildBoxJsonProfile;

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    try {
      if (!isolateStartTime)
        setIsolateStartTime(Date.now());
      try {
        incInflightHttp();
      } catch (e) {}
      if (configRegistry.size > 1e4) {
        configRegistry.clear();
        trojanHashCache.clear();
      }
      await loadSysConfig(env, ctx);
      try {
        const nowRs = Date.now();
        if (nowRs - lastRelaySweep > 60000) {
          setLastRelaySweep(nowRs);
          if (ctx && typeof ctx.waitUntil === "function") {
            ctx.waitUntil((async () => {
              try {
                await probeDeadRelays(env);
              } catch (e) {}
              try {
                await probeGraveyard(env);
              } catch (e) {}
            })());
          }
        }
      } catch (e) {}
      setActiveDeviceId(sysConfig.deviceId || generateHardwareId(sysConfig.apiRoute));
      const url = new URL(request.url);
      const upgradeHeader = request.headers.get("Upgrade");
      const isTelemetryStream = upgradeHeader && upgradeHeader.toLowerCase() === "websocket";
      let reqPath = url.pathname;
      if (reqPath.endsWith("/") && reqPath.length > 1)
        reqPath = reqPath.slice(0, -1);
      const routes = {
        data: `/${encodeURI(sysConfig.apiRoute)}`,
        dash: `/${encodeURI(sysConfig.apiRoute)}/dash`,
        auth: `/${encodeURI(sysConfig.apiRoute)}/api/auth`,
        sync: `/${encodeURI(sysConfig.apiRoute)}/api/sync`,
        tg: `/${encodeURI(sysConfig.apiRoute)}/tg`,
        syncPanel: `/${encodeURI(sysConfig.apiRoute)}/tg/sync_panel`,
        logs: `/${encodeURI(sysConfig.apiRoute)}/api/logs`,
        users: `/${encodeURI(sysConfig.apiRoute)}/api/users`,
        stats: `/${encodeURI(sysConfig.apiRoute)}/api/stats`,
        update: `/${encodeURI(sysConfig.apiRoute)}/api/update`,
        apiKeys: `/${encodeURI(sysConfig.apiRoute)}/api/keys`,
        optimiser: `/${encodeURI(sysConfig.apiRoute)}/optimiser`
      };
      const isSyncRoute = reqPath.endsWith("/api/sync");
      const isUsersRoute = reqPath === routes.users || reqPath.endsWith("/api/users");
      const isStatsRoute = reqPath === routes.stats || reqPath.endsWith("/api/stats");
      const isUpdateRoute = reqPath === routes.update || reqPath.endsWith("/api/update");
      const isApiKeysRoute = reqPath === routes.apiKeys || reqPath.endsWith("/api/keys");
      const isOptimiserRoute = reqPath === routes.optimiser || reqPath === "/cf-optimiser" || reqPath === "/optimiser";
      const isAuthorizedRoute = reqPath === routes.data || reqPath === routes.dash || reqPath === routes.auth || reqPath === routes.sync || reqPath === routes.tg || reqPath === routes.syncPanel || reqPath === routes.logs || isSyncRoute || isUsersRoute || isStatsRoute || isUpdateRoute || isApiKeysRoute || isOptimiserRoute;
      if (!isTelemetryStream && !isAuthorizedRoute) {
        return serveMaintenancePage(request, url);
      }
      if (sysConfig.maintenanceMode && (isTelemetryStream || reqPath === routes.data)) {
        if (isTelemetryStream)
          return new Response(null, { status: 503 });
        return new Response("Maintenance in progress, retry later", {
          status: 503,
          headers: { "Retry-After": "120" }
        });
      }
      if (!isTelemetryStream) {
        if (reqPath === routes.dash) {
          const dashboardUrl = env.DASHBOARD_URL || "https://raw.githubusercontent.com/itsyebekhe/nahan/main/dashboard.html";
          try {
            const resp = await fetchT(dashboardUrl);
            let html = await resp.text();
            html = html.replace(/__CURRENT_VERSION__/g, CURRENT_VERSION);
            if (env.IOT_DB !== undefined) {
              html = html.replace("__HAS_DB_WARNING__", "");
            } else {
              html = html.replace("__HAS_DB_WARNING__", `<div class="mb-5 p-4 rounded-2xl flex items-start gap-3" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);"><span style="color:#f87171;">&#9888;&#65039;</span><span class="text-sm" style="color:#fca5a5;" data-i18n="missing_db">Database not connected. Settings won't be saved.</span></div>`);
            }
            return new Response(html, {
              headers: { "Content-Type": "text/html;charset=utf-8" }
            });
          } catch (e) {
            return new Response("Failed to load dashboard", { status: 502 });
          }
        }
        if (isOptimiserRoute) {
          const optimiserUrl = env.OPTIMISER_URL || "https://raw.githubusercontent.com/itsyebekhe/nahan/main/cf-optimiser.html";
          try {
            const resp = await fetchT(optimiserUrl);
            let html = await resp.text();
            return new Response(html, {
              headers: { "Content-Type": "text/html;charset=utf-8" }
            });
          } catch (e) {
            return Response.redirect(`${url.origin}${routes.dash}#optimiser`, 302);
          }
        }
        if (reqPath === routes.auth) {
          if (request.method !== "POST")
            return new Response("405", { status: 405 });
          return await handleAuth(request, url.hostname, ctx, env);
        }
        if (reqPath === routes.sync || isSyncRoute) {
          if (request.method === "OPTIONS") {
            return new Response(null, {
              status: 204,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400"
              }
            });
          }
          if (request.method !== "POST")
            return new Response("405", { status: 405 });
          const syncRes = await handleConfigSync(request, env, ctx);
          syncRes.headers.set("Access-Control-Allow-Origin", "*");
          syncRes.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
          return syncRes;
        }
        if (reqPath === routes.logs) {
          if (request.method !== "POST" && request.method !== "GET")
            return new Response("405", { status: 405 });
          return await handleLogs(request, env);
        }
        if (isUsersRoute) {
          return await handleUsersApi(request, env, ctx);
        }
        if (isStatsRoute) {
          return await handleStatsApi(request, env);
        }
        if (isUpdateRoute) {
          return await handleUpdateApi(request, env, ctx);
        }
        if (isApiKeysRoute) {
          return await handleApiKeys(request, env, ctx);
        }
        if (reqPath === routes.syncPanel) {
          if (request.method !== "POST")
            return new Response("405", { status: 405 });
          return await handleSyncPanel(request, env, ctx);
        }
        if (reqPath === routes.tg) {
          if (request.method !== "POST")
            return new Response("405", { status: 405 });
          return await handleTelegramWebhook(request, env, url.hostname, ctx);
        }
        if (reqPath === routes.data) {
          const ua = (request.headers.get("User-Agent") || "").toLowerCase();
          const isCustomUaAllowed = sysConfig.subUserAgent && sysConfig.subUserAgent.trim().length > 0 && ua.includes(sysConfig.subUserAgent.trim().toLowerCase());
          const clientHost = request.headers.get("Host") || url.hostname;
          let targetSub = url.searchParams.get("sub");
          let hasMultiUser = sysConfig.users && sysConfig.users.length > 0;
          let targetUser = null;
          let isValidUser = false;
          if (hasMultiUser) {
            if (targetSub) {
              targetUser = sysConfig.users.find((u) => u.name.toLowerCase() === targetSub.toLowerCase() || u.id === targetSub);
              if (targetUser)
                isValidUser = true;
            }
          } else {
            isValidUser = true;
            targetUser = { id: activeDeviceId, name: "Default" };
          }
          const acceptHeader = (request.headers.get("Accept") || "").toLowerCase();
          const secFetchDest = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
          const isRealBrowser = (secFetchDest === "document" || acceptHeader.includes("text/html")) && (ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari") || ua.includes("applewebkit") || ua.includes("gecko") || ua.includes("opera") || ua.includes("edge")) && !ua.includes("cla" + "sh") && !ua.includes("si" + "ng-box") && !ua.includes("v" + "2r" + "ay") && !ua.includes("shadow" + "rocket") && !ua.includes("quantum" + "ult") && !ua.includes("surf" + "board") && !ua.includes("sta" + "sh");
          if (isRealBrowser && !isCustomUaAllowed) {
            if (isValidUser) {
              const subscriptionUrl = env.SUBSCRIPTION_URL || "https://raw.githubusercontent.com/itsyebekhe/nahan/main/subscription.html";
              try {
                const resp = await fetchT(subscriptionUrl);
                let html = await resp.text();
                const idClean = targetUser.id.replace(/-/g, "").toLowerCase();
                const sysU = sysUsageCache?.users?.[idClean] || { reqs: 0, dReqs: 0, lastDay: "" };
                const totalReqs = sysU.reqs || 0;
                const todayDate = new Date().toISOString().split("T")[0];
                const dailyReqs = sysU.lastDay === todayDate ? sysU.dReqs || 0 : 0;
                const limitTotal = targetUser.limitTotalReq || 0;
                const limitDaily = targetUser.limitDailyReq || 0;
                const totalBytesUsed = usageTotalBytes(sysU);
                const dailyBytesUsed = usageDailyBytes(sysU, todayDate);
                const limitTotalBytes = limitReqToBytes(limitTotal);
                const limitDailyBytes = limitReqToBytes(limitDaily);
                const totalGb = (totalBytesUsed / 1073741824).toFixed(2);
                const limitTotalGb = limitTotal ? (limitTotalBytes / 1073741824).toFixed(2) : "9999";
                const dailyGb = (dailyBytesUsed / 1073741824).toFixed(2);
                const limitDailyGb = limitDaily ? (limitDailyBytes / 1073741824).toFixed(2) : "9999";
                const totalPercent = limitTotal ? Math.min(100, totalBytesUsed / limitTotalBytes * 100).toFixed(1) : "0";
                const dailyPercent = limitDaily ? Math.min(100, dailyBytesUsed / limitDailyBytes * 100).toFixed(1) : "0";
                let expiryDateTxt = "2099-01-01";
                let isExpired = false;
                if (targetUser.expiryMs) {
                  expiryDateTxt = new Date(targetUser.expiryMs).toISOString().split("T")[0];
                  if (Date.now() > targetUser.expiryMs)
                    isExpired = true;
                }
                let statusCode = "active";
                if (targetUser.isPaused)
                  statusCode = "paused";
                else if (isExpired)
                  statusCode = "expired";
                else if (limitTotal && totalBytesUsed >= limitTotalBytes)
                  statusCode = "limit";
                else if (limitDaily && dailyBytesUsed >= limitDailyBytes)
                  statusCode = "dailyLimit";
                let cleanUrl = new URL(url.href);
                let panelUrlToUse = sysConfig.customPanelUrl;
                if (targetUser.userPanelUrl && targetUser.userPanelUrl.trim())
                  panelUrlToUse = targetUser.userPanelUrl.trim();
                if (panelUrlToUse) {
                  let customUrlStr = panelUrlToUse;
                  if (!customUrlStr.startsWith("http://") && !customUrlStr.startsWith("https://"))
                    customUrlStr = "https://" + customUrlStr;
                  try {
                    const customUrl = new URL(customUrlStr);
                    cleanUrl.protocol = customUrl.protocol;
                    cleanUrl.host = customUrl.host;
                  } catch (e) {}
                }
                cleanUrl.searchParams.delete("flag");
                cleanUrl.searchParams.delete("format");
                cleanUrl.searchParams.delete("type");
                cleanUrl.searchParams.delete("output");
                cleanUrl.searchParams.delete("raw");
                const syncNormal = cleanUrl.href;
                const syncRaw = cleanUrl.href + (cleanUrl.href.includes("?") ? "&flag=a" : "?flag=a");
                let totalProgress = "";
                if (limitTotal) {
                  totalProgress = `<div class="w-full rounded-full h-1.5 mt-3 overflow-hidden progress-bar-bg"><div class="h-1.5 rounded-full" style="background: var(--accent); width: ${totalPercent}%;"></div></div><p class="text-[10px] text-muted text-right mt-1.5" data-i18n="used">${totalPercent}% Used</p>`;
                } else {
                  totalProgress = '<p class="text-[10px] text-muted mt-2" data-i18n="unlimitedPlan">Unlimited Plan</p>';
                }
                let dailyProgress = "";
                if (limitDaily) {
                  dailyProgress = `<div class="w-full rounded-full h-1.5 mt-3 overflow-hidden progress-bar-bg"><div class="h-1.5 rounded-full" style="background: var(--amber-text); width: ${dailyPercent}%;"></div></div><p class="text-[10px] text-muted text-right mt-1.5" data-i18n="used">${dailyPercent}% Used</p>`;
                } else {
                  dailyProgress = '<p class="text-[10px] text-muted mt-2" data-i18n="noDailyLimit">No Daily Limit</p>';
                }
                html = html.replace(/__USER_NAME__/g, targetUser.name);
                html = html.replace(/__USER_ID__/g, targetUser.id);
                html = html.replace(/__STATUS_CODE__/g, statusCode);
                html = html.replace(/__TOTAL_GB__/g, totalGb);
                html = html.replace(/__LIMIT_TOTAL_GB__/g, limitTotalGb);
                html = html.replace(/__TOTAL_PERCENT__/g, totalPercent);
                html = html.replace(/__DAILY_GB__/g, dailyGb);
                html = html.replace(/__LIMIT_DAILY_GB__/g, limitDailyGb);
                html = html.replace(/__DAILY_PERCENT__/g, dailyPercent);
                html = html.replace(/__EXPIRY_DATE__/g, expiryDateTxt);
                html = html.replace(/__SYNC_NORMAL__/g, syncNormal);
                html = html.replace(/__SYNC_RAW__/g, syncRaw);
                html = html.replace(/__TOTAL_PROGRESS__/g, totalProgress);
                html = html.replace(/__DAILY_PROGRESS__/g, dailyProgress);
                return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
              } catch (e) {
                return new Response("Failed to load subscription page", { status: 502 });
              }
            } else {
              return serveMaintenancePage(request, url);
            }
          }
          if (hasMultiUser && !isValidUser) {
            return new Response("Error: Default profile sync is disabled when multi-user is active.", { status: 403 });
          }
          try {
            if (breakerLevel() >= 2 && !isRealBrowser) {
              return new Response("Server busy, retry later", {
                status: 429,
                headers: { "Retry-After": "60" }
              });
            }
          } catch (e) {}
          const allowInsecure = url.searchParams.get("insecure") === "true" || url.searchParams.get("allowInsecure") === "true" || url.searchParams.get("allow_insecure") === "1" || url.searchParams.get("allowInsecure") === "1";
          const resHeaders = new Headers;
          resHeaders.set("Cache-Control", "no-store");
          resHeaders.set("Access-Control-Allow-Origin", "*");
          let flag = (url.searchParams.get("flag") || url.searchParams.get("format") || url.searchParams.get("type") || url.searchParams.get("output") || "").toLowerCase();
          if (isValidUser && targetUser) {
            let idClean = targetUser.id.replace(/-/g, "").toLowerCase();
            let sysU = sysUsageCache?.users?.[idClean] || {
              reqs: 0,
              dReqs: 0
            };
            let totalReqs = sysU.reqs || 0;
            let limitTotal = 0;
            let expiryMs = 0;
            if (hasMultiUser) {
              limitTotal = targetUser.limitTotalReq || 0;
              expiryMs = targetUser.expiryMs || 0;
            } else {
              limitTotal = sysConfig.limitTotalReq || 0;
              expiryMs = sysConfig.expiryMs || 0;
            }
            let usedBytes = usageTotalBytes(sysU);
            let limitBytes = limitReqToBytes(limitTotal);
            let expireSec = expiryMs ? Math.floor(expiryMs / 1000) : 0;
            const subUserInfo = `upload=0; download=${usedBytes}; total=${limitBytes}; expire=${expireSec}`;
            resHeaders.set("Subscription-UserInfo", subUserInfo);
            resHeaders.set("subscription-userinfo", subUserInfo);
            resHeaders.set("Profile-Update-Interval", "12");
            resHeaders.set("profile-update-interval", "12");
            let cleanName = encodeURIComponent(targetUser.name);
            resHeaders.set("Content-Disposition", `attachment; filename="${cleanName}"; filename*=UTF-8''${cleanName}`);
          }
          let isClashYaml = false;
          let isSingboxJson = false;
          let isClashJson = false;
          let isVJson = false;
          if (flag === getGamma() || flag === "yaml" || flag === "meta" || flag === "sta" + "sh" || flag === getGamma() + "-meta" || flag === "y") {
            isClashYaml = true;
          } else if (flag === "b" || flag === "c_legacy") {
            isClashJson = true;
          } else if (flag === "sing" || flag === "si" + "ngbox" || flag === "si" + "ng-box" || flag === "sb" || flag === "s" || flag === "c" || flag === "g") {
            isSingboxJson = true;
          } else if (flag === "vjson" || flag === "v") {
            isVJson = true;
          } else if (flag === "base64") {} else if (flag === "a" || flag === "raw" || flag === "") {
            if (ua.includes(getGamma()) || ua.includes("meta") || ua.includes("sta" + "sh") || ua.includes("verge") || ua.includes("mihomo") || ua.includes("cfw")) {
              isClashYaml = true;
            } else if (ua.includes("si" + "ng-box") || ua.includes("si" + "ngbox") || ua.includes("hiddify") || ua.includes("nekobox") || ua.includes("sfa") || ua.includes("karing")) {
              isSingboxJson = true;
            }
          }
          if (isClashYaml) {
            resHeaders.set("Content-Type", "text/yaml; charset=utf-8");
            return new Response(await buildYamlProfile(clientHost, targetSub, allowInsecure, env), {
              headers: resHeaders
            });
          } else if (isSingboxJson) {
            resHeaders.set("Content-Type", "application/json; charset=utf-8");
            return new Response(JSON.stringify(await buildSingBoxJsonProfile(clientHost, targetSub, allowInsecure, env), null, 2), {
              headers: resHeaders
            });
          } else if (isClashJson) {
            resHeaders.set("Content-Type", "application/json; charset=utf-8");
            return new Response(JSON.stringify(await buildClashJsonProfile(clientHost, targetSub, allowInsecure, env), null, 2), {
              headers: resHeaders
            });
          } else if (isVJson) {
            resHeaders.set("Content-Type", "application/json; charset=utf-8");
            return new Response(JSON.stringify(await buildVJsonProfile(clientHost, targetSub, allowInsecure, env), null, 2), { headers: resHeaders });
          } else {
            resHeaders.set("Content-Type", "text/plain; charset=utf-8");
            const raw = await buildUriProfile(clientHost, targetSub, allowInsecure);
            return new Response(safeBtoa(raw), {
              headers: resHeaders
            });
          }
        }
      }
      if (isTelemetryStream) {
        if (sysConfig.isPaused)
          return new Response(null, { status: 503 });
        try {
          const wip = request.headers.get("cf-connecting-ip") || "unknown";
          const wr = wsRateCheck(wip);
          if (wr === "refuse")
            return new Response("Too many requests", {
              status: 429,
              headers: { "Retry-After": "60" }
            });
          if (wr === "tarpit")
            await sleepMs(1500);
        } catch (e) {}
        try {
          if (breakerLevel() >= 2)
            await sleepMs(1000);
        } catch (e) {}
        let wsRelayIdx = -1;
        try {
          const riParam = url.searchParams.get("ri");
          if (riParam !== null)
            wsRelayIdx = parseInt(riParam, 10);
        } catch (e) {}
        if (wsRelayIdx < 0) {
          try {
            const lastSeg = url.pathname.split("/").pop();
            if (lastSeg) {
              const num = parseInt(lastSeg, 10);
              if (!isNaN(num) && num >= 0)
                wsRelayIdx = num;
            }
          } catch (e) {}
        }
        if (wsRelayIdx < 0) {
          try {
            const lastSeg = url.pathname.split("/").pop();
            if (lastSeg) {
              const decoded = JSON.parse(atob(lastSeg));
              if (typeof decoded.relayIdx === "number")
                wsRelayIdx = decoded.relayIdx;
            }
          } catch (e) {}
        }
        return await processTelemetryStream(env, ctx, wsRelayIdx);
      }
      return new Response(null, { status: 404 });
    } catch (err) {
      return new Response(null, { status: 404 });
    } finally {
      try {
        decInflightHttp();
      } catch (e) {}
    }
  },
  async scheduled(event, env, ctx) {
    try {
      await loadSysConfig(env, ctx);
      if (sysConfig.autoUpdate && sysConfig.cfAccountId && sysConfig.cfApiToken && sysConfig.cfWorkerName) {
        const repo = (sysConfig.githubRepo || "itsyebekhe/nahan").replace(/https?:\/\/github\.com\//, "").trim();
        let remoteVer = null;
        try {
          const res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/version`);
          if (res.ok) {
            remoteVer = (await res.text()).trim();
          }
        } catch (e) {}
        if (remoteVer && cmpVersions(CURRENT_VERSION, remoteVer) < 0) {
          try {
            let res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/_worker.encode.js`);
            if (!res.ok) {
              res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/_worker.encoded.js`);
              if (!res.ok) {
                res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/_worker.js`);
              }
            }
            if (!res.ok)
              throw new Error(`HTTP ${res.status}`);
            let latestCode = await res.text();
            const deployRes = await deployWorkerToCloudflare(sysConfig.cfAccountId, sysConfig.cfApiToken, sysConfig.cfWorkerName, latestCode);
            const deployResult = await deployRes.json();
            if (deployResult.success) {
              await logActivity(env, "Auto-Update Success", `Auto-updated to v${remoteVer} (encoded)`);
              if (sysConfig.linkedPanels && Array.isArray(sysConfig.linkedPanels)) {
                for (const p of sysConfig.linkedPanels) {
                  if (p && p.url && p.apiKey) {
                    let cleanUrl = p.url.trim();
                    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
                      cleanUrl = "https://" + cleanUrl;
                    }
                    try {
                      const parsed = new URL(cleanUrl);
                      const targetUrl = `${parsed.protocol}//${parsed.host}/${encodeURI(sysConfig.apiRoute)}/api/update`;
                      ctx?.waitUntil(fetchT(targetUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          key: p.apiKey,
                          action: "deploy",
                          code: latestCode,
                          force: true
                        }),
                        signal: AbortSignal.timeout(15000)
                      }).catch(() => {}));
                    } catch (err) {}
                  }
                }
              }
            }
          } catch (e) {
            await logActivity(env, "Auto-Update Failed", `Auto-update failed: ${e.message}`);
          }
        }
      }
    } catch (e) {}
  }
};
export {
  src_default as default
};
