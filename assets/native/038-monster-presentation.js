(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'),require('./monster-profiles.js'));else root.ASTRA_A08_MONSTER_PRESENTATION=factory(root.ASTRA_A08_SHARED,root.ASTRA_A08_MONSTER_PROFILES);})(globalThis,function(S,P){
'use strict';const fields=['hp','precision','evasion','defense','tenacity','control','crit_chance','crit_damage'];
function profile(D,id,encounterId=null){let p;try{p=P.resolve(D,{id,encounterId});}catch{return null;}if(p.engine_contract!=='NEW_COMBAT_STATS_V0_1'||p.stats_status!=='READY'||fields.some(k=>typeof p.stats[k]!=='number'||!Number.isFinite(p.stats[k]))||typeof p.stats.basic_damage!=='string'||p.technique&&p.technique.params_status!=='READY')return null;return p;}
// R14: only A08's private owner can attest which individual's stats are displayed.
const observers=new Set();
function connectOwner(readOnlyObserver){
 if(typeof readOnlyObserver!=='function')throw new TypeError('R14_OWNER_OBSERVER_REQUIRED');
 observers.add(readOnlyObserver);
}
function techniqueFromProfile(p){
 if(!p)return null;
 if(p.special==='CUSTODIO_V120')return 'Custodio · acciones anunciadas en combate.';
 if(!p.technique)return 'Ataque básico.';
 const t=p.technique,q=t.params;
 if(!q||!Array.isArray(t.mechanics))return null;
 const parts=[`${t.name} · cada ${q.cadence} rondas`];
 for(const m of t.mechanics){
  if(m==='DIRECT_DAMAGE')parts.push('Daño '+q.direct_damage);
  if(m==='QI_DRAIN')parts.push('Drena hasta '+q.qi_drain+' Qi');
  if(m==='POISON_DOT')parts.push('Veneno '+q.poison.damage+' durante '+q.poison.ticks+' inicios de turno');
  if(m==='BURN_DOT')parts.push('Quemadura '+q.burn.damage+' durante '+q.burn.ticks+' inicios de turno');
 }
 return parts.join(' · ');
}
function technique(D,id,encounterId=null){return techniqueFromProfile(profile(D,id,encounterId));}
function rows(p){const s=p.stats;return [
 ['PRECISIÓN',String(s.precision)],['EVASIÓN',String(s.evasion)],
 ['DEF',String(s.defense)],['TENACIDAD',String(s.tenacity)],
 ['CONTROL',String(s.control)],['CRÍTICO',s.crit_chance+'%'],
 ['MULTIPLICADOR CRÍTICO','×'+s.crit_damage],['DAÑO BÁSICO',s.basic_damage],
 ['TÉCNICA',techniqueFromProfile(p)]
];}
function unavailable(){return S.freeze({
 ready:false,currentHP:null,maxHP:null,
 rows:[['DISPONIBILIDAD','No se pudo verificar la identidad de este individuo.']],
 technique:null
});}
function live(D,mob){
 // Species statistics may only feed the Atlas, NEVER a failed individual lookup.
 if(!mob||typeof mob!=='object')return unavailable();
 const encounterId=mob.errante_id==='rata_despensa'?'rata_despensa':null;
 const canonical=profile(D,mob.mob_id,encounterId);
 if(!canonical)return unavailable();
 for(const observe of observers){
  let view;
  try{view=observe(mob);}catch(_){continue;}
  if(!view||view.mobId!==mob.mob_id||view.encounterId!==encounterId)continue;
  const p=view.profile;
  if(!p||p.id!==mob.mob_id||p.engine_contract!=='NEW_COMBAT_STATS_V0_1'||
     p.stats_status!=='READY'||fields.some(k=>typeof p.stats?.[k]!=='number'||!Number.isFinite(p.stats[k]))||
     typeof p.stats.basic_damage!=='string'||p.technique&&p.technique.params_status!=='READY'||
     !Number.isFinite(view.hp)||view.hp<0||view.hp>p.stats.hp||
     !Number.isFinite(view.maxHP)||view.maxHP!==p.stats.hp)continue;
  const actualTechnique=techniqueFromProfile(p);
  if(actualTechnique===null)continue;
  return S.freeze({
   ready:true,currentHP:view.hp,maxHP:view.maxHP,rows:rows(p),
   technique:actualTechnique,
   scope:encounterId?'M02_TUTORIAL':'NORMAL_OR_CANONICAL_UNIQUE'
  });
 }
 return unavailable();
}
function referenceLine(D,id){const p=profile(D,id);if(!p)return 'Información de combate no disponible.';const s=p.stats;return `Perfil ${id==='rata_qi'?'de población normal':'de combate'} · Vida máxima ${s.hp} · Precisión ${s.precision} · Evasión ${s.evasion} · DEF ${s.defense} · Tenacidad ${s.tenacity} · Control ${s.control} · Crítico ${s.crit_chance}% ×${s.crit_damage} · Daño básico ${s.basic_damage}`;}
return S.freeze({live,referenceLine,technique,connectOwner});
});
