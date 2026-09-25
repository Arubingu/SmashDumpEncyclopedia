/* SMASHDUMP_ENCYCLOPEDIA_CHANGELOG_HISTORY_LAB_R2 */
(()=>{'use strict';
 const raw=globalThis.__SMASHDUMP_ENCYCLOPEDIA_CHANGELOG__;if(!raw)return;
 const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const CATEGORY_LABELS={accessories:'Accessories',jobs:'Vocations',memories:'Memories',weapons:'Weapons',equipment:'Equipment',gacha:'Gacha',abilities:'Abilities / Skills',enemies:'Enemies',events:'Events',shops:'Shops',drops:'Items / Materials',items:'Items / Materials',stages:'Stages / Quests',status_effects:'Status Effects'};
 const label=value=>CATEGORY_LABELS[String(value||'')]||String(value||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
 const alpha=(a,b)=>String(a||'').localeCompare(String(b||''),undefined,{sensitivity:'base',numeric:true});
 const total=groups=>(groups||[]).reduce((n,g)=>n+(Number(g?.count)||0),0);
 const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 const readJson=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}};
 const prettyDate=value=>{const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})/);if(!match)return String(value||'Unknown date');const months=['January','February','March','April','May','June','July','August','September','October','November','December'];return `${Number(match[3])} ${months[Number(match[2])-1]||match[2]} ${match[1]}`};
 const normalizeHistory=source=>{
  let entries=[];
  if(source?.schema==='smashdump.encyclopedia.changelog_history.v2'&&Array.isArray(source.entries))entries=source.entries.filter(entry=>entry&&typeof entry==='object'&&entry.update_id);
  else if(source&&typeof source==='object'&&source.update_id)entries=[source];
  const indexed=entries.map((entry,index)=>({entry,index}));
  indexed.sort((a,b)=>{
   const ad=String(a.entry.released_local_datetime||a.entry.released_local_date||'');
   const bd=String(b.entry.released_local_datetime||b.entry.released_local_date||'');
   return bd.localeCompare(ad)||a.index-b.index;
  });
  entries=indexed.map(row=>row.entry);
  const requestedLatest=String(source?.latest_update_id||'');
  const latestIndex=requestedLatest?entries.findIndex(entry=>String(entry.update_id)===requestedLatest):-1;
  if(latestIndex>0){const [latest]=entries.splice(latestIndex,1);entries.unshift(latest)}
  return {schema:'smashdump.encyclopedia.changelog_history.v2',latest_update_id:String(source?.latest_update_id||entries[0]?.update_id||''),entries};
 };
 const history=normalizeHistory(raw),latest=history.entries[0];if(!latest)return;
 const matchesActiveSnapshot=()=>{const active=globalThis.__SMASHDUMP_ENCYCLOPEDIA_ACTIVE_SNAPSHOT__;return Boolean(active)&&String(active.current_version||'')===String(latest.content_version||'')};
 const LAST_KEY='smashdump.encyclopedia.changelog.last_auto_shown';
 const DISMISSED_KEY='smashdump.encyclopedia.changelog.dismissed_update_id';
 const groupHtml=(groups,modified=false)=>[...(groups||[])].sort((a,b)=>alpha(label(a.category),label(b.category))).map(group=>`<details class="sd-changelog-category"><summary><span>${esc(label(group.category))}</span><b>${Number(group.count)||0}</b></summary><div class="sd-changelog-items">${[...(group.items||[])].sort((a,b)=>alpha(a.name,b.name)).map(item=>`<div class="sd-changelog-item"><span>${esc(item.name)}</span>${modified&&item.reason?`<small>${esc(item.reason)}</small>`:''}</div>`).join('')}</div></details>`).join('');
 const updateHtml=(entry,index)=>{
  const sourceChanges=Array.isArray(entry.encyclopedia_changes)?entry.encyclopedia_changes:[];
  const added=total(entry.content?.added),modified=total(entry.content?.modified),count=sourceChanges.length+added+modified;
  return `<details class="sd-changelog-update" data-update-id="${esc(entry.update_id)}" ${index===0?'open':''}><summary><span class="sd-changelog-update-title"><strong>${esc(prettyDate(entry.released_local_date||entry.released_local_datetime))}</strong><small>Content ${esc(entry.content_version)} · Encyclopedia ${esc(entry.encyclopedia_version)}</small></span><span class="sd-changelog-update-meta">${index===0?'<em class="sd-changelog-latest">Latest</em>':''}<b>${count}</b></span></summary><div class="sd-changelog-update-body"><details class="sd-changelog-section" open><summary><span>Encyclopedia changes</span><b>${sourceChanges.length}</b></summary><div class="sd-changelog-section-body"><p class="sd-changelog-intro">Bug fixes, renderer changes and Encyclopedia features.</p><div class="sd-changelog-source-list">${sourceChanges.map(item=>`<article><strong>${esc(item.title)}</strong><p>${esc(item.description)}</p></article>`).join('')||'<p class="sd-changelog-intro">No Encyclopedia-side changes recorded for this update.</p>'}</div></div></details><details class="sd-changelog-section" open><summary><span>New content · ${esc(entry.content_version)}</span><b>${added+modified}</b></summary><div class="sd-changelog-section-body sd-changelog-content"><details class="sd-changelog-subsection" open><summary><span>Added</span><b>${added}</b></summary><div class="sd-changelog-groups">${groupHtml(entry.content?.added,false)}</div></details><details class="sd-changelog-subsection"><summary><span>Modified</span><b>${modified}</b></summary><div class="sd-changelog-groups">${groupHtml(entry.content?.modified,true)}</div></details></div></details></div></details>`;
 };
 let overlay=null,button=null,lastFocus=null,installed=false;
 function build(){
  if(overlay?.isConnected)return overlay;
  overlay=document.createElement('div');overlay.id='sdChangelogOverlay';overlay.className='sd-changelog-overlay';overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML=`<section class="sd-changelog-modal" role="dialog" aria-modal="true" aria-labelledby="sdChangelogTitle"><header class="sd-changelog-header"><div><p>SmashDump Encyclopedia</p><h2 id="sdChangelogTitle">Changelog</h2><span>${history.entries.length} update${history.entries.length===1?'':'s'} archived · Latest: Content ${esc(latest.content_version)} · Encyclopedia ${esc(latest.encyclopedia_version)}</span></div><button type="button" class="sd-changelog-close" aria-label="Close changelog">×</button></header><div class="sd-changelog-scroll"><div class="sd-changelog-history">${history.entries.map(updateHtml).join('')}</div></div><footer class="sd-changelog-footer"><label><input id="sdChangelogDismiss" type="checkbox"> <span>Don't show again until the next update</span></label><button type="button" class="sd-changelog-done">Close</button></footer></section>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
  overlay.querySelector('.sd-changelog-close').addEventListener('click',close);
  overlay.querySelector('.sd-changelog-done').addEventListener('click',close);
  return overlay;
 }
 function syncDismiss(){
  const checked=Boolean(overlay?.querySelector('#sdChangelogDismiss')?.checked);
  if(checked)localStorage.setItem(DISMISSED_KEY,history.latest_update_id);
  else if(localStorage.getItem(DISMISSED_KEY)===history.latest_update_id)localStorage.removeItem(DISMISSED_KEY);
 }
 function open(manual){
  build();lastFocus=document.activeElement;
  const box=overlay.querySelector('#sdChangelogDismiss');box.checked=localStorage.getItem(DISMISSED_KEY)===history.latest_update_id;
  overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.documentElement.classList.add('sd-changelog-open');
  if(!manual)localStorage.setItem(LAST_KEY,JSON.stringify({update_id:history.latest_update_id,date:today()}));
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
  const shown=readJson(LAST_KEY,null),dismissed=localStorage.getItem(DISMISSED_KEY)===history.latest_update_id;
  if(!dismissed&&(!shown||shown.update_id!==history.latest_update_id||shown.date!==today()))queueMicrotask(()=>open(false));
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
 globalThis.__SMASHDUMP_CHANGELOG_CANDIDATE_TEST__={open:()=>open(true),close,metadata:history,normalizeHistory};
})();
