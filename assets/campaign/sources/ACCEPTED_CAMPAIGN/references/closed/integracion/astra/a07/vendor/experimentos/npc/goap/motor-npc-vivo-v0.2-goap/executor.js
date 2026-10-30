import { validateFacts, factsMatch, applyEffects } from './goap.js';

function byId(actions,id) {
  return actions.find(a=>a.id===id) || null;
}

function factsEqual(a,b) {
  if (!a || !b || typeof a!=='object' || typeof b!=='object' || Array.isArray(a) || Array.isArray(b)) return false;
  const ak=Object.keys(a).sort(), bk=Object.keys(b).sort();
  if (ak.length!==bk.length) return false;
  for (let i=0;i<ak.length;i++) {
    if (ak[i]!==bk[i] || !Object.is(a[ak[i]],b[bk[i]])) return false;
  }
  return true;
}

function resolveExecutionContract(planResult,goalArg,relevanceArg) {
  const hasBoundGoal=Object.hasOwn(planResult,'goal');
  const hasBoundRelevance=Object.hasOwn(planResult,'relevance');
  const goal=hasBoundGoal ? planResult.goal : goalArg;
  const relevance=hasBoundRelevance ? planResult.relevance : relevanceArg;

  const goalErrors=validateFacts(goal,'goal ejecutable');
  if (goalErrors.length) throw new TypeError(goalErrors.join(' · '));

  if (relevance === undefined) {
    throw new TypeError('relevance es obligatoria para ejecutar un plan no vinculado');
  }
  const relevanceErrors=validateFacts(relevance,'relevance ejecutable');
  if (relevanceErrors.length) throw new TypeError(relevanceErrors.join(' · '));

  if (hasBoundGoal && goalArg !== undefined && !factsEqual(planResult.goal,goalArg)) {
    throw new TypeError('goal explícito no coincide con el goal vinculado al plan');
  }
  if (hasBoundRelevance && relevanceArg !== undefined && !factsEqual(planResult.relevance,relevanceArg)) {
    throw new TypeError('relevance explícita no coincide con la relevancia vinculada al plan');
  }

  return {goal,relevance};
}

function relevanceStillHolds(world,relevance) {
  return factsMatch(world,relevance);
}

function executeNext(planResult,world,goal,actions,relevance) {
  if (!planResult || planResult.status !== 'PLAN_FOUND') {
    return { status:'NO_ACTIVE_PLAN', world:{...world}, remainingPlan:null, executed:null };
  }

  const contract=resolveExecutionContract(planResult,goal,relevance);
  const executableGoal=contract.goal;
  const executableRelevance=contract.relevance;
  const plan=[...planResult.plan];

  if (factsMatch(world,executableGoal)) {
    return { status:'GOAL_REACHED', world:{...world}, remainingPlan:plan, executed:null };
  }

  if (!relevanceStillHolds(world,executableRelevance)) {
    return {
      status:'REPLAN_REQUIRED',
      reason:'El objetivo dejó de ser relevante.',
      goalObsolete:true,
      world:{...world},
      remainingPlan:plan,
      executed:null,
    };
  }

  if (!plan.length) {
    return {
      status:'REPLAN_REQUIRED',
      reason:'Plan vacío pero objetivo no satisfecho.',
      goalObsolete:false,
      world:{...world},
      remainingPlan:[],
      executed:null,
    };
  }

  const id=plan[0], action=byId(actions,id);
  if (!action) {
    return {
      status:'REPLAN_REQUIRED',
      reason:'Acción inexistente: '+id,
      goalObsolete:false,
      world:{...world},
      remainingPlan:plan,
      executed:null,
    };
  }

  if (!factsMatch(world,action.preconditions)) {
    return {
      status:'REPLAN_REQUIRED',
      reason:'Precondiciones cambiaron para '+id,
      goalObsolete:false,
      world:{...world},
      remainingPlan:plan,
      executed:null,
    };
  }

  const next=applyEffects(world,action.effects);
  const remaining=plan.slice(1);

  return {
    status:factsMatch(next,executableGoal)?'GOAL_REACHED':'STEP_APPLIED',
    goalObsolete:false,
    world:next,
    remainingPlan:remaining,
    executed:id,
  };
}

function executeWholePlan(planResult,world,goal,actions,maxSteps=50,relevance) {
  if (!Number.isInteger(maxSteps) || maxSteps < 0) throw new TypeError('maxSteps debe ser entero >= 0');

  if (!planResult || planResult.status !== 'PLAN_FOUND') {
    return {status:'NO_ACTIVE_PLAN',world:{...world},trace:[]};
  }

  const contract=resolveExecutionContract(planResult,goal,relevance);
  let current={...world}, remaining=planResult;
  const trace=[];

  for (let i=0;i<maxSteps;i++) {
    const step=executeNext(remaining,current,contract.goal,actions,contract.relevance);
    trace.push(step);
    current=step.world;

    if (step.status==='GOAL_REACHED') return {status:'GOAL_REACHED',world:current,trace};
    if (step.status!=='STEP_APPLIED') return {status:step.status,world:current,trace};

    remaining={...remaining,plan:step.remainingPlan};
  }

  if (factsMatch(current,contract.goal)) return {status:'GOAL_REACHED',world:current,trace};
  return {status:'STEP_LIMIT',world:current,trace};
}

export { executeNext, executeWholePlan };
