// Port of V031 Brain; scores/history only. No actor stats, resources or grants.
// All returned mutations are drafts; host commits only against native receipts.
const A={G:'grulla__golpe_ala',C:'grulla__campanada_pico',P:'grulla__pata_inmovil',T:'grulla__tormenta_mil_plumas',X:'grulla__cerrar_alas',R:'grulla__recordar_filo',E:'grulla__eco_meridiano',I:'grulla__picotazo_blanco',B:'grulla__campana_sin_dueno',V:'grulla__ala_vacia',S:'grulla__silencio_entre_campanas',F:'grulla__romper_ritmo',U:'grulla__buscar_pulso'};
const clone=x=>structuredClone(x),tail=(a,n)=>a.slice(-n),same=a=>a.length>1&&a[0]!=null&&a.every(x=>x===a[0]),off=a=>['BASIC','TECHNIQUE','CONTROL'].includes(a.type);
const initialBrain=()=>({phase:1,turn:0,history:[],recent:[],phaseMemory:{},plan:null,techniqueCounter:null});
function summarizeBrain(s){const t={},e={};let offense=0,defend=0,recover=0,control=0,qiActions=0,techniqueUses=0,nonTechniqueActions=0,basicUses=0;for(const a of s.history){if(off(a))offense++;if(a.type==='BASIC')basicUses++;if(a.type==='DEFEND')defend++;if(a.type==='RECOVER')recover++;if(a.type==='CONTROL')control++;if(a.qiSpent>0)qiActions++;if(a.techniqueId){techniqueUses++;t[a.techniqueId]=(t[a.techniqueId]||0)+1;}else nonTechniqueActions++;if(a.element)e[a.element]=(e[a.element]||0)+1;}
 const dominant=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:a[0]>b[0]?1:0))[0]?.[0]??null,dt=dominant(t),role=[...s.history].reverse().find(a=>a.techniqueId===dt)?.techniqueRole??null,single=techniqueUses>=2&&Object.keys(t).length===1&&basicUses===0;
 return {dominantTechnique:dt,dominantTechniqueRole:role,dominantElement:dominant(e),offense,defend,recover,control,qiActions,techniqueUses,uniqueTechniques:Object.keys(t).length,nonTechniqueActions,basicUses,singleSkillReliance:single,pureSingleSkillSpam:single&&nonTechniqueActions===0};}
function enterBrainPhase(raw,phase){const s=clone(raw);if(phase!==s.phase+1||phase>3)throw Error('A09_AI_PHASE_ORDER');s.phaseMemory['phase'+s.phase]=summarizeBrain(s);if(phase===2&&s.phaseMemory.phase1.singleSkillReliance){const p=s.phaseMemory.phase1;s.techniqueCounter={techniqueId:p.dominantTechnique,techniqueRole:p.dominantTechniqueRole,locked:true,source:'PHASE1_SINGLE_SKILL_RELIANCE'};}s.phase=phase;s.turn=0;s.history=[];s.recent=[];s.plan=null;return s;}
function observeResolvedPlayerAction(raw,action){const s=clone(raw),a=clone(action);s.history=[...s.history,a].slice(-8);if(s.phase>=2&&s.techniqueCounter?.locked){if(a.techniqueId===s.techniqueCounter.techniqueId){}else if(a.type==='BASIC'||a.techniqueId)s.techniqueCounter=null;}else if(s.phase>=2){const l=tail(s.history,3);if(l.length===3&&l[0].techniqueId&&l.every(a=>a.techniqueId===l[0].techniqueId))s.techniqueCounter={techniqueId:l[0].techniqueId,techniqueRole:l[0].techniqueRole??null,locked:true,source:'THREE_CONSECUTIVE_SAME_SKILL'};}
 if(s.phase===3&&s.plan&&!s.plan.armed){if(s.plan.id==='ROMPER_REPETICION'){if(s.plan.referenceTechnique&&a.techniqueId===s.plan.referenceTechnique||s.plan.referenceElement&&a.element===s.plan.referenceElement&&['TECHNIQUE','CONTROL'].includes(a.type))s.plan.armed=true;else s.plan=null;}else if(s.plan.id==='CAZAR_CIRCULACION'){if(a.qiSpent>0&&['TECHNIQUE','CONTROL'].includes(a.type))s.plan.armed=true;else s.plan=null;}}else if(s.phase===3&&s.plan?.armed)s.plan=null;
 return s;}
function proposeSelectedIntent(raw,view,random){
 if(typeof random!=='function')throw Error('A09_AI_NATIVE_RANDOM_REQUIRED');const s=clone(raw),p=s.phase;if(view.phase!==p)throw Error('A09_AI_PHASE_SCOPE');let abilityId,planProposal=null;
 if(p===1)abilityId=[A.G,A.G,A.C,A.P][s.turn%4];else if(p===3&&s.plan?.armed&&s.plan.followup)abilityId=s.plan.followup;
 else {const h=tail(s.history,p===3?4:3),l2=tail(h,2),l3=tail(h,3),recent=(id,n=1)=>tail(s.recent,n).includes(id),signals={techniqueRepeat:same(l2.map(a=>a.techniqueId)),elementRepeat:same(l2.map(a=>a.element)),offenseStreak:l2.length===2&&l2.every(off),qiStreak:l2.length===2&&l2.every(a=>a.qiSpent>0),controlRecent:l3.some(a=>a.type==='CONTROL'),recoverRecent:l2.some(a=>a.type==='RECOVER'),heavyRecent:l2.some(a=>a.damageBand==='HEAVY'),playerLowHp:view.playerHP/view.playerHPMax<=.30,selfLowHp:view.bossHP/view.bossHPMax<=.30,playerQiLow:view.playerQI/Math.max(1,view.playerQIMax)<=.25,playerQiHigh:view.playerQI/Math.max(1,view.playerQIMax)>=.65,last:h.at(-1)};
 const x=signals,ir=s.phaseMemory.phase1?.dominantTechnique&&x.last?.techniqueId===s.phaseMemory.phase1.dominantTechnique?1:0;
 const entries=p===2?[
 [A.G,30,1],[A.T,28+(x.playerQiHigh?12:0)+(x.playerLowHp?10:0)-(recent(A.T,2)?40:0),1],
 [A.X,18+(x.offenseStreak?18:0)+(x.heavyRecent?20:0)+(x.selfLowHp?16:0)-(recent(A.X,2)?35:0)+(x.controlRecent?8:0),.8],
 [A.R,12+(x.techniqueRepeat?38:0)+(x.elementRepeat?18:0)+ir*8-(recent(A.R,2)?42:0),.6],
 [A.E,12+(x.qiStreak?34:0)+(x.playerQiLow?8:0)+(x.recoverRecent?6:0)-(recent(A.E,2)?40:0),.6]]:[
 [A.I,25+(x.playerLowHp?8:0),.5],[A.B,24+(x.playerLowHp?24:0)+(x.playerQiHigh?8:0)-(recent(A.B,2)?45:0),.5],
 [A.V,16+(x.offenseStreak?17:0)+(x.heavyRecent?14:0)-(recent(A.V,2)?30:0),.4],[A.P,15+(x.selfLowHp?15:0)+(x.controlRecent?10:0)-(recent(A.P,2)?30:0),.4],
 [A.S,10+(x.techniqueRepeat?32:0)+(x.elementRepeat?18:0)-(recent(A.S,3)?50:0),.2],[A.U,10+(x.qiStreak?28:0)+(x.playerQiHigh?10:0)-(recent(A.U,3)?50:0),.2]];
 const scores=entries.map(([id,score,jitter],i)=>{const n=random({phase:p,turn:s.turn,index:i,abilityId:id});if(!(n>=0&&n<1))throw Error('A09_AI_RANDOM_RANGE');return {id,score:score+(n-.5)*jitter};}).sort((a,b)=>b.score-a.score||(a.id<b.id?-1:a.id>b.id?1:0));abilityId=scores[0].id;
 if(p===3&&abilityId===A.S){const a=s.history.at(-1)||{};planProposal={id:'ROMPER_REPETICION',armed:false,followup:A.F,referenceTechnique:a.techniqueId??null,referenceElement:a.element??null};}else if(p===3&&abilityId===A.U)planProposal={id:'CAZAR_CIRCULACION',armed:false,followup:A.B};
 }
 s.turn++;s.recent=[...s.recent,abilityId].slice(-4);return {abilityId,phase:p,nextBrain:s,planProposal,telegraph:{phase:p,abilityId,plan:planProposal?.id??null},source:'V031_SELECTED_NATIVE_PORT_PENDING_HOMOLOGATION'};
}
function commitSelectedIntent(proposal,resolved){const s=clone(proposal.nextBrain);if(resolved&&proposal.planProposal)s.plan=clone(proposal.planProposal);return s;}

export { commitSelectedIntent, enterBrainPhase, initialBrain, observeResolvedPlayerAction, proposeSelectedIntent, summarizeBrain };
