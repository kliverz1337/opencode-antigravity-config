const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.send('window-minimize'),
    close: () => ipcRenderer.send('window-close'),
    checkSystem: () => ipcRenderer.invoke('check-system'),
    getExistingKeys: () => ipcRenderer.invoke('get-existing-keys'),
    getConfigMeta: () => ipcRenderer.invoke('get-config-meta'),
    previewConfig: (fileName) => ipcRenderer.invoke('preview-config', fileName),
    diffConfig: (fileName) => ipcRenderer.invoke('diff-config', fileName),
    exportSettings: (settings) => ipcRenderer.invoke('export-settings', settings),
    importSettings: () => ipcRenderer.invoke('import-settings'),
    checkVersion: () => ipcRenderer.invoke('check-version'),
    uninstallConfig: () => ipcRenderer.invoke('uninstall-config'),
    previewFinalOpencode: (p) => ipcRenderer.invoke('preview-final-opencode', p),
    startInstall: (config) => ipcRenderer.send('start-install', config),
    onInstallProgress: (cb) => { ipcRenderer.removeAllListeners('install-progress'); ipcRenderer.on('install-progress', (e, d) => cb(d)); },
    onInstallLog: (cb) => { ipcRenderer.removeAllListeners('install-log'); ipcRenderer.on('install-log', (e, d) => cb(d)); },
    onInstallComplete: (cb) => { ipcRenderer.removeAllListeners('install-complete'); ipcRenderer.on('install-complete', (e, d) => cb(d)); },
    openConfigFolder: () => ipcRenderer.send('open-config-folder'),
    runAuthLogin: () => ipcRenderer.send('run-auth-login'),
    runOpencodeCLI: () => ipcRenderer.send('run-opencode-cli'),
    runOpencodeWeb: () => ipcRenderer.send('run-opencode-web')
});
