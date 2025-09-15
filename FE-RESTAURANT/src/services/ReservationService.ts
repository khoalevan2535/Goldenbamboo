import apiClient from '../utils/apiClient';
import { type ReservationRequestDTO } from '../interfaces/ReservationRequestDTO';
import { type ReservationResponseDTO } from '../interfaces/ReservationResponseDTO';

const API_URL = '/reservations';

export const ReservationService = {
  getAll: () => apiClient.get(API_URL),
  getById: (id: number) => apiClient.get<ReservationResponseDTO>(`${API_URL}/${id}`),
  create: (data: ReservationRequestDTO) => apiClient.post<ReservationResponseDTO>(API_URL, data),
  update: (id: number, data: Partial<ReservationRequestDTO>) => apiClient.put<ReservationResponseDTO>(`${API_URL}/${id}`, data),
  delete: (id: number) => apiClient.delete(`${API_URL}/${id}`)
}; 