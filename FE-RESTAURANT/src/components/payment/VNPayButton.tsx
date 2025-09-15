import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { CreditCard } from 'react-bootstrap-icons';
import { VNPayService } from '../../services/VNPayService';

interface VNPayButtonProps {
  amount: number;
  orderInfo: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  className?: string;
}

const VNPayButton: React.FC<VNPayButtonProps> = ({
  amount,
  orderInfo,
  customerName,
  customerPhone,
  customerEmail,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleVNPayPayment = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    try {
      // Gọi API tạo payment URL từ VNPay
      const data = await VNPayService.createPaymentUrl({
        amount: amount,
        orderInfo: orderInfo,
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      });
      
      
      console.log('VNPay API response:', data); // Debug log
      console.log('Data type:', typeof data);
      console.log('Data success:', data?.success);
      console.log('Data paymentUrl:', data?.paymentUrl);
      
      if (data && data.success && data.paymentUrl) {
        console.log('Redirecting to VNPay:', data.paymentUrl);
        // Chuyển hướng đến VNPay
        window.location.href = data.paymentUrl;
      } else {
        const errorMessage = data?.message || 'Không thể tạo URL thanh toán';
        console.error('VNPay API error:', errorMessage, data);
        
        // Show user-friendly error message
        if (errorMessage.includes('kết nối') || errorMessage.includes('API')) {
          throw new Error('Không thể kết nối đến hệ thống thanh toán. Vui lòng thử lại sau.');
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('VNPay payment error:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="success"
      size="lg"
      onClick={handleVNPayPayment}
      disabled={disabled || isLoading}
      className={`d-flex align-items-center justify-content-center ${className}`}
      style={{
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        minHeight: '48px'
      }}
    >
      {isLoading ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          Đang xử lý...
        </>
      ) : (
        <>
          <CreditCard className="me-2" />
          Thanh toán VNPay
        </>
      )}
    </Button>
  );
};

export default VNPayButton;
