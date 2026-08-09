#!/usr/bin/env node
/**
 * Build the Nahan worker.
 *
 * Bundles + minifies `src/index.js` into `_worker.js` at the repo root.
 * The output path is required: the worker's auto-update fetches
 * `https://raw.githubusercontent.com/<repo>/main/_worker.js`.
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(ROOT, "src", "index.js");
const OUT_FILE = path.join(ROOT, "_worker.js");
const CONSTANTS_FILE = path.join(ROOT, "src", "core", "constants.js");

// Read the version from the worker's own constants module so the banner and
// the runtime value can never drift. Minification renames the `CURRENT_VERSION`
// binding, so the banner keeps the version discoverable in the built bundle.
const constantsSrc = readFileSync(CONSTANTS_FILE, "utf8");
const versionMatch = constantsSrc.match(
    /CURRENT_VERSION\s*=\s*["']([^"']+)["']/,
);
const CURRENT_VERSION = versionMatch ? versionMatch[1] : "0.0.0";
// Compact banner: keeps the literal `const CURRENT_VERSION = "x.y.z"` text so the
// regex used by older deployed workers still matches, while staying small.
const VERSION_BANNER = `/*const CURRENT_VERSION="${CURRENT_VERSION}"*/`;

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
    // Prepend a version banner so the minified bundle still exposes the
    // version that update.js parses from downloaded workers.
    banner: { js: VERSION_BANNER },
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