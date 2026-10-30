const QUESTS = Object.fromEntries([
  ['P','La Piedra y la Puerta'],['M01','Un nombre entre miles'],
  ['M02','Trabajo que alguien debe hacer'],['M03','Aprender a permanecer'],
  ['M04','Más allá de la Puerta Roja'],['M05','Los caminos de la Grulla'],
  ['M06','Lo que no debería estar aquí'],['M07','Informe de frontera'],
].map(([id,nombre]) => [id,{id,nombre,listo:j=>j.quests[id]==='activa' && j.arc1Listo(id),
  progreso:j=>j.progresoArc1(id),
  desc:({P:'El examen termina en la Puerta Roja.',M01:'Un nombre y un lugar entre los externos.',
    M02:'El primer servicio en la despensa.',M03:'La disciplina de permanecer en pie.',
    M04:'Una patrulla sale hacia el bosque.',M05:'La ruta del valle y Sauces.',
    M06:'Las huellas de una anomalía territorial.',M07:'Un informe ante la disciplina.'})[id],
  lore:({P:'La Piedra reconoce una raíz, pero la secta todavía no ha escrito tu nombre en el registro. Entre el patio del examen y la Puerta Roja hay un camino que cada aspirante debe recorrer por sus propios medios. Tao Ming espera al otro lado con una tablilla provisional y una decisión administrativa.',
    M01:'Los nombres inscritos en el jade sobreviven a quienes los pronunciaron por primera vez. En el pabellón, cada recién llegado descubre que la admisión no basta para tener una cama o un sitio entre los externos. Madre Wen conoce cada habitación de las cabañas y puede enseñarte dónde dormir.',
    M02:'Una rata ha encontrado el grano común y el qi suficiente para dejar de temer a los aprendices. Tao Ming necesita un servicio concreto, no una promesa: resolver el problema y presentar una observación responsable. Chen Bo enseña a leer el cuerpo sin confundirlo con un montón de materiales.',
    M03:'Shen Baojun enseña que la protección empieza por la postura y la respiración. El muñeco del patio devuelve cada golpe a quien no sabe permanecer. Después de la práctica, Qiao Ren sólo reconocerá tu ascenso si la circulación resiste también una meditación serena.',
    M04:'Jiang Rui mantiene patrullas fuera de la Puerta Roja, donde la vigilancia ya no se parece a la de los patios. Gao Shun comprueba cada salida para que nadie convierta una orden en una excursión. El refugio del bosque guarda los registros de quienes fueron antes y consiguieron volver.',
    M05:'Duan Shibo conoce el valle por lo que llega y por lo que falta en sus estantes. Los mercados y graneros no cuentan toda la historia: Xu An conserva acuerdos de Sauces que la secta no escribió. Conocer esa ruta exige mirar los registros y aceptar la hospitalidad local.',
    M06:'En los senderos aparecen huellas desplazadas; otras señales alteran las plantas y el agua en lugares distintos. Ningún indicio aislado basta para sostener una conclusión. Las tablillas de patrulla permiten comparar lo observado y ordenar varios tipos de evidencia antes del informe.',
    M07:'Un informe de frontera puede ser valioso aunque todavía no describa toda la causa de una anomalía. Qiao Ren y Jiang Rui escuchan lo que realmente viste, no lo que la inquietud te haga imaginar. La forma final del texto determina qué saber podrá circular por la institución.'})[id],
  objetivo:({P:'Habla con Tao Ming en registro.',M01:'Inscribe tu nombre y confirma alojamiento.',
    M02:'Resuelve la rata, aprende Examen y vuelve a Tao Ming.',M03:'Aprende los fundamentos de postura y respiración, practica ante el muñeco y completa la evaluación antes de la promoción.',
    M04:'Pasa el control y vuelve de la primera patrulla.',M05:'Revisa la logística, los registros y el hospedaje.',
    M06:'Reúne al menos tres tipos de evidencia.',M07:'Presenta tu informe a Qiao Ren.'})[id],
  recompensaTexto:({P:'Admisión en la secta.',M01:'Rango de aspirante.',M02:'1 contribución.',
    M03:'Promoción a discípulo externo.',M04:'2 contribuciones; un mérito opcional.',
    M05:'3 contribuciones y una píldora de consolidación.',M06:'2 contribuciones y 1 mérito.',
    M07:'4 contribuciones, 3 méritos y 1 comprensión.'})[id],
}]));
const ARC1_IDS = ['P','M01','M02','M03','M04','M05','M06','M07','M08','M09','M10','M11','M12','M13','M14','M15','M16','M17','M18'];
const ARC1_FUENTES={
  'bosque_collado_alto:huellas':'DESPLAZAMIENTO_FAUNA',
  'aguas_poza_profunda:marcas':'DESPLAZAMIENTO_FAUNA',
  'aguas_senda_bosque:vegetacion':'ALTERACION_VEGETAL',
  'terraza_cantera:vegetacion':'ALTERACION_VEGETAL',
  'aguas_cauce_alto:corriente':'ALTERACION_HIDRICA',
  'aguas_paso_piedras:corriente':'ALTERACION_HIDRICA',
  'bosque_puesto_marcas:tablillas':'PATRON_TERRITORIAL',
  'bosque_refugio_patrulla:registro':'PATRON_TERRITORIAL',
};
const ARC1_TIPOS=[...new Set(Object.values(ARC1_FUENTES))];
const ARC1_RECOMPENSAS={P:[0,0,0],M01:[0,0,0],M02:[1,0,0],M03:[0,0,0],
  M04:[2,0,0],M05:[3,0,0],M06:[2,1,0],M07:[4,3,1]};
function crearArc1(){return {
  estado:'PROLOGO',estadoAfiliacion:'PENDIENTE_REGISTRO',rangoInstitucional:'SIN_RANGO',
  hitos:{},evidenciaTerritorial:{tipos:[],nivel:'INSUFICIENTE',sospechaFuerte:false},
  informe:{formulacionFinal:null,corregida:false},revelaciones:{R1:null},
  anclajePropietario:{},primerServicioFormal:false,evaluacionCirculacion:null,
  transicionLILIIHecha:false,transicionLIILIIIHecha:false,
  informeFronteraAceptado:false,reconocimientoSauces:null,
  legacySectaInteriorPrevia:false,cultivoLIIIPreexistente:false,
};}
function nivelArc1(tipos){return tipos.length>=4?'CONCLUYENTE':tipos.length>=3?'SUFICIENTE':'INSUFICIENTE';}
function validarArc1(a){
  const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&[Object.prototype,null].includes(Object.getPrototypeOf(x));
  if(!plain(a)||!plain(a.hitos)||!plain(a.evidenciaTerritorial)||!plain(a.informe)||!plain(a.revelaciones)||!plain(a.anclajePropietario))return false;
  if(!['PROLOGO','LI_INTEGRACION','LII_TERRITORIO','LIII_INVESTIGACION','LIV_REVELACION','LIV_CRISIS','EPILOGO'].includes(a.estado)||
     !['PENDIENTE_REGISTRO','ADMITIDO','MIEMBRO'].includes(a.estadoAfiliacion)||
     !['SIN_RANGO','ASPIRANTE','DISCIPULO_EXTERNO'].includes(a.rangoInstitucional))return false;
  const tipos=a.evidenciaTerritorial.tipos;
  if(!Array.isArray(tipos)||new Set(tipos).size!==tipos.length||tipos.some(x=>!ARC1_TIPOS.includes(x)))return false;
  if(!['INSUFICIENTE','SUFICIENTE','CONCLUYENTE'].includes(a.evidenciaTerritorial.nivel)||
     typeof a.evidenciaTerritorial.sospechaFuerte!=='boolean')return false;
  if(Object.values(a.hitos).some(x=>typeof x!=='boolean'))return false;
  if(![null,'CAUTA','FUERTE'].includes(a.informe.formulacionFinal)||typeof a.informe.corregida!=='boolean'||
     ![null,'PARCIAL','CONFIRMADO'].includes(a.revelaciones.R1))return false;
  for(const [id,owner] of Object.entries(a.anclajePropietario))if(!Object.hasOwn(NPC_DEF,id)||!ARC1_IDS.includes(owner))return false;
  for(const k of ['primerServicioFormal','transicionLILIIHecha','transicionLIILIIIHecha','informeFronteraAceptado','legacySectaInteriorPrevia','cultivoLIIIPreexistente'])
    if(typeof a[k]!=='boolean')return false;
  return [null,'SUPERADA'].includes(a.evaluacionCirculacion)&&[null,'HUESPED'].includes(a.reconocimientoSauces);
}
