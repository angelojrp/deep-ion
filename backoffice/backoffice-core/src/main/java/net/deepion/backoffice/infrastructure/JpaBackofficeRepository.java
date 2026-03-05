package net.deepion.backoffice.infrastructure;

import lombok.RequiredArgsConstructor;
import net.deepion.backoffice.domain.Backoffice;
import net.deepion.backoffice.domain.BackofficeRepository;
import net.deepion.backoffice.mapper.BackofficeMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class JpaBackofficeRepository implements BackofficeRepository {

    private final SpringDataBackofficeRepository jpaRepository;
    private final BackofficeMapper mapper;

    @Override
    public Optional<Backoffice> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Backoffice> findAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Backoffice save(Backoffice backoffice) {
        BackofficeJpaEntity saved = jpaRepository.save(mapper.toEntity(backoffice));
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
