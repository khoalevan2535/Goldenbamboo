import apiClient from '../utils/Api';

// Interface cho món ăn nổi bật từ Home
export interface FeaturedDish {
    id: number;
    name: string;
    description: string;
    imageUrl: string; // Thay đổi từ image sang imageUrl
    price: number;
    available: boolean; // Thay đổi từ status sang available
    categoryId: number;
    type: "food" | "combo"; // Thêm type để phân biệt food/combo
    branchId: number;
    branchName: string;
    status: string; // Thêm status string
}

export const HomeService = {
    // Lấy 3 món ăn nổi bật cho trang Home
    getFeaturedDishes: async (branchId: number = 1): Promise<FeaturedDish[]> => {
        try {
            const response = await apiClient.get<FeaturedDish[]>(`/api/client/home/featured-menu`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching featured dishes:', error);
            return [];
        }
    }
};
