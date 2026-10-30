const VESTIR_REFLEJO = {
  campesino: "botas de barro y el saco que cosió tu madre",
  escolar: "la túnica raída de tres exámenes",
  callejero: "la chaqueta del mercado sur, el cuchillo bajo la palma",
};

const NS_SVG = "http://www.w3.org/2000/svg";
function elSVG(tag, attrs = {}) {
  const el = document.createElementNS(NS_SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}
