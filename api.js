// Módulo 4: Lógica de negocio en frontend — Peticiones asíncronas a la API REST
// Todas las funciones usan fetch + async/await y manejan errores.

const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? '/api'
  : '/api'; // Mismo origen: el backend Express sirve también el frontend

const Api = {
  async obtenerProductos() {
    const res = await fetch(`${API_BASE}/productos`);
    if (!res.ok) throw new Error('No se pudieron cargar los productos');
    return res.json();
  },

  async crearPedido(payload) {
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo crear el pedido');
    return data;
  },

  async obtenerPedido(id) {
    const res = await fetch(`${API_BASE}/pedidos/${id}`);
    if (!res.ok) throw new Error('Pedido no encontrado');
    return res.json();
  }
};
