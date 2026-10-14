# Project Nahan (پروژه نهان)

### The Ultimate Serverless Gateway on Cloudflare Workers

**Nahan** (Persian for *Hidden/Concealed*) is a secure, lightweight, and highly customizable reverse proxy that runs entirely on the edge. It transforms your Cloudflare Worker into a powerful, obfuscated gateway using **VLESS** or **Trojan** protocols, managed via a beautiful, self-contained Web UI.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-100%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/itsyebekhe/nahan/blob/main/_worker.js)

> 🇮🇷 [نسخه فارسی / Persian Version](./README_FA.md)

---

## 📖 Table of Contents

- [Why Nahan?](#-why-nahan)
- [Key Features](#-key-features)
- [Prerequisites](#-prerequisites)
- [Quick Install Options](#-quick-install-options)
- [Step-by-Step Deployment Guide](#-step-by-step-deployment-guide)
- [Dashboard Guide](#-dashboard-guide)
- [Advanced Configuration](#-advanced-configuration)
- [Useful Resources](#-useful-resources)
- [Applying Configuration Changes](#-applying-configuration-changes)
- [FAQ & Troubleshooting](#-faq--troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Why Nahan?

Nahan isn't just a proxy script — it's a complete management solution designed for **stealth**, **speed**, and **ease of use**.

- 🛡️ **Hidden in Plain Sight:** Unauthorized access attempts are proxied to legitimate sites (e.g., `ubuntu.com` or `docker.com`), making your gateway look like a regular website to network scanners.
- ⚡ **Zero Server Cost:** Runs entirely on Cloudflare's free plan. No VPS, no server maintenance.
- 🎨 **Modern Dashboard:** A fully embedded, mobile-friendly dashboard with Dark/Light modes and dual-language support (English / فارسی).
- 🤖 **Telegram Bot Integration:** Manage your gateway, check usage, and receive login alerts directly via Telegram.
- 📡 **Multi-User & Multi-IP:** Generate dedicated subscription links for different users and automatically combine them with clean IP lists.
- 💾 **D1 SQLite Storage:** Configuration persists in Cloudflare D1 database, eliminating KV write limitations.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Dual Protocol** | Switch instantly between **VLESS** (Alpha), **Trojan** (Beta), or **Both** simultaneously |
| 📱 **QR Code Generation** | Modal-based QR codes for instant mobile client configuration |
| 👥 **Multi-User Profiles** | Create separate profiles with unique subscription links, per-user nodes, and per-user NAT64 |
| 🌍 **Clean IP Multiplexer** | Input a list of clean Cloudflare IPs — Nahan auto-generates configs for all of them |
| 🌐 **NAT64 Support** | Automatic IPv4-to-NAT64-mapped IPv6 conversion with multiple prefix support |
| ⚙️ **Real-Time Metrics** | View Origin IP, Edge Node location, and run browser-side latency diagnostics |
| 💾 **D1 SQLite Storage** | All configuration persists in Cloudflare D1 even after code updates |
| 🚨 **Kill Switch** | Immediately pause all proxy traffic with one click from the dashboard or Telegram |
| 📊 **Bandwidth Management** | Track per-user upload/download with TB/GB limits and pause/resume controls |
| 📋 **Activity Logs** | Full history of login attempts and configuration changes |
| 🔒 **ECH Support** | Toggle Encrypted Client Hello (ECH) parameters in generated client configs |
| 📦 **Backup & Restore** | Export/import your full configuration as a `.json` file |
| 🔄 **Auto Update** | Automatic deployment of new versions from GitHub with format and obfuscation options |
| 🎭 **Configurable Fake Configs** | Customizable fake subscription entries with `{usage}` and `{expiry}` template variables |
| 🖥️ **Per-User Nodes** | Define custom hostnames per subscriber for multi-region deployments |
| 🏷️ **Rich Name Strategy** | Config naming with `{FLAG}`, `{COUNTRY}`, `{CITY}`, `{ISP}`, `{HOST}`, `{DATE}`, `{WORKER}` tags |
| 🌐 **Bilingual Subscription Page** | Subscription info page with full **Persian/Farsi** and **English** support, RTL layout, and dark/light mode toggle |
| 🤖 **Telegram Bot Management** | Full gateway management via inline Telegram buttons — users, settings, logs, and advanced config |
| 🔗 **Linked Panels (Other Nodes)** | Connect multiple Nahan panels securely with API Keys for cross-panel management and update propagation |

---

## 🔧 Prerequisites

- A **Cloudflare account** (free tier is sufficient) — [sign up here](https://dash.cloudflare.com/sign-up)
- Access to **Workers & Pages** and **D1 SQLite Database** in your Cloudflare Dashboard
- A modern web browser
- *(Optional)* A Telegram Bot Token and Chat ID for bot integration

---

## 🚀 Quick Install Options

Choose your preferred deployment method:

1. **🌐 Interactive Web Installer (Browser UI):**
   - Start the local web installer:
     ```bash
     npm run installer:web
     ```
     Open `http://localhost:3000` in your browser to deploy directly using Cloudflare API with a 1-click step-by-step wizard.

2. **💻 Automated Wrangler CLI Wizard (Terminal):**
   - Run the interactive CLI installer:
     ```bash
     npm run install:wrangler
     # or: ./setup.sh
     ```
     The wizard automatically checks prerequisites, authenticates with Cloudflare, provisions the D1 SQLite database, configures `wrangler.toml`, compiles the modular worker, and deploys it live to the edge.

3. **🤖 Telegram Install Bot:** [@itsyebekhebot](https://t.me/itsyebekhebot)

4. **📁 Manual Dashboard Paste:** Copy `_worker.js` (compiled with `npm run build`) into Cloudflare's online code editor.

---

## 📂 Modular Architecture (`src/`)

The codebase is organized into high-performance ES modules in `src/`:

```
├── src/
│   ├── index.js              # Worker entry point (fetch & scheduled cron)
│   ├── core/                 # Core engine (constants, state, utils, d1, auth, config)
│   ├── protocols/            # Binary sockets, WebSocket telemetry, Trojan & VLESS
│   ├── relays/               # Self-healing relays, dead relay probes & AI domain quarantine
│   ├── api/                  # APIs (auth, users, logs, stats, sync, keys, update, telegram)
│   ├── converters/           # Subscriptions (Clash YAML, Sing-box JSON, Xray V2Ray, Geolocation, Fragment)
│   └── templates/            # Embedded and upstream configuration templates
├── installer/
│   ├── cli.js                # Interactive terminal Wrangler installer
│   └── web/index.html        # Bilingual (EN/FA) responsive Web Installer
├── scripts/
│   ├── build.js              # Native bundler compiling src/ into _worker.js in ~20ms
│   └── worker_converter.py   # Encoder / Obfuscator & Decoder utility
├── server.js                 # Local Hub & Web Installer server (port 3000)
├── wrangler.toml             # Modern Wrangler deployment configuration
└── _worker.js                # Standalone bundled worker distribution
```

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Create a D1 Database

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Storage and databases** → **D1 SQLite Database**.
3. Click **Create database**.
4. Enter a name (e.g. `iot_db`) and click **Create**.

### Step 2: Deploy the Worker

1. Go to **Workers & Pages** → **Create application** → **Create Worker**.
2. Name it (e.g. `nahan-core`) and click **Deploy**.
3. Click **Edit code**, delete the placeholder, and paste the full content of [`_worker.js`](https://github.com/itsyebekhe/nahan/blob/main/_worker.js).
4. Click **Save and Deploy**.

### Step 3: Bind the D1 Database

1. Open your Worker → **Settings** → **Bindings** → **Add binding**.
2. Type: **D1 database**
3. Variable name: **`IOT_DB`** (must be exact)
4. Select the database you created → **Save** → **Deploy**.

### Step 4: Access the Dashboard

Open:

```
https://<your-worker-domain>/sync/dash
```

> Visiting `/` or `/sync` without `/dash` shows a camouflage page (Ubuntu/Docker). This is intentional.

### Step 5: First-Time Configuration

1. Login with the default master key: `admin`
2. Immediately go to **System** tab and:
   - Change **Master Key**
   - Change **API Route** to a secret path (bookmark the new URL!)
   - Set or auto-generate **Device UUID**
3. Click **Update Config**.

---

## 🖥️ Dashboard Guide

The dashboard includes these main sections:

| Tab | Purpose |
|---|---|
| **Overview** | User summary cards, traffic stats, and update banner |
| **Endpoints** | Connection URIs, QR codes, and subscription links |
| **Metrics** | Live usage, Origin IP, Edge Node (Colo), latency diagnostics |
| **System** | Core settings (protocol, UUID, API Route, Master Key, ports, Auto-Update, Panel API Keys, Backup) |
| **Advanced** | Clean IPs, Linked Panels, Multi-User, Telegram, Kill Switch, ECH, NAT64, etc. |
| **Logs** | Login attempts and configuration change history |
| **Clients** | Visual multi-user management |
| **Help** | Built-in help and FAQ |

---

## 🔩 Advanced Configuration

### Clean IP Multiplexer

In **Advanced** → **Clean IPs**, enter one IP (or `IP#Name`) per line. The subscription will contain a separate config for each IP.

**Recommended tools for finding Clean IPs:**
- GitHub: [senpaiscanner](https://github.com/senpaiscanner)
- Telegram: [@itsZetaBot](https://t.me/itsZetaBot)

### Relay IP

Recommended bot: [@nahanproxyipbot](https://t.me/nahanproxyipbot)

### Linked Panels (Other Nodes)

Connect external Nahan panels using **URL + API Key** for cross-panel management and update propagation.  
(Legacy `slaveNodes` / Cascade fields are automatically migrated to `linkedPanels`.)

### Multi-User Profiles

Format (one per line):

```
<uuid>:Username
```

Access: `https://<worker>/sync/sub?sub=Username`

### Telegram Bot

1. Create a bot via [@BotFather](https://t.me/botfather)
2. Get Chat ID from [@userinfobot](https://t.me/userinfobot)
3. Enter Token + Chat ID in Advanced tab and save

Commands: `/status`, `/pause` (Kill Switch)

### Kill Switch

Toggle in Advanced (or send `/pause` via Telegram) to immediately stop all proxy traffic while keeping the worker alive.

---

## 🔗 Useful Resources

| Purpose | Resource |
|---|---|
| Clean IP finder | [senpaiscanner](https://github.com/senpaiscanner) · [@itsZetaBot](https://t.me/itsZetaBot) |
| Relay IP | [@nahanproxyipbot](https://t.me/nahanproxyipbot) |
| Easy Install (Telegram) | [@itsyebekhebot](https://t.me/itsyebekhebot) |
| Web Installer | [erpycode.github.io/nahan-installer](https://erpycode.github.io/nahan-installer/) |

---

## 💾 Applying Configuration Changes

After changing anything in **System** or **Advanced**:

1. Click **Update Config** at the bottom.
2. Wait for “Syncing…” then the page reloads.

If you changed the API Route, the page redirects to the new path — bookmark it.

---

## ❓ FAQ & Troubleshooting

**`⚠️ IOT_DB namespace missing!`**  
→ D1 binding is missing or the variable name is not exactly `IOT_DB`. Fix in Worker Settings → Bindings and redeploy.

**Root URL shows Ubuntu/Docker**  
→ Expected behavior. Always use `/sync/dash` (or your custom API Route + `/dash`).

**Forgot Master Key or API Route**  
→ Check values in the D1 Console (`sys_config` key).

**Free plan limits**  
→ 100,000 requests/day. Monitor via Cloudflare Analytics integration in Advanced.

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch
3. Make your changes
4. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)

---

<div align="center">

Made with ❤️ by the Open Source Community

[⭐ Star this repo](https://github.com/itsyebekhe/nahan) · [🐛 Report a bug](https://github.com/itsyebekhe/nahan/issues) · [🇮🇷 نسخه فارسی](./README_FA.md)

</div>
