import { createA09V32Postcombat } from '../sources/A09_NATIVE/A09_V32_POSTCOMBAT.js';
import { createA09V32WorldPort } from '../sources/A09_NATIVE/A09_V32_WORLD_PORT.js';

const copy=x=>structuredClone(x),canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v),same=(a,b)=>canonical(a)===canonical(b),fail=s=>{throw Error('A09_POSTCOMBAT_'+s);};
function projectNativeM18Decision(envelope,row){
 const d=envelope.domains,s=d.LIVMissions,m=s.missions.M18,b=d.A09Boss.battle;
 if(!m||m.status!=='activa'||b.status!=='CEDIDO'||row.stage!=='DECIDED'||row.battleId!==b.battleId)fail('AUTHENTIC_M18_CONTEXT');
 const rec=(type,extra)=>{const r={id:s.generation+':LIV:'+s.receipts.length,type,actorId:s.actorId,generation:s.generation,room:d.World.pos,turn:d.World.turnoGlobal,...extra};s.receipts.push(r);return r;};
 m.evidence.a09Terminal=rec('MISSION_EVIDENCE',{missionId:'M18',key:'a09Terminal',eventId:row.eventId,battleId:b.battleId,nativeActionId:b.terminalProof.nativeReceipt.actionId,source:'A09_NATIVE_VINCULO_CEDIDO'});
 m.evidence.a09Decision=rec('MISSION_EVIDENCE',{missionId:'M18',key:'a09Decision',eventId:row.eventId,choice:row.decisionFinal,source:'A09_NATIVE_EXPLICIT_CONFIRMATION'});
 m.status='hecha';m.closed=rec('MISSION_CLOSED',{missionId:'M18',eventId:row.eventId,source:'A09_NATIVE_M18_ATOMIC_DECISION'});d.World.quests.M18='hecha';
 const arc=d.World.flags.arc1;arc.decisionFinal=row.decisionFinal;arc.vinculoGrulla=row.vinculoGrulla;arc.estado='EPILOGO';
 // Canonical T290 history is stored with its irreversible native decision.
 // It is excluded from this arc's Mirror and grants no numerical reward.
 row.history={event:row.decisionFinal,importancia:'maxima',cierre_arco:true,excluida_espejo_arco1:true,source:'T290',eventId:row.eventId};
}
function connectNativeA09Postcombat({getState,commitState,runtime:g,bridge}){
 const battle=getState().battle;if(!battle)fail('NATIVE_BATTLE_REQUIRED');const identity={actorId:'grulla_blanca',battleId:battle.battleId,generation:battle.generation},caps=new WeakMap(),documents=new WeakSet();let physicalSerial=0,choiceEvent=null,confirmEvent=null;
 const scope=()=>{const s=getState(),o=bridge.herbalismIdentity();return s.battle?.battleId===identity.battleId&&s.playerGeneration===o.generation&&g.pos==='nucleo_santuario_vinculo';};
 const issue=(kind,data)=>{const cap=Object.freeze({});caps.set(cap,{kind,data:copy(data),used:false});return cap;};
 const consume=(kind,cap,input)=>{const c=caps.get(cap);if(!scope()||!c||c.used||c.kind!==kind)return false;for(const[k,v]of Object.entries(c.data))if(input[k]!==undefined&&!same(input[k],v))return false;c.used=true;return true;};
 const authority=Object.fromEntries(['cession','presentation','decision','exit'].map(kind=>[kind,(cap,input)=>consume(kind,cap,input)]));
 const driver={read:async id=>{if(id!==identity.battleId)fail('CROSS_BATTLE');return copy(getState().postcombat);},atomic:async(id,reducer)=>{if(id!==identity.battleId||!scope())fail('WORLD_OWNER_SCOPE');const previous=getState(),row=reducer(copy(previous.postcombat));if(same(previous.postcombat,row))return row;const next=copy(previous);next.postcombat=copy(row);await commitState(next,'A09_POSTCOMBAT',e=>{if(row.stage==='DECIDED'&&previous.postcombat?.stage!=='DECIDED')projectNativeM18Decision(e,e.domains.A09Boss.postcombat);});return copy(getState().postcombat);}};
 const world=createA09V32WorldPort({driver,authority});
 const host={
  verifyTerminalProof(proof){const r=getState().battle,t=r.terminalProof;if(!scope()||r.status!=='CEDIDO'||!r.lifecycle.terminal||!t||!same(proof.before,t.before)||!same(proof.after,t.after)||!same(proof.nativeReceipt,t.nativeReceipt)||!same(proof.transition,t.transition)||!r.journal.some(e=>e.id===t.nativeReceipt.id&&same(e,t.nativeReceipt)))fail('NATIVE_JOURNAL_TERMINAL');return issue('cession',{battleId:r.battleId,generation:r.generation,actionId:t.nativeReceipt.actionId,eventId:'M18:'+r.battleId+':VINCULO_CEDIDO'});},
  readCommittedTerminal(){return getState().battle?.terminalProof?copy(getState().battle.terminalProof):null;},
  verifyPresentationCompletion({eventId,animationReceipt}){const c=caps.get(animationReceipt);if(!scope()||!c||c.kind!=='completedAnimation'||c.used||c.data.eventId!==eventId)fail('AUTHENTIC_SCENE_REQUIRED');c.used=true;return issue('presentation',{battleId:identity.battleId,eventId});},
  verifyExplicitConfirmation({eventId,choice,confirmationReceipt,worldRevision}){const c=caps.get(confirmationReceipt);if(!scope()||!c||c.used||c.kind!=='physicalConfirmation'||c.data.eventId!==eventId||c.data.choice!==choice||c.data.worldRevision!==worldRevision)fail('PHYSICAL_CONFIRMATION_REQUIRED');c.used=true;return issue('decision',{battleId:identity.battleId,eventId,choice,expectedRevision:worldRevision});},
  verifyExit({outcome}){const r=getState().battle;if(!scope()||outcome==='HUIR'&&r.status!=='FLED'||outcome==='DERROTA'&&r.status!=='DEFEATED')fail('NATIVE_EXIT_REQUIRED');return issue('exit',{battleId:identity.battleId,outcome});}
 };
 const gateway={UIReadOnlySnapshot(){const r=getState().battle,l=r.lifecycle;return {battleId:r.battleId,boss:{actorId:'grulla_blanca',phase:l.phase,hp:l.hp,pactReleased:l.pactReleased,terminal:l.terminal},revision:r.revision};},submitPlayerPhysicalHit(){fail('USE_NATIVE_SESSION_PHYSICAL_OWNER');}};
 const domain=createA09V32Postcombat({gateway,host,world,identity});
 const uiHost={
  registerDocument(doc){documents.add(doc);},
  physicalEvent(e){if(!documents.has(e.target?.ownerDocument)||!(e instanceof e.target.ownerDocument.defaultView.Event)||!e.isTrusted||e.eventPhase===0||!scope())return;const id=e.target.closest('button')?.id;if(!['btnLiberar','btnCustodiar','btnBack','btnConfirm'].includes(id))return;physicalSerial++;if(id==='btnBack'){choiceEvent=null;confirmEvent=null;}else if(id==='btnLiberar'||id==='btnCustodiar'){choiceEvent={serial:physicalSerial,choice:id==='btnLiberar'?'LIBERAR':'CUSTODIAR',generation:getState().playerGeneration};confirmEvent=null;}else if(choiceEvent){confirmEvent={serial:physicalSerial,choice:choiceEvent.choice,generation:getState().playerGeneration};}},
  beginCeremony(eventId){if(!scope()||getState().postcombat?.stage!=='CEDIDO')fail('EARLY_SCENE');return issue('animationRunning',{eventId,started:performance.now(),generation:getState().playerGeneration});},
  completeCeremony(token,visualReceipt){const c=caps.get(token);if(!scope()||!c||c.used||c.kind!=='animationRunning'||visualReceipt?.eventId!==c.data.eventId||performance.now()-c.data.started<3190||getState().postcombat?.stage!=='CEDIDO')fail('SCENE_NOT_COMPLETED');c.used=true;return issue('completedAnimation',{eventId:c.data.eventId});},
  attestCompletedB18Ceremony({eventId,visualReceipt}){const c=caps.get(visualReceipt);if(!c||c.kind!=='completedAnimation'||c.data.eventId!==eventId)fail('HOST_ANIMATION_ATTESTATION');return visualReceipt;},
  captureExplicitDecision({eventId,choice}){const row=getState().postcombat;if(!scope()||row?.stage!=='CHOICE_READY'||row.eventId!==eventId||!choiceEvent||!confirmEvent||choiceEvent.choice!==choice||confirmEvent.choice!==choice||confirmEvent.serial<=choiceEvent.serial||confirmEvent.generation!==getState().playerGeneration)fail('SEPARATE_TRUSTED_SELECTION_AND_CONFIRMATION');choiceEvent=null;confirmEvent=null;return issue('physicalConfirmation',{eventId,choice,worldRevision:row.revision});}
 };
 return Object.freeze({domain,uiHost});
}

export { connectNativeA09Postcombat, projectNativeM18Decision };
