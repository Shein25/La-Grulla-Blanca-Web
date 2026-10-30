const JIANG_RUI_FSM = {
  id: "jiang_rui_fsm_lab",
  initialState: "POST",
  states: {
    POST: { on: {
      PATROL_DUE: [{priority:10,target:"PATROL",emit:["PATROL_ROUTE"]}],
      ANOMALY: [{priority:20,target:"INVESTIGATE",emit:["INVESTIGATE_ROUTE_ANOMALY"]}],
      HIGH_RISK: [{priority:30,target:"REPORT",emit:["REPORT_SUPERIOR"]}],
      AWAY_FROM_POST: [{priority:15,target:"RETURN",emit:["RETURN_POST"]}]
    }},
    PATROL: { on: {
      ANOMALY: [{priority:20,target:"INVESTIGATE",emit:["INVESTIGATE_ROUTE_ANOMALY"]}],
      HIGH_RISK: [{priority:30,target:"REPORT",emit:["REPORT_SUPERIOR"]}],
      AWAY_FROM_POST: [{priority:15,target:"RETURN",emit:["RETURN_POST"]}],
      PATROL_COMPLETE: [{priority:10,target:"RETURN",emit:["RETURN_POST"]}]
    }},
    INVESTIGATE: { on: {
      HIGH_RISK: [{priority:30,target:"REPORT",emit:["REPORT_SUPERIOR"]}],
      RESOLVED: [{priority:10,target:"RETURN",emit:["RETURN_POST"]}]
    }},
    REPORT: { on: {
      REPORT_COMPLETE: [{priority:10,target:"RETURN",emit:["RETURN_POST"]}]
    }},
    RETURN: { on: {
      ARRIVED: [{priority:10,target:"POST",emit:["HOLD_POST"]}]
    }}
  }
};

export { JIANG_RUI_FSM };
