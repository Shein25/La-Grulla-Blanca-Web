const WEI_JIAN_POLICY_STATUS={
  behaviorTree:"EXPERIMENTAL_NON_CANONICAL",
  martialResponse:"CANON_SUPPORTED_M16_POLICY_HYPOTHESIS",
  physicalNavigation:"CANONICAL_DOMAIN_CAPABILITY_GAP"
};

const WEI_JIAN_ALLOWED_INTENTS=[
  "HOLD_MARTIAL_POST",
  "SUPERVISE_TRAINING",
  "INVESTIGATE_MARTIAL_ANOMALY",
  "RESPOND_SECURITY"
];

const WEI_JIAN_BT={
  id:"wei_jian_bt_lab",
  root:{
    id:"root",
    type:"selector",
    children:[
      {
        id:"security_seq",type:"sequence",children:[
          {id:"high_threat",type:"condition",test:{key:"highThreat",op:"EQ",value:true}},
          {id:"security_response",type:"action",intent:"RESPOND_SECURITY"}
        ]
      },
      {
        id:"investigate_seq",type:"sequence",children:[
          {id:"suspicious",type:"condition",test:{key:"suspicious",op:"EQ",value:true}},
          {id:"investigate",type:"action",intent:"INVESTIGATE_MARTIAL_ANOMALY"}
        ]
      },
      {
        id:"training_seq",type:"sequence",children:[
          {id:"training_due",type:"condition",test:{key:"trainingDue",op:"EQ",value:true}},
          {id:"training",type:"action",intent:"SUPERVISE_TRAINING"}
        ]
      },
      {id:"hold",type:"action",intent:"HOLD_MARTIAL_POST"}
    ]
  }
};

export { WEI_JIAN_ALLOWED_INTENTS, WEI_JIAN_BT, WEI_JIAN_POLICY_STATUS };
