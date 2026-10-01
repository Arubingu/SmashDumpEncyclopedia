/* SMASHDUMP_ENCYCLOPEDIA_EASTER_EGGS_CANDIDATE_R2 */
(()=>{'use strict';
 const ITEM=(kind,id)=>`items:${kind}:${id}`;
 const PKEY=ITEM('m_event_item','230100004');
 const MKEYS=new Set([ITEM('m_event_item','230100023'),ITEM('m_in_game_coin','3061')]);
 const AUDIO_URL=new URL('encyclopedia_easter_egg_important_item_found.mp3',document.currentScript?.src||location.href).href;
 const PASS_SHA256='eaf89db7108470dc3f6b23ea90618264b3e8f8b6145371667c4055e9c5ce9f52';
 const MESSAGES=[
  'Va te faire foutre MKUN, larper de merde qui veut jouer au leaker.',
  'Go fuck yourself, MKUN, you shitty larper who wants to play leaker.',
  '失せろMKUN、リーカー気取りのクソなりきり野郎が。',
  'Vete a la mierda, MKUN, puto larper de mierda que quiere hacerse el leaker.',
  'Fick dich, MKUN, du beschissener LARPer, der den Leaker spielen will.',
  'Vaffanculo, MKUN, larper del cazzo che vuole fare il leaker.',
  'Vai se foder, MKUN, larper de merda que quer bancar o leaker.',
  'Flikker op, MKUN, waardeloze larper die de leaker wil uithangen.',
  'Pierdol się, MKUN, gówniany larperze, który chce udawać leakera.',
  'Иди нахуй, MKUN, сраный ларпер, который хочет строить из себя ликера.',
  'Іди нахуй, MKUN, довбаний ларпер, який хоче вдавати з себе лікера.',
  '꺼져 MKUN, 리커인 척하고 싶은 좆같은 라퍼 새끼야.',
  '去你妈的，MKUN，你这个想装泄密者的垃圾角色扮演狗。',
  'Siktir git MKUN, leaker taklidi yapmak isteyen boktan larper.',
  'تبًا لك يا MKUN، يا لاربر تافه يريد أن يتظاهر بأنه مسرّب.',
  'Dra åt helvete, MKUN, din jävla larpare som vill leka leaker.',
  'Jdi do prdele, MKUN, zasranej larper, co si chce hrát na leakera.',
  'Du-te-n pula mea, MKUN, larper de căcat care vrea să facă pe leakerul.',
  'Persetan kau, MKUN, larper brengsek yang mau sok jadi leaker.',
  'Cút mẹ đi, MKUN, thằng larper rác rưởi muốn giả làm leaker.'
 ];
 let activeKey='',seq=0,lastTap=0,overlay=null,audio=null;

 const selectedKey=()=>document.querySelector('#entityList .entity-card.selected[data-key]')?.dataset.key||activeKey;
 const resetSequence=()=>{seq=0;lastTap=0};
 const hex=buffer=>Array.from(new Uint8Array(buffer),byte=>byte.toString(16).padStart(2,'0')).join('');
 const passwordMatches=async value=>{
  if(!globalThis.crypto?.subtle)return false;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return hex(digest)===PASS_SHA256;
 };
 const randomMessage=()=>MESSAGES[Math.floor(Math.random()*MESSAGES.length)];

 function closePassword(){
  if(!overlay)return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  if(audio){audio.pause();audio.currentTime=0}
  document.documentElement.classList.remove('sd-easter-locked');
  resetSequence();
 }

 function ensurePassword(){
  if(overlay)return overlay;
  overlay=document.createElement('div');
  overlay.id='sdEasterPasswordOverlay';
  overlay.className='sd-easter-password-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML=`<section class="sd-easter-password-modal" role="dialog" aria-modal="true" aria-labelledby="sdEasterPasswordTitle"><button type="button" class="sd-easter-password-close" aria-label="Close">×</button><div class="sd-easter-password-prompt"><h2 id="sdEasterPasswordTitle">Password ?</h2><form autocomplete="off"><input type="password" inputmode="numeric" aria-label="Password" maxlength="12" autocomplete="off"><button type="submit">Enter</button></form><p class="sd-easter-password-error" aria-live="polite"></p></div><div class="sd-easter-thanks" hidden><p>i love you guys &lt;3 thank you for the support</p></div></section>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.sd-easter-password-close').addEventListener('click',closePassword);
  overlay.addEventListener('click',event=>{if(event.target===overlay)closePassword()});
  overlay.querySelector('form').addEventListener('submit',async event=>{
   event.preventDefault();
   const input=overlay.querySelector('input'),error=overlay.querySelector('.sd-easter-password-error');
   const candidate=input.value;
   input.value='';
   if(!(await passwordMatches(candidate))){
    input.setAttribute('aria-invalid','true');error.textContent='Incorrect password.';
    overlay.querySelector('.sd-easter-password-modal').classList.remove('wrong');
    void overlay.offsetWidth;
    overlay.querySelector('.sd-easter-password-modal').classList.add('wrong');
    input.focus();return;
   }
   input.removeAttribute('aria-invalid');error.textContent='';
   overlay.querySelector('.sd-easter-password-prompt').hidden=true;
   overlay.querySelector('.sd-easter-thanks').hidden=false;
   if(audio){audio.pause();audio.currentTime=0}
   audio=new Audio(AUDIO_URL);audio.preload='auto';audio.loop=false;
   audio.play().catch(()=>{});
  });
  return overlay;
 }

 function openPassword(){
  const modal=ensurePassword(),prompt=modal.querySelector('.sd-easter-password-prompt'),thanks=modal.querySelector('.sd-easter-thanks'),input=modal.querySelector('input');
  prompt.hidden=false;thanks.hidden=true;input.value='';input.removeAttribute('aria-invalid');modal.querySelector('.sd-easter-password-error').textContent='';
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.documentElement.classList.add('sd-easter-locked');
  requestAnimationFrame(()=>input.focus());
 }

 function monsterToast(){
  document.querySelectorAll('.sd-easter-monster-toast').forEach(node=>node.remove());
  const toast=document.createElement('div');toast.className='sd-easter-monster-toast';toast.setAttribute('role','status');toast.textContent=randomMessage();
  document.body.appendChild(toast);
  const motion=toast.animate([
   {opacity:0,transform:'translate(-50%, 34px) scale(.82)'},
   {opacity:1,transform:'translate(-50%, -2px) scale(1.04)',offset:.48},
   {opacity:1,transform:'translate(-50%, -11px) scale(1)',offset:.72},
   {opacity:0,transform:'translate(-50%, -28px) scale(1.02)'}
  ],{duration:500,easing:'ease-out',fill:'both'});
  motion.finished.catch(()=>{}).finally(()=>toast.remove());
 }

 document.addEventListener('click',event=>{
  const card=event.target.closest?.('#entityList .entity-card[data-key]');
  if(card&&!event.target.closest('[data-favorite]')){
   activeKey=card.dataset.key||'';resetSequence();
   if(MKEYS.has(activeKey))setTimeout(monsterToast,0);
  }
  const art=event.target.closest?.('#detailPanel .detail-art');
  if(!art||selectedKey()!==PKEY)return;
  const now=performance.now();
  if(lastTap&&now-lastTap>4000)seq=0;
  lastTap=now;seq+=1;
  art.classList.remove('sd-easter-key-press');void art.offsetWidth;art.classList.add('sd-easter-key-press');
  if(seq>=(0x2f^0x25))openPassword();
 },true);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay?.classList.contains('open'))closePassword()});
})();
