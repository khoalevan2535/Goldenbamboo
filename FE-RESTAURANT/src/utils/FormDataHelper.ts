// File: src/utils/formatDate.ts
// ✅ Đảm bảo có từ khóa "export" ở đầu
export const createEntityFormData = (
  entity: object,
  imageFile: File | undefined,
  imageName: string = 'image'
): FormData => {
  const formData = new FormData();
  
  // For @ModelAttribute, append each field separately instead of JSON
  // IMPORTANT: Skip 'image' field completely from entity to avoid binding conflicts
  Object.entries(entity).forEach(([key, value]) => {
    // Skip image field from entity as it will be handled separately
    // Also skip if value is a File object or empty string
    if (key !== 'image' && key !== 'imageUrl' && value !== null && value !== undefined && value !== '' && !(value instanceof File)) {
      formData.append(key, value.toString());
    }
  });

  // Only append image if it's a valid File object
  if (imageFile && imageFile instanceof File) {
    formData.append(imageName, imageFile);
  }

  return formData;
};

// New function to handle image URL separately
export const createEntityFormDataWithImageUrl = (
  entity: object,
  imageFile: File | undefined,
  imageUrl: string | undefined,
  imageName: string = 'image'
): FormData => {
  const formData = createEntityFormData(entity, imageFile, imageName);
  
  // Add imageUrl as separate parameter if provided
  if (imageUrl && imageUrl.trim() !== '') {
    formData.append('imageUrl', imageUrl);
  }

  return formData;
};

