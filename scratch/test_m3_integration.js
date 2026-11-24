const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));

// 1. Verify ix-m3 in catalog
const clsIX = catalog.classes.find(c => c.id === 'clasa-ix');
assert(clsIX, 'Missing clasa-ix');
const ixM3 = clsIX.modules.find(m => m.id === 'ix-m3');
assert(ixM3, 'Missing ix-m3');
assert.strictEqual(ixM3.path, 'clasa-IX/M3-instalatii-electrice');
assert.strictEqual(ixM3.sharedWith, undefined);
assert(Array.isArray(ixM3.lucrari) && ixM3.lucrari.length === 1, 'Expected 1 work in ix-m3');

const work = ixM3.lucrari[0];
assert.strictEqual(work.id, 'm3-mas01');
assert.strictEqual(work.cod, 'M3-MAS01');
assert.strictEqual(work.titlu, 'Mașini electrice (L1–L6)');
assert(Array.isArray(work.fise_lucru) && work.fise_lucru.length === 12, 'Expected 12 fise_lucru');

// 2. Verify all files physically exist on disk and no duplicates in fise_lucru
const seenPaths = new Set();
work.fise_lucru.forEach((f, idx) => {
  assert(f.titlu && f.titlu.length > 5, `Invalid title at idx ${idx}: ${f.titlu}`);
  assert(f.cale_pdf, `Missing cale_pdf at idx ${idx}`);
  assert(!seenPaths.has(f.cale_pdf), `Duplicate file path in fise_lucru: ${f.cale_pdf}`);
  seenPaths.add(f.cale_pdf);

  const fullPath = path.resolve(root, f.cale_pdf);
  assert(fs.existsSync(fullPath), `Physical file not found: ${fullPath}`);
});
console.log('✓ All 12 worksheets physically exist on disk and have unique paths.');

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

const renderedButtons = [];
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

const buttons = simulateResourceLinks(work);
assert.strictEqual(buttons.length, 12, `Expected exactly 12 rendered buttons without duplicate pdf1, got ${buttons.length}`);
console.log('✓ Successfully simulated resourceLinks: exactly 12 buttons rendered, NO DUPLICATES.');

buttons.forEach((b, i) => {
  console.log(`  [${i + 1}] ${b.label} -> ${path.basename(b.href)}`);
});

// 4. Verify index.html and index1.html fallback sync
['index.html', 'index1.html'].forEach(fn => {
  const content = fs.readFileSync(path.join(root, fn), 'utf8');
  const match = content.match(/const fallback = (\{.*?\});/);
  assert(match, 'Missing fallback in ' + fn);
  const parsed = JSON.parse(match[1]);
  assert.strictEqual(JSON.stringify(catalog), JSON.stringify(parsed), 'Fallback out of sync in ' + fn);
  console.log(`✓ ${fn} fallback is 100% in sync with catalog.json.`);
});

console.log('ALL TESTS PASSED!');
