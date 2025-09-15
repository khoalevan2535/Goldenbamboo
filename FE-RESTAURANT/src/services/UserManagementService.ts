import apiClient from '../utils/apiClient';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string; // Backend trả về 'name' thay vì 'fullName'
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  createAt: string; // Backend trả về 'createAt' thay vì 'createdAt'
  roles: string[]; // Backend trả về 'roles' array (Set<String>)
  branchId?: number;
  branchName?: string;
  branchAddress?: string;
  avatarUrl?: string;
  latitude?: number;
  longitude?: number;
  failedAttempts?: number;
  lockTime?: string;
  lastFailedAttempt?: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  name: string;
  phone?: string;
  password: string;
  roleName: 'ROLE_USER' | 'ROLE_STAFF' | 'ROLE_MANAGER' | 'ROLE_ADMIN';
  branchId?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
}

export interface UserUpdateRequest {
  name?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  roleName?: 'ROLE_USER' | 'ROLE_STAFF' | 'ROLE_MANAGER' | 'ROLE_ADMIN';
  branchId?: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

class UserManagementService {
  // Lấy tất cả người dùng với pagination (chỉ dành cho admin)
  async getAllUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.direction) queryParams.append('direction', params.direction);
      
      const url = `/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      // Nếu backend trả về paginated response
      if (response?.content) {
        return response;
      }
      
      // Fallback cho trường hợp backend chưa hỗ trợ pagination
      const users: User[] = Array.isArray(response) ? response : (response?.data || []);
      return {
        content: users,
        totalElements: users.length,
        totalPages: 1,
        size: users.length,
        number: 0,
        first: true,
        last: true,
        numberOfElements: users.length
      };
    } catch (error) {
      console.error('❌ Error fetching all users:', error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 0,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 0
      };
    }
  }

  // Lấy tất cả nhân viên với pagination (manager + staff) - dành cho admin
  async getAllStaff(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.direction) queryParams.append('direction', params.direction);
      
      const url = `/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      console.log('🔍 UserManagementService.getAllStaff response:', {
        url,
        response,
        isArray: Array.isArray(response),
        hasContent: !!response?.content,
        contentIsArray: Array.isArray(response?.content)
      });
      
      // Nếu backend trả về paginated response
      if (response?.content && Array.isArray(response.content)) {
        // Filter chỉ lấy staff và managers
        const staffUsers = response.content.filter((user: User) => 
          user.roles && (user.roles.includes('ROLE_STAFF') || user.roles.includes('ROLE_MANAGER'))
        );
        
        return {
          ...response,
          content: staffUsers,
          numberOfElements: staffUsers.length
        };
      }
      
      // Fallback cho trường hợp backend chưa hỗ trợ pagination
      const allUsers: User[] = Array.isArray(response) ? response : (response?.data || []);
      const staffUsers = allUsers.filter(user => 
        user.roles && (user.roles.includes('ROLE_STAFF') || user.roles.includes('ROLE_MANAGER'))
      );
      
      return {
        content: staffUsers,
        totalElements: staffUsers.length,
        totalPages: 1,
        size: staffUsers.length,
        number: 0,
        first: true,
        last: true,
        numberOfElements: staffUsers.length
      };
    } catch (error) {
      console.error('❌ Error fetching all staff:', error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 0,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 0
      };
    }
  }

  // Lấy nhân viên của chi nhánh với pagination - dành cho manager
  async getBranchStaff(branchId: number, params?: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.direction) queryParams.append('direction', params.direction);
      
      const url = `/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      // Nếu backend trả về paginated response
      if (response?.content && Array.isArray(response.content)) {
        // Filter chỉ lấy staff và managers của chi nhánh cụ thể
        const branchStaff = response.content.filter((user: User) => 
          user.roles && (user.roles.includes('ROLE_STAFF') || user.roles.includes('ROLE_MANAGER')) &&
          user.branchId === branchId
        );
        
        return {
          ...response,
          content: branchStaff,
          numberOfElements: branchStaff.length
        };
      }
      
      // Fallback cho trường hợp backend chưa hỗ trợ pagination
      const allUsers: User[] = Array.isArray(response) ? response : (response?.data || []);
      const branchStaff = allUsers.filter(user => 
        user.roles && (user.roles.includes('ROLE_STAFF') || user.roles.includes('ROLE_MANAGER')) &&
        user.branchId === branchId
      );
      
      return {
        content: branchStaff,
        totalElements: branchStaff.length,
        totalPages: 1,
        size: branchStaff.length,
        number: 0,
        first: true,
        last: true,
        numberOfElements: branchStaff.length
      };
    } catch (error) {
      console.error('❌ Error fetching branch staff:', error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 0,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 0
      };
    }
  }

  // Tạo người dùng mới
  async createUser(userData: UserCreateRequest): Promise<User> {
    try {
      console.log('🔄 Creating new user...', userData);
      const response = await apiClient.post('/accounts/staff', userData);
      console.log('✅ User created:', response);
      
      return response.data || response;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  // Cập nhật người dùng
  async updateUser(userId: number, userData: UserUpdateRequest): Promise<User> {
    try {
      console.log(`🔄 Updating user ${userId}...`, userData);
      const response = await apiClient.put(`/accounts/${userId}`, userData);
      console.log('✅ User updated:', response);
      
      return response.data || response;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  // Xóa người dùng (tạm thời không hỗ trợ vì backend chưa có endpoint)
  async deleteUser(userId: number): Promise<void> {
    try {
      console.log(`🔄 Deleting user ${userId}...`);
      // Tạm thời throw error vì backend chưa có endpoint delete
      throw new Error('Chức năng xóa người dùng chưa được hỗ trợ');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }

  // Khóa/Mở khóa tài khoản
  async toggleUserStatus(userId: number, status: 'ACTIVE' | 'INACTIVE' | 'LOCKED'): Promise<User> {
    try {
      console.log(`🔄 Toggling user ${userId} status to ${status}...`);
      const response = await apiClient.patch(`/accounts/${userId}/status`, { status });
      console.log('✅ User status updated:', response);
      
      return response.data || response;
    } catch (error) {
      console.error('❌ Error toggling user status:', error);
      throw error;
    }
  }

  // Lấy thống kê người dùng
  async getUserStats(): Promise<{
    totalUsers: number;
    totalStaff: number;
    totalManagers: number;
    activeUsers: number;
    inactiveUsers: number;
  }> {
    try {
      console.log('🔄 Fetching user stats...');
      // Tạm thời trả về mock data vì backend chưa có endpoint stats
      const response = {
        data: {
          totalUsers: 0,
          totalStaff: 0,
          totalManagers: 0,
          activeUsers: 0,
          inactiveUsers: 0
        }
      };
      console.log('✅ User stats response:', response);
      
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      return {
        totalUsers: 0,
        totalStaff: 0,
        totalManagers: 0,
        activeUsers: 0,
        inactiveUsers: 0
      };
    }
  }

  // Cập nhật vai trò người dùng
  async updateUserRole(userId: number, newRole: string): Promise<void> {
    try {
      console.log('🔄 Updating user role...', { userId, newRole });
      const response = await apiClient.patch(`/accounts/${userId}/role`, { roleName: newRole });
      console.log('✅ User role updated:', response);
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }
  }

  // Cập nhật chi nhánh người dùng
  async updateUserBranch(userId: number, branchId: number | undefined): Promise<void> {
    try {
      console.log('🔄 Updating user branch...', { userId, branchId });
      const response = await apiClient.put(`/accounts/${userId}`, { branchId });
      console.log('✅ User branch updated:', response);
    } catch (error) {
      console.error('❌ Error updating user branch:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái người dùng
  async updateUserStatus(userId: number, status: string): Promise<void> {
    try {
      console.log('🔄 Updating user status...', { userId, status });
      const response = await apiClient.patch(`/accounts/${userId}/status`, { status });
      console.log('✅ User status updated:', response);
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      throw error;
    }
  }

  // Lấy danh sách chi nhánh
  async getBranches(): Promise<Array<{id: number, name: string}>> {
    try {
      console.log('🔄 Fetching branches...');
      const data = await apiClient.get('/branches/all');
      console.log('✅ Branches fetched:', data);
      
      // Map từ BranchResponseDTO sang format đơn giản
      return data.map((branch: any) => ({
        id: branch.id,
        name: branch.name
      }));
    } catch (error) {
      console.error('❌ Error fetching branches:', error);
      throw error;
    }
  }
}

export default new UserManagementService();
