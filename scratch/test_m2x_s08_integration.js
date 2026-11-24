const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));

// 1. Verify x-m2 in catalog
const clsX = catalog.classes.find(c => c.id === 'clasa-x');
assert(clsX, 'Missing clasa-x');
const xM2 = clsX.modules.find(m => m.id === 'x-m2');
assert(xM2, 'Missing x-m2');
assert(Array.isArray(xM2.lucrari) && xM2.lucrari.length === 3, `Expected 3 works in x-m2, got ${xM2.lucrari.length}`);

const s08 = xM2.lucrari.find(w => w.id === 'm2x-por-s08');
assert(s08, 'Missing m2x-por-s08');
assert.strictEqual(s08.cod, 'M2X-POR-S08');
assert.strictEqual(s08.titlu, 'Porți logice: NU, ȘI, SAU (S08)');
assert(s08.cale_simulator, 'Missing cale_simulator in m2x-por-s08');
assert(s08.cale_pdf, 'Missing cale_pdf in m2x-por-s08');
assert(Array.isArray(s08.fise_lucru) && s08.fise_lucru.length === 3, 'Expected 3 fise_lucru in s08');

// 2. Verify all files physically exist on disk
const filesToCheck = [
  s08.cale_simulator,
  s08.cale_pdf,
  ...s08.fise_lucru.map(f => f.cale_pdf)
];
filesToCheck.forEach(f => {
  const full = path.resolve(root, f);
  assert(fs.existsSync(full), `File not found on disk: ${f} (${full})`);
});
console.log('✓ All 4 physical files of M2X-POR-S08 verified on disk.');

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
  if (s.includes('fisa-documentare')) return 'Fișă Documentare (PDF)';
  if (s.includes('fisa-laborator')) return 'Fișă Laborator (PDF)';
  if (s.includes('fisa-lucru')) return 'Fișă Lucru (PDF)';
  if (s.includes('ssm')) return 'Instruire SSM (PDF)';
  if (s.includes('caiet')) return 'Caiet de Lucru (PDF)';
  return def || 'Caiet de Lucru (PDF)';
}

function mockMakeBtn(cls, label, href, workTitle) {
  return { cls, label, href, workTitle };
}

function simulateResourceLinks(work) {
  const sim = safePath(work.cale_simulator);
  const pdf1 = safePath(work.cale_pdf);
  const pdf2 = safePath(work.cale_pdf_secundar);
  const fise = Array.isArray(work.fise_lucru) ? work.fise_lucru : [];
  const inFise = p => p && fise.some(f => safePath(f && f.cale_pdf) === p);

  const buttons = [];
  if (sim) buttons.push(mockMakeBtn('button btn-sim', 'Deschide Simulator', sim, work.titlu));
  if (pdf1 && !inFise(pdf1)) {
    const l1 = getPdfLabel(pdf1);
    buttons.push(mockMakeBtn('button secondary btn-pdf', l1, pdf1, work.titlu));
  }
  if (pdf2 && !inFise(pdf2)) {
    const l2 = getPdfLabel(pdf2, 'Fișă Lucru (PDF)');
    buttons.push(mockMakeBtn('button secondary btn-pdf', l2, pdf2, work.titlu));
  }
  fise.forEach(f => {
    const fp = safePath(f && f.cale_pdf);
    if (fp) {
      const raw = (f.titlu || '').trim();
      const fl = raw ? (/\(\s*pdf\s*\)$/i.test(raw) ? raw : raw + ' (PDF)') : getPdfLabel(fp, 'Fișă Lucru (PDF)');
      buttons.push(mockMakeBtn('button secondary btn-pdf', fl, fp, work.titlu));
    }
  });
  return buttons;
}

const s08Buttons = simulateResourceLinks(s08);
assert.strictEqual(s08Buttons.length, 4, `Expected 4 buttons for M2X-POR-S08 (1 sim + 3 PDF), got ${s08Buttons.length}`);
assert.strictEqual(s08Buttons[0].label, 'Deschide Simulator');
assert(s08Buttons[0].cls.includes('btn-sim'), 'Expected simulator button to have class btn-sim');
assert.strictEqual(s08Buttons[1].label, 'Fișă de documentare: Porți NU, ȘI, SAU (Doc) (PDF)');
assert.strictEqual(s08Buttons[2].label, 'Fișă de lucru: Porți NU, ȘI, SAU (Lucru) (PDF)');
assert.strictEqual(s08Buttons[3].label, 'Fișă de laborator: Verificarea tabelelor în simulator (Lab) (PDF)');
console.log('✓ Successfully simulated resourceLinks for M2X-POR-S08:');
s08Buttons.forEach((b, i) => console.log(`  [${i + 1}] ${b.label} -> ${path.basename(b.href)}`));

// Check total buttons in x-m2
let totalXM2Buttons = 0;
xM2.lucrari.forEach(w => totalXM2Buttons += simulateResourceLinks(w).length);
assert.strictEqual(totalXM2Buttons, 9, `Expected 9 total buttons in x-m2 (2 + 3 + 4), got ${totalXM2Buttons}`);
console.log('✓ Total buttons across all 3 works in x-m2: 9 buttons.');

// 4. Verify index.html and index1.html fallback sync
['index.html', 'index1.html'].forEach(fn => {
  const content = fs.readFileSync(path.join(root, fn), 'utf8');
  const match = content.match(/const fallback = (\{.*?\});/);
  assert(match, 'Missing fallback in ' + fn);
  const parsed = JSON.parse(match[1]);
  assert.strictEqual(JSON.stringify(catalog), JSON.stringify(parsed), 'Fallback out of sync in ' + fn);
  console.log(`✓ ${fn} fallback is 100% in sync with catalog.json.`);
});

console.log('ALL M2X-POR-S08 INTEGRATION TESTS PASSED!');
