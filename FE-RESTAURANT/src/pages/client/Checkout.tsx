// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import Swal from "sweetalert2";
// import { useCart } from "../../context/CartContext";
// import { OrderService } from "../../services/OrderService";
// import { ClientMenuService } from "../../services/ClientMenuService";
// // import "../../styles/client/Checkout.scss";

// // Define interfaces for better type safety
// interface Branch {
//   id: number;
//   name: string;
//   address: string;
// }

// interface CustomerInfo {
//   name: string;
//   phone: string;
//   address: string;
//   note: string;
// }

// const CheckoutPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { state, removeSelectedItemsAfterOrder } = useCart();
//   const [branches, setBranches] = useState<Branch[]>([]);
//   const [selectedBranch, setSelectedBranch] = useState<number>(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isBranchLoading, setIsBranchLoading] = useState(true);

//   // Form thông tin khách hàng
//   const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
//     name: "",
//     phone: "",
//     address: "",
//     note: "",
//   });

//   const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CARD">("CASH");

//   // Load danh sách chi nhánh khi component mount
//   useEffect(() => {
//     const loadBranches = async () => {
//       try {
//         setIsBranchLoading(true);
//         const branchesData = await ClientMenuService.getBranches();
//         setBranches(branchesData);
//       } catch (error) {
//         console.error("Error loading branches:", error);
//         toast.error("Không thể tải danh sách chi nhánh. Vui lòng thử lại!");
//       } finally {
//         setIsBranchLoading(false);
//       }
//     };

//     loadBranches();
//   }, []);

//   // Redirect nếu không có món nào được chọn
//   useEffect(() => {
//     if (state.selectedItems.length === 0) {
//       toast.warning("Không có món ăn nào được chọn để thanh toán!");
//       navigate("/Cart");
//     }
//   }, [state.selectedItems.length, navigate]);

//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(price);
//   };

//   const validatePhone = (phone: string) => {
//     const phoneRegex = /^[0-9]{10}$/;
//     return phoneRegex.test(phone);
//   };

//   const handleCheckout = async () => {
//     const trimmedInfo = {
//       name: customerInfo.name.trim(),
//       phone: customerInfo.phone.trim(),
//       address: customerInfo.address.trim(),
//       note: customerInfo.note.trim(),
//     };

//     if (!trimmedInfo.name || !trimmedInfo.phone || !trimmedInfo.address) {
//       toast.error("Vui lòng nhập đầy đủ thông tin nhận hàng!");
//       return;
//     }

//     if (!validatePhone(trimmedInfo.phone)) {
//       toast.error("Số điện thoại không hợp lệ! Vui lòng nhập 10 chữ số.");
//       return;
//     }

//     if (state.selectedItems.length === 0) {
//       toast.error("Không có món ăn nào được chọn!");
//       return;
//     }

//     const paymentText = {
//       CASH: "Thanh toán khi nhận hàng (COD)",
//       BANK_TRANSFER: "Chuyển khoản ngân hàng",
//       CARD: "Thanh toán online",
//     }[paymentMethod];

//     const result = await Swal.fire({
//       title: "Xác nhận đặt hàng?",
//       html: `
//         <div style="text-align: left;">
//           <p><strong>Số món đã chọn:</strong> ${state.selectedItems.length} món</p>
//           <p><strong>Tổng tiền hàng:</strong> ${formatPrice(state.selectedTotalAmount)}</p>
//           <p><strong>Phương thức:</strong> ${paymentText}</p>
//           <p><strong>Chi nhánh:</strong> ${branches.find((b) => b.id === selectedBranch)?.name || "Chi nhánh 1"}</p>
//         </div>
//       `,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Đặt hàng",
//       cancelButtonText: "Hủy",
//     });

//     if (result.isConfirmed) {
//       setIsLoading(true);
//       try {
//         const order = await OrderService.createOrderFromCart(
//           state.selectedItems,
//           trimmedInfo,
//           paymentMethod,
//           selectedBranch
//         );

//         removeSelectedItemsAfterOrder();
//         setCustomerInfo({ name: "", phone: "", address: "", note: "" });

//         Swal.fire({
//           title: "Đặt hàng thành công!",
//           html: `
//             <p>Cảm ơn bạn đã mua hàng!</p>
//             <p><strong>Mã đơn hàng:</strong> ${order.orderNumber}</p>
//             <p>Chúng tôi sẽ liên hệ với bạn sớm nhất!</p>
//           `,
//           icon: "success",
//           confirmButtonText: "OK",
//         }).then(() => {
//           navigate("/menu");
//         });
//       } catch (error) {
//         console.error("Error creating order:", error);
//         toast.error("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   if (state.selectedItems.length === 0) {
//     return (
//       <div className="checkout-page">
//         <div className="container">
//           <div className="loading">
//             <div className="spinner"></div>
//             <p>Đang chuyển hướng...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="checkout-page">
//       <div className="container">
//         <h1 className="checkout-title">Thanh Toán</h1>

//         <div className="checkout-content">
//           <div className="checkout-left">
//             <div className="customer-info-section">
//               <h3>📋 Thông Tin Nhận Hàng</h3>
//               <div className="form-group">
//                 <label htmlFor="name">Họ và tên *</label>
//                 <input
//                   id="name"
//                   type="text"
//                   value={customerInfo.name}
//                   onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
//                   placeholder="Nhập họ tên..."
//                   aria-required="true"
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="phone">Số điện thoại *</label>
//                 <input
//                   id="phone"
//                   type="tel"
//                   value={customerInfo.phone}
//                   onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
//                   placeholder="Nhập SĐT..."
//                   aria-required="true"
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="address">Địa chỉ *</label>
//                 <input
//                   id="address"
//                   type="text"
//                   value={customerInfo.address}
//                   onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
//                   placeholder="Nhập địa chỉ..."
//                   aria-required="true"
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="note">Ghi chú</label>
//                 <textarea
//                   id="note"
//                   value={customerInfo.note}
//                   onChange={(e) => setCustomerInfo((prev) => ({ ...prev, note: e.target.value }))}
//                   placeholder="Ghi chú thêm (tuỳ chọn)"
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="branch">Chi nhánh</label>
//                 {isBranchLoading ? (
//                   <div className="spinner"></div>
//                 ) : (
//                   <select
//                     id="branch"
//                     value={selectedBranch}
//                     onChange={(e) => setSelectedBranch(Number(e.target.value))}
//                     aria-label="Chọn chi nhánh"
//                   >
//                     {branches.map((branch) => (
//                       <option key={branch.id} value={branch.id}>
//                         {branch.name} - {branch.address}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </div>
//             </div>

//             <div className="payment-method-section">
//               <h3>💳 Phương Thức Thanh Toán</h3>
//               <div className="payment-options">
//                 {(["CASH", "BANK_TRANSFER", "CARD"] as const).map((method) => (
//                   <label key={method} className="payment-option">
//                     <input
//                       type="radio"
//                       name="payment"
//                       value={method}
//                       checked={paymentMethod === method}
//                       onChange={(e) => setPaymentMethod(e.target.value as "CASH" | "BANK_TRANSFER" | "CARD")}
//                       aria-label={method === "CASH" ? "Thanh toán khi nhận hàng" : method === "BANK_TRANSFER" ? "Chuyển khoản ngân hàng" : "Thanh toán online"}
//                     />
//                     <div className="payment-content">
//                       <span className="payment-title">
//                         {method === "CASH"
//                           ? "COD (Thanh toán khi nhận hàng)"
//                           : method === "BANK_TRANSFER"
//                             ? "Chuyển khoản ngân hàng"
//                             : "Thanh toán online"}
//                       </span>
//                       <span className="payment-desc">
//                         {method === "CASH"
//                           ? "Thanh toán bằng tiền mặt khi nhận hàng"
//                           : method === "BANK_TRANSFER"
//                             ? "Chuyển khoản qua ngân hàng"
//                             : "Thanh toán qua thẻ tín dụng/ghi nợ"}
//                       </span>
//                     </div>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="checkout-right">
//             <div className="order-details">
//               <h3>📦 Chi Tiết Đơn Hàng</h3>

//               <div className="order-items">
//                 {state.selectedItems.map((item) => {
//                   const itemTotal = item.price * item.quantity;
//                   const discountAmount = (item.discountPercentage || 0) ? (itemTotal * (item.discountPercentage || 0)) / 100 : 0;
//                   const finalTotal = itemTotal - discountAmount;
//                   const discountPercentage = item.discountPercentage || 0;

//                   return (
//                     <div key={`${item.type}-${item.id}`} className="order-item">
//                       <div className="item-image">
//                         <img src={item.image} alt={item.name} />
//                       </div>
//                       <div className="item-details">
//                         <h4>{item.name}</h4>
//                         <span className="item-type">{item.type === "dish" ? "Món lẻ" : "Combo"}</span>
//                         {discountPercentage > 0 && (
//                           <span className="discount-badge">-{discountPercentage}%</span>
//                         )}
//                       </div>
//                       <div className="item-quantity">x{item.quantity}</div>
//                       <div className="item-price">
//                         {discountPercentage > 0 ? (
//                           <>
//                             <span className="original-price">{formatPrice(item.price)}</span>
//                             <span className="final-price">{formatPrice(item.price * (1 - discountPercentage / 100))}</span>
//                           </>
//                         ) : (
//                           <span className="price">{formatPrice(item.price)}</span>
//                         )}
//                       </div>
//                       <div className="item-total">{formatPrice(finalTotal)}</div>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="order-summary">
//                 <div className="summary-item">
//                   <span>Tạm tính:</span>
//                   <span>{formatPrice(state.selectedTotalAmount + state.selectedTotalDiscount)}</span>
//                 </div>
//                 {state.selectedTotalDiscount > 0 && (
//                   <div className="summary-item discount">
//                     <span>Giảm giá:</span>
//                     <span>-{formatPrice(state.selectedTotalDiscount)}</span>
//                   </div>
//                 )}
//                 <div className="summary-item total">
//                   <span>Tổng thanh toán:</span>
//                   <span>{formatPrice(state.selectedTotalAmount)}</span>
//                 </div>
//               </div>

//               <div className="checkout-actions">
//                 <button
//                   className="back-to-cart-btn"
//                   onClick={() => navigate("/Cart")}
//                   disabled={isLoading}
//                   aria-label="Quay lại giỏ hàng"
//                 >
//                   Quay lại giỏ hàng
//                 </button>
//                 <button
//                   className="confirm-order-btn"
//                   onClick={handleCheckout}
//                   disabled={state.selectedItems.length === 0 || isLoading}
//                   aria-label="Xác nhận đặt hàng"
//                 >
//                   {isLoading ? (
//                     <>
//                       <span className="spinner"></span> Đang xử lý...
//                     </>
//                   ) : (
//                     "Xác nhận đặt hàng"
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;