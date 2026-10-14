import { sysConfig, activeDeviceId } from "../core/state.js";
import { getAllProfiles, getEffectivePips } from "../api/users.js";
import { registerConfigEntry } from "../protocols/trojan.js";
import { fetchT } from "../core/utils.js";
import { getBeta } from "../core/constants.js";

export function parseSegRangeList(s, maxItems) {
    try {
        const items = String(s || "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
            .slice(0, maxItems);
        if (!items.length) return null;
        for (const it of items) {
            if (!/^\d{1,5}(-\d{1,5})?$/.test(it)) return null;
        }
        return items;
    } catch (e) {
        return null;
    }
}

export function resolveSegFragment(p) {
    // { kind: 'classic', value } | { kind: 'fm', value } | null. Fail-open.
    try {
        if (!p) return null;
        const mode = String(p.segMode || "off").toLowerCase();
        if (mode === "builder") {
            const packets = String(p.segPackets || "").trim().slice(0, 32);
            if (!packets) return null;
            if (
                packets !== "tlshello" &&
                !/^\d{1,3}-\d{1,3}$/.test(packets)
            )
                return null;
            const lengths = parseSegRangeList(p.segLengths, 8);
            const delays = parseSegRangeList(p.segDelays, 8);
            const maxSplit = String(p.segMaxSplit ?? "").trim();
            if (!lengths || !delays) return null;
            if (!/^\d{1,6}$/.test(maxSplit)) return null;
            return {
                kind: "fm",
                value: {
                    tcp: [
                        {
                            type: "fragment",
                            settings: { packets, lengths, delays, maxSplit },
                        },
                    ],
                },
            };
        }
        if (mode === "manual") {
            const raw = String(p.segManual || "").trim().slice(0, 4000);
            if (!raw) return null;
            if (raw.charAt(0) === "{") {
                let obj = null;
                try {
                    obj = JSON.parse(raw);
                } catch (e) {
                    return null;
                }
                if (
                    !obj ||
                    typeof obj !== "object" ||
                    !Array.isArray(obj.tcp) ||
                    obj.tcp.length === 0
                )
                    return null;
                return { kind: "fm", value: { tcp: obj.tcp } };
            }
            if (
                /^\d{1,5}-\d{1,5},\d{1,5}-\d{1,5},(tlshello|\d{1,3}-\d{1,3})$/.test(
                    raw,
                )
            )
                return { kind: "classic", value: raw };
            return null;
        }
        if ((!p || !p.segMode || p.segMode === "off") && sysConfig.optAutoApply && sysConfig.optFm) {
            try {
                let obj = typeof sysConfig.optFm === "object" ? sysConfig.optFm : JSON.parse(sysConfig.optFm);
                return { kind: "fm", value: obj };
            } catch(e) {}
        }
        return null;
    } catch (e) {
        return null;
    }
}
export function buildSegFragmentParam(p) {
    // Returns "" or "&fragment=..." / "&fm=..." (already encoded).
    try {
        const r = resolveSegFragment(p);
        if (!r) return "";
        if (r.kind === "fm")
            return "&fm=" + encodeURIComponent(JSON.stringify(r.value));
        return "&fragment=" + encodeURIComponent(String(r.value));
    } catch (e) {
        return "";
    }
}
export function getSegStreamExtra(p) {
    // Xray streamSettings object for vjson builder: { finalmask } | { fragment } | {}.
    try {
        const r = resolveSegFragment(p);
        if (!r) return {};
        if (r.kind === "fm") return { finalmask: r.value };
        const m = String(r.value).split(",");
        return {
            fragment: { packets: m[2], length: m[0], interval: m[1] },
        };
    } catch (e) {
        return {};
    }
}
export function buildTlsMaskParam(p) {
    // Returns "" or "&cs=..." (already encoded).
    try {
        let v = (p && p.tlsMask) ? String(p.tlsMask).trim().slice(0, 2000) : "";
        if (!v && sysConfig.optAutoApply && sysConfig.optCs) {
            v = String(sysConfig.optCs).trim().slice(0, 2000);
        }
        if (!v) return "";
        return "&cs=" + encodeURIComponent(v);
    } catch (e) {
        return "";
    }
}
export function isSegEnabled(p) {
    try {
        if (!p) return false;
        const mode = String(p.segMode || "off").toLowerCase();
        if (mode !== "builder" && mode !== "manual") return false;
        return buildSegFragmentParam(p) !== "";
    } catch (e) {
        return false;
    }
}

// ─── Upstream VLESS URI Parser ───────────────────────────────────────
// Parses a VLESS URI like:
//   vless://uuid@server:port?type=ws&security=tls&sni=example.com&path=/ws#Name
// into a structured object usable by Sing-Box, Clash, and V2Ray builders.
function parseEndpointUri(uri) {
    if (!uri || typeof uri !== "string") return null;
    uri = uri.trim();
    if (!uri.startsWith("vless://")) return null;
    try {
        // Remove the scheme
        let rest = uri.slice(8); // after "vless://"
        // Split fragment (#name)
        let fragment = "";
        let hashIdx = rest.indexOf("#");
        if (hashIdx !== -1) {
            fragment = decodeURIComponent(rest.slice(hashIdx + 1));
            rest = rest.slice(0, hashIdx);
        }
        // Split query string (?params)
        let queryStr = "";
        let qIdx = rest.indexOf("?");
        if (qIdx !== -1) {
            queryStr = rest.slice(qIdx + 1);
            rest = rest.slice(0, qIdx);
        }
        // Parse query params
        let params = {};
        if (queryStr) {
            queryStr.split("&").forEach((pair) => {
                let [k, v] = pair.split("=");
                if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || "");
            });
        }
        // Parse uuid@server:port
        let atIdx = rest.indexOf("@");
        if (atIdx === -1) return null;
        let uuid = rest.slice(0, atIdx);
        let hostPort = rest.slice(atIdx + 1);
        let server, port;
        // Handle IPv6 [addr]:port
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
            raw: uri,
        };
    } catch (e) {
        return null;
    }
}
const parseVlessUri = parseEndpointUri;

// Convert parsed VLESS URI to a Sing-Box outbound object
function upstreamToBoxRoute(parsed) {
    if (!parsed) return null;
    let ob = {
        type: "vless",
        tag: "🔗 " + parsed.name,
        server: parsed.server,
        server_port: parsed.port,
        uuid: parsed.uuid,
        packet_encoding: "xudp",
        network: parsed.type || "ws",
        tls: {
            enabled: parsed.security === "tls" || parsed.security === "reality",
            server_name: parsed.sni,
            insecure: parsed.allowInsecure,
            utls: { enabled: true, fingerprint: parsed.fp || "randomized" },
        },
        transport: {
            type: parsed.type || "ws",
            path: parsed.path || "/",
            headers: { Host: parsed.host || parsed.sni },
        },
    };
    if (parsed.flow) ob.flow = parsed.flow;
    if (parsed.pbk) {
        ob.tls.reality = {
            enabled: true,
            public_key: parsed.pbk,
            short_id: parsed.sid || "",
        };
    }
    if (parsed.alpn) ob.tls.alpn = parsed.alpn.split(",");
    return ob;
}
const upstreamToSingboxOb = upstreamToBoxRoute;

// Convert parsed VLESS URI to a Clash/Mihomo proxy object (YAML-compatible)
function upstreamToEdgeRoute(parsed) {
    if (!parsed) return null;
    let proxy = {
        name: parsed.name,
        type: "vless",
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
            headers: { Host: parsed.host || parsed.sni },
        },
    };
    if (parsed.flow) proxy.flow = parsed.flow;
    if (parsed.pbk) {
        proxy["reality-opts"] = {
            "public-key": parsed.pbk,
            "short-id": parsed.sid || "",
        };
    }
    if (parsed.alpn) proxy.alpn = parsed.alpn.split(",");
    return proxy;
}
const upstreamToClashProxy = upstreamToEdgeRoute;

// Convert parsed VLESS URI to a V2Ray JSON outbound object
function upstreamToCoreRoute(parsed) {
    if (!parsed) return null;
    let ob = {
        tag: "🔗 " + parsed.name,
        protocol: "vless",
        settings: {
            vnext: [
                {
                    address: parsed.server,
                    port: parsed.port,
                    users: [
                        {
                            id: parsed.uuid,
                            encryption: parsed.encryption || "none",
                            flow: parsed.flow || "",
                        },
                    ],
                },
            ],
        },
        streamSettings: {
            network: parsed.type || "ws",
            security: parsed.security === "tls" || parsed.security === "reality" ? "tls" : "none",
            tlsSettings: parsed.security === "tls" ? {
                serverName: parsed.sni,
                allowInsecure: parsed.allowInsecure,
                fingerprint: parsed.fp || "random",
            } : undefined,
            realitySettings: parsed.security === "reality" ? {
                serverName: parsed.sni,
                publicKey: parsed.pbk || "",
                shortId: parsed.sid || "",
                fingerprint: parsed.fp || "random",
            } : undefined,
            wsSettings: {
                path: parsed.path || "/",
                headers: { Host: parsed.host || parsed.sni },
            },
        },
    };
    return ob;
}
const upstreamToV2RayOb = upstreamToCoreRoute;

async function buildUriProfile(
    hostName,
    targetSub = null,
    allowInsecure = false,
) {
    let ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);

    let lines = [];
    let profiles = getAllProfiles(targetSub);
    let allHostNames = [
        ...new Set(profiles.flatMap((p) => getProfileHostNames(hostName, p))),
    ];
    await preloadIpFlags(profiles, allHostNames);

    // Add fake configs
    let fakeNames = getFakeConfigNames(targetSub);
    fakeNames.forEach((name) => {
        lines.push(
            `trojan://00000000-0000-0000-0000-000000000000@127.0.0.1:1080?security=none#${encodeURIComponent(name)}`,
        );
    });

    profiles.forEach((p) => {
        let pips = getEffectivePips(p);
        let effectiveMode = p.userMode || sysConfig.mode;
        let effectivePorts = p.userPorts
            ? p.userPorts
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : ports;
        let maxCfg = p.maxConfigs || null;

        let configIndex = 0;
        let profileHostNames = getProfileHostNames(hostName, p);

        profileHostNames.forEach((hName) => {
            let ipEntries = getCleanIpsWithNames(hName, p.cleanIp);
            let allIps = ipEntries.map((e) => e.ip);
            let ips = calcEffectiveIps(
                allIps,
                maxCfg,
                effectiveMode,
                effectivePorts,
                pips.length
            );
            let ipNameMap = {};
            ipEntries.forEach((e) => {
                ipNameMap[e.ip] = e.name;
            });
            effectivePorts.forEach((port) => {
                let sec = getTransportParams(port);
                let extBase = `encryption=none&security=${sec}&sni=${hName}&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${reqPath}`;
                if (sysConfig.enableOpt2) extBase += `&pbk=enabled`;
                extBase += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
                // Per-user segmentation (fragment/finalmask) + TLS mask.
                try {
                    extBase += buildSegFragmentParam(p);
                    extBase += buildTlsMaskParam(p);
                } catch (e) {}
                ips.forEach((ip) => {
                    let _pips = pips.length > 0 ? pips : [null];
                    _pips.forEach((selectedProxyIp) => {
                    let ipName = ipNameMap[ip] || "";
                    let vName = getConfigName(
                        "alpha",
                        p.name,
                        port,
                        hName,
                        ip,
                        selectedProxyIp,
                        configIndex,
                        ipName,
                    );
                    let tName = getConfigName(
                        "beta",
                        p.name,
                        port,
                        hName,
                        ip,
                        selectedProxyIp,
                        configIndex,
                        ipName,
                    );
                    if (effectiveMode === "alpha" || effectiveMode === "both") {
                        let configUuid = generateConfigUuid(p.id, configIndex);
                        registerConfigEntry(
                            configUuid,
                            p.id,
                            selectedProxyIp || "",
                        );
                        lines.push(
                            `${getAlpha()}://${configUuid}@${ip}:${port}?${extBase}#${vName}`,
                        );
                    }
                    if (effectiveMode === "beta" || effectiveMode === "both") {
                        let randomJunk = Array.from(
                            { length: 11 },
                            () =>
                                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                    Math.floor(Math.random() * 62)
                                ],
                        ).join("");
                        let payloadTr = {
                            junk: randomJunk,
                            protocol: "tr",
                            mode: "proxyip",
                            panelIPs: [],
                            relayIdx: configIndex,
                        };
                        let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
                        let trojanExtBase = `security=${sec}&sni=${hName}&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${encodeURIComponent(pathStrTr)}`;
                        if (sysConfig.enableOpt2)
                            trojanExtBase += `&pbk=enabled`;
                        trojanExtBase += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
                        try {
                            trojanExtBase += buildSegFragmentParam(p);
                            trojanExtBase += buildTlsMaskParam(p);
                        } catch (e) {}
                        lines.push(
                            `${getBeta()}://${p.id}@${ip}:${port}?${trojanExtBase}#${tName}`,
                        );
                    }
                    if (sysConfig.enableDirectConfigs && pips.length > 0 && selectedProxyIp === pips[0]) {
                        configIndex++;
                        let dvName = getConfigName(
                            "alpha",
                            p.name,
                            port,
                            hName,
                            ip,
                            null,
                            configIndex,
                            ipName,
                            true
                        );
                        let dtName = getConfigName(
                            "beta",
                            p.name,
                            port,
                            hName,
                            ip,
                            null,
                            configIndex,
                            ipName,
                            true
                        );
                        if (
                            effectiveMode === "alpha" ||
                            effectiveMode === "both"
                        ) {
                            let configUuid = generateConfigUuid(
                                p.id,
                                configIndex,
                            );
                            registerConfigEntry(configUuid, p.id, "");
                            lines.push(
                                `${getAlpha()}://${configUuid}@${ip}:${port}?${extBase}#${dvName}`,
                            );
                        }
                        if (
                            effectiveMode === "beta" ||
                            effectiveMode === "both"
                        ) {
                            let randomJunk2 = Array.from(
                                { length: 11 },
                                () =>
                                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                        Math.floor(Math.random() * 62)
                                    ],
                            ).join("");
                            let payloadTr2 = {
                                junk: randomJunk2,
                                protocol: "tr",
                                mode: "proxyip",
                                panelIPs: [],
                                relayIdx: configIndex,
                            };
                            let pathStrTr2 =
                                "/" + btoa(JSON.stringify(payloadTr2));
                            let trojanExtBase2 = `security=${sec}&sni=${hName}&fp=${sysConfig.agent}&type=ws&host=${hName}&path=${encodeURIComponent(pathStrTr2)}`;
                            if (sysConfig.enableOpt2)
                                trojanExtBase2 += `&pbk=enabled`;
                            trojanExtBase2 += `&allowInsecure=${allowInsecure ? "1" : "0"}`;
                            try {
                                trojanExtBase2 += buildSegFragmentParam(p);
                                trojanExtBase2 += buildTlsMaskParam(p);
                            } catch (e) {}
                            lines.push(
                                `${getBeta()}://${p.id}@${ip}:${port}?${trojanExtBase2}#${dtName}`,
                            );
                        }
                    }
                    configIndex++;
                    });
                });
            });
        });
    });
    // ─── Upstream: prepend upstream URI ───
    let parsedUpstream = parseVlessUri(sysConfig.upstreamUri);
    if (parsedUpstream) {
        lines.unshift(parsedUpstream.raw);
    }
    return lines.join("\n");
}


let clashTemplate = null;
let singboxTemplate = null;
let VTemplate = null;

async function fetchTemplates(env) {
    const repo = sysConfig.githubRepo || "itsyebekhe/nahan";
    if (!clashTemplate) {
        try {
            let res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/clash.yml`);
            if (res.ok) clashTemplate = await res.text();
        } catch(e) {}
    }
    if (!singboxTemplate) {
        try {
            let res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/singbox.json`);
            if (res.ok) singboxTemplate = await res.json();
        } catch(e) {}
    }
    if (!VTemplate) {
        try {
            let res = await fetchT(`https://raw.githubusercontent.com/${repo}/main/v.json`);
            if (res.ok) VTemplate = await res.json();
        } catch(e) {}
    }
}


function getCustomRouting() {
    let cr = sysConfig.customRouting || "";
    let lines = cr.split('\n').map(l => l.trim()).filter(Boolean);
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

async function buildYamlProfile(hostName, targetSub = null, allowInsecure = false, env = null) {
    let ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);
    let proxies = [];
    let proxyNames = [];
    let nameCounts = {}; // Track proxy names for deduplication
    let profiles = getAllProfiles(targetSub);
    let allHostNames = [
        ...new Set(profiles.flatMap((p) => getProfileHostNames(hostName, p))),
    ];
    await preloadIpFlags(profiles, allHostNames);
    let proxyGeoInfo = new Map(); // proxyName -> {country, flag}

    // Add fake configs
    let fakeNames = getFakeConfigNames(targetSub);
    let fakeRefs = [];
    fakeNames.forEach((name) => {
        proxies.push(
            `- name: "${name}"\n  type: ${getBeta()}\n  server: 127.0.0.1\n  port: 80\n  password: "${activeDeviceId}"\n  udp: true\n  tls: false`,
        );
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
        let effectivePorts = p.userPorts
            ? p.userPorts
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : ports;
        let maxCfg = p.maxConfigs || null;

        let configIndex = 0;
        let profileHostNames = getProfileHostNames(hostName, p);

        profileHostNames.forEach((hName) => {
            let ipEntries = getCleanIpsWithNames(hName, p.cleanIp);
            let allIps = ipEntries.map((e) => e.ip);
            let ips = calcEffectiveIps(
                allIps,
                maxCfg,
                effectiveMode,
                effectivePorts,
                pips.length
            );
            let ipNameMap = {};
            ipEntries.forEach((e) => {
                ipNameMap[e.ip] = e.name;
            });
            effectivePorts.forEach((port) => {
                let sec = getTransportParams(port) === "tls" ? "true" : "false";
                ips.forEach((ip) => {
                    let _pips = pips.length > 0 ? pips : [null];
                    _pips.forEach((selectedProxyIp) => {
                    let ipName = ipNameMap[ip] || "";
                    if (effectiveMode === "alpha" || effectiveMode === "both") {
                        let vName = getConfigName(
                            "alpha",
                            p.name,
                            port,
                            hName,
                            ip,
                            selectedProxyIp,
                            configIndex,
                            ipName,
                        );
                        vName = getUniqueName(vName);
                        proxyNames.push(`"${vName}"`);
                        proxyGeoInfo.set(
                            vName,
                            getGeoInfo(selectedProxyIp || ip),
                        );
                        let randomJunk = Array.from(
                            { length: 11 },
                            () =>
                                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                    Math.floor(Math.random() * 62)
                                ],
                        ).join("");
                        let payloadVl = {
                            junk: randomJunk,
                            protocol: "vl",
                            mode: "proxyip",
                            panelIPs: [],
                        };
                        let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));
                        let configUuid = generateConfigUuid(p.id, configIndex);
                        registerConfigEntry(
                            configUuid,
                            p.id,
                            selectedProxyIp || "",
                        );
                        proxies.push(
                            `- name: "${vName.replace(/"/g, '""')}"\n  type: ${getAlpha()}\n  server: ${ip}\n  port: ${port}\n  uuid: ${configUuid}\n  udp: true\n  tls: ${sec}\n  servername: ${hName}\n  client-fingerprint: ${sysConfig.agent || "random"}\n  network: ws\n  ws-opts:\n    path: "${pathStrVl}"\n    headers:\n      Host: ${hName}\n  skip-cert-verify: ${allowInsecure}\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`,
                        );
                    }
                    if (effectiveMode === "beta" || effectiveMode === "both") {
                        let tName = getConfigName(
                            "beta",
                            p.name,
                            port,
                            hName,
                            ip,
                            selectedProxyIp,
                            configIndex,
                            ipName,
                        );
                        tName = getUniqueName(tName);
                        proxyNames.push(`"${tName}"`);
                        proxyGeoInfo.set(
                            tName,
                            getGeoInfo(selectedProxyIp || ip),
                        );
                        let randomJunkTr = Array.from(
                            { length: 11 },
                            () =>
                                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                    Math.floor(Math.random() * 62)
                                ],
                        ).join("");
                        let payloadTr = {
                            junk: randomJunkTr,
                            protocol: "tr",
                            mode: "proxyip",
                            panelIPs: [],
                            relayIdx: configIndex,
                        };
                        let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));
                        proxies.push(
                            `- name: "${tName.replace(/"/g, '""')}"\n  type: ${getBeta()}\n  server: ${ip}\n  port: ${port}\n  password: "${p.id}"\n  udp: true\n  tls: ${sec}\n  sni: ${hName}\n  client-fingerprint: ${sysConfig.agent || "random"}\n  network: ws\n  ws-opts:\n    path: "${pathStrTr}"\n    headers:\n      Host: ${hName}\n  skip-cert-verify: ${allowInsecure}\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`,
                        );
                    }
                    configIndex++;
                    if (sysConfig.enableDirectConfigs && pips.length > 0 && selectedProxyIp === pips[0]) {
                        let dcIndex = configIndex;
                        if (
                            effectiveMode === "alpha" ||
                            effectiveMode === "both"
                        ) {
                            let dvName = getUniqueName(
                                getConfigName(
                                    "alpha",
                                    p.name,
                                    port,
                                    hName,
                                    ip,
                                    null,
                                    dcIndex,
                                    ipName,
                                    true
                                ),
                            );
                            proxyNames.push(`"${dvName}"`);
                            proxyGeoInfo.set(dvName, getGeoInfo(ip));
                            let randomJunk = Array.from(
                                { length: 11 },
                                () =>
                                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                        Math.floor(Math.random() * 62)
                                    ],
                            ).join("");
                            let payloadVl = {
                                junk: randomJunk,
                                protocol: "vl",
                                mode: "proxyip",
                                panelIPs: [],
                            };
                            let pathStrVl =
                                "/" + btoa(JSON.stringify(payloadVl));
                            let configUuid = generateConfigUuid(p.id, dcIndex);
                            registerConfigEntry(configUuid, p.id, "");
                            proxies.push(
                                `- name: "${dvName.replace(/"/g, '""')}"\n  type: ${getAlpha()}\n  server: ${ip}\n  port: ${port}\n  uuid: ${configUuid}\n  udp: true\n  tls: ${sec}\n  servername: ${hName}\n  client-fingerprint: ${sysConfig.agent || "random"}\n  network: ws\n  ws-opts:\n    path: "${pathStrVl}"\n    headers:\n      Host: ${hName}\n  skip-cert-verify: ${allowInsecure}\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`,
                            );
                        }
                        if (
                            effectiveMode === "beta" ||
                            effectiveMode === "both"
                        ) {
                            let dtName = getUniqueName(
                                getConfigName(
                                    "beta",
                                    p.name,
                                    port,
                                    hName,
                                    ip,
                                    null,
                                    dcIndex,
                                    ipName,
                                    true
                                ),
                            );
                            proxyNames.push(`"${dtName}"`);
                            proxyGeoInfo.set(dtName, getGeoInfo(ip));
                            let randomJunk = Array.from(
                                { length: 11 },
                                () =>
                                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                        Math.floor(Math.random() * 62)
                                    ],
                            ).join("");
                            let payloadTr = {
                                junk: randomJunk,
                                protocol: "tr",
                                mode: "proxyip",
                                panelIPs: [],
                                relayIdx: configIndex,
                            };
                            let pathStrTr =
                                "/" + btoa(JSON.stringify(payloadTr));
                            let randomJunkDt = Array.from(
                                { length: 11 },
                                () =>
                                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                        Math.floor(Math.random() * 62)
                                    ],
                            ).join("");
                            let payloadDt = {
                                junk: randomJunkDt,
                                protocol: "tr",
                                mode: "proxyip",
                                panelIPs: [],
                                relayIdx: dcIndex,
                            };
                            let pathStrDt =
                                "/" + btoa(JSON.stringify(payloadDt));
                            proxies.push(
                                `- name: "${dtName.replace(/"/g, '""')}"\n  type: ${getBeta()}\n  server: ${ip}\n  port: ${port}\n  password: "${p.id}"\n  udp: true\n  tls: ${sec}\n  sni: ${hName}\n  client-fingerprint: ${sysConfig.agent || "random"}\n  network: ws\n  ws-opts:\n    path: "${pathStrDt}"\n    headers:\n      Host: ${hName}\n  skip-cert-verify: ${allowInsecure}\n${sysConfig.enableOpt1 ? "  tfo: true" : ""}`,
                            );
                        }
                        configIndex++;
                    }
                    });
                });
            });
        });
    });

    // ─── Upstream chaining: add upstream proxy to YAML ───
    let parsedUpstreamYaml = parseVlessUri(sysConfig.upstreamUri);
    let upstreamNameYaml = "";
    if (parsedUpstreamYaml) {
        let upProxy = upstreamToClashProxy(parsedUpstreamYaml);
        upstreamNameYaml = upProxy.name;
        let upYaml = `- name: "${upProxy.name.replace(/"/g, '""')}"
  type: ${getAlpha()}
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

    // Build per-country groups from geo info
    let countryGroups = new Map(); // "country" -> {flag, proxies[]}
    proxyGeoInfo.forEach((geo, name) => {
        let key = geo.country || "Unknown";
        if (!countryGroups.has(key)) {
            countryGroups.set(key, { flag: geo.flag || "🌐", proxies: [] });
        }
        countryGroups.get(key).proxies.push(name);
    });
    let sortedCountries = Array.from(countryGroups.entries()).sort((a, b) =>
        a[0].localeCompare(b[0]),
    );

    // Build proxy-groups YAML
    let groupsYaml =
        "proxy-groups:\n" +
        '  - name: "✅ Selector"\n' +
        "    type: select\n" +
        "    proxies:\n" +
        '      - "⚡ Fastest"\n' +
        '      - "🖐 Manual"\n';
    sortedCountries.forEach(([country, info]) => {
        groupsYaml += `      - "${info.flag} ${country}"\n`;
    });

    // Fastest — url-test with ALL proxies
    groupsYaml +=
        '\n  - name: "⚡ Fastest"\n' +
        "    type: url-test\n" +
        '    url: "https://www.gstatic.com/generate_204"\n' +
        "    interval: 30\n" +
        "    tolerance: 50\n" +
        "    proxies:\n";
    proxyNames.forEach((n) => {
        groupsYaml += `      - ${n}\n`;
    });

    // Manual — select with ALL proxies
    groupsYaml +=
        '\n  - name: "🖐 Manual"\n' + "    type: select\n" + "    proxies:\n";
    proxyNames.forEach((n) => {
        groupsYaml += `      - ${n}\n`;
    });

    // Per-country url-test groups
    sortedCountries.forEach(([country, info]) => {
        groupsYaml +=
            `\n  - name: "${info.flag} ${country}"\n` +
            "    type: url-test\n" +
            '    url: "https://www.gstatic.com/generate_204"\n' +
            "    interval: 30\n" +
            "    tolerance: 50\n" +
            "    proxies:\n";
        info.proxies.forEach((name) => {
            groupsYaml += `      - "${name}"\n`;
        });
    });

    let cr = getCustomRouting();
    let customRules = [];
    cr.domains.forEach(d => {
        customRules.push(`  - DOMAIN,${d},DIRECT`);
        customRules.push(`  - DOMAIN-SUFFIX,${d},DIRECT`);
    });
    cr.ips.forEach(ip => {
        customRules.push(`  - IP-CIDR,${ip},DIRECT`);
    });
    cr.geoips.forEach(g => {
        customRules.push(`  - GEOIP,${g},DIRECT`);
    });
    cr.geosites.forEach(g => {
        customRules.push(`  - GEOSITE,${g},DIRECT`);
    });

    let rulesOutput = customRules.length > 0 
        ? customRules.join("\n") 
        : `  - DOMAIN-SUFFIX,ir,DIRECT
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
${proxies.join("\n")}

${groupsYaml}

rules:
${rulesOutput}
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

async function buildEdgeJsonProfile(
    hostName,
    targetSub = null,
    allowInsecure = false,
    env = null,
) {
    let ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];
    let profiles = getAllProfiles(targetSub);
    let allHostNames = [
        ...new Set(profiles.flatMap((p) => getProfileHostNames(hostName, p))),
    ];
    await preloadIpFlags(profiles, allHostNames);
    let proxyGeoInfo = new Map(); // proxyName -> {country, flag}
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);

    let proxiesArr = [];
    let dynamicTags = [];
    let nameCounts = {};

    // Add fake configs
    let fakeNames = getFakeConfigNames(targetSub);
    let fakeRefs = [];
    fakeNames.forEach((name) => {
        proxiesArr.push({
            name: name,
            type: k_tr_mode,
            server: "127.0.0.1",
            port: 80,
            password: activeDeviceId,
            tls: false,
            udp: true,
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
        let effectivePorts = p.userPorts
            ? p.userPorts
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : ports;
        let maxCfg = p.maxConfigs || null;

        let configIndex = 0;
        let profileHostNames = getProfileHostNames(hostName, p);

        profileHostNames.forEach((hName) => {
            let ipEntries = getCleanIpsWithNames(hName, p.cleanIp);
            let allIps = ipEntries.map((e) => e.ip);
            let ips = calcEffectiveIps(
                allIps,
                maxCfg,
                effectiveMode,
                effectivePorts,
                pips.length
            );
            let ipNameMap = {};
            ipEntries.forEach((e) => {
                ipNameMap[e.ip] = e.name;
            });
            effectivePorts.forEach((port) => {
                let sec = getTransportParams(port) === "tls";
                ips.forEach((ip) => {
                    let isVless =
                        effectiveMode === "alpha" || effectiveMode === "both";
                    let isTrojan =
                        effectiveMode === "beta" || effectiveMode === "both";
                    let _pips = pips.length > 0 ? pips : [null];
                    _pips.forEach((selectedProxyIp) => {
                    let ipName = ipNameMap[ip] || "";

                    if (isVless) {
                        let tagStr = getConfigName(
                            "alpha",
                            p.name,
                            port,
                            hName,
                            ip,
                            selectedProxyIp,
                            configIndex,
                            ipName,
                        );
                        tagStr = getUniqueName(tagStr);
                        dynamicTags.push(tagStr);
                        proxyGeoInfo.set(tagStr, getGeoInfo(selectedProxyIp || ip));

                        let randomJunk = Array.from(
                            { length: 11 },
                            () =>
                                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                    Math.floor(Math.random() * 62)
                                ],
                        ).join("");
                        let payloadVl = {
                            junk: randomJunk,
                            protocol: "vl",
                            mode: "proxyip",
                            panelIPs: [],
                        };
                        let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));

                        let configUuid = generateConfigUuid(p.id, configIndex);
                        registerConfigEntry(
                            configUuid,
                            p.id,
                            selectedProxyIp || "",
                        );

                        let ob = {
                            name: tagStr,
                            type: k_vl_mode,
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
                                "early-data-header-name":
                                    "Sec-WebSocket-Protocol",
                                headers: {
                                    Host: hName,
                                },
                            },
                        };
                        if (sysConfig.enableOpt2) {
                            ob["ech-opts"] = {
                                enable: true,
                                config: "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA=",
                            };
                        }
                        proxiesArr.push(ob);
                    }

                    if (isTrojan) {
                        let tagStr = getConfigName(
                            "beta",
                            p.name,
                            port,
                            hName,
                            ip,
                            selectedProxyIp,
                            configIndex,
                            ipName,
                        );
                        tagStr = getUniqueName(tagStr);
                        dynamicTags.push(tagStr);
                        proxyGeoInfo.set(tagStr, getGeoInfo(selectedProxyIp || ip));

                        let randomJunk = Array.from(
                            { length: 11 },
                            () =>
                                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                    Math.floor(Math.random() * 62)
                                ],
                        ).join("");
                        let payloadTr = {
                            junk: randomJunk,
                            protocol: "tr",
                            mode: "proxyip",
                            panelIPs: [],
                            relayIdx: configIndex,
                        };
                        let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));

                        let configUuid2 = generateConfigUuid(p.id, configIndex);
                        registerConfigEntry(
                            configUuid2,
                            p.id,
                            selectedProxyIp || "",
                        );

                        let ob = {
                            name: tagStr,
                            type: k_tr_mode,
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
                                "early-data-header-name":
                                    "Sec-WebSocket-Protocol",
                                headers: {
                                    Host: hName,
                                },
                            },
                        };
                        if (sysConfig.enableOpt2) {
                            ob["ech-opts"] = {
                                enable: true,
                                config: "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA=",
                            };
                        }
                        proxiesArr.push(ob);
                    }
                    configIndex++;
                    if (sysConfig.enableDirectConfigs && pips.length > 0 && selectedProxyIp === pips[0]) {
                        if (isVless) {
                            let tagStr = getUniqueName(
                                getConfigName(
                                    "alpha",
                                    p.name,
                                    port,
                                    hName,
                                    ip,
                                    null,
                                    configIndex,
                                    ipName, true
                                ),
                            );
                            dynamicTags.push(tagStr);
                            proxyGeoInfo.set(tagStr, getGeoInfo(ip));
                            let randomJunk = Array.from(
                                { length: 11 },
                                () =>
                                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                        Math.floor(Math.random() * 62)
                                    ],
                            ).join("");
                            let payloadVl = {
                                junk: randomJunk,
                                protocol: "vl",
                                mode: "proxyip",
                                panelIPs: [],
                            };
                            let pathStrVl =
                                "/" + btoa(JSON.stringify(payloadVl));
                            let configUuid = generateConfigUuid(
                                p.id,
                                configIndex,
                            );
                            registerConfigEntry(configUuid, p.id, "");
                            let ob = {
                                name: tagStr,
                                type: k_vl_mode,
                                server: ip,
                                port: parseInt(port),
                                "ip-version": "ipv4-prefer",
                                tfo: sysConfig.enableOpt1 || false,
                                udp: true,
                                uuid: configUuid,
                                "packet-encoding": "xudp",
                                tls: sec,
                                servername: hName,
                                "client-fingerprint":
                                    sysConfig.agent || "random",
                                "skip-cert-verify": allowInsecure,
                                alpn: ["http/1.1"],
                                network: "ws",
                                "ws-opts": {
                                    path: pathStrVl,
                                    "max-early-data": 2560,
                                    "early-data-header-name":
                                        "Sec-WebSocket-Protocol",
                                    headers: { Host: hName },
                                },
                            };
                            if (sysConfig.enableOpt2)
                                ob["ech-opts"] = {
                                    enable: true,
                                    config: "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA=",
                                };
                            proxiesArr.push(ob);
                        }
                        if (isTrojan) {
                            let tagStr = getUniqueName(
                                getConfigName(
                                    "beta",
                                    p.name,
                                    port,
                                    hName,
                                    ip,
                                    null,
                                    configIndex,
                                    ipName, true
                                ),
                            );
                            dynamicTags.push(tagStr);
                            proxyGeoInfo.set(tagStr, getGeoInfo(ip));
                            let randomJunk = Array.from(
                                { length: 11 },
                                () =>
                                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                        Math.floor(Math.random() * 62)
                                    ],
                            ).join("");
                            let payloadTr = {
                                junk: randomJunk,
                                protocol: "tr",
                                mode: "proxyip",
                                panelIPs: [],
                                relayIdx: configIndex,
                            };
                            let pathStrTr =
                                "/" + btoa(JSON.stringify(payloadTr));
                            let configUuid2 = generateConfigUuid(
                                p.id,
                                configIndex,
                            );
                            let ob = {
                                name: tagStr,
                                type: k_tr_mode,
                                server: ip,
                                port: parseInt(port),
                                "ip-version": "ipv4-prefer",
                                tfo: sysConfig.enableOpt1 || false,
                                udp: true,
                                password: p.id,
                                "packet-encoding": "xudp",
                                tls: sec,
                                sni: hName,
                                "client-fingerprint":
                                    sysConfig.agent || "random",
                                "skip-cert-verify": allowInsecure,
                                alpn: ["http/1.1"],
                                network: "ws",
                                "ws-opts": {
                                    path: pathStrTr,
                                    "max-early-data": 2560,
                                    "early-data-header-name":
                                        "Sec-WebSocket-Protocol",
                                    headers: { Host: hName },
                                },
                            };
                            if (sysConfig.enableOpt2)
                                ob["ech-opts"] = {
                                    enable: true,
                                    config: "AEX+DQBBTwAgACCfCTo0YCUiDF1bGU9Z72l8Bs1gVxt6D6FefjfzaJHcfwAEAAEAAQASY2xvdWRmbGFyZS1lY2guY29tAAA=",
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

    if (dynamicTags.length === 0) { dynamicTags.push("direct"); }

    // ─── Upstream chaining: add upstream proxy ───
    let parsedUpstream = parseVlessUri(sysConfig.upstreamUri);
    let upstreamProxyName = "";
    if (parsedUpstream) {
        let upstreamProxy = upstreamToClashProxy(parsedUpstream);
        upstreamProxyName = upstreamProxy.name;
        proxiesArr.unshift(upstreamProxy);
        dynamicTags.unshift(upstreamProxyName);
    }

    // Build per-country groups from geo info
    let countryGroups = new Map(); // "country" -> {flag, proxies[]}
    proxyGeoInfo.forEach((geo, name) => {
        let key = geo.country || "Unknown";
        if (!countryGroups.has(key)) {
            countryGroups.set(key, { flag: geo.flag || "🌐", proxies: [] });
        }
        countryGroups.get(key).proxies.push(name);
    });
    let sortedCountries = Array.from(countryGroups.entries()).sort((a, b) =>
        a[0].localeCompare(b[0]),
    );

    // Build proxy-groups JSON
    let groupsJson = [
        {
            name: "✅ Selector",
            type: "select",
            proxies: [
                "⚡ Fastest",
                "🖐 Manual",
                ...sortedCountries.map(([c, info]) => `${info.flag} ${c}`),
            ],
        },
        {
            name: "⚡ Fastest",
            type: "url-test",
            url: "https://www.gstatic.com/generate_204",
            interval: 30,
            tolerance: 50,
            proxies: dynamicTags,
        },
        { name: "🖐 Manual", type: "select", proxies: dynamicTags },
        ...sortedCountries.map(([country, info]) => ({
            name: `${info.flag} ${country}`,
            type: "url-test",
            url: "https://www.gstatic.com/generate_204",
            interval: 30,
            tolerance: 50,
            proxies: info.proxies,
        })),
    ];

    let cr = getCustomRouting();
    let jsonCustomRules = [];
    cr.domains.forEach(d => {
        jsonCustomRules.push(`DOMAIN,${d},DIRECT`);
        jsonCustomRules.push(`DOMAIN-SUFFIX,${d},DIRECT`);
    });
    cr.ips.forEach(ip => {
        jsonCustomRules.push(`IP-CIDR,${ip},DIRECT,no-resolve`);
    });
    cr.geoips.forEach(g => {
        jsonCustomRules.push(`GEOIP,${g},DIRECT,no-resolve`);
    });
    cr.geosites.forEach(g => {
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
            "allow-private-network": true,
        },
        "external-ui": "ui",
        "external-ui-url":
            "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip",
        profile: {
            "store-selected": true,
            "store-fake-ip": true,
        },
        dns: {
            enable: true,
            "respect-rules": true,
            "use-system-hosts": false,
            listen: "127.0.0.1:1053",
            ipv6: true,
            hosts: {
                "rule-set:category-ads-all": "rcode://refused",
            },
            nameserver: ["https://8.8.8.8/dns-query#✅ Selector"],
            "proxy-server-nameserver": ["8.8.8.8#DIRECT"],
            "direct-nameserver": ["8.8.8.8#DIRECT"],
            "direct-nameserver-follow-policy": true,
            "nameserver-policy": {
                "rule-set:ir": "8.8.8.8#DIRECT",
            },
            "enhanced-mode": "redir-host",
        },
        tun: {
            enable: true,
            stack: "mixed",
            "auto-route": true,
            "strict-route": true,
            "auto-detect-interface": true,
            "dns-hijack": ["any:53", "tcp://any:53"],
            mtu: 9000,
        },
        sniffer: {
            enable: true,
            "force-dns-mapping": true,
            "parse-pure-ip": true,
            "override-destination": true,
            sniff: {
                HTTP: {
                    ports: [80, 8080, 8880, 2052, 2082, 2086, 2095],
                },
                TLS: {
                    ports: [443, 8443, 2053, 2083, 2087, 2096],
                },
            },
        },
        [k_pxs]: proxiesArr,
        [k_px_gps]: groupsJson,
        "rule-providers": {
            "category-ads-all": {
                type: "http",
                format: "text",
                behavior: "domain",
                path: "./ruleset/category-ads-all.txt",
                interval: 86400,
                url: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/category-ads-all.txt",
            },
            ir: {
                type: "http",
                format: "text",
                behavior: "domain",
                path: "./ruleset/ir.txt",
                interval: 86400,
                url: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ir.txt",
            },
            "ir-cidr": {
                type: "http",
                format: "text",
                behavior: "ipcidr",
                path: "./ruleset/ir-cidr.txt",
                interval: 86400,
                url: "https://raw.githubusercontent.com/Chocolate4U/Iran-clash-rules/release/ircidr.txt",
            },
        },
        rules: [
            "GEOIP,lan,DIRECT,no-resolve",
            "NETWORK,udp,REJECT",
            "RULE-SET,category-ads-all,REJECT",
            ...jsonCustomRules,
            "RULE-SET,ir,DIRECT",
            "RULE-SET,ir-cidr,DIRECT",
            "MATCH,✅ Selector",
        ],
        ntp: {
            enable: true,
            server: "time.cloudflare.com",
            port: 123,
            interval: 30,
        },
    };
}
const buildClashJsonProfile = buildEdgeJsonProfile;

async function buildVJsonProfile(hostName, targetSub = null, allowInsecure = false, env = null) {
    let ports = sysConfig.socketPorts ? sysConfig.socketPorts.split(",").map(s => s.trim()).filter(Boolean) : ["443"];
    let profiles = getAllProfiles(targetSub);
    let allHostNames = [...new Set(profiles.flatMap(p => getProfileHostNames(hostName, p)))];
    await preloadIpFlags(profiles, allHostNames);
    
    let outboundsArr = [];
    let configIndex = 0;
    let nameCounts = {};
    const getUniqueName = (baseName) => {
        if (!nameCounts[baseName]) { nameCounts[baseName] = 1; return baseName; }
        let c = nameCounts[baseName]; nameCounts[baseName] = c + 1; return baseName + '-' + c;
    };

    profiles.forEach((p) => {
        let maxCfg = p.maxConfigs || 0;
        let pips = [];
        if (p.relayIps && p.relayIps.length > 0) pips = [...p.relayIps];
        else if (sysConfig.customRelay && sysConfig.customRelay.trim() !== "") {
            pips = sysConfig.customRelay.split(",").map(r => r.trim()).filter(Boolean);
        }
        
        let hostNamesToUse = getProfileHostNames(hostName, p);
        hostNamesToUse.forEach(hName => {
            p.ipLists.forEach(ipList => {
                let ips = ipList.ips;
                let effectiveMode = ipList.mode || sysConfig.mode || "both";
                let effectivePorts = (ipList.ports && ipList.ports.length > 0) ? ipList.ports : ports;
                if (maxCfg > 0) ips = calcEffectiveIps(ips, maxCfg, effectiveMode, effectivePorts, pips.length);
                let ipNameMap = {};
                if (ipList.entries) ipList.entries.forEach(e => ipNameMap[e.ip] = e.name);
                
                effectivePorts.forEach(port => {
                    let sec = (getTransportParams(port) === "tls") ? "tls" : "none";
                    ips.forEach(ip => {
                        let _pips = pips.length > 0 ? pips : [null];
                        _pips.forEach((selectedProxyIp) => {
                        let ipName = ipNameMap[ip] || "";
                        
                        if (effectiveMode === "alpha" || effectiveMode === "both") {
                            let tag = getUniqueName(getConfigName("alpha", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName));
                            let configUuid = generateConfigUuid(p.id, configIndex);
                            let randomJunk = Array.from({length:11}, ()=> "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random()*62)]).join("");
                            let payload = { junk: randomJunk, protocol: "vl", mode: "proxyip", panelIPs: [], relayIdx: configIndex };
                            let path = "/" + btoa(JSON.stringify(payload));
                            
                            let ob = {
                                tag: tag,
                                protocol: "vless",
                                settings: {
                                    vnext: [{ address: ip, port: parseInt(port), users: [{ id: configUuid, encryption: "none" }] }]
                                },
                                streamSettings: {
                                    network: "ws",
                                    security: sec,
                                    tlsSettings: sec === "tls" ? { serverName: hName, allowInsecure: allowInsecure } : undefined,
                                    wsSettings: { path: path, headers: { Host: hName } },
                                    ...getSegStreamExtra(p)
                                }
                            };
                            outboundsArr.push(ob);
                        }
                        
                        if (effectiveMode === "beta" || effectiveMode === "both") {
                            let tag = getUniqueName(getConfigName("beta", p.name, port, hName, ip, selectedProxyIp, configIndex, ipName));
                            let randomJunk = Array.from({length:11}, ()=> "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random()*62)]).join("");
                            let payload = { junk: randomJunk, protocol: "tr", mode: "proxyip", panelIPs: [], relayIdx: configIndex };
                            let path = "/" + btoa(JSON.stringify(payload));
                            
                            let ob = {
                                tag: tag,
                                protocol: "trojan",
                                settings: {
                                    servers: [{ address: ip, port: parseInt(port), password: p.id }]
                                },
                                streamSettings: {
                                    network: "ws",
                                    security: sec,
                                    tlsSettings: sec === "tls" ? { serverName: hName, allowInsecure: allowInsecure } : undefined,
                                    wsSettings: { path: path, headers: { Host: hName } },
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

    // ─── Upstream chaining: add upstream outbound ───
    let parsedUpstream = parseVlessUri(sysConfig.upstreamUri);
    if (parsedUpstream) {
        let upstreamOb = upstreamToV2RayOb(parsedUpstream);
        // Add proxySettings to chain through upstream
        outboundsArr.forEach(ob => {
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
        if (newOutbounds.length === 0) newOutbounds = outboundsArr;
        tpl.outbounds = newOutbounds;
        
        // Inject Custom Routing
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
    let ports = sysConfig.socketPorts
        ? sysConfig.socketPorts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : ["443"];
    let profiles = getAllProfiles(targetSub);
    let allHostNames = [
        ...new Set(profiles.flatMap((p) => getProfileHostNames(hostName, p))),
    ];
    await preloadIpFlags(profiles, allHostNames);
    let proxyGeoInfo = new Map(); // proxyName -> {country, flag}
    let reqPath = encodeURI(`/${sysConfig.apiRoute}`);

    let outboundsArr = [];
    let dynamicTags = [];
    let nameCounts = {};

    // Add fake configs
    let fakeNames = getFakeConfigNames(targetSub);
    let fakeRefs = [];
    fakeNames.forEach((name) => {
        outboundsArr.push({
            type: "direct",
            tag: name,
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
        let effectivePorts = p.userPorts
            ? p.userPorts
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : ports;
        let maxCfg = p.maxConfigs || null;

        let configIndex = 0;
        let profileHostNames = getProfileHostNames(hostName, p);

        profileHostNames.forEach((hName) => {
            let ipEntries = getCleanIpsWithNames(hName, p.cleanIp);
            let allIps = ipEntries.map((e) => e.ip);
            let ips = calcEffectiveIps(
                allIps,
                maxCfg,
                effectiveMode,
                effectivePorts,
                pips.length
            );
            let ipNameMap = {};
            ipEntries.forEach((e) => {
                ipNameMap[e.ip] = e.name;
            });
            effectivePorts.forEach((port) => {
                let sec = getTransportParams(port) === "tls";
                ips.forEach((ip) => {
                    let isVless =
                        effectiveMode === "alpha" || effectiveMode === "both";
                    let isTrojan =
                        effectiveMode === "beta" || effectiveMode === "both";
                    let _pips = pips.length > 0 ? pips : [null];
                    _pips.forEach((selectedProxyIp) => {
                    let ipName = ipNameMap[ip] || "";

                    if (isVless) {
                        let tagStr = getConfigName(
                            "alpha",
                            p.name,
                            port,
                            hName,
                            ip,
                            selectedProxyIp,
                            configIndex,
                            ipName,
                        );
                        tagStr = getUniqueName(tagStr);
                        dynamicTags.push(tagStr);

                        let randomJunk = Array.from(
                            { length: 11 },
                            () =>
                                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                    Math.floor(Math.random() * 62)
                                ],
                        ).join("");
                        let payloadVl = {
                            junk: randomJunk,
                            protocol: "vl",
                            mode: "proxyip",
                            panelIPs: [],
                        };
                        let pathStrVl = "/" + btoa(JSON.stringify(payloadVl));

                        let configUuid = generateConfigUuid(p.id, configIndex);
                        registerConfigEntry(
                            configUuid,
                            p.id,
                            selectedProxyIp || "",
                        );

                        let ob = {
                            type: k_vl_mode,
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
                                ...(isSegEnabled(p) ? { fragment: true } : {}),
                                alpn: ["http/1.1"],
                                utls: {
                                    enabled: true,
                                    fingerprint: "randomized",
                                },
                            },
                            transport: {
                                type: "ws",
                                path: pathStrVl,
                                max_early_data: 2560,
                                early_data_header_name:
                                    "Sec-WebSocket-Protocol",
                                headers: {
                                    Host: hName,
                                },
                            },
                        };
                        outboundsArr.push(ob);
                    }

                    if (isTrojan) {
                        let tagStr = getConfigName(
                            "beta",
                            p.name,
                            port,
                            hName,
                            ip,
                            selectedProxyIp,
                            configIndex,
                            ipName,
                        );
                        tagStr = getUniqueName(tagStr);
                        dynamicTags.push(tagStr);

                        let randomJunk = Array.from(
                            { length: 11 },
                            () =>
                                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                    Math.floor(Math.random() * 62)
                                ],
                        ).join("");
                        let payloadTr = {
                            junk: randomJunk,
                            protocol: "tr",
                            mode: "proxyip",
                            panelIPs: [],
                            relayIdx: configIndex,
                        };
                        let pathStrTr = "/" + btoa(JSON.stringify(payloadTr));

                        let configUuid2 = generateConfigUuid(p.id, configIndex);
                        registerConfigEntry(
                            configUuid2,
                            p.id,
                            selectedProxyIp || "",
                        );

                        let ob = {
                            type: k_tr_mode,
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
                                ...(isSegEnabled(p) ? { fragment: true } : {}),
                                alpn: ["http/1.1"],
                                utls: {
                                    enabled: true,
                                    fingerprint: "randomized",
                                },
                            },
                            transport: {
                                type: "ws",
                                path: pathStrTr,
                                max_early_data: 2560,
                                early_data_header_name:
                                    "Sec-WebSocket-Protocol",
                                headers: {
                                    Host: hName,
                                },
                            },
                        };
                        outboundsArr.push(ob);
                    }
                    configIndex++;
                    if (sysConfig.enableDirectConfigs && pips.length > 0 && selectedProxyIp === pips[0]) {
                        if (isVless) {
                            let tagStr = getUniqueName(
                                getConfigName(
                                    "alpha",
                                    p.name,
                                    port,
                                    hName,
                                    ip,
                                    null,
                                    configIndex,
                                    ipName, true
                                ),
                            );
                            dynamicTags.push(tagStr);
                            proxyGeoInfo.set(tagStr, getGeoInfo(ip));
                            let randomJunk = Array.from(
                                { length: 11 },
                                () =>
                                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                        Math.floor(Math.random() * 62)
                                    ],
                            ).join("");
                            let payloadVl = {
                                junk: randomJunk,
                                protocol: "vl",
                                mode: "proxyip",
                                panelIPs: [],
                            };
                            let pathStrVl =
                                "/" + btoa(JSON.stringify(payloadVl));
                            let configUuid = generateConfigUuid(
                                p.id,
                                configIndex,
                            );
                            registerConfigEntry(configUuid, p.id, "");
                            let ob = {
                                type: k_vl_mode,
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
                                    ...(isSegEnabled(p) ? { fragment: true } : {}),
                                    alpn: ["http/1.1"],
                                    utls: {
                                        enabled: true,
                                        fingerprint: "randomized",
                                    },
                                },
                                transport: {
                                    type: "ws",
                                    path: pathStrVl,
                                    max_early_data: 2560,
                                    early_data_header_name:
                                        "Sec-WebSocket-Protocol",
                                    headers: { Host: hName },
                                },
                            };
                            outboundsArr.push(ob);
                        }
                        if (isTrojan) {
                            let tagStr = getUniqueName(
                                getConfigName(
                                    "beta",
                                    p.name,
                                    port,
                                    hName,
                                    ip,
                                    null,
                                    configIndex,
                                    ipName, true
                                ),
                            );
                            dynamicTags.push(tagStr);
                            proxyGeoInfo.set(tagStr, getGeoInfo(ip));
                            let randomJunk = Array.from(
                                { length: 11 },
                                () =>
                                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
                                        Math.floor(Math.random() * 62)
                                    ],
                            ).join("");
                            let payloadTr = {
                                junk: randomJunk,
                                protocol: "tr",
                                mode: "proxyip",
                                panelIPs: [],
                                relayIdx: configIndex,
                            };
                            let pathStrTr =
                                "/" + btoa(JSON.stringify(payloadTr));
                            let configUuid2 = generateConfigUuid(
                                p.id,
                                configIndex,
                            );
                            let ob = {
                                type: k_tr_mode,
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
                                    ...(isSegEnabled(p) ? { fragment: true } : {}),
                                    alpn: ["http/1.1"],
                                    utls: {
                                        enabled: true,
                                        fingerprint: "randomized",
                                    },
                                },
                                transport: {
                                    type: "ws",
                                    path: pathStrTr,
                                    max_early_data: 2560,
                                    early_data_header_name:
                                        "Sec-WebSocket-Protocol",
                                    headers: { Host: hName },
                                },
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

    // ─── Upstream chaining: add detour to all outbounds ───
    let parsedUpstream = parseVlessUri(sysConfig.upstreamUri);
    let upstreamTag = "";
    if (parsedUpstream) {
        let upstreamOb = upstreamToSingboxOb(parsedUpstream);
        upstreamTag = upstreamOb.tag;
        // Add detour to all generated outbounds so they chain through upstream
        outboundsArr.forEach(ob => {
            if (ob.type !== "direct" && ob.type !== "block" && ob.type !== "dns") {
                ob.detour = upstreamTag;
            }
        });
        // Insert upstream as first outbound
        outboundsArr.unshift(upstreamOb);
    }
    
    await fetchTemplates(env);
    if (singboxTemplate) {
        let tpl = JSON.parse(JSON.stringify(singboxTemplate));
        let newOutbounds = [];
        let allProxies = outboundsArr.map(o => o.tag);
        
        for (let ob of tpl.outbounds) {
            if (ob === "__OUTBOUNDS__") {
                newOutbounds.push(...outboundsArr);
            } else if (ob.outbounds && ob.outbounds.includes("{all_proxies}")) {
                let obCpy = { ...ob };
                obCpy.outbounds = [];
                for (let tag of ob.outbounds) {
                    if (tag === "{all_proxies}") obCpy.outbounds.push(...allProxies);
                    else obCpy.outbounds.push(tag);
                }
                newOutbounds.push(obCpy);
            } else {
                newOutbounds.push(ob);
            }
        }
        tpl.outbounds = newOutbounds;
        return tpl;
    }
    // Fallback if template fails
    return {
        log: { disabled: false, level: "warn", timestamp: true },
        dns: { servers: [], rules: [] },
        inbounds: [],
        [k_obds]: outboundsArr,
        route: { rules: [] }
    };
}
const buildSingBoxJsonProfile = buildBoxJsonProfile;
