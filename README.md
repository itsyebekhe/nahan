# Project Nahan (پروژه نهان)

### The Ultimate Serverless Gateway on Cloudflare Workers

**Nahan** (Persian for *Hidden/Concealed*) is a secure, lightweight, and highly customizable reverse proxy that runs entirely on the edge. It transforms your Cloudflare Worker into a powerful, obfuscated gateway using **VLESS** or **Trojan** protocols, managed via a beautiful, self-contained Web UI.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-100%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/uuxnubv/nahan/blob/main/_worker.js)

> 🇮🇷 [نسخه فارسی / Persian Version](./README_FA.md)

---

## 📖 Table of Contents

- [Why Nahan?](#-why-nahan)
- [Key Features](#-key-features)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Deployment Guide](#-step-by-step-deployment-guide)
  - [Step 1: Create a D1 Database](#step-1-create-a-d1-database)
  - [Step 2: Deploy the Worker](#step-2-deploy-the-worker)
  - [Step 3: Bind the D1 Database](#step-3-bind-the-d1-database)
  - [Step 4: Access the Dashboard](#step-4-access-the-dashboard)
  - [Step 5: First-Time Configuration](#step-5-first-time-configuration)
- [Dashboard Guide](#-dashboard-guide)
  - [Endpoints (Info)](#-endpoints-info)
  - [Metrics (Network)](#-metrics-network)
  - [System (Settings)](#️-system-settings)
  - [Advanced (Network)](#-advanced-network)
  - [Activity Logs](#-activity-logs)
- [Advanced Configuration](#-advanced-configuration)
  - [Multi-User Profiles](#multi-user-profiles)
  - [Clean IP Multiplexer](#clean-ip-multiplexer)
  - [Telegram Bot Integration](#telegram-bot-integration)
  - [Kill Switch](#kill-switch)
- [Applying Configuration Changes](#-applying-configuration-changes)
- [File Structure](#-file-structure)
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

---

## 🔧 Prerequisites

- A **Cloudflare account** (free tier is sufficient) — [sign up here](https://dash.cloudflare.com/sign-up)
- Access to **Workers & Pages** and **D1 SQLite Database** in your Cloudflare Dashboard
- A modern web browser
- *(Optional)* A Telegram Bot Token and Chat ID for bot integration

---

## 🚀 Step-by-Step Deployment Guide

Follow these steps to get your Nahan gateway running in under 5 minutes.

### Step 1: Create a D1 Database

Nahan stores all configuration in a Cloudflare D1 SQLite database. You must create this first.

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left sidebar, go to **Storage and databases** → **D1 SQLite Database**.
3. Click **Create database**.
4. Enter a name for your database — the suggested name is `iot_db` (the exact name doesn't matter).
5. Click **Create** to confirm.

> ✅ Your D1 database is now ready. Keep this page open — you'll need it in Step 3.

---

### Step 2: Deploy the Worker

1. In the Cloudflare Dashboard, navigate to **Workers & Pages** → **Overview**.
2. Click **Create application** → **Create Worker**.
3. Enter a name for your worker (e.g., `nahan-core`).
4. Click **Deploy** to create the worker with placeholder code.
5. On the confirmation screen, click **Edit code** to open the online editor.
6. Select all existing placeholder code and **delete it**.
7. Open the Nahan repository and go to [`_worker.js`](https://github.com/uuxnubv/nahan/blob/main/_worker.js).
8. Click **Raw**, then select all and copy the full contents.
9. Paste the copied code into the Cloudflare editor.
10. Click **Save and Deploy**.

> ✅ Your worker is deployed. It will not function fully until the D1 database is bound in the next step.

---

### Step 3: Bind the D1 Database

This step connects your D1 database to the worker so Nahan can read and write its configuration.

1. From the Workers & Pages overview, click on your worker (e.g., `nahan-core`).
2. Go to the **Settings** tab.
3. Scroll to the **Bindings** section and click **Add binding**.
4. Select **D1 database** as the binding type.
5. Fill in the two fields:
   - **Variable name:** `IOT_DB` ← this must be exact, regardless of your database's actual name
   - **D1 Database:** Select the database you created in Step 1
6. Click **Save**.
7. Return to the worker overview and click **Deploy** (or **Redeploy**) to apply the binding.

> ✅ Nahan can now read and write persistent configuration data.

---

### Step 4: Access the Dashboard

1. From your worker's overview page, copy the worker URL — it looks like:
   ```
   https://nahan-core.<your-subdomain>.workers.dev
   ```
2. In a browser, navigate to:
   ```
   https://<your-worker-domain>/sync/dash
   ```

   > **Note:** Visiting the root URL (`/`) or `/sync` without `/dash` intentionally shows a camouflage page (e.g., Ubuntu or Docker) to fool network scanners. This is expected behavior.

3. You should see the Nahan login screen.

---

### Step 5: First-Time Configuration

1. Enter the default master key and click **Authenticate**:
   ```
   admin
   ```

   > ⚠️ **If you see `⚠️ IOT_DB namespace missing!`** — your D1 database binding is not set up correctly. Return to Step 3.

2. You are now inside the Nahan dashboard.

3. **Immediately** go to the **System** tab and:
   - Change the **Master Key** from `admin` to a strong, private passphrase.
   - Change the **API Route** from `sync` to a secret keyword (e.g., `my-secret-path`). Your dashboard will move to `/<new-route>/dash`.
   - Set your **Device UUID** or leave it blank to auto-generate one.

4. Click **Update Config** to save.

> ✅ Your gateway is now live and secured.

---

## 🖥️ Dashboard Guide

The dashboard has **5 sections** accessible via the top navigation tabs.

---

### 📡 Endpoints (Info)

Retrieve your connection strings to import into a proxy client (e.g., v2rayN, Hiddify, Shadowrocket, Nekoray).

- **Profile Cards:** Each configured profile (Default + Multi-User) appears as a card.
- **Show QR Code:** Tap **Show QR Code** on any card to display a scannable QR — great for mobile setup.
- **Cloud Sync URL:** The subscription URL for your client app. Use the copy button to grab it.

---

### 📊 Metrics (Network)

Live diagnostics about the Cloudflare edge node processing your requests.

- **Live Profile Usage:** Active connection counts and last activity timestamps per profile (resets on worker restart).
- **Network Cards:** Origin IP, executing Edge Node (Colo), and regional metadata.
- **Latency Diagnostics:** Click **Run Diagnostics** to measure real-time latency to your configured Clean IPs.

---

### ⚙️ System (Settings)

Core gateway configuration:

| Setting | Description |
|---|---|
| **Primary Display Mode** | Toggle between `Alpha` (VLESS), `Beta` (Trojan), or both |
| **Device UUID** | Connection identifier/password. Leave blank to auto-generate |
| **API Route** | Change from `sync` to a secret keyword — moves the dashboard to `/<keyword>/dash` |
| **Master Key** | Login password. Change from `admin` immediately |
| **Backup & Restore** | Export all settings to `.json` or restore from a previous backup |

---

### 🌐 Advanced (Network)

Fine-tune transport and integrations:

| Setting | Description |
|---|---|
| **Clean IPs** | Comma/line-separated Cloudflare clean IPs — subscription auto-multiplies configs for each |
| **Multi-User Profiles** | `uuid:Name` format entries for per-user subscription links |
| **Telegram Bot** | Bot Token + Chat ID for login alerts and remote management |
| **Cloudflare Analytics** | Account ID + API Token to monitor daily request usage (100k/day free limit) |
| **Kill Switch** | Instantly pause all proxy traffic without deleting the worker |
| **Secure Hello (ECH)** | Toggle Encrypted Client Hello in generated configs |

---

### 📋 Activity Logs

Timestamped history of all login attempts and configuration changes for auditing.

---

## 🔩 Advanced Configuration

### Multi-User Profiles

1. Go to the **Advanced** tab.
2. In the **Multi-User Profiles** field, add entries (one per line) in this format:
   ```
   <uuid>:Username
   ```
   Example:
   ```
   550e8400-e29b-41d4-a716-446655440000:Alice
   6ba7b810-9dad-11d1-80b4-00c04fd430c8:Bob
   ```
3. Each user accesses their config by appending `?sub=Username` to the Sync URL:
   ```
   https://<your-worker-domain>/sync/sub?sub=Alice
   ```

---

### Clean IP Multiplexer

1. Go to the **Advanced** tab.
2. In **Clean IPs**, enter one IP or hostname per line (or comma-separated):
   ```
   1.2.3.4
   5.6.7.8
   cleanip.example.com
   ```
3. Click **Update Config**. The subscription output will include a separate config entry for each IP.

---

### Telegram Bot Integration

1. Create a bot via [@BotFather](https://t.me/botfather) and copy the **Bot Token**.
2. Get your **Chat ID** from [@userinfobot](https://t.me/userinfobot).
3. In the **Advanced** tab, enter your Bot Token and Chat ID.
4. Click **Update Config**.

Available Telegram commands:
- `/status` — Check gateway status
- `/pause` — Activate the Kill Switch

---

### Kill Switch

To immediately suspend all proxy traffic:

1. Go to the **Advanced** tab.
2. Toggle **Kill Switch** to **ON**.
3. Click **Update Config**.

Or send `/pause` to your Telegram bot. To re-enable, toggle it **OFF** and save.

---

## 💾 Applying Configuration Changes

After adjusting anything in **System** or **Advanced**:

1. Click **Update Config** at the bottom of the screen.
2. The indicator shows **"Syncing..."** then the page auto-reloads.
3. If you changed the **API Route**, the page will redirect to `/<new-route>/dash` — **bookmark the new URL**.

---

## 📁 File Structure

```
nahan/
├── _worker.js       # Main Cloudflare Worker script (the entire gateway)
├── HELP.md          # English dashboard walkthrough
├── HELP_FA.md       # Persian (فارسی) dashboard walkthrough
├── README.md        # This file (English)
├── README_FA.md     # Persian (فارسی) version of README
└── version          # Current version indicator
```

---

## ❓ FAQ & Troubleshooting

**Q: I see `⚠️ IOT_DB namespace missing!` after logging in.**
> The D1 database is not bound to your worker. Go back to Step 3, add the `IOT_DB` D1 binding, and redeploy.

**Q: My worker's root URL shows a random website instead of the dashboard.**
> This is intentional — Nahan camouflages itself. Always use `https://<your-worker-domain>/sync/dash`.

**Q: I changed the API Route and can't find the dashboard anymore.**
> Your dashboard moved to `https://<your-worker-domain>/<new-route>/dash`. If you've forgotten the route, check the D1 database via the Cloudflare Dashboard → **D1** → your database → browse the `kv_store` table.

**Q: I forgot my Master Key.**
> In the Cloudflare Dashboard, go to **D1** → your database → **Console**, and run:
> ```sql
> SELECT * FROM kv_store WHERE key = 'masterKey';
> ```
> You can also `UPDATE` or `DELETE` the row to reset it.

**Q: How do I update to a newer version of Nahan?**
> Repeat Step 2: open the Worker code editor, replace the code with the latest `_worker.js`, and save. Your D1 configuration is preserved.

**Q: How many requests can I handle on the free tier?**
> Cloudflare Workers free tier allows **100,000 requests/day**. Monitor usage via the Cloudflare Analytics integration in the Advanced tab.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/my-feature`
3. Make your changes to `_worker.js`.
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Made with ❤️ by the Open Source Community

[⭐ Star this repo](https://github.com/uuxnubv/nahan) · [🐛 Report a bug](https://github.com/uuxnubv/nahan/issues) · [🇮🇷 نسخه فارسی](./README_FA.md)

</div>