import { createInvoiceForOrder } from './greenInvoiceService.js';
import { sendOrderConfirmationEmail, sendShippingUpdateEmail } from './emailService.js';

// Invoice/email failures are logged but never thrown — a flaky invoicing API or
// SMTP outage must not block an order status update from saving.
export async function handleOrderPaid(order) {
  try {
    const invoice = await createInvoiceForOrder(order);
    if (invoice) {
      order.invoiceNumber = invoice.invoiceNumber;
      order.invoiceUrl = invoice.invoiceUrl;
      await order.save();
    }
  } catch (err) {
    console.error(`[orderFulfillment] Invoice creation failed for order ${order._id}:`, err.message);
  }

  try {
    await sendOrderConfirmationEmail(order);
  } catch (err) {
    console.error(`[orderFulfillment] Order confirmation email failed for order ${order._id}:`, err.message);
  }
}

export async function handleOrderShipped(order) {
  try {
    await sendShippingUpdateEmail(order);
  } catch (err) {
    console.error(`[orderFulfillment] Shipping update email failed for order ${order._id}:`, err.message);
  }
}
