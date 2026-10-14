        async function loadLogs() {
            const container = document.getElementById('logs-container');
            if(!container) return;
            container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">' + (i18n[lang]?.loading_logs || 'Loading logs...') + '</p>';
            try {
                                  saveOptimiserSettings(payload);
                  const res = await fetch(baseRoute + '/api/logs', { method: 'POST', body: JSON.stringify({ key: sessionKey }) });
                const data = await res.json();
                if (data.success && data.logs) {
                    if (data.logs.length === 0) {
                        container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">' + (i18n[lang]?.no_activity_logs || 'No activity logs found.') + '</p>';
                        return;
                    }
                    let logsHtml = '';
                    data.logs.forEach(log => {
                        const dateStr = new Date(log.ts).toLocaleString('en-US', {hour12: false});
                        logsHtml += `<div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-darkborder/50 gap-2"><div><p class="text-sm font-bold text-slate-700 dark:text-slate-200">${log.type}</p><p class="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs" title="${log.detail}">${log.detail}</p></div><span class="text-[10px] font-mono text-slate-400 bg-[var(--color-surface)]  px-2 py-1 rounded shrink-0">${dateStr}</span></div>`;
                    });
                    container.innerHTML = logsHtml;
                } else {
                    container.innerHTML = '<p class="text-sm text-red-400 text-center py-4">Failed to load logs.</p>';
                }
            } catch (err) {
                container.innerHTML = '<p class="text-sm text-red-400 text-center py-4">Error loading logs.</p>';
            }
        }

        async function loadDashboard() {
            try {
                const [statsRes, logsRes] = await Promise.all([
                    fetch(baseRoute + '/api/stats', { method: 'GET', headers: { 'Authorization': 'Bearer ' + sessionKey } }),
                    fetch(baseRoute + '/api/logs', { method: 'POST', body: JSON.stringify({ key: sessionKey }) })
                ]);
                const statsData = await statsRes.json();
                const logsData = await logsRes.json();

                if (statsData.success && statsData.stats) {
                    const s = statsData.stats;
                    document.getElementById('ov-total-users').textContent = s.users.total;
                    document.getElementById('ov-active-users').textContent = s.users.active;
                    document.getElementById('ov-paused-users').textContent = s.users.paused;
                    document.getElementById('ov-auto-disabled').textContent = s.users.autoDisabled;
                    document.getElementById('ov-expired-users').textContent = s.users.expired;
                    document.getElementById('ov-total-traffic').textContent = s.traffic.totalGB + ' ' + (i18n[lang]?.ov_gb_unit || 'GB');
                    document.getElementById('ov-total-reqs').textContent = s.traffic.totalRequests.toLocaleString();
                    document.getElementById('ov-today-traffic').textContent = s.traffic.dailyGB + ' ' + (i18n[lang]?.ov_gb_unit || 'GB');
                    document.getElementById('ov-today-reqs').textContent = s.traffic.dailyRequests.toLocaleString();
                    document.getElementById('ov-active-conns').textContent = s.system.activeConnections;
                    
                    document.getElementById('ov-version').textContent = 'v' + s.system.version;
                    
                    const usageCont = document.getElementById('usage-metrics-container');
                    if(usageCont && statsData.stats.usage && window.nahanProfiles) {
                        let usageHtml = '';
                        window.nahanProfiles.forEach(p => {
                            let hash = p.id.replace(/-/g, '').toLowerCase();
                            let use = statsData.stats.usage[hash];
                            if(use) {
                                let timeStr = new Date(use.last).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
                                usageHtml += `<div class="flex items-center justify-between p-3 border-b border-slate-100 dark:border-darkborder/50 last:border-0"><div class="flex flex-col"><span class="text-sm font-bold text-slate-700 dark:text-white">${p.name}</span><span class="text-[10px] text-slate-400 font-mono">${p.id.split('-')[0]}...</span></div><div class="flex flex-col items-end"><span class="text-xs font-bold text-emerald-500">${use.connects} Conns</span><span class="text-[10px] text-slate-400">${timeStr}</span></div></div>`;
                            }
                        });
                        if(usageHtml) usageCont.innerHTML = usageHtml;
                    }

                }

                const actList = document.getElementById('ov-activity-list');
                if (logsData.success && logsData.logs && logsData.logs.length > 0) {
                    let actHtml = '';
                    logsData.logs.slice(0, 8).forEach(log => {
                        const dateStr = new Date(log.ts).toLocaleString('en-US', {hour12: false});
                        const typeColors = { 'Auth Success': 'bg-emerald-500', 'Auth Failed': 'bg-red-500', 'User Created': 'bg-blue-500', 'User Deleted': 'bg-red-500', 'User Toggled': 'bg-amber-500', 'User Updated': 'bg-indigo-500', 'User Auto-Disabled': 'bg-red-500', 'Traffic Reset': 'bg-cyan-500', 'Config Changed': 'bg-violet-500' };
                        const dotColor = typeColors[log.type] || 'bg-slate-400';
                        actHtml += '<div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"><div class="w-2 h-2 rounded-full shrink-0 ' + dotColor + '"></div><div class="flex-1 min-w-0"><p class="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">' + log.type + '</p><p class="text-[11px] text-slate-400 truncate">' + log.detail + '</p></div><span class="text-[10px] font-mono text-slate-400 shrink-0">' + dateStr + '</span></div>';
                    });
                    actList.innerHTML = actHtml;
                } else {
                    actList.innerHTML = '<p class="text-sm text-slate-400 text-center py-6">' + (i18n[lang]?.no_recent_activity || 'No recent activity.') + '</p>';
                }
            } catch (err) {
                console.error('Dashboard load error:', err);
            }
            loadApiKeys();
        }

          function copyData(id) {
              const input = document.getElementById(id); input.select(); navigator.clipboard.writeText(input.value);
              const toast = document.getElementById('copy-toast');
              toast.style.transform = 'translate(-50%, 0)'; toast.style.opacity = '1';
              setTimeout(() => { toast.style.transform = 'translate(-50%, -5rem)'; toast.style.opacity = '0'; }, 2000);
          }

          function copyToClipboard(text) {
              navigator.clipboard.writeText(text).then(() => {
                  showToast(lang === 'fa' ? 'کپی شد!' : 'Copied!', 'success');
              }).catch(() => {
                  showToast(lang === 'fa' ? 'خطا در کپی' : 'Copy failed', 'error');
              });
          }

          function showQR(name, url) {
              document.getElementById('qr-modal-title').innerText = name;
              document.getElementById('qr-modal-img').src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(url);
              document.getElementById('qr-modal-link').innerText = url;
              document.getElementById('qr-modal').classList.remove('hidden');
              document.getElementById('qr-modal').classList.add('flex');
          }

          window.toggleAccordion = function(btn) {
              const card = btn.closest('[data-accordion]');
              if (!card) return;
              const content = card.querySelector('[data-accordion-content]');
              const icon = btn.querySelector('.accordion-icon');
              const isOpen = content.style.visibility === 'visible';

              content.style.transition = 'max-height 0.3s ease, visibility 0.3s ease';

              if (isOpen) {
                  content.style.maxHeight = content.scrollHeight + 'px';
                  requestAnimationFrame(() => {
                      content.style.maxHeight = '0';
                      content.style.visibility = 'hidden';
                  });
                  icon.style.transform = 'rotate(0deg)';
              } else {
                  content.style.visibility = 'visible';
                  content.style.maxHeight = content.scrollHeight + 'px';
                  icon.style.transform = 'rotate(180deg)';
                  setTimeout(() => { if (content.style.visibility === 'visible') content.style.maxHeight = 'none'; }, 350);
              }
          }

          window.handleCopy = function handleCopy(btn) {
              copyData('sync-' + btn.dataset.id);
          }
          window.handleQR = function handleQR(btn) {
              showQR(btn.dataset.name, document.getElementById('sync-' + btn.dataset.id).value);
          }

          function closeQRModal() {
              document.getElementById('qr-modal').classList.add('hidden');
              document.getElementById('qr-modal').classList.remove('flex');
          }

          function updateUI() {
              try {
                  let portsStr = Array.from(document.getElementById('cfg-port').selectedOptions).map(o=>o.value).join(',');
                  let port = portsStr ? portsStr.split(',')[0] : '443';
                  let proto = document.getElementById('cfg-proto').value === 'beta' ? String.fromCharCode(116, 114, 111, 106, 97, 110) : String.fromCharCode(118, 108, 101, 115, 115);
                  let rawIps = document.getElementById('cfg-ips').value || "";

                  let ipsList = rawIps.replace(/,/g, '\n').replace(/;/g, '\n').split('\n').map(s=>s.trim()).filter(Boolean);
                  let finalIP = ipsList.length > 0 ? ipsList[0] : (hostName.endsWith('.pages.dev') ? 'time.is' : hostName);

                  let fp = document.getElementById('cfg-fp').value;
                  let path = encodeURI("/" + document.getElementById('cfg-path').value);
                  let sec = ["80","8080"].includes(port) ? "none" : "tls";

                  let rawLink = proto + "://" + localUUID + "@" + finalIP + ":" + port + "?encryption=none&security=" + sec + "&sni=" + hostName + "&fp=" + fp + "&type=ws&host=" + hostName + "&path=" + path;
                  if (document.getElementById('cfg-ech').checked) rawLink += "&pbk=enabled";
                  rawLink += "#" + hostName;

                  // FIX: Check if elements exist
                  const linkEl = document.getElementById('link-direct');
                  if (linkEl) linkEl.value = rawLink;

                  const qrEl = document.getElementById('qr-code');
                  if (qrEl) qrEl.src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(rawLink);

                  let totalIps = ipsList.length === 0 ? 1 : ipsList.length;
                  let tCfg = totalIps * 2;
                  document.getElementById('ip-count-badge').innerText = lang === 'fa' ? (tCfg + ' کانفیگ تولید شد') : (tCfg + ' Configs Active');
              } catch(e) { console.error(e); }
          }

          function logout() {
              localStorage.removeItem('nahan_session');
              window.location.reload();
          }

          function showAddNodeModal() {
              document.getElementById('modal-add-node').classList.remove('hidden');
              document.getElementById('add-node-url').value = '';
              document.getElementById('add-node-apikey').value = '';
              document.getElementById('add-node-url').focus();
          }

          function commitAddNode() {
              const url = document.getElementById('add-node-url').value.trim();
              const apiKey = document.getElementById('add-node-apikey').value.trim();
              if (!url || !apiKey) {
                  const t = i18n[lang] || i18n['en'];
                  alert(t.add_node_invalid || 'Please enter both URL and API Key.');
                  return;
              }
              if (!window.nahanConfig) window.nahanConfig = {};
              if (!Array.isArray(window.nahanConfig.linkedPanels)) window.nahanConfig.linkedPanels = [];
              window.nahanConfig.linkedPanels.push({ url, apiKey });
              document.getElementById('modal-add-node').classList.add('hidden');
              document.getElementById('add-node-url').value = '';
              document.getElementById('add-node-apikey').value = '';
              renderLinkedNodes();
              doSaveDirectly();
          }

          function removeLinkedNode(idx) {
              if (!window.nahanConfig || !Array.isArray(window.nahanConfig.linkedPanels)) return;
              window.nahanConfig.linkedPanels.splice(idx, 1);
              renderLinkedNodes();
          }

          function renderLinkedNodes() {
              const list = document.getElementById('linked-nodes-list');
              if (!list) return;
              const panels = (window.nahanConfig && Array.isArray(window.nahanConfig.linkedPanels)) ? window.nahanConfig.linkedPanels : [];
              if (panels.length === 0) {
                  list.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-500 italic">' + ((i18n[lang] || i18n['en']).no_nodes_advanced || 'No external nodes added yet.') + '</p>';
                  return;
              }
              list.innerHTML = panels.map((p, i) => `
                  <div class="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-darkborder/50">
                      <div class="min-w-0 flex-1">
                          <p class="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 truncate">${p.url}</p>
                          <p class="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">${p.apiKey.substring(0, 12)}...</p>
                      </div>
                      <button onclick="removeLinkedNode(${i})" class="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0" title="Remove">
                          <svg class="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>
              `).join('');
          }

          function renderFakeConfigs(configs) {
              const list = document.getElementById('fake-configs-list');
              if (!list) return;
              list.innerHTML = '';
              if (!configs || configs.length === 0) {
                  configs = [
                      { name: "📊 {usage}", enabled: true },
                      { name: "📅 {expiry}", enabled: true }
                  ];
              }
              configs.forEach((cfg, idx) => {
                  const item = document.createElement('div');
                  item.className = 'flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-darkborder/50';
                  item.innerHTML = `
                      <div class="relative inline-flex items-center cursor-pointer shrink-0">
                          <input type="checkbox" ${cfg.enabled ? 'checked' : ''} onchange="toggleFakeConfig(${idx})" class="sr-only peer">
                          <div class="w-9 h-5 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[var(--color-surface)] after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <input type="text" value="${cfg.name.replace(/"/g, '&quot;')}" onchange="updateFakeConfigName(${idx}, this.value)" class="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-darkborder bg-[var(--color-surface)] dark:bg-slate-900 focus:border-primary outline-none text-sm font-mono">
                      <button onclick="moveFakeConfig(${idx}, -1)" class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0" title="Move up">
                          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                      </button>
                      <button onclick="moveFakeConfig(${idx}, 1)" class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0" title="Move down">
                          <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      <button onclick="removeFakeConfig(${idx})" class="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0" title="Remove">
                          <svg class="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  `;
                  list.appendChild(item);
              });
              window._fakeConfigs = configs;
          }

          function addFakeConfig() {
              if (!window._fakeConfigs) window._fakeConfigs = [];
              window._fakeConfigs.push({ name: "Custom Entry", enabled: true });
              renderFakeConfigs(window._fakeConfigs);
          }

          function removeFakeConfig(idx) {
              if (!window._fakeConfigs) return;
              window._fakeConfigs.splice(idx, 1);
              renderFakeConfigs(window._fakeConfigs);
          }

          function toggleFakeConfig(idx) {
              if (!window._fakeConfigs || !window._fakeConfigs[idx]) return;
              window._fakeConfigs[idx].enabled = !window._fakeConfigs[idx].enabled;
          }

          function updateFakeConfigName(idx, value) {
              if (!window._fakeConfigs || !window._fakeConfigs[idx]) return;
              window._fakeConfigs[idx].name = value;
          }

          function moveFakeConfig(idx, direction) {
              if (!window._fakeConfigs) return;
              const newIdx = idx + direction;
              if (newIdx < 0 || newIdx >= window._fakeConfigs.length) return;
              const temp = window._fakeConfigs[idx];
              window._fakeConfigs[idx] = window._fakeConfigs[newIdx];
              window._fakeConfigs[newIdx] = temp;
              renderFakeConfigs(window._fakeConfigs);
          }

          function getFakeConfigsFromUI() {
              return window._fakeConfigs || [
                  { name: "📊 {usage}", enabled: true },
                  { name: "📅 {expiry}", enabled: true }
              ];
          }

          // Export active page inputs configuration
          function exportConfig() {
              const el = id => document.getElementById(id);
              const payload = {
                  mode: el('cfg-proto').value, socketPorts: Array.from(el('cfg-port').selectedOptions).map(o=>o.value).join(','), deviceId: el('cfg-uuid').value,
                  apiRoute: el('cfg-path').value, masterKey: el('cfg-pass').value, agent: el('cfg-fp').value,
                   resolveIp: el('cfg-dns').value, customDns: el('cfg-custom-dns').value ? el('cfg-custom-dns').value : 'https://cloudflare-dns.com/dns-query', cleanIps: el('cfg-ips').value, maintenanceHost: el('cfg-fake') ? el('cfg-fake').value : '', backupRelay: el('cfg-relay').value, customRouting: el('cfg-custom-routing') ? el('cfg-custom-routing').value : '', upstreamUri: el('cfg-upstream') ? el('cfg-upstream').value.trim() : '', nat64Prefix: el('cfg-nat64') ? el('cfg-nat64').value : '', enableDirectConfigs: el('cfg-direct-configs') ? el('cfg-direct-configs').checked : false, syncApiKey: el('cf...ey') ? el('cfg-sync-api-key').value.trim() : '', autoUpdate: el('cfg-auto-update') ? el('cfg-auto-update').checked : false, autoUpdateFormat: document.querySelector('input[name="auto-update-format"]:checked')?.value || 'normal',
                   enableOpt1: el('cfg-tfo').checked, enableOpt2: el('cfg-ech').checked,
                   tgToken: el('cfg-tg-token').value, tgChatId: el('cfg-tg-chat').value, tgAdminId: el('cfg-tg-admin').value,
                  cfAccountId: el('cfg-cf-acc').value, cfApiToken: el('cfg-cf-token').value,
                  cfWorkerName: el('cfg-cf-worker').value,
                  isPaused: el('cfg-pause').checked, silentAlerts: el('cfg-silent').checked,
                  githubRepo: el('cfg-github-repo').value,
                  subUserAgent: el('cfg-sub-ua').value,
                  customPanelUrl: el('cfg-custom-panel-url').value,
                  fakeConfigs: getFakeConfigsFromUI(),
                  linkedPanels: (window.nahanConfig && Array.isArray(window.nahanConfig.linkedPanels)) ? window.nahanConfig.linkedPanels : []
              };
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
              const dlAnchor = document.createElement('a');
              dlAnchor.setAttribute("href", dataStr);
              dlAnchor.setAttribute("download", "nahan-gateway-config.json");
              document.body.appendChild(dlAnchor);
              dlAnchor.click();
              dlAnchor.remove();
          }

          // Import backup json to overwrite config inputs
          function importConfig(event) {
              const file = event.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = function(e) {
                  try {
                      const conf = JSON.parse(e.target.result);
                      const mapId = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
                      mapId('cfg-proto', conf.mode);
                      let pList = (conf.socketPorts || conf.socketPort || '443').split(',');
                      Array.from(document.getElementById('cfg-port').options).forEach(o => o.selected = pList.includes(o.value));
                      mapId('cfg-uuid', conf.deviceId);
                      mapId('cfg-path', conf.apiRoute);
                      mapId('cfg-pass', conf.masterKey);
                      mapId('cfg-fp', conf.agent);
                      mapId('cfg-dns', conf.resolveIp);
                      mapId('cfg-custom-dns', conf.customDns);
                      mapId('cfg-ips', conf.cleanIps);
                      mapId('cfg-fake', conf.maintenanceHost);
                      mapId('cfg-relay', 'cfg-custom-routing', conf.backupRelay);
                      mapId('cfg-custom-routing', conf.customRouting);
                      if(document.getElementById('cfg-upstream')) document.getElementById('cfg-upstream').value = conf.upstreamUri || '';

                      mapId('cfg-tg-token', conf.tgToken);
                      mapId('cfg-tg-chat', conf.tgChatId);
                      mapId('cfg-tg-admin', conf.tgAdminId);
                      mapId('cfg-cf-acc', conf.cfAccountId);
                      mapId('cfg-cf-token', conf.cfApiToken);
                      mapId('cfg-cf-worker', conf.cfWorkerName);
                      mapId('cfg-github-repo', conf.githubRepo);
                      mapId('cfg-sub-ua', conf.subUserAgent);
                      mapId('cfg-custom-panel-url', conf.customPanelUrl);

                      if (conf.enableOpt1 !== undefined) document.getElementById('cfg-tfo').checked = conf.enableOpt1;
                      if (conf.enableOpt2 !== undefined) document.getElementById('cfg-ech').checked = conf.enableOpt2;
                      if (conf.isPaused !== undefined) document.getElementById('cfg-pause').checked = conf.isPaused;
                      if (conf.silentAlerts !== undefined) document.getElementById('cfg-silent').checked = conf.silentAlerts;
                      mapId('cfg-nat64', conf.nat64Prefix);
                      if (conf.enableDirectConfigs !== undefined && document.getElementById('cfg-direct-configs')) document.getElementById('cfg-direct-configs').checked = conf.enableDirectConfigs;
                      if (document.getElementById('cfg-sync-api-key')) document.getElementById('cfg-sync-api-key').value = conf.syncApiKey || '';
                      if (conf.autoUpdate !== undefined && document.getElementById('cfg-auto-update')) {
                          document.getElementById('cfg-auto-update').checked = conf.autoUpdate;
                          const wrap = document.getElementById('auto-update-format-wrap');
                          if (wrap) wrap.classList.toggle('hidden', !conf.autoUpdate);
                      }
                      if (conf.autoUpdateFormat) {
                          const radio = document.querySelector(`input[name="auto-update-format"][value="${conf.autoUpdateFormat}"]`);
                          if (radio) radio.checked = true;
                      }

                      if (conf.fakeConfigs) renderFakeConfigs(conf.fakeConfigs);
                      if (conf.linkedPanels) {
                          if (!window.nahanConfig) window.nahanConfig = {};
                          window.nahanConfig.linkedPanels = conf.linkedPanels;
                          renderLinkedNodes();
                      }

                      updateUI();
                      alert(lang === 'fa' ? 'پیکربندی با موفقیت وارد شد! روی ذخیره کلیک کنید.' : 'Configuration parsed! Click save to write changes.');
                  } catch(err) {
                      alert(lang === 'fa' ? 'فایل نامعتبر است!' : 'Invalid configuration file!');
                  }
              };
              reader.readAsText(file);
          }

          // Browser-level latency check diagnostics
          async function runPingTest() {
              const rawIps = document.getElementById('cfg-ips').value || "";
              let ipsList = rawIps.replace(/,/g, '\n').replace(/;/g, '\n').split('\n').map(s=>s.trim()).filter(Boolean);
              let targetIP = ipsList.length > 0 ? ipsList[0] : (hostName.endsWith('.pages.dev') ? 'time.is' : hostName);

              const resultsDiv = document.getElementById('ping-results');
              resultsDiv.classList.remove('hidden');

              document.getElementById('ping-target').textContent = targetIP;
              document.getElementById('ping-time').textContent = 'Testing...';
              document.getElementById('ping-status').textContent = 'Dialing...';
              document.getElementById('ping-port').textContent = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');

              const startTime = performance.now();
              try {
                  await fetch('https://' + targetIP + '/favicon.ico?cb=' + startTime, { mode: 'no-cors', cache: 'no-store' });
                  const duration = Math.round(performance.now() - startTime);
                  document.getElementById('ping-time').textContent = duration + ' ms';
                  document.getElementById('ping-status').className = "text-sm font-bold text-emerald-500";
                  document.getElementById('ping-status').textContent = "Success";
              } catch (err) {
                  const duration = Math.round(performance.now() - startTime);
                  if (duration < 1500) {
                      document.getElementById('ping-time').textContent = duration + ' ms';
                      document.getElementById('ping-status').className = "text-sm font-bold text-amber-500";
                      document.getElementById('ping-status').textContent = "Indirect-OK";
                  } else {
                      document.getElementById('ping-time').textContent = 'Timeout';
                      document.getElementById('ping-status').className = "text-sm font-bold text-red-500";
                      document.getElementById('ping-status').textContent = "Unreachable";
                  }
              }
          }

          function togglePortCheckbox(val, checked) {
              const sel = document.getElementById('cfg-port');
              const opt = Array.from(sel.options).find(o => o.value === val);
              if (opt) {
                  opt.selected = checked;
                  sel.dispatchEvent(new Event('change'));
              }
          }
          function syncCheckboxesFromSelect() {
              const sel = document.getElementById('cfg-port');
              const ports = Array.from(sel.selectedOptions).map(o => o.value);
              const checkboxes = document.querySelectorAll('#port-checkboxes-container input[type="checkbox"]');
              checkboxes.forEach(cb => {
                  cb.checked = ports.includes(cb.value);
              });
          }

          async function doLogin(silent = false) {
              const btn = document.querySelector('button[onclick="doLogin()"]');
              const origText = btn.innerText;
              if(!silent) btn.innerText = "...";
              try {
                  const pass = silent ? sessionKey : document.getElementById('pwd').value;
                  const res = await fetch(baseRoute + '/api/auth', { method: 'POST', body: JSON.stringify({ key: pass }) });
                  const data = await res.json();
                  if (data.success) {
                      sessionKey = pass; localUUID = data.deviceId;
                      localStorage.setItem('nahan_session', JSON.stringify({ key: pass, expiry: Date.now() + 30 * 60 * 1000 }));

                      document.getElementById('login-box').classList.add('hidden');
                      document.getElementById('dash-box').classList.remove('hidden');
                      document.getElementById('dash-box').classList.add('flex');
                      document.getElementById('btn-logout-mob').classList.remove('hidden');
                      document.body.classList.add('logged-in');

                      document.getElementById('net-ip').textContent = data.network.ip;
                      document.getElementById('net-colo').textContent = data.network.colo;
                      document.getElementById('net-loc').textContent = data.network.loc;
                      const hdrColo = document.getElementById('hdr-colo');
                      if (hdrColo) hdrColo.textContent = `${data.network.colo || 'Edge'} (${data.network.ip || ''})`;
                      const conf = data.config;
                      if (conf && conf.slaveNodes && conf.slaveNodes.trim().length > 0) {
                          if (!conf.linkedPanels) conf.linkedPanels = [];
                          var nodes = conf.slaveNodes.split(/[\r\n,;]+/).map(function(s){return s.trim();}).filter(Boolean);
                          var syncKey = conf.syncApiKey || '';
                          nodes.forEach(function(node) {
                              var cleanNode = node.replace(/^[a-zA-Z]+:\/\//, "").split("/")[0].split("@").pop().split(":")[0].toLowerCase();
                              var exists = conf.linkedPanels.some(function(p) {
                                  if (!p || !p.url) return false;
                                  var cleanUrl = p.url.replace(/^[a-zA-Z]+:\/\//, "").split("/")[0].split("@").pop().split(":")[0].toLowerCase();
                                  return cleanUrl === cleanNode;
                              });
                              if (!exists) {
                                  conf.linkedPanels.push({ url: node, apiKey: syncKey });
                              }
                          });
                          conf.slaveNodes = '';
                      }
                      document.getElementById('cfg-proto').value = conf.mode || 'alpha';
                      let pList = (conf.socketPorts || conf.socketPort || '443').split(',');
                      Array.from(document.getElementById('cfg-port').options).forEach(o => o.selected = pList.includes(o.value));
                      syncCheckboxesFromSelect();
                      document.getElementById('cfg-uuid').value = conf.deviceId || '';
                      document.getElementById('cfg-path').value = conf.apiRoute || '';
                      document.getElementById('cfg-pass').value = conf.masterKey || '';
                      document.getElementById('cfg-fp').value = conf.agent || 'chrome';
                      document.getElementById('cfg-dns').value = conf.resolveIp || '';
                      document.getElementById('cfg-custom-dns').value = conf.customDns || 'https://cloudflare-dns.com/dns-query';
                      document.getElementById('cfg-ips').value = conf.cleanIps || '';
                      if(document.getElementById('cfg-custom-routing')) document.getElementById('cfg-custom-routing').value = conf.customRouting || '';
                      if(document.getElementById('cfg-upstream')) document.getElementById('cfg-upstream').value = conf.upstreamUri || '';

                      if (document.getElementById('cfg-fake')) document.getElementById('cfg-fake').value = conf.maintenanceHost || '';
                       document.getElementById('cfg-relay').value = conf.backupRelay || '';
                       if (document.getElementById('cfg-nat64')) document.getElementById('cfg-nat64').value = conf.nat64Prefix || '';
                       if (document.getElementById('cfg-direct-configs')) document.getElementById('cfg-direct-configs').checked = conf.enableDirectConfigs || false;
                       if (document.getElementById('cfg-sync-api-key')) document.getElementById('cfg-sync-api-key').value = conf.syncApiKey || '';
                       if (document.getElementById('cfg-auto-update')) {
                           document.getElementById('cfg-auto-update').checked = conf.autoUpdate || false;
                           const wrap = document.getElementById('auto-update-format-wrap');
                           if (wrap) wrap.classList.toggle('hidden', !conf.autoUpdate);
                       }
                       if (conf.autoUpdateFormat) {
                           const radio = document.querySelector(`input[name="auto-update-format"][value="${conf.autoUpdateFormat}"]`);
                           if (radio) radio.checked = true;
                       }
                      document.getElementById('cfg-tfo').checked = conf.enableOpt1 || false;
                      document.getElementById('cfg-ech').checked = conf.enableOpt2 || false;
                      document.getElementById('cfg-tg-token').value = conf.tgToken || '';
                      document.getElementById('cfg-tg-chat').value = conf.tgChatId || '';
                      document.getElementById('cfg-tg-admin').value = conf.tgAdminId || '';
                      document.getElementById('cfg-cf-acc').value = conf.cfAccountId || '';
                      document.getElementById('cfg-cf-token').value = conf.cfApiToken || '';
                      document.getElementById('cfg-cf-worker').value = conf.cfWorkerName || '';
                      document.getElementById('cfg-pause').checked = conf.isPaused || false;
                      document.getElementById('cfg-silent').checked = conf.silentAlerts || false;
                      document.getElementById('cfg-github-repo').value = conf.githubRepo || 'itsyebekhe/nahan';
                      document.getElementById('cfg-name-strategy').value = conf.nameStrategy || 'default';
                      document.getElementById('cfg-name-prefix').value = conf.namePrefix || 'Core';
                      document.getElementById('cfg-sub-ua').value = conf.subUserAgent || '';
                      document.getElementById('cfg-custom-panel-url').value = conf.customPanelUrl || '';
                      renderFakeConfigs(conf.fakeConfigs || [
                          { name: "📊 {usage}", enabled: true },
                          { name: "📅 {expiry}", enabled: true }
                      ]);

                      window.nahanConfig = JSON.parse(JSON.stringify(conf));
                      window.nahanUsage = data.sysUsage || {};
                      window.nahanLiveUsage = data.usage || {};
                      window.nahanProfiles = data.profiles || [];
                      renderUsersTable();
                      renderLinkedNodes();
                      try { checkUpdate(); } catch(ue) { console.error(ue); }
                       if (!silent) switchTab('overview');

                      ['cfg-proto','cfg-port','cfg-fp','cfg-ips','cfg-path', 'cfg-relay', 'cfg-custom-routing', 'cfg-name-strategy', 'cfg-name-prefix', 'cfg-sub-ua', 'cfg-custom-panel-url'].forEach(id => {
                          const el = document.getElementById(id);
                          if(el) { el.addEventListener('input', updateUI); el.addEventListener('change', updateUI); }
                      });
                      ['cfg-ech','cfg-tfo'].forEach(id => {
                          const el = document.getElementById(id);
                          if(el) el.addEventListener('change', updateUI);
                      });
                      const autoUpdateEl = document.getElementById('cfg-auto-update');
                      if (autoUpdateEl) {
                          autoUpdateEl.addEventListener('change', () => {
                              const wrap = document.getElementById('auto-update-format-wrap');
                              if (wrap) wrap.classList.toggle('hidden', !autoUpdateEl.checked);
                          });
                      }
                const pCont = document.getElementById('dyn-profiles-container');
                let profilesHtml = '';
                data.profiles.forEach(p => {
                            const isDef = p.name === 'Default';
                            let html = `<div class="bg-[var(--color-surface)]  rounded-3xl shadow-sm border border-slate-200 dark:border-darkborder relative mb-4 break-inside-avoid inline-block w-full" data-accordion>
    <div class="absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
    <button onclick="toggleAccordion(this)" class="w-full flex items-center justify-between p-5 md:p-6">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            <svg class="w-5 h-5 me-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            ${p.name}
        </h3>
        <div class="flex items-center gap-2">
            ${isDef ? '<span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase">Master</span>' : ''}
            <svg class="w-4 h-4 text-slate-400 accordion-icon transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </button>
    <div class="transition-all duration-300" style="max-height:0;overflow:hidden;" data-accordion-content>
        <div class="space-y-3 px-5 md:px-6 pb-5 md:pb-6">
            <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">UUID</label>
                <div class="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-darkborder px-3 py-2 rounded-lg text-xs font-mono text-slate-500">${p.id}</div>
            </div>
            <div class="relative">
                <label class="block text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Universal Sync URL</label>
                <input type="text" id="sync-${p.id}" readonly value="${p.sync}" class="w-full bg-[var(--color-bg)] border border-slate-200 dark:border-darkborder px-4 py-2.5 rounded-xl text-xs outline-none font-mono text-slate-600 dark:text-slate-400 truncate pe-12">
                <button data-id="${p.id}" onclick="handleCopy(this)" class="absolute bottom-1 end-1 text-primary p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"><svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
            </div>
            <div class="mt-2">
                <button data-id="${p.id}" data-name="${p.name}" onclick="handleQR(this)" class="w-full flex items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-darkborder rounded-xl transition-all gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m0 11v1m5-7h1m-13 0h1m2-5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-8zM9 9h1m0 0v1m2-1h1m0 0v1"></path></svg>
                    <span data-i18n="show_qr">Show QR Code</span>
                </button>
<div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
    <a href="v2rayng://install-sub?url=${encodeURIComponent(p.sync + (p.sync.includes('?') ? '&flag=base64' : '?flag=base64'))}" class="text-center p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:bg-indigo-100 transition-colors">v2rayNG</a>
    <a href="shadowrocket://add/sub://${btoa(p.sync)}" class="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold hover:bg-blue-100 transition-colors">Shadowrocket</a>
    <a href="streisand://import/${p.sync}" class="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-100 transition-colors">Streisand</a>
    <a href="v2ray://install-sub?url=${encodeURIComponent(p.sync)}" class="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold hover:bg-purple-100 transition-colors">v2rayN</a>
</div>

            </div>
        </div>
    </div>
</div>`;
                         profilesHtml += html;
                      });
                      pCont.innerHTML = profilesHtml;



                      // Inject usage metrics table
                      const usageCont = document.getElementById('usage-metrics-container');
                      if(usageCont && data.usage) {
                          let usageHtml = '';
                          data.profiles.forEach(p => {
                              let hash = p.id.replace(/-/g, '').toLowerCase();
                              let use = data.usage[hash];
                              if(use) {
                                  let timeStr = new Date(use.last).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
                                  usageHtml += `<div class="flex items-center justify-between p-3 border-b border-slate-100 dark:border-darkborder/50 last:border-0"><div class="flex flex-col"><span class="text-sm font-bold text-slate-700 dark:text-white">${p.name}</span><span class="text-[10px] text-slate-400 font-mono">${p.id.split('-')[0]}...</span></div><div class="flex flex-col items-end"><span class="text-xs font-bold text-emerald-500">${use.connects} Conns</span><span class="text-[10px] text-slate-400">${timeStr}</span></div></div>`;
                              }
                          });
                          usageCont.innerHTML = usageHtml || '<p class="text-xs text-slate-400 text-center py-4">' + (i18n[lang]?.no_active_conn || 'No active connection data yet.') + '</p>';
                      }

                      updateUI();
                  } else {
                      if(!silent) { document.getElementById('err-msg').classList.remove('hidden'); btn.innerText = origText; }
                      else { localStorage.removeItem('nahan_session'); }
                  }
              } catch (err) { if(!silent) btn.innerText = origText; }
          }

          async function doSave() {
              const el = id => document.getElementById(id);
              const prevApiRoute = (window.nahanConfig && window.nahanConfig.apiRoute) || baseRoute.replace(/^\//, '');
              const payload = {
                  key: sessionKey,
                  config: {
                      mode: el('cfg-proto').value, socketPorts: Array.from(el('cfg-port').selectedOptions).map(o=>o.value).join(','), deviceId: el('cfg-uuid').value,
                      apiRoute: el('cfg-path').value, masterKey: el('cfg-pass').value, agent: el('cfg-fp').value,
                      resolveIp: el('cfg-dns').value, customDns: el('cfg-custom-dns') ? el('cfg-custom-dns').value : 'https://cloudflare-dns.com/dns-query', cleanIps: el('cfg-ips').value, maintenanceHost: el('cfg-fake') ? el('cfg-fake').value : '', backupRelay: el('cfg-relay').value, customRouting: el('cfg-custom-routing') ? el('cfg-custom-routing').value : '', upstreamUri: el('cfg-upstream') ? el('cfg-upstream').value.trim() : '', nat64Prefix: el('cfg-nat64') ? el('cfg-nat64').value : '', enableDirectConfigs: el('cfg-direct-configs') ? el('cfg-direct-configs').checked : false, syncApiKey: el('cfg-sync-api-key') ? el('cfg-sync-api-key').value.trim() : '', autoUpdate: el('cfg-auto-update') ? el('cfg-auto-update').checked : false, autoUpdateFormat: document.querySelector('input[name="auto-update-format"]:checked')?.value || 'normal',
                                            enableOpt1: el('cfg-tfo').checked, enableOpt2: el('cfg-ech').checked,
                                            tgToken: el('cfg-tg-token').value, tgChatId: el('cfg-tg-chat').value, tgAdminId: el('cfg-tg-admin').value,
                                            cfAccountId: el('cfg-cf-acc').value, cfApiToken: el('cfg-cf-token').value,
                                            cfWorkerName: el('cfg-cf-worker').value,
                                            isPaused: el('cfg-pause').checked, silentAlerts: el('cfg-silent').checked,
                                            githubRepo: el('cfg-github-repo').value,
                                            subUserAgent: el('cfg-sub-ua').value,
                                            customPanelUrl: el('cfg-custom-panel-url').value,
                                            nameStrategy: el('cfg-name-strategy').value,
                                            namePrefix: el('cfg-name-prefix').value,
                                            fakeConfigs: getFakeConfigsFromUI(),
                                            slaveNodes: '',
                                            linkedPanels: (window.nahanConfig && Array.isArray(window.nahanConfig.linkedPanels)) ? window.nahanConfig.linkedPanels : []
                                        }
                                    };
                                              //update user port after change global
                                           const globalPorts = (payload.config.socketPorts || '443').split(',').map(s=>s.trim()).filter(Boolean);
                                           payload.config.users = (window.nahanConfig.users || []).map(u => {
                     if (!u.userPorts) return u;
                        const filtered = u.userPorts.split(',').map(s=>s.trim()).filter(p => globalPorts.includes(p));
                      u.userPorts = filtered.length ? filtered.join(',') : globalPorts[0];
                          return u;
                          });
              const stat = el('save-status'); stat.textContent = i18n[lang].msg_saving; stat.className = "text-sm font-bold text-primary animate-pulse md:me-4";
              try {
                  const res = await fetch(baseRoute + '/api/sync', { method: 'POST', body: JSON.stringify(payload) });
                  const data = await res.json();
                  if (data.success) {
                      stat.textContent = i18n[lang].msg_saved; stat.className = "text-sm font-bold text-emerald-500 md:me-4";
                      if (Array.isArray(window.nahanConfig?.linkedPanels) && window.nahanConfig.linkedPanels.length > 0) {
                          const sc = payload.config;
                          const slaveCfg = { ...sc };
                          delete slaveCfg.tgToken; delete slaveCfg.tgChatId; delete slaveCfg.tgAdminId; delete slaveCfg.tgBotLang;
                          delete slaveCfg.cfAccountId; delete slaveCfg.cfApiToken; delete slaveCfg.cfWorkerName;
                          delete slaveCfg.panelApiKeys; delete slaveCfg.linkedPanels; delete slaveCfg.slaveNodes; delete slaveCfg.syncApiKey;
                          delete slaveCfg.masterKey; delete slaveCfg.apiRoute; delete slaveCfg.deviceId; delete slaveCfg.hubPanelUrl; delete slaveCfg.githubRepo; delete slaveCfg.customPanelUrl;
                          const synced = new Set();
                          window.nahanConfig.linkedPanels.forEach(p => {
                              if (!p || !p.url || !p.apiKey) return;
                              const h = p.url.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                              if (!h || synced.has(h.toLowerCase())) return;
                              synced.add(h.toLowerCase());
                              fetch('https://' + h + '/' + encodeURIComponent(sc.apiRoute || 'sync') + '/api/sync', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ key: p.apiKey, config: slaveCfg, fromMaster: true })
                              }).then(r => { if (!r.ok) console.error('Sync to ' + h + ' failed: HTTP ' + r.status); }).catch(e => { console.error('Sync to ' + h + ' error:', e.message); });
                          });
                      }
                      // Update local config with saved values
                      Object.assign(window.nahanConfig, payload.config);
                      const newApiRoute = data.newRoute || payload.config.apiRoute;
                      if (newApiRoute && newApiRoute !== prevApiRoute) {
                          // API route changed — must redirect to new URL
                          baseRoute = '/' + newApiRoute;
                          setTimeout(() => { window.location.href = '/' + newApiRoute + '/dash'; }, 1000);
                      } else {
                          // Same route — just refresh data silently, no reload
                          baseRoute = '/' + (newApiRoute || prevApiRoute);
                          doLogin(true);
                          setTimeout(() => { stat.textContent = ''; }, 2500);
                      }
                  } else { stat.textContent = i18n[lang].msg_err; stat.className = "text-sm font-bold text-red-500 md:me-4"; }
              } catch(e) { stat.textContent = i18n[lang].msg_err; stat.className = "text-sm font-bold text-red-500 md:me-4"; }
          }

          document.getElementById('pwd').addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });

