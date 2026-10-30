const GOALS = Object.freeze({
  HELP_PLAYER: Object.freeze({ playerHelped:true }),
  INVESTIGATE_ANOMALY: Object.freeze({ anomalyInvestigated:true }),
  REPORT_SUPERIOR: Object.freeze({ superiorInformed:true }),
  FULFILL_DUTY: Object.freeze({ dutySatisfied:true }),
  RETURN_POST: Object.freeze({ at:'puesto' }),
  WAIT_SAFE: Object.freeze({ waited:true }),
});

const GOAL_RELEVANCE = Object.freeze({
  HELP_PLAYER: Object.freeze({ playerPresent:true, playerNeedsHelp:true, playerHelped:false }),
  INVESTIGATE_ANOMALY: Object.freeze({ anomalyPresent:true, anomalyInvestigated:false }),
  REPORT_SUPERIOR: Object.freeze({ hasEvidence:true, superiorInformed:false }),
  FULFILL_DUTY: Object.freeze({ dutyPending:true, dutySatisfied:false }),
  RETURN_POST: Object.freeze({}),
  WAIT_SAFE: Object.freeze({ waited:false }),
});

const ORDER=Object.freeze([
  'HELP_PLAYER',
  'INVESTIGATE_ANOMALY',
  'REPORT_SUPERIOR',
  'FULFILL_DUTY',
  'RETURN_POST',
  'WAIT_SAFE',
]);

const clamp=n=>Math.max(0,Math.min(100,n));
const t=(npc,key)=>clamp(npc.traits[key]);
const r=(npc,key)=>clamp(npc.relationPlayer[key]);
const w=(world,key)=>clamp(world[key]);

function item(id,score,available,parts,reasonUnavailable='') {
  const raw=parts.reduce((sum,x)=>sum+x.value,score);
  return {
    id, available, raw, score:clamp(raw), parts, reasonUnavailable,
    goal:{...GOALS[id]},
    relevance:{...GOAL_RELEVANCE[id]},
  };
}

function rankGoals(npc,world) {
  const empathy=t(npc,'empatia'), curiosity=t(npc,'curiosidad'), prudence=t(npc,'prudencia');
  const discipline=t(npc,'disciplina'), institutional=t(npc,'lealtad_institucional');
  const affinity=r(npc,'afinidad'), trust=r(npc,'confianza');
  const urgency=w(world,'urgency'), danger=w(world,'danger'), duty=w(world,'dutyImportance');

  const out=[
    item('HELP_PLAYER',10,
      !!world.playerPresent && !!world.playerNeedsHelp && !world.playerHelped,
      [
        {label:'empatía',value:empathy*0.35},
        {label:'afinidad',value:affinity*0.15},
        {label:'confianza',value:trust*0.18},
        {label:'urgencia',value:urgency*0.25},
        {label:'deber',value:-duty*0.22},
      ],
      'El jugador no necesita ayuda o no está presente.'
    ),
    item('INVESTIGATE_ANOMALY',8,
      !!world.anomalyPresent && !world.anomalyInvestigated,
      [
        {label:'curiosidad',value:curiosity*0.42},
        {label:'lealtad institucional',value:institutional*0.18},
        {label:'audacia',value:(100-prudence)*0.10},
        {label:'urgencia',value:urgency*0.12},
        {label:'peligro',value:danger*0.08},
      ],
      'No hay anomalía pendiente.'
    ),
    item('REPORT_SUPERIOR',10,
      !!world.hasEvidence && !world.superiorInformed,
      [
        {label:'prudencia',value:prudence*0.25},
        {label:'lealtad institucional',value:institutional*0.22},
        {label:'peligro',value:danger*0.20},
        {label:'urgencia',value:urgency*0.18},
      ],
      'No hay evidencia pendiente de informar.'
    ),
    item('FULFILL_DUTY',12,
      !!world.dutyPending && !world.dutySatisfied,
      [
        {label:'disciplina',value:discipline*0.35},
        {label:'lealtad institucional',value:institutional*0.25},
        {label:'importancia del deber',value:duty*0.32},
        {label:'urgencia externa',value:-urgency*0.12},
      ],
      'No hay deber pendiente.'
    ),
    item('RETURN_POST',10,
      world.at !== 'puesto',
      [
        {label:'disciplina',value:discipline*0.34},
        {label:'lealtad institucional',value:institutional*0.22},
        {label:'importancia del deber',value:duty*0.26},
      ],
      'El NPC ya está en su puesto.'
    ),
    item('WAIT_SAFE',3,true,[
      {label:'prudencia',value:prudence*0.18},
      {label:'baja urgencia',value:(100-urgency)*0.08},
      {label:'bajo peligro',value:(100-danger)*0.05},
    ]),
  ];

  return out.sort((a,b)=>{
    if (a.available !== b.available) return a.available ? -1 : 1;
    if (b.score !== a.score) return b.score-a.score;
    if (b.raw !== a.raw) return b.raw-a.raw;
    return ORDER.indexOf(a.id)-ORDER.indexOf(b.id);
  });
}

function selectGoal(npc,world) {
  return rankGoals(npc,world).find(x=>x.available) || null;
}

export { GOALS, GOAL_RELEVANCE, rankGoals, selectGoal };
