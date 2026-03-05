package net.deepion.backoffice.mapper;

import net.deepion.backoffice.domain.Backoffice;
import net.deepion.backoffice.infrastructure.BackofficeJpaEntity;
import net.deepion.backoffice.model.BackofficeRequest;
import net.deepion.backoffice.model.BackofficeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BackofficeMapper {

    Backoffice toDomain(BackofficeRequest dto);

    BackofficeResponse toDto(Backoffice domain);

    BackofficeJpaEntity toEntity(Backoffice domain);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    Backoffice toDomain(BackofficeJpaEntity entity);
}
