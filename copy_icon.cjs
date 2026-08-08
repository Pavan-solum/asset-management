const fs = require('fs');

const inputPath = 'C:\\Users\\Pramodkumar\\.gemini\\antigravity-ide\\brain\\127d1fbb-f988-415f-a6e4-8ba5ff8be171\\assetly_app_icon_bold_1786177585150.png';
const iconPath = 'P:\\SaaS\\git_personal\\asset-management\\apps\\client-gui\\assets\\icon.png';
const trayPath = 'P:\\SaaS\\git_personal\\asset-management\\apps\\client-gui\\assets\\tray.png';

fs.copyFileSync(inputPath, iconPath);
fs.copyFileSync(inputPath, trayPath);
console.log('COPIED_BOLD_ICON_SUCCESSFULLY');
