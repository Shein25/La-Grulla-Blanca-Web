const GOAP_ACTIONS = Object.freeze([
  { id:'ayudar_jugador', cost:1, preconditions:{ at:'jugador', playerNeedsHelp:true }, effects:{ playerNeedsHelp:false, playerHelped:true } },
  { id:'cumplir_deber', cost:1, preconditions:{ at:'puesto', dutyPending:true }, effects:{ dutyPending:false, dutySatisfied:true } },
  { id:'enviar_mensajero', cost:4, preconditions:{ at:'puesto', hasEvidence:true, messengerAvailable:true }, effects:{ superiorInformed:true } },
  { id:'esperar', cost:1, preconditions:{ at:'puesto' }, effects:{ waited:true } },
  { id:'informar_superior', cost:1, preconditions:{ at:'superior', hasEvidence:true, superiorAvailable:true }, effects:{ superiorInformed:true } },
  { id:'investigar_anomalia', cost:1, preconditions:{ at:'puesto', anomalyPresent:true }, effects:{ anomalyInvestigated:true, hasEvidence:true } },
  { id:'ir_jugador', cost:1, preconditions:{ at:'puesto', playerPresent:true, playerReachable:true }, effects:{ at:'jugador' } },
  { id:'ir_superior', cost:1, preconditions:{ at:'puesto', passageOpen:true, superiorAvailable:true }, effects:{ at:'superior' } },
  { id:'volver_puesto_desde_jugador', cost:1, preconditions:{ at:'jugador' }, effects:{ at:'puesto' } },
  { id:'volver_puesto_desde_superior', cost:1, preconditions:{ at:'superior' }, effects:{ at:'puesto' } },
]);

export { GOAP_ACTIONS };
