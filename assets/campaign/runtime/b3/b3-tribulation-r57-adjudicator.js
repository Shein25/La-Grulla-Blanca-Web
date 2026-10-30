import { R57_TRIBULATION_CONTRACT } from './b3-tribulation-r57-data.js';

// R57 Tribulación del Corazón: exact historical two-choice logic, not a new combat roll.
// Pure read-only adjudicator. It is NOT allowed to mint native G08 receipts.
const fail=s=>{throw Error('B3_R57_TRIB_'+s);};
const seeds=Object.freeze(Object.keys(R57_TRIBULATION_CONTRACT.firstBySeed));
const frozen=o=>Object.freeze(structuredClone(o));
const ALLOWED_R57_DAO_SEEDS=seeds;
function viewHistoricalTribulation(seed){
 if(!seeds.includes(seed))fail('DAO_SEED_NOT_AUTHENTIC');
 const first=R57_TRIBULATION_CONTRACT.firstBySeed[seed];return frozen({seed,stages:[
  {index:1,scene:first.escena,options:first.opciones.map((o,i)=>({index:i+1,text:o.texto}))},
  {index:2,scene:R57_TRIBULATION_CONTRACT.second.escena,options:R57_TRIBULATION_CONTRACT.second.opciones.map((o,i)=>({index:i+1,text:o.texto}))}
 ]});
}
function resolveHistoricalTribulation(seed,answers){
 if(!seeds.includes(seed))fail('DAO_SEED_NOT_AUTHENTIC');
 if(!Array.isArray(answers)||answers.length!==2||answers.some(x=>!Number.isSafeInteger(x)||x<1||x>3))fail('EXACTLY_TWO_NATIVE_CHOICES');
 const first=R57_TRIBULATION_CONTRACT.firstBySeed[seed].opciones[answers[0]-1];
 const second=R57_TRIBULATION_CONTRACT.second.opciones[answers[1]-1];
 const coherent=(first.coherente?1:0)+(second.coherente?1:0);
 return frozen({seed,answers:[...answers],coherent,kind:coherent>=2?'TRIBULATION_SUCCESS':'TRIBULATION_FAILURE',
  originalLogic:'R57_TWO_SCENES_COHERENCE_GTE_2',sourceRevision:'R57_LEGACY_TRIBULATION'});
}
// A native UI/resolver owner must independently attest the seed and two
// resolved player choices. An event merely claiming success is insufficient.
function validateNativeR57TribulationEvent(event,{readNativeSeed,validateNativeChoiceJournal}={}){
 if(typeof readNativeSeed!=='function'||typeof validateNativeChoiceJournal!=='function')fail('NATIVE_PRIVATE_WITNESSES_REQUIRED');
 if(event?.source!=='NATIVE_TRIBULATION_PHYSICAL_RESOLVER'||!Array.isArray(event.answers)||!seeds.includes(event.seed))fail('NATIVE_EVENT_FORM');
 const current=readNativeSeed();if(current!==event.seed)fail('SAVED_SEED_MISMATCH');
 if(validateNativeChoiceJournal(event)!==true)fail('UNVERIFIED_CHOICE_JOURNAL');
 const calculated=resolveHistoricalTribulation(event.seed,event.answers);
 if(event.kind!==calculated.kind||event.coherent!==calculated.coherent)fail('VERDICT_CONTRADICTS_R57');
 return true;
}

export { ALLOWED_R57_DAO_SEEDS, resolveHistoricalTribulation, validateNativeR57TribulationEvent, viewHistoricalTribulation };
