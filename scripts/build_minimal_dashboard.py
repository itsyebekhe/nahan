import os
import re

def main():
    with open('dashboard.html.bak', 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.splitlines()
    script_block = '\n'.join(lines[2398:6125])
    html_markup = '\n'.join(lines[293:2398])

    # Clean head with modern minimalist styling and high contrast
    head = """<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#090d16">
    <meta name="apple-mobile-web-app-title" content="Nahan">
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%236366f1'/><text x='50' y='62' font-size='40' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='bold'>N</text></svg>">
    <title>Nahan Gateway</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Vazirmatn:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="tailwindcss.js"></script>
    <script>
        if (!window.tailwind) {
            document.write('<script src="https://cdn.jsdelivr.net/gh/itsyebekhe/nahan@main/tailwindcss.js"><\\/script>');
        }
    </script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                        fa: ['Vazirmatn', 'sans-serif'],
                        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
                    },
                    colors: {
                        primary: 'var(--color-primary)',
                        'primary-hover': 'var(--color-primary-hover)',
                        darkbg: 'var(--color-bg)',
                        darkcard: 'var(--color-surface)',
                        darkborder: 'var(--color-border)',
                    }
                }
            }
        };
    </script>
    <style>
        :root {
            --color-primary: #6366f1;
            --color-primary-hover: #4f46e5;
            --color-bg: #f8fafc;
            --color-surface: #ffffff;
            --color-surface-muted: #f1f5f9;
            --color-border: #e2e8f0;
            --color-border-subtle: #edf2f7;
            --color-text: #0f172a;
            --color-text-muted: #64748b;
            --color-text-subtle: #94a3b8;
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-200: #e2e8f0;
            --slate-300: #cbd5e1;
            --slate-400: #94a3b8;
            --slate-500: #64748b;
            --slate-600: #475569;
            --slate-700: #334155;
            --slate-800: #1e293b;
            --slate-900: #0f172a;
        }

        html.dark {
            --color-primary: #818cf8;
            --color-primary-hover: #6366f1;
            --color-bg: #090d16;
            --color-surface: #111726;
            --color-surface-muted: #182032;
            --color-border: rgba(255, 255, 255, 0.08);
            --color-border-subtle: rgba(255, 255, 255, 0.04);
            --color-text: #f8fafc;
            --color-text-muted: #94a3b8;
            --color-text-subtle: #64748b;
            --slate-50: #182032;
            --slate-100: #1f293d;
            --slate-200: #2d3b55;
            --slate-300: #94a3b8;
            --slate-400: #cbd5e1;
            --slate-500: #94a3b8;
            --slate-600: #cbd5e1;
            --slate-700: #e2e8f0;
            --slate-800: #f1f5f9;
            --slate-900: #f8fafc;
            --darkbg: #090d16;
            --darkcard: #111726;
            --darkborder: rgba(255, 255, 255, 0.08);
        }

        /* Clean theme accent variants */
        html[data-theme="ocean"] {
            --color-primary: #0ea5e9;
            --color-primary-hover: #0284c7;
        }
        html[data-theme="forest"] {
            --color-primary: #10b981;
            --color-primary-hover: #059669;
        }
        html[data-theme="sunset"] {
            --color-primary: #f43f5e;
            --color-primary-hover: #e11d48;
        }
        html[data-theme="dracula"] {
            --color-primary: #bd93f9;
            --color-primary-hover: #a855f7;
        }

        html[lang="fa"] body, html[lang="fa"] body *:not(.font-mono) {
            font-family: 'Vazirmatn', sans-serif !important;
        }

        body {
            background-color: var(--color-bg);
            color: var(--color-text);
            font-family: 'Inter', sans-serif;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

        /* Minimalist, high-contrast form controls */
        input[type="text"], input[type="password"], input[type="search"], select, textarea {
            background-color: var(--color-surface-muted) !important;
            color: var(--color-text) !important;
            border: 1px solid var(--color-border) !important;
            border-radius: 0.75rem !important;
            font-size: 0.875rem !important;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        input[type="text"]:focus, input[type="password"]:focus, input[type="search"]:focus, select:focus, textarea:focus {
            outline: none !important;
            border-color: var(--color-primary) !important;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent) !important;
        }

        input::placeholder, textarea::placeholder {
            color: var(--color-text-subtle) !important;
            opacity: 0.8;
        }

        select option {
            background-color: var(--color-surface) !important;
            color: var(--color-text) !important;
        }

        .login-input {
            background-color: var(--color-surface-muted) !important;
            color: var(--color-text) !important;
            border: 1px solid var(--color-border) !important;
        }
        .login-input:focus {
            border-color: var(--color-primary) !important;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent) !important;
        }

        /* Minimalist Navigation Pills */
        .nav-item {
            transition: all 0.15s ease;
            border-radius: 0.75rem;
            color: var(--color-text-muted);
        }
        .nav-item:hover {
            color: var(--color-text);
            background-color: var(--color-surface-muted);
        }
        .nav-item.active {
            background-color: color-mix(in srgb, var(--color-primary) 12%, transparent) !important;
            color: var(--color-primary) !important;
            font-weight: 600 !important;
        }
        .mobile-nav-item.active {
            color: var(--color-primary) !important;
        }

        /* Clean micro scrollbars */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--color-text-subtle); }

        [data-accordion-content] {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.25s ease;
        }

        .native-press:active {
            transform: scale(0.98);
        }

        .fade-in {
            animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
"""

    # Process html_markup:
    # 1. Clean typo /70 /70
    html_markup = html_markup.replace('/70 /70', '')

    # 2. Insert missing cfg-fake input before cfg-relay
    fake_input = """                                      <div class="space-y-1">
                                          <label class="block text-sm font-bold text-slate-600 dark:text-slate-300" data-i18n="lbl_fake">Maintenance Hosts (Camouflage)</label>
                                          <input type="text" id="cfg-fake" placeholder="e.g. speedtest.net" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-1 outline-none text-sm font-mono">
                                      </div>
"""
    if 'id="cfg-fake"' not in html_markup:
        html_markup = html_markup.replace('<textarea id="cfg-relay"', fake_input + '                                      <textarea id="cfg-relay"')

    # 3. Insert missing cfg-sync-api-key before linked-nodes-list
    sync_input = """                                       <div class="space-y-1 mb-3">
                                           <label class="block text-sm font-bold text-slate-600 dark:text-slate-300" data-i18n="lbl_sync_api_key">Sync API Key (Slave Push)</label>
                                           <input type="password" id="cfg-sync-api-key" placeholder="Enter slave sync API key" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkborder bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-1 outline-none text-sm font-mono">
                                           <p class="text-[11px] text-slate-400 mt-1" data-i18n="desc_sync_api_key">API key from a slave panel. Main uses this to push config.</p>
                                       </div>
"""
    if 'id="cfg-sync-api-key"' not in html_markup:
        html_markup = html_markup.replace('<div id="linked-nodes-list"', sync_input + '                                           <div id="linked-nodes-list"')

    # 4. Insert link-direct and qr-code in view-info
    info_extras = """<input type="text" id="link-direct" class="hidden" readonly>
<img id="qr-code" class="hidden" alt="Direct Link QR">
"""
    if 'id="link-direct"' not in html_markup:
        html_markup = html_markup.replace('<div id="view-info" class="hidden space-y-6">', '<div id="view-info" class="hidden space-y-6">\n' + info_extras)

    # 5. Simplify login-box background to clean minimalist styling
    html_markup = re.sub(
        r'<div id="login-box"[^>]*>',
        '<div id="login-box" class="absolute inset-0 flex items-center justify-center p-4 z-40 bg-[var(--color-bg)]">',
        html_markup
    )
    # Remove gaudy 500px glowing radial blobs in login box
    html_markup = re.sub(
        r'<div class="absolute pointer-events-none rounded-full"[^>]*></div>',
        '',
        html_markup
    )

    # Combine into final file
    final_output = head + html_markup + '\n\n' + script_block + '\n</body>\n</html>\n'

    with open('dashboard.html', 'w', encoding='utf-8') as f:
        f.write(final_output)

    print("Successfully built minimalist dashboard.html! Length:", len(final_output))

if __name__ == '__main__':
    main()
