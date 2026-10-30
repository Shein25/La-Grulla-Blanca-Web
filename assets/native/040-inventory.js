(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_INVENTORY=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {fail,copy,freeze,integer,exact}=S;
function createInventory({catalog,slots,actorId,generation,resolveGrant,resolveLoss=null,onEquipment=()=>{},fault=null}){
 let state={version:1,actorId,generation,revision:0,sequence:0,items:[],equipped:Object.fromEntries(Object.keys(slots).map(k=>[k,[]])),consumed:[]},busy=false;
 const used=new WeakSet(),receipts=new WeakMap();
 function validate(s){exact(s,['version','actorId','generation','revision','sequence','items','equipped','consumed']);
  if(s.version!==1||s.actorId!==actorId||s.generation!==generation)fail('A08_INVENTORY_ACTOR');integer(s.revision,'REV');integer(s.sequence,'SEQ');
  if(!Array.isArray(s.items)||s.items.length>10000||!Array.isArray(s.consumed)||s.consumed.length>20000)fail('A08_INVENTORY_BOUND');exact(s.equipped,Object.keys(slots));
  const ids=new Set(),unique=new Set();for(const i of s.items){exact(i,['instanceId','itemId','quantity','provenance']);const d=catalog[i.itemId];if(!d||typeof i.instanceId!=='string'||ids.has(i.instanceId))fail('A08_ITEM_ID');ids.add(i.instanceId);integer(i.quantity,'QUANTITY');if(i.quantity<1||(d.tipo==='equipo'&&i.quantity!==1))fail('A08_ITEM_QUANTITY');
   if(d.unique){if(unique.has(i.itemId))fail('A08_UNIQUE_DUPLICATE');unique.add(i.itemId);}if(!i.provenance||typeof i.provenance.source!=='string'||i.provenance.generation!==generation)fail('A08_ITEM_PROVENANCE');}
  const worn=new Set();for(const [slot,list]of Object.entries(s.equipped)){if(!Array.isArray(list)||list.length>slots[slot])fail('A08_SLOT_CAPACITY');for(const id of list){const item=s.items.find(x=>x.instanceId===id);if(!item||catalog[item.itemId].slot!==slot||worn.has(id))fail('A08_SLOT_ITEM');worn.add(id);}}
  if(new Set(s.consumed).size!==s.consumed.length)fail('A08_INVENTORY_REPLAY');return s;
 }
 function transact(kind,build,cap=null){if(busy)fail('A08_INVENTORY_REENTRANT');busy=true;let undo=null;
  try{const old=state,next=copy(state);build(next);next.revision++;validate(next);fault?.('BEFORE_EQUIPMENT_PREPARE');
   const prepared=onEquipment(freeze(copy(old)),freeze(copy(next)));fault?.('BEFORE_PUBLISH');undo=prepared?.apply?.();state=next;fault?.('AFTER_PUBLISH');
   if(cap)used.add(cap);const receipt=Object.freeze({});receipts.set(receipt,{kind,actorId,generation,revision:next.revision});return receipt;
  }catch(e){if(undo)undo();throw e;}finally{busy=false;}
 }
 // Transaction wrapper retains the old state even if the fault is after publication.
 function commit(kind,build,cap){const old=state;try{return transact(kind,build,cap);}catch(e){state=old;throw e;}}
 function authentic(resolver,cap){if(!resolver||!cap||typeof cap!=='object'||used.has(cap))fail('A08_PRIVATE_CAPABILITY_REQUIRED');const d=resolver(cap);if(!d||d.actorId!==actorId||d.generation!==generation)fail('A08_GRANT_ACTOR');return copy(d);}
 function grant(cap){const d=authentic(resolveGrant,cap);return commit('RECEIVE',n=>{for(const item of d.items){const def=catalog[item.itemId];if(!def)fail('A08_UNKNOWN_ITEM');integer(item.quantity,'GRANT_QUANTITY');if(item.quantity<1)fail('A08_ZERO_GRANT');
   const amount=def.tipo==='equipo'?item.quantity:1;for(let j=0;j<amount;j++)n.items.push({instanceId:`item:${generation}:${++n.sequence}`,itemId:item.itemId,quantity:def.tipo==='equipo'?1:item.quantity,provenance:{source:d.source,generation,sourceId:d.sourceId}});}},cap);}
 function receiveTransfer(cap){const d=authentic(resolveGrant,cap);if(d.kind!=='PRIVATE_GROUND_CUSTODY_TRANSFER'||!Array.isArray(d.items)||d.items.length!==1)fail('A08_TRANSFER_AUTHORITY');return commit('RECEIVE_SAME_INSTANCE',n=>{const item=d.items[0];if(n.items.some(i=>i.instanceId===item.instanceId)||!item.instanceId.startsWith('item:'+generation+':'))fail('A08_TRANSFER_DUPLICATE_OR_GENERATION');n.items.push(copy(item));},cap);}
 function equip(id,stage){return commit('EQUIP',n=>{const item=n.items.find(i=>i.instanceId===id);if(!item||catalog[item.itemId].tipo!=='equipo')fail('A08_NOT_OWNED_EQUIPMENT');const def=catalog[item.itemId];
  if(['LianQi_I','LianQi_II','LianQi_III','LianQi_IV'].indexOf(stage)<['LianQi_I','LianQi_II','LianQi_III','LianQi_IV'].indexOf(def.stage))fail('A08_EQUIPMENT_STAGE');
  if(Object.values(n.equipped).flat().includes(id))fail('A08_ALREADY_EQUIPPED');if(n.equipped[def.slot].length>=slots[def.slot])fail('A08_SLOT_FULL_UNEQUIP_FIRST');n.equipped[def.slot].push(id);});}
 function unequip(id){return commit('UNEQUIP',n=>{const slot=Object.keys(n.equipped).find(k=>n.equipped[k].includes(id));if(!slot)fail('A08_NOT_EQUIPPED');n.equipped[slot]=n.equipped[slot].filter(x=>x!==id);});}
 function debit(cap){const d=authentic(resolveLoss,cap);return commit('CONSUME',n=>{if(n.consumed.includes(d.transactionId))fail('A08_DUPLICATE_CONSUMPTION');
  for(const req of d.items){const i=n.items.find(x=>x.instanceId===req.instanceId);integer(req.quantity,'DEBIT');if(!i||req.quantity<1||i.quantity<req.quantity||Object.values(n.equipped).flat().includes(i.instanceId))fail('A08_INVALID_CONSUMPTION');i.quantity-=req.quantity;}
  n.items=n.items.filter(i=>i.quantity);n.consumed.push(d.transactionId);},cap);}
 return Object.freeze({grant,receiveTransfer,equip,unequip,debit,snapshot:()=>freeze(copy(state)),validate:s=>validate(copy(s)),
  restore(s,permit,resolvePermit){const d=resolvePermit?.(permit);if(!d||d.actorId!==actorId||d.generation!==generation)fail('A08_RESTORE_PRIVATE_REQUIRED');const next=validate(copy(s));state=next;},
  receipt:r=>{const x=receipts.get(r);if(!x)fail('A08_FORGED_INVENTORY_RECEIPT');return freeze(copy(x));}});
}
return Object.freeze({createInventory});
});
