import { sendEmail } from './replitmail';

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: string; total: string }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  deliveryMethod: string;
  paymentMethod: string;
}

function formatPrice(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `£${num.toFixed(2)}`;
}

function getDeliveryLabel(method: string): string {
  if (method === 'nextday') return 'Next Day Delivery';
  if (method === 'collect') return 'Click & Collect';
  return 'Standard Delivery (3–5 business days)';
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  const addr = data.shippingAddress;
  const deliveryLabel = getDeliveryLabel(data.deliveryMethod);
  const shippingDisplay = parseFloat(data.shippingCost) === 0 ? 'FREE' : formatPrice(data.shippingCost);

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <strong>${item.name}</strong>
          <br><span style="color:#666;font-size:13px;">Qty: ${item.quantity} × ${formatPrice(item.price)}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">
          ${formatPrice(item.total)}
        </td>
      </tr>`
    )
    .join('');

  const itemsText = data.items
    .map((item) => `  • ${item.name} (x${item.quantity}) — ${formatPrice(item.total)}`)
    .join('\n');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#003DA5;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Yogichem</h1>
            <p style="margin:4px 0 0;color:#a0b8e0;font-size:13px;">Health & Beauty</p>
          </td>
        </tr>

        <!-- Success Banner -->
        <tr>
          <td style="background:#e8f5e9;padding:20px 32px;border-bottom:2px solid #4caf50;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;font-size:28px;">✅</td>
                <td>
                  <h2 style="margin:0;color:#2e7d32;font-size:18px;">Order Confirmed!</h2>
                  <p style="margin:2px 0 0;color:#388e3c;font-size:13px;">Thank you for shopping with Yogichem</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">

            <p style="margin:0 0 20px;color:#333;font-size:15px;">
              Hi <strong>${data.customerName}</strong>, your order has been placed and is now being processed.
            </p>

            <!-- Order Number -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;border-radius:6px;margin-bottom:24px;">
              <tr>
                <td style="padding:14px 18px;">
                  <span style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Order Number</span><br>
                  <strong style="color:#003DA5;font-size:20px;">${data.orderNumber}</strong>
                </td>
              </tr>
            </table>

            <!-- Items -->
            <h3 style="margin:0 0 12px;color:#1a1a1a;font-size:15px;">Items Ordered</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              ${itemsHtml}
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #e0e0e0;padding-top:14px;margin-bottom:24px;">
              <tr>
                <td style="padding:4px 0;color:#666;font-size:14px;">Subtotal</td>
                <td style="padding:4px 0;text-align:right;font-size:14px;">${formatPrice(data.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#666;font-size:14px;">Shipping</td>
                <td style="padding:4px 0;text-align:right;font-size:14px;">${shippingDisplay}</td>
              </tr>
              ${parseFloat(data.discount) > 0 ? `
              <tr>
                <td style="padding:4px 0;color:#388e3c;font-size:14px;">Discount</td>
                <td style="padding:4px 0;text-align:right;color:#388e3c;font-size:14px;">− ${formatPrice(data.discount)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:10px 0 4px;color:#1a1a1a;font-size:16px;font-weight:700;border-top:1px solid #e0e0e0;">Total</td>
                <td style="padding:10px 0 4px;text-align:right;color:#003DA5;font-size:18px;font-weight:700;border-top:1px solid #e0e0e0;">${formatPrice(data.total)}</td>
              </tr>
            </table>

            <!-- Delivery & Address -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td width="48%" valign="top" style="padding-right:12px;">
                  <h3 style="margin:0 0 8px;color:#1a1a1a;font-size:14px;">Delivery</h3>
                  <p style="margin:0;color:#555;font-size:13px;line-height:1.6;">
                    ${deliveryLabel}<br>
                    <span style="color:#666;">Payment: ${data.paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}</span>
                  </p>
                </td>
                <td width="4%"></td>
                <td width="48%" valign="top">
                  <h3 style="margin:0 0 8px;color:#1a1a1a;font-size:14px;">Deliver to</h3>
                  <p style="margin:0;color:#555;font-size:13px;line-height:1.6;">
                    ${addr.firstName} ${addr.lastName}<br>
                    ${addr.address1}<br>
                    ${addr.address2 ? addr.address2 + '<br>' : ''}
                    ${addr.city}, ${addr.postalCode}<br>
                    ${addr.country}
                  </p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <div style="text-align:center;margin:24px 0;">
              <a href="https://yogichem.com/account/orders" style="display:inline-block;background:#003DA5;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
                View Your Order
              </a>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f5;padding:20px 32px;border-top:1px solid #e0e0e0;text-align:center;">
            <p style="margin:0;color:#999;font-size:12px;">
              © 2024 Yogichem. All rights reserved.<br>
              If you have questions, contact us at <a href="mailto:help@yogichem.com" style="color:#003DA5;">help@yogichem.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `
Order Confirmed — ${data.orderNumber}

Hi ${data.customerName},

Thank you for your order! Here's a summary:

Order Number: ${data.orderNumber}

Items:
${itemsText}

Subtotal:   ${formatPrice(data.subtotal)}
Shipping:   ${shippingDisplay}
${parseFloat(data.discount) > 0 ? `Discount:   − ${formatPrice(data.discount)}\n` : ''}Total:      ${formatPrice(data.total)}

Delivery: ${deliveryLabel}
Payment:  ${data.paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}

Deliver to:
${addr.firstName} ${addr.lastName}
${addr.address1}
${addr.address2 ? addr.address2 + '\n' : ''}${addr.city}, ${addr.postalCode}
${addr.country}

View your order at: https://yogichem.com/account/orders

Thank you for shopping with Yogichem!
  `.trim();

  await sendEmail({
    subject: `Order Confirmed — ${data.orderNumber} | Yogichem`,
    html,
    text,
  });
}
