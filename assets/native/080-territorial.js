(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ASTRA_A08_TERRITORIAL=factory();})(globalThis,function(){
'use strict';
const bosses=Object.freeze({bosque_corredor_viento:'mantis_nube',bosque_rocas_blancas:'custodio_eco_petreo',camara_caldera:'sapo_caldera',nido_escarabajos:'rey_escarabajo',aguas_rama_oscura:'guardian_coral',aguas_cuenca_reunion:'sombra_ahogada'});
const expansion=Object.freeze({lobo_madriguera:[['bosque_ladera_alta','mantis_nube'],['bosque_mirador_alto','mantis_nube'],['bosque_rocas_blancas','custodio_eco_petreo']]});
const copy=x=>JSON.parse(JSON.stringify(x)),bad=code=>{throw Error(code);};
function create({rooms,initials,config,readOwner,gateOpen}){
 const originals=copy(initials),definitions=copy([...initials,...config.active]),byId=new Map(definitions.map(e=>[e.id,e]));
 if(byId.size!==definitions.length||originals.length!==11)bad('R46_CATALOG_IDENTITY');
 for(const e of definitions){const area=rooms[e.origen]?.area;if(!area||!e.territorio.includes(e.origen)||e.area_id&&e.area_id!==area||e.territorio.some(id=>rooms[id]?.area!==area))bad('R46_CATALOG_AREA');}
 const stage=g=>Number(readOwner(g)?.stage)||0;
 function deathSet(lives){return new Set((lives||[]).filter(l=>l.terminal===true&&l.hp===0&&l.disposition==='APPLIED').map(l=>l.id));}
 const legacySafe=new Set(['l1_reserva_01','l1_reserva_03','l1_reserva_08','l1_reserva_14','l1_reserva_20','l1_reserva_25']);
 function sameTerritory(e,base){return JSON.stringify(e.territorio)===JSON.stringify(base.territorio)||rooms[base.origen]?.area==='reserva_aprendices_li'&&JSON.stringify(e.territorio)===JSON.stringify(base.territorio.filter(id=>!legacySafe.has(id)));}
 function effective(e,dead){const base=byId.get(e?.id);if(!base||e.mobId!==base.mobId||e.origen!==base.origen||!sameTerritory(e,base))return [];
  const area=rooms[base.origen].area,out=base.territorio.filter(id=>rooms[id]?.area===area);
  for(const id of config.safeTerritoryAdditions?.[base.id]||[])if(rooms[id]?.area===area&&!bosses[id])out.push(id);
  for(const[id,boss]of expansion[base.id]||[])if(rooms[id]?.area===area&&dead.has(boss)&&(id!=='bosque_rocas_blancas'||dead.has('mantis_nube')))out.push(id);
  return [...new Set(out)];
 }
 function territory(e,g){return effective(e,deathSet(readOwner(g)?.lives));}
 function mayManifest(g,id,room){const rank=stage(g),area=rooms[room]?.area,qa=readOwner(g)?.experimentalStoryPermissions||[];
  if(!area||rank<(config.stages[id]||99))return false;
  if(area==='alturas'&&rank<4||area==='cantera_vetas'&&rank<2||area==='aguas_barrancos'&&rank<3)return false;
  if(area==='mantenimiento'&&(rank<4||g.gates?.PASO_MANTENIMIENTO!==true&&!qa.includes('M13')))return false;
  if(area==='nucleo'&&(rank<4||g.gates?.PASO_NUCLEO!==true&&!qa.includes('M17')))return false;
  if(room==='nucleo_santuario'||room==='santuario_grulla')return false;
  return true;
 }
 function local(e,g){return rooms[e?.origen]?.area===rooms[e?.sala]?.area&&territory(e,g).includes(e.sala);}
 function step(e,g,to){const area=rooms[e?.origen]?.area;return !g.combate&&local(e,g)&&e.muertoHasta===0&&area&&rooms[g.pos]?.area===area&&rooms[to]?.area===area&&territory(e,g).includes(to)&&(Object.values(rooms[e.sala]?.exits||{}).includes(to)||globalThis.LGB_FAUNA_NAMED?.[e.sala]?.includes(to))&&mayManifest(g,e.mobId,to)&&gateOpen(g,e.sala,to);}
 const fourthWolfId='li_reserva_mobile_lobo_espiritual_04';
 function legacyThreeWolfCatalog(data){return data.a08TerritoryVersion===7&&config.worldVersion===7&&byId.get(fourthWolfId)?.mobId==='lobo_espiritual'&&Array.isArray(data.errantes)&&data.errantes.length===definitions.length-1&&!data.errantes.some(e=>e.id===fourthWolfId);}
 function validateWorld(data){const records=data.errantes;if(!Array.isArray(records))return false;const version=data.a08TerritoryVersion;
  const expected=version===undefined?originals:version===1?[...originals,...config.active.filter(e=>!config.previousActiveIds||config.previousActiveIds.includes(e.id))]:version===2&&config.worldVersion===2?definitions:version===2&&[3,4,7].includes(config.worldVersion)?[...originals,...config.active.filter(e=>config.r52PreviousActiveIds.includes(e.id))]:version===3&&config.worldVersion===3?definitions:version===3&&[4,7].includes(config.worldVersion)?[...originals,...config.active.filter(e=>config.r56ActiveIds.includes(e.id))]:version===4&&config.worldVersion===4?definitions:version===4&&config.worldVersion===7?[...originals,...config.active.filter(e=>config.r4PreviousActiveIds.includes(e.id))]:version===7&&config.worldVersion===7?(legacyThreeWolfCatalog(data)?definitions.filter(e=>e.id!==fourthWolfId):definitions):null;if(!expected||records.length!==expected.length||new Set(records.map(e=>e.id)).size!==records.length)return false;
  const dead=new Set(Object.values(bosses).filter(id=>data.flags?.['muerto_'+id]===true));
  return records.every(e=>{const base=expected.find(b=>b.id===e.id);if(!base||e.mobId!==base.mobId||e.origen!==base.origen||!sameTerritory(e,base)||rooms[e.sala]?.area!==rooms[base.origen]?.area||e.area_id!==undefined&&e.area_id!==rooms[base.origen]?.area||!Number.isSafeInteger(e.muertoHasta)||e.muertoHasta<0)return false;
   const allowed=effective(base,dead);return (allowed.includes(e.sala)||version===undefined&&e.sala===base.sala)&&(!e.desde||allowed.includes(e.desde)||version===undefined&&base.territorio.includes(e.desde));});
 }
 function validateGraph(player,world){if(!validateWorld(world))bad('R46_SAVE_TERRITORY_SCHEMA');if(legacyThreeWolfCatalog(world)&&player.lives.some(l=>l.key===fourthWolfId))bad('R46_LEGACY_WOLF_LIFE_WITHOUT_POPULATION');const dead=deathSet(player.lives);
  for(const id of Object.values(bosses))if((world.flags?.['muerto_'+id]===true)!==dead.has(id))bad('R46_SAVE_GUARDIAN_DEATH_PROVENANCE');
  for(const e of world.errantes){const allowed=effective(e,dead);if(!allowed.includes(e.sala)&&!(world.a08TerritoryVersion===undefined&&e.sala===byId.get(e.id)?.sala))bad('R46_SAVE_TERRITORY_PRIVATE_CONFLICT');
   const life=player.lives.find(l=>l.key===e.id);const r=life?.r64bFailures?.retired?globalThis.ASTRA_R64B_RETREAT.view(player.mutantFailures||[])[life.lifeId]:null,retired=!!(r?.retired&&r.count===3&&r.respawnAt===life.r64bFailures.respawnAt&&JSON.stringify(r.combatIds)===JSON.stringify(life.r64bFailures.combatIds)&&e.muertoHasta===r.respawnAt);
   if(life&&(life.id!==e.mobId||life.terminal&&e.muertoHasta<life.respawnAt&&!(e.muertoHasta===0&&world.relojEcologico>=life.respawnAt)||!life.terminal&&e.muertoHasta>0&&!retired))bad('R46_SAVE_ERRANT_LIFE_CONFLICT');}
  return true;
 }
 function migrate(records){const next=copy(records);for(const e of next){const base=byId.get(e.id);if(base&&sameTerritory(e,base))e.territorio=copy(base.territorio);}for(const base of definitions)if(!next.some(e=>e.id===base.id))next.push(copy(base));return next;}
 return Object.freeze({definitions:copy(definitions),originals:copy(originals),bosses,stage,territory,effective,local,step,mayManifest,validateWorld,validateGraph,migrate,deathSet});
}
return Object.freeze({create,bosses});
});
