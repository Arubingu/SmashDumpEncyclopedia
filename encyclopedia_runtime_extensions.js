/* SMASHDUMP_PUBLIC_QOL_LAB_R6 — disposable static-export QoL prototype only. */
(()=>{
  'use strict';
  const META=globalThis.__SMASHDUMP_QOL_R6_META__;
  if(!META){console.error('QoL R6 metadata is unavailable');return}
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object||{},key);
  const finite=value=>Number.isFinite(Number(value))?Number(value):Number.MAX_SAFE_INTEGER;
  let abilityView=localStorage.getItem('sd-ency-qol-r6-ability-view')==='coup_de_grace'?'coup_de_grace':'skill';

  function abilityKind(row){
    const kind=String(row?.r41_ref?.kind||row?.r4_ref?.kind||'');
    if(kind==='skill'||kind==='coup_de_grace')return kind;
    return /coup de gr/i.test(String(row?.subtitle||''))?'coup_de_grace':'skill';
  }
  function abilityRows(kind=abilityView){return (state.data?.categories?.abilities||[]).filter(row=>abilityKind(row)===kind)}
  function abilityLabel(kind=abilityView){return kind==='coup_de_grace'?'Coup de Grâce':'Skills'}
  function clearCategorySearch(){
    state.query='';state.r26c4SearchDraft='';
    const input=document.getElementById('searchInput');if(input)input.value='';
  }
  function worldCurrent(entity){return globalThis.__SMASHDUMP_STAGE3_R5_7__?.model?.()?.categories?.[entity?.category]?.[String(entity?.id)]?.current||graph(entity)||{}}
  function enemyMeta(entity){
    const current=worldCurrent(entity),raw=String(entity?.id??''),kind=raw.startsWith('kind:')?raw:`kind:${current?.enemy_kind_id??raw}`;
    return META.enemies?.[kind]||null;
  }
  function shopMeta(entity){return META.shops?.[String(entity?.id)]||null}
  function gachaMeta(entity){return META.gacha?.[String(entity?.id)]||null}

  /* Fresh visitors use compact view. A stored card/table choice remains authoritative. */
  if(!['cards','table'].includes(localStorage.getItem('sd-ency-view')||''))state.view='table';

  const priorCategoryRows=categoryRows;
  categoryRows=function(...args){
    const rows=priorCategoryRows.apply(this,args);
    return state.category==='abilities'?rows.filter(row=>abilityKind(row)===abilityView):rows;
  };

  const priorCurrentSort=currentSort;
  currentSort=function(){
    if(own(state.sorts,state.category))return priorCurrentSort();
    if(state.category==='memories')return'album-asc';
    if(state.category==='enemies')return'enemy-album-asc';
    if(state.category==='events')return'event-order-desc';
    if(state.category==='shops')return'shop-game-order';
    if(state.category==='gacha')return'gacha-game-order';
    return priorCurrentSort();
  };

  const priorSortOptions=sortOptions;
  sortOptions=function(){
    const base=priorSortOptions(),extra=state.category==='shops'
      ?[['shop-game-order','Game order · Limited, then Normal']]
      :state.category==='gacha'?[['gacha-game-order','Game display order']]
      :state.category==='enemies'?[['enemy-album-asc','Album number · low to high']]
      :[];
    const seen=new Set();return [...extra,...base].filter(([key])=>!seen.has(key)&&seen.add(key));
  };

  const priorCompareRows=compareRows;
  compareRows=function(a,b){
    const mode=currentSort(),tie=()=>nameOf(a).localeCompare(nameOf(b),undefined,{numeric:true,sensitivity:'base'});
    if(mode==='shop-game-order'){
      const A=shopMeta(a)||{},B=shopMeta(b)||{},rank=value=>Number(value)===2?0:Number(value)===1?1:2;
      return rank(A.type)-rank(B.type)||finite(A.display_order)-finite(B.display_order)||tie();
    }
    if(mode==='gacha-game-order'){
      const A=gachaMeta(a)||{},B=gachaMeta(b)||{};return finite(A.display_order)-finite(B.display_order)||tie();
    }
    if(mode==='enemy-album-asc'){
      const A=enemyMeta(a),B=enemyMeta(b);return finite(A?.album_number)-finite(B?.album_number)||finite(A?.album_type)-finite(B?.album_type)||tie();
    }
    return priorCompareRows(a,b);
  };

  function rewriteAbilitySummary(){
    if(state.category!=='abilities')return;
    const rows=abilityRows(),stats=[rows.length,rows.filter(row=>String(row.status||'').startsWith('Added')).length,rows.filter(row=>row.status==='Modified').length,rows.filter(row=>/unresolved|missing/i.test(String(row.status||''))).length];
    [...document.querySelectorAll('#summaryStrip .summary-card strong')].forEach((node,index)=>{if(index<stats.length)node.textContent=fmt(stats[index])});
  }
  const priorRenderSummary=renderSummary;
  renderSummary=function(...args){const out=priorRenderSummary.apply(this,args);rewriteAbilitySummary();return out};

  function abilityButton(base,kind,label){
    const button=base.cloneNode(true),rows=abilityRows(kind),labelNode=button.querySelector('span:nth-child(2)'),count=button.querySelector('.count');
    button.dataset.category='abilities';button.dataset.qolAbilityKind=kind;button.classList.toggle('active',state.category==='abilities'&&abilityView===kind);button.classList.remove('disabled');button.disabled=false;
    if(labelNode)labelNode.textContent=label;if(count)count.textContent=fmt(rows.length);
    button.onclick=event=>{event.preventDefault();const changed=state.category!=='abilities'||abilityView!==kind;if(changed)clearCategorySearch();abilityView=kind;localStorage.setItem('sd-ency-qol-r6-ability-view',kind);state.category='abilities';state.selected=null;state.onlyFavorites=false;state.onlyRecent=false;renderAll()};
    return button;
  }
  function wireCategoryNav(){
    const nav=document.getElementById('categoryNav'),base=nav?.querySelector('.category-button[data-category="abilities"]:not([data-qol-ability-kind])');
    if(base){const skills=abilityButton(base,'skill','Skills'),cdg=abilityButton(base,'coup_de_grace','Coup de Grâce');base.before(skills,cdg);base.remove()}
    nav?.querySelectorAll('.category-button[data-category]:not([data-qol-ability-kind])').forEach(button=>{
      const original=button.onclick,next=button.dataset.category;button.onclick=function(event){if(next&&next!==state.category)clearCategorySearch();return original?.call(this,event)};
    });
  }
  const priorRenderNav=renderNav;
  renderNav=function(...args){const out=priorRenderNav.apply(this,args);wireCategoryNav();return out};

  function updateAbilityHeading(){if(state.category!=='abilities')return;const title=document.getElementById('categoryTitle');if(title)title.textContent=abilityLabel()}
  function ended(entity){const end=Date.parse(worldCurrent(entity)?.end_utc||'');return Number.isFinite(end)&&end<Date.now()}
  function decorateEndedGroup(){
    const list=document.getElementById('entityList');if(!list||!['shops','gacha'].includes(state.category))return;
    let group=list.querySelector(':scope > details.qol-r6-ended-group'),body=group?.querySelector(':scope > .qol-r6-ended-body');
    const cards=[...list.querySelectorAll(':scope > .entity-card[data-key]')].filter(card=>{const row=findByKey(card.dataset.key);return row&&ended(row)});
    if(!group&&!cards.length)return;
    if(!group){
      group=document.createElement('details');group.className='qol-r6-ended-group';group.dataset.qolR6Ended=state.category;
      group.innerHTML='<summary><span><strong>Ended content</strong><small>Hidden by default · expand instantly</small></span><b class="qol-r6-ended-count"></b></summary><div class="qol-r6-ended-body"></div>';
      const saved=loadJson('sd-ency-qol-r6-ended-open',{});group.open=Boolean(saved[state.category]);
      group.addEventListener('toggle',()=>{const current=loadJson('sd-ency-qol-r6-ended-open',{});current[state.category]=group.open;localStorage.setItem('sd-ency-qol-r6-ended-open',JSON.stringify(current))});
      list.append(group);body=group.querySelector(':scope > .qol-r6-ended-body');
    }
    for(const card of cards)body.append(card);
    const count=body.querySelectorAll(':scope > .entity-card[data-key]').length,badge=group.querySelector('.qol-r6-ended-count');if(badge)badge.textContent=`${fmt(count)} ended`;
  }
  function decorateList(){document.body.classList.toggle('qol-r6-table-view',state.view==='table');updateAbilityHeading();decorateEndedGroup()}
  const priorRenderList=renderList;
  renderList=function(...args){const out=priorRenderList.apply(this,args);decorateList();queueMicrotask(()=>{decorateList();requestAnimationFrame(decorateList)});return out};

  function reorderShopOffers(entity){
    if(entity?.category!=='shops')return;const meta=shopMeta(entity);if(!meta)return;
    const host=document.querySelector('#detailPanel .s3r516r4-offers')||document.querySelector('#detailPanel .s3r516r2-offers');if(!host)return;
    const nodes=[...host.children].filter(node=>node.matches('.s3r516r4-offer,.s3r516r2-offer'));if(nodes.length!==meta.offer_display_orders?.length)return;
    nodes.map((node,index)=>({node,index,order:finite(meta.offer_display_orders[index]),id:finite(meta.offer_ids?.[index])})).sort((a,b)=>a.order-b.order||a.id-b.id||a.index-b.index).forEach(item=>{item.node.dataset.qolR6DisplayOrder=String(item.order);item.node.dataset.qolR6OfferId=String(item.id);host.append(item.node)});
  }
  const priorRenderDetail=renderDetail;
  renderDetail=function(entity,...args){const out=priorRenderDetail.call(this,entity,...args);reorderShopOffers(entity);return out};

  const priorSelectByKey=selectByKey;
  selectByKey=function(target,...args){
    const entity=findByKey(String(target||'')),oldCategory=state.category,oldAbilityView=abilityView;
    if(entity&&entity.category!==oldCategory)clearCategorySearch();
    if(entity?.category==='abilities'){abilityView=abilityKind(entity);localStorage.setItem('sd-ency-qol-r6-ability-view',abilityView);if(oldCategory==='abilities'&&oldAbilityView!==abilityView)clearCategorySearch()}
    const out=priorSelectByKey.call(this,target,...args);
    if(entity?.category==='abilities'&&oldCategory==='abilities'&&oldAbilityView!==abilityView)renderAll();
    return out;
  };

  const priorRenderAll=renderAll;
  renderAll=function(...args){const out=priorRenderAll.apply(this,args);rewriteAbilitySummary();decorateList();return out};

  globalThis.__SMASHDUMP_QOL_R6__={marker:'SMASHDUMP_PUBLIC_QOL_LAB_R6',metadata:META,clearCategorySearch,inspect:()=>({view:state.view,category:state.category,ability_view:abilityView,sort:currentSort(),ended_group:document.querySelector('#entityList > details.qol-r6-ended-group')?.querySelectorAll('.entity-card[data-key]').length||0,search:state.query,search_draft:state.r26c4SearchDraft||''})};
})();

/* SMASHDUMP_PUBLIC_QOL_LAB_R7 - disposable static-export polish layer only. */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_PUBLIC_QOL_LAB_R7';

  async function waitForR6(timeoutMs=60000){
    const started=Date.now();
    while(!globalThis.__SMASHDUMP_QOL_R6__||!globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R2__||typeof renderList!=='function'||typeof compareRows!=='function'){
      if(Date.now()-started>timeoutMs)throw Error('QoL R7 timed out waiting for the R6 renderer');
      await new Promise(resolve=>setTimeout(resolve,25));
    }
  }

  function install(){
    if(globalThis.__SMASHDUMP_QOL_R7__)return globalThis.__SMASHDUMP_QOL_R7__;
    const META7=globalThis.__SMASHDUMP_QOL_R7_META__||{};
    const META6=globalThis.__SMASHDUMP_QOL_R6_META__||{};
    const STAGE_R2=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R2__;
    const own=(object,key)=>Object.prototype.hasOwnProperty.call(object||{},key);
    const number=value=>Number.isFinite(Number(value))?Number(value):0;
    const future=value=>Number.isFinite(Number(value))?Number(value):Number.MAX_SAFE_INTEGER;
    const stamp=value=>Number.isFinite(Number(value))?Number(value):Number.NEGATIVE_INFINITY;
    const tie=(a,b)=>String(previousNameOf(a)).localeCompare(String(previousNameOf(b)),undefined,{numeric:true,sensitivity:'base'});
    const worldCurrent=entity=>globalThis.__SMASHDUMP_STAGE3_R5_7__?.model?.()?.categories?.[entity?.category]?.[String(entity?.id)]?.current||graph(entity)||{};

    function isMortamorWeapon(entity){
      if(entity?.category!=='enemies')return false;
      const id=String(entity?.id??''),current=graph(entity)||{};
      return id==='kind:239'||id==='239'||Number(current.enemy_kind_id)===239;
    }
    const previousNameOf=nameOf;
    nameOf=function(entity){return isMortamorWeapon(entity)?'Mortamor Weapon':previousNameOf(entity)};
    function applyMortamorIdentityCorrection(){
      const live=(state.data?.categories?.enemies||[]).find(isMortamorWeapon);
      if(live?.name&&typeof live.name==='object')live.name.text='Mortamor Weapon';
      const liveCurrent=live?.current&&typeof live.current==='object'?live.current:null;
      if(liveCurrent?.family_name)liveCurrent.family_name='Mortamor Weapon';
      if(Array.isArray(liveCurrent?.search_aliases))liveCurrent.search_aliases=['Mortamor Weapon'];
      const world=globalThis.__SMASHDUMP_STAGE3_R5_7__?.model?.()?.categories?.enemies?.['kind:239'];
      if(world?.name&&typeof world.name==='object')world.name.text='Mortamor Weapon';
      if(world?.current&&typeof world.current==='object'){
        world.current.family_name='Mortamor Weapon';
        world.current.search_aliases=['Mortamor Weapon'];
      }
    }
    applyMortamorIdentityCorrection();

    function abilityKind(row){
      const kind=String(row?.r41_ref?.kind||row?.r4_ref?.kind||'');
      if(kind==='skill'||kind==='coup_de_grace')return kind;
      return /coup de gr/i.test(String(row?.subtitle||''))?'coup_de_grace':'skill';
    }
    function fixAbilityCounts(){
      const rows=state.data?.categories?.abilities||[];
      document.querySelectorAll('#categoryNav .category-button[data-category="abilities"][data-qol-ability-kind]').forEach(button=>{
        const kind=button.dataset.qolAbilityKind,count=rows.filter(row=>abilityKind(row)===kind).length,node=button.querySelector('.count');
        if(node){const text=fmt(count);if(node.textContent!==text)node.textContent=text;node.title=`${text} ${kind==='coup_de_grace'?'Coup de Grace entries':'Skill entries'}`}
      });
    }

    function memoryAlbum(entity){
      const row=graph(entity)?.row||{};
      return {album:future(row.album_number),family:future(row.orb_album_type)};
    }
    function gachaSemantic(entity){
      const current=worldCurrent(entity),payments=(current.draws||[]).map(draw=>String(draw?.payment?.name||'').trim().toLowerCase());
      const limited=Boolean(String(current.end_utc||'').trim()),paid=payments.includes('paid gems'),gems=payments.includes('gems');
      return {rank:limited&&paid?0:limited&&gems?1:limited?2:3,display:number(META6.gacha?.[String(entity?.id)]?.display_order)};
    }

    const previousCurrentSort=currentSort;
    currentSort=function(){
      if(!own(state.sorts,state.category)){
        if(state.category==='memories')return'memory-album-family';
        if(state.category==='shops')return'shop-recent';
        if(state.category==='gacha')return'gacha-semantic';
      }
      return previousCurrentSort();
    };

    const previousSortOptions=sortOptions;
    sortOptions=function(){
      const base=previousSortOptions(),extra=state.category==='memories'
        ?[['memory-album-family','Album number - Story / Event together']]
        :state.category==='shops'?[['shop-recent','Latest refreshed - newest first']]
        :state.category==='gacha'?[['gacha-semantic','Paid limited - Gem limited - Permanent']]
        :[];
      const seen=new Set();return [...extra,...base].filter(([key])=>!seen.has(key)&&seen.add(key));
    };

    const previousCompareRows=compareRows;
    compareRows=function(a,b){
      const mode=currentSort();
      if(mode==='memory-album-family'){
        const A=memoryAlbum(a),B=memoryAlbum(b);return A.album-B.album||A.family-B.family||tie(a,b);
      }
      if(mode==='shop-recent'){
        const A=stamp(META7.shop_latest_offer_start_at?.[String(a?.id)]),B=stamp(META7.shop_latest_offer_start_at?.[String(b?.id)]);
        const ma=META6.shops?.[String(a?.id)]||{},mb=META6.shops?.[String(b?.id)]||{};
        return B-A||number(mb.display_order)-number(ma.display_order)||tie(a,b);
      }
      if(mode==='gacha-semantic'){
        const A=gachaSemantic(a),B=gachaSemantic(b);return A.rank-B.rank||A.display-B.display||tie(a,b);
      }
      return previousCompareRows(a,b);
    };

    function ended(entity){const end=Date.parse(worldCurrent(entity)?.end_utc||'');return Number.isFinite(end)&&end<Date.now()}
    function decorateEndedEvents(){
      if(state.category!=='events')return;
      const list=document.getElementById('entityList');if(!list)return;
      let group=list.querySelector(':scope > details.qol-r6-ended-group'),body=group?.querySelector(':scope > .qol-r6-ended-body');
      const cards=[...list.querySelectorAll(':scope > .entity-card[data-key]')].filter(card=>{const row=findByKey(card.dataset.key);return row&&ended(row)});
      if(!group&&!cards.length)return;
      if(!group){
        group=document.createElement('details');group.className='qol-r6-ended-group';group.dataset.qolR7Ended='events';
        group.innerHTML='<summary><span><strong>Ended content</strong><small>Hidden by default · expand instantly</small></span><b class="qol-r6-ended-count"></b></summary><div class="qol-r6-ended-body"></div>';
        const saved=loadJson('sd-ency-qol-r6-ended-open',{});group.open=Boolean(saved.events);
        group.addEventListener('toggle',()=>{const current=loadJson('sd-ency-qol-r6-ended-open',{});current.events=group.open;localStorage.setItem('sd-ency-qol-r6-ended-open',JSON.stringify(current))});
        list.append(group);body=group.querySelector(':scope > .qol-r6-ended-body');
      }
      for(const card of cards)body.append(card);
      const count=body.querySelectorAll(':scope > .entity-card[data-key]').length,badge=group.querySelector('.qol-r6-ended-count');if(badge)badge.textContent=`${fmt(count)} ended`;
    }

    function normalizeStageCompactClasses(){
      if(state.category!=='stages'||state.view!=='table')return;
      const list=document.getElementById('entityList');if(!list?.classList.contains('s3r513r2-stage-index'))return;
      list.classList.remove('card-mode');list.classList.add('table-mode','qol-r7-stage-compact');
    }
    function ensureStageCompactHierarchy(){
      if(state.category!=='stages'||state.view!=='table')return;
      const list=document.getElementById('entityList');if(!list)return;
      if(!list.classList.contains('s3r513r2-stage-index')){
        const saved=state.view;state.view='cards';
        try{STAGE_R2.rebuildStageIndex()}finally{state.view=saved}
      }
      normalizeStageCompactClasses();
      queueMicrotask(normalizeStageCompactClasses);requestAnimationFrame(normalizeStageCompactClasses);
    }

    function applyCompactStageSearch(){
      if(state.category!=='stages'||state.view!=='table')return false;
      const stageSearch=globalThis.__SMASHDUMP_STAGE3_R5_15_CORRECTED_R1__;
      if(typeof stageSearch?.applySearch!=='function')return false;
      const saved=state.view;state.view='cards';
      try{return stageSearch.applySearch()}finally{state.view=saved;normalizeStageCompactClasses();requestAnimationFrame(normalizeStageCompactClasses)}
    }

    function applyCompactStageChanges(){
      if(state.category!=='stages'||state.view!=='table')return false;
      const stageChanges=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R10__;
      if(typeof stageChanges?.applyChangesOnly!=='function')return false;
      const saved=state.view;state.view='cards';
      try{return stageChanges.applyChangesOnly()}finally{state.view=saved;normalizeStageCompactClasses();requestAnimationFrame(normalizeStageCompactClasses)}
    }

    function reorderShopOffersDescending(entity){
      if(entity?.category!=='shops')return;
      const host=document.querySelector('#detailPanel .s3r516r4-offers')||document.querySelector('#detailPanel .s3r516r2-offers');if(!host)return;
      const nodes=[...host.children].filter(node=>node.matches('.s3r516r4-offer,.s3r516r2-offer'));
      if(!nodes.length||nodes.some(node=>!node.dataset.qolR6DisplayOrder))return;
      nodes.map((node,index)=>({node,index,order:number(node.dataset.qolR6DisplayOrder),id:number(node.dataset.qolR6OfferId)}))
        .sort((a,b)=>b.order-a.order||b.id-a.id||b.index-a.index).forEach(item=>host.append(item.node));
    }

    function polish(){applyMortamorIdentityCorrection();fixAbilityCounts();decorateEndedEvents();ensureStageCompactHierarchy()}
    function schedulePolish(){queueMicrotask(()=>{polish();requestAnimationFrame(polish)})}

    const previousRenderNav=renderNav;
    renderNav=function(...args){const out=previousRenderNav.apply(this,args);fixAbilityCounts();schedulePolish();return out};
    const previousRenderList=renderList;
    renderList=function(...args){const out=previousRenderList.apply(this,args);polish();schedulePolish();return out};
    const previousRenderDetail=renderDetail;
    renderDetail=function(entity,...args){const out=previousRenderDetail.call(this,entity,...args);reorderShopOffersDescending(entity);return out};
    const previousRenderAll=renderAll;
    renderAll=function(...args){const out=previousRenderAll.apply(this,args);polish();schedulePolish();return out};

    const categoryNav=document.getElementById('categoryNav');
    if(categoryNav)new MutationObserver(()=>queueMicrotask(fixAbilityCounts)).observe(categoryNav,{childList:true,subtree:true,characterData:true});
    document.getElementById('searchInput')?.addEventListener('keydown',event=>{
      if(event.key==='Enter')setTimeout(applyCompactStageSearch,0);
    });
    document.getElementById('changesButton')?.addEventListener('click',()=>setTimeout(applyCompactStageChanges,0));

    const api={marker:MARKER,polish,applyCompactStageSearch,applyCompactStageChanges,inspect:()=>({category:state.category,view:state.view,sort:currentSort(),skills:(state.data?.categories?.abilities||[]).filter(row=>abilityKind(row)==='skill').length,coup_de_grace:(state.data?.categories?.abilities||[]).filter(row=>abilityKind(row)==='coup_de_grace').length,stage_compact_hierarchy:Boolean(document.querySelector('#entityList.s3r513r2-stage-index.qol-r7-stage-compact')),ended_events:document.querySelectorAll('#entityList > details.qol-r6-ended-group .entity-card[data-key]').length})};
    globalThis.__SMASHDUMP_QOL_R7__=api;
    renderAll();schedulePolish();
    return api;
  }

  waitForR6().then(install).catch(error=>console.error(MARKER,error));
})();

/* SMASHDUMP_PUBLIC_QOL_LAB_R8 - disposable static-export polish layer only. */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_PUBLIC_QOL_LAB_R8';

  async function waitForR7(timeoutMs=60000){
    const started=Date.now();
    while(!globalThis.__SMASHDUMP_QOL_R7__||!globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R7__||!globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R8__||!globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R9__||typeof renderList!=='function'||typeof compareRows!=='function'||typeof sortOptions!=='function'){
      if(Date.now()-started>timeoutMs)throw Error('QoL R8 timed out waiting for the R7 renderer');
      await new Promise(resolve=>setTimeout(resolve,25));
    }
  }

  function install(){
    if(globalThis.__SMASHDUMP_QOL_R8__)return globalThis.__SMASHDUMP_QOL_R8__;
    const STAGE_R7=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R7__;
    const STAGE_R8=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R8__;
    const STAGE_R9=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R9__;
    const finite=value=>{
      if(value===null||value===undefined||String(value).trim()==='')return Number.MAX_SAFE_INTEGER;
      const parsed=Number(value);
      return Number.isFinite(parsed)?parsed:Number.MAX_SAFE_INTEGER;
    };
    const release=value=>{const parsed=Date.parse(value||'');return Number.isFinite(parsed)?parsed:Number.NEGATIVE_INFINITY};
    const tie=(a,b)=>String(nameOf(a)).localeCompare(String(nameOf(b)),undefined,{numeric:true,sensitivity:'base'});
    const worldCurrent=entity=>globalThis.__SMASHDUMP_STAGE3_R5_7__?.model?.()?.categories?.[entity?.category]?.[String(entity?.id)]?.current||graph(entity)||{};

    function memoryAlbum(entity){
      const row=graph(entity)?.row||{};
      return {album:finite(row.album_number),family:finite(row.orb_album_type)};
    }

    function gachaRelease(entity){
      const current=worldCurrent(entity),payments=(current.draws||[]).map(draw=>String(draw?.payment?.name||'').trim().toLowerCase());
      const limited=Boolean(String(current.end_utc||'').trim());
      const paymentRank=payments.includes('paid gems')?0:payments.includes('gems')?1:2;
      return {limitedRank:limited?0:1,start:release(current.start_utc),paymentRank};
    }

    const previousCompareRows=compareRows;
    compareRows=function(a,b){
      const mode=currentSort();
      if(state.category==='memories'&&(mode==='album-asc'||mode==='memory-album-family')){
        const A=memoryAlbum(a),B=memoryAlbum(b);
        return A.album-B.album||A.family-B.family||tie(a,b);
      }
      if(state.category==='gacha'&&mode==='gacha-semantic'){
        const A=gachaRelease(a),B=gachaRelease(b);
        return A.limitedRank-B.limitedRank||B.start-A.start||A.paymentRank-B.paymentRank||tie(a,b);
      }
      return previousCompareRows(a,b);
    };

    const previousSortOptions=sortOptions;
    sortOptions=function(){
      return previousSortOptions().map(([key,label])=>key==='gacha-semantic'?[key,'Newest limited · paid first']:key==='memory-album-family'?[key,'Album number']: [key,label]);
    };

    function abilityKind(row){
      const kind=String(row?.r41_ref?.kind||row?.r4_ref?.kind||'');
      if(kind==='skill'||kind==='coup_de_grace')return kind;
      return /coup de gr/i.test(String(row?.subtitle||''))?'coup_de_grace':'skill';
    }
    function fixAbilityCounts(){
      const rows=state.data?.categories?.abilities||[];
      document.querySelectorAll('#categoryNav .category-button[data-category="abilities"][data-qol-ability-kind]').forEach(button=>{
        const kind=button.dataset.qolAbilityKind,count=rows.filter(row=>abilityKind(row)===kind).length,node=button.querySelector('.count');
        if(node){node.textContent=fmt(count);node.title=`${fmt(count)} ${kind==='coup_de_grace'?'Coup de Grace entries':'Skill entries'}`}
      });
    }
    function convergeAbilityCounts(){
      fixAbilityCounts();
      queueMicrotask(()=>requestAnimationFrame(()=>requestAnimationFrame(fixAbilityCounts)));
    }

    function restoreCompactStageArtwork(){
      if(state.category!=='stages'||state.view!=='table')return false;
      const list=document.getElementById('entityList');
      if(!list?.classList.contains('s3r513r5-stage-index'))return false;
      const saved=state.view;
      state.view='cards';
      try{
        STAGE_R7?.decorateStageIndex?.('qol-r8-compact-art');
        STAGE_R8?.decorateStageIndex?.('qol-r8-compact-art');
        STAGE_R9?.decorateStageIndex?.('qol-r8-compact-art');
      }finally{
        state.view=saved;
      }
      list.classList.remove('card-mode');
      list.classList.add('table-mode','qol-r7-stage-compact','qol-r8-stage-compact');
      return true;
    }
    function convergeStageArtwork(){
      restoreCompactStageArtwork();
      queueMicrotask(()=>requestAnimationFrame(restoreCompactStageArtwork));
    }

    const previousRenderNav=renderNav;
    renderNav=function(...args){const out=previousRenderNav.apply(this,args);convergeAbilityCounts();return out};
    const previousRenderList=renderList;
    renderList=function(...args){const out=previousRenderList.apply(this,args);convergeStageArtwork();return out};
    const previousRenderAll=renderAll;
    renderAll=function(...args){const out=previousRenderAll.apply(this,args);convergeAbilityCounts();convergeStageArtwork();return out};

    const api={
      marker:MARKER,
      polish:()=>{fixAbilityCounts();restoreCompactStageArtwork()},
      inspect:()=>({
        category:state.category,
        view:state.view,
        sort:currentSort(),
        skills:(state.data?.categories?.abilities||[]).filter(row=>abilityKind(row)==='skill').length,
        coup_de_grace:(state.data?.categories?.abilities||[]).filter(row=>abilityKind(row)==='coup_de_grace').length,
        stage_child_art:document.querySelectorAll('#entityList .s3r513r7-summary-art').length,
        stage_collection_art:document.querySelectorAll('#entityList .s3r513r8-summary-art').length,
        stage_gauntlet_art:document.querySelectorAll('#entityList .s3r513r9-summary-art').length
      })
    };
    globalThis.__SMASHDUMP_QOL_R8__=api;
    convergeAbilityCounts();convergeStageArtwork();
    return api;
  }

  waitForR7().then(install).catch(error=>console.error(MARKER,error));
})();

/* SMASHDUMP_PUBLIC_QOL_LAB_R9 - disposable static-export polish layer only. */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_PUBLIC_QOL_LAB_R9';

  async function waitForR8(timeoutMs=60000){
    const started=Date.now();
    while(
      !globalThis.__SMASHDUMP_QOL_R8__||
      !globalThis.__SMASHDUMP_STAGE3_R3__||
      !globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R5__||
      !globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R6__||
      !globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R7__||
      !globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R8__||
      !globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R9__||
      typeof renderList!=='function'||typeof compareRows!=='function'
    ){
      if(Date.now()-started>timeoutMs)throw Error('QoL R9 timed out waiting for the accepted renderer chain');
      await new Promise(resolve=>setTimeout(resolve,25));
    }
  }

  function install(){
    if(globalThis.__SMASHDUMP_QOL_R9__)return globalThis.__SMASHDUMP_QOL_R9__;
    const MEMORY=globalThis.__SMASHDUMP_STAGE3_R3__;
    const STAGE_R5=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R5__;
    const STAGE_R6=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R6__;
    const STAGE_R7=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R7__;
    const STAGE_R8=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R8__;
    const STAGE_R9=globalThis.__SMASHDUMP_STAGE3_R5_13_CORRECTED_R9__;
    const missing=Number.MAX_SAFE_INTEGER;
    const numeric=value=>{
      if(value===null||value===undefined||String(value).trim()==='')return missing;
      const parsed=Number(value);return Number.isFinite(parsed)?parsed:missing;
    };
    const tie=(a,b)=>String(nameOf(a)).localeCompare(String(nameOf(b)),undefined,{numeric:true,sensitivity:'base'});

    function memoryAlbum(entity){
      const semantic=MEMORY.memoryFor?.(entity)||MEMORY.model?.memories?.[String(entity?.id)]||null;
      const sourceRow=semantic?.source?.memory_row||{};
      return {
        album:numeric(semantic?.album_number??sourceRow.album_number),
        family:numeric(sourceRow.orb_album_type)
      };
    }

    const previousCompareRows=compareRows;
    compareRows=function(a,b){
      const mode=currentSort();
      if(state.category==='memories'&&(mode==='album-asc'||mode==='memory-album-family')){
        const A=memoryAlbum(a),B=memoryAlbum(b);
        if(A.album!==missing||B.album!==missing)return A.album-B.album||A.family-B.family||tie(a,b);
      }
      return previousCompareRows(a,b);
    };

    function rebuildAcceptedCompactStages(){
      if(state.category!=='stages'||state.view!=='table')return false;
      let list=document.getElementById('entityList');if(!list)return false;
      const savedView=state.view;
      state.view='cards';
      try{
        if(!list.classList.contains('s3r513r5-stage-index')){
          STAGE_R5.rebuildStageIndex?.();
          list=document.getElementById('entityList');
        }
        if(!list?.classList.contains('s3r513r5-stage-index'))return false;
        STAGE_R6.decorateStageIndex?.('qol-r9-compact');
        STAGE_R7.decorateStageIndex?.('qol-r9-compact');
        STAGE_R8.decorateStageIndex?.('qol-r9-compact');
        STAGE_R9.decorateStageIndex?.('qol-r9-compact');
      }finally{
        state.view=savedView;
      }
      list=document.getElementById('entityList');
      if(!list)return false;
      list.classList.remove('card-mode');
      list.classList.add('table-mode','qol-r9-stage-compact');
      return true;
    }

    function convergeStages(){
      rebuildAcceptedCompactStages();
      queueMicrotask(()=>requestAnimationFrame(()=>requestAnimationFrame(rebuildAcceptedCompactStages)));
    }

    const previousRenderList=renderList;
    renderList=function(...args){const out=previousRenderList.apply(this,args);convergeStages();return out};
    const previousRenderAll=renderAll;
    renderAll=function(...args){const out=previousRenderAll.apply(this,args);convergeStages();return out};

    const api={
      marker:MARKER,
      polish:()=>rebuildAcceptedCompactStages(),
      inspect:()=>({
        memory_model_ready:Boolean(MEMORY.model?.memories),
        memory_count:Object.keys(MEMORY.model?.memories||{}).length,
        category:state.category,
        view:state.view,
        accepted_stage_tree:Boolean(document.querySelector('#entityList.s3r513r5-stage-index')),
        compact_stage_tree:Boolean(document.querySelector('#entityList.qol-r9-stage-compact')),
        stage_child_art:document.querySelectorAll('#entityList .s3r513r7-summary-art').length,
        stage_collection_art:document.querySelectorAll('#entityList .s3r513r8-summary-art').length,
        stage_gauntlet_art:document.querySelectorAll('#entityList .s3r513r9-summary-art').length
      })
    };
    globalThis.__SMASHDUMP_QOL_R9__=api;
    Promise.resolve(MEMORY.ready).then(()=>{if(state.category==='memories')renderList()});
    convergeStages();
    return api;
  }

  waitForR8().then(install).catch(error=>console.error(MARKER,error));
})();

/* SMASHDUMP_PUBLIC_QOL_LAB_R10 - disposable Memory stat-ranking layer only. */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_PUBLIC_QOL_LAB_R10';
  const STAT_KEYS=['hp','attack','defense','magical_might','magical_mending','magical_defense','deftness'];
  const LABEL_TO_KEY=new Map([
    ['hp','hp'],
    ['attack','attack'],
    ['defence','defense'],
    ['defense','defense'],
    ['magical might','magical_might'],
    ['magical mending','magical_mending'],
    ['magical defence','magical_defense'],
    ['magical defense','magical_defense'],
    ['deftness','deftness']
  ]);

  async function waitForR9(timeoutMs=60000){
    const started=Date.now();
    while(
      !globalThis.__SMASHDUMP_QOL_R9__||
      !globalThis.__SMASHDUMP_STAGE3_R3__||
      typeof renderDetail!=='function'||
      typeof renderAll!=='function'
    ){
      if(Date.now()-started>timeoutMs)throw Error('QoL R10 timed out waiting for the accepted R9 lab chain');
      await new Promise(resolve=>setTimeout(resolve,25));
    }
  }

  function competitionRanks(MEMORY){
    const memories=Object.values(MEMORY.model?.memories||{});
    const rankings=Object.fromEntries(STAT_KEYS.map(key=>[key,new Map()]));
    for(const key of STAT_KEYS){
      const values=memories.map(memory=>{
        const rank=MEMORY.rankFor?.(memory,'S')||memory?.ranks?.find(row=>row.rank_name==='S');
        return Number(rank?.stats?.[key]);
      }).filter(Number.isFinite).sort((a,b)=>b-a);
      let previous;
      let currentRank=0;
      values.forEach((value,index)=>{
        if(index===0||value!==previous)currentRank=index+1;
        if(!rankings[key].has(value))rankings[key].set(value,currentRank);
        previous=value;
      });
    }
    return {memories,rankings};
  }

  async function install(){
    if(globalThis.__SMASHDUMP_QOL_R10__)return globalThis.__SMASHDUMP_QOL_R10__;
    const MEMORY=globalThis.__SMASHDUMP_STAGE3_R3__;
    await Promise.resolve(MEMORY.ready);
    if(!MEMORY.model?.memories)throw Error('QoL R10 requires the certified Memory semantic model');

    const {memories,rankings}=competitionRanks(MEMORY);
    const memoryCount=memories.length;
    let scheduled=false;

    function clearBadges(root=document){
      root.querySelectorAll?.('.qol-r10-memory-stat-rank').forEach(node=>node.remove());
      root.querySelectorAll?.('.qol-r10-ranked-value').forEach(node=>node.classList.remove('qol-r10-ranked-value'));
    }

    function decorate(){
      const panel=document.getElementById('detailPanel');
      if(!panel)return false;
      clearBadges(panel);
      if(state?.category!=='memories')return false;
      const rankRoot=panel.querySelector('#memoryRankContent .s3r3-rank');
      if(!rankRoot||String(rankRoot.dataset.s3r3Rank||'').toUpperCase()!=='S')return false;
      const grid=rankRoot.querySelector('[data-s3r33-stat-grid],.s3r3-stat-grid');
      if(!grid||String(grid.dataset.mode||'base').toLowerCase()!=='base')return false;

      let decorated=0;
      for(const cell of [...grid.children]){
        const labelNode=[...cell.children].find(node=>node.tagName==='SPAN');
        const strong=[...cell.children].find(node=>node.tagName==='STRONG');
        if(!labelNode||!strong)continue;
        const key=LABEL_TO_KEY.get(String(labelNode.textContent||'').trim().toLowerCase());
        if(!key)continue;
        const raw=strong.dataset.s3r33Base??strong.textContent;
        const value=Number(String(raw??'').replace(/,/g,'').trim());
        if(!Number.isFinite(value))continue;
        const rank=rankings[key]?.get(value);
        if(!rank)continue;
        const badge=document.createElement('span');
        badge.className='qol-r10-memory-stat-rank';
        badge.dataset.stat=key;
        badge.dataset.rank=String(rank);
        badge.textContent=`#${rank}`;
        const label=String(labelNode.textContent||key).trim();
        const explanation=`${label}: #${rank} of ${memoryCount} Memories by base S-rank stat. Ties share the same rank.`;
        badge.title=explanation;
        badge.setAttribute('aria-label',explanation);
        strong.classList.add('qol-r10-ranked-value');
        strong.append(badge);
        decorated++;
      }
      return decorated===STAT_KEYS.length;
    }

    function schedule(){
      if(scheduled)return;
      scheduled=true;
      queueMicrotask(()=>requestAnimationFrame(()=>{
        scheduled=false;
        decorate();
      }));
    }

    const previousRenderDetail=renderDetail;
    renderDetail=function(...args){
      const output=previousRenderDetail.apply(this,args);
      schedule();
      return output;
    };
    const previousRenderAll=renderAll;
    renderAll=function(...args){
      const output=previousRenderAll.apply(this,args);
      schedule();
      return output;
    };

    document.addEventListener('click',event=>{
      if(event.target.closest?.('.s3r3-rank-tabs .rank-tab,[data-s3r33-stat-mode]'))schedule();
    });

    const api={
      marker:MARKER,
      memory_count:memoryCount,
      ranking_basis:'S-rank base Memory stats',
      tie_policy:'competition ranking',
      decorate,
      inspect:()=>({
        memory_count:memoryCount,
        visible_badges:document.querySelectorAll('#memoryRankContent .qol-r10-memory-stat-rank').length,
        selected_rank:document.querySelector('#memoryRankContent .s3r3-rank')?.dataset.s3r3Rank||null,
        stat_mode:document.querySelector('#memoryRankContent [data-s3r33-stat-grid]')?.dataset.mode||null
      })
    };
    globalThis.__SMASHDUMP_QOL_R10__=api;
    schedule();
    return api;
  }

  waitForR9().then(install).catch(error=>console.error(MARKER,error));
})();

/* SMASHDUMP_DRONY_MEMORY_EFFECTS_V1
 * Production presentation for compiler-owned Memory Core / Pearl and Drony rows.
 * Category data is supplied by data/versions/<current>/encyclopedia.json.
 */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_DRONY_MEMORY_EFFECTS_V1';
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object||{},key);
  const unique=values=>[...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:'base'}));
  const finite=value=>Number.isFinite(Number(value))?Number(value):Number.MAX_SAFE_INTEGER;
  const textValue=value=>typeof value==='string'?value:String(value?.text||value?.name||'');

  async function waitForAccepted(timeoutMs=60000){
    const started=Date.now();
    while(
      !globalThis.__SMASHDUMP_QOL_R10__||
      typeof renderAll!=='function'||
      typeof renderFilterDrawer!=='function'||
      typeof categoryDetail!=='function'||
      !state?.data
    ){
      if(Date.now()-started>timeoutMs)throw Error('Drony/Memory Effects lab timed out waiting for the accepted renderer');
      await new Promise(resolve=>setTimeout(resolve,25));
    }
  }

  const effectNameMultiplicity=new Map();
  const supportById=new Map();
  let effectEntities=[];
  let dronyEntities=[];
  let effectByKey=new Map();
  let effectBySlotGroup=new Map();
  let labEntityByKey=new Map();

  function installCategories(){
    Object.assign(labels,{memory_effects:'Memory Core',drony:'Drony'});
    Object.assign(icons,{memory_effects:'✤',drony:'◫'});
    const insertAfter=(anchor,key)=>{
      if(planned.includes(key))return;
      const index=planned.indexOf(anchor);
      planned.splice(index>=0?index+1:planned.length,0,key);
    };
    insertAfter('memories','memory_effects');
    insertAfter('items','drony');

    effectEntities=[...(state.data.categories.memory_effects||[])];
    dronyEntities=[...(state.data.categories.drony||[])];
    if(!effectEntities.length||!dronyEntities.length){
      throw Error('Compiler-owned Memory Core / Drony categories are unavailable');
    }
    /* R26 C4 seals renderer-facing counts behind a read-only projection. The
       categories already come from encyclopedia.json; expose their canonical
       counts through that existing projection without injecting entity data. */
    const countTarget=globalThis.__SMASHDUMP_R26_C4_DATA_OWNERSHIP__?.countSource;
    if(!countTarget)throw Error('R26 C4 count projection source is unavailable');
    const canonicalCounts=rows=>({
      total:rows.length,
      added:rows.filter(row=>row.status==='Added').length,
      modified:rows.filter(row=>row.status==='Modified').length,
      missing:rows.filter(row=>row.name?.missing===true).length
    });
    countTarget.memory_effects=canonicalCounts(effectEntities);
    countTarget.drony=canonicalCounts(dronyEntities);
    effectByKey=new Map(effectEntities.map(row=>[keyOf(row),row]));
    effectBySlotGroup=new Map(effectEntities.map(row=>[`${graph(row).slot}:${graph(row).group_id}`,row]));
    labEntityByKey=new Map([...effectEntities,...dronyEntities].map(row=>[keyOf(row),row]));
    effectNameMultiplicity.clear();
    for(const row of effectEntities){
      const current=graph(row),key=`${current.slot}|${String(textValue(row.name)||'').toLowerCase()}`;
      effectNameMultiplicity.set(key,(effectNameMultiplicity.get(key)||0)+1);
    }
    supportById.clear();
    for(const row of (graph(dronyEntities[0])?.support_items||[]))supportById.set(Number(row.id),row);
    const total=Object.values(state.data.categories).reduce((sum,rows)=>sum+(Array.isArray(rows)?rows.length:0),0);
    const node=document.getElementById('totalCount');if(node)node.textContent=fmt(total);
  }

  const previousFindByKey=findByKey;
  findByKey=function(key){
    return labEntityByKey.get(String(key))||previousFindByKey(key);
  };

  const labFilterState=()=>{
    const current=filters();
    for(const key of ['labSlots','labWeapons','labElements','labDamageTypes','labMechanics'])if(!Array.isArray(current[key]))current[key]=[];
    return current;
  };
  const previousPassesFilters=passesFilters;
  passesFilters=function(entity){
    if(!previousPassesFilters(entity))return false;
    if(entity?.category!=='memory_effects')return true;
    const f=labFilterState(),c=graph(entity);
    if(f.labSlots.length&&!f.labSlots.includes(String(c.slot)))return false;
    if(f.labWeapons.length&&!f.labWeapons.includes(String(c.weapon||'')))return false;
    if(f.labElements.length&&!f.labElements.includes(String(c.element||'')))return false;
    if(f.labDamageTypes.length&&!f.labDamageTypes.includes(String(c.damage_type||'')))return false;
    if(f.labMechanics.length&&!f.labMechanics.includes(String(c.mechanic||'')))return false;
    return true;
  };

  const previousFilterActiveCount=filterActiveCount;
  filterActiveCount=function(f=filters()){
    const base=previousFilterActiveCount(f);
    if(state.category!=='memory_effects')return base;
    return base+['labSlots','labWeapons','labElements','labDamageTypes','labMechanics'].reduce((sum,key)=>sum+(f[key]?.length||0),0);
  };
  const previousFilterChips=filterChips;
  filterChips=function(){
    const chips=previousFilterChips();
    if(state.category!=='memory_effects')return chips;
    const f=labFilterState();
    const labelsByKey={
      labSlots:{main:'Main effect',secondary:'Secondary effect'},
      labWeapons:{},
      labElements:{},
      labDamageTypes:{},
      labMechanics:{}
    };
    for(const key of Object.keys(labelsByKey)){
      for(const value of f[key]||[])chips.push({key,value,label:labelsByKey[key][value]||value});
    }
    return chips;
  };

  const filterGroup=(title,key,values)=>{
    const selected=labFilterState()[key]||[];
    return `<section class="filter-group"><h3>${esc(title)}</h3><div class="check-grid">${values.map(value=>`<label class="check-option ${selected.includes(String(value))?'selected':''}"><input type="checkbox" data-lab-filter="${esc(key)}" value="${esc(value)}" ${selected.includes(String(value))?'checked':''}><span>${esc(value)}</span></label>`).join('')}</div></section>`;
  };
  const previousRenderFilterDrawer=renderFilterDrawer;
  renderFilterDrawer=function(...args){
    const out=previousRenderFilterDrawer.apply(this,args);
    if(state.category!=='memory_effects')return out;
    const body=document.getElementById('filterBody');if(!body)return out;
    const currents=effectEntities.map(graph);
    body.insertAdjacentHTML('beforeend',
      filterGroup('Effect slot','labSlots',['main','secondary'])+
      filterGroup('Weapon restriction','labWeapons',unique(currents.map(row=>row.weapon)))+
      filterGroup('Element','labElements',unique(currents.map(row=>row.element)))+
      filterGroup('Effect type','labDamageTypes',unique(currents.map(row=>row.damage_type)))+
      filterGroup('Mechanic','labMechanics',unique(currents.map(row=>row.mechanic)))
    );
    body.querySelectorAll('[data-lab-filter]').forEach(input=>input.onchange=()=>{
      const f=labFilterState(),key=input.dataset.labFilter,value=String(input.value),index=f[key].indexOf(value);
      if(input.checked&&index<0)f[key].push(value);
      if(!input.checked&&index>=0)f[key].splice(index,1);
      input.closest('.check-option')?.classList.toggle('selected',input.checked);
      saveState();renderFilterStatus();renderList();
    });
    return out;
  };

  const previousCurrentSort=currentSort;
  currentSort=function(){
    if(!own(state.sorts,state.category)){
      if(state.category==='memory_effects')return'lab-effect-slot';
      if(state.category==='drony')return'lab-drony-order';
    }
    return previousCurrentSort();
  };
  const previousSortOptions=sortOptions;
  sortOptions=function(){
    if(state.category==='memory_effects')return[
      ['lab-effect-slot','Main effects · then secondary'],
      ['name-asc','Name · A–Z'],
      ['name-desc','Name · Z–A']
    ];
    if(state.category==='drony')return[
      ['lab-drony-order','Drony unit order'],
      ['name-asc','Name · A–Z']
    ];
    return previousSortOptions();
  };
  const previousCompareRows=compareRows;
  compareRows=function(a,b){
    const mode=currentSort();
    if(mode==='lab-effect-slot'){
      const A=graph(a),B=graph(b),slot=value=>value==='main'?0:1;
      return slot(A.slot)-slot(B.slot)||String(nameOf(a)).localeCompare(String(nameOf(b)),undefined,{numeric:true,sensitivity:'base'});
    }
    if(mode==='lab-drony-order')return finite(graph(a).slot_index)-finite(graph(b).slot_index);
    return previousCompareRows(a,b);
  };

  const previousCardFacts=cardFacts;
  cardFacts=function(entity){
    const c=graph(entity);
    if(entity?.category==='memory_effects'){
      const ranks=c.rank_progression||[];
      const range=ranks.map(row=>`${row.rank_label} ${row.summary}`).join(' · ');
      return `<span class="lab-slot-pill ${c.slot==='main'?'main':'secondary'}">${c.slot==='main'?'Main':'Secondary'}</span>${c.weapon?`<span>${esc(c.weapon)}</span>`:''}${c.element?`<span>${esc(c.element)}</span>`:''}<span title="${esc(range)}">${esc(c.variant_label||c.mechanic||'Effect')}</span>`;
    }
    if(entity?.category==='drony'){
      const unlock=c.unlock_condition_slot_index?`Unlocks after Unit ${esc(c.unlock_condition_slot_index)} Lv${esc(c.unlock_condition_level)}`:'Available with Expeditions';
      return `<span>Lv 1–60</span><span>${unlock}</span>`;
    }
    return previousCardFacts(entity);
  };

  const compatibilityEntity=(slot,id)=>effectBySlotGroup.get(`${slot}:${id}`);
  const pearlRankState=new Map();
  const pearlPairState=new Map();
  const pearlRankIconCache=new Map();
  const ensurePearlRankIcons=()=>{
    if(pearlRankIconCache.size)return pearlRankIconCache;
    const api=globalThis.__SMASHDUMP_STAGE3_R3_1__;
    const memory=(state.data.categories?.memories||[]).find(row=>{
      try{return Boolean(api?.memoryFor?.(row)?.ranks?.length)}catch{return false}
    });
    if(!memory)return pearlRankIconCache;
    const model=api.memoryFor(memory);
    for(const rank of model?.ranks||[]){
      const asset=rank?.images?.rank_icon;
      if(asset?.url)pearlRankIconCache.set(String(rank.rank_name),asset.url);
    }
    return pearlRankIconCache;
  };
  const pearlRankButton=(rank,active)=>{
    const icon=ensurePearlRankIcons().get(String(rank.rank_label));
    return `<button class="lab-pearl-rank-tab ${active?'active':''}" type="button" data-lab-rank="${esc(rank.rank_label)}" aria-label="Select ${esc(rank.rank_label)} rank" title="${esc(rank.rank_label)} rank">${icon?`<img src="${esc(icon)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:`<span class="lab-rank-fallback">${esc(rank.rank_label)}</span>`}</button>`;
  };
  const pearlRankPanel=(entity,rank)=>{
    const c=graph(entity);
    const applies=[c.weapon,c.element,c.damage_type,c.mechanic].filter(Boolean);
    const icon=ensurePearlRankIcons().get(String(rank.rank_label));
    return `<div class="lab-pearl-rank-panel"><div class="lab-pearl-rank-value">${icon?`<img class="lab-selected-rank-icon" src="${esc(icon)}" alt="" loading="lazy" decoding="async">`:''}<span class="lab-pearl-rank-copy">${esc(c.description||nameOf(entity))}</span><b>${esc(rank.summary)}</b></div>${applies.length?`<div class="lab-applies"><span>Applies to</span><div class="chip-row">${applies.map(value=>`<span class="chip">${esc(value)}</span>`).join('')}</div></div>`:''}</div>`;
  };
  const ranksHtml=entity=>{
    const rows=graph(entity).rank_progression||[];
    if(!rows.length)return'<p class="field-note">No rank progression is recorded.</p>';
    const key=keyOf(entity),wanted=pearlRankState.get(key)||rows.at(-1)?.rank_label;
    const selected=rows.find(row=>row.rank_label===wanted)||rows.at(-1);
    pearlRankState.set(key,selected.rank_label);
    return `<div class="lab-pearl-ranks" data-lab-ranks="${esc(key)}"><div class="lab-pearl-rank-tabs">${rows.map(row=>pearlRankButton(row,row===selected)).join('')}</div><div class="lab-pearl-rank-content">${pearlRankPanel(entity,selected)}</div></div>`;
  };
  const pairDetailHtml=row=>{
    if(!row)return'<p class="field-note">No paired effect selected.</p>';
    const c=graph(row),ranks=c.rank_progression||[];
    return `<div class="lab-pair-detail"><div><strong>${esc(nameOf(row))}</strong><p>${esc(c.description||'')}</p></div><div class="lab-pair-ranks">${ranks.map(rank=>{const icon=ensurePearlRankIcons().get(String(rank.rank_label));return `<span title="${esc(rank.rank_label)} rank">${icon?`<img src="${esc(icon)}" alt="" loading="lazy" decoding="async">`:`<b>${esc(rank.rank_label)}</b>`}<em>${esc(rank.summary)}</em></span>`}).join('')}</div><button class="action-button lab-entity-link" type="button" data-lab-key="${esc(keyOf(row))}">Open effect</button></div>`;
  };
  const compatibilityHtml=entity=>{
    const c=graph(entity),targetSlot=c.slot==='main'?'secondary':'main';
    const linked=(c.compatible_group_ids||[]).map(id=>compatibilityEntity(targetSlot,id)).filter(Boolean).sort((a,b)=>nameOf(a).localeCompare(nameOf(b),undefined,{numeric:true,sensitivity:'base'}));
    if(!linked.length)return'<p class="field-note">No legal paired effect is recorded for this group.</p>';
    const key=keyOf(entity),wanted=pearlPairState.get(key),selected=linked.find(row=>keyOf(row)===wanted)||linked[0];
    pearlPairState.set(key,keyOf(selected));
    return `<div class="lab-compatibility"><label for="labPairSelect">${fmt(linked.length)} legal ${targetSlot==='secondary'?'secondary':'main'} effects</label><select id="labPairSelect" class="lab-pair-select" data-lab-pair-select>${linked.map(row=>`<option value="${esc(keyOf(row))}" ${row===selected?'selected':''}>${esc(nameOf(row))}${graph(row).variant_label?` · ${esc(graph(row).variant_label)}`:''}</option>`).join('')}</select><div class="lab-pair-selected">${pairDetailHtml(selected)}</div></div>`;
  };
  const effectDetail=entity=>{
    const c=graph(entity),tags=[c.slot==='main'?'Main effect':'Secondary effect',c.weapon,c.element,c.damage_type,c.mechanic].filter(Boolean);
    return `
      <div class="lab-intro">
        <div><p class="eyebrow">Pearl effect family</p><h3>${esc(nameOf(entity))}</h3><p>${esc(c.description||'No localized description recorded.')}</p></div>
        ${c.detail_asset?.url?`<img class="lab-pearl-detail-art" src="${esc(c.detail_asset.url)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:''}
      </div>
      <div class="chip-row lab-tag-row">${tags.map(tag=>`<span class="chip">${esc(tag)}</span>`).join('')}</div>
      <h4>Rank progression</h4>
      ${ranksHtml(entity)}
      <h4>Legal pairings</h4>
      ${compatibilityHtml(entity)}
      <details class="advanced lab-source-note"><summary>Source identity</summary><div class="section-content"><div class="stat-grid"><div class="stat"><span>Effect slot</span><strong>${esc(c.slot_label)}</strong></div><div class="stat"><span>Internal group</span><strong>${esc(c.group_id)}</strong></div><div class="stat"><span>Semantic name</span><strong>${esc(c.semantic_name||nameOf(entity))}</strong></div><div class="stat"><span>Legal combinations</span><strong>${fmt((c.compatible_group_ids||[]).length)}</strong></div></div></div></details>
    `;
  };

  const costHtml=costs=>{
    if(!costs?.length)return'<span class="field-note">—</span>';
    return `<div class="lab-cost-list">${costs.map(cost=>`<span class="lab-cost">${cost.asset?.url?`<img src="${esc(cost.asset.url)}" alt="" loading="lazy" decoding="async">`:''}<b>${fmt(cost.amount)}</b> ${esc(cost.name)}</span>`).join('')}</div>`;
  };
  const capacitiesHtml=rows=>{
    if(!rows?.length)return'<span class="field-note">—</span>';
    return rows.map(row=>`<span class="lab-capacity" title="${esc(row.description||'')}">${esc(row.short_name||row.name)}</span>`).join('');
  };
  const levelTable=unit=>{
    const levels=unit.levels||[];
    return `<div class="lab-table-wrap lab-level-wrap"><table class="lab-level-table"><thead><tr><th>Lv</th><th>Gold</th><th>Memory</th><th>Materials</th><th>Upgrade effect</th><th>Level cost</th><th>Total cost to reach level</th></tr></thead><tbody>${levels.map(row=>`<tr><td><strong>${fmt(row.level)}</strong></td><td>${fmt(row.gold)}</td><td>${fmt(row.memory)}</td><td>${fmt(row.items)}</td><td>${capacitiesHtml(row.capacities)}</td><td>${costHtml(row.upgrade_costs)}</td><td>${costHtml(row.total_upgrade_costs)}</td></tr>`).join('')}</tbody></table></div>`;
  };
  const rewardRows=rewards=>`<div class="lab-reward-grid">${(rewards||[]).map(reward=>`<div class="lab-reward-row">${reward.asset?.url?`<img src="${esc(reward.asset.url)}" alt="" loading="lazy" decoding="async">`:''}<span>${esc(reward.name)}</span><strong>× ${fmt(reward.amount)}</strong></div>`).join('')||'<p class="field-note">No reward rows recorded.</p>'}</div>`;
  const rewardIdentity=rewards=>(rewards||[]).map(row=>[row.content_type,row.content_id,row.amount]);
  const sameRewards=area=>JSON.stringify(rewardIdentity(area.normal_rewards))===JSON.stringify(rewardIdentity(area.great_success_rewards));
  const areaRewards=area=>sameRewards(area)
    ?`<section><h6>Rewards</h6>${rewardRows(area.normal_rewards)}</section>`
    :`<section><h6>Normal success</h6>${rewardRows(area.normal_rewards)}</section><section><h6>Great success</h6>${rewardRows(area.great_success_rewards)}</section>`;
  const areaHtml=areas=>`<div class="lab-area-grid">${(areas||[]).map(area=>`<details class="lab-area-card"><summary>${area.area_asset?.url?`<img src="${esc(area.area_asset.url)}" alt="" loading="lazy" decoding="async">`:''}<div><h5>${esc(area.name)}</h5><p>${esc(area.expedition_hours)}h search · ${fmt(area.normal_reward_entries)} reward entries</p>${area.unlock_text?`<small>${esc(area.unlock_text)}</small>`:''}</div><span class="lab-area-toggle"><span>View rewards</span><b aria-hidden="true">⌄</b></span></summary><div class="lab-area-rewards">${areaRewards(area)}</div></details>`).join('')}</div>`;
  const supportHtml=items=>`<div class="lab-support-grid">${(items||[]).map(item=>`<article class="lab-support-card">${item.asset?.url?`<img src="${esc(item.asset.url)}" alt="" loading="lazy" decoding="async">`:''}<div><h5>${esc(item.name)}</h5><p>${esc(item.description||'')}</p></div></article>`).join('')}</div>`;
  const dronyDetail=entity=>{
    const c=graph(entity),unlock=c.unlock_condition_slot_index
      ?`Drony Unit ${c.unlock_condition_slot_index} Lv${c.unlock_condition_level}`
      :'Available when Expeditions are unlocked';
    const notes=c.sensor_notes||{};
    return `
      <div class="stat-grid lab-drony-summary">
        <div class="stat"><span>Unlock</span><strong>${esc(unlock)}</strong></div>
        <div class="stat"><span>Maximum level</span><strong>60</strong></div>
      </div>
      <div class="lab-sensor-grid">
        <article><strong>Gold Coin Sensor</strong><p>${esc(notes.gold||'')}</p></article>
        <article><strong>Memory Sensor</strong><p>${esc(notes.memory||'')}</p></article>
        <article><strong>Materials Sensor</strong><p>${esc(notes.items||'')}</p></article>
      </div>
      <h4>Level 1–60 progression</h4>
      <p class="field-note">Every stored level is listed. “Level cost” is the exact expedition material cost for that upgrade; “Total cost” adds every upgrade through the selected level.</p>
      ${levelTable(c)}
      <h4>Expedition areas</h4>
      ${areaHtml(c.areas)}
      <h4>Expedition items</h4>
      ${supportHtml(c.support_items)}
    `;
  };

  const previousCategoryDetail=categoryDetail;
  categoryDetail=function(entity){
    if(entity?.category==='memory_effects')return effectDetail(entity);
    if(entity?.category==='drony')return dronyDetail(entity);
    return previousCategoryDetail(entity);
  };

  function bindLabLinks(){
    document.querySelectorAll('#detailPanel [data-lab-key]').forEach(button=>button.onclick=event=>{
      event.preventDefault();event.stopPropagation();
      const key=button.dataset.labKey;if(key&&effectByKey.has(key))selectByKey(key);
    });
  }
  function bindPearlControls(entity){
    if(entity?.category!=='memory_effects')return;
    const panel=document.getElementById('detailPanel');if(!panel)return;
    panel.querySelectorAll('[data-lab-rank]').forEach(button=>button.onclick=()=>{
      const rows=graph(entity).rank_progression||[],rank=rows.find(row=>row.rank_label===button.dataset.labRank);if(!rank)return;
      pearlRankState.set(keyOf(entity),rank.rank_label);
      panel.querySelectorAll('[data-lab-rank]').forEach(node=>node.classList.toggle('active',node===button));
      const content=panel.querySelector('.lab-pearl-rank-content');if(content)content.innerHTML=pearlRankPanel(entity,rank);
    });
    const select=panel.querySelector('[data-lab-pair-select]');
    if(select)select.onchange=()=>{
      const row=effectByKey.get(String(select.value));if(!row)return;
      pearlPairState.set(keyOf(entity),keyOf(row));
      const target=panel.querySelector('.lab-pair-selected');if(target)target.innerHTML=pairDetailHtml(row);
      bindLabLinks();
    };
  }
  function polishLabDetail(entity){
    if(!['memory_effects','drony'].includes(entity?.category))return;
    const panel=document.getElementById('detailPanel');if(!panel)return;
    const sections=[...panel.querySelectorAll(':scope > .detail-body > details.section')];
    const byTitle=title=>sections.find(section=>String(section.querySelector(':scope > summary')?.textContent||'').trim()===title);
    const history=byTitle('Version history');
    if(history){
      const content=history.querySelector(':scope > .section-content');
      if(content)content.innerHTML='<div class="lab-info-note"><strong>Current-data prototype</strong><span>This first lab draft is qualified against the current 1.5.1 masterdata only. Historical Added / Modified classification will be designed when the category is promoted upstream.</span></div>';
    }
    const evidence=byTitle('Source evidence');
    if(evidence){
      const content=evidence.querySelector(':scope > .section-content');
      if(content)content.innerHTML='<p class="field-note">This lab category is generated directly from the sealed 1.5.1 masterdata, dictionary, semantic decoder and current CAS asset map. The prototype intentionally does not claim historical diff ownership yet.</p>';
    }
    const normalized=byTitle('Complete normalized entity data');
    if(normalized){
      const content=normalized.querySelector(':scope > .section-content');
      if(content)content.innerHTML='<p class="field-note">Generated from the current masterdata, Dictionary, and asset snapshot in <code>encyclopedia.json</code>.</p>';
    }
  }
  const labPresentationEntity=entity=>['memory_effects','drony'].includes(entity?.category);
  const labImageHtml=(entity,cls='entity-image')=>{
    const asset=entity?.display_asset;
    if(!asset?.url)return'';
    return `<img class="${esc(cls)}" src="${esc(asset.url)}" alt="" loading="lazy" decoding="async" draggable="false" data-lab-presentation-image="1" data-lab-presentation-key="${esc(keyOf(entity))}" data-logical-path="${esc(asset.logical_path||'')}">`;
  };
  function patchLabCards(){
    if(!['memory_effects','drony'].includes(state.category))return;
    document.querySelectorAll('#entityList .entity-card[data-key]').forEach(card=>{
      const entity=findByKey(card.dataset.key);
      if(!labPresentationEntity(entity))return;
      const thumb=card.querySelector('.thumb');
      if(!thumb)return;
      const existing=thumb.querySelector('img[data-lab-presentation-image="1"]');
      if(existing?.dataset.labPresentationKey===keyOf(entity))return;
      const html=labImageHtml(entity,'entity-card-image');
      thumb.innerHTML=html||'?';
      thumb.classList.toggle('has-image',Boolean(html));
    });
  }
  function patchLabHeader(entity){
    if(!labPresentationEntity(entity))return;
    const art=document.querySelector('#detailPanel .detail-header .detail-art');
    if(!art)return;
    const existing=art.querySelector('img[data-lab-presentation-image="1"]');
    if(existing?.dataset.labPresentationKey===keyOf(entity))return;
    const html=labImageHtml(entity,'entity-detail-image');
    art.innerHTML=html||'?';
    art.classList.toggle('has-image',Boolean(html));
  }
  function patchPlayerFacingSemantics(entity){
    const panel=document.getElementById('detailPanel');
    const isWeaken=entity?.category==='status_effects'&&String(nameOf(entity)).trim().toLowerCase()==='weaken';
    const unresolvedWeaken='Status family defined in masterdata; exact player-facing mechanics were not found in the current structured combat model.';
    const weakenSummary='Reduces attack, magical might, defence and magical defence by 20% for 5 seconds.';
    const patchRoot=root=>{
      if(!root)return;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      const nodes=[];
      while(walker.nextNode())nodes.push(walker.currentNode);
      for(const node of nodes){
        const parent=node.parentElement;
        if(!parent||parent.closest('.advanced,.raw-json,pre,code,script,style'))continue;
        let next=String(node.nodeValue||'')
          .replace(/\bBuffer parameter 12\b/gi,'Attack Damage')
          .replace(/\bStatus type 18\b/gi,'Weaken');
        if(isWeaken)next=next.replace(unresolvedWeaken,weakenSummary);
        if(next!==node.nodeValue)node.nodeValue=next;
      }
    };
    patchRoot(document.getElementById('entityList'));
    if(panel?.classList.contains('open')){
      patchRoot(panel);
    }
    if(isWeaken){
      const summary=panel?.querySelector('.s3r512b-hero strong');
      if(summary&&summary.textContent!==weakenSummary)summary.textContent=weakenSummary;
      const overview=panel?.querySelector('.s3r512b-player-summary');
      if(overview&&!overview.querySelector('[data-weaken-strength="1"]')){
        const strength=document.createElement('div');
        strength.dataset.weakenStrength='1';
        strength.innerHTML='<span>Stat reduction</span><strong>20%</strong>';
        overview.insertBefore(strength,overview.children[1]||null);
      }
    }
  }
  function patchVocationRestrictions(){
    const catalog=globalThis.__SMASHDUMP_STAGE2_3_VOCATION_RESOLVER__?.catalog;
    if(!catalog?.profiles)return;
    document.querySelectorAll('.stage235-card[data-stage235-kind="dual"]').forEach(card=>{
      const profile=catalog.profiles.find(row=>String(row.id)===String(card.dataset.stage235Profile));
      if(!profile?.vocation)return;
      const restricted=card.dataset.stage235Tree==='upgrade_1'||card.dataset.stage235Tree==='upgrade_2';
      card.querySelectorAll('[data-stage235-results] .vocation-result').forEach(row=>{
        const label=row.querySelector('span');
        if(!label)return;
        let marker=label.querySelector('.lab-vocation-limit');
        if(!restricted){marker?.remove();return}
        if(!marker){
          marker=document.createElement('small');
          marker.className='lab-vocation-limit';
          label.appendChild(marker);
        }
        const wanted=`(${profile.vocation} only)`;
        if(marker.textContent!==wanted)marker.textContent=wanted;
      });
    });
  }
  let labPatchQueued=false;
  function patchLabPresentation(entity){
    patchLabCards();
    const selected=entity||((state.selected&&findByKey(state.selected))||null);
    if(selected)patchLabHeader(selected);
    patchPlayerFacingSemantics(selected);
    patchVocationRestrictions();
  }
  function scheduleLabPresentation(entity){
    patchLabPresentation(entity);
    if(labPatchQueued)return;
    labPatchQueued=true;
    queueMicrotask(()=>{
      labPatchQueued=false;
      patchLabPresentation(entity);
      requestAnimationFrame(()=>patchLabPresentation(entity));
      setTimeout(()=>patchLabPresentation(entity),0);
      setTimeout(()=>patchLabPresentation(entity),40);
    });
  }
  function installLabVocationRefreshHook(){
    if(globalThis.__SMASHDUMP_LAB_VOCATION_REFRESH_HOOK__)return;
    globalThis.__SMASHDUMP_LAB_VOCATION_REFRESH_HOOK__=true;
    document.addEventListener('click',event=>{
      const button=event.target?.closest?.('[data-stage235-dual-axis],[data-vocation-axis-button]');
      if(!button)return;
      queueMicrotask(()=>patchVocationRestrictions());
      requestAnimationFrame(()=>patchVocationRestrictions());
    });
  }
  const previousRenderDetail=renderDetail;
  renderDetail=function(entity,...args){
    const out=previousRenderDetail.call(this,entity,...args);
    if(entity?.category==='memory_effects'||entity?.category==='drony'){polishLabDetail(entity);bindLabLinks();bindPearlControls(entity)}
    scheduleLabPresentation(entity);
    return out;
  };

  const previousRenderList=renderList;
  renderList=function(...args){
    const out=previousRenderList.apply(this,args);
    const list=document.getElementById('entityList');
    list?.classList.toggle('lab-memory-effects-list',state.category==='memory_effects');
    list?.classList.toggle('lab-drony-list',state.category==='drony');
    const search=document.getElementById('searchInput');
    if(search){
      if(state.category==='memory_effects')search.placeholder='Search pearl effects, e.g. Sword Ice, critical, healing…';
      else if(state.category==='drony')search.placeholder='Search Drony units and expedition data…';
    }
    scheduleLabPresentation();
    return out;
  };
  const previousRenderAll=renderAll;
  renderAll=function(...args){
    const out=previousRenderAll.apply(this,args);
    document.body.classList.toggle('lab-memory-effects-active',state.category==='memory_effects');
    document.body.classList.toggle('lab-drony-active',state.category==='drony');
    scheduleLabPresentation();
    return out;
  };

  async function install(){
    if(globalThis.__SMASHDUMP_DRONY_MEMORY_EFFECTS_V1_API__)return globalThis.__SMASHDUMP_DRONY_MEMORY_EFFECTS_V1_API__;
    installCategories();
    const legalPairs=effectEntities
      .filter(row=>graph(row).slot==='secondary')
      .reduce((sum,row)=>sum+(graph(row).compatible_group_ids||[]).length,0);
    const api={
      marker:MARKER,
      lab_only:false,
      data_owner:'encyclopedia.json',
      memory_effect_count:effectEntities.length,
      memory_effect_main_count:effectEntities.filter(row=>graph(row).slot==='main').length,
      memory_effect_secondary_count:effectEntities.filter(row=>graph(row).slot==='secondary').length,
      legal_pearl_pairs:legalPairs,
      drony_unit_count:dronyEntities.length,
      inspect:()=>({
        category:state.category,
        view:state.view,
        memory_effect_rows:state.data?.categories?.memory_effects?.length||0,
        drony_rows:state.data?.categories?.drony?.length||0,
        memory_effect_cards:document.querySelectorAll('#entityList .entity-card[data-key^="memory_effects:"]').length,
        drony_cards:document.querySelectorAll('#entityList .entity-card[data-key^="drony:"]').length,
        detail_open:document.getElementById('detailPanel')?.classList.contains('open')||false
      })
    };
    globalThis.__SMASHDUMP_DRONY_MEMORY_EFFECTS_V1_API__=api;
    installLabVocationRefreshHook();
    renderAll();
    scheduleLabPresentation();
    return api;
  }

  waitForAccepted().then(install).catch(error=>console.error(MARKER,error));
})();

/* SMASHDUMP_PUBLIC_QOL_LAB_R11 - navigation, shop-offer and vocation polish. */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_PUBLIC_QOL_LAB_R11';
  async function waitForR10(timeoutMs=60000){
    const started=Date.now();while(!globalThis.__SMASHDUMP_QOL_R10__||typeof renderDetail!=='function'){
      if(Date.now()-started>timeoutMs)throw Error('QoL R11 timed out waiting for R10');await new Promise(resolve=>setTimeout(resolve,25));
    }
  }
  function resetCategoryState(category){
    if(!category)return;state.filters[category]=defaultFilter();state.query='';state.r26c4SearchDraft='';state.onlyFavorites=false;state.onlyRecent=false;
    const input=document.getElementById('searchInput');if(input)input.value='';saveState();
  }
  function worldCurrent(entity){return globalThis.__SMASHDUMP_STAGE3_R5_7__?.model?.()?.categories?.[entity?.category]?.[String(entity?.id)]?.current||graph(entity)||{}}
  function endedAt(value){const timestamp=Date.parse(String(value||''));return Number.isFinite(timestamp)&&timestamp<Date.now()}
  function decorateExpiredShopOffers(entity){
    if(entity?.category!=='shops')return 0;
    const host=document.querySelector('#detailPanel .s3r516r4-offers')||document.querySelector('#detailPanel .s3r516r2-offers');if(!host)return 0;
    host.querySelector(':scope > .qol-r11-expired-offers')?.remove();
    const nodes=[...host.children].filter(node=>node.matches('.s3r516r4-offer,.s3r516r2-offer'));
    const meta=globalThis.__SMASHDUMP_QOL_R6_META__?.shops?.[String(entity.id)],offers=worldCurrent(entity)?.offers||[];
    if(!meta||nodes.length!==offers.length||meta.offer_ids?.length!==offers.length)return 0;
    const endById=new Map(meta.offer_ids.map((id,index)=>[String(id),offers[index]?.end_utc]));
    const expired=nodes.filter(node=>endedAt(endById.get(String(node.dataset.qolR6OfferId||''))));if(!expired.length)return 0;
    const group=document.createElement('details');group.className='qol-r11-expired-offers';
    group.innerHTML=`<summary><span><strong>Expired offers</strong><small>Past rotations · hidden by default</small></span><b>${expired.length}</b></summary><div class="qol-r11-expired-offers-body"></div>`;
    const body=group.querySelector('.qol-r11-expired-offers-body');expired.forEach(node=>body.append(node));host.append(group);return expired.length;
  }
  function decorateVocationRestrictions(){return 0}
  async function install(){
    if(globalThis.__SMASHDUMP_QOL_R11__)return;await waitForR10();
    document.getElementById('categoryNav')?.addEventListener('click',event=>{
      const button=event.target.closest?.('[data-category]');if(!button)return;
      const next=button.dataset.category,kind=button.dataset.qolAbilityKind||'';
      const currentKind=globalThis.__SMASHDUMP_QOL_R6__?.inspect?.().ability_view||'';
      if(next!==state.category||(next==='abilities'&&kind&&kind!==currentKind))resetCategoryState(next);
    },true);
    const previousSelectByKey=selectByKey;
    selectByKey=function(target,...args){const entity=findByKey(String(target||''));if(entity&&entity.category!==state.category)resetCategoryState(entity.category);return previousSelectByKey.call(this,target,...args)};
    const previousRenderDetail=renderDetail;
    renderDetail=function(entity,...args){const output=previousRenderDetail.call(this,entity,...args);queueMicrotask(()=>decorateExpiredShopOffers(entity));return output};
    const api={marker:MARKER,resetCategoryState,decorateExpiredShopOffers,decorateVocationRestrictions,inspect:()=>({expired_offers:document.querySelectorAll('.qol-r11-expired-offers-body .s3r516r4-offer,.qol-r11-expired-offers-body .s3r516r2-offer').length,vocation_badges:document.querySelectorAll('.qol-r11-vocation-only').length})};
    globalThis.__SMASHDUMP_QOL_R11__=api;
  }
  install().catch(error=>console.error(MARKER,error));
})();

/* SMASHDUMP_PUBLIC_QOL_LAB_R12 - vocation precision, Memory cleanup and enemy families. */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_PUBLIC_QOL_LAB_R12',FAMILY_KEY='r12EnemyFamilies',MEMORY_KIND_KEY='r12MemoryKinds';
  const MEMORY_ALBUM_TYPES={"100001":1,"100002":1,"100003":1,"100004":1,"100005":1,"100006":1,"100007":1,"100008":1,"100009":1,"100010":1,"100011":1,"100012":2,"100013":2,"100015":2,"100016":2,"100017":2,"100018":2,"200001":1,"200002":1,"200003":1,"200004":1,"200005":1,"200006":1,"200007":1,"200008":1,"200009":1,"200010":1,"200011":1,"200012":1,"200013":2,"200014":2,"200016":2,"200017":2,"200018":2,"200019":1,"200020":2,"200021":2,"300001":1,"300002":1,"300003":1,"300004":1,"300005":1,"300006":1,"300007":1,"300008":1,"300009":1,"300010":1,"300011":2,"300012":2,"300013":2,"300014":2,"300015":2,"300016":2,"300017":2,"300018":1,"300019":2,"400001":1,"400002":1,"400003":1,"400004":1,"400005":1,"400006":1,"400007":1,"400008":1,"400009":1,"400011":1,"400012":1,"400013":2,"400014":2,"400015":2,"400016":2,"400017":2,"400018":2,"400019":2,"500001":1,"500002":1,"500003":1,"500004":1,"500005":1,"500006":1,"500007":1,"500008":1,"500009":1,"500010":1,"500011":1,"500012":2,"500013":2,"500014":2,"500015":2,"500017":2,"500018":2,"500019":2,"640001":2,"640002":2,"660001":2,"660002":2,"670001":2,"690001":2,"690002":2,"700001":2,"710001":2,"710002":2,"730001":2,"740001":2,"740002":2,"740003":2,"740004":2,"740005":2,"740006":2};
  const ENEMY_FAMILIES={"kind:101":["Slime"],"enemies:kind:101":["Slime"],"Slime":["Slime"],"kind:102":["Humanoid"],"enemies:kind:102":["Humanoid"],"Bodkin Archer":["Humanoid"],"kind:103":["Humanoid"],"enemies:kind:103":["Humanoid"],"Hammerhood":["Humanoid"],"kind:104":["Material"],"enemies:kind:104":["Material"],"Golem":["Material"],"kind:105":["Slime"],"enemies:kind:105":["Slime"],"She-Slime":["Slime"],"kind:106":["Humanoid"],"enemies:kind:106":["Humanoid"],"Bodkin Bloodbow":["Humanoid"],"kind:107":["Bird"],"enemies:kind:107":["Bird"],"Drackmage":["Bird"],"kind:108":["Dragon"],"enemies:kind:108":["Dragon"],"Green Dragon":["Dragon"],"kind:109":["Machine"],"enemies:kind:109":["Machine"],"Killing Machine":["Machine"],"kind:111":["Demon"],"enemies:kind:111":["Demon"],"Wrecktor":["Demon"],"kind:112":["Demon"],"enemies:kind:112":["Demon"],"Whackolyte":["Demon"],"kind:113":["Elemental"],"enemies:kind:113":["Elemental"],"Firespirit":["Elemental"],"kind:114":["Elemental"],"enemies:kind:114":["Elemental"],"Lost Soul":["Elemental"],"kind:115":["Undead"],"enemies:kind:115":["Undead"],"Muddy Hand":["Undead"],"kind:116":["Undead"],"enemies:kind:116":["Undead"],"Bloody Hand":["Undead"],"kind:117":["Beast"],"enemies:kind:117":["Beast"],"Powie Yowie":["Beast"],"kind:118":["Beast"],"enemies:kind:118":["Beast"],"Sasquash":["Beast"],"kind:119":["Slime","Metal"],"enemies:kind:119":["Slime","Metal"],"Metal Slime":["Slime","Metal"],"kind:120":["Material"],"enemies:kind:120":["Material"],"Gold Golem":["Material"],"kind:121":["Bird"],"enemies:kind:121":["Bird"],"Dracky":["Bird"],"kind:122":["Material"],"enemies:kind:122":["Material"],"Glacial Golem":["Material"],"kind:123":["Slime"],"enemies:kind:123":["Slime"],"Bubble Slime":["Slime"],"kind:124":["Undead"],"enemies:kind:124":["Undead"],"Skeleton":["Undead"],"kind:125":["Slime"],"enemies:kind:125":["Slime"],"Healslime":["Slime"],"kind:127":["Material"],"enemies:kind:127":["Material"],"Stone Golem":["Material"],"kind:128":["Bird"],"enemies:kind:128":["Bird"],"Drackolyte":["Bird"],"kind:129":["Bird"],"enemies:kind:129":["Bird"],"Drackyma":["Bird"],"kind:130":["Undead"],"enemies:kind:130":["Undead"],"Skeleton Soldier":["Undead"],"kind:131":["Demon"],"enemies:kind:131":["Demon"],"Knight Aberrant":["Demon"],"kind:132":["Humanoid"],"enemies:kind:132":["Humanoid"],"Bodkin Bowyer":["Humanoid"],"kind:133":["Humanoid"],"enemies:kind:133":["Humanoid"],"Brownie":["Humanoid"],"kind:136":["Unknown"],"enemies:kind:136":["Unknown"],"Dragonlord":["Unknown"],"kind:137":["Aquatic"],"enemies:kind:137":["Aquatic"],"Man o' War":["Aquatic"],"kind:139":["Beast"],"enemies:kind:139":["Beast"],"Great Sabrecat":["Beast"],"kind:141":["Slime"],"enemies:kind:141":["Slime"],"Sootheslime":["Slime"],"kind:142":["Material"],"enemies:kind:142":["Material"],"Rockbomb":["Material"],"kind:144":["Slime","Metal"],"enemies:kind:144":["Slime","Metal"],"Liquid Metal Slime":["Slime","Metal"],"kind:146":["Aquatic"],"enemies:kind:146":["Aquatic"],"Crabid":["Aquatic"],"kind:147":["Elemental"],"enemies:kind:147":["Elemental"],"Dancing Flame":["Elemental"],"kind:148":["Insect"],"enemies:kind:148":["Insect"],"Scorpion":["Insect"],"kind:149":["Bird"],"enemies:kind:149":["Bird"],"Chimaera":["Bird"],"kind:150":["Demon"],"enemies:kind:150":["Demon"],"Minidemon":["Demon"],"kind:151":["Slime"],"enemies:kind:151":["Slime"],"Slime Knight":["Slime"],"kind:153":["Material"],"enemies:kind:153":["Material"],"Restless Armour":["Material"],"kind:154":["Plant"],"enemies:kind:154":["Plant"],"Treeface":["Plant"],"kind:155":["Slime"],"enemies:kind:155":["Slime"],"Metal Slime Knight":["Slime"],"kind:156":["Demon"],"enemies:kind:156":["Demon"],"Troll":["Demon"],"kind:157":["Demon"],"enemies:kind:157":["Demon"],"Blinkster":["Demon"],"kind:158":["Bird"],"enemies:kind:158":["Bird"],"Firebird":["Bird"],"kind:161":["Elemental"],"enemies:kind:161":["Elemental"],"Flamethrower":["Elemental"],"kind:163":["Undead"],"enemies:kind:163":["Undead"],"Ghost":["Undead"],"kind:164":["Undead"],"enemies:kind:164":["Undead"],"Mummy Boy":["Undead"],"kind:165":["Demon"],"enemies:kind:165":["Demon"],"Winkster":["Demon"],"kind:166":["Undead"],"enemies:kind:166":["Undead"],"Mummy":["Undead"],"kind:168":["Beast"],"enemies:kind:168":["Beast"],"Sweaty Yeti":["Beast"],"kind:169":["Humanoid"],"enemies:kind:169":["Humanoid"],"Bodkin Fletcher":["Humanoid"],"kind:170":["Undead"],"enemies:kind:170":["Undead"],"Fightgeist":["Undead"],"kind:171":["Undead"],"enemies:kind:171":["Undead"],"Spitegeist":["Undead"],"kind:173":["Slime"],"enemies:kind:173":["Slime"],"Lime Slime":["Slime"],"kind:175":["Beast"],"enemies:kind:175":["Beast"],"Orc":["Beast"],"kind:176":["Beast"],"enemies:kind:176":["Beast"],"Orc Chieftain":["Beast"],"kind:177":["Undead"],"enemies:kind:177":["Undead"],"Phantom Fencer":["Undead"],"kind:178":["Aquatic"],"enemies:kind:178":["Aquatic"],"Merman":["Aquatic"],"kind:179":["Bird"],"enemies:kind:179":["Bird"],"War Gryphon":["Bird"],"kind:181":["Plant"],"enemies:kind:181":["Plant"],"Funghoul":["Plant"],"kind:182":["Insect"],"enemies:kind:182":["Insect"],"Lunatick":["Insect"],"kind:184":["Machine"],"enemies:kind:184":["Machine"],"Stainless Scrapper":["Machine"],"kind:185":["Machine"],"enemies:kind:185":["Machine"],"Mecha-Mynah":["Machine"],"kind:186":["Aquatic"],"enemies:kind:186":["Aquatic"],"Khalamari Kid":["Aquatic"],"kind:188":["Insect"],"enemies:kind:188":["Insect"],"Iron Scorpion":["Insect"],"kind:189":["Material"],"enemies:kind:189":["Material"],"Dirty Dogu":["Material"],"kind:190":["Demon"],"enemies:kind:190":["Demon"],"Jinkster":["Demon"],"kind:191":["Slime"],"enemies:kind:191":["Slime"],"Lemon Slime":["Slime"],"kind:192":["Elemental"],"enemies:kind:192":["Elemental"],"Dead Man's Soul":["Elemental"],"kind:193":["Humanoid"],"enemies:kind:193":["Humanoid"],"Big Hammer":["Humanoid"],"kind:194":["Bird"],"enemies:kind:194":["Bird"],"Gargoyle":["Bird"],"kind:196":["Material"],"enemies:kind:196":["Material"],"Alarmour":["Material"],"kind:197":["Material"],"enemies:kind:197":["Material"],"Arrghgoyle":["Material"],"kind:198":["Material"],"enemies:kind:198":["Material"],"Grinade":["Material"],"kind:200":["Material"],"enemies:kind:200":["Material"],"Cannibox":["Material"],"kind:201":["Bird"],"enemies:kind:201":["Bird"],"Lunar Chimaera":["Bird"],"kind:203":["Unknown"],"enemies:kind:203":["Unknown"],"Fenvulf":["Unknown"],"kind:204":["Slime","Metal"],"enemies:kind:204":["Slime","Metal"],"Metal Medley":["Slime","Metal"],"kind:205":["Material"],"enemies:kind:205":["Material"],"Weaponbag":["Material"],"kind:206":["Material"],"enemies:kind:206":["Material"],"Armourbag":["Material"],"kind:207":["Material"],"enemies:kind:207":["Material"],"Nodestonebag":["Material"],"kind:215":["Machine"],"enemies:kind:215":["Machine"],"Metal Scrapper":["Machine"],"kind:216":["Dragon"],"enemies:kind:216":["Dragon"],"Ethereal Serpent":["Dragon"],"kind:217":["Dragon"],"enemies:kind:217":["Dragon"],"Frizzard":["Dragon"],"kind:218":["Dragon"],"enemies:kind:218":["Dragon"],"Mandrake Major":["Dragon"],"kind:219":["Machine"],"enemies:kind:219":["Machine"],"Bambooligan":["Machine"],"kind:220":["Slime"],"enemies:kind:220":["Slime"],"Cyber Slime":["Slime"],"kind:221":["Humanoid"],"enemies:kind:221":["Humanoid"],"Prickly Prankster":["Humanoid"],"kind:222":["Humanoid"],"enemies:kind:222":["Humanoid"],"Leery Lout":["Humanoid"],"kind:223":["Dragon"],"enemies:kind:223":["Dragon"],"Hacksaurus":["Dragon"],"kind:224":["Slime"],"enemies:kind:224":["Slime"],"Mottle Slime":["Slime"],"kind:225":["Bird"],"enemies:kind:225":["Bird"],"Gryphon":["Bird"],"kind:226":["Material"],"enemies:kind:226":["Material"],"Bad Karmour":["Material"],"kind:227":["Demon"],"enemies:kind:227":["Demon"],"Bloodcreeper":["Demon"],"kind:228":["Unknown"],"enemies:kind:228":["Unknown"],"Murdaw":["Unknown"],"kind:229":["Unknown"],"enemies:kind:229":["Unknown"],"Dhuran":["Unknown"],"kind:230":["Unknown"],"enemies:kind:230":["Unknown"],"Old King Mortamor":["Unknown"],"kind:231":["Unknown"],"enemies:kind:231":["Unknown"],"Archfiend Mortamor":["Unknown"],"kind:232":["Unknown"],"enemies:kind:232":["Unknown"],"Ultimate Archfiend Mortamor":["Unknown"],"kind:238":["Unknown"],"enemies:kind:238":["Unknown"],"Enemy family 238":["Unknown"],"kind:239":["Unknown"],"enemies:kind:239":["Unknown"],"Mortamor Shrine — Mortamor (Very Hard)":["Unknown"],"kind:242":["Aquatic"],"enemies:kind:242":["Aquatic"],"Seaslime":["Aquatic"],"kind:243":["Humanoid"],"enemies:kind:243":["Humanoid"],"Blindfolded Hammerhood":["Humanoid"],"kind:244":["Plant"],"enemies:kind:244":["Plant"],"King Watermenace":["Plant"],"kind:245":["Plant"],"enemies:kind:245":["Plant"],"Watermenace":["Plant"],"kind:246":["Undead"],"enemies:kind:246":["Undead"],"Skelegon":["Undead"],"kind:247":["Bird"],"enemies:kind:247":["Bird"],"Garuda":["Bird"],"kind:250":["Bird"],"enemies:kind:250":["Bird"],"Hocus Chimaera":["Bird"],"kind:251":["Demon"],"enemies:kind:251":["Demon"],"Gigantes":["Demon"],"kind:253":["Elemental"],"enemies:kind:253":["Elemental"],"Shadow":["Elemental"]};
  const wait=async(timeout=60000)=>{const start=Date.now();while(!globalThis.__SMASHDUMP_QOL_R11__||typeof renderDetail!=='function'){if(Date.now()-start>timeout)throw Error('QoL R12 timed out waiting for R11');await new Promise(r=>setTimeout(r,25))}};
  const worldModel=()=>globalThis.__SMASHDUMP_STAGE3_R5_7__?.model?.()||globalThis.__SMASHDUMP_STAGE3_R5_1__?.model?.();
  const currentFor=entity=>{const rows=worldModel()?.categories?.[entity?.category]||{},direct=rows[String(entity?.id)];if(direct?.current)return direct.current;const wanted=String(entity?.id||''),name=String(entity?nameOf(entity):'');const match=Object.values(rows).find(row=>String(row?.id||'')===wanted||String(row?.r5_ref?.id||'')===wanted||(name&&String(row?.name?.text||row?.name||'')===name));return match?.current||graph(entity)||{}};
  const familiesOf=entity=>{if(!entity)return[];const generated=ENEMY_FAMILIES[String(entity.id)]||ENEMY_FAMILIES[keyOf(entity)]||ENEMY_FAMILIES[nameOf(entity)],current=currentFor(entity),values=generated||current?.unit_family_names||[current?.unit_family_name];return [...new Set(values.map(value=>String(value||'').trim()).filter(Boolean))]};
  const familyOf=entity=>familiesOf(entity).join(' / ');
  function enemyFilterState(){const f=state.filters.enemies||(state.filters.enemies=defaultFilter());if(!Array.isArray(f[FAMILY_KEY]))f[FAMILY_KEY]=[];return f}
  function memoryFilterState(){const f=state.filters.memories||(state.filters.memories=defaultFilter());if(!Array.isArray(f[MEMORY_KIND_KEY]))f[MEMORY_KIND_KEY]=[];return f}
  function fixMemoryDescription(){document.querySelectorAll('#detailPanel .s3r3-memory p').forEach(node=>{if(/No player-facing Memory description/i.test(node.textContent||'')||/^[A-Za-z0-9_]+(?:\/[A-Za-z0-9_]+)+$/.test((node.textContent||'').trim()))node.remove()})}
  function memoryAlbumType(entity){return Number(MEMORY_ALBUM_TYPES[String(entity?.id)]||0)}
  function decorateMemoryCards(root=document){if(state.category!=='memories')return 0;let count=0;root.querySelectorAll?.('.entity-card[data-key]').forEach(card=>{const type=memoryAlbumType(findByKey(card.dataset.key));card.classList.toggle('qol-r12-memory-story',type===1);card.classList.toggle('qol-r12-memory-event',type===2);let label=card.querySelector('.qol-r12-memory-kind');if(type===1||type===2){if(!label){label=document.createElement('span');label.className='qol-r12-memory-kind';card.append(label)}label.textContent=type===1?'Story':'Event';count++}else label?.remove()});return count}
  function profileFor(card){const id=card?.dataset.stage235Profile||card?.dataset.vocationProfile||'',catalog=globalThis.__SMASHDUMP_STAGE2_3_VOCATION_RESOLVER__?.catalog||{};return [...(catalog.profiles||[]),...(catalog.trait_profiles||[])].find(row=>row.id===id)||null}
  function fixVocationRestrictions(root=document){
    let count=0;
    root?.querySelectorAll?.('.vocation-mechanic-card[data-stage235-profile],.vocation-mechanic-card[data-vocation-profile]').forEach(card=>{
      const profileId=card.dataset.stage235Profile||card.dataset.vocationProfile||'';
      const catalog=globalThis.__SMASHDUMP_STAGE2_3_VOCATION_RESOLVER__?.catalog||{};
      const profile=[...(catalog.profiles||[]),...(catalog.trait_profiles||[])].find(row=>row.id===profileId);
      const tree=card.dataset.stage235Tree||card.dataset.treeState||'base';
      const rows=[...card.querySelectorAll('.vocation-result-grid .vocation-result')];
      rows.forEach((row,index)=>{const label=row.querySelector(':scope > span'),output=profile?.outputs?.[index];if(label&&output?.label)label.textContent=output.label;else row.querySelectorAll('.qol-r11-vocation-only,.qol-r12-vocation-only').forEach(badge=>badge.remove())});
      if(tree==='base'||!profile)return;
      (profile.outputs||[]).forEach((output,index)=>{
        if(!output.restricted_vocation||!rows[index])return;
        const label=rows[index].querySelector(':scope > span');if(!label)return;
        const badge=document.createElement('b');badge.className='qol-r12-vocation-only';badge.textContent=`${output.restricted_vocation} only`;label.append(' ',badge);count++;
      });
    });
    return count;
  }
  function fixAbilityTreeRestrictions(root=document){
    const title=[...root?.querySelectorAll?.('#detailPanel h2,#detailPanel h3')||[]].map(node=>(node.textContent||'').trim()).find(Boolean)||'';
    const vocation=({"Fenrir's Hunt":'Ranger','Shadowbind':'Ranger','Cool Under Fire':'Sage','Echonomist':'Sage','Knight Watch':'Paladin',"Knight's Judgement":'Paladin'})[title];
    if(!vocation)return 0;
    let count=0;
    root.querySelectorAll('#detailPanel .s3r44-branch,#detailPanel .s3r45-branch').forEach(section=>{
      if((section.querySelector('h5')?.textContent||'').trim()!=='Permanent vocation-tree state')return;
      section.querySelectorAll(':scope > div > article').forEach(stateRow=>{
        const stateName=(stateRow.querySelector(':scope > strong')?.textContent||'').trim();
        stateRow.querySelectorAll('.qol-r12-vocation-only').forEach(node=>node.remove());
        if(!/^Upgrade [12]$/.test(stateName))return;
        stateRow.querySelectorAll('.s3r44-facts article > span,.s3r45-facts article > span').forEach(label=>{const badge=document.createElement('b');badge.className='qol-r12-vocation-only';badge.textContent=`${vocation} only`;label.append(' ',badge);count++});
      });
    });
    return count;
  }
  function scheduleVocationRestrictionFix(){
    const apply=()=>fixVocationRestrictions(document);
    queueMicrotask(apply);setTimeout(apply,0);requestAnimationFrame(()=>{apply();requestAnimationFrame(apply)});
  }
  function fixEnemyFamilyLabels(root=document){if(state.category!=='enemies')return 0;let count=0;root.querySelectorAll?.('.entity-card[data-key]').forEach(card=>{const key=card.dataset.key;if(!key)return;const family=familyOf(findByKey(key));if(!family)return;card.querySelectorAll('p,span,small').forEach(node=>{if((node.textContent||'').trim()==='Enemy family'){node.textContent=family;count++}})});const selected=state.selected?findByKey(state.selected):null,family=familyOf(selected);if(selected?.category==='enemies'&&family)root.querySelectorAll?.('#detailPanel .detail-subtitle').forEach(node=>{if((node.textContent||'').trim()==='Enemy family'){node.textContent=family;count++}});return count}
  function familyOptions(){return [...new Set((state.data?.categories?.enemies||[]).flatMap(familiesOf))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))}
  let lastDetailKey='';
  async function install(){
    if(globalThis.__SMASHDUMP_QOL_R12__)return;await wait();
    const prevPasses=passesFilters;passesFilters=function(entity){const pass=prevPasses(entity);if(!pass)return false;if(entity?.category==='enemies'){const selected=enemyFilterState()[FAMILY_KEY];return !selected.length||selected.some(value=>familiesOf(entity).includes(value))}if(entity?.category==='memories'){const selected=memoryFilterState()[MEMORY_KIND_KEY],type=memoryAlbumType(entity),kind=type===1?'story':type===2?'event':'';return !selected.length||selected.includes(kind)}return true};
    const prevCount=filterActiveCount;filterActiveCount=function(f=filters()){const base=prevCount(f);if(state.category==='enemies')return base+enemyFilterState()[FAMILY_KEY].length;if(state.category==='memories')return base+memoryFilterState()[MEMORY_KIND_KEY].length;return base};
    const prevDrawer=renderFilterDrawer;renderFilterDrawer=function(...args){const out=prevDrawer.apply(this,args),body=document.getElementById('filterBody');if(!body)return out;if(state.category==='enemies'){const selected=enemyFilterState()[FAMILY_KEY],values=familyOptions();if(!values.length)return out;const section=document.createElement('section');section.className='filter-group qol-r12-family-filter';section.innerHTML=`<h3>Enemy family</h3><div class="check-grid">${values.map(value=>`<label class="check-option"><input type="checkbox" data-r12-enemy-family value="${esc(value)}" ${selected.includes(value)?'checked':''}><span>${esc(value)}</span></label>`).join('')}</div>`;body.prepend(section);section.querySelectorAll('[data-r12-enemy-family]').forEach(input=>input.onchange=()=>{const f=enemyFilterState(),value=String(input.value);f[FAMILY_KEY]=input.checked?[...new Set([...f[FAMILY_KEY],value])]:f[FAMILY_KEY].filter(item=>item!==value);saveState();renderFilterStatus();renderList()});return out}if(state.category==='memories'){const selected=memoryFilterState()[MEMORY_KIND_KEY],section=document.createElement('section');section.className='filter-group qol-r12-memory-kind-filter';section.innerHTML=`<h3>Memory type</h3><div class="check-grid"><label class="check-option"><input type="checkbox" data-r12-memory-kind value="story" ${selected.includes('story')?'checked':''}><span>Story</span></label><label class="check-option"><input type="checkbox" data-r12-memory-kind value="event" ${selected.includes('event')?'checked':''}><span>Event</span></label></div>`;body.prepend(section);section.querySelectorAll('[data-r12-memory-kind]').forEach(input=>input.onchange=()=>{const f=memoryFilterState(),value=String(input.value);f[MEMORY_KIND_KEY]=input.checked?[...new Set([...f[MEMORY_KIND_KEY],value])]:f[MEMORY_KIND_KEY].filter(item=>item!==value);saveState();renderFilterStatus();renderList()})}return out};
    const r12DrawerWithFilters=renderFilterDrawer;renderFilterDrawer=function(...args){const out=r12DrawerWithFilters.apply(this,args);globalThis.__SMASHDUMP_R26_C11_FILTER_AUDIT_ECHO_TREE_FIX__?.finalizeDrawer?.(document.getElementById('filterBody'));return out};
    const prevChips=filterChips;filterChips=function(){const chips=prevChips();if(state.category==='enemies')for(const value of enemyFilterState()[FAMILY_KEY])chips.push({key:FAMILY_KEY,value,label:`Family: ${value}`});if(state.category==='memories')for(const value of memoryFilterState()[MEMORY_KIND_KEY])chips.push({key:MEMORY_KIND_KEY,value,label:`Type: ${value==='story'?'Story':'Event'}`});return chips};
    const prevStatus=renderFilterStatus;renderFilterStatus=function(...args){const out=prevStatus.apply(this,args);document.querySelectorAll(`#activeFilters [data-remove-key="${FAMILY_KEY}"]`).forEach(button=>button.onclick=()=>{const f=enemyFilterState();f[FAMILY_KEY]=f[FAMILY_KEY].filter(item=>item!==button.dataset.removeValue);saveState();renderAll()});document.querySelectorAll(`#activeFilters [data-remove-key="${MEMORY_KIND_KEY}"]`).forEach(button=>button.onclick=()=>{const f=memoryFilterState();f[MEMORY_KIND_KEY]=f[MEMORY_KIND_KEY].filter(item=>item!==button.dataset.removeValue);saveState();renderAll()});return out};
    const prevList=renderList;renderList=function(...args){const out=prevList.apply(this,args),list=document.getElementById('entityList');fixEnemyFamilyLabels(list);decorateMemoryCards(list);return out};
    const prevDetail=renderDetail;renderDetail=function(entity,...args){const panel=document.getElementById('detailPanel'),key=entity?keyOf(entity):'',isNew=key&&key!==lastDetailKey,phone=matchMedia('(max-width:959px)').matches,out=prevDetail.call(this,entity,...args);lastDetailKey=key;if(isNew&&phone&&panel){panel.classList.remove('public-detail-closing');panel.classList.add('open');panel.getAnimations?.().forEach(animation=>animation.cancel());panel.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:190,easing:'cubic-bezier(.22,.75,.25,1)'})}queueMicrotask(()=>{fixMemoryDescription();fixVocationRestrictions(panel);fixAbilityTreeRestrictions(document);fixEnemyFamilyLabels(document)});return out};
    document.addEventListener('click',event=>{if(event.target.closest?.('[data-stage235-dual-axis],[data-vocation-axis-button],[data-s3r45-level],[data-s3r44-level]'))scheduleVocationRestrictionFix()});
    globalThis.__SMASHDUMP_STAGE3_R5_7__?.ready?.then(()=>renderAll());
    globalThis.__SMASHDUMP_QOL_R12__={marker:MARKER,fixMemoryDescription,fixVocationRestrictions,fixAbilityTreeRestrictions,fixEnemyFamilyLabels,decorateMemoryCards,familyOptions,memoryAlbumType};renderAll();
  }
  install().catch(error=>console.error(MARKER,error));
})();
