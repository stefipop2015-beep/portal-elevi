const fs = require('fs');
const p = 'C:/Users/x/.gemini/antigravity/brain/e9ee493a-6022-4e50-9836-0013bfca964d/scratch/verify_portal.js';
let code = fs.readFileSync(p, 'utf8');
code = code.replace(
  "const lab05SimHtml = fs.readFileSync(path.resolve(root, lab05Links[0].href), 'utf8');",
  "const simLink = lab05Links.find(l => l.href.includes('simulator.html'));\nconst lab05SimHtml = fs.readFileSync(path.resolve(root, simLink.href), 'utf8');"
);
fs.writeFileSync(p, code, 'utf8');
console.log('Fixed verify_portal.js simLink lookup.');
