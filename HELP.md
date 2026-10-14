# Project Nahan (نهان) — User Walkthrough

> 🇮🇷 [راهنمای فارسی / Persian Version](./HELP_FA.md) | 📖 [Back to README](./README.md)

This guide walks you through every screen and setting in the Nahan dashboard after your gateway is deployed. If you haven't deployed yet, start with the [README](./README.md).

---

## Table of Contents

1. [Accessing the Dashboard](#1-accessing-the-dashboard)
2. [Authentication](#2-authentication)
3. [Tab 1 — Endpoints (Info)](#3-tab-1--endpoints-info)
4. [Tab 2 — Metrics (Network)](#4-tab-2--metrics-network)
5. [Tab 3 — System (Settings)](#5-tab-3--system-settings)
6. [Tab 4 — Advanced (Network)](#6-tab-4--advanced-network)
7. [Tab 5 — Activity Logs](#7-tab-5--activity-logs)
8. [Applying & Saving Changes](#8-applying--saving-changes)
9. [Backup & Restore](#9-backup--restore)
10. [Telegram Bot Commands](#10-telegram-bot-commands)
11. [Tips & Best Practices](#11-tips--best-practices)

---

## 1. Accessing the Dashboard

By default, the dashboard lives at the `/sync/dash` path of your worker.

Open your browser and go to:

```
https://<YOUR_WORKER_DOMAIN>/sync/dash
```

> **Why not the root URL?**
> Visiting `/` or `/sync` without `/dash` intentionally shows a camouflage page — Ubuntu's site, Docker's site, or another public website — to fool network scanners and hide that a proxy gateway is running here. This is by design.

If you changed your **API Route** in settings (e.g., to `hidden`), your dashboard will be at:

```
https://<YOUR_WORKER_DOMAIN>/hidden/dash
```

---

## 2. Authentication

The login screen is the first thing you see when opening the dashboard.

- **Default Master Key:** `admin`
- Type your key into the input field and click **Authenticate**.

### Common login errors

| Message | Cause | Fix |
|---|---|---|
| `⚠️ IOT_DB namespace missing!` | The D1 database binding is missing or incorrect | Go to Cloudflare → your Worker → Settings → Bindings, add a D1 binding with variable name `IOT_DB`, then redeploy |
| `Invalid key` | Wrong master key entered | Use the correct key; if forgotten, query `SELECT * FROM kv_store WHERE key = 'masterKey'` in the D1 Console |
| Blank page / no login form | Worker is not deployed or code is broken | Re-paste `_worker.js` and redeploy |

> ⚠️ **Security:** Change the default `admin` key immediately after your first login. See [Tab 3 — System](#5-tab-3--system-settings).

---

## 3. Tab 1 — Endpoints (Info)

This is your home screen after logging in. It shows all the connection strings you need to import into a proxy client.

### Profile Cards

Each profile appears as a card with:

- **Protocol badge** — shows VLESS or Trojan (or both)
- **Connection string** — the full config URI to copy into your client
- **Copy button** — copies the URI to clipboard
- **Show QR Code** — opens a modal with a scannable QR code, ideal for mobile clients like Shadowrocket, Hiddify, or v2rayNG

### Default Profile

The default profile uses the UUID and settings configured in the System tab. Its subscription URL is:

```
https://<YOUR_WORKER_DOMAIN>/sync/sub
```

### Multi-User Profile Links

Each extra user profile (added in the Advanced tab) gets its own subscription URL:

```
https://<YOUR_WORKER_DOMAIN>/sync/sub?sub=Username
```

Replace `Username` with the exact name you used when creating the profile (case-sensitive).

### Cloud Sync URL

The **Cloud Sync URL** is the base subscription endpoint. Import this directly into clients that support subscription URLs (v2rayN, Hiddify, Nekoray, Shadowrocket, etc.) for automatic config updates.

### Subscription Info Page

When a user opens their subscription URL in a browser, they see a beautifully designed info page showing:

- **Usage metrics** — Total and daily traffic consumption with progress bars
- **Expiration date** — When the subscription expires
- **Status badge** — Active, Paused, Expired, or Limit Exceeded
- **Universal Sync Link** — Auto-detecting configuration URL with copy and QR code buttons
- **Language toggle** — Switch between English and Persian (فارسی) with full RTL support
- **Dark/Light mode** — Toggle between themes; preference is saved in browser

---

## 4. Tab 2 — Metrics (Network)

Real-time diagnostics about your gateway and the Cloudflare edge node serving your requests.

### Live Profile Usage

| Column | Description |
|---|---|
| Profile Name | The UUID name or user alias |
| Active Connections | Number of currently open proxy connections |
| Last Activity | Timestamp of the most recent connection |
| Data Used | Upload / Download totals tracked in D1 |

> **Note:** Connection counters reset if the Cloudflare Worker isolate restarts (which happens after periods of inactivity on the free tier).

### Network Cards

- **Origin IP** — The real IP address of the incoming request as seen by the worker
- **Edge Node (Colo)** — The Cloudflare data center code (e.g., `AMS`, `FRA`, `SIN`) handling your request
- **Region** — The geographic region of that edge node

### Latency Diagnostics

Click **Run Diagnostics** to trigger a browser-side latency test against each of your configured Clean IPs. Results show in milliseconds and help you identify which IPs perform best from your current location.

---

## 5. Tab 3 — System (Settings)

Core configuration for your gateway. All changes here require clicking **Update Config** at the bottom to take effect.

### Primary Display Mode

Controls which protocol(s) are used in generated configs:

| Mode | Protocol | Description |
|---|---|---|
| **Alpha** | VLESS | Lighter, faster. Recommended for most setups |
| **Beta** | Trojan | Stronger obfuscation. Good for stricter networks |
| **Both** | VLESS + Trojan | Generates configs for both protocols simultaneously |

### Device UUID

Your connection password/identifier used in VLESS configs.

- Leave **blank** to auto-generate one derived from your API route path
- Or enter any valid UUID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- In Trojan mode, this field acts as the Trojan password

### API Route

The URL path prefix for your dashboard and subscription endpoints. Default is `sync`.

- Change this to a secret word (e.g., `x7k2m`) to hide your dashboard from anyone who doesn't know it
- After saving, your dashboard moves to `https://<YOUR_WORKER_DOMAIN>/x7k2m/dash`
- Subscription URL becomes `https://<YOUR_WORKER_DOMAIN>/x7k2m/sub`

> ⚠️ **Bookmark the new URL** before saving if you change this setting, or you'll need to look it up from the D1 console.

### Master Key

The password for the dashboard login screen.

- Change from the default `admin` immediately
- Use a long, random passphrase
- If lost, recover via the D1 Console: `SELECT * FROM kv_store WHERE key = 'masterKey';`

### Name Prefix

A label prepended to generated config names (e.g., `Core` → configs are named `Core-VLESS-1.2.3.4`). Useful to identify configs across multiple deployments.

### Name Strategy

Controls how config names are formatted in the subscription output. Options vary by version — check your dashboard for available values.

### GitHub Repo

Optionally link your fork of the repository. Used for version checking and update notifications inside the dashboard.

---

## 6. Tab 4 — Advanced (Network)

Fine-grained control over transport, multi-user setup, integrations, and safety features.

### Clean IPs (Multi-Generator)

Enter Cloudflare clean IPs or hostnames that your clients should connect through. One per line, or comma-separated.

```
162.159.192.1
104.16.0.1
custom.cdn.example.com
```

The subscription generator creates a separate config entry for every IP you list, so your clients can pick the fastest one.

**Finding clean IPs:** Use tools like [CFIP.rip](https://cfip.rip) or [bia.fan](https://bia.fan) to find IPs with low latency from your region.

### Custom DNS

Override the DNS resolver used by the worker when resolving upstream hostnames. Default is Cloudflare's DoH endpoint (`https://cloudflare-dns.com/dns-query`). Change this if you need a different resolver.

### Resolve IP

The IP used for internal DNS resolution fallback. Default: `1.1.1.1`.

### Cascade (Slave Nodes)

Connect multiple Nahan workers together. Enter the subscription URL of another Nahan instance (a "slave node") here. The master node will fetch and merge that slave's configs into its own subscription output, giving users all configs in one link.

```
https://slave-worker.workers.dev/sync/sub
```

### Multi-User Profiles

Create separate subscription links for different users. One entry per line in the format:

```
<uuid>:Username
```

Example:
```
550e8400-e29b-41d4-a716-446655440000:Alice
6ba7b810-9dad-11d1-80b4-00c04fd430c8:Bob
```

Each user's subscription URL:
```
https://<YOUR_WORKER_DOMAIN>/sync/sub?sub=Alice
https://<YOUR_WORKER_DOMAIN>/sync/sub?sub=Bob
```

### Bandwidth Limits (per user)

Set a data cap per user profile in GB or TB. When a user hits their limit, their profile is automatically paused. You can manually resume it from the Metrics tab or via the Telegram bot.

### Telegram Bot

Receive login alerts and manage the gateway remotely.

**Setup:**
1. Create a bot via [@BotFather](https://t.me/botfather) → copy the **Bot Token**
2. Get your **Chat ID** from [@userinfobot](https://t.me/userinfobot)
3. Enter both values in this section and save

**Silent Alerts toggle:** When enabled, Telegram notifications are sent silently (no notification sound).

**Bot Language:** Sets the language of Telegram bot messages (`fa` for Persian, `en` for English).

### Cloudflare Analytics

Monitor how many requests your worker handles per day (free tier limit: 100,000/day).

**Setup:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Overview** → copy your **Account ID** from the right sidebar
2. Go to **My Profile** → **API Tokens** → **Create Token** → use the "Read analytics" template
3. Enter the Account ID and API Token here

### Kill Switch

An emergency toggle. When **ON**, all proxy traffic through your worker is immediately blocked — but the worker itself stays alive. Use this if you need to temporarily disable the gateway without deleting or undeploying it.

To re-enable, toggle it **OFF** and save.

Also triggerable via the Telegram `/pause` command.

### Secure Hello (ECH)

When enabled, Encrypted Client Hello (ECH) parameters are injected into generated client configurations. ECH provides an additional layer of TLS fingerprint obfuscation. Leave enabled unless your clients don't support it.

### NAT64

IPv6 NAT64 prefix for clients that need IPv6-mapped addresses. Enter one or more prefixes (comma or newline separated). When set, proxy IPs are automatically converted to NAT64-mapped IPv6 addresses and included alongside the original IPv4 addresses in subscription configs.

### Per-User Nodes

Each user can have custom hostnames defined. When set, the subscription generator uses these hostnames instead of (or in addition to) the global slave nodes. This enables multi-region deployments where different users connect through different edge locations.

### Direct Configs

When enabled, additional config entries are generated **without** the proxy IP — connecting directly through the clean IP. This gives users both proxied and direct connection options in their subscription.

### Auto Update

When enabled, the dashboard periodically checks your linked GitHub repository for new versions and shows an update banner. You can deploy directly from the dashboard with format options (normal or obfuscated).

---

## 7. Tab 5 — Activity Logs

A timestamped log of events on your gateway, including:

- Successful and failed login attempts (with IP address)
- Configuration saves (which settings were changed)
- Kill Switch activations/deactivations
- Telegram bot commands received

Use this to audit who has accessed the dashboard and when.

---

## 8. Applying & Saving Changes

Changes in the **System** and **Advanced** tabs are not applied until you explicitly save them.

1. After making changes, scroll to the bottom and click **Update Config**.
2. The button shows **"Syncing..."** while the config is written to D1.
3. The page auto-reloads once saved.

**Important:** If you changed the **API Route**, the page will redirect to the new URL automatically. Bookmark it before you lose it.

If the save fails (network error, D1 unavailable), the page will show an error. Try again — your unsaved changes remain in the form inputs.

---

## 9. Backup & Restore

Found in the **System** tab.

### Export

Click **📥 Export Configuration (JSON)** to download a `.json` file containing all your current settings (UUID, Clean IPs, user profiles, API route, Telegram config, etc.).

> The Master Key is **not** exported for security reasons. Store it separately.

### Restore / Import

Click **📤 Import Configuration** and select a previously exported `.json` file. All fields are instantly populated from the backup. Click **Update Config** to apply and save.

This is especially useful when:
- Migrating to a new worker
- Recovering after accidentally wiping settings
- Copying a config from one deployment to another

---

## 10. Telegram Bot Commands

Once your bot is configured in the Advanced tab, these commands are available:

| Command | Description |
|---|---|
| `/start` | Shows a welcome message and bot status |
| `/status` | Reports gateway status: active/paused, connection counts, edge node |
| `/pause` | Activates the Kill Switch — stops all proxy traffic |
| `/resume` | Deactivates the Kill Switch — restores proxy traffic |
| `/users` | Lists all user profiles and their current data usage |
| `/help` | Shows all available commands |

---

## 11. Tips & Best Practices

**Change defaults immediately.** The `admin` key and `sync` route are publicly known. Always customize them on first login.

**Use a secret API Route.** A random string like `a3f8z` makes your dashboard effectively unfindable by scanners.

**Keep a backup.** Export your config after every major change. Redeploying the worker code does not affect D1 data, but accidental manual resets can.

**Picking Clean IPs.** Use the Latency Diagnostics tool to measure which Clean IPs respond fastest from your users' locations. Add 3–5 IPs for redundancy.

**Free tier limits.** The Cloudflare free plan allows 100,000 Worker requests per day. Each proxy connection typically generates multiple requests (WebSocket frames). Monitor usage via the Analytics integration.

**Updating Nahan.** To upgrade to a newer version, simply paste the new `_worker.js` into the Worker editor and redeploy. Your D1 database and all configuration are untouched.

---

<div align="center">

[📖 README](./README.md) · [🇮🇷 راهنمای فارسی](./HELP_FA.md) · [⭐ Star on GitHub](https://github.com/itsyebekhe/nahan)

</div>