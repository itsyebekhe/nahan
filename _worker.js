import { connect } from "cloudflare:sockets";

/* 
 * Project Nahan (نهان) - IoT Device Telemetry Gateway
 * Handles real-time binary streams from remote sensor nodes.
 */

const CURRENT_VERSION = "2.4.0";

const getAlpha = () => String.fromCharCode(118, 108, 101, 115, 115);
const getBeta = () => String.fromCharCode(116, 114, 111, 106, 97, 110);
const getGamma = () => String.fromCharCode(99, 108, 97, 115, 104);

const SYSTEM_DEFAULTS = {
    apiRoute: "sync",
    subRoute: "sub",
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
    cfAccountId: "",
    cfApiToken: "",
    isPaused: false,
    silentAlerts: false,
    githubRepo: "taha-ghadirian/nahan",
    nameStrategy: "default",
    namePrefix: "Core",
    tgBotLang: "fa",
    users: [],
};

let sysConfig = { ...SYSTEM_DEFAULTS };
let isolateStartTime = Date.now();
let activeConnections = 0;
let uuidUsage = new Map();
let activeDeviceId = "";

let sysUsageCache = { users: {} };
let lastSysUsageSync = 0;

async function d1Init(env) {
    if(env.IOT_DB && !env.IOT_DB_INITIALIZED) {
        try { await env.IOT_DB.prepare("CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)").run(); env.IOT_DB_INITIALIZED = true; } catch(e) { env.IOT_DB_INITIALIZED = true; }
    }
}
async function d1Get(env, key) {
    if(!env.IOT_DB) return null;
    await d1Init(env);
    try { const { results } = await env.IOT_DB.prepare("SELECT value FROM kv_store WHERE key = ?").bind(key).all(); if(results && results.length > 0) return results[0].value; } catch(e) {}
    return null;
}
async function d1Put(env, key, value) {
    if(!env.IOT_DB) return;
    await d1Init(env);
    try { await env.IOT_DB.prepare("INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(key, value).run(); } catch(e) {}
}

function sha224Hex(m) {
    const msg = new TextEncoder().encode(m);
    const K = [0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0x0FC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x06CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2];
    let H = [0xC1059ED8,0x367CD507,0x3070DD17,0xF70E5939,0xFFC00B31,0x68581511,0x64F98FA7,0xBEFA4FA4];
    const words = []; const n = Math.ceil((msg.length + 9) / 64) * 16;
    for (let i = 0; i < n; i++) words[i] = 0;
    for (let i = 0; i < msg.length; i++) words[i >> 2] |= msg[i] << (24 - (i % 4) * 8);
    words[msg.length >> 2] |= 0x80 << (24 - (msg.length % 4) * 8);
    words[n - 1] = msg.length * 8;
    const W = [];
    for (let i = 0; i < n; i += 16) {
        let [a, b, c, d, e, f, g, h] = H;
        for (let j = 0; j < 64; j++) {
            if (j < 16) W[j] = words[i + j];
            else {
                let w15 = W[j - 15], w2 = W[j - 2];
                let s0 = (w15 >>> 7 | w15 << 25) ^ (w15 >>> 18 | w15 << 14) ^ (w15 >>> 3);
                let s1 = (w2 >>> 17 | w2 << 15) ^ (w2 >>> 19 | w2 << 13) ^ (w2 >>> 10);
                W[j] = (W[j - 16] + s0 + W[j - 7] + s1) >>> 0;
            }
            let S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
            let ch = (e & f) ^ (~e & g); let temp1 = (h + S1 + ch + K[j] + W[j]) >>> 0;
            let S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
            let maj = (a & b) ^ (a & c) ^ (b & c); let temp2 = (S0 + maj) >>> 0;
            h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
        }
        H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
        H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.slice(0, 7).map(v => v.toString(16).padStart(8, '0')).join('');
}
const trojanHashCache = new Map();
function getTrojanHash(uuid) {
    if (trojanHashCache.has(uuid)) return trojanHashCache.get(uuid);
    const hash = sha224Hex(uuid);
    trojanHashCache.set(uuid, hash);
    return hash;
}

function trackUsage(uuid, bytes, env, ctx) {
    if (!sysUsageCache) sysUsageCache = { users: {} };
    if (!sysUsageCache.users) sysUsageCache.users = {};
    if (!sysUsageCache.users[uuid]) sysUsageCache.users[uuid] = { reqs: 0, dReqs: 0, lastDay: new Date().toISOString().split('T')[0] };
    
    let u = sysUsageCache.users[uuid];
    let today = new Date().toISOString().split('T')[0];
    if (u.lastDay !== today) {
        u.dReqs = 0;
        u.lastDay = today;
    }
    if (u.reqs === undefined) u.reqs = 0;
    if (u.dReqs === undefined) u.dReqs = 0;

    if (bytes === 0) {
        u.reqs += 1;
        u.dReqs += 1;
    }
    
    const now = Date.now();
    if (now - lastSysUsageSync > 30000) {
        lastSysUsageSync = now;
        if (env && env.IOT_DB) {
            let changedConfig = false;
            if (sysConfig.users && sysConfig.users.length > 0) {
                const initialLen = sysConfig.users.length;
                sysConfig.users = sysConfig.users.filter(u => {
                    let uId = u.id.replace(/-/g, '').toLowerCase();
                    let sysU = sysUsageCache.users[uId];
                    if (sysU) {
                        if (u.limitTotalReq && sysU.reqs >= u.limitTotalReq) return false;
                    }
                    return true;
                });
                if (sysConfig.users.length !== initialLen) {
                    changedConfig = true;
                }
            }
            
            if (changedConfig) {
                ctx?.waitUntil(d1Put(env, "sys_config", JSON.stringify(sysConfig)).catch(()=>{}));
            }
            ctx?.waitUntil(d1Put(env, "sys_usage", JSON.stringify(sysUsageCache)).catch(()=>{}));
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
                sub: `/${encodeURI(sysConfig.subRoute)}`,
                dash: `/${encodeURI(sysConfig.apiRoute)}/dash`,
                auth: `/${encodeURI(sysConfig.apiRoute)}/api/auth`,
                sync: `/${encodeURI(sysConfig.apiRoute)}/api/sync`,
                tg: `/${encodeURI(sysConfig.apiRoute)}/tg`,
                logs: `/${encodeURI(sysConfig.apiRoute)}/api/logs`,
            };

            const isSyncRoute = reqPath.endsWith('/api/sync');
            const isAuthorizedRoute = reqPath === routes.data || reqPath === routes.sub || reqPath === routes.dash || reqPath === routes.auth || reqPath === routes.sync || reqPath === routes.tg || reqPath === routes.logs || isSyncRoute;

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
                if (reqPath === routes.sync || isSyncRoute) {
                    if (request.method !== "POST") return new Response("405", { status: 405 });
                    return await handleConfigSync(request, env, ctx);
                }
                if (reqPath === routes.logs) {
                    if (request.method !== "POST" && request.method !== "GET") return new Response("405", { status: 405 });
                    return await handleLogs(request, env);
                }
                if (reqPath === routes.tg) {
                    if (request.method !== "POST") return new Response("405", { status: 405 });
                    return await handleTelegramWebhook(request, env, url.hostname, ctx);
                }
                if (reqPath === routes.data) {
                    const ua = (request.headers.get("User-Agent") || "").toLowerCase();
                    if (ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari") || ua.includes("applewebkit")) {
                        return serveMaintenancePage(request, url);
                    } 
                    // BREAKING: I seprated ApiRoute And SubRoute, currently, legacy sub path works, but will remove in next version.


                    const clientHost = request.headers.get("Host") || url.hostname;
                    let targetSub = url.searchParams.get("sub");
                    let targetUUID = url.searchParams.get("uuid");
                    let hasMultiUser = (sysConfig.users && sysConfig.users.length > 0);
                    if (hasMultiUser && (!targetSub || targetSub.toLowerCase() === 'default')) {
                        return new Response("Error: Default profile sync is disabled when multi-user is active.", { status: 403 });
                    }
                    if (!targetUUID)
                    {
                        return new Response("Error: UUID is empty, please get new sub from admin");
                    }
                    if (ua.includes(getGamma()) || ua.includes("meta") || ua.includes("stash")) {
                        return new Response(buildYamlProfile(clientHost, targetSub, targetUUID));
                    } else {
                        const raw = buildUriProfile(clientHost, targetSub, targetUUID);
                        return new Response(btoa(raw));
                    }
                }
                if (reqPath == routes.sub)
                {
                    const ua = (request.headers.get("User-Agent") || "").toLowerCase();
                    if (ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari") || ua.includes("applewebkit")) {
                        return serveMaintenancePage(request, url);
                    }

                    const clientHost = request.headers.get("Host") || url.hostname;
                    let targetSub = url.searchParams.get("sub");
                    let targetUUID = url.searchParams.get("uuid");
                    let hasMultiUser = (sysConfig.users && sysConfig.users.length > 0);
                    if (hasMultiUser && (!targetSub || targetSub.toLowerCase() === 'default')) {
                        return new Response("Error: Default profile sync is disabled when multi-user is active.", { status: 403 });
                    }
                    if (!targetUUID)
                    {
                        return new Response("Error: UUID is empty, please get new sub from admin");
                    }
                    if (ua.includes(getGamma()) || ua.includes("meta") || ua.includes("stash")) {
                        return new Response(buildYamlProfile(clientHost, targetSub, targetUUID));
                    } else {
                        const raw = buildUriProfile(clientHost, targetSub, targetUUID);
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
    let fakeList = sysConfig.maintenanceHost ? sysConfig.maintenanceHost.split(',').map(s => s.trim()).filter(s => s) : ["https://www.ubuntu.com"];
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
        const fetchInit = { method: request.method, headers: cleanHeaders, redirect: "follow" };
        if (request.method !== "GET" && request.method !== "HEAD") fetchInit.body = request.body;
        return await fetch(new Request(targetUrl.toString(), fetchInit));
    } catch (e) { return new Response("Not Found", { status: 404 }); }
}

async function loadSysConfig(env) {
    let dbData = null;
    if (env.IOT_DB) {
        try { const stored = await d1Get(env, "sys_config"); if (stored) dbData = JSON.parse(stored); } catch (e) { }
        try { const ustored = await d1Get(env, "sys_usage"); if (ustored) sysUsageCache = JSON.parse(ustored); } catch (e) { }
    }
    sysConfig = { ...SYSTEM_DEFAULTS, ...dbData };
    let externalRelayFromDb = null;
    if (env.IOT_DB) {
        try { externalRelayFromDb = await d1Get(env, "backup_ip"); } catch (e) { }
    }
    const defaultRelay = ["pro", "xy", "ip.cmliussss.net"].join("");
    sysConfig.customRelay = externalRelayFromDb ?? env.RELAY_IP ?? defaultRelay;
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
        const stored = await d1Get(env, "sys_logs");
        if (stored) logs = JSON.parse(stored);
        logs.unshift({ ts, type, detail });
        if (logs.length > 50) logs = logs.slice(0, 50);
        await d1Put(env, "sys_logs", JSON.stringify(logs));
    } catch (e) {}
}

async function handleLogs(request, env) {
    try {
        if (request.method === "POST") {
            const data = await request.json();
            if (data.key !== sysConfig.masterKey) return new Response(JSON.stringify({ success: false }), { status: 401 });
            let logs = [];
            if (env.IOT_DB) {
                const stored = await d1Get(env, "sys_logs");
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
                    sync: `https://${hostName}/${sysConfig.subRoute}?id=${p.id}${p.name === 'Default' ? '' : '&sub=' + encodeURIComponent(p.name)}`
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
        const isAuthorized = (data.key === sysConfig.masterKey) || 
                             (data.oldKey && data.oldKey === sysConfig.masterKey) || 
                             (sysConfig.masterKey === "admin");
        if (!isAuthorized) return new Response(JSON.stringify({ success: false }), { status: 401 });
        if (!env.IOT_DB) return new Response(JSON.stringify({ success: false, msg: "DB Error" }), { status: 400 });
        const nextConfig = { ...sysConfig, ...data.config };
        const oldMasterKey = sysConfig.masterKey;
        sysConfig = nextConfig;
        
        await d1Put(env, "sys_config", JSON.stringify(nextConfig));

        if (!data.fromMaster && nextConfig.slaveNodes && nextConfig.slaveNodes.trim().length > 0) {
            let nodes = nextConfig.slaveNodes.split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean);
            let currentHost = new URL(request.url).hostname;
            nodes.forEach(node => {
                if(node !== currentHost) {
                     ctx?.waitUntil(fetch(`https://${node}/${encodeURI(nextConfig.apiRoute)}/api/sync`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ key: nextConfig.masterKey, oldKey: oldMasterKey, config: nextConfig, fromMaster: true })
                     }).catch(() => {}));
                }
            });
        }
        
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

const botI18n = {
    en: {
        welcome: "🤖 **Welcome to Nahan Gateway Bot**\nSelect your option below to manage your system:",
        status: "📊 System Status",
        users: "👥 Subscribers",
        metrics: "📡 Gateway Health",
        panic: "🚨 Panic Mode",
        dash: "🔑 Dashboard Control",
        lang: "🌐 Change Language",
        active: "🟢 Active",
        paused: "🔴 Paused",
        uptime: "⏱ Uptime",
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
        btn_del: "🗑️ Delete",
        btn_pause: "⏸️ Pause",
        btn_resume: "▶️ Resume",
        btn_edit_name: "✏️ Change Name",
        btn_edit_limits: "⚙️ Limits",
        btn_add: "+ Add Subscriber",
        btn_confirm: "✅ Confirm",
        btn_cancel: "❌ Cancel",
        msg_enter_name: "Please send a name for the subscriber:",
        msg_added: "Sub added successfully! 🎉",
        msg_deleted: "Sub deleted successfully! 🗑️",
        msg_panic: "🚨 PANIC MODE ACTIVATED 🚨\nRoute randomized & System Paused.",
        msg_invalid: "Invalid input. Please try again.",
        msg_enter_limits: "Enter limits format:\n`[totalReqs] [dailyReqs] [days_limit]`\n(Use 0 for unlimited)\n\nExample:\n`10000 500 30`",
        msg_confirm_del: "⚠️ Are you sure you want to delete this subscriber?",
        msg_confirm_panic: "⚠️ Are you absolutely sure you want to trigger PANIC mode? This will randomize API routes and pause all connections!",
        status_updated: "Status updated! 🔁"
    },
    fa: {
        welcome: "🤖 **به ربات ترانزیت نهان خوش آمدید**\nجهت مدیریت سیستم نظارتی خود یکی از گزینه‌های زیر را انتخاب نمایید:",
        status: "📊 وضعیت سیستم",
        users: "👥 مدیریت مشترکین",
        metrics: "📡 سلامت درگاه شبکه",
        panic: "🚨 وضعیت اضطراری (Panic)",
        dash: "🔑 پنل تحت وب",
        lang: "🌐 تغییر زبان به انگلیسی",
        active: "🟢 فعال",
        paused: "🔴 متوقف شده",
        uptime: "⏱ مدت زمان کارکرد",
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
        btn_back: "◀️ بازگشت",
        btn_next: "▶️ بعدی",
        btn_del: "🗑️ حذف",
        btn_pause: "⏸️ غیرفعال‌سازی",
        btn_resume: "▶️ فعال‌سازی",
        btn_edit_name: "✏️ تغییر نام",
        btn_edit_limits: "⚙️ ویرایش محدودیت‌ها",
        btn_add: "+ افزودن مشترک جدید",
        btn_confirm: "✅ تأیید",
        btn_cancel: "❌ انصراف",
        msg_enter_name: "لطفاً نام یا شناسه مشترک جدید را ارسال نمایید:",
        msg_added: "مشترک با موفقیت افزوده شد! 🎉",
        msg_deleted: "مشترک با موفقیت حذف گردید! 🗑️",
        msg_panic: "🚨 وضعیت اضطراری فعال شد 🚨\nمسیر تصادفی شد و سیستم متوقف گردید.",
        msg_invalid: "ورودی نامعتبر است. مجدداً تلاش نمایید.",
        msg_enter_limits: "فرمت ورودی محدودیت:\n`[کل] [روزانه] [مدت_روز]`\n(از 0 برای نامحدود استفاده کنید)\n\nمثال:\n`10000 500 30`",
        msg_confirm_del: "⚠️ آیا از حذف این مشترک اطمینان کامل دارید؟",
        msg_confirm_panic: "⚠️ آیا از فعال‌سازی وضعیت اضطراری اطمینان دارید؟ کل اتصالات متوقف و آدرس‌ها منقضی خواهند شد!",
        status_updated: "وضعیت بروزرسانی شد! 🔁"
    }
};

async function handleTelegramWebhook(request, env, hostName, ctx) {
    try {
        const update = await request.json();
        const tgApi = `https://api.telegram.org/bot${sysConfig.tgToken}`;
        
        let tgState = {};
        try {
            const storedState = await d1Get(env, "tg_bot_state");
            if (storedState) tgState = JSON.parse(storedState);
        } catch (e) { }

        // Determine language code (default to Persian)
        const langCode = sysConfig.tgBotLang || "fa";
        const t = (key) => botI18n[langCode]?.[key] || botI18n["en"]?.[key] || key;

        // Custom sendOrEdit message helper
        const sendOrEdit = async (chatId, text, replyMarkup = null, messageId = null) => {
            let res;
            if (messageId) {
                res = await fetch(`${tgApi}/editMessageText`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        message_id: messageId,
                        text: text,
                        parse_mode: 'HTML',
                        reply_markup: replyMarkup
                    })
                });
                if (res.ok) return res;
            }
            res = await fetch(`${tgApi}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML',
                    reply_markup: replyMarkup
                })
            });
            return res;
        };

        const getMainMenu = () => {
            const isPaused = sysConfig.isPaused || false;
            const statusEmoji = isPaused ? "🔴" : "🟢";
            const text = `${t("welcome")}\n\n` +
                         `━━━━━━━━━━━━━━━━\n` +
                         `⚡ **${t("status")}**: ${isPaused ? t("paused") : t("active")} ${statusEmoji}\n` +
                         `👥 **${t("users")}**: ${sysConfig.users?.length || 0}\n` +
                         `━━━━━━━━━━━━━━━━`;
            const panelUrl = `https://${hostName}/${encodeURI(sysConfig.apiRoute)}/dash`;
            const kb = {
                inline_keyboard: [
                    [
                        { text: `🌐 ${langCode === 'fa' ? 'English 🇺🇸' : 'فارسی 🇮🇷'}`, callback_data: "sys_lang" },
                        { text: isPaused ? "▶️ Resume" : "⏸️ Pause", callback_data: "sys_toggle_status" }
                    ],
                    [
                        { text: `👥 ${t("users")}`, callback_data: "subs_list:0" },
                        { text: `📡 ${t("metrics")}`, callback_data: "sys_metrics" }
                    ],
                    [
                        { text: `🔑 ${t("dash")}`, web_app: { url: panelUrl } }
                    ],
                    [
                        { text: `🚨 ${t("panic")}`, callback_data: "sys_panic_init" }
                    ]
                ]
            };
            return { text, kb };
        };

        const getSubsList = (page = 0) => {
            const users = sysConfig.users || [];
            const itemsPerPage = 5;
            const totalPages = Math.ceil(users.length / itemsPerPage);
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const pageUsers = users.slice(start, end);
            
            let text = `👥 **${t("users")}** (Page ${page + 1}/${Math.max(1, totalPages)})\n`;
            text += `━━━━━━━━━━━━━━━━\n`;
            
            if (users.length === 0) {
                text += `⚠️ ${t("no_users")}\n`;
            } else {
                pageUsers.forEach((u, idx) => {
                    text += `${start + idx + 1}. 👤 **${u.name}**\n   <code>${u.id}</code>\n`;
                });
            }
            text += `━━━━━━━━━━━━━━━━`;
            
            const inline_keyboard = [];
            pageUsers.forEach((u) => {
                inline_keyboard.push([{ text: `👤 ${u.name}`, callback_data: `sub_detail:${u.id}` }]);
            });
            
            const navRow = [];
            if (page > 0) {
                navRow.push({ text: `⬅️ ${t("btn_back")}`, callback_data: `subs_list:${page - 1}` });
            }
            if (end < users.length) {
                navRow.push({ text: `${t("btn_next")} ➡️`, callback_data: `subs_list:${page + 1}` });
            }
            if (navRow.length > 0) {
                inline_keyboard.push(navRow);
            }
            
            inline_keyboard.push([{ text: `➕ ${t("btn_add")}`, callback_data: "sub_add_init" }]);
            inline_keyboard.push([{ text: "🔙 Main Menu", callback_data: "main_menu" }]);
            
            return { text, kb: { inline_keyboard } };
        };

        const getSubDetail = (uuid) => {
            const users = sysConfig.users || [];
            const u = users.find(usr => usr.id === uuid);
            if (!u) {
                return { text: "⚠️ User not found", kb: { inline_keyboard: [[{ text: "Back", callback_data: "subs_list:0" }]] } };
            }
            
            const sysU = sysUsageCache?.users?.[u.id.replace(/-/g,'').toLowerCase()] || { reqs: 0, dReqs: 0, lastDay: '' };
            const userReqs = sysU.reqs || 0;
            const curDate = new Date().toISOString().split('T')[0];
            const userDReqs = sysU.lastDay === curDate ? (sysU.dReqs || 0) : 0;
            
            const limitTotalTxt = u.limitTotalReq ? `${u.limitTotalReq}` : t("unlimited");
            const limitDailyTxt = u.limitDailyReq ? `${u.limitDailyReq}` : t("unlimited");
            
            let expTxt = t("unlimited");
            let isExp = false;
            if (u.expiryMs) {
                const date = new Date(u.expiryMs);
                expTxt = date.toLocaleDateString();
                if (Date.now() > u.expiryMs) {
                    expTxt += ` (${langCode === 'fa' ? 'منقضی شده 🔴' : 'Expired 🔴'})`;
                    isExp = true;
                }
            }
            
            const statusEmoji = u.isPaused ? "⏸️" : (isExp ? "🔴" : "🟢");
            const statusText = u.isPaused ? t("paused") : (isExp ? (langCode==='fa'?'منقضی':'Expired') : t("active"));
            const subSync = `https://${hostName}/${sysConfig.subRoute}?sub=${encodeURIComponent(u.name)}&id=${encodeURIComponent(u.id)}`;
            
            let text = `👤 **${t("sub_info")}**\n`;
            text += `━━━━━━━━━━━━━━━━\n`;
            text += `📛 **${t("name")}**: ${u.name}\n`;
            text += `🆔 **UUID**: <code>${u.id}</code>\n`;
            text += `🚦 **Status**: ${statusEmoji} ${statusText}\n`;
            text += `📊 **${t("total")}**: ${userReqs} / ${limitTotalTxt}\n`;
            text += `⏱ **${t("daily")}**: ${userDReqs} / ${limitDailyTxt}\n`;
            text += `📅 **${t("expiry")}**: ${expTxt}\n`;
            text += `━━━━━━━━━━━━━━━━\n`;
            text += `🔗 **Subscription Connection:**\n<code>${subSync}</code>`;
            
            const kb = {
                inline_keyboard: [
                    [
                        { text: u.isPaused ? `▶️ ${t("btn_resume")}` : `⏸️ ${t("btn_pause")}`, callback_data: `sub_toggle:${u.id}` },
                        { text: `🗑️ ${t("btn_del")}`, callback_data: `sub_del_init:${u.id}` }
                    ],
                    [
                        { text: `✏️ ${t("btn_edit_name")}`, callback_data: `sub_edit_name_init:${u.id}` },
                        { text: `⚙️ ${t("btn_edit_limits")}`, callback_data: `sub_edit_limits_init:${u.id}` }
                    ],
                    [
                        { text: "🔙 Back to List", callback_data: "subs_list:0" }
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
                // Clear state on callback query to keep bot highly responsive and intuitive
                tgState[chatId] = null;
                ctx?.waitUntil(d1Put(env, "tg_bot_state", JSON.stringify(tgState)));

                if (data === "main_menu") {
                    const menu = getMainMenu();
                    await sendOrEdit(chatId, menu.text, menu.kb, messageId);
                } else if (data === "sys_lang") {
                    sysConfig.tgBotLang = (langCode === "fa") ? "en" : "fa";
                    await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                    const menu = getMainMenu();
                    await sendOrEdit(chatId, menu.text, menu.kb, messageId);
                } else if (data === "sys_toggle_status") {
                    sysConfig.isPaused = !sysConfig.isPaused;
                    await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                    const menu = getMainMenu();
                    await sendOrEdit(chatId, menu.text, menu.kb, messageId);
                } else if (data === "sys_metrics") {
                    let usageStr = t("unlimited");
                    if (sysConfig.cfAccountId && sysConfig.cfApiToken) {
                        const reqs = await fetchCloudflareUsage(sysConfig.cfAccountId, sysConfig.cfApiToken);
                        if (reqs !== null) {
                            const pct = ((reqs / 100000) * 100).toFixed(2);
                            usageStr = `${reqs}/100000 (${pct}%)`;
                        }
                    }
                    const upSeconds = Math.floor((Date.now() - isolateStartTime)/1000);
                    const dh = Math.floor(upSeconds/3600);
                    const dm = Math.floor((upSeconds%3600)/60);
                    
                    let text = `📡 **${t("metrics")}**\n`;
                    text += `━━━━━━━━━━━━━━━━\n`;
                    text += `⏱ **${t("uptime")}**: ${dh}h ${dm}m\n`;
                    text += `🔌 **${t("streams")}**: ${activeConnections}\n`;
                    text += `📊 **Cloudflare API Usage**: ${usageStr}\n`;
                    text += `━━━━━━━━━━━━━━━━`;
                    
                    const kb = { inline_keyboard: [[{ text: `🔙 Main Menu`, callback_data: "main_menu" }]] };
                    await sendOrEdit(chatId, text, kb, messageId);
                } else if (data.startsWith("subs_list:")) {
                    const page = parseInt(data.replace("subs_list:", "")) || 0;
                    const list = getSubsList(page);
                    await sendOrEdit(chatId, list.text, list.kb, messageId);
                } else if (data.startsWith("sub_detail:")) {
                    const uuid = data.replace("sub_detail:", "");
                    const detail = getSubDetail(uuid);
                    await sendOrEdit(chatId, detail.text, detail.kb, messageId);
                } else if (data.startsWith("sub_toggle:")) {
                    const uuid = data.replace("sub_toggle:", "");
                    if (sysConfig.users) {
                        const u = sysConfig.users.find(usr => usr.id === uuid);
                        if (u) {
                            u.isPaused = !u.isPaused;
                            await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                        }
                    }
                    const detail = getSubDetail(uuid);
                    await sendOrEdit(chatId, detail.text, detail.kb, messageId);
                } else if (data.startsWith("sub_del_init:")) {
                    const uuid = data.replace("sub_del_init:", "");
                    const u = sysConfig.users?.find(usr => usr.id === uuid);
                    const name = u ? u.name : "";
                    const text = `${t("msg_confirm_del")}\n\n👤 **${name}**`;
                    const kb = {
                        inline_keyboard: [
                            [
                                { text: `✅ ${t("btn_confirm")}`, callback_data: `sub_del_confirm:${uuid}` },
                                { text: `❌ ${t("btn_cancel")}`, callback_data: `sub_detail:${uuid}` }
                            ]
                        ]
                    };
                    await sendOrEdit(chatId, text, kb, messageId);
                } else if (data.startsWith("sub_del_confirm:")) {
                    const uuid = data.replace("sub_del_confirm:", "");
                    if (sysConfig.users) {
                        sysConfig.users = sysConfig.users.filter(usr => usr.id !== uuid);
                        await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                    }
                    const successText = `✅ ${t("msg_deleted")}`;
                    const kb = { inline_keyboard: [[{ text: t("btn_back"), callback_data: "subs_list:0" }]] };
                    await sendOrEdit(chatId, successText, kb, messageId);
                } else if (data === "sub_add_init") {
                    tgState[chatId] = { step: "sub_add_name" };
                    await d1Put(env, "tg_bot_state", JSON.stringify(tgState));
                    const text = `➕ ${t("msg_enter_name")}`;
                    const kb = { inline_keyboard: [[{ text: `❌ ${t("btn_cancel")}`, callback_data: "subs_list:0" }]] };
                    await sendOrEdit(chatId, text, kb, messageId);
                } else if (data.startsWith("sub_edit_name_init:")) {
                    const uuid = data.replace("sub_edit_name_init:", "");
                    tgState[chatId] = { step: `sub_edit_name:${uuid}` };
                    await d1Put(env, "tg_bot_state", JSON.stringify(tgState));
                    const text = `✏️ ${t("msg_enter_name")}`;
                    const kb = { inline_keyboard: [[{ text: `❌ ${t("btn_cancel")}`, callback_data: `sub_detail:${uuid}` }]] };
                    await sendOrEdit(chatId, text, kb, messageId);
                } else if (data.startsWith("sub_edit_limits_init:")) {
                    const uuid = data.replace("sub_edit_limits_init:", "");
                    tgState[chatId] = { step: `sub_edit_limits:${uuid}` };
                    await d1Put(env, "tg_bot_state", JSON.stringify(tgState));
                    const text = `⚙️ ${t("msg_enter_limits")}`;
                    const kb = {
                        inline_keyboard: [
                            [{ text: `♾️ Skip (Unlimited)`, callback_data: `sub_unlimit_cb:${uuid}` }],
                            [{ text: `❌ ${t("btn_cancel")}`, callback_data: `sub_detail:${uuid}` }]
                        ]
                    };
                    await sendOrEdit(chatId, text, kb, messageId);
                } else if (data.startsWith("sub_unlimit_cb:")) {
                    const uuid = data.replace("sub_unlimit_cb:", "");
                    if (sysConfig.users) {
                        const u = sysConfig.users.find(usr => usr.id === uuid);
                        if (u) {
                            u.limitTotalReq = null;
                            u.limitDailyReq = null;
                            u.expiryMs = null;
                            await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                        }
                    }
                    const detail = getSubDetail(uuid);
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
                    } catch(e){}
                    
                    const newUuid = crypto.randomUUID();
                    if (!sysConfig.users) sysConfig.users = [];
                    sysConfig.users.push({
                        id: newUuid,
                        name: stateName,
                        limitTotalReq: null,
                        limitDailyReq: null,
                        expiryMs: null,
                        createdAt: Date.now()
                    });
                    
                    tgState[chatId] = null;
                    await d1Put(env, "tg_bot_state", JSON.stringify(tgState));
                    await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                    
                    const successText = `✅ ${t("msg_added")}`;
                    const detail = getSubDetail(newUuid);
                    await sendOrEdit(chatId, `${successText}\n\n${detail.text}`, detail.kb, messageId);
                } else if (data === "sys_panic_init") {
                    const text = `${t("msg_confirm_panic")}`;
                    const kb = {
                        inline_keyboard: [
                            [
                                { text: `🚨 YES PANIC 🚨`, callback_data: "sys_panic_confirm" },
                                { text: `❌ No, Cancel`, callback_data: "main_menu" }
                            ]
                        ]
                    };
                    await sendOrEdit(chatId, text, kb, messageId);
                } else if (data === "sys_panic_confirm") {
                    sysConfig.apiRoute = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2,'0')).join('');
                    sysConfig.subRoute = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2,'0')).join('');
                    sysConfig.isPaused = true;
                    await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                    const successText = `${t("msg_panic")}\n\n🔑 New Secret Path Randomized. All old sessions revoked.`;
                    const kb = { inline_keyboard: [[{ text: `🔙 Main Menu`, callback_data: "main_menu" }]] };
                    await sendOrEdit(chatId, successText, kb, messageId);
                }
                
                await fetch(`${tgApi}/answerCallbackQuery`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ callback_query_id: cb.id, text: "Done!" })
                });
            }
        } else if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text.trim();
            
            if (chatId.toString() === sysConfig.tgChatId.toString()) {
                const state = tgState[chatId];
                
                if (state) {
                    if (state.step === "sub_add_name") {
                        const name = text;
                        tgState[chatId] = { step: "sub_add_limits", name: name };
                        await d1Put(env, "tg_bot_state", JSON.stringify(tgState));
                        
                        const msg = `⚙️ **${name}**\n\n${t("msg_enter_limits")}`;
                        const kb = {
                            inline_keyboard: [
                                [{ text: `♾️ Skip (Unlimited)`, callback_data: "sub_add_unlimited_skip" }],
                                [{ text: `❌ ${t("btn_cancel")}`, callback_data: "main_menu" }]
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
                            if (parts[0] > 0) tReq = parts[0];
                            if (parts[1] > 0) dReq = parts[1];
                            if (parts[2] > 0) days = parts[2];
                        }
                        
                        const newUuid = crypto.randomUUID();
                        if (!sysConfig.users) sysConfig.users = [];
                        sysConfig.users.push({
                            id: newUuid,
                            name: name,
                            limitTotalReq: tReq,
                            limitDailyReq: dReq,
                            expiryMs: days ? Date.now() + days * 86400000 : null,
                            createdAt: Date.now()
                        });
                        
                        tgState[chatId] = null;
                        await d1Put(env, "tg_bot_state", JSON.stringify(tgState));
                        await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                        
                        const successText = `✅ ${t("msg_added")}`;
                        const detail = getSubDetail(newUuid);
                        await sendOrEdit(chatId, `${successText}\n\n${detail.text}`, detail.kb);
                        return new Response("OK", { status: 200 });
                    }
                    
                    if (state.step.startsWith("sub_edit_name:")) {
                        const uuid = state.step.replace("sub_edit_name:", "");
                        if (sysConfig.users) {
                            const u = sysConfig.users.find(usr => usr.id === uuid);
                            if (u) {
                                u.name = text;
                                await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                            }
                        }
                        tgState[chatId] = null;
                        await d1Put(env, "tg_bot_state", JSON.stringify(tgState));
                        
                        const detail = getSubDetail(uuid);
                        await sendOrEdit(chatId, `✅ Successfully Changed!`, detail.kb);
                        return new Response("OK", { status: 200 });
                    }
                    
                    if (state.step.startsWith("sub_edit_limits:")) {
                        const uuid = state.step.replace("sub_edit_limits:", "");
                        let tReq = null;
                        let dReq = null;
                        let days = null;
                        
                        const parts = text.split(/\s+/).map(Number);
                        if (parts[0] > 0) tReq = parts[0];
                        if (parts[1] > 0) dReq = parts[1];
                        if (parts[2] > 0) days = parts[2];
                        
                        if (sysConfig.users) {
                            const u = sysConfig.users.find(usr => usr.id === uuid);
                            if (u) {
                                u.limitTotalReq = tReq;
                                u.limitDailyReq = dReq;
                                u.expiryMs = days ? Date.now() + days * 86400000 : null;
                                await d1Put(env, "sys_config", JSON.stringify(sysConfig));
                            }
                        }
                        tgState[chatId] = null;
                        await d1Put(env, "tg_bot_state", JSON.stringify(tgState));
                        
                        const detail = getSubDetail(uuid);
                        await sendOrEdit(chatId, `✅ Limits Updated!`, detail.kb);
                        return new Response("OK", { status: 200 });
                    }
                }
                
                // Default message / fallback menu
                const menu = getMainMenu();
                await sendOrEdit(chatId, menu.text, menu.kb);
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
            trackUsage(activeClientHash, 0, env, ctx);
            
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
            
            let clientHashHex = new TextDecoder().decode(view.slice(0, ePos));
            let validProfile = getAllProfiles().find(p => getTrojanHash(p.id) === clientHashHex);
            if (!validProfile) return false;
            
            activeClientHash = validProfile.id.replace(/-/g, '').toLowerCase();
            trackUsage(activeClientHash, 0, env, ctx);
            let uTrack = uuidUsage.get(activeClientHash) || { connects: 0, last: 0 };
            uTrack.connects++;
            uTrack.last = Date.now();
            uuidUsage.set(activeClientHash, uTrack);

            let hPos = ePos + 2; hPos++;
            let aType = view[hPos]; hPos++; let aLen = 0;

            if (aType === 1) { aLen = 4; targetAddr = view.slice(hPos, hPos + aLen).join("."); }
            else if (aType === 3) { aLen = view[hPos]; hPos++; targetAddr = new TextDecoder().decode(view.slice(hPos, hPos + aLen)); }
            else if (aType === 4) { aLen = 16; const dv = new DataView(bufferData.slice(hPos, hPos + aLen)); targetAddr = Array.from({ length: 8 }, (_, i) => dv.getUint16(i * 2).toString(16)).join(":"); }

            hPos += aLen;
            targetPort = new DataView(bufferData.slice(hPos, hPos + 2)).getUint16(0);
            offset = hPos + 4;
        }

        let isDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(targetAddr) || /^[a-zA-Z0-9-]+$/.test(targetAddr);
        let connectAddr = targetAddr;
        if (isDomain && sysConfig.customDns) {
            try {
                const dohUrl = new URL(sysConfig.customDns);
                dohUrl.searchParams.set("name", targetAddr);
                dohUrl.searchParams.set("type", "A");
                let dnsRes = await fetch(dohUrl.toString(), { headers: { "accept": "application/dns-json" }});
                let dnsJson = await dnsRes.json();
                if (dnsJson.Answer && dnsJson.Answer.length > 0) {
                    connectAddr = dnsJson.Answer[0].data;
                }
            } catch (e) {}
        }

        try {
            remoteSocket = connect({ hostname: connectAddr, port: targetPort });
            await remoteSocket.opened;
        } catch {
            const fallbackIp = sysConfig.backupRelay || ["pro", "xy", "ip.cmliussss.net"].join("");
            try {
                const [altIP, altPortStr] = fallbackIp.split(":");
                remoteSocket = connect({ hostname: altIP, port: altPortStr ? Number(altPortStr) : targetPort });
                await remoteSocket.opened;
            } catch { webSocket.close(); return isModeAlpha; }
        }

        dataWriter = remoteSocket.writable.getWriter();
        if (offset < bufferData.byteLength) {
            let chunk = bufferData.slice(offset);
            await dataWriter.write(chunk);
        }
        remoteSocket.readable.pipeTo(new WritableStream({ write(chunk) { 
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


function getAllProfiles(targetSub = null, targetUUId = null) {
    let list = [{ id: activeDeviceId, name: "Default" }];
    
    if (sysConfig.users && sysConfig.users.length > 0) {
        let now = Date.now();
        sysConfig.users.forEach(u => {
            let skip = false;
            if (u.expiryMs && now > u.expiryMs) skip = true;
            if (u.isPaused) skip = true;
            if (u.limitTotalReq && sysUsageCache && sysUsageCache.users && sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()]) {
                if (sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()].reqs >= u.limitTotalReq) skip = true;
            }
            if (u.limitDailyReq && sysUsageCache && sysUsageCache.users && sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()]) {
                let usr = sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()];
                if (usr.lastDay === new Date().toISOString().split('T')[0] && usr.dReqs >= u.limitDailyReq) skip = true;
            }
            if(!skip) {
                list.push({ id: u.id, name: u.name });
            }
        });
    }

    if (targetSub && targetUUId) {
        list = list.filter(p => p.name.toLowerCase() === targetSub.toLowerCase() &&
            p.id == targetUUId);
    }
    return list;
}

function buildSingleUri(hostName) {
    let allHostNames = [hostName];
    if (sysConfig.slaveNodes) allHostNames.push(...sysConfig.slaveNodes.split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean));
    let finalHost = allHostNames[0];
    let finalIP = getCleanIps(finalHost)[0];
    let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(',').map(s=>s.trim()).filter(Boolean) : ["443"];
    let firstPort = ports[0];
    let sec = getTransportParams(firstPort);
    let reqPath = encodeURI(`/${sysConfig.subRoute}`);
    let uriProto = sysConfig.mode === "beta" ? getBeta() : getAlpha();
    let ext = `encryption=none&security=${sec}&sni=${finalHost}&fp=${sysConfig.agent}&type=ws&host=${finalHost}&path=${reqPath}`;
    if (sysConfig.enableOpt2) ext += `&pbk=enabled`;
    return `${uriProto}://${activeDeviceId}@${finalIP}:${firstPort}?${ext}#${finalHost}`;
}

function getConfigName(type, profileName, port, hostName, ip) {
    let prefix = sysConfig.namePrefix || "Core";
    let strategy = sysConfig.nameStrategy || "default";
    let cleanName = profileName === "Default" ? "" : `-${profileName}`;
    let typeLab = type === "alpha" ? "V" : "T";
    
    if (strategy === "type-user-port") {
        return `${type === "alpha" ? "vless" : "trojan"}-${profileName}-${port}`;
    } else if (strategy === "user-port") {
        return `${profileName}-${port}`;
    } else if (strategy === "host-port-user") {
        return `${hostName}-${port}${cleanName}`;
    } else if (strategy === "prefix-user-port") {
        return `${prefix}${cleanName}-${port}`;
    } else { // "default"
        return `${typeLab}-Core-${port}${cleanName}`;
    }
}

function buildUriProfile(hostName, targetSub = null, targetUUID) {
    let allHostNames = [hostName];
    if (sysConfig.slaveNodes) allHostNames.push(...sysConfig.slaveNodes.split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean));
    
    let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(',').map(s=>s.trim()).filter(Boolean) : ["443"];
    let reqPath = encodeURI(`/${sysConfig.subRoute}`);
    
    let lines = [];
    let profiles = getAllProfiles(targetSub, targetUUID);
    
    profiles.forEach(p => {
        allHostNames.forEach(hName => {
            let ips = getCleanIps(hName);
            ports.forEach(port => {
                let sec = getTransportParams(port);
                let extBase = `encryption=none&security=${sec}&sni=${hName}&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${reqPath}`;
                if (sysConfig.enableOpt2) extBase += `&pbk=enabled`;
                ips.forEach(ip => {
                    let vName = getConfigName("alpha", p.name, port, hName, ip);
                    let tName = getConfigName("beta", p.name, port, hName, ip);
                    
                    if (sysConfig.mode === "alpha" || sysConfig.mode === "both") {
                        lines.push(`${getAlpha()}://${p.id}@${ip}:${port}?${extBase}#${vName}`);
                    }
                    if (sysConfig.mode === "beta" || sysConfig.mode === "both") {
                        lines.push(`${getBeta()}://${p.id}@${ip}:${port}?${extBase}#${tName}`);
                    }
                });
            });
        });
    });
    return lines.join('\n');
}

function buildYamlProfile(hostName, targetSub = null, targetUUId = null) {
    let allHostNames = [hostName];
    if (sysConfig.slaveNodes) allHostNames.push(...sysConfig.slaveNodes.split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean));
    
    let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(',').map(s=>s.trim()).filter(Boolean) : ["443"];
    let proxies = [];
    let proxyNames = [];
    let profiles = getAllProfiles(targetSub, targetUUId);

    profiles.forEach(p => {
        allHostNames.forEach(hName => {
            let ips = getCleanIps(hName);
            ports.forEach(port => {
                let sec = getTransportParams(port) === "tls" ? "true" : "false";
                ips.forEach(ip => {
                    if (sysConfig.mode === "alpha" || sysConfig.mode === "both") {
                        let vName = getConfigName("alpha", p.name, port, hName, ip);
                        proxyNames.push(`"${vName}"`);
                        proxies.push(`- name: "${vName}"\n  type: ${getAlpha()}\n  server: ${ip}\n  port: ${port}\n  uuid: ${p.id}\n  udp: true\n  tls: ${sec}\n  sni: ${hName}\n  client-fingerprint: ${sysConfig.agent}\n  network: ws\n  ws-opts:\n    path: "/${sysConfig.subRoute}"\n    headers: { Host: ${hName} }\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);
                    }

                    if (sysConfig.mode === "beta" || sysConfig.mode === "both") {
                        let tName = getConfigName("beta", p.name, port, hName, ip);
                        proxyNames.push(`"${tName}"`);
                        proxies.push(`- name: "${tName}"\n  type: ${getBeta()}\n  server: ${ip}\n  port: ${port}\n  password: ${p.id}\n  udp: true\n  tls: ${sec}\n  sni: ${hName}\n  client-fingerprint: ${sysConfig.agent}\n  network: ws\n  ws-opts:\n    path: "/${sysConfig.subRoute}"\n    headers: { Host: ${hName} }\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);
                    }
                });
            });
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

      <!-- Global Controls -->
      <div class="fixed top-4 end-4 md:top-5 md:end-5 flex items-center gap-2 z-50">
          <span id="top-version-badge" class="px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold" style="background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);color:#818cf8;">v${CURRENT_VERSION}</span>
          <a href="https://github.com/taha-ghadirian/nahan" id="github-link-btn" target="_blank" class="p-2 rounded-xl transition-all" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;" onmouseover="this.style.color='#818cf8';this.style.borderColor='rgba(99,102,241,0.4)'" onmouseout="this.style.color='#94a3b8';this.style.borderColor='rgba(255,255,255,0.1)'">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg>
          </a>
          <button onclick="toggleLang()" id="lang-toggle" class="px-3 py-1.5 rounded-xl text-sm font-bold transition-all" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;" onmouseover="this.style.borderColor='rgba(99,102,241,0.4)';this.style.color='#a5b4fc'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.color='#e2e8f0'">EN</button>
          <button onclick="toggleTheme()" class="p-2 rounded-xl transition-all" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#f59e0b;" onmouseover="this.style.borderColor='rgba(245,158,11,0.4)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
              <svg class="w-4 h-4 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              <svg class="w-4 h-4 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </button>
          <button onclick="logout()" id="btn-logout-mob" class="hidden md:hidden p-2 rounded-xl transition-all" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
      </div>

      <!-- LOGIN SCREEN -->
      <div id="login-box" class="absolute inset-0 flex items-center justify-center p-4 z-40 overflow-hidden" style="background:linear-gradient(135deg,#0d1117 0%,#0f172a 50%,#0d1117 100%);">
          <div class="absolute pointer-events-none" style="width:500px;height:500px;top:-100px;left:-150px;background:radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 65%);"></div>
          <div class="absolute pointer-events-none" style="width:400px;height:400px;bottom:-80px;right:-100px;background:radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 65%);"></div>
          <div class="relative w-full max-w-sm">
              <style>
                  @keyframes pulse-ring{0%{transform:scale(1);opacity:0.5}100%{transform:scale(1.7);opacity:0}}
                  @keyframes shimmer{0%{left:-100%}100%{left:100%}}
                  .lock-pulse::before,.lock-pulse::after{content:'';position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(99,102,241,0.35);animation:pulse-ring 2.5s ease-out infinite;}
                  .lock-pulse::after{animation-delay:1.25s;}
                  .btn-shimmer::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);animation:shimmer 2.5s ease-in-out infinite;}
              </style>
              <div class="text-center mb-8">
                  <div class="relative inline-flex items-center justify-center mb-5">
                      <div class="lock-pulse relative w-20 h-20 rounded-3xl flex items-center justify-center" style="background:linear-gradient(145deg,rgba(99,102,241,0.25),rgba(99,102,241,0.08));border:1px solid rgba(99,102,241,0.45);box-shadow:0 0 40px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.08);">
                          <svg class="w-9 h-9" style="color:#a5b4fc" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </div>
                  </div>
                  <h2 class="text-3xl font-black" style="color:#f1f5f9;" data-i18n="title">Nahan Gateway</h2>
                  <p class="text-sm mt-2" style="color:#64748b;">Sign in to manage your gateway</p>
              </div>
              <div class="rounded-3xl p-px" style="background:linear-gradient(145deg,rgba(99,102,241,0.45),rgba(99,102,241,0.08) 50%,rgba(139,92,246,0.3));box-shadow:0 25px 60px rgba(0,0,0,0.5);">
                  <div class="rounded-3xl p-8" style="background:linear-gradient(145deg,rgba(15,20,40,0.98),rgba(13,17,23,0.98));">
                      <div class="flex items-center gap-2 mb-7 pb-6" style="border-bottom:1px solid rgba(255,255,255,0.06);">
                          <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:#22c55e;box-shadow:0 0 8px #22c55e;"></span>
                          <span class="text-xs" style="color:#4ade80;">System online</span>
                          <span class="flex-1"></span>
                          <span class="text-xs" style="color:#334155;">&#128274; Secure connection</span>
                      </div>
                      ${!hasDB ? `<div class="mb-5 p-4 rounded-2xl flex items-start gap-3" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);"><span style="color:#f87171;">&#9888;&#65039;</span><span class="text-sm" style="color:#fca5a5;" data-i18n="missing_db">Database not connected. Settings won't be saved.</span></div>` : ''}
                      <div class="mb-5">
                          <label class="block text-sm font-semibold mb-2.5" style="color:#94a3b8;">Password</label>
                          <div class="relative">
                              <div class="absolute inset-y-0 start-0 flex items-center ps-4" style="color:rgba(99,102,241,0.7);">
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                              </div>
                              <input type="password" id="pwd" data-i18n="pass_ph" placeholder="Enter your password" class="w-full ps-11 pe-12 py-3.5 text-sm rounded-2xl outline-none transition-all" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;" onfocus="this.style.borderColor='rgba(99,102,241,0.6)';this.style.background='rgba(99,102,241,0.06)';this.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)';this.style.background='rgba(255,255,255,0.04)';this.style.boxShadow='none'">
                              <button type="button" onclick="const n=document.getElementById('pwd');n.type=n.type==='password'?'text':'password'" class="absolute inset-y-0 end-0 flex items-center px-4 transition-colors" style="color:rgba(99,102,241,0.5);" onmouseover="this.style.color='#818cf8'" onmouseout="this.style.color='rgba(99,102,241,0.5)'">
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                              </button>
                          </div>
                      </div>
                      <p id="err-msg" class="hidden text-sm mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#f87171;"><span>&#9888;&#65039;</span><span data-i18n="err_pass">Wrong password, please try again.</span></p>
                      <button onclick="doLogin()" class="btn-shimmer w-full py-3.5 rounded-2xl font-bold text-sm relative overflow-hidden transition-all" style="background:linear-gradient(135deg,#6366f1,#7c3aed);color:white;box-shadow:0 4px 24px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.1);" onmouseover="this.style.boxShadow='0 6px 32px rgba(99,102,241,0.6),inset 0 1px 0 rgba(255,255,255,0.1)';this.style.transform='translateY(-1px)'" onmouseout="this.style.boxShadow='0 4px 24px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.1)';this.style.transform='translateY(0)'" data-i18n="login_btn">
                          Sign In
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <!-- DASHBOARD CONTAINER -->
      <div id="dash-box" class="hidden w-full h-full flex-col md:flex-row relative">
          
          <!-- SIDEBAR (Desktop) -->
          <aside class="hidden md:flex w-64 bg-white dark:bg-darkcard border-e border-slate-200 dark:border-darkborder flex-col z-20 shrink-0">
              <div class="flex items-center p-6 border-b border-slate-100 dark:border-darkborder/50">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-primary flex items-center justify-center me-3 shrink-0"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
                  <div class="flex flex-col">
                      <h1 class="font-black text-xl leading-none" data-i18n="title">Nahan</h1>
                      <span id="app-version" class="text-[10px] font-mono text-slate-400 mt-1 font-semibold">v${CURRENT_VERSION}</span>
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
  
          <!-- MAIN CONTENT AREA -->
          <main class="flex-1 flex flex-col h-full overflow-hidden">
              <header class="h-20 md:h-24 shrink-0 flex items-center px-6 md:px-10 z-10 pt-4 md:pt-0">
                  <h2 id="view-title" class="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-2" data-i18n="tab_info">Endpoints</h2>
              </header>
  
              <!-- Scrollable Content -->
              <div class="flex-1 overflow-y-auto p-4 md:p-10">
                  <div class="max-w-4xl mx-auto space-y-6 fade-in">

                      <!-- Update Banner -->
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
                              <a id="update-alert-btn" href="https://github.com/taha-ghadirian/nahan" target="_blank" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5" data-i18n="update_btn">
                                  Get Latest Code ➜
                              </a>
                          </div>
                      </div>

                      <!-- INFO VIEW -->
                      <div id="view-info" class="space-y-6 block">
                          <div id="dyn-profiles-container" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                      </div>

                      <!-- NETWORK/METRICS VIEW -->
                      <div id="view-network" class="hidden space-y-6">
                            <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder mb-6">
                              <h3 class="text-sm uppercase font-bold text-slate-500 tracking-wider mb-4" data-i18n="metrics_live">Live Profile Usage</h3>
                              <div id="usage-metrics-container" class="flex flex-col">
                                  <p class="text-xs text-slate-400 text-center py-4" data-i18n="no_metrics">No active connection data yet.</p>
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
  
                              <!-- Diagnostics Segment -->
                              <div class="bg-white dark:bg-darkcard p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden group sm:col-span-2 lg:col-span-3">
                                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div>
                                          <h3 class="text-sm uppercase font-bold text-slate-400 mb-1" data-i18n="ping_test_title">Latency Diagnostics</h3>
                                          <p class="text-xs text-slate-500" data-i18n="ping_test_desc">Test response time to your active node target.</p>
                                      </div>
                                      <button onclick="runPingTest()" class="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors text-sm" data-i18n="run_diagnostics">
                                          ⚡ Run Diagnostics
                                      </button>
                                  </div>
                                  <div id="ping-results" class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 hidden">
                                      <div class="bg-slate-50 dark:bg-darkbg p-3 rounded-xl border border-slate-100 dark:border-darkborder/50">
                                          <p class="text-[10px] uppercase font-bold text-slate-400" data-i18n="target_node">Target Node</p>
                                          <p id="ping-target" class="text-sm font-bold font-mono truncate">...</p>
                                      </div>
                                      <div class="bg-slate-50 dark:bg-darkbg p-3 rounded-xl border border-slate-100 dark:border-darkborder/50">
                                          <p class="text-[10px] uppercase font-bold text-slate-400" data-i18n="response">Response</p>
                                          <p id="ping-time" class="text-sm font-bold font-mono text-emerald-500">...</p>
                                      </div>
                                      <div class="bg-slate-50 dark:bg-darkbg p-3 rounded-xl border border-slate-100 dark:border-darkborder/50">
                                          <p class="text-[10px] uppercase font-bold text-slate-400" data-i18n="status">Status</p>
                                          <p id="ping-status" class="text-sm font-bold">...</p>
                                      </div>
                                      <div class="bg-slate-50 dark:bg-darkbg p-3 rounded-xl border border-slate-100 dark:border-darkborder/50">
                                          <p class="text-[10px] uppercase font-bold text-slate-400" data-i18n="local_port">Local Port</p>
                                          <p id="ping-port" class="text-sm font-bold font-mono">...</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
  
                      <!-- SETTINGS VIEW -->
                      <div id="view-settings" class="hidden">
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div class="space-y-1">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_proto">Primary Display Mode</label>
                                  <select id="cfg-proto" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-1 outline-none appearance-none">
                                      <option value="alpha">Alpha Mode (V-Core)</option>
                                      <option value="beta">Beta Mode (T-Core)</option>
                                      <option value="both">Both (V-Core & T-Core)</option>
                                  </select>
                              </div>
                              <div class="space-y-1">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_port">Data Port (Multi-Select)</label>
                                  <select id="cfg-port" multiple class="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-1 outline-none text-sm font-mono">
                                      <option value="443" selected>443 (Secure TLS)</option>
                                      <option value="2053">2053 (Secure TLS)</option>
                                      <option value="2083">2083 (Secure TLS)</option>
                                      <option value="2087">2087 (Secure TLS)</option>
                                      <option value="2096">2096 (Secure TLS)</option>
                                      <option value="8443">8443 (Secure TLS)</option>
                                      <option value="80">80 (Standard)</option>
                                      <option value="8080">8080 (Alt Standard)</option>
                                      <option value="8880">8880 (Alt Standard)</option>
                                      <option value="2052">2052 (Alt Standard)</option>
                                      <option value="2082">2082 (Alt Standard)</option>
                                      <option value="2086">2086 (Alt Standard)</option>
                                      <option value="2095">2095 (Alt Standard)</option>
                                  </select>
                              </div>
                              <div class="space-y-1 md:col-span-2">
                                  <div class="flex justify-between items-center">
                                      <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_id">Device UUID (Empty=Auto)</label>
                                      <button type="button" onclick="document.getElementById('cfg-uuid').value = crypto.randomUUID()" class="text-xs text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors duration-200">Generate UUID</button>
                                  </div>
                                  <input type="text" id="cfg-uuid" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none font-mono text-sm">
                              </div>
                              <div class="space-y-1">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_path">API Route (Hidden Path)</label>
                                  <input type="text" id="cfg-path" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                              </div>
                              <div class="space-y-1">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_path">Sub Route (Public Path)</label>
                                  <input type="text" id="cfg-sub" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                              </div>
                              <div class="space-y-1">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_pass">Master Key</label>
                                  <div class="relative">
                                      <input type="password" id="cfg-pass" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none pe-12">
                                      <button type="button" onclick="const n=document.getElementById('cfg-pass');n.type=n.type==='password'?'text':'password'" class="absolute inset-y-0 end-0 flex items-center px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">👁️</button>
                                  </div>
                              </div>
                              <div class="space-y-1 md:col-span-2 font-mono">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_github_repo">GitHub Update Repository</label>
                                  <input type="text" id="cfg-github-repo" placeholder="taha-ghadirian/nahan" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
  
                              <!-- Import/Export Config Area -->
                              <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder md:col-span-2 space-y-4">
                                  <h3 class="text-sm uppercase font-bold text-slate-400 tracking-wider" data-i18n="backup_restore_title">Backup & Restore</h3>
                                  <div class="flex flex-col sm:flex-row gap-4">
                                      <button onclick="exportConfig()" class="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-sm" data-i18n="export_btn">
                                          📥 Export Configuration (JSON)
                                      </button>
                                      <label class="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors text-sm text-center cursor-pointer">
                                          <span data-i18n="import_btn">📤 Import Configuration (JSON)</span>
                                          <input type="file" id="import-file" class="hidden" accept=".json" onchange="importConfig(event)">
                                      </label>
                                  </div>
                              </div>
                          </div>
                      </div>
  
                      <!-- ADVANCED VIEW -->
                      <div id="view-advanced" class="hidden space-y-6">
                          <!-- Multi Clean IP Section -->
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder mb-4">
                              <div class="flex items-center justify-between mb-4">
                                  <h3 class="text-sm uppercase font-bold text-slate-500 tracking-wider" data-i18n="lbl_clean_ips">Clean IPs (Multi-Generator)</h3>
                                  <span class="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md font-bold" id="ip-count-badge">1 Config Set</span>
                              </div>
                              <textarea id="cfg-ips" rows="3" data-i18n="ph_clean_ips" placeholder="" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-1 outline-none font-mono text-sm resize-none"></textarea>
                              <p class="text-xs text-slate-400 mt-2" data-i18n="desc_clean_ips">Put one IP per line. The Sync URL will multiply configs for all IPs.</p>
                          </div>
                          
                          <!-- Slave Nodes Section -->
                          <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden">
                              <div class="absolute top-0 end-0 bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 rounded-bl-xl">CLUSTER</div>
                              <div class="flex items-center justify-between mb-2">
                                  <h3 class="text-sm uppercase font-black text-indigo-800 dark:text-indigo-300 tracking-wider flex items-center">
                                      <svg class="w-5 h-5 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                      <span data-i18n="slave_title">Slave Worker Nodes</span>
                                  </h3>
                              </div>
                              <p class="text-xs text-indigo-600/80 dark:text-indigo-300/70 mb-4 leading-relaxed" data-i18n="slave_desc">Enter your other worker Domains (one per line). Master will push settings and users to them automatically, and include them in load-balanced subscriptions!</p>
                              <div class="relative">
                                  <textarea id="cfg-nodes" rows="3" placeholder="node1.worker.dev&#10;node2.domain.com" class="w-full px-4 py-3 pb-12 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-1 outline-none font-mono text-sm resize-none scrollbar-hide text-slate-700 dark:text-slate-300 placeholder:text-indigo-200 dark:placeholder:text-indigo-800/50"></textarea>
                                  <div class="absolute bottom-3 end-3">
                                      <button onclick="forceSyncNodes()" type="button" class="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center shadow-sm">
                                          <svg id="sync-icon" class="w-3.5 h-3.5 me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                          <span id="sync-btn-txt" data-i18n="force_sync">Force Sync Now</span>
                                      </button>
                                  </div>
                              </div>
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
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_doh">Custom DNS (DoH Provider)</label>
                                  <input type="text" id="cfg-custom-dns" placeholder="https://cloudflare-dns.com/dns-query" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                              <div class="space-y-1 md:col-span-2 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_fake">Maintenance Hosts (Camouflage)</label>
                                  <input type="text" id="cfg-fake" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                              <div class="space-y-1 md:col-span-2 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_relay">Backup Relay IP</label>
                                  <input type="text" id="cfg-relay" placeholder="proxyip.cmliussss.net" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                          </div>
  
                          <!-- Custom Name Strategy -->
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_strategy">Configuration Name Strategy</label>
                                  <select id="cfg-name-strategy" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none appearance-none">
                                      <option value="default">Default Core Name (e.g. V-Core-443-User)</option>
                                      <option value="type-user-port">Protocol-User-Port (e.g. vless-User-443)</option>
                                      <option value="user-port">User-Port (e.g. User-443)</option>
                                      <option value="host-port-user">Hostname-Port-User</option>
                                      <option value="prefix-user-port">Custom Prefix-User-Port</option>
                                  </select>
                              </div>
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_prefix">Custom Name Prefix</label>
                                  <input type="text" id="cfg-name-prefix" placeholder="Core" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                          </div>
  
                          <div class="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-darkcard rounded-3xl border border-slate-200 dark:border-darkborder">
                              <!-- TCP Fast Open Toggle -->
                              <label class="flex-1 flex items-center justify-between sm:justify-start cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                  <span class="text-sm font-bold text-slate-700 dark:text-slate-300 sm:me-4" data-i18n="lbl_tfo">TCP Fast Open</span>
                                  <div class="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="cfg-tfo" class="sr-only peer">
                                      <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-primary"></div>
                                  </div>
                              </label>
                              <!-- Secure Hello (ECH) Toggle -->
                              <label class="flex-1 flex items-center justify-between sm:justify-start cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                  <span class="text-sm font-bold text-slate-700 dark:text-slate-300 sm:me-4" data-i18n="lbl_ech">Secure Hello (ECH)</span>
                                  <div class="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="cfg-ech" class="sr-only peer">
                                      <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-primary"></div>
                                  </div>
                              </label>
                          </div>

                          <div class="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-darkcard rounded-3xl border border-slate-200 dark:border-darkborder mt-6">
                              <!-- Silent Alert Toggle -->
                              <label class="flex-1 flex items-center justify-between sm:justify-start cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                  <span class="text-sm font-bold text-slate-700 dark:text-slate-300 sm:me-4" data-i18n="lbl_silent">Silent UI Alerts</span>
                                  <div class="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="cfg-silent" class="sr-only peer">
                                      <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-primary"></div>
                                  </div>
                              </label>
                              <!-- Pause Kill Switch Toggle -->
                              <label class="flex-1 flex items-center justify-between sm:justify-start cursor-pointer group bg-red-50 dark:bg-red-900/10 p-3 rounded-2xl border border-red-200 dark:border-red-900/30">
                                  <span class="text-sm font-bold text-red-600 dark:text-red-400 sm:me-4" data-i18n="lbl_pause">Kill Switch (Pause System)</span>
                                  <div class="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" id="cfg-pause" class="sr-only peer">
                                      <div class="w-11 h-6 bg-red-200 dark:bg-red-900/50 rounded-full peer peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-red-500"></div>
                                  </div>
                              </label>
                          </div>

                          <!-- Telegram Bot Section -->
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_tg_token">Token Bot</label>
                                  <div class="relative">
                                      <input type="password" id="cfg-tg-token" placeholder="123456:ABC-DEF1234ghIkl-zyx5c" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm pe-12">
                                      <button type="button" onclick="const n=document.getElementById('cfg-tg-token');n.type=n.type==='password'?'text':'password'" class="absolute inset-y-0 end-0 flex items-center px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">👁️</button>
                                  </div>
                              </div>
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_tg_chat">Chat ID</label>
                                  <input type="text" id="cfg-tg-chat" placeholder="123456789" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                              <p class="text-xs text-slate-400 md:col-span-2" data-i18n="desc_tg_bot">Set these values to receive login alerts via Telegram.</p>
                          </div>
                          
                          <!-- Cloudflare Usage Analytics -->
                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_cf_acc">CF Account ID</label>
                                  <input type="text" id="cfg-cf-acc" placeholder="a1b2c3d4e5f6..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm font-mono">
                              </div>
                              <div class="space-y-1 text-start">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_cf_token">CF API Token</label>
                                  <div class="relative">
                                      <input type="password" id="cfg-cf-token" placeholder="Bearer Token (Read Analytics)" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm font-mono pe-12">
                                      <button type="button" onclick="const n=document.getElementById('cfg-cf-token');n.type=n.type==='password'?'text':'password'" class="absolute inset-y-0 end-0 flex items-center px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">👁️</button>
                                  </div>
                              </div>
                              <p class="text-xs text-slate-400 md:col-span-2" data-i18n="desc_cf_api">Optional: Monitor Worker free usage limits (100k/day). Needs Account Analytics Read permission.</p>
                          </div>
                      </div>
                      
                      <!-- USERS VIEW -->
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

                      <!-- Modal: Add User -->
                      <div id="modal-add-user" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                          <div class="bg-white dark:bg-darkcard rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-darkborder">
                              <h3 class="text-xl font-bold mb-4" data-i18n="modal_add_title">Add User</h3>
                              <div class="space-y-4">
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_name">Name / Identifier</label>
                                      <input type="text" id="add-user-name" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1">Total Requests Limit (Leave empty for unlimited)</label>
                                      <input type="number" id="add-user-total-reqs" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1">Daily Requests Limit (Leave empty for unlimited)</label>
                                      <input type="number" id="add-user-daily-reqs" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
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

                      <!-- Modal: Edit User -->
                      <div id="modal-edit-user" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                          <div class="bg-white dark:bg-darkcard rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-darkborder">
                              <h3 class="text-xl font-bold mb-4">Edit Subscriber</h3>
                              <input type="hidden" id="edit-user-id">
                              <div class="space-y-4">
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1">Name / Identifier</label>
                                      <input type="text" id="edit-user-name" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1">Total Requests Limit (Leave empty for unlimited)</label>
                                      <input type="number" id="edit-user-total-reqs" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1">Daily Requests Limit (Leave empty for unlimited)</label>
                                      <input type="number" id="edit-user-daily-reqs" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1">Expiration limit (Days remaining) - Leave empty for unlimited</label>
                                      <input type="number" id="edit-user-days" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div class="flex justify-end gap-2 mt-6">
                                      <button onclick="document.getElementById('modal-edit-user').classList.add('hidden')" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Cancel</button>
                                      <button onclick="commitEditUser()" class="px-4 py-2 rounded-xl bg-primary text-white font-bold">Save Changes</button>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- LOGS VIEW -->
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
  
              <!-- Save Bar (Docked to bottom of main content) -->
              <div class="shrink-0 bg-white dark:bg-darkcard border-t border-slate-200 dark:border-darkborder p-4 flex justify-between md:justify-end items-center z-20">
                  <span id="save-status" class="text-sm font-bold text-slate-500 md:me-4"></span>
                  <button onclick="doSave()" class="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity" data-i18n="save_btn">Save Config</button>
              </div>
          </main>
  
          <!-- BOTTOM NAV (Mobile) -->
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
  
      <!-- Toast Notification -->
      <div id="copy-toast" class="fixed top-20 md:top-10 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl font-bold text-sm z-50 transition-all transform -translate-y-20 opacity-0 pointer-events-none">
          <span data-i18n="copied">Copied!</span>
      </div>
      
      <!-- QR Code Modal (Enhanced) -->
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
                  lbl_github_repo: "GitHub Update Repository", update_avail: "New version available!", update_btn: "Get Latest Code",
                  metrics_live: "Live Profile Usage", no_metrics: "No active connection data yet.", run_diagnostics: "⚡ Run Diagnostics",
                  target_node: "Target Node", response: "Response", status: "Status", local_port: "Local Port",
                  lbl_doh: "Custom DNS (DoH Provider)", lbl_strategy: "Configuration Name Strategy", lbl_prefix: "Custom Name Prefix",
                  slave_title: "Slave Worker Nodes", slave_desc: "Enter your other worker Domains (one per line). Master will push settings and users to them automatically, and include them in load-balanced subscriptions!",
                  force_sync: "Force Sync Now", limit_total: "Total Requests Limit (Leave empty for unlimited)", limit_daily: "Daily Requests Limit (Leave empty for unlimited)",
                  limit_days: "Expiration limit (Days) - Leave empty for unlimited", edit_sub: "Edit Subscriber", lbl_name_ph: "Name / Identifier",
                  btn_save_changes: "Save Changes", save_btn_user: "Save User", status_active: "Active", status_paused: "Paused", status_expired: "Expired",
                  export_btn: "📥 Export Configuration (JSON)", import_btn: "📤 Import Configuration (JSON)"
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
                  lbl_github_repo: "مخزن گیت‌هاب جهت آپدیت", update_avail: "بروزرسانی جدید در دسترس است!", update_btn: "دریافت آخرین کد",
                  metrics_live: "وضعیت زنده مصرف اتصالات و پردازش", no_metrics: "هنوز داده‌ای از تراکنش و اتصالات فعال ثبت نشده است.", run_diagnostics: "⚡ اجرای عیب‌یابی شبکه",
                  target_node: "هدف گره شبکه", response: "مدت تاخیر (Latency)", status: "وضعیت گره", local_port: "درگاه محلی",
                  lbl_doh: "تحلیل‌گر تخصصی DNS (سرویس DoH)", lbl_strategy: "روش نام‌گذاری کانفیگ‌ها", lbl_prefix: "پیشوند نام کانفیگ‌ها",
                  slave_title: "سایر نودهای موازی (Slaves)", slave_desc: "آدرس دامنه سایر ورکرها را وارد نمایید (هر خط یک دامنه). نود اصلی تنظیمات و مشترکین را به صورت خودکار با آن‌ها هماهنگ می‌کند!",
                  force_sync: "همگام‌سازی اجباری نودها", limit_total: "محدودیت تعداد کل درخواست‌ها (برای نامحدود خالی بگذارید)", limit_daily: "محدودیت درخواست‌های روزانه (برای نامحدود خالی بگذارید)",
                  limit_days: "مدت زمان اعتبار قانونی (روز) - برای نامحدود خالی بگذارید", edit_sub: "ویرایش مشخصات مشترک", lbl_name_ph: "نام یا شناسه یکتا",
                  btn_save_changes: "ذخیره تغییرات", save_btn_user: "ثبت کاربر جدید", status_active: "فعال", status_paused: "متوقف شده", status_expired: "منقضی شده",
                  export_btn: "📥 برون‌بری فایل پیکربندی (JSON)", import_btn: "📤 درون‌ریزی فایل پیکربندی (JSON)"
              }
          };
  
          let lang = localStorage.getItem('lang') || 'fa';
          let sessionKey = "", baseRoute = window.location.pathname.split('/dash')[0];
          let hostName = window.location.hostname, localUUID = "";

          window.addEventListener('DOMContentLoaded', () => {
              let savedSession = localStorage.getItem('nahan_session');
              if (savedSession) {
                  try {
                      let parsed = JSON.parse(savedSession);
                      if (parsed && parsed.expiry && Date.now() < parsed.expiry) {
                          sessionKey = parsed.key;
                          doLogin(true);
                      } else {
                          localStorage.removeItem('nahan_session');
                      }
                  } catch(e){}
              }
          });
  
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
                  let portsStr = Array.from(document.getElementById('cfg-port').selectedOptions).map(o=>o.value).join(',');
                  let port = portsStr ? portsStr.split(',')[0] : '443';
                  let proto = document.getElementById('cfg-proto').value === 'beta' ? String.fromCharCode(116, 114, 111, 106, 97, 110) : String.fromCharCode(118, 108, 101, 115, 115);
                  let rawIps = document.getElementById('cfg-ips').value || "";
                  
                  let ipsList = rawIps.replace(/,/g, '\\n').replace(/;/g, '\\n').split('\\n').map(s=>s.trim()).filter(Boolean);
                  let finalIP = ipsList.length > 0 ? ipsList[0] : (hostName.endsWith('.pages.dev') ? 'time.is' : hostName);
                  
                  let fp = document.getElementById('cfg-fp').value;
                  let path = encodeURI("/" + document.getElementById('cfg-sub').value);
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
                  mode: el('cfg-proto').value, socketPorts: Array.from(el('cfg-port').selectedOptions).map(o=>o.value).join(','), deviceId: el('cfg-uuid').value,
                  apiRoute: el('cfg-path').value, masterKey: el('cfg-pass').value, agent: el('cfg-fp').value,
                  subRoute: el('cfg-sub').value,
                  resolveIp: el('cfg-dns').value, customDns: el('cfg-custom-dns').value ? el('cfg-custom-dns').value : 'https://cloudflare-dns.com/dns-query', cleanIps: el('cfg-ips').value, maintenanceHost: el('cfg-fake').value, backupRelay: el('cfg-relay').value,
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
                      let pList = (conf.socketPorts || conf.socketPort || '443').split(',');
                      Array.from(document.getElementById('cfg-port').options).forEach(o => o.selected = pList.includes(o.value));
                      mapId('cfg-uuid', conf.deviceId);
                      mapId('cfg-path', conf.apiRoute);
                      mapId('cfg-sub', conf.subRoute);
                      mapId('cfg-pass', conf.masterKey);
                      mapId('cfg-fp', conf.agent);
                      mapId('cfg-dns', conf.resolveIp);
                      mapId('cfg-custom-dns', conf.customDns);
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
                      let pList = (conf.socketPorts || conf.socketPort || '443').split(',');
                      Array.from(document.getElementById('cfg-port').options).forEach(o => o.selected = pList.includes(o.value));
                      document.getElementById('cfg-uuid').value = conf.deviceId || '';
                      document.getElementById('cfg-path').value = conf.apiRoute || '';
                      document.getElementById('cfg-sub').value = conf.subRoute || '';
                      document.getElementById('cfg-pass').value = conf.masterKey || '';
                      document.getElementById('cfg-fp').value = conf.agent || 'chrome';
                      document.getElementById('cfg-dns').value = conf.resolveIp || '';
                      document.getElementById('cfg-custom-dns').value = conf.customDns || 'https://cloudflare-dns.com/dns-query';
                      document.getElementById('cfg-ips').value = conf.cleanIps || '';
                      document.getElementById('cfg-nodes').value = conf.slaveNodes || '';
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
                      document.getElementById('cfg-github-repo').value = conf.githubRepo || 'taha-ghadirian/nahan';
                      document.getElementById('cfg-name-strategy').value = conf.nameStrategy || 'default';
                      document.getElementById('cfg-name-prefix').value = conf.namePrefix || 'Core';
  
                      window.nahanConfig = JSON.parse(JSON.stringify(conf));
                      window.nahanUsage = data.sysUsage || {};
                      window.nahanProfiles = data.profiles || [];
                      renderUsersTable();
                      try { checkUpdate(); } catch(ue) { console.error(ue); }

                      ['cfg-proto','cfg-port','cfg-fp','cfg-ips','cfg-nodes','cfg-path', 'cfg-sub', 'cfg-relay', 'cfg-name-strategy', 'cfg-name-prefix'].forEach(id => {
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
                                  <!-- QR Code Button Enhanced -->
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
                      mode: el('cfg-proto').value, socketPorts: Array.from(el('cfg-port').selectedOptions).map(o=>o.value).join(','), deviceId: el('cfg-uuid').value,
                      apiRoute: el('cfg-path').value, masterKey: el('cfg-pass').value, agent: el('cfg-fp').value,
                      subRoute: el('cfg-sub').value,
                      resolveIp: el('cfg-dns').value, customDns: el('cfg-custom-dns').value ? el('cfg-custom-dns').value : 'https://cloudflare-dns.com/dns-query', cleanIps: el('cfg-ips').value, slaveNodes: el('cfg-nodes').value, maintenanceHost: el('cfg-fake').value, backupRelay: el('cfg-relay').value,
                      enableOpt1: el('cfg-tfo').checked, enableOpt2: el('cfg-ech').checked,
                      tgToken: el('cfg-tg-token').value, tgChatId: el('cfg-tg-chat').value,
                      cfAccountId: el('cfg-cf-acc').value, cfApiToken: el('cfg-cf-token').value,
                      isPaused: el('cfg-pause').checked, silentAlerts: el('cfg-silent').checked,
                      githubRepo: el('cfg-github-repo').value,
                      nameStrategy: el('cfg-name-strategy').value,
                      namePrefix: el('cfg-name-prefix').value
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
          
          async function forceSyncNodes() {
              const nodesRaw = document.getElementById('cfg-nodes').value;
              if (!nodesRaw || nodesRaw.trim() === '') {
                  alert('No slave nodes specified.');
                  return;
              }
              const btnTxt = document.getElementById('sync-btn-txt');
              const icon = document.getElementById('sync-icon');
              
              btnTxt.innerText = 'Syncing...';
              icon.classList.add('animate-spin');
              
              const el = id => document.getElementById(id);
              const payload = {
                  key: sessionKey,
                  config: {
                      mode: el('cfg-proto').value, socketPorts: Array.from(el('cfg-port').selectedOptions).map(o=>o.value).join(','), deviceId: el('cfg-uuid').value,
                      apiRoute: el('cfg-path').value, masterKey: el('cfg-pass').value, agent: el('cfg-fp').value,
                      subRoute: el('cfg-sub').value,
                      resolveIp: el('cfg-dns').value, customDns: el('cfg-custom-dns').value ? el('cfg-custom-dns').value : 'https://cloudflare-dns.com/dns-query', cleanIps: el('cfg-ips').value, slaveNodes: el('cfg-nodes').value, maintenanceHost: el('cfg-fake').value, backupRelay: el('cfg-relay').value,
                      enableOpt1: el('cfg-tfo').checked, enableOpt2: el('cfg-ech').checked,
                      tgToken: el('cfg-tg-token').value, tgChatId: el('cfg-tg-chat').value,
                      cfAccountId: el('cfg-cf-acc').value, cfApiToken: el('cfg-cf-token').value,
                      isPaused: el('cfg-pause').checked, silentAlerts: el('cfg-silent').checked,
                      githubRepo: el('cfg-github-repo').value,
                      nameStrategy: el('cfg-name-strategy').value,
                      namePrefix: el('cfg-name-prefix').value
                  }
              };
              
              try {
                  const res = await fetch(baseRoute + '/api/sync', { method: 'POST', body: JSON.stringify(payload) });
                  if (res.ok) {
                      btnTxt.innerText = 'Success!';
                  } else {
                      btnTxt.innerText = 'Sync Failed';
                  }
              } catch (e) {
                  btnTxt.innerText = 'Network Error';
              } finally {
                  icon.classList.remove('animate-spin');
                  setTimeout(() => { btnTxt.innerText = 'Force Sync Now'; }, 3000);
              }
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
                  let sysU = usage[u.id.replace(/-/g,'').toLowerCase()] || {reqs: 0, dReqs: 0, lastDay: ''};
                  let userReqs = sysU.reqs || 0;
                  let userDReqs = sysU.lastDay === new Date().toISOString().split('T')[0] ? (sysU.dReqs || 0) : 0;
                  
                  let limitTotalTxt = u.limitTotalReq ? u.limitTotalReq : 'Unlimited';
                  let limitDailyTxt = u.limitDailyReq ? u.limitDailyReq : 'Unlimited';
                  
                  let perT = u.limitTotalReq ? Math.min(100, (userReqs / u.limitTotalReq) * 100).toFixed(1) + '%' : '-';
                  let perD = u.limitDailyReq ? Math.min(100, (userDReqs / u.limitDailyReq) * 100).toFixed(1) + '%' : '-';
                  
                  let expTxt = 'Unlimited';
                  let isExp = false;
                  if (u.expiryMs) {
                      let date = new Date(u.expiryMs);
                      expTxt = date.toLocaleDateString();
                      if (Date.now() > u.expiryMs) { expTxt += ' <span class="text-xs text-red-500 font-bold">(Expired)</span>'; isExp = true; }
                  }
                  
                  let linkHtml = \`<button onclick="copyData('sync-\${u.id}')" class="text-primary hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 p-2 rounded-lg" title="Copy Subscription Link">🔗</button>\`;
                  
                  let pauseBtnHtml = \`<button onclick="togglePauseUser('\${u.id}')" class="\${u.isPaused ? 'text-green-500 hover:text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-800/50' : 'text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-800/50'} p-2 rounded-lg" title="\${u.isPaused ? 'Resume User' : 'Pause User'}">\${u.isPaused ? '▶️' : '⏸️'}</button>\`;

                  let editBtnHtml = \`<button onclick="editUser('\${u.id}')" class="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 p-2 rounded-lg" title="Edit Subscriber">✏️</button>\`;

                  let tr = document.createElement('tr');
                  tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";
                  tr.innerHTML = \`
                      <td class="px-4 py-4 font-bold text-slate-700 dark:text-slate-300">\${u.name} \${u.isPaused ? '⏸️' : (isExp ? '🔴' : '🟢')}</td>
                      <td class="px-4 py-4 font-mono text-xs text-slate-500 select-all">\${u.id}</td>
                      <td class="px-4 py-4 text-slate-600 dark:text-slate-400 font-mono"><div class="flex flex-col"><span class="font-bold">Total: \${userReqs} / \${limitTotalTxt} (\${perT})</span><span class="text-xs opacity-70">Daily: \${userDReqs} / \${limitDailyTxt} (\${perD})</span></div></td>
                      <td class="px-4 py-4 text-slate-600 dark:text-slate-400">\${expTxt}</td>
                      <td class="px-4 py-4 text-end space-x-2 space-x-reverse">
                          <input type="hidden" id="sync-\${u.id}" value="\${window.nahanProfiles.find(p => p.id === u.id)?.sync || ''}">
                          \${linkHtml}
                          \${pauseBtnHtml}
                          \${editBtnHtml}
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

          function togglePauseUser(uuid) {
              if(window.nahanConfig && window.nahanConfig.users) {
                  let usr = window.nahanConfig.users.find(u => u.id === uuid);
                  if (usr) {
                      usr.isPaused = !usr.isPaused;
                      renderUsersTable();
                      doSaveDirectly();
                  }
              }
          }

          function commitAddUser() {
              const name = document.getElementById('add-user-name').value;
              let tReq = document.getElementById('add-user-total-reqs').value;
              let dReq = document.getElementById('add-user-daily-reqs').value;
              let days = document.getElementById('add-user-days').value;
              
              if(!name) { alert('Please enter a name'); return; }
              tReq = tReq ? parseInt(tReq) : null;
              dReq = dReq ? parseInt(dReq) : null;
              days = days ? parseInt(days) : null;
              
              if(!window.nahanConfig) window.nahanConfig = {};
              if(!window.nahanConfig.users) window.nahanConfig.users = [];
              
              let newId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                  .map((b,i) => (i===4||i===6||i===8||i===10?'-':'') + b.toString(16).padStart(2,'0')).join('');
              
              const u = {
                  id: newId,
                  name: name,
                  limitTotalReq: tReq,
                  limitDailyReq: dReq,
                  expiryMs: days ? Date.now() + days*86400000 : null,
                  createdAt: Date.now()
              };
              
              window.nahanConfig.users.push(u);
              document.getElementById('modal-add-user').classList.add('hidden');
              document.getElementById('add-user-name').value = '';
              document.getElementById('add-user-total-reqs').value = '';
              document.getElementById('add-user-daily-reqs').value = '';
              document.getElementById('add-user-days').value = '';
              
              renderUsersTable();
              doSaveDirectly();
          }

          function editUser(uuid) {
              if(!window.nahanConfig || !window.nahanConfig.users) return;
              let u = window.nahanConfig.users.find(usr => usr.id === uuid);
              if(!u) return;
              
              document.getElementById('edit-user-id').value = u.id;
              document.getElementById('edit-user-name').value = u.name;
              document.getElementById('edit-user-total-reqs').value = u.limitTotalReq || '';
              document.getElementById('edit-user-daily-reqs').value = u.limitDailyReq || '';
              
              let daysLeft = '';
              if(u.expiryMs) {
                  let diff = u.expiryMs - Date.now();
                  daysLeft = diff > 0 ? Math.ceil(diff / 86400000) : 0;
              }
              document.getElementById('edit-user-days').value = daysLeft;
              
              document.getElementById('modal-edit-user').classList.remove('hidden');
          }

          function commitEditUser() {
              const uuid = document.getElementById('edit-user-id').value;
              const name = document.getElementById('edit-user-name').value;
              let tReq = document.getElementById('edit-user-total-reqs').value;
              let dReq = document.getElementById('edit-user-daily-reqs').value;
              let days = document.getElementById('edit-user-days').value;
              
              if(!name) { alert('Please enter a name'); return; }
              tReq = tReq ? parseInt(tReq) : null;
              dReq = dReq ? parseInt(dReq) : null;
              days = days ? parseInt(days) : null;
              
              if(!window.nahanConfig || !window.nahanConfig.users) return;
              let u = window.nahanConfig.users.find(usr => usr.id === uuid);
              if(!u) return;
              
              u.name = name;
              u.limitTotalReq = tReq;
              u.limitDailyReq = dReq;
              u.expiryMs = days ? Date.now() + days*86400000 : null;
              
              document.getElementById('modal-edit-user').classList.add('hidden');
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
              let repo = document.getElementById('cfg-github-repo')?.value || window.nahanConfig?.githubRepo || 'taha-ghadirian/nahan';
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
                      const res = await fetch('https://raw.githubusercontent.com/' + repo + '/main/worker.js');
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
                      const cVer = strip("2.4.0");
                      
                      if (rVer && rVer > cVer) {
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
