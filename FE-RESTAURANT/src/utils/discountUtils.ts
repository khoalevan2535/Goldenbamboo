import { DishResponseDTO } from '../interfaces/DishResponseDTO';
import { ComboResponseDTO } from '../interfaces/ComboResponseDTO';

export interface DiscountInfo {
    originalPrice: number;
    finalPrice: number;
    discountAmount: number;
    discountPercentage: number;
    hasDiscount: boolean;
    isActive: boolean;
}

/**
 * Tính giá sau discount cho món ăn
 */
export const calculateDishPrice = (dish: DishResponseDTO): DiscountInfo => {
    const originalPrice = dish.basePrice || 0;
    
    // Kiểm tra discount có active không
    const now = new Date();
    const startDate = dish.discountStartDate ? new Date(dish.discountStartDate) : null;
    const endDate = dish.discountEndDate ? new Date(dish.discountEndDate) : null;
    
    // Kiểm tra discount status - chỉ ACTIVE mới hiển thị giá giảm
    const isStatusActive = dish.discount?.status === 'ACTIVE';
    const isTimeActive = dish.discountActive && 
        (!startDate || now >= startDate) && 
        (!endDate || now <= endDate);
    
    const isActive = isStatusActive && isTimeActive;
    
    if (!isActive) {
        return {
            originalPrice,
            finalPrice: originalPrice,
            discountAmount: 0,
            discountPercentage: 0,
            hasDiscount: false,
            isActive: false
        };
    }
    
    // Sử dụng newPrice từ discount trực tiếp
    const finalPrice = dish.discount?.newPrice || originalPrice;
    const discountAmount = originalPrice - finalPrice;
    const actualDiscountPercentage = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;
    
    return {
        originalPrice,
        finalPrice: Math.max(0, finalPrice),
        discountAmount: Math.max(0, discountAmount),
        discountPercentage: actualDiscountPercentage,
        hasDiscount: discountAmount > 0,
        isActive: true
    };
};

/**
 * Tính giá sau discount cho combo
 */
export const calculateComboPrice = (combo: ComboResponseDTO): DiscountInfo => {
    const originalPrice = combo.basePrice || 0;
    
    // Kiểm tra discount có active không
    const now = new Date();
    const startDate = combo.discountStartDate ? new Date(combo.discountStartDate) : null;
    const endDate = combo.discountEndDate ? new Date(combo.discountEndDate) : null;
    
    // Kiểm tra discount status - chỉ ACTIVE mới hiển thị giá giảm
    const isStatusActive = combo.discount?.status === 'ACTIVE';
    const isTimeActive = combo.discountActive && 
        (!startDate || now >= startDate) && 
        (!endDate || now <= endDate);
    
    const isActive = isStatusActive && isTimeActive;
    
    if (!isActive) {
        return {
            originalPrice,
            finalPrice: originalPrice,
            discountAmount: 0,
            discountPercentage: 0,
            hasDiscount: false,
            isActive: false
        };
    }
    
    // Sử dụng newPrice từ discount trực tiếp
    const finalPrice = combo.discount?.newPrice || originalPrice;
    const discountAmount = originalPrice - finalPrice;
    const actualDiscountPercentage = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;
    
    return {
        originalPrice,
        finalPrice: Math.max(0, finalPrice),
        discountAmount: Math.max(0, discountAmount),
        discountPercentage: actualDiscountPercentage,
        hasDiscount: discountAmount > 0,
        isActive: true
    };
};

/**
 * Format giá để hiển thị
 */
export const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN');
};

/**
 * Format percentage để hiển thị
 */
export const formatPercentage = (percentage: number): string => {
    return `${Math.round(percentage)}%`;
};


