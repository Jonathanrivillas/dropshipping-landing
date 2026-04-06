import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">${formatCOP(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <!-- Header -->
    <div style="background:#0f172a;padding:32px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">Sojo Trendy</h1>
      <p style="margin:8px 0 0;color:#94a3b8;font-size:14px">¡Tu pedido fue confirmado!</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <p style="margin:0 0 16px;color:#374151;font-size:16px">
        Hola <strong>${data.customerName}</strong>,
      </p>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
        Tu pago fue procesado correctamente y tu pedido ya está en preparación. 
        Te avisaremos cuando sea enviado.
      </p>

      <!-- Order number -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center">
        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Número de pedido</p>
        <p style="margin:0;color:#0f172a;font-size:20px;font-weight:700;letter-spacing:.05em">${data.orderNumber}</p>
      </div>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead>
          <tr>
            <th style="text-align:left;font-size:12px;color:#6b7280;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Producto</th>
            <th style="text-align:center;font-size:12px;color:#6b7280;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Cant.</th>
            <th style="text-align:right;font-size:12px;color:#6b7280;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Subtotal</th>
          </tr>
        </thead>
        <tbody style="font-size:14px;color:#374151">
          ${itemsRows}
        </tbody>
      </table>

      <!-- Total -->
      <div style="text-align:right;margin-bottom:32px">
        <span style="font-size:16px;font-weight:700;color:#0f172a">Total: ${formatCOP(data.total)}</span>
      </div>

      <!-- CTA -->
      <div style="text-align:center">
        <a href="${process.env.FRONTEND_URL}/confirmacion/${data.orderNumber}"
           style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">
          Ver mi pedido
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center">
      <p style="margin:0;color:#9ca3af;font-size:12px">
        © ${new Date().getFullYear()} Sojo Trendy · Colombia
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY no configurado — email omitido')
    return
  }

  const fromEmail = process.env.EMAIL_FROM || 'pedidos@sojotrendy.com'

  try {
    const resend = getResend()!
    await resend.emails.send({
      from: `Sojo Trendy <${fromEmail}>`,
      to: data.customerEmail,
      subject: `¡Pedido confirmado! ${data.orderNumber} — Sojo Trendy`,
      html: buildOrderConfirmationHtml(data),
    })
    console.log(`[Email] Confirmación enviada a ${data.customerEmail} (${data.orderNumber})`)
  } catch (err) {
    // No bloqueamos el flujo si el email falla
    console.error('[Email] Error al enviar confirmación:', err)
  }
}
