import { number, fail } from './data/safe-data.js';

/** Exact rational decimal arithmetic until final discrete boundary; no intermediate rounding. */
const gcd=(a,b)=>{a=a<0n?-a:a;while(b){[a,b]=[b,a%b];}return a;};
function rational(n) {
  number(n);
  const [mantissa,expText='0']=n.toString().toLowerCase().split('e');
  const exp=Number(expText), neg=mantissa.startsWith('-');
  const unsigned=neg?mantissa.slice(1):mantissa;
  const [integer,fraction='']=unsigned.split('.');
  let p=BigInt(integer+fraction)*(neg?-1n:1n), q=10n**BigInt(fraction.length);
  if(exp>=0)p*=10n**BigInt(exp);else q*=10n**BigInt(-exp);
  return reduce(p,q);
}
function reduce(p,q){const g=gcd(p,q);return Object.freeze({p:p/g,q:q/g});}
const add=(a,b)=>reduce(a.p*b.q+b.p*a.q,a.q*b.q);
const multiply=(a,b)=>reduce(a.p*b.p,a.q*b.q);
const negate=a=>reduce(-a.p,a.q);
const percent=a=>multiply(a,rational(0.01));
const maxZero=a=>a.p<0n?rational(0):a;
function asNumber(a){
  let value=Number(a.p)/Number(a.q);
  if(!Number.isFinite(Number(a.p))||!Number.isFinite(Number(a.q))){
    const neg=a.p<0n,p=neg?-a.p:a.p;
    const digits=((p%a.q)*10n**350n/a.q).toString().padStart(350,'0');
    value=Number(`${neg?'-':''}${p/a.q}.${digits}`);
  }
  if(!Number.isFinite(value)||Math.abs(value)>1e9)fail('RESULT_BOUND');return value;
}
function roundNearest(a) {
  if(a.p<0n) fail('NEGATIVE_DISCRETE_RESULT');
  const rounded=(2n*a.p+a.q)/(2n*a.q);
  const result=Number(rounded);if(!Number.isSafeInteger(result)||result>1e9)fail('RESULT_BOUND');return result;
}

export { add, asNumber, maxZero, multiply, negate, percent, rational, roundNearest };
