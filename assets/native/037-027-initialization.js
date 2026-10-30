(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_MONSTER_PROFILES=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';
function resolve(data,{id,encounterId=null}){
 if(encounterId!==null){const scoped=data.encounterProfiles?.[encounterId];if(encounterId!=='rata_despensa'||id!=='rata_qi'||scoped?.profile?.id!==id||scoped.scope!=='M02_TUTORIAL_ONLY_COMPLETE_PROFILE_NO_NORMAL_SPECIES_OVERRIDE')S.fail('A08_ENCOUNTER_PROFILE_SCOPE');return scoped.profile;}
 const profile=data.monsters[id];if(!profile)S.fail('BLOCKED_SOURCE_MONSTER:'+id);return profile;
}
function source(data,{id,encounterId=null}){resolve(data,{id,encounterId});return encounterId?data.encounterProfiles[encounterId].source.profileHashes[id]:(data.monsterSources?.[id]||data.source.monsters);}
return Object.freeze({resolve,source});
});
