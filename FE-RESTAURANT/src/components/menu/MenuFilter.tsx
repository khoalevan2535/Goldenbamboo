import React from 'react';
import { ClientCategoryWithCountsDTO } from '../../interfaces/ClientCategoryWithCountsDTO';

interface MenuFilterProps {
  categories: ClientCategoryWithCountsDTO[];
  selectedCategoryId?: number;
  selectedType?: string;
  onCategoryChange: (categoryId?: number) => void;
  onTypeChange: (type?: string) => void;
  loading?: boolean;
}

export const MenuFilter: React.FC<MenuFilterProps> = ({
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Type Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Loại món</h3>
          <div className="flex flex-wrap gap-2">
            {updateTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTypeChange(option.value === 'all' ? undefined : option.value)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === option.value || (!selectedType && option.value === 'all')
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({option.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Danh mục</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange(undefined)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedCategoryId
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Tất cả danh mục
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategoryId === category.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {category.name}
                {category.totalCount && category.totalCount > 0 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({category.totalCount})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};







