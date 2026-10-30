const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/_/g,' ').split(/\s+/).filter(x=>x&&!['el','la','los','las','un','una','del','al','de'].includes(x)).join(' ');
const RANK={LianQi_I:1,LianQi_II:2,LianQi_III:3,LianQi_IV:4,ZhuJi:5};

// Reuse the native movement transaction for graph edges whose sources specify
// adjacency, but no cardinal direction. No invented north/south assignments.
function connectWorldExpansion({runtime:g,bridge,input,roomDefinitions:rooms,expansion}){
 if(!expansion)return Object.freeze({inspect:()=>({installed:false})});
 const data=structuredClone(expansion),newIII=new Set(data.stageIII),newIV=new Set(data.stageIV),cuts=new Set(data.cuts.map(p=>[...p].sort().join('|'))),discovery=new Set(data.discovery.map(p=>[...p].sort().join('|')));
 const named=structuredClone(data.named),rank=()=>RANK[bridge.read().state.stage]||0;
 function reason(from,to){const r=rank(),area=rooms[to]?.area,pair=[from,to].sort().join('|');
  if(discovery.has(pair))return 'Este atajo requiere un comprobante de descubrimiento todavía no conectado.';
  if((newIII.has(to)||cuts.has(pair))&&r<3)return 'Esta ruta requiere LianQi III; el corredor histórico de informe permanece separado.';
  if((newIV.has(to)||['alturas','jardines_firmamento_roto','mantenimiento','nucleo'].includes(area))&&r<4)return 'Esta ruta requiere LianQi IV.';
  if(area==='mantenimiento'&&g.gates.PASO_MANTENIMIENTO!==true)return 'Mantenimiento requiere la autorización de la misión histórica M13 (visible M15).';
  if(area==='nucleo'&&g.gates.PASO_NUCLEO!==true)return 'El Núcleo requiere las autorizaciones históricas M16 y M17 (visibles M18 y M19).';
  return null;
 }
 const oldGate=g.bloqueoPaso;g.bloqueoPaso=function(from,direction){const to=this.rooms?.[from]?.exits?.[direction];return oldGate.call(this,from,direction)||(to?reason(from,to):null);};
 const oldExecute=g.ejecutar;
 g.ejecutar=function(verb,args=[]){
  if(this===g&&!g.combate&&!g.pregunta&&!g.terminado){
   const to=rooms[g.pos]?.exits?.[verb],blocked=to&&reason(g.pos,to);if(blocked){g.salida(blocked,'sistema');return;}
   if(verb==='meditar'&&(newIII.has(g.pos)||newIV.has(g.pos))){g.salida('Este lugar todavía no tiene una vena de meditación verificada. No se concede Qi ni cultivo.','sistema');return;}
   if(verb==='ir'&&named[g.pos]){
    const query=normalize(args.join(' ')),matches=named[g.pos].filter(id=>normalize(id)===query||normalize(rooms[id].name)===query);
    if(matches.length!==1){g.salida('Rutas contiguas: '+named[g.pos].map(id=>'IR '+rooms[id].name).join(' · '));return;}
    const destination=matches[0],why=reason(g.pos,destination);if(why){g.salida(why,'sistema');return;}
    if(!input.current()){g.salida('La ruta requiere una orden nativa actual.','sistema');return;}
    const source=g.pos,definition=rooms[source],live=g.rooms[source],key='ruta';
    if(Object.hasOwn(definition.exits,key)||Object.hasOwn(live.exits,key))throw Error('EXPANSION_ROUTE_COLLISION');
    // Both views need the same edge while the native movement and visit owners
    // authenticate it. It is removed before the A07 turn boundary unwinds.
    definition.exits[key]=destination;live.exits[key]=destination;
    try{const nativeBlock=g.bloqueoPaso(source,key);if(nativeBlock){g.salida(nativeBlock,'sistema');return;}g.turnoGlobal++;return g.cmd_ir(key);}
    finally{delete definition.exits[key];delete live.exits[key];}
   }
   if(verb==='examinar'){
    const r=rooms[g.pos],focus=r?.expansionFocus;
    if(focus&&(!args.length||focus.aliases.some(a=>normalize(a)===normalize(args.join(' '))))){if(!args.length)g.mostrarSala();else g.salida(focus.description);return;}
    const plant=data.botany.find(n=>n.room_id===g.pos&&data.herbarium.species.some(s=>s.id===(n.species_id||n.plant_id)&&[s.id,s.name].some(label=>normalize(label)===normalize(args.join(' ')))));
    if(plant){const species=data.herbarium.species.find(s=>s.id===(plant.species_id||plant.plant_id));g.salida((plant.mirar||species.description)+'\nLa recolección de este nodo permanece pendiente de validación económica.');return;}
   }
  }
  return oldExecute.call(this,verb,args);
 };
 const oldShow=g.mostrarSala;g.mostrarSala=function(...args){const result=oldShow.apply(this,args);if(named[g.pos]?.length)g.salida('Rutas: '+named[g.pos].map(id=>'IR '+rooms[id].name).join(' · '),'sistema');const plants=data.botany.filter(n=>n.room_id===g.pos);if(plants.length)g.salida('Flora observable: '+plants.map(n=>data.herbarium.species.find(s=>s.id===(n.species_id||n.plant_id))?.name).filter(Boolean).join(', ')+'.','sistema');return result;};
 return Object.freeze({
  validate(d){const stage=RANK[d.Player.state.stage],id=d.World.pos;if(newIII.has(id)&&stage<3||newIV.has(id)&&stage<4)throw Error('EXPANSION_SAVE_STAGE');},
  inspect:()=>({installed:true,rooms:467,areas:22,newIII:62,newIV:46,namedGraphNavigation:true,faunaPlacementRecords:data.fauna.length,faunaNewSpawnsEnabled:!!globalThis.LGB_FAUNA_NATIVE_INFO,floraDormant:data.botany.length,floraHarvestEnabled:false,optionalPatrolsEnabled:false,ascensions:'APPROVED_ORIGINAL_NATIVE_PORTS',a09:'OPEN_NOT_NATIVE'})
 });
}

export { connectWorldExpansion };
