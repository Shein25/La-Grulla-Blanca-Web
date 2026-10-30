import { fail, freeze } from '../a07/safe-data.js';
export { copy, exact } from '../a07/safe-data.js';

/** Host-only bounded own-data utilities. No global runtime lookup. */
function own(value,key){const d=value&&Object.getOwnPropertyDescriptor(value,key);if(!d||!Object.hasOwn(d,'value'))fail('A0764C_OWN_DATA_REQUIRED');return d.value;}
function turn(v){if(!Number.isSafeInteger(v)||v<0)fail('A0764C_NATIVE_TURN');return v;}
function label(v){if(typeof v!=='string'||!v.length||v.length>128)fail('A0764C_LABEL');return v;}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const PILOT=Object.freeze(['mei_lian','guo_chen']);
const ACTION_ID='A0764C_AMBIENT_MOVE';
const SOURCE=freeze({path:'docs/integracion/astra/a07.6.4c-b1/AUTORIZACION_A07_6_4C_B1.md',sha256:'17847c2fb65b288e285330d9c160e461bf27774b022b00e0ac4a9277d084aa5b',locator:'B1 sections1-22 pilot S2/H2/P1, no calendar, modular only'});
function fnv32(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619)>>>0;return h;}

export { ACTION_ID, PILOT, SOURCE, fail, fnv32, freeze, label, own, same, turn };
