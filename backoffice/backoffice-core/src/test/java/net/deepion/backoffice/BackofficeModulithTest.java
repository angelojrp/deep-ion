package net.deepion.backoffice;

import net.deepion.BackofficeCoreApplication;
import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class BackofficeModulithTest {

    @Test
    void shouldVerifyModulithStructure() {
        ApplicationModules modules = ApplicationModules.of(BackofficeCoreApplication.class);
        modules.verify();
    }
}
