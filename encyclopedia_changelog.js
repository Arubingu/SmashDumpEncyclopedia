/* SMASHDUMP_ENCYCLOPEDIA_CHANGELOG_CANDIDATE_TEST_R1 */
(()=>{'use strict';
 const meta=globalThis.__SMASHDUMP_ENCYCLOPEDIA_CHANGELOG__;if(!meta)return;
 const matchesActiveSnapshot=()=>{const active=globalThis.__SMASHDUMP_ENCYCLOPEDIA_ACTIVE_SNAPSHOT__;return Boolean(active)&&String(active.current_version||'')===String(meta.content_version||'')};
 const LAST_KEY='smashdump.encyclopedia.changelog.last_auto_shown';
 const DISMISSED_KEY='smashdump.encyclopedia.changelog.dismissed_update_id';
 const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const CATEGORY_LABELS={accessories:'Accessories',jobs:'Vocations',memories:'Memories',weapons:'Weapons',equipment:'Equipment',gacha:'Gacha',abilities:'Abilities / Skills',enemies:'Enemies',events:'Events',shops:'Shops',drops:'Items / Materials',items:'Items / Materials',stages:'Stages / Quests',status_effects:'Status Effects'};
 const label=value=>CATEGORY_LABELS[String(value||'')]||String(value||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
 const alpha=(a,b)=>String(a||'').localeCompare(String(b||''),undefined,{sensitivity:'base',numeric:true});
 const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 const readJson=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}};
 const total=groups=>(groups||[]).reduce((n,g)=>n+(Number(g.count)||0),0);
 const groupHtml=(groups,modified=false)=>[...(groups||[])].sort((a,b)=>alpha(label(a.category),label(b.category))).map(group=>`<details class="sd-changelog-category"><summary><span>${esc(label(group.category))}</span><b>${Number(group.count)||0}</b></summary><div class="sd-changelog-items">${[...(group.items||[])].sort((a,b)=>alpha(a.name,b.name)).map(item=>`<div class="sd-changelog-item"><span>${esc(item.name)}</span>${modified&&item.reason?`<small>${esc(item.reason)}</small>`:''}</div>`).join('')}</div></details>`).join('');
 let overlay=null,button=null,lastFocus=null,installed=false;
 function build(){
  if(overlay?.isConnected)return overlay;
  overlay=document.createElement('div');overlay.id='sdChangelogOverlay';overlay.className='sd-changelog-overlay';overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML=`<section class="sd-changelog-modal" role="dialog" aria-modal="true" aria-labelledby="sdChangelogTitle"><header class="sd-changelog-header"><div><p>SmashDump Encyclopedia</p><h2 id="sdChangelogTitle">Changelog</h2><span>Content ${esc(meta.content_version)} · Encyclopedia ${esc(meta.encyclopedia_version)}</span></div><button type="button" class="sd-changelog-close" aria-label="Close changelog">×</button></header><div class="sd-changelog-scroll"><details class="sd-changelog-section" open><summary><span>Encyclopedia ${esc(meta.encyclopedia_version)}</span><b>${(meta.encyclopedia_changes||[]).length}</b></summary><div class="sd-changelog-section-body"><p class="sd-changelog-intro">Bug fixes, renderer changes and Encyclopedia features.</p><div class="sd-changelog-source-list">${(meta.encyclopedia_changes||[]).map(item=>`<article><strong>${esc(item.title)}</strong><p>${esc(item.description)}</p></article>`).join('')}</div></div></details><details class="sd-changelog-section" open><summary><span>New content · ${esc(meta.content_version)}</span><b>${total(meta.content?.added)+total(meta.content?.modified)}</b></summary><div class="sd-changelog-section-body sd-changelog-content"><details class="sd-changelog-subsection" open><summary><span>Added</span><b>${total(meta.content?.added)}</b></summary><div class="sd-changelog-groups">${groupHtml(meta.content?.added,false)}</div></details><details class="sd-changelog-subsection"><summary><span>Modified</span><b>${total(meta.content?.modified)}</b></summary><div class="sd-changelog-groups">${groupHtml(meta.content?.modified,true)}</div></details></div></details></div><footer class="sd-changelog-footer"><label><input id="sdChangelogDismiss" type="checkbox"> <span>Don't show again until the next update</span></label><button type="button" class="sd-changelog-done">Close</button></footer></section>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
  overlay.querySelector('.sd-changelog-close').addEventListener('click',close);
  overlay.querySelector('.sd-changelog-done').addEventListener('click',close);
  return overlay;
 }
 function syncDismiss(){
  const checked=Boolean(overlay?.querySelector('#sdChangelogDismiss')?.checked);
  if(checked)localStorage.setItem(DISMISSED_KEY,meta.update_id);
  else if(localStorage.getItem(DISMISSED_KEY)===meta.update_id)localStorage.removeItem(DISMISSED_KEY);
 }
 function open(manual){
  build();lastFocus=document.activeElement;
  const box=overlay.querySelector('#sdChangelogDismiss');box.checked=localStorage.getItem(DISMISSED_KEY)===meta.update_id;
  overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.documentElement.classList.add('sd-changelog-open');
  if(!manual)localStorage.setItem(LAST_KEY,JSON.stringify({update_id:meta.update_id,date:today()}));
  requestAnimationFrame(()=>overlay.querySelector('.sd-changelog-close')?.focus());
 }
 function close(){
  if(!overlay?.classList.contains('open'))return;
  syncDismiss();overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.documentElement.classList.remove('sd-changelog-open');lastFocus?.focus?.();
 }
 function install(){
  if(!matchesActiveSnapshot())return false;
  const block=document.getElementById('r81SnapshotBlock'),version=document.getElementById('versionLabel'),nav=document.getElementById('categoryNav');
  if(!block||!version||!nav||nav.childElementCount===0||/^Loading/i.test(String(version.textContent||'')))return false;
  if(!button?.isConnected){button=document.createElement('button');button.id='sdChangelogButton';button.className='toolbar-button sd-changelog-button';button.type='button';button.textContent='Changelog';button.addEventListener('click',()=>open(true));block.insertAdjacentElement('afterend',button)}
  build();
  const shown=readJson(LAST_KEY,null),dismissed=localStorage.getItem(DISMISSED_KEY)===meta.update_id;
  if(!dismissed&&(!shown||shown.update_id!==meta.update_id||shown.date!==today()))queueMicrotask(()=>open(false));
  return true;
 }
 document.addEventListener('keydown',event=>{
  if(!overlay?.classList.contains('open'))return;
  if(event.key==='Escape'){event.preventDefault();close();return}
  if(event.key!=='Tab')return;
  const focusable=[...overlay.querySelectorAll('button,input,summary,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled&&el.offsetParent!==null);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 });
 const observer=new MutationObserver(()=>{if(!installed)installed=install()});observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});installed=install();
 globalThis.__SMASHDUMP_CHANGELOG_CANDIDATE_TEST__={open:()=>open(true),close,metadata:meta};
})();
