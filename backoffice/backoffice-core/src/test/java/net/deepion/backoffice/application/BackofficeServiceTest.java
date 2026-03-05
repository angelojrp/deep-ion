package net.deepion.backoffice.application;

import net.deepion.backoffice.domain.Backoffice;
import net.deepion.backoffice.domain.BackofficeRepository;
import net.deepion.backoffice.mapper.BackofficeMapper;
import net.deepion.backoffice.model.BackofficeRequest;
import net.deepion.backoffice.model.BackofficeResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BackofficeServiceTest {

    @Mock
    private BackofficeRepository repository;

    @Mock
    private BackofficeMapper mapper;

    @InjectMocks
    private BackofficeService service;

    private Backoffice domain;
    private BackofficeResponse response;

    @BeforeEach
    void setup() {
        domain = new Backoffice();
        domain.setId(1L);
        domain.setName("name");

        response = new BackofficeResponse();
        response.setId(1L);
        response.setName("name");
    }

    @Test
    void shouldGetById() {
        when(repository.findById(1L)).thenReturn(Optional.of(domain));
        when(mapper.toDto(domain)).thenReturn(response);

        BackofficeResponse result = service.getById(1L);
        assertEquals(1L, result.getId());
    }

    @Test
    void shouldCreate() {
        BackofficeRequest request = new BackofficeRequest();
        request.setName("name");
        when(mapper.toDomain(any(BackofficeRequest.class))).thenReturn(domain);
        when(repository.save(domain)).thenReturn(domain);
        when(mapper.toDto(domain)).thenReturn(response);

        BackofficeResponse result = service.create(request);
        assertEquals("name", result.getName());
    }
}
