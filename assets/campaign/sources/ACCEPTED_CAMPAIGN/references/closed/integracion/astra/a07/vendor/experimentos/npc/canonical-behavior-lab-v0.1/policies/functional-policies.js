const FUNCTIONAL_POLICY_STATUS={
  feng_zhi:"EXPERIMENTAL_MINIMAL_EVENT_FSM",
  ma_qiren:"EXPERIMENTAL_CANON_SUPPORTED_BT",
  lu_cheng:"EXPERIMENTAL_ANCHORED_FSM",
  ning_cai:"EXPERIMENTAL_ANCHORED_FSM",
  wen_tao:"EXPERIMENTAL_CANON_SUPPORTED_BT",
  yu_shun:"EXPERIMENTAL_MINIMAL_EVENT_FSM",
  ma_gu:"EXPERIMENTAL_CANON_SUPPORTED_FSM",
  ren_bo:"EXPERIMENTAL_CANON_SUPPORTED_BT",
  xu_an:"EXPERIMENTAL_CANON_SUPPORTED_BT",
  mei_shufen:"EXPERIMENTAL_CANON_GUARD_FSM"
};

const FENG_ZHI_FSM={id:"feng_zhi_lab",initialState:"DISCIPLINE",states:{DISCIPLINE:{on:{
  TICK:[{priority:10,target:"DISCIPLINE",emit:["SUPPORT_DISCIPLINE"]}]
}}}};
const FENG_ZHI_ALLOWED=["SUPPORT_DISCIPLINE"];

const MA_QIREN_BT={id:"ma_qiren_lab",root:{id:"root",type:"selector",children:[
  {id:"crisis_seq",type:"sequence",children:[
    {id:"resource_crisis",type:"condition",test:{key:"resourceCrisis",op:"EQ",value:true}},
    {id:"distribute",type:"action",intent:"DISTRIBUTE_SUPPLIES"}
  ]},
  {id:"stock_seq",type:"sequence",children:[
    {id:"stock_work",type:"condition",test:{key:"stockWork",op:"EQ",value:true}},
    {id:"manage_stock",type:"action",intent:"MANAGE_STOCK"}
  ]},
  {id:"hold",type:"action",intent:"HOLD_STORE"}
]}};
const MA_QIREN_ALLOWED=["DISTRIBUTE_SUPPLIES","MANAGE_STOCK","HOLD_STORE"];

const LU_CHENG_FSM={id:"lu_cheng_lab",initialState:"WORKSHOP",states:{WORKSHOP:{on:{
  TICK:[{priority:10,target:"WORKSHOP",emit:["REPAIR_EQUIPMENT"]}],
  M16_REPAIR:[{priority:20,target:"WORKSHOP",emit:["REPAIR_EMERGENCY_EQUIPMENT"]}]
}}}};
const LU_CHENG_ALLOWED=["REPAIR_EQUIPMENT","REPAIR_EMERGENCY_EQUIPMENT"];

const NING_CAI_FSM={id:"ning_cai_lab",initialState:"WORKSHOP",states:{WORKSHOP:{on:{
  TICK:[{priority:10,target:"WORKSHOP",emit:["PRODUCE_TEXTILE_GOODS"]}],
  M16_EMERGENCY:[{priority:20,target:"WORKSHOP",emit:["PRODUCE_EMERGENCY_PROTECTIONS"]}]
}}}};
const NING_CAI_ALLOWED=["PRODUCE_TEXTILE_GOODS","PRODUCE_EMERGENCY_PROTECTIONS"];

const WEN_TAO_BT={id:"wen_tao_lab",root:{id:"root",type:"selector",children:[
  {id:"critical_seq",type:"sequence",children:[
    {id:"critical_node",type:"condition",test:{key:"criticalNode",op:"EQ",value:true}},
    {id:"stabilize",type:"action",intent:"STABILIZE_CRITICAL_NODE"}
  ]},
  {id:"repair_seq",type:"sequence",children:[
    {id:"repair_due",type:"condition",test:{key:"repairDue",op:"EQ",value:true}},
    {id:"repair",type:"action",intent:"REPAIR_FORMATION_COMPONENT"}
  ]},
  {id:"hold",type:"action",intent:"HOLD_TECH_POST"}
]}};
const WEN_TAO_ALLOWED=["STABILIZE_CRITICAL_NODE","REPAIR_FORMATION_COMPONENT","HOLD_TECH_POST"];

const YU_SHUN_FSM={id:"yu_shun_lab",initialState:"COPY_DESK",states:{COPY_DESK:{on:{
  TICK:[{priority:10,target:"COPY_DESK",emit:["HOLD_COPY_DESK"]}],
  M09_COPY:[{priority:20,target:"COPY_DESK",emit:["COPY_RESTORE_RECORDS"]}]
}}}};
const YU_SHUN_ALLOWED=["HOLD_COPY_DESK","COPY_RESTORE_RECORDS"];

const MA_GU_FSM={id:"ma_gu_lab",initialState:"QUARRY",states:{QUARRY:{on:{
  TICK:[{priority:10,target:"QUARRY",emit:["SUPERVISE_QUARRY"]}],
  M16_RESOURCES:[{priority:20,target:"QUARRY",emit:["SUPPORT_RESOURCE_FRONT"]}]
}}}};
const MA_GU_ALLOWED=["SUPERVISE_QUARRY","SUPPORT_RESOURCE_FRONT"];

const REN_BO_BT={id:"ren_bo_lab",root:{id:"root",type:"selector",children:[
  {id:"crisis_seq",type:"sequence",children:[
    {id:"route_crisis",type:"condition",test:{key:"routeCrisis",op:"EQ",value:true}},
    {id:"secure_routes",type:"action",intent:"SECURE_ROUTES"}
  ]},
  {id:"patrol_seq",type:"sequence",children:[
    {id:"patrol_due",type:"condition",test:{key:"patrolDue",op:"EQ",value:true}},
    {id:"patrol",type:"action",intent:"PATROL_ROUTES"}
  ]},
  {id:"hold",type:"action",intent:"HOLD_VALLEY_POST"}
]}};
const REN_BO_ALLOWED=["SECURE_ROUTES","PATROL_ROUTES","HOLD_VALLEY_POST"];

const XU_AN_BT={id:"xu_an_lab",root:{id:"root",type:"selector",children:[
  {id:"crisis_seq",type:"sequence",children:[
    {id:"sauces_crisis",type:"condition",test:{key:"saucesCrisis",op:"EQ",value:true}},
    {id:"coordinate",type:"action",intent:"COORDINATE_SAUCES"}
  ]},
  {id:"community_seq",type:"sequence",children:[
    {id:"community_duty",type:"condition",test:{key:"communityDuty",op:"EQ",value:true}},
    {id:"represent",type:"action",intent:"REPRESENT_SAUCES"}
  ]},
  {id:"hold",type:"action",intent:"HOLD_COMMUNAL_HOUSE"}
]}};
const XU_AN_ALLOWED=["COORDINATE_SAUCES","REPRESENT_SAUCES","HOLD_COMMUNAL_HOUSE"];

const MEI_SHUFEN_FSM={id:"mei_shufen_lab",initialState:"HERBALIST",states:{HERBALIST:{on:{
  TICK:[{priority:10,target:"HERBALIST",emit:["TEND_LOCAL_HERBS"]}],
  M16_SAUCES:[{priority:20,target:"HERBALIST",emit:["SUPPORT_SAUCES_HERBALIST"]}],
  M16_SAUCES_DAMAGED:[{priority:30,target:"HERBALIST",emit:["CONTINUE_SUPPORT_AFTER_DAMAGE"]}]
}}}};
const MEI_SHUFEN_ALLOWED=["TEND_LOCAL_HERBS","SUPPORT_SAUCES_HERBALIST","CONTINUE_SUPPORT_AFTER_DAMAGE"];

export { FENG_ZHI_ALLOWED, FENG_ZHI_FSM, FUNCTIONAL_POLICY_STATUS, LU_CHENG_ALLOWED, LU_CHENG_FSM, MA_GU_ALLOWED, MA_GU_FSM, MA_QIREN_ALLOWED, MA_QIREN_BT, MEI_SHUFEN_ALLOWED, MEI_SHUFEN_FSM, NING_CAI_ALLOWED, NING_CAI_FSM, REN_BO_ALLOWED, REN_BO_BT, WEN_TAO_ALLOWED, WEN_TAO_BT, XU_AN_ALLOWED, XU_AN_BT, YU_SHUN_ALLOWED, YU_SHUN_FSM };
