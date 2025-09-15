export interface ClientMenuFilterDTO {
  categories: ClientCategoryDTO[];
  itemCounts: Record<string, number>;
  totalItems: number;
  totalCategories: number;
}

export interface ClientCategoryDTO {
  id: number;
  name: string;
  description?: string;
  status: string;
  operationalStatus?: string;
  slug?: string;
  imageUrl?: string;
  foodCount?: number;
  comboCount?: number;
  totalCount?: number;
  itemCount?: number; // Legacy field
}







