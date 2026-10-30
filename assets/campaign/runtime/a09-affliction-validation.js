import { A09_DOT_SOURCES } from './a09-affliction-data.js';

const fail=s=>{throw Error('A09_AFFLICTION_'+s);},clone=x=>structuredClone(x),canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v),same=(a,b)=>canonical(a)===canonical(b);
function validateAfflictionList(dots,player){
 if(!Array.isArray(dots)||dots.length>4096)fail('LIST');
 for(const d of dots){const life=player.lives?.find(l=>l.lifeId===d.source),q=life&&(d.origin==='R56_LIV_T4'?A09_DOT_SOURCES.t4[life.id]:A09_DOT_SOURCES.normal[life.id]?.[d.family]);if(!q||d.dice!==q.damage||!Number.isInteger(d.ticks_left)||d.ticks_left<1||d.ticks_left>q.ticks||d.duration_unit!=='OWNER_TURNS'||d.out_of_combat_min_hp!==1||d.persists_out_of_combat!==true||d.persists_room_change!==true||d.persists_save!==true)fail('CANONICAL_SOURCE');if(d.r64Condition&&!same(d.r64Condition,A09_DOT_SOURCES.treatment[life.id]))fail('TREATMENT_SOURCE');}
 return true;
}
function next(state){state.x=(state.x^(state.x<<13))>>>0;state.x=(state.x^(state.x>>>17))>>>0;state.x=(state.x^(state.x<<5))>>>0;return state.x/4294967296;}
function validateAfflictionOwnerEvent(e,player,expected){
 if(e.source!=='A08_PRIVATE_PLAYER_PORT'||e.engineContract!=='NEW_COMBAT_STATS_V0_1'||e.actorId!==player.actorId||e.targetId!==player.actorId||e.actionKind!=='AFFLICTION_OWNER_SLOT'||!Number.isFinite(e.hpBefore)||e.hpBefore<=0||e.playerQI!==e.qiBefore||e.paidQI!==0||!Number.isInteger(e.rngBefore)||e.rngBefore<=0||e.rngBefore>4294967295||!same(e.dotsBefore,expected)||!e.dotsBefore.length||!Array.isArray(e.ticks)||!e.ticks.length||e.ticks.length>e.dotsBefore.length)fail('OWNER_PROOF');
 validateAfflictionList(e.dotsBefore,player);let hp=e.hpBefore;const after=clone(e.dotsBefore),rng={x:e.rngBefore};
 for(let i=0;i<e.ticks.length;i++){const tick=e.ticks[i],d=after[i],m=/^(\d+)d(\d+)([+-]\d+)?$/.exec(d.dice);if(!m||hp<=0)fail('DICE_OR_TERMINAL');let rolled=Number(m[3]||0);for(let n=0;n<Number(m[1]);n++)rolled+=Math.floor(next(rng)*Number(m[2]))+1;d.ticks_left--;if(tick.rolledPotency!==rolled||!same(tick.dot,d))fail('ROLL_OR_LIFETIME');const r=tick.result,amount=Math.floor(rolled+.5);if(r?.kind!=='DOT'||r.effectiveDefense!==0||r.critical!==false||r.damageAfterDefense!==amount||!Number.isFinite(r.absorbed)||r.absorbed<0||r.absorbed>amount||r.actualHPDamage!==Math.min(hp,amount-r.absorbed)||r.hpAfter!==hp-r.actualHPDamage)fail('NATIVE_V284_RESULT');hp=r.hpAfter;}
 if(hp>0&&e.ticks.length!==e.dotsBefore.length)fail('MISSED_OWNER_TICK');const remaining=after.filter(d=>d.ticks_left>0);if(!same(e.dotsAfter,remaining)||!same(e.combat?.dots,remaining)||e.playerHP!==hp||e.actualHPDamage!==e.hpBefore-hp||e.rngAfter!==rng.x)fail('AFTER_STATE');validateAfflictionList(remaining,player);return remaining;
}

export { validateAfflictionList, validateAfflictionOwnerEvent };
