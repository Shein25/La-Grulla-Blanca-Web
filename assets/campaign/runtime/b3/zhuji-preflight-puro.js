// LAB PURE PREFLIGHT: NO runtime hooks, rewards, SAVE writes, or stage grants.
// Values are supplied by the source-locked policy loaded separately.
function evaluateZhujiPure({policy, state}) {
  if (!policy?.quality?.thresholds?.CELESTIAL?.hard_requirements ||
      !policy?.preserve?.zhuji_qualities || !state) throw Error('ZHUJI_MISSING_RATIFIED_POLICY_OR_STATE');
  const q=policy.quality, g=q.foundation_access_gate;
  const isNum=v=>Number.isSafeInteger(v)&&v>=0;
  const okComprehension=isNum(state.eligibleComprehension);
  const pillProof=state.pill?.authentic===true && state.pill?.claimed===true &&
                  state.pill?.consumed===false && state.pill?.id===q.pill_id &&
                  typeof state.pill?.eventId==='string' && state.pill.eventId.length>0;
  // 'pillProof' is a *declared* fact from the caller, not verification against native G08.
  // Only a native verifier may authorize a consumable commit based on a durable receipt.
  const explicitPillUse=state.pillConsent===true && pillProof;
  const missing=[];
  if(state.stage!=='LianQi_IV')missing.push('LIANQI_IV');
  if(state.cultivationCredit!==30)missing.push('CREDIT_30_OF_30');
  if(state.physicalQi!==55)missing.push('QI_55_OF_55');
  if(state.m18Closed!==true)missing.push('M18_HECHA');
  if(!['LIBERAR','CUSTODIAR'].includes(state.grullaDecision))missing.push('GRULLA_CHOICE');
  if(state.granPerfeccion!==true)missing.push('GRAN_PERFECCION');
  if(state.iluminacion!==true)missing.push('ILUMINACION');
  if(state.daoSeed!==true)missing.push('SEMILLA_DAO');
  if(state.tribulacionSuperada!==true)missing.push('TRIBULACION_SUPERADA');
  if(!isNum(state.meridianWounds)||state.meridianWounds>=3)missing.push('MERIDIAN_WOUNDS_LT_3');
  if(!isNum(state.impurities))missing.push('IMPURITIES_VALID');
  // Unverifiable comprehension MUST NOT become eligible by simply copying the number in a HUD.
  if(!okComprehension)missing.push('ELIGIBLE_COMPREHENSION_PROVENANCE');
  if(!(okComprehension&&state.eligibleComprehension>=g.eligible_comprehension_at_least)&&!pillProof)
    missing.push('COMPREHENSION_OR_AUTHENTIC_PILL');
  if(state.firstTribulationFailurePointIncludedInEligible===true)
    missing.push('FIRST_TRIBULATION_FAILURE_WRONGLY_ELIGIBLE');
  const meridianMod=q.meridian_modifier[String(state.meridianWounds)];
  const canScore=okComprehension&&isNum(state.impurities)&&typeof meridianMod==='number';
  const calculate=includePill=> {
    const score=state.eligibleComprehension+meridianMod-q.impurity_penalty_per_unit*state.impurities+(includePill?q.pill_bonus_points:0);
    const t=q.thresholds;
    const quality=score>=t.CELESTIAL.min ? (includePill?'CELESTIAL':'IMPECABLE'):
      score>=t.IMPECABLE.min?'IMPECABLE':score>=t.ESTABLE.min?'ESTABLE':'AGRIETADA';
    return {score, quality, stats:policy.preserve.zhuji_qualities[quality]};
  };
  return {
    // Read-only calculation; requirementsMet does not authorize native stage transition.
    requirementsMet:missing.length===0, missing,
    withoutPill:canScore?calculate(false):null,
    withPillIfConsented:canScore&&explicitPillUse?calculate(true):null,
    pillProofDeclared:pillProof,
    nativeCommitAuthorized:false,
    status:'PURE_LAB_PREFLIGHT_ONLY__NO_NATIVE_RECEIPT_OR_G08_CERTIFICATION'
  };
}

export { evaluateZhujiPure };
