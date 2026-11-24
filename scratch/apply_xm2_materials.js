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

// Ensure path is clasa-X/M2-Bazele-electronicii-digitale
xM2.path = 'clasa-X/M2-Bazele-electronicii-digitale';

// Configure lucrari for x-m2
xM2.lucrari = [
  {
    id: "m2x-log01",
    cod: "M2X-LOG01",
    titlu: "Moduri de exprimare a funcțiilor logice",
    cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-LOG01-moduri-de-exprimare-functii-logice/01-fisa-documentare-notiuni-si-tabel-de-adevar.pdf",
    fise_lucru: [
      {
        titlu: "Fișă de documentare: Noțiuni și tabel de adevăr (Doc)",
        cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-LOG01-moduri-de-exprimare-functii-logice/01-fisa-documentare-notiuni-si-tabel-de-adevar.pdf"
      },
      {
        titlu: "Fișă de lucru: Noțiuni și tabel de adevăr (Lucru)",
        cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-LOG01-moduri-de-exprimare-functii-logice/02-fisa-lucru-notiuni-si-tabel-de-adevar.pdf"
      }
    ]
  },
  {
    id: "m2x-por-s07",
    cod: "M2X-POR-S07",
    titlu: "Familii de circuite integrate logice și catalog (S07)",
    cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-POR-S07-familii-ci-logice-si-catalog/01-fisa-documentare-familii-ci-logice-capsule-catalog.pdf",
    fise_lucru: [
      {
        titlu: "Fișă de documentare: Familii CI logice, capsule, catalog (Doc)",
        cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-POR-S07-familii-ci-logice-si-catalog/01-fisa-documentare-familii-ci-logice-capsule-catalog.pdf"
      },
      {
        titlu: "Fișă de lucru: Familii CI logice, capsule, catalog (Lucru)",
        cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-POR-S07-familii-ci-logice-si-catalog/02-fisa-lucru-familii-ci-logice-capsule-catalog.pdf"
      },
      {
        titlu: "Fișă de laborator: Identificarea pinilor din fișa de catalog (Lab)",
        cale_pdf: "./clasa-X/M2-Bazele-electronicii-digitale/M2X-POR-S07-familii-ci-logice-si-catalog/03-fisa-laborator-identificarea-pinilor-din-fisa-de-catalog.pdf"
      }
    ]
  }
];

// 3. Save catalog.json
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log('Saved catalog.json successfully with x-m2 lucrari.');

// 4. Update fallback in index.html and index1.html
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

// 5. Update verify_portal.js
let verifyCode = fs.readFileSync(verifyScriptPath, 'utf8');

// Update modules without activities (remove index 5, as x-m2 now has activities)
verifyCode = verifyCode.replace(
  "for (const i of [2, 5, 6, 7, 8, 9]) {",
  "for (const i of [2, 6, 7, 8, 9]) {"
);

// Update allLinks count check (34 + 5 = 39)
verifyCode = verifyCode.replace(
  "assert(allLinks.length === 34, `Expected 34 resource links in moduleGrid (22 previous + 12 in M3-MAS01), got ${allLinks.length}`);",
  "assert(allLinks.length === 39, `Expected 39 resource links in moduleGrid (34 previous + 5 in x-m2), got ${allLinks.length}`);"
);

// Add check for x-m2 card (card index 5)
const xM2CardCheck = `
// Check x-m2 card (index 5: Clasa a X-a · M2)
const m2xCard = cards[5];
const m2xDetails = m2xCard.children.find(c => c.tagName === 'DETAILS');
assert(m2xDetails, 'x-m2 should have <details>');
const m2xSummary = m2xDetails.children.find(c => c.tagName === 'SUMMARY');
assert(m2xSummary.textContent === 'Vezi 2 activități practice', \`x-m2 summary was: \${m2xSummary.textContent}\`);
const m2xWorkItems = m2xDetails.children.filter(c => c.className === 'work-item');
assert(m2xWorkItems.length === 2, \`Expected 2 work-items in x-m2, got \${m2xWorkItems.length}\`);

// Check M2X-LOG01 (2 PDF links)
const log01Links = m2xWorkItems[0].querySelectorAll(el => el.tagName === 'A');
assert(log01Links.length === 2, \`Expected 2 PDF buttons on M2X-LOG01, got \${log01Links.length}\`);
for (const link of log01Links) {
  const filePath = path.resolve(root, link.href);
  assert(fs.existsSync(filePath), \`M2X-LOG01 link does not exist on disk: \${link.href} (\${filePath})\`);
}

// Check M2X-POR-S07 (3 PDF links)
const porLinks = m2xWorkItems[1].querySelectorAll(el => el.tagName === 'A');
assert(porLinks.length === 3, \`Expected 3 PDF buttons on M2X-POR-S07, got \${porLinks.length}\`);
for (const link of porLinks) {
  const filePath = path.resolve(root, link.href);
  assert(fs.existsSync(filePath), \`M2X-POR-S07 link does not exist on disk: \${link.href} (\${filePath})\`);
}
`;

if (!verifyCode.includes('// Check x-m2 card (index 5: Clasa a X-a · M2)')) {
  verifyCode = verifyCode.replace(
    "// Check modules without activities",
    xM2CardCheck + "\n// Check modules without activities"
  );
}

fs.writeFileSync(verifyScriptPath, verifyCode, 'utf8');
console.log('Saved updated verify_portal.js successfully.');
