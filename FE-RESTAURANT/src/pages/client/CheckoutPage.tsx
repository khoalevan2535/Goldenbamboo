import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { orderApi } from "../../services/orderApi";
import type { CreateOrderRequest } from "../../services/orderApi";
import GHTKAddressSelector from "../../components/delivery/GHTKAddressSelector";
import { GHTKAddress } from "../../services/GHTKService";

interface CheckoutData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  note: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER';
  deliveryType: 'delivery' | 'pickup';
  shippingFee: number;
  branchId: number;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState<string>("");
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<number>(30);
  const [selectedGHTKAddress, setSelectedGHTKAddress] = useState<GHTKAddress | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  
  // Mock data for testing - in real app, this would come from cart state
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    customerName: user?.fullName || "",
    customerPhone: user?.phone || "",
    customerEmail: user?.email || "",
    customerAddress: "",
    note: "",
    paymentMethod: 'CARD',
    deliveryType: 'delivery',
    shippingFee: 0,
    branchId: 1
  });

  const [orderItems] = useState([
    {
      item_type: 'dish',
      item_id: 1,
      quantity: 2,
      unit_price: 50000,
      total_price: 100000
    }
  ]);

  const [orderTotalAmount] = useState(100000);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      navigate("/login");
      return;
    }

    // Check if there are items to checkout
    if (orderItems.length === 0) {
      toast.error("Không có món ăn nào để thanh toán");
      navigate("/menu");
      return;
    }
  }, [user, navigate, orderItems.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleDeliveryAddressSelect = (address: GHTKAddress, fee?: number) => {
    setSelectedGHTKAddress(address);
    setShippingFee(fee || 0);
    setCheckoutData(prev => ({
      ...prev,
      customerAddress: `${address.address}, ${address.ward}, ${address.district}, ${address.province}`,
      shippingFee: fee || 0
    }));
  };

  const handleCheckout = async () => {
    if (!selectedGHTKAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (!checkoutData.customerName || !checkoutData.customerPhone) {
      toast.error("Vui lòng điền đầy đủ thông tin khách hàng");
      return;
    }

    setIsLoading(true);

    try {
      const orderData: CreateOrderRequest = {
        account_id: user?.accountId,
        branch_id: checkoutData.branchId,
        table_id: undefined,
        order_date: new Date().toISOString(),
        status: 'PENDING',
        payment_method: checkoutData.paymentMethod,
        prepay: 0,
        total_amount: orderTotalAmount + shippingFee,
        customer_name: checkoutData.customerName,
        customer_phone: checkoutData.customerPhone,
        customer_email: checkoutData.customerEmail,
        customer_address: checkoutData.customerAddress,
        description: `Đơn hàng giao hàng - ${orderItems.length} món`,
        note: checkoutData.note,
        order_items: orderItems
      };

      const response = await orderApi.createOrder(orderData);
      
      if (response.success) {
        setOrderCode(response.data.order_code);
        setOrderSuccess(true);
        toast.success("Đơn hàng đã được tạo thành công!");
      } else {
        throw new Error(response.message || "Không thể tạo đơn hàng");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMenu = () => {
    navigate("/menu");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  if (orderSuccess) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="text-center">
              <Card.Body>
                <div className="mb-4">
                  <i className="fas fa-check-circle text-success" style={{ fontSize: "4rem" }}></i>
                </div>
                <h2 className="text-success mb-3">Đặt hàng thành công!</h2>
                <p className="lead">Cảm ơn bạn đã đặt hàng tại Golden Bamboo Restaurant</p>
                <p><strong>Mã đơn hàng:</strong> {orderCode}</p>
                <p><strong>Thời gian giao hàng ước tính:</strong> {estimatedDeliveryTime} phút</p>
                <div className="mt-4">
                  <Button variant="primary" onClick={handleViewOrders} className="me-3">
                    Xem đơn hàng
                  </Button>
                  <Button variant="outline-primary" onClick={handleBackToMenu}>
                    Tiếp tục mua sắm
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Thông tin khách hàng</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Họ và tên *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={checkoutData.customerName}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, customerName: e.target.value }))}
                      required
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Số điện thoại *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={checkoutData.customerPhone}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      required
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={checkoutData.customerEmail}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label">Phương thức thanh toán</label>
                    <select
                      className="form-select"
                      value={checkoutData.paymentMethod}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    >
                      <option value="CARD">Thẻ</option>
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                    </select>
                  </div>
                </Col>
              </Row>
              <div className="mb-3">
                <label className="form-label">Ghi chú</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={checkoutData.note}
                  onChange={(e) => setCheckoutData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Ghi chú thêm cho đơn hàng..."
                />
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h4>Địa chỉ giao hàng</h4>
            </Card.Header>
            <Card.Body>
              <GHTKAddressSelector
                onAddressSelect={handleDeliveryAddressSelect}
                selectedAddress={selectedGHTKAddress}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h4>Tổng kết đơn hàng</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <span>{formatPrice(orderTotalAmount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Phí giao hàng:</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2">
                <strong>Tổng cộng:</strong>
                <strong>{formatPrice(orderTotalAmount + shippingFee)}</strong>
              </div>
              
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100"
                  onClick={handleCheckout}
                  disabled={isLoading || !selectedGHTKAddress}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận đặt hàng"
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
