package net.deepion.backoffice.api;

import net.deepion.backoffice.application.BackofficeService;
import net.deepion.backoffice.model.BackofficePageResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BackofficeController.class)
class BackofficeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BackofficeService service;

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnOkForList() throws Exception {
        when(service.list(0, 20)).thenReturn(new BackofficePageResponse());

        mockMvc.perform(get("/api/v1/backoffice")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk());
    }
}
