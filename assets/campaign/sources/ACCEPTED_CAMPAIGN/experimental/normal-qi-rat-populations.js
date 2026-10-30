// Human-authorized experimental population change, 2026-10-09.
// No room, exit, stat, reward, wandering territory, or cooldown is created here.
const NORMAL_QI_RAT_ROOMS=Object.freeze(['granero_valle','campo_poniente','sauces_granero','sauces_campos','bosque_linde_jardines','bosque_claro_raices']);
const applied=new WeakSet();
function applyNormalQiRatPopulations(runtime,rooms){
 if(applied.has(rooms))return false;
 if(runtime.rooms!==null)throw Error('NORMAL_RAT_POPULATION_BOOTSTRAP_TIMING');
 const plans=NORMAL_QI_RAT_ROOMS.map(id=>{const room=rooms[id];if(!room||!Array.isArray(room.mobs)||room.mobs.includes('rata_qi'))throw Error('NORMAL_RAT_POPULATION_BASE_DRIFT');
  const own=Object.getOwnPropertyDescriptor(room,'mobs');if(!own?.writable||!Object.hasOwn(own,'value'))throw Error('NORMAL_RAT_POPULATION_WRITE_PROTECTED');
  return {room,before:room.mobs,after:room.mobs.concat('rata_qi')};
 });
 let n=0;try{for(const p of plans){p.room.mobs=p.after;n++;}applied.add(rooms);return true;}catch(error){for(const p of plans.slice(0,n))p.room.mobs=p.before;throw error;}
}

export { NORMAL_QI_RAT_ROOMS, applyNormalQiRatPopulations };
