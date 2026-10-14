import { sysConfig, activeConnections, isolateStartTime, sysUsageCache, uuidUsage, activeConns } from "../core/state.js";
import { fetchT, usageTotalBytes, usageDailyBytes, limitReqToBytes } from "../core/utils.js";
import { loadRelayHealthSnapshot, relayHealthSnapshot, relayHealthSnapshotAsync } from "../relays/health.js";
import { authFail, isPanelApiKey, authBlocked } from "../core/auth.js";
import { CURRENT_VERSION } from "../core/constants.js";

export async function fetchCloudflareUsage(accountId, apiToken) {
    if (!accountId || !apiToken) return null;
    try {
        const d = new Date();
        const currentDate = d.toISOString().split("T")[0] + "T00:00:00Z";

        const query = `query GetDailyUsage($accountId: String!, $start: ISO8601DateTime!) { viewer { accounts(filter: {accountTag: $accountId}) { workersInvocationsAdaptive(limit: 1, filter: { datetime_geq: $start }) { sum { requests } } } } }`;
        const variables = { accountId: accountId, start: currentDate };

        const res = await fetchT(
            "https://api.cloudflare.com/client/v4/graphql",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query, variables }),
            },
        );

        const json = await res.json();
        const reqs =
            json?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive?.[0]
                ?.sum?.requests;
        return typeof reqs === "number" ? reqs : null;
    } catch (e) {
        return null;
    }
}

export async function handleStatsApi(request, env) {    try {
        const url = new URL(request.url);
        const authHeader = request.headers.get("Authorization") || "";
        const authKey =
            authHeader.replace("Bearer ", "") ||
            url.searchParams.get("key") ||
            "";
        const statsGateIp =
            request.headers.get("cf-connecting-ip") || "Unknown";
        if (authBlocked(statsGateIp)) {
            return new Response(
                JSON.stringify({ success: false, error: "Too many attempts" }),
                {
                    status: 429,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
        if (authKey !== sysConfig.masterKey && !isPanelApiKey(authKey)) {
            authFail(statsGateIp);
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const users = sysConfig.users || [];
        const totalUsers = users.length;
        const activeUsers = users.filter(
            (u) => !u.isPaused && (!u.expiryMs || Date.now() <= u.expiryMs),
        ).length;
        const autoDisabledUsers = users.filter(
            (u) => u.isPaused && u.disabledReason,
        ).length;
        const pausedUsers = users.filter(
            (u) => u.isPaused && !u.disabledReason,
        ).length;
        const expiredUsers = users.filter(
            (u) => u.expiryMs && Date.now() > u.expiryMs && !u.isPaused,
        ).length;

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
                lastDay: "",
            };
            totalTrafficReqs += sysU.reqs || 0;
            if (sysU.lastDay === todayDate) dailyTrafficReqs += sysU.dReqs || 0;
            totalTrafficBytes += usageTotalBytes(sysU);
            dailyTrafficBytes += usageDailyBytes(sysU, todayDate);
        });

        
        let usageData = {};
        for (let [k, v] of uuidUsage.entries()) {
            usageData[k] = { ...v, connects: activeConns.get(k) || 0 };
        }
        const upSeconds = Math.floor((Date.now() - isolateStartTime) / 1000);

        return new Response(
            JSON.stringify({
                success: true,
                stats: {
                    users: {
                        total: totalUsers,
                        active: activeUsers,
                        paused: pausedUsers,
                        expired: expiredUsers,
                        autoDisabled: autoDisabledUsers,
                    },
                    traffic: {
                        totalRequests: totalTrafficReqs,
                        totalGB: (totalTrafficBytes / 1073741824).toFixed(2),
                        dailyRequests: dailyTrafficReqs,
                        dailyGB: (dailyTrafficBytes / 1073741824).toFixed(2),
                    },
                    usage: usageData,
                    system: {
                        uptimeSeconds: upSeconds,
                        activeConnections,
                        version: CURRENT_VERSION,
                        isPaused: sysConfig.isPaused || false,
                        security: {
                            usingDefaultKey:
                                sysConfig.masterKey === "admin",
                        },
                    },
                    relays: await relayHealthSnapshotAsync(env),
                },
            }),
            { headers: { "Content-Type": "application/json" } },
        );
    } catch (e) {
        return new Response(
            JSON.stringify({ success: false, error: e.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
}