import React, { useState, useEffect } from 'react';

interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note: string;
}

interface CheckoutFormModernProps {
  checkoutData: CheckoutFormData;
  onInputChange: (field: keyof CheckoutFormData, value: string) => void;
  className?: string;
  showAddressField?: boolean;
}

interface ValidationErrors {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

const CheckoutFormModern: React.FC<CheckoutFormModernProps> = ({
  checkoutData,
  onInputChange,
  className = '',
  showAddressField = true
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Họ tên không được để trống';
    if (name.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    if (name.trim().length > 50) return 'Họ tên không được quá 50 ký tự';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return 'Số điện thoại không được để trống';
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.trim())) return 'Số điện thoại phải có 10-11 chữ số';
    return undefined;
  };

  const validateAddress = (address: string): string | undefined => {
    if (!showAddressField) return undefined;
    if (!address.trim()) return 'Địa chỉ không được để trống';
    if (address.trim().length < 10) return 'Địa chỉ phải có ít nhất 10 ký tự';
    return undefined;
  };

  // Validate field
  const validateField = (field: keyof CheckoutFormData, value: string) => {
    let error: string | undefined;
    
    switch (field) {
      case 'customerName':
        error = validateName(value);
        break;
      case 'customerPhone':
        error = validatePhone(value);
        break;
      case 'customerAddress':
        error = validateAddress(value);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Handle input change
  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    onInputChange(field, value);
    
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // Handle blur
  const handleBlur = (field: keyof CheckoutFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, checkoutData[field]);
  };

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    newErrors.customerName = validateName(checkoutData.customerName);
    newErrors.customerPhone = validatePhone(checkoutData.customerPhone);
    if (showAddressField) {
      newErrors.customerAddress = validateAddress(checkoutData.customerAddress);
    }
    
    setErrors(newErrors);
    setTouched({
      customerName: true,
      customerPhone: true,
      customerAddress: true
    });
    
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // Expose validate function to parent
  useEffect(() => {
    // You can use a ref or callback to expose this function to parent
    // For now, we'll just validate on mount
    validateAll();
  }, []);

  return (
    <div className={`checkout-form-modern ${className}`}>
      <div className="form-grid">
        {/* Customer Name */}
        <div className="form-group">
          <label htmlFor="customerName" className="form-label">
            Họ và tên <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="customerName"
              value={checkoutData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              onBlur={() => handleBlur('customerName')}
              placeholder="Nhập họ và tên của bạn"
              className={`form-input ${errors.customerName ? 'error' : ''}`}
            />
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {errors.customerName && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {errors.customerName}
            </div>
          )}
        </div>

        {/* Customer Phone */}
        <div className="form-group">
          <label htmlFor="customerPhone" className="form-label">
            Số điện thoại <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="tel"
              id="customerPhone"
              value={checkoutData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              onBlur={() => handleBlur('customerPhone')}
              placeholder="Nhập số điện thoại"
              className={`form-input ${errors.customerPhone ? 'error' : ''}`}
            />
            <div className="input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {errors.customerPhone && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {errors.customerPhone}
            </div>
          )}
        </div>

        {/* Customer Address - Only show if showAddressField is true */}
        {showAddressField && (
          <div className="form-group full-width">
            <label htmlFor="customerAddress" className="form-label">
              Địa chỉ <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="customerAddress"
                value={checkoutData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                onBlur={() => handleBlur('customerAddress')}
                placeholder="Nhập địa chỉ chi tiết"
                className={`form-input ${errors.customerAddress ? 'error' : ''}`}
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            {errors.customerAddress && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {errors.customerAddress}
              </div>
            )}
          </div>
        )}

        {/* Note */}
        <div className="form-group full-width">
          <label htmlFor="note" className="form-label">
            Ghi chú đơn hàng
          </label>
          <div className="textarea-wrapper">
            <textarea
              id="note"
              value={checkoutData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              placeholder="Ghi chú cho đơn hàng (tùy chọn)"
              rows={3}
              className="form-textarea"
            />
            <div className="textarea-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFormModern;
