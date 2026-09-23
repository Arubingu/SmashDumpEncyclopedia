/* SMASHDUMP_PUBLIC_ACCEPTED_RENDERER_FILE_TRANSPORT_R1 */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_PUBLIC_ACCEPTED_RENDERER_FILE_TRANSPORT_R1';
  if(globalThis.__SMASHDUMP_PUBLIC_STATIC_TRANSPORT__)return;
  const appRoot=new URL('.',location.href);
  const manifest=Object.freeze({"data/dynamic_registry_current_r8_1.json":"payloads/00_dynamic_registry_current_r8_1_8db446ab3ac3.js","data/versions/1.5.1/ability_filter_ticket_source_closure_stage3_r5_18_r13.json":"payloads/01_ability_filter_ticket_source_closure_stage3_r5_18_r13_0aa1b7e77ad9.js","data/versions/1.5.1/ability_gauntlet_drop_source_closure_stage3_r5_18_r14.json":"payloads/02_ability_gauntlet_drop_source_closure_stage3_r5_18_r14_515a0aedeeb8.js","data/versions/1.5.1/boon_asset_runtime_stage3_r5_9.json":"payloads/03_boon_asset_runtime_stage3_r5_9_2fd85ce11b4c.js","data/versions/1.5.1/combat_runtime_manifest_stage3_r4_9.json":"payloads/04_combat_runtime_manifest_stage3_r4_9_12faac8b1bd1.js","data/versions/1.5.1/combat_semantic_stage3_r4.json":"payloads/05_combat_semantic_stage3_r4_b0f4e0ab93c3.js","data/versions/1.5.1/combat_semantic_stage3_r4_3.json":"payloads/06_combat_semantic_stage3_r4_3_341b80db7440.js","data/versions/1.5.1/combat_semantic_stage3_r4_4.json":"payloads/07_combat_semantic_stage3_r4_4_055c3b7004b7.js","data/versions/1.5.1/combat_semantic_stage3_r4_5.json":"payloads/08_combat_semantic_stage3_r4_5_fca47a3120b4.js","data/versions/1.5.1/combat_semantic_stage3_r4_latest.json":"payloads/09_combat_semantic_stage3_r4_latest_de32eb42d2db.js","data/versions/1.5.1/cross_category_unresolved_reference_closure_stage3_r5_18_r4.json":"payloads/10_cross_category_unresolved_reference_closure_stage3_r5_18_r4_50640abf5d46.js","data/versions/1.5.1/encyclopedia.json":"payloads/11_encyclopedia_5ee45b908a1e.js","data/versions/1.5.1/enemy_context_facet_filter_contract_stage3_r5_18_r12.json":"payloads/12_enemy_context_facet_filter_contract_stage3_r5_18_r12_c4458b08e4c9.js","data/versions/1.5.1/enemy_filters_pose_reward_asset_and_scroll_stage3_r5_18_r5.json":"payloads/13_enemy_filters_pose_reward_asset_and_scroll_stage3_r5_18_r5_35adbb9b9007.js","data/versions/1.5.1/equipment_semantic_stage3_r2.json":"payloads/14_equipment_semantic_stage3_r2_1a73c7816ad3.js","data/versions/1.5.1/memory_semantic_stage3_r3.json":"payloads/15_memory_semantic_stage3_r3_7a5a01b34899.js","data/versions/1.5.1/prelab_reference_identity_asset_closure_stage3_r5_18.json":"payloads/16_prelab_reference_identity_asset_closure_stage3_r5_18_da6a8e7dd30c.js","data/versions/1.5.1/prelab_reference_identity_asset_closure_stage3_r5_18_corrected_r2.json":"payloads/17_prelab_reference_identity_asset_closure_stage3_r5_18_corrected_r2_b75150effa18.js","data/versions/1.5.1/prelab_reference_identity_asset_closure_stage3_r5_18_corrected_r3.json":"payloads/18_prelab_reference_identity_asset_closure_stage3_r5_18_corrected_r3_b0443b0cb557.js","data/versions/1.5.1/runtime_chain_stage_source_closure_stage3_r5_18_r15.json":"payloads/19_runtime_chain_stage_source_closure_stage3_r5_18_r15_10a48403bd3d.js","data/versions/1.5.1/runtime_readiness_visible_incomplete_items_stage3_r5_18_r10.json":"payloads/20_runtime_readiness_visible_incomplete_items_stage3_r5_18_r10_21911c2c656c.js","data/versions/1.5.1/semantic_model_stage3.json":"payloads/21_semantic_model_stage3_1f629190b4ca.js","data/versions/1.5.1/stage_presentation_enemy_visibility_final_stability_stage3_r5_18_r8.json":"payloads/22_stage_presentation_enemy_visibility_final_stability_stage3_r5_18_r8_e5cac2cc609f.js","data/versions/1.5.1/stage_reward_semantic_stage3_r5_14.json":"payloads/23_stage_reward_semantic_stage3_r5_14_e2e2ed5ab95b.js","data/versions/1.5.1/status_effects_semantic_stage3_r5_12b.json":"payloads/24_status_effects_semantic_stage3_r5_12b_e2d277822011.js","data/versions/1.5.1/world_asset_runtime_stage3_r5_2.json":"payloads/25_world_asset_runtime_stage3_r5_2_e13dbee5c186.js","data/versions/1.5.1/world_asset_runtime_stage3_r5_7.json":"payloads/26_world_asset_runtime_stage3_r5_7_3401d614c97c.js","data/versions/1.5.1/world_semantic_stage3_r5_7.json":"payloads/27_world_semantic_stage3_r5_7_2e39068e0911.js","data/versions/1.5.1/world_semantic_stage3_r5_latest.json":"payloads/28_world_semantic_stage3_r5_latest_37c1f42d7770.js"});
  const payloads=new Map();
  const loading=new Map();
  const nativeFetch=globalThis.fetch.bind(globalThis);
  const normalizePath=value=>{try{return decodeURIComponent(new URL(value,appRoot).pathname).replace(/\\/g,'/')}catch{return String(value||'').replace(/\\/g,'/')}};
  const keyFor=input=>{
    const raw=typeof input==='string'?input:(input instanceof URL?input.href:(input&&input.url)||'');
    const path=normalizePath(raw);
    for(const key of Object.keys(manifest))if(path.endsWith('/'+key)||path===key)return key;
    return null;
  };
  const register=(key,chunks,meta)=>{if(!Object.prototype.hasOwnProperty.call(manifest,key))throw Error(`Unregistered static payload key ${key}`);payloads.set(key,{chunks,meta})};
  const loadPayload=key=>{
    if(payloads.has(key))return Promise.resolve(payloads.get(key));
    if(loading.has(key))return loading.get(key);
    const promise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.async=true;script.src=new URL(manifest[key],appRoot).href;
      script.onload=()=>{script.remove();const row=payloads.get(key);row?resolve(row):reject(Error(`Static payload did not register ${key}`))};
      script.onerror=()=>{script.remove();reject(Error(`Could not load static payload ${key}`))};
      document.head.appendChild(script);
    }).finally(()=>loading.delete(key));
    loading.set(key,promise);return promise;
  };
  const decode=async row=>{
    if(typeof DecompressionStream!=='function')throw Error('This browser does not provide DecompressionStream(gzip) required by the static Encyclopedia transport.');
    const parts=row.chunks.map(chunk=>{const binary=atob(chunk),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes});
    const stream=new Blob(parts).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  };
  const jsonResponse=async key=>{const row=await loadPayload(key),text=await decode(row);return new Response(text,{status:200,headers:{'Content-Type':'application/json','X-SmashDump-Static-Payload':key}})};
  globalThis.fetch=(input,init)=>{
    const raw=typeof input==='string'?input:(input instanceof URL?input.href:(input&&input.url)||'');
    if(String(raw).includes('/api/r26c7-prewarm-status'))return Promise.resolve(new Response(JSON.stringify({total:1476,done:1476,errors:0,complete:true,started:true}),{status:200,headers:{'Content-Type':'application/json'}}));
    const key=keyFor(input);if(key)return jsonResponse(key);
    return nativeFetch(input,init);
  };
  globalThis.__SMASHDUMP_PUBLIC_STATIC_TRANSPORT__={marker:MARKER,manifest,register,keyFor,payloads:()=>payloads.size};
})();
