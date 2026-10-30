(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_GUARDIANS=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';
// Source descriptors and validation only. This module cannot issue a death,
// grant a manual, mutate Learning, or turn a public JSON object into authority.
function create(data){
 const rows=S.freeze(S.copy(data.guardians)),byId=new Map(rows.map(r=>[r.id,r]));
 if(rows.length!==5||byId.size!==5)S.fail('A08_GUARDIAN_SOURCE_COUNT');
 for(const r of rows)if(!data.skills[r.technique]||!data.monsters[r.id]?.unique||data.monsters[r.id].stats_status!=='READY')S.fail('A08_GUARDIAN_SOURCE_BINDING');
 function roomMobs(room,original,stage){if(!Array.isArray(original))S.fail('A08_GUARDIAN_ROOM_SOURCE');const out=original.filter(id=>!byId.has(id));if(['LianQi_III','LianQi_IV'].includes(stage))for(const r of rows)if(r.room===room)out.push(r.id);return out;}
 function eligible(id,room,stage){const r=byId.get(id);return !r||(['LianQi_III','LianQi_IV'].includes(stage)&&room===r.room);}
 function validateManual(m,life){const r=byId.get(m.sourceMonsterId);if(!r||!life||!life.terminal||life.hp!==0||life.id!==r.id||life.birthRoom!==r.room||m.sourceLifeId!==life.lifeId||m.instanceId!=='manual:'+life.lifeId||m.manualId!==r.manual||m.techniqueId!==r.technique||m.room!==r.room||typeof m.consumed!=='boolean')S.fail('A08_SAVE_MANUAL_GUARDIAN_AUTHORITY');
  if(r.id==='custodio_eco_petreo'&&(!life.boss?.unique_defeated||life.boss.manual_awards!==1))S.fail('A08_SAVE_MANUAL_CUSTODIO_AUTHORITY');return true;}
 return Object.freeze({rows,byId:id=>byId.get(id)||null,eligible,roomMobs,validateManual});
}
return Object.freeze({create});
});
