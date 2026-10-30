(function(root,build) {
  "use strict";
  const api=build();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.GrullaUltiEventLedgerV264=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const VERSION="GRULLA_ULTI_V264_NATIVE_TERMINAL_CANCEL_01";
  const ID=/^[A-Za-z][A-Za-z0-9_.:-]{0,99}$/;
  const UID=/^(FIRE|WATER|METAL|EARTH|WIND)_[A-Z0-9_]+$/;
  const string=s=>typeof s==="string"&&ID.test(s);
  const number=n=>Number.isSafeInteger(n)&&n>=0;
  const quantity=n=>typeof n==="number"&&Number.isFinite(n)&&n>=0;
  // V218 returns a 24-character HEX token, often starting with a digit.
  const tokenValid=s=>typeof s==="string"&&s.length>0&&s.length<=128&&
    !/[\u0000-\u001f\u007f]/.test(s);
  const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x)&&
    (Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);
  const must=(condition,why)=>{if(!condition)throw Error("V264_LEDGER_"+why)};
  const exact=(o,keys)=>{must(plain(o),"EVENT_OBJECT");
    must(Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k)),
      "EVENT_FIELDS_"+String(o.type));};
  const clone=o=>JSON.parse(JSON.stringify(o));
  const keys={
    CAST_COMMITTED:["eventId","type","uid","castId","ownerId","sourceActionId","turn","mode","qiBefore","qiAfter"],
    PACKET_APPLIED:["eventId","type","castId","packetId","targetId","turn","sourceCategory","nativePacketId","hpBefore","hpAfter"],
    DEFERRED_ARMED:["eventId","type","castId","windowId","effectId","turn"],
    DEFERRED_RESOLVED:["eventId","type","castId","windowId","nativeEventId","turn"],
    DEFERRED_CANCELLED:["eventId","type","castId","windowId","reason","turn"],
    A08_OPEN:["eventId","type","instanceId","speciesId","seed"],
    A08_ANNOUNCE:["eventId","type","instanceId","token","abilityId","turn"],
    A08_COMMIT:["eventId","type","instanceId","token","abilityId","turn","controlled","nativeActionId"],
    A08_REACTION:["eventId","type","instanceId","turn","tier","t1Armed","t2Predictions","t3Counters"],
    A08_CANCEL:["eventId","type","instanceId","token","abilityId","turn","reason","nativeTerminalEventId"],
    A08_CLOSE:["eventId","type","instanceId"],
    ENCOUNTER_CLOSE:["eventId","type","turn"]
  };
  const own=(m,k)=>Object.hasOwn(m,k);
  function newState(){
    return {events:[],ids:new Set(),cast:null,packets:new Set(),
      windows:new Map(),a08:new Map(),tokens:new Set(),
      nativeIds:new Set(),closed:false,lastTurn:0};
  }
  function copyState(s){
    return {...s,events:[...s.events],ids:new Set(s.ids),
      packets:new Set(s.packets),nativeIds:new Set(s.nativeIds),
      windows:new Map([...s.windows].map(([k,v])=>[k,{...v}])),
      a08:new Map([...s.a08].map(([k,v])=>[k,{...v,
        lastCounters:{...v.lastCounters},pending:v.pending&&{...v.pending}}])),
      tokens:new Set(s.tokens),cast:s.cast&&{...s.cast}};
  }
  function validateAndApply(s,e,contract){
    must(own(keys,e.type),"EVENT_TYPE_DENIED");
    exact(e,e.type==="A08_OPEN"&&e.experimentalHostileControl===true?[...keys[e.type],"experimentalHostileControl"]:keys[e.type]);
    must(string(e.eventId)&&!s.ids.has(e.eventId),"DUPLICATE_OR_INVALID_EVENT_ID");
    must(!s.closed,"ENCOUNTER_ALREADY_CLOSED");
    if(own(e,"turn")){must(number(e.turn),"TURN");must(e.turn>=s.lastTurn,"NONMONOTONIC_TURN");}
    if(e.type==="CAST_COMMITTED"){
      must(s.cast===null,"SECOND_ULTI_DENIED");
      must(string(e.castId)&&string(e.ownerId)&&string(e.sourceActionId),"CAST_IDS");
      must(contract.equipped.includes(e.uid)&&contract.allowed.has(e.uid)&&UID.test(e.uid),"UNKNOWN_OR_UNEQUIPPED_UID");
      must(e.mode===null||(typeof e.mode==="string"&&contract.modeGate[e.uid]?.includes(e.mode)),
        "UNAPPROVED_SOURCE_MODE");
      must(quantity(e.qiBefore)&&quantity(e.qiAfter)&&e.qiAfter<=e.qiBefore,"QI_RECEIPT_INCONSISTENT");
      // Río can legally pay 0 on true exhaustion. No guessed nominal cost.
      s.cast={uid:e.uid,castId:e.castId,ownerId:e.ownerId,
        actionId:e.sourceActionId,turn:e.turn,qiDelta:e.qiBefore-e.qiAfter};
    }else if(e.type==="PACKET_APPLIED"){
      must(s.cast&&e.castId===s.cast.castId,"UNKNOWN_CAST_PACKET");
      must(string(e.packetId)&&!s.packets.has(e.packetId)&&
        string(e.nativePacketId)&&!s.nativeIds.has(e.nativePacketId)&&
        string(e.targetId)&&string(e.sourceCategory),"PACKET_IDS_OR_CATEGORY");
      must(quantity(e.hpBefore)&&quantity(e.hpAfter),"PHYSICAL_HP_RECEIPT");
      must(!/CONCORDAN|ECO(_|$)|ECHO/.test(e.sourceCategory.toUpperCase()),
        "ULTI_CANNOT_GENERATE_CANONICAL_CONCORDANCE");
      s.packets.add(e.packetId);s.nativeIds.add(e.nativePacketId);
    }else if(e.type==="DEFERRED_ARMED"){
      must(s.cast&&e.castId===s.cast.castId&&string(e.windowId)&&string(e.effectId)&&
        !s.windows.has(e.windowId),"DUPLICATE_OR_UNBOUND_WINDOW");
      s.windows.set(e.windowId,{castId:e.castId,effectId:e.effectId,armed:e.turn,status:"PENDING"});
    }else if(e.type==="DEFERRED_RESOLVED"||e.type==="DEFERRED_CANCELLED"){
      const w=s.windows.get(e.windowId);
      must(w&&w.status==="PENDING"&&w.castId===e.castId&&e.castId===s.cast?.castId&&
        e.turn>=w.armed,"ORPHAN_OR_DOUBLE_DEFERRED");
      if(e.type==="DEFERRED_RESOLVED"){
        must(string(e.nativeEventId)&&!s.nativeIds.has(e.nativeEventId),"DEFERRED_NATIVE_RECEIPT");
        s.nativeIds.add(e.nativeEventId);
      }else must(string(e.reason),"CANCEL_REASON");
      w.status=e.type==="DEFERRED_RESOLVED"?"RESOLVED":"CANCELLED";
    }else if(e.type==="A08_OPEN"){
      must(string(e.instanceId)&&string(e.speciesId)&&number(e.seed)&&
        !s.a08.has(e.instanceId),"A08_DUPLICATE_OPEN");
      must(e.experimentalHostileControl===undefined||e.experimentalHostileControl===true&&["devorador_niebla","halcon_tormenta"].includes(e.speciesId),"A08_OPTIONAL_CONTROL_RESEARCH_SCOPE");
      s.a08.set(e.instanceId,{speciesId:e.speciesId,experimentalHostileControl:e.experimentalHostileControl===true,pending:null,closed:false,
        lastCounters:{t1Armed:0,t2Predictions:0,t3Counters:0},tier:null,commits:0});
    }else if(e.type==="A08_ANNOUNCE"){
      const a=s.a08.get(e.instanceId);
      must(a&&!a.closed&&!a.pending&&tokenValid(e.token)&&!s.tokens.has(e.token)&&
        (["BASIC","CANONICAL_TECHNIQUE"].includes(e.abilityId)||e.abilityId==="HOSTILE_CONTROL"&&a.experimentalHostileControl===true),"A08_ANNOUNCE_TOKEN_OR_CADENCE");
      s.tokens.add(e.token);
      a.pending={token:e.token,turn:e.turn,abilityId:e.abilityId};
    }else if(e.type==="A08_COMMIT"){
      const a=s.a08.get(e.instanceId),p=a?.pending;
      must(a&&!a.closed&&p&&p.token===e.token&&p.turn===e.turn&&
        p.abilityId===e.abilityId&&typeof e.controlled==="boolean","A08_COMMIT_TOKEN_MISMATCH");
      if(e.controlled)must(e.nativeActionId===null,"A08_CONTROLLED_HAS_FAKE_ACTION");
      else must(string(e.nativeActionId)&&!s.nativeIds.has(e.nativeActionId),
        "A08_COMMIT_MISSING_NATIVE_ACTION");
      if(!e.controlled)s.nativeIds.add(e.nativeActionId);
      a.pending=null;a.commits++;
    }else if(e.type==="A08_CANCEL"){
      const a=s.a08.get(e.instanceId),p=a?.pending;
      must(a&&!a.closed&&p&&p.token===e.token&&p.abilityId===e.abilityId&&p.turn===e.turn,
        "A08_CANCEL_TOKEN_MISMATCH");
      must(["OWNER_TERMINAL","PLAYER_TERMINAL","ENCOUNTER_FLED"].includes(e.reason)&&string(e.nativeTerminalEventId)&&!s.nativeIds.has(e.nativeTerminalEventId),
        "A08_CANCEL_NATIVE_TERMINAL_REQUIRED");
      s.nativeIds.add(e.nativeTerminalEventId);a.pending=null;
    }else if(e.type==="A08_REACTION"){
      const a=s.a08.get(e.instanceId);
      must(a&&!a.closed&&["T0","T1","T2","T3"].includes(e.tier),"A08_REACTION_TIER");
      if(a.tier===null)a.tier=e.tier;
      must(a.tier===e.tier,"A08_TIER_TRANSITION_UNRATIFIED");
      for(const k of ["t1Armed","t2Predictions","t3Counters"])
        must(number(e[k])&&e[k]>=a.lastCounters[k],"A08_COUNTER_NONMONOTONIC_"+k);
      must(e.t3Counters<=1&&
        (e.tier!=="T0"||!e.t1Armed)&&
        (!["T0","T1"].includes(e.tier)||!e.t2Predictions)&&
        (e.tier==="T3"||!e.t3Counters),"A08_EARLY_OR_DUPLICATE_REACTION");
      a.lastCounters={t1Armed:e.t1Armed,t2Predictions:e.t2Predictions,
        t3Counters:e.t3Counters};
      // REACTION is telemetry of verified E1 consequences; not a free owner turn.
    }else if(e.type==="A08_CLOSE"){
      const a=s.a08.get(e.instanceId);
      must(a&&!a.closed&&!a.pending,"A08_CLOSE_WITH_PENDING_ACTION");
      a.closed=true;
    }else if(e.type==="ENCOUNTER_CLOSE"){
      must([...s.a08.values()].every(a=>a.closed&&!a.pending),"PENDING_A08_OWNER");
      must([...s.windows.values()].every(w=>w.status!=="PENDING"),"PENDING_DEFERRED_WINDOW");
      s.closed=true;
    }
    if(own(e,"turn"))s.lastTurn=e.turn;
    s.ids.add(e.eventId);s.events.push(e);
  }
  function createSession(config){
    must(plain(config)&&string(config.encounterId)&&Array.isArray(config.equipped)&&
      Array.isArray(config.allowed)&&plain(config.modeGate)&&plain(config.trust),
      "MISSING_CONTRACT");
    must(typeof config.trust.authorizeLive==="function"&&
      typeof config.trust.verifyArchive==="function","REQUIRED_TRUSTED_HOST_CALLBACKS");
    must(config.equipped.length<=2&&new Set(config.equipped).size===config.equipped.length,
      "EQUIPPED_MAX_TWO");
    const allowed=new Set(config.allowed);
    must(allowed.size===25&&[...allowed].every(u=>typeof u==="string"&&UID.test(u)),
      "EXACT_25_SOURCE_UID_AUTHORITY");
    must(config.equipped.every(x=>allowed.has(x)),"EQUIPPED_UID_NOT_ALLOWED");
    for(const [uid,modes] of Object.entries(config.modeGate)){
      must(allowed.has(uid)&&Array.isArray(modes)&&modes.length&&new Set(modes).size===modes.length,
        "UNKNOWN_OR_DUPLICATE_MODE_AUTHORITY");
    }
    const policy={allowed,modeGate:config.modeGate,equipped:[...config.equipped]};
    let state=newState();
    function ingest(event,receipt){
      must(plain(event)&&plain(receipt),"EVENT_OR_RECEIPT_MISSING");
      const isolated=clone(event);
      must(config.trust.authorizeLive(clone(isolated),clone(receipt))===true,
        "NATIVE_SOURCE_NOT_AUTHENTICATED");
      const candidate=copyState(state);
      validateAndApply(candidate,isolated,policy);
      state=candidate;
      return {accepted:true,seq:state.events.length,eventId:isolated.eventId};
    }
    function summary(){
      return Object.freeze({encounterId:config.encounterId,cast:state.cast&&{...state.cast},
        eventCount:state.events.length,packetCount:state.packets.size,
        deferredPending:[...state.windows.values()].filter(w=>w.status==="PENDING").length,
        openOwners:[...state.a08.values()].filter(a=>!a.closed).length,
        closed:state.closed,source:"LAB_ONLY_NO_NATIVE_SAVE"});
    }
    function exportSnapshot(){
      return clone({schema:VERSION,encounterId:config.encounterId,
        equipped:policy.equipped,events:state.events,release:"LAB_ONLY_NOT_HTML_SAVE",
        nativeReceiptsStored:false});
    }
    function replay(snapshot){
      must(plain(snapshot)&&snapshot.schema===VERSION&&
        snapshot.encounterId===config.encounterId&&
        Array.isArray(snapshot.equipped)&&
        JSON.stringify(snapshot.equipped)===JSON.stringify(policy.equipped)&&
        snapshot.release==="LAB_ONLY_NOT_HTML_SAVE"&&
        snapshot.nativeReceiptsStored===false&&Array.isArray(snapshot.events),
        "ARCHIVE_SCHEMA_OR_ENCOUNTER_MISMATCH");
      // Replaying a snapshot is NOT live physical execution. The host must
      // authenticate its archive before a single state transition.
      must(config.trust.verifyArchive(clone(snapshot))===true,
        "ARCHIVE_NOT_AUTHENTICATED");
      const fresh=newState();
      for(const event of snapshot.events)validateAndApply(fresh,clone(event),policy);
      state=fresh;
      return summary();
    }
    return Object.freeze({version:VERSION,ingest,summary,exportSnapshot,replay});
  }
  return Object.freeze({VERSION,createSession});
});
