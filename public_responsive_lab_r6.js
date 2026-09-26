/* SmashDump public responsive lab R6. Static export only. */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_PUBLIC_RESPONSIVE_LAB_R6';
  const body=document.body;
  const toggle=document.getElementById('publicCategoryToggle');
  const overlay=document.getElementById('publicCategoryOverlay');
  const summary=document.getElementById('publicSummaryToggle');
  const back=document.getElementById('publicDetailReturn');
  const nav=document.getElementById('categoryNav');
  const panel=document.getElementById('detailPanel');
  if(!body||!toggle||!overlay||!summary||!back||!nav||!panel){
    document.documentElement.dataset.publicResponsiveLab='r6-missing-dom';
    return;
  }
  document.documentElement.dataset.publicResponsiveLab='r6';

  const compact=matchMedia('(max-width:1279px)');
  const phone=matchMedia('(max-width:959px)');
  const labelNode=toggle.querySelector('.public-category-label');
  const returnLabel=back.querySelector('.public-return-label');
  const resultsMode=()=>body.classList.contains('public-mobile-results-mode');

  const activeCategory=()=>nav.querySelector('.category-button.active')?.querySelector('span:nth-child(2)')?.textContent?.trim()||document.getElementById('categoryTitle')?.textContent?.trim()||'Categories';
  const syncLabels=()=>{const label=activeCategory();if(labelNode)labelNode.textContent=label;if(returnLabel)returnLabel.textContent=`Back to ${label}`};
  const syncDetail=()=>{
    const visiblyOpen=Boolean(phone.matches&&panel.classList.contains('open')&&!resultsMode());
    body.classList.toggle('public-detail-open',visiblyOpen);
    const historyBack=panel.querySelector('#backDetail');
    if(historyBack){
      const label='\u2190 Previous entry',description='Return to the previously opened entry';
      if(historyBack.textContent!==label)historyBack.textContent=label;
      if(historyBack.title!==description)historyBack.title=description;
      if(historyBack.getAttribute('aria-label')!==description)historyBack.setAttribute('aria-label',description);
    }
    syncLabels();
  };
  const setCategories=open=>{const next=Boolean(open&&compact.matches);body.classList.toggle('public-category-open',next);toggle.setAttribute('aria-expanded',String(next));overlay.setAttribute('aria-hidden',String(!next))};
  const setSummary=open=>{const next=Boolean(open&&phone.matches);body.classList.toggle('public-summary-open',next);summary.setAttribute('aria-expanded',String(next))};
  const setResultsMode=active=>{
    const next=Boolean(active&&phone.matches);
    body.classList.toggle('public-mobile-results-mode',next);
    if(next){body.classList.remove('public-detail-open');panel.scrollTop=0}
    syncDetail();
  };
  const enterResultsMode=()=>setResultsMode(true);
  const leaveResultsMode=()=>setResultsMode(false);
  const closeDetail=()=>{if(!phone.matches){panel.classList.remove('open');panel.scrollTop=0;syncDetail();return}panel.getAnimations?.().forEach(animation=>animation.cancel());panel.classList.add('public-detail-closing');panel.classList.remove('open');body.classList.remove('public-detail-open');const animation=panel.animate([{transform:'translateY(0)'},{transform:'translateY(100%)'}],{duration:190,easing:'cubic-bezier(.22,.75,.25,1)'});const finish=()=>{if(!panel.classList.contains('public-detail-closing'))return;enterResultsMode();panel.classList.remove('public-detail-closing');panel.scrollTop=0;syncDetail()};animation.finished.then(finish,finish)};

  toggle.addEventListener('click',()=>setCategories(!body.classList.contains('public-category-open')));
  overlay.addEventListener('click',()=>setCategories(false));
  summary.addEventListener('click',()=>setSummary(!body.classList.contains('public-summary-open')));
  back.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();closeDetail()});
  nav.addEventListener('click',event=>{
    if(!event.target.closest('[data-category]'))return;
    if(phone.matches)enterResultsMode();
    queueMicrotask(()=>{syncLabels();setCategories(false)});
  },true);

  document.addEventListener('click',event=>{
    if(!phone.matches)return;
    const close=event.target?.closest?.('#detailPanel #closeDetail');
    if(close){event.preventDefault();event.stopImmediatePropagation();closeDetail();return}
    const favorite=event.target?.closest?.('[data-favorite]');
    const card=event.target?.closest?.('#entityList .entity-card[data-key]');
    if(card&&!favorite){
      leaveResultsMode();
      return;
    }
    const listAction=event.target?.closest?.('#changesButton,#applyFilters,#resetFilters,#emptyReset,#clearQuickButton,#favoritesButton,#recentButton');
    if(listAction)enterResultsMode();
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(body.classList.contains('public-category-open')){event.preventDefault();event.stopImmediatePropagation();setCategories(false);toggle.focus();return}
    if(phone.matches&&panel.classList.contains('open')&&!resultsMode()){event.preventDefault();event.stopImmediatePropagation();closeDetail()}
  },true);

  const reconcile=()=>{
    if(!compact.matches)setCategories(false);
    if(!phone.matches){setSummary(false);body.classList.remove('public-mobile-results-mode')}
    syncDetail();
  };
  compact.addEventListener?.('change',reconcile);
  phone.addEventListener?.('change',reconcile);
  new MutationObserver(syncLabels).observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  new MutationObserver(syncDetail).observe(panel,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  reconcile();
  globalThis.__SMASHDUMP_PUBLIC_RESPONSIVE_LAB__={marker:MARKER,reconcile,setCategories,setSummary,setResultsMode,enterResultsMode,leaveResultsMode,closeDetail,syncDetail};
})();
/* R6 desktop-only category-sidebar collapse. Mobile/tablet drawer ownership stays above. */
(()=>{
  'use strict';
  const STORAGE='sd-ency-qol-r6-sidebar-collapsed',desktop=matchMedia('(min-width:1280px)');
  const body=document.body,toolbar=document.querySelector('.toolbar'),search=document.querySelector('.search-wrap');
  if(!body||!toolbar)return;
  let button=document.getElementById('publicDesktopSidebarToggle');
  if(!button){
    button=document.createElement('button');button.id='publicDesktopSidebarToggle';button.className='toolbar-button public-desktop-sidebar-toggle';button.type='button';
    button.innerHTML='<span aria-hidden="true">☰</span><span class="public-desktop-sidebar-label">Categories</span>';
    toolbar.insertBefore(button,search||toolbar.firstChild);
  }
  function stored(){return localStorage.getItem(STORAGE)==='1'}
  function apply(){
    const collapsed=desktop.matches&&stored();body.classList.toggle('public-sidebar-collapsed',collapsed);
    button.setAttribute('aria-pressed',String(collapsed));button.title=collapsed?'Show category sidebar':'Hide category sidebar';
    const label=button.querySelector('.public-desktop-sidebar-label');if(label)label.textContent=collapsed?'Show categories':'Hide categories';
  }
  button.addEventListener('click',()=>{localStorage.setItem(STORAGE,stored()?'0':'1');apply()});
  desktop.addEventListener?.('change',apply);apply();
  globalThis.__SMASHDUMP_QOL_R6_SIDEBAR__={apply,collapsed:()=>body.classList.contains('public-sidebar-collapsed')};
})();
