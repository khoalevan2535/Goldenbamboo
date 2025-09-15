import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { CommentService, CommentResponseDTO, CommentStatsDTO } from '../services/CommentService';
import Avatar from './Avatar';
import styles from '../style/CommentSection.module.scss';

interface Comment extends CommentResponseDTO {}

interface CommentSectionProps {
  productId?: number;
  restaurantId?: number;
  onCommentAdded?: (comment: Comment) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  productId, 
  restaurantId, 
  onCommentAdded 
}) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStatsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Form states
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Load comments và stats từ API
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        let commentsData: Comment[] = [];
        let statsData: CommentStatsDTO | null = null;

        if (productId) {
          const response = await CommentService.getCommentsByProduct(productId, 0, 50);
          commentsData = response.content;
          statsData = await CommentService.getCommentStatsByProduct(productId);
        } else if (restaurantId) {
          const response = await CommentService.getCommentsByRestaurant(restaurantId, 0, 50);
          commentsData = response.content;
          statsData = await CommentService.getCommentStatsByRestaurant(restaurantId);
        }

        setComments(commentsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading comments:', error);
        toast.error('Không thể tải bình luận');
      } finally {
        setLoading(false);
      }
    };

    if (productId || restaurantId) {
      loadComments();
    }
  }, [productId, restaurantId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    setSubmitting(true);
    try {
      const commentData = {
        content: content.trim(),
        rating,
        productId,
        restaurantId
      };

      const newComment = await CommentService.createComment(commentData);
      setComments(prev => [newComment, ...prev]);
      setContent('');
      setRating(5);
      onCommentAdded?.(newComment);
      toast.success('Bình luận đã được đăng thành công!');
      
      // Reload stats
      if (productId) {
        const newStats = await CommentService.getCommentStatsByProduct(productId);
        setStats(newStats);
      } else if (restaurantId) {
        const newStats = await CommentService.getCommentStatsByRestaurant(restaurantId);
        setStats(newStats);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi đăng bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim()) {
      toast.error('Vui lòng nhập nội dung trả lời');
      return;
    }

    try {
      const replyData = {
        content: replyContent.trim(),
        rating: 0,
        parentId
      };

      const newReply = await CommentService.createComment(replyData);

      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));

      setReplyContent('');
      setShowReplyForm(null);
      toast.success('Trả lời đã được đăng thành công!');
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi đăng trả lời');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${styles.star} ${
              star <= (interactive ? hoveredRating : rating) ? styles.filled : styles.empty
            }`}
            onClick={() => interactive && onStarClick?.(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
        ))}
      </div>
    );
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${styles.comment} ${isReply ? styles.reply : ''}`}>
      <div className={styles.commentHeader}>
        <div className={styles.userInfo}>
          <Avatar 
            src={comment.user.avatarUrl}
            alt={comment.user.name}
            className={styles.avatar}
          />
          <div className={styles.userDetails}>
            <div className={styles.userName}>{comment.user.name}</div>
            <div className={styles.commentMeta}>
              <span className={styles.date}>{formatDate(comment.createdAt)}</span>
              {comment.rating > 0 && (
                <div className={styles.rating}>
                  {renderStars(comment.rating)}
                </div>
              )}
            </div>
          </div>
        </div>
        {(comment.user.role === 'ROLE_ADMIN' || comment.user.role === 'ROLE_MANAGER') && (
          <Badge className={styles.ownerBadge}>
            <i className="fas fa-crown me-1"></i>
            Chủ quán
          </Badge>
        )}
      </div>
      
      <div className={styles.commentContent}>
        {comment.content}
      </div>
      
      {!isReply && isAuthenticated && (
        <div className={styles.commentActions}>
          <Button
            variant="link"
            size="sm"
            className={styles.actionButton}
            onClick={() => setShowReplyForm(showReplyForm === comment.id ? null : comment.id)}
          >
            <i className="fas fa-reply me-1"></i>
            Trả lời
          </Button>
        </div>
      )}
      
      {showReplyForm === comment.id && (
        <div className={styles.replyForm}>
          <Form onSubmit={(e) => { e.preventDefault(); handleSubmitReply(comment.id); }}>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Viết trả lời..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className={styles.replyInput}
              />
            </Form.Group>
            <div className={styles.replyActions}>
              <Button
                type="submit"
                size="sm"
                disabled={!replyContent.trim()}
                className={styles.submitReplyBtn}
              >
                <i className="fas fa-paper-plane me-1"></i>
                Gửi trả lời
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setShowReplyForm(null);
                  setReplyContent('');
                }}
                className={styles.cancelReplyBtn}
              >
                Hủy
              </Button>
            </div>
          </Form>
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <Container className={styles.commentSection}>
      <Row>
        <Col lg={8} className="mx-auto">
          {/* Header */}
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <i className="fas fa-comments me-2"></i>
              Bình luận & Đánh giá
            </h3>
            <div className={styles.stats}>
              <span className={styles.commentCount}>
                <i className="fas fa-comment me-1"></i>
                {stats?.totalComments || comments.length} bình luận
              </span>
              <span className={styles.avgRating}>
                <i className="fas fa-star me-1"></i>
                {stats?.averageRating ? `${stats.averageRating.toFixed(1)}/5` : '0.0/5'}
              </span>
            </div>
          </div>

          {/* Comment Form */}
          <Card className={styles.commentFormCard}>
            <Card.Body>
              <Form onSubmit={handleSubmitComment}>
                <div className={styles.formHeader}>
                  <h5 className={styles.formTitle}>
                    <i className="fas fa-edit me-2"></i>
                    Viết bình luận
                  </h5>
                  {!isAuthenticated && (
                    <small className={styles.loginPrompt}>
                      <i className="fas fa-info-circle me-1"></i>
                      Vui lòng đăng nhập để bình luận
                    </small>
                  )}
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label className={styles.ratingLabel}>
                    <i className="fas fa-star me-2"></i>
                    Đánh giá của bạn
                  </Form.Label>
                  <div className={styles.ratingInput}>
                    {renderStars(rating, true, setRating)}
                    <span className={styles.ratingText}>
                      {rating}/5 sao
                    </span>
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về món ăn/dịch vụ..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={styles.commentInput}
                    disabled={!isAuthenticated}
                  />
                </Form.Group>
                
                <div className={styles.formActions}>
                  <Button
                    type="submit"
                    disabled={!isAuthenticated || submitting || !content.trim()}
                    className={styles.submitButton}
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Đang đăng...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Đăng bình luận
                      </>
                    )}
                  </Button>
                  
                  {!isAuthenticated && (
                    <Button
                      variant="outline-primary"
                      onClick={() => setShowLoginModal(true)}
                      className={styles.loginButton}
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Đăng nhập
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Comments List */}
          <div className={styles.commentsList}>
            {loading ? (
               <div className="text-center py-5">
                 <div className="spinner-border text-primary" role="status">
                   <span className="visually-hidden">Loading...</span>
                 </div>
                 <p className="mt-3">Đang tải bình luận...</p>
               </div>
             ) : comments.length === 0 ? (
               <div className={styles.emptyState}>
                 <i className="fas fa-comment-slash"></i>
                 <h5>Chưa có bình luận nào</h5>
                 <p>Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!</p>
               </div>
             ) : (
               comments.map(comment => renderComment(comment))
             )}
           </div>
        </Col>
      </Row>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-sign-in-alt me-2"></i>
            Đăng nhập để bình luận
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn cần đăng nhập để có thể viết bình luận và đánh giá.</p>
          <div className="d-grid gap-2">
            <Button 
              variant="primary"
              onClick={() => {
                setShowLoginModal(false);
                // Redirect to login page
                window.location.href = '/login';
              }}
            >
              <i className="fas fa-sign-in-alt me-2"></i>
              Đăng nhập ngay
            </Button>
            <Button 
              variant="outline-secondary"
              onClick={() => setShowLoginModal(false)}
            >
              Để sau
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};
s
export default CommentSection;
