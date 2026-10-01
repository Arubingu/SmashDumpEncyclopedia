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
