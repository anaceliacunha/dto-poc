package demo.app.controller;

import demo.app.service.MessageService;
import demo.dto.DemoMessage;
import java.util.List;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/messages/java")
@CrossOrigin(origins = "*")
public class MessageController {

  private final MessageService messageService;

  public MessageController(MessageService messageService) {
    this.messageService = messageService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.ACCEPTED)
  public DemoMessage publish(@Valid @RequestBody DemoMessage payload) {
    return messageService.publishFromJava(payload);
  }

  @GetMapping
  public List<DemoMessage> listJavaMessages() {
    return messageService.listJavaMessages();
  }

  @GetMapping("/from-python")
  public List<DemoMessage> listPythonMessages() {
    return messageService.listPythonMessages();
  }
}
