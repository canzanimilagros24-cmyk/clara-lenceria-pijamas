const TELEFONO_WHATSAPP = "5493515215124";
const CLAVE_STORAGE = "clara_lenceria_carrito";

let carrito = JSON.parse(localStorage.getItem(CLAVE_STORAGE)) || [];
let categoriaActual = "todos";
let textoBusqueda = "";
let productoModalActual = null;
let colorModalSeleccionado = null;

// Imagen SVG de respaldo por si todavía no cargaste la foto en la carpeta img/
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

function crearUrlWhatsApp(mensaje) {
  const numeroLimpio = TELEFONO_WHATSAPP.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${numeroLimpio}&text=${encodeURIComponent(mensaje)}`;
}

function formatearPrecio(monto) {
  return `$${Number(monto).toLocaleString("es-AR")}`;
}

function guardarCarrito() {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(carrito));
}

function obtenerProductosFiltrados() {
  return PRODUCTOS.filter((prod) => {
    const coincideCategoria =
      categoriaActual === "todos" || prod.categoria === categoriaActual;

    const busqueda = textoBusqueda.trim().toLowerCase();
    const coincideTexto =
      !busqueda ||
      prod.nombre.toLowerCase().includes(busqueda) ||
      prod.descripcion.toLowerCase().includes(busqueda) ||
      prod.categoria.toLowerCase().includes(busqueda);

    return coincideCategoria && coincideTexto;
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
    const rutaImg = resolverRutaImagen(producto.imagen);

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

    const opcionesTalleHTML = (producto.talles || [])
      .map((talle) => `<option value="${talle}">Talle ${talle}</option>`)
      .join("");

    card.innerHTML = `
      <img src="${rutaImg}" alt="${producto.nombre}" class="img-producto" />
      <div class="card-info">
        <span class="card-categoria">${producto.categoria}</span>
        <h3 class="card-titulo">${producto.nombre}</h3>
        <p class="card-precio">${formatearPrecio(producto.precio)}</p>

        <div class="colores-row">
          <span class="color-label">Color: <strong class="texto-color-actual">${colorInicial}</strong></span>
          <div style="display: flex; gap: 6px;">${botonesColorHTML}</div>
        </div>

        <select class="select-talle">
          ${opcionesTalleHTML}
        </select>

        <button type="button" class="btn-agregar">Agregar al carrito</button>
      </div>
    `;

    let colorSeleccionado = colorInicial;
    const labelColor = card.querySelector(".texto-color-actual");
    const botonesColor = card.querySelectorAll(".color-btn");

    botonesColor.forEach((btn) => {
      btn.addEventListener("click", () => {
        botonesColor.forEach((b) => b.classList.remove("seleccionado"));
        btn.classList.add("seleccionado");
        colorSeleccionado = btn.dataset.colorNombre;
        if (labelColor) labelColor.textContent = colorSeleccionado;
      });
    });

    const imgEl = card.querySelector(".img-producto");
    imgEl.onerror = () => {
      imgEl.onerror = null;
      imgEl.src = IMAGEN_PLACEHOLDER;
    };
    imgEl.addEventListener("click", () => {
      abrirModalProducto(producto, colorSeleccionado);
    });

    const selectTalle = card.querySelector(".select-talle");
    const btnAgregar = card.querySelector(".btn-agregar");

    btnAgregar.addEventListener("click", () => {
      const talleElegido = selectTalle ? selectTalle.value : "Único";
      agregarAlCarrito(producto, talleElegido, colorSeleccionado);
    });

    grid.appendChild(card);
  });
}

function agregarAlCarrito(producto, talle, color) {
  const existente = carrito.find(
    (item) =>
      item.id === producto.id &&
      item.talle === talle &&
      item.color === color
  );

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

  guardarCarrito();
  actualizarCarrito();
  abrirCarrito();
}

function cambiarCantidad(index, delta) {
  if (!carrito[index]) return;
  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }
  guardarCarrito();
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

function abrirModalProducto(producto, colorInicial) {
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
    });
    coloresContainer.appendChild(btn);
  });

  const selectTalle = document.getElementById("modal-talle");
  selectTalle.innerHTML = (producto.talles || [])
    .map((talle) => `<option value="${talle}">Talle ${talle}</option>`)
    .join("");

  modal.classList.add("activo");
}

function cerrarModalProducto() {
  document.getElementById("modal-producto")?.classList.remove("activo");
  productoModalActual = null;
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarProductos();
  actualizarCarrito();

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

  const buscador = document.getElementById("buscador");
  if (buscador) {
    buscador.addEventListener("input", (e) => {
      textoBusqueda = e.target.value || "";
      renderizarProductos();
    });
  }

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
      alert("Agregá al menos una prenda al carrito antes de enviar el pedido.");
      return;
    }

    let mensaje = "Hola *Clara Lencería & Pijamas*! Quiero hacer el siguiente pedido:\n\n";
    let total = 0;

    carrito.forEach((item) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      mensaje += `• ${item.cantidad}x ${item.nombre} (Talle ${item.talle} - Color ${item.color}) - ${formatearPrecio(subtotal)}\n`;
    });

    mensaje += `\n*Total: ${formatearPrecio(total)}*\n¿Me confirman stock y medios de pago?`;

    window.open(crearUrlWhatsApp(mensaje), "_blank", "noopener,noreferrer");
  });
});