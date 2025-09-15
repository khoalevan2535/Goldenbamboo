import React, { useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FaEye, FaClock } from 'react-icons/fa';
// import { formatDistanceToNow } from 'date-fns';
// import { vi } from 'date-fns/locale';
import { getImageUrl } from '../../utils/imageUtils';
import '../../style/client/RecentlyViewed.scss';

interface RecentlyViewedProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  limit = 6,
  showHeader = true,
  className = ''
}) => {
  const { state, addToRecentlyViewed } = useWishlist();

  const recentlyViewedItems = state.recentlyViewed.slice(0, limit);

  const handleItemClick = (item: any) => {
    // Add to recently viewed again (update timestamp)
    addToRecentlyViewed(item);
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      // Simple time formatting without date-fns
      const now = new Date();
      const date = new Date(dateString);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Vừa xem';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return 'Lâu rồi';
    } catch (error) {
      return 'Vừa xem';
    }
  };

  if (recentlyViewedItems.length === 0) {
    return (
      <div className={`recently-viewed ${className}`}>
        {showHeader && (
          <div className="recently-viewed-header">
            <h4>
              <FaEye className="me-2" />
              Đã xem gần đây
            </h4>
          </div>
        )}
        <div className="recently-viewed-empty">
          <FaEye className="empty-icon" />
          <p>Chưa có món nào được xem gần đây</p>
          <small>Hãy khám phá menu để xem các món ngon!</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`recently-viewed ${className}`}>
      {showHeader && (
        <div className="recently-viewed-header">
          <h4>
            <FaEye className="me-2" />
            Đã xem gần đây
          </h4>
          <Badge bg="secondary" className="count-badge">
            {state.recentlyViewed.length}
          </Badge>
        </div>
      )}

      <Row className="recently-viewed-grid">
        {recentlyViewedItems.map((item) => (
          <Col key={item.id} xs={6} sm={4} md={3} lg={2} className="mb-3">
            <Card 
              className="recently-viewed-item h-100"
              onClick={() => handleItemClick(item)}
            >
              <div className="item-image-container">
                <Card.Img
                  variant="top"
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="item-image"
                />
                <div className="item-overlay">
                  <div className="item-time">
                    <FaClock className="me-1" />
                    {formatTimeAgo(item.viewedAt)}
                  </div>
                </div>
              </div>
              
              <Card.Body className="p-2">
                <Card.Title className="item-name" title={item.name}>
                  {item.name}
                </Card.Title>
                <div className="item-price">
                  <span className="current-price">
                    {item.final_price.toLocaleString('vi-VN')}₫
                  </span>
                  {item.unit_price !== item.final_price && (
                    <span className="original-price">
                      {item.unit_price.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>
                <div className="item-type">
                  <Badge 
                    bg={item.item_type === 'dish' ? 'primary' : 'success'}
                    className="type-badge"
                  >
                    {item.item_type === 'dish' ? 'Món ăn' : 'Combo'}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {state.recentlyViewed.length > limit && (
        <div className="recently-viewed-more">
          <small className="text-muted">
            Và {state.recentlyViewed.length - limit} món khác...
          </small>
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;
