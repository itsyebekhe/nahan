          let lang = localStorage.getItem('lang') || 'fa';
          let sessionKey = "", baseRoute = window.location.pathname.split('/dash')[0];
          let hostName = window.location.hostname, localUUID = "";

          window.addEventListener('DOMContentLoaded', () => {
              let savedSession = localStorage.getItem('nahan_session');
              if (savedSession) {
                  try {
                      let parsed = JSON.parse(savedSession);
                      if (parsed && parsed.expiry && Date.now() < parsed.expiry) {
                           sessionKey = parsed.key;
                           doLogin(true).then(() => loadDashboard());
                      } else {
                          localStorage.removeItem('nahan_session');
                      }
                  } catch(e){}
              }
              checkVersionPopup();
          });

          function applyLang() {
              document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'; document.documentElement.lang = lang;
              document.getElementById('lang-toggle').innerText = lang === 'fa' ? 'EN' : 'فا';
              document.querySelectorAll('[data-i18n]').forEach(el => {
                  const key = el.getAttribute('data-i18n');
                  if (i18n[lang] && i18n[lang][key] !== undefined && i18n[lang][key] !== null) {
                      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                          el.placeholder = i18n[lang][key];
                      } else {
                          if (key.startsWith('html_') || /<[a-z][\s\S]*>/i.test(i18n[lang][key])) {
                              el.innerHTML = i18n[lang][key];
                          } else {
                              el.innerText = i18n[lang][key];
                          }
                      }
                  }
              });
              document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                  const key = el.getAttribute('data-i18n-placeholder');
                  if (i18n[lang] && i18n[lang][key] !== undefined && i18n[lang][key] !== null) {
                      el.placeholder = i18n[lang][key];
                  }
              });
              const gbUnit = i18n[lang]?.ov_gb_unit || 'GB';
              ['ov-total-traffic','ov-today-traffic'].forEach(id => {
                  const el = document.getElementById(id);
                  if (el && el.textContent.trim() === '- GB') el.textContent = '- ' + gbUnit;
              });
              const statTrafficEl = document.getElementById('stat-total-traffic');
              if (statTrafficEl && statTrafficEl.textContent.trim() === '0 GB') statTrafficEl.textContent = '0 ' + gbUnit;
          }
          function toggleLang() {
              lang = lang === 'fa' ? 'en' : 'fa';
              localStorage.setItem('lang', lang);
              applyLang();
              updateTitle();
              updateUI();
              try {
                  const m = document.getElementById('modal-version-update');
                  if (m && !m.classList.contains('hidden')) {
                      renderChangelog(CURRENT_VERSION);
                  }
              } catch(e){}
              try { renderUsersTable(); } catch(e){}
              try { renderLinkedNodes(); } catch(e){}
              try { renderFakeConfigs(window._fakeConfigs); } catch(e){}
          }
          applyLang();

          if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
          } else {
              document.documentElement.classList.remove('dark');
          }

          function toggleTheme() {
              document.documentElement.classList.toggle('dark');
              localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
          }

          function checkVersionPopup() {
              const popupKey = `nahan_shown_v__CURRENT_VERSION__`;
              if (!localStorage.getItem(popupKey)) {
                  setTimeout(() => {
                      const badge = document.getElementById('modal-version-badge');
                      if (badge) badge.textContent = 'v' + CURRENT_VERSION;
                      renderChangelog(CURRENT_VERSION);
                      const m = document.getElementById('modal-version-update');
                      if (m) {
                          m.classList.remove('hidden');
                          m.classList.add('flex');
                      }
                  }, 800);
              }
          }

          function closeVersionModal() {
              const m = document.getElementById('modal-version-update');
              if (m) {
                  m.classList.add('hidden');
                  m.classList.remove('flex');
              }
              const popupKey = `nahan_shown_v__CURRENT_VERSION__`;
              localStorage.setItem(popupKey, 'true');
          }

          function updateTitle() {
              const activeTab = document.querySelector('.nav-item.active span') || document.querySelector('.mobile-nav-item.active span');
              if(activeTab) {
                  const titleEl = document.getElementById('view-title');
                  if (titleEl) titleEl.innerText = activeTab.innerText;
              }
          }

          let dashboardInterval = null;
          let networkInterval = null;
