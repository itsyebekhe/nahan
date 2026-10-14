#!/usr/bin/env python3
import os
import re

with open("_worker.js", "r", encoding="utf-8") as f:
    full_code = f.read()

def extract_func(name):
    pattern = re.compile(rf"^(?:async\s+)?function\s+{re.escape(name)}\s*\(", re.MULTILINE)
    m = pattern.search(full_code)
    if not m:
        raise ValueError(f"Function {name} not found!")
    start = m.start()
    param_end = full_code.find(")", start)
    first_brace = full_code.find("{", param_end)
    depth = 0
    idx = first_brace
    while idx < len(full_code):
        char = full_code[idx]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                end = idx + 1
                return full_code[start:end].strip()
        idx += 1
    return full_code[start:].strip()

def export_func(name):
    code = extract_func(name)
    if code.startswith("async function") or code.startswith("function"):
        return "export " + code
    return code

os.makedirs("src/core", exist_ok=True)
os.makedirs("src/protocols", exist_ok=True)
os.makedirs("src/relays", exist_ok=True)
os.makedirs("src/api", exist_ok=True)
os.makedirs("src/converters", exist_ok=True)
os.makedirs("src/templates", exist_ok=True)

# 1. src/core/constants.js
sys_def_start = full_code.find("const SYSTEM_DEFAULTS = {")
sys_def_end = full_code.find("let INFLIGHT_HTTP = 0;", sys_def_start)
sys_defaults_code = full_code[sys_def_start:sys_def_end].strip()

constants_code = f"""// Core Constants & Protocol Identifier Strings
export const CURRENT_VERSION = "3.0.4";

export const getAlpha = () => String.fromCharCode(118, 108, 101, 115, 115);
export const getBeta = () => String.fromCharCode(116, 114, 111, 106, 97, 110);
export const getGamma = () => String.fromCharCode(99, 108, 97, 115, 104);

export const REQ_BYTES_EST = 1073741824 / 6000;

export const TCP_OPEN_TIMEOUT_MS = 5000;
export const TCP_WRITE_TIMEOUT_MS = 5000;
export const TCP_FIRST_READ_TIMEOUT_MS = 7000;
export const UPSTREAM_WRITE_TIMEOUT_MS = 15000;
export const NAHAN_RUNNER_LEASE_TTL_MS = 120000;
export const UPSTREAM_QUEUE_MAX_BYTES = 4 * 1024 * 1024;
export const UPSTREAM_QUEUE_MAX_ITEMS = 256;

export const CACHE_TTL_CONFIG = 10000;
export const CACHE_TTL_USAGE = 10000;
export const CACHE_TTL_BACKUP_IP = 30000;

export {sys_defaults_code}
"""
with open("src/core/constants.js", "w", encoding="utf-8") as f:
    f.write(constants_code)

# 2. src/core/state.js
state_code = """import { SYSTEM_DEFAULTS } from "./constants.js";

// Global Runtime State & Memory Caches
export let sysConfig = { ...SYSTEM_DEFAULTS };
export function updateSysConfig(next) {
    if (!next) return;
    for (const k of Object.keys(sysConfig)) delete sysConfig[k];
    Object.assign(sysConfig, next);
}

export let isolateStartTime = 0;
export function setIsolateStartTime(t) { isolateStartTime = t; }

export let activeConnections = 0;
export function incActiveConnections() { activeConnections++; }
export function decActiveConnections() { activeConnections = Math.max(0, activeConnections - 1); }

export let INFLIGHT_HTTP = 0;
export function incInflightHttp() { INFLIGHT_HTTP++; }
export function decInflightHttp() { INFLIGHT_HTTP = Math.max(0, INFLIGHT_HTTP - 1); }

export let OPEN_WS = 0;
export function incOpenWs() { OPEN_WS++; }
export function decOpenWs() { OPEN_WS = Math.max(0, OPEN_WS - 1); }

export function breakerLevel() {
    try {
        if (INFLIGHT_HTTP > 200 || OPEN_WS > 400) return 2;
        if (INFLIGHT_HTTP > 100 || OPEN_WS > 200) return 1;
        return 0;
    } catch (e) {
        return 0;
    }
}

export const uuidUsage = new Map();
export const sysUsageCache = { users: {} };
export function updateSysUsageCache(next) {
    if (!next) return;
    for (const k of Object.keys(sysUsageCache)) delete sysUsageCache[k];
    Object.assign(sysUsageCache, next);
}

export const configRegistry = new Map();
export const trojanHashCache = new Map();
export const ipGeoCache = new Map();

export let singboxTemplate = null;
export function setSingboxTemplate(t) { singboxTemplate = t; }

export let clashTemplate = null;
export function setClashTemplate(t) { clashTemplate = t; }

export let v2rayTemplate = null;
export function setV2rayTemplate(t) { v2rayTemplate = t; }

export let lastRelaySweep = 0;
export function setLastRelaySweep(t) { lastRelaySweep = t; }

export let activeDeviceId = "";
export function setActiveDeviceId(id) { activeDeviceId = id; }
"""
with open("src/core/state.js", "w", encoding="utf-8") as f:
    f.write(state_code)

# 3. src/core/utils.js
utils_funcs = [
    "fetchT", "usageTotalBytes", "usageDailyBytes", "limitReqToBytes",
    "sleepMs", "withTimeout", "closeTcpSocketQuietly",
    "releaseWriterQuietly", "withDeadline", "writeSocketWithTimeout",
    "cmpVersions", "deployWorkerToCloudflare"
]
safe_btoa_code = """export const safeBtoa = (str) => {
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
"""
utils_code = """import { REQ_BYTES_EST, TCP_WRITE_TIMEOUT_MS, UPSTREAM_WRITE_TIMEOUT_MS } from "./constants.js";
import { breakerLevel } from "./state.js";

""" + safe_btoa_code + "\n\n" + "\n\n".join(export_func(fn) for fn in utils_funcs)

with open("src/core/utils.js", "w", encoding="utf-8") as f:
    f.write(utils_code)

# 4. src/core/d1.js
d1_funcs = ["d1Init", "d1Get", "d1Put", "cachedD1Put", "d1PutStrict"]
d1_code = """import { CACHE_TTL_CONFIG } from "./constants.js";

""" + "\n\n".join(export_func(fn) for fn in d1_funcs)

with open("src/core/d1.js", "w", encoding="utf-8") as f:
    f.write(d1_code)

# 5. src/core/auth.js
auth_funcs = [
    "sha224Hex", "isPanelApiKey", "extractAuthKey", "isAuthorized",
    "generateApiKey", "authBlocked", "authFail", "authClear", "wsRateCheck"
]
auth_code = """import { sysConfig } from "./state.js";

""" + "\n\n".join(export_func(fn) for fn in auth_funcs)

with open("src/core/auth.js", "w", encoding="utf-8") as f:
    f.write(auth_code)

# 6. src/core/config.js
config_load = extract_func("loadSysConfig")
config_load = config_load.replace("sysConfig = {", "updateSysConfig({")
config_load = config_load.replace("sysConfig = { ...SYSTEM_DEFAULTS };", "updateSysConfig({ ...SYSTEM_DEFAULTS });")
config_load = config_load.replace("if (ustored) sysUsageCache = JSON.parse(ustored);", "if (ustored) updateSysUsageCache(JSON.parse(ustored));")
config_load = config_load.replace("else sysUsageCache = { users: {} };", "else updateSysUsageCache({ users: {} });")
config_load = config_load.replace("sysUsageCache = { users: {} };", "updateSysUsageCache({ users: {} });")
if not config_load.startswith("export "):
    config_load = "export " + config_load

config_other = ["validateNameStrategy", "serveMaintenancePage", "migrateSlaveNodesToLinkedPanels"]
config_code = """import { SYSTEM_DEFAULTS, CACHE_TTL_CONFIG, CACHE_TTL_USAGE } from "./constants.js";
import { sysConfig, updateSysConfig, sysUsageCache, updateSysUsageCache, breakerLevel } from "./state.js";
import { d1Init, d1Get, d1Put } from "./d1.js";
import { fetchT } from "./utils.js";

""" + config_load + "\n\n" + "\n\n".join(export_func(fn) for fn in config_other)

with open("src/core/config.js", "w", encoding="utf-8") as f:
    f.write(config_code)

# 7. src/protocols/trojan.js
trojan_funcs = [
    "getTrojanHash", "registerConfigEntry", "lookupConfigEntry",
    "generateConfigUuid", "decodeConfigUuid", "generateHardwareId", "getTransportParams"
]
trojan_code = """import { sysConfig, configRegistry, trojanHashCache } from "../core/state.js";
import { sha224Hex } from "../core/auth.js";
import { getAlpha, getBeta } from "../core/constants.js";

""" + "\n\n".join(export_func(fn) for fn in trojan_funcs)

with open("src/protocols/trojan.js", "w", encoding="utf-8") as f:
    f.write(trojan_code)

# 8. src/protocols/stream.js
stream_funcs = ["processTelemetryStream", "startDataPipe"]
stream_code = """import { connect } from "cloudflare:sockets";
import { sysConfig, incActiveConnections, decActiveConnections, incOpenWs, decOpenWs, uuidUsage } from "../core/state.js";
import { getAlpha, getBeta, TCP_OPEN_TIMEOUT_MS, TCP_WRITE_TIMEOUT_MS, TCP_FIRST_READ_TIMEOUT_MS, UPSTREAM_WRITE_TIMEOUT_MS, UPSTREAM_QUEUE_MAX_BYTES, UPSTREAM_QUEUE_MAX_ITEMS } from "../core/constants.js";
import { closeTcpSocketQuietly, releaseWriterQuietly, withDeadline, writeSocketWithTimeout, safeBtoa } from "../core/utils.js";
import { sha224Hex, wsRateCheck, authBlocked, authFail, authClear } from "../core/auth.js";
import { getTrojanHash, lookupConfigEntry } from "./trojan.js";
import { orderAiFirstTokens, isRelayQuarantined, recordRelaySuccess, recordRelayFailure, recordAiSuccess, recordAiFailure, isAiDomain, sniffSniFromHello } from "../relays/health.js";

""" + "\n\n".join(export_func(fn) for fn in stream_funcs)
stream_code = stream_code.replace("activeConnections++;", "incActiveConnections();")
stream_code = stream_code.replace("activeConnections--;", "decActiveConnections();")
stream_code = stream_code.replace("OPEN_WS++;", "incOpenWs();")
stream_code = stream_code.replace("OPEN_WS = Math.max(0, OPEN_WS - 1);", "decOpenWs();")

with open("src/protocols/stream.js", "w", encoding="utf-8") as f:
    f.write(stream_code)

# 9. src/relays/health.js
relay_funcs = [
    "acquireNahanRunnerLock", "refreshNahanRunnerLease", "releaseNahanRunnerLock",
    "relayKeyOf", "isRelayQuarantined", "recordRelaySuccess", "recordRelayFailure",
    "isAiQuarantined", "recordAiFailure", "recordAiSuccess", "filterAiQuarantinedTokens",
    "filterQuarantinedRelays", "isAiDomain", "sniffSniFromHello", "relayAiFlag",
    "orderAiFirstTokens", "buildProbeHello", "probeRelayOnce", "probeRelayVerdict",
    "collectRelayInventory", "pruneAutomationOff", "loadRelayHealthSnapshot",
    "saveRelayHealthSnapshot", "probeDeadRelays", "buryDeadRelay", "nowTs",
    "resurrectRelay", "probeGraveyard"
]
relay_code = """import { connect } from "cloudflare:sockets";
import { sysConfig } from "../core/state.js";
import { NAHAN_RUNNER_LEASE_TTL_MS } from "../core/constants.js";
import { d1Get, d1PutStrict } from "../core/d1.js";
import { withTimeout, closeTcpSocketQuietly, releaseWriterQuietly, writeSocketWithTimeout } from "../core/utils.js";

""" + "\n\n".join(export_func(fn) for fn in relay_funcs)

with open("src/relays/health.js", "w", encoding="utf-8") as f:
    f.write(relay_code)

# 10. src/api/auth.js
api_auth_code = """import { sysConfig } from "../core/state.js";
import { sha224Hex } from "../core/auth.js";
import { logActivity } from "./logs.js";

""" + export_func("handleAuth")

with open("src/api/auth.js", "w", encoding="utf-8") as f:
    f.write(api_auth_code)

# 11. src/api/logs.js
logs_code = """import { d1Get, d1Put } from "../core/d1.js";
import { sysConfig } from "../core/state.js";

""" + export_func("logActivity") + "\n\n" + export_func("handleLogs")

with open("src/api/logs.js", "w", encoding="utf-8") as f:
    f.write(logs_code)

# 12. src/api/stats.js
stats_code = """import { sysConfig, activeConnections, isolateStartTime, sysUsageCache, uuidUsage } from "../core/state.js";
import { fetchT, usageTotalBytes, usageDailyBytes, limitReqToBytes } from "../core/utils.js";
import { loadRelayHealthSnapshot, relayHealthSnapshot, relayHealthSnapshotAsync } from "../relays/health.js";
import { authFail, isPanelApiKey } from "../core/auth.js";
import { CURRENT_VERSION } from "../core/constants.js";

""" + export_func("fetchCloudflareUsage") + "\n\n" + export_func("handleStatsApi")

with open("src/api/stats.js", "w", encoding="utf-8") as f:
    f.write(stats_code)

# 13. src/api/sync.js
sync_funcs = [
    "handleConfigSync", "handleSyncPanel", "getPanelsList", "remotePanelFetch",
    "fetchRemotePanelUsers", "fetchRemotePanelUser", "fetchRemotePanelStats",
    "fetchRemotePanelConfig", "remotePanelWriteAction", "remotePanelToggleUser",
    "remotePanelResetTraffic", "linkedPanelHost", "getGlobalNodeHosts"
]
sync_code = """import { sysConfig, updateSysConfig, sysUsageCache, updateSysUsageCache } from "../core/state.js";
import { d1Put } from "../core/d1.js";
import { fetchT } from "../core/utils.js";
import { logActivity } from "./logs.js";
import { validateNameStrategy } from "../core/config.js";

""" + "\n\n".join(export_func(fn) for fn in sync_funcs)
sync_code = sync_code.replace("sysConfig = nextConfig;", "updateSysConfig(nextConfig);")
sync_code = sync_code.replace("if (!sysUsageCache) sysUsageCache = { users: {} };", "// sysUsageCache initialized")

with open("src/api/sync.js", "w", encoding="utf-8") as f:
    f.write(sync_code)

# 14. src/api/keys.js
keys_code = """import { sysConfig, updateSysConfig } from "../core/state.js";
import { d1Put } from "../core/d1.js";
import { generateApiKey } from "../core/auth.js";
import { logActivity } from "./logs.js";

""" + export_func("handleApiKeys")

with open("src/api/keys.js", "w", encoding="utf-8") as f:
    f.write(keys_code)

# 15. src/api/update.js
update_code = """import { CURRENT_VERSION } from "../core/constants.js";
import { sysConfig } from "../core/state.js";
import { fetchT, cmpVersions, deployWorkerToCloudflare } from "../core/utils.js";
import { logActivity } from "./logs.js";

""" + export_func("handleUpdateApi")

with open("src/api/update.js", "w", encoding="utf-8") as f:
    f.write(update_code)

# 16. src/api/telegram.js
tg_code = """import { CURRENT_VERSION, getAlpha, getBeta } from "../core/constants.js";
import { sysConfig, updateSysConfig, sysUsageCache, updateSysUsageCache, activeConnections, isolateStartTime } from "../core/state.js";
import { d1Put } from "../core/d1.js";
import { fetchT, usageTotalBytes, usageDailyBytes, limitReqToBytes } from "../core/utils.js";
import { logActivity } from "./logs.js";
import { getPanelsList, remotePanelToggleUser, remotePanelResetTraffic } from "./sync.js";

""" + export_func("sendTelegramMessage") + "\n\n" + export_func("handleTelegramWebhook")
tg_code = tg_code.replace("if (!sysUsageCache) sysUsageCache = { users: {} };", "// sysUsageCache initialized")

with open("src/api/telegram.js", "w", encoding="utf-8") as f:
    f.write(tg_code)

# 17. src/converters/geo.js
geo_code = """import { sysConfig, ipGeoCache } from "../core/state.js";
import { fetchT } from "../core/utils.js";

""" + "\n\n".join(export_func(fn) for fn in [
    "preloadIpFlags", "getEmojiFlag", "getGeoInfo", "fetchIpGeoData",
    "resolveUserProxyIpGeo", "getConfigName", "getCleanIps", "getCleanIpsWithNames",
    "getProxyIpsArray", "ipv4ToNat64", "getProxyIpsWithNat64"
])

with open("src/converters/geo.js", "w", encoding="utf-8") as f:
    f.write(geo_code)

# 18. src/converters/fragment.js
frag_code = """import { sysConfig } from "../core/state.js";

""" + "\n\n".join(export_func(fn) for fn in [
    "parseSegRangeList", "resolveSegFragment", "buildSegFragmentParam",
    "getSegStreamExtra", "buildTlsMaskParam", "isSegEnabled"
])

with open("src/converters/fragment.js", "w", encoding="utf-8") as f:
    f.write(frag_code)

# 19. src/converters/upstream.js
upstream_code = """import { getAlpha } from "../core/constants.js";

""" + "\n\n".join(export_func(fn) for fn in [
    "parseVlessUri", "upstreamToSingboxOb", "upstreamToClashProxy", "upstreamToV2RayOb"
])

with open("src/converters/upstream.js", "w", encoding="utf-8") as f:
    f.write(upstream_code)

# 20. src/api/users.js
users_funcs = [
    "getSubscriptionStats", "getFakeConfigNames", "getAllProfiles",
    "calcEffectiveIps", "getProfileHostNames", "getEffectiveNat64",
    "getEffectivePips", "handleUsersApi"
]
users_code = """import { sysConfig, updateSysConfig, sysUsageCache, updateSysUsageCache } from "../core/state.js";
import { d1Put } from "../core/d1.js";
import { usageTotalBytes, usageDailyBytes, limitReqToBytes, safeBtoa } from "../core/utils.js";
import { logActivity } from "./logs.js";
import { getCleanIps, getProxyIpsArray, ipv4ToNat64 } from "../converters/geo.js";
import { isPanelApiKey, authFail } from "../core/auth.js";

""" + "\n\n".join(export_func(fn) for fn in users_funcs)
users_code = users_code.replace("if (!sysUsageCache) sysUsageCache = { users: {} };", "// sysUsageCache initialized")

with open("src/api/users.js", "w", encoding="utf-8") as f:
    f.write(users_code)

# 21. src/converters/sub.js
sub_funcs = [
    "fetchTemplates", "getCustomRouting", "buildUriProfile", "buildYamlProfile",
    "getIpTypeLabel", "buildClashJsonProfile", "buildVJsonProfile", "buildSingBoxJsonProfile"
]
sub_code = """import { CURRENT_VERSION, getAlpha, getBeta, getGamma } from "../core/constants.js";
import { sysConfig, singboxTemplate, setSingboxTemplate, clashTemplate, setClashTemplate, v2rayTemplate, setV2rayTemplate } from "../core/state.js";
import { safeBtoa, fetchT } from "../core/utils.js";
import { getCleanIps, getProxyIpsArray, ipv4ToNat64, preloadIpFlags, getGeoInfo, getConfigName } from "./geo.js";
import { isSegEnabled, resolveSegFragment, buildSegFragmentParam, buildTlsMaskParam } from "./fragment.js";
import { parseVlessUri, upstreamToSingboxOb, upstreamToClashProxy, upstreamToV2RayOb } from "./upstream.js";
import { generateConfigUuid, getTransportParams } from "../protocols/trojan.js";

""" + "\n\n".join(export_func(fn) for fn in sub_funcs)
sub_code = sub_code.replace("clashTemplate = await res.text();", "setClashTemplate(await res.text());")
sub_code = sub_code.replace("singboxTemplate = await res.json();", "setSingboxTemplate(await res.json());")

with open("src/converters/sub.js", "w", encoding="utf-8") as f:
    f.write(sub_code)

# 22. src/index.js
fetch_start = full_code.find("async fetch(request, env, ctx) {")
sched_start = full_code.find("async scheduled(event, env, ctx) {")
sched_end = full_code.find("async function serveMaintenancePage", sched_start)
fetch_and_sched_code = full_code[fetch_start:sched_end].rstrip().rstrip(";").rstrip("}")

# Adapt reassignments in fetch/scheduled:
fetch_and_sched_code = fetch_and_sched_code.replace("if (!isolateStartTime) isolateStartTime = Date.now();", "if (!isolateStartTime) setIsolateStartTime(Date.now());")
fetch_and_sched_code = fetch_and_sched_code.replace("INFLIGHT_HTTP++;", "incInflightHttp();")
fetch_and_sched_code = fetch_and_sched_code.replace("INFLIGHT_HTTP = Math.max(0, INFLIGHT_HTTP - 1);", "decInflightHttp();")
fetch_and_sched_code = fetch_and_sched_code.replace("lastRelaySweep = nowRs;", "setLastRelaySweep(nowRs);")
fetch_and_sched_code = fetch_and_sched_code.replace("activeDeviceId =\n                sysConfig.deviceId || generateHardwareId(sysConfig.apiRoute);", "setActiveDeviceId(sysConfig.deviceId || generateHardwareId(sysConfig.apiRoute));")
fetch_and_sched_code = fetch_and_sched_code.replace("activeDeviceId =\n                    sysConfig.deviceId || generateHardwareId(sysConfig.apiRoute);", "setActiveDeviceId(sysConfig.deviceId || generateHardwareId(sysConfig.apiRoute));")
fetch_and_sched_code = fetch_and_sched_code.replace("activeDeviceId = sysConfig.deviceId || generateHardwareId(sysConfig.apiRoute);", "setActiveDeviceId(sysConfig.deviceId || generateHardwareId(sysConfig.apiRoute));")

index_code = """/**
 * Project Nahan (نهان) - Modular Cloudflare Worker Edge Gateway
 * https://github.com/itsyebekhe/nahan
 */

import { connect } from "cloudflare:sockets";
import { CURRENT_VERSION, getAlpha, getBeta } from "./core/constants.js";
import {
    sysConfig, isolateStartTime, setIsolateStartTime,
    incInflightHttp, decInflightHttp,
    configRegistry, trojanHashCache, lastRelaySweep, setLastRelaySweep,
    activeDeviceId, setActiveDeviceId, sysUsageCache
} from "./core/state.js";
import { safeBtoa, fetchT, cmpVersions, deployWorkerToCloudflare } from "./core/utils.js";
import { loadSysConfig, serveMaintenancePage } from "./core/config.js";
import { isAuthorized } from "./core/auth.js";
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
""" + fetch_and_sched_code + """
};
"""

with open("src/index.js", "w", encoding="utf-8") as f:
    f.write(index_code)

print("[+] Successfully generated clean modular files in src/!")
