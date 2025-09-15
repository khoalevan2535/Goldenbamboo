import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaClock, FaEnvelope } from 'react-icons/fa';
import '../../style/client/ContractClient.scss';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', subject: '', message: '' });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', subject: '', message: '' };

    // Kiểm tra tên
    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên';
      isValid = false;
    } else if (name.length < 2) {
      newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';
      isValid = false;
    }

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Kiểm tra chủ đề
    if (!subject.trim()) {
      newErrors.subject = 'Vui lòng nhập chủ đề';
      isValid = false;
    } else if (subject.length < 3) {
      newErrors.subject = 'Chủ đề phải có ít nhất 3 ký tự';
      isValid = false;
    }

    // Kiểm tra tin nhắn
    if (!message.trim()) {
      newErrors.message = 'Vui lòng nhập tin nhắn';
      isValid = false;
    } else if (message.length < 10) {
      newErrors.message = 'Tin nhắn phải có ít nhất 10 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ với bạn sớm.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setErrors({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="header">
          <h1>Liên Hệ Với Chúng Tôi</h1>
          <p>
            Chúng tôi rất mong nhận được ý kiến từ bạn. Dù bạn có câu hỏi về thực đơn,
            muốn đặt bàn hay quan tâm đến các sự kiện riêng, chúng tôi luôn sẵn sàng hỗ trợ.
          </p>
        </div>
        <div className="content">
          <div className="form-container">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Họ và Tên</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {errors.name && <p className="error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="subject">Chủ Đề</label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                {errors.subject && <p className="error">{errors.subject}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="message">Tin Nhắn</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  required
                ></textarea>
                {errors.message && <p className="error">{errors.message}</p>}
              </div>
              <button type="submit">Gửi Tin Nhắn</button>
            </form>
          </div>
          <div className="info-container">
            <div className="info-card">
              <h2>Thông Tin</h2>
              <ul>
                <li>
                  <FaMapMarkerAlt className="icon" />
                  <div>
                    <h3>Địa Chỉ</h3>
                    <p>
                    Khu đô thị du lịch Marine Plaza 32C Khu BTLK Phường Bãi Cháy, gần Citadine Hotel, 
                      <br />
                      Tp. Hạ Long, Quảng Ninh 02033
                    </p>
                  </div>
                </li>
                <li>
                  <FaPhone className="icon" />
                  <div>
                    <h3>Điện Thoại</h3>
                    <p>
                      <a href="tel:+12125551234">(212) 555-1234</a>
                    </p>
                  </div>
                </li>
                <li>
                  <FaEnvelope className="icon" />
                  <div>
                    <h3>Email</h3>
                    <p>
                      <a href="mailto:info@nhahangviet.com">info@nhahangviet.com</a>
                    </p>
                  </div>
                </li>
                <li>
                  <FaClock className="icon" />
                  <div>
                    <h3>Giờ Mở Cửa</h3>
                    <p>
                      Thứ Hai - Thứ Sáu: 11:00 Sáng - 10:00 Tối
                      <br />
                      Thứ Bảy - Chủ Nhật: 10:00 Sáng - 11:00 Tối
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3541.623960386587!2d107.0141945!3d20.9532192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a598729b5789f%3A0xc72ef3aecb57613d!2sGolden%20Bamboo%20H%E1%BA%A1%20Long%20Restaurant!5e1!3m2!1svi!2s!4v1752464575719!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;