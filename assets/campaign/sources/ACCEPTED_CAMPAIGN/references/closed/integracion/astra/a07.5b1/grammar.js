import { freeze, copy, exact, fail } from '../a07/safe-data.js';

/** Closed Spanish surface language. Lexical slots are concepts, never world bindings. */
const SUBJECTS=freeze({
 EASTERN_ROUTE:{noun:'la ruta oriental',gender:'f',kind:'ACCESS_STATE'},
 PASSAGE:{noun:'el paso',gender:'m',kind:'ACCESS_STATE'},
 DOOR:{noun:'la puerta',gender:'f',kind:'ACCESS_STATE'},
 WORKSHOP:{noun:'el taller',gender:'m',kind:'ACCESS_STATE'},
 PIECE:{noun:'la pieza',gender:'f',kind:'OBJECT_STATE'},
 MATERIAL:{noun:'el material',gender:'m',kind:'OBJECT_STATE'},
 REGISTER:{noun:'el registro',gender:'m',kind:'AVAILABILITY'},
 ROOM:{noun:'la sala',gender:'f',kind:'AVAILABILITY'},
 WORKSHOP_AVAILABILITY:{noun:'el taller',gender:'m',kind:'AVAILABILITY'},
 REVIEW:{noun:'la revisión',gender:'f',kind:'TASK_STATE'},
 PREPARATION:{noun:'la preparación',gender:'f',kind:'TASK_STATE'},
 MARK:{noun:'la marca',gender:'f',kind:'OBSERVATION_STATE'},
 SIGNAL:{noun:'la señal',gender:'f',kind:'OBSERVATION_STATE'},
 PASSAGE_STATUS:{noun:'el estado del paso',gender:'m',kind:'UNCERTAINTY_STATE'},
 PIECE_CONDITION:{noun:'el estado de la pieza',gender:'m',kind:'UNCERTAINTY_STATE'}
});
const STATES=freeze({
 ACCESS_STATE:{OPEN:['abierto','abierta'],CLOSED:['cerrado','cerrada']},
 OBJECT_STATE:{READY:['listo','lista'],DAMAGED:['dañado','dañada']},
 AVAILABILITY:{AVAILABLE:['disponible','disponible'],UNAVAILABLE:['no disponible','no disponible']},
 TASK_STATE:{PENDING:['pendiente','pendiente'],COMPLETED:['terminado','terminada']},
 OBSERVATION_STATE:{VISIBLE:['visible','visible'],NOT_VISIBLE:['no visible','no visible']},
 UNCERTAINTY_STATE:{CONFIRMED:['confirmado','confirmada'],UNCONFIRMED:['no confirmado','no confirmada']}
});
// No exclusive actor particle; three of four catalog variants have no lead.
const LEADS=freeze({NONE:'',BIEN:'Bien. ',DIRECT:'Directamente: ',PRECISION:'Para precisar: '});
const ORDERS=freeze(['SVO','PREDICATE','IMPERSONAL','ABOUT','REGARDING','ECHO','SPLIT','TOPIC','DESCRIPTIVE','REPORT','SPECIFIC','STATEMENT','DOMAIN']);
const JOINS=freeze(['SENTENCES','SEMICOLON','COORDINATE','SEPARATE']);
const ENDINGS=freeze({NONE:'',BOUNDARY:' Eso es lo que afirmo.',CLOSURE:' Esa es mi respuesta.'});
const REFUSALS=freeze({
 SHORT:['No. No voy a hablar de eso.','No responderé.','De eso no hablaré.','No. Esa pregunta queda sin respuesta.'],
 FORMAL:['Esa pregunta quedará sin respuesta.','No daré respuesta sobre ese asunto.','Sobre ese asunto, mi respuesta es no.','Ese asunto no será tratado en mi respuesta.'],
 RESERVED:['Prefiero guardar silencio sobre eso.','Sobre ese asunto, no daré respuesta.','Esa pregunta la dejaré sin respuesta.','No me pronunciaré sobre eso.'],
 PRACTICAL:['Eso no lo voy a responder.','No. De ese asunto no voy a hablar.','De eso prefiero no hablar.','Ese tema lo dejo sin respuesta.'],
 PRECISE:['No responderé a esa pregunta.','Sobre esa cuestión guardaré silencio.','No voy a dar una respuesta acerca de eso.','Mi respuesta a esa pregunta es no.'],
 CLOSING:['No voy a entrar en ese asunto.','Ese tema queda fuera de mi respuesta.','Sobre eso no hablaré. Esa es mi respuesta.','No responderé. Dejo esa pregunta sin respuesta.']
});
function proposition(raw){const p=copy(raw);exact(p,['kind','subject','state']);const s=SUBJECTS[p.subject];if(!s||s.kind!==p.kind||!Object.hasOwn(STATES[p.kind],p.state))fail('A075B1_UNSUPPORTED_PROPOSITION');return p;}
const claimKey=p=>JSON.stringify([p.kind,p.subject,p.state]);
const cap=s=>s[0].toUpperCase()+s.slice(1);
function predicate(p){const s=SUBJECTS[p.subject],a=STATES[p.kind][p.state][s.gender==='f'?1:0],verb=p.kind==='OBSERVATION_STATE'?'es':'está';return a.startsWith('no ')?{verb:'no '+verb,adjective:a.slice(3)}:{verb,adjective:a};}
function renderClause(raw,order='SVO'){
 const p=proposition(raw),s=SUBJECTS[p.subject],{verb,adjective}=predicate(p),negative=verb.startsWith('no ');
 if(order==='SVO')return `${s.noun} ${verb} ${adjective}`;
 if(order==='PREDICATE')return `${verb} ${adjective} ${s.noun}`;
 if(order==='IMPERSONAL')return `${s.noun} ${negative?'no se encuentra':'se encuentra'} ${adjective}`;
 if(order==='ABOUT')return `sobre ${s.noun}: ${verb} ${adjective}`;
 if(order==='REGARDING')return `en cuanto ${s.noun.startsWith('el ')?'al '+s.noun.slice(3):'a '+s.noun}, ${verb} ${adjective}`;
 if(order==='ECHO')return `¿${cap(s.noun)}? ${cap(verb)} ${adjective}`;
 if(order==='SPLIT')return `${s.noun}. ${cap(verb)} ${adjective}`;
 if(order==='TOPIC')return `${s.noun}: ${verb} ${adjective}`;
 if(order==='DESCRIPTIVE')return `${s.noun}, ${verb} ${adjective}`;
 if(order==='REPORT')return `lo que señalo es que ${s.noun} ${verb} ${adjective}`;
 if(order==='SPECIFIC')return `${s.noun}, en concreto, ${verb} ${adjective}`;
 if(order==='STATEMENT')return `sobre ${s.noun}, afirmo que ${verb} ${adjective}`;
 if(order==='DOMAIN'){
  if(p.kind==='ACCESS_STATE')return `el acceso ${s.noun.startsWith('el ')?'al '+s.noun.slice(3):'a '+s.noun} está ${STATES[p.kind][p.state][0]}`;
  if(p.kind==='OBSERVATION_STATE')return `${s.noun} ${negative?'no es':'es'} ${adjective}`;
  if(p.kind==='TASK_STATE')return p.state==='PENDING'?`queda pendiente ${s.noun}`:`${s.noun} ha terminado`;
  return `${s.noun} ${verb} ${adjective}`;
 }
 fail('A075B1_ORDER');
}
function renderFacts(raw,pattern,intentKind='RESPOND'){
 exact(pattern,['lead','order','secondOrder','join','ending']);
 if(!Object.hasOwn(LEADS,pattern.lead)||!ORDERS.includes(pattern.order)||!ORDERS.includes(pattern.secondOrder)||!JOINS.includes(pattern.join)||!Object.hasOwn(ENDINGS,pattern.ending))fail('A075B1_PATTERN');
 if(!Array.isArray(raw)||raw.length<1||raw.length>2)fail('A075B1_PAYLOAD_BOUND');
 // Echo acknowledges an actual direct request. INFORM never creates a question.
 const order=o=>o==='ECHO'&&intentKind!=='RESPOND'?'REGARDING':o;
 const orders=raw.map((_,n)=>order(n?pattern.secondOrder:pattern.order));
 const parts=raw.map((p,n)=>renderClause(p,orders[n]));
 const join=orders.some(o=>['SPLIT','ECHO'].includes(o))?'SENTENCES':pattern.join;
 let text=cap(parts[0]);
 if(parts.length===2){
  if(join==='SENTENCES')text+=`. ${cap(parts[1])}`;
  if(join==='SEMICOLON')text+=`; ${parts[1]}`;
  if(join==='COORDINATE')text+=` y ${parts[1]}`;
  if(join==='SEPARATE')text+=`. Por otra parte, ${parts[1]}`;
 }
 const lead=LEADS[pattern.lead];
 const prefix=lead.endsWith(': ')&&(text.includes(':')||orders.includes('ECHO'))?'':lead;
 const body=prefix.endsWith(': ')?text[0].toLowerCase()+text.slice(1):text;
 const ending=(pattern.ending==='CLOSURE'&&intentKind!=='RESPOND')||(pattern.ending==='BOUNDARY'&&orders.some(o=>['REPORT','STATEMENT'].includes(o)))?'NONE':pattern.ending;
 return prefix+body+'.'+ENDINGS[ending];
}
function renderFact(p,pattern){return renderFacts([p],pattern);}
function renderRefusal(style,index){if(!Object.hasOwn(REFUSALS,style)||!Number.isInteger(index)||index<0||index>3)fail('A075B1_REFUSAL_STYLE');return REFUSALS[style][index];}
// Decoder deliberately does not call any renderer or use the supplied payload.
function decodeClause(text){
 const t=text[0]?.toLowerCase()+text.slice(1),matches=[];
 for(const [subject,s]of Object.entries(SUBJECTS))for(const [state,forms]of Object.entries(STATES[s.kind])){
  const a=forms[s.gender==='f'?1:0],negative=a.startsWith('no '),adj=negative?a.slice(3):a,baseVerb=s.kind==='OBSERVATION_STATE'?'es':'está',verb=negative?'no '+baseVerb:baseVerb;
  const accepted=[`${s.noun} ${verb} ${adj}`,`${verb} ${adj} ${s.noun}`,`${s.noun} ${negative?'no se encuentra':'se encuentra'} ${adj}`,`sobre ${s.noun}: ${verb} ${adj}`,`en cuanto ${s.noun.startsWith('el ')?'al '+s.noun.slice(3):'a '+s.noun}, ${verb} ${adj}`,`¿${cap(s.noun)}? ${cap(verb)} ${adj}`,`${s.noun}. ${cap(verb)} ${adj}`,`${s.noun}: ${verb} ${adj}`,`${s.noun}, ${verb} ${adj}`];
  accepted.push(`lo que señalo es que ${s.noun} ${verb} ${adj}`,`${s.noun}, en concreto, ${verb} ${adj}`,`sobre ${s.noun}, afirmo que ${verb} ${adj}`);
  if(s.kind==='ACCESS_STATE')accepted.push(`el acceso ${s.noun.startsWith('el ')?'al '+s.noun.slice(3):'a '+s.noun} está ${forms[0]}`);
  if(s.kind==='OBSERVATION_STATE')accepted.push(`${s.noun} ${negative?'no es':'es'} ${adj}`);
  if(s.kind==='TASK_STATE')accepted.push(state==='PENDING'?`queda pendiente ${s.noun}`:`${s.noun} ha terminado`);
  if(accepted.includes(t))matches.push({kind:s.kind,subject,state});
 }
 return matches.length===1?matches[0]:null;
}
function auditText(text){
 const invalid=()=>freeze({valid:false,claims:[],speechAct:null});
 if(typeof text!=='string'||text.length>240)return invalid();
 if(Object.values(REFUSALS).flat().includes(text))return freeze({valid:true,claims:[],speechAct:'REFUSE'});
 let t=text;
 for(const lead of Object.values(LEADS).filter(Boolean))if(t.startsWith(lead)){t=t.slice(lead.length);break;}
 for(const end of Object.values(ENDINGS).filter(Boolean))if(t.endsWith(end)){t=t.slice(0,-end.length);break;}
 if(!t.endsWith('.'))return invalid();t=t.slice(0,-1);
 const one=decodeClause(t);if(one)return freeze({valid:true,claims:[one],speechAct:'ASSERT'});
 const parses=[];
 for(const separator of ['. Por otra parte, ','. ','; ',' y ']){
  let at=t.indexOf(separator);
  while(at!==-1){const a=decodeClause(t.slice(0,at)),b=decodeClause(t.slice(at+separator.length));if(a&&b&&a.subject!==b.subject)parses.push([a,b]);at=t.indexOf(separator,at+1);}
 }
 const unique=new Map(parses.map(p=>[JSON.stringify(p),p]));
 if(unique.size!==1)return invalid();return freeze({valid:true,claims:[...unique.values()][0],speechAct:'ASSERT'});
}

export { ENDINGS, JOINS, LEADS, ORDERS, REFUSALS, STATES, SUBJECTS, auditText, claimKey, proposition, renderClause, renderFact, renderFacts, renderRefusal };
