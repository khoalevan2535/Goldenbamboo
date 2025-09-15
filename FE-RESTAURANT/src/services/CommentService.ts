import apiClient from '../utils/apiClient';

export interface CommentRequestDTO {
  content: string;
  rating: number;
  productId?: number;
  restaurantId?: number;
  parentId?: number;
}

export interface CommentResponseDTO {
  id: number;
  content: string;
  rating: number;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  replies?: CommentResponseDTO[];
}

export interface CommentStatsDTO {
  totalComments: number;
  averageRating: number;
  totalRatings: number;
  oneStar: number;
  twoStars: number;
  threeStars: number;
  fourStars: number;
  fiveStars: number;
}

export interface CommentPageResponse {
  content: CommentResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export class CommentService {
  // Tạo bình luận mới
  static async createComment(data: CommentRequestDTO): Promise<CommentResponseDTO> {
    const response = await apiClient.post('/api/comments', data);
    return response.data;
  }

  // Lấy danh sách bình luận theo sản phẩm
  static async getCommentsByProduct(
    productId: number, 
    page: number = 0, 
    size: number = 10
  ): Promise<CommentPageResponse> {
    const response = await apiClient.get(`/api/comments/product/${productId}`, {
      params: { page, size }
    });
    return response.data;
  }

  // Lấy danh sách bình luận theo nhà hàng
  static async getCommentsByRestaurant(
    restaurantId: number, 
    page: number = 0, 
    size: number = 10
  ): Promise<CommentPageResponse> {
    const response = await apiClient.get(`/api/comments/restaurant/${restaurantId}`, {
      params: { page, size }
    });
    return response.data;
  }

  // Lấy thống kê bình luận theo sản phẩm
  static async getCommentStatsByProduct(productId: number): Promise<CommentStatsDTO> {
    const response = await apiClient.get(`/api/comments/product/${productId}/stats`);
    return response.data;
  }

  // Lấy thống kê bình luận theo nhà hàng
  static async getCommentStatsByRestaurant(restaurantId: number): Promise<CommentStatsDTO> {
    const response = await apiClient.get(`/api/comments/restaurant/${restaurantId}/stats`);
    return response.data;
  }

  // Xóa bình luận
  static async deleteComment(commentId: number): Promise<string> {
    const response = await apiClient.delete(`/api/comments/${commentId}`);
    return response.data;
  }
}
