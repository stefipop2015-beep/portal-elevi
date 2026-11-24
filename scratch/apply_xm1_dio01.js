const fs = require('fs');
const path = require('path');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
const catalogPath = path.join(root, 'catalog.json');
const indexHtmlPath = path.join(root, 'index.html');
const index1HtmlPath = path.join(root, 'index1.html');
const verifyScriptPath = 'C:/Users/x/.gemini/antigravity/brain/e9ee493a-6022-4e50-9836-0013bfca964d/scratch/verify_portal.js';

// 1. Read catalog.json
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// 2. Find x-m1 in clasa-x
const clsX = catalog.classes.find(c => c.id === 'clasa-x' || c.code === 'X');
if (!clsX) throw new Error('clasa-x not found in catalog');
const xM1 = clsX.modules.find(m => m.id === 'x-m1');
if (!xM1) throw new Error('x-m1 not found in clasa-x');

// 3. New work M1-DIO01
const newWork = {
  id: "m1-dio01",
  cod: "M1-DIO01",
  titlu: "Diode semiconductoare",
  cale_pdf: "./clasa-X/M1-Bazele-electronicii-analogice/03-00-M1-DIO01-diode-semiconductoare/01-fisa-de-documentare-identificarea-diodelor-si-parametri-de-catalog.pdf",
  fise_lucru: [
    {
      titlu: "Identificarea diodelor și parametri de catalog (Doc)",
      cale_pdf: "./clasa-X/M1-Bazele-electronicii-analogice/03-00-M1-DIO01-diode-semiconductoare/01-fisa-de-documentare-identificarea-diodelor-si-parametri-de-catalog.pdf"
    },
    {
      titlu: "Identificarea diodelor și parametri de catalog (Lucru)",
      cale_pdf: "./clasa-X/M1-Bazele-electronicii-analogice/03-00-M1-DIO01-diode-semiconductoare/02-fisa-de-lucru-identificarea-diodelor-si-parametri-de-catalog.pdf"
    },
    {
      titlu: "Polarizarea și caracteristica statică (Doc)",
      cale_pdf: "./clasa-X/M1-Bazele-electronicii-analogice/03-00-M1-DIO01-diode-semiconductoare/03-fisa-de-documentare-polarizarea-si-caracteristica-statica.pdf"
    },
    {
      titlu: "Polarizarea și caracteristica statică (Lucru)",
      cale_pdf: "./clasa-X/M1-Bazele-electronicii-analogice/03-00-M1-DIO01-diode-semiconductoare/04-fisa-de-lucru-polarizarea-si-caracteristica-statica.pdf"
    },
    {
      titlu: "Verificarea diodelor și identificarea defectelor (Doc)",
      cale_pdf: "./clasa-X/M1-Bazele-electronicii-analogice/03-00-M1-DIO01-diode-semiconductoare/05-fisa-de-documentare-verificarea-diodelor-si-identificarea-defectelor.pdf"
    },
    {
      titlu: "Verificarea diodelor și identificarea defectelor (Lucru)",
      cale_pdf: "./clasa-X/M1-Bazele-electronicii-analogice/03-00-M1-DIO01-diode-semiconductoare/06-fisa-de-lucru-verificarea-diodelor-si-identificarea-defectelor.pdf"
    }
  ]
};

// Check if already present, if so replace, else append
const existingIdx = xM1.lucrari.findIndex(w => w.id === 'm1-dio01');
if (existingIdx >= 0) {
  xM1.lucrari[existingIdx] = newWork;
} else {
  xM1.lucrari.push(newWork);
}

// 4. Save catalog.json
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log('Saved catalog.json successfully with M1-DIO01.');

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

// Update summary count for x-m1: 'Vezi 2 activități practice'
verifyCode = verifyCode.replace(
  "assert(m1Summary.textContent === 'Vezi 1 activitate practică', `M1 summary was: ${m1Summary.textContent}`);",
  "assert(m1Summary.textContent === 'Vezi 2 activități practice', `M1 summary was: ${m1Summary.textContent}`);"
);

// Update work-items count for x-m1: 2
verifyCode = verifyCode.replace(
  "assert(m1WorkItems.length === 1, `Expected 1 work-item in x-m1, got ${m1WorkItems.length}`);",
  "assert(m1WorkItems.length === 2, `Expected 2 work-items in x-m1, got ${m1WorkItems.length}`);"
);

// Add check for M1-DIO01 (work item index 1)
const dio01Check = `
// Check M1-DIO01 (6 PDF links)
const dio01Links = m1WorkItems[1].querySelectorAll(el => el.tagName === 'A');
assert(dio01Links.length === 6, \`Expected 6 PDF buttons on M1-DIO01, got \${dio01Links.length}\`);
for (const link of dio01Links) {
  const filePath = path.resolve(root, link.href);
  assert(fs.existsSync(filePath), \`M1-DIO01 link does not exist on disk: \${link.href} (\${filePath})\`);
}
`;

if (!verifyCode.includes('// Check M1-DIO01')) {
  verifyCode = verifyCode.replace(
    "// Check x-m2 card (index 5: Clasa a X-a · M2)",
    dio01Check + "\n// Check x-m2 card (index 5: Clasa a X-a · M2)"
  );
}

// Update allLinks count check (43 + 6 = 49)
verifyCode = verifyCode.replace(
  "assert(allLinks.length === 43, `Expected 43 resource links in moduleGrid (39 previous + 4 in M2X-POR-S08), got ${allLinks.length}`);",
  "assert(allLinks.length === 49, `Expected 49 resource links in moduleGrid (43 previous + 6 in M1-DIO01), got ${allLinks.length}`);"
);

fs.writeFileSync(verifyScriptPath, verifyCode, 'utf8');
console.log('Saved updated verify_portal.js successfully.');
