import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, ListGroup, Modal, Button, Alert } from 'react-bootstrap';
import { FaBell, FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  type: 'APPROVAL_REQUEST' | 'APPROVAL_RESULT' | 'SYSTEM' | 'ORDER';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export const NotificationCenter: React.FC = () => {
  const { role, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = role === 'ROLE_ADMIN';
  const isManager = role === 'ROLE_MANAGER';

  useEffect(() => {
    loadNotifications();
    // Polling for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // TODO: Replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'APPROVAL_REQUEST',
          title: 'Yêu cầu phê duyệt mới',
          message: 'Manager Nguyễn Văn A đã gửi yêu cầu tạo menu mới',
          read: false,
          createdAt: new Date().toISOString(),
          data: { requestId: 123, type: 'MENU_CREATION' }
        },
        {
          id: '2',
          type: 'APPROVAL_RESULT',
          title: 'Yêu cầu đã được phê duyệt',
          message: 'Yêu cầu tạo món ăn "Phở Bò" đã được Admin phê duyệt',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          data: { requestId: 122, result: 'ACTIVE' }
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: Call API to mark as read
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Call API to mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Đã đánh dấu tất cả thông báo đã đọc');
    } catch (error) {
      }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPROVAL_REQUEST':
        return <FaExclamationTriangle className="text-warning" />;
      case 'APPROVAL_RESULT':
        return <FaCheck className="text-success" />;
      case 'SYSTEM':
        return <FaInfoCircle className="text-info" />;
      case 'ORDER':
        return <FaBell className="text-primary" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'APPROVAL_REQUEST':
        return 'warning';
      case 'APPROVAL_RESULT':
        return 'success';
      case 'SYSTEM':
        return 'info';
      case 'ORDER':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle different notification types
    switch (notification.type) {
      case 'APPROVAL_REQUEST':
        if (isAdmin) {
          // Navigate to approval center
          window.location.href = '/admin/approvals';
        }
        break;
      case 'APPROVAL_RESULT':
        if (isManager) {
          // Navigate to my requests
          window.location.href = '/admin/approvals';
        }
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Dropdown align="end">
        <Dropdown.Toggle variant="outline-secondary" className="position-relative">
          <FaBell />
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle rounded-pill"
              style={{ fontSize: '0.6rem', minWidth: '18px' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}>
          <Dropdown.Header className="d-flex justify-content-between align-items-center">
            <span>Thông báo</span>
            {unreadCount > 0 && (
              <Button 
                size="sm" 
                variant="link" 
                className="p-0 text-decoration-none"
                onClick={markAllAsRead}
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </Dropdown.Header>
          
          {notifications.length === 0 ? (
            <Dropdown.Item disabled className="text-center text-muted">
              Không có thông báo mới
            </Dropdown.Item>
          ) : (
            <>
              {notifications.slice(0, 5).map((notification) => (
                <Dropdown.Item 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`d-flex align-items-start p-3 ${!notification.read ? 'bg-light' : ''}`}
                  style={{ borderBottom: '1px solid #eee' }}
                >
                  <div className="me-2 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <strong className="small">{notification.title}</strong>
                      <Badge bg={getNotificationBadge(notification.type)} size="sm">
                        {notification.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="small text-muted mb-1">{notification.message}</p>
                    <small className="text-muted">
                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                    </small>
                  </div>
                </Dropdown.Item>
              ))}
              
              {notifications.length > 5 && (
                <Dropdown.Item 
                  onClick={() => setShowAll(true)}
                  className="text-center text-primary"
                >
                  Xem tất cả ({notifications.length} thông báo)
                </Dropdown.Item>
              )}
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>

      {/* Modal xem tất cả thông báo */}
      <Modal show={showAll} onHide={() => setShowAll(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Tất cả thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {notifications.map((notification) => (
              <ListGroup.Item 
                key={notification.id}
                className={`d-flex align-items-start ${!notification.read ? 'bg-light' : ''}`}
                action
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="me-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1">{notification.title}</h6>
                    <Badge bg={getNotificationBadge(notification.type)}>
                      {notification.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="mb-1">{notification.message}</p>
                  <small className="text-muted">
                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                  </small>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAll(false)}>
            Đóng
          </Button>
          {unreadCount > 0 && (
            <Button variant="primary" onClick={markAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

