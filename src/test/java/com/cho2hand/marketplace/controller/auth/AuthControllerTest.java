package com.cho2hand.marketplace.controller.auth;

import com.cho2hand.marketplace.dto.auth.AuthResponse;
import com.cho2hand.marketplace.service.auth.AuthService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {
    @Test
    void loginIssuesHttpOnlyCarxCookie() throws Exception {
        var service = mock(AuthService.class);
        when(service.login(any())).thenReturn(new AuthResponse("jwt", "Bearer", 7L, List.of("USER")));
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new AuthController(service, false)).build();

        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"minh@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", containsString("CARX_TOKEN=jwt")))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", containsString("SameSite=Lax")));
    }
}
