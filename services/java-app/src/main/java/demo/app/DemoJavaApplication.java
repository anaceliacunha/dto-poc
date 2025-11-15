package demo.app;

import demo.app.config.KafkaTopicProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(KafkaTopicProperties.class)
public class DemoJavaApplication {

  public static void main(String[] args) {
    SpringApplication.run(DemoJavaApplication.class, args);
  }
}
