import { logActivity } from "./logs.js";
import { extractAuthKey } from "../core/auth.js";
import { deployWorkerToCloudflare } from "../core/cf.js";
import { CURRENT_VERSION } from "../core/constants.js";
import { sysConfig } from "../core/state.js";
import { cmpVersions, obfuscateCode } from "../core/utils.js";

/**
 * Extract the version from a built `_worker.js`.
 *
 * The build script prepends a compact banner comment holding the version,
 * e.g. `/*const CURRENT_VERSION="3.0.0"*\/`, because minification renames the
 * `CURRENT_VERSION` binding away. Match that banner first, then fall back to
 * the raw `const CURRENT_VERSION = "x.y.z"` declaration for older bundles.
 */
function extractVersionFromCode(code) {
    const bannerMatch = code.match(
        /\/\*\s*const\s+CURRENT_VERSION\s*=\s*["']([^"']+)["']\s*\*\//,
    );
    if (bannerMatch) return bannerMatch[1];
    const legacyMatch = code.match(
        /const\s+CURRENT_VERSION\s*=\s*["']([^"']+)["']/,
    );
    return legacyMatch ? legacyMatch[1] : null;
}

export async function handleUpdateApi(request, env, ctx) {
    try {
        if (request.method !== "POST")
            return new Response("405", { status: 405 });
        const data = await request.json();
        const deployKey = extractAuthKey(request, data);
        if (deployKey !== sysConfig.masterKey) {
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
                const res = await fetch(
                    `https://raw.githubusercontent.com/${repo}/main/version`,
                );
                if (res.ok) {
                    const txt = (await res.text()).trim();
                    if (txt && txt.length <= 15) remoteVer = txt;
                }
            } catch (e) {}
            if (!remoteVer) {
                try {
                    const res = await fetch(
                        `https://raw.githubusercontent.com/${repo}/main/_worker.js`,
                    );
                    if (res.ok) {
                        const code = await res.text();
                        remoteVer = extractVersionFromCode(code);
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

            let finalCodeToDeploy = data.code;
            if (!finalCodeToDeploy) {
                try {
                    const res = await fetch(
                        `https://raw.githubusercontent.com/${repo}/main/_worker.js`,
                    );
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

            const newVersion =
                extractVersionFromCode(finalCodeToDeploy) || CURRENT_VERSION;

            if (
                cmpVersions(CURRENT_VERSION, newVersion) >= 0 &&
                !data.force &&
                !data.code
            ) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Remote version is not newer. Click force redeploy to switch formats or overwrite.",
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            // Move the obfuscate logic from client-side to worker-side
            const format = data.format || sysConfig.autoUpdateFormat || "normal";
            if (format === "obfuscated") {
                try {
                    finalCodeToDeploy = obfuscateCode(finalCodeToDeploy);
                } catch (oe) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: "Obfuscation failed: " + oe.message,
                        }),
                        {
                            status: 500,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }
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
                        `v${CURRENT_VERSION} → v${newVersion} (${format})`,
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
                                    fetch(targetUrl, {
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
                    const tgMsg = `🔄 <b>Panel Updated</b>\n\n📦 v${CURRENT_VERSION} → v${newVersion}\n🌐 <b>Format:</b> ${format}`;
                    const notifyChatId =
                        sysConfig.tgAdminId || sysConfig.tgChatId;
                    ctx?.waitUntil(
                        fetch(
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
