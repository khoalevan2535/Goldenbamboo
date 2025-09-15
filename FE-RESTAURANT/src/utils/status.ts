export type ApprovalStatus = 'ACTIVE' | 'INACTIVE';

export type ApprovalType = 
  | 'CATEGORY' | 'DISH' | 'COMBO' 
  | 'MENU_ADD_DISH' | 'MENU_ADD_COMBO' | 'COMBO_ADD_DISH'
  | 'DISCOUNT' | 'MENU_BRANCH_ASSIGN' | 'ITEM_OPERATIONAL_TOGGLE' | 'DEFAULT_MENU_CHANGE'
  | 'UPDATE_DISH' | 'UPDATE_COMBO' | 'UPDATE_CATEGORY'
  | 'DELETE_DISH' | 'DELETE_COMBO' | 'DELETE_CATEGORY';

const approvalStatusLabelVi: Record<string, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
};

const approvalTypeLabelVi: Record<string, string> = {
  CATEGORY: 'Tạo danh mục',
  DISH: 'Tạo món ăn',
  COMBO: 'Tạo combo',
  MENU_ADD_DISH: 'Thêm món vào menu',
  MENU_ADD_COMBO: 'Thêm combo vào menu',
  COMBO_ADD_DISH: 'Thêm món vào combo',
  DISCOUNT: 'Tạo khuyến mãi',
  MENU_BRANCH_ASSIGN: 'Gán menu cho chi nhánh',
  ITEM_OPERATIONAL_TOGGLE: 'Thay đổi trạng thái hoạt động',
  DEFAULT_MENU_CHANGE: 'Thay đổi menu mặc định',
  UPDATE_DISH: 'Cập nhật món ăn',
  UPDATE_COMBO: 'Cập nhật combo',
  UPDATE_CATEGORY: 'Cập nhật danh mục',
  DELETE_DISH: 'Xóa món ăn',
  DELETE_COMBO: 'Xóa combo',
  DELETE_CATEGORY: 'Xóa danh mục'
};

const approvalStatusVariant: Record<string, 'warning' | 'success' | 'secondary' | 'danger' | 'primary' | 'info' | 'dark' | 'light'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
};

export function getApprovalStatusLabel(status?: string | null): string {
  if (!status) return '';
  return approvalStatusLabelVi[status] ?? status;
}

export function getApprovalStatusVariant(status?: string | null) {
  if (!status) return 'secondary';
  return approvalStatusVariant[status] ?? 'secondary';
}

export function getApprovalTypeLabel(type?: string | null): string {
  if (!type) return '';
  return approvalTypeLabelVi[type] ?? type;
}

export function getApprovalTypeVariant(type?: string | null) {
  if (!type) return 'secondary';
  
  // Phân loại màu theo nhóm thao tác
  if (type.startsWith('UPDATE_')) return 'info';
  if (type.startsWith('DELETE_')) return 'danger';
  if (type.startsWith('CREATE') || type === 'DISH' || type === 'COMBO' || type === 'CATEGORY') return 'primary';
  
  return 'secondary';
}

