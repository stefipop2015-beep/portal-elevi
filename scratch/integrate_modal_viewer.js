const fs = require('fs');
const path = require('path');

const workspaceDir = 'd:\\01.WorkspaceCLAUDE\\Portal-Elevi';

function updateFile(filename) {
  const filePath = path.join(workspaceDir, filename);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Add CSS before </style>
  const modalCSS = `
/* --- INTEGRATED MODAL VIEWER --- */
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
.portal-modal-backdrop[hidden] {
  display: none !important;
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
:fullscreen .portal-modal-container,
:-webkit-full-screen .portal-modal-container {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  border-radius: 0 !important;
  border: none !important;
}
`;

  if (!html.includes('portal-modal-backdrop')) {
    html = html.replace('</style>', modalCSS + '\n</style>');
  }

  // 2. Add Modal HTML markup before </body>
  const modalHTML = `
<!-- MODAL VIZUALIZATOR SIMULATOARE INTERACTIVE -->
<div class="portal-modal-backdrop" id="simulatorModal" hidden aria-hidden="true">
  <div class="portal-modal-container" role="dialog" aria-modal="true" aria-labelledby="modalSimTitle">
    <header class="portal-modal-header">
      <div class="portal-modal-info">
        <span class="portal-modal-badge badge-sim">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Simulator Interactiv
        </span>
        <span class="portal-modal-code" id="modalSimCode">LAB</span>
        <span class="portal-modal-title" id="modalSimTitle">Simulator Interactiv</span>
      </div>
      <div class="portal-modal-actions">
        <button class="portal-modal-btn" id="btnModalFullscreen" type="button" title="Comutare ecran complet">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
          <span>Ecran complet</span>
        </button>
        <a class="portal-modal-btn" id="linkModalNewTab" href="#" target="_blank" rel="noopener" title="Deschide în filă nouă separată">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>Filă nouă</span>
        </a>
        <button class="portal-modal-btn portal-modal-btn-close" id="btnModalClose" type="button" title="Închide vizualizatorul (sau apasă ESC)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>Închide (ESC)</span>
        </button>
      </div>
    </header>
    <div class="portal-modal-body">
      <iframe id="modalSimulatorIframe" src="about:blank" title="Simulator Interactiv"></iframe>
    </div>
  </div>
</div>
`;

  if (!html.includes('id="simulatorModal"')) {
    html = html.replace('</body>', modalHTML + '\n</body>');
  }

  // 3. Update makeBtn to accept isSim and workCode
  const oldMakeBtn = `function makeBtn(cls,label,href,workTitle,svg){const a=el('a',cls);a.href=href;a.target='_blank';a.rel='noopener';if(workTitle)a.setAttribute('aria-label',label+' — '+workTitle);a.innerHTML=svg;a.append(document.createTextNode(label));return a;}`;
  const newMakeBtn = `function makeBtn(cls,label,href,workTitle,svg,isSim,workCode){const a=el('a',cls);a.href=href;a.target='_blank';a.rel='noopener';if(workTitle)a.setAttribute('aria-label',label+' — '+workTitle);a.innerHTML=svg;a.append(document.createTextNode(label));if(isSim||cls.includes('btn-sim')){a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.button===1)return;e.preventDefault();openSimulatorModal(href,workCode,workTitle);});}return a;}`;
  html = html.replace(oldMakeBtn, newMakeBtn);

  // 4. Update resourceLinks to pass isSim=true and work.cod
  const oldResourceSim = `if(sim){parent.append(makeBtn('button btn-sim','Deschide Simulator',sim,work.titlu,ICON_SIM));}`;
  const newResourceSim = `if(sim){parent.append(makeBtn('button btn-sim','Deschide Simulator',sim,work.titlu,ICON_SIM,true,work.cod));}`;
  html = html.replace(oldResourceSim, newResourceSim);

  // 5. Update search suggestions click handler to open modal for simulator
  const oldSuggClick = `li.addEventListener("click",()=>{\n      window.open(d.url,"_blank","noopener");\n      sugg.hidden=true;\n    });`;
  const newSuggClick = `li.addEventListener("click",()=>{\n      if(d.type==="simulator"){openSimulatorModal(d.url,d.workCode,d.workTitle);}else{window.open(d.url,"_blank","noopener");}\n      sugg.hidden=true;\n    });`;
  html = html.replace(oldSuggClick, newSuggClick);

  // 6. Update search result button to pass isSim and workCode
  const oldSearchBtn = `const btn=makeBtn(d.type==="simulator"?"button btn-sim":"button secondary btn-pdf",d.fileLabel,d.url,d.title,d.type==="simulator"?ICON_SIM:ICON_PDF);`;
  const newSearchBtn = `const isSim=d.type==="simulator";\n      const btn=makeBtn(isSim?"button btn-sim":"button secondary btn-pdf",d.fileLabel,d.url,d.title,isSim?ICON_SIM:ICON_PDF,isSim,d.workCode);`;
  html = html.replace(oldSearchBtn, newSearchBtn);

  // 7. Add openSimulatorModal, closeSimulatorModal, toggleModalFullscreen and listeners
  const modalJsLogic = `
function openSimulatorModal(url, code, title){
  const modal = byId('simulatorModal');
  const iframe = byId('modalSimulatorIframe');
  const titleEl = byId('modalSimTitle');
  const codeEl = byId('modalSimCode');
  const newTabLink = byId('linkModalNewTab');
  if(!modal || !iframe) return;
  if(titleEl) titleEl.textContent = title || 'Simulator Interactiv';
  if(codeEl){
    codeEl.textContent = code || 'LAB';
    codeEl.style.display = code ? 'inline-block' : 'none';
  }
  if(newTabLink) newTabLink.href = url;
  iframe.src = url;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const closeBtn = byId('btnModalClose');
  if(closeBtn) setTimeout(() => closeBtn.focus(), 50);
}

function closeSimulatorModal(){
  const modal = byId('simulatorModal');
  const iframe = byId('modalSimulatorIframe');
  if(!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  if(iframe) iframe.src = 'about:blank';
  document.body.style.overflow = '';
}

function toggleModalFullscreen(){
  const container = document.querySelector('.portal-modal-container');
  if(!container) return;
  if(!document.fullscreenElement && !document.webkitFullscreenElement){
    if(container.requestFullscreen) container.requestFullscreen();
    else if(container.webkitRequestFullscreen) container.webkitRequestFullscreen();
  } else {
    if(document.exitFullscreen) document.exitFullscreen();
    else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
}

// Modal event listeners
const simModal = byId('simulatorModal');
if(simModal){
  simModal.addEventListener('click', e => {
    if(e.target === simModal) closeSimulatorModal();
  });
}
const btnModClose = byId('btnModalClose');
if(btnModClose) btnModClose.addEventListener('click', closeSimulatorModal);
const btnModFs = byId('btnModalFullscreen');
if(btnModFs) btnModFs.addEventListener('click', toggleModalFullscreen);
`;

  // Inject JS logic before </script></body>
  if (!html.includes('function openSimulatorModal')) {
    html = html.replace('renderNavMenu();renderNews();render();initQr();', modalJsLogic + '\nrenderNavMenu();renderNews();render();initQr();');
  }

  // Also make sure ESC handler closes modal if open
  const oldEsc = `if(e.key==="Escape"){closeNavDropdown();const s=byId("searchSuggestions");if(s)s.hidden=true;}`;
  const newEsc = `if(e.key==="Escape"){const m=byId("simulatorModal");if(m&&!m.hidden){closeSimulatorModal();return;}closeNavDropdown();const s=byId("searchSuggestions");if(s)s.hidden=true;}`;
  html = html.replace(oldEsc, newEsc);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Successfully updated:', filename);
}

updateFile('index.html');
updateFile('index1.html');
