import { requireNewMaterialInventory } from '../../../runtime/material-inventory-v306.js';

// No productive Qiao mission issuer is installed in this round. The seam is fail-closed.
function createQiaoMaterialDeliveryBoundary(inventory){
 const owner=requireNewMaterialInventory(inventory);
 return Object.freeze({prepare:authorization=>owner.prepareConsumption(authorization),commit:plan=>owner.commitConsumption(plan),finalize:plan=>owner.finalizeConsumption(plan),rollback:plan=>owner.rollbackConsumption(plan),
  inspect:()=>Object.freeze({status:owner.inspect().consumptionAuthorityInstalled?'PRIVATE_ISSUER_REQUIRED':'BLOCKED_AUTHORITY_NOT_INSTALLED',recognitionActive:false,pillConnected:false,stageIssuerInstalled:false})});
}

export { createQiaoMaterialDeliveryBoundary };
