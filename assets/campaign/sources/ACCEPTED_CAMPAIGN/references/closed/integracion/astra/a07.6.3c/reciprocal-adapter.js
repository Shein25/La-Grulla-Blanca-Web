import { isReceiptHost } from './receipt-host.js';
import { ACKNOWLEDGE_ACTORS, ACKNOWLEDGE_RELATION_AUTHORITY, ACKNOWLEDGE_EDGE } from '../a07.6.2/acknowledge-authority.js';
import { freeze, fail, exact, copy } from '../a07/safe-data.js';

/** Authorized pilot: B's own current receipt -> one terminal ACKNOWLEDGE. */
const bridges=new WeakSet();
const isReciprocalValidationBridge=value=>bridges.has(value);
const RECIPROCAL_AUTHORITY=freeze({
  path:'docs/integracion/astra/a07.6.3c/AUTORIZACION_A07_6_3C.md',
  sha256:'81e44d50cd0c92994a5839d27a1338b7e8f65560109ce450a187987e1dbd829b',
  locator:'6-14: DIRECT_SOCIAL_ADDRESS; own pilot recipient binding; one-hop terminal'
});
const integer=x=>{if(!Number.isSafeInteger(x)||x<0)fail('A0763C_INTEGER');};
function constant(a,b){
  if(Array.isArray(b)){
    if(!Array.isArray(a)||a.length!==b.length)fail('A0763C_CONTRACT_CONSTANT');
    for(let k=0;k<b.length;k++)constant(a[k],b[k]);
  }
  else if(b&&typeof b==='object'){exact(a,Object.keys(b));for(const k of Object.keys(b))constant(a[k],b[k]);}
  else if(a!==b)fail('A0763C_CONTRACT_CONSTANT');
}
/** Shape validation returns detached data; it never establishes capability ownership. */
function validateReciprocalIntent(raw){
  const intent=copy(raw);
  exact(intent,['schemaVersion','actorId','counterpartId','intentKind','topicBasis','reasonBasis','relationBasis','reputationBasis','guard']);
  if(intent.schemaVersion!==2||intent.intentKind!=='ACKNOWLEDGE'||intent.topicBasis!==null)fail('A0763C_INTENT');
  if(!ACKNOWLEDGE_ACTORS.includes(intent.actorId)||intent.counterpartId!==ACKNOWLEDGE_ACTORS.find(x=>x!==intent.actorId))fail('A0763C_PAIR');
  const r=intent.reasonBasis,g=intent.guard;
  exact(r,['motive','receiptCapability','rootActorId','rootSequence','hop']);
  if(r.motive!=='DIRECT_SOCIAL_ADDRESS'||r.hop!==1||r.rootActorId!==intent.counterpartId)fail('A0763C_REASON');
  exact(r.receiptCapability,[]);integer(r.rootSequence);if(r.rootSequence<1)fail('A0763C_ROOT_SEQUENCE');
  exact(g,['revision','turn','roomId','activeAreaId']);integer(g.turn);
  for(const k of ['revision','roomId','activeAreaId'])if(typeof g[k]!=='string'||!g[k].length||g[k].length>128)fail('A0763C_GUARD');
  constant(intent.relationBasis,{
    kind:'VERIFIED_RELATION_EDGE',edgeId:ACKNOWLEDGE_EDGE.id,actorId:intent.actorId,counterpartId:intent.counterpartId,
    scope:ACKNOWLEDGE_EDGE.scope,relationType:ACKNOWLEDGE_EDGE.relationType,classification:ACKNOWLEDGE_EDGE.classification,
    source:ACKNOWLEDGE_EDGE.source,authority:ACKNOWLEDGE_RELATION_AUTHORITY
  });
  constant(intent.reputationBasis,{status:'UNAVAILABLE',reason:'NOT_REQUIRED_FOR_PURE_ACKNOWLEDGEMENT'});
  return freeze(intent);
}
function createReciprocalValidationBridge(options){
  exact(options,['receiptHost']);const host=options.receiptHost;
  if(!isReceiptHost(host))fail('A0763C_OWNED_RECEIPT_HOST_REQUIRED');
  let pending=null,owned=new WeakMap(),busy=false,disposed=false;
  const out=(status,reason=null,intent=null)=>freeze({status,reasons:reason?[reason]:[],intent});
  const validity=(status,reason=null)=>freeze({status,reasons:reason?[reason]:[]});
  function clear(){pending=null;owned=new WeakMap();}
  function prepare(receipt,raw){
    if(disposed||busy)return out('NO_CONVERSATIONAL_INTENT','A0763C_RECIPIENT_UNAVAILABLE');
    busy=true;
    try{
      const r=copy(raw);exact(r,['actorId','revision']);
      // Claim consumes the one permitted evaluation; friendship is not a policy.
      const result=host.claim(receipt,r);
      if(result.status!=='VALID')return out('NO_CONVERSATIONAL_INTENT',result.reason);
      const c=result.context;
      if(!ACKNOWLEDGE_ACTORS.includes(r.actorId)||r.actorId!==c.recipientId||c.hop!==0)fail('A0763C_BINDING');
      const value={
        schemaVersion:2,actorId:r.actorId,counterpartId:c.rootActorId,intentKind:'ACKNOWLEDGE',topicBasis:null,
        reasonBasis:{motive:'DIRECT_SOCIAL_ADDRESS',receiptCapability:receipt,rootActorId:c.rootActorId,rootSequence:c.rootSequence,hop:1},
        relationBasis:{kind:'VERIFIED_RELATION_EDGE',edgeId:ACKNOWLEDGE_EDGE.id,actorId:r.actorId,counterpartId:c.rootActorId,
          scope:ACKNOWLEDGE_EDGE.scope,relationType:ACKNOWLEDGE_EDGE.relationType,classification:ACKNOWLEDGE_EDGE.classification,
          source:copy(ACKNOWLEDGE_EDGE.source),authority:copy(ACKNOWLEDGE_RELATION_AUTHORITY)},
        reputationBasis:{status:'UNAVAILABLE',reason:'NOT_REQUIRED_FOR_PURE_ACKNOWLEDGEMENT'},guard:copy(c.guard)
      };
      validateReciprocalIntent(value);clear();pending=freeze(value);owned.set(pending,receipt);
      return out('PROPOSED',null,pending);
    }catch{return out('NO_CONVERSATIONAL_INTENT','A0763C_RECIPIENT_AUTHORITY_NOT_VERIFIED');}
    finally{busy=false;}
  }
  function validate(intent,raw,consume){
    if(disposed||busy)return validity('INVALID','A0763C_RECIPIENT_UNAVAILABLE');
    const receipt=owned.get(intent);
    if(!receipt||intent!==pending)return validity('INVALID','A0763C_FOREIGN_INTENT');
    busy=true;
    try{
      const request=copy(raw);exact(request,['revision']);
      const checked=host.revalidateClaimed(receipt,{actorId:intent.actorId,revision:request.revision},{consume:false});
      if(checked.status!=='VALID'||JSON.stringify(checked.context.guard)!==JSON.stringify(intent.guard))fail('A0763C_STALE_INTENT');
      validateReciprocalIntent(intent);
      if(consume){
        // One-shot handoff to the SAME realizer. Failure afterwards is terminal.
        const handoff=host.revalidateClaimed(receipt,{actorId:intent.actorId,revision:request.revision},{consume:true});
        clear();if(handoff.status!=='VALID')fail('A0763C_HANDOFF_NOT_CURRENT');
      }
      return validity('VALID');
    }catch{clear();return validity('INVALID','A0763C_CURRENT_RECIPIENT_AUTHORITY_NOT_VERIFIED');}
    finally{busy=false;}
  }
  function invalidate(){if(busy)fail('A0763C_REENTRANT_INVALIDATION');clear();host.invalidate();}
  function dispose(){if(busy)fail('A0763C_REENTRANT_DISPOSAL');clear();disposed=true;host.dispose();}
  const bridge=Object.freeze({
    prepare,check:(intent,r)=>validate(intent,r,false),
    revalidate:(intent,r)=>validate(intent,r,true),invalidate,dispose,
    inspect:()=>{if(!host.inspect().pendingReceipts)clear();return freeze({disposed,pendingReciprocalIntents:pending?1:0,
      maxPendingReciprocalIntents:1,history:0,backlog:0,timers:0,persistence:false,terminalHandoff:true});}
  });
  bridges.add(bridge);return bridge;
}

export { RECIPROCAL_AUTHORITY, createReciprocalValidationBridge, isReciprocalValidationBridge, validateReciprocalIntent };
