const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputPath = 'C:\\Users\\Pramodkumar\\.gemini\\antigravity-ide\\brain\\127d1fbb-f988-415f-a6e4-8ba5ff8be171\\assetly_app_icon_bold_1786177585150.png';
const outputPath = 'P:\\SaaS\\git_personal\\asset-management\\apps\\client-gui\\assets\\icon.png';
const trayPath = 'P:\\SaaS\\git_personal\\asset-management\\apps\\client-gui\\assets\\tray.png';

// Use a quick node script using built-in zlib or PNG helper or simple canvas
console.log('Processing icon...');
fs.copyFileSync(inputPath, outputPath);
fs.copyFileSync(inputPath, trayPath);
console.log('Copied icon successfully!');
