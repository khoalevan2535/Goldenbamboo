import apiClient from '../utils/apiClient';
import { 
  DeliveryAddressRequestDTO, 
  DeliveryAddressResponseDTO, 
  GHTKResponseDTO,
  ProvinceDTO,
  DistrictDTO,
  WardDTO
} from '../interfaces/DeliveryAddressDTO';

class DeliveryAddressService {
  private baseUrl = '/api/delivery-addresses';

  /**
   * Tạo địa chỉ giao hàng mới
   */
  async createDeliveryAddress(data: DeliveryAddressRequestDTO): Promise<DeliveryAddressResponseDTO> {
    const response = await apiClient.post(this.baseUrl, data);
    return response;
  }

  /**
   * Lấy danh sách địa chỉ giao hàng của tài khoản
   */
  async getDeliveryAddresses(): Promise<DeliveryAddressResponseDTO[]> {
    const response = await apiClient.get(this.baseUrl);
    return response;
  }

  /**
   * Lấy địa chỉ giao hàng theo ID
   */
  async getDeliveryAddressById(addressId: number): Promise<DeliveryAddressResponseDTO> {
    const response = await apiClient.get(`${this.baseUrl}/${addressId}`);
    return response;
  }

  /**
   * Cập nhật địa chỉ giao hàng
   */
  async updateDeliveryAddress(addressId: number, data: DeliveryAddressRequestDTO): Promise<DeliveryAddressResponseDTO> {
    const response = await apiClient.put(`${this.baseUrl}/${addressId}`, data);
    return response;
  }

  /**
   * Xóa địa chỉ giao hàng
   */
  async deleteDeliveryAddress(addressId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${addressId}`);
  }

  /**
   * Đặt địa chỉ làm mặc định
   */
  async setDefaultAddress(addressId: number): Promise<DeliveryAddressResponseDTO> {
    const response = await apiClient.put(`${this.baseUrl}/${addressId}/set-default`);
    return response;
  }

  /**
   * Tính phí vận chuyển
   */
  async calculateShippingFee(addressId: number): Promise<GHTKResponseDTO> {
    const response = await apiClient.get(`${this.baseUrl}/${addressId}/shipping-fee`);
    return response;
  }

  /**
   * Lấy danh sách tỉnh/thành phố từ API công khai
   */
  async getProvinces(): Promise<ProvinceDTO[]> {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      return await response.json();
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách quận/huyện theo tỉnh/thành phố
   */
  async getDistricts(provinceId: string): Promise<DistrictDTO[]> {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
      const data = await response.json();
      return data.districts || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách phường/xã theo quận/huyện
   */
  async getWards(districtId: string): Promise<WardDTO[]> {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`);
      const data = await response.json();
      return data.wards || [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  }

  /**
   * Tìm kiếm địa chỉ theo từ khóa
   */
  async searchAddresses(query: string): Promise<DeliveryAddressResponseDTO[]> {
    const addresses = await this.getDeliveryAddresses();
    return addresses.filter(address => 
      address.recipientName.toLowerCase().includes(query.toLowerCase()) ||
      address.address.toLowerCase().includes(query.toLowerCase()) ||
      address.phoneNumber.includes(query)
    );
  }

  /**
   * Lấy địa chỉ mặc định
   */
  async getDefaultAddress(): Promise<DeliveryAddressResponseDTO | null> {
    const addresses = await this.getDeliveryAddresses();
    return addresses.find(address => address.isDefault) || null;
  }

  /**
   * Theo dõi đơn hàng
   */
  async trackOrder(trackingNumber: string): Promise<GHTKResponseDTO> {
    const response = await apiClient.get(`${this.baseUrl}/track/${trackingNumber}`);
    return response;
  }

  /**
   * Tạo đơn hàng giao hàng
   */
  async createShippingOrder(addressId: number, orderId: string, weight: number, value: number): Promise<GHTKResponseDTO> {
    const response = await apiClient.post(`${this.baseUrl}/${addressId}/create-shipping-order`, null, {
      params: {
        orderId,
        weight,
        value
      }
    });
    return response;
  }

  /**
   * Validate địa chỉ giao hàng
   */
  validateDeliveryAddress(data: DeliveryAddressRequestDTO): string[] {
    const errors: string[] = [];

    if (!data.recipientName?.trim()) {
      errors.push('Tên người nhận không được để trống');
    }

    if (!data.phoneNumber?.trim()) {
      errors.push('Số điện thoại không được để trống');
    } else if (!/^[0-9]{10,11}$/.test(data.phoneNumber)) {
      errors.push('Số điện thoại phải có 10-11 chữ số');
    }

    if (!data.address?.trim()) {
      errors.push('Địa chỉ không được để trống');
    }

    if (!data.province?.trim()) {
      errors.push('Tỉnh/Thành phố không được để trống');
    }

    if (!data.district?.trim()) {
      errors.push('Quận/Huyện không được để trống');
    }

    if (!data.ward?.trim()) {
      errors.push('Phường/Xã không được để trống');
    }

    if (!data.branchId) {
      errors.push('Chi nhánh không được để trống');
    }

    return errors;
  }
}

export const deliveryAddressService = new DeliveryAddressService();
export default deliveryAddressService;
