import React, { useState } from 'react';
import { Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaTag, FaCheck, FaTimes, FaGift } from 'react-icons/fa';
import { validateVoucher } from '../services/DiscountService';
import { toast } from 'react-toastify';

interface VoucherInputProps {
  onVoucherApplied: (voucher: any) => void;
  onVoucherRemoved: () => void;
  appliedVoucher?: any;
  disabled?: boolean;
}

const VoucherInput: React.FC<VoucherInputProps> = ({
  onVoucherApplied,
  onVoucherRemoved,
  appliedVoucher,
  disabled = false
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      setValidationError('Vui lòng nhập mã voucher');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await validateVoucher(voucherCode.trim());
      
      if (response.valid && response.voucher) {
        onVoucherApplied(response.voucher);
        setVoucherCode('');
        toast.success(
          <div>
            <div className="fw-bold mb-1">✅ Voucher hợp lệ!</div>
            <div className="small">Đã áp dụng voucher "{response.voucher.name}"</div>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      } else {
        setValidationError(response.message || 'Voucher không hợp lệ hoặc đã hết hạn');
        toast.error(
          <div>
            <div className="fw-bold mb-1">❌ Voucher không hợp lệ</div>
            <div className="small">{response.message || 'Voucher không hợp lệ hoặc đã hết hạn'}</div>
          </div>,
          {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi khi kiểm tra voucher';
      setValidationError(errorMessage);
      toast.error(
        <div>
          <div className="fw-bold mb-1">❌ Lỗi kiểm tra voucher</div>
          <div className="small">{errorMessage}</div>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = () => {
    onVoucherRemoved();
    setVoucherCode('');
    setValidationError(null);
    toast.info(
      <div>
        <div className="fw-bold mb-1">ℹ️ Đã gỡ voucher</div>
        <div className="small">Voucher đã được gỡ khỏi đơn hàng</div>
      </div>,
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValidateVoucher();
    }
  };

  return (
    <div className="mb-3">
      <h6 className="mb-2">
        <FaTag className="me-2" />
        Mã voucher
      </h6>
      
      {appliedVoucher ? (
        <Alert variant="success" className="mb-2">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <FaCheck className="me-2" />
              <strong>Voucher đã áp dụng:</strong> {appliedVoucher.name}
              <div className="small mt-1">
                <Badge bg="primary" className="me-2">{appliedVoucher.code}</Badge>
                <span className="text-muted">
                  Giảm giá: {appliedVoucher.newPrice?.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleRemoveVoucher}
              disabled={disabled}
            >
              <FaTimes />
            </Button>
          </div>
        </Alert>
      ) : (
        <div>
          <div className="input-group mb-2">
            <Form.Control
              type="text"
              placeholder="Nhập mã voucher..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled || isValidating}
              className={validationError ? 'is-invalid' : ''}
            />
            <Button
              variant="outline-primary"
              onClick={handleValidateVoucher}
              disabled={disabled || isValidating || !voucherCode.trim()}
            >
              {isValidating ? (
                <Spinner size="sm" />
              ) : (
                <FaGift />
              )}
            </Button>
          </div>
          
          {validationError && (
            <Alert variant="danger" className="mb-2">
              <FaTimes className="me-2" />
              {validationError}
            </Alert>
          )}
          
          <div className="small text-muted">
            <FaGift className="me-1" />
            Nhập mã voucher để được giảm giá đặc biệt
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherInput;
