const fs = require('fs');
const path = require('path');

function getBase64Config(filename) {
    const filePath = path.join(__dirname, 'templates', filename);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return Buffer.from(content).toString('base64');
    } catch (e) {
        console.error(`Failed to read template ${filename}:`, e.message);
        return "";
    }
}

// Export Base64 encoded configs, read dynamically from the templates/ folder
module.exports = {
    dcp_jsonc: getBase64Config('dcp.jsonc'),
    oh_my_opencode_jsonc: getBase64Config('oh-my-opencode.jsonc'),
    opencode_sync_jsonc: getBase64Config('opencode-sync.jsonc'),
    opencode_json: getBase64Config('opencode.json'),
    package_json: getBase64Config('package.json'),
    supermemory_jsonc: getBase64Config('supermemory.jsonc')
};
