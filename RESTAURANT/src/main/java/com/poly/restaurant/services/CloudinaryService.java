package com.poly.restaurant.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder:restaurant/dishes}")
    private String folder;

    public String uploadFile(MultipartFile file) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", folder));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Không thể upload ảnh: " + e.getMessage(), e);
        }
    }

    public List<Map<String, Object>> listImages(int maxResults, String folder) {
        try {
            Map<?, ?> result = cloudinary.api().resources(ObjectUtils.asMap(
                "type", "upload",
                "prefix", folder.isEmpty() ? this.folder : folder,
                "max_results", maxResults,
                "tags", true
            ));
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> resources = (List<Map<String, Object>>) result.get("resources");
            return resources != null ? resources : List.of();
        } catch (Exception e) {
            throw new RuntimeException("Không thể lấy danh sách ảnh: " + e.getMessage(), e);
        }
    }
}
