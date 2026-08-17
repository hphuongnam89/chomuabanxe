package com.cho2hand.marketplace.service.vehicle;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import com.cho2hand.marketplace.exception.AdminOperationException;
import com.cho2hand.marketplace.repository.admin.AdminAuditLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class AdminVehicleCatalogServiceTest {
    @Test void rejectsUnknownResourceBeforeDatabaseAccess() {
        var jdbc = mock(JdbcTemplate.class);
        var service = new AdminVehicleCatalogService(jdbc, mock(AdminAuditLogRepository.class));

        assertThrows(AdminOperationException.class, () -> service.create(1L, "unknown", null));
        verifyNoInteractions(jdbc);
    }
}
