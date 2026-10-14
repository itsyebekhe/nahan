import { CURRENT_VERSION } from "../core/constants.js";
import { sysConfig } from "../core/state.js";
import { fetchT, cmpVersions, deployWorkerToCloudflare } from "../core/utils.js";
import { logActivity } from "./logs.js";
import { extractAuthKey, authBlocked, authFail } from "../core/auth.js";

export async function handleUpdateApi(request, env, ctx) {
    try {
        if (request.method !== "POST")
            return new Response("405", { status: 405 });
        const data = await request.json();
        const deployKey = extractAuthKey(request, data);
        const deployGateIp =
            request.headers.get("cf-connecting-ip") || "Unknown";
        if (authBlocked(deployGateIp)) {
            return new Response(
                JSON.stringify({ success: false, error: "Too many attempts" }),
                {
                    status: 429,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
        if (deployKey !== sysConfig.masterKey) {
            authFail(deployGateIp);
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const accountId = sysConfig.cfAccountId;
        const apiToken = sysConfig.cfApiToken;
        const workerName = sysConfig.cfWorkerName;
        const repo = (sysConfig.githubRepo || "itsyebekhe/nahan")
            .replace(/https?:\/\/github\.com\//, "")
            .trim();

        if (data.action === "check") {
            let remoteVer = null;
            try {
                const res = await fetchT(
                    `https://raw.githubusercontent.com/${repo}/main/version`,
                );
                if (res.ok) {
                    const txt = (await res.text()).trim();
                    if (txt && txt.length <= 15) remoteVer = txt;
                }
            } catch (e) {}
            if (!remoteVer) {
                try {
                    let res = await fetchT(
                        `https://raw.githubusercontent.com/${repo}/main/_worker.encode.js`,
                    );
                    if (!res.ok) {
                        res = await fetchT(
                            `https://raw.githubusercontent.com/${repo}/main/_worker.encoded.js`,
                        );
                        if (!res.ok) {
                            res = await fetchT(
                                `https://raw.githubusercontent.com/${repo}/main/_worker.js`,
                            );
                        }
                    }
                    if (res.ok) {
                        const code = await res.text();
                        const match = code.match(
                            /const\s+CURRENT_VERSION\s*=\s*["']([^"']+)["']/,
                        );
                        if (match) remoteVer = match[1];
                    }
                } catch (e) {}
            }
            if (!remoteVer) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Could not fetch remote version",
                    }),
                    {
                        status: 502,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
            const hasCredentials = !!(accountId && apiToken && workerName);
            return new Response(
                JSON.stringify({
                    success: true,
                    current: CURRENT_VERSION,
                    latest: remoteVer,
                    updateAvailable:
                        cmpVersions(CURRENT_VERSION, remoteVer) < 0,
                    canDeploy: hasCredentials,
                }),
                { headers: { "Content-Type": "application/json" } },
            );
        }

        if (data.action === "deploy") {
            // Remote-code-execution gate: deploying worker code with only
            // the panel key is disabled unless the operator explicitly opts
            // in (POST {"key":...,"config":{"allowRemoteDeploy":true}} to
            // /api/sync). Version *check* above stays available.
            if (sysConfig.allowRemoteDeploy !== true) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Remote deploy is disabled. Enable allowRemoteDeploy in config to use it.",
                    }),
                    {
                        status: 403,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
            if (!accountId || !apiToken || !workerName) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "CF credentials not configured",
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            let newVersion = data.version || null;

            let finalCodeToDeploy = data.code;
            if (!finalCodeToDeploy) {
                try {
                    let res = await fetchT(
                        `https://raw.githubusercontent.com/${repo}/main/_worker.encode.js`,
                    );
                    if (!res.ok) {
                        res = await fetchT(
                            `https://raw.githubusercontent.com/${repo}/main/_worker.encoded.js`,
                        );
                        if (!res.ok) {
                            res = await fetchT(
                                `https://raw.githubusercontent.com/${repo}/main/_worker.js`,
                            );
                        }
                    }
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    finalCodeToDeploy = await res.text();
                } catch (e) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: "Failed to fetch from GitHub: " + e.message,
                        }),
                        {
                            status: 502,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }
            }

            if (!newVersion) {
                const versionMatch = finalCodeToDeploy.match(
                    /const\s+CURRENT_VERSION\s*=\s*["']([^"']+)["']/,
                );
                if (versionMatch) {
                    newVersion = versionMatch[1];
                } else {
                    try {
                        const vRes = await fetchT(
                            `https://raw.githubusercontent.com/${repo}/main/version`,
                        );
                        if (vRes.ok) {
                            newVersion = (await vRes.text()).trim();
                        }
                    } catch (e) {}
                }
            }
            if (!newVersion) newVersion = CURRENT_VERSION;

            if (
                cmpVersions(CURRENT_VERSION, newVersion) >= 0 &&
                !data.force &&
                !data.code
            ) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Remote version is not newer. Click force redeploy to overwrite.",
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            const deployRes = await deployWorkerToCloudflare(
                accountId,
                apiToken,
                workerName,
                finalCodeToDeploy,
            );
            const deployResult = await deployRes.json();

            if (deployResult.success) {
                ctx?.waitUntil(
                    logActivity(
                        env,
                        "Panel Updated",
                        `v${CURRENT_VERSION} → v${newVersion} (encoded)`,
                    ).catch(() => {}),
                );

                // Update all nodes with main panel update!
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
                                            code: finalCodeToDeploy,
                                            force: true
                                        }),
                                        signal: AbortSignal.timeout(15000)
                                    }).then(async (r) => {
                                        const resJson = await r.json();
                                        await logActivity(env, "Node Update Success", `Node ${p.url} update response: ${JSON.stringify(resJson)}`);
                                    }).catch((e) => {
                                        logActivity(env, "Node Update Failed", `Node ${p.url} update failed: ${e.message}`);
                                    })
                                );
                            } catch (err) {
                                console.error(`Failed to trigger update on node ${p.url}:`, err);
                            }
                        }
                    }
                }

                if (
                    sysConfig.tgToken &&
                    (sysConfig.tgAdminId || sysConfig.tgChatId)
                ) {
                    const tgMsg = `🔄 <b>Panel Updated</b>\n\n📦 v${CURRENT_VERSION} → v${newVersion}\n🌐 <b>Format:</b> encoded`;
                    const notifyChatId =
                        sysConfig.tgAdminId || sysConfig.tgChatId;
                    ctx?.waitUntil(
                        fetchT(
                            `https://api.telegram.org/bot${sysConfig.tgToken}/sendMessage`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    chat_id: notifyChatId,
                                    text: tgMsg,
                                    parse_mode: "HTML",
                                }),
                            },
                        ).catch(() => {}),
                    );
                }
                return new Response(
                    JSON.stringify({
                        success: true,
                        message: `Updated to v${newVersion}`,
                        newVersion,
                    }),
                    { headers: { "Content-Type": "application/json" } },
                );
            } else {
                const errMsg =
                    deployResult.errors?.[0]?.message || "Unknown API error";
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Cloudflare API: " + errMsg,
                    }),
                    {
                        status: 502,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
        }

        return new Response(
            JSON.stringify({ success: false, error: "Invalid action" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    } catch (e) {
        return new Response(
            JSON.stringify({ success: false, error: "Internal error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
}