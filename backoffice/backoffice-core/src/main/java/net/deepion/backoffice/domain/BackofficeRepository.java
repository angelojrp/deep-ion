package net.deepion.backoffice.domain;

import java.util.List;
import java.util.Optional;

public interface BackofficeRepository {

    Optional<Backoffice> findById(Long id);

    List<Backoffice> findAll();

    Backoffice save(Backoffice backoffice);

    void deleteById(Long id);
}
