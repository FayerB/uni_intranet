const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

const send = async ({ to, subject, html, text }) => {
  if (process.env.NOTIF_EMAIL_ACTIVO !== 'true') return;
  try {
    await getTransporter().sendMail({
      from: `"${process.env.NOMBRE_INSTITUCION || 'Campus Virtual'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    logger.error(`Error enviando email a ${to}: ${err.message}`);
  }
};

const templates = {
  nuevaTarea: ({ nombre, titulo, curso, fecha }) => ({
    subject: `Nueva tarea: ${titulo}`,
    html: `<p>Hola <b>${nombre}</b>,</p>
           <p>Se publicó la tarea <b>"${titulo}"</b> en el curso <b>${curso}</b>.</p>
           <p>Fecha límite: <b>${new Date(fecha).toLocaleString('es-PE')}</b></p>`,
  }),
  calificacionPublicada: ({ nombre, curso, promedio }) => ({
    subject: `Calificación publicada — ${curso}`,
    html: `<p>Hola <b>${nombre}</b>,</p>
           <p>Tu calificación en <b>${curso}</b> fue registrada: <b>${promedio}</b></p>`,
  }),
};

module.exports = { send, templates };
