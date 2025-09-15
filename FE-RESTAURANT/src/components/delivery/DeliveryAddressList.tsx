import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DeliveryAddressResponseDTO } from '../../interfaces/DeliveryAddressDTO';
import { deliveryAddressService } from '../../services/DeliveryAddressService';
import DeliveryAddressForm from './DeliveryAddressForm';

interface DeliveryAddressListProps {
  onSelectAddress?: (address: DeliveryAddressResponseDTO) => void;
  selectedAddressId?: number;
  showActions?: boolean;
}

const DeliveryAddressList: React.FC<DeliveryAddressListProps> = ({
  onSelectAddress,
  selectedAddressId,
  showActions = true
}) => {
  const [addresses, setAddresses] = useState<DeliveryAddressResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddressResponseDTO | undefined>();
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const handleDelete = async (addressId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ giao hàng này?')) {
      return;
    }

    try {
      setDeletingId(addressId);
      await deliveryAddressService.deleteDeliveryAddress(addressId);
      toast.success('Xóa địa chỉ giao hàng thành công!');
      loadAddresses();
    } catch (error) {
      console.error('Error deleting delivery address:', error);
      toast.error('Không thể xóa địa chỉ giao hàng');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await deliveryAddressService.setDefaultAddress(addressId);
      toast.success('Đặt địa chỉ mặc định thành công!');
      loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Không thể đặt địa chỉ mặc định');
    }
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

  const handleAddressSelect = (address: DeliveryAddressResponseDTO) => {
    if (onSelectAddress) {
      onSelectAddress(address);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="delivery-address-form-container">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {editingAddress ? 'Chỉnh sửa địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng mới'}
          </h3>
        </div>
        <DeliveryAddressForm
          address={editingAddress}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          isEditing={!!editingAddress}
        />
      </div>
    );
  }

  return (
    <div className="delivery-address-list">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Địa chỉ giao hàng</h3>
        {showActions && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Thêm địa chỉ mới
          </button>
        )}
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Chưa có địa chỉ giao hàng</h3>
          <p className="text-sm text-gray-500 mb-4">Thêm địa chỉ giao hàng để có thể đặt hàng online</p>
          {showActions && (
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Thêm địa chỉ đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAddressId === address.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{address.recipientName}</h4>
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Mặc định
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{address.phoneNumber}</p>
                    <p>{address.fullAddress}</p>
                    {address.notes && (
                      <p className="text-gray-500 italic">Ghi chú: {address.notes}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Chi nhánh: {address.branchName}
                    </p>
                  </div>
                </div>

                {showActions && (
                  <div className="flex space-x-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(address.id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Đặt mặc định
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(address);
                      }}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      Chỉnh sửa
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(address.id);
                      }}
                      disabled={deletingId === address.id}
                      className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deletingId === address.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryAddressList;
