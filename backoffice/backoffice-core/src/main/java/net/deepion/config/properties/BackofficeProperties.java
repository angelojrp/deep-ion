package net.deepion.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@ConfigurationProperties(prefix = "backoffice")
public class BackofficeProperties {

    private Security security = new Security();

    @Data
    public static class Security {
        private String expectedAudience;
    }
}