require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3015;

// ===== CORS (ANTES que bodyParser) =====
const WHITELIST = new Set([
  'http://valura-homepage:80',
  'https://www.valura.mx',
  'https://valura.mx',
]);

const corsOptions = {
  origin(origin, cb) {
    // Permitir herramientas tipo curl/postman (sin Origin)
    if (!origin) return cb(null, true);
    cb(null, WHITELIST.has(origin));
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true,               // si envías cookies/Authorization
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  // Para caches/proxies: indica que depende del Origin
  res.header('Vary', 'Origin');
  next();
});
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilita preflight global

// ===== Body parsers DESPUÉS de CORS =====
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===== Nodemailer =====
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false },
});

// ===== Ruta =====
app.post('/api/cotizacion', async (req, res, next) => {
  const formData = req.body;
  const servicioNombre = formData.servicio_label || formData.servicio;

  const confirmationTemplate = `www.sanchodistribuidora.com`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: formData.email,
      subject: `Confirmación de solicitud - Valura.mx`,
      html: confirmationTemplate,
    });

    // Respuesta JSON estándar
    res.status(200).json({ ok: true, message: 'Cotización enviada. ¡Gracias!' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ ok: false, message: 'Error al enviar la cotización.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});
