import { canonical, clone } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { EXACT_EXTENSION } from './b1-territory-authority.js';

const ID='li_reserva_mobile_lobo_espiritual_04',KIND='EXACT_AUTHORIZED_FOURTH_WOLF_EXTENSION';
const fail=k=>{throw Error('B1_TERRITORIAL_MIGRATION_'+k);};
function verifyExtension(){
 const current=(typeof ASTRA_A08_DATA==='undefined'?globalThis.ASTRA_A08_DATA:ASTRA_A08_DATA)?.ecologyR58;
 if(!current||current.sourceHash!==EXACT_EXTENSION.newHash||canonical(current.configBySpecies)!==canonical(EXACT_EXTENSION.contracts))fail('NUMERIC_OR_AUTHORITY_DRIFT');
 const registry=clone(current.registry),before=clone(EXACT_EXTENSION.registryBefore);
 if(canonical(registry.bindings['roamer:'+ID])!==canonical(EXACT_EXTENSION.bindingAdded))fail('ADDED_BINDING_DRIFT');
 delete registry.bindings['roamer:'+ID];delete registry.authoritySHA256;delete before.authoritySHA256;
 if(canonical(registry)!==canonical(before))fail('PREEXISTING_BINDING_OR_HABITAT_DRIFT');
}
function upgradeExactTerritorialExtension(r){
 const d=r.envelope.domains,p=d.Player.state,pop=p.populationEcology;
 if(pop?.sourceHash!==EXACT_EXTENSION.oldHash)return r;
 verifyExtension();
 if(d.World.a08TerritoryVersion!==7||d.World.errantes.length!==187||d.World.errantes.some(e=>e.id===ID)||p.lives.some(l=>l.key===ID))fail('LEGACY_SCOPE');
 // Only the authority pointer changes. All population pressure/memory, births,
 // rolls, encounters, death receipts and mission receipts remain byte-equivalent.
 pop.sourceHash=EXACT_EXTENSION.newHash;d.World.errantes.push(clone(EXACT_EXTENSION.populationAdded));
 (d.B1Actions.migrations||=[]).push({id:p.generation+':'+KIND,kind:KIND,oldHash:EXACT_EXTENSION.oldHash,newHash:EXACT_EXTENSION.newHash,historicalBuildSHA256:EXACT_EXTENSION.historicalBuildSHA256,addedPopulationId:ID});
 return r;
}
function validateTerritorialMigrations(d){
 const rows=d.B1Actions.migrations||[];
 if(!Array.isArray(rows)||rows.length>1)fail('AUDIT_BOUND');
 for(const r of rows){if(r.id!==d.Player.state.generation+':'+KIND||r.kind!==KIND||r.oldHash!==EXACT_EXTENSION.oldHash||r.newHash!==EXACT_EXTENSION.newHash||r.historicalBuildSHA256!==EXACT_EXTENSION.historicalBuildSHA256||r.addedPopulationId!==ID||d.Player.state.populationEcology?.sourceHash!==EXACT_EXTENSION.newHash||d.World.errantes.filter(e=>e.id===ID).length!==1)fail('AUDIT_SCOPE');verifyExtension();}
 return true;
}

export { upgradeExactTerritorialExtension, validateTerritorialMigrations };
