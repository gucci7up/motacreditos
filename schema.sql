CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  cedula_telefono VARCHAR(20) NOT NULL,
  direccion TEXT,
  saldo_total DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_perfume VARCHAR(100) NOT NULL,
  precio_venta DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  monto_total DECIMAL(10, 2) NOT NULL,
  estado ENUM('Pendiente', 'Parcial', 'Pagado') DEFAULT 'Pendiente',
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  monto_abonado DECIMAL(10, 2) NOT NULL,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
);

-- Triggers for automatic debt calculation (saldo_total)
DELIMITER //

CREATE TRIGGER after_venta_insert
AFTER INSERT ON ventas
FOR EACH ROW
BEGIN
  UPDATE clientes 
  SET saldo_total = saldo_total + NEW.monto_total
  WHERE id = NEW.cliente_id;
END; //

CREATE TRIGGER after_pago_insert
AFTER INSERT ON pagos
FOR EACH ROW
BEGIN
  DECLARE cliente_id INT;
  DECLARE monto_venta_restante DECIMAL(10,2);
  
  -- Calculate remaining debt for the sale (venta) to update status
  SELECT v.cliente_id, (v.monto_total - IFNULL(SUM(p.monto_abonado), 0))
  INTO cliente_id, monto_venta_restante
  FROM ventas v
  LEFT JOIN pagos p ON v.id = p.venta_id
  WHERE v.id = NEW.venta_id
  GROUP BY v.id;

  -- Update client global debt
  UPDATE clientes 
  SET saldo_total = saldo_total - NEW.monto_abonado
  WHERE id = cliente_id;
  
  -- Update sale status based on remaining debt
  IF monto_venta_restante <= 0 THEN
      UPDATE ventas SET estado = 'Pagado' WHERE id = NEW.venta_id;
  ELSE
      UPDATE ventas SET estado = 'Parcial' WHERE id = NEW.venta_id;
  END IF;
END; //

DELIMITER ;
