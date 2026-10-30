// Visible labels only. Never mutate historical IDs or blindly rewrite text contents.
const M15_NEW_ID='ARC1_INJERTO_LIV_01';
function visibleMissionNumber(id){
 if(id===M15_NEW_ID)return 15;
 if(!/^M\d\d$/.test(String(id)))throw Error('M15_UNKNOWN_ID');
 const n=Number(id.slice(1));if(n>=4&&n<=12)return n+2;if(n>=13&&n<=18)return n+3;
 return n;
}
function visibleMissionLabel(id){return 'M'+String(visibleMissionNumber(id)).padStart(2,'0');}
function visibleMissionReference(id){return {internalId:id,visibleId:visibleMissionLabel(id)};}

export { M15_NEW_ID, visibleMissionLabel, visibleMissionNumber, visibleMissionReference };
