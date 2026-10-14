          // Universal Header & Sub Copy Helpers
          function copySubUrl() {
              let url = "";
              if (window.nahanConfig && window.nahanConfig.subscriptionUrl) {
                  url = window.nahanConfig.subscriptionUrl;
              } else if (window.nahanProfiles && window.nahanProfiles[0] && window.nahanProfiles[0].url) {
                  url = window.nahanProfiles[0].url;
              } else {
                  const directEl = document.getElementById('link-direct');
                  if (directEl && directEl.value) url = directEl.value;
                  else url = window.location.origin + '/' + encodeURI((window.nahanConfig?.apiRoute || 'api'));
              }
              if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(url).then(() => {
                      showToast(lang === 'fa' ? 'لینک ساب در کلیپ‌بورد کپی شد!' : 'Subscription URL copied to clipboard!', 'success');
                  }).catch(() => {
                      copyFallback(url);
                  });
              } else {
                  copyFallback(url);
              }
          }

          function copyFallback(txt) {
              const ta = document.createElement('textarea');
              ta.value = txt;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
              showToast(lang === 'fa' ? 'لینک ساب در کلیپ‌بورد کپی شد!' : 'Subscription URL copied to clipboard!', 'success');
          }

          function openQRModal() {
              const modal = document.getElementById('qr-modal');
              if (modal) {
                  modal.classList.remove('hidden');
                  modal.classList.add('flex');
              }
          }

          function toggleMobileNavDrawer() {
              const d = document.getElementById('mobile-nav-drawer');
              if (d) d.classList.toggle('hidden');
          }

          // ==========================================
          // CF OPTIMIZER & AUTO-SUBLINK ENGINE MODULE
          // ==========================================
          var OPT_FM_DEF = '{"tcp": [{"type": "fragment", "settings": {"packets": "tlshello", "lengths": ["0", "104", "1"], "delays": ["0"], "maxSplit": "0"}},{"type": "fragment", "settings": {"packets": "1-1", "lengths": ["114", "1"], "delays": ["1"], "maxSplit": "11"}}]}';
          var OPT_CS_DEF = 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256:TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256:TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA:TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA:TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256:TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256';
          var OPT_ECH_DEF = 'cloudflare-ech.com+udp://1.1.1.1\ncloudflare-ech.com+udp://8.8.8.8';

          window._optimiserMode = 'fragment';

          function switchOptimiserMode(mode) {
              window._optimiserMode = mode;
              const isFrag = mode === 'fragment';
              const tabFrag = document.getElementById('opt-tab-frag');
              const tabEch = document.getElementById('opt-tab-ech');
              if (tabFrag) {
                  tabFrag.className = isFrag ? 'px-4 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-500 text-white shadow-sm flex items-center gap-1.5' : 'px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5';
              }
              if (tabEch) {
                  tabEch.className = !isFrag ? 'px-4 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-500 text-white shadow-sm flex items-center gap-1.5' : 'px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5';
              }
              const secFrag = document.getElementById('opt-sec-frag');
              const secEch = document.getElementById('opt-sec-ech');
              if (secFrag) secFrag.classList.toggle('hidden', !isFrag);
              if (secEch) secEch.classList.toggle('hidden', isFrag);
              updateOptimiserPreview();
          }

          function applyOptimiserPreset(type, val) {
              if (type === 'cs') {
                  const el = document.getElementById('opt-cs');
                  if (!el) return;
                  if (val === 'modern') el.value = 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
                  else if (val === 'standard') el.value = OPT_CS_DEF;
              } else if (type === 'fm') {
                  const el = document.getElementById('opt-fm');
                  if (!el) return;
                  if (val === 'pattng') el.value = OPT_FM_DEF;
                  else if (val === 'aggressive') {
                      el.value = JSON.stringify({
                          tcp: [
                              { type: "fragment", settings: { packets: "tlshello", lengths: ["1-3", "5-10"], delays: ["1-3"], maxSplit: "3" } }
                          ]
                      }, null, 2);
                  }
              } else if (type === 'ech') {
                  const el = document.getElementById('opt-ech-list');
                  if (el) el.value = OPT_ECH_DEF;
              }
              updateOptimiserPreview();
              showToast(lang === 'fa' ? 'الگو اعمال شد' : 'Preset applied', 'success');
          }

          function updateOptimiserPreview() {
              const autoApply = document.getElementById('cfg-opt-auto-apply')?.checked ?? false;
              const isFrag = (window._optimiserMode || 'fragment') === 'fragment';
              const cs = document.getElementById('opt-cs')?.value?.trim() || OPT_CS_DEF;
              const fm = document.getElementById('opt-fm')?.value?.trim() || OPT_FM_DEF;
              const fp = document.getElementById('opt-fp')?.value || 'chrome';
              const adr = document.getElementById('opt-adr')?.value?.trim() || '';
              const ech = document.getElementById('opt-ech-list')?.value?.trim() || OPT_ECH_DEF;

              // 1. Subscription URL Preview
              let subUrl = "";
              if (window.nahanConfig && window.nahanConfig.subscriptionUrl) {
                  subUrl = window.nahanConfig.subscriptionUrl;
              } else {
                  subUrl = window.location.origin + '/' + encodeURI((window.nahanConfig?.apiRoute || 'api'));
              }
              const subUrlInput = document.getElementById('opt-preview-suburl');
              if (subUrlInput) subUrlInput.value = subUrl;

              // 2. Status Badge
              const badge = document.getElementById('opt-status-badge');
              if (badge) {
                  if (autoApply) {
                      badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
                      badge.textContent = lang === 'fa' ? '✅ اعمال خودکار فعال است' : '✅ Auto-Apply Active';
                  } else {
                      badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20';
                      badge.textContent = lang === 'fa' ? '⚠️ ذخیره نشده / غیرفعال' : '⚠️ Disabled / Inactive';
                  }
              }

              // 3. Sample Config Preview
              const sampleArea = document.getElementById('opt-preview-sample');
              if (sampleArea) {
                  const targetHost = adr || hostName || window.location.hostname || 'gateway.example.com';
                  const path = '/' + encodeURI(window.nahanConfig?.apiRoute || 'sync');
                  const sampleUuid = (window.nahanConfig?.users?.[0]?.id) || '00000000-0000-0000-0000-000000000000';
                  const userName = (window.nahanConfig?.users?.[0]?.name) || 'User';

                  let sampleUrl = '';
                  if (isFrag) {
                      let compactFm = '';
                      try { compactFm = JSON.stringify(JSON.parse(fm)); } catch(e) { compactFm = fm; }
                      sampleUrl = `vless://${sampleUuid}@${targetHost}:443?encryption=none&security=tls&sni=${targetHost}&fp=${fp}&type=ws&host=${targetHost}&path=${path}&cs=${encodeURIComponent(cs)}&fm=${encodeURIComponent(compactFm)}#${encodeURIComponent(userName + ' [Optimized]')}`;
                  } else {
                      const firstEch = ech.split(/[\r\n]+/).map(s=>s.trim()).filter(Boolean)[0] || 'cloudflare-ech.com+udp://1.1.1.1';
                      sampleUrl = `vless://${sampleUuid}@${targetHost}:443?encryption=none&security=tls&sni=${targetHost}&fp=${fp}&type=ws&host=${targetHost}&path=${path}&ech=${encodeURIComponent(firstEch)}#${encodeURIComponent(userName + ' [ECH]')}`;
                  }
                  sampleArea.value = sampleUrl;
              }
          }

          function copyOptimiserSubUrl() {
              copySubUrl();
          }

          function copyOptimiserSample() {
              const sampleArea = document.getElementById('opt-preview-sample');
              const txt = sampleArea ? sampleArea.value : '';
              if (!txt) {
                  showToast(lang === 'fa' ? 'نمونه کانفیگی موجود نیست' : 'No sample config available', 'error');
                  return;
              }
              if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(txt).then(() => {
                      showToast(lang === 'fa' ? 'نمونه کانفیگ در کلیپ‌بورد کپی شد!' : 'Sample config copied to clipboard!', 'success');
                  }).catch(() => copyFallback(txt));
              } else {
                  copyFallback(txt);
              }
          }

          function loadOptimiserSettings(conf) {
              if (!conf) return;
              if (conf.optAutoApply !== undefined) {
                  const el = document.getElementById('cfg-opt-auto-apply');
                  if (el) el.checked = Boolean(conf.optAutoApply);
              }
              if (conf.optMode) {
                  switchOptimiserMode(conf.optMode);
              }
              if (conf.optCs) {
                  const el = document.getElementById('opt-cs');
                  if (el) el.value = conf.optCs;
              } else {
                  const el = document.getElementById('opt-cs');
                  if (el && !el.value) el.value = OPT_CS_DEF;
              }
              if (conf.optFm) {
                  const el = document.getElementById('opt-fm');
                  if (el) el.value = typeof conf.optFm === 'string' ? conf.optFm : JSON.stringify(conf.optFm, null, 2);
              } else {
                  const el = document.getElementById('opt-fm');
                  if (el && !el.value) el.value = OPT_FM_DEF;
              }
              if (conf.optFp) {
                  const el = document.getElementById('opt-fp');
                  if (el) el.value = conf.optFp;
              }
              if (conf.optAdr) {
                  const el = document.getElementById('opt-adr');
                  if (el) el.value = conf.optAdr;
              }
              if (conf.optEch) {
                  const el = document.getElementById('opt-ech-list');
                  if (el) el.value = conf.optEch;
              }
              if (conf.optEchSuffix) {
                  const el = document.getElementById('opt-ech-suffix');
                  if (el) el.value = conf.optEchSuffix;
              }
              updateOptimiserPreview();
          }

          function saveOptimiserSettings(payload) {
              if (!payload || !payload.config) return;
              payload.config.optAutoApply = document.getElementById('cfg-opt-auto-apply')?.checked ?? false;
              payload.config.optMode = window._optimiserMode || 'fragment';
              payload.config.optCs = document.getElementById('opt-cs')?.value?.trim() || '';
              payload.config.optFm = document.getElementById('opt-fm')?.value?.trim() || '';
              payload.config.optFp = document.getElementById('opt-fp')?.value || 'chrome';
              payload.config.optAdr = document.getElementById('opt-adr')?.value?.trim() || '';
              payload.config.optEch = document.getElementById('opt-ech-list')?.value?.trim() || '';
              payload.config.optEchSuffix = document.getElementById('opt-ech-suffix')?.value || ' ECH {ip}';
          }
