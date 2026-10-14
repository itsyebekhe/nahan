#!/usr/bin/env node
/**
 * Nahan Gateway Dashboard Builder Script
 * Assembles modular HTML views, layouts, modals, and scripts from dashboard/ into dashboard.html
 * Runs in local development and in GitHub Actions CI/CD workflows.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dashDir = path.join(rootDir, 'dashboard');

console.log('⚡ Assembling Nahan Gateway Dashboard from modular sections...');

try {
    const layoutFiles = [
        path.join(dashDir, 'layout', '01_head.html'),
        path.join(dashDir, 'views', 'login.html'),
        path.join(dashDir, 'layout', '02_dash_open.html'),
        path.join(dashDir, 'layout', '03_sidebar.html'),
        path.join(dashDir, 'layout', '04_main_open.html'),
        path.join(dashDir, 'layout', '05_header.html'),
        path.join(dashDir, 'layout', '06_scroll_open.html'),
    ];

    const viewFiles = [
        path.join(dashDir, 'views', 'overview.html'),
        path.join(dashDir, 'views', 'info.html'),
        path.join(dashDir, 'views', 'network.html'),
        path.join(dashDir, 'views', 'settings.html'),
        path.join(dashDir, 'views', 'advanced.html'),
        path.join(dashDir, 'views', 'users.html'),
        path.join(dashDir, 'views', 'add-user.html'),
        path.join(dashDir, 'views', 'edit-user.html'),
        path.join(dashDir, 'views', 'logs.html'),
        path.join(dashDir, 'views', 'help.html'),
        path.join(dashDir, 'views', 'optimiser.html'),
    ];

    const layoutPostViews = [
        path.join(dashDir, 'layout', '07_scroll_close.html'),
        path.join(dashDir, 'layout', '08_save_bar.html'),
        path.join(dashDir, 'layout', '09_main_close.html'),
        path.join(dashDir, 'layout', '10_bottom_nav.html'),
        path.join(dashDir, 'layout', '11_dash_close.html'),
        path.join(dashDir, 'modals', 'modals.html'),
    ];

    const scriptFiles = [
        path.join(dashDir, 'scripts', '01_obfuscator.js'),
        path.join(dashDir, 'scripts', '02_translations.js'),
        path.join(dashDir, 'scripts', '03_state.js'),
        path.join(dashDir, 'scripts', '04_navigation.js'),
        path.join(dashDir, 'scripts', '05_auth_sync.js'),
        path.join(dashDir, 'scripts', '06_users.js'),
        path.join(dashDir, 'scripts', '07_network_nodes.js'),
        path.join(dashDir, 'scripts', '08_optimiser.js'),
    ];

    const footFile = path.join(dashDir, 'layout', '12_foot.html');

    const parts = [];

    // 1. Pre-view layouts
    for (const f of layoutFiles) {
        if (!fs.existsSync(f)) throw new Error(`Missing layout file: ${path.relative(rootDir, f)}`);
        parts.push(fs.readFileSync(f, 'utf-8'));
    }

    // 2. Views
    for (const f of viewFiles) {
        if (!fs.existsSync(f)) throw new Error(`Missing view file: ${path.relative(rootDir, f)}`);
        parts.push(fs.readFileSync(f, 'utf-8'));
    }

    // 3. Post-view layouts & modals
    for (const f of layoutPostViews) {
        if (!fs.existsSync(f)) throw new Error(`Missing layout file: ${path.relative(rootDir, f)}`);
        parts.push(fs.readFileSync(f, 'utf-8'));
    }

    // 4. Client-side scripts bundle
    parts.push('      <script>\n');
    for (const f of scriptFiles) {
        if (!fs.existsSync(f)) throw new Error(`Missing script file: ${path.relative(rootDir, f)}`);
        parts.push(fs.readFileSync(f, 'utf-8'));
        parts.push('\n');
    }
    parts.push('      </script>\n');

    // 5. Foot
    if (!fs.existsSync(footFile)) throw new Error(`Missing foot file: ${path.relative(rootDir, footFile)}`);
    parts.push(fs.readFileSync(footFile, 'utf-8'));

    const compiledHtml = parts.join('');

    // Write to root dashboard.html
    const outTarget = path.join(rootDir, 'dashboard.html');
    fs.writeFileSync(outTarget, compiledHtml, 'utf-8');

    // Also sync to src/templates/dashboard.html if exists
    const templateTarget = path.join(rootDir, 'src', 'templates', 'dashboard.html');
    if (fs.existsSync(path.dirname(templateTarget))) {
        fs.writeFileSync(templateTarget, compiledHtml, 'utf-8');
    }

    const lines = compiledHtml.split('\n').length;
    const kb = (Buffer.byteLength(compiledHtml, 'utf-8') / 1024).toFixed(1);
    console.log(`✅ Dashboard compiled successfully! (${lines} lines, ${kb} KB) -> dashboard.html`);
} catch (err) {
    console.error('❌ Build dashboard error:', err.message);
    process.exit(1);
}
