import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { CreditCard } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { orderService, CreateOrderRequest } from '../../services/OrderService';
import { GHTKAddress } from '../../services/GHTKService';

interface VNPayOrderButtonProps {
  cartItems: any[];
  selectedDeliveryAddress: GHTKAddress | null;
  shippingFee: number;
  totalAmount: number;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  className?: string;
}

const VNPayOrderButton: React.FC<VNPayOrderButtonProps> = ({
  cartItems,
  selectedDeliveryAddress,
  shippingFee,
  totalAmount,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOrderAndPayment = async () => {
    if (disabled || isLoading || !selectedDeliveryAddress) return;

    setIsLoading(true);
    
    try {
      // Chuẩn bị dữ liệu đơn hàng
      console.log('🔍 Debug cartItems:', cartItems);
      const orderData: CreateOrderRequest = {
        items: cartItems.map(item => {
          const mappedItem = {
            id: item.item_id,
            name: item.name,
            price: item.final_price || item.unit_price,
            qty: item.qty,
            type: item.item_type || 'dish'
          };
          console.log('🔍 Mapped item:', mappedItem);
          return mappedItem;
        }),
        customerInfo: {
          name: selectedDeliveryAddress.recipientName || '',
          phone: selectedDeliveryAddress.phoneNumber || '',
          email: selectedDeliveryAddress.phoneNumber // Có thể thêm email field sau
        },
        deliveryAddress: selectedDeliveryAddress,
        shippingFee: shippingFee,
        totalAmount: totalAmount,
        paymentMethod: 'VNPAY',
        orderType: 'ONLINE' // Phân biệt order online vs tại quầy
      };

      console.log('🚀 Creating order with payment:', orderData);
      
      // Tạo đơn hàng và lấy payment URL
      const response = await orderService.createOrderWithPayment(orderData);
      
      if (response.success && response.paymentUrl) {
        console.log('✅ Order created, redirecting to payment:', response.paymentUrl);
        
        // Không lưu orderId vào localStorage - xử lý trực tiếp
        
        // Chuyển hướng đến VNPay
        window.location.href = response.paymentUrl;
        
        onSuccess?.(response);
      } else {
        throw new Error(response.message || 'Không thể tạo đơn hàng');
      }
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      toast.error(error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="success"
      size="lg"
      onClick={handleCreateOrderAndPayment}
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
          Đang tạo đơn hàng...
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

export default VNPayOrderButton;
