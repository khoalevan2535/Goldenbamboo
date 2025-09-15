import React from 'react';
import { ClientBranchDTO } from '../../interfaces/ClientBranchDTO';
import { useEnhancedCart } from '../../context/EnhancedCartContext';

interface BranchSelectorProps {
  branches: ClientBranchDTO[];
  selectedBranchId?: number;
  onBranchChange: (branchId: number) => void;
  loading?: boolean;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  selectedBranchId,
  onBranchChange,
  loading = false,
}) => {
  const { setBranch } = useEnhancedCart();

  const handleBranchChange = (branchId: number) => {
    setBranch(branchId);
    onBranchChange(branchId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Chọn chi nhánh</h3>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Không thể tải danh sách chi nhánh. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Chọn chi nhánh</h3>
      <select
        value={selectedBranchId || ''}
        onChange={(e) => handleBranchChange(Number(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        disabled={loading}
      >
        <option value="">-- Chọn chi nhánh --</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name} - {branch.address}
          </option>
        ))}
      </select>
      
      {selectedBranchId && (
        <p className="text-xs text-gray-500 mt-2">
          Món ăn sẽ được lấy từ chi nhánh đã chọn
        </p>
      )}
    </div>
  );
};
