(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ASTRA_A08_LEARNING_TRANSACTIONS=factory();})(globalThis,function(){
'use strict';
// Synchronous quiescent Learning publication. No authority is issued here.
function run(c,operation){
 const undo=c.progression.checkpoint(),branchUndo=c.branches.checkpoint(),before={additionalKnown:[...c.additionalKnown],manuals:c.manuals.map(m=>({...m})),events:[...c.events],sequence:c.sequence,revision:c.revision};
 try{return operation();}catch(error){undo();branchUndo();Object.assign(c,before);throw error;}
}
return Object.freeze({run});
});
