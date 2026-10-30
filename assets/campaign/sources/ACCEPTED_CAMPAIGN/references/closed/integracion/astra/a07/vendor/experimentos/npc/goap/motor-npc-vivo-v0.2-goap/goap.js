function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function primitive(value) {
  return value === null || ['boolean','string','number'].includes(typeof value);
}

function validateFacts(facts, label='facts') {
  const errors=[];
  if (!isRecord(facts)) return [label+' debe ser un objeto plano'];
  for (const [key,value] of Object.entries(facts)) {
    if (!key) errors.push(label+': clave vacía');
    if (!primitive(value)) errors.push(label+'.'+key+' debe ser primitivo');
    if (typeof value === 'number' && !Number.isFinite(value)) errors.push(label+'.'+key+' debe ser finito');
  }
  return errors;
}

function factsMatch(state, conditions) {
  return Object.entries(conditions).every(([key,value]) => Object.hasOwn(state,key) && Object.is(state[key],value));
}

function applyEffects(state, effects) {
  return { ...state, ...effects };
}

function validateAction(action) {
  const errors=[];
  if (!isRecord(action)) return ['acción inválida'];
  if (typeof action.id !== 'string' || !action.id.trim()) errors.push('action.id inválido');
  if (!Number.isSafeInteger(action.cost) || action.cost <= 0) errors.push('action.cost debe ser entero seguro > 0');
  errors.push(...validateFacts(action.preconditions,'preconditions'));
  errors.push(...validateFacts(action.effects,'effects'));
  return errors;
}

function encodeFact(value) {
  if (value === null) return ['null'];
  if (typeof value === 'number') return ['number', Object.is(value,-0) ? '-0' : String(value)];
  if (typeof value === 'boolean') return ['boolean', value ? 1 : 0];
  return ['string', value];
}

function relevantFactKeys(goal, actions) {
  const relevant=new Set(Object.keys(goal));
  let changed=true;
  while (changed) {
    changed=false;
    for (const action of actions) {
      const effectKeys=Object.keys(action.effects);
      if (!effectKeys.some(key=>relevant.has(key))) continue;
      for (const key of Object.keys(action.preconditions)) {
        if (!relevant.has(key)) { relevant.add(key); changed=true; }
      }
    }
  }
  return [...relevant].sort();
}

function actionTouchesRelevant(action,relevantSet) {
  return Object.keys(action.effects).some(key=>relevantSet.has(key));
}

function stateKey(state, relevantKeys) {
  return JSON.stringify(relevantKeys.map(key =>
    Object.hasOwn(state,key) ? [key,encodeFact(state[key])] : [key,['missing']]
  ));
}

function compareIds(a,b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function comparePlans(a,b) {
  const n=Math.min(a.length,b.length);
  for (let i=0;i<n;i++) {
    const cmp=compareIds(a[i],b[i]);
    if (cmp) return cmp;
  }
  return a.length-b.length;
}

function signature(node) {
  return { cost:node.cost, steps:node.plan.length, plan:[...node.plan] };
}

function compareSignature(a,b) {
  if (a.cost !== b.cost) return a.cost-b.cost;
  if (a.steps !== b.steps) return a.steps-b.steps;
  return comparePlans(a.plan,b.plan);
}

function sameSignature(a,b) {
  return !!a && !!b && compareSignature(a,b)===0;
}

function compareNodes(a,b) {
  return compareSignature(signature(a),signature(b));
}

class MinHeap {
  constructor(compare) { this.data=[]; this.compare=compare; }
  get size() { return this.data.length; }
  push(value) {
    const a=this.data; a.push(value);
    let i=a.length-1;
    while (i>0) {
      const p=(i-1)>>1;
      if (this.compare(a[p],a[i])<=0) break;
      [a[p],a[i]]=[a[i],a[p]]; i=p;
    }
  }
  pop() {
    const a=this.data;
    if (!a.length) return null;
    const root=a[0], last=a.pop();
    if (a.length) {
      a[0]=last;
      let i=0;
      while (true) {
        const l=i*2+1, r=l+1;
        let best=i;
        if (l<a.length && this.compare(a[l],a[best])<0) best=l;
        if (r<a.length && this.compare(a[r],a[best])<0) best=r;
        if (best===i) break;
        [a[i],a[best]]=[a[best],a[i]]; i=best;
      }
    }
    return root;
  }
}

function result(status, extra={}) {
  return {
    status,
    plan:null,
    cost:null,
    expansions:0,
    generated:0,
    maxFrontier:0,
    relevantFacts:[],
    finalState:null,
    ...extra,
  };
}

function planGOAP(initialState, goal, actions, options={}) {
  const maxExpansions=options.maxExpansions ?? 5000;
  const maxFrontier=options.maxFrontier ?? 10000;

  if (!Number.isInteger(maxExpansions) || maxExpansions < 0) {
    throw new TypeError('maxExpansions debe ser entero >= 0');
  }
  if (!Number.isInteger(maxFrontier) || maxFrontier < 1) {
    throw new TypeError('maxFrontier debe ser entero >= 1');
  }

  const stateErrors=validateFacts(initialState,'initialState');
  const goalErrors=validateFacts(goal,'goal');
  if (stateErrors.length || goalErrors.length) {
    throw new TypeError([...stateErrors,...goalErrors].join(' · '));
  }
  if (!Array.isArray(actions) || !actions.length) throw new TypeError('actions debe ser un array no vacío');

  const ids=new Set();
  for (const action of actions) {
    const errors=validateAction(action);
    if (errors.length) throw new TypeError('Acción inválida: '+errors.join(' · '));
    if (ids.has(action.id)) throw new TypeError('action.id duplicado: '+action.id);
    ids.add(action.id);
  }

  const relevantKeys=relevantFactKeys(goal,actions);
  const relevantSet=new Set(relevantKeys);
  const ordered=[...actions]
    .filter(action=>actionTouchesRelevant(action,relevantSet))
    .sort((a,b)=>compareIds(a.id,b.id));

  if (factsMatch(initialState,goal)) {
    return result('PLAN_FOUND',{
      plan:[],cost:0,finalState:{...initialState},relevantFacts:relevantKeys,maxFrontier:1,
    });
  }

  const frontier=new MinHeap(compareNodes);
  const root={state:{...initialState},cost:0,plan:[]};
  frontier.push(root);

  const rootKey=stateKey(root.state,relevantKeys);
  const best=new Map([[rootKey,signature(root)]]);
  let expansions=0, generated=0, maxFrontierSeen=1, overflowSeen=false;

  while (frontier.size) {
    const node=frontier.pop();
    const key=stateKey(node.state,relevantKeys);
    if (!sameSignature(signature(node),best.get(key))) continue;

    if (factsMatch(node.state,goal)) {
      return result('PLAN_FOUND',{
        plan:node.plan,cost:node.cost,expansions,generated,maxFrontier:maxFrontierSeen,
        relevantFacts:relevantKeys,finalState:node.state,
      });
    }

    if (expansions >= maxExpansions) {
      return result('SEARCH_LIMIT',{
        expansions,generated,maxFrontier:maxFrontierSeen,relevantFacts:relevantKeys,
      });
    }
    expansions++;

    for (const action of ordered) {
      if (!factsMatch(node.state,action.preconditions)) continue;
      const next=applyEffects(node.state,action.effects);
      const cost=node.cost+action.cost;
      generated++;

      if (!Number.isSafeInteger(cost) || cost <= node.cost) {
        overflowSeen=true;
        continue;
      }

      const plan=[...node.plan,action.id];
      const nextNode={state:next,cost,plan};
      const nextKey=stateKey(next,relevantKeys);
      const nextSig=signature(nextNode);
      const old=best.get(nextKey);

      if (old !== undefined && compareSignature(nextSig,old) >= 0) continue;

      best.set(nextKey,nextSig);
      if (frontier.size >= maxFrontier) {
        return result('FRONTIER_LIMIT',{
          expansions,generated,maxFrontier:maxFrontierSeen,relevantFacts:relevantKeys,
        });
      }
      frontier.push(nextNode);
      if (frontier.size > maxFrontierSeen) maxFrontierSeen=frontier.size;
    }
  }

  return result(overflowSeen?'COST_OVERFLOW':'NO_PLAN',{
    expansions,generated,maxFrontier:maxFrontierSeen,relevantFacts:relevantKeys,
  });
}

export { applyEffects, factsMatch, planGOAP, validateAction, validateFacts };
