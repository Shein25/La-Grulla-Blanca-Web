function connectCampaignFauna(){
 globalThis.LGB_FAUNA_NAMED=LGB_INTEGRATION_DATA.named;
 const D=ASTRA_A08_DATA,registry=D.ecologyR58.registry,added=[];
 const protectedRoom=id=>Object.hasOwn(ASTRA_A08_TERRITORIAL.bosses,id);
 const normal=id=>D.monsters[id]&&!D.monsters[id].unique&&!D.monsters[id].requiresSpecialStateMachine;
 // The prevailing global T0/mobile act authorizes the whole assigned area.
 // The six safeRooms entries belong to the superseded census, not an exclusion.
 const territory=(origin,id)=>Object.keys(ROOMS).filter(room=>ROOMS[room].area===ROOMS[origin].area);
 function bind(id,mobId,origin,sourceBinding=null){if(!registry.species[mobId])return;
  const key='roamer:'+id,old=sourceBinding&&registry.bindings[sourceBinding];if(registry.bindings[key])return;
  let habitat=old?.assignments.find(a=>a.revision===old.currentRevision)?.ecologyHabitatId;
  if(!habitat){habitat='HABITAT_CAMPAIGN_'+ROOMS[origin].area;
   registry.habitats[habitat]??={ecologyHabitatId:habitat,territoryId:habitat,version:1,initialReferenceAreaId:ROOMS[origin].area,authorizedRooms:territory(origin,mobId)};}
  registry.bindings[key]={speciesId:mobId,currentRevision:1,assignments:[{revision:1,ecologyHabitatId:habitat,authority:'DIRECT_OWNER_MOBILE_T0_AND_RESERVE_WOLVES_2026_10_26',source:'NATIVE_AREA_POPULATION_BINDING'}],sourceRoom:origin};
 }
 function add(id,mobId,origin,sourceBinding){if(!normal(mobId)||ERRANTES_INICIALES.some(e=>e.id===id))return;
  MOBS[mobId]??={name:D.monsters[mobId].name,corto:mobId.split('_')[0],hp:D.monsters[mobId].stats.hp,unico:false};
  const e={id,mobId,origen:origin,sala:origin,territorio:territory(origin,mobId),muertoHasta:0,desde:null,movidoEn:0,area_id:ROOMS[origin].area,legal_stage:D.monsters[mobId].native_stage};
  if(!e.territorio.includes(origin))throw Error('CAMPAIGN_NATIVE_HABITAT_ORIGIN:'+id);
  A08_TERRITORIAL_DATA.active.push(e);ERRANTES_INICIALES.push(structuredClone(e));added.push(e);bind(id,mobId,origin,sourceBinding);
 }
 // Existing six source-authorized rat slots were formerly applied after bootstrap.
 for(const room of ['granero_valle','campo_poniente','sauces_granero','sauces_campos','bosque_linde_jardines','bosque_claro_raices'])if(!ROOMS[room].mobs.includes('rata_qi'))ROOMS[room].mobs.push('rata_qi');
 // Keep existing abundance and identities. Only their mobility representation changes.
 for(const [room,r]of Object.entries(ROOMS)){
  const retained=[],ordinal={};for(const id of r.mobs||[]){ordinal[id]=(ordinal[id]||0)+1;if(!normal(id)){retained.push(id);continue;}
   add('mobile_'+room+'_'+id+'_'+ordinal[id],id,room,'fixed:'+room+':'+id);}
  r.mobs=retained;
 }
 // The former fixed/roamer proposal is now a single native mobile roster.
 for(const e of CAMPAIGN_FAUNA.reserve.entities)add(e.id,e.speciesId,e.roomId||e.origin);
 for(const row of CAMPAIGN_FAUNA.expansion){const origin=row.room_id||row.roomId||row.room;
  const id=row.species_id||row.monster_id||row.mob_id||row.species||row.mob;if(!origin||!ROOMS[origin]||!id)continue;
  for(let n=0;n<(row.count||row.quantity||1);n++)add('mobile_'+origin+'_'+id+'_'+(n+1),id,origin);
 }
 // Existing mobile definitions stay mobile, including their approved territories.
 for(const e of ERRANTES_INICIALES)if(normal(e.mobId)){e.territorio=territory(e.origen,e.mobId);const d=A08_TERRITORIAL_DATA.active.find(d=>d.id===e.id);if(d)d.territorio=[...e.territorio];bind(e.id,e.mobId,e.origen);}
 D.ecologyR58.sourceHash=CAMPAIGN_FAUNA.authoritySHA256;registry.authoritySHA256=CAMPAIGN_FAUNA.authoritySHA256;
 globalThis.LGB_FAUNA_NATIVE_INFO=Object.freeze({mobileAdded:added.length,reserve:added.filter(e=>ROOMS[e.origen].area==='reserva_aprendices_li').length,wolves:added.filter(e=>ROOMS[e.origen].area==='reserva_aprendices_li'&&e.mobId==='lobo_espiritual').length,initialEcologicalPressure:0,forcedTiers:false});
}

connectCampaignFauna();
function connectB1YaoBuybackCatalog(D,items){
 const id='grasa_qi_roida',npc='yao_fen',source='OWNER_EXPLICIT_YAO_BUYBACK_20261027';
 if(D.commerce.merchants[npc]?.status!=='RATIFIED'||!D.commerce.merchants[npc].capabilities.includes('BUY')||!items[id]?.name)throw Error('B1_YAO_EXISTING_AUTHORITY_REQUIRED');
 const item={...items[id],stage:'LianQi_I',source_monster_id:'rata_qi',channel:'EXTRACTION',stackable:true,source};
 const offer={kind:'BULK_ONLY',units:4,stones:1,minimumStage:'LianQi_I',requires:'NPC_BUY_EXPLICIT_AND_COPRESENT',buyer_candidates:[npc],status:'OWNER_EXPLICITLY_RATIFIED',authority:source};
 D.items[id]=item;D.buyback[id]={...offer};D.commerce.materials[id]={id,name:item.name,source_monster_id:'rata_qi',stage:'LianQi_I',acquisition:'EXTRACTION',native_item:{...items[id]},specialist_buyback:{...offer},source};
 D.commerce.buyers[id]={[npc]:{...offer}};
}

connectB1YaoBuybackCatalog(ASTRA_A08_DATA,ITEMS);
