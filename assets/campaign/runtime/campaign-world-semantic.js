import { bindSemantic, requireRestorePermit, clone } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { validateIdentity } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07.5b2.2r1/player-identity-knowledge.js';

// The accepted G08 World port, separated from its old numeric composition root.
const FIELDS=['player','pos','flags','quests','gates','atlas','saturacion','turnoGlobal','relojEcologico','respawnEn','interrupcionEn','errantes','cadaveres','objetosTirados','posicionNPC','conocimientoNPC','playerIdentityKnowledge','vivos','terminado'];
function createCampaignWorldPort(g,rooms,herbalism=null){const world={};bindSemantic(world,{capture(){const d={version:1,a08TerritoryVersion:7,visitadas:[...g.visitadas],salas:Object.fromEntries(Object.entries(g.rooms).map(([id,s])=>[id,{items:s.items||[],oculto:s.oculto||[]}]))};for(const k of FIELDS)if(g[k]!==undefined)d[k]=g[k];return clone(d);},
 prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1||!rooms[d.pos]||!Array.isArray(d.visitadas)||new Set(d.visitadas).size!==d.visitadas.length||d.visitadas.some(id=>!rooms[id]))throw Error('A08_CAMPAIGN_WORLD_SCOPE');if(d.playerIdentityKnowledge)validateIdentity(d.playerIdentityKnowledge);
  for(const k of ['turnoGlobal','relojEcologico'])if(!Number.isSafeInteger(d[k])||d[k]<0)throw Error('A08_WORLD_CLOCK');
  const herbRestore=herbalism?.prepareRestore(d.player,c.envelope.domains.Player.state,c.permit,c.envelope);const next=clone(d);return {apply(){const old=Object.fromEntries(FIELDS.filter(k=>k in d).map(k=>[k,g[k]]));old.rooms=g.rooms;old.visitadas=g.visitadas;old.pregunta=g.pregunta;const baseRooms=g.rooms??rooms,newRooms={...baseRooms};for(const[id,s]of Object.entries(next.salas)){if(!rooms[id])throw Error('A08_WORLD_ROOM');newRooms[id]={...baseRooms[id],items:s.items,oculto:s.oculto};}for(const k of FIELDS)if(k in next)g[k]=next[k];g.rooms=newRooms;g.visitadas=new Set(next.visitadas);g.pregunta=null;const undoHerb=herbRestore?.apply();return ()=>{undoHerb?.();Object.assign(g,old);};}};
 }});return world;}

export { createCampaignWorldPort };
