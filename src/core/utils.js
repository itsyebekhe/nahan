import { REQ_BYTES_EST, TCP_WRITE_TIMEOUT_MS, UPSTREAM_WRITE_TIMEOUT_MS } from "./constants.js";
import { breakerLevel } from "./state.js";

export const safeBtoa = (str) => {
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


export async function fetchT(url, init = {}, timeoutMs = 10000) {
    // Bounded fetch: hard timeout so a hanging origin (ubuntu/docker,
    // ip-api, DoH, github, telegram, CF API) can never leave the request
    // with no events in the loop -> Cloudflare 1101. Caller abort signals
    // are bridged into the internal controller, never replaced.
    const timeout = Math.max(1, Number(timeoutMs) || 10000);
    let controller = null;
    let timer = null;
    let callerSignal = null;
    let onCallerAbort = null;
    try {
        if (typeof AbortController !== "undefined") {
            controller = new AbortController();
            callerSignal = init && init.signal ? init.signal : null;
            if (callerSignal) {
                if (callerSignal.aborted)
                    controller.abort(callerSignal.reason);
                else {
                    onCallerAbort = () => {
                        try {
                            controller.abort(callerSignal.reason);
                        } catch (e) {}
                    };
                    try {
                        callerSignal.addEventListener("abort", onCallerAbort, {
                            once: true,
                        });
                    } catch (e) {}
                }
            }
            timer = setTimeout(() => {
                try {
                    controller.abort();
                } catch (e) {}
            }, timeout);
            // NOTE: plain fetch() here on purpose — fetchT must never call
            // itself (infinite recursion).
            return await fetch(url, { ...init, signal: controller.signal });
        }
        return await fetch(url, { ...init });
    } finally {
        if (timer) {
            try {
                clearTimeout(timer);
            } catch (e) {}
        }
        if (callerSignal && onCallerAbort) {
            try {
                callerSignal.removeEventListener("abort", onCallerAbort);
            } catch (e) {}
        }
    }
}

export function usageTotalBytes(u) {
    try {
        if (!u) return 0;
        if (typeof u.bytes === "number" && u.bytes >= 0)
            return Math.floor(u.bytes);
        return Math.floor((u.reqs || 0) * REQ_BYTES_EST);
    } catch (e) {
        return 0;
    }
}

export function usageDailyBytes(u, today) {
    try {
        if (!u) return 0;
        const day =
            today || new Date().toISOString().split("T")[0];
        if ((u.lastDay || "") !== day) return 0;
        if (typeof u.dBytes === "number" && u.dBytes >= 0)
            return Math.floor(u.dBytes);
        return Math.floor((u.dReqs || 0) * REQ_BYTES_EST);
    } catch (e) {
        return 0;
    }
}

export function limitReqToBytes(limitReq) {
    try {
        return limitReq ? Math.floor(limitReq * REQ_BYTES_EST) : 0;
    } catch (e) {
        return 0;
    }
}

export function sleepMs(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

export function withTimeout(promise, ms, label) {
    let timer = null;
    const gate = new Promise((_, rej) => {
        timer = setTimeout(() => {
            try {
                rej(new Error(label || "timeout"));
            } catch (e) {}
        }, ms);
    });
    return Promise.race([promise, gate]).finally(() => {
        try {
            if (timer) clearTimeout(timer);
        } catch (e) {}
    });
}

export function closeTcpSocketQuietly(socket) {
    try {
        if (socket && typeof socket.close === "function") socket.close();
    } catch (e) {}
}

export function releaseWriterQuietly(writer) {
    try {
        if (writer && typeof writer.releaseLock === "function")
            writer.releaseLock();
    } catch (e) {}
}

export async function withDeadline(promise, timeoutMs, onTimeout, label = "operation") {
    let timer = null;
    let settled = false;
    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
            if (settled) return;
            try {
                if (typeof onTimeout === "function") onTimeout();
            } catch (e) {}
            reject(new Error(`${label}-timeout`));
        }, timeoutMs);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        settled = true;
        if (timer) {
            try {
                clearTimeout(timer);
            } catch (e) {}
        }
    }
}

export async function writeSocketWithTimeout(
    socket,
    writer,
    data,
    timeoutMs = TCP_WRITE_TIMEOUT_MS,
) {
    if (!writer || typeof writer.write !== "function")
        throw new Error("socket-writer-unavailable");
    return await withDeadline(
        writer.write(data),
        timeoutMs,
        () => closeTcpSocketQuietly(socket),
        "socket-write",
    );
}

export function cmpVersions(a, b) {
    const strip = (v) => String(v).replace(/^v/, "").trim();
    const pa = strip(a).split(".").map(Number);
    const pb = strip(b).split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        let na = pa[i] || 0,
            nb = pb[i] || 0;
        if (na > nb) return 1;
        if (nb > na) return -1;
    }
    return 0;
}

export async function deployWorkerToCloudflare(accountId, apiToken, workerName, code) {
    let currentBindings = [];
    try {
        const settingsRes = await fetchT(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${encodeURIComponent(workerName)}/settings`,
            { headers: { Authorization: `Bearer ${apiToken}` } },
            30000,
        );
        const settingsJson = await settingsRes.json();
        if (settingsJson.success && settingsJson.result?.bindings) {
            currentBindings = settingsJson.result.bindings;
        }
    } catch (e) {}

    const metadata = {
        main_module: "_worker.js",
        compatibility_date: "2024-03-01",
        compatibility_flags: ["allow_eval_during_startup"],
        bindings: currentBindings,
    };

    const form = new FormData();
    form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    form.append(
        "_worker.js",
        new Blob([code], { type: "application/javascript+module" }),
        "_worker.js",
    );

    return await fetchT(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${encodeURIComponent(workerName)}`,
        {
            method: "PUT",
            headers: { Authorization: `Bearer ${apiToken}` },
            body: form,
        },
        30000,
    );
}