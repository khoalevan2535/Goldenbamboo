import React from 'react';

interface CheckoutData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  note: string;
  paymentMethod: "CASH" | "CARD" | "BANK_TRANSFER";
  branchId: number;
}

interface CheckoutFormClientProps {
  checkoutData: CheckoutData;
  onInputChange: (field: keyof CheckoutData, value: string | number) => void;
  className?: string;
  showAddressField?: boolean;
}

const CheckoutFormClient: React.FC<CheckoutFormClientProps> = ({
  checkoutData,
  onInputChange,
  className = '',
  showAddressField = true
}) => {
  return (
    <div className={`checkout-form-client ${className}`}>
      <div className="form-section">
        <h2>Thông Tin Khách Hàng</h2>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="customerName">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              id="customerName"
              type="text"
              value={checkoutData.customerName}
              onChange={(e) => onInputChange('customerName', e.target.value)}
              placeholder="Nhập họ tên đầy đủ..."
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              id="customerPhone"
              type="tel"
              value={checkoutData.customerPhone}
              onChange={(e) => onInputChange('customerPhone', e.target.value)}
              placeholder="Nhập số điện thoại..."
              required
              className="form-input"
            />
          </div>


          {showAddressField && (
            <div className="form-group full-width">
              <label htmlFor="customerAddress">
                Địa chỉ giao hàng <span className="required">*</span>
              </label>
              <input
                id="customerAddress"
                type="text"
                value={checkoutData.customerAddress}
                onChange={(e) => onInputChange('customerAddress', e.target.value)}
                placeholder="Nhập địa chỉ chi tiết..."
                required
                className="form-input"
              />
            </div>
          )}

          <div className="form-group full-width">
            <label htmlFor="note">
              Ghi chú
            </label>
            <textarea
              id="note"
              value={checkoutData.note}
              onChange={(e) => onInputChange('note', e.target.value)}
              placeholder="Ghi chú thêm về đơn hàng (tuỳ chọn)..."
              rows={3}
              className="form-textarea"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Phương Thức Thanh Toán</h2>

        <div className="payment-methods">
          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="CASH"
              checked={true}
              readOnly
            />
            <div className="payment-content">
              <span className="payment-icon">💵</span>
              <div className="payment-details">
                <span className="payment-title">Thanh toán khi nhận hàng (COD)</span>
                <span className="payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</span>
              </div>
            </div>
          </label>

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="CARD"
              disabled
            />
            <div className="payment-content">
              <span className="payment-icon">💳</span>
              <div className="payment-details">
                <span className="payment-title">Thanh toán bằng thẻ</span>
                <span className="payment-desc">Visa, Mastercard, JCB (Đang phát triển)</span>
              </div>
            </div>
          </label>

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="BANK_TRANSFER"
              disabled
            />
            <div className="payment-content">
              <span className="payment-icon">🏦</span>
              <div className="payment-details">
                <span className="payment-title">Chuyển khoản ngân hàng</span>
                <span className="payment-desc">Chuyển khoản qua ngân hàng (Đang phát triển)</span>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFormClient;
