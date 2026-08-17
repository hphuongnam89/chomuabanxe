package com.cho2hand.marketplace.controller.user;

import com.cho2hand.marketplace.dto.user.UserResponse;
import com.cho2hand.marketplace.exception.ApiExceptionHandler;
import com.cho2hand.marketplace.service.user.UserService;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserControllerTest {
    @Test
    void returnsUser() throws Exception {
        var service = Mockito.mock(UserService.class);
        Mockito.when(service.getById(1L)).thenReturn(new UserResponse(1L, 1L, "Minh", null, Instant.now(), null, java.util.List.of("USER")));
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new UserController(service))
                .setControllerAdvice(new ApiExceptionHandler()).build();

        mvc.perform(get("/api/v1/users/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Minh"));
    }
}
