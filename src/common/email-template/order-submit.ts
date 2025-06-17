function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
export function orderSubmitTemplate(order: any) {
  const orderItemsHtml = order.orderItems
    .map(
      (item) => `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                <tr>
                    <td width="100" style="vertical-align: top; padding-right: 15px;">
                        <img src="${item.product.photos[0]?.url || '/placeholder.svg?height=80&width=80'}" alt="${item.product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; display: block;">
                    </td>
                    <td style="vertical-align: top;">
                        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 16px; font-weight: bold;">${item.product.name}</h4>
                        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Mã sản phẩm: ${item.product.code}</p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                                <td style="color: #6b7280;">Số lượng: ${item.quantity}</td>
                                <td style="text-align: right; color: #374151; font-weight: bold; font-size: 16px;">${formatCurrency(Number.parseInt(item.product.originalPrice.toString()))}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        `,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đơn hàng #${order.id}</title>
    <style>
        /* Reset styles for email clients */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #2563eb; padding: 30px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                ✅ Đặt hàng thành công!
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
                                Cảm ơn ${order.name} đã đặt hàng tại cửa hàng của chúng tôi
                            </p>
                        </td>
                    </tr>

                    <!-- Order Status -->
                    <tr>
                        <td style="padding: 30px 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background-color: ${order.status === 'PENDING' ? '#fef3c7' : '#d1fae5'}; border: 2px solid ${order.status === 'PENDING' ? '#f59e0b' : '#10b981'}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                                        <h2 style="margin: 0 0 15px 0; color: ${order.status === 'PENDING' ? '#92400e' : '#065f46'}; font-size: 18px;">
                                            ${order.status === 'PENDING' ? '💳 Chờ thanh toán' : '📦 Đang chuẩn bị hàng'}
                                        </h2>
                                        
                                        ${
                                          order.status === 'PENDING'
                                            ? `
                                        <p style="margin: 0 0 20px 0; color: #374151; line-height: 1.6;">
                                            Đơn hàng của bạn đã được tạo thành công. Vui lòng thanh toán trong vòng 24h để hoàn tất đơn hàng.
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="background-color: #2563eb; border-radius: 6px;">
                                                    <a href="${order.paymentRef}" style="display: inline-block; padding: 15px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                                        Thanh toán ngay
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        `
                                            : `
                                        <p style="margin: 0; color: #374151; line-height: 1.6;">
                                            Đơn hàng của bạn đang được chuẩn bị. Chúng tôi sẽ thông báo khi hàng được giao cho đơn vị vận chuyển.
                                        </p>
                                        `
                                        }
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Info -->
                    <tr>
                        <td style="padding: 0 20px 30px 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td width="50%" style="vertical-align: top; padding-right: 15px;">
                                        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Thông tin đơn hàng</h3>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Mã đơn hàng:</strong> #${order.id}
                                        </p>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Ngày đặt:</strong> ${order.createdAt}
                                        </p>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Phương thức thanh toán:</strong> ${order.paymentMethod}
                                        </p>
                                    </td>
                                    <td width="50%" style="vertical-align: top; padding-left: 15px;">
                                        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Thông tin giao hàng</h3>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Tên:</strong> ${order.name}
                                        </p>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">SĐT:</strong> ${order.phone}
                                        </p>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Địa chỉ:</strong> ${order.address}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Items -->
                    <tr>
                        <td style="padding: 0 20px 30px 20px;">
                            <h3 style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Chi tiết đơn hàng</h3>
                            
                            <!-- Order Items will be inserted here -->
                            ${orderItemsHtml}
                            
                            <!-- Order Summary -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 30px; background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280;">Tạm tính:</td>
                                                <td style="padding: 8px 0; text-align: right; color: #374151; font-weight: bold;">${formatCurrency(order.subTotal)}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280;">Phí vận chuyển:</td>
                                                <td style="padding: 8px 0; text-align: right; color: #374151; font-weight: bold;">${formatCurrency(order.shippingFee)}</td>
                                            </tr>
                                            ${
                                              order.discount > 0
                                                ? `
                                            <tr>
                                                <td style="padding: 8px 0; color: #dc2626;">Giảm giá:</td>
                                                <td style="padding: 8px 0; text-align: right; color: #dc2626; font-weight: bold;">-${formatCurrency(order.discount)}</td>
                                            </tr>
                                            `
                                                : ''
                                            }
                                            <tr>
                                                <td colspan="2" style="padding: 15px 0 8px 0; border-top: 2px solid #d1d5db;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Tổng cộng:</td>
                                                <td style="padding: 8px 0; text-align: right; color: #1f2937; font-size: 20px; font-weight: bold;">${formatCurrency(order.total)}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #374151; padding: 30px 20px; text-align: center;">
                            <div style="margin-bottom: 20px; color: #ffffff;">
                                <span style="font-size: 18px;">🚚</span>
                                <span style="margin-left: 10px; font-size: 16px;">Dự kiến giao hàng trong 2-3 ngày làm việc</span>
                            </div>
                            <p style="margin: 10px 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                                Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
                            </p>
                            <p style="margin: 10px 0; color: #d1d5db; font-size: 14px;">
                                <strong>Email:</strong> support@store.com | <strong>Hotline:</strong> 1900-xxxx
                            </p>
                            <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
                                © 2025 Cửa hàng thời trang. Tất cả quyền được bảo lưu.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

`;
}
