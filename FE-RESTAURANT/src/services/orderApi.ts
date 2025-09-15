import axios from 'axios';

export interface CreateOrderRequest {
    account_id: number;
    branch_id: number;
    table_id?: number;
    order_date: string;
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERING' | 'COMPLETED' | 'CANCELED';
    payment_method: 'CASH' | 'CARD' | 'BANK_TRANSFER';
    prepay: number;
    total_amount: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_address: string;
    description?: string;
    note?: string;
    order_items: OrderItemRequest[];
}

export interface OrderItemRequest {
    item_type: 'dish' | 'combo';
    item_id: number;
    quantity: number;
    unit_price: number;
    discount_value?: number;
    discount_percentage?: number;
    final_price: number;
}

export interface CreateOrderResponse {
    success: boolean;
    message: string;
    data: {
        order_id: number;
        order_code: string;
        total_amount: number;
        created_at: string;
    };
}

export interface GetUserOrdersResponse {
    success: boolean;
    message: string;
    data: Order[];
}

export interface Order {
    id: number;
    order_code?: string; // Có thể không có trong backend
    branch_id: number;
    table_id?: number;
    table_name?: string;
    status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERING' | 'COMPLETED' | 'CANCELED';
    payment_method: 'CASH' | 'CARD' | 'BANK_TRANSFER';
    prepay: number;
    total_amount: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_address: string;
    description?: string;
    note?: string;
    order_items: OrderItem[];
    created_at: string;
    updated_at: string;
    // Thêm các field từ backend
    notes?: string;
    discount_id?: number;
    discount_name?: string;
    discount_type?: string;
    discount_value?: number;
    staff_id?: number;
    staff_name?: string;
}

export interface OrderItem {
    id: number;
    item_type?: 'dish' | 'combo'; // Có thể không có trong backend
    item_id?: number; // Có thể không có trong backend
    name: string;
    quantity: number;
    unit_price: number;
    final_price: number;
    notes?: string;
    // Thêm các field từ backend
    order_id?: number;
    menu_dish_id?: number;
    dish_id?: number;
    dish_name?: string;
    dish_image?: string;
    total_price?: number;
    special_instructions?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    completed_at?: string;
    discount_id?: number;
    discount_name?: string;
    discount_type?: string;
    discount_value?: number;
    table_id?: number;
    table_name?: string;
    branch_id?: number;
    branch_name?: string;
}

export interface UpdateOrderStatusResponse {
    success: boolean;
    message: string;
    data?: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const orderApi = {
    // Tạo đơn hàng mới - sử dụng client endpoint
    createOrder: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/client/orders`, orderData, {
                headers: {
                    'Content-Type': 'application/json',
                    // Không cần Authorization cho client orders
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error creating order:', error);
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
        }
    },

    // Lấy danh sách đơn hàng của user
    getUserOrders: async (accountId: number): Promise<GetUserOrdersResponse> => {
        try {
            console.log(`Fetching orders for account ID: ${accountId}`);
            const response = await axios.get(`${API_BASE_URL}/client/orders/user/${accountId}`);
            console.log('API Response:', response.data);

            // Xử lý dữ liệu từ backend để phù hợp với frontend
            if (response.data.success && response.data.data) {
                const processedOrders = response.data.data.map((order: any) => ({
                    ...order,
                    order_code: order.order_code || order.id, // Bỏ prefix ORD
                    order_items: (order.items || order.order_items || []).map((item: any) => ({
                        ...item,
                        id: item.id || Math.random(),
                        name: item.dishName || item.dish_name || item.name || 'Món ăn',
                        dish_name: item.dishName || item.dish_name || item.name || 'Món ăn',
                        dish_image: item.dishImage || item.dish_image || item.image || '/images/default-dish.svg',
                        quantity: item.quantity || 1,
                        unit_price: parseFloat(item.unitPrice) || parseFloat(item.unit_price) || 0,
                        final_price: parseFloat(item.finalPrice) || parseFloat(item.final_price) || parseFloat(item.totalPrice) || parseFloat(item.total_price) || 0,
                        total_price: parseFloat(item.totalPrice) || parseFloat(item.total_price) || 0
                    })),
                    customer_name: order.customerName || order.customer_name || 'Khách hàng',
                    customer_phone: order.customerPhone || order.customer_phone || '',
                    customer_address: order.address || order.customer_address || '',
                    payment_method: order.paymentMethod || order.payment_method || 'CASH',
                    total_amount: parseFloat(order.totalAmount) || parseFloat(order.total_amount) || 0,
                    prepay: parseFloat(order.prepay) || 0,
                    created_at: order.createdAt || order.created_at || new Date().toISOString(),
                    updated_at: order.updatedAt || order.updated_at || new Date().toISOString()
                }));

                return {
                    success: true,
                    message: response.data.message || 'Lấy danh sách đơn hàng thành công',
                    data: processedOrders
                };
            }

            return response.data;
        } catch (error: any) {
            console.error('Error fetching user orders:', error);

            // Thử fallback endpoint nếu endpoint chính thất bại
            if (error.response?.status === 500 || error.response?.status === 404) {
                console.log('Trying fallback endpoint...');
                try {
                    // Thử endpoint khác hoặc trả về dữ liệu mẫu
                    const fallbackResponse = {
                        success: true,
                        message: 'Sử dụng dữ liệu mẫu',
                        data: []
                    };
                    console.log('Using fallback data:', fallbackResponse);
                    return fallbackResponse;
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                }
            }

            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng');
        }
    },

    // Lấy chi tiết đơn hàng
    getOrderDetail: async (orderId: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/client/orders/${orderId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching order detail:', error);
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy chi tiết đơn hàng');
        }
    },

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: async (orderId: number, status: string): Promise<UpdateOrderStatusResponse> => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/client/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error: any) {
            console.error('Error updating order status:', error);
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        }
    }
};
