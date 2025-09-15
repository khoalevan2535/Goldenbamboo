import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Spinner, Form } from 'react-bootstrap';
import { CloudinaryService } from '../../services/CloudinaryService';
import { toast } from 'react-toastify';
import { SafeImage } from './SafeImage';

interface CloudinaryImagePickerProps {
    show: boolean;
    onHide: () => void;
    onSelect: (imageUrl: string) => void;
    title?: string;
}

interface CloudinaryImage {
    asset_folder: string;
    format: string;
    resource_type: string;
    secure_url: string;
    public_id?: string;
    width?: number;
    height?: number;
    created_at?: string;
}

export const CloudinaryImagePicker: React.FC<CloudinaryImagePickerProps> = ({
    show,
    onHide,
    onSelect,
    title = "Chọn ảnh từ Cloudinary"
}) => {
    const [images, setImages] = useState<CloudinaryImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (show) {
            loadImages();
        }
    }, [show]);

    const loadImages = async () => {
        setLoading(true);
        try {
            console.log('CloudinaryImagePicker - Loading images...');
            
            // First try the configured folder
            let response = await CloudinaryService.getImages(50, 'restaurant/images');
            console.log('CloudinaryImagePicker - Response from restaurant/images:', response);
            
            // If no images found, try without folder restriction
            if (!response.data || response.data.length === 0) {
                console.log('CloudinaryImagePicker - No images in restaurant/images, trying all folders...');
                response = await CloudinaryService.getImages(50, '');
                console.log('CloudinaryImagePicker - Response from all folders:', response);
            }
            
            // The response itself might be the data (due to apiClient interceptor)
            const imagesData = response.data || response || [];
            console.log('CloudinaryImagePicker - Final images data:', imagesData);
            
            setImages(imagesData);
        } catch (error) {
            console.error('CloudinaryImagePicker - Error loading images:', error);
            toast.error('Không thể tải danh sách ảnh: ' + (error as any)?.message);
            setImages([]); // Set empty array to prevent undefined errors
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = () => {
        if (selectedImage) {
            console.log('CloudinaryImagePicker - Selecting image:', selectedImage);
            try {
                onSelect(selectedImage);
                onHide();
                setSelectedImage(null);
                console.log('CloudinaryImagePicker - Selection completed successfully');
            } catch (error) {
                console.error('CloudinaryImagePicker - Error in handleSelect:', error);
                toast.error('Có lỗi khi chọn ảnh');
            }
        }
    };

    const filteredImages = images.filter(img => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (img.public_id?.toLowerCase().includes(searchLower)) ||
            (img.asset_folder?.toLowerCase().includes(searchLower)) ||
            (img.format?.toLowerCase().includes(searchLower))
        );
    });

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <Form.Control
                        type="search"
                        placeholder="Tìm kiếm ảnh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {loading ? (
                    <div className="text-center p-4">
                        <Spinner animation="border" />
                        <div className="mt-2">Đang tải danh sách ảnh...</div>
                    </div>
                ) : (
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <Row xs={2} sm={3} md={4} lg={5} className="g-2">
                            {filteredImages.map((image) => (
                                <Col key={image.public_id}>
                                    <div 
                                        className={`border rounded p-2 cursor-pointer ${
                                            selectedImage === image.secure_url ? 'border-primary bg-light' : 'border-secondary'
                                        }`}
                                        onClick={() => setSelectedImage(image.secure_url)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <SafeImage
                                            src={image.secure_url}
                                            alt={image.public_id || 'Cloudinary image'}
                                            className="mb-2"
                                            style={{ 
                                                height: '120px', 
                                                objectFit: 'cover',
                                                width: '100%'
                                            }}
                                            showSpinner={false}
                                        />
                                        <div className="small text-muted text-truncate">
                                            {image.public_id?.split('/').pop() || 'Image'}
                                        </div>
                                        <div className="small text-muted">
                                            {image.format?.toUpperCase()} • {image.asset_folder}
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        
                        {filteredImages.length === 0 && !loading && (
                            <div className="text-center p-4 text-muted">
                                Không tìm thấy ảnh nào
                            </div>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Hủy
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSelect}
                    disabled={!selectedImage}
                >
                    Chọn ảnh
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
