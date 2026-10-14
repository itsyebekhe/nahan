#!/usr/bin/env node
/**
 * Nahan Gateway - Local Hub & Web Installer Server
 * Runs on port 3000 to provide Web Installer, Previews, Documentation, and Cloudflare API Proxy
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// MIME type dictionary
const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".yml": "text/yaml; charset=utf-8",
    ".yaml": "text/yaml; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=utf-8"
};

// Cloudflare API proxy handler to bypass browser CORS
async function handleCloudflareProxy(req, res) {
    // Expected path: /api/cf-proxy/<endpoint>
    const cfPath = req.url.replace(/^\/api\/cf-proxy/, "");
    const targetUrl = `https://api.cloudflare.com/client/v4${cfPath}`;

    const authHeader = req.headers["authorization"] || "";
    if (!authHeader) {
        res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ success: false, error: "Missing Authorization header" }));
        return;
    }

    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
        const bodyBuffer = Buffer.concat(chunks);
        try {
            const fetchHeaders = {
                "Authorization": authHeader,
                "User-Agent": "Nahan-Web-Installer/3.0.4"
            };

            const contentType = req.headers["content-type"];
            if (contentType) fetchHeaders["Content-Type"] = contentType;

            const cfRes = await fetch(targetUrl, {
                method: req.method,
                headers: fetchHeaders,
                body: ["GET", "HEAD"].includes(req.method) ? undefined : bodyBuffer
            });

            const resData = await cfRes.arrayBuffer();
            const resHeaders = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Auth-Email, X-Auth-Key",
                "Content-Type": cfRes.headers.get("content-type") || "application/json"
            };

            res.writeHead(cfRes.status, resHeaders);
            res.end(Buffer.from(resData));
        } catch (err) {
            res.writeHead(502, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
            res.end(JSON.stringify({ success: false, error: `Proxy upstream failed: ${err.message}` }));
        }
    });
}

const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Auth-Email, X-Auth-Key",
            "Access-Control-Max-Age": "86400"
        });
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    // Cloudflare API proxy
    if (pathname.startsWith("/api/cf-proxy")) {
        return handleCloudflareProxy(req, res);
    }

    // Local Dev API Mock Handlers for Dashboard
    if (pathname === "/api/auth") {
        const chunks = [];
        req.on("data", c => chunks.push(c));
        req.on("end", () => {
            res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
            res.end(JSON.stringify({
                success: true,
                deviceId: "00000000-0000-4000-8000-000000000001",
                network: { ip: "127.0.0.1", colo: "DEV", loc: "Local Machine" },
                config: {
                    mode: "alpha",
                    socketPorts: "443,8443",
                    apiRoute: "sync",
                    masterKey: "admin",
                    name: "Nahan Gateway",
                    deviceId: "00000000-0000-4000-8000-000000000001",
                    cleanIps: "1.1.1.1, 1.0.0.1",
                    customDns: "https://cloudflare-dns.com/dns-query",
                    users: [
                        {
                            id: "11111111-1111-4111-8111-111111111111",
                            name: "Default",
                            limitTotalReq: 10000,
                            limitDailyReq: 500,
                            expiryMs: Date.now() + 30 * 86400000,
                            isPaused: false
                        }
                    ]
                }
            }));
        });
        return;
    }

    if (pathname === "/api/sync") {
        const chunks = [];
        req.on("data", c => chunks.push(c));
        req.on("end", () => {
            res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
            res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    if (pathname === "/api/stats") {
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({
            success: true,
            totalUsers: 1,
            activeUsers: 1,
            pausedUsers: 0,
            autoDisabledUsers: 0,
            expiredUsers: 0,
            trafficTotal: "1.24 GB",
            trafficDaily: "142 MB"
        }));
        return;
    }

    if (pathname === "/api/logs") {
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({
            success: true,
            logs: [
                { ts: new Date().toISOString(), type: "System", detail: "Nahan Gateway service active" }
            ]
        }));
        return;
    }

    if (pathname === "/api/keys") {
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ success: true, keys: [] }));
        return;
    }

    // Serve compiled worker file for download or direct embed
    if (pathname === "/download/_worker.js" || pathname === "/_worker.js") {
        const workerPath = path.join(__dirname, "_worker.js");
        if (fs.existsSync(workerPath)) {
            res.writeHead(200, {
                "Content-Type": "application/javascript; charset=utf-8",
                "Content-Disposition": 'attachment; filename="_worker.js"',
                "Access-Control-Allow-Origin": "*"
            });
            fs.createReadStream(workerPath).pipe(res);
            return;
        }
    }

    // Direct route mapping
    let filePath = "";
    if (pathname === "/" || pathname === "/installer") {
        filePath = path.join(__dirname, "installer", "web", "index.html");
    } else if (pathname === "/dashboard") {
        filePath = path.join(__dirname, "dashboard.html");
    } else if (pathname === "/subscription") {
        filePath = path.join(__dirname, "subscription.html");
    } else if (pathname === "/docs") {
        filePath = path.join(__dirname, "index.html");
    } else if (pathname === "/cf-optimiser" || pathname === "/optimiser" || pathname === "/optimizer") {
        filePath = path.join(__dirname, "cf-optimiser.html");
    } else {
        // Resolve static file from repository
        const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
        filePath = path.join(__dirname, safePath);
    }

    // Check if file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, {
            "Content-Type": mime,
            "Access-Control-Allow-Origin": "*"
        });
        fs.createReadStream(filePath).pipe(res);
    } else {
        // Fallback to installer
        const fallbackPath = path.join(__dirname, "installer", "web", "index.html");
        if (fs.existsSync(fallbackPath)) {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            fs.createReadStream(fallbackPath).pipe(res);
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found");
        }
    }
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Nahan Local Hub & Web Installer running on http://0.0.0.0:${PORT}`);
    console.log(`   - Web Installer: http://localhost:${PORT}/`);
    console.log(`   - Dashboard Preview: http://localhost:${PORT}/dashboard`);
    console.log(`   - Config Optimiser: http://localhost:${PORT}/cf-optimiser`);
    console.log(`   - Subscription Preview: http://localhost:${PORT}/subscription`);
    console.log(`   - Technical Documentation: http://localhost:${PORT}/docs`);
});
