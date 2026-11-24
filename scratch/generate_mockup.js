const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceDir = 'd:\\01.WorkspaceCLAUDE\\Portal-Elevi';
const artifactDir = 'C:\\Users\\x\\.gemini\\antigravity\\brain\\e9ee493a-6022-4e50-9836-0013bfca964d';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let html = fs.readFileSync(path.join(workspaceDir, 'index.html'), 'utf8');

// Modal CSS & HTML
const modalStyles = `
<style id="modal-viewer-preview-css">
/* --- INTEGRATED MODAL VIEWER STYLES --- */
.portal-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 9, 18, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  opacity: 1;
  transition: opacity 0.25s ease;
}

.portal-modal-container {
  width: 96vw;
  max-width: 1440px;
  height: 92vh;
  background: #0b1322;
  border: 1px solid rgba(44, 224, 184, 0.45);
  border-radius: 12px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 0 35px rgba(44, 224, 184, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.portal-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: #0f1c30;
  border-bottom: 1px solid #1e3352;
  flex-shrink: 0;
}

.portal-modal-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.portal-modal-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 6px;
  white-space: nowrap;
}

.portal-modal-badge.badge-sim {
  background: rgba(44, 224, 184, 0.15);
  color: #2ce0b8;
  border: 1px solid rgba(44, 224, 184, 0.4);
}

.portal-modal-badge.badge-pdf {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.portal-modal-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  padding: 0.2rem 0.5rem;
  background: #16253d;
  border-radius: 4px;
  white-space: nowrap;
}

.portal-modal-title {
  color: #f1f5f9;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.portal-modal-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.portal-modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
  background: #182842;
  border: 1px solid #28446e;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  line-height: 1;
}

.portal-modal-btn:hover {
  background: #233b61;
  color: #ffffff;
  border-color: #3b5f94;
}

.portal-modal-btn-close {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.portal-modal-btn-close:hover {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.portal-modal-body {
  flex: 1;
  position: relative;
  background: #060b13;
  overflow: hidden;
}

.portal-modal-body iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
`;

const modalHTMLSimulator = `
<div class="portal-modal-backdrop" id="previewModal">
  <div class="portal-modal-container" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <header class="portal-modal-header">
      <div class="portal-modal-info">
        <span class="portal-modal-badge badge-sim">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Simulator Interactiv
        </span>
        <span class="portal-modal-code">M2-LAB05</span>
        <span class="portal-modal-title" id="modalTitle">Verificarea experimentală a Legii lui Ohm</span>
      </div>
      <div class="portal-modal-actions">
        <button class="portal-modal-btn" title="Comutare ecran complet" onclick="alert('Demo: Ecran complet activat')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
          Ecran complet
        </button>
        <a class="portal-modal-btn" href="./clasa-IX/M2-Electrotehnica-si-masurari-tehnice/M2-LAB05/simulator.html" target="_blank" rel="noopener noreferrer" title="Deschide în filă nouă separată">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Filă nouă
        </a>
        <button class="portal-modal-btn portal-modal-btn-close" title="Închide vizualizatorul (ESC)" onclick="document.getElementById('previewModal').style.display='none'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Închide (ESC)
        </button>
      </div>
    </header>
    <div class="portal-modal-body">
      <iframe src="./clasa-IX/M2-Electrotehnica-si-masurari-tehnice/M2-LAB05/simulator.html" title="Simulator Interactiv Legea lui Ohm"></iframe>
    </div>
  </div>
</div>
`;

// Also ensure module detail view is pre-rendered in background behind the modal so screenshot shows portal context
const scriptAutoOpenModule = `
<script>
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof showModuleDetailView === 'function') {
      showModuleDetailView('clasa-ix', 'ix-m2');
    }
  }, 200);
});
</script>
`;

let mockupHtml = html.replace('</head>', modalStyles + '\n</head>');
mockupHtml = mockupHtml.replace('</body>', modalHTMLSimulator + '\n' + scriptAutoOpenModule + '\n</body>');

const mockupFile = path.join(workspaceDir, 'scratch', 'mockup_modal_viewer.html');
fs.writeFileSync(mockupFile, mockupHtml, 'utf8');
console.log('Mockup generated successfully at:', mockupFile);
