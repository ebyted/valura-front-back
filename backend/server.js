
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const { cotizar, SERVICIOS } = require('./cotizador');

const app = express();
const port = process.env.PORT || 7099;

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
    'http://localhost:7099',
    'http://127.0.0.1:8080',
    'http://localhost:3000',
    'https://valura.mx',
    'https://www.valura.mx',
    'http://valura-homepage'
  ],
  methods: ['POST', 'OPTIONS', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-preview'],
  optionsSuccessStatus: 204
}));

/* ------------------------------- Rutas -------------------------------- */
app.post('/api/factura', async (req, res) => {
  try {
    const data = req.body || {};
    // Validación básica
    if (!data.rfc || !data.razon_social || !data.correo || !data.uso_cfdi || !data.domicilio) {
      return res.status(400).json({ ok: false, error: 'Faltan datos obligatorios para facturación.' });
    }

    // Construir el cuerpo del correo
    const facturaHtml = `
      <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: auto;">
        <h2 style="color: #005baa; text-align: center;">Solicitud de Factura – Valura</h2>
        <p>Se ha recibido una solicitud de factura electrónica CFDI con los siguientes datos:</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><td style="padding:6px 0;font-weight:bold;">RFC:</td><td style="padding:6px 0;">${data.rfc}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Nombre/Razón Social:</td><td style="padding:6px 0;">${data.razon_social}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Correo electrónico:</td><td style="padding:6px 0;">${data.correo}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Uso de CFDI:</td><td style="padding:6px 0;">${data.uso_cfdi}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Domicilio fiscal:</td><td style="padding:6px 0;">${data.domicilio}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Teléfono:</td><td style="padding:6px 0;">${data.telefono || 'No especificado'}</td></tr>
        </table>
        <p style="font-size: 0.95em; color: #555;">Por favor, procesa la factura y envíala al correo proporcionado.</p>
        <p style="font-size: 0.9em; color: #555; text-align: center;">Valura.mx</p>
      </div>
    `;

    // Enviar correo a contacto.valura@gmail.com y al cliente
    const destinatarios = [data.correo, process.env.SALES_EMAIL || 'contacto.valura@gmail.com']
      .filter(Boolean)
      .join(',');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatarios,
      replyTo: process.env.SALES_EMAIL || process.env.EMAIL_USER,
      subject: `Solicitud de factura CFDI | Valura.mx`,
      html: facturaHtml
    };
    await transporter.sendMail(mailOptions);

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error en /api/factura:', error);
    return res.status(400).json({ ok: false, error: error.message || 'Error al enviar la solicitud de factura' });
  }
});
app.get('/api/hola', (req, res) => {
  res.json({ mensaje: 'Hola mundo' });
});

// Health check endpoint for Docker healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'valura-mail-service',
    port: port
  });
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

    // Calcular cotización y ajustar IVA al 8%
    const resultado = cotizar(params);
    if (resultado && resultado.salida) {
      // Recalcular IVA y total con 8%
      let subtotalNum = parseFloat(resultado.salida.subtotal?.replace(/[^\d.]/g, '') || 0);
      let ivaNum = +(subtotalNum * 0.08).toFixed(2);
      resultado.salida.iva = `$${ivaNum.toLocaleString('es-MX', {minimumFractionDigits:2})}`;
      let totalNum = subtotalNum + ivaNum;
      resultado.salida.total = `$${totalNum.toLocaleString('es-MX', {minimumFractionDigits:2})}`;
    }

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
          <tr>
            <td style="padding:6px 0;">Subtotal</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;">${resultado.salida.subtotal}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;">IVA (8%)</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;">${resultado.salida.iva}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #e0eaf1;">Total</td>
            <td style="padding:6px 0;text-align:right;font-weight:800;color:#005baa;border-top:1px solid #e0eaf1;">
              ${resultado.salida.total} pesos
            </td>
          </tr>
        </table>

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
        <p style="margin-top:16px;">Si deseas continuar, responde este correo para agendar tu visita técnica.</p>
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

// ...existing code...
// ...existing code...
// --- Utilidad para Google Calendar ---
function buildGoogleCalendarLink({ nombre, email, fecha, hora, folio }) {
  // fecha: '2025-10-10', hora: '11:00'
  const start = new Date(`${fecha}T${hora}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hora
  function formatDate(d) {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  const dates = `${formatDate(start)}/${formatDate(end)}`;
  const text = encodeURIComponent('Visita técnica Valura');
  const details = encodeURIComponent(
    `Folio: ${folio || ''}\nNombre: ${nombre}\nCorreo: ${email}\nFecha: ${fecha}\nHora: ${hora}`
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
}

// --- Nueva ruta para agendar cita ---
app.post('/api/agendar-cita', async (req, res) => {
  try {
    const { nombre, telefono, email, fecha, hora, folio, cotizacion } = req.body || {};
    if (!nombre || !telefono || !email || !fecha || !hora) {
      return res.status(400).json({ ok: false, error: 'Faltan datos para agendar la cita.' });
    }
    // Generar link de Google Calendar
    const calendarLink = buildGoogleCalendarLink({ nombre, email, fecha, hora, folio });

    // Preparar info de cotización si viene en el request
    let cotizacionHtml = '';
    if (cotizacion && cotizacion.data && cotizacion.formData) {
      const data = cotizacion.data;
      const formData = cotizacion.formData;
      let lineas = '';
      if (data.salida && Array.isArray(data.salida.lineas)) {
        lineas = '<ul>' + data.salida.lineas.map(txt => `<li>${txt}</li>`).join('') + '</ul>';
      }
      cotizacionHtml = `
        <h3 style="color:#005baa;margin-top:1.5em;">Resumen de cotización pagada</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
          <tr><td style="padding:6px 0;font-weight:bold;">Servicio:</td><td style="padding:6px 0;">${formData.servicio_label || formData.servicio || ''}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Folio:</td><td style="padding:6px 0;">${data.quote_id || folio || ''}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Nombre:</td><td style="padding:6px 0;">${formData.nombre || nombre}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Teléfono:</td><td style="padding:6px 0;">${formData.telefono || telefono}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Correo:</td><td style="padding:6px 0;">${formData.email || email}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Dirección:</td><td style="padding:6px 0;">${formData.direccion_calle || ''} #${formData.direccion_numero || ''}, Col. ${formData.direccion_colonia || ''}, ${formData.direccion_ciudad || ''}, ${formData.direccion_estado || ''}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Tipo propiedad:</td><td style="padding:6px 0;">${formData.tipo_propiedad || ''}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">m² Terreno:</td><td style="padding:6px 0;">${formData.m2_terreno || 'No especificado'}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">m² Construcción:</td><td style="padding:6px 0;">${formData.m2_construccion || 'No especificado'}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Notas:</td><td style="padding:6px 0;">${formData.notas || 'Sin notas'}</td></tr>
        </table>
        <div style="margin-bottom:0.7em;"><strong>Desglose:</strong></div>
        <div style="width:100%;">${lineas}</div>
        <table style="width:100%;border-collapse:collapse;margin-top:1em;">
          <tr><td style="padding:6px 0;">Subtotal</td><td style="padding:6px 0;text-align:right;font-weight:600;">${data.salida?.subtotal || ''}</td></tr>
          <tr><td style="padding:6px 0;">IVA</td><td style="padding:6px 0;text-align:right;font-weight:600;">${data.salida?.iva || ''}</td></tr>
          <tr><td style="padding:6px 0;border-top:1px solid #e0eaf1;">Total</td><td style="padding:6px 0;text-align:right;font-weight:800;color:#005baa;border-top:1px solid #e0eaf1;">${data.salida?.total || ''} pesos</td></tr>
        </table>
      `;
    }

    // Armar el cuerpo del correo
    const citaHtml = `
      <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: auto;">
        <h2 style="color: #005baa; text-align: center;">Nueva cita agendada – Valura</h2>
        <p>Se ha agendado una cita con los siguientes datos:</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><td style="padding:6px 0;font-weight:bold;">Folio:</td><td style="padding:6px 0;">${folio || 'No especificado'}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Nombre:</td><td style="padding:6px 0;">${nombre}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Teléfono:</td><td style="padding:6px 0;">${telefono}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Correo:</td><td style="padding:6px 0;">${email}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Fecha:</td><td style="padding:6px 0;">${fecha}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Hora:</td><td style="padding:6px 0;">${hora}</td></tr>
        </table>
        ${cotizacionHtml}
        <p style="margin:1.5em 0 0.5em 0;">
          <a href="${calendarLink}" style="background:#0097a7;color:#fff;padding:0.8em 1.5em;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Agregar a Google Calendar</a>
        </p>
        <p style="font-size: 0.95em; color: #555;">Por favor, confirma la cita y contacta al cliente.</p>
        <p style="font-size: 0.9em; color: #555; text-align: center;">Valura.mx</p>
      </div>
    `;
    // Enviar correo a contacto.valura@gmail.com y al cliente
    const destinatarios = [email, process.env.SALES_EMAIL || 'contacto.valura@gmail.com']
      .filter(Boolean)
      .join(',');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatarios,
      replyTo: process.env.SALES_EMAIL || process.env.EMAIL_USER,
      subject: `Cita agendada | Valura.mx`,
      html: citaHtml
    };
    await transporter.sendMail(mailOptions);
    return res.json({ ok: true, calendarLink });
  } catch (error) {
    console.error('Error en /api/agendar-cita:', error);
    return res.status(400).json({ ok: false, error: error.message || 'Error al agendar la cita' });
  }
});