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

// 3. Find m1-dio01
const dio01 = xM1.lucrari.find(w => w.id === 'm1-dio01');
if (!dio01) throw new Error('m1-dio01 not found in x-m1');

dio01.cale_simulator = "./clasa-X/M1-Bazele-electronicii-analogice/03-00-M1-DIO01-diode-semiconductoare/studiul-diodei.html";

// 4. Save catalog.json
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log('Saved catalog.json with cale_simulator in m1-dio01.');

// 5. Update fallback in index.html and index1.html
const fallbackJsonStr = JSON.stringify(catalog);

const newResourceLinks = `function resourceLinks(parent,work){const sim=safePath(work.cale_simulator),pdf1=safePath(work.cale_pdf),pdf2=safePath(work.cale_pdf_secundar),fise=Array.isArray(work.fise_lucru)?work.fise_lucru:[];const inFise=p=>p&&fise.some(f=>safePath(f&&f.cale_pdf)===p);const simBtn=sim?makeBtn('button btn-sim','Deschide Simulator',sim,work.titlu,ICON_SIM,true,work.cod):null;let simAttached=false;const attachWithSim=(btn)=>{if(simBtn&&!simAttached){const row=el('div','portal-doc-subrow');row.append(btn,simBtn);parent.append(row);simAttached=true;}else{parent.append(btn);}};let simTargetIdx=fise.findIndex(f=>{const t=(f&&f.titlu)||'';const p=(f&&f.cale_pdf)||'';return /laborator|lab/i.test(t)||/laborator|lab/i.test(p);});if(simTargetIdx===-1&&fise.length>0){const pIdx=fise.findIndex(f=>{const t=(f&&f.titlu)||'';return /polarizare|caracteristic/i.test(t)&&/lucru/i.test(t);});if(pIdx!==-1)simTargetIdx=pIdx;}if(pdf1&&!inFise(pdf1)){const l1=getPdfLabel(pdf1);const b1=makeBtn('button secondary btn-pdf',l1,pdf1,work.titlu,ICON_PDF);if(/laborator|lab/i.test(l1)||/laborator|lab/i.test(pdf1)||fise.length===0){attachWithSim(b1);}else{parent.append(b1);}}if(pdf2&&!inFise(pdf2)){const l2=getPdfLabel(pdf2,'Fișă Lucru (PDF)');const b2=makeBtn('button secondary btn-pdf',l2,pdf2,work.titlu,ICON_PDF);if(/laborator|lab/i.test(l2)||/laborator|lab/i.test(pdf2)){attachWithSim(b2);}else{parent.append(b2);}}fise.forEach((f,idx)=>{const fp=safePath(f&&f.cale_pdf);if(fp){const raw=(f.titlu||'').trim();const fl=raw?(/\(\s*pdf\s*\)$/i.test(raw)?raw:raw+' (PDF)'):getPdfLabel(fp,'Fișă Lucru (PDF)');const bf=makeBtn('button secondary btn-pdf',fl,fp,work.titlu,ICON_PDF);if(idx===simTargetIdx){attachWithSim(bf);}else{parent.append(bf);}}});if(simBtn&&!simAttached){parent.append(simBtn);}}`;

[indexHtmlPath, index1HtmlPath].forEach(targetFile => {
  let html = fs.readFileSync(targetFile, 'utf8');

  // Update fallback
  const fallbackRegex = /const fallback = \{.*?\};/s;
  if (!fallbackRegex.test(html)) {
    throw new Error('Could not find const fallback in ' + targetFile);
  }
  html = html.replace(fallbackRegex, 'const fallback = ' + fallbackJsonStr + ';');

  // Update resourceLinks
  const resourceLinksRegex = /function resourceLinks\(parent,work\)\{.*?function getModuleWorks/s;
  if (!resourceLinksRegex.test(html)) {
    throw new Error('Could not find resourceLinks in ' + targetFile);
  }
  html = html.replace(resourceLinksRegex, newResourceLinks + '\nfunction getModuleWorks');

  fs.writeFileSync(targetFile, html, 'utf8');
  console.log('Saved updates in', path.basename(targetFile));
});

// 6. Update verify_portal.js
let verifyCode = fs.readFileSync(verifyScriptPath, 'utf8');

// Update M1-DIO01 checks (6 PDF links + 1 simulator = 7)
verifyCode = verifyCode.replace(
  "assert(dio01Links.length === 6, `Expected 6 PDF buttons on M1-DIO01, got ${dio01Links.length}`);",
  "assert(dio01Links.length === 7, `Expected 7 buttons on M1-DIO01 (1 sim + 6 PDF), got ${dio01Links.length}`);\nassert(dio01Links.some(l => l.fullText === 'Deschide Simulator'), 'Missing Deschide Simulator on M1-DIO01');"
);

// Update allLinks count check (49 + 1 = 50)
verifyCode = verifyCode.replace(
  "assert(allLinks.length === 49, `Expected 49 resource links in moduleGrid (43 previous + 6 in M1-DIO01), got ${allLinks.length}`);",
  "assert(allLinks.length === 50, `Expected 50 resource links in moduleGrid (49 previous + 1 in M1-DIO01), got ${allLinks.length}`);"
);

fs.writeFileSync(verifyScriptPath, verifyCode, 'utf8');
console.log('Saved updated verify_portal.js successfully.');
