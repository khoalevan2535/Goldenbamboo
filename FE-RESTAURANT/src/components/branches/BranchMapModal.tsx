import { Modal, Button, Alert } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  show: boolean;
  onHide: () => void;
  address: string;
}

export function BranchMapModal({ show, onHide, address }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo bản đồ
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([10.8231, 106.6297], 13); // TP.HCM
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Thêm marker mặc định
    const defaultMarker = L.marker([10.8231, 106.6297]).addTo(map);
    markerRef.current = defaultMarker;
  };

  // Tìm kiếm địa chỉ và cập nhật bản đồ
  const searchAddress = async () => {
    if (!address.trim() || !mapInstanceRef.current) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=vn&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Xóa marker cũ
        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }

        // Thêm marker mới
        const newMarker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
        markerRef.current = newMarker;

        // Cập nhật view của bản đồ
        mapInstanceRef.current.setView([lat, lng], 15);
      }
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Khởi tạo bản đồ khi modal mở
  useEffect(() => {
    if (show) {
      setTimeout(() => {
        initializeMap();
        searchAddress();
      }, 100);
    }
  }, [show]);

  // Cleanup khi đóng modal
  useEffect(() => {
    if (!show && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🗺️ Vị trí chi nhánh</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <Alert variant="info" className="py-2">
            <small>
              <strong>Địa chỉ:</strong> {address}
            </small>
          </Alert>
        </div>
        
        <div 
          ref={mapRef}
          style={{ height: '400px', width: '100%' }}
          className="border rounded"
        />
        
        {isLoading && (
          <div className="text-center mt-2">
            <small className="text-muted">Đang tìm kiếm địa chỉ...</small>
          </div>
        )}
        
        <div className="border rounded p-3 bg-light mt-3">
          <small className="text-muted">
            💡 Bản đồ hiển thị vị trí chi nhánh. Bạn có thể zoom và di chuyển để xem chi tiết.
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
}