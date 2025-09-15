import apiClient from '../utils/Api';

// Interface cho món ăn từ menu
export interface MenuDish {
    id: number;
    menu_dish_id?: number; // ID của món ăn trong menu
    name: string;
    description: string;
    imageUrl: string; // Thay đổi từ image sang imageUrl
    price: number;
    status: boolean;
    categoryId: number;
    discountPercentage?: number;
}

// Interface cho combo từ menu
export interface MenuCombo {
    id: number;
    name: string;
    description: string;
    imageUrl: string; // Thay đổi từ image sang imageUrl
    price: number;
    status: boolean;
    comboDishes: {
        id: number;
        comboId: number;
        comboName: string;
        dishId: number;
        dishName: string;
    }[];
    discountPercentage?: number;
}

// Interface cho giảm giá đơn hàng
export interface OrderDiscount {
    id: number;
    name: string;
    value: number;
    type: 'FIXED_AMOUNT';
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED';
    minOrderAmount?: number;
    maxDiscountAmount?: number;
}

// Interface cho thông tin chi nhánh
export interface Branch {
    id: number;
    name: string;
    address: string;
    phone: string;
    status: 'OPEN' | 'CLOSED' | 'INACTIVE';
}

export const ClientMenuService = {
    // Lấy danh sách món ăn từ menu - Sử dụng API trực tiếp
    getMenuDishes: async (branchId: number = 1, categoryId?: number): Promise<any> => {
        try {
            let url = `/api/client/menu/dishes?branchId=${branchId}`;
            if (categoryId) {
                url += `&categoryId=${categoryId}`;
            }
            const response = await apiClient.get(url);
            return response.data; // Trả về Page<DishResponseDTO>
        } catch (error) {
            console.error('Error fetching menu dishes:', error);
            throw error;
        }
    },

    // Lấy danh sách combo từ menu - Sử dụng API trực tiếp
    getMenuCombos: async (branchId: number = 1): Promise<any> => {
        try {
            const response = await apiClient.get(`/api/client/menu/combos?branchId=${branchId}`);
            return response.data; // Trả về Page<ComboResponseDTO>
        } catch (error) {
            console.error('Error fetching menu combos:', error);
            throw error;
        }
    },

    // API mới tương tự staff - lấy tất cả items active của branch
    getOrderItems: async (branchId: number): Promise<any> => {
        try {
            const response = await apiClient.get(`/api/client/menu/order-items?branchId=${branchId}`);
            return response.data; // Trả về {dishes: [], combos: [], dishes_count: X, combos_count: Y}
        } catch (error) {
            console.error('Error fetching order items:', error);
            throw error;
        }
    },

    // Lấy danh sách món ăn theo category
    getDishesByCategory: async (categoryId: number, branchId: number = 1): Promise<MenuDish[]> => {
        try {
            const response = await apiClient.get<MenuDish[]>(`/api/client/menu/dishes?categoryId=${categoryId}&branchId=${branchId}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching dishes by category:', error);
            throw error;
        }
    },

    // Lấy danh sách categories
    getCategories: async (branchId?: number): Promise<any[]> => {
        try {
            // Luôn yêu cầu branchId, nếu không có thì sử dụng default
            const finalBranchId = branchId || 1;
            const url = `/api/client/menu/categories?branch_id=${finalBranchId}`;
            const response = await apiClient.get(url);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    // Lấy danh sách categories theo branch với counts
    getBranchScopedCategories: async (
        branchId: number,
        options?: {
            type?: 'all' | 'food' | 'combo';
            includeCounts?: boolean;
            showEmpty?: boolean;
            search?: string;
        }
    ): Promise<any[]> => {
        try {
            const params = new URLSearchParams();
            params.append('branch_id', branchId.toString());

            if (options?.type) {
                params.append('type', options.type);
            }
            if (options?.includeCounts !== undefined) {
                params.append('include_counts', options.includeCounts.toString());
            }
            if (options?.showEmpty !== undefined) {
                params.append('show_empty', options.showEmpty.toString());
            }
            if (options?.search) {
                params.append('search', options.search);
            }

            const response = await apiClient.get(`/api/client/menu/categories?${params.toString()}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching branch-scoped categories:', error);
            throw error;
        }
    },

    // Lấy discount cho đơn hàng
    getOrderDiscounts: async (branchId: number = 1): Promise<OrderDiscount[]> => {
        try {
            const response = await apiClient.get<OrderDiscount[]>(`/api/client/discounts/order?branchId=${branchId}`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching order discounts:', error);
            return [];
        }
    },

    // Lấy danh sách chi nhánh
    getBranches: async (): Promise<Branch[]> => {
        try {
            const response = await apiClient.get<Branch[]>('/api/client/menu/branches');
            return response.data || [];
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw error;
        }
    },

    // Lấy tất cả discount active cho đơn hàng
    getActiveOrderDiscounts: async (): Promise<OrderDiscount[]> => {
        try {
            const response = await apiClient.get<OrderDiscount[]>('/api/client/discounts/order');
            return response.data || [];
        } catch (error) {
            console.error('Error fetching active order discounts:', error);
            return [];
        }
    },

    // Lấy chi tiết món ăn
    getDishDetail: async (dishId: number): Promise<MenuDish> => {
        try {
            const response = await apiClient.get<MenuDish>(`/api/client/dishes/${dishId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dish detail:', error);
            throw error;
        }
    },

    // Lấy chi tiết combo
    getComboDetail: async (comboId: number): Promise<MenuCombo> => {
        try {
            const response = await apiClient.get<MenuCombo>(`/api/client/combos/${comboId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching combo detail:', error);
            throw error;
        }
    },

    // Tính toán discount cho đơn hàng
    calculateOrderDiscount: (orderAmount: number, discounts: OrderDiscount[]): number => {
        if (!discounts || discounts.length === 0) return 0;

        // Lọc discount active và phù hợp với điều kiện
        const activeDiscounts = discounts.filter(discount =>
            discount.status === 'ACTIVE' &&
            new Date() >= new Date(discount.startDate) &&
            new Date() <= new Date(discount.endDate) &&
            (!discount.minOrderAmount || orderAmount >= discount.minOrderAmount)
        );

        if (activeDiscounts.length === 0) return 0;

        // Lấy discount có giá trị cao nhất
        const bestDiscount = activeDiscounts.reduce((best, current) => {
            return current.value > best.value ? current : best;
        });

        let discountAmount = bestDiscount.value;

        // Áp dụng giới hạn tối đa nếu có
        if (bestDiscount.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, bestDiscount.maxDiscountAmount);
        }

        // Không được giảm nhiều hơn tổng tiền đơn hàng
        discountAmount = Math.min(discountAmount, orderAmount);

        return discountAmount;
    }
}; 