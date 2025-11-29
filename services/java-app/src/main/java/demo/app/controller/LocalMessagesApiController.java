package demo.app.controller;

import demo.app.service.MessageService;
import com.activate.demo.models.DemoMessage;
import java.util.List;
import javax.validation.Valid;
import com.activate.demo.apis.DemoApiController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.NativeWebRequest;

@RestController
@CrossOrigin(origins = "*")
public class LocalMessagesApiController extends DemoApiController {

  private final MessageService messageService;

  public LocalMessagesApiController(
      NativeWebRequest nativeWebRequest, MessageService messageService) {
    super(nativeWebRequest);
    this.messageService = messageService;
  }

  @Override
  public ResponseEntity<List<DemoMessage>> listJavaMessages() {
    return ResponseEntity.ok(messageService.getJavaMessages());
  }

  @Override
  public ResponseEntity<List<DemoMessage>> listMessagesFromPython() {
    return ResponseEntity.ok(messageService.getPythonMessages());
  }

  @Override
  public ResponseEntity<Void> publishJavaMessage(@Valid @RequestBody DemoMessage demoMessage) {
    messageService.publishFromJava(demoMessage);
    return ResponseEntity.accepted().build();
  }
}
