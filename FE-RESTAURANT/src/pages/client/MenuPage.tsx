import React, { useState, useEffect } from "react";
import apiClient from "../../utils/Api";
import MenuItem from "../../components/user/MenuItems";
import ComboItem from "../../components/user/ComboItems";
// Removed CartDebugPanel import - no longer using cart localStorage
import { StorageSettingsPanel } from "../../components/debug/StorageSettingsPanel";
import RecentlyViewed from "../../components/user/RecentlyViewed";
// Removed QuickReorder import - no longer using cart localStorage
import "../../style/client/MenuClient.scss";

// Định nghĩa kiểu dữ liệu cho món ăn
interface FoodItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string; // Thay đổi từ image sang imageUrl
  price: number;
  status: boolean;
  categoryId: number;
}

// Định nghĩa kiểu dữ liệu cho combo
interface ComboItemResponse {
  id: number;
  name: string;
  description: string;
  imageUrl: string; // Thay đổi từ image sang imageUrl
  price: number;
  status: boolean;
  comboDishes: {
    id: number;
    comboId: number;
    comboName: string;
    dishId: number;
    dishName: string;
  }[];
}

// Định nghĩa kiểu dữ liệu cho category
interface Category {
  id: string;
  name: string;
  description: string;
  status: string;
  operationalStatus?: string;
}

// Định nghĩa kiểu dữ liệu cho branch
interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: string;
  isActive: boolean;
}

const MenuPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [comboItems, setComboItems] = useState<ComboItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Thêm state cho branch và categories
  const [selectedBranch, setSelectedBranch] = useState<string>("1");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12; // 12 món trên mỗi trang

  // Debug state
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showStorageSettings, setShowStorageSettings] = useState<boolean>(false);
  
  // Feature sections state
  const [showRecentlyViewed, setShowRecentlyViewed] = useState<boolean>(true);
  const [showQuickReorder, setShowQuickReorder] = useState<boolean>(true);

  // Lấy danh sách branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchesLoading(true);
        console.log('Fetching branches...');

        const response = await apiClient.get('/api/client/menu/branches');
        console.log('Branches API response:', response);
        console.log('Branches response.data:', response.data);
        console.log('Branches response.data type:', typeof response.data);
        console.log('Branches response.data isArray:', Array.isArray(response.data));

        const branchesData = response.data || [];
        console.log('Branches data after || []:', branchesData);

        // Đảm bảo branchesData là array
        if (Array.isArray(branchesData)) {
          setBranches(branchesData);
          console.log('Set branches successfully:', branchesData);

          // Set branch đầu tiên làm mặc định nếu có
          if (branchesData.length > 0) {
            setSelectedBranch(branchesData[0].id);
            console.log('Set selectedBranch to:', branchesData[0].id);
          }
        } else {
          console.error('Branches data is not an array:', branchesData);
          setBranches([]);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        console.log('🔄 Using mock branches data as fallback');
        
        // Mock data cho branches
        const mockBranches: Branch[] = [
          {
            id: "1",
            name: "Chi nhánh Trung tâm",
            address: "123 Đường ABC, Quận 1, TP.HCM",
            phone: "0123456789",
            status: "ACTIVE"
          },
          {
            id: "2", 
            name: "Chi nhánh Quận 7",
            address: "456 Đường XYZ, Quận 7, TP.HCM",
            phone: "0987654321",
            status: "ACTIVE"
          },
          {
            id: "3",
            name: "Chi nhánh Quận 2",
            address: "789 Đường DEF, Quận 2, TP.HCM", 
            phone: "0555666777",
            status: "ACTIVE"
          }
        ];
        
        setBranches(mockBranches);
        setSelectedBranch("1");
        console.log('✅ Mock branches loaded:', mockBranches);
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Lấy danh sách categories theo branch
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedBranch) return; // Không fetch nếu chưa có branch

      try {
        setCategoriesLoading(true);
        console.log('Fetching categories for branch:', selectedBranch);

        // Gọi API với branch_id parameter để lấy categories theo branch
        const response = await apiClient.get(`/api/client/menu/categories?branch_id=${selectedBranch}`);
        console.log('Categories API response:', response);
        console.log('Categories response.data:', response.data);
        console.log('Categories response.data.content:', response.data?.content);

        const categoriesData = response.data?.content || response.data || [];
        console.log('Categories data after processing:', categoriesData);
        console.log('Categories data isArray:', Array.isArray(categoriesData));

        // Đảm bảo categoriesData là array
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
          console.log('Set categories successfully:', categoriesData);
        } else {
          console.error('Categories data is not an array:', categoriesData);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.log('🔄 Using mock categories data as fallback');
        
        // Mock data cho categories
        const mockCategories: Category[] = [
          {
            id: "1",
            name: "Món chính",
            description: "Các món ăn chính",
            status: "ACTIVE"
          },
          {
            id: "2",
            name: "Món khai vị",
            description: "Các món khai vị",
            status: "ACTIVE"
          },
          {
            id: "3",
            name: "Món tráng miệng",
            description: "Các món tráng miệng",
            status: "ACTIVE"
          },
          {
            id: "4",
            name: "Đồ uống",
            description: "Các loại đồ uống",
            status: "ACTIVE"
          }
        ];
        
        setCategories(mockCategories);
        console.log('✅ Mock categories loaded:', mockCategories);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [selectedBranch]); // Thêm selectedBranch vào dependency

  const fetchDishes = async (categoryId?: string) => {
    try {
      const url = categoryId && categoryId !== "all" && categoryId !== "dishes" && categoryId !== "combos"
        ? `/api/client/menu/dishes?categoryId=${categoryId}&branchId=${selectedBranch}`
        : `/api/client/menu/dishes?branchId=${selectedBranch}`;

      console.log("Fetching dishes from:", url);
      const res = await apiClient.get<any>(url);
      console.log("Dishes response:", res.data);

      // Handle paginated response from backend
      const dishesData = res.data?.content || res.data || [];
      return Array.isArray(dishesData) ? dishesData : [];
    } catch (error) {
      console.error('Error fetching dishes:', error);
      console.log('🔄 Using mock dishes data as fallback');
      
      // Mock data cho dishes
      const mockDishes: FoodItem[] = [
        {
          id: 1,
          name: "Phở Bò",
          description: "Phở bò truyền thống",
          imageUrl: "/images/bunbo.jpg",
          price: 50000,
          status: true,
          categoryId: 1
        },
        {
          id: 2,
          name: "Bún Bò Huế",
          description: "Bún bò Huế đặc biệt",
          imageUrl: "/images/bunbo.jpg",
          price: 55000,
          status: true,
          categoryId: 1
        },
        {
          id: 3,
          name: "Gỏi Cuốn",
          description: "Gỏi cuốn tôm thịt",
          imageUrl: "/images/goicuon.jpg",
          price: 25000,
          status: true,
          categoryId: 2
        }
      ];
      
      console.log('✅ Mock dishes loaded:', mockDishes);
      return mockDishes;
    }
  };

  const fetchCombos = async () => {
    try {
      console.log("Fetching combos...");
      const res = await apiClient.get<any>(`/api/client/menu/combos?branchId=${selectedBranch}`);
      console.log("Combos response:", res.data);

      // Handle paginated response from backend
      const combosData = res.data?.content || res.data || [];
      const combos = Array.isArray(combosData) ? combosData : [];

      // Đảm bảo comboDishes luôn là array
      return combos.map(combo => ({
        ...combo,
        comboDishes: combo.comboDishes || []
      }));
    } catch (error) {
      console.error('Error fetching combos:', error);
      console.log('🔄 Using mock combos data as fallback');
      
      // Mock data cho combos
      const mockCombos: ComboItemResponse[] = [
        {
          id: 1,
          name: "Combo Phở Bò",
          description: "Phở bò + nước ngọt",
          imageUrl: "/images/bunbo.jpg",
          price: 60000,
          status: true,
          comboDishes: [
            {
              id: 1,
              comboId: 1,
              comboName: "Combo Phở Bò",
              dishId: 1,
              dishName: "Phở Bò"
            }
          ]
        },
        {
          id: 2,
          name: "Combo Gỏi Cuốn",
          description: "Gỏi cuốn + nước ngọt",
          imageUrl: "/images/goicuon.jpg",
          price: 35000,
          status: true,
          comboDishes: [
            {
              id: 2,
              comboId: 2,
              comboName: "Combo Gỏi Cuốn",
              dishId: 3,
              dishName: "Gỏi Cuốn"
            }
          ]
        }
      ];
      
      console.log('✅ Mock combos loaded:', mockCombos);
      return mockCombos;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBranch) return; // Không fetch nếu chưa có branch

      setLoading(true);
      setError(null);
      setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi filter

      try {
        if (activeFilter === "combos") {
          // Chỉ lấy combo
          const combos = await fetchCombos();
          setComboItems(combos);
          setMenuItems([]);
        } else if (activeFilter === "dishes") {
          // Chỉ lấy món lẻ
          const dishes = await fetchDishes();
          setMenuItems(dishes);
          setComboItems([]);
        } else if (activeFilter === "all") {
          // Lấy cả hai
          const [dishes, combos] = await Promise.all([
            fetchDishes(),
            fetchCombos()
          ]);
          console.log("Setting menuItems:", dishes);
          console.log("Setting comboItems:", combos);
          setMenuItems(dishes);
          setComboItems(combos);
        } else {
          // Lấy theo category (chỉ món lẻ)
          const dishes = await fetchDishes(activeFilter);
          setMenuItems(dishes);
          setComboItems([]);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          console.error("Response data:", axiosError.response?.data);
          console.error("Response status:", axiosError.response?.status);
        }
        setError("Không thể tải thực đơn. Vui lòng thử lại sau.");
        setMenuItems([]);
        setComboItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter, selectedBranch]); // Thêm selectedBranch vào dependencies

  // Tính toán dữ liệu phân trang
  const allItems = [...comboItems, ...menuItems];
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = allItems.slice(startIndex, endIndex);

  // Tách combo và món lẻ từ currentItems
  const currentCombos = currentItems.filter(item => 'comboDishes' in item) as ComboItemResponse[];
  const currentDishes = currentItems.filter(item => !('comboDishes' in item)) as FoodItem[];

  console.log("Current state - menuItems:", menuItems.length, "comboItems:", comboItems.length);
  console.log("Loading:", loading, "Error:", error);

  // Hàm xử lý chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hàm xử lý thay đổi branch
  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    setCurrentPage(1); // Reset về trang đầu tiên khi đổi branch
  };

  return (
    <div className="menu-page-wrapper">
      <div className="container">
        <div className="menu-header">
          <h1 className="main-title">
            Thực Đơn
          </h1>
          <p className="subtitle">
            Khám phá các món ăn Việt Nam đích thực và combo tiết kiệm của chúng tôi...
          </p>

          {/* Branch Selector */}
          <div className="branch-selector">
            <label htmlFor="branch-select" className="selector-label">
              Chọn Chi Nhánh
            </label>
            {branchesLoading ? (
              <div className="loading-state">Đang tải chi nhánh...</div>
            ) : Array.isArray(branches) && branches.length > 0 ? (
              <div className="branch-select">
                <select
                  id="branch-select"
                  value={selectedBranch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} - {branch.address}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="error-state">Không có chi nhánh nào</div>
            )}
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            {/* Filter "Tất cả" */}
            <button
              onClick={() => setActiveFilter("all")}
              className={`filter-button ${activeFilter === "all" ? "active" : ""}`}
            >
              Tất Cả
            </button>

            {/* Filter "Món Lẻ" */}
            <button
              onClick={() => setActiveFilter("dishes")}
              className={`filter-button ${activeFilter === "dishes" ? "active" : ""}`}
            >
              Món Lẻ
            </button>

            {/* Filter "Combo" */}
            <button
              onClick={() => setActiveFilter("combos")}
              className={`filter-button ${activeFilter === "combos" ? "active" : ""}`}
            >
              Combo
            </button>

            {/* Categories động từ API */}
            {categoriesLoading ? (
              <div className="filter-button loading">Đang tải...</div>
            ) : Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`filter-button ${activeFilter === category.id ? "active" : ""}`}
                >
                  {category.name}
                </button>
              ))
            ) : (
              <div className="filter-button disabled">Không có danh mục</div>
            )}
          </div>
        </div>

        {loading && (
          <div className="state-container">
            <div className="loading-spinner"></div>
            <p>Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="state-container">
            <div className="error-message">{error}</div>
          </div>
        )}

        {/* Hiển thị Combo */}
        {currentCombos.length > 0 && (
          <div className="content-section">
            <h2 className="section-title">
              Combo Tiết Kiệm
            </h2>
            <div className="menu-grid">
              {currentCombos.map((combo) => (
                <ComboItem
                  key={`combo-${combo.id}`}
                  combo={combo}
                  branchId={Number(selectedBranch)} // Truyền branchId
                />
              ))}
            </div>
          </div>
        )}

        {/* Hiển thị Món Lẻ */}
        {currentDishes.length > 0 && (
          <div className="content-section">
            {currentCombos.length > 0 && (
              <h2 className="section-title">
                Món Lẻ
              </h2>
            )}
            <div className="menu-grid">
              {currentDishes.map((item) => (
                <MenuItem
                  key={`dish-${item.id}`}
                  item={item}
                  branchId={Number(selectedBranch)} // Truyền branchId
                />
              ))}
            </div>
          </div>
        )}

        {/* Không có dữ liệu */}
        {!loading && !error && allItems.length === 0 && (
          <div className="state-container">
            <div className="empty-state">Không có món ăn nào để hiển thị.</div>
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`pagination-button nav-button ${currentPage === 1 ? "disabled" : ""}`}
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`pagination-button ${currentPage === page ? "current" : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`pagination-button nav-button ${currentPage === totalPages ? "disabled" : ""}`}
            >
              Sau
            </button>
          </div>
        )}

        {/* Hiển thị thông tin trang */}
        {allItems.length > 0 && (
          <div className="page-info">
            <div className="info-text">
              Hiển thị <span className="highlight">{startIndex + 1}</span>-<span className="highlight">{Math.min(endIndex, allItems.length)}</span> trong tổng số <span className="highlight">{allItems.length}</span> món
            </div>
          </div>
        )}

        {/* Recently Viewed Section */}
        {showRecentlyViewed && (
          <div className="content-section">
            <RecentlyViewed limit={6} />
          </div>
        )}

        {/* Removed Quick Reorder Section - no longer using cart localStorage */}
      </div>

      {/* Debug Panel */}
      {/* Removed CartDebugPanel - no longer using cart localStorage */}
      
      {/* Storage Settings Panel */}
      <StorageSettingsPanel 
        show={showStorageSettings} 
        onClose={() => setShowStorageSettings(false)} 
      />
      
      {/* Debug Toggle Button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px',
          background: showDebug ? '#dc3545' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 10000,
          fontSize: '16px'
        }}
        title={showDebug ? 'Hide Debug Panel' : 'Show Debug Panel'}
      >
        {showDebug ? '❌' : '🐛'}
      </button>

      {/* Storage Settings Button */}
      <button
        onClick={() => setShowStorageSettings(!showStorageSettings)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          padding: '10px',
          background: showStorageSettings ? '#dc3545' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 10000,
          fontSize: '16px'
        }}
        title={showStorageSettings ? 'Hide Storage Settings' : 'Show Storage Settings'}
      >
        {showStorageSettings ? '❌' : '⚙️'}
      </button>
    </div>
  );
};

export default MenuPage;