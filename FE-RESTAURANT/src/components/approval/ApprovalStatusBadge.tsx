import React from 'react';
import { Badge } from 'react-bootstrap';
import { getApprovalStatusLabel, getApprovalStatusVariant } from '../../utils/status';

interface ApprovalStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({ 
  status, 
  showIcon = true, 
  size = 'md' 
}) => {
  const getIcon = () => {
    switch (status) {
      case 'ACTIVE':
        return '✅';
      case 'INACTIVE':
        return '⏸️';
      default:
        return '';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'fs-6';
      case 'lg':
        return 'fs-5';
      default:
        return 'fs-6';
    }
  };

  return (
    <Badge 
      bg={getApprovalStatusVariant(status)} 
      className={`${getSizeClass()} d-inline-flex align-items-center gap-1`}
    >
      {showIcon && getIcon()}
      {getApprovalStatusLabel(status)}
    </Badge>
  );
};

export default ApprovalStatusBadge;




