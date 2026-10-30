const RAICES = {
  fuego: { nombre: "yang de fuego", qi_med: 5, hp_med: 2, ataque: 1, defensa: 0, tecnica: "palma",
           texto: "La piedra se enciende bajo tu mano. Un rojo profundo corre por su superficie y el calor de una fragua te alcanza.\n«Raíz de fuego — yang impaciente. El qi te arde rápido.»" },
  metal: { nombre: "metal afilado", qi_med: 3, hp_med: 3, ataque: 2, defensa: 0, tecnica: "filo",
           texto: "La piedra canta y un filo de luz blanca cruza su superficie. El sonido es limpio y corto.\n«Raíz de metal — cortante. Golpearás como un cincel.»" },
  agua:  { nombre: "yin de agua", qi_med: 4, hp_med: 6, ataque: 0, defensa: 2, tecnica: "latigo",
           texto: "La piedra ondula bajo tu palma y toma un azul sereno. Las ondas se extienden por la superficie y vuelven a quedarse quietas.\n«Raíz de agua — yin fluido. Difícil de herir, fácil de sanar.»" },
};

Object.assign(RAICES,{tierra:{nombre:"Tierra",texto:"Raíz espiritual: Tierra.",tecnica:null},viento:{nombre:"Viento",texto:"Raíz espiritual: Viento.",tecnica:null}});
const ORIGENES = {
  campesino: {
    nombre: "hijo de campesinos",
    texto: "El recaudador se llevó la mitad de la cosecha el año pasado y la otra mitad este. Tu madre vació el costurero para pagarte el camino y te entregó sus remedios, guardados y embotellados hasta el último momento. Al despedirse, apretó tus manos: «Si la montaña no te quiere, vuelve. Y si te quiere, vuelve igual, que te seguiré necesitando».",
  },
  escolar: {
    nombre: "escolar sin plaza",
    texto: "Tres exámenes imperiales. Tres veces un apellido con padrinos ocupó tu lugar. Vendiste los clásicos para pagar la deuda, salvo un manual de respiración interior de un ermitaño excéntrico que ningún librero quiso. Lo releíste a oscuras tantas noches que algunas líneas dejaron de ser tinta y empezaron a tener sentido.",
  },
  callejero: {
    nombre: "callejero del mercado sur",
    texto: "En el mercado sur de Anling aprendiste a contar dinero ajeno antes que el tuyo. Dormías con un cuchillo bajo la mejilla. El incendio del gremio se llevó el callejón, así que rebuscaste entre las ruinas y saliste con lo que cupo en dos manos.",
  },
};
