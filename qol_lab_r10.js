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
