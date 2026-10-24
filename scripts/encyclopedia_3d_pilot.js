(()=>{
  'use strict';
  const runtimeBase=new URL('./',location.href);
  const route=path=>new URL(path,runtimeBase).href;
  const MONSTER_INDEX=route('viewer3d/monsters/index.json?release=485ac3192a66743d');
  const MONSTER_VIEWER=route('viewer3d/monsters/index.html');
  const EQUIPMENT_INDEX=route('viewer3d/equipment/index.json?release=485ac3192a66743d');
  const EQUIPMENT_VIEWER=route('viewer3d/equipment/index.html');
  const EQUIPMENT_REVISION='485ac3192a66743d';
  const panel=document.getElementById('detailPanel');
  if(!panel)return;

  let overlay=null,frame=null,openKey=null;
  let monsterIndexPromise=null,equipmentIndexPromise=null;
  const loadJson=(url,label)=>fetch(url,{cache:'force-cache'}).then(response=>{if(!response.ok)throw new Error(`${label} HTTP ${response.status}`);return response.json()});
  const monsterIndex=()=>monsterIndexPromise??=(loadJson(MONSTER_INDEX,'3D monster index'));
  const equipmentIndex=()=>equipmentIndexPromise??=(loadJson(EQUIPMENT_INDEX,'3D equipment index'));

  function selectedCardKey(){return document.querySelector('#entityList .entity-card.selected[data-key]')?.dataset.key||''}
  async function selectedViewer(){
    const category=document.getElementById('categoryTitle')?.textContent?.trim(),key=selectedCardKey();
    if(category==='Enemies'){
      const match=/^enemies:(?:kind:)?(.+)$/.exec(key);if(!match)return null;
      const model=(await monsterIndex()).enemy_id_index?.[String(match[1])];
      return model?{key:`monster:${model}`,url:`${MONSTER_VIEWER}?release=485ac3192a66743d&model=${encodeURIComponent(model)}`,kind:'Monster'}:null;
    }
    if(category==='Weapons'){
      const match=/^weapons:(.+)$/.exec(key);if(!match)return null;const id=String(match[1]);
      const exists=(await equipmentIndex()).entities?.[`weapon:${id}`];
      return exists?{key:`weapon:${id}`,url:`${EQUIPMENT_VIEWER}?release=${EQUIPMENT_REVISION}&kind=weapon&id=${encodeURIComponent(id)}`,kind:'Weapon'}:null;
    }
    if(category==='Equipment'){
      const match=/^equipment:(.+)$/.exec(key);if(!match)return null;const id=String(match[1]);
      const exists=(await equipmentIndex()).entities?.[`armor:${id}`];
      return exists?{key:`armor:${id}`,url:`${EQUIPMENT_VIEWER}?release=${EQUIPMENT_REVISION}&kind=armor&id=${encodeURIComponent(id)}`,kind:'Equipment'}:null;
    }
    return null;
  }

  function sendSettings(next){try{frame?.contentWindow?.postMessage({type:'smashdump-viewer-settings',...next},location.origin)}catch{}}
  function ensureOverlay(){
    if(overlay)return overlay;
    overlay=document.createElement('div');overlay.className='sd-3d-viewer-overlay';overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<button class="sd-3d-viewer-close" type="button" aria-label="Close 3D viewer">← Back</button>';
    frame=document.createElement('iframe');frame.className='sd-3d-viewer-frame';frame.title='3D viewer';frame.loading='eager';overlay.appendChild(frame);document.body.appendChild(overlay);
    overlay.querySelector('.sd-3d-viewer-close').addEventListener('click',closeViewer);return overlay;
  }
  async function openViewer(){
    const target=await selectedViewer();if(!target)return;const root=ensureOverlay();
    if(openKey!==target.key){openKey=target.key;frame.title=`${panel.querySelector('.detail-header h2')?.textContent?.trim()||target.kind} 3D viewer`;frame.src=target.url;frame.addEventListener('load',()=>sendSettings({active:Boolean(overlay?.classList.contains('open')&&!document.hidden)}),{once:true})}
    root.classList.add('open');root.setAttribute('aria-hidden','false');document.body.classList.add('sd-3d-viewer-open');sendSettings({active:true});root.querySelector('.sd-3d-viewer-close')?.focus({preventScroll:true});
  }
  function closeViewer(){if(!overlay?.classList.contains('open'))return;sendSettings({active:false});overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('sd-3d-viewer-open');panel.querySelector('.sd-3d-viewer-button')?.focus({preventScroll:true})}

  let syncGeneration=0;
  async function syncButton(){
    const generation=++syncGeneration,existing=panel.querySelector('.sd-3d-viewer-button');let target=null;
    try{target=await selectedViewer()}catch(error){console.error('3D viewer index failed',error)}
    if(generation!==syncGeneration)return;
    if(!target){existing?.remove();if(overlay?.classList.contains('open'))closeViewer();return}
    const actions=panel.querySelector('.detail-actions');if(!actions)return;
    if(existing){existing.dataset.viewerKey=target.key;return}
    const button=document.createElement('button');button.type='button';button.className='action-button sd-3d-viewer-button';button.dataset.viewerKey=target.key;button.innerHTML='<span class="sd-3d-viewer-glyph" aria-hidden="true">3D</span><span class="sd-3d-viewer-label">3D VIEWER</span>';button.addEventListener('click',openViewer);actions.prepend(button);
  }

  new MutationObserver(()=>queueMicrotask(syncButton)).observe(panel,{childList:true,subtree:true});
  const categoryTitle=document.getElementById('categoryTitle');if(categoryTitle)new MutationObserver(()=>queueMicrotask(syncButton)).observe(categoryTitle,{childList:true,characterData:true,subtree:true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay?.classList.contains('open')){event.preventDefault();event.stopImmediatePropagation();closeViewer()}},true);
  document.addEventListener('visibilitychange',()=>{if(overlay?.classList.contains('open'))sendSettings({active:!document.hidden})});
  syncButton();
})();
