function auditarMundoCompleto(){
 const original=auditarMundo329(LGB_ORIGINAL_TOPOLOGY),errores=[...original.errores],ids=Object.keys(ROOMS),areaIds=new Set(ids.map(id=>ROOMS[id].area));
 if(ids.length!==467||areaIds.size!==22)errores.push('WORLD_467_22');
 const q=['patio_raices'],seen=new Set(q);for(const id of q)for(const to of [...Object.values(ROOMS[id].exits||{}),...(LGB_INTEGRATION_DATA.named[id]||[])])if(ROOMS[to]&&!seen.has(to)){seen.add(to);q.push(to);}
 if(seen.size!==467)errores.push('WORLD_REACHABILITY');
 for(const [from,tos]of Object.entries(LGB_INTEGRATION_DATA.named))for(const to of tos)if(!ROOMS[to]||!LGB_INTEGRATION_DATA.named[to]?.includes(from))errores.push('WORLD_NAMED_RECIPROCITY:'+from+':'+to);
 return {ok:!errores.length,errores,rooms:ids.length,areas:areaIds.size,namedNavigation:'SOURCE_ADJACENCY_NO_INVENTED_CARDINAL_DIRECTIONS'};
}
