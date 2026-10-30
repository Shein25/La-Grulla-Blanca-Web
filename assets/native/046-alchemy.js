(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_ALCHEMY=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,freeze,fail}=S;
const stages=['LianQi_I','LianQi_II','LianQi_III','LianQi_IV'],qualities=['impura','estable','superior','excepcional'];
// These are numerical formulations, not learned recipes, inventory IDs or grants.
function formulation(D,{family,stage=null,quality=null}){
 if(family==='HP'&&D.hpMedicine?.status!=='READY_HUMAN_RATIFIED'||family==='QI'&&D.qiMedicine?.decision!=='HUMAN_RATIFIED')fail('A08_ALCHEMY_NUMERIC_AUTHORITY');
 if(family==='HP'&&stage===null&&quality===null)return freeze({family,stage,quality,...copy(D.hpMedicine.common_potion),source:'ALCHEMY_VITALITY_HP_CONTRACT_V0_1',cultivationCredit:0});
 if(!stages.includes(stage)||!qualities.includes(quality))fail('A08_ALCHEMY_FORMULATION_IDENTITY');
 if(family==='HP')return freeze({family,stage,quality,...copy(D.hpMedicine.formulations[stage].qualities[quality]),source:'ALCHEMY_VITALITY_HP_CONTRACT_V0_1',cultivationCredit:0});
 if(family==='QI')return freeze({family,stage,quality,amount:D.qiMedicine.stage_quality_values[stage][quality],source:'GRULLA_V282_QI_16_HUMAN_RATIFICATION_V1',cultivationCredit:0});
 fail('A08_ALCHEMY_FAMILY');
}
function resolve(D,key,{current,maximum,random}){
 if(!Number.isFinite(current)||!Number.isFinite(maximum)||current<0||maximum<=0||current>maximum)fail('A08_ALCHEMY_RESOURCE_BOUNDS');
 const spec=formulation(D,key);let rolled=spec.amount;
 if(spec.family==='HP'){const m=/^(\d+)d(\d+)([+-]\d+)?$/.exec(spec.formula);if(!m||typeof random!=='function')fail('A08_ALCHEMY_ROLL_PORT');rolled=Number(m[3]||0);for(let i=0;i<Number(m[1]);i++){const r=random();if(!Number.isFinite(r)||r<0||r>=1)fail('A08_ALCHEMY_RANDOM_BOUND');rolled+=Math.floor(r*Number(m[2]))+1;}}
 const after=Math.min(maximum,current+rolled);return freeze({spec,rolled,before:current,after,actualRecovery:after-current,cultivationCredit:0,inventoryGrant:false});
}
function validateConsumption(D,r){
 const key=r.itemId==='pocion'?{family:'HP'}:r.craftActionId?r.craftBinding:D.medicineBindings?.[r.itemId];if(!key)fail('R50_MEDICINE_BINDING');const spec=formulation(D,key);let min=spec.amount,max=spec.amount;
 if(spec.family==='HP'){const m=/^(\d+)d(\d+)([+-]\d+)?$/.exec(spec.formula);if(!m)fail('R50_MEDICINE_FORMULA');min=Number(m[1])+Number(m[3]||0);max=Number(m[1])*Number(m[2])+Number(m[3]||0);}
 if(r.family!==spec.family||r.source!==spec.source||r.formula!==(spec.formula||null)||!Number.isSafeInteger(r.rolled)||r.rolled<min||r.rolled>max||!Number.isFinite(r.maximum)||r.maximum<=0||!Number.isFinite(r.before)||r.before<0||r.before>=r.maximum||r.after!==Math.min(r.maximum,r.before+r.rolled)||r.actualRecovery!==r.after-r.before||r.cultivationCredit!==0||typeof r.actionId!=='string'||!r.actionId.startsWith(r.generation+':medicine:'))fail('R50_MEDICINE_RECEIPT_SOURCE');return true;
}
function installNative(Juego,D){
 // V306 authorizes the newer HP/Qi math, not the old recipe/XP/grant chain.
 // Keep the existing profession surfaces and parser. Do not invent acquisition.
 const P=Juego.prototype,open=P.abrirInteraccionOficio;
 const unavailable='Aún no tienes una fórmula alquímica utilizable ni una enseñanza que autorice su elaboración.';
 P.abrirInteraccionOficio=function(type,...args){if(type==='alquimia'){this.salida(unavailable,'sistema');return false;}return open.call(this,type,...args);};
 for(const method of ['iniciarElaboracion','elegirPulsoAlquimia','resolverElaboracion'])P[method]=function(){return false;};
 const render=function(cont){cont.appendChild(this.elementoOficio('p',unavailable,'ofi-bloqueo'));};
 P.renderAlquimia=render;P.renderInteraccionAlquimia=render;
 P.descripcionEfectoAlquimia=function(itemId){if(itemId==='pocion')return 'Recupera '+formulation(D,{family:'HP'}).formula+' de vida, hasta el máximo actual.';return 'El efecto de este preparado requiere una formulación y procedencia autorizadas.';};
 return freeze({legacyCraftingRetired:true,formulaCounts:{HP:17,QI:16},craftingConnected:false,sourceGaps:['RECIPE_ACQUISITION','INGREDIENTS_AND_COSTS','QUALITY_EVIDENCE','ALCHEMY_XP_AND_STATION_AUTHORITY']});
}
function treatSpecial(c,player,recipe,resolveTypedCondition=()=>null){
 if(recipe==='purificacion'){const n=player.impurezas||0;if(!Number.isInteger(n)||n<=0)return freeze({applied:false});const removed=Math.min(3,n);player.impurezas=n-removed;return freeze({applied:true,family:'IMPURITY',removed});}
 if(recipe==='meridianos'){const n=player.heridas_meridianos||0;if(!Number.isInteger(n)||n<=0)return freeze({applied:false});player.heridas_meridianos=n-1;return freeze({applied:true,family:'MERIDIAN_INJURY',removed:1});}
 const spec={antidoto:{family:'POISON_DOT',treatmentFamily:'jade'},ceniza:{family:'BURN_DOT',treatmentFamily:'ceniza'}}[recipe];if(!spec)return freeze({applied:false});
 // Generic MONSTER_DOT has no grade/family authority: never guess from a name.
 const eligible=(c.dots||[]).filter(d=>{const proof=resolveTypedCondition(d);return proof?.applied===true&&proof.family===spec.family&&proof.treatmentFamily===spec.treatmentFamily&&Number.isInteger(proof.grade)&&proof.grade>=0&&proof.grade<=1;});if(!eligible.length)return freeze({applied:false,status:'NO_AUTHENTIC_TYPED_CONDITION'});c.dots=c.dots.filter(d=>!eligible.includes(d));return freeze({applied:true,family:spec.family,removed:eligible.length});
}
return Object.freeze({formulation,resolve,validateConsumption,installNative,treatSpecial});
});
