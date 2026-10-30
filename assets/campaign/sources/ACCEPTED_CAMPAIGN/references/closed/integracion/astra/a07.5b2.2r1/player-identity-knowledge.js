import { SAVE_AUTHORITY } from '../a06/save-authority.js';

/** Single pure schema factory, also injected deterministically into the native script. */
function createIdentitySchema(canonicalIds){
 const ids=Object.freeze([...canonicalIds]);
 const fail=code=>{const error=new TypeError(code);error.code=code;throw error;};
 if(ids.length!==32||new Set(ids).size!==32)fail('R1_IDENTITY_CANONICAL_CATALOGUE');
 const emptyIdentity=()=>Object.freeze({version:1,npcIds:Object.freeze([])});
 function validateIdentity(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||![Object.prototype,null].includes(Object.getPrototypeOf(raw)))fail('R1_IDENTITY_RECORD');
  const keys=Reflect.ownKeys(raw);
  if(keys.length!==2||!keys.includes('version')||!keys.includes('npcIds'))fail('R1_IDENTITY_FIELDS');
  const v=Object.getOwnPropertyDescriptor(raw,'version'),d=Object.getOwnPropertyDescriptor(raw,'npcIds');
  if(!Object.hasOwn(v,'value')||!Object.hasOwn(d,'value')||!v.enumerable||!d.enumerable)fail('R1_IDENTITY_ACCESSOR');
  if(v.value!==1)fail('R1_IDENTITY_VERSION');
  const a=d.value;if(!Array.isArray(a))fail('R1_IDENTITY_ARRAY');
  const length=Object.getOwnPropertyDescriptor(a,'length')?.value,ak=Reflect.ownKeys(a);
  if(!Number.isSafeInteger(length)||length>32||ak.length!==length+1)fail('R1_IDENTITY_BOUND');
  const selected=[];
  for(let i=0;i<length;i++){
   const entry=Object.getOwnPropertyDescriptor(a,String(i));
   if(!entry||!Object.hasOwn(entry,'value')||!entry.enumerable)fail('R1_IDENTITY_ACCESSOR');
   if(typeof entry.value!=='string'||!ids.includes(entry.value))fail('R1_IDENTITY_ID');
   if(selected.includes(entry.value))fail('R1_IDENTITY_DUPLICATE');selected.push(entry.value);
  }
  return Object.freeze({version:1,npcIds:Object.freeze(selected)});
 }
 function projectIdentity(game){
  const d=Object.getOwnPropertyDescriptor(game,'playerIdentityKnowledge');
  if(!d)return emptyIdentity();if(!Object.hasOwn(d,'value'))fail('R1_IDENTITY_ACCESSOR');
  return validateIdentity(d.value);
 }
 function knowsIdentity(game,id){if(!ids.includes(id))fail('R1_IDENTITY_ID');return projectIdentity(game).npcIds.includes(id);}
 function proposeIdentity(raw,id){
  const p=validateIdentity(raw);if(!ids.includes(id))fail('R1_IDENTITY_ID');
  if(p.npcIds.includes(id))return Object.freeze({changed:false,state:p});
  const selected=new Set([...p.npcIds,id]);
  return Object.freeze({changed:true,state:validateIdentity({version:1,npcIds:ids.filter(x=>selected.has(x))})});
 }
 return Object.freeze({emptyIdentity,validateIdentity,projectIdentity,knowsIdentity,proposeIdentity,canonicalIdentityIds:()=>ids});
}
const schema=createIdentitySchema(Object.keys(SAVE_AUTHORITY.npc));
const emptyIdentity=schema.emptyIdentity,validateIdentity=schema.validateIdentity,projectIdentity=schema.projectIdentity,
 knowsIdentity=schema.knowsIdentity,proposeIdentity=schema.proposeIdentity,canonicalIdentityIds=schema.canonicalIdentityIds;

export { canonicalIdentityIds, createIdentitySchema, emptyIdentity, knowsIdentity, projectIdentity, proposeIdentity, validateIdentity };
