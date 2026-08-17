package com.cho2hand.marketplace.controller.storage;

import com.cho2hand.marketplace.service.storage.StorageHealthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/storage")
public class StorageController {
    private final StorageHealthService storageHealthService;

    public StorageController(StorageHealthService storageHealthService) {
        this.storageHealthService = storageHealthService;
    }

    @GetMapping("/health")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void health() {
        storageHealthService.ensureReady();
    }
}
