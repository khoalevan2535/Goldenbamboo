/**
 * Utility functions for handling image paths
 */

/**
 * Converts database image path to public URL path
 * @param imagePath - Image path from database (e.g., "images/phobo.jpg" or full Cloudinary URL)
 * @returns Public URL path or full Cloudinary URL
 */
export const getImageUrl = (imagePath: string): string => {
    if (!imagePath) {
        return "/img/fallback-image.jpg";
    }

    // If it's already a full URL (Cloudinary or other), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Remove "images/" prefix if it exists and add "/img/" prefix for relative paths
    const cleanPath = imagePath.replace(/^images\//, '');
    return `/img/${cleanPath}`;
};

/**
 * Handles image loading error by setting fallback image
 * @param event - Image error event
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.currentTarget;
    target.src = "/img/fallback-image.jpg";
    target.onerror = null; // Prevent infinite loop
};

/**
 * Checks if image path is valid
 * @param imagePath - Image path to validate
 * @returns boolean indicating if path is valid
 */
export const isValidImagePath = (imagePath: string): boolean => {
    return imagePath && imagePath.trim().length > 0;
};
