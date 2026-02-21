document.addEventListener('DOMContentLoaded', () => {
    const pages = [0, 1, 2, 3, 4, 5].map(i => document.getElementById('page' + i));
    let currentPage = 0;

    document.getElementById('btnMinimize').addEventListener('click', () => window.api.minimize());

    // Close confirmation modal
    document.getElementById('btnClose').addEventListener('click', () => {
        showModal(window.t('Close confirm title') || 'Tutup Aplikasi',
            `<p style="margin-bottom:12px;">${window.t('Close confirm text') || 'Apakah Anda yakin ingin keluar dari program?'}</p>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn secondary" onclick="document.getElementById('modal').classList.remove('visible')">${window.t('Close cancel') || 'Tidak'}</button>
            <button class="btn primary" id="btnConfirmExit" style="background:#E81123;">${window.t('Close exit') || 'Ya, Keluar'}</button>
        </div>`);
        setTimeout(() => {
            const cb = document.getElementById('btnConfirmExit');
            if (cb) cb.addEventListener('click', () => window.api.close());
        }, 50);
    });

    // Language Toggle
    const btnLang = document.getElementById('btnLang');
    if (btnLang) {
        btnLang.addEventListener('click', () => {
            const newLang = window.currentLang === 'ID' ? 'EN' : 'ID';
            if (typeof window.updateLanguage === 'function') window.updateLanguage(newLang);
        });
        // Initial init
        if (typeof window.updateLanguage === 'function') window.updateLanguage('ID');
    }

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    function showModal(t, h) { modalTitle.textContent = t; modalBody.innerHTML = h; modal.classList.add('visible'); }
    function hideModal() { modal.classList.remove('visible'); }
    document.getElementById('btnModalClose').addEventListener('click', hideModal);
    modal.addEventListener('click', e => { if (e.target === modal) hideModal(); });

    function navigateTo(idx) {
        pages.forEach(p => { if (p) p.classList.remove('active'); });
        if (pages[idx]) pages[idx].classList.add('active');
        currentPage = idx;
        for (let i = 0; i < 6; i++) {
            const s = document.getElementById('step' + i);
            if (!s) continue;
            s.classList.remove('active', 'completed');
            if (i < idx) s.classList.add('completed');
            else if (i === idx) s.classList.add('active');
        }
    }

    function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    // ── Page 0: Welcome ──
    document.getElementById('btnStart').addEventListener('click', () => { navigateTo(1); });
    (async () => { const m = await window.api.getConfigMeta(); const el = document.getElementById('configMetaText'); if (el && m) el.textContent = `Config v${m.version} • ${m.date} • ${m.fileCount} files`; const vt = document.querySelector('.version-text'); if (vt && m) vt.textContent = `v${m.version}`; })();

    // Agent Model Selection Logic
    const AGENT_GROUPS = {
        heavy: ['sisyphus', 'prometheus', 'metis', 'oracle'],
        standard: ['hephaestus', 'momus', 'atlas'],
        light: ['librarian', 'explore', 'multimodal_looker']
    };
    let agentAdvancedMode = false;

    // Toggle Advanced / Group mode
    document.getElementById('btnAgentAdvanced').addEventListener('click', () => {
        agentAdvancedMode = !agentAdvancedMode;
        document.getElementById('agentGroupMode').style.display = agentAdvancedMode ? 'none' : '';
        document.getElementById('agentAdvancedMode').style.display = agentAdvancedMode ? '' : 'none';
        document.getElementById('btnAgentAdvanced').textContent = agentAdvancedMode ? '← Simple' : '⚙ Advanced';
        if (!agentAdvancedMode) syncAgentsFromGroups();
    });

    // When group dropdown changes → update per-agent dropdowns
    function syncAgentsFromGroups() {
        Object.entries(AGENT_GROUPS).forEach(([group, agents]) => {
            const gSel = document.getElementById('selGroup' + group.charAt(0).toUpperCase() + group.slice(1));
            if (!gSel) return;
            agents.forEach(a => {
                const aSel = document.getElementById('selAgent_' + a);
                if (aSel) aSel.value = gSel.value;
            });
        });
    }
    ['selGroupHeavy', 'selGroupStandard', 'selGroupLight'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => { if (!agentAdvancedMode) syncAgentsFromGroups(); });
    });

    // Global Template Presets
    const selGlobalPreset = document.getElementById('selGlobalPreset');
    if (selGlobalPreset) {
        selGlobalPreset.addEventListener('change', (e) => {
            const val = e.target.value;
            if (!val) return;

            const heavy = document.getElementById('selGroupHeavy');
            const standard = document.getElementById('selGroupStandard');
            const light = document.getElementById('selGroupLight');
            const lookup = {
                'antigravity_default': ['google/antigravity-gemini-1.5-pro', 'google/antigravity-gemini-1.5-pro', 'google/antigravity-gemini-1.5-flash'],
                'max_reasoning': ['google/antigravity-claude-opus-4-6-thinking', 'google/antigravity-claude-sonnet-4-6-thinking', 'google/antigravity-claude-sonnet-4-6'],
                'balance_hybrid': ['google/antigravity-claude-sonnet-4-6-thinking', 'google/antigravity-gemini-1.5-pro', 'google/antigravity-gemini-1.5-flash'],
                'fast_cheap': ['google/antigravity-gemini-1.5-flash', 'google/antigravity-gemini-1.5-flash', 'google/antigravity-gemini-1.5-flash'],
                'claude_only': ['google/antigravity-claude-opus-4-6-thinking', 'google/antigravity-claude-sonnet-4-6', 'google/antigravity-claude-sonnet-4-6']
            };

            if (lookup[val] && heavy && standard && light) {
                heavy.value = lookup[val][0];
                standard.value = lookup[val][1];
                light.value = lookup[val][2];
                syncAgentsFromGroups(); // loop updates UI
            }
        });
    }

    // Gather agent model map (used during install)
    function gatherAgentModels() {
        const map = {};
        const allAgents = ['sisyphus', 'prometheus', 'metis', 'oracle', 'hephaestus', 'momus', 'atlas', 'librarian', 'explore', 'multimodal_looker'];
        if (agentAdvancedMode) {
            allAgents.forEach(a => { const sel = document.getElementById('selAgent_' + a); if (sel) map[a] = sel.value; });
        } else {
            Object.entries(AGENT_GROUPS).forEach(([group, agents]) => {
                const gSel = document.getElementById('selGroup' + group.charAt(0).toUpperCase() + group.slice(1));
                if (!gSel) return;
                agents.forEach(a => { map[a] = gSel.value; });
            });
        }
        return map;
    }

    document.getElementById('btnVersionCheck').addEventListener('click', async () => {
        const btn = document.getElementById('btnVersionCheck'); btn.textContent = '...'; btn.disabled = true;
        const r = await window.api.checkVersion();
        if (r.noEndpoint) showModal('Version Check', `<p>Current: <strong>v${r.current}</strong></p><p style="color:var(--text-secondary);font-size:11px;margin-top:6px;">No update endpoint configured.</p>`);
        else if (r.upToDate) showModal('Version Check', `<p style="color:var(--accent-green)">✓ Latest: v${r.current}</p>`);
        else showModal('Update Available', `<p>Current: v${r.current}</p><p>Latest: <strong style="color:var(--accent-green)">v${r.latest}</strong></p>`);
        btn.textContent = '🔄 Updates'; btn.disabled = false;
    });

    document.getElementById('btnUninstall').addEventListener('click', async () => {
        showModal('Uninstall', `<p style="margin-bottom:10px;">Remove all config files from <code>~/.config/opencode/</code>?</p><p style="color:var(--text-secondary);font-size:11px;margin-bottom:12px;">Safety backup created before deletion.</p><div style="display:flex;gap:8px;justify-content:flex-end;"><button class="btn secondary" onclick="document.getElementById('modal').classList.remove('visible')">Cancel</button><button class="btn primary" id="btnConfirmUninstall" style="background:#E81123;">Uninstall</button></div>`);
        setTimeout(() => {
            const cb = document.getElementById('btnConfirmUninstall');
            if (cb) cb.addEventListener('click', async () => {
                cb.textContent = '...'; cb.disabled = true;
                const r = await window.api.uninstallConfig();
                showModal(r.success ? 'Uninstalled' : 'Failed', r.success
                    ? `<p style="color:var(--accent-green)">✓ Removed ${r.removed.length} files</p><p style="font-size:11px;color:var(--text-secondary);margin-top:4px;">${r.removed.join(', ')}</p><p style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Backup: ${r.backupDir}</p>`
                    : `<p style="color:var(--accent-red)">✗ ${r.message}</p>`);
            });
        }, 50);
    });

    // ── Page 1: oMo Agent Model ──
    document.getElementById('btnPrev1').addEventListener('click', () => navigateTo(0));
    document.getElementById('btnNext1').addEventListener('click', async () => { navigateTo(2); await runSystemCheck(); });

    // ── Page 2: System Check ──
    document.getElementById('btnPrev2').addEventListener('click', () => navigateTo(1));
    document.getElementById('btnNext2').addEventListener('click', () => navigateTo(3));
    document.getElementById('btnRecheck').addEventListener('click', () => runSystemCheck());

    async function runSystemCheck() {
        const pp = document.getElementById('prereqPanel');
        pp.innerHTML = `<p style="color:var(--text-secondary);font-size:11px;text-align:center;margin-top:20px;">${window.t('Checking...') || 'Checking...'}</p>`;
        document.getElementById('btnNext2').disabled = true; document.getElementById('btnNext2').classList.add('disabled');
        const res = await window.api.checkSystem(); pp.innerHTML = '';
        let fail = false;
        res.items.forEach(it => {
            if (it.status === 'fail') fail = true;
            const ic = it.status === 'ok' ? '✓' : it.status === 'warn' ? '⚠' : '✗';
            pp.innerHTML += `<div class="prereq-item"><div class="prereq-info"><div class="label">${it.label}</div><div class="value">${it.value}</div></div><div class="prereq-status status-${it.status}">${ic}</div></div>`;
        });
        if (!fail) { document.getElementById('btnNext2').disabled = false; document.getElementById('btnNext2').classList.remove('disabled'); }
    }

    // ── Page 3: Config ──
    document.getElementById('btnPrev3').addEventListener('click', () => navigateTo(2));
    document.getElementById('btnNext3').addEventListener('click', () => { navigateTo(4); startInstallation(); });

    (async () => {
        const k = await window.api.getExistingKeys();
        if (k.supermemoryKey) document.getElementById('txtSupermemoryKey').value = k.supermemoryKey;
        if (k.openSyncKey) document.getElementById('txtOpenSyncKey').value = k.openSyncKey;
        if (k.openSyncUrl) document.getElementById('txtOpenSyncUrl').value = k.openSyncUrl;
        valField('txtSupermemoryKey', 'valSupermemory'); valField('txtOpenSyncKey', 'valOpenSyncKey'); valField('txtOpenSyncUrl', 'valOpenSyncUrl');
    })();

    function valField(iid, vid) {
        const v = document.getElementById(iid)?.value.trim() || '';
        const el = document.getElementById(vid); if (!el) return;
        if (!v) { el.textContent = window.t('(Optional)') || '(Optional)'; el.className = 'val-indicator val-empty'; }
        else if (v.length < 8 || v.startsWith('__')) { el.textContent = window.t('✗ Invalid') || '✗ Invalid'; el.className = 'val-indicator val-bad'; }
        else { el.textContent = window.t('✓ Set') || '✓ Set'; el.className = 'val-indicator val-ok'; }
    }
    window.reValInputs = () => { valField('txtSupermemoryKey', 'valSupermemory'); valField('txtOpenSyncKey', 'valOpenSyncKey'); valField('txtOpenSyncUrl', 'valOpenSyncUrl'); };
    [['txtSupermemoryKey', 'valSupermemory'], ['txtOpenSyncKey', 'valOpenSyncKey'], ['txtOpenSyncUrl', 'valOpenSyncUrl']].forEach(([i, v]) => document.getElementById(i).addEventListener('input', () => { valField(i, v); updatePluginLogic(); }));

    function updatePluginLogic() {
        const total = document.querySelectorAll('.plugin-checkbox').length;
        const checked = document.querySelectorAll('.plugin-checkbox:checked').length;
        const elCount = document.getElementById('pluginCount');
        if (elCount) elCount.textContent = `${checked}/${total}`;

        const smCheck = document.getElementById('chkPluginSupermemory');
        const smInput = document.getElementById('txtSupermemoryKey');
        const smWarn = document.getElementById('warnSupermemory');
        if (smCheck && smInput && smWarn) {
            smInput.disabled = !smCheck.checked;
            if (!smCheck.checked) smWarn.classList.add('hidden');
            else smWarn.classList.toggle('hidden', !!smInput.value.trim());
        }

        const osCheck = document.getElementById('chkPluginOpenSync');
        const osInputKey = document.getElementById('txtOpenSyncKey');
        const osInputUrl = document.getElementById('txtOpenSyncUrl');
        const osWarn = document.getElementById('warnOpenSync');
        if (osCheck && osInputKey && osInputUrl && osWarn) {
            osInputKey.disabled = !osCheck.checked;
            osInputUrl.disabled = !osCheck.checked;
            if (!osCheck.checked) osWarn.classList.add('hidden');
            else osWarn.classList.toggle('hidden', !!(osInputKey.value.trim() && osInputUrl.value.trim()));
        }
    }
    const pluginGrid = document.getElementById('pluginGrid');
    if (pluginGrid) pluginGrid.addEventListener('change', updatePluginLogic);
    // Initial sync
    setTimeout(updatePluginLogic, 100);

    // Plugin select all/none
    document.getElementById('btnPluginAll').addEventListener('click', () => { document.querySelectorAll('.plugin-checkbox:not(:disabled)').forEach(c => c.checked = true); updatePluginLogic(); });
    document.getElementById('btnPluginNone').addEventListener('click', () => { document.querySelectorAll('.plugin-checkbox:not(:disabled)').forEach(c => c.checked = false); updatePluginLogic(); });

    // Preview Final opencode.json
    const btnPreviewConfig = document.getElementById('btnPreviewConfig');
    if (btnPreviewConfig) {
        btnPreviewConfig.addEventListener('click', async () => {
            btnPreviewConfig.textContent = '...';
            const sp = []; document.querySelectorAll('.plugin-checkbox').forEach(c => { if (c.checked) sp.push(c.value); });
            const r = await window.api.previewFinalOpencode(sp);
            btnPreviewConfig.textContent = window.t('👁 Preview opencode.json') || '👁 Preview opencode.json';
            showModal('Preview: ' + r.fileName, `<pre class="modal-code">${escapeHtml(r.content)}</pre>`);
        });
    }

    // Preview
    document.querySelectorAll('.btn-preview').forEach(b => b.addEventListener('click', async () => {
        const f = b.dataset.file; b.textContent = '...';
        const r = await window.api.previewConfig(f); b.textContent = '👁';
        if (r.error) { showModal('Error', `<p>${r.error}</p>`); return; }
        showModal('Preview: ' + r.fileName, `<pre class="modal-code">${escapeHtml(r.content)}</pre>`);
    }));

    // Diff
    document.querySelectorAll('.btn-diff').forEach(b => b.addEventListener('click', async () => {
        const f = b.dataset.file; b.textContent = '...';
        const r = await window.api.diffConfig(f); b.textContent = '⇄';
        if (r.error) { showModal('Error', `<p>${r.error}</p>`); return; }
        if (r.isNew) { showModal('Diff: ' + r.fileName, `<p class="diff-new-badge">NEW FILE</p><pre class="modal-code">${escapeHtml(r.newContent)}</pre>`); return; }
        if (!r.hasChanges) { showModal('Diff: ' + r.fileName, `<p style="color:var(--accent-green)">✓ Identical</p>`); return; }
        let h = '<div class="diff-view">';
        r.diffLines.forEach(d => { const c = d.type === 'add' ? 'diff-add' : d.type === 'del' ? 'diff-del' : 'diff-same'; const p = d.type === 'add' ? '+' : d.type === 'del' ? '-' : ' '; h += `<div class="diff-line ${c}"><span class="diff-prefix">${p}</span>${escapeHtml(d.content || '')}</div>`; });
        showModal('Diff: ' + r.fileName, h + '</div>');
    }));

    // Export / Import
    function gatherSettings() {
        const sp = []; document.querySelectorAll('.plugin-checkbox').forEach(c => { if (c.checked) sp.push(c.value); });
        return { supermemoryKey: document.getElementById('txtSupermemoryKey').value.trim(), openSyncKey: document.getElementById('txtOpenSyncKey').value.trim(), openSyncUrl: document.getElementById('txtOpenSyncUrl').value.trim(), backup: document.getElementById('chkBackup').checked, npmInstall: document.getElementById('chkNpmInstall').checked, selectedPlugins: sp, agentModels: gatherAgentModels() };
    }
    document.getElementById('btnExport').addEventListener('click', async () => { const r = await window.api.exportSettings(gatherSettings()); if (r.saved) showModal('Exported', `<p style="color:var(--accent-green)">✓ Saved to:<br><code style="font-size:11px;">${r.path}</code></p>`); });
    document.getElementById('btnImport').addEventListener('click', async () => {
        const r = await window.api.importSettings(); if (!r.loaded) { if (r.error) showModal('Error', `<p style="color:var(--accent-red)">${r.error}</p>`); return; }
        const s = r.settings;
        if (s.supermemoryKey) document.getElementById('txtSupermemoryKey').value = s.supermemoryKey;
        if (s.openSyncKey) document.getElementById('txtOpenSyncKey').value = s.openSyncKey;
        if (s.openSyncUrl) document.getElementById('txtOpenSyncUrl').value = s.openSyncUrl;
        if (typeof s.backup === 'boolean') document.getElementById('chkBackup').checked = s.backup;
        if (typeof s.npmInstall === 'boolean') document.getElementById('chkNpmInstall').checked = s.npmInstall;
        if (s.selectedFiles) document.querySelectorAll('.file-checkbox').forEach(c => c.checked = s.selectedFiles.includes(c.value));
        valField('txtSupermemoryKey', 'valSupermemory'); valField('txtOpenSyncKey', 'valOpenSyncKey'); valField('txtOpenSyncUrl', 'valOpenSyncUrl');
        // Restore agent models if saved
        if (s.agentModels) {
            const allAgents = ['sisyphus', 'prometheus', 'metis', 'oracle', 'hephaestus', 'momus', 'atlas', 'librarian', 'explore', 'multimodal_looker'];
            allAgents.forEach(a => { const sel = document.getElementById('selAgent_' + a); if (sel && s.agentModels[a]) sel.value = s.agentModels[a]; });
            // Sync group dropdowns from per-agent values
            Object.entries(AGENT_GROUPS).forEach(([group, agents]) => {
                const gSel = document.getElementById('selGroup' + group.charAt(0).toUpperCase() + group.slice(1));
                if (gSel && s.agentModels[agents[0]]) gSel.value = s.agentModels[agents[0]];
            });
        }
        showModal('Imported', `<p style="color:var(--accent-green)">✓ Settings loaded</p>`);
    });

    // ── Page 4: Install ──
    const logContent = document.getElementById('logContent'), progressBar = document.getElementById('installProgress');
    const installTitle = document.getElementById('installTitle'), installSubtitle = document.getElementById('installSubtitle');

    function startInstallation() { logContent.innerHTML = ''; progressBar.style.width = '0%'; window.api.startInstall(gatherSettings()); }
    window.api.onInstallProgress(p => { progressBar.style.width = p + '%'; });
    window.api.onInstallLog(l => { const d = document.createElement('div'); d.className = 'log-row log-' + l.type; const px = l.type === 'success' ? '  [OK]  ' : l.type === 'error' ? '  [ERR] ' : l.type === 'warn' ? '  [!]   ' : '  [i]   '; d.textContent = l.message ? px + l.message : ''; logContent.appendChild(d); logContent.scrollTop = logContent.scrollHeight; });
    window.api.onInstallComplete(r => {
        if (r.success) { installTitle.textContent = 'Complete!'; installSubtitle.textContent = 'Semua konfigurasi berhasil di-install'; document.getElementById('txtConfigPath').textContent = r.configPath; }
        else { installTitle.textContent = 'Failed'; installSubtitle.textContent = r.error; }
        document.getElementById('btnNext4').classList.remove('hidden');
    });

    // ── Page 5: Done ──
    document.getElementById('btnNext4').addEventListener('click', () => navigateTo(5));
    document.getElementById('btnOpenFolder').addEventListener('click', () => window.api.openConfigFolder());
    document.getElementById('btnAuthLogin').addEventListener('click', () => window.api.runAuthLogin());
    document.getElementById('btnRunCLI').addEventListener('click', () => window.api.runOpencodeCLI());
    document.getElementById('btnRunWeb').addEventListener('click', () => window.api.runOpencodeWeb());
    document.getElementById('btnFinish').addEventListener('click', () => window.api.close());
});
