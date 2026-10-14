          async function loadApiKeys() {
              try {
                  const res = await fetch(baseRoute + '/api/keys', {
                      headers: { 'Authorization': 'Bearer ' + sessionKey }
                  });
                  const data = await res.json();
                  if (data.success) {
                      const list = document.getElementById('api-keys-list');
                      if (!list) return;
                      if (!data.keys || data.keys.length === 0) {
                          list.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-500">' + (i18n[lang]?.api_keys_empty || 'No API keys generated yet.') + '</p>';
                          return;
                      }
                      list.innerHTML = data.keys.map(k => {
                          const created = new Date(k.createdAt).toLocaleDateString();
                          const lastUsed = k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : (i18n[lang]?.never || 'Never');
                          return '<div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-darkborder">' +
                              '<div class="flex-1 min-w-0">' +
                              '<p class="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">' + (k.name || 'Unnamed') + '</p>' +
                              '<p class="text-[10px] font-mono text-slate-400 mt-0.5">' + k.keyPreview + '</p>' +
                              '<p class="text-[10px] text-slate-400 mt-0.5">' + (i18n[lang]?.created || 'Created') + ': ' + created + ' · ' + (i18n[lang]?.last_used || 'Last used') + ': ' + lastUsed + '</p>' +
                              '</div>' +
                              '<button onclick="revokeApiKey(\'' + k.id + '\')" class="ms-3 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">' + (i18n[lang]?.revoke || 'Revoke') + '</button>' +
                              '</div>';
                      }).join('');
                  }
              } catch(e) {}
          }

          async function generateApiKey() {
              const name = prompt(i18n[lang]?.enter_key_name || 'Enter a name for this API key:');
              if (!name) return;
              try {
                  const res = await fetch(baseRoute + '/api/keys', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sessionKey },
                      body: JSON.stringify({ action: 'create', name })
                  });
                  const data = await res.json();
                  if (data.success && data.key) {
                      const newBox = document.getElementById('api-key-new');
                      const keyInput = document.getElementById('api-key-value');
                      keyInput.value = data.key.key;
                      newBox.classList.remove('hidden');
                      loadApiKeys();
                  } else {
                      alert(data.error || 'Failed to create key');
                  }
              } catch(e) { alert('Error: ' + e.message); }
          }

          async function revokeApiKey(id) {
              if (!(await showConfirm(lang === 'fa' ? 'حذف کلید API' : 'Revoke API Key', i18n[lang]?.confirm_revoke || 'Revoke this API key? The remote panel will lose access.'))) return;
              try {
                  const res = await fetch(baseRoute + '/api/keys', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sessionKey },
                      body: JSON.stringify({ action: 'revoke', id })
                  });
                  const data = await res.json();
                  if (data.success) loadApiKeys();
                  else alert(data.error || 'Failed to revoke key');
              } catch(e) { alert('Error: ' + e.message); }
          }

          function copyApiKey() {
              const input = document.getElementById('api-key-value');
              navigator.clipboard.writeText(input.value);
              const stat = document.getElementById('save-status');
              if (stat) { stat.textContent = "Copied!"; stat.className = "text-sm font-bold text-emerald-500 md:me-4"; setTimeout(() => { stat.textContent = ""; }, 2000); }
          }

          async function doSaveDirectly() {
              const btn = document.querySelector('button[onclick="doSave()"]');
              const origText = btn?.innerText; if (btn) btn.innerText = "...";
              try {
                  const res = await fetch(baseRoute + '/api/sync', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ key: sessionKey, config: window.nahanConfig })
                  });
                  if(res.ok) {
                       const stat = document.getElementById('save-status');
                       if (stat) stat.textContent = i18n[lang]?.msg_saved || "Saved!";
                       setTimeout(() => { doLogin(true); if (stat) stat.textContent = ""; }, 1000);
                  }
              } catch(e) {}
              if (btn) btn.innerText = origText;
          }

          async function resolveSmartCleanIps() {
              const btn = document.getElementById('btn-resolve-smart-ips');
              const origText = btn.innerHTML;
              btn.disabled = true;
              btn.innerHTML = '⚡ Resolving CDN & Clean IPs...';

              const domains = [
                  'www.speedtest.net',
                  'grok.com',
                  'feedback.spotify.com',
                  'www.hcaptcha.com',
                  'chatgpt.com',
                  'sourceforge.net',
                  'snapp.ir',
                  'digikala.com',
                  'divar.ir',
                  'cafebazaar.ir',
                  'shaparak.ir',
                  'aparat.com',
                  'soft98.ir',
                  'varzesh3.com'
              ];

              let resolvedIps = new Set();
              const cleanIpsTextarea = document.getElementById('cfg-ips');

              async function resolveOne(domain) {
                  try {
                      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
                          headers: { 'accept': 'application/dns-json' }
                      });
                      const data = await res.json();
                      if (data && data.Answer) {
                          data.Answer.forEach(ans => {
                              if (ans.type === 1 && ans.data) {
                                  resolvedIps.add(ans.data);
                              }
                          });
                      }
                  } catch(e) {
                      try {
                          const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
                          const data = await res.json();
                          if (data && data.Answer) {
                              data.Answer.forEach(ans => {
                                  if (ans.type === 1 && ans.data) {
                                      resolvedIps.add(ans.data);
                                  }
                              });
                          }
                      } catch(ge) {}
                  }
              }

              try {
                  await Promise.all(domains.map(d => resolveOne(d)));
              } catch(err) {
                  console.error("DNS resolving process encountered an issue:", err);
              }

              if (resolvedIps.size > 0) {
                  const ipList = Array.from(resolvedIps).join('\n');
                  cleanIpsTextarea.value = ipList;
                  cleanIpsTextarea.dispatchEvent(new Event('input'));
                  cleanIpsTextarea.dispatchEvent(new Event('change'));
                  alert((lang === 'fa' ? 'با موفقیت حل شد و ' : 'Successfully resolved and loaded ') + resolvedIps.size + (lang === 'fa' ? ' آی‌پی تمیز بارگذاری شد!' : ' clean IPs!'));
              } else {
                  alert(lang === 'fa' ? 'خطا در تبدیل دامنه به آی‌پی. لطفاً اتصال اینترنت یا DNS سفارشی خود را بررسی کنید.' : 'Failed to resolve domains to IPs. Please verify your internet connection or custom DNS.');
              }

              btn.disabled = false;
              btn.innerHTML = origText;
          }

          async function checkUpdate() {
              try {
                  const res = await fetch(baseRoute + '/api/update', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ key: sessionKey, action: 'check' })
                  });
                  const data = await res.json();
                  if (data.success && data.updateAvailable) {
                      window._updateData = data;
                      if (window.nahanConfig?.autoUpdate && data.canDeploy) {
                          const format = window.nahanConfig.autoUpdateFormat || 'normal';
                          const formatEl = document.querySelector(`input[name="auto-update-format"][value="${format}"]`);
                          if (formatEl) formatEl.checked = true;
                          const autoRadio = document.querySelector(`input[name="auto-update-format"][value="${format}"]`);
                          if (autoRadio) autoRadio.checked = true;
                          doUpdate();
                      } else {
                          showUpdateBanner((document.getElementById('cfg-github-repo')?.value || window.nahanConfig?.githubRepo || 'itsyebekhe/nahan').replace('https://github.com/', '').replace('http://github.com/', '').trim(), data.latest);
                      }
                  }
                  if (data.success && !data.canDeploy) {
                      const statusEl = document.getElementById('update-deploy-status');
                      if (statusEl) {
                          statusEl.classList.remove('hidden');
                          statusEl.className = 'w-full mt-3 p-3 rounded-xl text-sm font-bold text-center text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
                          statusEl.textContent = i18n[lang].update_requires_cf || 'Configure CF credentials to enable auto-deploy.';
                      }
                  }
              } catch(err) {
                  console.error("Update check failed:", err);
              }
          }

          async function doUpdate() {
              const btn = document.getElementById('update-deploy-btn');
              const statusEl = document.getElementById('update-deploy-status');
              if (!btn) return;
              if (!(await showConfirm(lang === 'fa' ? 'دپلوی' : 'Deploy', lang === 'fa' ? 'آیا از دپلوی نسخه فعلی/جدید اطمینان دارید؟' : 'Deploy the selected version now?'))) return;

              const formatEl = document.querySelector('input[name="update-format"]:checked');
              const format = formatEl ? formatEl.value : 'normal';
              const forceDeploy = !window._updateData?.updateAvailable;

              const origText = btn.innerHTML;
              btn.innerHTML = '⏳ ' + (i18n[lang].update_deploying || 'Deploying...');
              btn.disabled = true;
              if (statusEl) {
                  statusEl.classList.remove('hidden');
                  statusEl.className = 'w-full mt-3 p-3 rounded-xl text-sm font-bold text-center text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 animate-pulse';
                  statusEl.textContent = i18n[lang].update_deploying || 'Deploying update (processing on server)...';
              }

              try {
                  const res = await fetch(baseRoute + '/api/update', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          key: sessionKey,
                          action: 'deploy',
                          format: format,
                          force: forceDeploy
                      })
                  });
                  const data = await res.json();
                  if (data.success) {
                      if (statusEl) {
                          statusEl.className = 'w-full mt-3 p-3 rounded-xl text-sm font-bold text-center text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
                          statusEl.textContent = (i18n[lang].update_success || 'Update successful!') + ' v' + data.newVersion;
                      }
                      btn.innerHTML = '✅ ' + (i18n[lang].update_success || 'Done!');
                      setTimeout(() => window.location.reload(), 3000);
                  } else {
                      if (statusEl) {
                          statusEl.className = 'w-full mt-3 p-3 rounded-xl text-sm font-bold text-center text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
                          statusEl.textContent = (i18n[lang].update_error || 'Update failed') + ': ' + (data.error || 'Unknown error');
                      }
                      btn.innerHTML = origText;
                      btn.disabled = false;
                  }
              } catch(e) {
                  if (statusEl) {
                      statusEl.className = 'w-full mt-3 p-3 rounded-xl text-sm font-bold text-center text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
                      statusEl.textContent = 'Error: ' + e.message;
                  }
                  btn.innerHTML = origText;
                  btn.disabled = false;
              }
          }

          async function triggerManualRedeploy() {
              const banner = document.getElementById('update-alert-banner');
              if (!banner) return;

              document.getElementById('update-alert-text').textContent = lang === 'fa'
                  ? 'می‌توانید آخرین نسخه فعال را مجدداً دپلوی نموده یا بین نسخه معمولی و مبهم‌سازی شده جابجا شوید.'
                  : 'You can redeploy the latest code or switch between Normal/Obfuscated version on the fly.';

              banner.classList.remove('hidden');
              banner.classList.add('flex');

              if (!window._updateData) {
                  window._updateData = { latest: CURRENT_VERSION, updateAvailable: false };
              }

              const repo = (document.getElementById('cfg-github-repo')?.value || window.nahanConfig?.githubRepo || 'itsyebekhe/nahan').replace('https://github.com/', '').replace('http://github.com/', '').trim();

              showUpdateBanner(repo, CURRENT_VERSION);

              switchTab('overview');
              document.getElementById('update-alert-banner').scrollIntoView({ behavior: 'smooth' });
          }

          function parseMarkdown(md) {
              if (!md) return '';
              let lines = md.split(/\r?\n/);
              let htmlLines = [];
              let inCodeBlock = false;
              let codeContent = [];
              let activeBlockLang = null;

              for (let line of lines) {
                  let trimmed = line.trim();

                  if (trimmed === '<!-- LANG:EN -->' || trimmed === '<!--LANG:EN-->') {
                      if (activeBlockLang === 'en') {
                          activeBlockLang = null;
                      } else {
                          activeBlockLang = 'en';
                      }
                      continue;
                  }
                  if (trimmed === '<!-- LANG:FA -->' || trimmed === '<!--LANG:FA-->') {
                      if (activeBlockLang === 'fa') {
                          activeBlockLang = null;
                      } else {
                          activeBlockLang = 'fa';
                      }
                      continue;
                  }

                  if (activeBlockLang !== null && activeBlockLang !== lang) {
                      continue;
                  }

                  // Toggle code block
                  if (trimmed.startsWith('\x60\x60\x60')) {
                      if (inCodeBlock) {
                          // Close code block
                          let codeText = codeContent.join('\n')
                              .replace(/&/g, "&amp;")
                              .replace(/</g, "&lt;")
                              .replace(/>/g, "&gt;");
                          htmlLines.push('<pre class="bg-slate-900/90 text-slate-100 p-3 rounded-xl my-2 font-mono text-[10px] overflow-x-auto border border-slate-800 max-h-40">' + codeText + '</pre>');
                          codeContent = [];
                          inCodeBlock = false;
                      } else {
                          inCodeBlock = true;
                      }
                      continue;
                  }

                  if (inCodeBlock) {
                      codeContent.push(line);
                      continue;
                  }

                  if (!trimmed) {
                      continue;
                  }

                  // Process headers
                  if (trimmed.startsWith('### ')) {
                      let text = trimmed.slice(4);
                      htmlLines.push('<h5 class="text-sm font-bold text-amber-800 dark:text-amber-400 mt-3 mb-1">' + parseInlineMarkdown(text) + '</h5>');
                      continue;
                  }
                  if (trimmed.startsWith('## ')) {
                      let text = trimmed.slice(3);
                      htmlLines.push('<h4 class="text-sm font-extrabold text-amber-800 dark:text-amber-400 mt-4 mb-2">' + parseInlineMarkdown(text) + '</h4>');
                      continue;
                  }
                  if (trimmed.startsWith('# ')) {
                      let text = trimmed.slice(2);
                      htmlLines.push('<h3 class="text-base font-black text-amber-900 dark:text-amber-300 mt-4 mb-2">' + parseInlineMarkdown(text) + '</h3>');
                      continue;
                  }

                  // Process lists
                  let listMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
                  if (listMatch) {
                      let text = listMatch[3];
                      htmlLines.push('<div class="flex items-start gap-2 my-1"><span class="text-amber-500 mt-0.5">▪</span><span class="flex-1">' + parseInlineMarkdown(text) + '</span></div>');
                      continue;
                  }

                  // Standard line
                  htmlLines.push('<p class="my-1">' + parseInlineMarkdown(line) + '</p>');
              }

              // Guard for unclosed code block
              if (inCodeBlock && codeContent.length > 0) {
                  let codeText = codeContent.join('\n')
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;");
                  htmlLines.push('<pre class="bg-slate-900/90 text-slate-100 p-3 rounded-xl my-2 font-mono text-[10px] overflow-x-auto border border-slate-800 max-h-40">' + codeText + '</pre>');
              }

              return htmlLines.join('\n');

              function parseInlineMarkdown(text) {
                  let safe = text
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;");
                  // Bold
                  safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-[var(--color-text)]">$1</strong>');
                  // Italic
                  safe = safe.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
                  // Inline code
                  safe = safe.replace(/[\x60](.*?)[\x60]/g, '<code class="bg-amber-500/10 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500 font-mono text-[11px]">$1</code>');
                  return safe;
              }
          }

          async function showUpdateBanner(repo, version) {
              const banner = document.getElementById('update-alert-banner');
              if (!banner) return;

              const msg = lang === 'fa'
                  ? 'نسخه جدیدتر (v' + version + ') در مخزن گیت‌هاب شما (' + repo + ') در دسترس است.'
                  : 'A newer version (v' + version + ') is available in your GitHub repository (' + repo + ').';

              document.getElementById('update-alert-text').textContent = msg;
              const ghLink = document.getElementById('update-github-link');
              if (ghLink) ghLink.href = 'https://github.com/' + repo;
              banner.classList.remove('hidden');
              banner.classList.add('flex');

              const changelogArea = document.getElementById('update-changelog-area');
              const changelogContent = document.getElementById('update-changelog-content');
              if (changelogArea && changelogContent) {
                  changelogArea.classList.remove('hidden');
                  changelogContent.innerHTML = lang === 'fa'
                      ? '<p class="animate-pulse">در حال دریافت گزارش تغییرات...</p>'
                      : '<p class="animate-pulse">Loading changelog...</p>';

                  try {
                      let changelogText = '';
                      try {
                          const res = await fetch('https://api.github.com/repos/' + repo + '/releases/tags/v' + version);
                          if (res.ok) {
                              const rel = await res.json();
                              if (rel && rel.body) {
                                  changelogText = rel.body;
                              }
                          } else {
                              const resNoV = await fetch('https://api.github.com/repos/' + repo + '/releases/tags/' + version);
                              if (resNoV.ok) {
                                  const relNoV = await resNoV.json();
                                  if (relNoV && relNoV.body) {
                                      changelogText = relNoV.body;
                                  }
                              }
                          }
                      } catch(e) {}

                      if (!changelogText) {
                          try {
                              const resLatest = await fetch('https://api.github.com/repos/' + repo + '/releases/latest');
                              if (resLatest.ok) {
                                  const relLatest = await resLatest.json();
                                  if (relLatest && relLatest.body) {
                                      changelogText = relLatest.body;
                                  }
                              }
                          } catch(e) {}
                      }

                      if (!changelogText) {
                          try {
                              const resFile = await fetch('https://raw.githubusercontent.com/' + repo + '/main/CHANGELOG.md');
                              if (resFile.ok) {
                                  changelogText = await resFile.text();
                              }
                          } catch(e) {}
                      }

                      if (changelogText) {
                          changelogContent.innerHTML = parseMarkdown(changelogText);
                      } else {
                          changelogContent.innerHTML = lang === 'fa'
                              ? '<div class="space-y-2">' +
                                '<p class="font-bold">✨ اضافه شده:</p>' +
                                '<ul class="list-disc list-inside text-xs space-y-1">' +
                                '<li>صفحه اشتراک چندزبانه با حالت تاریک/روشن</li>' +
                                '<li>پشتیبانی NAT64 و نودهای اختصاصی کاربر</li>' +
                                '<li>کانفیگ‌های مستقیم و بروزرسانی خودکار</li>' +
                                '<li>مدیریت کامل دروازه از ربات تلگرام</li>' +
                                '</ul>' +
                                '<p class="font-bold mt-2">⚡ بهبود یافته:</p>' +
                                '<ul class="list-disc list-inside text-xs space-y-1">' +
                                '<li>عملکرد داشبورد و سرعت اسکرول</li>' +
                                '<li>بازنویسی کامل تولید کانفیگ‌ها</li>' +
                                '<li>نام‌گذاری هوشمند با تگ‌های جدید</li>' +
                                '</ul>' +
                                '<p class="font-bold mt-2">🔧 رفع شده:</p>' +
                                '<ul class="list-disc list-inside text-xs space-y-1">' +
                                '<li>ترجمه‌های فارسی معیوب</li>' +
                                '<li>خطای صفحه اشتراک</li>' +
                                '</ul></div>'
                              : '<div class="space-y-2">' +
                                '<p class="font-bold">✨ Added:</p>' +
                                '<ul class="list-disc list-inside text-xs space-y-1">' +
                                '<li>Bilingual subscription page with dark/light mode</li>' +
                                '<li>NAT64 support and per-user custom nodes</li>' +
                                '<li>Direct configs and auto update</li>' +
                                '<li>Full gateway management via Telegram bot</li>' +
                                '</ul>' +
                                '<p class="font-bold mt-2">⚡ Improved:</p>' +
                                '<ul class="list-disc list-inside text-xs space-y-1">' +
                                '<li>Dashboard performance and scroll speed</li>' +
                                '<li>Complete rewrite of all config generators</li>' +
                                '<li>Smart config naming with new tags</li>' +
                                '</ul>' +
                                '<p class="font-bold mt-2">🔧 Fixed:</p>' +
                                '<ul class="list-disc list-inside text-xs space-y-1">' +
                                '<li>Garbled Persian translations</li>' +
                                '<li>Subscription page display error</li>' +
                                '</ul></div>';
                      }
                  } catch(err) {
                      changelogContent.innerHTML = lang === 'fa'
                          ? '<p class="text-rose-500">خطا در دریافت گزارش تغییرات.</p>'
                          : '<p class="text-rose-500">Failed to load changelog.</p>';
                  }
              }
          }
          //DateTime Function
            const _dtFormatter = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
            function updatePersianDateTime() {
    const now = new Date();
    const parts = _dtFormatter.formatToParts(now);

    const map = {};
    parts.forEach(p => {
        map[p.type] = p.value;
    });



        const custom = `${map.day} ${map.month} ${map.year} ${map.hour}:${map.minute}:${map.second}`;

    document.getElementById("net-datetime").innerText = custom;

}

                updatePersianDateTime();
                setInterval(updatePersianDateTime, 1000);



          function dismissUpdate() {
              const b = document.getElementById('update-alert-banner');
              if (b) {
                  b.classList.remove('flex');
                  b.classList.add('hidden');
              }
          }

  window.addHelperIpToTextarea = function(ipId, nameId, targetId) {
      const ipInput = document.getElementById(ipId);
      const nameInput = document.getElementById(nameId);
      if (!ipInput || !nameInput) return;
      const ip = ipInput.value.trim();
      const name = nameInput.value.trim();
      if (!ip) return;
      
      const textarea = document.getElementById(targetId);
      if (!textarea) return;
      
      let val = textarea.value;
      if (val && !val.endsWith('\n')) val += '\n';
      val += name ? `${ip}#${name}` : ip;
      
      textarea.value = val;
      
      ipInput.value = '';
      nameInput.value = '';
      
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
  };

  window.changeThemeVariant = function(val) {
      document.documentElement.setAttribute('data-theme', val);
      localStorage.setItem('theme_variant', val);
  };

  document.addEventListener('DOMContentLoaded', () => {

      // Initialize defaults for CF Optimizer
      const optCsEl = document.getElementById('opt-cs');
      if (optCsEl && !optCsEl.value) optCsEl.value = OPT_CS_DEF;
      const optFmEl = document.getElementById('opt-fm');
      if (optFmEl && !optFmEl.value) optFmEl.value = OPT_FM_DEF;
      const optInputRaw = document.getElementById('opt-input-raw');
      if (optInputRaw) optInputRaw.addEventListener('input', updateOptimiserInputCounter);

      const savedVariant = localStorage.getItem('theme_variant') || 'system';
      document.documentElement.setAttribute('data-theme', savedVariant);
      const sel = document.getElementById('theme-selector');
      if(sel) sel.value = savedVariant;

      const strategyInput = document.getElementById('cfg-name-strategy');
      const suggestionsBox = document.getElementById('cfg-strategy-suggestions');
      if (strategyInput && suggestionsBox) {
          strategyInput.addEventListener('focus', () => {
              suggestionsBox.classList.remove('hidden');
          });

          document.addEventListener('click', (e) => {
              if (!strategyInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                  suggestionsBox.classList.add('hidden');
              }
          });

          const tagBtns = suggestionsBox.querySelectorAll('.tag-btn');
          tagBtns.forEach(btn => {
              btn.addEventListener('click', () => {
                  const tag = btn.textContent;
                  const startPos = strategyInput.selectionStart;
                  const endPos = strategyInput.selectionEnd;
                  const text = strategyInput.value;
                  strategyInput.value = text.substring(0, startPos) + tag + text.substring(endPos);
                  strategyInput.focus();
                  const newPos = startPos + tag.length;
                  strategyInput.setSelectionRange(newPos, newPos);
              });
          });
      }
  });
</script>
<script>

