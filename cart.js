// Módulo 4: Persistencia temporal del carrito en localStorage
const CART_KEY = 'saborDirecto_carrito';
const ENVIO_FIJO = 15.00;
const IMPUESTO_PORC = 0.12;

const Cart = {
  items: [],

  cargar() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      this.items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('No se pudo leer el carrito guardado, se reinicia.', e);
      this.items = [];
    }
    return this.items;
  },

  guardar() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items));
  },

  agregar(producto) {
    const existente = this.items.find(i => i.id === producto.id);
    if (existente) {
      existente.cantidad += 1;
    } else {
      this.items.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        imagen_url: producto.imagen_url,
        cantidad: 1
      });
    }
    this.guardar();
  },

  cambiarCantidad(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      this.items = this.items.filter(i => i.id !== id);
    }
    this.guardar();
  },

  eliminar(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.guardar();
  },

  vaciar() {
    this.items = [];
    this.guardar();
  },

  totalUnidades() {
    return this.items.reduce((sum, i) => sum + i.cantidad, 0);
  },

  subtotal() {
    return this.items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
  },

  envio() {
    return this.items.length > 0 ? ENVIO_FIJO : 0;
  },

  impuesto() {
    return this.subtotal() * IMPUESTO_PORC;
  },

  total() {
    return this.subtotal() + this.envio() + this.impuesto();
  }
};
