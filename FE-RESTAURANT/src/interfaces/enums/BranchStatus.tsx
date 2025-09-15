export const BranchStatus = {
  CLOSED: 'CLOSED',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  OPEN: 'OPEN'
} as const;

export type BranchStatus = typeof BranchStatus[keyof typeof BranchStatus];

// Utility functions để kiểm tra trạng thái
export const BranchStatusUtils = {
  // Kiểm tra trạng thái hoạt động
  isOpen: (status: BranchStatus): boolean => {
    return status === BranchStatus.OPEN;
  },

  isInactive: (status: BranchStatus): boolean => {
    return status === BranchStatus.INACTIVE;
  },

  isMaintenance: (status: BranchStatus): boolean => {
    return status === BranchStatus.MAINTENANCE;
  },

  isClosed: (status: BranchStatus): boolean => {
    return status === BranchStatus.CLOSED;
  },

  // Kiểm tra chi nhánh có thể hoạt động không
  canOperate: (status: BranchStatus): boolean => {
    return status === BranchStatus.OPEN;
  },

  // Lấy tên hiển thị của trạng thái
  getDisplayName: (status: BranchStatus): string => {
    switch (status) {
      case BranchStatus.OPEN:
        return 'Mở cửa';
      case BranchStatus.INACTIVE:
        return 'Dừng hoạt động';
      case BranchStatus.MAINTENANCE:
        return 'Bảo trì';
      case BranchStatus.CLOSED:
        return 'Đóng cửa vĩnh viễn';
      default:
        return 'Không xác định';
    }
  },

  // Lấy màu sắc cho trạng thái
  getStatusColor: (status: BranchStatus): string => {
    switch (status) {
      case BranchStatus.OPEN:
        return 'success';
      case BranchStatus.INACTIVE:
        return 'warning';
      case BranchStatus.MAINTENANCE:
        return 'info';
      case BranchStatus.CLOSED:
        return 'danger';
      default:
        return 'secondary';
    }
  }
};
