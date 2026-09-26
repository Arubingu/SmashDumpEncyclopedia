/* SMASHDUMP_ENCYCLOPEDIA_QOL_ACCEPTED_R10_LOADER */
(()=>{
  'use strict';
  const MARKER='SMASHDUMP_ENCYCLOPEDIA_QOL_ACCEPTED_R10_LOADER';
  const scripts=['qol_lab_r6.js','qol_lab_r7.js','qol_lab_r8.js','qol_lab_r9.js','qol_lab_r10.js','data/lab_drony_memory_effects_payload_v1.js','lab_drony_memory_effects_v1.js','qol_lab_r11.js','qol_lab_r12.js'];
  const appRoot=new URL('.',location.href);
  const releaseToken=(()=>{try{return new URL(document.currentScript?.src||'',location.href).searchParams.get('release')||''}catch{return''}})();
  const activeContent=()=>String(globalThis.__SMASHDUMP_ENCYCLOPEDIA_ACTIVE_SNAPSHOT__?.current_version||'');
  const metadataContent=()=>String(globalThis.__SMASHDUMP_QOL_R6_META__?.content_version||'');
  /*
   * The accepted renderer is injected by app.js as a classic script. Its
   * top-level bindings are available to the following classic QoL scripts,
   * but they are not a reliable globalThis readiness API on every browser.
   * Gate on the renderer's actual public shell instead: the active snapshot,
   * matching metadata, populated category navigation and rendered entity list.
   */
  const rendererReady=()=>{
    const nav=document.getElementById('categoryNav');
    const list=document.getElementById('entityList');
    const label=document.getElementById('versionLabel');
    return Boolean(
      globalThis.__SMASHDUMP_ENCYCLOPEDIA_ACTIVE_SNAPSHOT__&&
      globalThis.__SMASHDUMP_QOL_R6_META__&&
      nav?.childElementCount&&
      list&&
      label&&
      !/^Loading(?:…|\.\.\.)?$/i.test(String(label.textContent||'').trim())
    );
  };
  const load=name=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.async=false;
    const url=new URL(name,appRoot);if(releaseToken)url.searchParams.set('release',releaseToken);script.src=url.href;
    script.onload=()=>resolve(name);
    script.onerror=()=>reject(Error(`Could not load accepted Encyclopedia QoL asset ${name}`));
    document.head.appendChild(script);
  });
  async function install(timeoutMs=180000){
    const started=Date.now();
    while(!rendererReady()){
      if(Date.now()-started>timeoutMs)throw Error('Accepted Encyclopedia QoL timed out waiting for the renderer');
      await new Promise(resolve=>setTimeout(resolve,25));
    }
    const current=activeContent(),metadata=metadataContent();
    if(!current||metadata!==current)throw Error(`QoL metadata/content mismatch: active=${current||'<missing>'} metadata=${metadata||'<missing>'}`);
    for(const name of scripts)await load(name);
    globalThis.__SMASHDUMP_ENCYCLOPEDIA_QOL_ACCEPTED_R10__={marker:MARKER,content_version:current,scripts:[...scripts]};
    document.documentElement.dataset.encyclopediaQol='accepted-r10';
  }
  install().catch(error=>{
    document.documentElement.dataset.encyclopediaQol='failed';
    console.error(MARKER,error);
  });
})();
