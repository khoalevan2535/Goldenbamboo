// import { apiClient } from '../utils/apiClient';

// Interface cho dữ liệu từ API Giao Hàng Tiết Kiệm
export interface GHTKProvince {
  id: string;
  name: string;
}

export interface GHTKDistrict {
  id: string;
  name: string;
  province_id: string;
}

export interface GHTKWard {
  id: string;
  name: string;
  district_id: string;
}

export interface GHTKAddress {
  id?: string;
  name?: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  hamlet?: string;
  recipientName?: string;
  phoneNumber?: string;
  phone?: string;
  note?: string;
}

export interface GHTKDeliveryFee {
  fee: number;
  insurance_fee: number;
  total_fee: number;
  estimated_delivery_time: string;
  distance?: number; // Khoảng cách tính bằng km
}

export interface GHTKOrderRequest {
  products: Array<{
    name: string;
    weight: number;
    quantity: number;
    price: number;
    product_code?: string;
  }>;
  order: {
    id: string;
    booking_id: string;
    pick_name: string;
    pick_address: string;
    pick_province: string;
    pick_district: string;
    pick_ward: string;
    pick_tel: string;
    name: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    hamlet: string;
    tel: string;
    note?: string;
    value: number;
    transport: string;
    pick_option: string;
    deliver_option: string;
    is_freeship: string;
    pick_money: number;
    pick_date?: string;
  };
}

export interface GHTKOrderResponse {
  success: boolean;
  message: string;
  order: {
    label: string;
    partner_id: string;
    status: string;
    fee: number;
    insurance_fee: number;
    estimated_pick_time: string;
    estimated_deliver_time: string;
  };
}

interface GHTKService {
  // Lấy danh sách tỉnh/thành phố
  getProvinces(): Promise<GHTKProvince[]>;
  
  // Lấy danh sách quận/huyện theo tỉnh
  getDistricts(provinceId: string): Promise<GHTKDistrict[]>;
  
  // Lấy danh sách phường/xã theo quận/huyện
  getWards(districtId: string): Promise<GHTKWard[]>;
  
  // Tính phí vận chuyển
  calculateDeliveryFee(address: GHTKAddress): Promise<GHTKDeliveryFee>;
  
  // Tìm kiếm địa chỉ
  searchAddress(query: string): Promise<GHTKAddress[]>;
  
  // Tạo đơn hàng GHTK
  createOrder(orderData: GHTKOrderRequest): Promise<GHTKOrderResponse>;
  
  // Test API connection
  testConnection(): Promise<boolean>;
}

class GHTKServiceImpl implements GHTKService {
  private readonly baseUrl = 'https://services.giaohangtietkiem.vn';
  private readonly token = (window as any).process?.env?.REACT_APP_GHTK_TOKEN || '2PTFBbdxAOlckOkaJteuXNMiwQCZ7ck6qQ99J2E'; // Token từ ảnh bạn gửi
  private readonly partnerCode = (window as any).process?.env?.REACT_APP_GHTK_PARTNER_CODE || 'S22737331'; // Partner code từ ảnh

  private getHeaders() {
    return {
      'Token': this.token,
      'X-Client-Source': this.partnerCode,
      'Content-Type': 'application/json'
    };
  }

  async getProvinces(): Promise<GHTKProvince[]> {
    try {
      // console.log('🌍 Fetching provinces from GHTK API...');
      
      // Gọi backend API để lấy danh sách tỉnh
      const backendUrl = (window as any).process?.env?.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${backendUrl}/client/orders/ghtk/provinces`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        // console.log('✅ Raw GHTK API response:', responseData);
        
        // Parse dữ liệu từ GHTK API - có thể là Object hoặc Array
        let provinces: GHTKProvince[] = [];
        
        if (Array.isArray(responseData)) {
          provinces = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // Nếu là Object, có thể có key 'data' hoặc 'provinces'
          if (responseData.data && Array.isArray(responseData.data)) {
            provinces = responseData.data;
          } else if (responseData.provinces && Array.isArray(responseData.provinces)) {
            provinces = responseData.provinces;
          } else {
            // Nếu là Object với các key là ID, convert thành Array
            provinces = Object.keys(responseData).map(key => ({
              id: key,
              name: responseData[key].name || responseData[key].title || key
            }));
          }
        }
        
        // console.log('✅ Parsed provinces:', provinces);
        
        // Nếu chỉ có 1 province, có thể API chưa hoạt động đúng, dùng mock data
        if (provinces.length <= 1) {
          console.warn('⚠️ API returned only 1 province, using mock data instead');
          return this.getMockProvinces();
        }
        
        console.log('✅ GHTK API: Loaded', provinces.length, 'provinces successfully');
        
        return provinces;
      } else {
        console.warn('⚠️ GHTK API failed, using mock data');
        return this.getMockProvinces();
      }
    } catch (error) {
      console.error('❌ Error fetching provinces:', error);
      // console.log('🔄 Using mock data as fallback');
      return this.getMockProvinces();
    }
  }

  async getDistricts(provinceId: string): Promise<GHTKDistrict[]> {
    try {
      console.log('🏙️ Fetching districts for province:', provinceId);
      
      // Gọi backend API để lấy danh sách quận/huyện
      const backendUrl = (window as any).process?.env?.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${backendUrl}/client/orders/ghtk/districts?provinceId=${provinceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Raw GHTK districts response:', responseData);
        
        // Parse dữ liệu từ GHTK API
        let districts: GHTKDistrict[] = [];
        
        if (Array.isArray(responseData)) {
          districts = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (responseData.data && Array.isArray(responseData.data)) {
            districts = responseData.data;
          } else if (responseData.districts && Array.isArray(responseData.districts)) {
            districts = responseData.districts;
          } else {
            // Convert Object thành Array
            districts = Object.keys(responseData).map(key => ({
              id: key,
              name: responseData[key].name || responseData[key].title || key,
              province_id: provinceId
            }));
          }
        }
        
        console.log('✅ Parsed districts:', districts);
        
        // Nếu chỉ có 1 district hoặc ít, có thể API chưa hoạt động đúng, dùng mock data
        if (districts.length <= 1) {
          console.warn('⚠️ API returned only 1 district, using mock data instead');
          return this.getMockDistricts(provinceId);
        }
        
        return districts;
      } else {
        console.warn('⚠️ GHTK API failed, using mock data');
      return this.getMockDistricts(provinceId);
      }
    } catch (error) {
      console.error('❌ Error fetching districts:', error);
      return this.getMockDistricts(provinceId);
    }
  }

  async getWards(districtId: string): Promise<GHTKWard[]> {
    try {
      console.log('🏘️ Fetching wards for district:', districtId);
      
      // Gọi backend API để lấy danh sách phường/xã
      const backendUrl = (window as any).process?.env?.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${backendUrl}/client/orders/ghtk/wards?districtId=${districtId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Raw GHTK wards response:', responseData);
        
        // Parse dữ liệu từ GHTK API
        let wards: GHTKWard[] = [];
        
        if (Array.isArray(responseData)) {
          wards = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (responseData.data && Array.isArray(responseData.data)) {
            wards = responseData.data;
          } else if (responseData.wards && Array.isArray(responseData.wards)) {
            wards = responseData.wards;
          } else {
            // Convert Object thành Array
            wards = Object.keys(responseData).map(key => ({
              id: key,
              name: responseData[key].name || responseData[key].title || key,
              district_id: districtId
            }));
          }
        }
        
        console.log('✅ Parsed wards:', wards);
        
        // Nếu chỉ có 1 ward hoặc ít, có thể API chưa hoạt động đúng, dùng mock data
        if (wards.length <= 1) {
          console.warn('⚠️ API returned only 1 ward, using mock data instead');
          return this.getMockWards(districtId);
        }
        
        return wards;
      } else {
        console.warn('⚠️ GHTK API failed, using mock data');
      return this.getMockWards(districtId);
      }
    } catch (error) {
      console.error('❌ Error fetching wards:', error);
      return this.getMockWards(districtId);
    }
  }

  async calculateDeliveryFee(address: GHTKAddress): Promise<GHTKDeliveryFee> {
    try {
      // Tính phí dựa trên khoảng cách từ chi nhánh
      const branchLocation = this.getBranchLocation(); // Vị trí chi nhánh
      const deliveryLocation = this.getLocationFromAddress(address); // Vị trí giao hàng
      
      const distance = this.calculateDistance(branchLocation, deliveryLocation);
      
      // Tính phí dựa trên khoảng cách
      let baseFee = 15000; // Phí cơ bản
      let estimatedTime = '1-2 ngày';
      
      if (distance <= 5) {
        // Trong thành phố (≤ 5km)
        baseFee = 15000;
        estimatedTime = '1 ngày';
      } else if (distance <= 15) {
        // Ngoại thành (5-15km)
        baseFee = 25000;
        estimatedTime = '1-2 ngày';
      } else if (distance <= 50) {
        // Tỉnh lân cận (15-50km)
        baseFee = 35000;
        estimatedTime = '2-3 ngày';
      } else {
        // Xa hơn (> 50km)
        baseFee = 50000;
        estimatedTime = '3-5 ngày';
      }
      
      // Phí theo cân nặng (mock)
      const weight = 1000; // gram
      const weightFee = Math.ceil(weight / 1000) * 2000;
      const totalFee = baseFee + weightFee;
      
      return {
        fee: baseFee,
        insurance_fee: 0,
        total_fee: totalFee,
        estimated_delivery_time: estimatedTime,
        distance: distance
      };
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      throw error;
    }
  }

  // Helper methods for distance calculation
  private getBranchLocation() {
    // Mock vị trí chi nhánh (Cần Thơ)
    return {
      lat: 10.0452,
      lng: 105.7469
    };
  }

  private getLocationFromAddress(address: GHTKAddress) {
    // Mock vị trí dựa trên tỉnh/thành phố
    const locationMap: { [key: string]: { lat: number, lng: number } } = {
      '1': { lat: 21.0285, lng: 105.8542 }, // Hà Nội
      '2': { lat: 10.8231, lng: 106.6297 }, // TP.HCM
      '3': { lat: 10.0452, lng: 105.7469 }, // Cần Thơ
      '61': { lat: 16.0544, lng: 108.2022 }, // Đà Nẵng
      '62': { lat: 20.8449, lng: 106.6881 }, // Hải Phòng
    };
    
    return locationMap[address.province] || { lat: 10.0452, lng: 105.7469 }; // Default: Cần Thơ
  }

  private calculateDistance(loc1: { lat: number, lng: number }, loc2: { lat: number, lng: number }) {
    // Haversine formula để tính khoảng cách
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = this.toRadians(loc2.lat - loc1.lat);
    const dLng = this.toRadians(loc2.lng - loc1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(loc1.lat)) * Math.cos(this.toRadians(loc2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Làm tròn 1 chữ số thập phân
  }

  private toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  async searchAddress(query: string): Promise<GHTKAddress[]> {
    try {
      // Sử dụng API tìm kiếm địa chỉ hoặc mock data
      return this.getMockAddresses(query);
    } catch (error) {
      console.error('Error searching address:', error);
      return [];
    }
  }

  async createOrder(orderData: GHTKOrderRequest): Promise<GHTKOrderResponse> {
    try {
      console.log('🚚 Creating GHTK order with data:', orderData);
      
      // Gọi backend API thay vì gọi trực tiếp GHTK API
      const backendUrl = (window as any).process?.env?.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${backendUrl}/ghtk/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      console.log('📡 Backend API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend API error response:', errorText);
        throw new Error(`Backend API error! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ GHTK order created successfully via backend:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error creating GHTK order:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing GHTK API connection via backend...');
      
      // Gọi backend API để test connection
      const backendUrl = (window as any).process?.env?.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${backendUrl}/ghtk/test-connection`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Backend test response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ GHTK API connection test result:', result);
        return result;
      } else {
        console.error('❌ Backend test connection failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend test connection error:', error);
      return false;
    }
  }

  // Mock data methods - thay thế bằng API thực tế
  private getMockProvinces(): GHTKProvince[] {
    // console.log('🔄 Loading mock provinces data...');
    const mockData = [
      { id: '1', name: 'Thành phố Hà Nội' },
      { id: '2', name: 'Thành phố Hồ Chí Minh' },
      { id: '3', name: 'Thành phố Cần Thơ' },
      { id: '4', name: 'Tỉnh An Giang' },
      { id: '5', name: 'Tỉnh Bà Rịa - Vũng Tàu' },
      { id: '6', name: 'Tỉnh Bạc Liêu' },
      { id: '7', name: 'Tỉnh Bắc Giang' },
      { id: '8', name: 'Tỉnh Bắc Kạn' },
      { id: '9', name: 'Tỉnh Bắc Ninh' },
      { id: '10', name: 'Tỉnh Bến Tre' },
      { id: '11', name: 'Tỉnh Bình Dương' },
      { id: '12', name: 'Tỉnh Bình Phước' },
      { id: '13', name: 'Tỉnh Bình Thuận' },
      { id: '14', name: 'Tỉnh Cà Mau' },
      { id: '15', name: 'Tỉnh Cao Bằng' },
      { id: '16', name: 'Tỉnh Đắk Lắk' },
      { id: '17', name: 'Tỉnh Đắk Nông' },
      { id: '18', name: 'Tỉnh Điện Biên' },
      { id: '19', name: 'Tỉnh Đồng Nai' },
      { id: '20', name: 'Tỉnh Đồng Tháp' },
      { id: '21', name: 'Tỉnh Gia Lai' },
      { id: '22', name: 'Tỉnh Hà Giang' },
      { id: '23', name: 'Tỉnh Hà Nam' },
      { id: '24', name: 'Tỉnh Hà Tĩnh' },
      { id: '25', name: 'Tỉnh Hải Dương' },
      { id: '26', name: 'Tỉnh Hậu Giang' },
      { id: '27', name: 'Tỉnh Hòa Bình' },
      { id: '28', name: 'Tỉnh Hưng Yên' },
      { id: '29', name: 'Tỉnh Khánh Hòa' },
      { id: '30', name: 'Tỉnh Kiên Giang' },
      { id: '31', name: 'Tỉnh Kon Tum' },
      { id: '32', name: 'Tỉnh Lai Châu' },
      { id: '33', name: 'Tỉnh Lâm Đồng' },
      { id: '34', name: 'Tỉnh Lạng Sơn' },
      { id: '35', name: 'Tỉnh Lào Cai' },
      { id: '36', name: 'Tỉnh Long An' },
      { id: '37', name: 'Tỉnh Nam Định' },
      { id: '38', name: 'Tỉnh Nghệ An' },
      { id: '39', name: 'Tỉnh Ninh Bình' },
      { id: '40', name: 'Tỉnh Ninh Thuận' },
      { id: '41', name: 'Tỉnh Phú Thọ' },
      { id: '42', name: 'Tỉnh Phú Yên' },
      { id: '43', name: 'Tỉnh Quảng Bình' },
      { id: '44', name: 'Tỉnh Quảng Nam' },
      { id: '45', name: 'Tỉnh Quảng Ngãi' },
      { id: '46', name: 'Tỉnh Quảng Ninh' },
      { id: '47', name: 'Tỉnh Quảng Trị' },
      { id: '48', name: 'Tỉnh Sóc Trăng' },
      { id: '49', name: 'Tỉnh Sơn La' },
      { id: '50', name: 'Tỉnh Tây Ninh' },
      { id: '51', name: 'Tỉnh Thái Bình' },
      { id: '52', name: 'Tỉnh Thái Nguyên' },
      { id: '53', name: 'Tỉnh Thanh Hóa' },
      { id: '54', name: 'Tỉnh Thừa Thiên Huế' },
      { id: '55', name: 'Tỉnh Tiền Giang' },
      { id: '56', name: 'Tỉnh Trà Vinh' },
      { id: '57', name: 'Tỉnh Tuyên Quang' },
      { id: '58', name: 'Tỉnh Vĩnh Long' },
      { id: '59', name: 'Tỉnh Vĩnh Phúc' },
      { id: '60', name: 'Tỉnh Yên Bái' },
      { id: '61', name: 'Thành phố Đà Nẵng' },
      { id: '62', name: 'Thành phố Hải Phòng' },
      { id: '63', name: 'Thành phố Thái Nguyên' }
    ];
    console.log('✅ Mock data: Loaded', mockData.length, 'provinces');
    return mockData;
  }

  private getMockDistricts(provinceId: string): GHTKDistrict[] {
    // console.log('🔄 Loading mock districts for province:', provinceId);
    const districts: { [key: string]: GHTKDistrict[] } = {
      '1': [ // Hà Nội
        { id: '1', name: 'Quận Ba Đình', province_id: '1' },
        { id: '2', name: 'Quận Hoàn Kiếm', province_id: '1' },
        { id: '3', name: 'Quận Tây Hồ', province_id: '1' },
        { id: '4', name: 'Quận Long Biên', province_id: '1' },
        { id: '5', name: 'Quận Cầu Giấy', province_id: '1' },
        { id: '6', name: 'Quận Đống Đa', province_id: '1' },
        { id: '7', name: 'Quận Hai Bà Trưng', province_id: '1' },
        { id: '8', name: 'Quận Hoàng Mai', province_id: '1' },
        { id: '9', name: 'Quận Thanh Xuân', province_id: '1' },
        { id: '10', name: 'Quận Nam Từ Liêm', province_id: '1' },
        { id: '11', name: 'Quận Bắc Từ Liêm', province_id: '1' },
        { id: '12', name: 'Quận Hà Đông', province_id: '1' },
        { id: '13', name: 'Quận Sơn Tây', province_id: '1' }
      ],
      '2': [ // TP.HCM
        { id: '20', name: 'Quận 1', province_id: '2' },
        { id: '21', name: 'Quận 2', province_id: '2' },
        { id: '22', name: 'Quận 3', province_id: '2' },
        { id: '23', name: 'Quận 4', province_id: '2' },
        { id: '24', name: 'Quận 5', province_id: '2' },
        { id: '25', name: 'Quận 6', province_id: '2' },
        { id: '26', name: 'Quận 7', province_id: '2' },
        { id: '27', name: 'Quận 8', province_id: '2' },
        { id: '28', name: 'Quận 9', province_id: '2' },
        { id: '29', name: 'Quận 10', province_id: '2' },
        { id: '30', name: 'Quận 11', province_id: '2' },
        { id: '31', name: 'Quận 12', province_id: '2' },
        { id: '32', name: 'Quận Thủ Đức', province_id: '2' },
        { id: '33', name: 'Quận Gò Vấp', province_id: '2' },
        { id: '34', name: 'Quận Bình Thạnh', province_id: '2' },
        { id: '35', name: 'Quận Tân Bình', province_id: '2' },
        { id: '36', name: 'Quận Tân Phú', province_id: '2' },
        { id: '37', name: 'Quận Phú Nhuận', province_id: '2' }
      ],
      '3': [ // Cần Thơ
        { id: '40', name: 'Quận Ninh Kiều', province_id: '3' },
        { id: '41', name: 'Quận Ô Môn', province_id: '3' },
        { id: '42', name: 'Quận Bình Thủy', province_id: '3' },
        { id: '43', name: 'Quận Cái Răng', province_id: '3' },
        { id: '44', name: 'Quận Thốt Nốt', province_id: '3' },
        { id: '45', name: 'Huyện Vĩnh Thạnh', province_id: '3' },
        { id: '46', name: 'Huyện Cờ Đỏ', province_id: '3' },
        { id: '47', name: 'Huyện Phong Điền', province_id: '3' },
        { id: '48', name: 'Huyện Thới Lai', province_id: '3' }
      ],
      '4': [ // An Giang
        { id: '50', name: 'Thành phố Long Xuyên', province_id: '4' },
        { id: '51', name: 'Thành phố Châu Đốc', province_id: '4' },
        { id: '52', name: 'Huyện An Phú', province_id: '4' },
        { id: '53', name: 'Huyện Châu Phú', province_id: '4' },
        { id: '54', name: 'Huyện Châu Thành', province_id: '4' },
        { id: '55', name: 'Huyện Chợ Mới', province_id: '4' },
        { id: '56', name: 'Huyện Phú Tân', province_id: '4' },
        { id: '57', name: 'Huyện Thoại Sơn', province_id: '4' },
        { id: '58', name: 'Huyện Tri Tôn', province_id: '4' },
        { id: '59', name: 'Huyện Tịnh Biên', province_id: '4' }
      ],
      '5': [ // Bà Rịa - Vũng Tàu
        { id: '60', name: 'Thành phố Vũng Tàu', province_id: '5' },
        { id: '61', name: 'Thành phố Bà Rịa', province_id: '5' },
        { id: '62', name: 'Huyện Châu Đức', province_id: '5' },
        { id: '63', name: 'Huyện Côn Đảo', province_id: '5' },
        { id: '64', name: 'Huyện Đất Đỏ', province_id: '5' },
        { id: '65', name: 'Huyện Long Điền', province_id: '5' },
        { id: '66', name: 'Huyện Tân Thành', province_id: '5' },
        { id: '67', name: 'Huyện Xuyên Mộc', province_id: '5' }
      ],
      '61': [ // Đà Nẵng
        { id: '70', name: 'Quận Hải Châu', province_id: '61' },
        { id: '71', name: 'Quận Thanh Khê', province_id: '61' },
        { id: '72', name: 'Quận Sơn Trà', province_id: '61' },
        { id: '73', name: 'Quận Ngũ Hành Sơn', province_id: '61' },
        { id: '74', name: 'Quận Liên Chiểu', province_id: '61' },
        { id: '75', name: 'Quận Cẩm Lệ', province_id: '61' },
        { id: '76', name: 'Huyện Hòa Vang', province_id: '61' },
        { id: '77', name: 'Huyện Hoàng Sa', province_id: '61' }
      ],
      '62': [ // Hải Phòng
        { id: '80', name: 'Quận Hồng Bàng', province_id: '62' },
        { id: '81', name: 'Quận Ngô Quyền', province_id: '62' },
        { id: '82', name: 'Quận Lê Chân', province_id: '62' },
        { id: '83', name: 'Quận Hải An', province_id: '62' },
        { id: '84', name: 'Quận Kiến An', province_id: '62' },
        { id: '85', name: 'Quận Đồ Sơn', province_id: '62' },
        { id: '86', name: 'Quận Dương Kinh', province_id: '62' },
        { id: '87', name: 'Huyện Thuỷ Nguyên', province_id: '62' },
        { id: '88', name: 'Huyện An Dương', province_id: '62' },
        { id: '89', name: 'Huyện An Lão', province_id: '62' },
        { id: '90', name: 'Huyện Kiến Thuỵ', province_id: '62' },
        { id: '91', name: 'Huyện Tiên Lãng', province_id: '62' },
        { id: '92', name: 'Huyện Vĩnh Bảo', province_id: '62' },
        { id: '93', name: 'Huyện Cát Hải', province_id: '62' },
        { id: '94', name: 'Huyện Bạch Long Vĩ', province_id: '62' }
      ]
    };
    
    const result = districts[provinceId] || [];
    // console.log('✅ Mock districts loaded:', result.length, 'districts for province', provinceId);
    return result;
  }

  private getMockWards(districtId: string): GHTKWard[] {
    // console.log('🔄 Loading mock wards for district:', districtId);
    const wards: { [key: string]: GHTKWard[] } = {
      '1': [ // Ba Đình
        { id: '1', name: 'Phường Phúc Xá', district_id: '1' },
        { id: '2', name: 'Phường Trúc Bạch', district_id: '1' },
        { id: '3', name: 'Phường Vĩnh Phú', district_id: '1' },
        { id: '4', name: 'Phường Cống Vị', district_id: '1' },
        { id: '5', name: 'Phường Liễu Giai', district_id: '1' },
        { id: '6', name: 'Phường Nguyễn Trung Trực', district_id: '1' },
        { id: '7', name: 'Phường Quán Thánh', district_id: '1' },
        { id: '8', name: 'Phường Ngọc Hà', district_id: '1' },
        { id: '9', name: 'Phường Điện Biên', district_id: '1' },
        { id: '10', name: 'Phường Đội Cấn', district_id: '1' }
      ],
      '2': [ // Hoàn Kiếm
        { id: '11', name: 'Phường Phúc Tân', district_id: '2' },
        { id: '12', name: 'Phường Đồng Xuân', district_id: '2' },
        { id: '13', name: 'Phường Hàng Mã', district_id: '2' },
        { id: '14', name: 'Phường Hàng Buồm', district_id: '2' },
        { id: '15', name: 'Phường Hàng Đào', district_id: '2' },
        { id: '16', name: 'Phường Hàng Bồ', district_id: '2' },
        { id: '17', name: 'Phường Cửa Đông', district_id: '2' },
        { id: '18', name: 'Phường Lý Thái Tổ', district_id: '2' },
        { id: '19', name: 'Phường Hàng Bạc', district_id: '2' },
        { id: '20', name: 'Phường Hàng Gai', district_id: '2' }
      ],
      '20': [ // Quận 1 TP.HCM
        { id: '100', name: 'Phường Tân Định', district_id: '20' },
        { id: '101', name: 'Phường Đa Kao', district_id: '20' },
        { id: '102', name: 'Phường Bến Nghé', district_id: '20' },
        { id: '103', name: 'Phường Bến Thành', district_id: '20' },
        { id: '104', name: 'Phường Nguyễn Thái Bình', district_id: '20' },
        { id: '105', name: 'Phường Phạm Ngũ Lão', district_id: '20' },
        { id: '106', name: 'Phường Cầu Ông Lãnh', district_id: '20' },
        { id: '107', name: 'Phường Cô Giang', district_id: '20' },
        { id: '108', name: 'Phường Nguyễn Cư Trinh', district_id: '20' },
        { id: '109', name: 'Phường Cầu Kho', district_id: '20' }
      ],
      '21': [ // Quận 2 TP.HCM
        { id: '110', name: 'Phường Thủ Thiêm', district_id: '21' },
        { id: '111', name: 'Phường An Phú', district_id: '21' },
        { id: '112', name: 'Phường An Khánh', district_id: '21' },
        { id: '113', name: 'Phường Bình An', district_id: '21' },
        { id: '114', name: 'Phường Bình Khánh', district_id: '21' },
        { id: '115', name: 'Phường Bình Trưng Đông', district_id: '21' },
        { id: '116', name: 'Phường Bình Trưng Tây', district_id: '21' },
        { id: '117', name: 'Phường Cát Lái', district_id: '21' },
        { id: '118', name: 'Phường Thạnh Mỹ Lợi', district_id: '21' },
        { id: '119', name: 'Phường Thảo Điền', district_id: '21' }
      ],
      '40': [ // Ninh Kiều Cần Thơ
        { id: '200', name: 'Phường Cái Khế', district_id: '40' },
        { id: '201', name: 'Phường An Hòa', district_id: '40' },
        { id: '202', name: 'Phường Thới Bình', district_id: '40' },
        { id: '203', name: 'Phường An Nghiệp', district_id: '40' },
        { id: '204', name: 'Phường An Cư', district_id: '40' },
        { id: '205', name: 'Phường Tân An', district_id: '40' },
        { id: '206', name: 'Phường An Phú', district_id: '40' },
        { id: '207', name: 'Phường Xuân Khánh', district_id: '40' },
        { id: '208', name: 'Phường Hưng Lợi', district_id: '40' },
        { id: '209', name: 'Phường An Khánh', district_id: '40' }
      ],
      '70': [ // Hải Châu Đà Nẵng
        { id: '300', name: 'Phường Thạch Thang', district_id: '70' },
        { id: '301', name: 'Phường Hải Châu I', district_id: '70' },
        { id: '302', name: 'Phường Hải Châu II', district_id: '70' },
        { id: '303', name: 'Phường Phước Ninh', district_id: '70' },
        { id: '304', name: 'Phường Hòa Thuận Tây', district_id: '70' },
        { id: '305', name: 'Phường Hòa Thuận Đông', district_id: '70' },
        { id: '306', name: 'Phường Nam Dương', district_id: '70' },
        { id: '307', name: 'Phường Bình Hiên', district_id: '70' },
        { id: '308', name: 'Phường Bình Thuận', district_id: '70' },
        { id: '309', name: 'Phường Hòa Cường Bắc', district_id: '70' },
        { id: '310', name: 'Phường Hòa Cường Nam', district_id: '70' }
      ],
      '80': [ // Hồng Bàng Hải Phòng
        { id: '400', name: 'Phường Quán Toan', district_id: '80' },
        { id: '401', name: 'Phường Hùng Vương', district_id: '80' },
        { id: '402', name: 'Phường Sở Dầu', district_id: '80' },
        { id: '403', name: 'Phường Thượng Lý', district_id: '80' },
        { id: '404', name: 'Phường Hạ Lý', district_id: '80' },
        { id: '405', name: 'Phường Minh Khai', district_id: '80' },
        { id: '406', name: 'Phường Trại Cau', district_id: '80' },
        { id: '407', name: 'Phường Lê Lợi', district_id: '80' },
        { id: '408', name: 'Phường Đông Khê', district_id: '80' },
        { id: '409', name: 'Phường Cầu Đất', district_id: '80' },
        { id: '410', name: 'Phường Lạc Viên', district_id: '80' }
      ]
    };
    
    const result = wards[districtId] || [];
    // console.log('✅ Mock wards loaded:', result.length, 'wards for district', districtId);
    return result;
  }

  private getMockAddresses(query: string): GHTKAddress[] {
    // Mock search results
    const mockAddresses: GHTKAddress[] = [
      {
        id: '1',
        name: 'Nhà riêng',
        address: '123 Đường ABC, Phường XYZ',
        province: 'Thành phố Cần Thơ',
        district: 'Quận Ninh Kiều',
        ward: 'Phường Cái Khế',
        phone: '0865031912',
        note: 'Địa chỉ giao hàng chính'
      }
    ];
    
    return mockAddresses.filter(addr => 
      addr.address.toLowerCase().includes(query.toLowerCase()) ||
      addr.province.toLowerCase().includes(query.toLowerCase()) ||
      addr.district.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const ghtkService: GHTKService = new GHTKServiceImpl();

// Types are already exported above
