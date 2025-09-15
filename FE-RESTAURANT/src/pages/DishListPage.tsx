import { useState, useEffect } from 'react';
import { Button, Table, Spinner, Row, Col, Form, Badge, Pagination } from 'react-bootstrap';
import { useDishes } from '../hooks/useDishes';
import { useCategories } from '../hooks/useCategories';
import { useDebounce } from '../hooks/useDebounce'; // Import a custom debounce hook
import { DishModal } from '../components/dishes/DishModal';
import { DishStatusModal } from '../components/dishes/DishStatusModal';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { type CategoryResponseDTO, type DishResponseDTO } from '../interfaces';
import { useAuth } from '../hooks/useAuth';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { DishService } from '../services/DishService';
import { toast } from 'react-toastify';
import { SafeImage } from '../components/shared/SafeImage';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../utils/error';

export default function DishListPage() {

    const { role, user } = useAuth();
    const isAdmin = role === 'ROLE_ADMIN';
    const userBranchId = user?.branchId;

    const { dishPage, loading: dishesLoading, fetchDishes, handleCreate, handleUpdate, handleDelete, handleUpdateAvailabilityStatus, currentPage, setCurrentPage } = useDishes();
    const { categoryPage, loading: categoriesLoading, fetchCategories } = useCategories();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    // Tự động detect base path từ current location
    const getBasePath = () => {
        if (location.pathname.startsWith('/manager/')) {
            return '/manager';
        } else if (location.pathname.startsWith('/admin/')) {
            return '/admin';
        }
        return '/admin'; // fallback
    };

    
    // Detect current mode based on URL
    const isCreateMode = location.pathname.endsWith('/create');
    const isEditMode = location.pathname.includes('/edit') && params.id;
    const isListMode = !isCreateMode && !isEditMode;

    // Load dish data for edit mode
    useEffect(() => {
        if (isEditMode && params.id) {
            // Load dish data for editing
            DishService.getById(params.id)
                .then(dish => setEditingDish(dish))
                .catch(error => {
                    console.error('Error loading dish:', error);
                    // Navigate back if dish not found
                    navigate(-1);
                });
        }
    }, [isEditMode, params.id, navigate]);

    // Dish states
    const [showDishModal, setShowDishModal] = useState(false);
    const [editingDish, setEditingDish] = useState<DishResponseDTO | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [dishToDelete, setDishToDelete] = useState<DishResponseDTO | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [dishToUpdateStatus, setDishToUpdateStatus] = useState<DishResponseDTO | null>(null);
    // Logic operational đã bị xóa
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | ''>('');
  

    // Debounce search term and category filter
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedFilterCategory = useDebounce(filterCategory, 300);

    useEffect(() => {
        fetchCategories({
            // Backend sẽ tự động filter theo branch của manager
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    useEffect(() => {
        fetchDishes({
            name: debouncedSearchTerm,
            categoryId: debouncedFilterCategory === '' ? undefined : Number(debouncedFilterCategory),
            // Backend sẽ tự động filter theo branch của manager
            // Không filter theo status - hiển thị tất cả dishes
        });
        // eslint-disable-next-line
    }, [debouncedSearchTerm, debouncedFilterCategory, role, currentPage, fetchDishes]);

    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearchTerm, debouncedFilterCategory, setCurrentPage]);
    
    const refreshDishes = () => {
        fetchDishes({
            name: debouncedSearchTerm,
            categoryId: debouncedFilterCategory === '' ? undefined : Number(debouncedFilterCategory),
        });
    }

    // Dish handlers
    const handleOpenCreateModal = () => {
        // Chuyển hướng đến trang tạo mới thay vì mở modal
        console.log('Dish Create - Button clicked!');
        console.log('Dish Create - Current role:', role);
        console.log('Dish Create - User:', user);
        const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
        const path = `${basePath}/dishes/create`;
        console.log('Dish Create - Navigating to:', path);
        try {
            navigate(path);
            console.log('Dish Create - Navigation successful');
        } catch (error) {
            console.error('Dish Create - Navigation error:', error);
        }
    };

    const handleShowEdit = (dish: DishResponseDTO) => {
        // Chuyển hướng đến trang sửa thay vì mở modal
        const basePath = role === 'ROLE_MANAGER' ? '/manager' : '/admin';
        const path = `${basePath}/dishes/${dish.id}/edit`;
        console.log('Dish Edit - Navigating to:', path, 'Dish:', dish);
        navigate(path);
    };

    const handleSubmit = async (data: any, image?: File | null) => {
        if (editingDish && editingDish.id) {
            await handleUpdate(editingDish.id, data, image);
        } else {
            await handleCreate(data, image);
        }
        refreshDishes();
    };

    const handleShowDelete = async (dish: DishResponseDTO) => {
        try {
            const res = await DishService.getDeletability(Number(dish.id));
            if (!res.deletable) {
                const reasonText = res.reasons.map(r => `${r.type}: ${r.count}`).join(', ');
                toast.warn(`Không thể xóa món này. Đang có liên kết: ${reasonText}`);
                return;
            }
            setDishToDelete(dish);
            setShowConfirmModal(true);
        } catch {
            setDishToDelete(dish);
            setShowConfirmModal(true);
        }
    };

    const confirmDelete = () => {
        if (dishToDelete) {
            handleDelete(dishToDelete.id);
        }
        setShowConfirmModal(false);
        // Reload after delete
        refreshDishes();
    };

    const handleOpenOperationalModal = (dish: DishResponseDTO) => {
        setDishToUpdateStatus(dish);
        setShowStatusModal(true);
    };

    // updateOperational đã bị xóa, không còn cần thiết

    // Chỉ hiển thị spinner toàn trang khi tải categories lần đầu
    if (categoriesLoading) {
        return <div className="text-center p-5"><Spinner animation="border" /></div>;
    }

    const dishes = dishPage?.content || [];
    const categories = categoryPage?.content || [];

    // Only show list mode - create/edit are handled by separate pages

    return (
        <div className="p-3">
            <h2>Quản Lý Món Ăn</h2>
            
            <Row className="mb-3 g-3">
                <Col md={3}>
                    <Form.Control
                        type="text"
                        placeholder="Tìm theo tên món ăn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value || '')}>
                        <option value="">Tất cả danh mục</option>
                        {categories
                          .filter((cat) => cat.status === 'ACTIVE')
                          .map((cat: CategoryResponseDTO) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                    </Form.Select>
                </Col>

                <Col md={2}>
                    <Button onClick={handleOpenCreateModal} className="w-100">Thêm Món Ăn</Button>
                </Col>
            </Row>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Hình ảnh</th>
                        <th>Tên Món Ăn</th>
                        <th>Giá</th>
                        <th>Danh mục</th>
                        <th>Trạng thái hoạt động</th>
                        <th className="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                                         {dishesLoading ? (
                         <tr>
                             <td colSpan={7} className="text-center">
                                 <Spinner animation="border" size="sm" /> Đang tải...
                             </td>
                         </tr>
                     ) : dishes.length === 0 ? (
                         <tr>
                             <td colSpan={7} className="text-center">
                                 Không tìm thấy món ăn nào.
                             </td>
                         </tr>
                    ) : (
                        dishes.map((dish) => (
                            <tr key={dish.id}>
                                <td>{dish.id}</td>
                                <td>
                                    {dish.image ? (
                                        <SafeImage
                                            src={dish.image}
                                            alt={dish.name}
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                                            showSpinner={false}
                                        />
                                    ) : (
                                        <span className="text-muted">Không có ảnh</span>
                                    )}
                                </td>
                                <td>{dish.name}</td>
                                <td>{typeof dish.basePrice === 'number' ? dish.basePrice.toLocaleString('vi-VN') + ' ₫' : 'N/A'}</td>
                                <td>{dish.categoryName}</td>
                                                                 <td>
                                     <Badge 
                                         bg={dish.availabilityStatus === 'AVAILABLE' ? 'success' : dish.availabilityStatus === 'OUT_OF_STOCK' ? 'warning' : 'danger'}
                                         style={{ cursor: 'pointer' }}
                                         onClick={() => handleOpenOperationalModal(dish)}
                                         className="px-3 py-2"
                                     >
                                         {dish.availabilityStatus === 'AVAILABLE' ? 'Còn hàng' : dish.availabilityStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Ngừng bán'}
                                     </Badge>
                                 </td>
                                 <td className="text-center">
                                     {(isAdmin || role === 'ROLE_MANAGER') && (
                                       <Button variant="warning" size="sm" onClick={() => handleShowEdit(dish)} title="Chỉnh sửa">
                                         <FaEdit />
                                       </Button>
                                     )}
                                     {(isAdmin || role === 'ROLE_MANAGER') && dish.inUse !== true && (
                                         <Button variant="danger" size="sm" className="ms-1" onClick={() => handleShowDelete(dish)} title="Xóa">
                                             <FaTrash />
                                         </Button>
                                     )}
                                 </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Pagination - Đồng bộ với backend (0-based) */}
            {dishPage && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First 
                    onClick={() => setCurrentPage(0)} 
                    disabled={currentPage === 0}
                  />
                  <Pagination.Prev 
                    onClick={() => setCurrentPage(currentPage - 1)} 
                    disabled={currentPage === 0}
                  />
                  
                  {/* Hiển thị số trang (0-based -> 1-based cho UI) */}
                  {Array.from({ length: dishPage.totalPages }, (_, i) => (
                    <Pagination.Item
                      key={i}
                      active={i === currentPage}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  
                  <Pagination.Next 
                    onClick={() => setCurrentPage(currentPage + 1)} 
                    disabled={currentPage === dishPage.totalPages - 1}
                  />
                  <Pagination.Last 
                    onClick={() => setCurrentPage(dishPage.totalPages - 1)} 
                    disabled={currentPage === dishPage.totalPages - 1}
                  />
                </Pagination>
              </div>
            )}

            {/* Modal Sửa/Tạo Món Ăn */}
            <DishModal
                show={showDishModal}
                onHide={() => setShowDishModal(false)}
                onSubmit={handleSubmit}
                dishToEdit={editingDish}
                categories={categories}
            />

            {/* Modal Xác nhận Xóa Món Ăn */}
            {dishToDelete && (
                <ConfirmModal
                    show={showConfirmModal}
                    onHide={() => setShowConfirmModal(false)}
                    onConfirm={confirmDelete}
                    title="Xác nhận Xóa Món Ăn"
                    message={`Bạn có chắc chắn muốn xóa món ăn "${dishToDelete.name}" không?`}
                    requiresConfirmation={true}
                />
            )}

            {/* Modal Cập nhật Trạng thái Món Ăn */}
            <DishStatusModal
                show={showStatusModal}
                onHide={() => setShowStatusModal(false)}
                onSubmit={handleUpdateAvailabilityStatus}
                dish={dishToUpdateStatus}
            />
        </div>
    );
}