const TELEFONO_WHATSAPP = "5493515215124";
const CLAVE_CARRITO = "clara_lenceria_carrito";
const CLAVE_FAVORITOS = "clara_lenceria_favoritos";
const CLAVE_RESENAS = "clara_lenceria_resenas";
const CLAVE_RESENAS_GENERALES = "clara_lenceria_resenas_generales";

let carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
let favoritos = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS)) || [];
let resenasPorProducto = JSON.parse(localStorage.getItem(CLAVE_RESENAS)) || {
  1: [{ autor: "Valeria", estrellas: 5, comentario: "Muy lindo calce y las tiras regulables son súper prácticas." }],
  4: [{ autor: "Camila", estrellas: 5, comentario: "La pollera queda divina y el encaje es suave." }]
};
let resenasGenerales = JSON.parse(localStorage.getItem(CLAVE_RESENAS_GENERALES)) || [];

let categoriaActual = "todos";
let talleActual = "todos";
let ordenActual = "destacados";
let textoBusqueda = "";
let productoModalActual = null;
let colorModalSeleccionado = null;
let estrellasSeleccionadas = 5;
let estrellasGeneralesSeleccionadas = 5;

const IMAGEN_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="450" viewBox="0 0 400 450">
      <rect width="400" height="450" fill="#EDDCCE"/>
      <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="#5c463e" font-family="sans-serif" font-size="18" font-weight="600">Clara Lencería &amp; Pijamas</text>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#8c736b" font-family="sans-serif" font-size="14">Foto próximamente</text>
    </svg>
  `);

function resolverRutaImagen(imagen) {
  if (!imagen) return IMAGEN_PLACEHOLDER;
  if (imagen.startsWith("img/") || imagen.startsWith("http") || imagen.startsWith("data:")) {
    return imagen;
  }
  return `img/${imagen}.jpeg`;
}

function obtenerStockVariante(producto, color, talle) {
  if (!producto) return 0;
  const mapa = producto.stockPorVariante || {};
  const claveExacta = `${color}|${talle}`;
  if (Object.prototype.hasOwnProperty.call(mapa, claveExacta)) {
    return Math.max(0, Number(mapa[claveExacta]) || 0);
  }
  const valores = Object.values(mapa);
  if (valores.length > 0) {
    return valores.reduce((acc, n) => acc + (Number(n) || 0), 0);
  }
  return 0;
}

function formatearTextoStock(stock) {
  if (stock <= 0) return { texto: "Sin stock", agotado: true };
  if (stock === 1) return { texto: "¡Última unidad disponible!", agotado: false };
  return { texto: `Quedan ${stock} disponibles`, agotado: false };
}

function crearUrlWhatsApp(mensaje) {
  const numeroLimpio = TELEFONO_WHATSAPP.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${numeroLimpio}&text=${encodeURIComponent(mensaje)}`;
}

function formatearPrecio(monto) {
  return `$${Number(monto).toLocaleString("es-AR")}`;
}

function guardarEstado() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
  localStorage.setItem(CLAVE_RESENAS, JSON.stringify(resenasPorProducto));
  localStorage.setItem(CLAVE_RESENAS_GENERALES, JSON.stringify(resenasGenerales));
}

function aplicarResenasRemotas() {
  if (typeof RESENAS_REMOTAS === "undefined" || !Array.isArray(RESENAS_REMOTAS) || RESENAS_REMOTAS.length === 0) return;

  const generalesDesdeSheet = [];
  const porProductoDesdeSheet = {};

  RESENAS_REMOTAS.slice().reverse().forEach((r) => {
    const item = {
      autor: String(r.autor || "Clienta"),
      estrellas: Number(r.estrellas) || 5,
      comentario: String(r.comentario || "")
    };
    if (!item.comentario) return;

    if (r.tipo === "producto" && r.productoId) {
      const id = Number(r.productoId);
      if (!porProductoDesdeSheet[id]) porProductoDesdeSheet[id] = [];
      porProductoDesdeSheet[id].push(item);
    } else {
      generalesDesdeSheet.push({
        ...item,
        productoNombre: r.productoNombre || "Opinión sobre la tienda"
      });
    }
  });

  resenasGenerales = generalesDesdeSheet;
  resenasPorProducto = porProductoDesdeSheet;
}

async function enviarResenaASheet(payload) {
  if (typeof URL_STOCK_SHEET === "undefined" || !URL_STOCK_SHEET) return;
  try {
    await fetch(URL_STOCK_SHEET, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn("No se pudo guardar la reseña en Google Sheets:", error);
  }
}

function obtenerPromedioRating(productoId) {
  const lista = resenasPorProducto[productoId] || [];
  if (lista.length === 0) return { promedio: 0, cantidad: 0 };
  const suma = lista.reduce((acc, r) => acc + Number(r.estrellas || 0), 0);
  return {
    promedio: Number((suma / lista.length).toFixed(1)),
    cantidad: lista.length
  };
}

function renderEstrellasTexto(promedio) {
  const llenas = Math.round(promedio);
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="estrella-icono ${i <= llenas ? "activa" : ""}">&#9733;</span>`;
  }
  return html;
}

function toggleFavorito(productoId) {
  const idx = favoritos.indexOf(productoId);
  if (idx >= 0) {
    favoritos.splice(idx, 1);
  } else {
    favoritos.push(productoId);
  }
  guardarEstado();
  actualizarContadorFavoritos();
  renderizarProductos();
}

function actualizarContadorFavoritos() {
  const el = document.getElementById("contador-favoritos");
  if (el) el.textContent = favoritos.length;
}

function obtenerProductosFiltrados() {
  const busqueda = textoBusqueda.trim().toLowerCase();

  const filtrados = PRODUCTOS.filter((prod) => {
    const coincideCategoria =
      categoriaActual === "todos" ||
      (categoriaActual === "favoritos"
        ? favoritos.includes(prod.id)
        : prod.categoria === categoriaActual);

    const coincideTalle =
      talleActual === "todos" || (prod.talles || []).includes(talleActual);

    const coincideTexto =
      !busqueda ||
      prod.nombre.toLowerCase().includes(busqueda) ||
      prod.descripcion.toLowerCase().includes(busqueda) ||
      prod.categoria.toLowerCase().includes(busqueda) ||
      (prod.talles || []).some((t) => t.toLowerCase().includes(busqueda)) ||
      (prod.colores || []).some((c) => c.nombre.toLowerCase().includes(busqueda));

    return coincideCategoria && coincideTalle && coincideTexto;
  });

  if (ordenActual === "menor-precio") {
    return [...filtrados].sort((a, b) => a.precio - b.precio);
  }
  if (ordenActual === "mayor-precio") {
    return [...filtrados].sort((a, b) => b.precio - a.precio);
  }
  if (ordenActual === "mejor-calificados") {
    return [...filtrados].sort(
      (a, b) => obtenerPromedioRating(b.id).promedio - obtenerPromedioRating(a.id).promedio
    );
  }
  return filtrados;
}

function poblarSelectProductosResenas() {
  const selectProdGeneral = document.getElementById("resena-general-producto");
  if (!selectProdGeneral || typeof PRODUCTOS === "undefined") return;

  selectProdGeneral.innerHTML = `<option value="general">Opinión general sobre la tienda</option>`;
  PRODUCTOS.forEach((prod) => {
    const opt = document.createElement("option");
    opt.value = prod.id;
    opt.textContent = `Prenda: ${prod.nombre}`;
    selectProdGeneral.appendChild(opt);
  });
}

function renderizarProductos() {
  const grid = document.getElementById("grid-productos");
  if (!grid) return;

  const lista = obtenerProductosFiltrados();
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 30px;">No encontramos prendas con ese filtro o búsqueda.</p>`;
    return;
  }

  lista.forEach((producto) => {
    const card = document.createElement("article");
    card.className = "card-producto";

    const colorInicial =
      producto.colores && producto.colores[0] ? producto.colores[0].nombre : "Único";
    const talleInicial =
      producto.talles && producto.talles[0] ? producto.talles[0] : "Único";
    const rutaImg = resolverRutaImagen(producto.imagen);
    const esFavorito = favoritos.includes(producto.id);
    const { promedio, cantidad } = obtenerPromedioRating(producto.id);

    const botonesColorHTML = (producto.colores || [])
      .map(
        (color, idx) => `
        <button
          type="button"
          class="color-btn ${idx === 0 ? "seleccionado" : ""}"
          style="background-color: ${color.hex};"
          title="${color.nombre}"
          data-color-nombre="${color.nombre}"
        ></button>
      `
      )
      .join("");

    const opcionesTalleHTML = (producto.talles || ["Único"])
      .map((talle) => `<option value="${talle}">Talle ${talle}</option>`)
      .join("");

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${rutaImg}" alt="${producto.nombre}" class="img-producto" />
        <button
          type="button"
          class="btn-fav ${esFavorito ? "activo" : ""}"
          title="${esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}"
          aria-label="Guardar en favoritos"
        >&#9829;</button>
      </div>
      <div class="card-info">
        <span class="card-categoria">${producto.categoria}</span>
        <h3 class="card-titulo">${producto.nombre}</h3>
        <div class="card-rating">
          ${renderEstrellasTexto(promedio)}
          <span>${cantidad > 0 ? `${promedio} (${cantidad})` : "Sin calificar"}</span>
        </div>
        <p class="card-precio">${formatearPrecio(producto.precio)}</p>

        <div class="colores-row">
          <span class="color-label">Color: <strong class="texto-color-actual">${colorInicial}</strong></span>
          <div style="display: flex; gap: 6px;">${botonesColorHTML}</div>
        </div>

        <select class="select-talle">
          ${opcionesTalleHTML}
        </select>

        <p class="texto-stock-card" style="font-size: 0.84rem; font-weight: 600; margin-bottom: 10px;"></p>

        <button type="button" class="btn-agregar">Agregar al carrito</button>
      </div>
    `;

    let colorSeleccionado = colorInicial;
    const labelColor = card.querySelector(".texto-color-actual");
    const botonesColor = card.querySelectorAll(".color-btn");
    const selectTalle = card.querySelector(".select-talle");
    const textoStockEl = card.querySelector(".texto-stock-card");
    const btnAgregar = card.querySelector(".btn-agregar");

    function actualizarEstadoStockCard() {
      const talleActualCard = selectTalle ? selectTalle.value : talleInicial;
      const stockDisp = obtenerStockVariante(producto, colorSeleccionado, talleActualCard);
      const { texto, agotado } = formatearTextoStock(stockDisp);

      if (textoStockEl) {
        textoStockEl.textContent = texto;
        textoStockEl.style.color = agotado ? "#b83b5e" : "#5c463e";
      }

      if (btnAgregar) {
        btnAgregar.disabled = agotado;
        btnAgregar.textContent = agotado ? "Sin stock" : "Agregar al carrito";
        btnAgregar.style.opacity = agotado ? "0.55" : "1";
        btnAgregar.style.cursor = agotado ? "not-allowed" : "pointer";
      }
    }

    botonesColor.forEach((btn) => {
      btn.addEventListener("click", () => {
        botonesColor.forEach((b) => b.classList.remove("seleccionado"));
        btn.classList.add("seleccionado");
        colorSeleccionado = btn.dataset.colorNombre;
        if (labelColor) labelColor.textContent = colorSeleccionado;
        actualizarEstadoStockCard();
      });
    });

    selectTalle?.addEventListener("change", actualizarEstadoStockCard);

    card.querySelector(".btn-fav").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorito(producto.id);
    });

    const imgEl = card.querySelector(".img-producto");
    imgEl.onerror = () => {
      imgEl.onerror = null;
      imgEl.src = IMAGEN_PLACEHOLDER;
    };
    imgEl.addEventListener("click", () => {
      const talleElegido = selectTalle ? selectTalle.value : talleInicial;
      abrirModalProducto(producto, colorSeleccionado, talleElegido);
    });

    btnAgregar.addEventListener("click", () => {
      const talleElegido = selectTalle ? selectTalle.value : talleInicial;
      agregarAlCarrito(producto, talleElegido, colorSeleccionado);
    });

    actualizarEstadoStockCard();
    grid.appendChild(card);
  });
}

function agregarAlCarrito(producto, talle, color) {
  const stockDisponible = obtenerStockVariante(producto, color, talle);
  if (stockDisponible <= 0) {
    alert("Esta combinación de color y talle no tiene stock disponible en este momento.");
    return;
  }

  const existente = carrito.find(
    (item) =>
      item.id === producto.id &&
      item.talle === talle &&
      item.color === color
  );

  const cantidadEnCarrito = existente ? existente.cantidad : 0;
  if (cantidadEnCarrito + 1 > stockDisponible) {
    alert(`Solo quedan ${stockDisponible} ${stockDisponible === 1 ? "unidad disponible" : "unidades disponibles"} de este modelo en ese color y talle.`);
    return;
  }

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      talle,
      color,
      cantidad: 1
    });
  }

  guardarEstado();
  actualizarCarrito();
  abrirCarrito();
}

function cambiarCantidad(index, delta) {
  const item = carrito[index];
  if (!item) return;

  if (delta > 0) {
    const prod = PRODUCTOS.find((p) => p.id === item.id);
    const stockMax = prod ? obtenerStockVariante(prod, item.color, item.talle) : item.cantidad + delta;
    if (item.cantidad + delta > stockMax) {
      alert(`No hay más unidades disponibles (${stockMax} en stock).`);
      return;
    }
  }

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito.splice(index, 1);
  }
  guardarEstado();
  actualizarCarrito();
}

function actualizarCarrito() {
  const contador = document.getElementById("contador-carrito");
  const listaEl = document.getElementById("lista-carrito");
  const totalEl = document.getElementById("precio-total");

  const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalMonto = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  if (contador) contador.textContent = totalUnidades;
  if (totalEl) totalEl.textContent = formatearPrecio(totalMonto);

  if (!listaEl) return;

  if (carrito.length === 0) {
    listaEl.innerHTML = `<p style="text-align: center; padding: 24px 0;">Tu carrito está vacío.</p>`;
    return;
  }

  listaEl.innerHTML = "";
  carrito.forEach((item, idx) => {
    const fila = document.createElement("div");
    fila.className = "item-carrito";
    fila.innerHTML = `
      <div>
        <strong>${item.nombre}</strong>
        <div style="font-size: 0.82rem;">Talle ${item.talle} · ${item.color}</div>
        <div style="font-size: 0.88rem; margin-top: 2px;">${formatearPrecio(item.precio * item.cantidad)}</div>
      </div>
      <div class="item-controles">
        <button type="button" class="btn-cant btn-menos">-</button>
        <span>${item.cantidad}</span>
        <button type="button" class="btn-cant btn-mas">+</button>
      </div>
    `;

    fila.querySelector(".btn-menos").addEventListener("click", () => cambiarCantidad(idx, -1));
    fila.querySelector(".btn-mas").addEventListener("click", () => cambiarCantidad(idx, 1));
    listaEl.appendChild(fila);
  });
}

function abrirCarrito() {
  document.getElementById("drawer-carrito")?.classList.add("abierto");
  document.getElementById("overlay-carrito")?.classList.add("activo");
}

function cerrarCarrito() {
  document.getElementById("drawer-carrito")?.classList.remove("abierto");
  document.getElementById("overlay-carrito")?.classList.remove("activo");
}

function actualizarSelectorEstrellas(valor) {
  estrellasSeleccionadas = valor;
  document.querySelectorAll("#selector-estrellas .estrella-btn").forEach((btn) => {
    const v = Number(btn.dataset.valor);
    btn.classList.toggle("activa", v <= valor);
  });
}

function renderizarResenasModal(productoId) {
  const resumenEl = document.getElementById("modal-rating-resumen");
  const listaEl = document.getElementById("modal-lista-resenas");
  const { promedio, cantidad } = obtenerPromedioRating(productoId);
  const resenas = resenasPorProducto[productoId] || [];

  if (resumenEl) {
    resumenEl.innerHTML = `${renderEstrellasTexto(promedio)} <strong>${promedio || "—"}</strong> (${cantidad} ${cantidad === 1 ? "opinión" : "opiniones"})`;
  }

  if (listaEl) {
    if (resenas.length === 0) {
      listaEl.innerHTML = `<p class="color-label">Todavía no hay comentarios en esta prenda.</p>`;
    } else {
      listaEl.innerHTML = resenas
        .map(
          (r) => `
          <div class="resena-item">
            <div class="resena-top">
              <strong>${r.autor || "Clienta"}</strong>
              <span>${renderEstrellasTexto(r.estrellas)}</span>
            </div>
            <p>${r.comentario}</p>
          </div>
        `
        )
        .join("");
    }
  }
}

function renderizarResenasGenerales() {
  const cont = document.getElementById("lista-resenas-generales");
  if (!cont) return;

  const todas = [
    ...resenasGenerales.map((r) => ({
      ...r,
      etiqueta: r.productoNombre || "Opinión sobre la tienda"
    }))
  ];

  PRODUCTOS.forEach((prod) => {
    (resenasPorProducto[prod.id] || []).forEach((r) => {
      todas.push({
        ...r,
        etiqueta: prod.nombre
      });
    });
  });

  if (todas.length === 0) {
    cont.innerHTML = `<p style="text-align:center; grid-column: 1 / -1;">Sé la primera en dejar tu comentario.</p>`;
    return;
  }

  cont.innerHTML = todas
    .map(
      (r) => `
      <article class="resena-card">
        <div class="resena-top">
          <strong>${r.autor || "Clienta"}</strong>
          <span>${renderEstrellasTexto(r.estrellas)}</span>
        </div>
        <span class="resena-prenda">${r.etiqueta}</span>
        <p>"${r.comentario}"</p>
      </article>
    `
    )
    .join("");
}

function abrirModalProducto(producto, colorInicial, talleInicial) {
  productoModalActual = producto;
  colorModalSeleccionado =
    colorInicial || (producto.colores && producto.colores[0] ? producto.colores[0].nombre : "Único");

  const modal = document.getElementById("modal-producto");
  if (!modal) return;

  const modalImg = document.getElementById("modal-img");
  modalImg.onerror = () => {
    modalImg.onerror = null;
    modalImg.src = IMAGEN_PLACEHOLDER;
  };
  modalImg.src = resolverRutaImagen(producto.imagen);

  document.getElementById("modal-categoria").textContent = producto.categoria;
  document.getElementById("modal-titulo").textContent = producto.nombre;
  document.getElementById("modal-precio").textContent = formatearPrecio(producto.precio);
  document.getElementById("modal-descripcion").textContent = producto.descripcion;
  document.getElementById("modal-color-nombre").textContent = colorModalSeleccionado;

  const coloresContainer = document.getElementById("modal-colores-container");
  coloresContainer.innerHTML = "";

  const selectTalle = document.getElementById("modal-talle");
  selectTalle.innerHTML = (producto.talles || ["Único"])
    .map((talle) => `<option value="${talle}">Talle ${talle}</option>`)
    .join("");

  if (talleInicial && (producto.talles || []).includes(talleInicial)) {
    selectTalle.value = talleInicial;
  }

  let stockLabelModal = document.getElementById("modal-stock-disponible");
  const btnAgregarModal = document.getElementById("modal-btn-agregar");
  if (!stockLabelModal && btnAgregarModal) {
    stockLabelModal = document.createElement("p");
    stockLabelModal.id = "modal-stock-disponible";
    stockLabelModal.style.fontSize = "0.9rem";
    stockLabelModal.style.fontWeight = "600";
    btnAgregarModal.parentNode.insertBefore(stockLabelModal, btnAgregarModal);
  }

  function actualizarStockModal() {
    const talleActualModal = selectTalle.value || "Único";
    const disp = obtenerStockVariante(producto, colorModalSeleccionado, talleActualModal);
    const { texto, agotado } = formatearTextoStock(disp);

    if (stockLabelModal) {
      stockLabelModal.textContent = texto;
      stockLabelModal.style.color = agotado ? "#b83b5e" : "#5c463e";
    }
    if (btnAgregarModal) {
      btnAgregarModal.disabled = agotado;
      btnAgregarModal.textContent = agotado ? "Sin stock" : "Agregar al carrito";
      btnAgregarModal.style.opacity = agotado ? "0.55" : "1";
      btnAgregarModal.style.cursor = agotado ? "not-allowed" : "pointer";
    }
  }

  (producto.colores || []).forEach((color) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `color-btn ${color.nombre === colorModalSeleccionado ? "seleccionado" : ""}`;
    btn.style.backgroundColor = color.hex;
    btn.title = color.nombre;
    btn.addEventListener("click", () => {
      coloresContainer.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("seleccionado"));
      btn.classList.add("seleccionado");
      colorModalSeleccionado = color.nombre;
      document.getElementById("modal-color-nombre").textContent = colorModalSeleccionado;
      actualizarStockModal();
    });
    coloresContainer.appendChild(btn);
  });

  selectTalle.onchange = actualizarStockModal;
  actualizarStockModal();

  actualizarSelectorEstrellas(5);
  renderizarResenasModal(producto.id);
  modal.scrollTop = 0;
  modal.classList.add("activo");
}

function cerrarModalProducto() {
  document.getElementById("modal-producto")?.classList.remove("activo");
  productoModalActual = null;
}

function calcularTalleSugerido() {
  const busto = Number(document.getElementById("calc-busto")?.value);
  const cadera = Number(document.getElementById("calc-cadera")?.value);
  const resEl = document.getElementById("resultado-talle");
  if (!resEl) return;

  if (!busto && !cadera) {
    resEl.textContent = "Ingresá tu medida de busto o cadera para orientarte.";
    return;
  }

  let talle = "85 / S";
  const ref = Math.max(busto || 0, (cadera || 0) - 5);
  if (ref >= 104) talle = "105 / XXL";
  else if (ref >= 98) talle = "100 / XL";
  else if (ref >= 93) talle = "95 / L";
  else if (ref >= 88) talle = "90 / M";

  resEl.textContent = `Talle orientativo según tabla: ${talle}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  renderizarProductos();
  actualizarCarrito();
  actualizarContadorFavoritos();
  renderizarResenasGenerales();
  poblarSelectProductosResenas();

  await cargarProductosDesdeSheet();
  aplicarResenasRemotas();
  renderizarProductos();
  renderizarResenasGenerales();
  poblarSelectProductosResenas();

  const btnWspFlotante = document.getElementById("btn-wsp-flotante");
  if (btnWspFlotante) {
    btnWspFlotante.href = crearUrlWhatsApp(
      "Hola Clara Lencería & Pijamas! Tengo una consulta sobre las prendas."
    );
  }

  document.querySelectorAll("#contenedor-filtros .filtro-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#contenedor-filtros .filtro-btn").forEach((b) =>
        b.classList.remove("activo")
      );
      btn.classList.add("activo");
      categoriaActual = btn.dataset.categoria || "todos";
      renderizarProductos();
    });
  });

  document.getElementById("filtro-talle")?.addEventListener("change", (e) => {
    talleActual = e.target.value;
    renderizarProductos();
  });

  document.getElementById("ordenar-productos")?.addEventListener("change", (e) => {
    ordenActual = e.target.value;
    renderizarProductos();
  });

  const buscador = document.getElementById("buscador");
  if (buscador) {
    buscador.addEventListener("input", (e) => {
      textoBusqueda = e.target.value || "";
      renderizarProductos();
    });
  }

  document.getElementById("btn-favoritos")?.addEventListener("click", () => {
    document.querySelectorAll("#contenedor-filtros .filtro-btn").forEach((b) => {
      b.classList.toggle("activo", b.dataset.categoria === "favoritos");
    });
    categoriaActual = "favoritos";
    renderizarProductos();
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("btn-calcular-talle")?.addEventListener("click", calcularTalleSugerido);

  document.querySelectorAll("#selector-estrellas-general .estrella-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      estrellasGeneralesSeleccionadas = Number(btn.dataset.valor);
      document.querySelectorAll("#selector-estrellas-general .estrella-btn").forEach((b) => {
        b.classList.toggle("activa", Number(b.dataset.valor) <= estrellasGeneralesSeleccionadas);
      });
    });
  });

  document.getElementById("form-resena-general")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const prodSeleccionado = document.getElementById("resena-general-producto")?.value || "general";
    const autor = document.getElementById("resena-general-autor")?.value.trim() || "Clienta";
    const comentario = document.getElementById("resena-general-texto")?.value.trim();

    if (!comentario) {
      alert("Escribí un comentario antes de publicarlo.");
      return;
    }

    const nuevaResena = {
      autor,
      estrellas: estrellasGeneralesSeleccionadas,
      comentario
    };

    if (prodSeleccionado === "general") {
      resenasGenerales.unshift({
        ...nuevaResena,
        productoNombre: "Opinión sobre la tienda"
      });
      enviarResenaASheet({
        tipo: "general",
        productoId: "",
        productoNombre: "Opinión sobre la tienda",
        ...nuevaResena
      });
    } else {
      const idProd = Number(prodSeleccionado);
      const prodObj = PRODUCTOS.find((p) => p.id === idProd);
      if (!resenasPorProducto[idProd]) resenasPorProducto[idProd] = [];
      resenasPorProducto[idProd].unshift(nuevaResena);
      renderizarProductos();
      enviarResenaASheet({
        tipo: "producto",
        productoId: idProd,
        productoNombre: prodObj ? prodObj.nombre : "",
        ...nuevaResena
      });
    }

    guardarEstado();
    document.getElementById("resena-general-texto").value = "";
    renderizarResenasGenerales();
  });

  document.querySelectorAll("#selector-estrellas .estrella-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      actualizarSelectorEstrellas(Number(btn.dataset.valor));
    });
  });

  document.getElementById("form-resena")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!productoModalActual) return;

    const autor = document.getElementById("resena-autor")?.value.trim() || "Clienta";
    const comentario = document.getElementById("resena-texto")?.value.trim();

    if (!comentario) {
      alert("Escribí un breve comentario para publicar tu calificación.");
      return;
    }

    if (!resenasPorProducto[productoModalActual.id]) {
      resenasPorProducto[productoModalActual.id] = [];
    }

    resenasPorProducto[productoModalActual.id].unshift({
      autor,
      estrellas: estrellasSeleccionadas,
      comentario
    });

    enviarResenaASheet({
      tipo: "producto",
      productoId: productoModalActual.id,
      productoNombre: productoModalActual.nombre,
      autor,
      estrellas: estrellasSeleccionadas,
      comentario
    });

    guardarEstado();
    document.getElementById("resena-texto").value = "";
    renderizarResenasModal(productoModalActual.id);
    renderizarResenasGenerales();
    renderizarProductos();
  });

  document.getElementById("btn-abrir-carrito")?.addEventListener("click", abrirCarrito);
  document.getElementById("btn-cerrar-carrito")?.addEventListener("click", cerrarCarrito);
  document.getElementById("overlay-carrito")?.addEventListener("click", cerrarCarrito);

  document.getElementById("btn-cerrar-modal")?.addEventListener("click", cerrarModalProducto);
  document.getElementById("modal-producto")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-producto") cerrarModalProducto();
  });

  document.getElementById("modal-btn-agregar")?.addEventListener("click", () => {
    if (!productoModalActual) return;
    const talle = document.getElementById("modal-talle")?.value || "Único";
    agregarAlCarrito(productoModalActual, talle, colorModalSeleccionado || "Único");
    cerrarModalProducto();
  });

  document.getElementById("btn-whatsapp")?.addEventListener("click", () => {
    if (carrito.length === 0) {
      alert("Agregá al menos una prenda al carrito antes de enviar el pedido ✨");
      return;
    }

    const envio = document.getElementById("medio-envio")?.value || "Uber Moto (Córdoba Capital)";
    const pago = document.getElementById("medio-pago")?.value || "A coordinar";

    let mensaje = "✨🌸 ¡Hola *Clara Lencería & Pijamas*! 🌸✨\n";
    mensaje += "Estuve chusmeando el catálogo y me enamoré de estas prendas 😍🛍️:\n\n";

    let total = 0;
    let totalPrendas = 0;

    carrito.forEach((item, index) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      totalPrendas += item.cantidad;
      mensaje += `${index + 1}. *${item.nombre}*\n`;
      mensaje += `   📏 *Talle:* ${item.talle}  |  🎨 *Color:* ${item.color}\n`;
      mensaje += `   🔢 *Cantidad:* ${item.cantidad}  |  💵 *Subtotal:* ${formatearPrecio(subtotal)}\n\n`;
    });

    mensaje += "──────────────────────\n";
    mensaje += `👗 *Total de prendas:* ${totalPrendas}\n`;
    mensaje += `🛵 *Entrega:* ${envio}\n`;
    mensaje += `💳 *Medio de pago:* ${pago}\n`;
    mensaje += `💰 *TOTAL A PAGAR: ${formatearPrecio(total)}*\n`;
    mensaje += "──────────────────────\n\n";
    mensaje += "¿Me confirman si hay stock y coordinamos el Uber Moto? ¡Muchas gracias! 🥰💖";

    window.open(crearUrlWhatsApp(mensaje), "_blank", "noopener,noreferrer");
  });
});