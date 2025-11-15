package demo.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "demo.kafka")
public class KafkaTopicProperties {

  private Topics topics = new Topics();

  public Topics getTopics() {
    return topics;
  }

  public void setTopics(Topics topics) {
    this.topics = topics;
  }

  public static class Topics {
    private String fromJava;
    private String fromPython;

    public String getFromJava() {
      return fromJava;
    }

    public void setFromJava(String fromJava) {
      this.fromJava = fromJava;
    }

    public String getFromPython() {
      return fromPython;
    }

    public void setFromPython(String fromPython) {
      this.fromPython = fromPython;
    }
  }
}
