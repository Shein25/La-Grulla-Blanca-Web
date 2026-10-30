import { ROOT_MODEL, ROOT_NARRATIVE } from './root-data.js';
import { fail, freeze } from '../data/safe-data.js';
import { add, rational } from '../exact-number.js';

const completed=new WeakMap();
const fraction=s=>{const [p,q='1']=s.split('/');return Object.freeze({p:BigInt(p),q:BigInt(q)});};
const compare=(a,b)=>a.p*b.q>b.p*a.q?1:a.p*b.q<b.p*a.q?-1:0;
function permutations(rows){if(!rows.length)return [[]];return rows.flatMap((r,i)=>permutations(rows.filter((_,j)=>j!==i)).map(t=>[r,...t]));}
const priorities=permutations(ROOT_MODEL.rootOrder);
// Exact transcription of the frozen selector; semantic data are build-time derivatives of G02.
function resolveRootEvidence(ids,evidence){
  const roots=ROOT_MODEL.rootOrder;
  if(ids.length!==5||ids.some((id,q)=>!ROOT_MODEL.strategyOrderByGroup[q].includes(id)))fail('ROOT_STRATEGIES');
  const scores=Object.fromEntries(roots.map(r=>[r,evidence[r].reduce(add,rational(0))]));
  let survivors=roots.filter(r=>roots.every(s=>compare(scores[r],scores[s])>=0));
  if(survivors.length===1)return survivors[0];
  const support=r=>evidence[r].filter(v=>v.p>0n).length;
  survivors=survivors.filter(r=>survivors.every(s=>support(r)>=support(s)));
  if(survivors.length===1)return survivors[0];
  const minimum=r=>evidence[r].reduce((a,b)=>compare(a,b)<=0?a:b);
  survivors=survivors.filter(r=>survivors.every(s=>compare(minimum(r),minimum(s))>=0));
  if(survivors.length===1)return survivors[0];
  const seed=ids.reduce((n,id,q)=>3*n+ROOT_MODEL.strategyOrderByGroup[q].indexOf(id),0);
  return priorities[seed%120].find(r=>survivors.includes(r));
}
function requireCompletedRoot(capability){const x=completed.get(capability);if(!x)fail('ROOT_SELECTION_NOT_AUTHENTIC');return x;}
function createRootSelection(){
  const answers=[];let result=null;
  return Object.freeze({
    next(){if(result)return null;const g=ROOT_NARRATIVE.groups[answers.length];return freeze({frame:answers.length===0?ROOT_NARRATIVE.frame:null,question:g.question,options:g.options.map(o=>({position:o.position,text:o.text}))});},
    answer(position){if(result)fail('ROOT_SELECTION_COMPLETE');const q=answers.length;
      const o=ROOT_MODEL.groups[q].options.find(o=>o.position===position);if(!o)fail('ROOT_POSITION');answers.push(o.id);
      if(answers.length!==5)return null;
      const evidence=Object.fromEntries(ROOT_MODEL.rootOrder.map(r=>[r,answers.map((id,q)=>fraction(ROOT_MODEL.groups[q].options.find(o=>o.id===id).centeredContribution[r].exact))]));
      const root=resolveRootEvidence(answers,evidence);result=Object.freeze({});completed.set(result,freeze({root}));return result;
    }
  });
}

export { createRootSelection, requireCompletedRoot, resolveRootEvidence };
