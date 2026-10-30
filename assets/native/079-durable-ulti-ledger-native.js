(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_ULTI_LEDGER=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,freeze,fail}=S;
function create({source,combatId,ownerId,equipped,allowed,modeGate,resolveEvidence}){let pending=null,archiveAllowed=null,serial=0;
 const ledger=source.createSession({encounterId:'combat:'+combatId,equipped,allowed,modeGate,trust:{authorizeLive(e,r){return !!pending&&r.ticket===pending.ticket&&JSON.stringify(e)===pending.event;},verifyArchive(a){return archiveAllowed!==null&&JSON.stringify(a)===archiveAllowed;}}});
 function record(cap){if(pending)fail('A08_ULTI_LEDGER_REENTRY');const d=resolveEvidence(cap);if(!d||d.combatId!==combatId||d.ownerId!==ownerId||d.nativePhysical!==true)fail('A08_PRIVATE_ULTI_EVIDENCE_REQUIRED');
  pending={event:JSON.stringify(copy(d.event)),ticket:'private:'+String(++serial)};try{return freeze(ledger.ingest(copy(d.event),{ticket:pending.ticket}));}finally{pending=null;}}
 return Object.freeze({serializeCombat(){if(pending)fail('COMBAT_LEDGER_PENDING');return freeze({version:1,owner:'ulti-ledger-native',state:{snapshot:copy(ledger.exportSnapshot()),serial},seen:[]});},restoreCombat(raw){globalThis.LGB_ORDINARY_CODEC.validateOwner(raw,'ulti-ledger-native');archiveAllowed=JSON.stringify(raw.state.snapshot);try{ledger.replay(copy(raw.state.snapshot));serial=raw.state.serial;}finally{archiveAllowed=null;}},record,inspect:()=>freeze(copy(ledger.summary())),checkpoint(){const snapshot=ledger.exportSnapshot(),before=serial;return()=>{archiveAllowed=JSON.stringify(snapshot);try{ledger.replay(snapshot);serial=before;}finally{archiveAllowed=null;}};}});
}
return Object.freeze({create});
});
