// File: src/services/DiscountDishService.ts

import apiClient from "../utils/apiClient";
import type { DiscountDishRequestDTO, DiscountDishResponseDTO } from "../interfaces";

const API_URL = "/menus";

export const DiscountDishService = {
  assignToDish: (menuId: number, menuDishId: number, data: DiscountDishRequestDTO): Promise<DiscountDishResponseDTO> =>
    apiClient.post(`${API_URL}/${menuId}/dishes/${menuDishId}/discount`, data),
  removeFromDish: (menuId: number, menuDishId: number): Promise<void> =>
    apiClient.delete(`${API_URL}/${menuId}/dishes/${menuDishId}/discount`),
};
