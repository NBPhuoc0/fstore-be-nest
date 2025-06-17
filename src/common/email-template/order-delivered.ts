function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function plus5date(date: string) {
  const res = new Date(date);
  res.setDate(res.getDate() + 5);
  return res.toISOString();
}

export function orderDeliveredTemplate(order: any) {
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
    <title>Đơn hàng #${order.id} đã được gửi đi</title>
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
                        <td style="background-color: #10b981; padding: 30px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                🚚 Đơn hàng đã được gửi đi!
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">
                                Chào ${order.name}, đơn hàng của bạn đang trên đường giao đến
                            </p>
                        </td>
                    </tr>

                    <!-- Shipping Status -->
                    <tr>
                        <td style="padding: 30px 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <div style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                                                ✅ ĐÃ GIAO CHO VẬN CHUYỂN
                                            </div>
                                        </div>
                                        
                                        <h2 style="margin: 0 0 15px 0; color: #065f46; font-size: 20px; text-align: center;">
                                            Mã vận đơn: ${order.shippingRef}
                                        </h2>
                                        
                                        <p style="margin: 0 0 20px 0; color: #374151; line-height: 1.6; text-align: center;">
                                            Đơn hàng của bạn đã được giao cho đơn vị vận chuyển GHN và đang trên đường giao đến địa chỉ của bạn.
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="text-align: center; padding: 10px 0;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                                        <tr>
                                                            <td style="background-color: #2563eb; border-radius: 6px; padding: 0;">
                                                                <a href="${'https://tracking.ghn.dev/?order_code=' + order.shippingRef}" style="display: inline-block; padding: 15px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                                                    🔍 Theo dõi đơn hàng
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
<!-- Shipping Info -->
                    <tr>
                        <td style="padding: 0 20px 30px 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td width="50%" style="vertical-align: top; padding-right: 15px;">
                                        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">📦 Thông tin vận chuyển</h3>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Đơn vị vận chuyển:</strong> Giao Hàng Nhanh
                                        </p>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Mã vận đơn:</strong> ${order.shippingRef}
                                        </p>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Ngày gửi:</strong> ${order.createdAt}
                                        </p>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Dự kiến giao:</strong> ${plus5date(order.createdAt)}
                                        </p>
                                    </td>
                                    <td width="50%" style="vertical-align: top; padding-left: 15px;">
                                        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">🏠 Địa chỉ giao hàng</h3>
                                        <p style="margin: 5px 0; color: #6b7280; line-height: 1.6;">
                                            <strong style="color: #374151;">Người nhận:</strong> ${order.name}
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
                    <!-- Order Summary -->
                    <tr>
                        <td style="padding: 0 20px 30px 20px;">
                            <h3 style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">📋 Tóm tắt đơn hàng #${order.id}</h3>
                            
                            <!-- Order Items -->
                            ${orderItemsHtml}
                            
                            <!-- Total -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px; background-color: #f9fafb; border-radius: 8px; padding: 15px;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Tạm tính:</td>
                                    <td style="padding: 8px 0; text-align: right; color: #374151; font-weight: bold;">${formatCurrency(order.subTotal)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Phí vận chuyển:</td>
                                    <td style="padding: 8px 0; text-align: right; color: #374151; font-weight: bold;">${formatCurrency(order.shippingFee)}</td>
                                </tr>
                                <tr>
                                    <td style="color: #1f2937; font-size: 16px;">Tổng giá trị đơn hàng:</td>
                                    <td style="text-align: right; color: #1f2937; font-size: 18px; font-weight: bold;">${formatCurrency(order.total)}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Important Notes -->
                    <tr>
                        <td style="padding: 0 20px 30px 20px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px;">⚠️ Lưu ý quan trọng</h3>
                                        <ul style="margin: 0; padding-left: 20px; color: #92400e; line-height: 1.6;">
                                            <li style="margin-bottom: 8px;">Vui lòng chuẩn bị sẵn sàng nhận hàng trong khung giờ dự kiến</li>
                                            <li style="margin-bottom: 8px;">Kiểm tra kỹ hàng hóa trước khi ký nhận</li>
                                            <li style="margin-bottom: 8px;">Liên hệ ngay với chúng tôi nếu có bất kỳ vấn đề gì</li>
                                            <li>Giữ lại mã vận đơn để tra cứu khi cần thiết</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #374151; padding: 30px 20px; text-align: center;">
                            <div style="margin-bottom: 20px; color: #ffffff;">
                                <span style="font-size: 18px;">📞</span>
                                <span style="margin-left: 10px; font-size: 16px;">Cần hỗ trợ? Liên hệ ngay với chúng tôi!</span>
                            </div>
                            <p style="margin: 10px 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                                <strong>Hotline:</strong> 1900-xxxx (8:00 - 22:00) <br>
                                <strong>Email:</strong> support@store.com
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
