import apiClient from '../utils/apiClient';

const API_URL = '/cloudinary';

export const CloudinaryService = {
    getImages: (maxResults: number = 10, folder: string = '') =>
        apiClient.get(`${API_URL}/images?maxResults=${maxResults}&folder=${folder}`),

    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};
