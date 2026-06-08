<div align="center">

# Nahan Project
### Your Secure and Unlimited Gateway at the Network Edge

**Nahan** is a secure, lightweight, and customizable reverse proxy that runs entirely on Cloudflare Edge. This project turns your virtual server into a powerful gateway supporting both VLESS and Trojan protocols, all managed through a beautiful, self-contained dashboard.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.2-0A66C2?style=for-the-badge)]()

</div>

---

## 🌟 Why Nahan?

Nahan is not just a proxy script; it's a complete connection management solution designed with a focus on **speed**, **security**, and **simplicity**.

*   🛡️ **Hidden in the Network:** Unauthorized access is automatically redirected to public sites (like Ubuntu or Docker) to keep your server completely invisible to scanners.
*   ⚡ **Zero Server Cost:** Runs entirely on Cloudflare's free plan. No VPS required, no server maintenance worries.
*   🎨 **Modern Dashboard:** Responsive user interface supporting dark/light modes and bilingual (English/Persian).
*   🤖 **Telegram Bot:** Manage your gateway, check usage, and receive login alerts directly via Telegram.
*   📡 **Multi-user & Multi-IP:** Generate dedicated subscription links for different users and automatically combine them with clean IP lists.

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🔐 Dual Support** | Instant switching between **VLESS** (Alpha mode), **Trojan** (Beta mode), or **Both** simultaneously. |
| **📱 QR Code Generation** | Display QR codes for each profile for quick and easy setup on mobile devices. |
| **👥 User Management** | Manage user bandwidth based on TB/GB with pause/resume functionality. Accurate upload and download tracking using D1 Database. |
| **🌍 Clean IP Combiner** | Input a list of clean IPs; Nahan automatically generates all configs for these IPs. |
| **🔗 Multi-Node** | Connect multiple workers (Slave Nodes) to a centralized management and get all configs in one sub. |
| **💾 D1 Database** | Settings are persistently stored in Cloudflare D1 Database, solving KV's write limitations. |
| **🚨 Emergency Kill Switch** | Immediately cut off all proxy traffic with a single click from the dashboard or Telegram. |

## ⚡ Automated Setup (Recommended)

The easiest way to deploy Nahan is using the interactive setup script. It handles everything automatically — dependency checks, Cloudflare login, D1 database creation, and worker deployment.

**Prerequisites:** `Node.js` and `npm` (the script will offer to install them if missing).

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/your-repo/nahan/main/setup.sh)
```

Or if you've already cloned the repository:

```bash
chmod +x setup.sh && ./setup.sh
```

The script will guide you through 5 automated phases:

| Phase | Action |
| :--- | :--- |
| **1. Validation** | Checks for Node.js, npm, and Wrangler CLI (installs if missing) |
| **2. Authentication** | Opens browser for Cloudflare SSO login |
| **3. Database** | Creates and configures your D1 database |
| **4. Configuration** | Generates `wrangler.toml` automatically |
| **5. Deployment** | Uploads and activates your worker on Cloudflare Edge |

The script also includes an **Uninstall** option to completely remove the worker and database from Cloudflare.

> **⚠️ Note:** Disable any active VPN before running the script — it can interfere with Cloudflare's browser-based SSO login.

---

## 🚀 Manual Setup Guide

Set up your gateway in less than 2 minutes.

### 1. Create a D1 Database
1. Go to the **Cloudflare** dashboard → **Storage and databases** → **D1 SQLite Database**.
2. Create a new database (suggested name: `iot_db`).

### 2. Deploy the Worker
1. Go to **Workers & Pages** and click **Create Application**, then **Create Worker**.
2. Choose a name (e.g., `nahan-core`), paste the content of `_worker.js` script into it, and click Deploy.

### 3. Bind D1 Database to the Worker
1. In your newly created worker's panel, go to **Bindings**.
2. Click on **Add Binding** and select **D1 database**.
3. In the **Variable name** field, enter exactly `IOT_DB` (regardless of your actual database name).
4. In the **D1 Database** field, select the database you created in step 1.
5. Save the changes.

### 4. Login and Configuration
1. Open `https://<your-worker-url.workers.dev>/sync/dash`.
2. Log in with the default key: `admin`. If you updated your panel from 2.1.0 version, the password is admin again.
3. Apply your settings (UUID, clean IPs, protocols, etc.).

> **⚠️ Security Warning:** Immediately after logging in, change your Master Key in the **System** tab!

## 📖 Documentation
For a comprehensive guide on dashboard features and how to connect other workers (Slave Nodes), please read the [User Guide](HELP.md).

---

<div align="center">
Made with ❤️ by the Open Source Community
</div>
