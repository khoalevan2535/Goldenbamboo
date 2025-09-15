import React, { useEffect, useState } from 'react';
import { ReservationService } from '../services/ReservationService';
import { type ReservationResponseDTO } from '../interfaces/ReservationResponseDTO';

const ReservationListPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ReservationService.getAll()
      .then(res => setReservations(res.data))
      .catch(() => setError('Lỗi tải danh sách đặt bàn'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Danh sách đặt bàn</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Bàn</th>
            <th>Chi nhánh</th>
            <th>Thời gian</th>
            <th>Số khách</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(reservation => (
            <tr key={reservation.id}>
              <td>{reservation.id}</td>
              <td>{reservation.customerName}</td>
              <td>{reservation.tableName}</td>
              <td>{reservation.branchName}</td>
              <td>{reservation.reservationTime}</td>
              <td>{reservation.numberOfGuests}</td>
              <td>{reservation.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationListPage; 