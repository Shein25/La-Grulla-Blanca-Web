import { registration } from '../a07/registry.js';
import { freeze, copy, fail, exact } from '../a07/safe-data.js';
import { publicIdentityRow, INTRO_AUTHORITY } from '../a07.5b2.1r/public-identity.js';
export { IDENTITY_SOURCE, verifyCanonicalDefinitions } from '../a07.5b2.1r/public-identity.js';

/** A07.5B2.1R2: canon and human publicity remain separate authorities. */
const B21R2_AUTHORITY=freeze({path:'docs/integracion/astra/a07.5b2.1r2/AUTORIZACION_A07_5B2_1R2.md',sha256:'1aa1e1407ba700fba903f9e7cba73ffabae4e95c16a42e06a5e8b1a775e64bb8',locator:'1-16: UNKNOWN, own identity, public bindings, direct conversation'});
const human=freeze({
 qiao_ren:{role:'disciplina y administración',clause:'Me encargo de la disciplina y la administración.'},
 wei_jian:{role:'responsable del Pabellón Marcial',clause:'Soy responsable del Pabellón Marcial.'},
 lan_meihua:{role:'medicina y alquimia',clause:'Me encargo de medicina y alquimia.'},
 duan_shibo:{role:'recursos y producción',clause:'Me encargo de recursos y producción.'},
 he_zhen:{role:'formaciones y territorio',clause:'Trabajo con las formaciones y el territorio.'},
 tao_ming:{role:'Registro de Servicios',clause:'Me encargo del Registro de Servicios.'},
 chen_bo:{role:'instructor de Examen y anatomía y medicina',clause:'Soy instructor de Examen y trabajo con anatomía y medicina.'},
 yao_fen:{role:'instructora de Alquimia y botica',clause:'Soy instructora de Alquimia y me encargo de la botica.'},
 pei_luo:{role:'cocina y comedor',clause:'Me encargo de la cocina y el comedor.'},
 lu_cheng:{role:'taller de armas y reparaciones',clause:'Me encargo del taller de armas y de las reparaciones.'},
 ning_cai:{role:'textiles y cuero',clause:'Trabajo con textiles y cuero.'},
 mei_shufen:{role:'herbolaria de Sauces',clause:'Soy herbolaria de Sauces.'}
});
/** Audit DTO only: raw narrative roles must never be included in spoken payloads. */
function publicBindingRow(actorId){
 const old=publicIdentityRow(actorId),h=human[actorId],inherited=old.publicRoleStatus==='PUBLIC_SAFE';
 const role=h?.role??(inherited?old.publicRoleCandidate:null);
 return freeze({...copy(old),phase:'A07.5B2.1R2',publicRoleCandidate:role,publicRoleStatus:role===null?'NOT_PUBLIC':'PUBLIC_SAFE',
  bindingKind:h?'HUMAN_RATIFIED_R2':inherited?'PRESERVED_PUBLIC_SAFE_R1':'NAME_ONLY_R2',
  humanBinding:{authority:copy(B21R2_AUTHORITY),section:h?'4 / '+old.displayName:inherited?'6: preserve exact R1 binding':'5: companions NAME only',publicValue:role},
  priorPublicAuthority:inherited?copy(INTRO_AUTHORITY):null,
  transformation:h?'Explicit human public formulation; raw canon remains unchanged.':inherited?'Identity: exact whole R1 public title preserved.':'No role promoted.',
  authorizedRoleClause:h?.clause??null,firstContactAuthority:'UNKNOWN_ALLOWED_WITHOUT_FIRST_ENCOUNTER_ASSERTION',
  notes:'Own public identity only. No service availability, biography, private kinship, R knowledge or permissions.'});
}
function build(actorId,acquaintanceState){
 registration(actorId);if(acquaintanceState!=='UNKNOWN')fail('B21R2_FULL_INTRO_NOT_AUTHORIZED');
 const row=publicBindingRow(actorId);
 const claim=(field,value,source)=>({field,actorId,value,publicStatus:'PUBLIC_SAFE',sourceFact:copy(source),
  humanPublicBinding:{authority:copy(B21R2_AUTHORITY),section:field==='NAME'?'10-11: own public NAME':row.humanBinding.section,value},
  inheritedAuthority:field==='PUBLIC_ROLE'?copy(row.priorPublicAuthority):null});
 const claims=[claim('NAME',row.displayName,row.nameSource)];
 if(row.publicRoleStatus==='PUBLIC_SAFE')claims.push(claim('PUBLIC_ROLE',row.publicRoleCandidate,row.roleSource));
 return {schemaVersion:1,kind:'SELF_INTRODUCTION',actorId,recipientId:'player',name:row.displayName,
  publicRole:row.publicRoleCandidate,acquaintanceState,claims,semanticRelations:[],firstEncounterAsserted:false};
}
function selfIntroductionPayload(actorId,acquaintanceState='UNKNOWN'){return freeze(build(actorId,acquaintanceState));}
function validateSelfIntroductionPayload(raw){
 const p=copy(raw);exact(p,['schemaVersion','kind','actorId','recipientId','name','publicRole','acquaintanceState','claims','semanticRelations','firstEncounterAsserted']);
 const expected=build(p.actorId,p.acquaintanceState);
 // Whole DTO equality also rejects aliases, extra claim fields, arbitrary strings,
 // source drift, private fields, other recipients and semantic world relations.
 if(JSON.stringify(p)!==JSON.stringify(expected))fail('B21R2_PAYLOAD_NOT_CURRENT_PUBLIC_BINDING');
 return freeze(p);
}

export { B21R2_AUTHORITY, publicBindingRow, selfIntroductionPayload, validateSelfIntroductionPayload };
