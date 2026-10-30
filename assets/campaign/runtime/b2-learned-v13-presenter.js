import { requireLearnedReceipt } from './b2-player-learning-b14.js';
import { SERVICE_CATALOG } from './b2-shen-elemental-service-catalog-b14.js';
import { createAuthoredCatalog } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07.9/catalog.js';
import { V13_STYLES, V13_FRAGMENT, PRACTICE, T, V13_REFERENCE } from '../sources/ACCEPTED_CAMPAIGN/experimental/v13-reference-assets.js';
import { fail, freeze } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07/safe-data.js';

const ports=new WeakSet();
function requireV13Port(p){if(!ports.has(p))fail('B13_V13_PORT_NOT_AUTHENTIC');return p;}
function createLearnedV13Presenter({runtime,captureLearning}){
 if(!runtime||typeof captureLearning!=='function')fail('B13_VISUAL_PRIVATE_PORT');
 let mount=null,shadow=null,active=false,playing=false,serial=0,key=null,lastFocus=null,saved=[],timer=null,resume=null;
 const used=new WeakSet(),consumedKeys=new Set();const status={opened:0,closed:0,completed:0,skipped:0,blockedInput:0,techniqueId:null,phaseTrace:[],beforeFirstFrame:null,reason:null,startedAt:null,durationMs:null};
 const $=id=>shadow?.getElementById(id),inside=e=>e.composedPath?.().includes(mount);
 function control(){return playing?$('skipBtn'):$('closeBtn');}
 function focusControl(){try{control()?.focus({preventScroll:true});}catch{}}
 function gateKey(e){if(!active&&!consumedKeys.has(e.key))return;e.preventDefault();e.stopImmediatePropagation();status.blockedInput++;consumedKeys.add(e.key);if(!active)return;
  if(e.key==='Escape'){close('ESCAPE');return;}if(e.key==='Tab'){focusControl();return;}
  if((e.key==='Enter'||e.key===' ')&&inside(e)){const f=shadow.activeElement;if(f===control())f.click();}
 }
 function gatePointer(e){if(!active||inside(e))return;e.preventDefault();e.stopImmediatePropagation();status.blockedInput++;}
 if(typeof globalThis.window?.addEventListener==='function'){
  window.addEventListener('keydown',gateKey,true);window.addEventListener('keyup',e=>{const consumed=consumedKeys.delete(e.key);if(active||consumed){e.preventDefault();e.stopImmediatePropagation();}},true);
  for(const type of ['pointerdown','click','submit'])window.addEventListener(type,gatePointer,true);
  window.addEventListener('focusin',e=>{if(active&&!inside(e)){e.stopImmediatePropagation();focusControl();}},true);
 }
 function wait(ms){return new Promise(resolve=>{resume=resolve;timer=setTimeout(()=>{timer=null;resume=null;resolve(true);},ms);});}
 function cancelWait(){if(timer!==null)clearTimeout(timer);timer=null;const r=resume;resume=null;r?.(false);}
 function build(){
  if(mount)return true;if(!globalThis.document?.body||typeof document.createElement('div').attachShadow!=='function'){status.reason='DOM_NOT_CAPABLE';return false;}
  mount=document.createElement('div');mount.id='b13LearnedV13Host';mount.style.cssText='position:fixed;inset:0;z-index:110000;pointer-events:none';
  shadow=mount.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=V13_STYLES;shadow.append(style);
  const content=document.createElement('div');content.innerHTML=V13_FRAGMENT;shadow.append(...Array.from(content.childNodes));document.body.append(mount);
  $('skipBtn').addEventListener('click',()=>{if(!active||!playing)return;status.skipped++;serial++;cancelWait();update(PRACTICE[key].seq.length-1,PRACTICE[key].seq.at(-1),0);finish('SKIPPED');});
  $('closeBtn').addEventListener('click',()=>close('CONTINUE'));
  $('layer').addEventListener('click',e=>{if(e.target===$('layer')&&!playing)close('BACKDROP');});
  return true;
 }
 function particles(){const h=$('fxParticles');h.replaceChildren();for(let i=0;i<17;i++){const n=document.createElement('i');n.style.setProperty('--x',(8+(i*19%85))+'%');n.style.setProperty('--y',(10+(i*37%75))+'%');n.style.setProperty('--dur',(2.8+(i%5)*.45)+'s');n.style.setProperty('--delay',(-(i%6)*.58)+'s');n.style.setProperty('--drift',((i%2?-1:1)*(12+i%20))+'px');n.style.setProperty('--rot',((i*47)%100-50)+'deg');h.append(n);}}
 function apply(){
  const t=T[key],card=$('card');card.classList.remove('fx-fire','fx-metal','fx-water','fx-earth','fx-wind');card.classList.add('fx-'+key);
  mount.style.setProperty('--accent',t.accent);mount.style.setProperty('--accent-rgb',t.rgb);
  for(const [id,text] of Object.entries({symbol:t.symbol,techName:t.name,elementBadge:t.symbol+' '+t.element,origin:'Bajo la enseñanza de Shen Baojun',sourceText:'Shen Baojun · Sala de Formas',principleText:t.principle,combatRoleText:t.combat,finalRelato:t.final,finalNote:'Forma básica ya aprendida. Esta ceremonia no cambia tus recursos ni tu conocimiento.'}))$(id).textContent=text;
  particles();
 }
 function update(i,entry,previous){
  const [p,,phase,line,sub]=entry,t=PRACTICE[key],card=$('card'),chapters=['OBSERVACIÓN','ENSAYO','CORRECCIÓN','CONDUCCIÓN','COMPRENSIÓN'];
  $('fill').style.width=p+'%';$('pct').textContent=p+'%';$('stepIndicator').textContent='Movimiento '+(i+1)+' de '+t.seq.length;
  $('progressCaption').textContent='FASE '+['I','II','III','IV','V'][phase]+' · '+chapters[phase];$('phaseLabel').textContent=chapters[phase]+' · '+T[key].element;
  $('mainLine').textContent=line;$('subLine').textContent=sub;$('masterQuote').textContent=t.quotes[phase];$('masterContext').textContent=t.context[phase];
  $('trainingLogText').textContent=(p<previous?'Retroceso de la representación: ':'Paso '+(i+1)+'. ')+line+'.';$('storyPane').classList.toggle('is-correction',phase===2);$('centerGlyph').textContent=T[key].symbol;
  card.classList.remove('progress-early','progress-mid','progress-late','progress-near','stall','insight');card.classList.add(p<25?'progress-early':p<60?'progress-mid':p<90?'progress-late':'progress-near');
  if(p<=previous)card.classList.add('stall');if(p>=90)card.classList.add('insight');card.style.setProperty('--learning-power',String(p/100));
  Array.from($('trainingChapters').querySelectorAll('.chapter')).forEach((n,j)=>{n.classList.toggle('is-active',j===phase);n.classList.toggle('is-done',j<phase);});
  status.phaseTrace.push({index:i,percent:p,phase,holdMs:entry[1],elapsedMs:performance.now()-status.startedAt});
 }
 function finish(reason){
  if(!active||!playing)return;playing=false;cancelWait();const c=$('card');c.classList.remove('learning','stall','ceremony');c.classList.add('complete');
  $('sealText').textContent='✦ FORMA BÁSICA APRENDIDA';$('stageBadge').textContent='APRENDIDA';$('skipBtn').disabled=true;status.completed++;status.reason=reason;status.durationMs=performance.now()-status.startedAt;focusControl();
 }
 function close(reason='CLOSED'){
  if(!active)return;serial++;cancelWait();status.closed++;status.reason=reason;active=false;playing=false;
  $('layer').classList.remove('open');$('layer').setAttribute('aria-hidden','true');mount.style.pointerEvents='none';$('card').classList.remove('learning','complete','stall','ceremony','insight');
  for(const s of saved){s.el.inert=s.inert;if(s.hidden===null)s.el.removeAttribute('aria-hidden');else s.el.setAttribute('aria-hidden',s.hidden);}saved=[];
  const target=lastFocus?.isConnected&&!lastFocus.disabled&&!lastFocus.closest('[inert]')?lastFocus:document.getElementById('entrada');
  if(runtime.terminado===false)try{target?.focus({preventScroll:true});}catch{}
 }
 async function animate(ticket){
  let previous=0;for(let i=0;i<PRACTICE[key].seq.length;i++){if(!active||ticket!==serial)return;const step=PRACTICE[key].seq[i];update(i,step,previous);previous=step[0];if(!await wait(step[1])||ticket!==serial)return;}
  $('card').classList.add('ceremony');if(!await wait(650)||ticket!==serial)return;finish('NATURAL_COMPLETION');
 }
 const api=Object.freeze({
  present(cap){
   let d;try{d=requireLearnedReceipt(cap);}catch{status.reason='UNAUTHENTIC_LEARNED';return false;}
   if(used.has(cap)||active){status.reason='REPLAY_OR_ACTIVE';return false;}
   const snapshot=captureLearning(),visualKey=Object.keys(T).find(k=>T[k].id===d.techniqueId),q=runtime.pregunta?.multipleChoice;
   const remaining=SERVICE_CATALOG.lessons.filter(l=>!snapshot.knownIds?.includes(l.techniqueId)&&(!l.defensive||runtime.estadoA08().stage!=='LianQi_I'));
   const expected=remaining.length?remaining.map(l=>l.name).concat([SERVICE_CATALOG.cancelText]):createAuthoredCatalog().availableEntries('shen_baojun').map(e=>e.text);
   if(snapshot.status!=='READY'||snapshot.generation!==d.generation||snapshot.knowledgeRevision!==d.revision||!snapshot.knownIds.includes(d.techniqueId)||!visualKey||runtime.pos!=='sala_formas'||!runtime.npcPresente('shen_baojun')||!q||q.opciones.some(o=>o.texto===T[visualKey].name)||JSON.stringify(q.opciones.map(o=>o.texto))!==JSON.stringify(expected)){status.reason='POST_COMMIT_MENU_NOT_CURRENT';return false;}
   used.add(cap);if(!build())return false;
   key=visualKey;const ticket=++serial;status.opened++;active=true;playing=true;status.techniqueId=d.techniqueId;status.phaseTrace=[];status.startedAt=performance.now();status.durationMs=null;status.reason='AUTHENTIC_LEARNED';
   status.beforeFirstFrame=freeze({knownIds:[...snapshot.knownIds],revision:snapshot.knowledgeRevision,generation:snapshot.generation,techniqueId:d.techniqueId,menuTexts:q.opciones.map(o=>o.texto),learnedRemoved:true,remainingLessonIds:remaining.map(l=>l.techniqueId),menuMode:remaining.length?'LESSONS':'ALL_LEARNED_SOCIAL_ONLY'});
   lastFocus=document.activeElement;saved=Array.from(document.body.children).filter(el=>el!==mount).map(el=>({el,inert:el.inert,hidden:el.getAttribute('aria-hidden')}));
   for(const s of saved){s.el.inert=true;s.el.setAttribute('aria-hidden','true');}
   const card=$('card');card.classList.remove('complete','stall','ceremony','insight','progress-early','progress-mid','progress-late','progress-near');card.classList.add('learning','progress-early');apply();
   $('sealText').textContent='FORMA BÁSICA YA REGISTRADA';$('stageBadge').textContent='CEREMONIA';$('skipBtn').disabled=false;$('fill').style.width='0%';$('pct').textContent='0%';
   mount.style.pointerEvents='auto';$('layer').classList.add('open');$('layer').setAttribute('aria-hidden','false');focusControl();
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){update(PRACTICE[key].seq.length-1,PRACTICE[key].seq.at(-1),0);finish('REDUCED_MOTION');}
   else void animate(ticket);
   return true;
  },
  close,inspect:()=>freeze({active,playing,elementKey:key,...status,phaseTrace:status.phaseTrace.map(x=>({...x})),timers:timer===null?0:1,reference:V13_REFERENCE,learningWrites:0,saveConnected:false})
 });ports.add(api);
 for(const name of ['nuevaPartida','muerte','terminar','deserializar']){const original=runtime[name];if(typeof original==='function')runtime[name]=function(...args){api.close('LIFECYCLE_'+name);return original.apply(this,args);};}
 return api;
}

export { createLearnedV13Presenter, requireV13Port };
