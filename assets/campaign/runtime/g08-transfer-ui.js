// Explicit copy across browser origins. The native G08 owner performs every check/write.
function connectG08TransferUI({runtime,exportArchive,importArchive}){
 const nav=document.getElementById('acciones');if(!nav)return;
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;input.id='g08ArchiveFile';document.body.appendChild(input);
 const backup=document.createElement('button');backup.type='button';backup.id='g08Export';backup.textContent='RESPALDAR';backup.title='Exportar las partidas G08 de este origen sin modificarlas';
 const restore=document.createElement('button');restore.type='button';restore.id='g08Import';restore.textContent='IMPORTAR';restore.title='Copiar un respaldo G08 verificado a un almacén vacío';nav.append(backup,restore);
 let active=false;
 backup.addEventListener('click',async event=>{if(!event.isTrusted||active)return;active=true;try{const archive=await exportArchive();const url=URL.createObjectURL(new Blob([JSON.stringify(archive,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='LGB_G08_RESPALDO.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);runtime.salida('Respaldo G08 exportado. Conservá esta copia antes de cambiar de origen.');}catch(e){runtime.salida('Respaldo rechazado: '+e.message);}finally{active=false;}});
 restore.addEventListener('click',event=>{if(!event.isTrusted||active)return;input.value='';input.click();});
 input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file||active)return;if(file.size>90000000){runtime.salida('Importación rechazada: respaldo demasiado grande.');return;}
  if(!confirm('Se copiará el respaldo únicamente si este almacén G08 está vacío. No se sobrescriben partidas. ¿Continuar?'))return;
  active=true;try{const archive=JSON.parse(await file.text());const result=await importArchive(archive);runtime.salida('Respaldo G08 importado: '+result.games+' partida(s). Pulsa CARGAR para elegir la revisión confirmada.');}catch(e){runtime.salida('Importación rechazada: '+e.message+'. No se sustituyeron partidas.');}finally{active=false;input.value='';}
 });
}

export { connectG08TransferUI };
