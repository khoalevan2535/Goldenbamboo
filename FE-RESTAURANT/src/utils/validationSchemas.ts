// Validation schemas để đồng bộ với backend validation
import * as Yup from 'yup';

// Validation cho OrderItemRequestDTO
export const orderItemValidationSchema = Yup.object({
  dishId: Yup.number().nullable().optional(),
  comboId: Yup.number().nullable().optional(),
  quantity: Yup.number()
    .required('Số lượng là bắt buộc')
    .min(1, 'Số lượng phải >= 1')
    .integer('Số lượng phải là số nguyên'),
  unitPrice: Yup.number().min(0, 'Giá phải >= 0').optional(),
  discountPercentage: Yup.number()
    .min(0, 'Phần trăm giảm giá phải >= 0')
    .max(100, 'Phần trăm giảm giá phải <= 100')
    .optional(),
  specialInstructions: Yup.string().max(500, 'Hướng dẫn đặc biệt không được quá 500 ký tự').optional(),
  note: Yup.string().max(255, 'Ghi chú không được quá 255 ký tự').optional(),
}).test('dish-or-combo', 'Phải chọn món ăn hoặc combo', function (value) {
  return !!(value.dishId || value.comboId);
});

// Validation cho OrderRequestDTO
export const orderValidationSchema = Yup.object({
  tableId: Yup.number().required('Bàn là bắt buộc'),
  items: Yup.array()
    .of(orderItemValidationSchema)
    .min(1, 'Đơn hàng phải có ít nhất 1 món')
    .required('Danh sách món ăn là bắt buộc'),
  customerName: Yup.string().max(100, 'Tên khách hàng không được quá 100 ký tự').optional(),
  customerPhone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ')
    .max(20, 'Số điện thoại không được quá 20 ký tự')
    .optional(),
  customerEmail: Yup.string()
    .email('Email không hợp lệ')
    .max(255, 'Email không được quá 255 ký tự')
    .optional(),
  notes: Yup.string().max(1000, 'Ghi chú không được quá 1000 ký tự').optional(),
  specialInstructions: Yup.string().max(1000, 'Hướng dẫn đặc biệt không được quá 1000 ký tự').optional(),
});

// Helper function để validate OrderItem
export const validateOrderItem = (item: any) => {
  try {
    orderItemValidationSchema.validateSync(item);
    return { isValid: true, errors: [] };
  } catch (error: any) {
    return {
      isValid: false,
      errors: error.errors || [error.message]
    };
  }
};

// Helper function để validate Order
export const validateOrder = (order: any) => {
  try {
    orderValidationSchema.validateSync(order);
    return { isValid: true, errors: [] };
  } catch (error: any) {
    return {
      isValid: false,
      errors: error.errors || [error.message]
    };
  }
};





