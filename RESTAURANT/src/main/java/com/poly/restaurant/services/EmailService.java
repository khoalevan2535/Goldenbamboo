package com.poly.restaurant.services;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public void sendVerificationCode(String to, String code) throws MessagingException {
        logger.info("Attempting to send verification email to: {}", to);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Xác Thực Tài Khoản - Nhà Hàng GoldenBamboo");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                    "<h3>Kính gửi Quý khách,</h3>" +
                    "<p>Cảm ơn Quý khách đã lựa chọn dịch vụ của Nhà hàng GoldenBamboo. Chúng tôi rất vinh hạnh được phục vụ Quý khách.</p>"
                    +
                    "<p>Để hoàn tất quá trình đăng ký tài khoản, Quý khách vui lòng sử dụng mã xác thực OTP sau đây:</p>"
                    +
                    "<p style='font-size: 24px; font-weight: bold; color: #28a745;'>" + code + "</p>" +
                    "<p>Mã OTP này có hiệu lực trong vòng 10 phút kể từ thời điểm gửi. Vui lòng nhập mã vào hệ thống để xác thực tài khoản của Quý khách.</p>"
                    +
                    "<p>Nếu Quý khách không thực hiện yêu cầu này, xin vui lòng bỏ qua email này.</p>" +
                    "<p>Chúng tôi luôn sẵn sàng mang đến cho Quý khách những trải nghiệm ẩm thực tuyệt vời nhất. Trân trọng cảm ơn Quý khách đã tin tưởng và ủng hộ Nhà hàng Poly.</p>"
                    +
                    "<p>Trân trọng,<br>Đội ngũ Nhà hàng GoldenBamboo</p>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true); // true indicates HTML content

            logger.info("Sending email to: {}", to);
            mailSender.send(mimeMessage);
            logger.info("Email sent successfully to: {}", to);

        } catch (Exception e) {
            logger.error("Failed to send email to: {}, error: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    public void sendStaffActivationEmail(String to, String staffName, String activationToken)
            throws MessagingException {
        logger.info("Attempting to send staff activation email to: {}", to);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Kích Hoạt Tài Khoản Nhân Viên - Nhà Hàng GoldenBamboo");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                    "<h3>Xin chào " + staffName + ",</h3>" +
                    "<p>Chào mừng bạn đến với đội ngũ Nhà hàng GoldenBamboo!</p>" +
                    "<p>Tài khoản nhân viên của bạn đã được tạo thành công. Để kích hoạt tài khoản và đặt mật khẩu, vui lòng click vào nút bên dưới:</p>"
                    +
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='http://localhost:5173/activate-account?token=" + activationToken
                    + "' style='display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.3s ease;'>🚀 Kích Hoạt Tài Khoản</a>"
                    +
                    "</div>" +
                    "<p style='text-align: center; color: #666; font-size: 14px;'>" +
                    "Nút kích hoạt sẽ đưa bạn đến trang đặt mật khẩu cho tài khoản" +
                    "</p>" +
                    "<p><strong>Lưu ý quan trọng:</strong></p>" +
                    "<ul>" +
                    "<li>Token kích hoạt có hiệu lực trong vòng 7 ngày kể từ thời điểm gửi</li>" +
                    "<li>Bạn sẽ được yêu cầu đặt mật khẩu mới khi kích hoạt tài khoản</li>" +
                    "<li>Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ quản lý</li>" +
                    "</ul>" +
                    "<p>Chúng tôi rất vui được chào đón bạn vào đội ngũ của chúng tôi!</p>" +
                    "<p>Trân trọng,<br>Đội ngũ Quản lý Nhà hàng GoldenBamboo</p>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true); // true indicates HTML content

            logger.info("Sending staff activation email to: {}", to);
            mailSender.send(mimeMessage);
            logger.info("Staff activation email sent successfully to: {}", to);

        } catch (Exception e) {
            logger.error("Failed to send staff activation email to: {}, error: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Gửi email xác nhận đặt hàng thành công
     */
    public void sendOrderConfirmationEmail(String to, String customerName, Long orderId,
            String orderDate, String totalAmount, String address) throws MessagingException {
        logger.info("Attempting to send order confirmation email to: {}", to);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom("goldenbamboo.res@gmail.com");
            helper.setSubject("Order Confirmation - GoldenBamboo Restaurant");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;'>"
                    +
                    "<div style='background: linear-gradient(135deg, #28a745, #20c997); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;'>"
                    +
                    "<h1 style='margin: 0; font-size: 28px;'>🎉 Đặt Hàng Thành Công!</h1>" +
                    "<p style='margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;'>Cảm ơn bạn đã lựa chọn GoldenBamboo</p>"
                    +
                    "</div>" +

                    "<div style='padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;'>" +
                    "<h3 style='color: #28a745; margin-top: 0;'>Xin chào "
                    + (customerName != null ? customerName : "Quý khách") + ",</h3>" +

                    "<p>Chúng tôi rất vui mừng thông báo rằng đơn hàng của bạn đã được tiếp nhận thành công!</p>" +

                    "<div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>"
                    +
                    "<h4 style='color: #333; margin-top: 0; border-bottom: 2px solid #28a745; padding-bottom: 10px;'>📋 Thông Tin Đơn Hàng</h4>"
                    +
                    "<table style='width: 100%; border-collapse: collapse;'>" +
                    "<tr><td style='padding: 8px 0; font-weight: bold; color: #666;'>Mã đơn hàng:</td><td style='padding: 8px 0; color: #28a745; font-weight: bold;'>#"
                    + orderId + "</td></tr>" +
                    "<tr><td style='padding: 8px 0; font-weight: bold; color: #666;'>Ngày đặt:</td><td style='padding: 8px 0;'>"
                    + orderDate + "</td></tr>" +
                    "<tr><td style='padding: 8px 0; font-weight: bold; color: #666;'>Tổng tiền:</td><td style='padding: 8px 0; color: #e74c3c; font-weight: bold; font-size: 18px;'>"
                    + totalAmount + " VNĐ</td></tr>" +
                    "<tr><td style='padding: 8px 0; font-weight: bold; color: #666;'>Địa chỉ giao hàng:</td><td style='padding: 8px 0;'>"
                    + (address != null ? address : "Tại nhà hàng") + "</td></tr>" +
                    "</table>" +
                    "</div>" +

                    "<div style='background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;'>"
                    +
                    "<h4 style='color: #28a745; margin-top: 0;'>⏰ Thời Gian Giao Hàng</h4>" +
                    "<p style='margin: 0;'>Đơn hàng của bạn sẽ được chuẩn bị và giao trong vòng <strong>30-45 phút</strong>. Chúng tôi sẽ liên hệ với bạn qua số điện thoại đã cung cấp khi đơn hàng sẵn sàng.</p>"
                    +
                    "</div>" +

                    "<div style='background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>"
                    +
                    "<h4 style='color: #856404; margin-top: 0;'>💡 Lưu Ý Quan Trọng</h4>" +
                    "<ul style='margin: 0; padding-left: 20px;'>" +
                    "<li>Vui lòng giữ điện thoại luôn mở để chúng tôi có thể liên hệ</li>" +
                    "<li>Nếu có thay đổi về đơn hàng, vui lòng gọi hotline: <strong>1900-xxxx</strong></li>" +
                    "<li>Chúng tôi chấp nhận thanh toán khi nhận hàng (COD)</li>" +
                    "</ul>" +
                    "</div>" +

                    "<p>Chúng tôi cam kết mang đến cho bạn những món ăn ngon nhất với chất lượng phục vụ tuyệt vời!</p>"
                    +

                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<p style='color: #666; font-size: 14px;'>Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi!</p>"
                    +
                    "</div>" +

                    "<p>Trân trọng,<br><strong>Đội ngũ Nhà hàng GoldenBamboo</strong></p>" +
                    "<p style='color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;'>"
                    +
                    "Email này được gửi tự động từ hệ thống đặt hàng GoldenBamboo. Vui lòng không trả lời email này." +
                    "</p>" +
                    "</div>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true); // true indicates HTML content

            logger.info("Sending order confirmation email to: {}", to);
            mailSender.send(mimeMessage);
            logger.info("Order confirmation email sent successfully to: {}", to);

        } catch (Exception e) {
            logger.error("Failed to send order confirmation email to: {}, error: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Gửi email xác nhận đặt hàng đơn giản (tránh lỗi encoding)
     */
    public void sendSimpleOrderConfirmationEmail(String to, String customerName, Long orderId,
            String orderDate, String totalAmount, String address) throws MessagingException {
        logger.info("Attempting to send simple order confirmation email to: {}", to);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom("goldenbamboo.res@gmail.com");
            helper.setSubject("Order Confirmation - GoldenBamboo Restaurant");

            // Đơn giản hóa HTML content để tránh lỗi encoding
            String htmlContent = "<html><head><meta charset='UTF-8'></head><body>" +
                    "<h2>Order Confirmation - GoldenBamboo Restaurant</h2>" +
                    "<p>Dear " + (customerName != null ? customerName : "Customer") + ",</p>" +
                    "<p>Your order has been successfully received!</p>" +
                    "<h3>Order Information:</h3>" +
                    "<ul>" +
                    "<li><strong>Order ID:</strong> #" + orderId + "</li>" +
                    "<li><strong>Order Date:</strong> " + orderDate + "</li>" +
                    "<li><strong>Total Amount:</strong> " + totalAmount + " VND</li>" +
                    "<li><strong>Delivery Address:</strong> " + (address != null ? address : "At restaurant") + "</li>"
                    +
                    "</ul>" +
                    "<h3>Delivery Time:</h3>" +
                    "<p>Your order will be prepared and delivered within 30-45 minutes.</p>" +
                    "<h3>Important Notes:</h3>" +
                    "<ul>" +
                    "<li>Please keep your phone available for contact</li>" +
                    "<li>If you need to change your order, please call hotline: 1900-xxxx</li>" +
                    "<li>We accept cash on delivery (COD)</li>" +
                    "</ul>" +
                    "<p>We are committed to bringing you the best food with excellent service quality!</p>" +
                    "<p>Best regards,<br><strong>GoldenBamboo Restaurant Team</strong></p>" +
                    "<p><small>This email is automatically sent from GoldenBamboo ordering system. Please do not reply to this email.</small></p>"
                    +
                    "</body></html>";

            helper.setText(htmlContent, true); // true indicates HTML content

            logger.info("Sending simple order confirmation email to: {}", to);
            mailSender.send(mimeMessage);
            logger.info("Simple order confirmation email sent successfully to: {}", to);

        } catch (Exception e) {
            logger.error("Failed to send simple order confirmation email to: {}, error: {}", to, e.getMessage(), e);
            throw e;
        }
    }
}