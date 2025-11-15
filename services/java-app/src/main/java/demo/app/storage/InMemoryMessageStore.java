package demo.app.storage;

import demo.dto.DemoMessage;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class InMemoryMessageStore {

  private static final int MAX = 100;
  private final Deque<DemoMessage> javaMessages = new ArrayDeque<>();
  private final Deque<DemoMessage> pythonMessages = new ArrayDeque<>();

  public synchronized void addJava(DemoMessage message) {
    add(javaMessages, message);
  }

  public synchronized void addPython(DemoMessage message) {
    add(pythonMessages, message);
  }

  public synchronized List<DemoMessage> getJavaMessages() {
    return new ArrayList<>(javaMessages);
  }

  public synchronized List<DemoMessage> getPythonMessages() {
    return new ArrayList<>(pythonMessages);
  }

  private void add(Deque<DemoMessage> deque, DemoMessage message) {
    deque.addFirst(message);
    while (deque.size() > MAX) {
      deque.removeLast();
    }
  }
}
