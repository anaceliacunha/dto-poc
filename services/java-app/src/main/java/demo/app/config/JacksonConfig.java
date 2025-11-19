package demo.app.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import demo.app.config.jackson.DemoMessageNotesOneOfDeserializer;
import demo.dto.DemoMessageNotesOneOf;
import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

  @Bean
  public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
    return builder -> {
      SimpleModule notesModule = new SimpleModule();
      notesModule.addDeserializer(
          DemoMessageNotesOneOf.class, new DemoMessageNotesOneOfDeserializer());

      builder
          .modulesToInstall(JsonNullableModule.class, JavaTimeModule.class)
          .modules(notesModule)
          .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    };
  }
}
