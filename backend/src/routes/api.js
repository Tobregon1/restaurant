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


// ==========================================
// GENERIC CRUD FACTORY
// ==========================================
const createCrudRoutes = (entityName, model) => {
  router.get(`/${entityName}/:tenantId`, async (req, res) => {
    const data = await prisma[model].findMany({ where: { tenantId: req.params.tenantId } });
    res.json(data);
  });
  router.post(`/${entityName}/:tenantId`, async (req, res) => {
    const data = await prisma[model].create({ data: { ...req.body, tenantId: req.params.tenantId } });
    res.json(data);
  });
  router.put(`/${entityName}/:tenantId/:id`, async (req, res) => {
    const data = await prisma[model].update({ where: { id: req.params.id }, data: req.body });
    res.json(data);
  });
  router.delete(`/${entityName}/:tenantId/:id`, async (req, res) => {
    await prisma[model].delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  });
};

createCrudRoutes('mesas', 'mesa');
createCrudRoutes('empleados', 'empleado');
createCrudRoutes('categorias', 'categoria');
createCrudRoutes('menu_items', 'menuItem');
createCrudRoutes('pedidos', 'pedido');

module.exports = router;
