import { SYSTEM_DEFAULTS } from "./constants.js";

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
export const activeConns = new Map();
export const sysUsageCache = { users: {} };
export function updateSysUsageCache(next) {
    if (!next) return;
    for (const k of Object.keys(sysUsageCache)) delete sysUsageCache[k];
    Object.assign(sysUsageCache, next);
}

export function trackUsage(activeClientHash, bytes = 0, env = null, ctx = null) {
    if (!activeClientHash) return;
    try {
        if (!sysUsageCache.users) sysUsageCache.users = {};
        const today = new Date().toISOString().split("T")[0];
        let u = sysUsageCache.users[activeClientHash];
        if (!u) {
            u = { reqs: 0, dReqs: 0, bytes: 0, dBytes: 0, lastDay: today };
            sysUsageCache.users[activeClientHash] = u;
        }
        if (u.lastDay !== today) {
            u.dReqs = 0;
            u.dBytes = 0;
            u.lastDay = today;
        }
        if (bytes === 0) {
            u.reqs = (u.reqs || 0) + 1;
            u.dReqs = (u.dReqs || 0) + 1;
        } else {
            u.bytes = (u.bytes || 0) + bytes;
            u.dBytes = (u.dBytes || 0) + bytes;
        }
    } catch (e) {}
}

export const configRegistry = new Map();
export const authHashCache = new Map();
export const trojanHashCache = authHashCache;
export const ipGeoCache = new Map();

export let boxTemplate = null;
export let singboxTemplate = null;
export function setBoxTemplate(t) { boxTemplate = t; singboxTemplate = t; }
export const setSingboxTemplate = setBoxTemplate;

export let edgeTemplate = null;
export let clashTemplate = null;
export function setEdgeTemplate(t) { edgeTemplate = t; clashTemplate = t; }
export const setClashTemplate = setEdgeTemplate;

export let coreTemplate = null;
export let v2rayTemplate = null;
export function setCoreTemplate(t) { coreTemplate = t; v2rayTemplate = t; }
export const setV2rayTemplate = setCoreTemplate;

export let lastRelaySweep = 0;
export function setLastRelaySweep(t) { lastRelaySweep = t; }

export let activeDeviceId = "";
export function setActiveDeviceId(id) { activeDeviceId = id; }
