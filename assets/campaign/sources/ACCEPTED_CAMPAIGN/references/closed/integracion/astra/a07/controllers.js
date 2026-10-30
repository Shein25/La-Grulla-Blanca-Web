import { createRuntime, stepFSM } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/vendor/fsm-engine.js';
import { createRuntime as createRuntime$1, tickBehaviorTree } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/vendor/bt-engine.js';
import { validateActionContext, validateNpc, evaluateDialogueTopic, chooseAction } from './vendor/experimentos/npc/utility-ai/motor-npc-vivo-v0.1.1/engine.js';
import { planGOAP } from './vendor/experimentos/npc/goap/motor-npc-vivo-v0.2-goap/goap.js';
import { GOALS, GOAL_RELEVANCE } from './vendor/experimentos/npc/goap/motor-npc-vivo-v0.2-goap/goal-selector.js';
import { GOAP_ACTIONS } from './vendor/experimentos/npc/goap/motor-npc-vivo-v0.2-goap/actions.js';
import { createExecutionSession } from './vendor/experimentos/npc/execution/npc-executor-replanning-v0.1/execution-session.js';
import { decideFromMemory, ACTION_TO_GOAL } from './vendor/experimentos/npc/memoria/motor-npc-vivo-v0.3.2-decision/decision-pipeline.js';
import { exact, fail, copy, freeze, plannerOptions } from './safe-data.js';

/** Five wrappers of closed algorithms. No tick loop, executor advance, learning or UI. */

const WORLD=['at','playerPresent','playerNeedsHelp','playerHelped','playerReachable','anomalyPresent','anomalyInvestigated','dutyPending','dutySatisfied','dutyImportance','danger','urgency','hasEvidence','superiorInformed','superiorAvailable','messengerAvailable','passageOpen','waited'];
const CONTEXT=['playerPresent','playerRequestsHelp','playerRank','dutyImportance','danger','missionUrgency','anomalyPresent','awayFromPost','superiorReachable','relevantTopic','dutyMode'];
const RELATION=['afinidad','confianza','respeto','deuda','temor','rivalidad'];
const THREE=['R1','R2','R3'];
function conditions(policy){const keys=new Set();
  function visit(n){if(n.type==='condition')keys.add(n.test.key);for(const c of n.children??[])visit(c);}visit(policy.root);return [...keys];}
function worldContext(data,snapshot){
  exact(data.world,WORLD);exact(data.utilityContext,CONTEXT);
  const w=data.world,c=data.utilityContext;
  for(const k of WORLD.filter(k=>!['at','dutyImportance','danger','urgency'].includes(k)))if(typeof w[k]!=='boolean')fail('A07_WORLD_TYPE');
  if(!['puesto','jugador','superior'].includes(w.at))fail('A07_SYMBOLIC_LOCATION');
  for(const k of ['dutyImportance','danger','urgency'])if(typeof w[k]!=='number'||w[k]<0||w[k]>100)fail('A07_WORLD_TYPE');
  if(w.playerPresent!==snapshot.perception.playerPresent||c.playerPresent!==w.playerPresent)fail('A07_PRESENCE_MISMATCH');
  const pairs=[['playerRequestsHelp',w.playerNeedsHelp&&!w.playerHelped],['anomalyPresent',w.anomalyPresent&&!w.anomalyInvestigated],['awayFromPost',w.at!=='puesto'],['dutyImportance',w.dutyImportance],['danger',w.danger],['missionUrgency',w.urgency]];
  if(pairs.some(([k,v])=>c[k]!==v))fail('A07_WORLD_CONTEXT_MISMATCH');
  if(!THREE.includes(c.relevantTopic))return null;
  const context={...c,relevantKnowledge:snapshot.knowledge[c.relevantTopic]};delete context.relevantTopic;
  if(validateActionContext(context).length)fail('A07_UTILITY_CONTEXT');return context;
}

function createController(row,policy){
  const architecture=row.architecture,actorId=row.actorId,btKeys=architecture==='BT'?conditions(policy):[];
  const initialValue=architecture==='FSM'?createRuntime(policy):architecture==='BT'?createRuntime$1(policy):{behaviorState:copy(policy.behaviorState),session:null};
  if(!['FSM','BT'].includes(architecture)&&validateNpc(policy).length)fail('A07_PROFILE');
  const owned=new WeakSet();
  function state(value){const s=freeze({actorId,architecture,value:copy(value)});owned.add(s);return s;}
  const initial=state(initialValue);
  function decide(snapshot,data,inputState=initial){
    if(!owned.has(inputState))fail('A07_FOREIGN_CONTROLLER_STATE');
    const value=copy(inputState.value);
    const result=(status,reasons=[],intentIds=[],nextValue=value,extra={})=>freeze({status,reasons,intentIds,nextControllerState:state(nextValue),...extra});
    if(data===null)return result('DEFERRED',['A07_LOCAL_FACT_FEED_NOT_CONNECTED']);
    if(architecture==='FSM'){
      exact(data,['event']);exact(data.event,['type','facts']);exact(data.event.facts,[]);
      const events=new Set(Object.values(policy.states).flatMap(s=>Object.keys(s.on)));
      if(!events.has(data.event.type))fail('A07_UNREGISTERED_EVENT');
      const r=stepFSM(policy,value,data.event);return result(r.emitted.length?'DECIDED':'NO_OP',[],r.emitted,r.nextRuntime);
    }
    if(architecture==='BT'){
      exact(data,['facts','actionResults']);exact(data.facts,btKeys);
      if(btKeys.some(k=>typeof data.facts[k]!=='boolean'))fail('A07_BT_FACT_TYPE');
      const r=tickBehaviorTree(policy,value,data);return result(r.emitted.length?'DECIDED':'NO_OP',[],r.emitted,r.nextRuntime,{controllerStatus:r.status});
    }
    const npc={...copy(policy),id:actorId,name:row.name,role:row.role,knowledge:Object.fromEntries(THREE.map(k=>[k,snapshot.knowledge[k]])),behaviorState:value.behaviorState};
    if(architecture==='UTILITY_DIALOGUE'){
      exact(data,['topicId','context']);
      if(!/^R([1-9]|10)$/.test(data.topicId))fail('A07_TOPIC');
      if(!THREE.includes(data.topicId))return result('DEFERRED',['A07_LOCAL_CONTEXT_PROJECTION']);
      exact(data.context,['playerRank','topicSensitivity','formalRestriction']);
      const r=evaluateDialogueTopic(npc,data.topicId,data.context);
      return result('DEFERRED',['A07_CONVERSATION_NOT_AUTHORIZED_THIS_BLOCK'],[],value,{topicEvaluation:{topicId:r.topicId,state:r.state,mode:r.mode}});
    }
    const memoryArchitecture=architecture==='MEMORY_RELATIONS_UTILITY_GOAP_EXECUTION';
    exact(data,['world','utilityContext','plannerOptions'],memoryArchitecture?['memory','baseRelations']:[]);
    plannerOptions(data.plannerOptions);
    const context=worldContext(data,snapshot);
    if(!context)return result('DEFERRED',['A07_LOCAL_CONTEXT_PROJECTION']);
    if(value.session!==null)return result('DEFERRED',['A07_RESOLVED_RESULT_BRIDGE_NOT_CONNECTED']);
    let decision;
    if(memoryArchitecture){
      if(!Object.hasOwn(data,'memory')||!Object.hasOwn(data,'baseRelations'))return result('DEFERRED',['A07_MEMORY_RELATIONS_NOT_CONNECTED']);
      exact(data.baseRelations,RELATION);
      if(RELATION.some(k=>typeof data.baseRelations[k]!=='number'||data.baseRelations[k]<0||data.baseRelations[k]>100))fail('A07_RELATION_TYPE');
      if(!Array.isArray(data.memory.entries)||data.memory.entries.length>32)fail('A07_MEMORY_BOUND');
      // Read-only closed pipeline, no recordMemory or new relation baseline.
      decision=decideFromMemory({...npc,relationPlayer:data.baseRelations},data.memory,snapshot.turn,context,data.world,data.plannerOptions);
    }else {
      // Same Utility -> ACTION_TO_GOAL -> GOAP composition tested in the closed loop,
      // without attaching that loop's empty Memory/Relations to these eight actors.
      const chosen=chooseAction(npc,context),goalId=ACTION_TO_GOAL[chosen.action];
      if(goalId===undefined)fail('A07_UTILITY_ACTION');
      if(goalId===null)decision={status:'UTILITY_ACTION_UNMAPPED',utilityDecision:chosen,goalId:null,plan:null};
      else {
        const goal=GOALS[goalId],relevance=GOAL_RELEVANCE[goalId],p=planGOAP(data.world,goal,GOAP_ACTIONS,data.plannerOptions);
        decision={status:p.status==='PLAN_FOUND'?'PLAN_READY':p.status==='NO_PLAN'?'NO_PLAN':'PLANNING_DEFERRED',utilityDecision:chosen,goalId,goal,relevance,plan:p};
      }
    }
    const extra={utilityAction:decision.utilityDecision.action,goalId:decision.goalId,plannerStatus:decision.plan?.status??null};
    if(decision.status==='UTILITY_ACTION_UNMAPPED')return result('DEFERRED',['A07_CONVERSATION_NOT_AUTHORIZED_THIS_BLOCK'],[],value,extra);
    if(decision.status!=='PLAN_READY')return result('DEFERRED',[decision.status],[],value,extra);
    if(!decision.plan.plan.length)return result('NO_OP',['OBSERVED_GOAL_ALREADY_SATISFIED'],[],value,extra);
    const session=createExecutionSession({goalId:decision.goalId,goal:decision.goal,relevance:decision.relevance,plan:decision.plan.plan});
    return result('DECIDED',[],[session.plan[0]],{behaviorState:value.behaviorState,session},extra);
  }
  const intents=architecture==='FSM'?[...new Set(Object.values(policy.states).flatMap(s=>Object.values(s.on).flatMap(ts=>ts.flatMap(t=>t.emit??[]))))]:architecture==='BT'?btIntents(policy.root):architecture==='UTILITY_DIALOGUE'?[]:GOAP_ACTIONS.map(a=>a.id);
  return Object.freeze({actorId,architecture,initialState:()=>initial,decide,intentIds:freeze(intents),factKeys:freeze(btKeys)});
}
function btIntents(n){return n.type==='action'?[n.intent]:(n.children??[]).flatMap(btIntents);}

export { createController };
