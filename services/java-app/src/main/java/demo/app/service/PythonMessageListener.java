package demo.app.service;

import demo.dto.DemoMessage;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PythonMessageListener {

  private static final Log LOG = LogFactory.getLog(PythonMessageListener.class);
  private final MessageService messageService;

  public PythonMessageListener(MessageService messageService) {
    this.messageService = messageService;
  }

  @KafkaListener(topics = "${demo.kafka.topics.fromPython}", groupId = "java-demo-consumer")
  public void listen(DemoMessage message) {
    LOG.info("Java consumer received message from Python topic id=" + message.getId());
    messageService.consumeFromPython(message);
  }
}
