// Release input only after all native owners and command listeners are installed.
const lgbInputForm=document.getElementById('form');lgbInputForm.inert=false;lgbInputForm.setAttribute('aria-busy','false');document.body.dataset.lgbReady='true';
if(!document.getElementById('entrada').disabled)document.getElementById('entrada').focus();
