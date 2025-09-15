import { useState, useEffect } from 'react';
import { CategoryService } from '../services/CategoryService';
import { CategoryResponseDTO } from '../interfaces';

export const useCategoriesForManager = () => {
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useCategoriesForManager - Loading categories for manager...');
      
      const response = await CategoryService.getActiveCategoriesForManager();
      console.log('useCategoriesForManager - Categories loaded:', response);
      
      setCategories(response.content || []);
    } catch (err: any) {
      console.error('useCategoriesForManager - Error loading categories:', err);
      setError('Không thể tải danh mục');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};










