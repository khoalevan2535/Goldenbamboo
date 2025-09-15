import React from 'react';
import { ClientCategoryWithCountsDTO } from '../../interfaces/ClientCategoryWithCountsDTO';
import { LoadingSpinner } from '../LoadingSpinner';

interface OrderSidebarProps {
  categories: ClientCategoryWithCountsDTO[];
  selectedCategoryId?: number;
  selectedType?: string;
  onCategoryChange: (categoryId?: number) => void;
  onTypeChange: (type?: string) => void;
  loading?: boolean;
}

export const OrderSidebar: React.FC<OrderSidebarProps> = ({
  categories,
  selectedCategoryId,
  selectedType,
  onCategoryChange,
  onTypeChange,
  loading = false,
}) => {
  const typeOptions = [
    { value: 'all', label: 'Tất cả', count: 0 },
    { value: 'food', label: 'Món lẻ', count: 0 },
    { value: 'combo', label: 'Combo', count: 0 },
  ];

  // Calculate counts for type options
  const typeCounts = categories.reduce((acc, category) => {
    acc.food += category.foodCount || 0;
    acc.combo += category.comboCount || 0;
    acc.all += (category.foodCount || 0) + (category.comboCount || 0);
    return acc;
  }, { food: 0, combo: 0, all: 0 });

  const updateTypeOptions = typeOptions.map(option => ({
    ...option,
    count: typeCounts[option.value as keyof typeof typeCounts] || 0,
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Type Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Loại món</h3>
        <div className="space-y-2">
          {updateTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTypeChange(option.value === 'all' ? undefined : option.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === option.value || (!selectedType && option.value === 'all')
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {option.count > 0 && (
                  <span className="text-xs opacity-75">
                    ({option.count})
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Danh mục</h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange(undefined)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !selectedCategoryId
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Tất cả danh mục</span>
            </div>
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategoryId === category.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{category.name}</span>
                {category.totalCount && category.totalCount > 0 && (
                  <span className="text-xs opacity-75 ml-2">
                    ({category.totalCount})
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Thống kê</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng món:</span>
            <span className="font-medium">{typeCounts.all}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Món lẻ:</span>
            <span className="font-medium">{typeCounts.food}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Combo:</span>
            <span className="font-medium">{typeCounts.combo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Danh mục:</span>
            <span className="font-medium">{categories.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};







