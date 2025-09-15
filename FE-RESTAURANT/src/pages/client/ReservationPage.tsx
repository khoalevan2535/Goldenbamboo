import React, { useState } from "react";
import "../../style/client/ReservationPage.scss";

const ReservationsPage = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !guests || !name || !email || !phone) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    alert("Đặt bàn thành công! Chúng tôi sẽ liên hệ với bạn sớm để xác nhận.");
    setDate("");
    setTime("");
    setGuests("2");
    setName("");
    setEmail("");
    setPhone("");
    setSpecialRequests("");
  };

  return (
    <div className="reservations-page">
      <div className="container">
        <div className="header">
          <h1 className="font-serif">Đặt Bàn</h1>
          <p>
            Tham gia cùng chúng tôi để có một trải nghiệm ẩm thực khó quên. Đặt bàn ngay hôm nay và thưởng thức ẩm thực Việt Nam đích thực trong một bầu không khí ấm cúng, thân thiện.
          </p>
        </div>
        <div className="content">
          <div className="form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="date">Ngày</label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Giờ</label>
                  <input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="guests">Số Khách</label>
                <select
                  id="guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                  <option value="9+">9+</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="name">Họ Tên</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Số Điện Thoại</label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="special-requests">Yêu Cầu Đặc Biệt</label>
                <textarea
                  id="special-requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                  placeholder="Có yêu cầu về dị ứng thực phẩm hoặc dịp đặc biệt không?"
                ></textarea>
              </div>
              <button type="submit">Đặt Bàn Ngay</button>
            </form>
          </div>
          <div className="info-section">
            <div className="reservation-info">
              <h2 className="font-serif">Thông Tin Đặt Bàn</h2>
              <ul>
                <li>
                  <div className="circle">
                    <span>1</span>
                  </div>
                  <div className="info-text">
                    <h3>Chọn Ngày & Giờ</h3>
                    <p>Chúng tôi mở cửa hàng ngày từ 11:00 sáng đến 10:00 tối.</p>
                  </div>
                </li>
                <li>
                  <div className="circle">
                    <span>2</span>
                  </div>
                  <div className="info-text">
                    <h3>Cung Cấp Thông Tin</h3>
                    <p>Chúng tôi sẽ gửi email và SMS xác nhận cho bạn.</p>
                  </div>
                </li>
                <li>
                  <div className="circle">
                    <span>3</span>
                  </div>
                  <div className="info-text">
                    <h3>Xác Nhận</h3>
                    <p>Chúng tôi sẽ xác nhận đặt bàn trong vòng 30 phút.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="private-events">
              <h2 className="font-serif">Sự Kiện Riêng</h2>
              <p>
                Bạn đang lên kế hoạch cho một buổi tiệc đặc biệt hay sự kiện công ty? Chúng tôi cung cấp các lựa chọn ăn uống riêng tư cho các nhóm lớn nhỏ.
              </p>
              <ul>
                <li>
                  <div className="bullet"></div>
                  <span>Tiệc sinh nhật</span>
                </li>
                <li>
                  <div className="bullet"></div>
                  <span>Sự kiện công ty</span>
                </li>
                <li>
                  <div className="bullet"></div>
                  <span>Tiệc cưới</span>
                </li>
                <li>
                  <div className="bullet"></div>
                  <span>Tụ họp gia đình</span>
                </li>
              </ul>
              <button>Tìm Hiểu Thêm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPage;