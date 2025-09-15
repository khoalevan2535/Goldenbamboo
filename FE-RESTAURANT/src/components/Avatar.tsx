import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar', 
  className = '', 
  size = 50 
}) => {
  const [imageError, setImageError] = useState(false);

  const defaultAvatar = (
    <div 
      className={`avatar-default ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6c757d',
        fontSize: size * 0.4,
        fontWeight: 'bold'
      }}
    >
      {alt ? alt.charAt(0).toUpperCase() : 'U'}
    </div>
  );

  // Nếu không có src hoặc có lỗi ảnh, hiển thị default avatar
  if (!src || imageError) {
    return defaultAvatar;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover'
      }}
      onError={() => setImageError(true)}
    />
  );
};

export default Avatar;
