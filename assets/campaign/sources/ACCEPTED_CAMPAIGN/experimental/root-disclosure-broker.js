import { fail, freeze } from '../references/closed/integracion/astra/a07/safe-data.js';
import { requireStatView } from '../../../runtime/b3-campaign-stat-view.js';
import { requireLearningScope, PRIMARY } from '../../../runtime/b2-player-learning-b14.js';
import { ROOT_SOURCE, NEUTRAL_TEXT, ROOT_TEXTS } from './root-disclosure-catalog.js';

const truths=new WeakMap(),authUtterances=new WeakMap();
function sealRootTruth(view,learning){
 requireStatView(view);requireLearningScope(learning);learning.project(view);
 const s=learning.capture();if(s.status!=='READY'||!Object.hasOwn(PRIMARY,view.root))fail('RD_TRUTH_UNAVAILABLE');
 const cap=Object.freeze({});truths.set(cap,{root:view.root,generation:s.generation,actorId:'player',recipientId:'shen_baojun',primaryKnown:s.knownIds.includes(PRIMARY[view.root])});return cap;
}
const rule=root=>({kind:'PRIMARY_ELEMENTAL_FOUNDATION_FIRST',policyId:'PRIMARY_ELEMENTAL_FOUNDATION_FIRST_V1',principalTechniqueId:root?PRIMARY[root]:null,unlockBasis:'AUTHENTIC_LEARNED_NOT_MASTERY'});
const key=x=>JSON.stringify(x);
function createRootDisclosureBroker({captureTruth,current,emitPlayer}){
 if([captureTruth,current,emitPlayer].some(f=>typeof f!=='function'))fail('RD_PRIVATE_PORT');
 let session=0,active=false,rootReceived=null,neutralDone=false,personalDone=false;
 let tickets=new WeakMap(),plans=new WeakMap();
 const truth=()=>{if(!active||!current()){revoke();fail('RD_CONTEXT_NOT_CURRENT');}const t=truths.get(captureTruth());if(!t)fail('RD_TRUTH_NOT_AUTHENTIC');return t;};
 function revoke(){active=false;rootReceived=null;neutralDone=false;personalDone=false;tickets=new WeakMap();plans=new WeakMap();}
 function validPlan(cap){
  const p=plans.get(cap);if(!p||p.session!==session||!active||!current())return null;
  try{const t=truth();if(p.generation!==t.generation)return null;if(p.kind==='PERSONAL'&&(!rootReceived||rootReceived.root!==t.root||rootReceived.session!==session||personalDone))return null;if(p.kind==='NEUTRAL'&&neutralDone)return null;return p;}catch{return null;}
 }
 const api=Object.freeze({
  begin(){revoke();session++;active=true;return session;},revoke,
  option(){try{const t=truth();return !personalDone&&!t.primaryKnown?ROOT_TEXTS[t.root].playerSpeech:null;}catch{return null;}},
  prepareDeclaration(text,recipient='shen_baojun'){
   const t=truth();if(recipient!==t.recipientId||personalDone||t.primaryKnown||text!==ROOT_TEXTS[t.root].playerSpeech)fail('RD_DECLARATION_SCOPE');
   const cap=Object.freeze({});tickets.set(cap,{session,generation:t.generation,root:t.root,text,used:false});return cap;
  },
  deliverPlayer(cap){
   const p=tickets.get(cap);if(!p||p.used||p.session!==session)fail('RD_TICKET_NOT_AUTHENTIC_OR_REPLAY');
   const t=truth();if(t.root!==p.root||t.generation!==p.generation)fail('RD_TRUTH_CHANGED');
   p.used=true;
   try{if(emitPlayer(p.text)!==true)throw Error('RD_NATIVE_DELIVERY_FAILED');const fresh=truth();if(fresh.root!==p.root||fresh.generation!==p.generation)throw Error('RD_DELIVERY_CONTEXT_CHANGED');
    rootReceived={root:p.root,generation:p.generation,session};return freeze({status:'PLAYER_ROOT_RECEIVED',recipientId:'shen_baojun',sourceKind:'VERIFIED_NATIVE_DIRECT_DISCLOSURE'});
   }catch(e){revoke();throw e;}
  },
  prepareExplanation(kind){
   const t=truth();if(kind==='NEUTRAL'&&(neutralDone||t.primaryKnown))return null;
   if(kind==='PERSONAL'&&(!rootReceived||rootReceived.root!==t.root||rootReceived.generation!==t.generation||personalDone))fail('RD_RECIPIENT_PERMISSION_REQUIRED');
   if(!['NEUTRAL','PERSONAL'].includes(kind))fail('RD_KIND');
   const cap=Object.freeze({}),text=kind==='NEUTRAL'?NEUTRAL_TEXT:ROOT_TEXTS[t.root].shenExplanation;
   const claims=kind==='NEUTRAL'?[rule(null)]:[{kind:'PLAYER_PRIMARY_ROOT',actorId:'player',recipientNpcId:'shen_baojun',rootId:t.root,evidenceKind:'VERIFIED_NATIVE_DIRECT_DISCLOSURE'},rule(t.root)];
   plans.set(cap,{session,generation:t.generation,kind,text,claims,root:kind==='PERSONAL'?t.root:null});return cap;
  },
  describe(cap){const p=validPlan(cap);if(!p)fail('RD_PLAN_NOT_AUTHENTIC');return freeze({kind:p.kind,text:p.text,semanticClaims:p.claims.map(x=>({...x})),source:ROOT_SOURCE});},
  seal(cap,u){
   const p=validPlan(cap);if(!p||!Object.isFrozen(u)||u.actorId!=='shen_baojun'||u.recipientId!=='player'||u.text!==p.text||
    u.text.length>240||key(u.semanticClaims)!==key(p.claims)||u.topicRefs.length||u.semanticRelations.length||
    u.realization?.catalogRevision!=='ROOT-DISCLOSURE-V1'||u.sourceBasis?.authored?.sha256!==ROOT_SOURCE.sha256)fail('RD_SEMANTIC_SURFACE_MISMATCH');
   authUtterances.set(u,{valid:()=>!!validPlan(cap),broker:api,cap});return u;
  },
  delivered(cap){const p=validPlan(cap);if(!p)fail('RD_PLAN_STALE');if(p.kind==='NEUTRAL')neutralDone=true;else personalDone=true;plans.delete(cap);},
  inspect(){if(active&&!current())revoke();return freeze({active,session,received:!!rootReceived,neutralExplained:neutralDone,personalExplained:personalDone,rootPermission:rootReceived?'CURRENT_CONVERSATION':'UNAVAILABLE',history:0,timers:0,persistence:false});}
 });return api;
}
function isAuthenticRootUtterance(u){const p=authUtterances.get(u);return !!p&&p.valid();}

export { createRootDisclosureBroker, isAuthenticRootUtterance, sealRootTruth };
