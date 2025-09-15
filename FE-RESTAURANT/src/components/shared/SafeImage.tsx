import React, { useState, useEffect } from 'react';
import { Image, Spinner } from 'react-bootstrap';

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    fallbackSrc?: string;
    showSpinner?: boolean;
    [key: string]: any; // For other props like rounded, thumbnail, etc.
}

export const SafeImage: React.FC<SafeImageProps> = ({
    src,
    alt,
    className = '',
    style = {},
    fallbackSrc = '/placeholder-image.svg',
    showSpinner = true,
    ...props
}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [currentSrc, setCurrentSrc] = useState(src);

    const handleError = () => {
        console.log('🖼️ SafeImage Error:', { src: currentSrc, alt, fallbackSrc });
        if (currentSrc !== fallbackSrc) {
            console.log('🔄 Trying fallback image');
            setCurrentSrc(fallbackSrc);
            setImageError(false);
        } else {
            console.log('❌ Both main and fallback images failed');
            setImageError(true);
            setImageLoading(false);
        }
    };

    const handleLoad = () => {
        console.log('✅ SafeImage Loaded:', { src: currentSrc, alt });
        setImageLoading(false);
        setImageError(false);
    };

    // Reset state when src changes
    useEffect(() => {
        setCurrentSrc(src);
        setImageError(false);
        setImageLoading(true);
    }, [src]);

    if (imageError) {
        return (
            <div
                className={`d-flex align-items-center justify-content-center bg-light border ${className}`}
                style={{
                    ...style,
                    minHeight: style.height || '100px',
                    minWidth: style.width || '100px'
                }}
            >
                <div className="text-muted text-center">
                    <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                    <div className="small mt-1">Không thể tải ảnh</div>
                </div>
            </div>
        );
    }

    return (
        <div className="position-relative" style={{ display: 'inline-block' }}>
            {imageLoading && showSpinner && (
                <div
                    className="position-absolute d-flex align-items-center justify-content-center"
                    style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 1
                    }}
                >
                    <Spinner animation="border" size="sm" />
                </div>
            )}
            <Image
                src={currentSrc}
                alt={alt}
                className={className}
                style={style}
                onError={handleError}
                onLoad={handleLoad}
                {...props}
            />
        </div>
    );
};
