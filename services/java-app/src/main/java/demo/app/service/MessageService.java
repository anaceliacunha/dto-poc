package demo.app.service;

import demo.app.config.KafkaTopicProperties;
import demo.app.storage.InMemoryMessageStore;
import com.activate.demo.models.DemoMessage;
import java.util.List;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

  private final KafkaTemplate<String, DemoMessage> kafkaTemplate;
  private final InMemoryMessageStore messageStore;
  private final KafkaTopicProperties kafkaTopicProperties;

  public MessageService(
      KafkaTemplate<String, DemoMessage> kafkaTemplate,
      InMemoryMessageStore messageStore,
      KafkaTopicProperties kafkaTopicProperties) {
    this.kafkaTemplate = kafkaTemplate;
    this.messageStore = messageStore;
    this.kafkaTopicProperties = kafkaTopicProperties;
  }

  public DemoMessage publishFromJava(DemoMessage message) {
    messageStore.addJavaMessage(message);
    kafkaTemplate.send(kafkaTopicProperties.getTopics().getFromJava(), message);
    return message;
  }

  public void registerPythonMessage(DemoMessage message) {
    messageStore.addPythonMessage(message);
  }

  public List<DemoMessage> getJavaMessages() {
    return messageStore.getJavaMessages();
  }

  public List<DemoMessage> getPythonMessages() {
    return messageStore.getPythonMessages();
  }
}
