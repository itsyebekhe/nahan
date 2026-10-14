          function switchTab(tab) {
            ['overview','info','network','settings','advanced','logs','users','help','optimiser'].forEach(t => {
                  const view = document.getElementById('view-'+t);
                  const deskBtn = document.getElementById('tab-'+t);
                  const mobBtn = document.getElementById('mob-tab-'+t);
                  if (tab === t) {
                      if (view) { view.classList.remove('hidden'); view.classList.add('block', 'fade-in'); }
                      if(deskBtn) deskBtn.classList.add('active');
                      if(mobBtn) mobBtn.classList.add('active');
                  } else {
                      if (view) { view.classList.add('hidden'); view.classList.remove('block', 'fade-in'); }
                      if(deskBtn) deskBtn.classList.remove('active');
                      if(mobBtn) mobBtn.classList.remove('active');
                  }
              });
            document.getElementById('view-add-user').classList.add('hidden');
            document.getElementById('view-edit-user').classList.add('hidden');
            var sc = document.querySelector('.scroll-content');
            if (sc) {
                sc.style.overflow = '';
                sc.classList.remove('flex', 'flex-col');
                if (sc.firstElementChild) sc.firstElementChild.classList.remove('flex-1', 'min-h-0', 'flex', 'flex-col');
                sc.scrollTop = 0;
            }
                        updateTitle();

            // Toggle save-bar visibility: hidden in overview, network, logs, help
            const saveBar = document.getElementById('save-bar');
            if (saveBar) {
                const noSaveTabs = ['overview', 'network', 'logs', 'help'];
                if (noSaveTabs.includes(tab)) {
                    saveBar.classList.add('hidden');
                } else {
                    saveBar.classList.remove('hidden');
                }
            }

            
            if(dashboardInterval) { clearInterval(dashboardInterval); dashboardInterval = null; }
            if(networkInterval) { clearInterval(networkInterval); networkInterval = null; }
            
            if(tab === 'overview') {
                loadDashboard();
                dashboardInterval = setInterval(loadDashboard, 15000);
            }
            if(tab === 'logs') loadLogs();
            if(tab === 'optimiser') updateOptimiserPreview();
            if(tab === 'network') {
                doLogin(true);
                networkInterval = setInterval(()=>doLogin(true), 15000);
            }
          }

        function toggleFAQ(button) {
            const content = button.nextElementSibling;
            const svg = button.querySelector('svg');
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                svg.classList.add('rotate-180');
            } else {
                content.classList.add('hidden');
                svg.classList.remove('rotate-180');
            }
        }

        function filterFAQs() {
            const query = document.getElementById('faq-search').value.toLowerCase();
            const items = document.querySelectorAll('.faq-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(query)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        }

