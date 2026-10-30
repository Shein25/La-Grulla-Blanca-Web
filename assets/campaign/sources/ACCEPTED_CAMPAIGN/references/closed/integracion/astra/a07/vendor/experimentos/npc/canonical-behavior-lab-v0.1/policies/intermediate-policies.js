const INTERMEDIATE_POLICY_STATUS={
  shen_baojun:"EXPERIMENTAL_MINIMAL_EVENT_FSM",
  madre_wen:"EXPERIMENTAL_MINIMAL_EVENT_FSM",
  tao_ming:"CANON_SUPPORTED_MODE_SWITCH_FSM",
  su_lian:"EXPERIMENTAL_CANON_SUPPORTED_BT",
  chen_bo:"EXPERIMENTAL_CANON_SUPPORTED_BT",
  yao_fen:"EXPERIMENTAL_CANON_SUPPORTED_BT"
};

const SHEN_BAOJUN_FSM={
  id:"shen_baojun_lab",initialState:"INSTRUCTOR",states:{
    INSTRUCTOR:{on:{
      TICK:[{priority:10,target:"INSTRUCTOR",emit:["HOLD_INSTRUCTOR_AREA"]}],
      M03_TRAINING:[{priority:20,target:"INSTRUCTOR",emit:["TEACH_BASIC_TRAINING"]}]
    }}
  }
};
const SHEN_BAOJUN_ALLOWED=["HOLD_INSTRUCTOR_AREA","TEACH_BASIC_TRAINING"];

const MADRE_WEN_FSM={
  id:"madre_wen_lab",initialState:"CONTINUITY",states:{
    CONTINUITY:{on:{
      TICK:[{priority:10,target:"CONTINUITY",emit:["SUPPORT_EXTERNALS"]}],
      M01_INTEGRATION:[{priority:20,target:"CONTINUITY",emit:["INTEGRATE_ASPIRANTS"]}]
    }}
  }
};
const MADRE_WEN_ALLOWED=["SUPPORT_EXTERNALS","INTEGRATE_ASPIRANTS"];

const TAO_MING_FSM={
  id:"tao_ming_lab",initialState:"ROUTINE",states:{
    ROUTINE:{on:{
      ROUTINE_JOB:[{priority:10,target:"ROUTINE",emit:["REGISTER_ROUTINE_JOB"]}],
      M16_START:[{priority:20,target:"EMERGENCY",emit:["REGISTER_EMERGENCY"]}]
    }},
    EMERGENCY:{on:{
      EMERGENCY_REQUEST:[{priority:20,target:"EMERGENCY",emit:["REGISTER_EMERGENCY"]}],
      M16_END:[{priority:10,target:"ROUTINE",emit:["RETURN_ROUTINE_REGISTRY"]}]
    }}
  }
};
const TAO_MING_ALLOWED=["REGISTER_ROUTINE_JOB","REGISTER_EMERGENCY","RETURN_ROUTINE_REGISTRY"];

const SU_LIAN_BT={
  id:"su_lian_lab",root:{id:"root",type:"selector",children:[
    {id:"crisis_seq",type:"sequence",children:[
      {id:"garden_crisis",type:"condition",test:{key:"gardenCrisis",op:"EQ",value:true}},
      {id:"manage_gardens",type:"action",intent:"MANAGE_GARDEN_CRISIS"}
    ]},
    {id:"tutorial_seq",type:"sequence",children:[
      {id:"tutorial_due",type:"condition",test:{key:"tutorialDue",op:"EQ",value:true}},
      {id:"teach_herbalism",type:"action",intent:"TEACH_HERBALISM"}
    ]},
    {id:"tend",type:"action",intent:"TEND_GARDENS"}
  ]}
};
const SU_LIAN_ALLOWED=["MANAGE_GARDEN_CRISIS","TEACH_HERBALISM","TEND_GARDENS"];

const CHEN_BO_BT={
  id:"chen_bo_lab",root:{id:"root",type:"selector",children:[
    {id:"patients_seq",type:"sequence",children:[
      {id:"patients_waiting",type:"condition",test:{key:"patientsWaiting",op:"EQ",value:true}},
      {id:"prioritize_patients",type:"action",intent:"PRIORITIZE_PATIENTS"}
    ]},
    {id:"exam_seq",type:"sequence",children:[
      {id:"exam_due",type:"condition",test:{key:"examDue",op:"EQ",value:true}},
      {id:"run_exam",type:"action",intent:"RUN_SPIRITUAL_EXAM"}
    ]},
    {id:"hold",type:"action",intent:"HOLD_MEDICINE_POST"}
  ]}
};
const CHEN_BO_ALLOWED=["PRIORITIZE_PATIENTS","RUN_SPIRITUAL_EXAM","HOLD_MEDICINE_POST"];

const YAO_FEN_BT={
  id:"yao_fen_lab",root:{id:"root",type:"selector",children:[
    {id:"medicine_seq",type:"sequence",children:[
      {id:"medicine_crisis",type:"condition",test:{key:"medicineCrisis",op:"EQ",value:true}},
      {id:"supply_medicine",type:"action",intent:"SUPPLY_MEDICINE"}
    ]},
    {id:"lesson_seq",type:"sequence",children:[
      {id:"alchemy_lesson",type:"condition",test:{key:"alchemyLesson",op:"EQ",value:true}},
      {id:"teach_alchemy",type:"action",intent:"TEACH_ALCHEMY"}
    ]},
    {id:"botica",type:"action",intent:"PREPARE_BOTICA"}
  ]}
};
const YAO_FEN_ALLOWED=["SUPPLY_MEDICINE","TEACH_ALCHEMY","PREPARE_BOTICA"];

export { CHEN_BO_ALLOWED, CHEN_BO_BT, INTERMEDIATE_POLICY_STATUS, MADRE_WEN_ALLOWED, MADRE_WEN_FSM, SHEN_BAOJUN_ALLOWED, SHEN_BAOJUN_FSM, SU_LIAN_ALLOWED, SU_LIAN_BT, TAO_MING_ALLOWED, TAO_MING_FSM, YAO_FEN_ALLOWED, YAO_FEN_BT };
