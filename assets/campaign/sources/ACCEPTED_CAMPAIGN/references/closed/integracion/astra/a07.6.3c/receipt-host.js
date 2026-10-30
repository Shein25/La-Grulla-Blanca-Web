import { createAcknowledgeValidationBridge } from '../a07.6.3/acknowledge-validation-bridge.js';
import { createAcknowledgeRealizer } from '../a07.6.3/acknowledge-realizer.js';
import { ACKNOWLEDGE_ACTORS, ACKNOWLEDGE_EDGE } from '../a07.6.2/acknowledge-authority.js';
import { freeze, exact, copy, fail } from '../a07/safe-data.js';
import { method, id, own, turn } from '../a07.6.1/readonly-data.js';

/** Private live exchange authority. Detached DTOs never mint receipts. */

const hosts = new WeakSet();
const isReceiptHost = value => hosts.has(value);
const noReceipt = reason => freeze({status:'NO_RECEIPT',reason,receipt:null});
const invalid = reason => freeze({status:'INVALID',reason,context:null});

function createReceiptHost(options) {
  exact(options,['producer','pairEligibility','runtimePort']);
  const bridge=createAcknowledgeValidationBridge(options);
  const realizer=createAcknowledgeRealizer({validationBridge:bridge});
  const capture=method(options.runtimePort,'capture'),evaluatePair=method(options.pairEligibility,'evaluate');
  let slot=null,receipts=new WeakMap(),busy=false,disposed=false,invalidated=false;
  function retire() {
    receipts=new WeakMap();
    if(slot){slot.receipt=null;slot.claimed=true;slot.terminal=true;}
  }
  function request(raw,fields=['revision']) {
    const r=copy(raw);exact(r,fields);if(!id(r.revision))fail('A0763C_REVISION');
    return r;
  }
  function frame(A,B) {
    const c=capture();exact(c,['runtime','revision']);
    const runtime=own(c,'runtime'),positions=own(runtime,'posicionNPC');
    const result={revision:own(c,'revision'),turn:own(runtime,'turnoGlobal'),
      aRoom:own(own(positions,A),'sala'),bRoom:own(own(positions,B),'sala')};
    if(!id(result.revision)||!turn(result.turn)||!id(result.aRoom)||!id(result.bRoom))fail('A0763C_FRAME');
    return result;
  }
  function current(revision) {
    if(!slot||disposed||invalidated)fail('A0763C_NO_LIVE_ROOT');
    const root=slot.intent,A=root.actorId,B=root.counterpartId,guard=root.guard;
    if(!ACKNOWLEDGE_ACTORS.includes(A)||ACKNOWLEDGE_ACTORS.find(x=>x!==A)!==B)fail('A0763C_PILOT');
    if(bridge.revalidate(root,{revision}).status!=='VALID')fail('A0763C_ROOT_NOT_CURRENT');
    const before=frame(A,B),gate=copy(evaluatePair({actorA:B,actorB:A,revision}));
    exact(gate,['schemaVersion','actorA','actorB','status','roomId','areaId','activeAreaId','relationEdgeIds','revision','turn','reasons']);
    if(gate.schemaVersion!==1||gate.actorA!==B||gate.actorB!==A||gate.status!=='ELIGIBLE_CANDIDATE'||
      gate.revision!==revision||gate.turn!==guard.turn||gate.roomId!==guard.roomId||
      gate.areaId!==guard.activeAreaId||gate.activeAreaId!==guard.activeAreaId||
      JSON.stringify(gate.relationEdgeIds)!==JSON.stringify([ACKNOWLEDGE_EDGE.id])||
      !Array.isArray(gate.reasons)||gate.reasons.length)fail('A0763C_B_CONTEXT');
    const after=frame(A,B);
    if(JSON.stringify(before)!==JSON.stringify(after)||after.revision!==revision||revision!==guard.revision||
      after.turn!==guard.turn||after.aRoom!==guard.roomId||after.bRoom!==guard.roomId)fail('A0763C_CONTEXT_DRIFT');
    if(bridge.revalidate(root,{revision}).status!=='VALID')fail('A0763C_SOURCE_DRIFT');
    return freeze({rootActorId:A,recipientId:B,guard:copy(guard),
      sourceGeneration:root.reasonBasis.sourceEvent.generation,rootSequence:root.reasonBasis.sourceEvent.sequence,
      relationEdgeId:ACKNOWLEDGE_EDGE.id,hop:0});
  }
  function prepareRoot(event,raw) {
    if(disposed||invalidated||busy)return freeze({status:'DEFERRED',reasons:['A0763C_HOST_NOT_AVAILABLE'],intent:null});
    busy=true;
    try {
      const r=request(raw),out=bridge.prepare(event,r);
      if(out.status==='PROPOSED'){
        receipts=new WeakMap();
        slot={intent:out.intent,rootCapability:Object.freeze({}),utterance:null,receipt:null,claimed:false,terminal:false};
      }
      return out;
    } catch {return freeze({status:'DEFERRED',reasons:['A0763C_INVALID_ROOT_REQUEST'],intent:null});}
    finally{busy=false;}
  }
  function realizeRoot(intent,raw) {
    const no=reason=>freeze({status:'NO_UTTERANCE',reason,utterance:null});
    if(disposed||invalidated||busy||!slot||slot.intent!==intent)return no('A0763C_FOREIGN_OR_INACTIVE_ROOT');
    busy=true;
    try {
      const r=request(raw);current(r.revision);
      // A repeated realization of THIS root cannot create a new exchange.
      if(slot.utterance)return freeze({status:'REALIZED',reason:null,utterance:slot.utterance});
      const out=realizer.realize({intent,revision:r.revision});
      if(out.status!=='REALIZED'){retire();return out;}
      const u=out.utterance;
      if(u.actorId!==intent.actorId||u.recipientId!==intent.counterpartId||u.speechAct!=='ACKNOWLEDGE')fail('A0763C_ROOT_OUTPUT');
      current(r.revision);slot.utterance=u;return out;
    }catch{retire();return no('A0763C_ROOT_NOT_CURRENT');}
    finally{busy=false;}
  }
  function receiptFor(utterance,raw) {
    if(disposed||invalidated||busy)return noReceipt('A0763C_HOST_NOT_AVAILABLE');
    busy=true;
    try{
      const r=request(raw,['recipientId','revision']);
      if(!slot||slot.utterance!==utterance||slot.claimed||slot.terminal)return noReceipt('A0763C_NOT_ORIGINAL_ROOT');
      const context=current(r.revision);
      if(r.recipientId!==context.recipientId)return noReceipt('A0763C_WRONG_RECIPIENT');
      if(!slot.receipt){slot.receipt=Object.freeze({});receipts.set(slot.receipt,{slot,context});}
      return freeze({status:'RECEIPT_AVAILABLE',reason:null,receipt:slot.receipt});
    }catch{retire();return noReceipt('A0763C_ROOT_NOT_CURRENT');}
    finally{busy=false;}
  }
  function owned(receipt) {
    const record=receipts.get(receipt);
    if(!record||record.slot!==slot||slot.receipt!==receipt||slot.terminal)fail('A0763C_FOREIGN_RECEIPT');
    return record;
  }
  function check(receipt,r,claimed) {
    const record=owned(receipt);
    if(slot.claimed!==claimed||r.actorId!==record.context.recipientId)fail('A0763C_RECIPIENT_BINDING');
    const context=current(r.revision);
    if(JSON.stringify(context)!==JSON.stringify(record.context))fail('A0763C_RECEIPT_CONTEXT_DRIFT');
    return context;
  }
  function claim(receipt,raw) {
    if(disposed||invalidated||busy)return invalid('A0763C_HOST_NOT_AVAILABLE');
    busy=true;
    try{
      // An authentic root gets ONE evaluation, including veto/absence of authority.
      owned(receipt);
      if(slot.claimed)return invalid('A0763C_ALREADY_CLAIMED');
      const r=request(raw,['actorId','revision']),context=check(receipt,r,false);
      slot.claimed=true;return freeze({status:'VALID',reason:null,context});
    }catch{if(slot?.receipt===receipt)retire();return invalid('A0763C_RECEIPT_NOT_VALID');}
    finally{busy=false;}
  }
  function revalidateClaimed(receipt,raw,rawOptions={}) {
    if(disposed||invalidated||busy)return invalid('A0763C_HOST_NOT_AVAILABLE');
    busy=true;
    try{
      const mode=copy(rawOptions);exact(mode,[],['consume']);
      if(Object.hasOwn(mode,'consume')&&typeof mode.consume!=='boolean')fail('A0763C_HANDOFF_MODE');
      const r=request(raw,['actorId','revision']),context=check(receipt,r,true);
      if(mode.consume===true)retire();
      return freeze({status:'VALID',reason:null,context});
    }catch{if(slot?.receipt===receipt)retire();return invalid('A0763C_CLAIM_NOT_CURRENT');}
    finally{busy=false;}
  }
  function inspect() {
    if(!busy&&slot?.receipt){try{current(slot.intent.guard.revision);}catch{retire();}}
    return freeze({disposed,invalidated,pendingRoots:slot?1:0,pendingReceipts:slot?.receipt?1:0,
      claimed:slot?.claimed??false,terminal:slot?.terminal??false,retainedRootUtterances:slot?.utterance?1:0,
      history:0,backlog:0,timers:0,listeners:0,persistence:false,maxPendingReceipts:1});
  }
  function invalidate(){if(busy)fail('A0763C_REENTRANT_INVALIDATION');retire();slot=null;bridge.invalidate();invalidated=true;}
  function dispose(){if(busy)fail('A0763C_REENTRANT_DISPOSAL');retire();slot=null;bridge.dispose();realizer.dispose();disposed=true;}
  const host=Object.freeze({prepareRoot,realizeRoot,receiptFor,claim,revalidateClaimed,inspect,invalidate,dispose});
  hosts.add(host);return host;
}

export { createReceiptHost, isReceiptHost };
