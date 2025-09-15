/**
 * Utility functions for cart management
 */

/**
 * Tạo cart token mới
 */
export const generateCartToken = (): string => {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Lấy cart token từ localStorage hoặc tạo mới
 */
export const getOrCreateCartToken = (): string => {
    const existingToken = localStorage.getItem('cartToken');
    if (existingToken) {
        return existingToken;
    }

    const newToken = generateCartToken();
    localStorage.setItem('cartToken', newToken);
    return newToken;
};

/**
 * Lưu cart token vào localStorage
 */
export const saveCartToken = (token: string): void => {
    localStorage.setItem('cartToken', token);
};

/**
 * Xóa cart token khỏi localStorage
 */
export const clearCartToken = (): void => {
    localStorage.removeItem('cartToken');
};

/**
 * Kiểm tra cart token có hợp lệ không
 */
export const isValidCartToken = (token: string): boolean => {
    return token && token.startsWith('cart_') && token.length > 10;
};
