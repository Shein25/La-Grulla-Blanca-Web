(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_R64B_STRUCTURAL=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const{copy,freeze,fail}=S;
// Explicit content mapping authorized by OWNER_ORDER_R64B; never inferred from names/mechanical_hooks.
const MAP=freeze({palma_ardiente:{hook:'CONTAINED_TRIGGER',operation:'MAGMA',origin:'TIERRA',role:'OFFENSIVE'},armadura_plata:{hook:'FORTIFICATION',operation:'PLACA',origin:'TIERRA',role:'DEFENSIVE'},espejo_luna:{hook:'ABSORPTION_RESTORE',operation:'EMBALSE',origin:'TIERRA',role:'DEFENSIVE'},tijera_t1_int:{hook:'PRECISION_DEBUFF',operation:'NUBE',origin:'TIERRA',role:'OFFENSIVE',contentHook:'PRECISION_DEBUFF'}});
function resolve({action,selection,actor,targets,round,actorId}){const id=action.receiver.techniqueId,entry=MAP[id]||(id==='tijera_vendaval'&&action.receiver.nodeIds.includes('tijera_t1_int')?MAP.tijera_t1_int:null),x=action.compiled;if(!entry||selection.origin!==entry.origin||selection.role!==entry.role||selection.hook!==entry.hook)return null;
 const validTargets=targets.filter(t=>t.hit&&!t.life.terminal&&t.life.hp>0),proof={actionId:action.actionId,actorId,round,operation:entry.operation};
 if(entry.operation==='MAGMA'&&(x.dot||!validTargets.some(t=>t.result.actualHPDamage>0)))return null;
 if(entry.operation==='PLACA'&&(actor.defensive?.kind!=='METAL_PLATES'||actor.defensive.plates<1||actor.defensive.r64bPlate))return null;
 if(entry.operation==='EMBALSE'&&(actor.defensive?.kind!=='WATER_MIRROR'||actor.absorptionMax<=0||actor.defensive.r64bEmbalse))return null;
 if(entry.operation==='NUBE'&&(x.debuff?.stat!=='precision'||!validTargets.length||!action.receiver.concordance_hooks.includes('PRECISION_DEBUFF')))return null;
 let used=false;return {authority:'V290_VERIFIED_NATIVE_STRUCTURAL_OPERATION',numericConcordanceBonus:false,commit(){if(used)fail('R64B_STRUCTURE_REPLAY');used=true;
 if(entry.operation==='MAGMA')for(const t of validTargets.filter(t=>t.result.actualHPDamage>0))t.life.r64bMagma={...proof,expires:round+2,snapshot:t.result.actualHPDamage};
 if(entry.operation==='PLACA')actor.defensive.r64bPlate={...proof,hits:0};
 if(entry.operation==='EMBALSE')actor.defensive.r64bEmbalse={...proof,reserve:0,max:actor.absorptionMax*.25};
 if(entry.operation==='NUBE')for(const t of validTargets){t.life.r64bCloud={...proof,expires:round+2};t.life.effects=(t.life.effects||[]).filter(e=>e.tag!=='R64B_NUBE');t.life.effects.push({stat:'precision',amount:-5,turns:999,tag:'R64B_NUBE'});}
 return freeze({resolved:true,realPhysicalDelta:true,delta:{kind:'OWNED_STRUCTURAL_TRANSFORMATION',...proof,targets:validTargets.map(t=>t.life.lifeId)}});}};
}
function expire(life,round){if(life.r64bMagma?.expires<=round)delete life.r64bMagma;if(life.r64bCloud?.expires<=round){delete life.r64bCloud;life.effects=(life.effects||[]).filter(e=>e.tag!=='R64B_NUBE');}}
function detonate(life,{actorId,actionId,round,element,hit,resolve}){expire(life,round);const m=life.r64bMagma;if(!m||m.actorId!==actorId||m.actionId===actionId||element!=='FUEGO'||!hit||life.terminal)return null;const result=resolve(m.snapshot*.25);delete life.r64bMagma;return freeze({creatorActionId:m.actionId,snapshot:m.snapshot,ratio:.25,propagation:0,critical:false,result});}
function clear(life){delete life.r64bMagma;delete life.r64bCloud;life.effects=(life.effects||[]).filter(e=>e.tag!=='R64B_NUBE');}
return Object.freeze({MAP,resolve,expire,detonate,clear});});
