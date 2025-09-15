import { CartRequestDTO } from '../interfaces/CartRequestDTO';
import { CartItemRequestDTO } from '../interfaces/CartItemRequestDTO';
import { CartResponseDTO } from '../interfaces/CartResponseDTO';
import { CartSummaryDTO } from '../interfaces/CartSummaryDTO';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class CartService {
  private baseUrl = `${API_BASE_URL}/client/cart`;

  /**
   * Thêm item vào giỏ hàng
   */
  async addItemToCart(request: CartRequestDTO): Promise<CartResponseDTO> {
    const response = await fetch(`${this.baseUrl}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to add item to cart: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Cập nhật item trong giỏ hàng
   */
  async updateCartItem(itemId: number, request: CartItemRequestDTO): Promise<CartResponseDTO> {
    const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to update cart item: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Xóa item khỏi giỏ hàng
   */
  async removeItemFromCart(itemId: number): Promise<CartResponseDTO> {
    const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove cart item: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Lấy giỏ hàng (tự động tạo nếu chưa có)
   */
  async getCart(params: {
    accountId?: number;
    sessionId?: string;
    branchId: number;
  }): Promise<CartResponseDTO> {
    const searchParams = new URLSearchParams();
    
    if (params.accountId) {
      searchParams.append('accountId', params.accountId.toString());
    }
    if (params.sessionId) {
      searchParams.append('sessionId', params.sessionId);
    }
    searchParams.append('branchId', params.branchId.toString());

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);

    if (!response.ok) {
      if (response.status === 404) {
        // Tự động tạo giỏ hàng mới nếu chưa có
        return this.createEmptyCart(params);
      }
      throw new Error(`Failed to get cart: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Tạo giỏ hàng trống mới
   */
  async createCart(params: {
    accountId?: number;
    sessionId?: string;
    branchId: number;
  }): Promise<CartResponseDTO> {
    const searchParams = new URLSearchParams();
    
    if (params.accountId) {
      searchParams.append('accountId', params.accountId.toString());
    }
    if (params.sessionId) {
      searchParams.append('sessionId', params.sessionId);
    }
    searchParams.append('branchId', params.branchId.toString());

    const response = await fetch(`${this.baseUrl}/create?${searchParams.toString()}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to create cart: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Lấy danh sách giỏ hàng của user
   */
  async getUserCarts(params: {
    accountId?: number;
    sessionId?: string;
  }): Promise<CartSummaryDTO[]> {
    const searchParams = new URLSearchParams();
    
    if (params.accountId) {
      searchParams.append('accountId', params.accountId.toString());
    }
    if (params.sessionId) {
      searchParams.append('sessionId', params.sessionId);
    }

    const response = await fetch(`${this.baseUrl}/list?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to get user carts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(cartId: number): Promise<{ message: string; cartId: string }> {
    const response = await fetch(`${this.baseUrl}/${cartId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Cart service health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const cartService = new CartService();
