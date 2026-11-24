const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));

// 1. Verify x-m2 in catalog
const clsX = catalog.classes.find(c => c.id === 'clasa-x');
assert(clsX, 'Missing clasa-x');
const xM2 = clsX.modules.find(m => m.id === 'x-m2');
assert(xM2, 'Missing x-m2 in clasa-x');
assert.strictEqual(xM2.path, 'clasa-X/M2-Bazele-electronicii-digitale');
assert(Array.isArray(xM2.lucrari) && xM2.lucrari.length === 2, 'Expected 2 works in x-m2');

// 2. Verify all files physically exist on disk and no duplicates
const seenPaths = new Set();
let totalFiles = 0;
xM2.lucrari.forEach((work, wIdx) => {
  assert(work.id && work.cod && work.titlu, `Incomplete work at idx ${wIdx}`);
  assert(Array.isArray(work.fise_lucru), `Missing fise_lucru in ${work.id}`);
  work.fise_lucru.forEach((f, fIdx) => {
    totalFiles++;
    assert(f.titlu && f.titlu.length > 5, `Invalid title in ${work.id} fise_lucru[${fIdx}]`);
    assert(f.cale_pdf, `Missing cale_pdf in ${work.id} fise_lucru[${fIdx}]`);
    assert(!seenPaths.has(f.cale_pdf), `Duplicate file path: ${f.cale_pdf}`);
    seenPaths.add(f.cale_pdf);

    const fullPath = path.resolve(root, f.cale_pdf);
    assert(fs.existsSync(fullPath), `Physical file not found: ${fullPath}`);
  });
});
assert.strictEqual(totalFiles, 5, `Expected 5 total files in x-m2, got ${totalFiles}`);
console.log('✓ All 5 worksheets physically exist on disk and have unique paths.');

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

const buttons1 = simulateResourceLinks(xM2.lucrari[0]);
assert.strictEqual(buttons1.length, 2, `Expected 2 buttons for M2X-LOG01, got ${buttons1.length}`);
console.log('✓ Tema 1 (M2X-LOG01): 2 butoane unice fără dubluri.');
buttons1.forEach((b, i) => console.log(`  [1.${i + 1}] ${b.label} -> ${path.basename(b.href)}`));

const buttons2 = simulateResourceLinks(xM2.lucrari[1]);
assert.strictEqual(buttons2.length, 3, `Expected 3 buttons for M2X-POR-S07, got ${buttons2.length}`);
console.log('✓ Tema 2 (M2X-POR-S07): 3 butoane unice fără dubluri.');
buttons2.forEach((b, i) => console.log(`  [2.${i + 1}] ${b.label} -> ${path.basename(b.href)}`));

// 4. Verify index.html and index1.html fallback sync
['index.html', 'index1.html'].forEach(fn => {
  const content = fs.readFileSync(path.join(root, fn), 'utf8');
  const match = content.match(/const fallback = (\{.*?\});/);
  assert(match, 'Missing fallback in ' + fn);
  const parsed = JSON.parse(match[1]);
  assert.strictEqual(JSON.stringify(catalog), JSON.stringify(parsed), 'Fallback out of sync in ' + fn);
  console.log(`✓ ${fn} fallback is 100% in sync with catalog.json.`);
});

console.log('ALL X-M2 TESTS PASSED PERFECTLY!');
