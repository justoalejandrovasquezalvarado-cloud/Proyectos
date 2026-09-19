-- =========================================================
-- PROYECTO: SISTEMA DE PEDIDOS DE COMIDA A DOMICILIO
-- Módulo 2: Base de Datos Relacional (MySQL)
-- =========================================================

CREATE DATABASE IF NOT EXISTS pedidos_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pedidos_db;

-- ---------------------------------------------------------
-- Tabla: usuarios
-- ---------------------------------------------------------
DROP TABLE IF EXISTS detalles_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(120)  NOT NULL,
    correo         VARCHAR(150)  NOT NULL UNIQUE,
    telefono       VARCHAR(20)   NOT NULL,
    direccion      VARCHAR(255)  NOT NULL,
    fecha_registro DATETIME      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla: productos
-- ---------------------------------------------------------
CREATE TABLE productos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(120)   NOT NULL,
    descripcion VARCHAR(255),
    precio      DECIMAL(10,2)  NOT NULL,
    categoria   VARCHAR(60)    NOT NULL,
    imagen_url  VARCHAR(255)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla: pedidos
-- ---------------------------------------------------------
CREATE TABLE pedidos (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT            NOT NULL,
    fecha      DATETIME       DEFAULT CURRENT_TIMESTAMP,
    total      DECIMAL(10,2)  NOT NULL,
    estado     ENUM('pendiente', 'en_preparacion', 'entregado') DEFAULT 'pendiente',
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Tabla: detalles_pedido
-- ---------------------------------------------------------
CREATE TABLE detalles_pedido (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id       INT            NOT NULL,
    producto_id     INT            NOT NULL,
    cantidad        INT            NOT NULL,
    precio_unitario DECIMAL(10,2)  NOT NULL,
    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- DATOS DE PRUEBA (catálogo inicial)
-- ---------------------------------------------------------
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen_url) VALUES
('Hamburguesa Clásica', 'Carne de res, queso cheddar, lechuga y tomate', 45.00, 'Hamburguesas', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
('Hamburguesa Doble', 'Doble carne, doble queso, tocino y salsa especial', 62.00, 'Hamburguesas', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400'),
('Pizza Margarita', 'Salsa de tomate, mozzarella fresca y albahaca', 75.00, 'Pizzas', 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400'),
('Pizza Pepperoni', 'Salsa de tomate, mozzarella y pepperoni', 82.00, 'Pizzas', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'),
('Tacos al Pastor (3u)', 'Tortilla de maíz, cerdo marinado, piña y cilantro', 38.00, 'Tacos', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400'),
('Tacos de Carne Asada (3u)', 'Tortilla de maíz, carne asada, cebolla y salsa verde', 40.00, 'Tacos', 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400'),
('Ensalada César', 'Lechuga romana, pollo a la parrilla, crutones y aderezo césar', 42.00, 'Ensaladas', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'),
('Papas Fritas Grandes', 'Papas crujientes con sal de mar', 22.00, 'Acompañamientos', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
('Alitas BBQ (8u)', 'Alitas de pollo bañadas en salsa BBQ', 55.00, 'Acompañamientos', 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400'),
('Refresco 500ml', 'Bebida gaseosa a elegir', 12.00, 'Bebidas', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'),
('Malteada de Chocolate', 'Malteada cremosa de chocolate', 25.00, 'Bebidas', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400'),
('Brownie con Helado', 'Brownie tibio con bola de helado de vainilla', 30.00, 'Postres', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400');
