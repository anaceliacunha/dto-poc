package demo.app.service;

import demo.app.config.KafkaTopicProperties;
import demo.app.storage.InMemoryMessageStore;
import demo.dto.DemoMessage;
import java.util.List;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

  private final KafkaTemplate<String, DemoMessage> kafkaTemplate;
  private final InMemoryMessageStore store;
  private final KafkaTopicProperties topicProperties;

  public MessageService(
      KafkaTemplate<String, DemoMessage> kafkaTemplate,
      InMemoryMessageStore store,
      KafkaTopicProperties topicProperties) {
    this.kafkaTemplate = kafkaTemplate;
    this.store = store;
    this.topicProperties = topicProperties;
  }

  public DemoMessage publishFromJava(DemoMessage message) {
    store.addJava(message);
    kafkaTemplate.send(topicProperties.getTopics().getFromJava(), message);
    return message;
  }

  public void consumeFromPython(DemoMessage message) {
    store.addPython(message);
  }

  public List<DemoMessage> listJavaMessages() {
    return store.getJavaMessages();
  }

  public List<DemoMessage> listPythonMessages() {
    return store.getPythonMessages();
  }
}
