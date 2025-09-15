require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { cotizar, SERVICIOS } = require('./cotizador');

const app = express();
const port = process.env.PORT || 3015;

/* ------------------------ SMTP (Gmail u otro) ------------------------ */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

/* ----------------------- Utilidades de presentación ----------------------- */
function acentuarServicio(servicio) {
  let s = (servicio || '').toLowerCase();
  s = s.replace(/estimacion/g, 'estimación');
  s = s.replace(/avaluo/g, 'avalúo');
  s = s.replace(/inspeccion/g, 'inspección');
  if (servicio && servicio[0] === servicio[0].toUpperCase()) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }
  return s;
}

function buildWhatsAppLink({ toNumber, formData, resultado, servicioNombre, quoteId }) {
  const number = String(toNumber || '526463843985').replace(/\D/g, '');
  const lineas = (resultado?.salida?.lineas || []).join(' | ');
  const subtotal = resultado?.salida?.subtotal || '';
  const iva = resultado?.salida?.iva || '';
  const total = resultado?.salida?.total || '';
  const direccion = `${formData.direccion_calle || ''} #${formData.direccion_numero || ''}, Col. ${formData.direccion_colonia || ''}, ${formData.direccion_ciudad || ''}, ${formData.direccion_estado || ''}`.replace(/\s+/g,' ').trim();

  const text =
`Hola, quiero confirmar el servicio ${servicioNombre}.
Cotización: ${quoteId}
Dirección: ${direccion}
Tipo de propiedad: ${formData.tipo_propiedad || ''}

Detalle: ${lineas}
Subtotal: ${subtotal}
IVA (16%): ${iva}
TOTAL: ${total}

Nombre: ${formData.nombre || ''}
Tel: ${formData.telefono || ''}
Correo: ${formData.email || ''}`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

// Mapeos desde el front
function mapServicioFrontToDomain(v) {
  switch (String(v || '').toLowerCase()) {
    case 'avaluo': return SERVICIOS.AVALUO;
    case 'estimacion': return SERVICIOS.ESTIMACION_VALOR;
    case 'inspeccion': return SERVICIOS.INSPECCION;
    default: return SERVICIOS.AVALUO;
  }
}
function mapTipoPropFrontToDomain(v) {
  return String(v || '').toLowerCase() === 'terreno' ? 'Terreno' : 'Construccion';
}

/* ----------------------------- Middlewares ----------------------------- */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:3015',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://valura.mx',
    'https://www.valura.mx',
    'http://valura-homepage'
  ],
  methods: ['POST', 'OPTIONS', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

/* ------------------------------- Rutas -------------------------------- */
app.get('/api/hola', (req, res) => {
  res.json({ mensaje: 'Hola mundo' });
});

app.post('/api/cotizacion', async (req, res) => {
  try {
    const formData = req.body || {};
    const params = {
      servicio: mapServicioFrontToDomain(formData.servicio),
      tipo_propiedad: mapTipoPropFrontToDomain(formData.tipo_propiedad),
      m2_construccion: formData.m2_construccion,
      m2_terreno: formData.m2_terreno,
      incluir_planos: !!formData.planos_arquitectonicos,
      factor_servicio: Number(formData.factor_servicio) || 15000
    };

    const resultado = cotizar(params);

    // --- ID corto de cotización y link de WhatsApp ---
    const quoteId = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)).slice(0, 8);
    const servicioNombre = acentuarServicio(formData.servicio_label || formData.servicio || 'servicio');
    const waUrl = buildWhatsAppLink({
      toNumber: process.env.WHATSAPP_NUMBER,
      formData,
      resultado,
      servicioNombre,
      quoteId
    });

    // ---- Email de confirmación con desglose + botón WhatsApp ----
    const lineasHtml = (resultado.salida.lineas || [])
      .map(txt => `<li>${txt}</li>`)
      .join('');

    const confirmationTemplate = `
      <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: auto;">
        <h2 style="color: #005baa; text-align: center;">Tu cotización – Valura</h2>
        <p style="margin:0 0 8px 0;">Folio: <strong>${quoteId}</strong></p>
        <p>Hola <strong>${formData.nombre || ''}</strong>,</p>
        <p>Gracias por tu solicitud. Aquí tienes el desglose estimado para <strong>${servicioNombre}</strong>:</p>

        <ul style="margin:0 0 12px 18px;padding:0;">${lineasHtml}</ul>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;">Subtotal</td><td style="padding:6px 0;text-align:right;font-weight:600;">${resultado.salida.subtotal}</td></tr>
          <tr><td style="padding:6px 0;">IVA (16%)</td><td style="padding:6px 0;text-align:right;font-weight:600;">${resultado.salida.iva}</td></tr>
          <tr><td style="padding:6px 0;border-top:1px solid #e0eaf1;">Total</td><td style="padding:6px 0;text-align:right;font-weight:800;color:#d32f2f;border-top:1px solid #e0eaf1;">${resultado.salida.total}</td></tr>
        </table>

        <div style="text-align:center;margin:16px 0 6px;">
          <a href="${waUrl}" target="_blank" rel="noopener"
             style="background:#25D366;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">
            Confirmar servicio por WhatsApp
          </a>
        </div>

        <hr style="margin:16px 0;">
        <p style="margin:0 0 8px 0;"><strong>Datos capturados</strong></p>
        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            <tr><td style="padding:6px 0;width:40%;font-weight:bold;">Teléfono:</td><td style="padding:6px 0;">${formData.telefono || ''}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Correo:</td><td style="padding:6px 0;">${formData.email || ''}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Tipo propiedad:</td><td style="padding:6px 0;">${formData.tipo_propiedad || ''}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Dirección:</td><td style="padding:6px 0;">${formData.direccion_calle || ''} #${formData.direccion_numero || ''}, Col. ${formData.direccion_colonia || ''}, ${formData.direccion_ciudad || ''}, ${formData.direccion_estado || ''}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">m² Terreno:</td><td style="padding:6px 0;">${formData.m2_terreno || 'No especificado'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">m² Construcción:</td><td style="padding:6px 0;">${formData.m2_construccion || 'No especificado'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Notas:</td><td style="padding:6px 0;">${formData.notas || 'Sin notas'}</td></tr>
          </tbody>
        </table>
        <p style="margin-top:16px;">Si deseas continuar, responde este correo o usa el botón de WhatsApp para agendar tu visita técnica.</p>
        <p style="font-size: 0.9em; color: #555; text-align: center;">Claridad, valor y forma en Valura.mx</p>
      </div>
    `;

    const payload = {
      ok: true,
      quote_id: quoteId,
      whatsapp_confirm_url: waUrl,
      ...resultado
    };


    // Enviar correo a ambos destinatarios: cliente y contacto.valura@gmail.com
    const destinatarios = [formData.email, process.env.SALES_EMAIL || 'contacto.valura@gmail.com']
      .filter(Boolean)
      .join(',');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatarios,
      replyTo: process.env.SALES_EMAIL || process.env.EMAIL_USER,
      subject: `Tu cotización (${quoteId}) - ${servicioNombre} | Valura.mx`,
      html: confirmationTemplate
    };
    await transporter.sendMail(mailOptions);

    return res.json(payload);

  } catch (error) {
    console.error('Error en /api/cotizacion:', error);
    return res.status(400).json({ ok: false, error: error.message || 'Error al calcular/enviar la cotización' });
  }
});

/* ------------------------------ Servidor ------------------------------ */
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
