(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_EQUIPMENT_MEDITATION=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';
// Pure read-only projection. Only the World adapter supplies the actually worn
// instances from its private inventory owner. This function issues no authority.
function project(catalog,worn,sourceGitBlob){if(!Array.isArray(worn))S.fail('A08_MEDITATION_EQUIPMENT_CONTEXT');const sources=[],instances=new Set(),unique=new Set();let flat=0;
 for(const raw of worn){const item=S.copy(raw),d=catalog[item.itemId];if(!d||instances.has(item.instanceId)||typeof item.instanceId!=='string'||item.quantity!==1)S.fail('A08_MEDITATION_EQUIPMENT_INSTANCE');instances.add(item.instanceId);if(d.unique){if(unique.has(item.itemId))S.fail('A08_MEDITATION_UNIQUE_ITEM_DUPLICATE');unique.add(item.itemId);}
  const e=d.effect;if(e?.type!=='MEDITATION_BONUS')continue;if(typeof sourceGitBlob!=='string'||!sourceGitBlob||!Number.isSafeInteger(e.qi_flat)||e.qi_flat<0)S.fail('A08_MEDITATION_EQUIPMENT_NUMERIC_SOURCE');flat+=e.qi_flat;sources.push({itemId:item.itemId,instanceId:item.instanceId,qiFlat:e.qi_flat,sourceGitBlob,authority:'CANON_V201_V203_MEDITATION_BONUS'});
 }
 return S.freeze({flat,sources});
}
return Object.freeze({project});
});
