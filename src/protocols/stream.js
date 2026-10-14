import { connect } from "cloudflare:sockets";
import { sysConfig, incActiveConnections, decActiveConnections, incOpenWs, decOpenWs, uuidUsage, activeConns, trackUsage } from "../core/state.js";
import { getAlpha, getBeta, TCP_OPEN_TIMEOUT_MS, TCP_WRITE_TIMEOUT_MS, TCP_FIRST_READ_TIMEOUT_MS, UPSTREAM_WRITE_TIMEOUT_MS, UPSTREAM_QUEUE_MAX_BYTES, UPSTREAM_QUEUE_MAX_ITEMS } from "../core/constants.js";
import { closeTcpSocketQuietly, releaseWriterQuietly, withDeadline, writeSocketWithTimeout, safeBtoa, fetchT } from "../core/utils.js";
import { sha224Hex, wsRateCheck, authBlocked, authFail, authClear } from "../core/auth.js";
import { getAuthHash, lookupConfigEntry, decodeConfigUuid } from "./trojan.js";
import { orderAiFirstTokens, isRelayQuarantined, recordRelaySuccess, recordRelayFailure, recordAiSuccess, recordAiFailure, isAiDomain, sniffSniFromHello, filterQuarantinedRelays, filterAiQuarantinedTokens, relayKeyOf } from "../relays/health.js";
import { getAllProfiles, getEffectivePips } from "../api/users.js";
import { sendNormalizedDownstream, writeNormalizedTraffic } from "../core/normalizer.js";

export async function processTelemetryStream(env, ctx, wsRelayIdx) {
    // @ts-ignore
    const [client, webSocket] = Object.values(
        new (globalThis["WebSocketPair"] || Reflect.get(globalThis, "WebSocketPair"))(),
    );
    webSocket.accept();
    webSocket.binaryType = "arraybuffer";
    startDataPipe(webSocket, env, ctx, wsRelayIdx);
    return new Response(null, { status: 101, webSocket: client });
}

export async function startDataPipe(webSocket, env, ctx, wsRelayIdx) {
    incActiveConnections();
    try {
        incOpenWs();
    } catch (e) {}
    // Per-connection byte counters (up+down). Flushed to usage on close.
    let connBytesUp = 0;
    let connBytesDown = 0;
    // Relay ownership for this tunnel generation: only downstream bytes on
    // THIS socket may confirm the selected relay (an old stream must never
    // credit a new relay). Upstream is bounded so a flooding client cannot
    // grow memory without limit.
    let activeRelay = null;
    let relayConfirmed = false;
    let pendingUpBytes = 0;
    let pendingUpItems = 0;
    webSocket.addEventListener("close", () => {
        decActiveConnections();
        try {
            decOpenWs();
        } catch (e) {}
        if (activeClientHash) {
            let cur = activeConns.get(activeClientHash) || 0;
            if (cur > 0) activeConns.set(activeClientHash, cur - 1);
        }
        try {
            const totalConnBytes = connBytesUp + connBytesDown;
            if (activeClientHash && totalConnBytes > 0) {
                trackUsage(activeClientHash, totalConnBytes, env, ctx);
            }
        } catch (e) {}
    });
    webSocket.addEventListener("error", () => {});
    let remoteSocket,
        dataWriter,
        isInit = true,
        queue = Promise.resolve();
    let activeClientHash = null;
    webSocket.addEventListener("message", (event) => {
        const size = event.data?.byteLength || 0;
        pendingUpBytes += size;
        pendingUpItems++;
        if (
            pendingUpBytes > UPSTREAM_QUEUE_MAX_BYTES ||
            pendingUpItems > UPSTREAM_QUEUE_MAX_ITEMS
        ) {
            try {
                webSocket.close();
            } catch (e) {}
            return;
        }
        queue = queue.then(async () => {
            pendingUpBytes = Math.max(0, pendingUpBytes - size);
            pendingUpItems = Math.max(0, pendingUpItems - 1);
            try {
                if (isInit) {
                    isInit = false;
                    const isModeAlpha = await parseSensorData(
                        event.data,
                        wsRelayIdx,
                    );
                    if (isModeAlpha) webSocket.send(new Uint8Array([0, 0]));
                } else if (dataWriter) {
                    // Timed write: a stalled TCP write must reject and tear
                    // down the tunnel, never hang the queue forever (->1101).
                    try {
                        await writeNormalizedTraffic(
                            remoteSocket,
                            dataWriter,
                            event.data,
                            UPSTREAM_WRITE_TIMEOUT_MS,
                        );
                    } catch (werr) {
                        closeTcpSocketQuietly(remoteSocket);
                        try {
                            releaseWriterQuietly(dataWriter);
                        } catch (e) {}
                        dataWriter = null;
                        try {
                            webSocket.close();
                        } catch (e) {}
                        return;
                    }
                    try {
                        connBytesUp += event.data?.byteLength || 0;
                    } catch (e) {}
                }
            } catch (err) {
                webSocket.close();
            }
        });
    });

    async function parseSensorData(bufferData, wsRelayIdx) {
        const view = new Uint8Array(bufferData);
        let targetAddr = "",
            targetPort = 0,
            offset = 0,
            isModeAlpha = false,
            activeProfile = null;

        if (view[0] === 0x00) {
            isModeAlpha = true;

            let clientHash = Array.from(view.slice(1, 17))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            let configEntry = lookupConfigEntry(clientHash);

            if (configEntry) {
                activeClientHash = configEntry.userId
                    .replace(/-/g, "")
                    .toLowerCase();
                activeProfile = getAllProfiles().find(
                    (p) =>
                        p.id.replace(/-/g, "").toLowerCase() ===
                        activeClientHash,
                );
                if (!activeProfile) return false;
                if (configEntry.relayIp)
                    activeProfile = {
                        ...activeProfile,
                        proxyIp: configEntry.relayIp,
                    };
            } else {
                let decoded = decodeConfigUuid(clientHash);
                if (decoded) {
                    activeProfile = getAllProfiles().find((p) =>
                        p.id
                            .replace(/-/g, "")
                            .toLowerCase()
                            .startsWith(decoded.userFingerprint),
                    );
                    if (activeProfile && decoded.relayIpIndex >= 0) {
                        const effectivePips = getEffectivePips(activeProfile);
                        if (effectivePips.length > 0) {
                            const idx =
                                decoded.relayIpIndex % effectivePips.length;
                            activeProfile = {
                                ...activeProfile,
                                proxyIp: effectivePips[idx],
                            };
                        }
                    }
                }
                if (!activeProfile) {
                    activeProfile = getAllProfiles().find(
                        (p) =>
                            p.id.replace(/-/g, "").toLowerCase() === clientHash,
                    );
                }
                if (!activeProfile) return false;
                activeClientHash = activeProfile.id
                    .replace(/-/g, "")
                    .toLowerCase();
            }
            trackUsage(activeClientHash, 0, env, ctx);

            let currentConns = activeConns.get(activeClientHash) || 0;
            if (activeProfile && activeProfile.connLimit) {
                if (currentConns >= activeProfile.connLimit) {
                    webSocket.close();
                    return isModeAlpha;
                }
            }
            activeConns.set(activeClientHash, currentConns + 1);

            let uTrack = uuidUsage.get(activeClientHash) || {
                connects: 0,
                last: 0,
            };
            uTrack.connects++;
            uTrack.last = Date.now();
            uuidUsage.set(activeClientHash, uTrack);

            const optLen = view[17];
            const pPos = 18 + optLen + 1;
            targetPort = new DataView(
                bufferData.slice(pPos, pPos + 2),
            ).getUint16(0);
            const aType = view[pPos + 2];
            let vPos = pPos + 3,
                aLen = 0;

            if (aType === 1) {
                aLen = 4;
                targetAddr = view.slice(vPos, vPos + aLen).join(".");
            } else if (aType === 2) {
                aLen = view[vPos];
                vPos++;
                targetAddr = new TextDecoder().decode(
                    view.slice(vPos, vPos + aLen),
                );
            } else if (aType === 3) {
                aLen = 16;
                const dv = new DataView(bufferData.slice(vPos, vPos + aLen));
                targetAddr = Array.from({ length: 8 }, (_, i) =>
                    dv.getUint16(i * 2).toString(16),
                ).join(":");
            }
            offset = vPos + aLen;
        } else {
            let ePos = bufferData.byteLength;
            for (let i = 0; i < bufferData.byteLength; i++) {
                if (view[i] === 0x0d && view[i + 1] === 0x0a) {
                    ePos = i;
                    break;
                }
            }

            let clientHashHex = new TextDecoder().decode(view.slice(0, ePos));
            let configEntry = lookupConfigEntry(clientHashHex);

            if (configEntry) {
                activeClientHash = configEntry.userId
                    .replace(/-/g, "")
                    .toLowerCase();
                activeProfile = getAllProfiles().find(
                    (p) =>
                        p.id.replace(/-/g, "").toLowerCase() ===
                        activeClientHash,
                );
                if (!activeProfile) return false;
                if (configEntry.relayIp)
                    activeProfile = {
                        ...activeProfile,
                        proxyIp: configEntry.relayIp,
                    };
            } else {
                activeProfile = getAllProfiles().find(
                    (p) => getAuthHash(p.id) === clientHashHex,
                );
                if (!activeProfile) return false;
                activeClientHash = activeProfile.id
                    .replace(/-/g, "")
                    .toLowerCase();
                if (wsRelayIdx >= 0) {
                    const effectivePips = getEffectivePips(activeProfile);
                    if (effectivePips.length > 0) {
                        activeProfile = {
                            ...activeProfile,
                            proxyIp:
                                effectivePips[
                                    wsRelayIdx % effectivePips.length
                                ],
                        };
                    }
                }
            }
            trackUsage(activeClientHash, 0, env, ctx);
            let currentConns = activeConns.get(activeClientHash) || 0;
            if (activeProfile && activeProfile.connLimit) {
                if (currentConns >= activeProfile.connLimit) {
                    webSocket.close();
                    return isModeAlpha;
                }
            }
            activeConns.set(activeClientHash, currentConns + 1);
            let uTrack = uuidUsage.get(activeClientHash) || {
                connects: 0,
                last: 0,
            };
            uTrack.connects++;
            uTrack.last = Date.now();
            uuidUsage.set(activeClientHash, uTrack);

            let hPos = ePos + 2;
            hPos++;
            let aType = view[hPos];
            hPos++;
            let aLen = 0;

            if (aType === 1) {
                aLen = 4;
                targetAddr = view.slice(hPos, hPos + aLen).join(".");
            } else if (aType === 3) {
                aLen = view[hPos];
                hPos++;
                targetAddr = new TextDecoder().decode(
                    view.slice(hPos, hPos + aLen),
                );
            } else if (aType === 4) {
                aLen = 16;
                const dv = new DataView(bufferData.slice(hPos, hPos + aLen));
                targetAddr = Array.from({ length: 8 }, (_, i) =>
                    dv.getUint16(i * 2).toString(16),
                ).join(":");
            }

            hPos += aLen;
            targetPort = new DataView(
                bufferData.slice(hPos, hPos + 2),
            ).getUint16(0);
            offset = hPos + 4;
        }

        let isDomain =
            /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(targetAddr) ||
            /^[a-zA-Z0-9-]+$/.test(targetAddr);
        let connectAddr = targetAddr;
        // AI smart egress classification: explicit domain literal, else TLS
        // SNI sniff (clients usually send an IP literal in the header).
        let aiEgress = false;
        try {
            if (isDomain) aiEgress = isAiDomain(targetAddr);
            else if (targetPort === 443 && offset < bufferData.byteLength) {
                aiEgress = isAiDomain(
                    sniffSniFromHello(bufferData.slice(offset)),
                );
            }
        } catch (e) {}
        if (isDomain && sysConfig.customDns) {
            try {
                const dohUrl = new URL(sysConfig.customDns);
                dohUrl.searchParams.set("name", targetAddr);
                dohUrl.searchParams.set("type", "A");
                let dnsRes = await fetchT(dohUrl.toString(), {
                    headers: { accept: "application/dns-json" },
                });
                let dnsJson = await dnsRes.json();
                if (dnsJson.Answer && dnsJson.Answer.length > 0) {
                    connectAddr = dnsJson.Answer[0].data;
                }
            } catch (e) {}
        }

        try {
            remoteSocket = connect({ hostname: connectAddr, port: targetPort });
            await withDeadline(
                remoteSocket.opened,
                TCP_OPEN_TIMEOUT_MS,
                () => closeTcpSocketQuietly(remoteSocket),
                "direct-open",
            );
            activeRelay = null;
            relayConfirmed = false;
        } catch {
            let pips = [];
            if (activeProfile && activeProfile.proxyIp) {
                pips = activeProfile.proxyIp
                    .split(/[\r\n,;]+/)
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
            if (pips.length === 0 && sysConfig.backupRelay) {
                pips = sysConfig.backupRelay
                    .split(/[\r\n,;]+/)
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
            if (pips.length === 0 && sysConfig.customRelay) {
                pips = sysConfig.customRelay
                    .split(/[\r\n,;]+/)
                    .map((s) => s.trim())
                    .filter(Boolean);
            }

            // Consistent hash based on user/profile ID to prevent session/IP splitting across assets on Cloudflare
            // AI smart egress: AI-flagged relays first, deterministic (no
            // rotation) so AI exits via clean-country relays. Untouched when
            // no AI relay is present (distribution exactly as before).
            let startIndex = 0;
            let aiPinned = false;
            try {
                if (aiEgress) {
                    const ord = orderAiFirstTokens(pips);
                    if (ord.moved) {
                        pips = ord.list;
                        aiPinned = true;
                    }
                }
            } catch (e) {}
            if (pips.length > 1 && !aiPinned) {
                let hash = 0;
                let hashStr = activeProfile ? activeProfile.id : "";
                for (let i = 0; i < hashStr.length; i++) {
                    hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
                }
                startIndex = Math.abs(hash) % pips.length;
            }

            // Attempt to connect with automatic failover to alternative proxy IPs
            // (quarantined relays are skipped unless everything is down).
            // Per-SNI AI quarantine: relays failing only AI traffic are skipped
            // for AI destinations (never for the rest).
            let connected = false;
            let tryPips = filterQuarantinedRelays(pips);
            try {
                if (aiEgress && tryPips.length > 1)
                    tryPips = filterAiQuarantinedTokens(tryPips);
            } catch (e) {}
            for (
                let attempt = 0;
                attempt < Math.min(tryPips.length, 3);
                attempt++
            ) {
                let currentIndex = (startIndex + attempt) % tryPips.length;
                let currentProxy = tryPips[currentIndex];
                const rkFail = relayKeyOf(currentProxy);
                try {
                    const [altIP0, altPortStr0] = currentProxy.split(":");
                    // Strip #Name from the port (Number("8443#X") is NaN) and
                    // prefer the parsed host (fixes IPv6 + "#Name" tokens).
                    // Semantics otherwise unchanged (garbage still fails).
                    const altPortClean = altPortStr0
                        ? altPortStr0.split("#")[0].trim()
                        : altPortStr0;
                    const altIP =
                        rkFail && rkFail.host ? rkFail.host : altIP0;
                    remoteSocket = connect({
                        hostname: altIP,
                        port: altPortClean ? Number(altPortClean) : targetPort,
                    });
                    await withDeadline(
                        remoteSocket.opened,
                        TCP_OPEN_TIMEOUT_MS,
                        () => closeTcpSocketQuietly(remoteSocket),
                        "relay-open",
                    );
                    connected = true;
                    // No instant success credit: a TCP accept is weak proof
                    // (a dead relay accepts TCP then hangs). The relay is
                    // bound to this tunnel generation and confirmed only by
                    // real downstream bytes in the pipe below.
                    relayConfirmed = false;
                    activeRelay = rkFail
                        ? {
                              host: rkFail.host,
                              port: rkFail.port,
                              ai: aiEgress,
                          }
                        : null;
                    break;
                } catch (e) {
                    if (rkFail) {
                        try {
                            // AI-only failures feed the AI map so the relay
                            // stays alive for all other traffic.
                            if (aiEgress)
                                recordAiFailure(rkFail.host, rkFail.port);
                            else recordRelayFailure(rkFail.host, rkFail.port);
                        } catch (ee) {}
                    }
                    // Try next fallback proxy IP in list
                }
            }
            if (!connected) {
                webSocket.close();
                return isModeAlpha;
            }
        }

        dataWriter = remoteSocket.writable.getWriter();
        if (offset < bufferData.byteLength) {
            let chunk = bufferData.slice(offset);
            // Timed initial write: never hang the handshake path.
            try {
                await writeNormalizedTraffic(
                    remoteSocket,
                    dataWriter,
                    chunk,
                    TCP_WRITE_TIMEOUT_MS,
                );
            } catch (e) {
                closeTcpSocketQuietly(remoteSocket);
                try {
                    releaseWriterQuietly(dataWriter);
                } catch (_) {}
                dataWriter = null;
                try {
                    webSocket.close();
                } catch (_) {}
                return isModeAlpha;
            }
            try {
                connBytesUp += chunk.byteLength || 0;
            } catch (e) {}
        }
        // Downstream pipe: the FIRST real bytes on this socket confirm the
        // bound relay (end-to-end proof). Completion closes the client side
        // so a dead remote cannot leave a half-open tunnel behind.
        try {
            remoteSocket.readable
                .pipeTo(
                    new WritableStream({
                        write(chunk) {
                            try {
                                connBytesDown += chunk?.byteLength || 0;
                                const n =
                                    (chunk && chunk.byteLength) || 0;
                                if (
                                    n > 0 &&
                                    activeRelay &&
                                    !relayConfirmed
                                ) {
                                    relayConfirmed = true;
                                    try {
                                        recordRelaySuccess(
                                            activeRelay.host,
                                            activeRelay.port,
                                            true,
                                        );
                                    } catch (e) {}
                                    try {
                                        if (activeRelay.ai)
                                            recordAiSuccess(
                                                activeRelay.host,
                                                activeRelay.port,
                                            );
                                    } catch (e) {}
                                }
                            } catch (e) {}
                            try {
                                sendNormalizedDownstream(webSocket, chunk);
                            } catch (e) {}
                        },
                        close() {},
                        abort() {},
                    }),
                )
                .catch(() => {})
                .finally(() => {
                    closeTcpSocketQuietly(remoteSocket);
                    try {
                        webSocket.close();
                    } catch (e) {}
                });
        } catch (e) {}

        return isModeAlpha;
    }
}