globalThis.ASTRA_A08_CUSTODIO=(function(){
// GRULLA_V120_CUSTODIO_CONTRACT_REFERENCE_NOT_NATIVE
// Not a physical fight engine; reference model for PRE_AOE integration.
// The functions below are extracted with identical semantics to the audited V118 microfixture.
// Initial state, offense, defense, dotTick, bossAction, uniqueAward, flee.
// WARNING: Native Qi payment/damage and Event Bus are NOT implemented. Manual only records a separately CONFIRMED native commit.
function createEncounter(){return {boss_hp:88,initial_hp:88,boss_def:4,charges:0,phase:"IDLE",anchor:false,exposed_attempts:0,exposed_turns_left:0,cooldown_boss_turns:0,discharges:0,boss_actions:0,telegraphs:0,player_actions_seen:[],player_actions:0,paid_defenses:0,unique_defeated:false,manual_awards:0,escaped:false};}

function consumePlayerTurn(s,kind){s.player_actions++;if(s.exposed_turns_left>0){if(kind==="OFFENSE"&&s.exposed_attempts>0)s.exposed_attempts--;s.exposed_turns_left--;if(s.exposed_turns_left===0)s.exposed_attempts=0;} }

function actOffense(s,id,actualDirectHp,actualDotHp=0){if(s.unique_defeated||s.escaped)return {kind:"NO_OP"};if(s.player_actions_seen.includes(id))return {kind:"DUPLICATE_NO_OP"};s.player_actions_seen.push(id);s.player_actions_seen=s.player_actions_seen.slice(-96);const effective_def=s.exposed_attempts>0?1:s.boss_def;consumePlayerTurn(s,"OFFENSE");const actual=Math.min(s.boss_hp,Math.max(0,actualDirectHp)+Math.max(0,actualDotHp));s.boss_hp-=actual;if(s.boss_hp===0){s.unique_defeated=true;s.charges=0;s.phase="DEAD";return {kind:"BOSS_DEAD",effective_def,actual};}if(actualDirectHp>0&&s.cooldown_boss_turns===0&&s.phase==="IDLE"){s.charges=Math.min(2,s.charges+1);if(s.charges===2)s.phase="PENDING"}return{kind:"OFFENSE",effective_def,actual,charges:s.charges,phase:s.phase};}

function actDefense(s,paid){if(s.unique_defeated||s.escaped)return{kind:"NO_OP"};if(!paid){consumePlayerTurn(s,"OTHER");return {kind:"NOT_PAID_NOT_ARMED"}};consumePlayerTurn(s,"OTHER");s.paid_defenses++;if(s.phase==="OPEN"&&!s.anchor){s.anchor=true;s.exposed_attempts=2;s.exposed_turns_left=3;return {kind:"ANCHORED",exposure:2}}return {kind:"DEFENSE_NO_WINDOW"};}

function actOther(s){if(s.unique_defeated||s.escaped)return {kind:"NO_OP"};consumePlayerTurn(s,"OTHER");return {kind:"OTHER"}}

function dotTick(s,damage){if(s.unique_defeated||s.escaped)return {kind:"NO_OP"};const actual=Math.min(s.boss_hp,Math.max(0,damage));s.boss_hp-=actual;if(s.boss_hp===0){s.unique_defeated=true;s.phase="DEAD"}return {kind:"DOT_ONLY",actual,charges:s.charges};}

function bossAction(s,controlled=false){if(s.unique_defeated||s.escaped)return{kind:"NO_OP"};if(controlled){if(s.phase==="OPEN"){s.phase="IDLE";s.charges=0;s.anchor=false;s.cooldown_boss_turns=3;return {kind:"DISCHARGE_CANCELLED_BY_VALID_CONTROL",extra_action:false}}return {kind:"CONTROLLED_NO_ACTION",extra_action:false}}
s.boss_actions++;if(s.phase==="PENDING"){s.phase="OPEN";s.telegraphs++;return {kind:"BASIC_AND_TELEGRAPH",base:"1d2+7",extra_action:false}}
if(s.phase==="OPEN"){const raw="1d3+14",mul=s.anchor?.5:1;s.phase="IDLE";s.charges=0;s.anchor=false;s.cooldown_boss_turns=3;s.discharges++;return {kind:"RESONANCE_DISCHARGE",raw,multiplier:mul,extra_action:false}}
if(s.cooldown_boss_turns>0)s.cooldown_boss_turns--;return {kind:"BASIC",base:"1d2+7",extra_action:false};}

function uniqueAward(s,{nativeVictoryConfirmed=false,nativeInventoryCommit=false}={}){if(!s.unique_defeated||s.manual_awards>0||!nativeVictoryConfirmed||!nativeInventoryCommit)return false;s.manual_awards++;return true;}

function flee(s){if(s.unique_defeated)return "ALREADY_DEFEATED";Object.assign(s,createEncounter(),{escaped:true});return "RESET";}


return Object.freeze({createEncounter,consumePlayerTurn,actOffense,actDefense,actOther,dotTick,bossAction,uniqueAward,flee});})();
