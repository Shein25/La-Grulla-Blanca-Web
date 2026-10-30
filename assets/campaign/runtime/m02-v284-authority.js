// Integration boundary for the unchanged accepted M02 domain. These are private
// provenance brands, not an old resolver or a second numeric/target owner.
const actors=new WeakSet(),bindings=new WeakSet(),deaths=new WeakMap();
function registerM02Actor(p){actors.add(p);return p;}
function requireCombatOwner(p){if(!actors.has(p))throw Error('A08_M02_ACTOR_AUTHORITY');return p;}
function registerM02Binding(p){bindings.add(p);return p;}
function requireNativeM02Binding(p){if(!bindings.has(p))throw Error('A08_M02_BINDING_AUTHORITY');return p;}
function sealResolvedV284Death(d){const cap=Object.freeze({});deaths.set(cap,d);return cap;}
function requireResolvedMonsterDeath(cap){const d=deaths.get(cap);if(!d)throw Error('A08_M02_LETHAL_CAPABILITY_REQUIRED');return d;}

export { registerM02Actor, registerM02Binding, requireCombatOwner, requireNativeM02Binding, requireResolvedMonsterDeath, sealResolvedV284Death };
