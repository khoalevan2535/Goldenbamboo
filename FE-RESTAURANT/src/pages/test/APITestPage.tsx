import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { deliveryAddressService } from '../../services/DeliveryAddressService';
import { DeliveryAddressRequestDTO } from '../../interfaces/DeliveryAddressDTO';

const APITestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCreateAddress = async () => {
    setLoading(true);
    try {
      const testAddress: DeliveryAddressRequestDTO = {
        recipientName: "Nguyễn Văn Test",
        phoneNumber: "0123456789",
        address: "123 Đường Test",
        province: "Hồ Chí Minh",
        district: "Quận 1",
        ward: "Phường Bến Nghé",
        notes: "Địa chỉ test",
        isDefault: true,
        branchId: 1
      };

      addResult("🔄 Đang tạo địa chỉ test...");
      const result = await deliveryAddressService.createDeliveryAddress(testAddress);
      addResult(`✅ Tạo địa chỉ thành công! ID: ${result.id}`);
      toast.success('Tạo địa chỉ thành công!');
    } catch (error: any) {
      addResult(`❌ Lỗi tạo địa chỉ: ${error.message || error}`);
      toast.error('Lỗi tạo địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const testGetAddresses = async () => {
    setLoading(true);
    try {
      addResult("🔄 Đang lấy danh sách địa chỉ...");
      const addresses = await deliveryAddressService.getDeliveryAddresses();
      addResult(`✅ Lấy danh sách thành công! Số lượng: ${addresses.length}`);
      toast.success(`Lấy được ${addresses.length} địa chỉ`);
    } catch (error: any) {
      addResult(`❌ Lỗi lấy danh sách: ${error.message || error}`);
      toast.error('Lỗi lấy danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const testCalculateShippingFee = async () => {
    setLoading(true);
    try {
      addResult("🔄 Đang lấy danh sách địa chỉ để test tính phí...");
      const addresses = await deliveryAddressService.getDeliveryAddresses();
      
      if (addresses.length === 0) {
        addResult("❌ Không có địa chỉ nào để test");
        return;
      }

      const firstAddress = addresses[0];
      addResult(`🔄 Đang tính phí vận chuyển cho địa chỉ ID: ${firstAddress.id}...`);
      
      const feeResult = await deliveryAddressService.calculateShippingFee(firstAddress.id);
      
      if (feeResult.success && feeResult.fee) {
        addResult(`✅ Tính phí thành công! Phí: ${feeResult.fee.fee} VNĐ`);
        toast.success(`Phí vận chuyển: ${feeResult.fee.fee} VNĐ`);
      } else {
        addResult(`❌ Lỗi tính phí: ${feeResult.message || 'Không xác định'}`);
        toast.error('Lỗi tính phí vận chuyển');
      }
    } catch (error: any) {
      addResult(`❌ Lỗi tính phí: ${error.message || error}`);
      toast.error('Lỗi tính phí vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  const testGetProvinces = async () => {
    setLoading(true);
    try {
      addResult("🔄 Đang lấy danh sách tỉnh/thành phố...");
      const provinces = await deliveryAddressService.getProvinces();
      addResult(`✅ Lấy danh sách tỉnh thành công! Số lượng: ${provinces.length}`);
      toast.success(`Lấy được ${provinces.length} tỉnh/thành phố`);
    } catch (error: any) {
      addResult(`❌ Lỗi lấy danh sách tỉnh: ${error.message || error}`);
      toast.error('Lỗi lấy danh sách tỉnh/thành phố');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test API Địa chỉ Giao hàng
          </h1>
          <p className="text-gray-600 mb-6">
            Trang test để kiểm tra các API endpoints của tính năng địa chỉ giao hàng
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={testCreateAddress}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Tạo Địa chỉ
            </button>
            <button
              onClick={testGetAddresses}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Lấy Danh sách
            </button>
            <button
              onClick={testCalculateShippingFee}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Tính Phí VC
            </button>
            <button
              onClick={testGetProvinces}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Lấy Tỉnh/TP
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {loading && "🔄 Đang xử lý..."}
            </div>
            <button
              onClick={clearResults}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Xóa Logs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Kết quả Test:
          </h2>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500">Chưa có kết quả test nào...</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            📝 Hướng dẫn Test:
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Tạo Địa chỉ:</strong> Test API tạo địa chỉ giao hàng mới</p>
            <p><strong>2. Lấy Danh sách:</strong> Test API lấy danh sách địa chỉ của user</p>
            <p><strong>3. Tính Phí VC:</strong> Test API tính phí vận chuyển với GHTK</p>
            <p><strong>4. Lấy Tỉnh/TP:</strong> Test API lấy danh sách tỉnh/thành phố</p>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-3">
            ⚠️ Lưu ý:
          </h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>• Cần đăng nhập để test các API</p>
            <p>• Backend phải chạy trên port 8080</p>
            <p>• Kiểm tra Console (F12) để xem chi tiết lỗi</p>
            <p>• Token GHTK: 2N0Uv6JWHdTCHUsuc2nfqFeXJ8cYtzyz6kGhtUo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITestPage;
