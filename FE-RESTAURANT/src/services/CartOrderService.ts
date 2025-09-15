import { OrderRequestDTO } from '../interfaces/OrderRequestDTO';
import { OrderResponseDTO } from '../interfaces/OrderResponseDTO';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class CartOrderService {
  private baseUrl = `${API_BASE_URL}/client/cart-order`;

  /**
   * Chuyển đổi giỏ hàng thành đơn hàng
   */
  async convertCartToOrder(cartId: number, orderRequest: OrderRequestDTO): Promise<OrderResponseDTO> {
    const response = await fetch(`${this.baseUrl}/convert/${cartId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderRequest),
    });

    if (!response.ok) {
      throw new Error(`Failed to convert cart to order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Cart-Order service health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const cartOrderService = new CartOrderService();
