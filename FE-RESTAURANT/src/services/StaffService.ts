import axios from 'axios';
import { type StaffRequestDTO } from '../interfaces/StaffRequestDTO';
import { type StaffResponseDTO } from '../interfaces/StaffResponseDTO';

const API_URL = '/staffs';

export const StaffService = {
  getAll: (params?: { name?: string }) => axios.get<StaffResponseDTO[]>(API_URL, { params }),
  create: (data: StaffRequestDTO) => axios.post(API_URL, data),
  update: (id: number, data: StaffRequestDTO) => axios.put(`${API_URL}/${id}`, data),
  delete: (id: number) => axios.delete(`${API_URL}/${id}`),
};
