const fs = require('fs');
const path = require('path');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
const indexHtmlPath = path.join(root, 'index.html');
const index1HtmlPath = path.join(root, 'index1.html');
const verifyScriptPath = 'C:/Users/x/.gemini/antigravity/brain/e9ee493a-6022-4e50-9836-0013bfca964d/scratch/verify_portal.js';

// 1. Update CSS in index.html and index1.html
const subrowCSS = `
.portal-doc-subrow{
  display:flex!important;
  align-items:center!important;
  gap:.55rem!important;
  flex-wrap:wrap!important;
}
`;

// 2. New resourceLinks implementation
const newResourceLinks = `function resourceLinks(parent,work){const sim=safePath(work.cale_simulator),pdf1=safePath(work.cale_pdf),pdf2=safePath(work.cale_pdf_secundar),fise=Array.isArray(work.fise_lucru)?work.fise_lucru:[];const inFise=p=>p&&fise.some(f=>safePath(f&&f.cale_pdf)===p);const simBtn=sim?makeBtn('button btn-sim','Deschide Simulator',sim,work.titlu,ICON_SIM,true,work.cod):null;let simAttached=false;const attachWithSim=(btn)=>{if(simBtn&&!simAttached){const row=el('div','portal-doc-subrow');row.append(btn,simBtn);parent.append(row);simAttached=true;}else{parent.append(btn);}};const labIdx=fise.findIndex(f=>{const t=(f&&f.titlu)||'';const p=(f&&f.cale_pdf)||'';return /laborator|lab/i.test(t)||/laborator|lab/i.test(p);});if(pdf1&&!inFise(pdf1)){const l1=getPdfLabel(pdf1);const b1=makeBtn('button secondary btn-pdf',l1,pdf1,work.titlu,ICON_PDF);if(/laborator|lab/i.test(l1)||/laborator|lab/i.test(pdf1)||fise.length===0){attachWithSim(b1);}else{parent.append(b1);}}if(pdf2&&!inFise(pdf2)){const l2=getPdfLabel(pdf2,'Fișă Lucru (PDF)');const b2=makeBtn('button secondary btn-pdf',l2,pdf2,work.titlu,ICON_PDF);if(/laborator|lab/i.test(l2)||/laborator|lab/i.test(pdf2)){attachWithSim(b2);}else{parent.append(b2);}}fise.forEach((f,idx)=>{const fp=safePath(f&&f.cale_pdf);if(fp){const raw=(f.titlu||'').trim();const fl=raw?(/\(\s*pdf\s*\)$/i.test(raw)?raw:raw+' (PDF)'):getPdfLabel(fp,'Fișă Lucru (PDF)');const bf=makeBtn('button secondary btn-pdf',fl,fp,work.titlu,ICON_PDF);if(idx===labIdx){attachWithSim(bf);}else{parent.append(bf);}}});if(simBtn&&!simAttached){parent.append(simBtn);}}`;

[indexHtmlPath, index1HtmlPath].forEach(targetFile => {
  let html = fs.readFileSync(targetFile, 'utf8');

  // Add subrow CSS if not present
  if (!html.includes('.portal-doc-subrow{')) {
    html = html.replace('.portal-doc-subfiles{', subrowCSS + '\n.portal-doc-subfiles{');
  }

  // Replace resourceLinks
  const resourceLinksRegex = /function resourceLinks\(parent,work\)\{.*?\nfunction getModuleWorks/s;
  if (!resourceLinksRegex.test(html)) {
    // Try single line regex
    const singleLineRegex = /function resourceLinks\(parent,work\)\{.*?\}function getModuleWorks/;
    if (!singleLineRegex.test(html)) {
      throw new Error('Could not find function resourceLinks in ' + targetFile);
    }
    html = html.replace(singleLineRegex, newResourceLinks + '\nfunction getModuleWorks');
  } else {
    html = html.replace(resourceLinksRegex, newResourceLinks + '\nfunction getModuleWorks');
  }

  fs.writeFileSync(targetFile, html, 'utf8');
  console.log('Updated', path.basename(targetFile), 'with simulator positioned to the right of Laborator.');
});

// 3. Update verify_portal.js to reflect the paired buttons in M2-LAB05 and M2X-POR-S08
let verifyCode = fs.readFileSync(verifyScriptPath, 'utf8');

verifyCode = verifyCode.replace(
  "assert(lab05Links[0].fullText === 'Deschide Simulator' && lab05Links[0].href === './clasa-IX/M2-Electrotehnica-si-masurari-tehnice/M2-LAB05/simulator.html', 'M2-LAB05 first button must be Deschide Simulator');",
  "assert(lab05Links.some(l => l.fullText === 'Deschide Simulator' && l.href === './clasa-IX/M2-Electrotehnica-si-masurari-tehnice/M2-LAB05/simulator.html'), 'M2-LAB05 missing Deschide Simulator button');"
);

verifyCode = verifyCode.replace(
  "assert(lab05Links[1].fullText === 'Fișă Laborator (PDF)' && lab05Links[1].href === './clasa-IX/M2-Electrotehnica-si-masurari-tehnice/M2-LAB05/fisa-laborator.pdf', 'M2-LAB05 second button must be Fișă Laborator (PDF)');",
  "assert(lab05Links.some(l => l.fullText === 'Fișă Laborator (PDF)' && l.href === './clasa-IX/M2-Electrotehnica-si-masurari-tehnice/M2-LAB05/fisa-laborator.pdf'), 'M2-LAB05 missing Fișă Laborator (PDF) button');"
);

verifyCode = verifyCode.replace(
  "assert(s08Links[0].fullText === 'Deschide Simulator', `Expected first button to be 'Deschide Simulator', got ${s08Links[0].fullText}`);",
  "assert(s08Links.some(l => l.fullText === 'Deschide Simulator'), 'Expected Deschide Simulator button in M2X-POR-S08');"
);

fs.writeFileSync(verifyScriptPath, verifyCode, 'utf8');
console.log('Updated verify_portal.js assertions.');
