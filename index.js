const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

app.use(cors());
app.use(express.json());

// Middleware para validar JWT en rutas protegidas
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No autorizado' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido o expirado' });
        req.user = user;
        next();
    });
};

// Middleware para verificar roles específicos
const authorizeRole = (role) => (req, res, next) => {
    // Normalizamos para aceptar 'role' o 'rol' proveniente del JWT de Python
    const userRole = req.user.role || req.user.rol;
    if (req.user && userRole.toLowerCase() === role.toLowerCase()) {
        next();
    } else {
        res.status(403).json({ message: `Acceso denegado: se requiere rol de ${role}` });
    }
};

// Configuración de ruteo dinámico hacia microservicios
const services = [
    { path: '/api/usuarios', target: process.env.USUARIOS_SERVICE_URL, secure: false },
    // Asegúrate de que el target incluya el prefijo base si el microservicio lo requiere
    { path: '/api/agendamiento', target: `${process.env.AGENDAMIENTO_SERVICE_URL}/api/v1`, secure: true },
    { path: '/api/triage', target: process.env.TRIAGE_SERVICE_URL, secure: true, requiredRole: 'medico' },
];

services.forEach(service => {
    const middlewares = [];
    if (service.secure) middlewares.push(authenticateToken);
    if (service.requiredRole) middlewares.push(authorizeRole(service.requiredRole));

    app.use(service.path, ...middlewares, createProxyMiddleware({
        target: service.target,
        changeOrigin: true,
        pathRewrite: { [`^${service.path}`]: '' }, // Limpia el prefijo antes de enviar al MS
    }));
});

app.listen(8080, () => console.log('🚀 API Gateway centralizado escuchando en puerto 8080'));