package demo.app.storage;

import com.activate.demo.models.DemoMessage;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class InMemoryMessageStore {

  private static final int MAX_MESSAGES = 100;
  private final Deque<DemoMessage> javaMessages = new ArrayDeque<>();
  private final Deque<DemoMessage> pythonMessages = new ArrayDeque<>();

  public synchronized void addJavaMessage(DemoMessage message) {
    addWithLimit(javaMessages, message);
  }

  public synchronized void addPythonMessage(DemoMessage message) {
    addWithLimit(pythonMessages, message);
  }

  public synchronized List<DemoMessage> getJavaMessages() {
    return new ArrayList<>(javaMessages);
  }

  public synchronized List<DemoMessage> getPythonMessages() {
    return new ArrayList<>(pythonMessages);
  }

  private void addWithLimit(Deque<DemoMessage> deque, DemoMessage message) {
    deque.addFirst(message);
    while (deque.size() > MAX_MESSAGES) {
      deque.removeLast();
    }
  }
}
