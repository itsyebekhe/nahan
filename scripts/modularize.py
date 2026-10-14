#!/usr/bin/env python3
import os
import re

with open("_worker.js", "r", encoding="utf-8") as f:
    full_code = f.read()

GLOBALS_LIST = [
    "sysConfig", "isolateStartTime", "activeConnections", "INFLIGHT_HTTP", "OPEN_WS",
    "uuidUsage", "sysUsageCache", "configRegistry", "trojanHashCache", "ipGeoCache",
    "singboxTemplate", "clashTemplate", "v2rayTemplate", "lastRelaySweep",
    "lastGraveyardSweep", "activeDeviceId"
]

def state_wrap(code_str):
    pattern = rf"\b(?<!\.)({'|'.join(GLOBALS_LIST)})\b"
    return re.sub(pattern, r"state.\1", code_str)

def extract_func(name):
    pattern = re.compile(rf"^(?:async\s+)?function\s+{re.escape(name)}\s*\(", re.MULTILINE)
    m = pattern.search(full_code)
    if not m:
        raise ValueError(f"Function {name} not found!")
    start = m.start()
    first_brace = full_code.find("{", start)
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
    code = state_wrap(code)
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
export const state = {
    sysConfig: { ...SYSTEM_DEFAULTS },
    isolateStartTime: null,
    activeConnections: new Map(),
    INFLIGHT_HTTP: 0,
    OPEN_WS: 0,
    uuidUsage: new Map(),
    sysUsageCache: null,
    configRegistry: new Map(),
    trojanHashCache: new Map(),
    ipGeoCache: new Map(),
    singboxTemplate: null,
    clashTemplate: null,
    v2rayTemplate: null,
    lastRelaySweep: 0,
    lastGraveyardSweep: 0,
    activeDeviceId: null,
};
"""
with open("src/core/state.js", "w", encoding="utf-8") as f:
    f.write(state_code)

# 3. src/core/utils.js
utils_funcs = [
    "safeBtoa", "fetchT", "usageTotalBytes", "usageDailyBytes", "limitReqToBytes",
    "breakerLevel", "sleepMs", "withTimeout", "closeTcpSocketQuietly",
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
import { state } from "./state.js";

""" + safe_btoa_code + "\n\n" + "\n\n".join(export_func(fn) for fn in utils_funcs if fn != "safeBtoa")

with open("src/core/utils.js", "w", encoding="utf-8") as f:
    f.write(utils_code)

# 4. src/core/d1.js
d1_funcs = ["d1Init", "d1Get", "d1Put", "cachedD1Put", "d1PutStrict"]
d1_code = """import { CACHE_TTL_CONFIG } from "./constants.js";
import { state } from "./state.js";

""" + "\n\n".join(export_func(fn) for fn in d1_funcs)

with open("src/core/d1.js", "w", encoding="utf-8") as f:
    f.write(d1_code)

# 5. src/core/auth.js
auth_funcs = [
    "sha224Hex", "isPanelApiKey", "extractAuthKey", "isAuthorized",
    "generateApiKey", "authBlocked", "authFail", "authClear", "wsRateCheck"
]
auth_code = """import { state } from "./state.js";

""" + "\n\n".join(export_func(fn) for fn in auth_funcs)

with open("src/core/auth.js", "w", encoding="utf-8") as f:
    f.write(auth_code)

# 6. src/core/config.js
config_funcs = [
    "loadSysConfig", "validateNameStrategy", "serveMaintenancePage", "migrateSlaveNodesToLinkedPanels"
]
config_code = """import { SYSTEM_DEFAULTS, CACHE_TTL_CONFIG, CACHE_TTL_USAGE } from "./constants.js";
import { state } from "./state.js";
import { d1Init, d1Get, d1Put } from "./d1.js";
import { fetchT, breakerLevel } from "./utils.js";

""" + "\n\n".join(export_func(fn) for fn in config_funcs)

with open("src/core/config.js", "w", encoding="utf-8") as f:
    f.write(config_code)

# 7. src/protocols/trojan.js
trojan_funcs = [
    "getTrojanHash", "registerConfigEntry", "lookupConfigEntry",
    "generateConfigUuid", "decodeConfigUuid", "generateHardwareId", "getTransportParams"
]
trojan_code = """import { state } from "../core/state.js";
import { sha224Hex } from "../core/auth.js";
import { getAlpha, getBeta } from "../core/constants.js";

""" + "\n\n".join(export_func(fn) for fn in trojan_funcs)

with open("src/protocols/trojan.js", "w", encoding="utf-8") as f:
    f.write(trojan_code)

# 8. src/protocols/stream.js
stream_funcs = ["processTelemetryStream", "startDataPipe"]
stream_code = """import { connect } from "cloudflare:sockets";
import { state } from "../core/state.js";
import { getAlpha, getBeta, TCP_OPEN_TIMEOUT_MS, TCP_WRITE_TIMEOUT_MS, TCP_FIRST_READ_TIMEOUT_MS, UPSTREAM_WRITE_TIMEOUT_MS, UPSTREAM_QUEUE_MAX_BYTES, UPSTREAM_QUEUE_MAX_ITEMS } from "../core/constants.js";
import { closeTcpSocketQuietly, releaseWriterQuietly, withDeadline, writeSocketWithTimeout, safeBtoa } from "../core/utils.js";
import { sha224Hex, wsRateCheck, authBlocked, authFail, authClear } from "../core/auth.js";
import { getTrojanHash, lookupConfigEntry } from "./trojan.js";
import { orderAiFirstTokens, isRelayQuarantined, recordRelaySuccess, recordRelayFailure, recordAiSuccess, recordAiFailure, isAiDomain, sniffSniFromHello } from "../relays/health.js";

""" + "\n\n".join(export_func(fn) for fn in stream_funcs)

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
import { state } from "../core/state.js";
import { NAHAN_RUNNER_LEASE_TTL_MS } from "../core/constants.js";
import { d1Get, d1PutStrict } from "../core/d1.js";
import { withTimeout, closeTcpSocketQuietly, releaseWriterQuietly, writeSocketWithTimeout } from "../core/utils.js";

""" + "\n\n".join(export_func(fn) for fn in relay_funcs)

with open("src/relays/health.js", "w", encoding="utf-8") as f:
    f.write(relay_code)

# 10. src/api/auth.js
api_auth_code = """import { state } from "../core/state.js";
import { sha224Hex } from "../core/auth.js";
import { logActivity } from "./logs.js";

""" + export_func("handleAuth")

with open("src/api/auth.js", "w", encoding="utf-8") as f:
    f.write(api_auth_code)

# 11. src/api/logs.js
logs_code = """import { d1Get, d1Put } from "../core/d1.js";
import { state } from "../core/state.js";

""" + export_func("logActivity") + "\n\n" + export_func("handleLogs")

with open("src/api/logs.js", "w", encoding="utf-8") as f:
    f.write(logs_code)

# 12. src/api/stats.js
stats_code = """import { state } from "../core/state.js";
import { fetchT, usageTotalBytes, usageDailyBytes, limitReqToBytes } from "../core/utils.js";
import { loadRelayHealthSnapshot } from "../relays/health.js";

""" + export_func("fetchCloudflareUsage") + "\n\n" + export_func("relayHealthSnapshot") + "\n\n" + export_func("relayHealthSnapshotAsync") + "\n\n" + export_func("handleStatsApi")

with open("src/api/stats.js", "w", encoding="utf-8") as f:
    f.write(stats_code)

# 13. src/api/sync.js
sync_code = """import { state } from "../core/state.js";
import { d1Put } from "../core/d1.js";
import { fetchT } from "../core/utils.js";
import { logActivity } from "./logs.js";

""" + "\n\n".join(export_func(fn) for fn in [
    "handleConfigSync", "handleSyncPanel", "getPanelsList", "remotePanelFetch",
    "fetchRemotePanelUsers", "fetchRemotePanelUser", "fetchRemotePanelStats",
    "fetchRemotePanelConfig", "remotePanelWriteAction", "remotePanelToggleUser",
    "remotePanelResetTraffic", "linkedPanelHost", "getGlobalNodeHosts"
])

with open("src/api/sync.js", "w", encoding="utf-8") as f:
    f.write(sync_code)

# 14. src/api/keys.js
keys_code = """import { state } from "../core/state.js";
import { d1Put } from "../core/d1.js";
import { generateApiKey } from "../core/auth.js";
import { logActivity } from "./logs.js";

""" + export_func("handleApiKeys")

with open("src/api/keys.js", "w", encoding="utf-8") as f:
    f.write(keys_code)

# 15. src/api/update.js
update_code = """import { CURRENT_VERSION } from "../core/constants.js";
import { state } from "../core/state.js";
import { fetchT, cmpVersions, deployWorkerToCloudflare } from "../core/utils.js";
import { logActivity } from "./logs.js";

""" + export_func("handleUpdateApi")

with open("src/api/update.js", "w", encoding="utf-8") as f:
    f.write(update_code)

# 16. src/api/telegram.js
tg_code = """import { CURRENT_VERSION, getAlpha, getBeta } from "../core/constants.js";
import { state } from "../core/state.js";
import { d1Put } from "../core/d1.js";
import { fetchT, usageTotalBytes, usageDailyBytes, limitReqToBytes } from "../core/utils.js";
import { logActivity } from "./logs.js";
import { getPanelsList, remotePanelToggleUser, remotePanelResetTraffic } from "./sync.js";

""" + export_func("sendTelegramMessage") + "\n\n" + export_func("handleTelegramWebhook")

with open("src/api/telegram.js", "w", encoding="utf-8") as f:
    f.write(tg_code)

# 17. src/converters/geo.js
geo_code = """import { state } from "../core/state.js";
import { fetchT } from "../core/utils.js";

""" + "\n\n".join(export_func(fn) for fn in [
    "preloadIpFlags", "getEmojiFlag", "getGeoInfo", "fetchIpGeoData",
    "resolveUserProxyIpGeo", "getConfigName", "getCleanIps", "getCleanIpsWithNames",
    "getProxyIpsArray", "ipv4ToNat64", "getProxyIpsWithNat64"
])

with open("src/converters/geo.js", "w", encoding="utf-8") as f:
    f.write(geo_code)

# 18. src/converters/fragment.js
frag_code = """import { state } from "../core/state.js";

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
users_code = """import { state } from "../core/state.js";
import { d1Put } from "../core/d1.js";
import { usageTotalBytes, usageDailyBytes, limitReqToBytes } from "../core/utils.js";
import { logActivity } from "./logs.js";
import { getCleanIps, getProxyIpsArray, ipv4ToNat64 } from "../converters/geo.js";

""" + "\n\n".join(export_func(fn) for fn in [
    "getSubscriptionStats", "getFakeConfigNames", "getAllProfiles",
    "calcEffectiveIps", "getProfileHostNames", "getEffectiveNat64",
    "getEffectivePips", "handleUsersApi"
])

with open("src/api/users.js", "w", encoding="utf-8") as f:
    f.write(users_code)

# 21. src/converters/sub.js
sub_code = """import { CURRENT_VERSION, getAlpha, getBeta, getGamma } from "../core/constants.js";
import { state } from "../core/state.js";
import { safeBtoa, fetchT } from "../core/utils.js";
import { getCleanIps, getProxyIpsArray, ipv4ToNat64, preloadIpFlags, getGeoInfo, getConfigName } from "./geo.js";
import { isSegEnabled, resolveSegFragment, buildSegFragmentParam, buildTlsMaskParam } from "./fragment.js";
import { parseVlessUri, upstreamToSingboxOb, upstreamToClashProxy, upstreamToV2RayOb } from "./upstream.js";
import { generateConfigUuid, getTransportParams } from "../protocols/trojan.js";

""" + "\n\n".join(export_func(fn) for fn in [
    "fetchTemplates", "getCustomRouting", "buildUriProfile", "buildYamlProfile",
    "getIpTypeLabel", "buildClashJsonProfile", "buildVJsonProfile", "buildSingBoxJsonProfile"
])

with open("src/converters/sub.js", "w", encoding="utf-8") as f:
    f.write(sub_code)

# 22. src/index.js
fetch_start = full_code.find("async fetch(request, env, ctx) {")
sched_start = full_code.find("async scheduled(event, env, ctx) {")
sched_end = full_code.find("async function serveMaintenancePage", sched_start)
fetch_and_sched_code = full_code[fetch_start:sched_end].rstrip().rstrip(";").rstrip("}")
fetch_and_sched_code = state_wrap(fetch_and_sched_code)

index_code = """/**
 * Project Nahan (نهان) - Modular Cloudflare Worker Edge Gateway
 * https://github.com/itsyebekhe/nahan
 */

import { connect } from "cloudflare:sockets";
import { CURRENT_VERSION, getAlpha, getBeta } from "./core/constants.js";
import { state } from "./core/state.js";
import { safeBtoa, fetchT, breakerLevel, cmpVersions, deployWorkerToCloudflare } from "./core/utils.js";
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

print("[+] Successfully generated all state-wrapped modular files in src/!")
