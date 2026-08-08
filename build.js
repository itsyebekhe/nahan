#!/usr/bin/env node
/**
 * Build the Nahan worker.
 *
 * Bundles + minifies `src/index.js` into `_worker.js` at the repo root.
 * The output path is required: the worker's auto-update fetches
 * `https://raw.githubusercontent.com/<repo>/main/_worker.js`.
 */
import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(ROOT, "src", "index.js");
const OUT_FILE = path.join(ROOT, "_worker.js");

try {
  const result = await build({
    entryPoints: [ENTRY],
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2022",
    outfile: OUT_FILE,
    write: false, // write the artifact ourselves so we can report its size
    logLevel: "warning",
    // cloudflare:sockets is a platform binding; esbuild leaves it external.
    external: ["cloudflare:sockets"],
  });

  const code = result.outputFiles[0].text;
  writeFileSync(OUT_FILE, code);

  const bytes = Buffer.byteLength(code);
  const lines = code.split("\n").length;

  console.log(`Built ${OUT_FILE}`);
  console.log(`  bundle : ${bytes.toLocaleString()} bytes (${lines} lines)`);
} catch (err) {
  console.error("Build failed:", err.message);
  process.exit(1);
}