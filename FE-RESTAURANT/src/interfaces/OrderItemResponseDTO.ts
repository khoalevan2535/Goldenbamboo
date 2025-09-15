export interface OrderItemResponseDTO {
    id: number;
    orderId: number;
    
    // Thông tin món ăn
    dishId?: number;
    dishName?: string;
    dishImage?: string;
    
    quantity: number;
    unitPrice: number; // Giá gốc (chưa giảm)
    originalPrice?: number; // Giá gốc (để hiển thị)
    totalPrice: number;
    
    // Ghi chú đặc biệt cho món ăn
    notes?: string;
    specialInstructions?: string;
    
    // Thông tin khuyến mãi
    discountId?: number;
    discountName?: string;
    discountType?: string;
    discountValue?: number;
    finalPrice?: number; // Giá sau khi áp dụng khuyến mãi
    
    // Trạng thái món ăn
    status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELED';
    
    // Thời gian
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    
    // Thông tin bàn và chi nhánh
    tableId?: number;
    tableName?: string;
    branchId?: number;
    branchName?: string;
}

