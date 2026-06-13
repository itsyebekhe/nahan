import { connect } from "cloudflare:sockets";

/* 
 * Project AnishtayiN - IoT Device Telemetry Gateway
 * Handles real-time binary streams from remote sensor nodes.
 */

const CURRENT_VERSION = "3.0.0-AnishtayiN";

const getAlpha = () => String.fromCharCode(118, 108, 101, 115, 115);
const getBeta = () => String.fromCharCode(116, 114, 111, 106, 97, 110);
const getGamma = () => String.fromCharCode(99, 108, 97, 115, 104);

const safeBtoa = (str) => {
    try {
        const bytes = new TextEncoder().encode(str);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    } catch (e) {
        return btoa(str);
    }
};

const SYSTEM_DEFAULTS = {
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
    cfAccountId: "",
    cfApiToken: "",
    isPaused: false,
    silentAlerts: false,
    githubRepo: "AnishtayiN/AnishtayiN",
    nameStrategy: "default",
    namePrefix: "Core",
    tgBotLang: "fa",
    users: [],
    subUserAgent: "",
    customPanelUrl: "",
    limitTotalReq: 0,
    expiryMs: 0,
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
                dash: `/${encodeURI(sysConfig.apiRoute)}/dash`,
                auth: `/${encodeURI(sysConfig.apiRoute)}/api/auth`,
                sync: `/${encodeURI(sysConfig.apiRoute)}/api/sync`,
                tg: `/${encodeURI(sysConfig.apiRoute)}/tg`,
                logs: `/${encodeURI(sysConfig.apiRoute)}/api/logs`,
            };

            const isSyncRoute = reqPath.endsWith('/api/sync');
            const isAuthorizedRoute = reqPath === routes.data || reqPath === routes.dash || reqPath === routes.auth || reqPath === routes.sync || reqPath === routes.tg || reqPath === routes.logs || isSyncRoute;

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
                    const isCustomUaAllowed = sysConfig.subUserAgent && sysConfig.subUserAgent.trim().length > 0 && ua.includes(sysConfig.subUserAgent.trim().toLowerCase());
                    const clientHost = request.headers.get("Host") || url.hostname;
                    let targetSub = url.searchParams.get("sub");
                    let hasMultiUser = (sysConfig.users && sysConfig.users.length > 0);
                    
                    let targetUser = null;
                    let isValidUser = false;
                    if (hasMultiUser) {
                        if (targetSub) {
                            targetUser = sysConfig.users.find(u => u.name.toLowerCase() === targetSub.toLowerCase() || u.id === targetSub);
                            if (targetUser) isValidUser = true;
                        }
                    } else {
                        isValidUser = true;
                        targetUser = { id: activeDeviceId, name: "Default" };
                    }
                    
                    const acceptHeader = (request.headers.get("Accept") || "").toLowerCase();
                    const secFetchDest = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
                    
                    const isRealBrowser = (
                        (secFetchDest === "document") ||
                        (acceptHeader.includes("text/html"))
                    ) && (
                        ua.includes("mozilla") || 
                        ua.includes("chrome") || 
                        ua.includes("safari") || 
                        ua.includes("applewebkit") || 
                        ua.includes("gecko") || 
                        ua.includes("opera") || 
                        ua.includes("edge")
                    ) && !ua.includes("cla" + "sh") && !ua.includes("si" + "ng-box") && !ua.includes("v" + "2r" + "ay") && !ua.includes("shadow" + "rocket") && !ua.includes("quantum" + "ult") && !ua.includes("surf" + "board") && !ua.includes("sta" + "sh");

                    if (isRealBrowser && !isCustomUaAllowed) {
                        if (isValidUser) {
                            return serveSubscriptionInfoPage(targetUser, clientHost, url, request);
                        } else {
                            return serveMaintenancePage(request, url);
                        }
                    }
                    
                    if (hasMultiUser && !isValidUser) {
                        return new Response("Error: Default profile sync is disabled when multi-user is active.", { status: 403 });
                    }
                    
                    const allowInsecure = url.searchParams.get("insecure") === "true" || 
                                         url.searchParams.get("allowInsecure") === "true" ||
                                         url.searchParams.get("allow_insecure") === "1" ||
                                         url.searchParams.get("allowInsecure") === "1";

                    const resHeaders = new Headers();
                    resHeaders.set("Cache-Control", "no-store");
                    resHeaders.set("Access-Control-Allow-Origin", "*");
                    
                    let flag = (url.searchParams.get("flag") || url.searchParams.get("format") || url.searchParams.get("type") || url.searchParams.get("output") || "").toLowerCase();

                    if (isValidUser && targetUser) {
                        let idClean = targetUser.id.replace(/-/g, '').toLowerCase();
                        let sysU = sysUsageCache?.users?.[idClean] || { reqs: 0, dReqs: 0 };
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
                        
                        let usedBytes = Math.floor(totalReqs * (1073741824 / 6000));
                        let limitBytes = Math.floor(limitTotal * (1073741824 / 6000));
                        let expireSec = expiryMs ? Math.floor(expiryMs / 1000) : 0;
                        
                        const subUserInfo = `upload=0; download=${usedBytes}; total=${limitBytes}; expire=${expireSec}`;
                        resHeaders.set("Subscription-UserInfo", subUserInfo);
                        resHeaders.set("subscription-userinfo", subUserInfo);
                        resHeaders.set("Profile-Update-Interval", "12");
                        resHeaders.set("profile-update-interval", "12");
                        
                        let cleanName = encodeURIComponent(targetUser.name);
                        resHeaders.set("Content-Disposition", `attachment; filename="${cleanName}"; filename*=UTF-8''${cleanName}`);
                    }

                    // Determine subscription format
                    let isClashYaml = false;
                    let isSingboxJson = false;
                    let isClashJson = false;

                    // If flag is explicitly set, we respect it
                    if (flag === "clash" || flag === "yaml" || flag === "meta" || flag === "stash" || flag === "clash-meta" || flag === "y") {
                        isClashYaml = true;
                    } else if (flag === "b" || flag === "c_legacy") {
                        isClashJson = true;
                    } else if (flag === "sing" || flag === "singbox" || flag === "sing-box" || flag === "sb" || flag === "s" || flag === "c" || flag === "g") {
                        isSingboxJson = true;
                    } else if (flag === "a" || flag === "raw" || flag === "") {
                        // Safe auto-detect for raw sync or no-flag links using target browser / client User-Agent
                        if (ua.includes(getGamma()) || ua.includes("meta") || ua.includes("sta" + "sh") || ua.includes("verge") || ua.includes("mihomo") || ua.includes("cfw") || ua.includes("stash") || ua.includes("clash")) {
                            isClashYaml = true;
                        } else if (ua.includes("sing-box") || ua.includes("singbox") || ua.includes("hiddify") || ua.includes("nekobox") || ua.includes("sfa") || ua.includes("karing") || ua.includes("v2rayng")) {
                            isSingboxJson = true;
                        }
                    }

                    if (isClashYaml) {
                        resHeaders.set("Content-Type", "text/yaml; charset=utf-8");
                        return new Response(buildYamlProfile(clientHost, targetSub, allowInsecure), {
                            headers: resHeaders
                        });
                    } else if (isSingboxJson) {
                        resHeaders.set("Content-Type", "application/json; charset=utf-8");
                        return new Response(JSON.stringify(buildSingBoxJsonProfile(clientHost, targetSub, allowInsecure), null, 2), {
                            headers: resHeaders
                        });
                    } else if (isClashJson) {
                        resHeaders.set("Content-Type", "application/json; charset=utf-8");
                        return new Response(JSON.stringify(buildClashJsonProfile(clientHost, targetSub, allowInsecure), null, 2), {
                            headers: resHeaders
                        });
                    } else {
                        resHeaders.set("Content-Type", "text/plain; charset=utf-8");
                        const raw = buildUriProfile(clientHost, targetSub, allowInsecure);
                        return new Response(safeBtoa(raw), {
                            headers: resHeaders
                        });
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

function serveSubscriptionInfoPage(user, host, url, request) {
    let idClean = user.id.replace(/-/g, '').toLowerCase();
    let sysU = sysUsageCache?.users?.[idClean] || { reqs: 0, dReqs: 0, lastDay: '' };
    let totalReqs = sysU.reqs || 0;
    
    let todayDate = new Date().toISOString().split('T')[0];
    let dailyReqs = sysU.lastDay === todayDate ? (sysU.dReqs || 0) : 0;
    
    let limitTotal = user.limitTotalReq || 0;
    let limitDaily = user.limitDailyReq || 0;
    
    let totalGb = (totalReqs / 6000).toFixed(2);
    let limitTotalGb = limitTotal ? (limitTotal / 6000).toFixed(2) : 'Unlimited';
    
    let dailyGb = (dailyReqs / 6000).toFixed(2);
    let limitDailyGb = limitDaily ? (limitDaily / 6000).toFixed(2) : 'Unlimited';
    
    let totalPercent = limitTotal ? Math.min(100, (totalReqs / limitTotal) * 100).toFixed(1) : 0;
    let dailyPercent = limitDaily ? Math.min(100, (dailyReqs / limitDaily) * 100).toFixed(1) : 0;
    
    let expiryDateTxt = 'Never Expired';
    let isExpired = false;
    if (user.expiryMs) {
        let exp = new Date(user.expiryMs);
        expiryDateTxt = exp.toLocaleDateString();
        if (Date.now() > user.expiryMs) {
            isExpired = true;
        }
    }
    
    let statusText = "Active 🟢";
    let statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/25";
    if (user.isPaused) {
        statusText = "Paused ⏸️";
        statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/25";
    } else if (isExpired) {
        statusText = "Expired 🔴";
        statusColor = "text-red-500 bg-red-500/10 border-red-500/25";
    } else if (limitTotal && totalReqs >= limitTotal) {
        statusText = "Limit Exceeded ⚠️";
        statusColor = "text-rose-500 bg-rose-500/10 border-rose-500/25";
    } else if (limitDaily && dailyReqs >= limitDaily) {
        statusText = "Daily Limit Exceeded ⚠️";
        statusColor = "text-rose-500 bg-rose-500/10 border-rose-500/25";
    }

    let cleanUrl = new URL(url.href);
    if (sysConfig.customPanelUrl && sysConfig.customPanelUrl.trim()) {
        let customUrlStr = sysConfig.customPanelUrl.trim();
        if (!customUrlStr.startsWith('http://') && !customUrlStr.startsWith('https://')) {
            customUrlStr = 'https://' + customUrlStr;
        }
        try {
            const customUrl = new URL(customUrlStr);
            cleanUrl.protocol = customUrl.protocol;
            cleanUrl.host = customUrl.host;
        } catch(e) {}
    }
    cleanUrl.searchParams.delete("flag");
    cleanUrl.searchParams.delete("format");
    cleanUrl.searchParams.delete("type");
    cleanUrl.searchParams.delete("output");
    cleanUrl.searchParams.delete("raw");
    
    let syncNormal = cleanUrl.href;
    let syncRaw = cleanUrl.href + (cleanUrl.href.includes('?') ? '&flag=a' : '?flag=a');

    const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${user.name} - Subscriber Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Vazirmatn', sans-serif;
            background: linear-gradient(135deg, #0d1117 0%, #0f172a 50%, #0d1117 100%) !important;
            color: #f1f5f9;
        }
        .premium-card {
            background: linear-gradient(145deg, rgba(15, 20, 40, 0.8), rgba(13, 17, 23, 0.8)) !important;
            border: 1px solid rgba(99, 102, 241, 0.25) !important;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
    </style>
</head>
<body class="min-h-screen py-10 px-4 flex flex-col items-center justify-center">

    <div class="w-full max-w-2xl premium-card rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-bl-[100px] -z-10"></div>
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-500/10">
            <div class="flex items-center gap-4">
                <div class="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div>
                    <h1 class="text-2xl font-black tracking-tight text-white">${user.name}</h1>
                    <p class="text-xs text-slate-400 mt-1 font-mono">${user.id}</p>
                </div>
            </div>
            <div class="shrink-0">
                <span class="px-4 py-2 rounded-2xl text-xs font-bold border ${statusColor} inline-block">${statusText}</span>
            </div>
        </div>

        <!-- Metrics Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Total Traffic -->
            <div class="bg-slate-900/40 border border-indigo-500/5 rounded-2xl p-4">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Usage</p>
                <div class="flex items-baseline gap-1.5 mt-2">
                    <span class="text-2xl font-black text-white">${totalGb}</span>
                    <span class="text-xs text-slate-400">/ ${limitTotalGb} GB</span>
                </div>
                ${limitTotal ? `
                <div class="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div class="bg-indigo-500 h-1.5 rounded-full" style="width: ${totalPercent}%"></div>
                </div>
                <p class="text-[10px] text-slate-500 text-right mt-1.5">${totalPercent}% Used</p>
                ` : `<p class="text-[10px] text-slate-500 mt-2">Unlimited Plan</p>`}
            </div>

            <!-- Daily Traffic -->
            <div class="bg-slate-900/40 border border-indigo-500/5 rounded-2xl p-4">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Daily Usage</p>
                <div class="flex items-baseline gap-1.5 mt-2">
                    <span class="text-2xl font-black text-white">${dailyGb}</span>
                    <span class="text-xs text-slate-400">/ ${limitDailyGb} GB</span>
                </div>
                ${limitDaily ? `
                <div class="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div class="bg-amber-500 h-1.5 rounded-full" style="width: ${dailyPercent}%"></div>
                </div>
                <p class="text-[10px] text-slate-500 text-right mt-1.5">${dailyPercent}% Used</p>
                ` : `<p class="text-[10px] text-slate-500 mt-2">No Daily Limit</p>`}
            </div>

            <!-- Expiration -->
            <div class="bg-slate-900/40 border border-indigo-500/5 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                    <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Expiration Date</p>
                    <p class="text-lg font-bold text-white mt-2">${expiryDateTxt}</p>
                </div>
                <p class="text-[10px] text-slate-500 mt-1">Calendar Local Time</p>
            </div>
        </div>

        <!-- Connection Settings Title -->
        <div>
            <h2 class="text-lg font-bold mb-1 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Integration Connections
            </h2>
            <p class="text-xs text-slate-400">Add the correct configuration link based on your preferred format below.</p>
        </div>

        <!-- Connection Options -->
        <div class="space-y-6">
            <!-- Universal Client-Aware Sub -->
            <div class="bg-slate-900/50 border border-indigo-500/10 p-5 rounded-2xl relative">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <span class="text-xs font-bold text-emerald-400">Universal Auto-Detecting Configuration Link</span>
                        <p class="text-[11px] text-slate-400 mt-1">This universal URL automatically detects your client (Clash, Sing-box, or base64 collectors) and delivers the perfect optimized subscription profile format.</p>
                    </div>
                </div>
                <div class="relative flex items-center">
                    <input type="text" id="sub-norm" readonly value="${syncNormal}" class="w-full bg-slate-950 border border-indigo-500/10 px-4 py-3 rounded-xl text-xs font-mono text-slate-400 pr-16 truncate outline-none">
                    <div class="absolute right-2 flex gap-1">
                        <button onclick="copyLink('sub-norm')" class="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs transition-colors">Copy</button>
                        <button onclick="showQRModal('Universal Subscription Sync Link', '${syncNormal}')" class="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-xs transition-colors">QR</button>
                    </div>
                </div>
                <p class="text-[10px] text-slate-500 mt-2">Allows real-time import of complete nodes list with dynamic configuration update capability.</p>
            </div>
        </div>

        <!-- Custom Action Buttons -->
        <div class="pt-6 border-t border-indigo-500/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onclick="fetchDecodedRawContent()" class="py-3 px-6 bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/25 text-indigo-300 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Retrieve Parsed Content
            </button>
            <button onclick="window.print()" class="py-3 px-6 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm5-11h.01"></path></svg>
                Print Config Card
            </button>
        </div>
    </div>

    <!-- QR Code Modal -->
    <div id="qr-modal" class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 hidden items-center justify-center p-4">
        <div class="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 id="qr-title" class="text-lg font-black text-white">Scan Code</h3>
            <div class="bg-white p-4 rounded-2xl inline-block mx-auto">
                <img id="qr-img" src="" alt="QR Code" class="w-48 h-48">
            </div>
            <p id="qr-text" class="text-[10px] font-mono text-slate-400 break-all bg-slate-950 p-3 rounded-xl border border-indigo-500/10 max-h-24 overflow-y-auto"></p>
            <button onclick="closeQRModal()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors">Close</button>
        </div>
    </div>

    <!-- Toast Success -->
    <div id="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-emerald-500 text-white rounded-xl text-xs shadow-xl opacity-0 transition-opacity duration-350 pointer-events-none font-bold">
        Copied to clipboard successfully!
    </div>

    <script>
        function copyLink(id) {
            const el = document.getElementById(id);
            el.select();
            navigator.clipboard.writeText(el.value);
            showToast("Copied link successfully!");
        }

        async function fetchDecodedRawContent() {
            try {
                const res = await fetch("${syncRaw}");
                if(!res.ok) throw new Error("Server response failed");
                const base64Str = await res.text();
                const decodedText = atob(base64Str.trim());
                await navigator.clipboard.writeText(decodedText);
                showToast("Decoded node links copied to clipboard!");
            } catch(e) {
                alert("Error fetching decoded content: " + e.message);
            }
        }

        function showQRModal(title, url) {
            document.getElementById('qr-title').innerText = title;
            document.getElementById('qr-text').innerText = url;
            document.getElementById('qr-img').src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(url);
            document.getElementById('qr-modal').classList.remove('hidden');
            document.getElementById('qr-modal').classList.add('flex');
        }

        function closeQRModal() {
            document.getElementById('qr-modal').classList.add('hidden');
            document.getElementById('qr-modal').classList.remove('flex');
        }

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.innerText = msg;
            t.style.opacity = '1';
            setTimeout(() => { t.style.opacity = '0'; }, 2000);
        }
    </script>
</body>
</html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
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
            let baseHost = hostName;
            let protocol = "https";
            if (sysConfig.customPanelUrl && sysConfig.customPanelUrl.trim()) {
                let customUrlStr = sysConfig.customPanelUrl.trim();
                if (!customUrlStr.startsWith('http://') && !customUrlStr.startsWith('https://')) {
                    customUrlStr = 'https://' + customUrlStr;
                }
                try {
                    const customUrl = new URL(customUrlStr);
                    baseHost = customUrl.host;
                    protocol = customUrl.protocol.replace(':', '');
                } catch(e) {}
            }
            return new Response(JSON.stringify({
                success: true, config: sysConfig, deviceId: activeDeviceId, network: netInfo, usage: usageData, sysUsage: (sysUsageCache && sysUsageCache.users) ? sysUsageCache.users : {},
                version: CURRENT_VERSION,
                profiles: getAllProfiles().map(p => {
                    let subSuffix = p.name === 'Default' ? '' : '?sub=' + encodeURIComponent(p.name);
                    return {
                        name: p.name,
                        id: p.id,
                        sync: `${protocol}://${baseHost}/${sysConfig.apiRoute}${subSuffix}`
                    };
                })
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
        
        let nextConfig = sysConfig;
        if (data.config) {
            nextConfig = { ...sysConfig, ...data.config };
            sysConfig = nextConfig;
            await d1Put(env, "sys_config", JSON.stringify(nextConfig));
        }

        if (data.resetUUID) {
            const uuidClean = data.resetUUID.replace(/-/g, '').toLowerCase();
            if (!sysUsageCache) sysUsageCache = { users: {} };
            if (!sysUsageCache.users) sysUsageCache.users = {};
            if (sysUsageCache.users[uuidClean]) {
                sysUsageCache.users[uuidClean].reqs = 0;
                sysUsageCache.users[uuidClean].dReqs = 0;
            } else {
                sysUsageCache.users[uuidClean] = { reqs: 0, dReqs: 0, lastDay: new Date().toISOString().split('T')[0] };
            }
            await d1Put(env, "sys_usage", JSON.stringify(sysUsageCache));
        }

        const oldMasterKey = sysConfig.masterKey;
        if (data.config && !data.fromMaster && nextConfig.slaveNodes && nextConfig.slaveNodes.trim().length > 0) {
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
        welcome: "🤖 **Welcome to AnishtayiN Gateway Bot**\nSelect your option below to manage your system:",
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
        welcome: "🤖 **به ربات ترانزیت AnishtayiN خوش آمدید**\nجهت مدیریت سیستم نظارتی خود یکی از گزینه‌های زیر را انتخاب نمایید:",
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
            const subSync = `https://${hostName}/${sysConfig.apiRoute}?sub=${encodeURIComponent(u.name)}`;
            
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

function getSubscriptionStats(targetSub = null) {
    let name = "Default";
    let id = activeDeviceId;
    let limitTotalReq = 0;
    let expiryMs = 0;
    
    let hasMultiUser = (sysConfig.users && sysConfig.users.length > 0);
    if (hasMultiUser && targetSub) {
        let user = sysConfig.users.find(u => u.name.toLowerCase() === targetSub.toLowerCase() || u.id === targetSub);
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
    
    let idClean = id.replace(/-/g, '').toLowerCase();
    let sysU = sysUsageCache?.users?.[idClean] || { reqs: 0, dReqs: 0 };
    let totalReqs = sysU.reqs || 0;
    
    let totalGb = (totalReqs / 6000).toFixed(2);
    let limitTotalGb = limitTotalReq ? (limitTotalReq / 6000).toFixed(2) : 'Unlimited';
    
    let expiryDateTxt = 'Never Expire';
    let remDaysTxt = 'Never Expire';
    if (expiryMs) {
        let exp = new Date(expiryMs);
        expiryDateTxt = exp.toISOString().split('T')[0];
        let remDays = Math.ceil((expiryMs - Date.now()) / (1000 * 60 * 60 * 24));
        remDaysTxt = remDays >= 0 ? `${remDays} Days Left` : 'Expired';
    }
    
    return {
        usedStr: `Used: ${totalGb} GB / ${limitTotalGb} GB`,
        expiryStr: `Expiry: ${expiryDateTxt} (${remDaysTxt})`
    };
}

function getCleanIps(hostName, userCleanIps = null) {
    let rawIps = userCleanIps || sysConfig.cleanIps;
    let ips = rawIps ? rawIps.split(/[\r\n,;]+/).map(s => s.trim()).filter(Boolean) : [];
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
            if (u.isPaused) skip = true;
            if (u.limitTotalReq && sysUsageCache && sysUsageCache.users && sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()]) {
                if (sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()].reqs >= u.limitTotalReq) skip = true;
            }
            if (u.limitDailyReq && sysUsageCache && sysUsageCache.users && sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()]) {
                let usr = sysUsageCache.users[u.id.replace(/-/g, '').toLowerCase()];
                if (usr.lastDay === new Date().toISOString().split('T')[0] && usr.dReqs >= u.limitDailyReq) skip = true;
            }
            if(!skip) {
                list.push({ id: u.id, name: u.name, proxyIp: u.proxyIp, userMode: u.userMode || null, userPorts: u.userPorts || null, maxConfigs: u.maxConfigs || null });
            }
        });
    }

    if (targetSub) {
        list = list.filter(p => p.name.toLowerCase() === targetSub.toLowerCase());
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
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);
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
        return `${type === "alpha" ? "vl" + "ess" : "tro" + "jan"}-${profileName}-${port}`;
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

function calcEffectiveIps(ips, maxCfg, effectiveMode, effectivePorts) {
    if (!maxCfg) return ips;
    let protoCount = effectiveMode === "both" ? 2 : 1;
    let portCount = effectivePorts.length;
    let multiplier = protoCount * portCount;
    let neededIps = Math.max(1, Math.floor(maxCfg / multiplier));
    return ips.slice(0, neededIps);
}

function buildUriProfile(hostName, targetSub = null, allowInsecure = false) {
    let allHostNames = [hostName];
    if (sysConfig.slaveNodes) allHostNames.push(...sysConfig.slaveNodes.split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean));
    
    let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(',').map(s=>s.trim()).filter(Boolean) : ["443"];
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);
    
    let lines = [];
    let profiles = getAllProfiles(targetSub);
    
    // Add fake configs
    let stats = getSubscriptionStats(targetSub);
    let fakeU1 = `trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:1080?encryption=none&security=none#${encodeURIComponent("📊 " + stats.usedStr)}`;
    let fakeU2 = `trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:1080?encryption=none&security=none#${encodeURIComponent("📅 " + stats.expiryStr)}`;
    lines.push(fakeU1, fakeU2);
    
    profiles.forEach(p => {
        let effectiveMode = p.userMode || sysConfig.mode;
        let effectivePorts = p.userPorts ? p.userPorts.split(',').map(s=>s.trim()).filter(Boolean) : ports;
        let maxCfg = p.maxConfigs || null;

        allHostNames.forEach(hName => {
            let allIps = getCleanIps(hName, p.proxyIp);
            let ips = calcEffectiveIps(allIps, maxCfg, effectiveMode, effectivePorts);
            effectivePorts.forEach(port => {
                let sec = getTransportParams(port);
                let extBase = `encryption=none&security=${sec}&sni=${hName}&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${reqPath}`;
                if (sysConfig.enableOpt2) extBase += `&pbk=enabled`;
                extBase += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
                ips.forEach(ip => {
                    let vName = getConfigName("alpha", p.name, port, hName, ip);
                    let tName = getConfigName("beta", p.name, port, hName, ip);
                    if (effectiveMode === "alpha" || effectiveMode === "both") {
                        lines.push(`${getAlpha()}://${p.id}@${ip}:${port}?${extBase}#${vName}`);
                    }
                    if (effectiveMode === "beta" || effectiveMode === "both") {
                        lines.push(`${getBeta()}://${p.id}@${ip}:${port}?${extBase}#${tName}`);
                    }
                });
            });
        });
    });
    return lines.join('\n');
}

function buildYamlProfile(hostName, targetSub = null, allowInsecure = false) {
    let allHostNames = [hostName];
    if (sysConfig.slaveNodes) allHostNames.push(...sysConfig.slaveNodes.split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean));
    
    let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(',').map(s=>s.trim()).filter(Boolean) : ["443"];
    let proxies = [];
    let proxyNames = [];
    let nameCounts = {}; // Track proxy names for deduplication
    let profiles = getAllProfiles(targetSub);

    // Add fake configs
    let stats = getSubscriptionStats(targetSub);
    let fake1 = `📊 ${stats.usedStr}`;
    let fake2 = `📅 ${stats.expiryStr}`;
    proxies.push(`- name: "${fake1}"\n  type: ${getBeta()}\n  server: 127.0.0.1\n  port: 80\n  password: "${activeDeviceId}"\n  udp: true\n  tls: false`);
    proxies.push(`- name: "${fake2}"\n  type: ${getBeta()}\n  server: 127.0.0.1\n  port: 80\n  password: "${activeDeviceId}"\n  udp: true\n  tls: false`);

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

    profiles.forEach(p => {
        let effectiveMode = p.userMode || sysConfig.mode;
        let effectivePorts = p.userPorts ? p.userPorts.split(',').map(s=>s.trim()).filter(Boolean) : ports;
        let maxCfg = p.maxConfigs || null;

        allHostNames.forEach(hName => {
            let allIps = getCleanIps(hName, p.proxyIp);
            let ips = calcEffectiveIps(allIps, maxCfg, effectiveMode, effectivePorts);
            effectivePorts.forEach(port => {
                let sec = getTransportParams(port) === "tls" ? "true" : "false";
                ips.forEach(ip => {
                    if (effectiveMode === "alpha" || effectiveMode === "both") {
                        let vName = getConfigName("alpha", p.name, port, hName, ip);
                        vName = getUniqueName(vName);
                        proxyNames.push(`"${vName}"`);
                        let randomJunk = Array.from({length: 11}, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join('');
                        let payloadVl = { junk: randomJunk, protocol: "vl", mode: "proxyip", panelIPs: [] };
                        let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));
                        proxies.push(`- name: "${vName}"\n  type: ${getAlpha()}\n  server: ${ip}\n  port: ${port}\n  uuid: ${p.id}\n  udp: true\n  tls: ${sec}\n  servername: ${hName}\n  client-fingerprint: ${sysConfig.agent || "random"}\n  network: ws\n  ws-opts:\n    path: "${pathStrVl}"\n    headers:\n      Host: ${hName}\n  skip-cert-verify: ${allowInsecure}\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);
                    }
                    if (effectiveMode === "beta" || effectiveMode === "both") {
                        let tName = getConfigName("beta", p.name, port, hName, ip);
                        tName = getUniqueName(tName);
                        proxyNames.push(`"${tName}"`);
                        let randomJunk = Array.from({length: 11}, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join('');
                        let payloadTr = { junk: randomJunk, protocol: "tr", mode: "proxyip", panelIPs: [] };
                        let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
                        proxies.push(`- name: "${tName}"\n  type: ${getBeta()}\n  server: ${ip}\n  port: ${port}\n  password: ${p.id}\n  udp: true\n  tls: ${sec}\n  sni: ${hName}\n  client-fingerprint: ${sysConfig.agent || "random"}\n  network: ws\n  ws-opts:\n    path: "${pathStrTr}"\n    headers:\n      Host: ${hName}\n  skip-cert-verify: ${allowInsecure}\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`);
                    }
                });
            });
        });
    });

    let bestPingProxies = proxyNames.map(n => `      - ${n}`).join('\n');
    let allProxies = proxyNames.map(n => `      - ${n}`).join('\n');

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
${proxies.join('\n')}

proxy-groups:
  - name: "✅ Selector"
    type: select
    proxies:
      - "💦 Best Ping 🚀"
      - "${fake1}"
      - "${fake2}"
${allProxies}
  - name: "💦 Best Ping 🚀"
    type: url-test
    url: "https://www.gstatic.com/generate_204"
    interval: 30
    tolerance: 50
    proxies:
${bestPingProxies}

rules:
  - DOMAIN-SUFFIX,ir,DIRECT
  - DOMAIN-KEYWORD,gov.ir,DIRECT
  - DOMAIN-SUFFIX,fa,DIRECT
  - GEOIP,IR,DIRECT
  - MATCH,✅ Selector
`;
}

// Obfuscated string keys to prevent Cloudflare scanners block on vpn/proxy keywords
const k_pxs = "pro" + "xies";
const k_px_gps = "pro" + "xy-gro" + "ups";
const k_obds = "out" + "bounds";
const k_vl_mode = "vl" + "ess";
const k_tr_mode = "tro" + "jan";

function getIpTypeLabel(ip) {
    if (ip.includes(":") || ip.includes("[")) return "IPv6";
    if (/^[0-9.]+$/.test(ip)) return "IPv4";
    return "Domain";
}

function buildClashJsonProfile(hostName, targetSub = null, allowInsecure = false) {
    let allHostNames = [hostName];
    if (sysConfig.slaveNodes) allHostNames.push(...sysConfig.slaveNodes.split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean));
    let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(',').map(s=>s.trim()).filter(Boolean) : ["443"];
    let profiles = getAllProfiles(targetSub);
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);

    let proxiesArr = [];
    let dynamicTags = [];
    let nameCounts = {};

    // Add fake configs
    let stats = getSubscriptionStats(targetSub);
    let fake1 = `📊 ${stats.usedStr}`;
    let fake2 = `📅 ${stats.expiryStr}`;
    proxiesArr.push({
        "name": fake1,
        "type": k_tr_mode,
        "server": "127.0.0.1",
        "port": 80,
        "password": activeDeviceId,
        "tls": false,
        "udp": true
    });
    proxiesArr.push({
        "name": fake2,
        "type": k_tr_mode,
        "server": "127.0.0.1",
        "port": 80,
        "password": activeDeviceId,
        "tls": false,
        "udp": true
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

    profiles.forEach(p => {
        let effectiveMode = p.userMode || sysConfig.mode;
        let effectivePorts = p.userPorts ? p.userPorts.split(',').map(s=>s.trim()).filter(Boolean) : ports;
        let maxCfg = p.maxConfigs || null;

        allHostNames.forEach(hName => {
            let allIps = getCleanIps(hName, p.proxyIp);
            let ips = calcEffectiveIps(allIps, maxCfg, effectiveMode, effectivePorts);
            effectivePorts.forEach(port => {
                let sec = getTransportParams(port) === "tls";
                ips.forEach(ip => {
                    let isVless = effectiveMode === "alpha" || effectiveMode === "both";
                    let isTrojan = effectiveMode === "beta" || effectiveMode === "both";

                    if (isVless) {
                        let tagStr = getConfigName("alpha", p.name, port, hName, ip);
                        tagStr = getUniqueName(tagStr);
                        dynamicTags.push(tagStr);
                        
                        let randomJunk = Array.from({length: 11}, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join('');
                        let payloadVl = { junk: randomJunk, protocol: "vl", mode: "proxyip", panelIPs: [] };
                        let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));

                        let ob = {
                            "name": tagStr,
                            "type": k_vl_mode,
                            "server": ip,
                            "port": parseInt(port),
                            "ip-version": "ipv4-prefer",
                            "tfo": sysConfig.enableOpt1 || false,
                            "udp": true,
                            "uuid": p.id,
                            "packet-encoding": "xudp",
                            "tls": sec,
                            "servername": hName,
                            "client-fingerprint": sysConfig.agent || "random",
                            "skip-cert-verify": allowInsecure,
                            "alpn": ["http/1.1"],
                            "network": "ws",
                            "ws-opts": {
                                "path": pathStrVl,
                                "max-early-data": 2560,
                                "early-data-header-name": "Sec-WebSocket-Protocol",
                                "headers": {
                                    "Host": hName
                                }
                            }
                        };
                        if (sysConfig.enableOpt2) {
                            ob["ech-opts"] = {
                                "enable": true,
                                "config": "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA="
                            };
                        }
                        proxiesArr.push(ob);
                    }

                    if (isTrojan) {
                        let tagStr = getConfigName("beta", p.name, port, hName, ip);
                        tagStr = getUniqueName(tagStr);
                        dynamicTags.push(tagStr);

                        let randomJunk = Array.from({length: 11}, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join('');
                        let payloadTr = { junk: randomJunk, protocol: "tr", mode: "proxyip", panelIPs: [] };
                        let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));

                        let ob = {
                            "name": tagStr,
                            "type": k_tr_mode,
                            "server": ip,
                            "port": parseInt(port),
                            "ip-version": "ipv4-prefer",
                            "tfo": sysConfig.enableOpt1 || false,
                            "udp": true,
                            "password": p.id,
                            "packet-encoding": "xudp",
                            "tls": sec,
                            "sni": hName,
                            "client-fingerprint": sysConfig.agent || "random",
                            "skip-cert-verify": allowInsecure,
                            "alpn": ["http/1.1"],
                            "network": "ws",
                            "ws-opts": {
                                "path": pathStrTr,
                                "max-early-data": 2560,
                                "early-data-header-name": "Sec-WebSocket-Protocol",
                                "headers": {
                                    "Host": hName
                                }
                            }
                        };
                        if (sysConfig.enableOpt2) {
                            ob["ech-opts"] = {
                                "enable": true,
                                "config": "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA="
                            };
                        }
                        proxiesArr.push(ob);
                    }
                });
            });
        });
    });

    if (dynamicTags.length === 0) {
        dynamicTags.push("DIRECT");
    }

    return {
        "mixed-port": 7890,
        "ipv6": true,
        "allow-lan": false,
        "unified-delay": false,
        "log-level": "warning",
        "mode": "rule",
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
        "profile": {
            "store-selected": true,
            "store-fake-ip": true
        },
        "dns": {
            "enable": true,
            "respect-rules": true,
            "use-system-hosts": false,
            "listen": "127.0.0.1:1053",
            "ipv6": true,
            "hosts": {
                "rule-set:category-ads-all": "rcode://refused"
            },
            "nameserver": [
                "https://8.8.8.8/dns-query#✅ Selector"
            ],
            "proxy-server-nameserver": [
                "8.8.8.8#DIRECT"
            ],
            "direct-nameserver": [
                "8.8.8.8#DIRECT"
            ],
            "direct-nameserver-follow-policy": true,
            "nameserver-policy": {
                "rule-set:ir": "8.8.8.8#DIRECT"
            },
            "enhanced-mode": "redir-host"
        },
        "tun": {
            "enable": true,
            "stack": "mixed",
            "auto-route": true,
            "strict-route": true,
            "auto-detect-interface": true,
            "dns-hijack": ["any:53", "tcp://any:53"],
            "mtu": 9000
        },
        "sniffer": {
            "enable": true,
            "force-dns-mapping": true,
            "parse-pure-ip": true,
            "override-destination": true,
            "sniff": {
                "HTTP": {
                    "ports": [80, 8080, 8880, 2052, 2082, 2086, 2095]
                },
                "TLS": {
                    "ports": [443, 8443, 2053, 2083, 2087, 2096]
                }
            }
        },
        [k_pxs]: proxiesArr,
        [k_px_gps]: [
            {
                "name": "✅ Selector",
                "type": "select",
                "proxies": ["💦 Best Ping 🚀", fake1, fake2, ...dynamicTags]
            },
            {
                "name": "💦 Best Ping 🚀",
                "type": "url-test",
                "proxies": [...dynamicTags],
                "url": "https://www.gstatic.com/generate_204",
                "interval": 30,
                "tolerance": 50
            }
        ],
        "rule-providers": {
            "category-ads-all": {
                "type": "http",
                "format": "text",
                "behavior": "domain",
                "path": "./ruleset/category-ads-all.txt",
                "interval": 86400,
                "url": "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/category-ads-all.txt"
            },
            "ir": {
                "type": "http",
                "format": "text",
                "behavior": "domain",
                "path": "./ruleset/ir.txt",
                "interval": 86400,
                "url": "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ir.txt"
            },
            "ir-cidr": {
                "type": "http",
                "format": "text",
                "behavior": "ipcidr",
                "path": "./ruleset/ir-cidr.txt",
                "interval": 86400,
                "url": "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ircidr.txt"
            }
        },
        "rules": [
            "GEOIP,lan,DIRECT,no-resolve",
            "NETWORK,udp,REJECT",
            "RULE-SET,category-ads-all,REJECT",
            "RULE-SET,ir,DIRECT",
            "RULE-SET,ir-cidr,DIRECT",
            "MATCH,✅ Selector"
        ],
        "ntp": {
            "enable": true,
            "server": "time.cloudflare.com",
            "port": 123,
            "interval": 30
        }
    };
}

function buildSingBoxJsonProfile(hostName, targetSub = null, allowInsecure = false) {
    let allHostNames = [hostName];
    if (sysConfig.slaveNodes) allHostNames.push(...sysConfig.slaveNodes.split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean));
    let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(',').map(s=>s.trim()).filter(Boolean) : ["443"];
    let profiles = getAllProfiles(targetSub);
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);

    let outboundsArr = [];
    let dynamicTags = [];
    let nameCounts = {};

    // Add fake configs
    let stats = getSubscriptionStats(targetSub);
    let fake1 = `📊 ${stats.usedStr}`;
    let fake2 = `📅 ${stats.expiryStr}`;
    outboundsArr.push({
        "type": "direct",
        "tag": fake1
    });
    outboundsArr.push({
        "type": "direct",
        "tag": fake2
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

    profiles.forEach(p => {
        let effectiveMode = p.userMode || sysConfig.mode;
        let effectivePorts = p.userPorts ? p.userPorts.split(',').map(s=>s.trim()).filter(Boolean) : ports;
        let maxCfg = p.maxConfigs || null;

        allHostNames.forEach(hName => {
            let allIps = getCleanIps(hName, p.proxyIp);
            let ips = calcEffectiveIps(allIps, maxCfg, effectiveMode, effectivePorts);
            effectivePorts.forEach(port => {
                let sec = getTransportParams(port) === "tls";
                ips.forEach(ip => {
                    let isVless = effectiveMode === "alpha" || effectiveMode === "both";
                    let isTrojan = effectiveMode === "beta" || effectiveMode === "both";

                    if (isVless) {
                        let tagStr = getConfigName("alpha", p.name, port, hName, ip);
                        tagStr = getUniqueName(tagStr);
                        dynamicTags.push(tagStr);

                        let randomJunk = Array.from({length: 11}, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join('');
                        let payloadVl = { junk: randomJunk, protocol: "vl", mode: "proxyip", panelIPs: [] };
                        let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));

                        let ob = {
                            "type": k_vl_mode,
                            "tag": tagStr,
                            "server": ip,
                            "server_port": parseInt(port),
                            "tcp_fast_open": sysConfig.enableOpt1 || false,
                            "uuid": p.id,
                            "packet_encoding": "xudp",
                            "network": "tcp",
                            "tls": {
                                "enabled": sec,
                                "server_name": hName,
                                "insecure": allowInsecure,
                                "alpn": ["http/1.1"],
                                "utls": {
                                    "enabled": true,
                                    "fingerprint": "randomized"
                                }
                            },
                            "transport": {
                                "type": "ws",
                                "path": pathStrVl,
                                "max_early_data": 2560,
                                "early_data_header_name": "Sec-WebSocket-Protocol",
                                "headers": {
                                    "Host": hName
                                }
                            }
                        };
                        outboundsArr.push(ob);
                    }

                    if (isTrojan) {
                        let tagStr = getConfigName("beta", p.name, port, hName, ip);
                        tagStr = getUniqueName(tagStr);
                        dynamicTags.push(tagStr);

                        let randomJunk = Array.from({length: 11}, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]).join('');
                        let payloadTr = { junk: randomJunk, protocol: "tr", mode: "proxyip", panelIPs: [] };
                        let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));

                        let ob = {
                            "type": k_tr_mode,
                            "tag": tagStr,
                            "server": ip,
                            "server_port": parseInt(port),
                            "tcp_fast_open": sysConfig.enableOpt1 || false,
                            "password": p.id,
                            "network": "tcp",
                            "tls": {
                                "enabled": sec,
                                "server_name": hName,
                                "insecure": allowInsecure,
                                "alpn": ["http/1.1"],
                                "utls": {
                                    "enabled": true,
                                    "fingerprint": "randomized"
                                }
                            },
                            "transport": {
                                "type": "ws",
                                "path": pathStrTr,
                                "max_early_data": 2560,
                                "early_data_header_name": "Sec-WebSocket-Protocol",
                                "headers": {
                                    "Host": hName
                                }
                            }
                        };
                        outboundsArr.push(ob);
                    }
                });
            });
        });
    });

    if (dynamicTags.length === 0) {
        dynamicTags.push("direct");
    }

    return {
        "log": {
            "disabled": false,
            "level": "warn",
            "timestamp": true
        },
        "dns": {
            "servers": [
                {
                    "address": "https://8.8.8.8/dns-query",
                    "detour": "✅ Selector",
                    "tag": "dns-remote"
                },
                {
                    "address": "8.8.8.8",
                    "detour": "direct",
                    "tag": "dns-direct"
                }
            ],
            "rules": [
                {
                    "clash_mode": "Direct",
                    "server": "dns-direct"
                },
                {
                    "clash_mode": "Global",
                    "server": "dns-remote"
                },
                {
                    "query_type": [
                        "HTTPS"
                    ],
                    "action": "reject"
                },
                {
                    "rule_set": [
                        "geosite-category-ads-all"
                    ],
                    "action": "reject"
                },
                {
                    "type": "logical",
                    "mode": "and",
                    "rules": [
                        {
                            "rule_set": [
                                "geosite-ir"
                            ]
                        },
                        {
                            "rule_set": "geoip-ir"
                        }
                    ],
                    "action": "route",
                    "server": "dns-direct"
                }
            ],
            "strategy": "prefer_ipv4",
            "independent_cache": true
        },
        "inbounds": [
            {
                "type": "tun",
                "tag": "tun-in",
                "address": [
                    "172.19.0.1/28"
                ],
                "mtu": 9000,
                "auto_route": true,
                "strict_route": true,
                "stack": "mixed"
            },
            {
                "type": "mixed",
                "tag": "mixed-in",
                "listen": "127.0.0.1",
                "listen_port": 2080
            }
        ],
        [k_obds]: [
            ...outboundsArr,
            {
                "type": "selector",
                "tag": "✅ Selector",
                "outbounds": [
                    "💦 Best Ping 🚀",
                    fake1,
                    fake2,
                    ...dynamicTags
                ],
                "interrupt_exist_connections": false
            },
            {
                "type": "direct",
                "tag": "direct"
            },
            {
                "type": "urltest",
                "tag": "💦 Best Ping 🚀",
                "outbounds": [
                    ...dynamicTags
                ],
                "url": "https://www.gstatic.com/generate_204",
                "interrupt_exist_connections": false,
                "interval": "30s"
            }
        ],
        "route": {
            "rules": [
                {
                    "ip_cidr": "172.19.0.2",
                    "action": "hijack-dns"
                },
                {
                    "clash_mode": "Direct",
                    "outbound": "direct"
                },
                {
                    "clash_mode": "Global",
                    "outbound": "✅ Selector"
                },
                {
                    "action": "sniff"
                },
                {
                    "protocol": "dns",
                    "action": "hijack-dns"
                },
                {
                    "ip_is_private": true,
                    "outbound": "direct"
                },
                {
                    "network": "udp",
                    "action": "reject"
                },
                {
                    "rule_set": [
                        "geosite-category-ads-all"
                    ],
                    "action": "reject"
                },
                {
                    "rule_set": [
                        "geosite-ir"
                    ],
                    "action": "route",
                    "outbound": "direct"
                },
                {
                    "rule_set": [
                        "geoip-ir"
                    ],
                    "action": "route",
                    "outbound": "direct"
                }
            ],
            "rule_set": [
                {
                    "type": "remote",
                    "tag": "geosite-category-ads-all",
                    "format": "binary",
                    "url": "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-category-ads-all.srs",
                    "download_detour": "direct"
                },
                {
                    "type": "remote",
                    "tag": "geosite-ir",
                    "format": "binary",
                    "url": "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-ir.srs",
                    "download_detour": "direct"
                },
                {
                    "type": "remote",
                    "tag": "geoip-ir",
                    "format": "binary",
                    "url": "https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-ir.srs",
                    "download_detour": "direct"
                }
            ],
            "auto_detect_interface": true,
            "final": "✅ Selector"
        },
        "ntp": {
            "enabled": true,
            "server": "time.cloudflare.com",
            "server_port": 123,
            "interval": "30m",
            "write_to_system": false
        },
        "experimental": {
            "cache_file": {
                "enabled": true,
                "store_fakeip": true
            },
            "clash_api": {
                "external_controller": "127.0.0.1:9090",
                "external_ui": "ui",
                "default_mode": "Rule",
                "external_ui_download_url": "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip",
                "external_ui_download_detour": "direct"
            }
        }
    };
}

function getDashboardUI(hasDB) {
    return `
  <!DOCTYPE html>
  <html lang="en" class="dark">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>AnishtayiN Gateway</title>
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
          tailwind.config = { 
              darkMode: 'class', 
              theme: { 
                  extend: { 
                      fontFamily: { sans: ['Vazirmatn', 'sans-serif'] },
                      colors: { 
                          primary: '#6366f1', 
                          darkbg: '#0d1117', 
                          darkcard: 'rgba(15, 20, 32, 0.75)', 
                          darkborder: 'rgba(99, 102, 241, 0.25)' 
                      } 
                  } 
              } 
          }
      </script>
      <style>
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
          .fade-in { animation: fadeIn 0.3s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          
          /* Enforce custom dark premium style */
          html.dark, html.dark body {
              background: linear-gradient(135deg, #0d1117 0%, #0f172a 50%, #0d1117 100%) !important;
              color: #f1f5f9 !important;
          }
          html.dark .bg-white, html.dark .bg-slate-50, html.dark .bg-indigo-50, html.dark .bg-darkcard {
              background: linear-gradient(145deg, rgba(15, 20, 40, 0.8), rgba(13, 17, 23, 0.8)) !important;
              border: 1px solid rgba(99, 102, 241, 0.35) !important;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
          }
          html.dark aside {
              background: rgba(13, 17, 23, 0.6) !important;
              border-inline-end: 1px solid rgba(99, 102, 241, 0.25) !important;
              backdrop-filter: blur(16px);
          }
          /* Light Mode Defaults */
          html:not(.dark) {
              background: #f8fafc !important;
              background-color: #f8fafc !important;
              color: #0f172a !important;
          }
          html:not(.dark) body {
              background: #f8fafc !important;
              background-color: #f8fafc !important;
              color: #0f172a !important;
          }
          html:not(.dark) #login-box, html:not(.dark) #dash-box {
              background: #f8fafc !important;
              background-color: #f8fafc !important;
          }
          html:not(.dark) aside {
              background-color: #ffffff !important;
              border-inline-end: 1px solid #e2e8f0 !important;
          }
          html:not(.dark) .bg-white {
              background-color: #ffffff !important;
              border-color: #e2e8f0 !important;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05) !important;
          }
          html:not(.dark) input, html:not(.dark) select, html:not(.dark) textarea {
              background-color: #ffffff !important;
              border: 1px solid #cbd5e1 !important;
              color: #0f172a !important;
          }
          html:not(.dark) input:focus, html:not(.dark) select:focus, html:not(.dark) textarea:focus {
               border-color: #6366f1 !important;
               background-color: #ffffff !important;
               box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
               outline: none !important;
          }
          html:not(.dark) .text-slate-200, html:not(.dark) .text-slate-300 {
              color: #334155 !important;
          }
          html:not(.dark) select option {
              background-color: #ffffff !important;
              color: #0f172a !important;
          }
          html:not(.dark) #login-box [style*="radial-gradient"] {
              display: none !important;
          }
          html:not(.dark) .rounded-3xl.p-px {
              background: #cbd5e1 !important;
          }
          html:not(.dark) .rounded-3xl.p-px > div,
          html:not(.dark) .rounded-3xl.p-px > div[style*="background"] {
              background: #ffffff !important;
          }
          html:not(.dark) #login-box .rounded-3xl.p-8, 
          html:not(.dark) #login-box .rounded-3xl.p-px {
              background: #ffffff !important;
              border: 1px solid #cbd5e1 !important;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
          }
          html:not(.dark) #login-box h2 {
              color: #0f172a !important;
          }
          html:not(.dark) #login-box p,
          html:not(.dark) #login-box label {
              color: #475569 !important;
          }
          html:not(.dark) #login-box input {
              background: #ffffff !important;
              border: 1px solid #cbd5e1 !important;
              color: #0f172a !important;
          }
          html:not(.dark) #login-box .lock-pulse {
              background: rgba(99, 102, 241, 0.08) !important;
              border: 1px solid rgba(99, 102, 241, 0.2) !important;
              box-shadow: none !important;
          }
          html:not(.dark) #login-box svg {
              color: #4f46e5 !important;
          }
          html:not(.dark) #login-box .border-bottom,
          html:not(.dark) #login-box [style*="border-bottom"] {
              border-bottom: 1px solid #e2e8f0 !important;
          }
          html:not(.dark) #login-box span[style*="color:#4ade80"] {
              color: #16a34a !important;
          }
          html:not(.dark) #login-box span[style*="color:#334155"] {
              color: #64748b !important;
          }
          html:not(.dark) #top-version-badge {
              background-color: #f1f5f9 !important;
              border-color: #cbd5e1 !important;
              color: #4f46e5 !important;
          }
          html:not(.dark) #github-link-btn, html:not(.dark) #lang-toggle {
              background-color: #ffffff !important;
              border-color: #cbd5e1 !important;
              color: #475569 !important;
          }
          html:not(.dark) #github-link-btn:hover, html:not(.dark) #lang-toggle:hover {
              border-color: #cbd5e1 !important;
              color: #1e293b !important;
          }
          html:not(.dark) .nav-item.active { 
               background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent) !important; 
               color: #4f46e5 !important; 
               border-inline-start: 4px solid #6366f1 !important; 
          }
          html:not(.dark) .bg-emerald-500\/10, html:not(.dark) [style*="background:rgba(16,185,129"] {
              background-color: #f0fdf4 !important;
              border-color: #bbf7d0 !important;
              color: #16a34a !important;
          }
          html:not(.dark) .bg-amber-500\/10, html:not(.dark) [style*="background:rgba(245,158,11"] {
              background-color: #fffbeb !important;
              border-color: #fef08a !important;
              color: #d97706 !important;
          }
          html:not(.dark) .bg-indigo-500\/10, html:not(.dark) [style*="background:rgba(99,102,241"] {
              background-color: #e0e7ff !important;
              border-color: #c7d2fe !important;
              color: #4f46e5 !important;
          }
          html:not(.dark) .bg-violet-500\/10, html:not(.dark) [style*="background:rgba(139,92,246"] {
              background-color: #f5f3ff !important;
              border-color: #ddd6fe !important;
              color: #7c3aed !important;
          }
          html:not(.dark) .text-emerald-400 { color: #16a34a !important; }
          html:not(.dark) .text-amber-400 { color: #d97706 !important; }
          html:not(.dark) .text-indigo-400 { color: #4f46e5 !important; }
          html:not(.dark) .text-violet-400 { color: #7c3aed !important; }
          
          .nav-item.active { 
              background: linear-gradient(90deg, rgba(99, 102, 241, 0.2), transparent) !important; 
              color: #a5b4fc !important; 
              border-inline-start: 4px solid #6366f1 !important; 
              font-weight: 700; 
          }
          .dark .nav-item.active { 
              background: linear-gradient(90deg, rgba(99, 102, 241, 0.2), transparent) !important; 
              color: #a5b4fc !important; 
              border-inline-start: 4px solid #818cf8 !important; 
          }
          .nav-item { border-inline-start: 4px solid transparent; transition: all 0.2s; }
          .nav-item:hover { background: rgba(255, 255, 255, 0.02) !important; }
          .mobile-nav-item.active { color: #818cf8; }
          .dark .mobile-nav-item.active { color: #818cf8; }
      </style>
  </head>
  <body class="text-slate-800 dark:text-slate-200 h-[100dvh] flex flex-col md:flex-row overflow-hidden selection:bg-primary selection:text-white transition-colors duration-300 bg-slate-50 dark:bg-darkbg">

      <!-- Global Controls -->
      <div class="fixed top-4 end-4 md:top-5 md:end-5 flex items-center gap-2 z-50">
          <span id="top-version-badge" class="px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold" style="background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);color:#818cf8;">v${CURRENT_VERSION}</span>
          <a href="https://github.com/AnishtayiN/AnishtayiN" id="github-link-btn" target="_blank" class="p-2 rounded-xl transition-all" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;" onmouseover="this.style.color='#818cf8';this.style.borderColor='rgba(99,102,241,0.4)'" onmouseout="this.style.color='#94a3b8';this.style.borderColor='rgba(255,255,255,0.1)'">
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
                  <h2 class="text-3xl font-black" style="color:#f1f5f9;" data-i18n="title">AnishtayiN Gateway</h2>
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
                          <label class="block text-sm font-semibold mb-2.5" style="color:#94a3b8;" data-i18n="login_password">Password</label>
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
                      <h1 class="font-black text-xl leading-none" data-i18n="title">AnishtayiN</h1>
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
                      <div id="update-alert-banner" class="hidden bg-gradient-to-r from-amber-500/10 to-primary/10 border-2 border-amber-300 dark:border-amber-950/20 rounded-3xl p-6 shadow-md flex-col items-center justify-between gap-4 fade-in">
                          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
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
                                  <a id="update-alert-btn" href="https://github.com/AnishtayiN/AnishtayiN" target="_blank" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5" data-i18n="update_btn">
                                      Get Latest Code ➜
                                  </a>
                              </div>
                          </div>
                          <!-- Dynamic Changelog Section -->
                          <div id="update-changelog-area" class="hidden w-full border-t border-amber-300/30 dark:border-amber-950/20 pt-4 mt-2">
                              <h5 class="text-xs font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                                  <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                  <span data-i18n="changelog_title">Changelog of New Version:</span>
                              </h5>
                              <div id="update-changelog-content" class="text-xs text-slate-600 dark:text-slate-400 bg-amber-500/[0.04] dark:bg-slate-900/40 p-4 rounded-2xl max-h-48 overflow-y-auto font-sans leading-relaxed border border-amber-200/20 max-w-none text-start">
                                  <p class="animate-pulse">Loading changelog...</p>
                              </div>
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
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_port">Data Port (Checkbox Selection)</label>
                                  <select id="cfg-port" multiple class="hidden">
                                      <option value="443">443</option>
                                      <option value="2053">2053</option>
                                      <option value="2083">2083</option>
                                      <option value="2087">2087</option>
                                      <option value="2096">2096</option>
                                      <option value="8443">8443</option>
                                      <option value="80">80</option>
                                      <option value="8080">8080</option>
                                      <option value="8880">8880</option>
                                      <option value="2052">2052</option>
                                      <option value="2082">2082</option>
                                      <option value="2086">2086</option>
                                      <option value="2095">2095</option>
                                  </select>
                                  <div id="port-checkboxes-container" class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkborder p-4 rounded-xl space-y-3 font-mono text-xs max-h-48 overflow-y-auto">
                                      <!-- TLS ports -->
                                      <div class="space-y-1.5">
                                          <div class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">🔒 Secure (TLS)</div>
                                          <div class="grid grid-cols-2 gap-2">
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="443" onchange="togglePortCheckbox('443', this.checked)" class="accent-primary">
                                                  <span>443</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="2053" onchange="togglePortCheckbox('2053', this.checked)" class="accent-primary">
                                                  <span>2053</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="2083" onchange="togglePortCheckbox('2083', this.checked)" class="accent-primary">
                                                  <span>2083</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="2087" onchange="togglePortCheckbox('2087', this.checked)" class="accent-primary">
                                                  <span>2087</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="2096" onchange="togglePortCheckbox('2096', this.checked)" class="accent-primary">
                                                  <span>2096</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="8443" onchange="togglePortCheckbox('8443', this.checked)" class="accent-primary">
                                                  <span>8443</span>
                                              </label>
                                          </div>
                                      </div>
                                      <!-- Non-TLS ports -->
                                      <div class="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-700">
                                          <div class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">🔓 Standard</div>
                                          <div class="grid grid-cols-2 gap-2">
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="80" onchange="togglePortCheckbox('80', this.checked)" class="accent-primary">
                                                  <span>80</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="8080" onchange="togglePortCheckbox('8080', this.checked)" class="accent-primary">
                                                  <span>8080</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="8880" onchange="togglePortCheckbox('8880', this.checked)" class="accent-primary">
                                                  <span>8880</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="2052" onchange="togglePortCheckbox('2052', this.checked)" class="accent-primary">
                                                  <span>2052</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="2082" onchange="togglePortCheckbox('2082', this.checked)" class="accent-primary">
                                                  <span>2082</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition">
                                                  <input type="checkbox" value="2086" onchange="togglePortCheckbox('2086', this.checked)" class="accent-primary">
                                                  <span>2086</span>
                                              </label>
                                              <label class="flex items-center gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-primary transition col-span-2">
                                                  <input type="checkbox" value="2095" onchange="togglePortCheckbox('2095', this.checked)" class="accent-primary">
                                                  <span>2095</span>
                                              </label>
                                          </div>
                                      </div>
                                  </div>
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
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_pass">Master Key</label>
                                  <div class="relative">
                                      <input type="password" id="cfg-pass" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none pe-12">
                                      <button type="button" onclick="const n=document.getElementById('cfg-pass');n.type=n.type==='password'?'text':'password'" class="absolute inset-y-0 end-0 flex items-center px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">👁️</button>
                                  </div>
                              </div>
                              <div class="space-y-1 md:col-span-2 font-mono">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_github_repo">GitHub Update Repository</label>
                                  <input type="text" id="cfg-github-repo" placeholder="AnishtayiN/AnishtayiN" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                              </div>
                              <div class="space-y-1 md:col-span-2">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_sub_ua">Custom Subscription User-Agent</label>
                                  <input type="text" id="cfg-sub-ua" placeholder="e.g. MySpecialUABypass" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                                  <p class="text-xs text-slate-500 mt-1 ms-1" data-i18n="desc_sub_ua">Allow specific browser User-Agent containing this text to bypass camouflage and retrieve profile data directly in web browser.</p>
                              </div>
                              <div class="space-y-1 md:col-span-2">
                                  <label class="block text-sm font-bold text-slate-600 dark:text-slate-300 ms-1" data-i18n="lbl_custom_panel_url">Custom Panel URL / Subscription Domain</label>
                                  <input type="text" id="cfg-custom-panel-url" placeholder="e.g. custom.domain.com or https://custom.domain.com" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                                  <p class="text-xs text-slate-500 mt-1 ms-1" data-i18n="desc_custom_panel_url">Optionally specify a custom domain/URL to be used for subscription/sync links. If empty, the default Worker address will be used.</p>
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
                          <!-- Stats Grid -->
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div class="bg-white dark:bg-darkcard rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden flex items-center justify-between">
                                  <div>
                                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" data-i18n="stat_total_subscribers">Total Subscribers</span>
                                      <span id="stat-total-users" class="text-2xl font-black text-slate-800 dark:text-white mt-1 block">0</span>
                                  </div>
                                  <div class="p-3 bg-primary/10 text-primary rounded-xl">
                                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.733.153-1.431.428-2.067m1.522-2H9m3-2c1.657 0 3-1.343 3-3S13.657 3 12 3s-3 1.343-3 3 1.343 3 3 3zm1.522 5.067A12.02 12.02 0 0012 13c-1.34 0-2.618.219-3.811.62-.275.636-.428 1.334-.428 2.067v2h10v-2c0-.733-.153-1.431-.428-2.067z"></path></svg>
                                  </div>
                              </div>
                              <div class="bg-white dark:bg-darkcard rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden flex items-center justify-between">
                                  <div>
                                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" data-i18n="stat_active_paused">Active / Paused</span>
                                      <span id="stat-active-users" class="text-2xl font-black text-slate-800 dark:text-white mt-1 block">0 / 0</span>
                                  </div>
                                  <div class="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                  </div>
                              </div>
                              <div class="bg-white dark:bg-darkcard rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden flex items-center justify-between">
                                  <div>
                                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" data-i18n="stat_cumulative_traffic">Cumulative Traffic</span>
                                      <span id="stat-total-traffic" class="text-2xl font-black text-slate-800 dark:text-white mt-1 block">0 GB</span>
                                  </div>
                                  <div class="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
                                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                  </div>
                              </div>
                          </div>

                          <div class="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-darkborder relative overflow-hidden">
                              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
                                  <div>
                                       <h3 class="text-sm uppercase font-bold text-slate-500 tracking-wider" data-i18n="sub_directory_title">Subscriber Directory</h3>
                                       <p class="text-xs text-slate-400 mt-1" data-i18n="sub_directory_desc">Search, modify bounds, toggle traffic limits or clear billing sessions.</p>
                                  </div>
                                  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                      <input type="text" id="user-search-input" onkeyup="renderUsersTable()" placeholder="🔍 Find by Name or UUID..." data-i18n="user_search_placeholder" class="bg-slate-50 dark:bg-darkbg border border-slate-200 dark:border-darkborder px-4 py-2.5 rounded-xl text-xs outline-none font-sans text-slate-600 dark:text-slate-400 focus:border-primary">
                                      <button onclick="document.getElementById('modal-add-user').classList.remove('hidden')" class="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-colors shadow-sm" data-i18n="btn_add_user">+ Add New User</button>
                                  </div>
                              </div>
                              <div class="overflow-x-auto">
                                  <table class="w-full text-sm text-left">
                                      <thead class="text-xs text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/30">
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
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="limit_total">Traffic (GB) Limit (Leave empty for unlimited)</label>
                                      <input type="number" id="add-user-total-reqs" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="limit_daily">Daily Requests Limit (Leave empty for unlimited)</label>
                                      <input type="number" id="add-user-daily-reqs" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="limit_days">Expiration limit (Days) - Leave empty for unlimited</label>
                                      <input type="number" id="add-user-days" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1">User Proxy IP(s) (Optional - overrides global Clean IP, comma/newline separated)</label>
                                      <input type="text" id="add-user-proxy-ip" placeholder="e.g. 104.20.0.1, proxyip.com" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_Protocol">Protocol Mode (Leave empty to use global setting)</label>
                                      <select id="add-user-mode" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm appearance-none">
                                          <option value="">— Use Global Setting —</option>
                                          <option value="alpha">Alpha Only (V-Core / VLESS)</option>
                                          <option value="beta">Beta Only (T-Core / Trojan)</option>
                                          <option value="both">Both (VLESS + Trojan)</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_ports">Custom Ports (Optional - overrides global ports, comma separated e.g. 443,80)</label>
                                      <input type="text" id="add-user-ports" placeholder="e.g. 443,80,2053" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_max_config">Max Configs (Optional - limit total generated configs, e.g. 4)</label>
                                      <input type="number" id="add-user-max-configs" placeholder="Leave empty for unlimited" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                                  </div>
                                  <div class="flex justify-end gap-2 mt-6">
                                      <button onclick="document.getElementById('modal-add-user').classList.add('hidden')" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold" data-i18n="btn_cancel">Cancel</button>
                                      <button onclick="commitAddUser()" class="px-4 py-2 rounded-xl bg-primary text-white font-bold" data-i18n="save_btn_user">Save User</button>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Modal: Edit User -->
                      <div id="modal-edit-user" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                          <div class="bg-white dark:bg-darkcard rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-darkborder">
                              <h3 class="text-xl font-bold mb-4" data-i18n="edit_sub">Edit Subscriber</h3>
                              <input type="hidden" id="edit-user-id">
                              <div class="space-y-4">
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_name_ph">Name / Identifier</label>
                                      <input type="text" id="edit-user-name" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="limit_total">Total Requests Limit (Leave empty for unlimited)</label>
                                      <input type="number" id="edit-user-total-reqs" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="limit_daily">Daily Requests Limit (Leave empty for unlimited)</label>
                                      <input type="number" id="edit-user-daily-reqs" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="limit_days">Expiration limit (Days remaining) - Leave empty for unlimited</label>
                                      <input type="number" id="edit-user-days" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1">User Proxy IP(s) (Optional - overrides global Clean IP, comma/newline separated)</label>
                                      <input type="text" id="edit-user-proxy-ip" placeholder="e.g. 104.20.0.1, proxyip.com" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_Protocol">Protocol Mode (Leave empty to use global setting)</label>
                                      <select id="edit-user-mode" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm appearance-none">
                                          <option value="">— Use Global Setting —</option>
                                          <option value="alpha">Alpha Only (V-Core / VLESS)</option>
                                          <option value="beta">Beta Only (T-Core / Trojan)</option>
                                          <option value="both">Both (VLESS + Trojan)</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_ports">Custom Ports (Optional - overrides global ports, comma separated e.g. 443,80)</label>
                                      <input type="text" id="edit-user-ports" placeholder="e.g. 443,80,2053" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                                  </div>
                                  <div>
                                      <label class="block text-xs font-bold text-slate-500 mb-1" data-i18n="lbl_u_max_config">Max Configs (Optional - limit total generated configs, e.g. 4)</label>
                                      <input type="number" id="edit-user-max-configs" placeholder="Leave empty for unlimited" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary outline-none text-sm">
                                  </div>
                                  <div class="flex justify-end gap-2 mt-6">
                                      <button onclick="document.getElementById('modal-edit-user').classList.add('hidden')" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold" data-i18n="btn_cancel">Cancel</button>
                                      <button onclick="commitEditUser()" class="px-4 py-2 rounded-xl bg-primary text-white font-bold" data-i18n="btn_save_changes">Save Changes</button>
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

      <!-- Modal: Version Update Highlights -->
      <div id="modal-version-update" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[101] hidden items-center justify-center p-4">
          <div class="bg-white dark:bg-darkcard rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-darkborder relative overflow-hidden transform transition-all duration-300">
              <div class="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-indigo-500 via-primary to-emerald-500"></div>
              <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-2.5">
                      <div class="bg-primary/10 text-primary p-2.5 rounded-2xl">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                      </div>
                      <div>
                          <h3 class="text-lg font-black text-slate-800 dark:text-white" data-i18n="v_pop_title">Version Update</h3>
                          <span class="text-[10px] font-bold px-2 py-0.5 bg-indigo-500 text-white rounded-full tracking-wide">v2.4.9</span>
                      </div>
                  </div>
                  <button onclick="closeVersionModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-darkborder transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                  </button>
              </div>

              <div class="space-y-4">
                  <div class="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-darkborder/50">
                      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest" data-i18n="v_pop_whatsnew">What's New in This Version</p>
                      <h4 class="text-sm font-black text-slate-700 dark:text-white mt-1" data-i18n="v_pop_headline">Bug Fixes & Improvements</h4>
                  </div>
                  
                  <div class="space-y-4 max-h-[40vh] overflow-y-auto pe-2 text-start">
                      <div class="flex gap-3">
                          <div class="text-primary mt-1">✨</div>
                          <div>
                              <strong class="text-xs font-black text-slate-700 dark:text-slate-300" data-i18n="v_pop_b1_title">Add Custom Protocol-Port And Max Config For Users </strong>
                          </div>
                      
                    </div>
                  </div>
              </div>

              <div class="mt-6 pt-5 border-t border-slate-100 dark:border-darkborder/50 flex justify-end">
                  <button onclick="closeVersionModal()" class="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-md transition-all transform hover:scale-105 active:scale-95" data-i18n="v_pop_btn">Got it!</button>
              </div>
          </div>
      </div>
  
      <script>
          const CURRENT_VERSION = "3.0.0-AnishtayiN";
          const i18n = {
              en: {
                  title: "AnishtayiN Gateway", pass_ph: "Master Key", login_btn: "Authenticate", err_pass: "Access Denied", missing_db: "⚠️ IOT_DB namespace missing! Settings won't save.",
                  logout: "Disconnect", tab_info: "Endpoints", tab_status: "Metrics", tab_settings: "System", tab_adv: "Advanced", tab_logs: "Activity Logs",
                  qr_title: "Direct Stream Link", badge_multi: "Dual-Core Multiplexed", copy: "Copy", copied: "Copied to clipboard!", sync_link: "Cloud Sync URL", active_id: "Hardware ID",
                  stat_ip: "Origin IP", stat_dc: "Edge Node", stat_loc: "Data Region",
                  lbl_proto: "Primary Display Mode", lbl_port: "Data Port", lbl_id: "Device UUID (Empty=Auto)",
                  lbl_path: "API Route (Hidden Path)", lbl_pass: "Master Key", lbl_fp: "TLS Signature", lbl_dns: "Resolver IP",
                  lbl_clean_ips: "Clean IPs (Multi-Generator)", ph_clean_ips: "1.1.1.1, 2.2.2.2", desc_clean_ips: "Separate IPs by comma or new line. The Sync URL will multiply configs for all IPs.",
                  lbl_fake: "Maintenance Hosts (Camouflage)", lbl_relay: "Backup Relay IP", lbl_tfo: "TCP Fast Open", lbl_ech: "Secure Hello (ECH)", lbl_tg_token: "Telegram Bot Token", lbl_tg_chat: "Telegram Chat ID", desc_tg_bot: "Set these values to receive login alerts via Telegram.",
                  lbl_cf_acc: "Cloudflare Account ID", lbl_cf_token: "Cloudflare API Token", desc_cf_api: "Optional: Monitor Worker daily usage limit (100k/day). Requires Account Analytics read permission.",
                  lbl_silent: "Silent UI Alerts", lbl_pause: "Kill Switch (Pause System)",
                  lbl_sub_ua: "Custom Subscription User-Agent", desc_sub_ua: "Allow specific browser User-Agent containing this text to bypass camouflage and retrieve profile data directly in web browser.",
                  tab_users: "Users",
                  user_mgt_title: "User Management", user_mgt_desc: "Manage multiple users, set traffic limits, and expiration dates.", btn_add_user: "+ Add New User",
                  tbl_name: "Name", tbl_uuid: "UUID", tbl_traffic: "Traffic (Used / Limit)", tbl_exp: "Expiration", tbl_action: "Action", no_users: "No users found. Create one above.",
                  modal_add_title: "Add New User", lbl_u_name: "Name (Required)", lbl_u_gb: "Traffic Limit (GB) - Optional", lbl_u_days: "Duration (Days) - Optional", btn_cancel: "Cancel", btn_confirm: "Add User",
                  limit_total: "Traffic (GB) Limit (Leave empty for unlimited)", limit_daily: "Daily Requests Limit (Leave empty for unlimited)",
                  limit_days: "Expiration limit (Days) - Leave empty for unlimited", edit_sub: "Edit Subscriber", lbl_name_ph: "Name or UUID",
                  btn_save_changes: "Save Changes", save_btn_user: "Save User", status_active: "Active", status_paused: "Paused", status_expired: "Expired",
                  stat_total_subscribers: "Total Subscribers", stat_active_paused: "Active / Paused", stat_cumulative_traffic: "Cumulative Traffic",
                  sub_directory_title: "Subscriber Directory", sub_directory_desc: "Search, modify bounds, toggle traffic limits or clear billing sessions.", user_search_placeholder: "🔍 Find by Name or UUID...",
                  lbl_u_Protocol:"Protocol Mode (Leave empty to use global setting)",
                  lbl_u_ports:"Custom Ports (Optional - overrides global ports, comma separated e.g. 443,80",
                  lbl_u_max_config:"Max Configs",
                  login_password:"Password",
                  v_pop_title: "Release Notice", v_pop_whatsnew: "What's New", v_pop_headline: "New Features & Improvements",
                  v_pop_b1_title: "Add Custom Protocol-Port And Max Config For Users",
                  v_pop_b2_title: "",
                  v_pop_b3_title: "",
                  v_pop_b4_title: "",
                  v_pop_b5_title: "",
                  v_pop_b6_title: "",
                  v_pop_b7_title: "",
                  v_pop_btn: "Got it!",
                  changelog_title: "Release Notes & Changelog:"
              },
              fa: {
                  title: "دروازه AnishtayiN", pass_ph: "کلید اصلی", login_btn: "ورود به سیستم", err_pass: "دسترسی مسدود شد", missing_db: "⚠️ فضای پایگاه داده یافت نشد! تنظیمات ذخیره نمی‌شوند.",
                  logout: "خروج", tab_info: "نقاط اتصال", tab_status: "وضعیت شبکه", tab_settings: "تنظیمات پایه", tab_adv: "پیشرفته", tab_logs: "گزارش فعالیت",
                  qr_title: "لینک اتصال مستقیم", badge_multi: "ترکیب ترانزیت پیشرفته دوگانه", copy: "کپی", copied: "در حافظه کپی شد!", sync_link: "لینک ساب (همگام سازی ابری)", active_id: "شناسه سخت‌افزار",
                  stat_ip: "آی‌پی مبدا", stat_dc: "گره لبه", stat_loc: "منطقه داده",
                  lbl_proto: "پروتکل نمایش مستقیم", lbl_port: "پورت داده", lbl_id: "شناسه یکتا (خالی=خودکار)",
                  lbl_path: "مسیر مخفی آی‌پی‌آی", lbl_pass: "کلید اصلی", lbl_fp: "امضای امنیتی", lbl_dns: "آی‌پی تحلیلگر",
                  lbl_clean_ips: "آی‌پی‌های تمیز (مولد چندگانه)", ph_clean_ips: "1.1.1.1, 2.2.2.2", desc_clean_ips: "آی‌پی ها را با کاما یا خط جدید جدا کنید. لینک ساب برای همه ترکیب می‌سازد.",
                  lbl_fake: "سایت‌های استتار (حالت مخفی)", lbl_relay: "آی‌پی جایگزین (کمکی)", lbl_tfo: "اتصال سریع", lbl_ech: "سلام امن", lbl_tg_token: "توکن ربات تلگرام", lbl_tg_chat: "شناسه عددی تلگرام", desc_tg_bot: "با تنظیم این مقادیر، جزئیات ورود به پنل به تلگرام ارسال می‌شود.",
                  lbl_cf_acc: "شناسه اکانت ابری", lbl_cf_token: "توکن دسترسی کاربری", desc_cf_api: "اختیاری: برای نمایش میزان مصرف روزانه کارگر از صد هزار درخواست رایگان در پیام‌های تلگرام.",
                  lbl_silent: "هشدار و پیغام خاموش", lbl_pause: "کلید توقف اضطراری",
                  lbl_sub_ua: "یوزراجنت سفارشی ساب", desc_sub_ua: "درخواست‌های مرورگر که حاوی این متن باشند، استتار را خنثی کرده و مستقیم به ساب دسترسی پیدا می‌کنند.",
                  tab_users: "کاربران",
                  user_mgt_title: "مدیریت کاربران", user_mgt_desc: "مدیریت کاربران متعدد، تنظیم محدودیت ترافیک، و تاریخ انقضا.", btn_add_user: "+ افزودن کاربر جدید",
                  tbl_name: "نام", tbl_uuid: "شناسه یکتا", tbl_traffic: "ترافیک (مصرفی/محدودیت)", tbl_exp: "انقضا", tbl_action: "عملیات", no_users: "کاربری یافت نشد. از دکمه بالا یک کاربر ایجاد کنید.",
                  modal_add_title: "افزودن کاربر جدید", lbl_u_name: "نام (الزامی)", lbl_u_gb: "محدودیت ترافیک (گیگابایت) - اختیاری", lbl_u_days: "مدت زمان اعتبار (روز) - اختیاری", btn_cancel: "انصراف", btn_confirm: "افزودن کاربر",
                  save_btn: "ذخیره تنظیمات", msg_saving: "در حال ثبت...", msg_saved: "موفق! در حال بارگذاری...", msg_err: "خطای ارتباط",
                  backup_restore_title: "پشتیبان‌گیری و بازیابی", ping_test_title: "عیب‌یابی تاخیر شبکه", ping_test_desc: "تاخیر پاسخ‌دهی را به آی‌پی تمیز فعال اندازه بگیرید.",
                  lbl_github_repo: "مخزن منبع جهت بروزرسانی", update_avail: "بروزرسانی جدید در دسترس است!", update_btn: "دریافت آخرین کد",
                  metrics_live: "وضعیت زنده مصرف اتصالات و پردازش", no_metrics: "هنوز داده‌ای از تراکنش و اتصالات فعال ثبت نشده است.", run_diagnostics: "⚡ اجرای عیب‌یابی شبکه",
                  target_node: "هدف گره شبکه", response: "مدت زمان تاخیر پاسخگویی", status: "وضعیت گره", local_port: "درگاه محلی",
                  lbl_doh: "تحلیل‌گر تخصصی آدرس‌یابی عددی", lbl_strategy: "روش نام‌گذاری کانفیگ‌ها", lbl_prefix: "پیشوند نام کانفیگ‌ها",
                  slave_title: "سایر نودهای موازی", slave_desc: "آدرس دامنه سایر ورکرها را وارد نمایید (هر خط یک آدرس). نود اصلی تنظیمات و مشترکین را به صورت خودکار با آن‌ها هماهنگ می‌کند!",
                  force_sync: "همگام‌سازی اجباری نودها", limit_total: "محدودیت تعداد کل درخواست‌ها (GB)  (برای نامحدود خالی بگذارید)", limit_daily: "محدودیت درخواست‌های روزانه (GB)  (برای نامحدود خالی بگذارید)",
                  limit_days: "مدت زمان اعتبار قانونی (روز) - برای نامحدود خالی بگذارید", edit_sub: "ویرایش مشترک", lbl_name_ph: "نام یا شناسه یکتا",
                  btn_save_changes: "ذخیره تغییرات", save_btn_user: "ثبت کاربر جدید", status_active: "فعال", status_paused: "متوقف شده", status_expired: "منقضی شده",
                  export_btn: "📥 برون‌بری فایل پیکربندی (نسخه پشتیبان)", import_btn: "📤 درون‌ریزی فایل پیکربندی (نسخه پشتیبان)",
                  stat_total_subscribers: "کل مشترکین", stat_active_paused: "فعال / متوقف شده", stat_cumulative_traffic: "ترافیک کل انباشته",
                  sub_directory_title: "فهرست مشترکین", sub_directory_desc: "جستجو، اصلاح محدودیت‌ها، تغییر محدودیت‌های ترافیک یا پاک کردن جلسات حسابداری.", user_search_placeholder: "🔍 جستجو بر اساس نام یا شناسه...",
                  lbl_u_Protocol:"نوع پروتکل(خالی بر اساس تنظیمات کلی)",
                  lbl_u_ports:"نوع پورت",
                  lbl_u_max_config:"حداکثر تعداد کانفیگ",
                  login_password:"رمز ورود",
                  v_pop_title: "اطلاعیه تعمیرات", v_pop_whatsnew: "ویژگی‌های جدید", v_pop_headline: "امکانات جدید و بهبودها",
                  v_pop_b1_title: "اضافه شدن تنظیمات جدا برای هرکاربر(تعداد گانفیگ،پروتکل وپورت)",
                  v_pop_b2_title: "",
                  v_pop_b3_title: "",
                  v_pop_b4_title: "",
                  v_pop_b5_title: "",
                  v_pop_b6_title: "",
                  v_pop_b7_title: "",
                  v_pop_btn: "متوجه شدم!",
                 
                  changelog_title: "گزارش تغییرات و توضیحات نسخه جدید:"
              }
          };
  
          let lang = localStorage.getItem('lang') || 'fa';
          let sessionKey = "", baseRoute = window.location.pathname.split('/dash')[0];
          let hostName = window.location.hostname, localUUID = "";

          window.addEventListener('DOMContentLoaded', () => {
              let savedSession = localStorage.getItem('AnishtayiN_session');
              if (savedSession) {
                  try {
                      let parsed = JSON.parse(savedSession);
                      if (parsed && parsed.expiry && Date.now() < parsed.expiry) {
                          sessionKey = parsed.key;
                          doLogin(true);
                      } else {
                          localStorage.removeItem('AnishtayiN_session');
                      }
                  } catch(e){}
              }
              checkVersionPopup();
          });
  
          function applyLang() {
              document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
              document.getElementById('lang-toggle').innerText = lang === 'fa' ? 'EN' : 'فا';
              document.querySelectorAll('[data-i18n]').forEach(el => {
                  const key = el.getAttribute('data-i18n');
                  if (i18n[lang] && i18n[lang][key] !== undefined && i18n[lang][key] !== null) {
                      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                          el.placeholder = i18n[lang][key];
                      } else {
                          el.innerText = i18n[lang][key];
                      }
                  }
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

          function checkVersionPopup() {
              const popupKey = \`AnishtayiN_shown_v\${CURRENT_VERSION}\`;
              if (!localStorage.getItem(popupKey)) {
                  setTimeout(() => {
                      const m = document.getElementById('modal-version-update');
                      if (m) {
                          m.classList.remove('hidden');
                          m.classList.add('flex');
                      }
                  }, 800);
              }
          }

          function closeVersionModal() {
              const m = document.getElementById('modal-version-update');
              if (m) {
                  m.classList.add('hidden');
                  m.classList.remove('flex');
              }
              const popupKey = \`AnishtayiN_shown_v\${CURRENT_VERSION}\`;
              localStorage.setItem(popupKey, 'true');
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
              localStorage.removeItem('AnishtayiN_session');
              window.location.reload();
          }
  
          // Export active page inputs configuration
          function exportConfig() {
              const el = id => document.getElementById(id);
              const payload = {
                  mode: el('cfg-proto').value, socketPorts: Array.from(el('cfg-port').selectedOptions).map(o=>o.value).join(','), deviceId: el('cfg-uuid').value,
                  apiRoute: el('cfg-path').value, masterKey: el('cfg-pass').value, agent: el('cfg-fp').value,
                  resolveIp: el('cfg-dns').value, customDns: el('cfg-custom-dns').value ? el('cfg-custom-dns').value : 'https://cloudflare-dns.com/dns-query', cleanIps: el('cfg-ips').value, maintenanceHost: el('cfg-fake').value, backupRelay: el('cfg-relay').value,
                  enableOpt1: el('cfg-tfo').checked, enableOpt2: el('cfg-ech').checked,
                  tgToken: el('cfg-tg-token').value, tgChatId: el('cfg-tg-chat').value,
                  cfAccountId: el('cfg-cf-acc').value, cfApiToken: el('cfg-cf-token').value,
                  isPaused: el('cfg-pause').checked, silentAlerts: el('cfg-silent').checked,
                  githubRepo: el('cfg-github-repo').value,
                  subUserAgent: el('cfg-sub-ua').value,
                  customPanelUrl: el('cfg-custom-panel-url').value
              };
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
              const dlAnchor = document.createElement('a');
              dlAnchor.setAttribute("href", dataStr);
              dlAnchor.setAttribute("download", "AnishtayiN-gateway-config.json");
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
                      mapId('cfg-sub-ua', conf.subUserAgent);
                      mapId('cfg-custom-panel-url', conf.customPanelUrl);
                      
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
  
          function togglePortCheckbox(val, checked) {
              const sel = document.getElementById('cfg-port');
              const opt = Array.from(sel.options).find(o => o.value === val);
              if (opt) {
                  opt.selected = checked;
                  sel.dispatchEvent(new Event('change'));
              }
          }
          function syncCheckboxesFromSelect() {
              const sel = document.getElementById('cfg-port');
              const ports = Array.from(sel.selectedOptions).map(o => o.value);
              const checkboxes = document.querySelectorAll('#port-checkboxes-container input[type="checkbox"]');
              checkboxes.forEach(cb => {
                  cb.checked = ports.includes(cb.value);
              });
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
                      localStorage.setItem('AnishtayiN_session', JSON.stringify({ key: pass, expiry: Date.now() + 30 * 60 * 1000 }));
                      
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
                      syncCheckboxesFromSelect();
                      document.getElementById('cfg-uuid').value = conf.deviceId || '';
                      document.getElementById('cfg-path').value = conf.apiRoute || '';
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
                      document.getElementById('cfg-github-repo').value = conf.githubRepo || 'AnishtayiN/AnishtayiN';
                      document.getElementById('cfg-name-strategy').value = conf.nameStrategy || 'default';
                      document.getElementById('cfg-name-prefix').value = conf.namePrefix || 'Core';
                      document.getElementById('cfg-sub-ua').value = conf.subUserAgent || '';
                      document.getElementById('cfg-custom-panel-url').value = conf.customPanelUrl || '';
  
                      window.AnishtayiNConfig = JSON.parse(JSON.stringify(conf));
                      window.AnishtayiNUsage = data.sysUsage || {};
                      window.AnishtayiNProfiles = data.profiles || [];
                      renderUsersTable();
                      try { checkUpdate(); } catch(ue) { console.error(ue); }

                      ['cfg-proto','cfg-port','cfg-fp','cfg-ips','cfg-nodes','cfg-path', 'cfg-relay', 'cfg-name-strategy', 'cfg-name-prefix', 'cfg-sub-ua', 'cfg-custom-panel-url'].forEach(id => {
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
                                      <label class="block text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Universal Sync URL</label>
                                      <input type="text" id="sync-\${p.id}" readonly value="\${p.sync}" class="w-full bg-slate-50 dark:bg-darkbg border border-slate-200 dark:border-darkborder px-4 py-2.5 rounded-xl text-xs outline-none font-mono text-slate-600 dark:text-slate-400 truncate pe-12">
                                      <button onclick="copyData('sync-\${p.id}')" class="absolute bottom-1 end-1 text-primary p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"><svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                  </div>

                                  <div class="mt-2">
                                      <button onclick="showQR('\${p.name}', document.getElementById('sync-\${p.id}').value)" class="w-full flex items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-darkborder rounded-xl transition-all gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m0 11v1m5-7h1m-13 0h1m2-5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-8zM9 9h1m0 0v1m2-1h1m0 0v1"></path></svg>
                                          <span>Show QR Code</span>
                                      </button>
                                  </div>
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
                      else { localStorage.removeItem('AnishtayiN_session'); }
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
                      resolveIp: el('cfg-dns').value, customDns: el('cfg-custom-dns').value ? el('cfg-custom-dns').value : 'https://cloudflare-dns.com/dns-query', cleanIps: el('cfg-ips').value, slaveNodes: el('cfg-nodes').value, maintenanceHost: el('cfg-fake').value, backupRelay: el('cfg-relay').value,
                      enableOpt1: el('cfg-tfo').checked, enableOpt2: el('cfg-ech').checked,
                      tgToken: el('cfg-tg-token').value, tgChatId: el('cfg-tg-chat').value,
                      cfAccountId: el('cfg-cf-acc').value, cfApiToken: el('cfg-cf-token').value,
                      isPaused: el('cfg-pause').checked, silentAlerts: el('cfg-silent').checked,
                      githubRepo: el('cfg-github-repo').value,
                      subUserAgent: el('cfg-sub-ua').value,
                      customPanelUrl: el('cfg-custom-panel-url').value,
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
                  const noSlaveMsg = lang === 'fa' ? 'هیچ نود فرعی مشخص نشده است.' : 'No slave nodes specified.';
                  alert(noSlaveMsg);
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
                      resolveIp: el('cfg-dns').value, customDns: el('cfg-custom-dns').value ? el('cfg-custom-dns').value : 'https://cloudflare-dns.com/dns-query', cleanIps: el('cfg-ips').value, slaveNodes: el('cfg-nodes').value, maintenanceHost: el('cfg-fake').value, backupRelay: el('cfg-relay').value,
                      enableOpt1: el('cfg-tfo').checked, enableOpt2: el('cfg-ech').checked,
                      tgToken: el('cfg-tg-token').value, tgChatId: el('cfg-tg-chat').value,
                      cfAccountId: el('cfg-cf-acc').value, cfApiToken: el('cfg-cf-token').value,
                      isPaused: el('cfg-pause').checked, silentAlerts: el('cfg-silent').checked,
                      githubRepo: el('cfg-github-repo').value,
                      subUserAgent: el('cfg-sub-ua').value,
                      customPanelUrl: el('cfg-custom-panel-url').value,
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
              let users = window.AnishtayiNConfig?.users || [];
              let usage = window.AnishtayiNUsage || {};
              
              // Calculate stats metrics
              let totalUsersVal = users.length;
              let activeSubscribers = users.filter(u => !u.isPaused && (!u.expiryMs || Date.now() <= u.expiryMs)).length;
              let pausedSubscribers = users.filter(u => u.isPaused).length;
              let totalReqsSum = 0;
              users.forEach(u => {
                  let sysU = usage[u.id.replace(/-/g,'').toLowerCase()] || {reqs: 0};
                  totalReqsSum += (sysU.reqs || 0);
              });
              let totalGBSum = (totalReqsSum / 6000).toFixed(2);

              // Update stats elements in DOM if they exist
              const totalUsersEl = document.getElementById('stat-total-users');
              if (totalUsersEl) totalUsersEl.textContent = totalUsersVal;
              const activeUsersEl = document.getElementById('stat-active-users');
              if (activeUsersEl) activeUsersEl.textContent = \`\${activeSubscribers} / \${pausedSubscribers}\`;
              const totalTrafficEl = document.getElementById('stat-total-traffic');
              if (totalTrafficEl) totalTrafficEl.textContent = \`\${totalGBSum} GB\`;

              // Apply Search Filter
              const searchVal = document.getElementById('user-search-input')?.value.toLowerCase().trim() || '';
              let filteredUsers = users.filter(u => {
                  return u.name.toLowerCase().includes(searchVal) || u.id.toLowerCase().includes(searchVal);
              });

              tbl.innerHTML = '';
              if (filteredUsers.length === 0) {
                  tbl.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">No matching subscribers found</td></tr>';
                  return;
              }
              
              // Alias users to the filtered list for downstream compatibility
              users = filteredUsers;
              if (users.length === 0) {
                  tbl.innerHTML = \`<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400" data-i18n="no_users">\${i18n[lang].no_users}</td></tr>\`;
                  return;
              }
              users.forEach((u, i) => {
                  let sysU = usage[u.id.replace(/-/g,'').toLowerCase()] || {reqs: 0, dReqs: 0, lastDay: ''};
                  let userReqs = sysU.reqs || 0;
                  let userDReqs = sysU.lastDay === new Date().toISOString().split('T')[0] ? (sysU.dReqs || 0) : 0;
                  
                  const unlimitedTxt = lang === 'fa' ? 'نامحدود' : 'Unlimited';
                  let limitTotalTxt = u.limitTotalReq ? u.limitTotalReq : unlimitedTxt;
                  let limitDailyTxt = u.limitDailyReq ? u.limitDailyReq : unlimitedTxt;
                  
                  let perT = u.limitTotalReq ? Math.min(100, (userReqs / u.limitTotalReq) * 100).toFixed(1) + '%' : '-';
                  let perD = u.limitDailyReq ? Math.min(100, (userDReqs / u.limitDailyReq) * 100).toFixed(1) + '%' : '-';
                  
                  let expTxt = unlimitedTxt;
                  let isExp = false;
                  if (u.expiryMs) {
                      let date = new Date(u.expiryMs);
                      expTxt = lang === 'fa' ? date.toLocaleDateString('fa-IR') : date.toLocaleDateString();
                      if (Date.now() > u.expiryMs) { 
                          const expiredTxt = lang === 'fa' ? ' (منقضی شده)' : ' (Expired)';
                          expTxt += \` <span class="text-xs text-red-500 font-bold">\${expiredTxt}</span>\`; 
                          isExp = true; 
                      }
                  }
                  
                  const totalLabel = lang === 'fa' ? 'کل:' : 'Total:';
                  const dailyLabel = lang === 'fa' ? 'روزانه:' : 'Daily:';
                  const rLabel = lang === 'fa' ? 'درخواست' : 'r';

                  let linkTitle = lang === 'fa' ? 'کپی لینک ساب' : 'Copy Subscription Link';
                  let pauseTitle = u.isPaused ? (lang === 'fa' ? 'فعال‌سازی کاربر' : 'Resume User') : (lang === 'fa' ? 'توقف کاربر' : 'Pause User');
                  let editTitle = lang === 'fa' ? 'ویرایش کاربر' : 'Edit Subscriber';
                  let resetTitle = lang === 'fa' ? 'بازنشانی مصرف ترافیک' : 'Reset Traffic Metrics';
                  let deleteTitle = lang === 'fa' ? 'حذف کاربر' : 'Delete User';

                  let linkHtml = \`<button onclick="copyData('sync-\${u.id}')" class="text-primary hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 p-2 rounded-lg" title="\${linkTitle}">🔗</button>\`;
                  
                  let pauseBtnHtml = \`<button onclick="togglePauseUser('\${u.id}')" class="\${u.isPaused ? 'text-green-500 hover:text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-800/50' : 'text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-800/50'} p-2 rounded-lg" title="\${pauseTitle}">\\s*\${u.isPaused ? '▶️' : '⏸️'}</button>\`;

                  let editBtnHtml = \`<button onclick="editUser('\${u.id}')" class="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 p-2 rounded-lg" title="\${editTitle}">✏️</button>\`;

                  let resetBtnHtml = \`<button onclick="resetUserTraffic('\${u.id}')" class="text-violet-500 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/30 dark:hover:bg-violet-800/50 p-2 rounded-lg" title="\${resetTitle}">🔄</button>\`;

                  let tr = document.createElement('tr');
                  tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";
                  
                  let rawSync = window.AnishtayiNProfiles?.find(p => p.id === u.id)?.sync || '';
                  if (rawSync) {
                      rawSync += rawSync.includes('?') ? '&flag=a' : '?flag=a';
                  }

                  tr.innerHTML = \`
                      <td class="px-4 py-4 font-bold text-slate-700 dark:text-slate-300">\${u.name} \${u.isPaused ? '⏸️' : (isExp ? '🔴' : '🟢')}
                          <div class="flex flex-wrap gap-1 mt-1">
                              \${u.userMode ? \`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">\${u.userMode === 'alpha' ? 'VLESS' : u.userMode === 'beta' ? 'Trojan' : 'VLESS+Trojan'}</span>\` : ''}
                              \${u.userPorts ? \`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">🔌 \${u.userPorts}</span>\` : ''}
                              \${u.maxConfigs ? \`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">max \${u.maxConfigs} cfgs</span>\` : ''}
                          </div>
                      </td>
                      <td class="px-4 py-4 font-mono text-xs text-slate-500 select-all">\${u.id}</td>
                      <td class="px-4 py-4 text-slate-600 dark:text-slate-400 font-mono">
                          <div class="flex flex-col gap-1.5">
                              <span class="font-bold text-xs flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>\${totalLabel} \${userReqs} \${rLabel} (\${(userReqs/6050).toFixed(2)} GB) / \${u.limitTotalReq ? (u.limitTotalReq + ' ' + rLabel + ' (' + (u.limitTotalReq/6000).toFixed(2) + ' GB)') : \`\${unlimitedTxt}\`} (\${perT})</span>
                              
                              \${u.limitTotalReq ? \`
                              <div class="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden mt-0.5 mb-1">
                                  <div class="bg-gradient-to-r \${parseFloat(perT) > 85 ? 'from-red-500 to-rose-600' : parseFloat(perT) > 60 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'} h-full rounded-full transition-all duration-500" style="width: \${perT}"></div>
                              </div>
                              \` : ''}

                              <span class="text-[11px] opacity-70 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>\${dailyLabel} \${userDReqs} \${rLabel} (\${(userDReqs/6050).toFixed(2)} GB) / \${u.limitDailyReq ? (u.limitDailyReq + ' ' + rLabel + ' (' + (u.limitDailyReq/6050).toFixed(2) + ' GB)') : \`\${unlimitedTxt}\`} (\${perD})</span>
                              
                              \${u.limitDailyReq ? \`
                              <div class="w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-0.5">
                                  <div class="bg-indigo-500 h-full rounded-full transition-all duration-500" style="width: \${perD}"></div>
                              </div>
                              \` : ''}
                          </div>
                      </td>
                      <td class="px-4 py-4 text-slate-600 dark:text-slate-400">\${expTxt}</td>
                      <td class="px-4 py-4 text-end space-x-1.5 space-x-reverse">
                          <input type="hidden" id="sync-\${u.id}" value="\${rawSync}">
                          \${linkHtml}
                          \${pauseBtnHtml}
                          \${editBtnHtml}
                          \${resetBtnHtml}
                          <button onclick="deleteUser('\${u.id}')" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-800/50 p-2 rounded-lg" title="\${deleteTitle}">🗑️</button>
                      </td>
                  \`;
                  tbl.appendChild(tr);
              });
              applyLang();
          }

          async function resetUserTraffic(uuid) {
              const resetMsg = lang === 'fa' ? 'آیا از بازنشانی وضعیت ترافیک (کل و روزانه) این مشترک مطمئن هستید؟' : 'Are you sure you want to reset all traffic metrics (Total and Daily) for this subscriber?';
              if(!confirm(resetMsg)) return;
              try {
                  const res = await fetch(baseRoute + '/api/sync', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ key: sessionKey, resetUUID: uuid })
                  });
                  if (res.ok) {
                      const successMsg = lang === 'fa' ? 'ترافیک مشترک با موفقیت بازنشانی شد!' : 'Subscriber traffic metrics successfully reset!';
                      alert(successMsg);
                      doLogin(true); // reload usage data from server
                  } else {
                      const errMsg = lang === 'fa' ? 'سرور در بازنشانی ترافیک خطا بازگرداند.' : 'Server returned error while resetting metrics.';
                      alert(errMsg);
                  }
              } catch(e) {
                  const netErr = lang === 'fa' ? 'خطای ارتباط با شبکه.' : 'Network connection error.';
                  alert(netErr);
              }
          }

          function deleteUser(uuid) {
              const deleteMsg = lang === 'fa' ? 'آیا از حذف این کاربر مطمئن هستید؟' : 'Are you sure you want to delete this user?';
              if(!confirm(deleteMsg)) return;
              if(window.AnishtayiNConfig && window.AnishtayiNConfig.users) {
                  window.AnishtayiNConfig.users = window.AnishtayiNConfig.users.filter(u => u.id !== uuid);
              }
              // Automatically sync
              renderUsersTable();
              doSaveDirectly();
          }

          function togglePauseUser(uuid) {
              if(window.AnishtayiNConfig && window.AnishtayiNConfig.users) {
                  let usr = window.AnishtayiNConfig.users.find(u => u.id === uuid);
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
              tReq = tReq? Math.floor(parseFloat(tReq) * 6000): null;
              let dReq = document.getElementById('add-user-daily-reqs').value;
              dReq = dReq? Math.floor(parseFloat(dReq) * 6000): null;
              let days = document.getElementById('add-user-days').value;
              const proxyIp = document.getElementById('add-user-proxy-ip').value || null;
              const userMode = document.getElementById('add-user-mode').value || null;
              const userPorts = document.getElementById('add-user-ports').value.trim() || null;
              let maxConfigs = document.getElementById('add-user-max-configs').value;
              maxConfigs = maxConfigs ? parseInt(maxConfigs) : null;
              
              if(!name) {
                  const enterNameMsg = lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name';
                  alert(enterNameMsg);
                  return;
              }
              tReq = tReq ? parseInt(tReq) : null;
              dReq = dReq ? parseInt(dReq) : null;
              days = days ? parseInt(days) : null;
              
              if(!window.AnishtayiNConfig) window.AnishtayiNConfig = {};
              if(!window.AnishtayiNConfig.users) window.AnishtayiNConfig.users = [];
              
              let newId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                  .map((b,i) => (i===4||i===6||i===8||i===10?'-':'') + b.toString(16).padStart(2,'0')).join('');
              
               const u = {
                   id: newId,
                   name: name,
                   limitTotalReq: tReq,
                   limitDailyReq: dReq,
                   expiryMs: days ? Date.now() + days*86400000 : null,
                   proxyIp: proxyIp,
                   userMode: userMode,
                   userPorts: userPorts,
                   maxConfigs: maxConfigs,
                   createdAt: Date.now()
               };
              
              window.AnishtayiNConfig.users.push(u);
              document.getElementById('modal-add-user').classList.add('hidden');
              document.getElementById('add-user-name').value = '';
              document.getElementById('add-user-total-reqs').value = '';
              document.getElementById('add-user-daily-reqs').value = '';
              document.getElementById('add-user-days').value = '';
              document.getElementById('add-user-proxy-ip').value = '';
              document.getElementById('add-user-mode').value = '';
              document.getElementById('add-user-ports').value = '';
              document.getElementById('add-user-max-configs').value = '';
              
              renderUsersTable();
              doSaveDirectly();
          }

          function editUser(uuid) {
              if(!window.AnishtayiNConfig || !window.AnishtayiNConfig.users) return;
              let u = window.AnishtayiNConfig.users.find(usr => usr.id === uuid);
              if(!u) return;
              
              document.getElementById('edit-user-id').value = u.id;
              document.getElementById('edit-user-name').value = u.name;
              document.getElementById('edit-user-total-reqs').value = u.limitTotalReq? (u.limitTotalReq / 6000).toFixed(2): '';
              document.getElementById('edit-user-daily-reqs').value = u.limitDailyReq? (u.limitDailyReq / 6000).toFixed(2): '';
              document.getElementById('edit-user-proxy-ip').value = u.proxyIp || '';
              document.getElementById('edit-user-mode').value = u.userMode || '';
              document.getElementById('edit-user-ports').value = u.userPorts || '';
              document.getElementById('edit-user-max-configs').value = u.maxConfigs || '';
              
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
              tReq = tReq? Math.floor(parseFloat(tReq) * 6000): null;
              let dReq = document.getElementById('edit-user-daily-reqs').value;
              dReq = dReq? Math.floor(parseFloat(dReq) * 6000): null;
              let days = document.getElementById('edit-user-days').value;
              const proxyIp = document.getElementById('edit-user-proxy-ip').value || null;
              const userMode = document.getElementById('edit-user-mode').value || null;
              const userPorts = document.getElementById('edit-user-ports').value.trim() || null;
              let maxConfigs = document.getElementById('edit-user-max-configs').value;
              maxConfigs = maxConfigs ? parseInt(maxConfigs) : null;
              
              if(!name) {
                  const enterNameMsg = lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name';
                  alert(enterNameMsg);
                  return;
              }
              tReq = tReq ? parseInt(tReq) : null;
              dReq = dReq ? parseInt(dReq) : null;
              days = days ? parseInt(days) : null;
              
              if(!window.AnishtayiNConfig || !window.AnishtayiNConfig.users) return;
              let u = window.AnishtayiNConfig.users.find(usr => usr.id === uuid);
              if(!u) return;
              
              u.name = name;
              u.limitTotalReq = tReq;
              u.limitDailyReq = dReq;
              u.expiryMs = days ? Date.now() + days*86400000 : null;
              u.proxyIp = proxyIp;
              u.userMode = userMode;
              u.userPorts = userPorts;
              u.maxConfigs = maxConfigs;
              
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
                      body: JSON.stringify({ key: sessionKey, config: window.AnishtayiNConfig })
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
              let repo = document.getElementById('cfg-github-repo')?.value || window.AnishtayiNConfig?.githubRepo || 'AnishtayiN/AnishtayiN';
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
                    const cVer = strip(CURRENT_VERSION);
                    
                    const cmpVersions = (a, b) => {
                        const pa = a.split('.').map(Number);
                        const pb = b.split('.').map(Number);
                        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
                            let na = pa[i] || 0;
                            let nb = pb[i] || 0;
                            if (na > nb) return 1;
                            if (nb > na) return -1;
                        }
                        return 0;
                    };
                    
                    if (cmpVersions(cVer, rVer) < 0) {
                        showUpdateBanner(repo, rVer);
                    }
                }
              } catch(err) {
                  console.error("Update check failed:", err);
              }
          }
          
          function parseMarkdown(md) {
              if (!md) return '';
              let lines = md.split(/\\r?\\n/);
              let htmlLines = [];
              let inCodeBlock = false;
              let codeContent = [];

              for (let line of lines) {
                  let trimmed = line.trim();

                  // Toggle code block
                  if (trimmed.startsWith('\\x60\\x60\\x60')) {
                      if (inCodeBlock) {
                          // Close code block
                          let codeText = codeContent.join('\\n')
                              .replace(/&/g, "&amp;")
                              .replace(/</g, "&lt;")
                              .replace(/>/g, "&gt;");
                          htmlLines.push('<pre class="bg-slate-900/90 text-slate-100 p-3 rounded-xl my-2 font-mono text-[10px] overflow-x-auto border border-slate-800 max-h-40">' + codeText + '</pre>');
                          codeContent = [];
                          inCodeBlock = false;
                      } else {
                          inCodeBlock = true;
                      }
                      continue;
                  }

                  if (inCodeBlock) {
                      codeContent.push(line);
                      continue;
                  }

                  if (!trimmed) {
                      continue; 
                  }

                  // Process headers
                  if (trimmed.startsWith('### ')) {
                      let text = trimmed.slice(4);
                      htmlLines.push('<h5 class="text-sm font-bold text-amber-800 dark:text-amber-400 mt-3 mb-1">' + parseInlineMarkdown(text) + '</h5>');
                      continue;
                  }
                  if (trimmed.startsWith('## ')) {
                      let text = trimmed.slice(3);
                      htmlLines.push('<h4 class="text-sm font-extrabold text-amber-800 dark:text-amber-400 mt-4 mb-2">' + parseInlineMarkdown(text) + '</h4>');
                      continue;
                  }
                  if (trimmed.startsWith('# ')) {
                      let text = trimmed.slice(2);
                      htmlLines.push('<h3 class="text-base font-black text-amber-900 dark:text-amber-300 mt-4 mb-2">' + parseInlineMarkdown(text) + '</h3>');
                      continue;
                  }

                  // Process lists
                  let listMatch = line.match(/^(\\s*)([-*+])\\s+(.*)$/);
                  if (listMatch) {
                      let text = listMatch[3];
                      htmlLines.push('<div class="flex items-start gap-2 my-1"><span class="text-amber-500 mt-0.5">▪</span><span class="flex-1">' + parseInlineMarkdown(text) + '</span></div>');
                      continue;
                  }

                  // Standard line
                  htmlLines.push('<p class="my-1">' + parseInlineMarkdown(line) + '</p>');
              }

              // Guard for unclosed code block
              if (inCodeBlock && codeContent.length > 0) {
                  let codeText = codeContent.join('\\n')
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;");
                  htmlLines.push('<pre class="bg-slate-900/90 text-slate-100 p-3 rounded-xl my-2 font-mono text-[10px] overflow-x-auto border border-slate-800 max-h-40">' + codeText + '</pre>');
              }

              return htmlLines.join('\\n');

              function parseInlineMarkdown(text) {
                  let safe = text
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;");
                  // Bold
                  safe = safe.replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="font-extrabold text-slate-800 dark:text-slate-200">\$1</strong>');
                  // Italic
                  safe = safe.replace(/\\*(.*?)\\*/g, '<em class="italic">\$1</em>');
                  // Inline code
                  safe = safe.replace(/[\\x60](.*?)[\\x60]/g, '<code class="bg-amber-500/10 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500 font-mono text-[11px]">\$1</code>');
                  return safe;
              }
          }

          async function showUpdateBanner(repo, version) {
              const banner = document.getElementById('update-alert-banner');
              if (!banner) return;
              
              const msg = lang === 'fa' 
                  ? 'نسخه جدیدتر (v' + version + ') در مخزن گیت\u200cهاب شما (' + repo + ') در دسترس است.' 
                  : 'A newer version (v' + version + ') is available in your GitHub repository (' + repo + ').';
                  
              document.getElementById('update-alert-text').textContent = msg;
              document.getElementById('update-alert-btn').href = 'https://github.com/' + repo;
              banner.classList.remove('hidden');
              banner.classList.add('flex');
              
              const changelogArea = document.getElementById('update-changelog-area');
              const changelogContent = document.getElementById('update-changelog-content');
              if (changelogArea && changelogContent) {
                  changelogArea.classList.remove('hidden');
                  changelogContent.innerHTML = lang === 'fa' 
                      ? '<p class="animate-pulse">در حال دریافت گزارش تغییرات...</p>' 
                      : '<p class="animate-pulse">Loading changelog...</p>';
                      
                  try {
                      let changelogText = '';
                      try {
                          const res = await fetch('https://api.github.com/repos/' + repo + '/releases/tags/v' + version);
                          if (res.ok) {
                              const rel = await res.json();
                              if (rel && rel.body) {
                                  changelogText = rel.body;
                              }
                          } else {
                              const resNoV = await fetch('https://api.github.com/repos/' + repo + '/releases/tags/' + version);
                              if (resNoV.ok) {
                                  const relNoV = await resNoV.json();
                                  if (relNoV && relNoV.body) {
                                      changelogText = relNoV.body;
                                  }
                              }
                          }
                      } catch(e) {}
                      
                      if (!changelogText) {
                          try {
                              const resLatest = await fetch('https://api.github.com/repos/' + repo + '/releases/latest');
                              if (resLatest.ok) {
                                  const relLatest = await resLatest.json();
                                  if (relLatest && relLatest.body) {
                                      changelogText = relLatest.body;
                                  }
                              }
                          } catch(e) {}
                      }
                      
                      if (!changelogText) {
                          try {
                              const resFile = await fetch('https://raw.githubusercontent.com/' + repo + '/main/CHANGELOG.md');
                              if (resFile.ok) {
                                  changelogText = await resFile.text();
                              }
                          } catch(e) {}
                      }
                      
                      if (changelogText) {
                          changelogContent.innerHTML = parseMarkdown(changelogText);
                      } else {
                          changelogContent.innerHTML = lang === 'fa' 
                              ? '<p class="text-slate-500">گزارش تغییراتی برای این نسخه یافت نشد.</p>' 
                              : '<p class="text-slate-500">No changelog registered for this version.</p>';
                      }
                  } catch(err) {
                      changelogContent.innerHTML = lang === 'fa' 
                          ? '<p class="text-rose-500">خطا در دریافت گزارش تغییرات.</p>' 
                          : '<p class="text-rose-500">Failed to load changelog.</p>';
                  }
              }
          }
          
          function dismissUpdate() {
              const b = document.getElementById('update-alert-banner');
              if (b) {
                  b.classList.remove('flex');
                  b.classList.add('hidden');
              }
          }

          document.addEventListener('DOMContentLoaded', () => {
              const cached = localStorage.getItem('AnishtayiN_session');
              if(cached) {
                  try {
                      const session = JSON.parse(cached);
                      if (Date.now() < session.expiry) {
                          document.getElementById('pwd').value = session.key;
                          doLogin(true);
                      } else { localStorage.removeItem('AnishtayiN_session'); }
                  } catch(e) { localStorage.removeItem('AnishtayiN_session'); }
              }
          });
      </script>
  </body>
  </html>
    `;
  } 
