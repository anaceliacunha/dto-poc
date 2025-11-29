package demo.app.service;

import com.activate.demo.models.DemoMessage;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class KafkaMessageListener {

  private static final Log LOG = LogFactory.getLog(KafkaMessageListener.class);
  private final MessageService messageService;

  public KafkaMessageListener(MessageService messageService) {
    this.messageService = messageService;
  }

  @KafkaListener(topics = "${demo.kafka.topics.fromPython}", groupId = "java-demo-consumer")
  public void listenFromPython(DemoMessage message) {
    LOG.info("Received message from Python topic: " + message.getId());
    messageService.registerPythonMessage(message);
  }
}
