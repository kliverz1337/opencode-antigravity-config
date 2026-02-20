#!/usr/bin/env node

// CLI launcher — spawns Electron with the GUI
const { spawn } = require('child_process');
const path = require('path');

const electronPath = require('electron');
const appPath = path.join(__dirname);

const child = spawn(electronPath, [appPath], {
    stdio: 'inherit',
    windowsHide: false
});

child.on('close', (code) => {
    process.exit(code);
});
