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

// Configuración de ruteo dinámico hacia microservicios
const services = [
    { path: '/api/usuarios', target: process.env.USUARIOS_SERVICE_URL },
    { path: '/api/agendamiento', target: process.env.AGENDAMIENTO_SERVICE_URL },
    { path: '/api/triage', target: process.env.TRIAGE_SERVICE_URL },
];

services.forEach(service => {
    app.use(service.path, createProxyMiddleware({
        target: service.target,
        changeOrigin: true,
        pathRewrite: { [`^${service.path}`]: '' }, // Limpia el prefijo antes de enviar al MS
    }));
});

app.listen(8080, () => console.log('🚀 API Gateway centralizado escuchando en puerto 8080'));