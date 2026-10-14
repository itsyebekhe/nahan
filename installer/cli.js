#!/usr/bin/env node
/**
 * Nahan Gateway - Automated Interactive Wrangler CLI Installer
 * Guides users through Cloudflare authentication, D1 creation,
 * configuration, building modular worker, and edge deployment.
 */

import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (query, defaultVal = "") => {
    return new Promise((resolve) => {
        const prompt = defaultVal ? `${query} [${defaultVal}]: ` : `${query}: `;
        rl.question(prompt, (answer) => {
            resolve(answer.trim() || defaultVal);
        });
    });
};

const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};

const c = (color, text) => `${colors[color] || ""}${text}${colors.reset}`;

const banner = `
${c("cyan", "  ███╗   ██╗ █████╗ ██╗  ██╗ █████╗ ██╗   ██╗")}
${c("cyan", "  ████╗  ██║██╔══██╗██║  ██║██╔══██╗████╗  ██║")}
${c("cyan", "  ██╔██╗ ██║███████║███████║███████║██╔██╗ ██║")}
${c("cyan", "  ██║╚██╗██║██╔══██║██╔══██║██╔══██║██║╚██╗██║")}
${c("cyan", "  ██║ ╚████║██║  ██║██║  ██║██║  ██║██║ ╚████║")}
${c("cyan", "  ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝")}
${c("bold", "       PROJECT NAHAN — WRANGLER EDGE INSTALLER       ")}
`;

async function runCommand(cmd, options = {}) {
    try {
        const output = execSync(cmd, { encoding: "utf-8", stdio: options.silent ? "pipe" : "inherit", ...options });
        return { success: true, output };
    } catch (err) {
        return { success: false, error: err.message, output: err.stdout || "" };
    }
}

async function main() {
    console.clear();
    console.log(banner);
    console.log(c("dim", "─────────────────────────────────────────────────────────────"));
    console.log(c("green", "  Welcome to the automated Cloudflare Wrangler Installer!   "));
    console.log(c("dim", "─────────────────────────────────────────────────────────────\n"));

    // Step 1: Pre-flight checks
    console.log(c("bold", "🔍 Step 1: Pre-flight Environment Checks"));
    const nodeVer = process.version;
    console.log(`  ✓ Node.js runtime: ${c("cyan", nodeVer)}`);

    let wranglerFound = false;
    try {
        const res = execSync("npx wrangler --version", { encoding: "utf-8", stdio: "pipe" });
        console.log(`  ✓ Cloudflare Wrangler: ${c("cyan", res.trim())}`);
        wranglerFound = true;
    } catch (e) {
        console.log(c("yellow", "  ⚠ Wrangler will be run via npx."));
    }

    // Step 2: Cloudflare Authentication Check
    console.log(`\n${c("bold", "🔑 Step 2: Cloudflare Authentication")}`);
    let whoamiOutput = "";
    let isLoggedIn = false;
    try {
        const whoamiRes = execSync("npx wrangler whoami", { encoding: "utf-8", stdio: "pipe" });
        whoamiOutput = whoamiRes;
        if (whoamiRes.includes("You are logged in with an API Token") || whoamiRes.includes("associated with the email")) {
            isLoggedIn = true;
            console.log(`  ${c("green", "✓ Authenticated with Cloudflare!")}`);
            const lines = whoamiRes.split("\n").filter(l => l.includes("Account") || l.includes("Token") || l.includes("email"));
            lines.forEach(l => console.log(`    ${c("dim", l.trim())}`));
        }
    } catch (e) {
        isLoggedIn = false;
    }

    if (!isLoggedIn) {
        console.log(c("yellow", "  ⚠ You are not currently logged in to Wrangler."));
        console.log("  How would you like to authenticate?");
        console.log("    1) Open browser login (npx wrangler login)");
        console.log("    2) Enter Cloudflare API Token");
        console.log("    3) Skip (assume environment variables are set)");
        
        const authChoice = await ask("  Select option (1/2/3)", "1");
        if (authChoice === "1") {
            console.log(c("cyan", "\n  Starting browser login..."));
            execSync("npx wrangler login", { stdio: "inherit" });
        } else if (authChoice === "2") {
            const token = await ask("  Enter Cloudflare API Token");
            if (token) {
                process.env.CLOUDFLARE_API_TOKEN = token;
                const accountId = await ask("  Enter Cloudflare Account ID (optional)");
                if (accountId) process.env.CLOUDFLARE_ACCOUNT_ID = accountId;
            }
        }
    }

    // Step 3: Gateway Configuration
    console.log(`\n${c("bold", "⚙️ Step 3: Gateway Configuration")}`);
    const defaultWorkerName = "nahan";
    const workerName = await ask("  Enter Worker Name", defaultWorkerName);

    const randomSecret = "nahan_" + Math.random().toString(36).substring(2, 10);
    const apiRoute = await ask("  Enter Admin / Camouflage Path", randomSecret);

    const defaultMasterKey = "admin_" + Math.random().toString(36).substring(2, 8);
    const masterKey = await ask("  Enter Admin Master Password", defaultMasterKey);

    const decoy = await ask("  Enter Camouflage Domain (e.g. ubuntu.com, docker.com)", "ubuntu.com");

    // Step 4: D1 Database Provisioning
    console.log(`\n${c("bold", "💾 Step 4: Cloudflare D1 Database Provisioning")}`);
    console.log("  Nahan uses Cloudflare D1 (SQLite) for ultra-fast configuration persistence.");
    
    let d1DatabaseId = "";
    const dbChoice = await ask("  Do you want to create a new D1 database automatically? (y/n)", "y");

    if (dbChoice.toLowerCase().startsWith("y")) {
        const dbName = `${workerName}-db`;
        console.log(c("cyan", `  Creating D1 database "${dbName}"...`));
        try {
            const createRes = execSync(`npx wrangler d1 create ${dbName}`, { encoding: "utf-8", stdio: "pipe" });
            console.log(`  ${c("green", "✓ D1 database created successfully!")}`);
            
            // Extract database_id
            const match = createRes.match(/database_id\s*=\s*["']([^"']+)["']/i) ||
                          createRes.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
            if (match) {
                d1DatabaseId = match[1];
                console.log(`  ${c("cyan", "✓ Found Database ID:")} ${d1DatabaseId}`);
            }
        } catch (e) {
            console.log(c("yellow", `  ⚠ Notice: ${e.message.split("\n")[0]}`));
            console.log("  You can provide an existing D1 database ID below.");
        }
    }

    if (!d1DatabaseId) {
        d1DatabaseId = await ask("  Enter D1 Database ID (or press Enter to configure later)", "YOUR_D1_DATABASE_ID_HERE");
    }

    // Step 5: Update wrangler.toml
    console.log(`\n${c("bold", "📝 Step 5: Configuring wrangler.toml")}`);
    const wranglerContent = `# Wrangler Configuration for Nahan Gateway Node
# Generated automatically by Nahan Interactive Installer

name = "${workerName}"
main = "src/index.js"
compatibility_date = "2024-03-01"

[dev]
port = 8787

[[d1_databases]]
binding = "IOT_DB"
database_name = "${workerName}-db"
database_id = "${d1DatabaseId}"

[vars]
API_ROUTE = "${apiRoute}"
DECOY_DOMAIN = "${decoy}"
`;

    fs.writeFileSync("wrangler.toml", wranglerContent, "utf-8");
    console.log(`  ${c("green", "✓ Saved configuration to wrangler.toml")}`);

    // Step 6: Build & Bundle Modular Worker
    console.log(`\n${c("bold", "⚡ Step 6: Compiling Modular Worker")}`);
    try {
        execSync("node scripts/build.js", { stdio: "inherit" });
    } catch (e) {
        console.error(c("red", `  ❌ Compilation failed: ${e.message}`));
        rl.close();
        return;
    }

    // Step 7: Deploy to Cloudflare Edge
    console.log(`\n${c("bold", "🚀 Step 7: Edge Deployment via Wrangler")}`);
    const deployNow = await ask("  Deploy worker to Cloudflare now? (y/n)", "y");

    let deployedUrl = "";
    if (deployNow.toLowerCase().startsWith("y")) {
        console.log(c("cyan", "  Deploying to Cloudflare Workers edge network..."));
        try {
            const deployOutput = execSync("npx wrangler deploy", { encoding: "utf-8", stdio: "pipe" });
            console.log(deployOutput);
            console.log(`  ${c("green", "🎉 Deployment successfully finished!")}`);

            const urlMatch = deployOutput.match(/https:\/\/[a-zA-Z0-9.-]+\.workers\.dev/);
            if (urlMatch) {
                deployedUrl = urlMatch[0];
            }
        } catch (err) {
            console.log(c("red", `  ❌ Deployment encountered an error:`));
            console.log(err.stdout || err.message);
            console.log(`\n  ${c("yellow", "You can retry deployment at any time with:")} npx wrangler deploy`);
        }
    }

    // Step 8: Deployment Summary & Next Steps
    console.log(c("dim", "\n─────────────────────────────────────────────────────────────"));
    console.log(c("green", c("bold", "               DEPLOYMENT SUMMARY & CREDENTIALS              ")));
    console.log(c("dim", "─────────────────────────────────────────────────────────────"));

    if (deployedUrl) {
        console.log(`  🌐 Gateway Live URL   : ${c("bold", c("cyan", deployedUrl))}`);
        console.log(`  🖥️ Admin Dashboard     : ${c("bold", c("green", `${deployedUrl}/${apiRoute}/dash`))}`);
    } else {
        console.log(`  🖥️ Admin Dashboard Path: ${c("bold", c("green", `https://<YOUR_WORKER>.workers.dev/${apiRoute}/dash`))}`);
    }
    console.log(`  🔑 Master Password    : ${c("bold", c("yellow", masterKey))}`);
    console.log(`  🛡️ Camouflage Decoy   : ${c("dim", decoy)}`);
    console.log(`  💾 D1 Database ID     : ${c("dim", d1DatabaseId)}`);
    console.log(c("dim", "─────────────────────────────────────────────────────────────"));

    // Save summary file
    const summary = {
        workerName,
        apiRoute,
        masterKey,
        decoy,
        d1DatabaseId,
        deployedUrl: deployedUrl || `https://${workerName}.workers.dev`,
        dashboardUrl: deployedUrl ? `${deployedUrl}/${apiRoute}/dash` : `/${apiRoute}/dash`,
        installedAt: new Date().toISOString()
    };
    fs.writeFileSync(".nahan-deployment.json", JSON.stringify(summary, null, 2), "utf-8");
    console.log(`  ✓ Deployment details saved to ${c("cyan", ".nahan-deployment.json")}\n`);

    rl.close();
}

main().catch((err) => {
    console.error(c("red", `Fatal error: ${err.message}`));
    rl.close();
    process.exit(1);
});
