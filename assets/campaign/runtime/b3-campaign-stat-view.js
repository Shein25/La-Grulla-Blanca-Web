// Shape adapter only. Values and frame authenticity remain owned by V284/V307.
// No legacy provider, formula, default, alias or compatibility calculation.
const views=new WeakSet();
const STAGES=Object.freeze(['LianQi_I','LianQi_II','LianQi_III','LianQi_IV','ZhuJi']);
function sealV284View(frame){if(frame?.complete!==true||!STAGES.includes(frame.stage)||!frame.root)throw Error('A08_CLOSED_CAMPAIGN_FRAME_REQUIRED');const v=Object.freeze({actorId:'player',root:frame.root,stage:frame.stage,engine_contract:'NEW_COMBAT_STATS_V0_1',stats_status:'READY'});views.add(v);return v;}
function requireStatView(v){if(!views.has(v))throw Error('A08_PRIVATE_CAMPAIGN_STAT_VIEW_REQUIRED');return v;}

export { STAGES, requireStatView, sealV284View };
