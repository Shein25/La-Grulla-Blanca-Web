const GAO_SHUN_FSM = {
  id: "gao_shun_fsm_lab",
  initialState: "POST",
  states: {
    POST: { on: {
      PATROL_DUE: [{priority:10,target:"PATROL",emit:["PATROL_ROUTE"]}],
      SUSPICIOUS: [{priority:20,target:"OBSERVE",emit:["OBSERVE_TARGET"]}],
      HOSTILE: [{priority:30,target:"BLOCK",emit:["BLOCK_PASSAGE"]}]
    }},
    PATROL: { on: {
      SUSPICIOUS: [{priority:20,target:"OBSERVE",emit:["OBSERVE_TARGET"]}],
      HOSTILE: [{priority:30,target:"BLOCK",emit:["BLOCK_PASSAGE"]}],
      PATROL_COMPLETE: [{priority:10,target:"RETURN",emit:["RETURN_POST"]}]
    }},
    OBSERVE: { on: {
      CLEARED: [{priority:10,target:"RETURN",emit:["RETURN_POST"]}],
      PERSISTS: [{priority:20,target:"WARN",emit:["WARN_TARGET"]}],
      HOSTILE: [{priority:30,target:"BLOCK",emit:["BLOCK_PASSAGE"]}]
    }},
    WARN: { on: {
      COMPLIES: [{priority:10,target:"RETURN",emit:["RETURN_POST"]}],
      CLEARED: [{priority:10,target:"RETURN",emit:["RETURN_POST"]}],
      HOSTILE: [{priority:30,target:"BLOCK",emit:["BLOCK_PASSAGE"]}]
    }},
    BLOCK: { on: {
      THREAT_ENDED: [{priority:10,target:"RETURN",emit:["RETURN_POST"]}]
    }},
    RETURN: { on: {
      ARRIVED: [{priority:10,target:"POST",emit:["HOLD_POST"]}]
    }}
  }
};

export { GAO_SHUN_FSM };
