/**
 * Project Nahan (نهان) - Modular Cloudflare Worker Edge Gateway
 * https://github.com/itsyebekhe/nahan
 */

import { connect } from "cloudflare:sockets";
import { CURRENT_VERSION, getAlpha, getBeta, getGamma } from "./core/constants.js";
import {
    sysConfig, isolateStartTime, setIsolateStartTime,
    incInflightHttp, decInflightHttp,
    configRegistry, trojanHashCache, lastRelaySweep, setLastRelaySweep,
    activeDeviceId, setActiveDeviceId, sysUsageCache, breakerLevel
} from "./core/state.js";
import { safeBtoa, fetchT, cmpVersions, deployWorkerToCloudflare, usageTotalBytes, usageDailyBytes, limitReqToBytes, sleepMs } from "./core/utils.js";
import { loadSysConfig, serveMaintenancePage } from "./core/config.js";
import { isAuthorized, wsRateCheck } from "./core/auth.js";
import { generateHardwareId } from "./protocols/trojan.js";
import { processTelemetryStream } from "./protocols/stream.js";
import { probeDeadRelays, probeGraveyard } from "./relays/health.js";
import { handleAuth } from "./api/auth.js";
import { handleLogs, logActivity } from "./api/logs.js";
import { handleUsersApi, getSubscriptionStats } from "./api/users.js";
import { handleStatsApi } from "./api/stats.js";
import { handleUpdateApi } from "./api/update.js";
import { handleApiKeys } from "./api/keys.js";
import { handleConfigSync, handleSyncPanel } from "./api/sync.js";
import { handleTelegramWebhook } from "./api/telegram.js";
import { buildUriProfile, buildYamlProfile, buildClashJsonProfile, buildSingBoxJsonProfile, buildVJsonProfile } from "./converters/sub.js";

export default {
async fetch(request, env, ctx) {
        try {
            if (!isolateStartTime) setIsolateStartTime(Date.now());
            try {
                incInflightHttp();
            } catch (e) {}
            // NOTE: INFLIGHT_HTTP is decremented in the fetch finally block
            // at the end of this handler, never here: decrementing it in a
            // microtask right after increment made the breaker permanently
            // blind (always ~0) so load shedding never engaged.
            if (configRegistry.size > 10000) { configRegistry.clear(); trojanHashCache.clear(); }
            await loadSysConfig(env, ctx);
            // Background self-healing sweep (throttled): dead-relay probes
            // + graveyard re-probes run in waitUntil, never blocking responses.
            try {
                const nowRs = Date.now();
                if (nowRs - lastRelaySweep > 60000) {
                    setLastRelaySweep(nowRs);
                    if (ctx && typeof ctx.waitUntil === "function") {
                        ctx.waitUntil(
                            (async () => {
                                try {
                                    await probeDeadRelays(env);
                                } catch (e) {}
                                try {
                                    await probeGraveyard(env);
                                } catch (e) {}
                            })(),
                        );
                    }
                }
            } catch (e) {}
            setActiveDeviceId(sysConfig.deviceId || generateHardwareId(sysConfig.apiRoute));

            const url = new URL(request.url);
            const upgradeHeader = request.headers.get("Upgrade");
            const isTelemetryStream =
                upgradeHeader && upgradeHeader.toLowerCase() === "websocket";

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
                optimiser: `/${encodeURI(sysConfig.apiRoute)}/optimiser`,
            };

            const isSyncRoute = reqPath.endsWith("/api/sync");
            const isUsersRoute =
                reqPath === routes.users || reqPath.endsWith("/api/users");
            const isStatsRoute =
                reqPath === routes.stats || reqPath.endsWith("/api/stats");
            const isUpdateRoute =
                reqPath === routes.update || reqPath.endsWith("/api/update");
            const isApiKeysRoute =
                reqPath === routes.apiKeys || reqPath.endsWith("/api/keys");
            const isOptimiserRoute =
                reqPath === routes.optimiser || reqPath === "/cf-optimiser" || reqPath === "/optimiser";
            const isAuthorizedRoute =
                reqPath === routes.data ||
                reqPath === routes.dash ||
                reqPath === routes.auth ||
                reqPath === routes.sync ||
                reqPath === routes.tg ||
                reqPath === routes.syncPanel ||
                reqPath === routes.logs ||
                isSyncRoute ||
                isUsersRoute ||
                isStatsRoute ||
                isUpdateRoute ||
                isApiKeysRoute ||
                isOptimiserRoute;

            if (!isTelemetryStream && !isAuthorizedRoute) {
                return serveMaintenancePage(request, url);
            }

            // Maintenance mode (sysConfig.maintenanceMode): admin APIs stay
            // open, already-open tunnels are unaffected (they are upgraded),
            // but new tunnels and sub refreshes get a polite 503.
            // Toggle by POSTing {"key":...,"config":{"maintenanceMode":true}}
            // to /<apiRoute>/api/sync (merged, survives dashboard syncs).
            if (
                sysConfig.maintenanceMode &&
                (isTelemetryStream || reqPath === routes.data)
            ) {
                if (isTelemetryStream)
                    return new Response(null, { status: 503 });
                return new Response(
                    "Maintenance in progress, retry later",
                    {
                        status: 503,
                        headers: { "Retry-After": "120" },
                    },
                );
            }

            if (!isTelemetryStream) {
                if (reqPath === routes.dash) {
                    const dashboardUrl = env.DASHBOARD_URL || 'https://raw.githubusercontent.com/itsyebekhe/nahan/main/dashboard.html';
                    try {
                        const resp = await fetchT(dashboardUrl);
                        let html = await resp.text();
                        html = html.replace(/__CURRENT_VERSION__/g, CURRENT_VERSION);
                        if (env.IOT_DB !== undefined) {
                            html = html.replace('__HAS_DB_WARNING__', '');
                        } else {
                            html = html.replace('__HAS_DB_WARNING__', '<div class="mb-5 p-4 rounded-2xl flex items-start gap-3" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);"><span style="color:#f87171;">&#9888;&#65039;</span><span class="text-sm" style="color:#fca5a5;" data-i18n="missing_db">Database not connected. Settings won\'t be saved.</span></div>');
                        }
                        return new Response(html, {
                            headers: { "Content-Type": "text/html;charset=utf-8" },
                        });
                    } catch (e) {
                        return new Response('Failed to load dashboard', { status: 502 });
                    }
                }
                if (isOptimiserRoute) {
                    const optimiserUrl = env.OPTIMISER_URL || 'https://raw.githubusercontent.com/itsyebekhe/nahan/main/cf-optimiser.html';
                    try {
                        const resp = await fetchT(optimiserUrl);
                        let html = await resp.text();
                        return new Response(html, {
                            headers: { "Content-Type": "text/html;charset=utf-8" },
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
                                "Access-Control-Allow-Headers":
                                    "Content-Type, Authorization",
                                "Access-Control-Max-Age": "86400",
                            },
                        });
                    }
                    if (request.method !== "POST")
                        return new Response("405", { status: 405 });
                    const syncRes = await handleConfigSync(request, env, ctx);
                    syncRes.headers.set("Access-Control-Allow-Origin", "*");
                    syncRes.headers.set(
                        "Access-Control-Allow-Headers",
                        "Content-Type, Authorization",
                    );
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
                    return await handleTelegramWebhook(
                        request,
                        env,
                        url.hostname,
                        ctx,
                    );
                }
                if (reqPath === routes.data) {
                    const ua = (
                        request.headers.get("User-Agent") || ""
                    ).toLowerCase();
                    const isCustomUaAllowed =
                        sysConfig.subUserAgent &&
                        sysConfig.subUserAgent.trim().length > 0 &&
                        ua.includes(
                            sysConfig.subUserAgent.trim().toLowerCase(),
                        );
                    const clientHost =
                        request.headers.get("Host") || url.hostname;
                    let targetSub = url.searchParams.get("sub");
                    let hasMultiUser =
                        sysConfig.users && sysConfig.users.length > 0;

                    let targetUser = null;
                    let isValidUser = false;
                    if (hasMultiUser) {
                        if (targetSub) {
                            targetUser = sysConfig.users.find(
                                (u) =>
                                    u.name.toLowerCase() ===
                                        targetSub.toLowerCase() ||
                                    u.id === targetSub,
                            );
                            if (targetUser) isValidUser = true;
                        }
                    } else {
                        isValidUser = true;
                        targetUser = { id: activeDeviceId, name: "Default" };
                    }

                    const acceptHeader = (
                        request.headers.get("Accept") || ""
                    ).toLowerCase();
                    const secFetchDest = (
                        request.headers.get("Sec-Fetch-Dest") || ""
                    ).toLowerCase();

                    const isRealBrowser =
                        (secFetchDest === "document" ||
                            acceptHeader.includes("text/html")) &&
                        (ua.includes("mozilla") ||
                            ua.includes("chrome") ||
                            ua.includes("safari") ||
                            ua.includes("applewebkit") ||
                            ua.includes("gecko") ||
                            ua.includes("opera") ||
                            ua.includes("edge")) &&
                        !ua.includes("cla" + "sh") &&
                        !ua.includes("si" + "ng-box") &&
                        !ua.includes("v" + "2r" + "ay") &&
                        !ua.includes("shadow" + "rocket") &&
                        !ua.includes("quantum" + "ult") &&
                        !ua.includes("surf" + "board") &&
                        !ua.includes("sta" + "sh");

                    if (isRealBrowser && !isCustomUaAllowed) {
                        if (isValidUser) {
                            const subscriptionUrl = env.SUBSCRIPTION_URL || 'https://raw.githubusercontent.com/itsyebekhe/nahan/main/subscription.html';
                            try {
                                const resp = await fetchT(subscriptionUrl);
                                let html = await resp.text();
                                // Compute dynamic values
                                const idClean = targetUser.id.replace(/-/g, '').toLowerCase();
                                const sysU = sysUsageCache?.users?.[idClean] || { reqs: 0, dReqs: 0, lastDay: '' };
                                const totalReqs = sysU.reqs || 0;
                                const todayDate = new Date().toISOString().split('T')[0];
                                const dailyReqs = sysU.lastDay === todayDate ? (sysU.dReqs || 0) : 0;
                                const limitTotal = targetUser.limitTotalReq || 0;
                                const limitDaily = targetUser.limitDailyReq || 0;
                                const totalBytesUsed = usageTotalBytes(sysU);
                                const dailyBytesUsed = usageDailyBytes(sysU, todayDate);
                                const limitTotalBytes = limitReqToBytes(limitTotal);
                                const limitDailyBytes = limitReqToBytes(limitDaily);
                                const totalGb = (totalBytesUsed / 1073741824).toFixed(2);
                                const limitTotalGb = limitTotal ? (limitTotalBytes / 1073741824).toFixed(2) : '9999';
                                const dailyGb = (dailyBytesUsed / 1073741824).toFixed(2);
                                const limitDailyGb = limitDaily ? (limitDailyBytes / 1073741824).toFixed(2) : '9999';
                                const totalPercent = limitTotal ? Math.min(100, (totalBytesUsed / limitTotalBytes) * 100).toFixed(1) : '0';
                                const dailyPercent = limitDaily ? Math.min(100, (dailyBytesUsed / limitDailyBytes) * 100).toFixed(1) : '0';
                                let expiryDateTxt = '2099-01-01';
                                let isExpired = false;
                                if (targetUser.expiryMs) {
                                    expiryDateTxt = new Date(targetUser.expiryMs).toISOString().split('T')[0];
                                    if (Date.now() > targetUser.expiryMs) isExpired = true;
                                }
                                let statusCode = 'active';
                                if (targetUser.isPaused) statusCode = 'paused';
                                else if (isExpired) statusCode = 'expired';
                                else if (limitTotal && totalBytesUsed >= limitTotalBytes) statusCode = 'limit';
                                else if (limitDaily && dailyBytesUsed >= limitDailyBytes) statusCode = 'dailyLimit';
                                let cleanUrl = new URL(url.href);
                                let panelUrlToUse = sysConfig.customPanelUrl;
                                if (targetUser.userPanelUrl && targetUser.userPanelUrl.trim()) panelUrlToUse = targetUser.userPanelUrl.trim();
                                if (panelUrlToUse) {
                                    let customUrlStr = panelUrlToUse;
                                    if (!customUrlStr.startsWith('http://') && !customUrlStr.startsWith('https://')) customUrlStr = 'https://' + customUrlStr;
                                    try { const customUrl = new URL(customUrlStr); cleanUrl.protocol = customUrl.protocol; cleanUrl.host = customUrl.host; } catch(e) {}
                                }
                                cleanUrl.searchParams.delete('flag'); cleanUrl.searchParams.delete('format');
                                cleanUrl.searchParams.delete('type'); cleanUrl.searchParams.delete('output'); cleanUrl.searchParams.delete('raw');
                                const syncNormal = cleanUrl.href;
                                const syncRaw = cleanUrl.href + (cleanUrl.href.includes('?') ? '&flag=a' : '?flag=a');
                                // Total progress bar
                                let totalProgress = '';
                                if (limitTotal) {
                                    totalProgress = `<div class="w-full rounded-full h-1.5 mt-3 overflow-hidden progress-bar-bg"><div class="h-1.5 rounded-full" style="background: var(--accent); width: ${totalPercent}%;"></div></div><p class="text-[10px] text-muted text-right mt-1.5" data-i18n="used">${totalPercent}% Used</p>`;
                                } else {
                                    totalProgress = '<p class="text-[10px] text-muted mt-2" data-i18n="unlimitedPlan">Unlimited Plan</p>';
                                }
                                // Daily progress bar
                                let dailyProgress = '';
                                if (limitDaily) {
                                    dailyProgress = `<div class="w-full rounded-full h-1.5 mt-3 overflow-hidden progress-bar-bg"><div class="h-1.5 rounded-full" style="background: var(--amber-text); width: ${dailyPercent}%;"></div></div><p class="text-[10px] text-muted text-right mt-1.5" data-i18n="used">${dailyPercent}% Used</p>`;
                                } else {
                                    dailyProgress = '<p class="text-[10px] text-muted mt-2" data-i18n="noDailyLimit">No Daily Limit</p>';
                                }
                                // Replace placeholders
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
                                return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
                            } catch (e) {
                                return new Response('Failed to load subscription page', { status: 502 });
                            }
                        } else {
                            return serveMaintenancePage(request, url);
                        }
                    }

                    if (hasMultiUser && !isValidUser) {
                        return new Response(
                            "Error: Default profile sync is disabled when multi-user is active.",
                            { status: 403 },
                        );
                    }

                    // Breaker L2: shed client sub refreshes under extreme
                    // load (browsers still get the info page above, open
                    // tunnels are unaffected).
                    try {
                        if (breakerLevel() >= 2 && !isRealBrowser) {
                            return new Response(
                                "Server busy, retry later",
                                {
                                    status: 429,
                                    headers: { "Retry-After": "60" },
                                },
                            );
                        }
                    } catch (e) {}

                    const allowInsecure =
                        url.searchParams.get("insecure") === "true" ||
                        url.searchParams.get("allowInsecure") === "true" ||
                        url.searchParams.get("allow_insecure") === "1" ||
                        url.searchParams.get("allowInsecure") === "1";

                    const resHeaders = new Headers();
                    resHeaders.set("Cache-Control", "no-store");
                    resHeaders.set("Access-Control-Allow-Origin", "*");

                    let flag = (
                        url.searchParams.get("flag") ||
                        url.searchParams.get("format") ||
                        url.searchParams.get("type") ||
                        url.searchParams.get("output") ||
                        ""
                    ).toLowerCase();

                    if (isValidUser && targetUser) {
                        let idClean = targetUser.id
                            .replace(/-/g, "")
                            .toLowerCase();
                        let sysU = sysUsageCache?.users?.[idClean] || {
                            reqs: 0,
                            dReqs: 0,
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
                        let expireSec = expiryMs
                            ? Math.floor(expiryMs / 1000)
                            : 0;

                        const subUserInfo = `upload=0; download=${usedBytes}; total=${limitBytes}; expire=${expireSec}`;
                        resHeaders.set("Subscription-UserInfo", subUserInfo);
                        resHeaders.set("subscription-userinfo", subUserInfo);
                        resHeaders.set("Profile-Update-Interval", "12");
                        resHeaders.set("profile-update-interval", "12");

                        let cleanName = encodeURIComponent(targetUser.name);
                        resHeaders.set(
                            "Content-Disposition",
                            `attachment; filename="${cleanName}"; filename*=UTF-8''${cleanName}`,
                        );
                    }

                    // Determine subscription format
                    let isClashYaml = false;
                    let isSingboxJson = false;
                    let isClashJson = false;
                    let isVJson = false;

                    // If flag is explicitly set, we respect it
                    if (
                        flag === getGamma() ||
                        flag === "yaml" ||
                        flag === "meta" ||
                        flag === "sta" + "sh" ||
                        flag === getGamma() + "-meta" ||
                        flag === "y"
                    ) {
                        isClashYaml = true;
                    } else if (flag === "b" || flag === "c_legacy") {
                        isClashJson = true;
                    } else if (
                        flag === "sing" ||
                        flag === "si" + "ngbox" ||
                        flag === "si" + "ng-box" ||
                        flag === "sb" ||
                        flag === "s" ||
                        flag === "c" ||
                        flag === "g"
                    ) {
                        isSingboxJson = true;
                    } else if (flag === "vjson" || flag === "v") {
                        isVJson = true;
                    } else if (flag === "base64") {
                        // Skip auto-detect to default to base64 plain-text subscription format
                    } else if (flag === "a" || flag === "raw" || flag === "") {
                        // Safe auto-detect for raw sync or no-flag links using target browser / client User-Agent
                        if (
                            ua.includes(getGamma()) ||
                            ua.includes("meta") ||
                            ua.includes("sta" + "sh") ||
                            ua.includes("verge") ||
                            ua.includes("mihomo") ||
                            ua.includes("cfw")
                        ) {
                            isClashYaml = true;
                        } else if (
                            ua.includes("si" + "ng-box") ||
                            ua.includes("si" + "ngbox") ||
                            ua.includes("hiddify") ||
                            ua.includes("nekobox") ||
                            ua.includes("sfa") ||
                            ua.includes("karing")
                        ) {
                            isSingboxJson = true;
                        }
                    }

                    if (isClashYaml) {
                        resHeaders.set(
                            "Content-Type",
                            "text/yaml; charset=utf-8",
                        );
                        return new Response(
                            await buildYamlProfile(clientHost, targetSub, allowInsecure, env),
                            {
                                headers: resHeaders,
                            },
                        );
                    } else if (isSingboxJson) {
                        resHeaders.set(
                            "Content-Type",
                            "application/json; charset=utf-8",
                        );
                        return new Response(
                            JSON.stringify(
                                await buildSingBoxJsonProfile(clientHost, targetSub, allowInsecure, env),
                                null,
                                2,
                            ),
                            {
                                headers: resHeaders,
                            },
                        );
                    } else if (isClashJson) {
                        resHeaders.set(
                            "Content-Type",
                            "application/json; charset=utf-8",
                        );
                        return new Response(
                            JSON.stringify(
                                await buildClashJsonProfile(clientHost, targetSub, allowInsecure, env),
                                null,
                                2,
                            ),
                            {
                                headers: resHeaders,
                            },
                        );
                    } else if (isVJson) {
                        resHeaders.set("Content-Type", "application/json; charset=utf-8");
                        return new Response(JSON.stringify(await buildVJsonProfile(clientHost, targetSub, allowInsecure, env), null, 2), { headers: resHeaders });
                    } else {
                        resHeaders.set(
                            "Content-Type",
                            "text/plain; charset=utf-8",
                        );
                        const raw = await buildUriProfile(
                            clientHost,
                            targetSub,
                            allowInsecure,
                        );
                        return new Response(safeBtoa(raw), {
                            headers: resHeaders,
                        });
                    }
                }
            }

            if (isTelemetryStream) {
                if (sysConfig.isPaused)
                    return new Response(null, { status: 503 });
                // Reconnect-storm backoff before the handshake stacks up.
                try {
                    const wip =
                        request.headers.get("cf-connecting-ip") || "unknown";
                    const wr = wsRateCheck(wip);
                    if (wr === "refuse")
                        return new Response("Too many requests", {
                            status: 429,
                            headers: { "Retry-After": "60" },
                        });
                    if (wr === "tarpit") await sleepMs(1500);
                } catch (e) {}
                // Breaker L2: slow down reconnect storms instead of
                // stacking more handshakes onto a saturated isolate.
                try {
                    if (breakerLevel() >= 2) await sleepMs(1000);
                } catch (e) {}
                let wsRelayIdx = -1;
                try {
                    const riParam = url.searchParams.get("ri");
                    if (riParam !== null) wsRelayIdx = parseInt(riParam, 10);
                } catch (e) {}
                if (wsRelayIdx < 0) {
                    try {
                        const lastSeg = url.pathname.split("/").pop();
                        if (lastSeg) {
                            const num = parseInt(lastSeg, 10);
                            if (!isNaN(num) && num >= 0) wsRelayIdx = num;
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
                const repo = (sysConfig.githubRepo || "itsyebekhe/nahan")
                    .replace(/https?:\/\/github\.com\//, "")
                    .trim();
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
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        let latestCode = await res.text();
                        const deployRes = await deployWorkerToCloudflare(
                            sysConfig.cfAccountId,
                            sysConfig.cfApiToken,
                            sysConfig.cfWorkerName,
                            latestCode
                        );
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
                                            ctx?.waitUntil(
                                                fetchT(targetUrl, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        key: p.apiKey,
                                                        action: "deploy",
                                                        code: latestCode,
                                                        force: true
                                                    }),
                                                    signal: AbortSignal.timeout(15000)
                                                }).catch(() => {})
                                            );
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
