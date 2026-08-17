package com.cho2hand.marketplace.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ApplicationYamlTest {
    @Test
    void keepsMinioBucketUnderMinioConfiguration() {
        var yaml = new YamlPropertiesFactoryBean();
        yaml.setResources(new ClassPathResource("application.yml"));
        yaml.afterPropertiesSet();

        assertEquals("${MINIO_BUCKET:carx}", yaml.getObject().getProperty("storage.minio.bucket"));
    }
}
