const translations = {
    // Top Bar & Steps
    'Welcome': { EN: 'Welcome', ID: 'Menu Utama' },
    'oMo Model': { EN: 'oMo Model', ID: 'oMo Model' },
    'System': { EN: 'System', ID: 'Sistem' },
    'Config': { EN: 'Config', ID: 'Konfigurasi' },
    'Install': { EN: 'Install', ID: 'Instal' },
    'Done': { EN: 'Done', ID: 'Selesai' },

    // Page 0: Welcome
    'Install konfigurasi lengkap Opencode Antigravity stack:': { EN: 'Install full Opencode Antigravity stack config:', ID: 'Install konfigurasi lengkap Opencode Antigravity stack:' },
    'Get Started →': { EN: 'Get Started →', ID: 'Mulai →' },
    '🔄 Updates': { EN: '🔄 Updates', ID: '🔄 Cek Update' },
    '🗑 Uninstall': { EN: '🗑 Uninstall', ID: '🗑 Copot' },

    // Page 1: oMo Agent Model
    'oMo Agent Model': { EN: 'oMo Agent Model', ID: 'Model AI oMo Agent' },
    'Konfigurasi model AI untuk setiap agent': { EN: 'Configure AI model for each agent', ID: 'Konfigurasi model AI untuk setiap agent' },

    // Page 2: System Check
    'System Check': { EN: 'System Check', ID: 'Cek Sistem' },
    'Checking environment...': { EN: 'Checking environment...', ID: 'Memeriksa system...' },
    '🔄 Re-check': { EN: '🔄 Re-check', ID: '🔄 Cek Ulang' },
    '← Back': { EN: '← Back', ID: '← Kembali' },
    'Continue →': { EN: 'Continue →', ID: 'Lanjutkan →' },

    // Page 3: Config
    'Configuration': { EN: 'Configuration', ID: 'Konfigurasi' },
    'API Keys & file selection': { EN: 'API Keys & file selection', ID: 'API Key & pemilihan file' },
    '📥 Import': { EN: '📥 Import', ID: '📥 Ambil' },
    '📤 Export': { EN: '📤 Export', ID: '📤 Simpan' },
    '(Optional)': { EN: '(Optional)', ID: '(Opsional)' },
    'API Key (console.supermemory.ai/keys)': { EN: 'API Key (console.supermemory.ai/keys)', ID: 'API Key (console.supermemory.ai/keys)' },
    'API Key (opensync.dev → Settings)': { EN: 'API Key (opensync.dev → Settings)', ID: 'API Key (opensync.dev → Pengaturan)' },
    'Convex URL': { EN: 'Convex URL', ID: 'URL Convex' },
    'FILES TO INSTALL': { EN: 'FILES TO INSTALL', ID: 'FILE UNTUK DIINSTAL' },
    'All': { EN: 'All', ID: 'Semua' },
    'None': { EN: 'None', ID: 'Kosong' },
    'OPTIONS': { EN: 'OPTIONS', ID: 'PILIHAN' },
    'PLUGINS': { EN: 'PLUGINS', ID: 'PLUGIN' },
    'Backup konfigurasi lama': { EN: 'Backup old configuration', ID: 'Backup konfigurasi lama' },
    'Jalankan npm install': { EN: 'Run npm install', ID: 'Jalankan npm install' },
    'Install Now →': { EN: 'Install Now →', ID: 'Mulai Instal →' },

    // Page 4: Installing
    'Installing...': { EN: 'Installing...', ID: 'Menginstal...' },
    'Menyalin konfigurasi...': { EN: 'Copying configurations...', ID: 'Menyalin konfigurasi...' },
    'Log': { EN: 'Log', ID: 'Log' },
    'Finish ✓': { EN: 'Finish ✓', ID: 'Selesai ✓' },

    // Page 5: Done
    'Installation Complete!': { EN: 'Installation Complete!', ID: 'Instalasi Selesai!' },
    'Antigravity OpenCode siap digunakan': { EN: 'Antigravity OpenCode is ready to use', ID: 'Antigravity OpenCode siap digunakan' },
    '📁 Config Location': { EN: '📁 Config Location', ID: '📁 Lokasi Config' },
    '🚀 Next Steps': { EN: '🚀 Next Steps', ID: '🚀 Langkah Berikut' },
    '📂 Config': { EN: '📂 Config', ID: '📂 Buka Config' },
    '🔑 Auth': { EN: '🔑 Auth', ID: '🔑 Login' },
    '💻 CLI': { EN: '💻 CLI', ID: '💻 CLI' },
    '🌐 Web': { EN: '🌐 Web', ID: '🌐 Web 8080' },
    'Close': { EN: 'Close', ID: 'Tutup' },

    // Modals & Dynamic
    '✓ Set': { EN: '✓ Set', ID: '✓ Diisi' },
    '✗ Invalid': { EN: '✗ Invalid', ID: '✗ Tidak Valid' },
    'Checking...': { EN: 'Checking...', ID: 'Memeriksa...' },
    'Not found — npm i -g opencode@latest': { EN: 'Not found — run npm i -g opencode@latest', ID: 'Tidak ada — jalankan npm i -g opencode@latest' },
    '🔒 Core (Required)': { EN: '🔒 Core (Required)', ID: '🔒 Wajib (Core)' },
    '⚙️ Optional': { EN: '⚙️ Optional', ID: '⚙️ Opsional' },
    '⚠ No key': { EN: '⚠ No key', ID: '⚠ Tanpa key' },
    '👁 Preview opencode.json': { EN: '👁 Preview opencode.json', ID: '👁 Pratinjau opencode.json' },

    // Close Modal
    'Close confirm title': { EN: 'Close Application', ID: 'Tutup Aplikasi' },
    'Close confirm text': { EN: 'Are you sure you want to exit the setup?', ID: 'Apakah Anda yakin ingin keluar dari program?' },
    'Close cancel': { EN: 'No', ID: 'Tidak' },
    'Close exit': { EN: 'Yes, Exit', ID: 'Ya, Keluar' }
};

let currentLang = 'ID'; // Default

function t(key) {
    if (!translations[key]) return key;
    return translations[key][currentLang] || key;
}

// Elements mapping explicitly for DOM nodes
// Page layout: 0=Welcome, 1=oMo Model, 2=System, 3=Config, 4=Install, 5=Done
const tMap = [
    // Step indicators (6 steps)
    { selector: '#step0 span', key: 'Welcome' },
    { selector: '#step1 span', key: 'oMo Model' },
    { selector: '#step2 span', key: 'System' },
    { selector: '#step3 span', key: 'Config' },
    { selector: '#step4 span', key: 'Install' },
    { selector: '#step5 span', key: 'Done' },

    // Page 0: Welcome
    { selector: '#page0 .subtitle', key: 'Install konfigurasi lengkap Opencode Antigravity stack:' },
    { selector: '#btnStart', key: 'Get Started →', isNode: true },
    { selector: '#btnVersionCheck', key: '🔄 Updates' },
    { selector: '#btnUninstall', key: '🗑 Uninstall' },

    // Page 1: oMo Agent Model
    { selector: '#page1 .page-header h2', key: 'oMo Agent Model' },
    { selector: '#page1 .page-header p', key: 'Konfigurasi model AI untuk setiap agent' },
    { selector: '#btnPrev1', key: '← Back' },
    { selector: '#btnNext1', key: 'Continue →' },

    // Page 2: System Check
    { selector: '#page2 .page-header h2', key: 'System Check' },
    { selector: '#page2 .page-header p', key: 'Checking environment...' },
    { selector: '#btnRecheck', key: '🔄 Re-check' },
    { selector: '#btnPrev2', key: '← Back' },
    { selector: '#btnNext2', key: 'Continue →' },

    // Page 3: Config
    { selector: '#page3 .page-header h2', key: 'Configuration' },
    { selector: '#page3 .page-header p', key: 'API Keys & file selection' },
    { selector: '#btnImport', key: '📥 Import' },
    { selector: '#btnExport', key: '📤 Export' },
    { selector: '#page3 .form-group:nth-of-type(2) .help-text', key: 'API Key (console.supermemory.ai/keys)' },
    { selector: '#page3 .form-group:nth-of-type(3) .help-text:nth-of-type(1)', key: 'API Key (opensync.dev → Settings)' },
    { selector: '#page3 .form-group:nth-of-type(3) .label-row:nth-of-type(2) .help-text', key: 'Convex URL' },
    { selector: '#page3 .grey-label:nth-of-type(1)', key: 'FILES TO INSTALL' },
    { selector: '#btnSelectAll', key: 'All' },
    { selector: '#btnDeselectAll', key: 'None' },

    { selector: '#page3 .grey-label:nth-of-type(2)', key: 'OPTIONS' },
    { selector: '#chkBackup + .checkmark', nextSibText: 'Backup konfigurasi lama' },
    { selector: '#chkNpmInstall + .checkmark', nextSibText: 'Jalankan npm install' },

    { selector: '#lblCorePlugins', key: '🔒 Core (Required)' },
    { selector: '#lblOptionalPlugins', key: '⚙️ Optional' },
    { selector: '#warnSupermemory', key: '⚠ No key' },
    { selector: '#warnOpenSync', key: '⚠ No key' },
    { selector: '#btnPreviewConfig', key: '👁 Preview opencode.json' },

    { selector: '#btnPrev3', key: '← Back' },
    { selector: '#btnNext3', key: 'Install Now →' },

    // Page 4: Installing
    { selector: '#installTitle', key: 'Installing...' },
    { selector: '#installSubtitle', key: 'Menyalin konfigurasi...' },
    { selector: '.log-title', key: 'Log' },
    { selector: '#btnNext4', key: 'Finish ✓' },

    // Page 5: Done
    { selector: '#page5 h2', key: 'Installation Complete!' },
    { selector: '#page5 .success-text', key: 'Antigravity OpenCode siap digunakan' },
    { selector: '#page5 .cyan-label', key: '📁 Config Location' },
    { selector: '#page5 .purple-label', key: '🚀 Next Steps' },
    { selector: '#btnOpenFolder', key: '📂 Config' },
    { selector: '#btnAuthLogin', key: '🔑 Auth' },
    { selector: '#btnRunCLI', key: '💻 CLI' },
    { selector: '#btnRunWeb', key: '🌐 Web' },
    { selector: '#btnFinish', key: 'Close' }
];

function updateLanguage(lang) {
    currentLang = lang;
    window.currentLang = lang;
    document.getElementById('btnLang').textContent = lang === 'EN' ? 'EN / id' : 'ID / en';

    tMap.forEach(item => {
        const el = document.querySelector(item.selector);
        if (el) {
            if (item.nextSibText) {
                // For label checkboxes, the text is the next sibling after checkmark
                const textNode = Array.from(el.parentNode.childNodes).find(n => n.nodeType === 3 && n.textContent.trim().length > 0);
                if (textNode) textNode.textContent = t(item.nextSibText);
            } else {
                el.innerText = t(item.key);
            }
        }
    });

    // Update dynamic placeholders/indicators
    const vsm = document.getElementById('valSupermemory');
    if (vsm && vsm.classList.contains('val-empty')) vsm.textContent = t('(Optional)');
    if (vsm && vsm.classList.contains('val-ok')) vsm.textContent = t('✓ Set');
    if (vsm && vsm.classList.contains('val-bad')) vsm.textContent = t('✗ Invalid');

    const vos = document.getElementById('valOpenSyncKey');
    if (vos && vos.classList.contains('val-empty')) vos.textContent = t('(Optional)');
    if (vos && vos.classList.contains('val-ok')) vos.textContent = t('✓ Set');
    if (vos && vos.classList.contains('val-bad')) vos.textContent = t('✗ Invalid');

    const vou = document.getElementById('valOpenSyncUrl');
    if (vou && vou.classList.contains('val-empty')) vou.textContent = t('(Optional)');
    if (vou && vou.classList.contains('val-ok')) vou.textContent = t('✓ Set');
    if (vou && vou.classList.contains('val-bad')) vou.textContent = t('✗ Invalid');

    // Trigger re-render of currently visible modal if needed
    window._lastLangUpdate = Date.now();

    // Also re-run validation logic text updates
    if (typeof window.reValInputs === 'function') window.reValInputs();
}

window.t = t;
window.updateLanguage = updateLanguage;
window.currentLang = currentLang;
