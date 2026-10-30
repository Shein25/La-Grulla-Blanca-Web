// Observes native events; it does not parse, submit, prevent, or dispatch input.
function observeNativeInput(document){
 let event=null;
 const capture=e=>{if(!e.isTrusted)return;const t=e.target;
  if(e.type==='submit'&&t?.id==='form'||e.type==='click'&&t?.closest?.('.ofi-cadaver-panel button, .mc-opcion:not([disabled])')){
   event=e;
  }
 };
 document?.addEventListener('submit',capture,true);document?.addEventListener('click',capture,true);
 return Object.freeze({current:()=>event!==null&&event.eventPhase!==0&&event.isTrusted===true});
}

export { observeNativeInput };
