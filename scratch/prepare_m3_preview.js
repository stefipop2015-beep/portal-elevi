const fs = require('fs');
const path = require('path');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// Initialize with ix-m3 selected and active='IX'
html = html.replace(
  "let catalog=fallback, active='ALL', query='', selectedModuleId=null;",
  "let catalog=fallback, active='IX', query='', selectedModuleId='ix-m3';"
);

// Prevent fetch from overriding fallback
html = html.replace("fetch('./catalog.json'", "// fetch");

// Add style to focus on module panel directly under header
const focusCss = `
<style>
.hero, #noutati, #clase { display: none !important; }
main { padding-top: 1rem !important; }
</style>
`;
html = html.replace('</head>', focusCss + '\n</head>');

const previewFile = path.join(root, 'scratch', 'preview_m3_detail.html');
fs.writeFileSync(previewFile, html, 'utf8');
console.log('Written preview file focused directly on M3 detail panel');
