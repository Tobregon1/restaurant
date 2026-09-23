const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// ==========================================
// AUTHENTICATION
// ==========================================
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // 1. Check if superadmin
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign({ id: 'superadmin', role: 'superadmin' }, JWT_SECRET);
      return res.json({ token, user: { id: 'superadmin', nombre: 'Super Administrador', rol: 'superadmin' } });
    }

    // 2. Check employees
    const empleado = await prisma.empleado.findUnique({
      where: { username },
      include: { tenant: true }
    });

    if (!empleado || !empleado.activo) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    // Since we are mocking old data with plain text passwords for now, we check plain text
    // In production, we'd use: const valid = await bcrypt.compare(password, empleado.password);
    const valid = password === empleado.password;
    if (!valid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: empleado.id, role: empleado.rol, tenantId: empleado.tenantId }, JWT_SECRET);
    res.json({ token, user: empleado, tenant: empleado.tenant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// TENANTS (Negocios) - Superadmin only
// ==========================================
router.get('/negocios', async (req, res) => {
  const negocios = await prisma.tenant.findMany();
  res.json(negocios);
});
router.post('/negocios', async (req, res) => {
  const n = await prisma.tenant.create({ data: req.body });
  res.json(n);
});
router.put('/negocios/:id', async (req, res) => {
  const n = await prisma.tenant.update({ where: { id: req.params.id }, data: req.body });
  res.json(n);
});
router.delete('/negocios/:id', async (req, res) => {
  await prisma.tenant.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});


const cleanPayload = (body) => {
  const parsed = { ...body };
  // Convert numbers
  if (parsed.numero !== undefined) parsed.numero = Number(parsed.numero);
  if (parsed.capacidad !== undefined) parsed.capacidad = Number(parsed.capacidad);
  if (parsed.precio !== undefined) parsed.precio = Number(parsed.precio);
  if (parsed.costoDelivery !== undefined) parsed.costoDelivery = Number(parsed.costoDelivery);
  if (parsed.iva !== undefined) parsed.iva = Number(parsed.iva);
  // Remove unsupported fields
  delete parsed.id;
  delete parsed.zona;
  delete parsed.imagen;
  return parsed;
};

const createCrudRoutes = (entityName, model) => {
  if (!prisma[model]) {
    router.get(`/${entityName}/:tenantId`, (req, res) => res.json([]));
    router.post(`/${entityName}/:tenantId`, (req, res) => res.json({ id: Date.now().toString(), ...req.body }));
    router.put(`/${entityName}/:tenantId/:id`, (req, res) => res.json(req.body));
    router.delete(`/${entityName}/:tenantId/:id`, (req, res) => res.json({ ok: true }));
    return;
  }

  router.get(`/${entityName}/:tenantId`, async (req, res) => {
    try {
      const whereClause = model === 'menuItem' 
        ? { categoria: { tenantId: req.params.tenantId } } 
        : { tenantId: req.params.tenantId };
      const data = await prisma[model].findMany({ where: whereClause });
      res.json(data);
    } catch(e) { console.error(e); res.status(500).json({error: e.message}); }
  });

  router.post(`/${entityName}/bulk/:tenantId`, async (req, res) => {
    try {
      if (!Array.isArray(req.body)) return res.status(400).json({error: "Expected an array"});
      const items = req.body.map(item => {
        const parsed = cleanPayload(item);
        if (model !== 'menuItem') {
          parsed.tenantId = req.params.tenantId;
        }
        return parsed;
      });
      const data = await prisma[model].createMany({ data: items });
      res.json(data);
    } catch(e) { console.error(e); res.status(500).json({error: e.message}); }
  });

  router.post(`/${entityName}/:tenantId`, async (req, res) => {
    try {
      const parsedBody = cleanPayload(req.body);
      const insertData = { ...parsedBody };
      if (model !== 'menuItem') {
        insertData.tenantId = req.params.tenantId;
      }
      const data = await prisma[model].create({ data: insertData });
      res.json(data);
    } catch(e) { console.error(e); res.status(500).json({error: e.message}); }
  });

  router.put(`/${entityName}/:tenantId/:id`, async (req, res) => {
    try {
      const parsedBody = cleanPayload(req.body);
      const data = await prisma[model].update({ where: { id: req.params.id }, data: parsedBody });
      res.json(data);
    } catch(e) { console.error(e); res.status(500).json({error: e.message}); }
  });

  router.delete(`/${entityName}/:tenantId/:id`, async (req, res) => {
    try {
      await prisma[model].delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch(e) { console.error(e); res.status(500).json({error: e.message}); }
  });
};

createCrudRoutes('mesas', 'mesa');
createCrudRoutes('empleados', 'empleado');
createCrudRoutes('categorias', 'categoria');
createCrudRoutes('menu_items', 'menuItem');
createCrudRoutes('pedidos', 'pedido');
createCrudRoutes('reservas', 'reserva_dummy');
createCrudRoutes('inventario', 'inventario');
createCrudRoutes('delivery', 'delivery_dummy');
createCrudRoutes('ventas', 'ventas_dummy');

module.exports = router;
