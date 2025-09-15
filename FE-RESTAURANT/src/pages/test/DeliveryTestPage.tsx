import React, { useState } from 'react';
import { toast } from 'react-toastify';
import DeliveryAddressSelector from '../../components/delivery/DeliveryAddressSelector';
import DeliveryAddressList from '../../components/delivery/DeliveryAddressList';
import { DeliveryAddressResponseDTO } from '../../interfaces/DeliveryAddressDTO';

const DeliveryTestPage: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddressResponseDTO | null>(null);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [showSelector, setShowSelector] = useState(true);

  const handleAddressSelect = (address: DeliveryAddressResponseDTO, fee?: number) => {
    setSelectedAddress(address);
    setShippingFee(fee || 0);
    toast.success(`Đã chọn địa chỉ: ${address.recipientName}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚚 Test Tính năng Địa chỉ Giao hàng
          </h1>
          <p className="text-gray-600 mb-6">
            Trang test để kiểm tra tính năng địa chỉ giao hàng với GHTK API
          </p>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setShowSelector(true)}
              className={`px-4 py-2 rounded-md ${
                showSelector 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Chọn Địa chỉ
            </button>
            <button
              onClick={() => setShowSelector(false)}
              className={`px-4 py-2 rounded-md ${
                !showSelector 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Quản lý Địa chỉ
            </button>
          </div>
        </div>

        {showSelector ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🎯 Test Chọn Địa chỉ Giao hàng
            </h2>
            
            <DeliveryAddressSelector
              onAddressSelect={handleAddressSelect}
              selectedAddressId={selectedAddress?.id}
              showShippingFee={true}
            />

            {selectedAddress && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  ✅ Địa chỉ đã chọn:
                </h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Tên:</strong> {selectedAddress.recipientName}</p>
                  <p><strong>SĐT:</strong> {selectedAddress.phoneNumber}</p>
                  <p><strong>Địa chỉ:</strong> {selectedAddress.fullAddress}</p>
                  <p><strong>Chi nhánh:</strong> {selectedAddress.branchName}</p>
                  {shippingFee > 0 && (
                    <p><strong>Phí vận chuyển:</strong> {formatPrice(shippingFee)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📋 Test Quản lý Địa chỉ Giao hàng
            </h2>
            
            <DeliveryAddressList
              showActions={true}
            />
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            📝 Hướng dẫn Test:
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. Quản lý Địa chỉ:</strong> Thêm, sửa, xóa địa chỉ giao hàng</p>
            <p><strong>2. Chọn Địa chỉ:</strong> Chọn địa chỉ và xem phí vận chuyển tự động</p>
            <p><strong>3. GHTK API:</strong> Hệ thống sẽ gọi API GHTK để tính phí vận chuyển</p>
            <p><strong>4. Validation:</strong> Kiểm tra validation form và error handling</p>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-3">
            ⚠️ Lưu ý:
          </h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>• Cần đăng nhập để sử dụng tính năng</p>
            <p>• Đảm bảo backend đang chạy trên port 8080</p>
            <p>• Token GHTK: 2N0Uv6JWHdTCHUsuc2nfqFeXJ8cYtzyz6kGhtUo</p>
            <p>• Kiểm tra Console (F12) để xem logs và errors</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTestPage;
