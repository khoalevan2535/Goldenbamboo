import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DeliveryAddressResponseDTO } from '../../interfaces/DeliveryAddressDTO';
import { deliveryAddressService } from '../../services/DeliveryAddressService';
import DeliveryAddressList from '../../components/delivery/DeliveryAddressList';
import DeliveryAddressForm from '../../components/delivery/DeliveryAddressForm';

const DeliveryAddressPage: React.FC = () => {
  const [addresses, setAddresses] = useState<DeliveryAddressResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddressResponseDTO | undefined>();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await deliveryAddressService.getDeliveryAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Error loading delivery addresses:', error);
      toast.error('Không thể tải danh sách địa chỉ giao hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingAddress(undefined);
    setShowForm(true);
  };

  const handleEdit = (address: DeliveryAddressResponseDTO) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleFormSave = (address: DeliveryAddressResponseDTO) => {
    setShowForm(false);
    setEditingAddress(undefined);
    loadAddresses();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAddress(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách địa chỉ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Địa chỉ giao hàng</h1>
                <p className="text-gray-600 mt-1">
                  Quản lý địa chỉ giao hàng của bạn
                </p>
              </div>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Thêm địa chỉ mới
              </button>
            </div>
          </div>

          <div className="p-6">
            {showForm ? (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAddress ? 'Chỉnh sửa địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng mới'}
                </h2>
                <DeliveryAddressForm
                  address={editingAddress}
                  onSave={handleFormSave}
                  onCancel={handleFormCancel}
                  isEditing={!!editingAddress}
                />
              </div>
            ) : (
              <DeliveryAddressList
                showActions={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddressPage;
