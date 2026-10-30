const JI_XUEYING_POLICY_STATUS={
  architecture:"EXPERIMENTAL_MINIMAL_EVENT_FSM",
  anchoredMovement:"CANONICAL_CONSTRAINT"
};

const JI_XUEYING_ALLOWED_INTENTS=[
  "HOLD_COUNCIL_POSITION",
  "PRESIDE_COUNCIL"
];

const JI_XUEYING_FSM={
  id:"ji_xueying_anchor_lab",
  initialState:"COUNCIL",
  states:{
    COUNCIL:{
      on:{
        TICK:[{priority:10,target:"COUNCIL",emit:["HOLD_COUNCIL_POSITION"]}],
        M17_COUNCIL:[{priority:20,target:"COUNCIL",emit:["PRESIDE_COUNCIL"]}]
      }
    }
  }
};

export { JI_XUEYING_ALLOWED_INTENTS, JI_XUEYING_FSM, JI_XUEYING_POLICY_STATUS };
