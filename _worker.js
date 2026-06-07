import { connect } from "cloudflare:sockets";

/* * Project Nahan (نهان) - IoT Device Telemetry Gateway
 * Handles real-time binary streams from remote sensor nodes.
 * v2.1.0 + Smart Routing + Config Caching + AI Integration
 */

const CURRENT_VERSION = "2.1.0-optim";

const getAlpha = () => String.fromCharCode(118, 108, 101, 115, 115);
const getBeta = () => String.fromCharCode(116, 114, 111, 106, 97, 110);
const getGamma = () => String.fromCharCode(99, 108, 97, 115, 104);

const SYSTEM_DEFAULTS = {
    apiRoute: "sync",
    maintenanceHost: "https://www.ubuntu.com, https://www.docker.com",
    backupRelay: "",
    customRelay: "",
    masterKey: "admin",
    metricNode: "time.is",
    cleanIps: "",
    deviceId: "",
    mode: "alpha",
    agent: "chrome",
    socketPort: "443",
    resolveIp: "1.1.1.1",
    cascade: "",
    enableOpt1: false,
    enableOpt2: false,
    tgToken: "",
    tgChatId: "",
    cfAccountId: "",
    cfApiToken: "",
    isPaused: false,
    silentAlerts: false,
    githubRepo: "itsyebekhe/nahan",
    users: [],
};

let sysConfig = { ...SYSTEM_DEFAULTS };
let isolateStartTime = Date.now();
let activeConnections = 0;
let uuidUsage = new Map();
let activeDeviceId = "";

let sysUsageCache = { users: {} };
let lastSysUsageSync = 0;

// --- سیستم هوشمند و کشینگ (اضافه‌شده) ---
let configCacheTime = 0;
let ipHealth = new Map();
const PENALTY_DECAY_TIME = 60000;

function getBestRelay(relayString) {
    if (!relayString) return ["pro", "xy", "ip.cmliussss.net"].join("");
    let relays = relayString.split(/[\r\n,;]+/).map(s => s.trim()).filter(Boolean);
    if (relays.length === 0) return ["pro", "xy", "ip.cmliussss.net"].join("");
    if (relays.length === 1) return relays[0];

    relays.sort((a, b) => (ipHealth.get(a) || 0) - (ipHealth.get(b) || 0));
    return relays[0];
}

function reportRelayFailure(ip) {
    let currentPenalty = ipHealth.get(ip) || 0;
    ipHealth.set(ip, currentPenalty + 1);
    setTimeout(() => {
        let val = ipHealth.get(ip);
        if (val > 0) ipHealth.set(ip, val - 1);
    }, PENALTY_DECAY_TIME);
}
// ----------------------------------------

function trackUsage(uuid, bytes, env, ctx) {
    if (!sysUsageCache) sysUsageCache = { users: {} };
    if (!sysUsageCache.users) sysUsageCache.users = {};
    if (!sysUsageCache.users[uuid]) sysUsageCache.users[uuid] = { b: 0 };
    sysUsageCache.users[uuid].b += bytes;
    
    const now = Date.now();
    if (now - lastSysUsageSync > 10000) {
        lastSysUsageSync = now;
        if (env && env.IOT_DB) {
            ctx?.waitUntil(env.IOT_DB.put("sys_usage", JSON.stringify(sysUsageCache)).catch(()=>{}));
        }
    }
}

export default {
    async fetch(request, env, ctx) {
        try {
            await loadSysConfig(env);
            activeDeviceId = sysConfig.deviceId || generateHardwareId(sysConfig.apiRoute);

            const url = new URL(request.url);
            const upgradeHeader = request.headers.get("Upgrade");
            const isTelemetryStream = upgradeHeader && upgradeHeader.toLowerCase() === "websocket";

            let reqPath = url.pathname;
            if (reqPath.endsWith("/") && reqPath.length > 1) reqPath = reqPath.slice(0, -1);

            const routes = {
                data: `/${encodeURI(sysConfig.apiRoute)}`,
                dash: `/${encodeURI(sysConfig.apiRoute)}/dash`,
                auth: `/${encodeURI(sysConfig.apiRoute)}/api/auth`,
                sync: `/${encodeURI(sysConfig.apiRoute)}/api/sync`,
                tg: `/${encodeURI(sysConfig.apiRoute)}/tg`,
                logs: `/${encodeURI(sysConfig.apiRoute)}/api/logs`,
            };

            const isAuthorizedRoute = reqPath === routes.data || reqPath === routes.dash || reqPath === routes.auth || reqPath === routes.sync || reqPath === routes.tg || reqPath === routes.logs;

            if (!isTelemetryStream && !isAuthorizedRoute) {
                return serveMaintenancePage(request, url);
            }

            if (!isTelemetryStream) {
                if (reqPath === routes.dash) {
                    return new Response(getDashboardUI(env.IOT_DB !== undefined), { headers: { "Content-Type": "text/html;charset=utf-8" } });
                }
                if (reqPath === routes.auth) {
                    if (request.method !== "POST") return new Response("405", { status: 405 });
                    return await handleAuth(request, url.hostname, ctx, env);
                }
                if (reqPath === routes.sync) {
                    if (request.method !== "POST") return new Response("405", { status: 405 });
                    return await handleConfigSync(request, env, ctx);
                }
                if (reqPath === routes.logs) {
                    if (request.method !== "POST" && request.method !== "GET") return new Response("405", { status: 405 });
                    return await handleLogs(request, env);
                }
                if (reqPath === routes.tg) {
                    if (request.method !== "POST") return new Response("405", { status: 405 });
                    return await handleTelegramWebhook(request, env, url.hostname);
                }
                if (reqPath === routes.data) {
                    const ua = (request.headers.get("User-Agent") || "").toLowerCase();
                    if (ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari") || ua.includes("applewebkit")) {
                        return serveMaintenancePage(request, url);
                    }
                    const clientHost = request.headers.get("Host") || url.hostname;
                    let targetSub = url.searchParams.get("sub");
                    let hasMultiUser = (sysConfig.users && sysConfig.users.length > 0);
                    if (hasMultiUser && (!targetSub || targetSub.toLowerCase() === 'default')) {
                        return new Response("Error: Default profile sync is disabled when multi-user is active.", { status: 403 });
                    }
                    if (ua.includes(getGamma()) || ua.includes("meta") || ua.includes("stash")) {
                        return new Response(buildYamlProfile(clientHost, targetSub));
                    } else {
                        const raw = buildUriProfile(clientHost, targetSub);
                        return new Response(btoa(raw));
                    }
                }
            }

            if (isTelemetryStream) {
                if (sysConfig.isPaused) return new Response(null, { status: 503 });
                return await processTelemetryStream(env, ctx);
            }

            return new Response(null, { status: 404 });
        } catch (err) {
            return new Response(null, { status: 404 });
        }
    },
};

async function serveMaintenancePage(request, url) {
    let fakeList = sysConfig.maintenanceHost ? sysConfig.maintenanceHost.split(/[\r\n,;]+/).map(s => s.trim()).filter(Boolean) : ["https://www.ubuntu.com"];
    const clientIP = request.headers.get("cf-connecting-ip") || "0.0.0.0";
    const ipHash = Array.from(clientIP).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const targetStr = fakeList[ipHash % fakeList.length].startsWith('http') ? fakeList[ipHash % fakeList.length] : `https://${fakeList[ipHash % fakeList.length]}`;

    try {
        const targetUrl = new URL(targetStr);
        if (url.pathname !== "/") targetUrl.pathname = url.pathname;
        targetUrl.search = url.search;
        const cleanHeaders = new Headers(request.headers);
        cleanHeaders.set("Host", targetUrl.hostname);
        cleanHeaders.delete("cf-connecting-ip");
        cleanHeaders.delete("x-forwarded-for");
        const fetchInit = { method: request.method, headers: cleanHeaders, redirect: "manual" };
        if (request.method !== "GET" && request.method !== "HEAD") fetchInit.body = request.body;
        return await fetch(new Request(targetUrl.toString(), fetchInit));
    } catch (e) { return new Response("Not Found", { status: 404 }); }
}

async function loadSysConfig(env) {
    const now = Date.now();
    // سیستم کش تنظیمات برای جلوگیری از تاخیر زیاد دیتابیس
    if (now - configCacheTime < 60000 && sysConfig.deviceId) return;

    let dbData = null;
    if (env.IOT_DB) {
        try { const stored = await env.IOT_DB.get("sys_config"); if (stored) dbData = JSON.parse(stored); } catch (e) { }
        try { const ustored = await env.IOT_DB.get("sys_usage"); if (ustored) sysUsageCache = JSON.parse(ustored); } catch (e) { }
    }
    sysConfig = { ...SYSTEM_DEFAULTS, ...dbData };
    let externalRelayFromDb = null;
    if (env.IOT_DB) {
        try { externalRelayFromDb = await env.IOT_DB.get("backup_ip"); } catch (e) { }
    }
    const defaultRelay = ["pro", "xy", "ip.cmliussss.net"].join("");
    sysConfig.customRelay = externalRelayFromDb ?? env.RELAY_IP ?? defaultRelay;
    
    configCacheTime = now;
}

async function fetchCloudflareUsage(accountId, apiToken) {
    if (!accountId || !apiToken) return null;
    try {
        const d = new Date();
        const currentDate = d.toISOString().split('T')[0] + "T00:00:00Z";
        
        const query = `query GetDailyUsage($accountId: String!, $start: ISO8601DateTime!) { viewer { accounts(filter: {accountTag: $accountId}) { workersInvocationsAdaptive(limit: 1, filter: { datetime_geq: $start }) { sum { requests } } } } }`;
        const variables = { accountId: accountId, start: currentDate };
        
        const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query, variables })
        });
        
        const json = await res.json();
        const reqs = json?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive?.[0]?.sum?.requests;
        return typeof reqs === 'number' ? reqs : null;
    } catch(e) {
        return null;
    }
}

async function sendTelegramMessage(request, type) {
    if (!sysConfig.tgToken || !sysConfig.tgChatId) return;

    let usageStr = "نامشخص (0.00%)";
    if (sysConfig.cfAccountId && sysConfig.cfApiToken) {
        const reqs = await fetchCloudflareUsage(sysConfig.cfAccountId, sysConfig.cfApiToken);
        if (reqs !== null) {
            const limit = 100000;
            const pct = ((reqs / limit) * 100).toFixed(2);
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

    const d = new Date();
    const timeStr = new Intl.DateTimeFormat('fa-IR', { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
    }).format(d);

    const text = `📌 نوع: ${type}\n` +
                 `🌐 IP: ${ip}\n` +
                 `📍 موقعیت: ${country} ${city}\n` +
                 `🏢 ASN: AS${asn} ${asOrg}\n` +
                 `🔗 دامنه: ${domain}\n` +
                 `🔍 مسیر: ${path}\n` +
                 `🤖 مرورگر: ${ua}\n` +
                 `📅 زمان: ${timeStr}\n` +
                 `📊 مصرف: ${usageStr}`;

    const panelUrl = `https://${domain}/${encodeURI(sysConfig.apiRoute)}/dash`;

    const tgUrl = `https://api.telegram.org/bot${sysConfig.tgToken}/sendMessage`;
    try {
        await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: sysConfig.tgChatId,
                text: text,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "ورود به پنل 🔐", web_app: { url: panelUrl } }],
                        [
                            { text: "دریافت ساب 🔗", callback_data: "get_sub" },
                            { text: "بروزرسانی مصرف 📊", callback_data: "get_usage" }
                        ]
                    ]
                }
            })
        });
    } catch (e) {}
}

async function logActivity(env, type, detail) {
    if (!env || !env.IOT_DB) return;
    try {
        const ts = new Date().toISOString();
        let logs = [];
        const stored = await env.IOT_DB.get("sys_logs");
        if (stored) logs = JSON.parse(stored);
        logs.unshift({ ts, type, detail });
        if (logs.length > 50) logs = logs.slice(0, 50);
        await env.IOT_DB.put("sys_logs", JSON.stringify(logs));
    } catch (e) {}
}

async function handleLogs(request, env) {
    try {
        if (request.method === "POST") {
            const data = await request.json();
            if (data.key !== sysConfig.masterKey) return new Response(JSON.stringify({ success: false }), { status: 401 });
            let logs = [];
            if (env.IOT_DB) {
                const stored = await env.IOT_DB.get("sys_logs");
                if (stored) logs = JSON.parse(stored);
            }
            return new Response(JSON.stringify({ success: true, logs }), { status: 200 });
        }
        return new Response("OK", { status: 200 });
    } catch (e) { return new Response(JSON.stringify({ success: false }), { status: 400 }); }
}

async function handleAuth(request, hostName, ctx, env) {
    try {
        const data = await request.json();
        const ip = request.headers.get("cf-connecting-ip") || "Unknown";
        if (data.key === sysConfig.masterKey) {
            ctx?.waitUntil(logActivity(env, "Auth Success", `Successful panel login from ${ip}`));
            if (!sysConfig.silentAlerts && ctx) ctx.waitUntil(sendTelegramMessage(request, "ورود به پنل (موفق)"));
            const netInfo = {
                ip: ip,
                colo: request.cf?.colo || "Unknown",
                loc: (request.cf?.city || "Unknown") + ", " + (request.cf?.country || "Unknown")
            };
            let usageData = {};
            for(let [k,v] of uuidUsage.entries()) usageData[k] = v;
            return new Response(JSON.stringify({
                success: true, config: sysConfig, deviceId: activeDeviceId, network: netInfo, usage: usageData, sysUsage: (sysUsageCache && sysUsageCache.users) ? sysUsageCache.users : {},
                version: CURRENT_VERSION,
                profiles: getAllProfiles().map(p => ({
                    name: p.name,
                    id: p.id,
                    sync: `https://${hostName}/${sysConfig.apiRoute}${p.name === 'Default' ? '' : '?sub=' + encodeURIComponent(p.name)}`
                }))
            }), { status: 200 });
        }
        ctx?.waitUntil(logActivity(env, "Auth Failed", `Failed login attempt from ${ip}`));
        if (ctx) ctx.waitUntil(sendTelegramMessage(request, "تلاش ناموفق ورود به پنل!"));
        return new Response(JSON.stringify({ success: false }), { status: 401 });
    } catch (e) { return new Response(JSON.stringify({ success: false }), { status: 400 }); }
}

async function handleConfigSync(request, env, ctx) {
    try {
        const data = await request.json();
        if (data.key !== sysConfig.masterKey) return new Response(JSON.stringify({ success: false }), { status: 401 });
        if (!env.IOT_DB) return new Response(JSON.stringify({ success: false, msg: "DB Error" }), { status: 400 });
        const nextConfig = { ...sysConfig, ...data.config };
        sysConfig = nextConfig;
        
        await env.IOT_DB.put("sys_config", JSON.stringify(nextConfig));
        configCacheTime = 0; // Invalidate cache
        
        if (nextConfig.tgToken && ctx) {
            const hookUrl = `https://${new URL(request.url).hostname}/${encodeURI(nextConfig.apiRoute)}/tg`;
            ctx.waitUntil(fetch(`https://api.telegram.org/bot${nextConfig.tgToken}/setWebhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: hookUrl })
            }).catch(()=>{}));
        }

        return new Response(JSON.stringify({ success: true, newRoute: nextConfig.apiRoute }), { status: 200 });
    } catch (e) { return new Response(JSON.stringify({ success: false }), { status: 400 }); }
}

async function handleTelegramWebhook(request, env, hostName) {
    try {
        const update = await request.json();
        const tgApi = `https://api.telegram.org/bot${sysConfig.tgToken}`;
        
        if (update.callback_query) {
            const cb = update.callback_query;
            const chatId = cb.message?.chat?.id;
            const data = cb.data;

            if (chatId) {
                if (data === "get_usage") {
                    let usageStr = "نامشخص (0.00%)";
                    if (sysConfig.cfAccountId && sysConfig.cfApiToken) {
                        const reqs = await fetchCloudflareUsage(sysConfig.cfAccountId, sysConfig.cfApiToken);
                        if (reqs !== null) {
                            const pct = ((reqs / 100000) * 100).toFixed(2);
                            usageStr = `${reqs}/100000 (${pct}%)`;
                        } else {
                            usageStr = "خطا در دریافت مصرف";
                        }
                    } else {
                        usageStr = "مقادیر CF تنظیم نشده است";
                    }

                    await fetch(`${tgApi}/answerCallbackQuery`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ callback_query_id: cb.id, text: `مصرف روزانه:\n${usageStr}`, show_alert: true })
                    });
                } else if (data === "get_sub") {
                    const subSync = `https://${hostName}/${encodeURI(sysConfig.apiRoute)}`;
                    await fetch(`${tgApi}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            chat_id: chatId, 
                            text: `🔗 **لینک استریم شما:**\n\n<code>${subSync}</code>`, 
                            parse_mode: 'HTML' 
                        })
                    });
                    await fetch(`${tgApi}/answerCallbackQuery`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ callback_query_id: cb.id, text: "لینک استریم ارسال شد." })
                    });
                } else if (data === "cb_pause") {
                    sysConfig.isPaused = true;
                    await env.IOT_DB.put("sys_config", JSON.stringify({ ...sysConfig, isPaused: true }));
                    configCacheTime = 0;
                    await fetch(`${tgApi}/answerCallbackQuery`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: cb.id, text: "سیستم متوقف شد. 🔴" }) });
                } else if (data === "cb_resume") {
                    sysConfig.isPaused = false;
                    await env.IOT_DB.put("sys_config", JSON.stringify({ ...sysConfig, isPaused: false }));
                    configCacheTime = 0;
                    await fetch(`${tgApi}/answerCallbackQuery`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: cb.id, text: "سیستم مجدداً فعال شد. 🟢" }) });
                }
            }
        } else if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            
            if (chatId.toString() === sysConfig.tgChatId.toString()) {
                const text = update.message.text;
                if (text === "/status") {
                    await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `وضعیت سیستم: ${sysConfig.isPaused ? "🔴 متوقف شده" : "🟢 فعال"}` }) });
                } else if (text === "/pause") {
                    sysConfig.isPaused = true;
                    await env.IOT_DB.put("sys_config", JSON.stringify({ ...sysConfig, isPaused: true }));
                    configCacheTime = 0;
                    await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: "🔴 جریان داده‌ها متوقف شد." }) });
                } else if (text === "/resume") {
                    sysConfig.isPaused = false;
                    await env.IOT_DB.put("sys_config", JSON.stringify({ ...sysConfig, isPaused: false }));
                    configCacheTime = 0;
                    await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: "🟢 جریان داده‌ها مجدداً برقرار شد." }) });
                } else if (text === "/ping") {
                    const upSeconds = Math.floor((Date.now() - isolateStartTime)/1000);
                    const dh = Math.floor(upSeconds/3600);
                    const dm = Math.floor((upSeconds%3600)/60);
                    await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `🟢 Gateway Health:\n\n⏱ Uptime: ${dh}h ${dm}m\n📡 Active Streams: ${activeConnections}` }) });
                } else if (text === "/panic") {
                    sysConfig.apiRoute = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2,'0')).join('');
                    sysConfig.isPaused = true;
                    await env.IOT_DB.put("sys_config", JSON.stringify(sysConfig));
                    configCacheTime = 0;
                    await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `🚨 PANIC MODE ACTIVATED 🚨\n\nRoute randomized & System Paused.\nAccess Revoked.` }) });
                } else if (text.startsWith("/ai ")) {
                    const prompt = text.replace("/ai ", "");
                    await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: "🧠 در حال پردازش..." }) });
                    try {
                        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
                            messages: [{ role: "user", content: prompt }]
                        });
                        await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `🤖 **هوش مصنوعی:**\n\n${aiResponse.response}`, parse_mode: 'Markdown' }) });
                    } catch (e) {
                        await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: "❌ خطا در ارتباط با هوش مصنوعی. مطمئن شوید Binding مربوطه (AI) در پنل کلودفلر ست شده باشد." }) });
                    }
                } else if (text.startsWith("/users")) {
                    let umsg = "👥 لیست کاربران:\n\n";
                    if(!sysConfig.users || sysConfig.users.length === 0) umsg += "کاربری یافت نشد.";
                    else {
                        sysConfig.users.forEach(u => {
                            let ub = sysUsageCache?.users?.[u.id.replace(/-/g,'').toLowerCase()]?.b || 0;
                            let mb = (ub / (1024*1024)).toFixed(2);
                            umsg += `👤 ${u.name}\nUUID: ${u.id}\nمصرف: ${mb} MB ${u.limitGb ? '/ ' + u.limitGb + ' GB' : ''}\n\n`;
                        });
                    }
                    await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: umsg }) });
                } else if (text.startsWith("/adduser")) {
                    const parts = text.split(" ");
                    if(parts.length < 2) {
                        await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: "طرز استفاده: /adduser [name] [gb_limit] [days_limit]" }) });
                    } else {
                        const name = parts[1];
                        const gb = parts[2] ? parseFloat(parts[2]) : null;
                        const days = parts[3] ? parseInt(parts[3]) : null;
                        const newUuid = crypto.randomUUID();
                        if(!sysConfig.users) sysConfig.users = [];
                        sysConfig.users.push({
                            id: newUuid, name: name, limitGb: gb,
                            expiryMs: days ? Date.now() + days*86400000 : null,
                            createdAt: Date.now()
                        });
                        await env.IOT_DB.put("sys_config", JSON.stringify(sysConfig));
                        configCacheTime = 0;
                        await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `✅ کاربر جدید اضافه شد.\n\nنام: ${name}\nUUID: ${newUuid}\nحجم: ${gb ? gb + ' GB' : 'نامحدود'}\nاعتبار: ${days ? days + ' روز' : 'نامحدود'}` }) });
                    }
                } else if (text.startsWith("/deluser")) {
                    const parts = text.split(" ");
                    if(parts.length < 2) {
                        await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: "طرز استفاده: /deluser [uuid]" }) });
                    } else {
                        const initLen = sysConfig.users ? sysConfig.users.length : 0;
                        if(sysConfig.users) sysConfig.users = sysConfig.users.filter(u => u.id !== parts[1]);
                        if(sysConfig.users.length < initLen) {
                            await env.IOT_DB.put("sys_config", JSON.stringify(sysConfig));
                            configCacheTime = 0;
                            await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: "✅ کاربر حذف شد." }) });
                        } else {
                            await fetch(`${tgApi}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: "❌ کاربری با این UUID یافت نشد." }) });
                        }
                    }
                } else {
                    const panelUrl = `https://${hostName}/${encodeURI(sysConfig.apiRoute)}/dash`;
                    await fetch(`${tgApi}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: "🤖 **ربات سیستم نهان**\nانتخاب کنید:\n\nدستورات سریع:\n/pause - توقف اتصالات\n/resume - از سرگیری\n/status - وضعیت\n/ping - پراکسی وضعیت\n/users - لیست کاربران\n/adduser [name] [gb] [days] - افزودن کاربر\n/deluser [uuid] - حذف کاربر\n/panic - قطع دسترسی 🚨\n/ai [text] - گفتگو با هوش مصنوعی 🧠",
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "ورود به کنترل‌پنل 🔐", web_app: { url: panelUrl } }],
                                    [
                                        { text: "دریافت استریم 🔗", callback_data: "get_sub" },
                                        { text: "بررسی محدودیت 📊", callback_data: "get_usage" }
                                    ],
                                    [
                                        { text: sysConfig.isPaused ? "▶️ شروع سیستم" : "⏸ توقف سیستم", callback_data: sysConfig.isPaused ? "cb_resume" : "cb_pause" }
                                    ]
                                ]
                            }
                        })
                    });
                }
            }
        }
        return new Response("OK", { status: 200 });
    } catch(e) {
        return new Response("OK", { status: 200 });
    }
}

async function processTelemetryStream(env, ctx) {
    const [client, webSocket] = Object.values(new WebSocketPair());
    webSocket.accept();
    webSocket.binaryType = "arraybuffer";
    startDataPipe(webSocket, env, ctx);
    return new Response(null, { status: 101, webSocket: client });
}

async function startDataPipe(webSocket, env, ctx) {
    activeConnections++;
    webSocket.addEventListener('close', () => activeConnections--);
    webSocket.addEventListener('error', () => activeConnections--);
    let remoteSocket, dataWriter, isInit = true, queue = Promise.resolve();
    let activeClientHash = null;
    webSocket.addEventListener("message", (event) => {
        queue = queue.then(async () => {
            try {
                if (isInit) {
                    isInit = false;
                    const isModeAlpha = await parseSensorData(event.data);
                    if (isModeAlpha) webSocket.send(new Uint8Array([0, 0]));
                } else if (dataWriter) {
                    await dataWriter.write(event.data);
                    if (activeClientHash) trackUsage(activeClientHash, event.data.byteLength, env, ctx);
                }
            } catch (err) { webSocket.close(); }
        });
    });

    async function parseSensorData(bufferData) {
        const view = new Uint8Array(bufferData);
        let targetAddr = "", targetPort = 0, offset = 0, isModeAlpha = false;

        if (view[0] === 0x00) {
            isModeAlpha = true;
            
            // Validate UUID
            let clientHash = Array.from(view.slice(1, 17)).map(b => b.toString(16).padStart(2, '0')).join('');
            let validUUIDs = getAllProfiles().map(p => p.id.replace(/-/g, '').toLowerCase());
            if (!validUUIDs.includes(clientHash)) return false; // DROP IF INVALID PROFILE
            
            activeClientHash = clientHash;
            
            let uTrack = uuidUsage.get(clientHash) || { connects: 0, last: 0 };
            uTrack.connects++;
            uTrack.last = Date.now();
            uuidUsage.set(clientHash, uTrack);
            
            const optLen = view[17];
            const pPos = 18 + optLen + 1;
            targetPort = new DataView(bufferData.slice(pPos, pPos + 2)).getUint16(0);
            const aType = view[pPos + 2];
            let vPos = pPos + 3, aLen = 0;

            if (aType === 1) { aLen = 4; targetAddr = view.slice(vPos, vPos + aLen).join("."); }
            else if (aType === 2) { aLen = view[vPos]; vPos++; targetAddr = new TextDecoder().decode(view.slice(vPos, vPos + aLen)); }
            else if (aType === 3) { aLen = 16; const dv = new DataView(bufferData.slice(vPos, vPos + aLen)); targetAddr = Array.from({ length: 8 }, (_, i) => dv.getUint16(i * 2).toString(16)).join(":"); }
            offset = vPos + aLen;
        } else {
            let ePos = bufferData.byteLength;
            for (let i = 0; i < bufferData.byteLength; i++) { if (view[i] === 0x0D && view[i + 1] === 0x0A) { ePos = i; break; } }
            let hPos = ePos + 2; hPos++;
            let aType = view[hPos]; hPos++; let aLen = 0;

            if (aType === 1) { aLen = 4; targetAddr = view.slice(hPos, hPos + aLen).join("."); }
            else if (aType === 3) { aLen = view[hPos]; hPos++; targetAddr = new TextDecoder().decode(view.slice(hPos, hPos + aLen)); }
            else if (aType === 4) { aLen = 16; const dv = new DataView(bufferData.slice(hPos, hPos + aLen)); targetAddr = Array.from({ length: 8 }, (_, i) => dv.getUint16(i * 2).toString(16)).join(":"); }

            hPos += aLen;
            targetPort = new DataView(bufferData.slice(hPos, hPos + 2)).getUint16(0);
            offset = hPos + 4;
        }

        try {
            remoteSocket = connect({ hostname: targetAddr, port: targetPort });
            await remoteSocket.opened;
        } catch {
            const bestFallback = getBestRelay(sysConfig.backupRelay);
            try {
                const [altIP, altPortStr] = bestFallback.split(":");
                remoteSocket = connect({ hostname: altIP, port: altPortStr ? Number(altPortStr) : targetPort });
                await remoteSocket.opened;
            } catch { 
                if (bestFallback) reportRelayFailure(bestFallback);
                webSocket.close(); 
                return isModeAlpha; 
            }
        }

        dataWriter = remoteSocket.writable.getWriter();
        if (offset < bufferData.byteLength) {
            let chunk = bufferData.slice(offset);
            await dataWriter.write(chunk);
            if (activeClientHash) trackUsage(activeClientHash, chunk.byteLength, env, ctx);
        }
        remoteSocket.readable.pipeTo(new WritableStream({ write(chunk) { 
            if (activeClientHash) trackUsage(activeClientHash, chunk.byteLength, env, ctx);
            webSocket.send(chunk); 
        } }));

        return isModeAlpha;
    }
}

function generateHardwareId(seed) {
    const h20 = Array.from(new TextEncoder().encode(seed)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 20).padEnd(20, "0");
    return `${h20.slice(0, 8)}-0000-4000-8000-${h20.slice(-12)}`;
}

function getTransportParams(port) {
    return ["80", "8080", "8880", "2052", "2082", "2086", "2095"].includes(port.toString()) ? "none" : "tls";
}

function getCleanIps(hostName) {
    let ips = sysConfig.cleanIps ? sysConfig.cleanIps.split(/[\r\n,;]+/).map(s => s.trim()).filter(Boolean) : [];
    if (ips.length === 0) ips = [hostName.endsWith('.pages.dev') ? sysConfig.metricNode : hostName];
    return ips;
}


function getAllProfiles(targetSub = null) {
    let list = [{ id: activeDeviceId, name: "Default" }];
    
    if (sysConfig.users && sysConfig.users.length > 0) {
        let now = Date.now();
        sysConfig.users.forEach(u => {
            let skip = false;
            if (u.expiryMs && now > u.expiryMs) skip = true;
            if (u.limitGb && sysUsageCache && sysUsageCache.users && sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()]) {
                if (sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()].b >= u.limitGb * 1024 * 1024 * 1024) skip = true;
            }
            if(!skip) {
                list.push({ id: u.id, name: u.name });
            }
        });
    }

    if (targetSub) {
        list = list.filter(p => p.name.toLowerCase() === targetSub.toLowerCase());
    }
    return list;
}

function buildSingleUri(hostName) {
    let finalIP = getCleanIps(hostName)[0];
    let sec = getTransportParams(sysConfig.socketPort);
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);
    let uriProto = sysConfig.mode === "beta" ? getBeta() : getAlpha();
    let ext = `encryption=none&security=${sec}&sni=${hostName}&fp=${sysConfig.agent}&type=ws&host=${hostName}&path=${reqPath}`;
    if (sysConfig.enableOpt2) ext += `&pbk=enabled`;
    return `${uriProto}://${activeDeviceId}@${finalIP}:${sysConfig.socketPort}?${ext}#${hostName}`;
}

function buildUriProfile(hostName, targetSub = null) {
    let ips = getCleanIps(hostName);
    let sec = getTransportParams(sysConfig.socketPort);
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);
    let extBase = `encryption=none&security=${sec}&sni=${hostName}&fp=${sysConfig.agent}&type=ws&host=${hostName}&path=${reqPath}`;
    if (sysConfig.enableOpt2) extBase += `&pbk=enabled`;

    let lines = [];
    let profiles = getAllProfiles(targetSub);
    
    profiles.forEach(p => {
        ips.forEach(ip => {
            let nameExt = p.name === "Default" ? `[${ip}]` : `[${ip}]-${p.name}`;
            let vName = `V-Core-${nameExt}`;
            let tName = `T-Core-${nameExt}`;
            
            lines.push(`${getAlpha()}://${p.id}@${ip}:${sysConfig.socketPort}?${extBase}#${vName}`);
            lines.push(`${getBeta()}://${p.id}@${ip}:${sysConfig.socketPort}?${extBase}#${tName}`);
        });
    });
    return lines.join('\n');
}

function buildYamlProfile(hostName, targetSub = null) {
    let ips = getCleanIps(hostName);
    let sec = getTransportParams(sysConfig.socketPort) === "tls" ? "true" : "false";
    let proxies = [];
    let proxyNames = [];
    let profiles = getAllProfiles(targetSub);

    profiles.forEach(p => {
        ips.forEach(ip => {
            let nameExt = p.name === "Default" ? `[${ip}]` : `[${ip}]-${p.name}`;
            
            let vName = `V-Core-${nameExt}`;
            proxyNames.push(`"${vName}"`);
            proxies.push(`- name: "${vName}"\n  type: ${getAlpha()}\n  server: ${ip}\n  port: ${sysConfig.socketPort}\n  uuid: ${p.id}\n  udp: true\n  tls: ${sec}\n  sni: ${hostName}\n  client-fingerprint: ${sysConfig.agent}\n  network: ws\n  ws-opts:\n    path: "/${sysConfig.apiRoute}"\n    headers: { Host: ${hostName} }\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);

            let tName = `T-Core-${nameExt}`;
            proxyNames.push(`"${tName}"`);
            proxies.push(`- name: "${tName}"\n  type: ${getBeta()}\n  server: ${ip}\n  port: ${sysConfig.socketPort}\n  password: ${p.id}\n  udp: true\n  tls: ${sec}\n  sni: ${hostName}\n  client-fingerprint: ${sysConfig.agent}\n  network: ws\n  ws-opts:\n    path: "/${sysConfig.apiRoute}"\n    headers: { Host: ${hostName} }\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);
        });
    });

    return `proxies:\n${proxies.join('\n')}\nproxy-groups:\n- name: Data Group\n  type: select\n  proxies: \n${proxyNames.map(n => `    - ${n}`).join('\n')}\nrules:\n  - MATCH,Data Group\n`;
}

function getDashboardUI(hasDB) {
    return `
  <!DOCTYPE html>
  <html lang="en" class="light">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Nahan Gateway</title>
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
          tailwind.config = { 
              darkMode: 'class', 
              theme: { 
                  extend: { 
                      fontFamily: { sans: ['Vazirmatn', 'sans-serif'] },
                      colors: { primary: '#6366f1', darkbg: '#0f172a', darkcard: '#1e293b', darkborder: '#334155' } 
                  } 
              } 
          }
      </script>
      <style>
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .dark ::-webkit-scrollbar-thumb { background: #475569; }
          .fade-in { animation: fadeIn 0.3s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .nav-item.active { background-color: rgba(99, 102, 241, 0.1); color: #6366f1; border-inline-start: 4px solid #6366f1; font-weight: 700; }
          .dark .nav-item.active { background-color: rgba(99, 102, 241, 0.2); color: #818cf8; border-inline-start: 4px solid #818cf8; }
          .nav-item { border-inline-start: 4px solid transparent; transition: all 0.2s; }
          .mobile-nav-item.active { color: #6366f1; }
          .dark .mobile-nav-item.active { color: #818cf8; }
      </style>
  </head>
  <body class="bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-200 h-[100dvh] flex flex-col md:flex-row overflow-hidden selection:bg-primary selection:text-white transition-colors duration-300">

      <div class="fixed top-4 end-4 md:top-6 md:end-6 flex items-center space-x-2 space-x-reverse z-50">
          <span id="top-version-badge" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[11px] font-mono font-bold border border-slate-200 dark:border-darkborder shadow-sm">v2.1.0-optim</span>
          <a href="https://github.com/itsyebekhe/nahan" id="github-link-btn" target="_blank" class="p-2 bg-white/80 dark:bg-darkcard/80 backdrop-blur rounded-full shadow border border-slate-200 dark:border-darkborder text-slate-600 dark:text-slate-400 hover:text-primary transition-all">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg>
          </a>
          <button onclick="toggleLang()" id="lang-toggle" class="px-3 py-1 bg-white/80 dark:bg-darkcard/80 backdrop-blur rounded-full shadow border border-slate-200 dark:border-darkborder font-bold text-sm">EN</button>
          <button onclick="toggleTheme()" class="p-2 bg-white/80 dark:bg-darkcard/80 backdrop-blur rounded-full shadow border border-slate-200 dark:border-darkborder text-amber-500 dark:text-indigo-400">
              <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </button>
          <button onclick="logout()" id="btn-logout-mob" class="hidden md:hidden p-2 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full shadow border border-red-100 dark:border-red-900">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
      </div>

      <div id="login-box" class="absolute inset-0 flex items-center justify-center p-4 z-40 bg-slate-50 dark:bg-darkbg">
          <div class="absolute top-1/4 start-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>
          <div class="max-w-md w-full bg-white/90 dark:bg-darkcard/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/50">
              <div class="text-center mb-8">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-primary mb-4">
                       <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
                  </div>
                  <h2 class="text-3xl font-black text-slate-800 dark:text-white" data-i18n="title">Nahan Gateway</h2>
              </div>
              ${!hasDB ? `<div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30"><span data-i18n="missing_db">DB namespace missing!</span></div>` : ''}
              <input type="password" id="pwd" data-i18n="pass_ph" placeholder="Master Key" class="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-darkbg focus:border-primary outline-none mb-6 text-center tracking-widest">
              <button onclick="doLogin()" class="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90" data-i18n="login_btn">Authenticate</button>
              <p id="err-msg" class="text-red-500 text-sm mt-4 hidden text-center font-bold" data-i18n="err_pass">Invalid Key</p>
          </div>
      </div>

      <div id="dash-box" class="hidden w-full h-full flex-col md:flex-row relative">
          
          <aside class="hidden md:flex w-64 bg-white dark:bg-darkcard border-e border-slate-200 dark:border-darkborder flex-col z-20 shrink-0">
              <div class="flex items-center p-6 border-b border-slate-100 dark:border-darkborder/50">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-primary flex items-center justify-center me-3 shrink-0"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
                  <div class="flex flex-col">
                      <h1 class="font-black text-xl leading-none" data-i18n="title">Nahan</h1>
                      <span id="app-version" class="text-[10px] font-mono text-slate-400 mt-1 font-semibold">v2.1.0-optim</span>
                  </div>
              </div>
              <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                  <button onclick="switchTab('info')" id="tab-info" class="nav-item active flex items-center w-full px-4 py-3 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 group">
                      <svg class="w-6 h-6 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                      <span class="font-semibold" data-i18n="tab_info">Endpoints</span>
                  </button>
                  <button onclick="switchTab('network')" id="tab-network" class="nav-item flex items-center w-full px-4 py-3 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 group">
                      <svg class="w-6 h-6 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                      <span class="font-semibold" data-i18n="tab_status">Metrics</span>
                  </button>
                  <button onclick="switchTab('settings')" id="tab-settings" class="nav-item flex items-center w-full px-4 py-3 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 group">
                      <svg class="w-6 h-6 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                      <span class="font-semibold" data-i18n="tab_settings">System</span>
                  </button>
                  <button onclick="switchTab('advanced')" id="tab-advanced" class="nav-item flex items-center w-full px-4 py-3 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 group">
                      <svg class="w-6 h-6 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span class="font-semibold" data-i18n="tab_adv">Advanced</span>
                  </button>
                  <button onclick="switchTab('logs')" id="tab-logs" class="nav-item flex items-center w-full px-4 py-3 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 group">
                      <svg class="w-6 h-6 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                      <span class="font-semibold" data-i18n="tab_logs">Activity logs</span>
                  </button>
                  <button onclick="switchTab('users')" id="tab-users" class="nav-item flex items-center w-full px-4 py-3 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 group">
                      <svg class="w-6 h-6 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      <span class="font-semibold" data-i18n="tab_users">Users</span>
                  </button>
              </nav>
              <div class="p-4 border-t border-slate-100 dark:border-darkborder/50">
                  <button onclick="logout()" class="flex items-center justify-center w-full px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors">
                      <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                      <span data-i18n="logout">Disconnect</span>
                  </button>
              </div>
          </aside>
  
          <main class="flex-1 flex flex-col h-full overflow-hidden">
              <header class="h-20 md:h-24 shrink-0 flex items-center px-6 md:px-10 z-10 pt-4 md:pt-0">
                  <h2 id="view-title" class="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-2" data-i18n="tab_info">Endpoints</h2>
              </header>
  
              <div class="flex-1 overflow-y-auto p-4 md:p-10">
                  <div class="max-w-4xl mx-auto space-y-6 fade-in">

                      <div id="update-alert-banner" class="hidden bg-gradient-to-r from-amber-500/10 to-primary/10 border-2 border-amber-300 dark:border-amber-950/20 rounded-3xl p-6 shadow-md flex-col sm:flex-row items-center justify-between gap-4 fade-in">
                          <div class="flex items-center space-x-4 space-x-reverse text-start w-full">
                              <div class="p-3 bg-amber-500/10 text-amber-500 rounded-2xl shrink-0">
                                  <svg class="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"></path></svg>
                              </div>
                              <div>
                                  <h4 class="font-black text-amber-800 dark:text-amber-400 text-base" data-i18n="update_avail">New version available!</h4>
                                  <p id="update-alert-text" class="text-xs text-slate-500 dark:text-slate-400 mt-1"></p>
                              </div>
                          </div>
                          <div class="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                              <button onclick="dismissUpdate()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors" data-i18n="btn_cancel">Cancel</button>
                              <a id="update-alert-btn" href="https://github.com/itsyebekhe/nahan" target="_blank" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5" data-i18n="update_btn">
                                  Get Latest Code ➜
                              </a>
                          </div>
                      </div>

                      <div id="view-info" class="space-y-6 block">
                          <div id="dyn-profiles-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                      </div>

                      <div id="view-network" class="hidden space-y-6">
                            <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder mb-6">
                              <h3 class="text-sm uppercase font-bold text-slate-500 tracking-wider mb-4">Live Profile Usage</h3>
                              <div id="usage-metrics-container" class="flex flex-col">
                                  <p class="text-xs text-slate-400 text-center py-4">No active connection data yet.</p>
                              </div>
                          </div>
                          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                              <div class="bg-white dark:bg-darkcard p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden group">
                                  <svg class="w-8 h-8 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                  <p class="text-xs uppercase font-bold text-slate-400 mb-1" data-i18n="stat_ip">Origin IP</p>
                                  <p id="net-ip" class="text-xl md:text-2xl font-black font-mono">...</p>
                              </div>
                              <div class="bg-white dark:bg-darkcard p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden group">
                                  <svg class="w-8 h-8 text-emerald-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
                                  <p class="text-xs uppercase font-bold text-slate-400 mb-1" data-i18n="stat_dc">Edge Node</p>
                                  <p id="net-colo" class="text-xl md:text-2xl font-black font-mono">...</p>
                              </div>
                              <div class="bg-white dark:bg-darkcard p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                                  <svg class="w-8 h-8 text-purple-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                  <p class="text-xs uppercase font-bold text-slate-400 mb-1" data-i18n="stat_loc">Data Region</p>
                                  <p id="net-loc" class="text-lg font-bold truncate">...</p>
                              </div>
  
                              <div class="bg-white dark:bg-darkcard p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden group sm:col-span-2 lg:col-span-3">
                                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div>
                                          <h3 class="text-sm uppercase font-bold text-slate-400 mb-1" data-i18n="ping_test_title">Latency Diagnostics</h3>
                                          <p class="text-xs text-slate-500" data-i18n="ping_test_desc">Test response time to your active node target.</p>
                                      </div>
                                      <button onclick="runPingTest()" class="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors text-sm">
                                          ⚡ Run Diagnostics
                                      </button>
                                  </div>
                                  <div id="ping-results" class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 hidden">
                                      <div class="bg-slate-50 dark:bg-darkbg p-3 rounded-xl border border-slate-100 dark:border-darkborder/50">
                                          <p class="text-[10px] uppercase font-bold text-slate-400">Target Node</p>
                                          <p id="ping-target" class="text-sm font-bold font-mono truncate">...</p>
                                      </div>
                                      <div class="bg-slate-50 dark:bg-darkbg p-3 rounded-xl border border-slate-100 dark:border-darkborder/50">
                                          <p class="text-[10px] uppercase font-bold text-slate-400">Response</p>
                                          <p id="ping-time" class="text-sm font-bold font-mono text-emerald-500">...</p>
                                      </div>
                                      <div class="bg-slate-50 dark:bg-darkbg p-3 rounded-xl border border-slate-100 dark:border-darkborder/50">
                                          <p class="text-[10px] uppercase font-bold text-slate-400">Status</p>
                                          <p id="ping-status" class="text-sm font-bold">...</p>
                                      </div>
                                      <div class="bg-slate-50 dark:bg-darkbg p-3 rounded-xl border border-slate-100 dark:border-darkborder/50">
                                          <p class="text-[10px] uppercase font-bold text-slate-400">Local Port</p>
                                          <p id="ping-port" class="text-sm font-bold font-mono">...</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
  
                      <div id="view-settings" class="hidden">
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div class="space-y-1">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_proto">Primary Display Mode</label>
                                  <select id="cfg-proto" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-1 outline-none appearance-none">
                                      <option value="alpha">Alpha Mode (V-Core)</option>
                                      <option value="beta">Beta Mode (T-Core)</option>
                                  </select>
                              </div>
                              <div class="space-y-1">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_port">Data Port</label>
                                  <select id="cfg-port" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-1 outline-none appearance-none">
                                      <option value="443">443 (Secure TLS)</option>
                                      <option value="8443">8443 (Alt TLS)</option>
                                      <option value="80">80 (Standard)</option>
                                      <option value="8080">8080 (Alt Standard)</option>
                                  </select>
                              </div>
                              <div class="space-y-1 md:col-span-2">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_id">Device UUID (Empty=Auto)</label>
                                  <input type="text" id="cfg-uuid" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none font-mono text-sm">
                              </div>
                              <div class="space-y-1">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_path">API Route (Hidden Path)</label>
                                  <input type="text" id="cfg-path" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                              </div>
                              <div class="space-y-1">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_pass">Master Key</label>
                                  <input type="text" id="cfg-pass" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                              </div>
                              <div class="space-y-1 md:col-span-2 font-mono">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_github_repo">GitHub Update Repository</label>
                                  <input type="text" id="cfg-github-repo" placeholder="itsyebekhe/nahan" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
  
                              <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder md:col-span-2 space-y-4">
                                  <h3 class="text-sm uppercase font-bold text-slate-400 tracking-wider" data-i18n="backup_restore_title">Backup & Restore</h3>
                                  <div class="flex flex-col sm:flex-row gap-4">
                                      <button onclick="exportConfig()" class="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-sm">
                                          📥 Export Configuration (JSON)
                                      </button>
                                      <label class="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-sm text-center cursor-pointer">
                                          📤 Import Configuration (JSON)
                                          <input type="file" id="import-file" class="hidden" accept=".json" onchange="importConfig(event)">
                                      </label>
                                  </div>
                              </div>
                          </div>
                      </div>
  
                      <div id="view-advanced" class="hidden space-y-6">
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder">
                              <div class="flex items-center justify-between mb-4">
                                  <h3 class="text-sm uppercase font-bold text-slate-500 tracking-wider" data-i18n="lbl_clean_ips">Clean IPs (Multi-Generator)</h3>
                                  <span class="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md font-bold" id="ip-count-badge">1 Config Set</span>
                              </div>
                              <textarea id="cfg-ips" rows="3" data-i18n="ph_clean_ips" placeholder="" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-1 outline-none font-mono text-sm resize-none"></textarea>
                              <p class="text-xs text-slate-400 mt-2" data-i18n="desc_clean_ips">Put one IP per line. The Sync URL will multiply configs for all IPs.</p>
                          </div>
  
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_fp">TLS Signature</label>
                                  <select id="cfg-fp" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none appearance-none">
                                      <option value="chrome">Chrome</option><option value="firefox">Firefox</option><option value="safari">Safari</option>
                                  </select>
                              </div>
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_dns">Resolver IP</label>
                                  <input type="text" id="cfg-dns" placeholder="1.1.1.1" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                              <div class="space-y-1 md:col-span-2 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_fake">Maintenance Hosts (Camouflage)</label>
                                  <input type="text" id="cfg-fake" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                              <div class="space-y-1 md:col-span-2 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_relay">Backup Relay IP (Smart Routing)</label>
                                  <input type="text" id="cfg-relay" placeholder="pro, api.neysh.ir" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                                  <p class="text-xs text-slate-400 mt-1">آی‌پی‌ها را با کاما جدا کنید. سیستم هوشمند بهینه‌ترین مسیر را انتخاب می‌کند.</p>
                              </div>
                          </div>
  
                          <div class="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-darkcard rounded-3xl border border-slate-200 dark:border-darkborder">
                              <label class="flex-1 flex items-center justify-between sm:justify-start cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                  <span class="text-sm font-bold text-slate-700 dark:text-slate-300 sm:me-4" data-i18n="lbl_tfo">TCP Fast Open</span>
                                  <div class="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="cfg-tfo" class="sr-only peer">
                                      <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-primary"></div>
                                  </div>
                              </label>
                              <label class="flex-1 flex items-center justify-between sm:justify-start cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                  <span class="text-sm font-bold text-slate-700 dark:text-slate-300 sm:me-4" data-i18n="lbl_ech">Secure Hello (ECH)</span>
                                  <div class="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="cfg-ech" class="sr-only peer">
                                      <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-primary"></div>
                                  </div>
                              </label>
                          </div>

                          <div class="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-darkcard rounded-3xl border border-slate-200 dark:border-darkborder mt-6">
                              <label class="flex-1 flex items-center justify-between sm:justify-start cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                  <span class="text-sm font-bold text-slate-700 dark:text-slate-300 sm:me-4" data-i18n="lbl_silent">Silent UI Alerts</span>
                                  <div class="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="cfg-silent" class="sr-only peer">
                                      <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-primary"></div>
                                  </div>
                              </label>
                              <label class="flex-1 flex items-center justify-between sm:justify-start cursor-pointer group bg-red-50 dark:bg-red-900/10 p-3 rounded-2xl border border-red-200 dark:border-red-900/30">
                                  <span class="text-sm font-bold text-red-600 dark:text-red-400 sm:me-4" data-i18n="lbl_pause">Kill Switch (Pause System)</span>
                                  <div class="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="cfg-pause" class="sr-only peer">
                                      <div class="w-11 h-6 bg-red-200 dark:bg-red-900/50 rounded-full peer peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-red-500"></div>
                                  </div>
                              </label>
                          </div>

                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_tg_token">Token Bot</label>
                                  <input type="password" id="cfg-tg-token" placeholder="123456:ABC-DEF1234ghIkl-zyx5c" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_tg_chat">Chat ID</label>
                                  <input type="text" id="cfg-tg-chat" placeholder="123456789" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                              <p class="text-xs text-slate-400 md:col-span-2" data-i18n="desc_tg_bot">Set these values to receive login alerts via Telegram.</p>
                          </div>
                          
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_cf_acc">CF Account ID</label>
                                  <input type="text" id="cfg-cf-acc" placeholder="a1b2c3d4e5f6..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm font-mono">
                              </div>
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_cf_token">CF API Token</label>
                                  <input type="password" id="cfg-cf-token" placeholder="Bearer Token (Read Analytics)" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm font-mono">
                              </div>
                              <p class="text-xs text-slate-400 md:col-span-2" data-i18n="desc_cf_api">Optional: Monitor Worker free usage limits (100k/day). Needs Account Analytics Read permission.</p>
                          </div>
                      </div>
                      
                      <div id="view-users" class="hidden space-y-6">
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden">
                              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                                  <div>
                                       <h3 class="text-sm uppercase font-bold text-slate-500 tracking-wider" data-i18n="user_mgt_title">User Management</h3>
                                       <p class="text-xs text-slate-400 mt-1" data-i18n="user_mgt_desc">Manage multiple users, set traffic limits, and expiration dates.</p>
                                  </div>
                                  <button onclick="document.getElementById('modal-add-user').classList.remove('hidden')" class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors" data-i18n="btn_add_user">+ Add New User</button>
                              </div>
                              <div class="overflow-x-auto">
                                  <table class="w-full text-sm text-left">
                                      <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                                          <tr>
                                              <th class="px-4 py-3 rounded-s-xl" data-i18n="tbl_name">Name</th>
                                              <th class="px-4 py-3" data-i18n="tbl_uuid">UUID</th>
                                              <th class="px-4 py-3" data-i18n="tbl_traffic">Traffic (Used / Limit)</th>
                                              <th class="px-4 py-3" data-i18n="tbl_exp">Expiration</th>
                                              <th class="px-4 py-3 rounded-e-xl text-end" data-i18n="tbl_action">Action</th>
                                          </tr>
                                      </thead>
                                      <tbody id="tbl-users" class="divide-y divide-slate-100 dark:divide-darkborder/50">
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>

                      <div id="modal-add-user" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                          <div class="bg-white dark:bg-darkcard rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-darkborder">
                              <h3 class="text-xl font-bold mb-4" data-i18n="modal_add_title">Add User</h3>
                              <div class="space-y-4">
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_name">Name / Identifier</label>
                                      <input type="text" id="add-user-name" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_gb">Traffic Limit (GB) - Leave empty for unlimited</label>
                                      <input type="number" step="0.1" id="add-user-gb" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_days">Expiration limit (Days) - Leave empty for unlimited</label>
                                      <input type="number" id="add-user-days" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div class="flex justify-end gap-2 mt-6">
                                      <button onclick="document.getElementById('modal-add-user').classList.add('hidden')" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold" data-i18n="btn_cancel">Cancel</button>
                                      <button onclick="commitAddUser()" class="px-4 py-2 rounded-xl bg-primary text-white font-bold" data-i18n="btn_confirm">Save User</button>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div id="view-logs" class="hidden space-y-6">
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden">
                              <div class="flex items-center justify-between mb-6">
                                  <h3 class="text-sm uppercase font-bold text-slate-500 tracking-wider">System Activity Logs</h3>
                                  <button onclick="loadLogs()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors">
                                      🔄 Refresh
                                  </button>
                              </div>
                              <div class="space-y-3" id="logs-container">
                                  <p class="text-sm text-slate-400 text-center py-8">Loading activity logs...</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
  
              <div class="shrink-0 bg-white dark:bg-darkcard border-t border-slate-200 dark:border-darkborder p-4 flex justify-between md:justify-end items-center z-20">
                  <span id="save-status" class="text-sm font-bold text-slate-500 md:me-4"></span>
                  <button onclick="doSave()" class="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity" data-i18n="save_btn">Save Config</button>
              </div>
          </main>
  
          <nav class="md:hidden w-full h-16 bg-white dark:bg-darkcard border-t border-slate-200 dark:border-darkborder flex justify-around items-center z-30 shrink-0 pb-safe">
              <button onclick="switchTab('info')" id="mob-tab-info" class="mobile-nav-item active flex flex-col items-center justify-center w-full h-full text-slate-400">
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  <span class="text-[10px] font-bold" data-i18n="tab_info">Endpoints</span>
              </button>
              <button onclick="switchTab('network')" id="mob-tab-network" class="mobile-nav-item flex flex-col items-center justify-center w-full h-full text-slate-400">
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  <span class="text-[10px] font-bold" data-i18n="tab_status">Metrics</span>
              </button>
              <button onclick="switchTab('settings')" id="mob-tab-settings" class="mobile-nav-item flex flex-col items-center justify-center w-full h-full text-slate-400">
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                  <span class="text-[10px] font-bold" data-i18n="tab_settings">System</span>
              </button>
              <button onclick="switchTab('advanced')" id="mob-tab-advanced" class="mobile-nav-item flex flex-col items-center justify-center w-full h-full text-slate-400">
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span class="text-[10px] font-bold" data-i18n="tab_adv">Network</span>
              </button>
              <button onclick="switchTab('logs')" id="mob-tab-logs" class="mobile-nav-item flex flex-col items-center justify-center w-full h-full text-slate-400">
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                  <span class="text-[10px] font-bold" data-i18n="tab_logs">Logs</span>
              </button>
              <button onclick="switchTab('users')" id="mob-tab-users" class="mobile-nav-item flex flex-col items-center justify-center w-full h-full text-slate-400">
                  <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  <span class="text-[10px] font-bold" data-i18n="tab_users">Users</span>
              </button>
          </nav>
      </div>
  
      <div id="copy-toast" class="fixed top-20 md:top-10 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl font-bold text-sm z-50 transition-all transform -translate-y-20 opacity-0 pointer-events-none">
          <span data-i18n="copied">Copied!</span>
      </div>
      
      <div id="qr-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
          <div class="bg-white dark:bg-darkcard rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-darkborder relative">
              <button onclick="closeQRModal()" class="absolute top-4 end-4 text-slate-400 hover:text-slate-800 dark:hover:text-white">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div class="text-center mb-6">
                  <h3 id="qr-modal-title" class="text-xl font-bold text-slate-800 dark:text-white">Scan to Connect</h3>
                  <p class="text-xs text-slate-500 mt-1">Scan with your V-Core or T-Core client</p>
              </div>
              <div class="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 mb-4">
                  <img id="qr-modal-img" src="" alt="QR Code" class="w-full aspect-square object-contain">
              </div>
              <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl break-all text-xs font-mono text-slate-600 dark:text-slate-400 max-h-24 overflow-auto border border-slate-200 dark:border-darkborder" id="qr-modal-link"></div>
          </div>
      </div>
  
      <script>
          const i18n = {
              en: {
                  title: "Nahan Gateway", pass_ph: "Master Key", login_btn: "Authenticate", err_pass: "Access Denied", missing_db: "⚠️ IOT_DB namespace missing! Settings won't save.",
                  logout: "Disconnect", tab_info: "Endpoints", tab_status: "Metrics", tab_settings: "System", tab_adv: "Advanced", tab_logs: "Activity Logs",
                  qr_title: "Direct Stream Link", badge_multi: "Dual-Core Multiplexed", copy: "Copy", copied: "Copied to clipboard!", sync_link: "Cloud Sync URL", active_id: "Hardware ID",
                  stat_ip: "Origin IP", stat_dc: "Edge Node", stat_loc: "Data Region",
                  lbl_proto: "Primary Display Mode", lbl_port: "Data Port", lbl_id: "Device UUID (Empty=Auto)",
                  lbl_path: "API Route (Hidden Path)", lbl_pass: "Master Key", lbl_fp: "TLS Signature", lbl_dns: "Resolver IP",
                  lbl_clean_ips: "Clean IPs (Multi-Generator)", ph_clean_ips: "1.1.1.1, 2.2.2.2", desc_clean_ips: "Separate IPs by comma or new line. The Sync URL will multiply configs for all IPs.",
                  lbl_fake: "Maintenance Hosts (Camouflage)", lbl_relay: "Backup Relay IP", lbl_tfo: "TCP Fast Open", lbl_ech: "Secure Hello (ECH)", lbl_tg_token: "Telegram Bot Token", lbl_tg_chat: "Telegram Chat ID", desc_tg_bot: "Set these values to receive login alerts via Telegram.",
                  lbl_cf_acc: "Cloudflare Account ID", lbl_cf_token: "Cloudflare API Token", desc_cf_api: "Optional: Monitor Worker daily usage limit (100k/day). Requires Account Analytics read permission.",
                  lbl_silent: "Silent UI Alerts", lbl_pause: "Kill Switch (Pause System)",
                  tab_users: "Users",
                  user_mgt_title: "User Management", user_mgt_desc: "Manage multiple users, set traffic limits, and expiration dates.", btn_add_user: "+ Add New User",
                  tbl_name: "Name", tbl_uuid: "UUID", tbl_traffic: "Traffic (Used / Limit)", tbl_exp: "Expiration", tbl_action: "Action", no_users: "No users found. Create one above.",
                  modal_add_title: "Add New User", lbl_u_name: "Name (Required)", lbl_u_gb: "Traffic Limit (GB) - Optional", lbl_u_days: "Duration (Days) - Optional", btn_cancel: "Cancel", btn_confirm: "Add User",
                  save_btn: "Update Config", msg_saving: "Syncing...", msg_saved: "Success! Reloading...", msg_err: "Sync Error",
                  backup_restore_title: "Backup & Restore", ping_test_title: "Latency Diagnostics", ping_test_desc: "Test response time to your active node target.",
                  lbl_github_repo: "GitHub Update Repository", update_avail: "New version available!", update_btn: "Get Latest Code"
              },
              fa: {
                  title: "دروازه نهان", pass_ph: "کلید اصلی", login_btn: "ورود به سیستم", err_pass: "دسترسی مسدود شد", missing_db: "⚠️ فضای IOT_DB یافت نشد! تنظیمات ذخیره نمی‌شوند.",
                  logout: "خروج", tab_info: "نقاط اتصال", tab_status: "وضعیت شبکه", tab_settings: "تنظیمات پایه", tab_adv: "پیشرفته", tab_logs: "گزارش فعالیت",
                  qr_title: "لینک اتصال مستقیم", badge_multi: "ترکیب دوگانه V+T", copy: "کپی", copied: "در حافظه کپی شد!", sync_link: "لینک ساب (Cloud Sync)", active_id: "شناسه سخت‌افزار",
                  stat_ip: "آی‌پی مبدا", stat_dc: "گره لبه", stat_loc: "منطقه داده",
                  lbl_proto: "پروتکل نمایش مستقیم", lbl_port: "پورت داده", lbl_id: "شناسه یکتا (خالی=خودکار)",
                  lbl_path: "مسیر مخفی API", lbl_pass: "کلید اصلی", lbl_fp: "امضای TLS", lbl_dns: "آی‌پی تحلیلگر",
                  lbl_clean_ips: "آی‌پی‌های تمیز (مولد چندگانه)", ph_clean_ips: "1.1.1.1, 2.2.2.2", desc_clean_ips: "آی‌پی ها را با کاما یا خط جدید جدا کنید. لینک ساب برای همه ترکیب می‌سازد.",
                  lbl_fake: "سایت‌های استتار (حالت مخفی)", lbl_relay: "آی‌پی جایگزین (Proxy IP)", lbl_tfo: "اتصال سریع (TFO)", lbl_ech: "سلام امن (ECH)", lbl_tg_token: "توکن ربات تلگرام", lbl_tg_chat: "آیدی عددی تلگرام (Chat ID)", desc_tg_bot: "با تنظیم این مقادیر، جزئیات ورود به پنل به تلگرام ارسال می‌شود.",
                  lbl_cf_acc: "آیدی اکانت کلودفلر (Account ID)", lbl_cf_token: "توکن کلودفلر (API Token)", desc_cf_api: "اختیاری: برای نمایش میزان مصرف روزانه کارگر از 100 هزار درخواست رایگان در پیام‌های تلگرام.",
                  lbl_silent: "هشدار و پیغام خاموش", lbl_pause: "کلید توقف اضطراری",
                  tab_users: "کاربران",
                  user_mgt_title: "مدیریت کاربران", user_mgt_desc: "مدیریت کاربران متعدد، تنظیم محدودیت ترافیک، و تاریخ انقضا.", btn_add_user: "+ افزودن کاربر جدید",
                  tbl_name: "نام", tbl_uuid: "شناسه یکتا", tbl_traffic: "ترافیک (مصرفی/محدودیت)", tbl_exp: "انقضا", tbl_action: "عملیات", no_users: "کاربری یافت نشد. از دکمه بالا یک کاربر ایجاد کنید.",
                  modal_add_title: "افزودن کاربر جدید", lbl_u_name: "نام (الزامی)", lbl_u_gb: "محدودیت ترافیک (گیگابایت) - اختیاری", lbl_u_days: "مدت زمان اعتبار (روز) - اختیاری", btn_cancel: "انصراف", btn_confirm: "افزودن کاربر",
                  save_btn: "ذخیره تنظیمات", msg_saving: "در حال ثبت...", msg_saved: "موفق! در حال بارگذاری...", msg_err: "خطای ارتباط",
                  backup_restore_title: "پشتیبان‌گیری و بازیابی", ping_test_title: "عیب‌یابی تاخیر شبکه", ping_test_desc: "تاخیر پاسخ‌دهی را به آی‌پی تمیز فعال اندازه بگیرید.",
                  lbl_github_repo: "مخزن گیت‌هاب جهت آپدیت", update_avail: "بروزرسانی جدید در دسترس است!", update_btn: "دریافت آخرین کد"
              }
          };
  
          let lang = localStorage.getItem('lang') || 'fa';
          let sessionKey = "", baseRoute = window.location.pathname.split('/dash')[0];
          let hostName = window.location.hostname, localUUID = "";
  
          function applyLang() {
              document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
              document.getElementById('lang-toggle').innerText = lang === 'fa' ? 'EN' : 'فا';
              document.querySelectorAll('[data-i18n]').forEach(el => {
                  const key = el.getAttribute('data-i18n');
                  if(el.placeholder !== undefined && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) el.placeholder = i18n[lang][key];
                  else el.innerText = i18n[lang][key];
              });
          }
          function toggleLang() { lang = lang === 'fa' ? 'en' : 'fa'; localStorage.setItem('lang', lang); applyLang(); updateTitle(); updateUI(); }
          applyLang();
  
          if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
          } else {
              document.documentElement.classList.remove('dark');
          }
  
          function toggleTheme() {
              document.documentElement.classList.toggle('dark');
              localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
          }
  
          function updateTitle() {
              const activeTab = document.querySelector('.nav-item.active span');
              if(activeTab) document.getElementById('view-title').innerText = activeTab.innerText;
          }
  
          function switchTab(tab) {
            ['info','network','settings','advanced','logs','users'].forEach(t => {
                  const view = document.getElementById('view-'+t);
                  const deskBtn = document.getElementById('tab-'+t);
                  const mobBtn = document.getElementById('mob-tab-'+t);
                  if (tab === t) {
                      view.classList.remove('hidden'); view.classList.add('block', 'fade-in');
                      deskBtn.classList.add('active'); mobBtn.classList.add('active');
                  } else {
                      view.classList.add('hidden'); view.classList.remove('block', 'fade-in');
                      deskBtn.classList.remove('active'); mobBtn.classList.remove('active');
                  }
              });
            updateTitle();
            if(tab === 'logs') loadLogs();
            if(tab === 'network') doLogin(true); // refresh metrics
        }

        async function loadLogs() {
            const container = document.getElementById('logs-container');
            if(!container) return;
            container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">Loading logs...</p>';
            try {
                const res = await fetch(baseRoute + '/api/logs', { method: 'POST', body: JSON.stringify({ key: sessionKey }) });
                const data = await res.json();
                if (data.success && data.logs) {
                    container.innerHTML = '';
                    if (data.logs.length === 0) {
                        container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">No activity logs found.</p>';
                        return;
                    }
                    data.logs.forEach(log => {
                        const dateStr = new Date(log.ts).toLocaleString('en-US', {hour12: false});
                        const html = \`<div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-darkborder/50 gap-2"><div><p class="text-sm font-bold text-slate-700 dark:text-slate-200">\${log.type}</p><p class="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs" title="\${log.detail}">\${log.detail}</p></div><span class="text-[10px] font-mono text-slate-400 bg-white dark:bg-darkcard px-2 py-1 rounded shrink-0">\${dateStr}</span></div>\`;
                        container.insertAdjacentHTML('beforeend', html);
                    });
                } else {
                    container.innerHTML = '<p class="text-sm text-red-400 text-center py-4">Failed to load logs.</p>';
                }
            } catch (err) {
                container.innerHTML = '<p class="text-sm text-red-400 text-center py-4">Error loading logs.</p>';
            }
        }
  
          function copyData(id) {
              const input = document.getElementById(id); input.select(); navigator.clipboard.writeText(input.value);
              const toast = document.getElementById('copy-toast');
              toast.style.transform = 'translate(-50%, 0)'; toast.style.opacity = '1';
              setTimeout(() => { toast.style.transform = 'translate(-50%, -5rem)'; toast.style.opacity = '0'; }, 2000);
          }
          
          function showQR(name, url) {
              document.getElementById('qr-modal-title').innerText = name;
              document.getElementById('qr-modal-img').src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(url);
              document.getElementById('qr-modal-link').innerText = url;
              document.getElementById('qr-modal').classList.remove('hidden');
              document.getElementById('qr-modal').classList.add('flex');
          }
          
          function closeQRModal() {
              document.getElementById('qr-modal').classList.add('hidden');
              document.getElementById('qr-modal').classList.remove('flex');
          }
  
          function updateUI() {
              try {
                  let port = document.getElementById('cfg-port').value;
                  let proto = document.getElementById('cfg-proto').value === 'beta' ? String.fromCharCode(116, 114, 111, 106, 97, 110) : String.fromCharCode(118, 108, 101, 115, 115);
                  let rawIps = document.getElementById('cfg-ips').value || "";
                  
                  let ipsList = rawIps.replace(/,/g, '\\n').replace(/;/g, '\\n').split('\\n').map(s=>s.trim()).filter(Boolean);
                  let finalIP = ipsList.length > 0 ? ipsList[0] : (hostName.endsWith('.pages.dev') ? 'time.is' : hostName);
                  
                  let fp = document.getElementById('cfg-fp').value;
                  let path = encodeURI("/" + document.getElementById('cfg-path').value);
                  let sec = ["80","8080"].includes(port) ? "none" : "tls";
                  
                  let rawLink = proto + "://" + localUUID + "@" + finalIP + ":" + port + "?encryption=none&security=" + sec + "&sni=" + hostName + "&fp=" + fp + "&type=ws&host=" + hostName + "&path=" + path;
                  if (document.getElementById('cfg-ech').checked) rawLink += "&pbk=enabled";
                  rawLink += "#" + hostName;
  
                  // FIX: Check if elements exist
                  const linkEl = document.getElementById('link-direct');
                  if (linkEl) linkEl.value = rawLink;
  
                  const qrEl = document.getElementById('qr-code');
                  if (qrEl) qrEl.src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(rawLink);
  
                  let totalIps = ipsList.length === 0 ? 1 : ipsList.length;
                  let tCfg = totalIps * 2; 
                  document.getElementById('ip-count-badge').innerText = lang === 'fa' ? (tCfg + ' کانفیگ تولید شد') : (tCfg + ' Configs Active');
              } catch(e) { console.error(e); }
          }
  
          function logout() {
              localStorage.removeItem('nahan_session');
              window.location.reload();
          }
  
          // Export active page inputs configuration
          function exportConfig() {
              const el = id => document.getElementById(id);
              const payload = {
                  mode: el('cfg-proto').value, socketPort: el('cfg-port').value, deviceId: el('cfg-uuid').value,
                  apiRoute: el('cfg-path').value, masterKey: el('cfg-pass').value, agent: el('cfg-fp').value,
                  resolveIp: el('cfg-dns').value, cleanIps: el('cfg-ips').value, maintenanceHost: el('cfg-fake').value, backupRelay: el('cfg-relay').value,
                  enableOpt1: el('cfg-tfo').checked, enableOpt2: el('cfg-ech').checked,
                  tgToken: el('cfg-tg-token').value, tgChatId: el('cfg-tg-chat').value,
                  cfAccountId: el('cfg-cf-acc').value, cfApiToken: el('cfg-cf-token').value,
                  isPaused: el('cfg-pause').checked, silentAlerts: el('cfg-silent').checked,
                  githubRepo: el('cfg-github-repo').value
              };
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
              const dlAnchor = document.createElement('a');
              dlAnchor.setAttribute("href", dataStr);
              dlAnchor.setAttribute("download", "nahan-gateway-config.json");
              document.body.appendChild(dlAnchor);
              dlAnchor.click();
              dlAnchor.remove();
          }
  
          // Import backup json to overwrite config inputs 
          function importConfig(event) {
              const file = event.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = function(e) {
                  try {
                      const conf = JSON.parse(e.target.result);
                      const mapId = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
                      mapId('cfg-proto', conf.mode);
                      mapId('cfg-port', conf.socketPort);
                      mapId('cfg-uuid', conf.deviceId);
                      mapId('cfg-path', conf.apiRoute);
                      mapId('cfg-pass', conf.masterKey);
                      mapId('cfg-fp', conf.agent);
                      mapId('cfg-dns', conf.resolveIp);
                      mapId('cfg-ips', conf.cleanIps);
                      mapId('cfg-fake', conf.maintenanceHost);
                      mapId('cfg-relay', conf.backupRelay);
                      mapId('cfg-tg-token', conf.tgToken);
                      mapId('cfg-tg-chat', conf.tgChatId);
                      mapId('cfg-cf-acc', conf.cfAccountId);
                      mapId('cfg-cf-token', conf.cfApiToken);
                      mapId('cfg-github-repo', conf.githubRepo);
                      
                      if (conf.enableOpt1 !== undefined) document.getElementById('cfg-tfo').checked = conf.enableOpt1;
                      if (conf.enableOpt2 !== undefined) document.getElementById('cfg-ech').checked = conf.enableOpt2;
                      if (conf.isPaused !== undefined) document.getElementById('cfg-pause').checked = conf.isPaused;
                      if (conf.silentAlerts !== undefined) document.getElementById('cfg-silent').checked = conf.silentAlerts;
                      
                      updateUI();
                      alert(lang === 'fa' ? 'پیکربندی با موفقیت وارد شد! روی ذخیره کلیک کنید.' : 'Configuration parsed! Click save to write changes.');
                  } catch(err) {
                      alert(lang === 'fa' ? 'فایل نامعتبر است!' : 'Invalid configuration file!');
                  }
              };
              reader.readAsText(file);
          }
  
          // Browser-level latency check diagnostics
          async function runPingTest() {
              const rawIps = document.getElementById('cfg-ips').value || "";
              let ipsList = rawIps.replace(/,/g, '\\n').replace(/;/g, '\\n').split('\\n').map(s=>s.trim()).filter(Boolean);
              let targetIP = ipsList.length > 0 ? ipsList[0] : (hostName.endsWith('.pages.dev') ? 'time.is' : hostName);
              
              const resultsDiv = document.getElementById('ping-results');
              resultsDiv.classList.remove('hidden');
              
              document.getElementById('ping-target').textContent = targetIP;
              document.getElementById('ping-time').textContent = 'Testing...';
              document.getElementById('ping-status').textContent = 'Dialing...';
              document.getElementById('ping-port').textContent = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
              
              const startTime = performance.now();
              try {
                  await fetch('https://' + targetIP + '/favicon.ico?cb=' + startTime, { mode: 'no-cors', cache: 'no-store' });
                  const duration = Math.round(performance.now() - startTime);
                  document.getElementById('ping-time').textContent = duration + ' ms';
                  document.getElementById('ping-status').className = "text-sm font-bold text-emerald-500";
                  document.getElementById('ping-status').textContent = "Success";
              } catch (err) {
                  const duration = Math.round(performance.now() - startTime);
                  if (duration < 1500) {
                      document.getElementById('ping-time').textContent = duration + ' ms';
                      document.getElementById('ping-status').className = "text-sm font-bold text-amber-500";
                      document.getElementById('ping-status').textContent = "Indirect-OK";
                  } else {
                      document.getElementById('ping-time').textContent = 'Timeout';
                      document.getElementById('ping-status').className = "text-sm font-bold text-red-500";
                      document.getElementById('ping-status').textContent = "Unreachable";
                  }
              }
          }
  
          async function doLogin(silent = false) {
              const btn = document.querySelector('button[onclick="doLogin()"]');
              const origText = btn.innerText; 
              if(!silent) btn.innerText = "...";
              try {
                  const pass = silent ? sessionKey : document.getElementById('pwd').value;
                  const res = await fetch(baseRoute + '/api/auth', { method: 'POST', body: JSON.stringify({ key: pass }) });
                  const data = await res.json();
                  if (data.success) {
                      sessionKey = pass; localUUID = data.deviceId;
                      localStorage.setItem('nahan_session', JSON.stringify({ key: pass, expiry: Date.now() + 30 * 60 * 1000 }));
                      
                      document.getElementById('login-box').classList.add('hidden');
                      document.getElementById('dash-box').classList.remove('hidden');
                      document.getElementById('dash-box').classList.add('flex');
                      document.getElementById('btn-logout-mob').classList.remove('hidden');
                      
                      document.getElementById('net-ip').textContent = data.network.ip;
                      document.getElementById('net-colo').textContent = data.network.colo;
                      document.getElementById('net-loc').textContent = data.network.loc;
                      
                      const conf = data.config;
                      document.getElementById('cfg-proto').value = conf.mode || 'alpha';
                      document.getElementById('cfg-port').value = conf.socketPort || '443';
                      document.getElementById('cfg-uuid').value = conf.deviceId || '';
                      document.getElementById('cfg-path').value = conf.apiRoute || '';
                      document.getElementById('cfg-pass').value = conf.masterKey || '';
                      document.getElementById('cfg-fp').value = conf.agent || 'chrome';
                      document.getElementById('cfg-dns').value = conf.resolveIp || '';
                      document.getElementById('cfg-ips').value = conf.cleanIps || '';
                      document.getElementById('cfg-fake').value = conf.maintenanceHost || '';
                      document.getElementById('cfg-relay').value = conf.backupRelay || '';
                      document.getElementById('cfg-tfo').checked = conf.enableOpt1 || false;
                      document.getElementById('cfg-ech').checked = conf.enableOpt2 || false;
                      document.getElementById('cfg-tg-token').value = conf.tgToken || '';
                      document.getElementById('cfg-tg-chat').value = conf.tgChatId || '';
                      document.getElementById('cfg-cf-acc').value = conf.cfAccountId || '';
                      document.getElementById('cfg-cf-token').value = conf.cfApiToken || '';
                      document.getElementById('cfg-pause').checked = conf.isPaused || false;
                      document.getElementById('cfg-silent').checked = conf.silentAlerts || false;
                      document.getElementById('cfg-github-repo').value = conf.githubRepo || 'itsyebekhe/nahan';
  
                      window.nahanConfig = JSON.parse(JSON.stringify(conf));
                      window.nahanUsage = data.sysUsage || {};
                      window.nahanProfiles = data.profiles || [];
                      renderUsersTable();
                      try { checkUpdate(); } catch(ue) { console.error(ue); }

                      ['cfg-proto','cfg-port','cfg-fp','cfg-ips','cfg-path', 'cfg-relay'].forEach(id => {
                          const el = document.getElementById(id);
                          if(el) { el.addEventListener('input', updateUI); el.addEventListener('change', updateUI); }
                      });
                      ['cfg-ech','cfg-tfo'].forEach(id => {
                          const el = document.getElementById(id);
                          if(el) el.addEventListener('change', updateUI);
                      });
                      
                      const pCont = document.getElementById('dyn-profiles-container');
                      pCont.innerHTML = '';
                      data.profiles.forEach(p => {
                          const isDef = p.name === 'Default';
                          let html = \`<div class="bg-white dark:bg-darkcard rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden">
                              <div class="absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
                              <div class="flex items-center justify-between mb-4">
                                  <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                                      <svg class="w-5 h-5 me-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                      \${p.name}
                                  </h3>
                                  \${isDef ? '<span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase">Master</span>' : ''}
                              </div>
                              <div class="space-y-3">
                                  <div>
                                      <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">UUID</label>
                                      <div class="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-darkborder px-3 py-2 rounded-lg text-xs font-mono text-slate-500">\${p.id}</div>
                                  </div>
                                  <div class="relative">
                                      <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cloud Sync URL</label>
                                      <input type="text" id="sync-\${p.id}" readonly value="\${p.sync}" class="w-full bg-slate-50 dark:bg-darkbg border border-slate-200 dark:border-darkborder px-4 py-3 rounded-xl text-sm outline-none font-mono text-slate-600 dark:text-slate-400 truncate pe-12">
                                      <button onclick="copyData('sync-\${p.id}')" class="absolute bottom-1 end-1 text-primary p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                  </div>
                                  <button onclick="showQR('\${p.name}', document.getElementById('sync-\${p.id}').value)" class="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-sm">
                                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                                      Show QR Code
                                  </button>
                              </div>
                          </div>\`;
                          pCont.innerHTML += html;
                      });
                      
                      // Inject usage metrics table
                      const usageCont = document.getElementById('usage-metrics-container');
                      if(usageCont && data.usage) {
                          usageCont.innerHTML = '';
                          data.profiles.forEach(p => {
                              let hash = p.id.replace(/-/g, '').toLowerCase();
                              let use = data.usage[hash];
                              if(use) {
                                  let timeStr = new Date(use.last).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
                                  usageCont.innerHTML += \`<div class="flex items-center justify-between p-3 border-b border-slate-100 dark:border-darkborder/50 last:border-0"><div class="flex flex-col"><span class="text-sm font-bold text-slate-700 dark:text-slate-200">\${p.name}</span><span class="text-[10px] text-slate-400 font-mono">\${p.id.split('-')[0]}...</span></div><div class="flex flex-col items-end"><span class="text-xs font-bold text-emerald-500">\${use.connects} Conns</span><span class="text-[10px] text-slate-400">\${timeStr}</span></div></div>\`;
                              }
                          });
                          if(usageCont.innerHTML === '') usageCont.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No active connection data yet.</p>';
                      }
                      
                      updateUI();
                  } else { 
                      if(!silent) { document.getElementById('err-msg').classList.remove('hidden'); btn.innerText = origText; }
                      else { localStorage.removeItem('nahan_session'); }
                  }
              } catch (err) { if(!silent) btn.innerText = origText; }
          }
  
          async function doSave() {
              const el = id => document.getElementById(id);
              const payload = {
                  key: sessionKey,
                  config: {
                      mode: el('cfg-proto').value, socketPort: el('cfg-port').value, deviceId: el('cfg-uuid').value,
                      apiRoute: el('cfg-path').value, masterKey: el('cfg-pass').value, agent: el('cfg-fp').value,
                      resolveIp: el('cfg-dns').value, cleanIps: el('cfg-ips').value, maintenanceHost: el('cfg-fake').value, backupRelay: el('cfg-relay').value,
                      enableOpt1: el('cfg-tfo').checked, enableOpt2: el('cfg-ech').checked,
                      tgToken: el('cfg-tg-token').value, tgChatId: el('cfg-tg-chat').value,
                      cfAccountId: el('cfg-cf-acc').value, cfApiToken: el('cfg-cf-token').value,
                      isPaused: el('cfg-pause').checked, silentAlerts: el('cfg-silent').checked,
                      githubRepo: el('cfg-github-repo').value
                  }
              };
              const stat = el('save-status'); stat.textContent = i18n[lang].msg_saving; stat.className = "text-sm font-bold text-primary animate-pulse md:me-4";
              try {
                  const res = await fetch(baseRoute + '/api/sync', { method: 'POST', body: JSON.stringify(payload) });
                  const data = await res.json();
                  if (data.success) {
                      stat.textContent = i18n[lang].msg_saved; stat.className = "text-sm font-bold text-emerald-500 md:me-4";
                      setTimeout(() => window.location.href = '/' + data.newRoute + '/dash', 1000);
                  } else { stat.textContent = i18n[lang].msg_err; stat.className = "text-sm font-bold text-red-500 md:me-4"; }
              } catch(e) { stat.textContent = i18n[lang].msg_err; stat.className = "text-sm font-bold text-red-500 md:me-4"; }
          }
  
          document.getElementById('pwd').addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });
  
          function renderUsersTable() {
              const tbl = document.getElementById('tbl-users');
              if(!tbl) return;
              let users = window.nahanConfig?.users || [];
              let usage = window.nahanUsage || {};
              tbl.innerHTML = '';
              if (users.length === 0) {
                  tbl.innerHTML = \`<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400" data-i18n="no_users">\${i18n[lang].no_users}</td></tr>\`;
                  return;
              }
              users.forEach((u, i) => {
                  let b = usage[u.id.replace(/-/g,'').toLowerCase()]?.b || 0;
                  let mb = (b / (1024*1024)).toFixed(2);
                  let limitGbTxt = u.limitGb ? u.limitGb + ' GB' : 'Unlimited';
                  let per = u.limitGb ? Math.min(100, (b / (u.limitGb * 1024 * 1024 * 1024)) * 100).toFixed(1) + '%' : '-';
                  
                  let expTxt = 'Unlimited';
                  let isExp = false;
                  if (u.expiryMs) {
                      let date = new Date(u.expiryMs);
                      expTxt = date.toLocaleDateString();
                      if (Date.now() > u.expiryMs) { expTxt += ' <span class="text-xs text-red-500 font-bold">(Expired)</span>'; isExp = true; }
                  }
                  
                  let linkHtml = \`<button onclick="copyData('sync-\${u.id}')" class="text-primary hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 p-2 rounded-lg" title="Copy Subscription Link">🔗</button>\`;
                  
                  let tr = document.createElement('tr');
                  tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";
                  tr.innerHTML = \`
                      <td class="px-4 py-4 font-bold text-slate-700 dark:text-slate-300">\${u.name} \${isExp ? '🔴' : '🟢'}</td>
                      <td class="px-4 py-4 font-mono text-xs text-slate-500 select-all">\${u.id}</td>
                      <td class="px-4 py-4 text-slate-600 dark:text-slate-400 font-mono"><div class="flex flex-col"><span class="font-bold">\${mb} MB</span><span class="text-xs opacity-70">Limit: \${limitGbTxt} (\${per})</span></div></td>
                      <td class="px-4 py-4 text-slate-600 dark:text-slate-400">\${expTxt}</td>
                      <td class="px-4 py-4 text-end space-x-2 space-x-reverse">
                          <input type="hidden" id="sync-\${u.id}" value="\${window.nahanProfiles.find(p => p.id === u.id)?.sync || ''}">
                          \${linkHtml}
                          <button onclick="deleteUser('\${u.id}')" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-800/50 p-2 rounded-lg">🗑️</button>
                      </td>
                  \`;
                  tbl.appendChild(tr);
              });
              applyLang();
          }

          function deleteUser(uuid) {
              if(!confirm('Are you sure you want to delete this user?')) return;
              if(window.nahanConfig && window.nahanConfig.users) {
                  window.nahanConfig.users = window.nahanConfig.users.filter(u => u.id !== uuid);
              }
              // Automatically sync
              renderUsersTable();
              doSaveDirectly();
          }

          function commitAddUser() {
              const name = document.getElementById('add-user-name').value;
              let gb = document.getElementById('add-user-gb').value;
              let days = document.getElementById('add-user-days').value;
              
              if(!name) { alert('Please enter a name'); return; }
              gb = gb ? parseFloat(gb) : null;
              days = days ? parseInt(days) : null;
              
              if(!window.nahanConfig) window.nahanConfig = {};
              if(!window.nahanConfig.users) window.nahanConfig.users = [];
              
              let newId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                  .map((b,i) => (i===4||i===6||i===8||i===10?'-':'') + b.toString(16).padStart(2,'0')).join('');
              
              const u = {
                  id: newId,
                  name: name,
                  limitGb: gb,
                  expiryMs: days ? Date.now() + days*86400000 : null,
                  createdAt: Date.now()
              };
              
              window.nahanConfig.users.push(u);
              document.getElementById('modal-add-user').classList.add('hidden');
              document.getElementById('add-user-name').value = '';
              document.getElementById('add-user-gb').value = '';
              document.getElementById('add-user-days').value = '';
              
              renderUsersTable();
              doSaveDirectly();
          }

          async function doSaveDirectly() {
              const btn = document.querySelector('button[onclick="doSave()"]');
              const origText = btn.innerText; btn.innerText = "...";
              try {
                  const res = await fetch(baseRoute + '/api/sync', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ key: sessionKey, config: window.nahanConfig })
                  });
                  if(res.ok) {
                       const stat = document.getElementById('save-status');
                       stat.textContent = "Saved. Refreshing...";
                       setTimeout(() => { doLogin(true); stat.textContent = ""; }, 1000);
                  }
              } catch(e) {}
              btn.innerText = origText;
          }

          async function checkUpdate() {
              let repo = document.getElementById('cfg-github-repo')?.value || window.nahanConfig?.githubRepo || 'itsyebekhe/nahan';
              repo = repo.replace(/https:\\/\\/github\\.com\\//, '').trim();
              if (!repo) return;
              
              try {
                  let remoteVer = null;
                  try {
                      const res = await fetch('https://raw.githubusercontent.com/' + repo + '/main/version');
                      if (res.ok) {
                          const txt = await res.text();
                          if (txt && txt.trim().length <= 15) {
                              remoteVer = txt.trim();
                          }
                      }
                  } catch(e) {}
                  
                  if (!remoteVer) {
                      const res = await fetch('https://raw.githubusercontent.com/' + repo + '/main/_worker.js');
                      if (res.ok) {
                          const code = await res.text();
                          const match = code.match(/const\\s+CURRENT_VERSION\\s*=\\s*["\']([^"\']+)["\']/);
                          if (match && match[1]) {
                              remoteVer = match[1];
                          }
                      }
                  }
                  
                  if (remoteVer) {
                      const strip = v => v.replace(/^v/, '').trim();
                      const rVer = strip(remoteVer);
                      const cVer = strip("2.1.0-optim");
                      
                      if (rVer && rVer !== cVer) {
                          showUpdateBanner(repo, rVer);
                      }
                  }
              } catch(err) {
                  console.error("Update check failed:", err);
              }
          }
          
          function showUpdateBanner(repo, version) {
              const banner = document.getElementById('update-alert-banner');
              if (!banner) return;
              
              const msg = lang === 'fa' 
                  ? 'نسخه جدیدتر (v' + version + ') در مخزن گیت\u200cهاب شما (' + repo + ') در دسترس است.' 
                  : 'A newer version (v' + version + ') is available in your GitHub repository (' + repo + ').';
                  
              document.getElementById('update-alert-text').textContent = msg;
              document.getElementById('update-alert-btn').href = 'https://github.com/' + repo;
              banner.classList.remove('hidden');
              banner.classList.add('flex');
          }
          
          function dismissUpdate() {
              const b = document.getElementById('update-alert-banner');
              if (b) {
                  b.classList.remove('flex');
                  b.classList.add('hidden');
              }
          }

          document.addEventListener('DOMContentLoaded', () => {
              const cached = localStorage.getItem('nahan_session');
              if(cached) {
                  try {
                      const session = JSON.parse(cached);
                      if (Date.now() < session.expiry) {
                          document.getElementById('pwd').value = session.key;
                          doLogin(true);
                      } else { localStorage.removeItem('nahan_session'); }
                  } catch(e) { localStorage.removeItem('nahan_session'); }
              }
          });
      </script>
  </body>
  </html>
    `;
}
