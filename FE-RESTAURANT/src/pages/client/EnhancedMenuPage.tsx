import React, { useState, useEffect } from 'react';
import { menuServiceV2 } from '../../services/MenuServiceV2';
import { ClientBranchDTO } from '../../interfaces/ClientBranchDTO';
import { ClientCategoryWithCountsDTO } from '../../interfaces/ClientCategoryWithCountsDTO';
import { ClientMenuItemDTO } from '../../interfaces/ClientMenuItemDTO';
import { useEnhancedCart } from '../../context/EnhancedCartContext';
import { useCartInitialization } from '../../hooks/useCartInitialization';
import { BranchSelector } from '../../components/menu/BranchSelector';
import { MenuFilter } from '../../components/menu/MenuFilter';
import { MenuGrid } from '../../components/menu/MenuGrid';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { CartIcon } from '../../components/cart/CartIcon';
import { CartInitializationStatus } from '../../components/cart/CartInitializationStatus';
import { CheckoutModal } from '../../components/checkout/CheckoutModal';
import { OrderSuccessModal } from '../../components/checkout/OrderSuccessModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const EnhancedMenuPage: React.FC = () => {
  // State
  const [branches, setBranches] = useState<ClientBranchDTO[]>([]);
  const [categories, setCategories] = useState<ClientCategoryWithCountsDTO[]>([]);
  const [menuItems, setMenuItems] = useState<ClientMenuItemDTO[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);
  const [successTotalAmount, setSuccessTotalAmount] = useState<number>(0);
  
  // Loading states
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { state: cartState } = useEnhancedCart();
  
  // Tự động khởi tạo giỏ hàng
  const { isInitialized: cartInitialized, isLoading: cartLoading, error: cartError } = useCartInitialization();

  // Load branches on mount
  useEffect(() => {
    loadBranches();
  }, []);

  // Load categories when branch changes
  useEffect(() => {
    if (selectedBranchId) {
      loadCategories();
    }
  }, [selectedBranchId]);

  // Load menu items when filters change
  useEffect(() => {
    if (selectedBranchId) {
      loadMenuItems();
    }
  }, [selectedBranchId, selectedCategoryId, selectedType, searchQuery, sortBy]);

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      setError(null);
      const data = await menuServiceV2.getActiveBranches();
      setBranches(data);
      
      // Auto-select first branch if available
      if (data.length > 0 && !selectedBranchId) {
        setSelectedBranchId(data[0].id);
      }
    } catch (error) {
      setError('Không thể tải danh sách chi nhánh');
      console.error('Failed to load branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const loadCategories = async () => {
    if (!selectedBranchId) return;

    try {
      setLoadingCategories(true);
      setError(null);
      const data = await menuServiceV2.getBranchScopedCategories({
        branchId: selectedBranchId,
        includeCounts: true,
        showEmpty: false,
      });
      setCategories(data);
    } catch (error) {
      setError('Không thể tải danh mục');
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadMenuItems = async () => {
    if (!selectedBranchId) return;

    try {
      setLoadingMenuItems(true);
      setError(null);
      const response = await menuServiceV2.getMenuItems({
        branchId: selectedBranchId,
        categoryId: selectedCategoryId,
        type: selectedType,
        search: searchQuery || undefined,
        page: 0,
        pageSize: 50,
        sort: sortBy,
      });
      setMenuItems(response.content);
    } catch (error) {
      setError('Không thể tải danh sách món ăn');
      console.error('Failed to load menu items:', error);
    } finally {
      setLoadingMenuItems(false);
    }
  };

  const handleBranchChange = (branchId: number) => {
    setSelectedBranchId(branchId);
    setSelectedCategoryId(undefined);
    setSelectedType(undefined);
    setSearchQuery('');
  };

  const handleCategoryChange = (categoryId?: number) => {
    setSelectedCategoryId(categoryId);
  };

  const handleTypeChange = (type?: string) => {
    setSelectedType(type);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (orderId: number) => {
    setIsCheckoutOpen(false);
    setSuccessOrderId(orderId);
    setSuccessTotalAmount(cartState.cart?.totalAmount || 0);
    setIsSuccessOpen(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccessOpen(false);
    setSuccessOrderId(null);
    setSuccessTotalAmount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Thực đơn</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm món ăn..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Cart Icon */}
              <CartIcon onClick={() => setIsCartOpen(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Branch Selector */}
        <BranchSelector
          branches={branches}
          selectedBranchId={selectedBranchId}
          onBranchChange={handleBranchChange}
          loading={loadingBranches}
        />

        {selectedBranchId && (
          <>
            {/* Filters */}
            <MenuFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              selectedType={selectedType}
              onCategoryChange={handleCategoryChange}
              onTypeChange={handleTypeChange}
              loading={loadingCategories}
            />

            {/* Sort */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                  Sắp xếp:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="name_asc">Tên A-Z</option>
                </select>
              </div>

              <div className="text-sm text-gray-500">
                {loadingMenuItems ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  `${menuItems.length} món ăn`
                )}
              </div>
            </div>

            {/* Menu Grid */}
            <MenuGrid
              items={menuItems}
              loading={loadingMenuItems}
              onAddToCart={() => {
                // Optional: Show toast notification
              }}
            />
          </>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Success Modal */}
      <OrderSuccessModal
        isOpen={isSuccessOpen}
        onClose={handleCloseSuccess}
        orderId={successOrderId || 0}
        totalAmount={successTotalAmount}
      />

      {/* Cart Initialization Status */}
      <CartInitializationStatus
        isInitialized={cartInitialized}
        isLoading={cartLoading}
        error={cartError}
      />
    </div>
  );
};
