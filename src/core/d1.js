import { CACHE_TTL_CONFIG } from "./constants.js";
import { setSysConfigCacheTime, setSysUsageCacheTime, setBackupIpCacheTime } from "./config.js";

export async function d1Init(env) {
    if (env.IOT_DB && !env.IOT_DB_INITIALIZED) {
        try {
            await env.IOT_DB.prepare(
                "CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)",
            ).run();
            env.IOT_DB_INITIALIZED = true;
        } catch (e) {
            env.IOT_DB_INITIALIZED = true;
        }
    }
}

export async function d1Get(env, key) {
    if (!env.IOT_DB) return null;
    await d1Init(env);
    try {
        const { results } = await env.IOT_DB.prepare(
            "SELECT value FROM kv_store WHERE key = ?",
        )
            .bind(key)
            .all();
        if (results && results.length > 0) return results[0].value;
    } catch (e) {}
    return null;
}

export async function d1Put(env, key, value) {
    if (!env.IOT_DB) return;
    await d1Init(env);
    try {
        await env.IOT_DB.prepare(
            "INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
            .bind(key, value)
            .run();
    } catch (e) {}
}

export async function cachedD1Put(env, key, value) {
    await d1Put(env, key, value);
    if (key === "sys_config") setSysConfigCacheTime(0);
    else if (key === "sys_usage") setSysUsageCacheTime(0);
    else if (key === "backup_ip") setBackupIpCacheTime(0);
}

export async function d1PutStrict(env, key, value) {
    if (!env.IOT_DB) throw new Error("d1-unavailable");
    await d1Init(env);
    await env.IOT_DB.prepare(
        "INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    )
        .bind(key, value)
        .run();
}