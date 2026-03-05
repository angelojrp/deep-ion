package net.deepion.backoffice.infrastructure;

import net.deepion.backoffice.domain.Backoffice;
import net.deepion.backoffice.mapper.BackofficeMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@Import(JpaBackofficeRepository.class)
class JpaBackofficeRepositoryTest {

    @Autowired
    private JpaBackofficeRepository repository;

    @TestConfiguration
    static class MapperConfig {
        @Bean
        BackofficeMapper backofficeMapper() {
            return new BackofficeMapper() {
                @Override
                public Backoffice toDomain(net.deepion.backoffice.model.BackofficeRequest dto) {
                    Backoffice backoffice = new Backoffice();
                    backoffice.setName(dto.getName());
                    return backoffice;
                }

                @Override
                public net.deepion.backoffice.model.BackofficeResponse toDto(Backoffice domain) {
                    net.deepion.backoffice.model.BackofficeResponse response = new net.deepion.backoffice.model.BackofficeResponse();
                    response.setId(domain.getId());
                    response.setName(domain.getName());
                    return response;
                }

                @Override
                public BackofficeJpaEntity toEntity(Backoffice domain) {
                    BackofficeJpaEntity entity = new BackofficeJpaEntity();
                    entity.setId(domain.getId());
                    entity.setName(domain.getName());
                    return entity;
                }

                @Override
                public Backoffice toDomain(BackofficeJpaEntity entity) {
                    Backoffice backoffice = new Backoffice();
                    backoffice.setId(entity.getId());
                    backoffice.setName(entity.getName());
                    return backoffice;
                }
            };
        }
    }

    @Test
    void shouldPersistEntity() {
        Backoffice backoffice = new Backoffice();
        backoffice.setName("persisted");

        Backoffice saved = repository.save(backoffice);
        assertNotNull(saved.getId());
    }
}