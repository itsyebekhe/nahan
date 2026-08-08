export function parseVlessUri(uri) {
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

export function upstreamToSingboxOb(parsed) {
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

export function upstreamToClashProxy(parsed) {
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

export function upstreamToV2RayOb(parsed) {
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
