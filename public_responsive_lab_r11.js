/* SMASHDUMP_PUBLIC_RESPONSIVE_LAB_R11 - mobile browsing-density controls. */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_PUBLIC_RESPONSIVE_LAB_R11';
  const body=document.body,toolbar=document.querySelector('.toolbar'),category=document.getElementById('publicCategoryToggle');
  const list=document.getElementById('entityList'),phone=matchMedia('(max-width:959px)');
  if(!body||!toolbar||!category||!list)return;
  let button=document.getElementById('publicMobileControlsToggle'),manualState=null,scheduled=false,lastScrollTop=list.scrollTop,direction=0,directionDistance=0,settlingUntil=0;
  if(!button){
    button=document.createElement('button');button.id='publicMobileControlsToggle';button.className='public-mobile-controls-toggle';button.type='button';
    button.innerHTML='<span aria-hidden="true">☷</span><span class="public-mobile-controls-label">Tools</span><span class="public-mobile-controls-count">0</span>';
    category.after(button);
  }
  let drawer=document.getElementById('publicMobileControlsDrawer'),tray=document.getElementById('publicMobileControlsTray');
  if(!drawer){drawer=document.createElement('div');drawer.id='publicMobileControlsDrawer';drawer.className='public-mobile-controls-drawer';tray=document.createElement('div');tray.id='publicMobileControlsTray';tray.className='public-mobile-controls-tray';drawer.append(tray);button.after(drawer);[...toolbar.children].filter(node=>node!==category&&node!==button&&node!==drawer).forEach(node=>tray.append(node))}
  function collectLateControls(){[...toolbar.children].filter(node=>node!==category&&node!==button&&node!==drawer).forEach(node=>tray.append(node))}
  const collapsed=()=>body.classList.contains('public-mobile-controls-collapsed');
  function activeFilterCount(){return Number(document.getElementById('filterCount')?.textContent||0)||document.querySelectorAll('#activeFilters .filter-chip').length}
  function syncButton(){
    const count=activeFilterCount(),open=!collapsed();button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-pressed',String(open));
    button.title=open?'Hide search, filters and display controls':'Show search, filters and display controls';
    const label=button.querySelector('.public-mobile-controls-label'),badge=button.querySelector('.public-mobile-controls-count');
    const nextLabel=open?'Hide tools':'Tools',nextCount=String(count);
    if(label.textContent!==nextLabel)label.textContent=nextLabel;
    if(badge.textContent!==nextCount)badge.textContent=nextCount;
    button.classList.toggle('has-active-filters',count>0);
  }
  function drawerHeight(){return Math.max(1,Math.ceil(tray.scrollHeight||tray.getBoundingClientRect().height))}
  function measureDrawer(){if(!phone.matches||collapsed())return;const height=drawerHeight();drawer.style.setProperty('--public-tools-height',height+'px');drawer.style.height=height+'px'}
  function setCollapsed(value){
    const next=Boolean(value&&phone.matches),was=collapsed();
    if(!phone.matches){body.classList.remove('public-mobile-controls-collapsed');drawer.getAnimations?.().forEach(animation=>animation.cancel());tray.getAnimations?.().forEach(animation=>animation.cancel());drawer.style.removeProperty('height');syncButton();return}
    if(next===was){syncButton();return}
    const height=drawerHeight(),duration=150,easing='cubic-bezier(.22,.75,.25,1)';
    settlingUntil=performance.now()+duration+80;direction=0;directionDistance=0;
    drawer.style.setProperty('--public-tools-height',height+'px');drawer.getAnimations?.().forEach(animation=>animation.cancel());tray.getAnimations?.().forEach(animation=>animation.cancel());
    body.classList.toggle('public-mobile-controls-collapsed',next);
    drawer.style.height=next?'0px':height+'px';
    drawer.animate(next?[{height:height+'px'},{height:'0px'}]:[{height:'0px'},{height:height+'px'}],{duration,easing});
    tray.animate(next?[{transform:'translateY(0)'},{transform:'translateY(-'+height+'px)'}]:[{transform:'translateY(-'+height+'px)'},{transform:'translateY(0)'}],{duration,easing});
    syncButton();
  }
  function reconcile(){
    if(!phone.matches){manualState=null;setCollapsed(false);return}
    const current=Math.max(0,list.scrollTop),delta=current-lastScrollTop;lastScrollTop=current;
    if(performance.now()<settlingUntil){direction=0;directionDistance=0;return}
    if(current<=40){manualState=null;direction=0;directionDistance=0;setCollapsed(false);return}
    if(Math.abs(delta)<1)return;
    const nextDirection=delta>0?1:-1;
    directionDistance=nextDirection===direction?directionDistance+Math.abs(delta):Math.abs(delta);direction=nextDirection;
    if(nextDirection<0&&directionDistance>=36){manualState=null;directionDistance=0;setCollapsed(false)}
    else if(nextDirection>0&&directionDistance>=48){manualState=null;directionDistance=0;setCollapsed(true)}
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;reconcile()})}
  button.addEventListener('click',()=>{manualState=collapsed()?'open':'closed';direction=0;directionDistance=0;setCollapsed(manualState==='closed')});
  list.addEventListener('scroll',schedule,{passive:true});
  document.getElementById('categoryNav')?.addEventListener('click',event=>{if(!event.target.closest('[data-category]'))return;manualState=null;lastScrollTop=0;direction=0;directionDistance=0;setCollapsed(false)},true);
  const filterCount=document.getElementById('filterCount'),activeFilters=document.getElementById('activeFilters');
  if(filterCount)new MutationObserver(syncButton).observe(filterCount,{subtree:true,childList:true,characterData:true});
  if(activeFilters)new MutationObserver(syncButton).observe(activeFilters,{subtree:true,childList:true});
  new MutationObserver(()=>{collectLateControls();requestAnimationFrame(measureDrawer)}).observe(toolbar,{childList:true});
  new ResizeObserver(()=>{if(phone.matches&&!collapsed())measureDrawer()}).observe(tray);
  phone.addEventListener?.('change',()=>{reconcile();requestAnimationFrame(measureDrawer)});reconcile();requestAnimationFrame(measureDrawer);
  globalThis.__SMASHDUMP_PUBLIC_RESPONSIVE_LAB_R11__={marker:MARKER,reconcile,setCollapsed,collapsed};
})();
