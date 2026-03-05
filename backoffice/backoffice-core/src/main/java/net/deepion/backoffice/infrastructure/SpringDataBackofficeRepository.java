package net.deepion.backoffice.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataBackofficeRepository extends JpaRepository<BackofficeJpaEntity, Long> {
}
