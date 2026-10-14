import assets from "../templates/assets.json" with { type: "json" };

// Core Constants & Protocol Identifier Strings
export const CURRENT_VERSION = "3.0.4";

export const getAlpha = () => String.fromCharCode(118, 108, 101, 115, 115);
export const getBeta = () => String.fromCharCode(116, 114, 111, 106, 97, 110);
export const getGamma = () => String.fromCharCode(99, 108, 97, 115, 104);

export const REQ_BYTES_EST = 1073741824 / 6000;

export const TCP_OPEN_TIMEOUT_MS = 5000;
export const TCP_WRITE_TIMEOUT_MS = 5000;
export const TCP_FIRST_READ_TIMEOUT_MS = 7000;
export const UPSTREAM_WRITE_TIMEOUT_MS = 15000;
export const NAHAN_RUNNER_LEASE_TTL_MS = 120000;
export const UPSTREAM_QUEUE_MAX_BYTES = 4 * 1024 * 1024;
export const UPSTREAM_QUEUE_MAX_ITEMS = 256;

export const CACHE_TTL_CONFIG = 10000;
export const CACHE_TTL_USAGE = 10000;
export const CACHE_TTL_BACKUP_IP = 30000;

export const VALID_NAME_TAGS = [
    "FLAG", "COUNTRY", "CITY", "ISP", "PROTOCOL", "USER",
    "PORT", "PREFIX", "IP", "IP_NAME", "HOST", "DATE",
    "INDEX", "WORKER"
];

export const AI_LLM_SUFFIXES = assets.ai_suffixes || [];
export const botI18n = assets.bot_i18n || {};

export const SYSTEM_DEFAULTS = {
    name: "",
    apiRoute: "sync",
    maintenanceHost: "https://www.ubuntu.com, https://www.docker.com",
    backupRelay: "",
    customRelay: "",
    masterKey: "admin",
    metricNode: "time.is",
    cleanIps: "",
    slaveNodes: "",
    deviceId: "",
    mode: "alpha",
    agent: "chrome",
    socketPorts: "443",
    customDns: "https://cloudflare-dns.com/dns-query",
    resolveIp: "1.1.1.1",
    cascade: "",
    enableOpt1: false,
    enableOpt2: false,
    tgToken: "",
    tgChatId: "",
    tgAdminId: "",
    cfAccountId: "",
    cfApiToken: "",
    cfWorkerName: "",
    isPaused: false,
    silentAlerts: false,
    githubRepo: "itsyebekhe/nahan",
    nameStrategy: "default",
    namePrefix: "Core",
    tgBotLang: "fa",
    users: [],
    subUserAgent: "",
    customPanelUrl: "",
    limitTotalReq: 0,
    expiryMs: 0,
    linkedPanels: [],
    hubPanelUrl: "",
    syncApiKey: "",
    panelApiKeys: [],
    nat64Prefix: "",
    enableDirectConfigs: false,
    customRouting: "",
    upstreamUri: "",
    autoUpdate: false,
    autoUpdateFormat: "encoded",
    fakeConfigs: [
        { name: "📊 {usage}", enabled: true },
        { name: "📅 {expiry}", enabled: true },
    ],
    // Optimizer Auto-Apply configuration
    optAutoApply: true,
    optMode: "fragment",
    optCs: "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    optFm: '{"tcp":[{"type":"fragment","settings":{"packets":"tlshello","lengths":["0","104","1"],"delays":["0"],"maxSplit":"0"}},{"type":"fragment","settings":{"packets":"1-1","lengths":["114","1"],"delays":["1"],"maxSplit":"11"}}]}',
    optFp: "chrome",
    optAdr: "",
    optEchList: "cloudflare-ech.com+udp://1.1.1.1\\ncloudflare-ech.com+udp://8.8.8.8",
    optEchSuffix: " ECH {ip}",
    // Sepidar-grade hardening flags (safe defaults; merged, never wiped).
    maintenanceMode: false,
    allowRemoteDeploy: true,
    autoPruneRelays: true,
    trafficNormalizer: true,
    trafficNormaliser: true,
};

// Circuit breaker (Sepidar-grade load shedding): when an isolate is
// saturated, cheap static work is shed first so real tunnels survive.
// Level 1: skip the ubuntu/docker origin fetch (serve 404 instead).
// Level 2: also tarpit new WS handshakes + refuse non-browser sub refresh.
