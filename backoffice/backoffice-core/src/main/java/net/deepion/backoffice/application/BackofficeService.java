package net.deepion.backoffice.application;

import net.deepion.backoffice.domain.Backoffice;
import net.deepion.backoffice.domain.BackofficeRepository;
import net.deepion.backoffice.mapper.BackofficeMapper;
import net.deepion.backoffice.model.BackofficePageResponse;
import net.deepion.backoffice.model.BackofficeRequest;
import net.deepion.backoffice.model.BackofficeResponse;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BackofficeService {

    private final BackofficeRepository repository;
    private final BackofficeMapper mapper;
    private final MessageSource messageSource;

    @Transactional(readOnly = true)
    public BackofficePageResponse list(Integer page, Integer size) {
        List<BackofficeResponse> content = repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();

        BackofficePageResponse response = new BackofficePageResponse();
        response.setContent(content);
        response.setPage(page == null ? 0 : page);
        response.setSize(size == null ? content.size() : size);
        response.setTotalElements((long) content.size());
        response.setTotalPages(1);
        return response;
    }

    @Transactional(readOnly = true)
    public BackofficeResponse getById(Long id) {
        Backoffice domain = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                messageSource.getMessage("backoffice.not-found", null, LocaleContextHolder.getLocale())));
        return mapper.toDto(domain);
    }

    @Transactional
    public BackofficeResponse create(BackofficeRequest request) {
        Backoffice domain = mapper.toDomain(request);
        Backoffice saved = repository.save(domain);
        return mapper.toDto(saved);
    }

    @Transactional
    public BackofficeResponse update(Long id, BackofficeRequest request) {
        Backoffice existing = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                messageSource.getMessage("backoffice.not-found", null, LocaleContextHolder.getLocale())));
        existing.setName(request.getName());
        Backoffice saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
