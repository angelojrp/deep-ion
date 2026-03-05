package net.deepion.backoffice.mapper;

import javax.annotation.processing.Generated;
import net.deepion.backoffice.domain.Backoffice;
import net.deepion.backoffice.infrastructure.BackofficeJpaEntity;
import net.deepion.backoffice.model.BackofficeRequest;
import net.deepion.backoffice.model.BackofficeResponse;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-05T08:50:58-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class BackofficeMapperImpl implements BackofficeMapper {

    @Override
    public Backoffice toDomain(BackofficeRequest dto) {
        if ( dto == null ) {
            return null;
        }

        Backoffice backoffice = new Backoffice();

        backoffice.setName( dto.getName() );

        return backoffice;
    }

    @Override
    public BackofficeResponse toDto(Backoffice domain) {
        if ( domain == null ) {
            return null;
        }

        BackofficeResponse backofficeResponse = new BackofficeResponse();

        backofficeResponse.setId( domain.getId() );
        backofficeResponse.setName( domain.getName() );

        return backofficeResponse;
    }

    @Override
    public BackofficeJpaEntity toEntity(Backoffice domain) {
        if ( domain == null ) {
            return null;
        }

        BackofficeJpaEntity backofficeJpaEntity = new BackofficeJpaEntity();

        backofficeJpaEntity.setId( domain.getId() );
        backofficeJpaEntity.setName( domain.getName() );

        return backofficeJpaEntity;
    }

    @Override
    public Backoffice toDomain(BackofficeJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Backoffice backoffice = new Backoffice();

        backoffice.setId( entity.getId() );
        backoffice.setName( entity.getName() );

        return backoffice;
    }
}
