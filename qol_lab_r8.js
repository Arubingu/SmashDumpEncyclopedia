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
