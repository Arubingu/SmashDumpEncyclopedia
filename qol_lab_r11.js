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
