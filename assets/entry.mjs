// Composition only. Existing native modules retain their private state and authority.
const base=new URL('../',import.meta.url);
const manifest=await fetch(new URL('runtime-manifest.json',base)).then(r=>{if(!r.ok)throw Error('LGB_MANIFEST_UNAVAILABLE');return r.json();});
const inputs=new Map();
async function checked(file){
 const r=await fetch(new URL(file,base),{cache:'no-cache'});if(!r.ok)throw Error('LGB_ASSET_UNAVAILABLE:'+file);
 const bytes=await r.arrayBuffer();const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
 if(digest!==manifest.hashes[file])throw Error('LGB_ASSET_CHECKSUM:'+file);
 return new TextDecoder().decode(bytes);
}
for(const row of manifest.order){
 if(row.data)inputs.set(row.data.name,JSON.parse(await checked(row.data.file)));
 if(row.texts)inputs.set(row.texts.name,await Promise.all(row.texts.files.map(checked)));
}
Object.defineProperty(globalThis,'LGB_BOOT_INPUTS',{configurable:true,value:Object.freeze({take(name){if(!inputs.has(name))throw Error('LGB_INPUT_NOT_PREPARED:'+name);const value=inputs.get(name);inputs.delete(name);return value;}})});
try{
 for(const row of manifest.order){
  if(row.kind==='campaign'){await import(new URL(row.file,base));continue;}
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(row.file,base);script.async=false;script.onload=resolve;script.onerror=()=>reject(Error('LGB_MODULE_LOAD:'+row.file));document.head.appendChild(script);});
 }
 if(inputs.size)throw Error('LGB_UNUSED_BOOT_INPUTS');
}catch(error){document.body.appendChild(Object.assign(document.createElement('pre'),{textContent:'No se pudo iniciar la copia experimental: '+error.message}));throw error;}
finally{delete globalThis.LGB_BOOT_INPUTS;}
