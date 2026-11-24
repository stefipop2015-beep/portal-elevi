const fs = require('fs');
const path = require('path');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
const catalogPath = path.join(root, 'catalog.json');
const indexHtmlPath = path.join(root, 'index.html');
const index1HtmlPath = path.join(root, 'index1.html');
const verifyScriptPath = 'C:/Users/x/.gemini/antigravity/brain/e9ee493a-6022-4e50-9836-0013bfca964d/scratch/verify_portal.js';

// 1. Read catalog.json
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// 2. Find x-m2 in clasa-x
const clsX = catalog.classes.find(c => c.id === 'clasa-x' || c.code === 'X');
if (!clsX) throw new Error('clasa-x not found in catalog');
const xM2 = clsX.modules.find(m => m.id === 'x-m2');
if (!xM2) throw new Error('x-m2 not found in clasa-x');

// 3. New work M2X-POR-S08
const newWork = {
  id: "m2x-por-s08",
  cod: "M2X-POR-S08",
  titlu: "Porți logice: NU, ȘI, SAU (S08)",
  cale_simulator: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-POR-S08-porti-nu-si-sau/simulator-porti.html",
  cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-POR-S08-porti-nu-si-sau/01-fisa-documentare-porti-nu-si-sau.pdf",
  fise_lucru: [
    {
      titlu: "Fișă de documentare: Porți NU, ȘI, SAU (Doc)",
      cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-POR-S08-porti-nu-si-sau/01-fisa-documentare-porti-nu-si-sau.pdf"
    },
    {
      titlu: "Fișă de lucru: Porți NU, ȘI, SAU (Lucru)",
      cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-POR-S08-porti-nu-si-sau/02-fisa-lucru-porti-nu-si-sau.pdf"
    },
    {
      titlu: "Fișă de laborator: Verificarea tabelelor în simulator (Lab)",
      cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-POR-S08-porti-nu-si-sau/03-fisa-laborator-verificarea-tabelelor-in-simulator.pdf"
    }
  ]
};

// Check if already present, if so replace, else append
const existingIdx = xM2.lucrari.findIndex(w => w.id === 'm2x-por-s08');
if (existingIdx >= 0) {
  xM2.lucrari[existingIdx] = newWork;
} else {
  xM2.lucrari.push(newWork);
}

// 4. Save catalog.json
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log('Saved catalog.json successfully with M2X-POR-S08.');

// 5. Update fallback in index.html and index1.html
const fallbackJsonStr = JSON.stringify(catalog);

[indexHtmlPath, index1HtmlPath].forEach(targetFile => {
  let html = fs.readFileSync(targetFile, 'utf8');
  const fallbackRegex = /const fallback = \{.*?\};/s;
  if (!fallbackRegex.test(html)) {
    throw new Error('Could not find const fallback = in ' + targetFile);
  }
  html = html.replace(fallbackRegex, 'const fallback = ' + fallbackJsonStr + ';');
  fs.writeFileSync(targetFile, html, 'utf8');
  console.log('Saved fallback in', path.basename(targetFile));
});

// 6. Update verify_portal.js
let verifyCode = fs.readFileSync(verifyScriptPath, 'utf8');

// Update summary count for x-m2: 'Vezi 3 activități practice'
verifyCode = verifyCode.replace(
  "assert(m2xSummary.textContent === 'Vezi 2 activități practice', `x-m2 summary was: ${m2xSummary.textContent}`);",
  "assert(m2xSummary.textContent === 'Vezi 3 activități practice', `x-m2 summary was: ${m2xSummary.textContent}`);"
);

// Update work-items count for x-m2: 3
verifyCode = verifyCode.replace(
  "assert(m2xWorkItems.length === 2, `Expected 2 work-items in x-m2, got ${m2xWorkItems.length}`);",
  "assert(m2xWorkItems.length === 3, `Expected 3 work-items in x-m2, got ${m2xWorkItems.length}`);"
);

// Add check for M2X-POR-S08
const s08Check = `
// Check M2X-POR-S08 (1 simulator + 3 PDF links)
const s08Links = m2xWorkItems[2].querySelectorAll(el => el.tagName === 'A');
assert(s08Links.length === 4, \`Expected 4 buttons on M2X-POR-S08 (1 sim + 3 PDF), got \${s08Links.length}\`);
assert(s08Links[0].fullText === 'Deschide Simulator', \`Expected first button to be 'Deschide Simulator', got \${s08Links[0].fullText}\`);
for (const link of s08Links) {
  const filePath = path.resolve(root, link.href);
  assert(fs.existsSync(filePath), \`M2X-POR-S08 link does not exist on disk: \${link.href} (\${filePath})\`);
}
`;

if (!verifyCode.includes('// Check M2X-POR-S08')) {
  verifyCode = verifyCode.replace(
    "// Check modules without activities",
    s08Check + "\n// Check modules without activities"
  );
}

// Update allLinks count check (39 + 4 = 43)
verifyCode = verifyCode.replace(
  "assert(allLinks.length === 39, `Expected 39 resource links in moduleGrid (34 previous + 5 in x-m2), got ${allLinks.length}`);",
  "assert(allLinks.length === 43, `Expected 43 resource links in moduleGrid (39 previous + 4 in M2X-POR-S08), got ${allLinks.length}`);"
);

fs.writeFileSync(verifyScriptPath, verifyCode, 'utf8');
console.log('Saved updated verify_portal.js successfully.');
