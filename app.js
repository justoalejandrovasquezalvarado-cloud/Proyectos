// Módulo 1 y 4: Interfaz de usuario + lógica de negocio en el cliente

let productos = [];
let categoriaActiva = 'todas';

const fmtQ = (n) => `Q${Number(n).toFixed(2)}`;

// -----------------------------------------------------------
// Elementos del DOM
// -----------------------------------------------------------
const productGrid   = document.getElementById('productGrid');
const filtersEl      = document.getElementById('filters');
const categoryNav    = document.getElementById('categoryNav');
const cartCountEl    = document.getElementById('cartCount');
const cartItemsEl    = document.getElementById('cartItems');
const cartDrawer     = document.getElementById('cartDrawer');
const overlay        = document.getElementById('overlay');
const toastEl        = document.getElementById('toast');
const checkoutBtn    = document.getElementById('checkoutBtn');
const checkoutModal  = document.getElementById('checkoutModal');
const confirmModal   = document.getElementById('confirmModal');

// -----------------------------------------------------------
// Arranque
// -----------------------------------------------------------
document.addEventListener('DOMContentLoaded', init);

async function init() {
  Cart.cargar();
  actualizarCarritoUI();

  try {
    productos = await Api.obtenerProductos();
    renderFiltros();
    renderCategoriasNav();
    renderProductos();
  } catch (err) {
    productGrid.innerHTML = `<div class="empty-state">No se pudo conectar con el servidor. Verifica que el backend esté corriendo (npm start).</div>`;
    console.error(err);
  }

  bindEventos();
}

// -----------------------------------------------------------
// Render de catálogo
// -----------------------------------------------------------
function categoriasUnicas() {
  return [...new Set(productos.map(p => p.categoria))];
}

function renderCategoriasNav() {
  categoryNav.innerHTML = categoriasUnicas().map(cat =>
    `<button data-cat="${cat}">${cat}</button>`
  ).join('');

  categoryNav.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      categoriaActiva = btn.dataset.cat;
      sincronizarFiltros();
      renderProductos();
      document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function renderFiltros() {
  const cats = categoriasUnicas();
  filtersEl.innerHTML = `<button class="active" data-cat="todas">Todas</button>` +
    cats.map(cat => `<button data-cat="${cat}">${cat}</button>`).join('');

  filtersEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      categoriaActiva = btn.dataset.cat;
      sincronizarFiltros();
      renderProductos();
    });
  });
}

function sincronizarFiltros() {
  filtersEl.querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === categoriaActiva);
  });
  categoryNav.querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === categoriaActiva);
  });
}

function renderProductos() {
  const lista = categoriaActiva === 'todas'
    ? productos
    : productos.filter(p => p.categoria === categoriaActiva);

  if (lista.length === 0) {
    productGrid.innerHTML = `<div class="empty-state">No hay productos en esta categoría.</div>`;
    return;
  }

  productGrid.innerHTML = lista.map(p => `
    <article class="product-card">
      <div class="thumb"><img src="${p.imagen_url}" alt="${p.nombre}" loading="lazy"></div>
      <div class="body">
        <span class="cat">${p.categoria}</span>
        <h3>${p.nombre}</h3>
        <p class="desc">${p.descripcion || ''}</p>
        <div class="foot">
          <span class="price">${fmtQ(p.precio)}</span>
          <button class="add-btn" data-id="${p.id}" aria-label="Agregar al carrito">+</button>
        </div>
      </div>
    </article>
  `).join('');

  productGrid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const producto = productos.find(p => p.id == btn.dataset.id);
      Cart.agregar(producto);
      actualizarCarritoUI();
      mostrarToast(`${producto.nombre} agregado al carrito`);
      btn.classList.add('added');
      btn.textContent = '✓';
      setTimeout(() => { btn.classList.remove('added'); btn.textContent = '+'; }, 700);
    });
  });
}

// -----------------------------------------------------------
// Carrito: render y controles
// -----------------------------------------------------------
function actualizarCarritoUI() {
  cartCountEl.textContent = Cart.totalUnidades();

  if (Cart.items.length === 0) {
    cartItemsEl.innerHTML = `<div class="empty-state">Tu carrito está vacío.<br>Agrega algo delicioso 🍔</div>`;
  } else {
    cartItemsEl.innerHTML = Cart.items.map(item => `
      <div class="cart-item">
        <img src="${item.imagen_url}" alt="${item.nombre}">
        <div>
          <div class="name">${item.nombre}</div>
          <div class="unit-price">${fmtQ(item.precio)} c/u</div>
          <div class="qty-control">
            <button data-action="menos" data-id="${item.id}">−</button>
            <span>${item.cantidad}</span>
            <button data-action="mas" data-id="${item.id}">+</button>
          </div>
        </div>
        <div>
          <div class="line-total">${fmtQ(item.precio * item.cantidad)}</div>
          <button class="remove-btn" data-action="quitar" data-id="${item.id}">Quitar</button>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('sumSubtotal').textContent = fmtQ(Cart.subtotal());
  document.getElementById('sumEnvio').textContent = fmtQ(Cart.envio());
  document.getElementById('sumImpuesto').textContent = fmtQ(Cart.impuesto());
  document.getElementById('sumTotal').textContent = fmtQ(Cart.total());

  checkoutBtn.disabled = Cart.items.length === 0;

  cartItemsEl.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const accion = btn.dataset.action;
      if (accion === 'mas') Cart.cambiarCantidad(id, 1);
      if (accion === 'menos') Cart.cambiarCantidad(id, -1);
      if (accion === 'quitar') Cart.eliminar(id);
      actualizarCarritoUI();
    });
  });
}

// -----------------------------------------------------------
// Eventos generales (drawer, modales, formulario)
// -----------------------------------------------------------
function bindEventos() {
  document.getElementById('openCartBtn').addEventListener('click', abrirCarrito);
  document.getElementById('closeCartBtn').addEventListener('click', cerrarCarrito);
  overlay.addEventListener('click', () => { cerrarCarrito(); cerrarModales(); });

  checkoutBtn.addEventListener('click', () => {
    if (Cart.items.length === 0) return;
    cerrarCarrito();
    abrirModal(checkoutModal);
  });

  document.getElementById('cancelCheckoutBtn').addEventListener('click', () => cerrarModal(checkoutModal));
  document.getElementById('checkoutForm').addEventListener('submit', manejarSubmitPedido);
  document.getElementById('newOrderBtn').addEventListener('click', () => {
    cerrarModal(confirmModal);
    Cart.vaciar();
    actualizarCarritoUI();
  });

  document.getElementById('heroTrackBtn').addEventListener('click', async () => {
    const id = prompt('Ingresa el número de tu pedido:');
    if (!id) return;
    try {
      const pedido = await Api.obtenerPedido(id.replace('#', ''));
      alert(`Pedido #${pedido.id}\nEstado: ${pedido.estado}\nTotal: ${fmtQ(pedido.total)}`);
    } catch (err) {
      alert('No se encontró ese pedido.');
    }
  });
}

function abrirCarrito() { cartDrawer.classList.add('open'); overlay.classList.add('open'); }
function cerrarCarrito() { cartDrawer.classList.remove('open'); overlay.classList.remove('open'); }
function abrirModal(modal) { modal.classList.add('open'); overlay.classList.add('open'); }
function cerrarModal(modal) { modal.classList.remove('open'); overlay.classList.remove('open'); }
function cerrarModales() { checkoutModal.classList.remove('open'); confirmModal.classList.remove('open'); }

function mostrarToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// -----------------------------------------------------------
// Validaciones + envío del pedido (Módulo 3 y 4)
// -----------------------------------------------------------
function validarCampo(id, esValido) {
  const field = document.getElementById(`field-${id}`);
  field.classList.toggle('invalid', !esValido);
  return esValido;
}

function validarFormulario(datos) {
  const nombreOk = datos.nombre.trim().length >= 3;
  const correoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim());
  const telefonoOk = /^\d{4,5}-?\d{4}$/.test(datos.telefono.trim()) || datos.telefono.trim().length >= 8;
  const direccionOk = datos.direccion.trim().length >= 8;

  validarCampo('nombre', nombreOk);
  validarCampo('correo', correoOk);
  validarCampo('telefono', telefonoOk);
  validarCampo('direccion', direccionOk);

  return nombreOk && correoOk && telefonoOk && direccionOk;
}

async function manejarSubmitPedido(e) {
  e.preventDefault();
  const formMsg = document.getElementById('formMsg');
  formMsg.classList.remove('show');

  if (Cart.items.length === 0) {
    formMsg.textContent = 'Tu carrito está vacío.';
    formMsg.classList.add('show');
    return;
  }

  const datos = {
    nombre: document.getElementById('nombre').value,
    correo: document.getElementById('correo').value,
    telefono: document.getElementById('telefono').value,
    direccion: document.getElementById('direccion').value
  };

  if (!validarFormulario(datos)) {
    formMsg.textContent = 'Revisa los campos marcados en rojo.';
    formMsg.classList.add('show');
    return;
  }

  const submitBtn = document.getElementById('submitOrderBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  const payload = {
    usuario: datos,
    items: Cart.items.map(i => ({
      producto_id: i.id,
      cantidad: i.cantidad,
      precio_unitario: i.precio
    })),
    total: Number(Cart.total().toFixed(2))
  };

  try {
    const resultado = await Api.crearPedido(payload);
    mostrarConfirmacion(resultado, datos);
    cerrarModal(checkoutModal);
    document.getElementById('checkoutForm').reset();
  } catch (err) {
    formMsg.textContent = err.message || 'Ocurrió un error al procesar el pedido.';
    formMsg.classList.add('show');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar pedido';
  }
}

function mostrarConfirmacion(resultado, datos) {
  document.getElementById('orderNumber').textContent = `#${String(resultado.pedido_id).padStart(4, '0')}`;

  const receipt = document.getElementById('orderReceipt');
  receipt.innerHTML = Cart.items.map(i => `
    <div class="receipt-row"><span>${i.cantidad}x ${i.nombre}</span><span>${fmtQ(i.precio * i.cantidad)}</span></div>
  `).join('') + `
    <div class="receipt-row"><span>Envío</span><span>${fmtQ(Cart.envio())}</span></div>
    <div class="receipt-row"><span>Impuesto</span><span>${fmtQ(Cart.impuesto())}</span></div>
    <div class="receipt-row" style="font-weight:700; border-top:1px solid var(--line); margin-top:6px; padding-top:8px;">
      <span>Total</span><span>${fmtQ(Cart.total())}</span>
    </div>
    <div class="receipt-row"><span>Entrega en</span><span>${datos.direccion}</span></div>
  `;

  abrirModal(confirmModal);
}
