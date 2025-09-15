import { useState, useCallback } from 'react';
import { TableService } from '../services/TableService';
import { type TableResponseDTO } from '../interfaces/TableResponseDTO';
import { getApiErrorMessage } from '../utils/error';

export const useTables = () => {
    const [tables, setTables] = useState<TableResponseDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTablesByBranch = useCallback(async (branchId: number) => {
        setLoading(true);
        try {
            const response = await TableService.getByBranch(branchId);
            const list = (response as any)?.content ?? response;
            setTables(Array.isArray(list) ? list : []);
            setError(null);
        } catch (err: any) {
            setError(getApiErrorMessage(err));
            setTables([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { tables, loading, error, fetchTablesByBranch, setTables };
}; 