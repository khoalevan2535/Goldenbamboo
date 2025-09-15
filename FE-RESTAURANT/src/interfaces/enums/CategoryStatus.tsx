export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export const getCategoryStatusDisplayName = (status: CategoryStatus): string => {
  switch (status) {
    case CategoryStatus.ACTIVE:
      return 'Đang hoạt động';
    case CategoryStatus.INACTIVE:
      return 'Ngừng hoạt động';
    default:
      return 'Không xác định';
  }
};

export const getCategoryStatusColor = (status: CategoryStatus): string => {
  switch (status) {
    case CategoryStatus.ACTIVE:
      return 'success';
    case CategoryStatus.INACTIVE:
      return 'secondary';
    default:
      return 'secondary';
  }
};











