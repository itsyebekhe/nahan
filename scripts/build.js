#!/usr/bin/env node
/**
 * Nahan Gateway Build & Bundler Script
 * Compiles modular src/index.js into production-ready _worker.js
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("⚡ Building Nahan Gateway from modular src/...");

try {
    // Check if bun is available for ultra-fast bundling
    let bunFound = false;
    try {
        execSync("bun --version", { stdio: "ignore" });
        bunFound = true;
    } catch (e) {
        bunFound = false;
    }

    if (bunFound) {
        console.log("📦 Using Bun native bundler...");
        execSync("bun build src/index.js --target=browser --external 'cloudflare:sockets' --outfile=_worker.js", {
            stdio: "inherit"
        });
    } else {
        console.log("📦 Using npx esbuild...");
        execSync("npx esbuild src/index.js --bundle --format=esm --target=es2022 --external:cloudflare:sockets --outfile=_worker.js", {
            stdio: "inherit"
        });
    }

    const stats = fs.statSync("_worker.js");
    console.log(`✅ Build completed successfully! Generated _worker.js (${(stats.size / 1024).toFixed(1)} KB)`);
} catch (err) {
    console.error("❌ Build error:", err.message);
    process.exit(1);
}
