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
