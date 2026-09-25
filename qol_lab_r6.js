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
