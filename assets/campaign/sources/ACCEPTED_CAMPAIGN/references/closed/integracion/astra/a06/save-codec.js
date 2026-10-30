import { SAVE_AUTHORITY } from './save-authority.js';
import { FRONT_AUTHORITY } from '../a05/domain-authority.js';
import { recallMemory } from './vendor/motor-npc-vivo-v0.3-memory/memory.js';
import { validateIdentity } from '../a07.5b2.2r1/player-identity-knowledge.js';
import { integer, sync, list, capture, exact, source, fail, text, unique, freeze, A06_LIMITS, bytes } from './safe-data.js';

/** Codec only: no runtime, storage, clocks, RNG, narrative evaluation or controller execution. */
const SAVE_SCHEMA_VERSION = 2;
const ASTRA_SAVE_VERSION = 1;
const ASTRA_SAVE_FORMAT = 'ASTRA_SEMANTIC_SAVE';
const LEVELS = ['DESCONOCIDO','SOSPECHA','SABE','CONFIRMADO'];
const TOPICS = Array.from({length:10},(_,i)=>`R${i+1}`);
const STRUCTURED_FIELDS = ['boundedEpisodicMemory','baseRelations'];
const RELATION_FIELDS = ['afinidad','confianza','respeto','deuda','temor','rivalidad'];
const NATIVE_FIELDS = ['saveSchemaVersion','gates','player','pos','flags','quests','salas','visitadas','atlas',
  'saturacion','turnoGlobal','relojEcologico','respawnEn','interrupcionEn','errantes','cadaveres','objetosTirados','fecha'];
const emptySemantic = () => ({npc:[],populations:[],fronts:null});
const has = (o,k) => Object.hasOwn(o,k);
const withinTurn = (v,turn) => integer(v,turn);

function createSaveCodec({ validateNative, npcCatalogues = [], populationBindings = [] }) {
  // The trusted validator is the unchanged validarSave329 bridge, not an AI callback.
  const nativeValidator = sync(validateNative), catalogues = new Map(), bindings = new Map();
  for (const c of list(capture(npcCatalogues),32)) {
    exact(c,['actorId','source','values']); source(c.source);
    const row = SAVE_AUTHORITY.npc[c.actorId]; if (!row || catalogues.has(c.actorId)) fail('A06_ACTOR_CATALOGUE');
    exact(c.values,[],row.fields.filter(f => !['lastSimulatedTurn','consecutiveTurns',...STRUCTURED_FIELDS].includes(f)));
    for (const values of Object.values(c.values)) { list(values,128).forEach(text); unique(values); }
    catalogues.set(c.actorId,freeze(c));
  }
  for (const b of list(capture(populationBindings),A06_LIMITS.populations)) {
    exact(b,['populationId','speciesId','territoryId','source']); source(b.source);
    text(b.populationId); text(b.territoryId);
    if (!has(SAVE_AUTHORITY.species,b.speciesId) || bindings.has(b.populationId)) fail('A06_POPULATION_BINDING');
    if ([...bindings.values()].some(v=>v.speciesId === b.speciesId && v.territoryId === b.territoryId)) fail('A06_DUPLICATE_POPULATION_SCOPE');
    bindings.set(b.populationId,freeze(b));
  }
  function native(s) {
    exact(s,NATIVE_FIELDS,[...(has(s,'npc_version') ? ['npc_version','posicionNPC','conocimientoNPC'] : []),'playerIdentityKnowledge']);
    if(has(s,'playerIdentityKnowledge'))validateIdentity(s.playerIdentityKnowledge);
    if (s.saveSchemaVersion !== SAVE_SCHEMA_VERSION) fail('A06_NATIVE_VERSION');
    integer(s.turnoGlobal);
    // Validators receive a separate copy. Host validators cannot mutate the returned snapshot.
    let errors;
    try { errors = nativeValidator(capture(s)); } catch { fail('A06_NATIVE_INVALID'); }
    if (!Array.isArray(errors) || errors.length) fail('A06_NATIVE_INVALID');
    // Corrupt saved combat and current host combat are separate gates.
    if (s.flags?.arc1?.estadoM18 === 'COMBATE') fail('A06_COMBAT_SAVE');
    return s;
  }
  function semantic(s,runtime) {
    exact(s,['npc','populations','fronts']); const turn = runtime.turnoGlobal;
    const actorIds = [];
    for (const n of list(s.npc,32)) {
      exact(n,['actorId'],['controller','knowledgeProvenance']);
      if (!has(SAVE_AUTHORITY.npc,n.actorId)) fail('A06_ACTOR'); actorIds.push(n.actorId);
      if (runtime.npc_version !== 1) fail('A06_NPC_EXTENSION_REQUIRES_NATIVE_NPC');
      if (has(n,'controller')) {
        const row = SAVE_AUTHORITY.npc[n.actorId], c = n.controller;
        exact(c,[],row.fields);
        if (!Object.keys(c).length) fail('A06_EMPTY_CONTROLLER');
        for (const [field,value] of Object.entries(c)) {
          if (field === 'lastSimulatedTurn') { withinTurn(value,turn); continue; }
          if (field === 'consecutiveTurns') { integer(value); continue; }
          if (field === 'baseRelations') {
            exact(value,RELATION_FIELDS);
            for (const v of Object.values(value)) if (!Number.isFinite(v) || v < 0 || v > 100) fail('A06_RELATION_BASE');
            continue;
          }
          if (field === 'boundedEpisodicMemory') {
            exact(value,['version','clock','entries']); list(value.entries,32);
            if (value.clock !== null) withinTurn(value.clock,turn);
            for (const e of value.entries) {
              exact(e,['key','kind','subject','value','importance','confidence','firstTurn','lastTurn','count','expiresTurn']);
              if (!['PLAYER_HELPED_ME','PLAYER_LIED'].includes(e.kind) || e.subject !== 'player' || typeof e.value !== 'boolean') fail('A06_SOCIAL_MEMORY_SOURCE');
            }
            let active; try { active = recallMemory(value,turn); } catch { fail('A06_EPISODIC_MEMORY'); }
            if (active.length !== value.entries.length) fail('A06_EXPIRED_MEMORY_NOT_PROJECTED');
            continue;
          }
          const allowed = catalogues.get(n.actorId)?.values[field];
          if (!allowed) fail('A06_UNSOURCED_CONTROLLER_VALUE');
          const values = field === 'overrideIds' ? list(value,A06_LIMITS.overrides) : [value];
          unique(values); for (const v of values) if (!allowed.includes(v)) fail('A06_CONTROLLER_VALUE');
        }
        if (has(c,'consecutiveTurns') !== has(c,'lastAction')) fail('A06_UTILITY_MEMORY_PAIR');
        if (has(c,'boundedEpisodicMemory') !== has(c,'baseRelations')) fail('A06_SOCIAL_MEMORY_PAIR');
      }
      if (has(n,'knowledgeProvenance')) {
        const seenTopics = [];
        for (const k of list(n.knowledgeProvenance,10)) {
          exact(k,['topic','from','to','sourceLevel','kind','sourceActorId','observedTurn']);
          if (!TOPICS.includes(k.topic) || !LEVELS.includes(k.from) || !LEVELS.includes(k.to) || !LEVELS.includes(k.sourceLevel)) fail('A06_KNOWLEDGE');
          seenTopics.push(k.topic); withinTurn(k.observedTurn,turn);
          if (!has(SAVE_AUTHORITY.npc,k.sourceActorId) || LEVELS.indexOf(k.to) <= LEVELS.indexOf(k.from) ||
            LEVELS.indexOf(k.from) < LEVELS.indexOf(SAVE_AUTHORITY.npc[n.actorId].initialKnowledge[k.topic]) ||
            LEVELS.indexOf(k.to) > LEVELS.indexOf(k.sourceLevel) || runtime.conocimientoNPC[n.actorId][k.topic] !== k.to) fail('A06_KNOWLEDGE_CORRELATION');
          if (k.kind === 'WITNESSED') { if (k.sourceActorId !== n.actorId) fail('A06_KNOWLEDGE_WITNESS'); }
          else if (k.kind === 'AUTHORIZED_COMMUNICATION') { if (k.sourceActorId === n.actorId) fail('A06_KNOWLEDGE_SENDER'); }
          else fail('A06_KNOWLEDGE_KIND');
        }
        unique(seenTopics);
      }
      if (!has(n,'controller') && !has(n,'knowledgeProvenance')) fail('A06_EMPTY_ACTOR_EXTENSION');
    }
    unique(actorIds);
    const populationIds = [];
    for (const p of list(s.populations,A06_LIMITS.populations)) {
      exact(p,['populationId','speciesId','territoryId','pressure','maxTierReached','lastUpdate','recentEventIds','patterns']);
      const b = bindings.get(p.populationId), species = SAVE_AUTHORITY.species[p.speciesId];
      if (!b || b.speciesId !== p.speciesId || b.territoryId !== p.territoryId) fail('A06_POPULATION_SCOPE');
      populationIds.push(p.populationId); withinTurn(p.lastUpdate,turn);
      integer(p.maxTierReached,4);
      const ceiling = species.ceilings.find(c=>c.playerStage === runtime.player.etapa)?.tier;
      if (ceiling === undefined) fail('A06_PLAYER_STAGE');
      // Reject corrupt precaching; never clamp, decay or advance learning on SAVE/LOAD.
      const caps = [19,44,69,89,100];
      if (!Number.isFinite(p.pressure) || p.pressure < 0 || p.pressure > caps[ceiling] || p.maxTierReached > ceiling) fail('A06_LEARNING_CEILING');
      const pressureTier = p.pressure >= 90 ? 4 : p.pressure >= 70 ? 3 : p.pressure >= 45 ? 2 : p.pressure >= 20 ? 1 : 0;
      if (p.maxTierReached < pressureTier) fail('A06_MAX_TIER_BELOW_PRESSURE');
      list(p.recentEventIds,A06_LIMITS.recentEvents).forEach(text); unique(p.recentEventIds);
      list(p.patterns,A06_LIMITS.patterns); let previous = -1;
      if (p.patterns.length && p.maxTierReached < 2) fail('A06_PATTERN_LEARNING_REQUIRED');
      for (const e of p.patterns) {
        exact(e,['category','result','round']); integer(e.round);
        if (!species.categories.includes(e.category) || !['EFECTIVA','FALLIDA','NEUTRA'].includes(e.result) || e.round < previous) fail('A06_PATTERN');
        previous = e.round;
      }
    }
    unique(populationIds);
    if (s.fronts !== null) {
      exact(s.fronts,['frentes','frentesMeta']); exact(s.fronts.frentes,FRONT_AUTHORITY.ids);
      const terminal = [];
      for (const id of FRONT_AUTHORITY.ids) {
        const v = s.fronts.frentes[id]; if (!FRONT_AUTHORITY.states.includes(v)) fail('A06_FRONT_STATE');
        if (v !== 'PENDIENTE') terminal.push(id);
      }
      exact(s.fronts.frentesMeta,terminal);
      for (const id of terminal) {
        const meta = s.fronts.frentesMeta[id]; exact(meta,['resueltoPor']); const value = meta.resueltoPor;
        if (!['JUGADOR','SISTEMA',`EQUIPO:${id}`,...FRONT_AUTHORITY.companions.map(c=>`COMPANERO:${c}`)].includes(value)) fail('A06_FRONT_ATTRIBUTION');
      }
    }
    return s;
  }
  function checkEnvelope(e) {
    exact(e,['format','astraSaveVersion','runtime','semantic']);
    if (e.format !== ASTRA_SAVE_FORMAT || e.astraSaveVersion !== ASTRA_SAVE_VERSION) fail('A06_EXTENSION_VERSION');
    native(e.runtime); semantic(e.semantic,e.runtime); return freeze(e);
  }
  function encode(runtime,semantics = emptySemantic()) {
    const e = checkEnvelope(capture({format:ASTRA_SAVE_FORMAT,astraSaveVersion:ASTRA_SAVE_VERSION,runtime,semantic:semantics}));
    const out = JSON.stringify(e); if (bytes(out) > A06_LIMITS.bytes) fail('A06_JSON_BOUND'); return out;
  }
  function decode(raw) {
    if (typeof raw !== 'string' || bytes(raw) > A06_LIMITS.bytes) fail('A06_JSON_BOUND');
    let input; try { input = JSON.parse(raw); } catch { fail('A06_JSON_PARSE'); }
    const e = capture(input); if (!e || typeof e !== 'object' || Array.isArray(e)) fail('A06_OBJECT_REQUIRED');
    if (has(e,'format')) return checkEnvelope(e);
    // Native schema 2 remains readable, including its legacy variant without npc_version.
    return freeze({format:ASTRA_SAVE_FORMAT,astraSaveVersion:ASTRA_SAVE_VERSION,runtime:native(e),semantic:emptySemantic()});
  }
  return Object.freeze({encode,decode});
}

export { ASTRA_SAVE_FORMAT, ASTRA_SAVE_VERSION, SAVE_SCHEMA_VERSION, createSaveCodec };
