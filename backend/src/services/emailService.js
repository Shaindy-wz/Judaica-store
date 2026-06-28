import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  if (!to) return;
  const client = getTransporter();
  if (!client) {
    console.warn(`[email] SMTP not configured — skipped "${subject}" to ${to}`);
    return;
  }
  await client.sendMail({
    from: process.env.EMAIL_FROM || `"${process.env.STORE_NAME || 'החנות'}" <no-reply@example.com>`,
    to,
    subject,
    html,
  });
}

function emailLayout(content) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8" /></head>
<body style="direction: rtl; text-align: right; font-family: Heebo, Arial, sans-serif; background: #faf7f0; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 24px; border-top: 3px solid #c9a227; box-shadow: 0 4px 14px rgba(13,27,53,0.08);">
    <h2 style="color: #0d1b35; font-family: 'Frank Ruhl Libre', serif; margin-top: 0;">${process.env.STORE_NAME || 'פארך'}</h2>
    ${content}
    <hr style="border: none; border-top: 1px solid #e7e0d0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #8c867c;">מייל זה נשלח אוטומטית, אין להשיב אליו.</p>
  </div>
</body>
</html>`;
}

function formatCurrency(amount) {
  return `₪${Number(amount || 0).toFixed(2)}`;
}

function renderOrderConfirmationEmail(order) {
  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 0;">${item.name} × ${item.quantity}</td>
      <td style="padding: 8px 0; text-align: left;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>`
    )
    .join('');

  const invoiceLine = order.invoiceUrl
    ? `<p><a href="${order.invoiceUrl}" style="color: #8a6d1a;">להורדת החשבונית לחצו כאן</a></p>`
    : '';

  return emailLayout(`
    <p>תודה על ההזמנה! התשלום התקבל ואנחנו מתחילים להכין אותה.</p>
    <p><strong>מספר הזמנה:</strong> ${order._id}</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">${rows}</table>
    <p><strong>סכום כולל:</strong> ${formatCurrency(order.total)}</p>
    ${invoiceLine}
  `);
}

function renderShippingUpdateEmail(order) {
  return emailLayout(`
    <p>ההזמנה שלך נשלחה!</p>
    <p><strong>מספר הזמנה:</strong> ${order._id}</p>
    <p><strong>מספר מעקב:</strong> ${order.trackingNumber}</p>
  `);
}

export async function sendOrderConfirmationEmail(order) {
  await sendEmail({
    to: order.user?.email,
    subject: `אישור הזמנה #${order._id}`,
    html: renderOrderConfirmationEmail(order),
  });
}

export async function sendShippingUpdateEmail(order) {
  await sendEmail({
    to: order.user?.email,
    subject: `ההזמנה שלך נשלחה — #${order._id}`,
    html: renderShippingUpdateEmail(order),
  });
}
