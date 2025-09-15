// import React, { useState } from 'react';
// import axios from 'axios';

// const ResetPasswordPage: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMessage('');
//     setError('');

//     if (newPassword !== confirmPassword) {
//       setError('Mật khẩu không khớp.');
//       return;
//     }

//     try {
//       const res = await axios.post('http://localhost:8080/api/auth/reset-password', {
//         email,
//         otp,
//         newPassword
//       });
//       setMessage(res.data);
//     } catch (err: any) {
//       setError(err.response?.data || 'Có lỗi xảy ra.');
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
//       <h2 className="text-xl font-semibold mb-4">Đặt lại mật khẩu</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="email"
//           placeholder="Email đã đăng ký"
//           className="w-full p-2 border rounded"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="text"
//           placeholder="Mã xác nhận (OTP)"
//           className="w-full p-2 border rounded"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Mật khẩu mới"
//           className="w-full p-2 border rounded"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Nhập lại mật khẩu"
//           className="w-full p-2 border rounded"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           required
//         />
//         <button
//           type="submit"
//           className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
//         >
//           Đặt lại mật khẩu
//         </button>
//       </form>
//       {message && <p className="text-green-600 mt-4">{message}</p>}
//       {error && <p className="text-red-600 mt-4">{error}</p>}
//     </div>
//   );
// };

// export default ResetPasswordPage;