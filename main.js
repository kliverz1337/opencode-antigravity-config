const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const { exec, spawn } = require('child_process');
const configData = require('./config-data.js');

let mainWindow;
const configDir = path.join(os.homedir(), '.config', 'opencode');

const pkg = require('./package.json');
const CONFIG_VERSION = pkg.version;
const CONFIG_DATE = new Date().toISOString().split('T')[0];
const VERSION_CHECK_URL = '';

const BUNDLED_CONFIGS = [
    { name: "opencode.json", key: "opencode_json", sensitive: false },
    { name: "oh-my-opencode.jsonc", key: "oh_my_opencode_jsonc", sensitive: false },
    { name: "dcp.jsonc", key: "dcp_jsonc", sensitive: false },
    { name: "supermemory.jsonc", key: "supermemory_jsonc", sensitive: true },
    { name: "opencode-sync.jsonc", key: "opencode_sync_jsonc", sensitive: true },
    { name: "package.json", key: "package_json", sensitive: false }
];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 860,
        height: 680,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: fs.existsSync(path.join(__dirname, 'app.ico'))
            ? path.join(__dirname, 'app.ico')
            : fs.existsSync(path.join(__dirname, 'app.png'))
                ? path.join(__dirname, 'app.png')
                : undefined
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Window Controls
ipcMain.on('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.on('window-close', () => { if (mainWindow) mainWindow.close(); });
ipcMain.on('open-config-folder', () => { if (fs.existsSync(configDir)) shell.openPath(configDir); });

// Cross-platform terminal launcher
function openTerminalWith(command) {
    const opts = { detached: true, stdio: 'ignore' };
    if (process.platform === 'win32') {
        spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', ...command.split(' ')], opts);
    } else if (process.platform === 'darwin') {
        // macOS: use osascript to open Terminal.app with command
        const script = `tell application "Terminal" to do script "${command}"`;
        spawn('osascript', ['-e', script], opts);
    } else {
        // Linux: detect available terminal emulator, then launch
        const { execSync } = require('child_process');
        const hasCmd = (cmd) => { try { execSync(`which ${cmd}`, { stdio: 'ignore' }); return true; } catch { return false; } };
        const terminals = [
            { test: 'x-terminal-emulator', cmd: 'x-terminal-emulator', args: ['-e', `bash -c '${command}; exec bash'`] },
            { test: 'gnome-terminal', cmd: 'gnome-terminal', args: ['--', 'bash', '-c', `${command}; exec bash`] },
            { test: 'konsole', cmd: 'konsole', args: ['-e', 'bash', '-c', `${command}; exec bash`] },
            { test: 'xterm', cmd: 'xterm', args: ['-hold', '-e', command] }
        ];
        const found = terminals.find(t => hasCmd(t.test));
        if (found) {
            const p = spawn(found.cmd, found.args, opts);
            p.unref();
        } else {
            // Fallback: run in background bash
            const p = spawn('bash', ['-c', command], opts);
            p.unref();
        }
    }
}

ipcMain.on('run-auth-login', () => openTerminalWith('opencode auth login'));
ipcMain.on('run-opencode-cli', () => openTerminalWith('opencode'));
ipcMain.on('run-opencode-web', () => openTerminalWith('opencode web --port 8080'));

function runCommand(cmd) {
    return new Promise(resolve => {
        exec(cmd, { timeout: 15000 }, (err, stdout) => resolve(err ? null : stdout.trim()));
    });
}

// Config Metadata
ipcMain.handle('get-config-meta', async () => ({
    version: CONFIG_VERSION, date: CONFIG_DATE, fileCount: Object.keys(configData).length
}));

// System Check
ipcMain.handle('check-system', async () => {
    const items = [];
    const nodeVer = await runCommand('node -v');
    items.push(nodeVer ? { label: 'Node.js', value: nodeVer, status: 'ok' } : { label: 'Node.js', value: 'Not found', status: 'fail' });
    const npmVer = await runCommand('npm -v');
    items.push(npmVer ? { label: 'npm', value: 'v' + npmVer, status: 'ok' } : { label: 'npm', value: 'Not found', status: 'fail' });
    const ocVer = await runCommand('opencode --version');
    items.push(ocVer ? { label: 'OpenCode', value: ocVer, status: 'ok' } : { label: 'OpenCode', value: 'Not found — npm i -g opencode@latest', status: 'warn' });
    const bk = Object.keys(configData).length;
    const expectedConfigs = BUNDLED_CONFIGS.length;
    items.push({ label: 'Embedded Configs', value: `${bk}/${expectedConfigs} files`, status: bk === expectedConfigs ? 'ok' : 'fail' });
    if (fs.existsSync(configDir)) {
        const f = fs.readdirSync(configDir).filter(x => x.endsWith('.json') || x.endsWith('.jsonc'));
        items.push(f.length > 0 ? { label: 'Existing Config', value: `${f.length} files (will backup)`, status: 'warn' } : { label: 'Config Dir', value: 'Exists, empty', status: 'ok' });
    } else {
        items.push({ label: 'Config Dir', value: 'Will be created', status: 'ok' });
    }
    items.push({ label: 'System', value: `${os.type()} ${os.release()} | ${os.userInfo().username}`, status: 'ok' });
    return { items };
});

// Get Existing Keys
ipcMain.handle('get-existing-keys', async () => {
    const keys = { supermemoryKey: '', openSyncKey: '', openSyncUrl: '' };
    try {
        if (!fs.existsSync(configDir)) return keys;
        const smPath = path.join(configDir, 'supermemory.jsonc');
        if (fs.existsSync(smPath)) { const c = fs.readFileSync(smPath, 'utf8'); const m = c.match(/"apiKey"\s*:\s*"([^"]+)"/); if (m && m[1] && m[1] !== "__SUPERMEMORY_API_KEY__") keys.supermemoryKey = m[1]; }
        const osPath = path.join(configDir, 'opencode-sync.jsonc');
        if (fs.existsSync(osPath)) { const c = fs.readFileSync(osPath, 'utf8'); const mk = c.match(/"apiKey"\s*:\s*"([^"]+)"/); if (mk && mk[1] && mk[1] !== "__OPENSYNC_API_KEY__") keys.openSyncKey = mk[1]; const mu = c.match(/"convexUrl"\s*:\s*"([^"]+)"/); if (mu && mu[1] && mu[1] !== "__OPENSYNC_CONVEX_URL__") keys.openSyncUrl = mu[1]; }
    } catch (e) { }
    return keys;
});

// Preview Config
ipcMain.handle('preview-config', async (ev, fileName) => {
    const cfg = BUNDLED_CONFIGS.find(c => c.name === fileName);
    if (!cfg || !configData[cfg.key]) return { error: 'Not found' };
    return { content: Buffer.from(configData[cfg.key], 'base64').toString('utf8'), fileName: cfg.name };
});

// Diff Config
ipcMain.handle('preview-final-opencode', async (ev, plugins) => {
    const b64 = configData['opencode_json'];
    let content = Buffer.from(b64, 'base64').toString('utf8');
    if (plugins) {
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed.plugin)) {
                parsed.plugin = parsed.plugin.filter(p => plugins.includes(p));
                content = JSON.stringify(parsed, null, 4);
            }
        } catch (e) { }
    }
    return { fileName: 'opencode.json', content };
});

ipcMain.handle('diff-config', async (ev, fileName) => {
    const cfg = BUNDLED_CONFIGS.find(c => c.name === fileName);
    if (!cfg || !configData[cfg.key]) return { error: 'Not found' };
    const newContent = Buffer.from(configData[cfg.key], 'base64').toString('utf8');
    const ep = path.join(configDir, fileName);
    if (!fs.existsSync(ep)) return { isNew: true, newContent, fileName };
    const oldContent = fs.readFileSync(ep, 'utf8');
    const oL = oldContent.split('\n'), nL = newContent.split('\n');
    const max = Math.max(oL.length, nL.length);
    const diffLines = [];
    for (let i = 0; i < max; i++) {
        const o = i < oL.length ? oL[i] : undefined, n = i < nL.length ? nL[i] : undefined;
        if (o === undefined) diffLines.push({ type: 'add', content: n });
        else if (n === undefined) diffLines.push({ type: 'del', content: o });
        else if (o.trimEnd() !== n.trimEnd()) { diffLines.push({ type: 'del', content: o }); diffLines.push({ type: 'add', content: n }); }
        else diffLines.push({ type: 'same', content: o });
    }
    return { isNew: false, hasChanges: diffLines.some(d => d.type !== 'same'), diffLines, fileName };
});

// Export / Import
ipcMain.handle('export-settings', async (ev, settings) => {
    const r = await dialog.showSaveDialog(mainWindow, { title: 'Export Settings', defaultPath: path.join(os.homedir(), 'Desktop', 'antigravity-settings.json'), filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (r.canceled) return { saved: false };
    fs.writeFileSync(r.filePath, JSON.stringify(settings, null, 2), 'utf8');
    return { saved: true, path: r.filePath };
});

ipcMain.handle('import-settings', async () => {
    const r = await dialog.showOpenDialog(mainWindow, { title: 'Import Settings', filters: [{ name: 'JSON', extensions: ['json'] }], properties: ['openFile'] });
    if (r.canceled || !r.filePaths.length) return { loaded: false };
    try { return { loaded: true, settings: JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8')) }; }
    catch (e) { return { loaded: false, error: e.message }; }
});

// Version Check
ipcMain.handle('check-version', async () => {
    if (!VERSION_CHECK_URL) return { current: CONFIG_VERSION, latest: CONFIG_VERSION, upToDate: true, noEndpoint: true };
    return new Promise(resolve => {
        const req = https.get(VERSION_CHECK_URL, { timeout: 5000 }, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => { try { const j = JSON.parse(d); resolve({ current: CONFIG_VERSION, latest: j.version || CONFIG_VERSION, upToDate: (j.version || CONFIG_VERSION) === CONFIG_VERSION }); } catch (e) { resolve({ current: CONFIG_VERSION, latest: CONFIG_VERSION, upToDate: true, error: 'Parse error' }); } });
        });
        req.on('error', () => resolve({ current: CONFIG_VERSION, latest: CONFIG_VERSION, upToDate: true, error: 'Network error' }));
        req.on('timeout', () => { req.destroy(); resolve({ current: CONFIG_VERSION, latest: CONFIG_VERSION, upToDate: true, error: 'Timeout' }); });
    });
});

// Uninstall
ipcMain.handle('uninstall-config', async () => {
    if (!fs.existsSync(configDir)) return { success: false, message: 'Config directory not found' };
    const files = fs.readdirSync(configDir).filter(f => f.endsWith('.json') || f.endsWith('.jsonc'));
    if (!files.length) return { success: false, message: 'No config files found' };
    try {
        const ds = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const bd = path.join(configDir, `.uninstall-backup-${ds}`);
        fs.mkdirSync(bd, { recursive: true });
        for (const f of files) { fs.copyFileSync(path.join(configDir, f), path.join(bd, f)); fs.unlinkSync(path.join(configDir, f)); }
        return { success: true, removed: files, backupDir: path.basename(bd) };
    } catch (e) { return { success: false, message: e.message }; }
});

// Install Flow
function sendLog(type, message) { if (mainWindow) mainWindow.webContents.send('install-log', { type, message }); }
function sendProgress(pct) { if (mainWindow) mainWindow.webContents.send('install-progress', pct); }

ipcMain.on('start-install', async (ev, config) => {
    try {
        sendLog('info', 'Creating config directory...'); await new Promise(r => setTimeout(r, 100));
        if (!fs.existsSync(configDir)) { fs.mkdirSync(configDir, { recursive: true }); sendLog('success', `Created: ${configDir}`); }
        else sendLog('info', `Directory exists: ${configDir}`);
        sendProgress(10);

        if (config.backup && fs.existsSync(configDir)) {
            const ds = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const bd = path.join(configDir, `.backup-${ds}`);
            const ef = fs.readdirSync(configDir).filter(f => f.endsWith('.json') || f.endsWith('.jsonc'));
            if (ef.length) {
                sendLog('info', 'Backing up...'); fs.mkdirSync(bd);
                for (const f of ef) { fs.copyFileSync(path.join(configDir, f), path.join(bd, f)); sendLog('info', `Backed up: ${f}`); await new Promise(r => setTimeout(r, 60)); }
                sendLog('success', `Backup: ${path.basename(bd)}`);
                // Auto-cleanup old backups (Keep last 3)
                try {
                    const backups = fs.readdirSync(configDir).filter(d => (d.startsWith('.backup-') || d.startsWith('.uninstall-backup-')) && fs.statSync(path.join(configDir, d)).isDirectory()).sort((a, b) => b.localeCompare(a));
                    if (backups.length > 3) {
                        const toRemove = backups.slice(3);
                        sendLog('info', `Cleaning ${toRemove.length} old backup(s)...`);
                        toRemove.forEach(rmBase => {
                            fs.rmSync(path.join(configDir, rmBase), { recursive: true, force: true });
                            sendLog('info', `Deleted: ${rmBase}`);
                        });
                    }
                } catch (ce) { sendLog('warn', `Cleanup skipped: ${ce.message}`); }
            }
        }
        sendProgress(25); await new Promise(r => setTimeout(r, 100));

        const toInstall = BUNDLED_CONFIGS;
        let step = 25; const inc = toInstall.length > 0 ? 40 / toInstall.length : 40;

        for (const cfg of toInstall) {
            const b64 = configData[cfg.key]; if (!b64) { sendLog('warn', `Skip: ${cfg.name}`); step += inc; continue; }
            let content = Buffer.from(b64, 'base64').toString('utf8');
            if (cfg.sensitive) {
                if (cfg.name === 'supermemory.jsonc' && config.supermemoryKey) { content = content.replace('__SUPERMEMORY_API_KEY__', config.supermemoryKey); sendLog('info', 'Supermemory key injected'); }
                if (cfg.name === 'opencode-sync.jsonc') { if (config.openSyncKey) { content = content.replace('__OPENSYNC_API_KEY__', config.openSyncKey); sendLog('info', 'OpenSync key injected'); } if (config.openSyncUrl) { content = content.replace('__OPENSYNC_CONVEX_URL__', config.openSyncUrl); sendLog('info', 'OpenSync URL injected'); } }
            }
            // Filter plugins in opencode.json based on user selection
            if (cfg.name === 'opencode.json' && config.selectedPlugins) {
                try {
                    const parsed = JSON.parse(content);
                    if (Array.isArray(parsed.plugin)) {
                        const original = parsed.plugin.length;
                        parsed.plugin = parsed.plugin.filter(p => config.selectedPlugins.includes(p));
                        sendLog('info', `Plugins: ${parsed.plugin.length}/${original} selected`);
                        parsed.plugin.forEach(p => sendLog('info', `  ✓ ${p}`));
                        content = JSON.stringify(parsed, null, 4);
                    }
                } catch (e) { sendLog('warn', `Plugin filter skipped: ${e.message}`); }
            }
            // Inject custom agent models into oh-my-opencode.jsonc
            if (cfg.name === 'oh-my-opencode.jsonc' && config.agentModels) {
                try {
                    const agentKeyMap = { multimodal_looker: 'multimodal-looker' };
                    let changed = 0;

                    Object.entries(config.agentModels).forEach(([key, model]) => {
                        const jsonKey = agentKeyMap[key] || key;
                        const re = new RegExp(`("${jsonKey}"\\s*:\\s*\\{[^}]*?"model"\\s*:\\s*)"([^"]*)"`, 's');
                        const match = content.match(re);
                        if (match && match[2] !== model) {
                            content = content.replace(re, `$1"${model}"`);
                            sendLog('info', `Agent ${jsonKey}: ${match[2].split('/').pop()} → ${model.split('/').pop()}`);
                            changed++;
                        }
                    });

                    // Also update categories based on agent groups
                    const heavyModel = config.agentModels.sisyphus || 'google/antigravity-gemini-3.1-pro';
                    const lightModel = config.agentModels.librarian || 'google/antigravity-gemini-3-flash';
                    const catMap = {
                        'visual-engineering': heavyModel, 'ultrabrain': heavyModel, 'deep': heavyModel,
                        'artistry': heavyModel, 'unspecified-high': heavyModel, 'unspecified-low': heavyModel,
                        'quick': lightModel, 'writing': lightModel
                    };

                    Object.entries(catMap).forEach(([cat, model]) => {
                        const re = new RegExp(`("${cat}"\\s*:\\s*\\{[^}]*?"model"\\s*:\\s*)"([^"]*)"`, 's');
                        const match = content.match(re);
                        if (match && match[2] !== model) {
                            content = content.replace(re, `$1"${model}"`);
                            changed++;
                        }
                    });

                    if (changed > 0) sendLog('success', `Agent models: ${changed} updated`);
                    else sendLog('info', 'Agent models: no changes (using defaults)');
                } catch (e) { sendLog('warn', `Agent model injection skipped: ${e.message}`); }
            }
            fs.writeFileSync(path.join(configDir, cfg.name), content, 'utf8');
            sendLog('success', `Installed: ${cfg.name}`); step += inc; sendProgress(Math.min(Math.floor(step), 65));
            await new Promise(r => setTimeout(r, 120));
        }
        sendProgress(65);

        if (config.npmInstall) {
            sendLog('info', ''); sendLog('info', 'Running npm install...');
            const ok = await new Promise(resolve => {
                const p = spawn(process.platform === 'win32' ? 'cmd.exe' : 'npm', process.platform === 'win32' ? ['/c', 'npm', 'install'] : ['install'], { cwd: configDir, env: { ...process.env } });
                let prog = 65;
                p.stdout.on('data', d => { for (const l of d.toString().trim().split('\n')) { if (l.trim()) { sendLog('info', `  npm: ${l.trim()}`); prog = Math.min(prog + 2, 88); sendProgress(prog); } } });
                p.stderr.on('data', d => { for (const l of d.toString().trim().split('\n')) { if (l.trim() && !l.includes('npm warn')) sendLog('warn', `  npm: ${l.trim()}`); } });
                p.on('close', c => resolve(c === 0)); p.on('error', () => resolve(false));
            });
            sendLog(ok ? 'success' : 'warn', ok ? 'npm dependencies installed' : 'npm install had warnings');
        } else sendLog('info', 'Skipped npm install');

        sendProgress(90); await new Promise(r => setTimeout(r, 100));
        sendLog('info', ''); sendLog('info', '─── Verification ───');
        const cnt = fs.existsSync(configDir) ? fs.readdirSync(configDir).filter(f => f.endsWith('.json') || f.endsWith('.jsonc')).length : 0;
        sendLog('success', `${cnt} config files installed`);
        sendProgress(100); await new Promise(r => setTimeout(r, 200));
        sendLog('info', ''); sendLog('success', '🎉 Installation complete!');
        mainWindow.webContents.send('install-complete', { success: true, configPath: configDir });
    } catch (e) {
        sendLog('error', `ERROR: ${e.message}`);
        mainWindow.webContents.send('install-complete', { success: false, error: e.message });
    }
});
