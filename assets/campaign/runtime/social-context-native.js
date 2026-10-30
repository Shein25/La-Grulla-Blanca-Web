import { LINES } from './li-dialogue-data.js';

/**
 * ARCO1 R6: authored, read-only social topics for all 32 native actors.
 * The frozen A07.9 corpus remains untouched. Native mission conversations,
 * commerce, alchemy, herbalism and teaching retain their original owners.
 * Every utterance here concerns the NPC's documented role, a method, or a
 * hypothetical example; it cannot claim unobserved world events.
 * No state mutation, no quest grant and no SAVE migration.
 */
const SOCIAL_CONTEXT_REVISION = 'ARC1_SOCIAL_CONTINUITY_R6_V1';
const SOCIAL_CONTEXT_SOURCE = Object.freeze({path:'project/runtime/social-context-native.mjs',revision:SOCIAL_CONTEXT_REVISION,kind:'OWNER_AUTHORIZED_ORIGINAL_EXPERIMENTAL_WRITING'});
const R6_SEALS=new WeakSet();
function sealSocialUtterance(u){
 if(!u||!Object.isFrozen(u)||u.kind!=='AUTHORED_DIALOGUE'||u.sourceBasis?.authored!==SOCIAL_CONTEXT_SOURCE||u.realization?.catalogRevision!==SOCIAL_CONTEXT_REVISION)throw Error('R6_SOCIAL_SEAL_SCOPE');
 R6_SEALS.add(u);return u;
}
function isAuthenticSocialUtterance(u){return !!u&&R6_SEALS.has(u);}

const DIALOGUES = Object.freeze({
 lin_yue: [
  'Me ocupo de reconocer rutas y distinguir un camino practicable de otro que sólo parece corto.',
  'Antes de avanzar, mirá qué terreno podés observar de verdad. Un atajo que no podés describir es una apuesta.',
  'Si dos senderos llevan al mismo lugar, elegiría primero el que permita regresar con seguridad.'
 ],
 han_qiao: [
  'Me interesa que los recursos lleguen donde hacen falta, no sólo que figuren en una lista.',
  'Cuando falta algo, separá lo que realmente tenemos de lo que alguien prometió traer.',
  'Si una entrega depende de otra, comprobaría la primera antes de asegurar que la segunda está lista.'
 ],
 zhao_wen: [
  'Prefiero ordenar la información antes de sacar conclusiones sobre ella.',
  'No confundas una observación con una interpretación. Dejá claro cuál es cuál.',
  'Si dos registros se contradicen, buscaría cuándo y dónde se hizo cada uno antes de decidir.'
 ],
 mei_lian: [
  'Me interesan los conocimientos de medicina y las prácticas que conectan la secta con Sauces.',
  'Escuchá a quien conoce el lugar, pero comprobá qué parte de su consejo se aplica a lo que tenés delante.',
  'Un remedio útil para una dolencia no se convierte por eso en respuesta para todas las heridas.'
 ],
 guo_chen: [
  'Trabajo mejor con cosas concretas: materiales, herramientas y tareas que pueden comprobarse.',
  'Si algo parece sencillo, fijate también cuánto cuesta mantenerlo funcionando.',
  'Antes de prometer terminar una reparación, revisaría qué piezas faltan y cuáles sirven de verdad.'
 ],
 luo_yan: [
  'Me importan los procedimientos y la memoria de lo que la secta ha decidido conservar.',
  'Seguí las reglas, pero no confundas que algo esté permitido con que sea prudente.',
  'Si una orden parece contradictoria, comprobaría su origen antes de atribuirle una intención.'
 ],
 ji_xueying: [
  'Mi responsabilidad es proteger la continuidad de la secta y juzgar sus decisiones importantes.',
  'No me traigas certezas que nacieron de rumores. Distinguí los hechos de lo que todavía debe probarse.',
  'Una recomendación seria explica también qué podría salir mal si la seguimos.'
 ],
 qiao_ren: [
  'Me corresponde vigilar que los registros y las responsabilidades de la secta estén en orden.',
  'Una misión se acredita por sus requisitos cumplidos, no por la convicción de quien la solicita.',
  'Si un informe afirma que terminó una tarea, lo contrastaría con el registro antes de firmarlo.'
 ],
 wei_jian: [
  'Superviso la preparación marcial y la disciplina del entrenamiento.',
  'La fuerza sin control no es una técnica fiable. Observá el coste de cada decisión en combate.',
  'En un intercambio difícil, importa tanto conservar una salida como acertar el primer golpe.'
 ],
 song_rui: [
  'Mi labor es conservar archivos que otros puedan consultar sin perder su sentido.',
  'Anotá lo que viste y cuándo lo viste. No conviertas una conjetura en un dato del registro.',
  'Si una fecha no coincide, revisaría el documento original antes de corregir la copia.'
 ],
 lan_meihua: [
  'Trabajo con medicina y alquimia, donde los detalles importan más que una promesa de curación.',
  'Primero identificá la afección. Un preparado no reemplaza un diagnóstico.',
  'Si un paciente presenta dos síntomas, no asumiría que ambos tienen una sola causa.'
 ],
 duan_shibo: [
  'Vigilo la obtención y el uso responsable de los recursos de la secta.',
  'No cuentes materiales que todavía no fueron recolectados ni confundas abundancia con disponibilidad.',
  'Antes de pedir más extracción, comprobaría qué se consumió y qué puede reponerse.'
 ],
 he_zhen: [
  'Estudio formaciones y las relaciones entre sus puntos y el territorio.',
  'Una formación debe entenderse en su ubicación concreta: cambiar el entorno cambia lo que conviene revisar.',
  'Si una marca pierde estabilidad, inspeccionaría primero sus conexiones visibles.'
 ],
 shen_baojun: [
  'Enseño fundamentos marciales a los discípulos externos y evalúo cómo los aplican.',
  'No repitas un movimiento sólo por repetirlo. Comprobá qué postura y qué propósito estás practicando.',
  'Ante un error, separaría la postura, el momento y el gasto de energía antes del siguiente intento.'
 ],
 madre_wen: [
  'Organizo la vida cotidiana de quienes están empezando en los alojamientos externos.',
  'Descansar también exige orden. Averiguá qué lugar tenés asignado y qué obligaciones siguen pendientes.',
  'Si necesitás ayuda, explicá qué falta en vez de suponer que los demás pueden adivinarlo.'
 ],
 tao_ming: [
  'Llevo el registro de servicios y verifico que cada encargo conste correctamente.',
  'Revisá la consigna y entregá exactamente la evidencia que pide. No mezcles dos servicios distintos.',
  'Una presa obtenida en otra zona no demuestra por sí sola que cumpliste un encargo del depósito.'
 ],
 jiang_rui: [
  'Dirijo patrullas que deben regresar con información útil, no sólo con historias de combate.',
  'Una buena ruta contempla señales, tiempo de retirada y una forma de comunicar el peligro.',
  'Si una patrulla pierde una referencia, prefiero que la reconozca antes de avanzar a ciegas.'
 ],
 su_lian: [
  'Enseño herboristería: observar las plantas antes de decidir qué recolectar.',
  'No confundas reconocer una especie con saber utilizar cada una de sus partes.',
  'Si una hoja parece familiar, examinaría el resto de la planta antes de cortarla.'
 ],
 chen_bo: [
  'Enseño examen espiritual y observación anatómica.',
  'Un cuerpo puede aportar información, pero sólo si diferenciás lo observado de lo supuesto.',
  'Antes de atribuir una lesión a una causa, buscaría las señales que de verdad la respaldan.'
 ],
 yao_fen: [
  'Me ocupo de la botica y de enseñar alquimia con procedimientos verificables.',
  'Aprendé qué hace cada ingrediente y qué condición exige la preparación; no improvises efectos.',
  'Si una mezcla falla, anotaría la secuencia y el estado del caldero antes de cambiar la receta.'
 ],
 gao_shun: [
  'Vigilo el acceso a la Puerta Roja y las condiciones para atravesarla.',
  'No confundas conocer un camino con tener autorización para cruzarlo.',
  'Si una credencial no coincide con el acceso solicitado, verificaría primero su vigencia.'
 ],
 feng_zhi: [
  'Asisto en tareas de disciplina y en el seguimiento de las instrucciones dadas.',
  'Primero aclararía qué se pidió, a quién y en qué momento, antes de hablar de incumplimientos.',
  'Si dos órdenes se contradicen, buscaría al responsable de resolver esa contradicción.'
 ],
 ma_qiren: [
  'Me corresponde ordenar las existencias del almacén y sus entregas.',
  'Separá lo que figura en el inventario de lo que efectivamente puede retirarse.',
  'Si una cantidad no coincide, contaría las unidades y comprobaría el último movimiento.'
 ],
 pei_luo: [
  'Organizo la cocina y el comedor para que cada servicio llegue cuando corresponde.',
  'Una buena planificación empieza por saber cuántas personas hay que atender y con qué ingredientes.',
  'Si falta una ración, revisaría primero el reparto antes de culpar a quien llegó tarde.'
 ],
 lu_cheng: [
  'Trabajo reparando herramientas y armas en el taller.',
  'No todas las piezas dañadas se arreglan del mismo modo. Primero examiná dónde está el desgaste.',
  'Si una hoja pierde el filo, comprobaría el metal y el daño antes de prometer dejarla como nueva.'
 ],
 ning_cai: [
  'Me ocupo de los textiles y el cuero que requieren las tareas cotidianas.',
  'La reparación depende del material y del uso que va a recibir, no sólo de cómo se ve.',
  'Si una costura vuelve a abrirse, revisaría qué tensión soporta antes de reforzarla.'
 ],
 wen_tao: [
  'Trabajo en el mantenimiento técnico de las formaciones.',
  'Antes de corregir una señal, examiná qué cambió y si sus conexiones siguen intactas.',
  'Cuando una marca se apaga, revisaría primero las entradas y los puntos vecinos.'
 ],
 yu_shun: [
  'Copio documentos y procuro conservar tanto sus palabras como su sentido.',
  'Cambiar una frase puede alterar una instrucción. Asegurate de entenderla antes de abreviarla.',
  'Si un pasaje es ambiguo, anotaría la duda en lugar de inventar una versión definitiva.'
 ],
 ma_gu: [
  'Coordino trabajos de cantera donde el esfuerzo y la seguridad importan por igual.',
  'La prisa no vuelve estable una pared. Observá las señales antes de seguir excavando.',
  'Si una piedra se mueve inesperadamente, detendría la maniobra y revisaría los apoyos.'
 ],
 ren_bo: [
  'He pasado bastante tiempo patrullando rutas donde importa reconocer a tiempo los riesgos.',
  'No te avergüences de retirarte si no sabés dónde estás ni qué viene detrás.',
  'Una huella aislada dice poco; la compararía con el terreno y otras señales cercanas.'
 ],
 xu_an: [
  'Represento los intereses de Sauces y escucho las necesidades que llegan desde allí.',
  'Una propuesta debe poder explicarse a quienes van a vivir con sus consecuencias.',
  'Si una decisión afecta a dos comunidades, preguntaría qué necesita cada una antes de elegir.'
 ],
 mei_shufen: [
  'Conozco el trabajo de herbolaria local de Sauces y cómo cuidar lo que se recolecta.',
  'La utilidad de una planta no justifica arrancarla sin mirar si puede volver a crecer.',
  'Si una hierba escasea, buscaría la causa antes de recomendar recolectarla más deprisa.'
 ]
});

const TOPICS = Object.freeze([
 Object.freeze({id:'TOPIC:ROLE',text:'¿A qué te dedicás aquí?'}),
 Object.freeze({id:'TOPIC:METHOD',text:'¿Qué debería tener en cuenta para aprender de tu oficio?'}),
 Object.freeze({id:'TOPIC:CURRENT',text:'¿Qué debo recordar de mi encargo actual?'}),
 Object.freeze({id:'TOPIC:EXIT',text:'Despedirse'})
]);
const FOLLOWUP = Object.freeze([
 Object.freeze({id:'TOPIC:EXAMPLE',text:'¿Podés darme un ejemplo concreto?'}),
 Object.freeze({id:'TOPIC:OTHER',text:'Preguntar por otro tema'}),
 Object.freeze({id:'TOPIC:EXIT',text:'Despedirse'})
]);

// Mission hints are visible only when the authentic quest status and actor match.
// These are read-only extracts of the canon LI dialogue bank, not new orders.
function socialMissionHint(actorId,quests){
 if(!quests||typeof quests!=='object')return null;
 const st=id=>quests[id];
 const key = actorId==='shen_baojun' ? (
  st('M05')==='activa'?'SHEN_M05_HANDIN_BLOCKED':
  st('M05')==='hecha'?'SHEN_M05_ALREADY':
  st('M04')==='activa'?'SHEN_M04_IN_PROGRESS':
  st('M04')==='hecha'?'SHEN_M04_ALREADY':null):
  actorId==='chen_bo'&&st('M05')==='activa'?'CHEN_M05_PROGRESS':
  actorId==='qiao_ren'&&st('M05')==='activa'?'QIAO_M05_PENDING':
  actorId==='qiao_ren'&&st('M05')==='hecha'?'QIAO_M05_DONE':
  actorId==='tao_ming'&&st('M02')==='activa'?'TAO_M02_ORIGINAL_GUARD':null;
 return key&&typeof LINES[key]==='string' ? LINES[key] : null;
}
function socialTopicsFor(actorId,quests=null){
 if(!Object.hasOwn(DIALOGUES,actorId))return [];
 return socialMissionHint(actorId,quests)?TOPICS:TOPICS.filter(t=>t.id!=='TOPIC:CURRENT');
}
function socialFollowUpFor(actorId){return Object.hasOwn(DIALOGUES,actorId)?FOLLOWUP:[];}
function socialAnswer(actorId,topicId,priorTopic=null,quests=null){
 const d=DIALOGUES[actorId];if(!d)return null;
 const index=topicId==='TOPIC:ROLE'?0:topicId==='TOPIC:METHOD'?1:
  topicId==='TOPIC:EXAMPLE'&&['TOPIC:ROLE','TOPIC:METHOD'].includes(priorTopic)?2:-1;
 const hint=topicId==='TOPIC:CURRENT'?socialMissionHint(actorId,quests):null;
 if(index<0&&!hint)return null;
 const question=topicId==='TOPIC:EXAMPLE'?'¿Podés darme un ejemplo concreto?':TOPICS.find(t=>t.id===topicId)?.text;
 return Object.freeze({actorId,topicId,question,text:hint??d[index],revision:SOCIAL_CONTEXT_REVISION,worldWrites:0,grants:0});
}
function socialActors(){return Object.freeze(Object.keys(DIALOGUES));}

export { SOCIAL_CONTEXT_REVISION, SOCIAL_CONTEXT_SOURCE, isAuthenticSocialUtterance, sealSocialUtterance, socialActors, socialAnswer, socialFollowUpFor, socialMissionHint, socialTopicsFor };
