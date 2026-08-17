package com.cho2hand.marketplace.service.impl.media;

import com.cho2hand.marketplace.dto.media.MediaContent;
import com.cho2hand.marketplace.dto.media.MediaResponse;
import com.cho2hand.marketplace.entity.media.ListingImage;
import com.cho2hand.marketplace.entity.media.ListingImageId;
import com.cho2hand.marketplace.entity.media.MediaAsset;
import com.cho2hand.marketplace.exception.InvalidMediaException;
import com.cho2hand.marketplace.exception.ListingAccessDeniedException;
import com.cho2hand.marketplace.exception.ListingNotFoundException;
import com.cho2hand.marketplace.exception.MediaStorageException;
import com.cho2hand.marketplace.repository.listing.ListingRepository;
import com.cho2hand.marketplace.repository.media.ListingImageRepository;
import com.cho2hand.marketplace.repository.media.MediaAssetRepository;
import com.cho2hand.marketplace.service.media.MediaService;
import com.cho2hand.marketplace.storage.MinioProperties;
import com.cho2hand.marketplace.util.ImageOptimizer;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class MediaServiceImpl implements MediaService {
    private static final Logger log = LoggerFactory.getLogger(MediaServiceImpl.class);
    private static final Set<String> TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final String WEBP = "image/webp";
    private static final long MAX_BYTES = 5_000_000;
    private static final long MAX_IMAGES = 3;

    private final ListingRepository listings;
    private final MediaAssetRepository media;
    private final ListingImageRepository images;
    private final MinioClient minio;
    private final MinioProperties props;

    public MediaServiceImpl(ListingRepository listings, MediaAssetRepository media, ListingImageRepository images,
            MinioClient minio, MinioProperties props) {
        this.listings = listings;
        this.media = media;
        this.images = images;
        this.minio = minio;
        this.props = props;
    }

    @Override
    public MediaResponse upload(Long user, Long listing, MultipartFile file) {
        owned(user, listing);
        if (file.isEmpty() || file.getSize() > MAX_BYTES || !TYPES.contains(file.getContentType())) {
            throw new InvalidMediaException("Chỉ nhận ảnh JPEG, PNG hoặc WEBP, dung lượng dưới 5 MB mỗi ảnh.");
        }
        if (images.countByIdListingId(listing) >= MAX_IMAGES) {
            throw new InvalidMediaException("Mỗi tin đăng chỉ được tối đa 3 ảnh.");
        }
        var webp = ImageOptimizer.toWebp(file);
        var key = "listings/" + listing + "/" + UUID.randomUUID() + ".webp";
        var storedInR2 = true;
        try {
            minio.putObject(PutObjectArgs.builder()
                    .bucket(props.bucket())
                    .object(key)
                    .stream(new ByteArrayInputStream(webp), webp.length, -1)
                    .contentType(WEBP)
                    .build());
        } catch (Exception exception) {
            storedInR2 = false;
            key = "db/listings/" + listing + "/" + UUID.randomUUID() + ".webp";
            log.warn("media_upload_r2_fallback listingId={} userId={} bucket={} endpointHost={} errorType={} error={}",
                    listing, user, props.bucket(), endpointHost(), exception.getClass().getSimpleName(), exception.getMessage());
        }
        try {
            var asset = new MediaAsset();
            asset.setOwnerUserId(user);
            asset.setStorageKey(key);
            asset.setContentType(WEBP);
            asset.setByteSize(webp.length);
            if (!storedInR2) asset.setStorageData(webp);
            asset = media.save(asset);
            var order = (short) images.countByIdListingId(listing);
            images.save(new ListingImage(listing, asset.getId(), order));
            return response(listing, asset, order);
        } catch (Exception exception) {
            log.error("media_upload_failed listingId={} userId={} bucket={} endpointHost={} errorType={} error={}",
                    listing, user, props.bucket(), endpointHost(), exception.getClass().getSimpleName(), exception.getMessage());
            throw new MediaStorageException("Không thể lưu ảnh. Vui lòng kiểm tra cấu hình Cloudflare R2.", exception);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<MediaResponse> list(Long listing) {
        return images.findByIdListingIdOrderBySortOrderAsc(listing).stream()
                .map(image -> response(listing, media.findById(image.getId().getMediaId())
                        .orElseThrow(() -> new InvalidMediaException("Image not found")), image.getSortOrder()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MediaContent content(Long listing, Long mediaId) {
        images.findById(new ListingImageId(listing, mediaId)).orElseThrow(() -> new InvalidMediaException("Image not found"));
        var asset = media.findById(mediaId).orElseThrow(() -> new InvalidMediaException("Image not found"));
        if (asset.getStorageData() != null) return new MediaContent(asset.getStorageData(), asset.getContentType());
        try (var stream = minio.getObject(GetObjectArgs.builder().bucket(props.bucket()).object(asset.getStorageKey()).build())) {
            return new MediaContent(stream.readAllBytes(), asset.getContentType());
        } catch (Exception exception) {
            log.error("media_read_failed listingId={} mediaId={} bucket={} endpointHost={} errorType={} error={}",
                    listing, mediaId, props.bucket(), endpointHost(), exception.getClass().getSimpleName(), exception.getMessage());
            throw new MediaStorageException("Không thể đọc ảnh từ Cloudflare R2.", exception);
        }
    }

    @Override
    public void delete(Long user, Long listing, Long mediaId) {
        owned(user, listing);
        var link = images.findById(new ListingImageId(listing, mediaId)).orElseThrow(() -> new InvalidMediaException("Image not found"));
        var asset = media.findById(mediaId)
                .filter(value -> user.equals(value.getOwnerUserId()))
                .orElseThrow(() -> new InvalidMediaException("Image not found"));
        try {
            if (asset.getStorageData() == null) {
                minio.removeObject(RemoveObjectArgs.builder().bucket(props.bucket()).object(asset.getStorageKey()).build());
            }
            images.delete(link);
            media.delete(asset);
        } catch (Exception exception) {
            log.error("media_delete_failed listingId={} mediaId={} bucket={} endpointHost={} errorType={} error={}",
                    listing, mediaId, props.bucket(), endpointHost(), exception.getClass().getSimpleName(), exception.getMessage());
            throw new MediaStorageException("Không thể xoá ảnh khỏi Cloudflare R2.", exception);
        }
    }

    private void owned(Long user, Long id) {
        var listing = listings.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
        if (!user.equals(listing.getSellerUserId())) throw new ListingAccessDeniedException();
    }

    private MediaResponse response(Long listing, MediaAsset asset, short order) {
        return new MediaResponse(asset.getId(), "/api/v1/listings/" + listing + "/images/" + asset.getId() + "/content",
                asset.getContentType(), asset.getByteSize(), order);
    }

    private String endpointHost() {
        try {
            return URI.create(props.endpoint()).getHost();
        } catch (Exception ignored) {
            return "invalid-endpoint";
        }
    }
}
