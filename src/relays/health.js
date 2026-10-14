import { connect } from "cloudflare:sockets";
import { sysConfig, breakerLevel } from "../core/state.js";
import { NAHAN_RUNNER_LEASE_TTL_MS, AI_LLM_SUFFIXES } from "../core/constants.js";
import { d1Get, d1Put, d1PutStrict } from "../core/d1.js";
import { withTimeout, closeTcpSocketQuietly, releaseWriterQuietly, writeSocketWithTimeout } from "../core/utils.js";

export const RELAY_Q = new Map(); // key "host|port" -> { fail, until, probeFail }
export const RELAY_QUARANTINE_MS = 15 * 60 * 1000;
export const AI_RELAY_Q = new Map();

export const RELAY_FAIL_STREAK = 3;
export const AI_FAIL_STREAK = 2;
export const AI_QUARANTINE_MS = 30 * 60 * 1000;
export const RELAY_TLS_PORTS = new Set(["443", "8443", "2053", "2083", "2087", "2096"]);
export const PROBE_INTERVAL_MS = 60 * 1000;
export const PROBE_MAX_PER_ROUND = 8;
export const PROBE_FAIL_LIMIT = 3;
export const FLAP_WINDOW_MS = 24 * 60 * 60 * 1000;
export const FLAP_LIMIT = 3;
export const GRAVE_INTERVAL_MS = 5 * 60 * 1000;
export const GRAVE_MAX_PER_ROUND = 4;
export const GRAVE_HEALTHY_NEED = 3;

let RELAY_SNAPSHOT_LOADED = false;
let lastHealthSave = 0;
let lastProbeTs = 0;
let probeCursor = 0;
let lastGraveTs = 0;
let graveCursor = 0;
let lastResurrectChanged = false;

export function relayHealthSnapshot() {
    const out = { quarantined: [], graveyard: [], aiQuarantine: [] };
    try {
        const now = Date.now();
        for (const [k, e] of RELAY_Q) {
            if (e && e.until && e.until > now) out.quarantined.push(k);
        }
    } catch (e) {}
    try {
        for (const [k, e] of AI_RELAY_Q) {
            if (e && e.until && Date.now() < e.until)
                out.aiQuarantine.push(k);
        }
    } catch (e) {}
    return out;
}

export async function relayHealthSnapshotAsync(env) {
    const out = relayHealthSnapshot();
    try {
        if (env && env.IOT_DB) {
            const g = JSON.parse(
                (await d1Get(env, "relay_graveyard")) || "{}",
            );
            for (const [k, e] of Object.entries(g || {})) {
                out.graveyard.push({
                    key: k,
                    streak: (e && e.healthyStreak) || 0,
                    unstable: !!(e && e.unstable),
                    lists: (e && e.lists && e.lists.length) || 0,
                });
            }
        }
    } catch (e) {}
    return out;
}

export async function acquireNahanRunnerLock(
    env,
    jobKey,
    intervalMs,
    lockGroup = "nahan-relay",
) {
    const physicalKey = "nahan_lock:" + String(lockGroup || "nahan-relay");
    const scheduleKey = "nahan_runner_last_" + String(jobKey || "job");
    let lease = null;
    try {
        if (!env || !env.IOT_DB) return null;
        const now = Date.now();
        const until = now + NAHAN_RUNNER_LEASE_TTL_MS;
        try {
            const r = await env.IOT_DB.prepare(
                "UPDATE kv_store SET value=? WHERE key=? AND CAST(value AS INTEGER)<?",
            )
                .bind(String(until), physicalKey, now)
                .run();
            if (r && r.meta && r.meta.changes > 0)
                lease = { lockKey: physicalKey, until, scheduleKey };
        } catch (e) {}
        if (!lease) {
            try {
                const r = await env.IOT_DB.prepare(
                    "INSERT OR IGNORE INTO kv_store(key,value) VALUES(?,?)",
                )
                    .bind(physicalKey, String(until))
                    .run();
                if (r && r.meta && r.meta.changes > 0)
                    lease = { lockKey: physicalKey, until, scheduleKey };
            } catch (e) {}
        }
        if (!lease) return null;
        let lastRun = 0;
        try {
            const row = await env.IOT_DB.prepare(
                "SELECT value FROM kv_store WHERE key=?",
            )
                .bind(scheduleKey)
                .first();
            lastRun = Number((row && row.value) || 0) || 0;
        } catch (e) {}
        if (intervalMs > 0 && now - lastRun < intervalMs) {
            await releaseNahanRunnerLock(env, lease);
            return null;
        }
        try {
            await env.IOT_DB.prepare(
                "INSERT INTO kv_store(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            )
                .bind(scheduleKey, String(now))
                .run();
        } catch (e) {
            await releaseNahanRunnerLock(env, lease);
            return null;
        }
        return lease;
    } catch (e) {
        try {
            if (lease) await releaseNahanRunnerLock(env, lease);
        } catch (_) {}
        return null;
    }
}

export async function refreshNahanRunnerLease(env, lease) {
    try {
        if (!lease || !env || !env.IOT_DB) return false;
        const nextUntil = Date.now() + NAHAN_RUNNER_LEASE_TTL_MS;
        const r = await env.IOT_DB.prepare(
            "UPDATE kv_store SET value=? WHERE key=? AND value=?",
        )
            .bind(String(nextUntil), lease.lockKey, String(lease.until))
            .run();
        if (r && r.meta && r.meta.changes > 0) {
            lease.until = nextUntil;
            return true;
        }
    } catch (e) {}
    return false;
}

export async function releaseNahanRunnerLock(env, lease) {
    try {
        if (lease && env && env.IOT_DB) {
            await env.IOT_DB.prepare(
                "DELETE FROM kv_store WHERE key=? AND value=?",
            )
                .bind(lease.lockKey, String(lease.until))
                .run();
        }
    } catch (e) {}
}

export function relayKeyOf(tok) {
    try {
        let s = String(tok || "").trim();
        if (!s) return null;
        s = s.replace(/^[a-zA-Z]+:\/\//, "");
        if (s.includes("@")) s = s.substring(s.lastIndexOf("@") + 1);
        const hi = s.indexOf("#");
        if (hi !== -1) s = s.substring(0, hi).trim();
        if (!s) return null;
        if (s.charAt(0) === "[") {
            const ci = s.indexOf("]");
            if (ci === -1) return null;
            const host = s.substring(1, ci).toLowerCase();
            let port = 443;
            if (s.length > ci + 1 && s.charAt(ci + 1) === ":") {
                const p = parseInt(s.substring(ci + 2), 10);
                if (!isNaN(p) && p >= 1 && p <= 65535) port = p;
            }
            if (!host) return null;
            return { host, port, key: host + "|" + port };
        }
        const firstColon = s.indexOf(":");
        const lastColon = s.lastIndexOf(":");
        if (firstColon !== -1 && firstColon !== lastColon) {
            const host = s.toLowerCase();
            if (!host || host.length > 253) return null;
            return { host, port: 443, key: host + "|443" };
        }
        let host = s;
        let port = 443;
        if (lastColon !== -1) {
            const tail = s.substring(lastColon + 1).trim();
            if (/^\d+$/.test(tail)) {
                const p = parseInt(tail, 10);
                if (!isNaN(p) && p >= 1 && p <= 65535) {
                    host = s.substring(0, lastColon);
                    port = p;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
        host = host.toLowerCase();
        if (!host || host.length > 253) return null;
        if (!/^[a-z0-9.\-]+$/.test(host)) return null;
        return { host, port, key: host + "|" + port };
    } catch (e) {
        return null;
    }
}

export function isRelayQuarantined(host, port) {
    try {
        const e = RELAY_Q.get(
            String(host || "").toLowerCase() + "|" + (port || 443),
        );
        if (!e || !e.until) return false;
        if (Date.now() > e.until) {
            RELAY_Q.delete(
                String(host || "").toLowerCase() + "|" + (port || 443),
            );
            return false;
        }
        return true;
    } catch (err) {
        return false;
    }
}

export function recordRelaySuccess(host, port, full) {
    try {
        const k =
            String(host || "").toLowerCase() + "|" + (port || 443);
        const e = RELAY_Q.get(k);
        if (!e) return;
        e.fail = 0;
        if (full) {
            e.probeFail = 0;
            e.until = 0;
            if (!e.fail && !e.probeFail) RELAY_Q.delete(k);
        }
    } catch (err) {}
}

export function recordRelayFailure(host, port) {
    try {
        const k =
            String(host || "").toLowerCase() + "|" + (port || 443);
        let e = RELAY_Q.get(k);
        if (!e) {
            e = { fail: 0, until: 0, probeFail: 0 };
            RELAY_Q.set(k, e);
        }
        e.fail = (e.fail || 0) + 1;
        if (e.fail >= RELAY_FAIL_STREAK) {
            const alreadyOut =
                e.until && e.until > Date.now() ? true : false;
            e.until = Date.now() + RELAY_QUARANTINE_MS;
            // Log only the transition into quarantine, not every failure
            // afterwards (a dead relay under a reconnect storm would
            // otherwise spam the log on every single connection).
            if (!alreadyOut) {
                try {
                    console.error(
                        "relay-quarantined: " + k + " (" + e.fail + " fails)",
                    );
                } catch (err) {}
            }
        }
        if (RELAY_Q.size > 2000) RELAY_Q.clear();
    } catch (err) {}
}

export function isAiQuarantined(host, port) {
    try {
        const k =
            String(host || "").toLowerCase() + "|" + (port || 443);
        const e = AI_RELAY_Q.get(k);
        if (!e) return false;
        if (e.until) {
            if (Date.now() < e.until) return true;
            try {
                AI_RELAY_Q.delete(k);
            } catch (err) {}
            return false;
        }
        // Still counting fails (until=0): never delete here or the streak
        // could never reach the limit (checked on every AI connection).
        return false;
    } catch (err) {
        return false;
    }
}

export function recordAiFailure(host, port) {
    try {
        if (AI_RELAY_Q.size > 500) {
            const now0 = Date.now();
            for (const [kk, vv] of AI_RELAY_Q) {
                if (!vv || !vv.until || vv.until <= now0) {
                    try {
                        AI_RELAY_Q.delete(kk);
                    } catch (e) {}
                }
                if (AI_RELAY_Q.size <= 400) break;
            }
        }
        const k =
            String(host || "").toLowerCase() + "|" + (port || 443);
        const now = Date.now();
        const e = AI_RELAY_Q.get(k) || { fail: 0, until: 0 };
        if (e.until && now < e.until) return;
        e.fail++;
        if (e.fail >= AI_FAIL_STREAK) {
            e.until = now + AI_QUARANTINE_MS;
            e.fail = 0;
            try {
                console.error("relay-ai-quarantined: " + k);
            } catch (err) {}
        }
        AI_RELAY_Q.set(k, e);
    } catch (err) {}
}

export function recordAiSuccess(host, port) {
    try {
        AI_RELAY_Q.delete(
            String(host || "").toLowerCase() + "|" + (port || 443),
        );
    } catch (err) {}
}

export function filterAiQuarantinedTokens(list) {
    // Fail-closed: a known-bad relay must not be reintroduced merely
    // because the healthy set is empty. Empty means explicit failure.
    try {
        return (list || []).filter((t) => {
            const rk = relayKeyOf(t);
            if (!rk) return true;
            return !isAiQuarantined(rk.host, rk.port);
        });
    } catch (e) {
        return [];
    }
}

export function filterQuarantinedRelays(list) {
    // Fail-closed: see above.
    try {
        return (list || []).filter((t) => {
            const rk = relayKeyOf(t);
            if (!rk) return true;
            return !isRelayQuarantined(rk.host, rk.port);
        });
    } catch (e) {
        return [];
    }
}

export function isAiDomain(d) {
    try {
        const v = String(d || "")
            .toLowerCase()
            .replace(/\.$/, "")
            .trim();
        if (!v || v.length > 253) return false;
        for (const sfx of AI_LLM_SUFFIXES) {
            if (v === sfx || v.endsWith("." + sfx)) return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

export function sniffSniFromHello(data) {
    try {
        const raw =
            data instanceof Uint8Array ? data : new Uint8Array(data || []);
        if (!raw || raw.byteLength <= 43) return null;
        if (raw[0] !== 0x16 || raw[5] !== 0x01) return null;
        let pos = 43;
        if (pos + 1 > raw.byteLength) return null;
        const sessionIdLen = raw[pos];
        pos += 1 + sessionIdLen;
        if (pos + 2 > raw.byteLength) return null;
        const cipherSuitesLen = (raw[pos] << 8) | raw[pos + 1];
        pos += 2 + cipherSuitesLen;
        if (pos + 1 > raw.byteLength) return null;
        const compMethodsLen = raw[pos];
        pos += 1 + compMethodsLen;
        if (pos + 2 > raw.byteLength) return null;
        const extensionsLen = (raw[pos] << 8) | raw[pos + 1];
        pos += 2;
        const endPos = Math.min(pos + extensionsLen, raw.byteLength);
        while (pos + 4 <= endPos) {
            const extType = (raw[pos] << 8) | raw[pos + 1];
            const extLen = (raw[pos + 2] << 8) | raw[pos + 3];
            pos += 4;
            if (extType === 0x0000) {
                if (pos + 2 > raw.byteLength) return null;
                const sniPos = pos + 2;
                if (raw[sniPos] === 0x00) {
                    if (sniPos + 3 > raw.byteLength) return null;
                    const sniLen =
                        (raw[sniPos + 1] << 8) | raw[sniPos + 2];
                    if (sniLen <= 0 || sniLen > 253) return null;
                    if (sniPos + 3 + sniLen > raw.byteLength) return null;
                    try {
                        return new TextDecoder().decode(
                            raw.slice(sniPos + 3, sniPos + 3 + sniLen),
                        );
                    } catch (e) {
                        return null;
                    }
                }
                return null;
            }
            pos += extLen;
        }
        return null;
    } catch (e) {
        return null;
    }
}

export function relayAiFlag(tok) {
    try {
        const s = String(tok || "");
        const hi = s.indexOf("#");
        if (hi === -1) return false;
        const toks = s.slice(hi + 1).split(/[\s,;]+/);
        for (const t of toks) {
            if (String(t).toLowerCase() === "ai") return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

export function orderAiFirstTokens(pips) {
    try {
        const list = Array.isArray(pips) ? pips : [];
        const ai = [];
        const rest = [];
        for (const t of list) {
            if (relayAiFlag(t)) ai.push(t);
            else rest.push(t);
        }
        if (ai.length === 0) return { list, moved: false };
        return { list: ai.concat(rest), moved: true };
    } catch (e) {
        return { list: [], moved: false };
    }
}

export function buildProbeHello(sni) {
    try {
        const sn = new TextEncoder()
            .encode(String(sni || "cloudflare-dns.com"))
            .slice(0, 64);
        const rnd = new Uint8Array(32);
        try {
            crypto.getRandomValues(rnd);
        } catch (e) {}
        const body = [0x03, 0x03];
        for (let i = 0; i < 32; i++) body.push(rnd[i]);
        body.push(0x00);
        // Proven cipher set (same as Sepidar agency-wide): ECDHE suites for
        // ECDSA+RSA certs. The old SNI-only hello false-failed on strict
        // servers; groups/point-formats/sigalgs below fix that (verified live
        // with real ServerHello replies from production relays).
        const cs = [0xc0, 0x2b, 0xc0, 0x2f, 0xcc, 0xa8, 0xc0, 0x13];
        body.push((cs.length >> 8) & 0xff, cs.length & 0xff);
        for (const b of cs) body.push(b);
        body.push(0x01, 0x00);
        const ext = [0x00, 0x00];
        const namePart = [0x00, (sn.length >> 8) & 0xff, sn.length & 0xff];
        for (let i = 0; i < sn.length; i++) namePart.push(sn[i]);
        const entry = [
            (namePart.length >> 8) & 0xff,
            namePart.length & 0xff,
        ].concat(namePart);
        const extBlock = [(entry.length >> 8) & 0xff, entry.length & 0xff].concat(entry);
        for (const b of extBlock) ext.push(b);
        // supported_groups (x25519, secp256r1), ec_point_formats, signature_algorithms
        const extraExts = [
            0x00, 0x0a, 0x00, 0x06, 0x00, 0x04, 0x00, 0x1d, 0x00, 0x17,
            0x00, 0x0b, 0x00, 0x02, 0x01, 0x00,
            0x00, 0x0d, 0x00, 0x08, 0x00, 0x06, 0x04, 0x03, 0x08, 0x04, 0x04, 0x01,
        ];
        for (const b of extraExts) ext.push(b);
        body.push((ext.length >> 8) & 0xff, ext.length & 0xff);
        for (const b of ext) body.push(b);
        const out = [0x16, 0x03, 0x01, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00];
        out[3] = ((body.length + 4) >> 8) & 0xff;
        out[4] = (body.length + 4) & 0xff;
        out[6] = (body.length >> 16) & 0xff;
        out[7] = (body.length >> 8) & 0xff;
        out[8] = body.length & 0xff;
        const full = out.concat(body);
        return new Uint8Array(full);
    } catch (e) {
        return null;
    }
}

export async function probeRelayOnce(host, port, timeoutMs) {
    let sock = null;
    const PM = timeoutMs > 0 ? timeoutMs : 4000;
    try {
        const probePort = port || 443;
        sock = connect({ hostname: host, port: probePort });
        await withTimeout(sock.opened, PM, "probe-timeout");
        // Non-TLS ports (e.g. :80 relays): a completed TCP open already
        // proves liveness. Sending a TLS hello there would always fail and
        // bury healthy relays, so stop here.
        if (!RELAY_TLS_PORTS.has(String(probePort))) return true;
        const hello = buildProbeHello("cloudflare-dns.com");
        if (!hello) return false;
        const writer = sock.writable.getWriter();
        try {
            await writeSocketWithTimeout(sock, writer, hello, PM);
        } finally {
            try {
                writer.releaseLock();
            } catch (e) {}
        }
        const reader = sock.readable.getReader();
        try {
            const res = await withTimeout(
                reader.read(),
                PM,
                "probe-timeout",
            );
            if (!res || res.done || !res.value) return false;
            const b = new Uint8Array(res.value);
            return b.length >= 2 && b[0] === 0x16 && b[1] === 0x03;
        } finally {
            try {
                reader.releaseLock();
            } catch (e) {}
        }
    } catch (e) {
        return false;
    } finally {
        try {
            if (sock) sock.close();
        } catch (e) {}
    }
}

export async function probeRelayVerdict(host, port) {
    try {
        if (await probeRelayOnce(host, port, 4000)) return true;
    } catch (e) {}
    try {
        return await probeRelayOnce(host, port, 7000);
    } catch (e) {
        return false;
    }
}

export function collectRelayInventory() {
    const out = new Map();
    const addRaw = (raw) => {
        try {
            String(raw || "")
                .split(/[\r\n,;]+/)
                .forEach((t) => {
                    const rk = relayKeyOf(t);
                    if (rk && !out.has(rk.key))
                        out.set(rk.key, { host: rk.host, port: rk.port });
                });
        } catch (e) {}
    };
    try {
        addRaw(sysConfig.backupRelay);
        addRaw(sysConfig.customRelay);
        (sysConfig.users || []).forEach((u) => {
            try {
                addRaw(u.proxyIp);
            } catch (e) {}
        });
    } catch (e) {}
    return Array.from(out.values());
}

export function pruneAutomationOff() {
    try {
        const v = sysConfig.autoPruneRelays;
        if (v === undefined || v === null) return false;
        const s = String(v).trim().toLowerCase();
        return s === "0" || s === "off" || s === "no" || s === "false";
    } catch (e) {
        return false;
    }
}

export async function loadRelayHealthSnapshot(env) {
    try {
        if (RELAY_SNAPSHOT_LOADED) return;
        if (RELAY_Q.size > 0) {
            RELAY_SNAPSHOT_LOADED = true;
            return;
        }
        const raw = await d1Get(env, "relay_health");
        if (!raw) return;
        const snap = JSON.parse(raw);
        const now = Date.now();
        const q = snap.q || {};
        for (const k of Object.keys(q)) {
            if (q[k] && q[k] > now && RELAY_Q.size < 2000)
                RELAY_Q.set(k, { fail: 0, until: q[k], probeFail: 0 });
        }
        RELAY_SNAPSHOT_LOADED = true;
    } catch (e) {}
}

export async function saveRelayHealthSnapshot(env) {
    try {
        if (Date.now() - lastHealthSave < PROBE_INTERVAL_MS) return;
        lastHealthSave = Date.now();
        const q = {};
        let active = 0;
        for (const [k, v] of RELAY_Q.entries()) {
            if (v && v.until && v.until > Date.now()) {
                q[k] = v.until;
                active++;
            }
        }
        if (active > 0) {
            // Never byte-slice JSON: slicing can produce invalid state the
            // next isolate cannot parse. Evict oldest entries instead.
            const entries = Object.entries(q).sort((a, b) => a[1] - b[1]);
            let payload = JSON.stringify({ q });
            while (payload.length > 8000 && entries.length > 0) {
                delete q[entries.shift()[0]];
                payload = JSON.stringify({ q });
            }
            if (payload.length > 8000) {
                try {
                    console.error("[relay] health snapshot too large, skip");
                } catch (e) {}
                return;
            }
            await d1Put(env, "relay_health", payload);
        } else {
            await d1Put(env, "relay_health", "{}");
        }
    } catch (e) {}
}

export async function probeDeadRelays(env) {
    try {
        if (pruneAutomationOff()) return;
        if (!env || !env.IOT_DB) return;
        const runnerLease = await acquireNahanRunnerLock(
            env,
            "probe",
            PROBE_INTERVAL_MS,
        );
        if (!runnerLease) return;
        try {
        const now = Date.now();
        if (now - lastProbeTs < PROBE_INTERVAL_MS) return;
        lastProbeTs = now;
        await loadRelayHealthSnapshot(env);
        const inv = collectRelayInventory();
        if (inv.length === 0) return;
        // Sick-first priority, then round-robin rotation so relays past the
        // per-round cap are not starved forever (same guarantee as Sepidar).
        const scored = inv
            .map((r) => {
                const e = RELAY_Q.get(r.host + "|" + r.port);
                return { r, pf: (e && e.probeFail) || 0 };
            })
            .sort(
                (a, b) =>
                    b.pf - a.pf ||
                    (a.r.host < b.r.host ? -1 : 1),
            );
        // Floating cap: under traffic pressure (breaker) probe half as many
        // so isolate CPU stays with real tunnels.
        let probeCap = PROBE_MAX_PER_ROUND;
        try {
            if (breakerLevel() >= 1)
                probeCap = Math.max(1, Math.floor(probeCap / 2));
        } catch (e) {}
        if (typeof probeCursor !== "number") probeCursor = 0;
        // Persistent cursor: isolates are ephemeral, so an in-memory cursor
        // alone restarts at zero on every cold start and starves later relays.
        try {
            if (scored.length > 0) {
                const stored = await d1Get(env, "nahan_runner_probe_cursor");
                const n = Number(stored);
                if (Number.isFinite(n) && n >= 0)
                    probeCursor = Math.floor(n) % scored.length;
            }
        } catch (e) {}
        const rotated = [];
        for (let i = 0; i < scored.length; i++)
            rotated.push(scored[(probeCursor + i) % scored.length]);
        probeCursor = (probeCursor + probeCap) % scored.length;
        try {
            await d1Put(env, "nahan_runner_probe_cursor", String(probeCursor));
        } catch (e) {}
        const picked = rotated.slice(0, probeCap);
        // Probes run in parallel (bounded to probeCap relays) so
        // a full round fits the background-task budget; mutations below
        // stay strictly sequential to avoid concurrent sys_config writes.
        const results = await Promise.all(
            picked.map(async ({ r }) => {
                let ok = false;
                try {
                    ok = await probeRelayVerdict(r.host, r.port);
                } catch (e) {
                    ok = false;
                }
                return { r, ok };
            }),
        );
        for (const { r } of results.filter((x) => x.ok)) {
            recordRelaySuccess(r.host, r.port, true);
        }
        for (const { r } of results.filter((x) => !x.ok)) {
            const k = r.host + "|" + r.port;
            let e = RELAY_Q.get(k);
            if (!e) {
                e = { fail: 0, until: 0, probeFail: 0 };
                RELAY_Q.set(k, e);
            }
            e.probeFail = (e.probeFail || 0) + 1;
            e.until = Date.now() + 600000;
            if (e.probeFail >= PROBE_FAIL_LIMIT) {
                try {
                    await buryDeadRelay(env, r.host, r.port);
                } catch (err) {}
            }
        }
        await saveRelayHealthSnapshot(env);
        } finally {
            await releaseNahanRunnerLock(env, runnerLease);
        }
    } catch (e) {}
}

export async function buryDeadRelay(env, host, port) {
    try {
        if (!env || !env.IOT_DB || !host) return false;
        if (pruneAutomationOff()) return false;
        const hostLower = String(host).toLowerCase();
        const portN = port || 443;
        const deadKey = hostLower + "|" + portN;
        const keyMatches = (tok) => {
            try {
                const rk = relayKeyOf(tok);
                return !!rk && rk.key === deadKey;
            } catch (e) {
                return false;
            }
        };
        const stripDead = (raw) => {
            const parts = String(raw || "")
                .split(/[\r\n,;]+/)
                .map((s) => s.trim())
                .filter(Boolean);
            const kept = parts.filter((t) => !keyMatches(t));
            return { kept, removed: parts.length - kept.length };
        };
        // AI flag of the buried relay (if any placement had `#AI`), so the
        // grave remembers it and resurrect restores it.
        const tokenHasAi = (raw) => {
            try {
                const parts = String(raw || "")
                    .split(/[\r\n,;]+/)
                    .map((s) => s.trim())
                    .filter(Boolean);
                for (const t of parts) {
                    if (keyMatches(t) && relayAiFlag(t)) return true;
                }
                return false;
            } catch (e) {
                return false;
            }
        };
        // Two-phase burial (Sepidar-grade): scan everything FIRST without
        // mutating, persist the grave BEFORE touching live rotation, then
        // remove from rotation. A storage failure can never silently destroy
        // rotation entries without leaving a recovery record behind.
        const lists = [];
        let aiKeep = false;
        const globalChanges = [];
        const userChanges = [];
        try {
            for (const field of ["backupRelay", "customRelay"]) {
                const raw = sysConfig[field] || "";
                if (!raw || raw.toLowerCase().indexOf(hostLower) === -1)
                    continue;
                const { kept, removed } = stripDead(raw);
                if (removed > 0) {
                    if (tokenHasAi(raw)) aiKeep = true;
                    lists.push("global:" + field);
                    if (kept.length > 0)
                        globalChanges.push({ field, next: kept.join(",") });
                }
            }
        } catch (e) {}
        try {
            const users = sysConfig.users || [];
            for (const u of users) {
                try {
                    const raw = u.proxyIp || "";
                    if (
                        !raw ||
                        raw.toLowerCase().indexOf(hostLower) === -1
                    )
                        continue;
                    const { kept, removed } = stripDead(raw);
                    if (removed === 0) continue;
                    // Sole/last relay of a user is deliberately preserved:
                    // remember the placement but do not claim a burial.
                    if (kept.length === 0) continue;
                    if (tokenHasAi(raw)) aiKeep = true;
                    lists.push("user:" + (u.name || u.id));
                    userChanges.push({ u, next: kept.join(",") });
                } catch (e) {}
            }
        } catch (e) {}
        // Nothing was actually removed from live rotation: do not clear
        // quarantine and do not create a misleading grave.
        if (globalChanges.length === 0 && userChanges.length === 0)
            return false;
        try {
            let g = {};
            try {
                g = JSON.parse((await d1Get(env, "relay_graveyard")) || "{}");
            } catch (e) {
                g = {};
            }
            const prev = g[deadKey] || {};
            let flaps = [];
            try {
                const fm = JSON.parse(
                    (await d1Get(env, "relay_flaps")) || "{}",
                );
                flaps = Array.isArray(fm[deadKey])
                    ? fm[deadKey].filter((t) => nowTs() - t < FLAP_WINDOW_MS)
                    : [];
            } catch (e) {
                flaps = [];
            }
            const entry = {
                host: hostLower,
                port: portN,
                ai: !!(prev.ai || aiKeep),
                buriedAt: Date.now(),
                lists: Array.from(
                    new Set([].concat(prev.lists || [], lists)),
                ).slice(0, 100),
                burials: (prev.burials || 0) + 1,
                healthyStreak: 0,
                unstable: flaps.length >= FLAP_LIMIT,
            };
            g[deadKey] = entry;
            // Never evict the grave we just created to stay under a cap,
            // and never byte-slice JSON: evict oldest entries instead.
            const gk = Object.keys(g);
            if (gk.length > 50) {
                const candidates = gk.filter((k) => k !== deadKey);
                candidates.sort(
                    (a, b) =>
                        ((g[a] && g[a].buriedAt) || 0) -
                        ((g[b] && g[b].buriedAt) || 0),
                );
                for (const drop of candidates.slice(
                    0,
                    Math.max(0, gk.length - 50),
                )) {
                    try {
                        delete g[drop];
                    } catch (e) {}
                }
            }
            let gravePayload = JSON.stringify(g);
            if (gravePayload.length > 200000) {
                const ordered = Object.keys(g)
                    .filter((k) => k !== deadKey)
                    .sort(
                        (a, b) =>
                            ((g[a] && g[a].buriedAt) || 0) -
                            ((g[b] && g[b].buriedAt) || 0),
                    );
                for (const drop of ordered) {
                    delete g[drop];
                    gravePayload = JSON.stringify(g);
                    if (gravePayload.length <= 200000) break;
                }
            }
            if (gravePayload.length > 200000) return false;
            try {
                await d1PutStrict(env, "relay_graveyard", gravePayload);
            } catch (e) {
                return false;
            }
            // Grave is durable: now remove from live rotation. Any partial
            // D1 failure here can be healed later by resurrectRelay().
            const prevGlobals = {};
            const prevUsers = new Map();
            try {
                for (const c of globalChanges)
                    prevGlobals[c.field] = sysConfig[c.field];
                for (const c of userChanges) prevUsers.set(c.u, c.u.proxyIp);
                for (const c of globalChanges) sysConfig[c.field] = c.next;
                for (const c of userChanges) c.u.proxyIp = c.next;
                await d1PutStrict(env, "sys_config", JSON.stringify(sysConfig));
            } catch (e) {
                try {
                    for (const k of Object.keys(prevGlobals))
                        sysConfig[k] = prevGlobals[k];
                    for (const [u, prev] of prevUsers) u.proxyIp = prev;
                } catch (_) {}
                return false;
            }
            try {
                console.error(
                    "relay-buried: " + deadKey + " from " + lists.join(","),
                );
            } catch (e) {}
        } catch (e) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

export function nowTs() {
    return Date.now();
}

export async function resurrectRelay(env, key, entry) {
    // Returns true when the grave entry can be closed (re-added or already
    // present). Only an actual restoration counts as a change: flap history
    // must not be inflated by already-present relays.
    lastResurrectChanged = false;
    try {
        const host = String(entry.host || "").toLowerCase();
        if (!host) return false;
        const port = entry.port || 443;
        // Restore the #AI flag when the buried relay had one (names are
        // re-added bare, as before — only the flag round-trips).
        let token = host + (port && port !== 443 ? ":" + port : "");
        try {
            if (entry.ai === true) token += "#AI";
        } catch (e) {}
        const addToken = (raw) => {
            const parts = String(raw || "")
                .split(/[\r\n,;]+/)
                .map((s) => s.trim())
                .filter(Boolean);
            for (const t of parts) {
                try {
                    const rk = relayKeyOf(t);
                    if (rk && rk.key === key) return String(raw || "");
                } catch (e) {}
            }
            return (raw && String(raw).trim()
                ? String(raw).replace(/,+$/, "") + ","
                : "") + token;
        };
        let restoreChanged = false;
        for (const l of entry.lists || []) {
            try {
                if (l === "global:backupRelay") {
                    const before = sysConfig.backupRelay;
                    const after = addToken(before);
                    if (after !== before) {
                        sysConfig.backupRelay = after;
                        restoreChanged = true;
                    }
                } else if (l === "global:customRelay") {
                    const before = sysConfig.customRelay;
                    const after = addToken(before);
                    if (after !== before) {
                        sysConfig.customRelay = after;
                        restoreChanged = true;
                    }
                } else if (l.startsWith("user:")) {
                    const nm = l.slice(5);
                    const u = (sysConfig.users || []).find(
                        (x) => x && (x.name === nm || x.id === nm),
                    );
                    // Missing user (deleted account) is tolerated: it must
                    // not block an otherwise valid resurrection.
                    if (!u) continue;
                    const before = u.proxyIp;
                    const after = addToken(before);
                    if (after !== before) {
                        u.proxyIp = after;
                        restoreChanged = true;
                    }
                }
            } catch (e) {
                return false;
            }
        }
        if (!restoreChanged) {
            try {
                console.error("relay-already-present: " + key);
            } catch (e) {}
            return true;
        }
        try {
            await d1PutStrict(env, "sys_config", JSON.stringify(sysConfig));
        } catch (e) {
            return false;
        }
        lastResurrectChanged = true;
        try {
            console.error("relay-resurrected: " + key);
        } catch (e) {}
        return true;
    } catch (e) {
        return false;
    }
}

export async function probeGraveyard(env) {
    try {
        if (pruneAutomationOff()) return;
        if (!env || !env.IOT_DB) return;
        const runnerLease = await acquireNahanRunnerLock(
            env,
            "graveyard",
            GRAVE_INTERVAL_MS,
        );
        if (!runnerLease) return;
        try {
        const now = Date.now();
        if (now - lastGraveTs < GRAVE_INTERVAL_MS) return;
        lastGraveTs = now;
        let g = {};
        try {
            g = JSON.parse((await d1Get(env, "relay_graveyard")) || "{}");
        } catch (e) {
            return;
        }
        const keys = Object.keys(g).slice(0, 200);
        keys.sort(
            (a, b) => ((g[a] && g[a].buriedAt) || 0) - ((g[b] && g[b].buriedAt) || 0),
        );
        if (keys.length === 0) return;
        // Round-robin over oldest-first order so graves past the per-round
        // cap are not starved (same guarantee as Sepidar).
        if (typeof graveCursor !== "number") graveCursor = 0;
        try {
            const stored = await d1Get(env, "nahan_runner_grave_cursor");
            const n = Number(stored);
            if (Number.isFinite(n) && n >= 0)
                graveCursor = Math.floor(n) % keys.length;
        } catch (e) {}
        const grotated = [];
        for (let i = 0; i < keys.length; i++)
            grotated.push(keys[(graveCursor + i) % keys.length]);
        // Floating cap under traffic pressure (breaker), min 1.
        let graveCap = GRAVE_MAX_PER_ROUND;
        try {
            if (breakerLevel() >= 1)
                graveCap = Math.max(1, Math.floor(graveCap / 2));
        } catch (e) {}
        graveCursor = (graveCursor + graveCap) % keys.length;
        try {
            await d1Put(env, "nahan_runner_grave_cursor", String(graveCursor));
        } catch (e) {}
        // Probes in parallel (bounded); grave/config mutations below stay
        // sequential to avoid concurrent sys_config writes.
        const graveTargets = grotated.slice(0, graveCap);
        const graveResults = await Promise.all(
            graveTargets.map(async (k) => {
                const entry = g[k];
                if (!entry || !entry.host) return { k, ok: null };
                let ok = false;
                try {
                    ok = await probeRelayVerdict(entry.host, entry.port || 443);
                } catch (e) {
                    ok = false;
                }
                return { k, ok };
            }),
        );
        let dirty = false;
        for (const { k, ok } of graveResults) {
            const entry = g[k];
            if (!entry || !entry.host) {
                delete g[k];
                dirty = true;
                continue;
            }
            if (ok === null) continue;
            if (ok) {
                entry.healthyStreak = (entry.healthyStreak || 0) + 1;
                if (entry.healthyStreak >= GRAVE_HEALTHY_NEED) {
                    // Close the grave ONLY on confirmed success, never on a
                    // half-finished resurrect (otherwise placements are lost).
                    let okR = false;
                    try {
                        okR = await resurrectRelay(env, k, entry);
                    } catch (e) {
                        okR = false;
                    }
                    if (!okR) {
                        entry.healthyStreak = 0;
                        dirty = true;
                        continue;
                    }
                    // Flap history only on real restoration: an already-live
                    // relay must not inflate flap counts.
                    if (lastResurrectChanged) {
                        try {
                            const fm = JSON.parse(
                                (await d1Get(env, "relay_flaps")) || "{}",
                            );
                            const arr = Array.isArray(fm[k]) ? fm[k] : [];
                            arr.push(Date.now());
                            fm[k] = arr
                                .filter((t) => Date.now() - t < FLAP_WINDOW_MS)
                                .slice(-10);
                            await d1Put(env, "relay_flaps", JSON.stringify(fm));
                        } catch (e) {}
                    }
                    recordRelaySuccess(entry.host, entry.port || 443, true);
                    delete g[k];
                    dirty = true;
                } else {
                    dirty = true;
                }
            } else {
                try {
                    console.error("relay-grave-failed: " + k);
                } catch (e) {}
                entry.healthyStreak = 0;
                dirty = true;
            }
        }
        if (dirty) await d1Put(env, "relay_graveyard", JSON.stringify(g));
        } finally {
            await releaseNahanRunnerLock(env, runnerLease);
        }
    } catch (e) {}
}