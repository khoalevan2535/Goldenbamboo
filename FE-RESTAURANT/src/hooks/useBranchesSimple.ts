import { useState, useEffect } from 'react';
import { BranchService } from '../services/BranchService';
import type { BranchResponseDTO } from '../interfaces';

export function useBranchesSimple() {
  const [branches, setBranches] = useState<BranchResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await BranchService.getAll({ page: 0, size: 100 });
        setBranches(response.content || []);
      } catch (err: any) {
        console.error('Error fetching branches:', err);
        setError(err.message || 'Không thể tải danh sách chi nhánh');
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return { branches, loading, error };
}
