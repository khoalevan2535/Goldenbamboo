import React from "react";
import { type CategoryResponseDTO } from "../../interfaces";

interface CategoryStatusModalProps {
  show: boolean;
  onHide: () => void;
  category: CategoryResponseDTO | null;
  onSubmit: (id: string, status: string) => Promise<void>;
}

export function CategoryStatusModal({ show, onHide, category, onSubmit }: CategoryStatusModalProps) {
  // Category không có API cập nhật status, chỉ hiển thị thông báo
  if (!category) return null;

  return (
    <div>
      {/* Category không có modal cập nhật status vì backend không hỗ trợ */}
    </div>
  );
}

export default CategoryStatusModal;
