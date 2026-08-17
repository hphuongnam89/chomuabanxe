package com.cho2hand.marketplace.service.impl.storage;

import com.cho2hand.marketplace.exception.MediaStorageException;
import com.cho2hand.marketplace.service.storage.StorageHealthService;
import com.cho2hand.marketplace.storage.MinioProperties;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class R2StorageHealthService implements StorageHealthService {
    private static final Logger log = LoggerFactory.getLogger(R2StorageHealthService.class);
    private static final long CACHE_MILLIS = 60_000;
    private volatile long lastSuccessfulCheckAt;
    private final MinioClient minio;
    private final MinioProperties props;

    public R2StorageHealthService(MinioClient minio, MinioProperties props) {
        this.minio = minio;
        this.props = props;
    }

    @Override
    public void ensureReady() {
        if (System.currentTimeMillis() - lastSuccessfulCheckAt < CACHE_MILLIS) return;
        var key = "_health/" + Instant.now().toEpochMilli() + ".txt";
        var bytes = "ok".getBytes(StandardCharsets.UTF_8);
        try {
            minio.putObject(PutObjectArgs.builder()
                    .bucket(props.bucket())
                    .object(key)
                    .stream(new ByteArrayInputStream(bytes), bytes.length, -1)
                    .contentType("text/plain")
                    .build());
            minio.removeObject(RemoveObjectArgs.builder().bucket(props.bucket()).object(key).build());
            lastSuccessfulCheckAt = System.currentTimeMillis();
        } catch (Exception exception) {
            log.error("storage_health_failed bucket={} endpointHost={} errorType={} error={}",
                    props.bucket(), endpointHost(), exception.getClass().getSimpleName(), exception.getMessage());
            throw new MediaStorageException("Cloudflare R2 chưa sẵn sàng. Kiểm tra endpoint, bucket và quyền ghi/xoá object.", exception);
        }
    }

    private String endpointHost() {
        try {
            return URI.create(props.endpoint()).getHost();
        } catch (Exception ignored) {
            return "invalid-endpoint";
        }
    }
}
