const fs = require('fs');
const path = require('path');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
const catalogPath = path.join(root, 'catalog.json');
const indexHtmlPath = path.join(root, 'index.html');
const index1HtmlPath = path.join(root, 'index1.html');
const verifyScriptPath = 'C:/Users/x/.gemini/antigravity/brain/e9ee493a-6022-4e50-9836-0013bfca964d/scratch/verify_portal.js';

// 1. Read catalog.json
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// 2. Find ix-m3 in clasa-ix
const clsIX = catalog.classes.find(c => c.id === 'clasa-ix' || c.code === 'IX');
if (!clsIX) throw new Error('clasa-ix not found in catalog');
const ixM3 = clsIX.modules.find(m => m.id === 'ix-m3');
if (!ixM3) throw new Error('ix-m3 not found in clasa-ix');

// Configure path and remove sharedWith
ixM3.path = 'clasa-IX/M3-instalatii-electrice';
delete ixM3.sharedWith;

// Configure lucrari for M3-MAS01
ixM3.lucrari = [
  {
    id: "m3-mas01",
    cod: "M3-MAS01",
    titlu: "Mașini electrice (L1–L6)",
    cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/01-l1-fisa-de-documentare-introducere-in-masinile-electrice.pdf",
    fise_lucru: [
      {
        titlu: "L1: Introducere în mașinile electrice (Doc)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/01-l1-fisa-de-documentare-introducere-in-masinile-electrice.pdf"
      },
      {
        titlu: "L1: Clasificare, simboluri și riscuri (Lab)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/02-l1-fisa-de-laborator-clasificare-simboluri-si-riscuri.pdf"
      },
      {
        titlu: "L2: Transformatorul electric (Doc)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/04-l2-fisa-de-documentare-transformatorul-electric.pdf"
      },
      {
        titlu: "L2: Componente și raport de transformare (Lab)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/05-l2-fisa-de-laborator-componente-si-raport-de-transformare.pdf"
      },
      {
        titlu: "L3: Motorul de curent continuu (Doc)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/07-l3-fisa-de-documentare-motorul-de-curent-continuu.pdf"
      },
      {
        titlu: "L3: Componentele și funcționarea motorului c.c. (Lab)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/08-l3-fisa-de-laborator-componentele-si-functionarea-motorului-de-curent-continuu.pdf"
      },
      {
        titlu: "L4: Motorul asincron (Doc)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/10-l4-fisa-de-documentare-motorul-asincron.pdf"
      },
      {
        titlu: "L4: Statorul, rotorul și câmpul învârtitor (Lab)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/11-l4-fisa-de-laborator-statorul-rotorul-si-campul-invartitor.pdf"
      },
      {
        titlu: "L5: Specificații tehnice și comparare (Doc)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/13-l5-fisa-de-documentare-specificatii-tehnice-si-comparare.pdf"
      },
      {
        titlu: "L5: Plăcuțe indicatoare și comparare (Lab)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/14-l5-fisa-de-laborator-placute-indicatoare-si-comparare.pdf"
      },
      {
        titlu: "L6: Verificarea funcționării mașinilor electrice (Doc)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/16-l6-fisa-de-documentare-verificarea-functionarii-masinilor-electrice.pdf"
      },
      {
        titlu: "L6: Studii de caz de verificare (Lab)",
        cale_pdf: "./clasa-IX/M3-instalatii-electrice/M3-MAS01-masini-electrice/17-l6-fisa-de-laborator-studii-de-caz-de-verificare.pdf"
      }
    ]
  }
];

// Update admin block for ixM3
ixM3.admin = {
  schoolYear: "2026-2027",
  officialCodeConfirmed: false,
  note: "Modulul M3 Instalații electrice pentru clasa a IX-a conține tema M3-MAS01 (Mașini electrice L1–L6)."
};

// 3. Save catalog.json
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log('Saved catalog.json successfully.');

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

// 5. Update verify_portal.js to reflect ix-m3 changes
let verifyCode = fs.readFileSync(verifyScriptPath, 'utf8');

// Update ixM3 path assertion
verifyCode = verifyCode.replace(
  "assert(ixM3.path === 'clasa-X/M3-Instalatii-electrice' && xM3.path === 'clasa-X/M3-Instalatii-electrice', 'Both entries must point to the same path without duplicating files');",
  "assert(ixM3.path === 'clasa-IX/M3-instalatii-electrice' && xM3.path === 'clasa-X/M3-Instalatii-electrice', 'ixM3 must point to clasa-IX/M3-instalatii-electrice and xM3 to clasa-X/M3-Instalatii-electrice');"
);

// Update modules without activities (remove index 3, as ix-m3 now has activities)
verifyCode = verifyCode.replace(
  "for (const i of [2, 3, 5, 6, 7, 8, 9]) {",
  "for (const i of [2, 5, 6, 7, 8, 9]) {"
);

// Update allLinks count check (22 + 12 = 34)
verifyCode = verifyCode.replace(
  "assert(allLinks.length === 22, `Expected 22 resource links in moduleGrid, got ${allLinks.length}`);",
  "assert(allLinks.length === 34, `Expected 34 resource links in moduleGrid (22 previous + 12 in M3-MAS01), got ${allLinks.length}`);"
);

// Add check for ix-m3 card (card index 3)
const ixM3CardCheck = `
// Check M3 card (index 3: Clasa a IX-a · M3)
const m3Card = cards[3];
const m3Details = m3Card.children.find(c => c.tagName === 'DETAILS');
assert(m3Details, 'ix-m3 should have <details>');
const m3Summary = m3Details.children.find(c => c.tagName === 'SUMMARY');
assert(m3Summary.textContent === 'Vezi 1 activitate practică', \`M3 summary was: \${m3Summary.textContent}\`);
const m3WorkItems = m3Details.children.filter(c => c.className === 'work-item');
assert(m3WorkItems.length === 1, \`Expected 1 work-item in ix-m3, got \${m3WorkItems.length}\`);
const m3Links = m3WorkItems[0].querySelectorAll(el => el.tagName === 'A');
assert(m3Links.length === 12, \`Expected 12 PDF buttons on M3-MAS01, got \${m3Links.length}\`);
for (const link of m3Links) {
  const filePath = path.resolve(root, link.href);
  assert(fs.existsSync(filePath), \`M3-MAS01 link does not exist on disk: \${link.href} (\${filePath})\`);
}
`;

if (!verifyCode.includes('// Check M3 card (index 3: Clasa a IX-a · M3)')) {
  verifyCode = verifyCode.replace(
    "// Check M1 card (index 4: Clasa a X-a · M1)",
    ixM3CardCheck + "\n// Check M1 card (index 4: Clasa a X-a · M1)"
  );
}

fs.writeFileSync(verifyScriptPath, verifyCode, 'utf8');
console.log('Saved updated verify_portal.js successfully.');
