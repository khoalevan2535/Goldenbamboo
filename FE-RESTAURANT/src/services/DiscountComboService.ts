// File: src/services/DiscountComboService.ts

import apiClient from "../utils/apiClient";
import type { DiscountComboRequestDTO, DiscountComboResponseDTO } from "../interfaces";

const API_URL = "/menus";

export const DiscountComboService = {
  assignToCombo: (menuId: number, menuComboId: number, data: DiscountComboRequestDTO): Promise<DiscountComboResponseDTO> =>
    apiClient.post(`${API_URL}/${menuId}/combos/${menuComboId}/discount`, data),
  removeFromCombo: (menuId: number, menuComboId: number): Promise<void> =>
    apiClient.delete(`${API_URL}/${menuId}/combos/${menuComboId}/discount`),
};
