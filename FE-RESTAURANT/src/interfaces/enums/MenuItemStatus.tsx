export const ItemAvailabilityStatus = {
  AVAILABLE: 'AVAILABLE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  DISCONTINUED: 'DISCONTINUED',
} as const;

export type ItemAvailabilityStatus = typeof ItemAvailabilityStatus[keyof typeof ItemAvailabilityStatus];

export const ItemAvailabilityStatusUtils = {
  getDisplayName: (status: ItemAvailabilityStatus): string => {
    switch (status) {
      case ItemAvailabilityStatus.AVAILABLE:
        return 'Còn hàng';
      case ItemAvailabilityStatus.OUT_OF_STOCK:
        return 'Hết hàng';
      case ItemAvailabilityStatus.DISCONTINUED:
        return 'Ngừng bán';
      default:
        return status;
    }
  },

  getStatusColor: (status: ItemAvailabilityStatus): string => {
    switch (status) {
      case ItemAvailabilityStatus.AVAILABLE:
        return 'success';
      case ItemAvailabilityStatus.OUT_OF_STOCK:
        return 'warning';
      case ItemAvailabilityStatus.DISCONTINUED:
        return 'danger';
      default:
        return 'secondary';
    }
  },

  isAvailable: (status: ItemAvailabilityStatus): boolean => {
    return status === ItemAvailabilityStatus.AVAILABLE;
  },

  isOutOfStock: (status: ItemAvailabilityStatus): boolean => {
    return status === ItemAvailabilityStatus.OUT_OF_STOCK;
  },

  isDiscontinued: (status: ItemAvailabilityStatus): boolean => {
    return status === ItemAvailabilityStatus.DISCONTINUED;
  },

  isOrderable: (status: ItemAvailabilityStatus): boolean => {
    return status === ItemAvailabilityStatus.AVAILABLE;
  },

  isVisible: (status: ItemAvailabilityStatus): boolean => {
    return status === ItemAvailabilityStatus.AVAILABLE || status === ItemAvailabilityStatus.OUT_OF_STOCK;
  },
};