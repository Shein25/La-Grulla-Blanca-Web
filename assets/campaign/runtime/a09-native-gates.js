// Native host gates only. No boss statistics, synthetic receipts or grant API.
// Selection d2161b13 is closed; all 33 numeric values have explicit source authority. WORLD still requires complete native certification.
const A09_SOURCE_COMMIT='1e342a68f26ff707a5d18316ec146aa886ed78e7';
const A09_DEPENDENCIES=Object.freeze([
 Object.freeze({id:'A09_APPROVED_PHASE_PROFILES',source:'A09_V34_PHASE_AUTHORITY.mjs',detail:'Los 33 valores están documentados; deben superar la verificación privada V34.'}),
 Object.freeze({id:'A09_APPROVED_EFFECTS_AND_AI',source:'README_A09_V36.md',detail:'Homologación nativa de los siete ataques y ocho efectos seleccionados; IA histórica preparada.'}),
 Object.freeze({id:'A09_NATIVE_ACTOR_AND_JOURNAL',source:'CONTRATO_HOST_A08_WORLD_V32.md',detail:'Actor real y terminal F3 con Pacto liberado, verificados en el journal nativo.'}),
 Object.freeze({id:'A09_ATOMIC_EFFECT_HOST',source:'A09_V36_G08_PERSISTENCE_GATE.mjs',detail:'Host de efectos/lifecycle atómicos, dominio A09Boss y recuperación G08.'})
]);
function a09Requirements({stage,room,quests,revelations}){
 const missing=[];
 if(stage!=='LianQi_IV')missing.push('LianQi IV');
 if(room!=='nucleo_santuario_vinculo')missing.push('Santuario del Vínculo');
 if(quests.M17!=='hecha')missing.push('M19 completada');
 if(revelations?.R7!=='CONFIRMADO'||revelations?.R10!=='CONFIRMADO')missing.push('Revelaciones R7 y R10 confirmadas');
 // Numeric authority alone does not authorize WORLD activation.
 const blocked=A09_DEPENDENCIES;
 return {ok:missing.length===0&&blocked.length===0,missionId:'M18',visibleId:'M21',sourceCommit:A09_SOURCE_COMMIT,missing,dependencies:blocked.map(d=>({...d}))};
}
function zhujiRequirements({stage,credit,qi,quests,player,decision,eligibleComprehension=null,genuinePill=false}){
 const missing=[];
 if(stage!=='LianQi_IV')missing.push('LianQi IV');
 if(credit!==30)missing.push('Cultivo especial 30/30');
 if(qi!==55)missing.push('Qi físico 55/55');
 if(quests.M18!=='hecha'||!['LIBERAR','CUSTODIAR'].includes(decision))missing.push('M21 y decisión del vínculo auténticas');
 if(!player.granPerfeccionLianQi)missing.push('Gran Perfección');
 if(!player.iluminacion?.alcanzada)missing.push('Iluminación');
 if(!player.iluminacion?.semillaCorazonDao)missing.push('Semilla del Dao');
 if(!player.tribulacionCorazon?.superada)missing.push('Tribulación superada');
 if(!(Number.isFinite(eligibleComprehension)&&eligibleComprehension>=10)&&!genuinePill)missing.push('Comprensión elegible ≥10 o Píldora de Fundación auténtica');
 if((player.heridas_meridianos||0)>=3)missing.push('Menos de tres heridas de meridianos');
 return {ok:false,requirementsMet:missing.length===0,index:3,fromStage:'LianQi_IV',toStage:'ZhuJi',blockedBy:quests.M18==='hecha'?'ZHUJI_NATIVE_COMMIT_REQUIRED':'A09_NATIVE_TERMINAL_REQUIRED',missing};
}

export { A09_DEPENDENCIES, A09_SOURCE_COMMIT, a09Requirements, zhujiRequirements };
