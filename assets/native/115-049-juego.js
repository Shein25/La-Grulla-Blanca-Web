const juego = new Juego();
globalThis.ASTRA_A08_CAMPAIGN_CONNECT({runtime:juego,bridge:astraA08Native.connect(juego),roomDefinitions:ROOMS,extractionDefinitions:HALLAZGOS_CADAVER,materialDefinitions:ITEMS,monsterDefinitions:MOBS,corpseTTL:DURACION_CADAVER,npcResolver:resolverNPC,questDefinitions:QUESTS,expansion:LGB_INTEGRATION_DATA});
// A07.9: one trusted native bootstrap; local read-only visibility, no UI ingress.
// G03: install NEW methods before the single existing A07 lifecycle bootstrap.

const astraGeneralNative = globalThis.ASTRA_CC_BOOTSTRAP({runtime:juego,npcDefinitions:NPC_DEF,roomDefinitions:ROOMS,gateDefinitions:GATES_329});
