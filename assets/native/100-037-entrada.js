PRUEBAS.registrar("3C.1: Atlas cartografiado conserva listas y limita el mapa a la hoja", () => {
  const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro","sala_jade"]});j.atlasPestana="mapa";j.renderAtlas();
  afirmar(Object.keys(MAPA_POS).length===329,"Falta cartografía");
  afirmar(!document.getElementById("atlasLista").textContent.includes("Cartografía pendiente"),"Fallback obsoleto");
  afirmar(j.mapaSvg.querySelector('[data-room="registro"]')&&!j.mapaSvg.querySelector('[data-room="sala_jade"]'),"Filtró otra hoja");
  j.cambiarPestanaAtlas("lugares");afirmar(document.getElementById("atlasLista").textContent.includes(ROOMS.registro.name),"Faltan lugares conocidos");
});

const entrada = document.getElementById("entrada");
const PLACEHOLDER_BASE = "escribe un comando… (AYUDA)";
Object.assign(HALLAZGOS_CADAVER,ASTRA_A08_DATA.corpse);
for(const [id,item]of Object.entries(ASTRA_A08_DATA.items))ITEMS[id]=Object.freeze({name:item.name,tipo:item.tipo,desc:item.desc||item.descripcion||"",slot:item.slot||null});
const custodianIdentity=ASTRA_A08_DATA.custodian.identity;MOBS[custodianIdentity.id]={name:ASTRA_A08_DATA.monsters[custodianIdentity.id].name,corto:"custodio",hp:ASTRA_A08_DATA.custodian.numeric.HP_MAX,unico:true};if(!Array.isArray(ROOMS[custodianIdentity.room].mobs))ROOMS[custodianIdentity.room].mobs=[];if(!ROOMS[custodianIdentity.room].mobs.includes(custodianIdentity.id))ROOMS[custodianIdentity.room].mobs.push(custodianIdentity.id);
// Reubicación V302: Mantis es guardián AOE LIII, no mob repetible de Alturas LIV.
ROOMS.alturas_senda_mantis.mobs=ROOMS.alturas_senda_mantis.mobs.filter(id=>id!=="mantis_nube");
if (!ROOMS.bosque_corredor_viento.mobs.includes("mantis_nube")) ROOMS.bosque_corredor_viento.mobs.push("mantis_nube");
// Approved population descriptors; numeric resolution remains exclusively the unchanged V284 registry.
for(const e of A08_TERRITORIAL_DATA.active){const p=ASTRA_A08_DATA.monsters[e.mobId];if(!p||p.stats_status!=='READY'||p.unique)throw Error('R46_POPULATION_AUTHORITY');if(!MOBS[e.mobId])MOBS[e.mobId]={name:({"jabali_pizarra":"Jabalí de Pizarra","buho_niebla_gris":"Búho de la Niebla Gris","zorro_bancales":"Zorro de los Bancales","cangrejo_cauce":"Cangrejo del Cauce Pétreo","murcielago_resonante":"Murciélago Resonante","arana_veta_sombria":"Araña de la Veta Sombría"})[e.mobId]||p.name,corto:e.mobId.split('_')[0],hp:p.stats.hp,unico:false};ERRANTES_INICIALES.push(JSON.parse(JSON.stringify(e)));}
