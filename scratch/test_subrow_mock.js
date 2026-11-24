const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = 'd:/01.WorkspaceCLAUDE/Portal-Elevi';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));

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
  return { type: 'btn', cls, label, href, workTitle };
}

function mockResourceLinks(work) {
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

// Test M2X-POR-S08
const s08Work = catalog.classes.find(c => c.id === 'clasa-x').modules.find(m => m.id === 'x-m2').lucrari.find(w => w.id === 'm2x-por-s08');
const s08Res = mockResourceLinks(s08Work);
console.log('M2X-POR-S08 children count:', s08Res.length);
s08Res.forEach((c, idx) => {
  if (c.type === 'subrow') {
    console.log(`  [Row ${idx + 1} (SUBROW)]:`, c.items.map(b => b.label).join('  +  '));
  } else {
    console.log(`  [Row ${idx + 1}]:`, c.label);
  }
});

assert.strictEqual(s08Res.length, 3, 'Expected 3 rows in M2X-POR-S08');
assert.strictEqual(s08Res[0].label, 'Fișă de documentare: Porți NU, ȘI, SAU (Doc) (PDF)');
assert.strictEqual(s08Res[1].label, 'Fișă de lucru: Porți NU, ȘI, SAU (Lucru) (PDF)');
assert.strictEqual(s08Res[2].type, 'subrow');
assert.strictEqual(s08Res[2].items[0].label, 'Fișă de laborator: Verificarea tabelelor în simulator (Lab) (PDF)');
assert.strictEqual(s08Res[2].items[1].label, 'Deschide Simulator');

console.log('TEST PASSED! Simulator is exactly to the right of Laborator.');
