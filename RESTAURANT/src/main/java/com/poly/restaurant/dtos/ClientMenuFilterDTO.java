package com.poly.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientMenuFilterDTO {
    private List<ClientCategoryDTO> categories;
    private Map<String, Integer> itemCounts; // "food" -> count, "combo" -> count
    private Integer totalItems;
    private Integer totalCategories;
}
