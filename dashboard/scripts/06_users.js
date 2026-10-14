          function renderUsersTable() {
              const tbl = document.getElementById('tbl-users');
              if(!tbl) return;
              let users = window.nahanConfig?.users || [];
              let usage = window.nahanUsage || {};

              // Update user quota indicators
              const userCount = users.length;
              const sidebarBadge = document.getElementById('sidebar-user-limit-badge');
              if (sidebarBadge) {
                  sidebarBadge.textContent = `${userCount}/5`;
                  if (userCount >= 5) {
                      sidebarBadge.className = 'ms-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/20';
                  } else {
                      sidebarBadge.className = 'ms-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
                  }
              }
              const mobBadge = document.getElementById('mob-user-badge');
              if (mobBadge) mobBadge.textContent = userCount;

              const ovCapText = document.getElementById('overview-user-cap-text');
              if (ovCapText) ovCapText.textContent = `${userCount} / 5 Active`;
              const ovCapBar = document.getElementById('overview-user-cap-bar');
              if (ovCapBar) {
                  ovCapBar.style.width = Math.min(100, (userCount / 5) * 100) + '%';
                  ovCapBar.className = (userCount >= 5 ? 'bg-red-500' : 'bg-indigo-500') + ' h-full rounded-full transition-all duration-500';
              }

              const usersQuotaPill = document.getElementById('users-quota-pill');
              if (usersQuotaPill) {
                  usersQuotaPill.textContent = userCount >= 5 ? (lang === 'fa' ? 'سقف ۵ کاربر تکمیل شد' : '5 / 5 Limit Reached') : `${userCount} / 5 Slots`;
                  usersQuotaPill.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (userCount >= 5 ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white');
              }
              const usersQuotaBar = document.getElementById('users-quota-bar');
              if (usersQuotaBar) {
                  usersQuotaBar.style.width = Math.min(100, (userCount / 5) * 100) + '%';
                  usersQuotaBar.className = (userCount >= 5 ? 'bg-red-500' : 'bg-indigo-500') + ' h-full rounded-full transition-all duration-500';
              }

              const usersAddBtn = document.getElementById('users-add-btn');
              if (usersAddBtn) {
                  if (userCount >= 5) {
                      usersAddBtn.classList.add('opacity-50', 'cursor-not-allowed');
                      usersAddBtn.title = lang === 'fa' ? 'سقف مجاز ایجاد ۵ کاربر تکمیل شده است' : 'User limit of 5 reached';
                  } else {
                      usersAddBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                      usersAddBtn.title = '';
                  }
              }

              // Calculate stats metrics
              let totalUsersVal = users.length;
              let activeSubscribers = users.filter(u => !u.isPaused && (!u.expiryMs || Date.now() <= u.expiryMs)).length;
              let autoDisabledCount = users.filter(u => u.isPaused && u.disabledReason).length;
              let pausedSubscribers = users.filter(u => u.isPaused && !u.disabledReason).length;
              let expiredCount = users.filter(u => u.expiryMs && Date.now() > u.expiryMs && !u.isPaused).length;
              let totalReqsSum = 0;
              users.forEach(u => {
                  let sysU = usage[u.id.replace(/-/g,'').toLowerCase()] || {reqs: 0};
                  totalReqsSum += (sysU.reqs || 0);
              });
              let totalGBSum = (totalReqsSum / 6000).toFixed(2);

              // Update stats elements in DOM if they exist
              const totalUsersEl = document.getElementById('stat-total-users');
              if (totalUsersEl) totalUsersEl.textContent = totalUsersVal;
              const activeUsersEl = document.getElementById('stat-active-users');
              if (activeUsersEl) activeUsersEl.textContent = `${activeSubscribers} / ${pausedSubscribers}`;
              const totalTrafficEl = document.getElementById('stat-total-traffic');
              if (totalTrafficEl) totalTrafficEl.textContent = `${totalGBSum} ${i18n[lang]?.ov_gb_unit || 'GB'}`;
              const autoDisabledEl = document.getElementById('stat-auto-disabled');
              if (autoDisabledEl) autoDisabledEl.textContent = autoDisabledCount;

              // Render Recently Disabled Users Panel
              const disabledPanel = document.getElementById('disabled-users-panel');
              const disabledList = document.getElementById('disabled-users-list');
              const disabledBadge = document.getElementById('disabled-panel-badge');
              if (disabledPanel && disabledList) {
                  const autoDisabledUsers = users.filter(u => u.isPaused && u.disabledReason)
                      .sort((a, b) => (b.disabledAt || 0) - (a.disabledAt || 0));
                  if (autoDisabledUsers.length > 0) {
                      disabledPanel.classList.remove('hidden');
                      if (disabledBadge) disabledBadge.textContent = autoDisabledUsers.length;
                      disabledList.innerHTML = autoDisabledUsers.map(u => {
                          let timeStr = u.disabledAt ? new Date(u.disabledAt).toLocaleString() : '-';
                          let reasonIcon = u.disabledReason.includes('Traffic') ? '📊' : (u.disabledReason.includes('Expiration') ? '📅' : '⚠️');
                          let btnLabel = lang === 'fa' ? 'فعال‌سازی مجدد' : 'Re-enable';
                          return `
                              <div class="flex items-center justify-between p-3 bg-[var(--color-surface)]/70 dark:bg-slate-800/50 rounded-xl border border-red-100 dark:border-red-800/20 hover:shadow-md transition-shadow">
                                  <div class="flex items-center gap-3 flex-1 min-w-0">
                                      <div class="text-lg">${reasonIcon}</div>
                                      <div class="min-w-0">
                                          <div class="text-sm font-bold text-slate-700 dark:text-white truncate">${u.name}</div>
                                          <div class="text-[11px] text-red-500 dark:text-red-400 font-medium">${u.disabledReason}</div>
                                          <div class="text-[10px] text-slate-400 mt-0.5">${timeStr}</div>
                                      </div>
                                  </div>
                                  <button onclick="togglePauseUser('${u.id}')" class="ml-3 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap">${btnLabel}</button>
                              </div>
                          `;
                      }).join('');
                  } else {
                      disabledPanel.classList.add('hidden');
                  }
              }

              // Apply Status Filter
              const statusFilter = document.getElementById('user-status-filter')?.value || 'all';
              const searchVal = document.getElementById('user-search-input')?.value.toLowerCase().trim() || '';
              let filteredUsers = users.filter(u => {
                  if (statusFilter === 'active' && (u.isPaused || (u.expiryMs && Date.now() > u.expiryMs))) return false;
                  if (statusFilter === 'paused' && (!u.isPaused || u.disabledReason)) return false;
                  if (statusFilter === 'auto-disabled' && !(u.isPaused && u.disabledReason)) return false;
                  return u.name.toLowerCase().includes(searchVal) || u.id.toLowerCase().includes(searchVal);
              });

              tbl.innerHTML = '';
              if (filteredUsers.length === 0) {
                  tbl.innerHTML = '<div class="col-span-full px-4 py-8 text-center text-slate-400 text-sm">' + (i18n[lang]?.no_matching_users || 'No matching subscribers found') + '</div>';
                  return;
              }

              // Alias users to the filtered list for downstream compatibility
              users = filteredUsers;
              if (users.length === 0) {
                  tbl.innerHTML = `<div class="col-span-full px-4 py-8 text-center text-slate-400 text-sm" data-i18n="no_users">${i18n[lang].no_users}</div>`;
                  return;
              }
              let tblHtml = '';
              users.forEach((u, i) => {
                  let sysU = usage[u.id.replace(/-/g,'').toLowerCase()] || {reqs: 0, dReqs: 0, lastDay: ''};
                  let userReqs = sysU.reqs || 0;
                  let userDReqs = sysU.lastDay === new Date().toISOString().split('T')[0] ? (sysU.dReqs || 0) : 0;

                  const unlimitedTxt = lang === 'fa' ? 'نامحدود' : 'Unlimited';
                  let limitTotalTxt = u.limitTotalReq ? u.limitTotalReq : unlimitedTxt;
                  let limitDailyTxt = u.limitDailyReq ? u.limitDailyReq : unlimitedTxt;

                  let perT = u.limitTotalReq ? Math.min(100, (userReqs / u.limitTotalReq) * 100).toFixed(1) + '%' : '-';
                  let perD = u.limitDailyReq ? Math.min(100, (userDReqs / u.limitDailyReq) * 100).toFixed(1) + '%' : '-';

                  let expTxt = unlimitedTxt;
                  let isExp = false;
                  if (u.expiryMs) {
                      let date = new Date(u.expiryMs);
                      expTxt = lang === 'fa' ? date.toLocaleDateString('fa-IR') : date.toLocaleDateString();
                      if (Date.now() > u.expiryMs) {
                          const expiredTxt = lang === 'fa' ? ' (منقضی شده)' : ' (Expired)';
                          expTxt += ` <span class="text-xs text-red-500 font-bold">${expiredTxt}</span>`;
                          isExp = true;
                      }
                  }

                  // Status badge
                  let isAutoDisabled = u.isPaused && u.disabledReason;
                  let statusBadge = '';
                  if (isAutoDisabled) {
                      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/30">${lang === 'fa' ? 'غیرفعال' : 'Disabled'}</span>`;
                  } else if (u.isPaused) {
                      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30">${lang === 'fa' ? 'متوقف' : 'Paused'}</span>`;
                  } else if (isExp) {
                      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/30">${lang === 'fa' ? 'منقضی' : 'Expired'}</span>`;
                  } else {
                      statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30">${lang === 'fa' ? 'فعال' : 'Active'}</span>`;
                  }

                  const totalLabel = lang === 'fa' ? 'کل:' : 'Total:';
                  const dailyLabel = lang === 'fa' ? 'روزانه:' : 'Daily:';
                  const rLabel = lang === 'fa' ? 'درخواست' : 'r';

                  let linkTitle = lang === 'fa' ? 'کپی لینک ساب' : 'Copy Subscription Link';
                  let pauseTitle = u.isPaused ? (lang === 'fa' ? 'فعال‌سازی کاربر' : 'Resume User') : (lang === 'fa' ? 'توقف کاربر' : 'Pause User');
                  let editTitle = lang === 'fa' ? 'ویرایش کاربر' : 'Edit Subscriber';
                  let resetTitle = lang === 'fa' ? 'بازنشانی مصرف ترافیک' : 'Reset Traffic Metrics';
                  let deleteTitle = lang === 'fa' ? 'حذف کاربر' : 'Delete User';
                  let copyUuidTitle = lang === 'fa' ? 'کپی شناسه' : 'Copy UUID';

                   let linkHtml = `<button onclick="copyData('sync-${u.id}')" class="native-press flex-1 flex flex-col items-center justify-center gap-0.5 text-primary hover:text-primary bg-primary/5 hover:bg-primary/15 dark:bg-primary/10 dark:hover:bg-primary/30 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group" title="${linkTitle}">
                       <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                       </svg>
                       <span class="text-[8px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">${lang === 'fa' ? 'لینک' : 'Link'}</span>
                   </button>`;

                   let pauseBtnHtml = `<button onclick="togglePauseUser('${u.id}')" class="native-press flex-1 flex flex-col items-center justify-center gap-0.5 ${u.isPaused ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/30' : 'text-amber-500 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30'} py-2.5 rounded-xl transition-all duration-200 cursor-pointer group" title="${pauseTitle}">
                       ${u.isPaused ? `
                       <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M8 5v14l11-7z" />
                       </svg>
                       <span class="text-[8px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">فعال</span>
                       ` : `
                       <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                       </svg>
                       <span class="text-[8px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">${lang === 'fa' ? 'توقف' : 'Pause'}</span>
                       `}
                   </button>`;

                   let editBtnHtml = `<button onclick="editUser('${u.id}')" class="native-press flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-primary bg-slate-100/50 hover:bg-primary/10 dark:bg-slate-800/50 dark:hover:bg-primary/30 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group" title="${editTitle}">
                       <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                       </svg>
                       <span class="text-[8px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">${lang === 'fa' ? 'ویرایش' : 'Edit'}</span>
                   </button>`;

                   let resetBtnHtml = `<button onclick="resetUserTraffic('${u.id}')" class="native-press flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-violet-500 bg-slate-100/50 hover:bg-violet-500/10 dark:bg-slate-800/50 dark:hover:bg-violet-500/15 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group" title="${resetTitle}">
                       <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                       </svg>
                       <span class="text-[8px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">${lang === 'fa' ? 'ریست' : 'Reset'}</span>
                   </button>`;

                   let deleteBtnHtml = `<button onclick="deleteUser('${u.id}')" class="native-press flex-1 flex flex-col items-center justify-center gap-0.5 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/30 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group" title="${deleteTitle}">
                       <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                       <span class="text-[8px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">${lang === 'fa' ? 'حذف' : 'Delete'}</span>
                   </button>`;

                  let disableInfoHtml = '';
                  if (isAutoDisabled) {
                      let reasonLabel = u.disabledReason;
                      let timeLabel = u.disabledAt ? new Date(u.disabledAt).toLocaleString() : '';
                      let reasonTitle = lang === 'fa' ? 'علت غیرفعال‌سازی' : 'Disable Reason';
                      let timeTitle = lang === 'fa' ? 'زمان غیرفعال‌سازی' : 'Disabled At';
                      disableInfoHtml = `
                          <div class="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                              <div class="flex items-center gap-1.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
                                  <span>${reasonTitle}:</span>
                              </div>
                              <div class="text-[10px] text-red-500 dark:text-red-300 mt-0.5">${reasonLabel}</div>
                              ${timeLabel ? `<div class="text-[9px] text-slate-400 mt-1">${timeTitle}: ${timeLabel}</div>` : ''}
                          </div>
                      `;
                  }

                  let rawSync = window.nahanProfiles?.find(p => p.id === u.id)?.sync || '';
                  if (rawSync) {
                      rawSync += rawSync.includes('?') ? '&flag=a' : '?flag=a';
                  }

                  // Short UUID for display
                  let shortUuid = u.id.substring(0, 8) + '...';

                  tblHtml += `<div class="native-press bg-[var(--color-surface)] rounded-2xl border border-slate-200 dark:border-darkborder p-4 hover:shadow-md transition-shadow">
                      <!-- Header: Name + Status + UUID -->
                      <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center gap-2 min-w-0 flex-1">
                              <span class="font-bold text-sm text-slate-800 dark:text-white truncate">${u.name}</span>
                              ${u.proxyIpGeo ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 font-semibold shrink-0">${u.proxyIpGeo.flag}</span>` : ''}
                          </div>
                          ${statusBadge}
                      </div>
                      <!-- UUID row -->
                      <div class="flex items-center gap-1.5 mb-3">
                          <span class="text-[10px] text-slate-400 font-mono">${shortUuid}</span>
                          <button onclick="copyToClipboard('${u.id}')" class="text-slate-400 hover:text-primary transition-colors" title="${copyUuidTitle}">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          </button>
                      </div>
                      <!-- Badges -->
                      <div class="flex flex-wrap gap-1 mb-3">
                          ${u.isPaused && u.disabledReason ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300">Auto-Disabled</span>` : ''}
                          ${u.userMode ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">${u.userMode === 'alpha' ? 'VLESS' : u.userMode === 'beta' ? 'Trojan' : 'Both'}</span>` : ''}
                          ${u.userPorts ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">${u.userPorts}</span>` : ''}
                           ${u.maxConfigs ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300">${u.maxConfigs} cfgs</span>` : ''}
                           ${u.connLimit ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300">${u.connLimit} conn</span>` : ''}
                      </div>
                      ${disableInfoHtml}
                      <!-- Traffic Cards -->
                      <div class="grid grid-cols-2 gap-3">
                          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                              <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">${totalLabel}</div>
                              <div class="text-sm font-black text-slate-800 dark:text-white">${(userReqs/6000).toFixed(2)} <span class="text-[10px] font-semibold text-slate-400">GB</span></div>
                              ${u.limitTotalReq ? `
                              <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                                  <div class="bg-gradient-to-r ${parseFloat(perT) > 85 ? 'from-red-500 to-rose-600' : parseFloat(perT) > 60 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'} h-full rounded-full" style="width: ${perT}"></div>
                              </div>
                              <div class="flex items-center justify-between mt-1">
                                  <span class="text-[9px] text-slate-400">/ ${(u.limitTotalReq/6000).toFixed(2)} GB</span>
                                  ${perT !== '-' ? `<span class="text-[9px] font-bold ${parseFloat(perT) > 85 ? 'text-red-500' : parseFloat(perT) > 60 ? 'text-amber-500' : 'text-emerald-500'}">${perT}</span>` : ''}
                              </div>
                              ` : '<div class="text-[9px] text-slate-400 mt-1">' + unlimitedTxt + '</div>'}
                          </div>
                          <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                              <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">${dailyLabel}</div>
                              <div class="text-sm font-black text-slate-800 dark:text-white">${userDReqs} <span class="text-[10px] font-semibold text-slate-400">${rLabel}</span></div>
                              ${u.limitDailyReq ? `
                              <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                                  <div class="bg-gradient-to-r ${parseFloat(perD) > 85 ? 'from-red-500 to-rose-600' : parseFloat(perD) > 60 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'} h-full rounded-full" style="width: ${perD}"></div>
                              </div>
                              <div class="flex items-center justify-between mt-1">
                                  <span class="text-[9px] text-slate-400">/ ${(u.limitDailyReq/6000).toFixed(2)} GB</span>
                                  ${perD !== '-' ? `<span class="text-[9px] font-bold ${parseFloat(perD) > 85 ? 'text-red-500' : parseFloat(perD) > 60 ? 'text-amber-500' : 'text-emerald-500'}">${perD}</span>` : ''}
                              </div>
                              ` : '<div class="text-[9px] text-slate-400 mt-1">' + unlimitedTxt + '</div>'}
                          </div>
                      </div>
                      <!-- Expiry -->
                      <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span class="text-[10px] text-slate-400 flex items-center gap-1">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              ${expTxt}
                          </span>
                      </div>
                      <!-- Action Buttons -->
                      <div class="flex items-center gap-1.5 mt-3">
                          ${linkHtml}
                          ${pauseBtnHtml}
                          ${editBtnHtml}
                          ${resetBtnHtml}
                          ${deleteBtnHtml}
                      </div>
                      <input type="hidden" id="sync-${u.id}" value="${rawSync}">
                  `;
                  tblHtml += '</div>';
              });
              tbl.innerHTML = tblHtml;
              applyLang();
          }

          async function resetUserTraffic(uuid) {
              const resetMsg = lang === 'fa' ? 'آیا از بازنشانی وضعیت ترافیک (کل و روزانه) این مشترک مطمئن هستید؟' : 'Are you sure you want to reset all traffic metrics (Total and Daily) for this subscriber?';
              if(!(await showConfirm(lang === 'fa' ? 'بازنشانی ترافیک' : 'Reset Traffic', resetMsg))) return;
              try {
                  const res = await fetch(baseRoute + '/api/sync', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ key: sessionKey, resetUUID: uuid })
                  });
                  if (res.ok) {
                      const successMsg = lang === 'fa' ? 'ترافیک مشترک با موفقیت بازنشانی شد!' : 'Subscriber traffic metrics successfully reset!';
                      alert(successMsg);
                      doLogin(true); // reload usage data from server
                  } else {
                      const errMsg = lang === 'fa' ? 'سرور در بازنشانی ترافیک خطا بازگرداند.' : 'Server returned error while resetting metrics.';
                      alert(errMsg);
                  }
              } catch(e) {
                  const netErr = lang === 'fa' ? 'خطای ارتباط با شبکه.' : 'Network connection error.';
                  alert(netErr);
              }
          }

          async function deleteUser(uuid) {
              const deleteMsg = lang === 'fa' ? 'آیا از حذف این کاربر مطمئن هستید؟' : 'Are you sure you want to delete this user?';
              if(!(await showConfirm(lang === 'fa' ? 'حذف کاربر' : 'Delete User', deleteMsg))) return;
              if(window.nahanConfig && window.nahanConfig.users) {
                  window.nahanConfig.users = window.nahanConfig.users.filter(u => u.id !== uuid);
              }
              // Automatically sync
              renderUsersTable();
              doSaveDirectly();
          }

          function togglePauseUser(uuid) {
              if(window.nahanConfig && window.nahanConfig.users) {
                  let usr = window.nahanConfig.users.find(u => u.id === uuid);
                  if (usr) {
                      usr.isPaused = !usr.isPaused;
                      if (!usr.isPaused) {
                          usr.disabledReason = null;
                          usr.disabledAt = null;
                      }
                      renderUsersTable();
                      doSaveDirectly();
                  }
              }
          }

          function getGlobalPorts() {
              return (window.nahanConfig && window.nahanConfig.socketPorts)
                  ? window.nahanConfig.socketPorts.split(',').map(s=>s.trim()).filter(Boolean)
                  : ['443'];
          }

          function getGlobalMode() {
              return (window.nahanConfig && window.nahanConfig.mode) ? window.nahanConfig.mode : 'alpha';
          }

          // Draft Save/Load for Add User form
          function saveAddUserDraft() {
               const fields = ['add-user-name','add-user-custom-name','add-user-total-reqs','add-user-daily-reqs','add-user-days','add-user-conn-limit','add-user-custom-clean','add-user-custom-proxy','add-user-custom-nodes','add-user-panel-url','add-user-nat64','add-user-max-configs','add-user-seg-packets','add-user-seg-lengths','add-user-seg-delays','add-user-seg-maxsplit','add-user-seg-manual','add-user-tls-mask'];
              const draft = {};
              fields.forEach(id => { const el = document.getElementById(id); if (el) draft[id] = el.value; });
              localStorage.setItem('nahan_add_user_draft', JSON.stringify(draft));
          }
          function loadAddUserDraft() {
              try {
                  const draft = JSON.parse(localStorage.getItem('nahan_add_user_draft') || '{}');
                  Object.keys(draft).forEach(id => { const el = document.getElementById(id); if (el && draft[id]) el.value = draft[id]; });
              } catch(e){}
          }
          function clearAddUserDraft() {
              localStorage.removeItem('nahan_add_user_draft');
               ['add-user-name','add-user-custom-name','add-user-total-reqs','add-user-daily-reqs','add-user-days','add-user-conn-limit','add-user-custom-clean','add-user-custom-proxy','add-user-custom-nodes','add-user-panel-url','add-user-nat64','add-user-max-configs','add-user-seg-packets','add-user-seg-lengths','add-user-seg-delays','add-user-seg-maxsplit','add-user-seg-manual','add-user-tls-mask'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
          }

          function openAddUserPage() {
              if (window.nahanConfig && window.nahanConfig.users && window.nahanConfig.users.length >= 5) {
                  showToast(lang === 'fa' ? 'سقف مجاز ایجاد ۵ کاربر تکمیل شده است' : 'User creation limit of 5 reached', 'error');
                  return;
              }
              document.getElementById('view-users').classList.add('hidden');
              document.getElementById('view-add-user').classList.remove('hidden');
              var sc = document.querySelector('.scroll-content');
              sc.style.overflow = 'hidden';
              sc.classList.add('flex', 'flex-col');
              sc.firstElementChild.classList.add('flex-1', 'min-h-0', 'flex', 'flex-col');
              updateTitleText('Add User');
              buildPortCheckboxes('add-user-ports-wrap', null);
              buildModeCheckboxes('add-user-mode-wrap', null);
              buildIPCheckboxes("add-user-clean-ips-wrap", "", (window.nahanConfig?.cleanIps||"").split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean));
              buildIPCheckboxes("add-user-proxy-ips-wrap", "", (window.nahanConfig?.backupRelay||"").split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean));
              buildNodeCheckboxes("add-user-nodes-wrap", "", getGlobalNodeList());
              loadAddUserDraft();
              // Auto-save on input change
              document.getElementById("view-add-user").querySelectorAll("input, textarea").forEach(el => {
                  el.addEventListener("input", saveAddUserDraft);
              });
          }
          function toggleAddUserSection(section) {
              const content = document.getElementById('add-' + section + '-content');
              const arrow = document.getElementById('add-' + section + '-arrow');
              if (content && arrow) {
                  content.classList.toggle('hidden');
                  content.classList.toggle('animate-slide-down');
                  arrow.classList.toggle('rotate-180');
              }
          }
          // Segmentation (fragment) UI: builder XOR manual, TLS mask optional.
          function toggleSegMode(prefix) {
              const modeEl = document.getElementById(prefix + '-user-seg-mode');
              const b = document.getElementById(prefix + '-user-seg-builder');
              const m = document.getElementById(prefix + '-user-seg-manual-wrap');
              const mode = modeEl ? modeEl.value : 'off';
              if (b) b.classList.toggle('hidden', mode !== 'builder');
              if (m) m.classList.toggle('hidden', mode !== 'manual');
          }
          function readSegRangeList(s) {
              const items = String(s || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 8);
              if (!items.length) return null;
              for (const it of items) { if (!/^\d{1,5}(-\d{1,5})?$/.test(it)) return null; }
              return items;
          }
          // Returns { ok:true, data } or { ok:false, err } (bilingual message).
          function validateSegForm(prefix) {
              const gv = (id) => { const el = document.getElementById(prefix + '-' + id); return el ? el.value.trim() : ''; };
              const mode = gv('user-seg-mode') || 'off';
              const tlsMask = gv('user-tls-mask');
              if (tlsMask && !/^(TLS_[A-Za-z0-9_]+)(:TLS_[A-Za-z0-9_]+)*$/.test(tlsMask))
                  return { ok: false, err: lang === 'fa' ? 'ماسک TLS معتبر نیست (مثل TLS_AES_128_GCM_SHA256:...)' : 'Invalid TLS mask (e.g. TLS_AES_128_GCM_SHA256:...)' };
              const out = { segMode: null, segPackets: null, segLengths: null, segDelays: null, segMaxSplit: null, segManual: null, tlsMask: tlsMask || null };
              if (mode === 'builder') {
                  const packets = gv('user-seg-packets');
                  const lengths = readSegRangeList(gv('user-seg-lengths'));
                  const delays = readSegRangeList(gv('user-seg-delays'));
                  const maxSplit = gv('user-seg-maxsplit');
                  if (!packets || (packets !== 'tlshello' && !/^\d{1,3}-\d{1,3}$/.test(packets)))
                      return { ok: false, err: lang === 'fa' ? 'بسته‌ها معتبر نیست (tlshello یا مثل 1-3)' : 'Invalid packets (tlshello or e.g. 1-3)' };
                  if (!lengths)
                      return { ok: false, err: lang === 'fa' ? 'اندازه‌ها معتبر نیست (مثل 5,94,1)' : 'Invalid lengths (e.g. 5,94,1)' };
                  if (!delays)
                      return { ok: false, err: lang === 'fa' ? 'تاخیرها معتبر نیست (مثل 0)' : 'Invalid delays (e.g. 0)' };
                  if (!/^\d{1,6}$/.test(maxSplit))
                      return { ok: false, err: lang === 'fa' ? 'سقف تکه معتبر نیست (عدد)' : 'Invalid maxSplit (number)' };
                  out.segMode = 'builder';
                  out.segPackets = packets;
                  out.segLengths = lengths.join(',');
                  out.segDelays = delays.join(',');
                  out.segMaxSplit = maxSplit;
                  return { ok: true, data: out };
              }
              if (mode === 'manual') {
                  const raw = gv('user-seg-manual');
                  if (!raw)
                      return { ok: false, err: lang === 'fa' ? 'متن دستی خالی است' : 'Manual text is empty' };
                  if (raw.charAt(0) === '{') {
                      try {
                          const obj = JSON.parse(raw);
                          if (!obj || typeof obj !== 'object' || !Array.isArray(obj.tcp) || !obj.tcp.length) throw 0;
                      } catch (e) {
                          return { ok: false, err: lang === 'fa' ? 'JSON معتبر نیست (باید {"tcp":[...]} باشد)' : 'Invalid JSON (must be {"tcp":[...]})' };
                      }
                  } else if (!/^\d{1,5}-\d{1,5},\d{1,5}-\d{1,5},(tlshello|\d{1,3}-\d{1,3})$/.test(raw)) {
                      return { ok: false, err: lang === 'fa' ? 'رشته کلاسیک معتبر نیست (مثل 200-3000,1-2,tlshello)' : 'Invalid classic string (e.g. 200-3000,1-2,tlshello)' };
                  }
                  out.segMode = 'manual';
                  out.segManual = raw;
                  return { ok: true, data: out };
              }
              return { ok: true, data: out };
          }

          // Custom Confirm Modal
          let _confirmResolve = null;
          function showConfirm(title, msg) {
              return new Promise(resolve => {
                  _confirmResolve = resolve;
                  document.getElementById('confirm-modal-title').innerText = title;
                  document.getElementById('confirm-modal-msg').innerText = msg;
                  const m = document.getElementById('confirm-modal');
                  m.classList.remove('hidden');
                  m.classList.add('flex');
              });
          }
          function confirmModalResolve(val) {
              const m = document.getElementById('confirm-modal');
              m.classList.add('hidden');
              m.classList.remove('flex');
              if (_confirmResolve) { _confirmResolve(val); _confirmResolve = null; }
          }

          function showToast(msg, type) {
              const toast = document.getElementById('toast');
              if (!toast) return;
              const colors = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-primary' };
              toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 px-5 py-3 text-white rounded-xl text-sm font-bold shadow-xl transition-opacity duration-300 pointer-events-none z-50 ' + (colors[type] || colors.info);
              toast.innerText = msg;
              toast.style.opacity = '1';
              setTimeout(() => { toast.style.opacity = '0'; }, 2500);
          }

          function closeAddUserPage() {
              document.getElementById('view-add-user').classList.add('hidden');
              document.getElementById('view-users').classList.remove('hidden');
              var sc = document.querySelector('.scroll-content');
              sc.style.overflow = '';
              sc.classList.remove('flex', 'flex-col');
              sc.firstElementChild.classList.remove('flex-1', 'min-h-0', 'flex', 'flex-col');
              updateTitle();
          }
          function toggleEditUserSection(section) {
              const content = document.getElementById('edit-' + section + '-content');
              const arrow = document.getElementById('edit-' + section + '-arrow');
              if (content && arrow) {
                  content.classList.toggle('hidden');
                  content.classList.toggle('animate-slide-down');
                  arrow.classList.toggle('rotate-180');
              }
          }

          function closeEditUserPage() {
              document.getElementById('view-edit-user').classList.add('hidden');
              document.getElementById('view-users').classList.remove('hidden');
              var sc = document.querySelector('.scroll-content');
              sc.style.overflow = '';
              sc.classList.remove('flex', 'flex-col');
              sc.firstElementChild.classList.remove('flex-1', 'min-h-0', 'flex', 'flex-col');
              updateTitle();
          }
          function updateTitleText(txt) {
              var el = document.getElementById('view-title');
              if (el) el.innerText = txt;
          }


function buildIPCheckboxes(wrapId, selectedIps, allIps) {
    const wrap = document.getElementById(wrapId);
    if(!wrap) return;
    wrap.innerHTML = '';
    if(!allIps || allIps.length === 0) {
        wrap.innerHTML = '<span class="text-xs text-slate-400">' + (i18n[lang]?.no_ips_advanced || 'No IPs added in Advanced Tab') + '</span>';
        return;
    }
    const selArr = selectedIps ? selectedIps.split(',').map(s=>s.trim()).filter(Boolean) : [];
    allIps.forEach(ip => {
        const lbl = document.createElement('label');
        lbl.className = "flex items-center gap-1.5 text-sm cursor-pointer border border-slate-200 dark:border-darkborder px-2 py-1 rounded-lg";
        const cb = document.createElement('input');
        cb.type = "checkbox";
        cb.className = "accent-primary";
        cb.value = ip;
        if(selArr.includes(ip)) cb.checked = true;

        lbl.appendChild(cb);
        const span = document.createElement('span');
        span.innerText = ip;
        lbl.appendChild(span);
        wrap.appendChild(lbl);
    });
}
function getSelectedCheckboxes(wrapId) {
    const wrap = document.getElementById(wrapId);
    if(!wrap) return '';
    const checked = Array.from(wrap.querySelectorAll('input:checked')).map(cb => cb.value);
    return checked.join(',');
}
function getGlobalNodeList() {
    var nodes = [];
    var lp = (window.nahanConfig && Array.isArray(window.nahanConfig.linkedPanels)) ? window.nahanConfig.linkedPanels : [];
    lp.forEach(function(p){
        var raw = (p && typeof p === 'object') ? (p.url || '') : (p || '');
        raw = String(raw).trim();
        if(!raw) return;
        raw = raw.replace(/^[a-zA-Z]+:\/\//, '').split('/')[0].split('@').pop();
        var h = raw.indexOf('[') === 0 ? raw.slice(0, raw.indexOf(']') + 1) : raw.split(':')[0];
        h = h.trim();
        if(h) nodes.push(h);
    });
    return nodes.filter(function(v,i,a){return a.indexOf(v) === i;});
}
function buildNodeCheckboxes(wrapId, selectedNodes, allNodes) {
    const wrap = document.getElementById(wrapId);
    if(!wrap) return;
    wrap.innerHTML = '';
    if(!allNodes || allNodes.length === 0) {
        wrap.innerHTML = '<span class="text-xs text-slate-400">' + (i18n[lang]?.no_nodes_advanced || 'No slave nodes in Advanced Tab') + '</span>';
        return;
    }
    const selArr = selectedNodes ? selectedNodes.split(',').map(s=>s.trim()).filter(Boolean) : [];
    allNodes.forEach(node => {
        const lbl = document.createElement('label');
        lbl.className = "flex items-center gap-1.5 text-sm cursor-pointer border border-slate-200 dark:border-darkborder px-2 py-1 rounded-lg";
        const cb = document.createElement('input');
        cb.type = "checkbox";
        cb.className = "accent-primary";
        cb.value = node;
        if(selArr.includes(node)) cb.checked = true;
        lbl.appendChild(cb);
        const span = document.createElement('span');
        span.innerText = node;
        lbl.appendChild(span);
        wrap.appendChild(lbl);
    });
}

function buildPortCheckboxes(wrapId, selectedPorts) {
              const wrap = document.getElementById(wrapId);
              if (!wrap) return;
              const globalPorts = getGlobalPorts();
              const sel = selectedPorts ? selectedPorts.split(',').map(s=>s.trim()) : ['443'];
              wrap.innerHTML = globalPorts.map(function(p) {
                  return '<label class="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" value="' + p + '" class="' + wrapId + '-port-cb accent-primary"' + (sel.includes(p) ? ' checked' : '') + '><span>' + p + '</span></label>';
              }).join('');
          }

          function buildModeCheckboxes(wrapId, userMode) {
              const globalMode = getGlobalMode();
              const alphaAllowed = globalMode === 'alpha' || globalMode === 'both';
              const betaAllowed = globalMode === 'beta' || globalMode === 'both';
              const selAlpha = userMode === 'alpha' || userMode === 'both' || (!userMode && alphaAllowed);
              const selBeta = userMode === 'beta' || userMode === 'both' || (!userMode && betaAllowed);
              const wrap = document.getElementById(wrapId);
              if (!wrap) return;
              wrap.querySelectorAll('input[type=checkbox]').forEach(cb => {
                  if (cb.value === 'alpha') { cb.disabled = !alphaAllowed; cb.checked = selAlpha && alphaAllowed; cb.closest			('label').style.opacity = alphaAllowed ? '1' : '0.35'; }
                  if (cb.value === 'beta')  { cb.disabled = !betaAllowed;  cb.checked = selBeta && betaAllowed;  cb.closest			('label').style.opacity = betaAllowed  ? '1' : '0.35'; }
              });
          }

          function readModeFromCheckboxes(cbClass) {
             const cbs = [...document.querySelectorAll('.' + cbClass + ':checked')].map(c=>c.value);
              if (cbs.includes('alpha') && cbs.includes('beta')) return 'both';
              if (cbs.includes('alpha')) return 'alpha';
              if (cbs.includes('beta')) return 'beta';
              return getGlobalMode();
          }

          function readPortsFromCheckboxes(wrapId) {
             const ports = [...document.querySelectorAll('#' + wrapId + ' input[type=checkbox]:checked')].map(c=>c.value);
              return ports.length ? ports.join(',') : getGlobalPorts()[0];
          }

          function commitAddUser() {
              const name = document.getElementById('add-user-name').value.trim();
              if (!name) {
                  document.getElementById('add-user-name').classList.add('border-red-500', 'ring-2', 'ring-red-500/20');
                  document.getElementById('add-user-name').focus();
                  showToast(lang === 'fa' ? 'لطفاً نام کاربر را وارد کنید' : 'Please enter a user name', 'error');
                  return;
              }
              document.getElementById('add-user-name').classList.remove('border-red-500', 'ring-2', 'ring-red-500/20');
              let tReq = document.getElementById('add-user-total-reqs').value;
              tReq = tReq? Math.floor(parseFloat(tReq) * 6000): null;
              let dReq = document.getElementById('add-user-daily-reqs').value;
              dReq = dReq? Math.floor(parseFloat(dReq) * 6000): null;
              let days = document.getElementById('add-user-days').value;
               const cleanIpsCheckbox = getSelectedCheckboxes("add-user-clean-ips-wrap");
               const cleanIpsCustom = document.getElementById("add-user-custom-clean").value.trim();
               let cleanIpArray = [];
               if (cleanIpsCheckbox) cleanIpArray.push(...cleanIpsCheckbox.split(','));
               if (cleanIpsCustom) {
                   cleanIpArray.push(...cleanIpsCustom.split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean));
               }
               const cleanIp = cleanIpArray.length ? cleanIpArray.join(',') : null;
               const proxyIpsCheckbox = getSelectedCheckboxes("add-user-proxy-ips-wrap");
               const proxyIpsCustom = document.getElementById("add-user-custom-proxy").value.trim();
               let proxyIpArray = [];
               if (proxyIpsCheckbox) proxyIpArray.push(...proxyIpsCheckbox.split(','));
               if (proxyIpsCustom) {
                   proxyIpArray.push(...proxyIpsCustom.split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean));
               }
               const proxyIp = proxyIpArray.length ? proxyIpArray.join(',') : null;

               const customName = document.getElementById('add-user-custom-name').value.trim() || null;
               const userMode = readModeFromCheckboxes('add-mode-cb');
               const userPorts = readPortsFromCheckboxes('add-user-ports-wrap');
               let maxConfigs = document.getElementById('add-user-max-configs').value;
               maxConfigs = maxConfigs ? parseInt(maxConfigs) : null;
               const nodesCheckbox = getSelectedCheckboxes("add-user-nodes-wrap");
               const nodesCustom = document.getElementById("add-user-custom-nodes").value.trim();
               let nodesArray = [];
               if (nodesCheckbox) nodesArray.push(...nodesCheckbox.split(','));
               if (nodesCustom) nodesArray.push(...nodesCustom.split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean));
               const userNodes = nodesArray.length ? nodesArray.join(',') : null;
               const nat64 = document.getElementById('edit-user-nat64').value.trim() || null;

               if(!name) {
                   alert(lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name');
                  return;
              }

              if(!window.nahanConfig) window.nahanConfig = {};
              if(!window.nahanConfig.users) window.nahanConfig.users = [];

              if(window.nahanConfig.users.some(u => u.name.trim().toLowerCase() === name.toLowerCase())) {
                  alert(lang === 'fa' ? 'این نام قبلاً استفاده شده است' : 'This name is already taken');
                  return;
              }

               tReq = tReq ? parseInt(tReq) : null;
               dReq = dReq ? parseInt(dReq) : null;
               days = days ? parseInt(days) : null;
               let connLimit = document.getElementById('add-user-conn-limit').value;
               connLimit = connLimit ? parseInt(connLimit) : null;
               const userPanelUrl = document.getElementById('add-user-panel-url').value.trim() || null;
               const segAdd = validateSegForm('add');
               if (!segAdd.ok) { showToast(segAdd.err, 'error'); return; }

               let newId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                   .map((b,i) => (i===4||i===6||i===8||i===10?'-':'') + b.toString(16).padStart(2,'0')).join('');

                const u = {
                    id: newId,
                    name: name,
                    limitTotalReq: tReq,
                    limitDailyReq: dReq,
                    expiryMs: days ? Date.now() + days*86400000 : null,
                    proxyIp: proxyIp,
                     cleanIp: cleanIp,
                     customName: customName,
                     userMode: userMode,
                     userPorts: userPorts,
                     maxConfigs: maxConfigs,
                     userNodes: userNodes,
                     nat64: nat64,
                     connLimit: connLimit,
                     userPanelUrl: userPanelUrl,
                     segMode: segAdd.data.segMode,
                     segPackets: segAdd.data.segPackets,
                     segLengths: segAdd.data.segLengths,
                     segDelays: segAdd.data.segDelays,
                     segMaxSplit: segAdd.data.segMaxSplit,
                     segManual: segAdd.data.segManual,
                     tlsMask: segAdd.data.tlsMask,
                     createdAt: Date.now()
                };

              if (window.nahanConfig && window.nahanConfig.users && window.nahanConfig.users.length >= 5) {
                  showToast(lang === 'fa' ? 'سقف مجاز ایجاد ۵ کاربر تکمیل شده است' : 'User creation limit of 5 reached', 'error');
                  return;
              }
              window.nahanConfig.users.push(u);
              document.getElementById('view-add-user').classList.add('hidden');
              document.getElementById('view-users').classList.remove('hidden');
              var sc = document.querySelector('.scroll-content');
              sc.style.overflow = '';
              sc.classList.remove('flex', 'flex-col');
              sc.firstElementChild.classList.remove('flex-1', 'min-h-0', 'flex', 'flex-col');
              updateTitle();
              document.getElementById('add-user-name').value = '';
               document.getElementById('add-user-custom-name').value = '';
               document.getElementById('add-user-custom-clean').value = '';
               document.getElementById('add-user-helper-ip').value = '';
               document.getElementById('add-user-helper-name').value = '';
               document.getElementById('add-user-custom-proxy').value = '';
               document.getElementById('add-user-custom-nodes').value = '';
              document.getElementById('add-user-total-reqs').value = '';
              document.getElementById('add-user-daily-reqs').value = '';
              document.getElementById('add-user-days').value = '';
              document.getElementById('add-user-max-configs').value = '';
               document.getElementById('add-user-conn-limit').value = '';
               document.getElementById('add-user-panel-url').value = '';
               document.getElementById('add-user-seg-mode').value = 'off';
               document.getElementById('add-user-seg-packets').value = '';
               document.getElementById('add-user-seg-lengths').value = '';
               document.getElementById('add-user-seg-delays').value = '';
               document.getElementById('add-user-seg-maxsplit').value = '';
               document.getElementById('add-user-seg-manual').value = '';
               document.getElementById('add-user-tls-mask').value = '';
               toggleSegMode('add');

              renderUsersTable();
              doSaveDirectly();
              clearAddUserDraft();
              // Show subscription link toast
              const subUrl = `${location.origin}/${newId}`;
              navigator.clipboard.writeText(subUrl).catch(() => {});
              showToast(lang === 'fa' ? `✅ کاربر ${name} ذخیره شد! لینک ساب کپی شد` : `✅ User ${name} saved! Sub link copied`, 'success');
          }

          function editUser(uuid) {
              if(!window.nahanConfig || !window.nahanConfig.users) return;
              let u = window.nahanConfig.users.find(usr => usr.id === uuid);
              if(!u) return;

              document.getElementById('edit-user-id').value = u.id;
              document.getElementById('edit-user-name').value = u.name;
              document.getElementById('edit-user-total-reqs').value = u.limitTotalReq? (u.limitTotalReq / 6000).toFixed(2): '';
              document.getElementById('edit-user-daily-reqs').value = u.limitDailyReq? (u.limitDailyReq / 6000).toFixed(2): '';
                            const globalCleanIps = (window.nahanConfig?.cleanIps||"").split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean);
              const userCleanIps = (u.cleanIp || "").split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean);
              const checkedGlobalClean = [];
              const customClean = [];
              userCleanIps.forEach(ip => {
                  let hostOnly = ip.split('#')[0].split(':')[0].trim();
                  let isFound = globalCleanIps.some(g => g.split('#')[0].split(':')[0].trim() === hostOnly || g === ip);
                  if (isFound) checkedGlobalClean.push(ip);
                  else customClean.push(ip);
              });
              buildIPCheckboxes("edit-user-clean-ips-wrap", checkedGlobalClean.join(','), globalCleanIps);
              document.getElementById('edit-user-custom-clean').value = customClean.join(', ');
              document.getElementById('edit-user-helper-ip').value = '';
              document.getElementById('edit-user-helper-name').value = '';

              const globalProxyIps = (window.nahanConfig?.backupRelay||"").split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean);
              const userProxyIps = (u.proxyIp || "").split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean);
              const checkedGlobalProxy = [];
              const customProxy = [];
              userProxyIps.forEach(ip => {
                  let hostOnly = ip.split('#')[0].split(':')[0].trim();
                  let isFound = globalProxyIps.some(g => g.split('#')[0].split(':')[0].trim() === hostOnly || g === ip);
                  if (isFound) checkedGlobalProxy.push(ip);
                  else customProxy.push(ip);
              });
               buildIPCheckboxes("edit-user-proxy-ips-wrap", checkedGlobalProxy.join(','), globalProxyIps);
               document.getElementById('edit-user-custom-proxy').value = customProxy.join(', ');

               const globalNodes = getGlobalNodeList();
               const userNodesList = (u.userNodes || "").split(/[\r\n,;]+/).map(s=>s.trim()).filter(Boolean);
               const checkedGlobalNodes = [];
               const customNodes = [];
               userNodesList.forEach(node => {
                   let isFound = globalNodes.some(g => g === node);
                   if (isFound) checkedGlobalNodes.push(node);
                   else customNodes.push(node);
               });
               buildNodeCheckboxes("edit-user-nodes-wrap", checkedGlobalNodes.join(','), globalNodes);
               document.getElementById('edit-user-custom-nodes').value = customNodes.join(', ');
               document.getElementById('edit-user-nat64').value = u.nat64 || '';

               document.getElementById('edit-user-custom-name').value = u.customName || '';

              document.getElementById('edit-user-max-configs').value = u.maxConfigs || '';
              document.getElementById('edit-user-conn-limit').value = u.connLimit || '';
              document.getElementById('edit-user-panel-url').value = u.userPanelUrl || '';
              document.getElementById('edit-user-seg-mode').value = (u.segMode === 'builder' || u.segMode === 'manual') ? u.segMode : 'off';
              document.getElementById('edit-user-seg-packets').value = u.segPackets || '';
              document.getElementById('edit-user-seg-lengths').value = u.segLengths || '';
              document.getElementById('edit-user-seg-delays').value = u.segDelays || '';
              document.getElementById('edit-user-seg-maxsplit').value = u.segMaxSplit || '';
              document.getElementById('edit-user-seg-manual').value = u.segManual || '';
              document.getElementById('edit-user-tls-mask').value = u.tlsMask || '';
              toggleSegMode('edit');

              buildPortCheckboxes('edit-user-ports-wrap', u.userPorts);
              buildModeCheckboxes('edit-user-mode-wrap', u.userMode);

              let daysLeft = '';
              if(u.expiryMs) {
                  let diff = u.expiryMs - Date.now();
                  daysLeft = diff > 0 ? Math.ceil(diff / 86400000) : 0;
              }
              document.getElementById('edit-user-days').value = daysLeft;

              document.getElementById('view-users').classList.add('hidden');
              document.getElementById('view-edit-user').classList.remove('hidden');
              var sc = document.querySelector('.scroll-content');
              sc.style.overflow = 'hidden';
              sc.classList.add('flex', 'flex-col');
              sc.firstElementChild.classList.add('flex-1', 'min-h-0', 'flex', 'flex-col');
              updateTitleText('Edit Subscriber');
          }

          function commitEditUser() {
              const uuid = document.getElementById('edit-user-id').value;
              const name = document.getElementById('edit-user-name').value.trim();
              if (!name) {
                  document.getElementById('edit-user-name').classList.add('border-red-500', 'ring-2', 'ring-red-500/20');
                  document.getElementById('edit-user-name').focus();
                  showToast(lang === 'fa' ? 'لطفاً نام کاربر را وارد کنید' : 'Please enter a user name', 'error');
                  return;
              }
              document.getElementById('edit-user-name').classList.remove('border-red-500', 'ring-2', 'ring-red-500/20');
              let tReq = document.getElementById('edit-user-total-reqs').value;
              tReq = tReq? Math.floor(parseFloat(tReq) * 6000): null;
              let dReq = document.getElementById('edit-user-daily-reqs').value;
              dReq = dReq? Math.floor(parseFloat(dReq) * 6000): null;
              let days = document.getElementById('edit-user-days').value;
                             const proxyIpsCheckbox = getSelectedCheckboxes("edit-user-proxy-ips-wrap");
               const proxyIpsCustom = document.getElementById("edit-user-custom-proxy").value.trim();
               let proxyIpArray = [];
               if (proxyIpsCheckbox) proxyIpArray.push(...proxyIpsCheckbox.split(','));
               if (proxyIpsCustom) {
                   proxyIpArray.push(...proxyIpsCustom.split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean));
               }
               const proxyIp = proxyIpArray.length ? proxyIpArray.join(',') : null;

               const customName = document.getElementById('edit-user-custom-name').value.trim() || null;
               const cleanIpsCheckbox = getSelectedCheckboxes("edit-user-clean-ips-wrap");
               const cleanIpsCustom = document.getElementById("edit-user-custom-clean").value.trim();
               let cleanIpArray = [];
               if (cleanIpsCheckbox) cleanIpArray.push(...cleanIpsCheckbox.split(','));
               if (cleanIpsCustom) {
                   cleanIpArray.push(...cleanIpsCustom.split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean));
               }
               const cleanIp = cleanIpArray.length ? cleanIpArray.join(',') : null;
              const userMode = readModeFromCheckboxes('edit-mode-cb');
              const userPorts = readPortsFromCheckboxes('edit-user-ports-wrap');
               let maxConfigs = document.getElementById('edit-user-max-configs').value;
               maxConfigs = maxConfigs ? parseInt(maxConfigs) : null;
               const nodesCheckbox = getSelectedCheckboxes("edit-user-nodes-wrap");
               const nodesCustom = document.getElementById("edit-user-custom-nodes").value.trim();
               let nodesArray = [];
               if (nodesCheckbox) nodesArray.push(...nodesCheckbox.split(','));
               if (nodesCustom) nodesArray.push(...nodesCustom.split(/[\s,;]+/).map(s=>s.trim()).filter(Boolean));
               const userNodes = nodesArray.length ? nodesArray.join(',') : null;
                const nat64 = document.getElementById('edit-user-nat64').value.trim() || null;
                let connLimit = document.getElementById('edit-user-conn-limit').value;
                connLimit = connLimit ? parseInt(connLimit) : null;
                const userPanelUrl = document.getElementById('edit-user-panel-url').value.trim() || null;
                const segEdit = validateSegForm('edit');
                if (!segEdit.ok) { showToast(segEdit.err, 'error'); return; }

               if(!name) {
                  alert(lang === 'fa' ? 'لطفاً نام را وارد کنید' : 'Please enter a name');
                  return;
              }
              tReq = tReq ? parseInt(tReq) : null;
              dReq = dReq ? parseInt(dReq) : null;
              days = days ? parseInt(days) : null;

              if(!window.nahanConfig || !window.nahanConfig.users) return;

              if(window.nahanConfig.users.some(u => u.id !== uuid && u.name.trim().toLowerCase() === name.toLowerCase())) {
                  alert(lang === 'fa' ? 'این نام قبلاً استفاده شده است' : 'This name is already taken');
                  return;
              }

              let u = window.nahanConfig.users.find(usr => usr.id === uuid);
              if(!u) return;

              u.name = name;
              u.limitTotalReq = tReq;
              u.limitDailyReq = dReq;
              u.expiryMs = days ? Date.now() + days*86400000 : null;
              u.proxyIp = proxyIp;
               u.cleanIp = cleanIp;
               u.customName = customName;
              u.userMode = userMode;
              u.userPorts = userPorts;
              u.maxConfigs = maxConfigs;
              u.userNodes = userNodes;
              u.nat64 = nat64;
              u.connLimit = connLimit;
              u.userPanelUrl = userPanelUrl;
              u.segMode = segEdit.data.segMode;
              u.segPackets = segEdit.data.segPackets;
              u.segLengths = segEdit.data.segLengths;
              u.segDelays = segEdit.data.segDelays;
              u.segMaxSplit = segEdit.data.segMaxSplit;
              u.segManual = segEdit.data.segManual;
              u.tlsMask = segEdit.data.tlsMask;

              document.getElementById('view-edit-user').classList.add('hidden');
              document.getElementById('view-users').classList.remove('hidden');
              var sc = document.querySelector('.scroll-content');
              sc.style.overflow = '';
              sc.classList.remove('flex', 'flex-col');
              sc.firstElementChild.classList.remove('flex-1', 'min-h-0', 'flex', 'flex-col');
              renderUsersTable();
              doSaveDirectly();
          }

