package com.cho2hand.marketplace.service.media;
import com.cho2hand.marketplace.dto.media.*; import java.util.List; import org.springframework.web.multipart.MultipartFile;
public interface MediaService { MediaResponse upload(Long userId,Long listingId,MultipartFile file); List<MediaResponse> list(Long listingId); MediaContent content(Long listingId,Long mediaId); void delete(Long userId,Long listingId,Long mediaId); }
