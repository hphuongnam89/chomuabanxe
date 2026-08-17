package com.cho2hand.marketplace.config;
import com.cho2hand.marketplace.storage.MinioProperties;
import io.minio.MinioClient;
import org.springframework.context.annotation.*;
@Configuration public class MinioConfig { @Bean MinioClient minioClient(MinioProperties p){return MinioClient.builder().endpoint(p.endpoint()).credentials(p.accessKey(),p.secretKey()).build();} }
