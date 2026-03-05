package net.deepion.backoffice.api;

import lombok.RequiredArgsConstructor;
import net.deepion.backoffice.api.contract.BackofficeApi;
import net.deepion.backoffice.application.BackofficeService;
import net.deepion.backoffice.model.BackofficePageResponse;
import net.deepion.backoffice.model.BackofficeRequest;
import net.deepion.backoffice.model.BackofficeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class BackofficeController implements BackofficeApi {

    private final BackofficeService service;

    @Override
    public ResponseEntity<BackofficePageResponse> listBackoffice(Integer page, Integer size, String sort) {
        return ResponseEntity.ok(service.list(page, size));
    }

    @Override
    public ResponseEntity<BackofficeResponse> createBackoffice(BackofficeRequest request) {
        return ResponseEntity.status(201).body(service.create(request));
    }

    @Override
    public ResponseEntity<BackofficeResponse> getBackofficeById(Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Override
    public ResponseEntity<BackofficeResponse> updateBackoffice(Long id, BackofficeRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @Override
    public ResponseEntity<Void> deleteBackoffice(Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
