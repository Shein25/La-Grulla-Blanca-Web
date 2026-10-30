import { registration, registrations } from '../a07/registry.js';
import { freeze, copy, fail, exact } from '../a07/safe-data.js';

/** Explicit public identity scope, never a translation of narrative/technical roles. */
const IDENTITY_SOURCE=freeze({path:'grulla-blanca_ver76.html',sha256:'b41c12431f076790b2e2fb0e9e485fb35d3b8c7a834d7b1222e9105518eb270a',locator:'NPC_DEF / NOMBRES_NPC / cmd_examinar (public NPC description)'});
const INTRO_AUTHORITY=freeze({path:'docs/integracion/astra/a07.5b2.1r/AUTORIZACION_A07_5B2_1R.md',sha256:'c47f4bea1abe5596436573b5ef9b2f168556fdac37ee78948f3a7b076b71d981',locator:'1.1-1.5, 5-9: own canonical public identity; optional individually classified role'});
// Individually audited occupational titles already exposed verbatim by cmd_examinar.
// No shortened role, verb expansion, inferred institutional affiliation or service.
const safe=new Set(['ji_xueying','song_rui','shen_baojun','madre_wen','jiang_rui','su_lian','gao_shun','feng_zhi','ma_qiren','wen_tao','yu_shun','ma_gu','ren_bo','xu_an']);
const withheld=new Set(['lin_yue','han_qiao','zhao_wen','mei_lian','guo_chen','luo_yan','mei_shufen']);
function publicIdentityRow(actorId){const r=registration(actorId),status=safe.has(actorId)?'PUBLIC_SAFE':withheld.has(actorId)?'NOT_PUBLIC':'NEEDS_HUMAN_DECISION';
 return freeze({npcId:actorId,displayName:r.name,nameStatus:'PUBLIC_SAFE',nameSource:{...copy(IDENTITY_SOURCE),field:`NPC_DEF.${actorId}.nombre`},roleRaw:r.role,roleSource:{...copy(IDENTITY_SOURCE),field:`NPC_DEF.${actorId}.rol`},publicRoleCandidate:status==='PUBLIC_SAFE'?r.role:null,publicRoleStatus:status,affiliationCandidate:null,affiliationStatus:'NO_SOURCE',positionCandidate:null,positionStatus:'NO_SOURCE',firstContactAuthority:'UNKNOWN_IN_CURRENT_VER76',notes:status==='PUBLIC_SAFE'?'Literal occupational title is public in the existing examine output; no promise/service/commerce.':status==='NOT_PUBLIC'?'Whole raw role contains narrative function, kinship, internal allegiance or future possibility; excluded from introduction, no redaction promoted.':'Raw role is a domain/service label or mixed slash expression, not a sourced natural personal description; human binding required. Name-only remains available.'});
}
function verifyCanonicalDefinitions(raw){
 if(!raw||typeof raw!=='object'||Object.keys(raw).length!==32)fail('INTRO_CANONICAL_CATALOG');
 for(const r of registrations()){const d=Object.getOwnPropertyDescriptor(raw,r.actorId);if(!d||!Object.hasOwn(d,'value'))fail('INTRO_OWN_ACTOR');const x=d.value,c={};for(const k of Object.keys(r.canonical)){const q=Object.getOwnPropertyDescriptor(x,k);if(!q||!Object.hasOwn(q,'value'))fail('INTRO_OWN_CANONICAL_FIELD');c[k]=copy(q.value);}if(JSON.stringify(c)!==JSON.stringify(r.canonical))fail('INTRO_CANONICAL_DRIFT');}
 return raw;
}
function validateIntroductionPayload(raw){
 const p=copy(raw);exact(p,['kind','actorId','claims']);if(p.kind!=='SELF_INTRODUCTION'||!Array.isArray(p.claims)||p.claims.length<1||p.claims.length>2)fail('INTRO_PAYLOAD');const row=publicIdentityRow(p.actorId),seen=new Set();
 for(const c of p.claims){exact(c,['field','actorId','value','publicStatus','source','authority']);if(c.actorId!==p.actorId||c.publicStatus!=='PUBLIC_SAFE'||seen.has(c.field))fail('INTRO_CLAIM_SCOPE');seen.add(c.field);
  const value=c.field==='NAME'?row.displayName:c.field==='PUBLIC_ROLE'&&row.publicRoleStatus==='PUBLIC_SAFE'?row.publicRoleCandidate:null;
  const src=c.field==='NAME'?row.nameSource:row.roleSource;if(value===null||c.value!==value||JSON.stringify(c.source)!==JSON.stringify(src)||JSON.stringify(c.authority)!==JSON.stringify(INTRO_AUTHORITY))fail('INTRO_CLAIM_NOT_PUBLIC_CURRENT_CANON');
 }
 if(p.claims[0].field!=='NAME'||!seen.has('NAME'))fail('INTRO_NAME_REQUIRED');return freeze(p);
}
function identityPayload(actorId){const row=publicIdentityRow(actorId),claim=(field,value,source)=>({field,actorId,value,publicStatus:'PUBLIC_SAFE',source:copy(source),authority:copy(INTRO_AUTHORITY)});
 return validateIntroductionPayload({kind:'SELF_INTRODUCTION',actorId,claims:[claim('NAME',row.displayName,row.nameSource),...(row.publicRoleStatus==='PUBLIC_SAFE'?[claim('PUBLIC_ROLE',row.publicRoleCandidate,row.roleSource)]:[])]});
}

export { IDENTITY_SOURCE, INTRO_AUTHORITY, identityPayload, publicIdentityRow, validateIntroductionPayload, verifyCanonicalDefinitions };
