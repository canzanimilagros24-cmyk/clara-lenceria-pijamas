const URL_STOCK_SHEET = "https://script.google.com/macros/s/AKfycbx2rRMIaBvYnLwCz6qhmaKgbvPKYkwT68GmN1lLChfkbN8uLS-WYOmixeDvTV7SsMyXaA/exec";

const PRODUCTOS_RESPALDO = [
  // ================= BIKINIS =================
  {
    id: 1,
    nombre: "Bikini Triángulo Negro",
    categoria: "bikinis",
    precio: 27000,
    descripcion: "Bikini triángulo con tiras regulables y bombacha con lazos laterales en talle 90.",
    imagen: "imgfoto6",
    talles: ["90"],
    colores: [
      { nombre: "Negro", hex: "#1f1f1f" }
    ],
    stockPorVariante: {
      "Negro|90": 5
    }
  },
  {
    id: 2,
    nombre: "Bikini Triángulo Bordó",
    categoria: "bikinis",
    precio: 27000,
    descripcion: "Bikini en tono bordó con detalle metálico al frente y tiras regulables en talle 90.",
    imagen: "imgfoto7",
    talles: ["90"],
    colores: [
      { nombre: "Bordó", hex: "#6e2330" }
    ],
    stockPorVariante: {
      "Bordó|90": 5
    }
  },
  {
    id: 3,
    nombre: "Bikini Triángulo Verde",
    categoria: "bikinis",
    precio: 27000,
    descripcion: "Bikini verde esmeralda de calce regulable con tiras en cuello y cadera en talle 90.",
    imagen: "imgfoto8",
    talles: ["90"],
    colores: [
      { nombre: "Verde", hex: "#1b6b52" }
    ],
    stockPorVariante: {
      "Verde|90": 5
    }
  },

  // ================= CONJUNTOS =================
  {
    id: 4,
    nombre: "Conjunto con Pollera",
    categoria: "conjuntos",
    precio: 32000,
    descripcion: "Corpiño triángulo de encaje, colaless y faldita liviana traslúcida en talle 90.",
    imagen: "imgfoto9",
    talles: ["90"],
    colores: [
      { nombre: "Negro", hex: "#222222" },
      { nombre: "Rojo", hex: "#c82838" }
    ],
    stockPorVariante: {
      "Negro|90": 5,
      "Rojo|90": 5
    }
  },
  {
    id: 5,
    nombre: "Conjunto Negro de Encaje",
    categoria: "conjuntos",
    precio: 33500,
    descripcion: "Conjunto negro de encaje bordado con breteles y tiras regulables en talle 100.",
    imagen: "imgfoto10",
    talles: ["100"],
    colores: [
      { nombre: "Negro", hex: "#1e1e1e" }
    ],
    stockPorVariante: {
      "Negro|100": 5
    }
  },
  {
    id: 6,
    nombre: "Conjunto Blanco Encaje",
    categoria: "conjuntos",
    precio: 30000,
    descripcion: "Corpiño con aro y colaless de encaje blanco delicado en talle 85.",
    imagen: "imgfoto11",
    talles: ["85"],
    colores: [
      { nombre: "Blanco", hex: "#f7f7f7" }
    ],
    stockPorVariante: {
      "Blanco|85": 5
    }
  },
  {
    id: 7,
    nombre: "Conjunto Rosa Encaje",
    categoria: "conjuntos",
    precio: 31000,
    descripcion: "Conjunto en tono rosa con encaje floral y breteles regulables en talle 95.",
    imagen: "imgfoto12",
    talles: ["95"],
    colores: [
      { nombre: "Rosa", hex: "#f04d8c" }
    ],
    stockPorVariante: {
      "Rosa|95": 5
    }
  },
  {
    id: 8,
    nombre: "Conjunto Verde Encaje",
    categoria: "conjuntos",
    precio: 31000,
    descripcion: "Conjunto verde de encaje con terminaciones delicadas y reguladores en talle 90.",
    imagen: "imgfoto13",
    talles: ["90"],
    colores: [
      { nombre: "Verde", hex: "#548c6e" }
    ],
    stockPorVariante: {
      "Verde|90": 5
    }
  },
  {
    id: 9,
    nombre: "conjunto Blanco Transparente",
    categoria: "conjuntos",
    precio: 20000,
    descripcion:"Conjunto blanco transaparente con detalles de encaje y tiras ajustables en talle 95",
    imagen: "imgfoto14",
    talles: ["95"],
    colores: [
      { nombre: "Blanco", hex: "#f7f7f7"}
    ],
    stockPorVariante: {
      "Blanco|95": 2
    }
  },
  {
    id: 10,
    nombre: "Conjunto Rojo Transparente",
    categoria: "conjuntos",
    precio: 20000,
    descripcion: "Conjunto rojo transaparente con detalles de encaje y tiras ajustables en talle 100",
    imagen: "imgfoto15",
    talles: ["100"],
    colores: [
      { nombre: "Rojo", hex: "#c82838"}
    ],
    stockPorVariante: {
      "Rojo|100": 2
    }
  },
  {
    id: 11,
    nombre: "Pijama de Tela suave Negro",
    categoria: "pijamas",
    precio: 17000,
    descripcion: "Pijama de tela suave en color negro en talle 90 y 100",
    imagen: "imgfoto16",
    talles: ["90", "100"],
    colores: [
      { nombre: "Negro", hex: "#000000" }
    ],
    stockPorVariante: {
      "Negro|90": 2,
      "Negro|100": 2
    }
  },
  {
    id: 12,
    nombre: "Pijama de Tela suave Blanco",
    categoria: "pijamas",
    precio: 17000,
    descripcion: "Pijama de tela suave en color blanco en talle 90 y 100",
    imagen: "imgfoto17",
    talles: ["90", "100"],
    colores: [
      { nombre: "Blanco", hex: "#f7f7f7" }
    ],
    stockPorVariante: {
      "Blanco|90": 2,
      "Blanco|100": 2
    }
  },
  {
    id: 13, 
    nombre: "Pijama de Tela suave Rosa",
    categoria: "pijamas",
    precio: 17000,
    descripcion: "Pijama de tela suave en color rosa en talle 90 y 100",
    imagen: "imgfoto18",
    talles: ["90", "100"],
    colores: [
      { nombre: "Rosa", hex: "#f04d8c" }
    ],
    stockPorVariante: {
      "Rosa|90": 2,
      "Rosa|100": 2
    } 
  },
  {
    id: 14,
    nombre: "Pijama de Tela suave Amarillo Claro",
    categoria: "pijamas",
    precio: 17000,
    descripcion: "Pijama de tela suave en color amarillo claro en talle 90 y 100",
    imagen: "imgfoto19",
    talles: ["90", "100"],
    colores: [
      { nombre: "Amarillo Claro", hex: "#ffdb63" }
    ],
    stockPorVariante: {
      "Amarillo Claro|90": 2,
      "Amarillo Claro|100": 2
    }
  },
  {
    id: 15,
    nombre: "Conjunto de Encaje Azul Marino",
    categoria: "conjuntos",
    precio: 32000,
    descripcion: "Conjunto de encaje azul marino con detalles delicados y tiras ajustables en talle 105",
    imagen: "imgfoto20",
    talles: ["105"],
    colores: [
      { nombre: "Azul Marino", hex: "#003366" }
    ],
    stockPorVariante: {
      "Azul Marino|105": 2
    }   
  },
  {
    id: 16,
    nombre: "Conjunto de Encaje Verde Militar",
    categoria: "conjuntos",
    precio: 32000,
    descripcion: "Conjunto de encaje verde militar con detalles delicados y tiras ajustables en talle 110",
    imagen: "imgfoto21",
    talles: ["110"],
    colores: [
      { nombre: "Verde Militar", hex: "#228B22" }
    ],
    stockPorVariante: {
      "Verde Militar|110": 2
    }
  }
];

let PRODUCTOS = [...PRODUCTOS_RESPALDO];

function agruparFilasDeSheet(filas) {
  if (!Array.isArray(filas) || filas.length === 0) {
    return [...PRODUCTOS_RESPALDO];
  }

  const mapa = new Map();

  filas.forEach((fila) => {
    const id = Number(fila.id);
    const nombre = String(fila.nombre || "").trim();
    if (!id || !nombre) return;

    const categoria = String(fila.categoria || "conjuntos").trim().toLowerCase();
    const precio = Number(fila.precio) || 0;
    const colorNombre = String(fila.color || "Único").trim();
    const colorHex = String(fila.colorHex || "#C49994").trim();
    const talle = String(fila.talle || "Único").trim();
    const stock = Math.max(0, Number(fila.stock) || 0);
    const imagen = String(fila.imagen || "").trim();

    if (!mapa.has(id)) {
      const respaldo = PRODUCTOS_RESPALDO.find((p) => p.id === id);
      mapa.set(id, {
        id,
        nombre,
        categoria,
        precio,
        descripcion:
          respaldo?.descripcion ||
          `${nombre} en talle ${talle}, color ${colorNombre}.`,
        imagen: imagen || respaldo?.imagen || "",
        talles: [],
        colores: [],
        stockPorVariante: {}
      });
    }

    const prod = mapa.get(id);
    if (precio > 0) prod.precio = precio;
    if (imagen) prod.imagen = imagen;

    if (!prod.talles.includes(talle)) {
      prod.talles.push(talle);
    }

    const existeColor = prod.colores.some(
      (c) => c.nombre.toLowerCase() === colorNombre.toLowerCase()
    );
    if (!existeColor) {
      prod.colores.push({ nombre: colorNombre, hex: colorHex });
    }

    const clave = `${colorNombre}|${talle}`;
    prod.stockPorVariante[clave] = (prod.stockPorVariante[clave] || 0) + stock;
  });

  const listaFinal = Array.from(mapa.values());
  return listaFinal.length > 0 ? listaFinal : [...PRODUCTOS_RESPALDO];
}

async function cargarProductosDesdeSheet() {
  if (!URL_STOCK_SHEET || URL_STOCK_SHEET.includes("PEGA_AQUI")) {
    PRODUCTOS = [...PRODUCTOS_RESPALDO];
    return PRODUCTOS;
  }

  try {
    const respuesta = await fetch(URL_STOCK_SHEET, { cache: "no-store" });
    if (!respuesta.ok) throw new Error("Error al consultar la planilla");
    const datos = await respuesta.json();
    PRODUCTOS = agruparFilasDeSheet(datos);
  } catch (error) {
    console.warn("No se pudo leer Google Sheets, usando respaldo local:", error);
    PRODUCTOS = [...PRODUCTOS_RESPALDO];
  }

  return PRODUCTOS;
}