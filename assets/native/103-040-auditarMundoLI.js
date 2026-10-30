function auditarMundoLI(){
 const base=auditarMundo329(LGB_ORIGINAL_TOPOLOGY),errors=[...base.errores];
 const ids=Object.keys(ROOMS),areas=new Set(ids.map(id=>ROOMS[id].area));
 const edges=ids.reduce((n,id)=>n+Object.keys(ROOMS[id].exits||{}).length,0);
 if(ids.length!==359||areas.size!==18||edges!==871)errors.push('LI_WORLD_COUNTS');
 const seen=recorrerMundo329();if(seen.size!==359)errors.push('LI_WORLD_REACHABILITY');
 for(const [id,r]of Object.entries(ROOMS))for(const [direction,to]of Object.entries(r.exits||{})){
  if(esSalidaRegional(id,direction,to))continue;
  if(!ROOMS[to]||ROOMS[to].exits?.[DIRECCION_OPUESTA[direction]]!==id)errors.push('LI_RECIPROCITY:'+id);
 }
 for(const id of Object.keys(LGB_ORIGINAL_TOPOLOGY)){
  const exits={...ROOMS[id].exits};if(id==='canal_principal')delete exits.sur;
  if(JSON.stringify(exits)!==JSON.stringify(LGB_ORIGINAL_TOPOLOGY[id].exits))errors.push('LI_ORIGINAL_EXIT_CHANGED:'+id);
 }
 return {ok:!errors.length,errores:errors,rooms:ids.length,areas:areas.size,exits:edges};
}
function auditarCartografiaLI(){
 const original=auditarCartografia329({rooms:LGB_ORIGINAL_TOPOLOGY,...LGB_ORIGINAL_MAPS}),fallos=[...original.fallos];
 for(const [id,r]of Object.entries(ROOMS).filter(([id])=>id.startsWith('l1_reserva_'))){
  if(!MAPA_POS[id]||MAPA_CAPA_SALA[id]!=='principal'||MAPA_ETIQ[id]!==id.slice(-2))fallos.push('LI_MAP_ROOM:'+id);
  for(const [d,to]of Object.entries(r.exits)){
   if(!to.startsWith('l1_reserva_'))continue;
   const a=MAPA_POS[id],b=MAPA_POS[to];
   if(d==='norte'&&!(a[0]===b[0]&&a[1]>b[1])||d==='sur'&&!(a[0]===b[0]&&a[1]<b[1])||d==='este'&&!(a[1]===b[1]&&a[0]<b[0])||d==='oeste'&&!(a[1]===b[1]&&a[0]>b[0]))fallos.push('LI_MAP_DIRECTION:'+id+':'+d);
  }
 }
 return {ok:!fallos.length,fallos};
}
