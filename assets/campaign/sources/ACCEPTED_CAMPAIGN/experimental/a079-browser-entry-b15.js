import { createShenServicePort } from './shen-service-availability-b15.js';
import { connectNativeSession } from '../../../runtime/g08-native-session-prepromotion.js';
import { createGeneralConversationHost } from '../../../runtime/b2-native-conversation-host-r49.js';

if(Object.hasOwn(globalThis,'ASTRA_SELF_INTRODUCTION_B22')||Object.hasOwn(globalThis,'ASTRA_CC_SESSION'))throw Error('A079_DUPLICATE_ARTIFACT');
const host=createGeneralConversationHost();
globalThis.ASTRA_SELF_INTRODUCTION_B22=Object.freeze({respond:host.respond,consumeVisibleOutput:host.consumeVisibleOutput,cancelPending:host.cancelPending,capabilities:host.capabilities});
let installed=false;
Object.defineProperty(globalThis,'ASTRA_CC_BOOTSTRAP',{configurable:true,value(options){
 if(installed)throw Error('A079_SINGLE_OWNER');installed=true;
 host.configure({...options,servicePort:createShenServicePort(options.runtime)});
 const result=connectNativeSession(options,{connected:host.connected,retired:host.retired});
 if(result.status!=='CONNECTED')throw Error(result.reason);
 Object.defineProperty(globalThis,'ASTRA_CC_SESSION',{value:result.session,writable:false,configurable:false});
 Object.defineProperty(globalThis,'ASTRA_A079_DIAGNOSTICS',{value:Object.freeze({inspect:host.inspect}),writable:false,configurable:false});
 delete globalThis.ASTRA_CC_BOOTSTRAP;
 return Object.freeze({beginInput:host.beginInput,authorizeSpeak:host.authorizeSpeak,openKnownOptions:host.openKnownOptions});
}});
