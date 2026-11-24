const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));

// 1. Verify x-m1 in catalog
const clsX = catalog.classes.find(c => c.id === 'clasa-x');
assert(clsX, 'Missing clasa-x');
const xM1 = clsX.modules.find(m => m.id === 'x-m1');
assert(xM1, 'Missing x-m1');
assert(Array.isArray(xM1.lucrari) && xM1.lucrari.length === 2, `Expected 2 works in x-m1, got ${xM1.lucrari.length}`);

const dio01 = xM1.lucrari.find(w => w.id === 'm1-dio01');
assert(dio01, 'Missing m1-dio01');
assert.strictEqual(dio01.cod, 'M1-DIO01');
assert.strictEqual(dio01.titlu, 'Diode semiconductoare');
assert(dio01.cale_pdf, 'Missing cale_pdf in m1-dio01');
assert(Array.isArray(dio01.fise_lucru) && dio01.fise_lucru.length === 6, 'Expected 6 fise_lucru in dio01');

// 2. Verify all files physically exist on disk
const filesToCheck = [
  dio01.cale_pdf,
  ...dio01.fise_lucru.map(f => f.cale_pdf)
];
filesToCheck.forEach(f => {
  const full = path.resolve(root, f);
  assert(fs.existsSync(full), `File not found on disk: ${f} (${full})`);
});
console.log('✓ All 6 physical files of M1-DIO01 verified on disk.');

// 3. Test rendering simulation (resourceLinks logic from portal)
function safePath(p) {
  if (!p || typeof p !== 'string') return '';
  p = p.trim();
  if (/^(?:javascript|data|vbscript):/i.test(p)) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(p) && !/^https?:\/\//i.test(p)) return '';
  return p;
}
function getPdfLabel(p, def) {
  if (!p) return def || 'Caiet de Lucru (PDF)';
  const s = p.toLowerCase();
  if (s.includes('fisa-documentare') || s.includes('fisa-de-documentare')) return 'Fișă Documentare (PDF)';
  if (s.includes('fisa-laborator') || s.includes('fisa-de-laborator')) return 'Fișă Laborator (PDF)';
  if (s.includes('fisa-lucru') || s.includes('fisa-de-lucru')) return 'Fișă Lucru (PDF)';
  if (s.includes('ssm')) return 'Instruire SSM (PDF)';
  if (s.includes('caiet')) return 'Caiet de Lucru (PDF)';
  return def || 'Caiet de Lucru (PDF)';
}

function mockMakeBtn(cls, label, href, workTitle) {
  return { cls, label, href, workTitle };
}

function simulateResourceLinks(work) {
  const sim = safePath(work.cale_simulator),
        pdf1 = safePath(work.cale_pdf),
        pdf2 = safePath(work.cale_pdf_secundar),
        fise = Array.isArray(work.fise_lucru) ? work.fise_lucru : [];
  const inFise = p => p && fise.some(f => safePath(f && f.cale_pdf) === p);
  const simBtn = sim ? mockMakeBtn('button btn-sim', 'Deschide Simulator', sim, work.titlu) : null;
  let simAttached = false;

  const children = [];
  const attachWithSim = (btn) => {
    if (simBtn && !simAttached) {
      children.push({ type: 'subrow', items: [btn, simBtn] });
      simAttached = true;
    } else {
      children.push(btn);
    }
  };

  const labIdx = fise.findIndex(f => {
    const t = (f && f.titlu) || '';
    const p = (f && f.cale_pdf) || '';
    return /laborator|lab/i.test(t) || /laborator|lab/i.test(p);
  });

  if (pdf1 && !inFise(pdf1)) {
    const l1 = getPdfLabel(pdf1);
    const b1 = mockMakeBtn('button secondary btn-pdf', l1, pdf1, work.titlu);
    if (/laborator|lab/i.test(l1) || /laborator|lab/i.test(pdf1) || fise.length === 0) {
      attachWithSim(b1);
    } else {
      children.push(b1);
    }
  }

  if (pdf2 && !inFise(pdf2)) {
    const l2 = getPdfLabel(pdf2, 'Fișă Lucru (PDF)');
    const b2 = mockMakeBtn('button secondary btn-pdf', l2, pdf2, work.titlu);
    if (/laborator|lab/i.test(l2) || /laborator|lab/i.test(pdf2)) {
      attachWithSim(b2);
    } else {
      children.push(b2);
    }
  }

  fise.forEach((f, idx) => {
    const fp = safePath(f && f.cale_pdf);
    if (fp) {
      const raw = (f.titlu || '').trim();
      const fl = raw ? (/\(\s*pdf\s*\)$/i.test(raw) ? raw : raw + ' (PDF)') : getPdfLabel(fp, 'Fișă Lucru (PDF)');
      const bf = mockMakeBtn('button secondary btn-pdf', fl, fp, work.titlu);
      if (idx === labIdx) {
        attachWithSim(bf);
      } else {
        children.push(bf);
      }
    }
  });

  if (simBtn && !simAttached) {
    children.push(simBtn);
  }

  return children;
}

const dio01Buttons = simulateResourceLinks(dio01);
assert.strictEqual(dio01Buttons.length, 6, `Expected 6 buttons for M1-DIO01, got ${dio01Buttons.length}`);
console.log('✓ Successfully simulated resourceLinks for M1-DIO01:');
dio01Buttons.forEach((b, i) => console.log(`  [${i + 1}] ${b.label} -> ${path.basename(b.href)}`));

// Check total buttons in x-m1
let totalXM1Buttons = 0;
xM1.lucrari.forEach(w => totalXM1Buttons += simulateResourceLinks(w).length);
assert.strictEqual(totalXM1Buttons, 12, `Expected 12 total buttons in x-m1 (6 + 6), got ${totalXM1Buttons}`);
console.log('✓ Total buttons across both works in x-m1: 12 buttons.');

// 4. Verify index.html and index1.html fallback sync
['index.html', 'index1.html'].forEach(fn => {
  const content = fs.readFileSync(path.join(root, fn), 'utf8');
  const match = content.match(/const fallback = (\{.*?\});/);
  assert(match, 'Missing fallback in ' + fn);
  const parsed = JSON.parse(match[1]);
  assert.strictEqual(JSON.stringify(catalog), JSON.stringify(parsed), 'Fallback out of sync in ' + fn);
  console.log(`✓ ${fn} fallback is 100% in sync with catalog.json.`);
});

console.log('ALL M1-DIO01 INTEGRATION TESTS PASSED!');
