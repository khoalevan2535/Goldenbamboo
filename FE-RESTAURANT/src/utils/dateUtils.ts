/**
 * Utility functions for date formatting
 */

/**
 * Format Date object to datetime-local input format (YYYY-MM-DDTHH:MM)
 * @param date - Date object to format
 * @returns Formatted string for datetime-local input
 */
export const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Get current time in local timezone
 * @returns Current Date object
 */
export const getCurrentTime = (): Date => {
  return new Date();
};

/**
 * Get time 5 minutes from now (for startDate validation)
 * @returns Date object 5 minutes from now
 */
export const getStartTime = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + 5 * 60 * 1000); // 5 phút sau
};

/**
 * Get time 30 days from now (for discount endDate)
 * @returns Date object 30 days from now
 */
export const getDiscountEndTime = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 ngày sau
};

/**
 * Get time 7 days from now (for voucher endDate)
 * @returns Date object 7 days from now
 */
export const getVoucherEndTime = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày sau
};

/**
 * Format date for display in Vietnamese locale
 * @param date - Date object to format
 * @returns Formatted string in Vietnamese format
 */
export const formatDateVietnamese = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Convert datetime-local string to ISO string for backend
 * Simple approach: just add ':00.000Z' to make it UTC format
 * @param dateTimeLocal - String in format "YYYY-MM-DDTHH:MM"
 * @returns ISO string
 */
export const convertToBackendFormat = (dateTimeLocal: string): string => {
  return dateTimeLocal + ':00.000Z';
};

