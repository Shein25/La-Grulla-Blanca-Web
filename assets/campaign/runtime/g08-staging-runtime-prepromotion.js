// Private staging projection. It never dispatches input, ticks a clock, or exposes a global runtime.
function createStagingRuntime(live,world,roomDefinitions){
 const target=Object.create(Object.getPrototypeOf(live));
 for(const k of Reflect.ownKeys(live)){const d=Object.getOwnPropertyDescriptor(live,k);if(!d||!Object.hasOwn(d,'value')||!d.configurable)throw Error('G08_STAGE_DESCRIPTOR');Object.defineProperty(target,k,{...d,value:d.value});}
 for(const[k,v]of Object.entries(world))if(!['version','salas','visitadas'].includes(k))target[k]=structuredClone(v);
 const definitions=live.rooms??roomDefinitions;if(!definitions)throw Error('G08_STAGE_CANONICAL_ROOMS_REQUIRED');target.visitadas=new Set(world.visitadas);target.rooms={...definitions};for(const[id,s]of Object.entries(world.salas)){if(!Object.hasOwn(definitions,id))throw Error('G08_STAGE_UNKNOWN_ROOM');target.rooms[id]={...definitions[id],items:structuredClone(s.items),oculto:structuredClone(s.oculto)};}
 target.pregunta=null;let published=false;
 const current=()=>published?live:target;
 const runtime=new Proxy(target,{get:(_,k)=>Reflect.get(current(),k),set:(_,k,v)=>Reflect.set(current(),k,v),has:(_,k)=>k in current(),ownKeys:()=>Reflect.ownKeys(current()),getOwnPropertyDescriptor:(_,k)=>Object.getOwnPropertyDescriptor(current(),k)});
 return Object.freeze({runtime,publish(){published=true;},retire(){published=false;}});
}

export { createStagingRuntime };
