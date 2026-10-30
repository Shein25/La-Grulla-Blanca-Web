import { clone, canonical, bindSemantic, requireRestorePermit } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { createM15Domain, M15_ID } from './m15-domain.js';
import { createM15QuestPort } from './m15-a07-quest-port.js';
import authored from './m15-dialogues.js';

const fail=k=>{throw Error('M15_NATIVE_'+k);};
const lines=new Map(authored.dialogues.map(l=>[l.line_id,l.text]));
const text=id=>{if(!lines.has(id))fail('AUTHORED_LINE:'+id);return lines.get(id);};
function makeDomain(p){const permits=new WeakSet(),proofs=new WeakSet(),commits=new WeakSet();
 const domain=createM15Domain({actorId:p.actorId,generation:p.generation,principalRoot:p.root,verifyEvidence:({type,proof,ctx})=>proofs.has(proof)&&proof.type===type&&proof.actorId===ctx.actorId&&proof.generation===ctx.generation,verifyGraftCommit:({proof})=>commits.has(proof),verifyRestorePermit:({permit})=>permits.has(permit)});
 return {domain,load(raw){const permit={};permits.add(permit);return domain.restore(raw,{actorId:p.actorId,generation:p.generation,worldGeneration:p.generation},permit);},certify(type,ctx){const proof=Object.freeze({id:p.generation+':M15:'+type+':'+domain.inspect().revision,type,actorId:p.actorId,generation:p.generation,source:'A07_CANONICAL_M15_TRUSTED_NATIVE_CHOICE'});proofs.add(proof);return proof;},committed(proof){commits.add(proof);return proof;}};
}
function initialM15Domain(p){return makeDomain(p).domain.inspect();}
function upgradeM15StoredRecord(verified){const r=clone(verified),d=r.envelope.domains;if(!Object.hasOwn(d,'M15Graft'))d.M15Graft=initialM15Domain(d.Player.state);return r;}
function validateM15Domain(d){const p=d.Player.state,s=d.M15Graft;if(!s)return true;/* Legacy stored payload is upgraded only after capability verification. */makeDomain(p).domain.validate(s);
 const types=s.evidence.map(r=>r.type),has=t=>types.includes(t);
 for(const [flag,type]of [['formed','FORMATIONS_VERIFIED'],['medical','MEDICAL_VERIFIED'],['permission','INSTITUTIONAL_PERMISSION']])if(s[flag]!==has(type))fail('EVIDENCE_FLAG:'+flag);
 const sources={FORMATIONS_VERIFIED:['formaciones_sala_control','he_zhen'],MEDICAL_VERIFIED:['consultorio_meridianos','lan_meihua'],INSTITUTIONAL_PERMISSION:['pabellon_disciplina','qiao_ren'],FORMATION_STABLE:['ala_camara_dos_alas',null]};for(const r of s.evidence){const place=sources[r.type];if(place&&(r.source!=='A07_CANONICAL_M15_TRUSTED_NATIVE_CHOICE'||r.room!==place[0]||r.npcId!==place[1]||!Number.isSafeInteger(r.turn)||r.turn<0))fail('NATIVE_EVIDENCE_CONTEXT');}
 const seq=['M15_STARTED','FORMATIONS_VERIFIED','MEDICAL_VERIFIED','INSTITUTIONAL_PERMISSION','FORMATION_STABLE'];let last=-1;for(const t of seq){const i=types.indexOf(t);if(i>=0){if(i<=last)fail('EVIDENCE_ORDER');last=i;}else if(seq.slice(seq.indexOf(t)+1).some(has))fail('EVIDENCE_GAP');}
 if(['CHOICE','DEFERRED','COMMITTED'].includes(s.phase)&&(!has('FORMATION_STABLE')||s.formationStep!==3))fail('FORMATION_REQUIRED');
 if(s.phase!=='LOCKED'&&d.World.quests.M12!=='hecha')fail('M12_REQUIRED');
 if(s.questCompleted!==has('M15_COMPLETED_DEFERRED')&&!s.graftCommitted)fail('COMPLETION_SOURCE');
 if(s.graftCommitted){const b=p.branches.graft,r=s.evidence.find(x=>x.type==='M15_COMPLETED_GRAFT');if(!b||b.root!==s.chosenRoot||b.evidenceId!==s.commitEvidenceId||b.source!=='ARC1_INJERTO_LIV_01_NATIVE_A07_A08_G08'||b.stage!=='LianQi_IV'||!r||r.nativeEvidenceId!==b.evidenceId||!Number.isSafeInteger(r.g08Revision)||r.g08Revision<=0)fail('A08_G08_GRAFT_LINK');}
 else if(p.branches.graft?.source==='ARC1_INJERTO_LIV_01_NATIVE_A07_A08_G08')fail('UNLINKED_NATIVE_GRAFT');return true;
}
function connectM15({runtime:g,bridge,input}){
 let state=null,commit=null,busy=false,explicitContext=false;const ensure=()=>{const p=bridge.m15Context();if(state?.generation!==p.generation)state=initialM15Domain(p);return state;};
 const ctx=(npcId=null)=>{const p=bridge.m15Context();return {actorId:p.actorId,generation:p.generation,worldGeneration:p.generation,principalRoot:p.root,stage:p.stage,quests:g.quests,noCombat:!g.combate,noQuestion:!g.pregunta,active:input.current()&&['R3','R4','R5'].every(k=>g.flags?.arc1?.revelaciones?.[k]==='CONFIRMADO'),room:g.pos,turn:g.turnoGlobal,npcId,npcPresent:npcId?g.npcPresente(npcId,g.pos)&&g.npcsEnSala(g.pos).includes(npcId):false,branchGraftRoot:p.branches?.graft?.root};};
 const graft=bridge.createM15GraftPort({readMission:()=>clone(ensure())});
 function draft(npcId){const owner=makeDomain(bridge.m15Context());owner.load(ensure());const port=createM15QuestPort({domain:owner.domain,readContext:()=>ctx(npcId),certify:(type,c)=>{if(!input.current()||!owner.domain.eligible(c))fail('NATIVE_INPUT');return owner.certify(type,c);},readVerifiedGraftCommit(){fail('NO_PUBLIC_COMMIT_READER');}});return {owner,port};}
 async function persist(owner,npcId,lease=null){if(!commit||busy)fail('STORAGE_UNAVAILABLE');const previous=canonical(ensure()),c=ctx(npcId),player=g.player;busy=true;
  try{return await commit({kind:lease?'M15_GRAFT':'M15_QUEST',current:()=>g.player===player&&g.pos===c.room&&g.turnoGlobal===c.turn&&canonical(ensure())===previous&&(!lease||graft.current(lease)),retire:()=>{if(lease)graft.retire(lease);},stage(e,revision){if(canonical(e.domains.M15Graft)!==previous)fail('STALE_QUEST');if(lease){const proof=graft.stage(lease,e);proof.g08Revision=revision;owner.domain.choose('GRAFT_RESULT',proof.root,{...c,active:true,noQuestion:true},owner.committed(proof));}e.domains.M15Graft=owner.domain.inspect();}});}finally{busy=false;}
 }
 function viewText(view,npc){const s=view.state||ensure();if(npc==='he_zhen')return text(s.phase==='FORMATIONS'?'HE_M15_OFFER':s.deferred?'HE_M15_AFTER_DEFER':s.graftCommitted?'HE_M15_EPILOGUE':'HE_M15_DONE');if(npc==='lan_meihua')return text(s.phase==='MEDICAL'?'LAN_M15_OFFER':!s.formed?'LAN_M15_NEED_FORM':s.graftCommitted?'LAN_M15_AFTER_GRAFT':'LAN_M15_OK');if(npc==='qiao_ren')return text(s.phase==='DISCIPLINE'?'QIAO_M15_APPROVE':!s.medical?'QIAO_M15_MISSING':s.graftCommitted?'QIAO_M15_ALREADY':'QIAO_M15_RETURN');if(s.phase==='CHAMBER')return text('ROOM_M15_STEP'+(s.formationStep+1));return text(s.phase==='DEFERRED'?'ROOM_M15_DEFERRED':s.phase==='COMMITTED'?'ROOM_M15_COMMITTED':s.phase==='CHOICE'?(s.selectedRoot?'ROOM_M15_CONFIRM':'ROOM_M15_CHOOSE'):'ROOM_M15_LOCKED');}
 function show(view,npc){if(!view)return;g.salida(viewText(view,npc));
  const extras={he_zhen:['HE_M15_EXTRA_SAFETY','HE_M15_EXTRA_MEASURE'],lan_meihua:['LAN_M15_EXTRA_MEM','LAN_M15_EXTRA_M10'],qiao_ren:['QIAO_M15_EXTRA_AUTH','QIAO_M15_EXTRA_LIMIT']}[npc]||[];
  const options=[...view.options,...extras.map((id,i)=>({id:'INFO:'+id,text:i===0?'Consultar las precauciones y antecedentes.':'Consultar los límites del procedimiento.'}))];if(!options.length)return;
  const player=g.player,stamp=view.stamp;let used=false;
  g.preguntarEleccionMultiple({pregunta:'M15 · La Segunda Corriente',opciones:options.map((o,i)=>({valor:String(i+1),texto:o.text})),callback:value=>{
   if(used||player!==g.player||!input.current())return;used=true;const selected=options[Number(value)-1];if(!selected)return;
   try{const d=draft(npc);if(selected.id.startsWith('INFO:')){const c=ctx(npc);if(c.actorId!==stamp.actorId||c.generation!==stamp.generation||c.room!==stamp.room||c.turn!==stamp.turn||ensure().revision!==stamp.revision||!c.npcPresent||!c.noCombat||!c.noQuestion)fail('STALE_CONTEXTUAL_LINE');g.salida(text(selected.id.slice(5)));return;}const result=d.port.apply(selected.id,stamp);if(result.status==='CANCELLED')return;
    if(result.correct===false)g.salida(text(selected.id==='HE_REPLACE'?'HE_M15_WRONG_REPLACE':selected.id==='HE_SKILL'?'HE_M15_WRONG_SKILL':selected.id==='LAN_FORCE'?'LAN_M15_Q2_WRONG_FORCE':'ROOM_M15_WRONG'));
    const lease=result.status==='NATIVE_COMMIT_REQUIRED'?graft.begin():null;
    void persist(d.owner,npc,lease).then(r=>{g.salida(r.status==='DURABLE_AND_RESTORED'?'M15: estado confirmado en G08.':text('ROOM_M15_G08_RECOVER'));}).catch(e=>g.salida('M15: operación rechazada; '+e.message));
   }catch(e){g.salida('M15: elección rechazada; '+e.message);}
  }});
 }
 const oldMission=g.gestionarMisionesNpc;g.gestionarMisionesNpc=function(npc,...args){
  if(!g.player||!['he_zhen','lan_meihua','qiao_ren'].includes(npc)||busy||!input.current())return oldMission.call(this,npc,...args);
  const d=draft(npc),c=ctx(npc);if(!d.owner.domain.eligible(c)||!c.npcPresent)return oldMission.call(this,npc,...args);
  // Do not intercept historical quests once this investigation was decided.
  if(ensure().questCompleted&&!explicitContext)return oldMission.call(this,npc,...args);
  const view=d.port.presentNpc(npc);if(!view)return oldMission.call(this,npc,...args);
  if(canonical(d.owner.domain.inspect())!==canonical(ensure())){void persist(d.owner,npc).then(r=>{if(r.status==='DURABLE_AND_RESTORED')show(view,npc);}).catch(e=>g.salida('M15: '+e.message));return 'M15 · La Segunda Corriente';}
  show(view,npc);return 'M15 · La Segunda Corriente';
 };
 const oldExecute=g.ejecutar;g.ejecutar=function(verb,args=[]){if(verb==='hablar'&&args.at(-1)==='corriente'){explicitContext=true;try{return oldExecute.call(this,verb,args.slice(0,-1));}finally{explicitContext=false;}}if(verb==='investigar'&&g.player&&g.pos==='ala_camara_dos_alas'&&input.current()&&!g.pregunta&&!busy){const view=draft(null).port.presentChamber();if(view){show(view,null);return;}}return oldExecute.call(this,verb,args);};
 const oldRender=g.renderMisiones;g.renderMisiones=function(...args){const r=oldRender.apply(this,args);if(g.player&&ensure().phase!=='LOCKED'){const host=document.getElementById('misContenido');if(host){const el=document.createElement('details');el.dataset.questId=M15_ID;el.open=true;const title=document.createElement('summary');title.textContent='M15 · La Segunda Corriente · '+ensure().phase;el.append(title);for(const evidence of ensure().evidence){const p=document.createElement('p');p.textContent=evidence.type;el.append(p);}host.append(el);}}return r;};
 const api=Object.freeze({inspect:()=>clone(ensure()),validate:validateM15Domain,completed:()=>ensure().questCompleted,connectDurable(fn){commit=fn;}});
 bindSemantic(api,{capture:()=>clone(ensure()),prepare(saved,c){requireRestorePermit(c.permit,c.envelope);validateM15Domain(c.envelope.domains);return {apply(){const old=state;state=clone(saved);return ()=>{state=old;};}};}});return api;
}

export { connectM15, initialM15Domain, upgradeM15StoredRecord, validateM15Domain };
