const PEI_LUO_FSM = {
  id: "pei_luo_fsm_lab",
  initialState: "PREP",
  states: {
    PREP: { on: {
      SERVICE_DUE: [{priority:10,target:"MOVE_OUT",emit:["MOVE_TO_DINING"]}],
      CRISIS: [{priority:100,target:"CRISIS",emit:["ORGANIZE_CRISIS_RATIONS"]}]
    }},
    MOVE_OUT: { on: {
      ARRIVED_DINING: [{priority:10,target:"SERVE",emit:["SERVE_RATIONS"]}],
      CRISIS: [{priority:100,target:"CRISIS",emit:["ORGANIZE_CRISIS_RATIONS"]}]
    }},
    SERVE: { on: {
      SERVICE_COMPLETE: [{priority:10,target:"RETURN",emit:["RETURN_KITCHEN"]}],
      CRISIS: [{priority:100,target:"CRISIS",emit:["ORGANIZE_CRISIS_RATIONS"]}]
    }},
    RETURN: { on: {
      ARRIVED_KITCHEN: [{priority:10,target:"RESET",emit:["RESET_KITCHEN"]}],
      CRISIS: [{priority:100,target:"CRISIS",emit:["ORGANIZE_CRISIS_RATIONS"]}]
    }},
    RESET: { on: {
      RESET_COMPLETE: [{priority:10,target:"PREP",emit:["PREPARE_RATIONS"]}],
      CRISIS: [{priority:100,target:"CRISIS",emit:["ORGANIZE_CRISIS_RATIONS"]}]
    }},
    CRISIS: { on: {
      CRISIS_ENDED: [{priority:10,target:"RETURN",emit:["RETURN_KITCHEN"]}]
    }}
  }
};

export { PEI_LUO_FSM };
