/* SMASHDUMP_LAB_DRONY_MEMORY_EFFECTS_V1
 * Disposable CurrentPublicExport prototype only.
 * Adds Memory Effects / Pearls and Drony without changing compiler/upstream data.
 */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_LAB_DRONY_MEMORY_EFFECTS_V1';
  const DATA=globalThis.__SMASHDUMP_LAB_DRONY_MEMORY_EFFECTS_V1__;
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object||{},key);
  const unique=values=>[...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:'base'}));
  const finite=value=>Number.isFinite(Number(value))?Number(value):Number.MAX_SAFE_INTEGER;

  async function waitForAccepted(timeoutMs=60000){
    const started=Date.now();
    while(
      !DATA||
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

  const siteAsset=value=>{
    if(!value?.url)return null;
    return {...value,url:new URL(String(value.url),location.href).href};
  };
  const outputText=out=>{
    if(out===null||out===undefined)return'';
    if(typeof out==='string'||typeof out==='number')return String(out);
    const label=String(out.label||out.name||out.kind||'').trim();
    const value=String(out.value??out.amount??'').trim();
    if(label&&value)return `${label}: ${value}`;
    if(value)return value;
    if(label)return label;
    try{return JSON.stringify(out)}catch{return String(out)}
  };
  const conditionText=value=>{
    if(value===null||value===undefined)return'';
    if(typeof value==='string'||typeof value==='number')return String(value);
    const label=String(value.label||value.name||value.condition||value.kind||'').trim();
    const detail=String(value.value??value.description??value.text??'').trim();
    if(label&&detail)return `${label}: ${detail}`;
    if(label)return label;
    if(detail)return detail;
    try{return JSON.stringify(value)}catch{return String(value)}
  };
  const rankValue=rank=>{
    const outputs=(rank?.outputs||[]).filter(Boolean);
    const scalarValues=unique(outputs.map(row=>String(row?.value??row?.amount??'').trim()).filter(Boolean));
    if(scalarValues.length===1)return scalarValues[0];
    const values=unique(outputs.map(outputText));
    return values.length?values.join(' · '):'Value unavailable';
  };

  const effectNameMultiplicity=new Map();
  for(const effect of [...(DATA.memory_effects?.main||[]),...(DATA.memory_effects?.secondary||[])]){
    const key=`${effect.slot}|${String(effect.name||'').toLowerCase()}`;
    effectNameMultiplicity.set(key,(effectNameMultiplicity.get(key)||0)+1);
  }
  function makeEffectEntity(effect){
    const main=effect.slot==='main';
    const display=siteAsset(effect.thumbnail_asset);
    const detail=siteAsset(effect.detail_asset);
    const ranks=(effect.rank_progression||[]).map(rank=>({...rank,summary:rankValue(rank)}));
    const duplicateName=(effectNameMultiplicity.get(`${effect.slot}|${String(effect.name||'').toLowerCase()}`)||0)>1;
    const subtitle=`${main?'Main Memory Effect · D–S ranks':'Secondary Memory Effect · A/S ranks'}${effect.variant_label?` · ${effect.variant_label}`:''}`;
    return {
      category:'memory_effects',
      id:`${effect.slot}:${effect.group_id}`,
      name:{text:effect.name||`${main?'Main':'Secondary'} effect ${effect.group_id}`,fallback:false},
      description:{text:effect.description||'',fallback:false,missing:!effect.description},
      description_state:effect.description?'available':'missing',
      subtitle,
      status:'Current reference',
      display_asset:display,
      assets:{
        'Pearl thumbnail':effect.thumbnail_asset?.logical_path||'No dedicated thumbnail (secondary effect)',
        'Pearl detail art':effect.detail_asset?.logical_path||'No dedicated detail art (secondary effect)'
      },
      baseline:null,
      current:{
        slot:effect.slot,
        slot_label:main?'Main effect':'Secondary effect',
        group_id:Number(effect.group_id),
        semantic_name:effect.semantic_name||effect.name,
        description:effect.description||'',
        weapon:effect.weapon||null,
        element:effect.element||null,
        damage_type:effect.damage_type||null,
        mechanic:effect.mechanic||'Other',
        duplicate_name:duplicateName,
        variant_label:effect.variant_label||null,
        rank_progression:ranks,
        compatible_group_ids:[...(effect.compatible_group_ids||[])],
        detail_asset:detail,
        icon_color:effect.icon_color??null
      },
      facts:[
        main?'Main':'Secondary',
        effect.weapon||effect.element||effect.damage_type||effect.mechanic||'Effect',
        effect.variant_label||ranks.map(row=>`${row.rank_label} ${row.summary}`).join(' · ')
      ]
    };
  }

  const supportById=new Map((DATA.drony?.support_items||[]).map(row=>[Number(row.id),row]));
  function normalizeCost(cost){
    const support=supportById.get(Number(cost.content_id));
    return {
      ...cost,
      name:cost.name||support?.name||`Content ${cost.content_id}`,
      asset:siteAsset(cost.asset||support?.asset)
    };
  }
  function makeDronyEntity(unit){
    const levels=(unit.levels||[]).map(row=>({
      ...row,
      upgrade_costs:(row.upgrade_costs||[]).map(normalizeCost)
    }));
    const max=levels[levels.length-1]||{};
    const unlock=unit.unlock_condition_slot_index
      ?`Unlock: Drony Unit ${unit.unlock_condition_slot_index} Lv${unit.unlock_condition_level}`
      :'Available with Expeditions';
    return {
      category:'drony',
      id:String(unit.slot_index),
      name:{text:unit.name||`Drony Unit ${unit.slot_index}`,fallback:false},
      description:{text:'Expedition Drony unit.',fallback:true,missing:false},
      description_state:'available',
      subtitle:`Drony Unit ${unit.slot_index} · ${unlock}`,
      status:'Current reference',
      display_asset:siteAsset(unit.display_asset),
      assets:{
        'Drony art':unit.display_asset?.logical_path||'?',
        'Expedition background':unit.background_asset?.logical_path||'?'
      },
      baseline:null,
      current:{
        ...unit,
        display_asset:siteAsset(unit.display_asset),
        background_asset:siteAsset(unit.background_asset),
        levels,
        areas:(DATA.drony?.areas||[]).map(area=>({
          ...area,
          area_asset:siteAsset(area.area_asset),
          slot_asset:siteAsset(area.slot_asset),
          normal_rewards:(area.normal_rewards||[]).map(reward=>({...reward,asset:siteAsset(reward.asset)})),
          great_success_rewards:(area.great_success_rewards||[]).map(reward=>({...reward,asset:siteAsset(reward.asset)}))
        })),
        support_items:(DATA.drony?.support_items||[]).map(item=>({...item,asset:siteAsset(item.asset)})),
        sensor_notes:DATA.drony?.sensor_notes||{}
      },
      facts:['Lv 1–60',unlock]
    };
  }

  const effectEntities=[
    ...(DATA.memory_effects?.main||[]).map(makeEffectEntity),
    ...(DATA.memory_effects?.secondary||[]).map(makeEffectEntity)
  ];
  const dronyEntities=(DATA.drony?.units||[]).map(makeDronyEntity);
  const effectByKey=new Map(effectEntities.map(row=>[keyOf(row),row]));
  const effectBySlotGroup=new Map(effectEntities.map(row=>[`${graph(row).slot}:${graph(row).group_id}`,row]));
  const labEntityByKey=new Map(
    [...effectEntities,...dronyEntities].map(row=>[keyOf(row),row])
  );

  function installCategories(){
    Object.assign(labels,{memory_effects:'Memory Effects',drony:'Drony'});
    Object.assign(icons,{memory_effects:'✤',drony:'◫'});
    const insertAfter=(anchor,key)=>{
      if(planned.includes(key))return;
      const index=planned.indexOf(anchor);
      planned.splice(index>=0?index+1:planned.length,0,key);
    };
    insertAfter('memories','memory_effects');
    insertAfter('items','drony');

    /*
     * R26 C4 deliberately exposes categories/counts through a read-only Proxy.
     * Lab categories must extend the retained source objects behind that Proxy;
     * assigning to state.data.categories directly is acknowledged then discarded.
     */
    const ownership=globalThis.__SMASHDUMP_R26_C4_DATA_OWNERSHIP__;
    const categoryTarget=ownership?.categorySource;
    const countTarget=ownership?.countSource;
    if(!categoryTarget||!countTarget)throw Error('R26 C4 compiler projection ownership source is unavailable');
    categoryTarget.memory_effects=effectEntities;
    categoryTarget.drony=dronyEntities;
    countTarget.memory_effects={total:effectEntities.length,added:0,modified:0,missing:0};
    countTarget.drony={total:dronyEntities.length,added:0,modified:0,missing:0};

    if(state.data.categories.memory_effects?.length!==effectEntities.length||
       state.data.categories.drony?.length!==dronyEntities.length||
       state.data.meta.counts.memory_effects?.total!==effectEntities.length||
       state.data.meta.counts.drony?.total!==dronyEntities.length){
      throw Error('Lab category injection did not become visible through the R26 C4 read-only projection');
    }
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
    return `<div class="lab-table-wrap lab-level-wrap"><table class="lab-level-table"><thead><tr><th>Lv</th><th>Gold</th><th>Memory</th><th>Materials</th><th>Upgrade effect</th><th>Cost to reach level</th></tr></thead><tbody>${levels.map(row=>`<tr><td><strong>${fmt(row.level)}</strong></td><td>${fmt(row.gold)}</td><td>${fmt(row.memory)}</td><td>${fmt(row.items)}</td><td>${capacitiesHtml(row.capacities)}</td><td>${costHtml(row.upgrade_costs)}</td></tr>`).join('')}</tbody></table></div>`;
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
      <p class="field-note">Every stored level is listed. “Upgrade effect” is the localized capacity the game says changes at that level; costs are the exact expedition materials required for that level.</p>
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
      if(content)content.innerHTML='<p class="field-note">Prototype data lives in <code>data/lab_drony_memory_effects_payload_v1.js</code>. It is kept outside the accepted Encyclopedia payload until manual approval.</p>';
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
    const patchRoot=root=>{
      if(!root)return;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      const nodes=[];
      while(walker.nextNode())nodes.push(walker.currentNode);
      for(const node of nodes){
        const parent=node.parentElement;
        if(!parent||parent.closest('.advanced,.raw-json,pre,code,script,style'))continue;
        const next=String(node.nodeValue||'')
          .replace(/\bBuffer parameter 12\b/gi,'Attack Damage')
          .replace(/\bStatus type 18\b/gi,'Weaken');
        if(next!==node.nodeValue)node.nodeValue=next;
      }
    };
    patchRoot(document.getElementById('entityList'));
    if(panel?.classList.contains('open')){
      patchRoot(panel);
    }
    if(entity?.category==='status_effects'&&String(nameOf(entity)).trim().toLowerCase()==='weaken'){
      const summary=panel?.querySelector('.s3r512b-hero strong');
      const wanted='Reduces attack, magical might, defence and magical defence for a set period of time.';
      if(summary&&summary.textContent!==wanted)summary.textContent=wanted;
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
    if(globalThis.__SMASHDUMP_LAB_DRONY_MEMORY_EFFECTS_V1_API__)return globalThis.__SMASHDUMP_LAB_DRONY_MEMORY_EFFECTS_V1_API__;
    installCategories();
    const api={
      marker:MARKER,
      lab_only:true,
      memory_effect_count:effectEntities.length,
      memory_effect_main_count:effectEntities.filter(row=>graph(row).slot==='main').length,
      memory_effect_secondary_count:effectEntities.filter(row=>graph(row).slot==='secondary').length,
      legal_pearl_pairs:Number(DATA.memory_effects?.legal_pairs||0),
      drony_unit_count:dronyEntities.length,
      asset_summary:DATA.asset_summary,
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
    globalThis.__SMASHDUMP_LAB_DRONY_MEMORY_EFFECTS_V1_API__=api;
    installLabVocationRefreshHook();
    renderAll();
    scheduleLabPresentation();
    return api;
  }

  waitForAccepted().then(install).catch(error=>console.error(MARKER,error));
})();
