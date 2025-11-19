package demo.app.config.jackson;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import demo.dto.DemoMessageNotesOneOf;
import java.io.IOException;

public class DemoMessageNotesOneOfDeserializer extends JsonDeserializer<DemoMessageNotesOneOf> {

  @Override
  public DemoMessageNotesOneOf deserialize(JsonParser p, DeserializationContext ctxt)
      throws IOException {
    JsonToken currentToken = p.currentToken();

    if (currentToken == JsonToken.VALUE_NULL) {
      return null;
    }

    if (currentToken == JsonToken.VALUE_STRING) {
      return new DemoMessageNotesOneOf().comment(p.getValueAsString());
    }

    JsonNode node = p.readValueAsTree();
    if (node == null || node.isNull()) {
      return null;
    }
    if (node.isTextual()) {
      return new DemoMessageNotesOneOf().comment(node.asText());
    }
    if (node.isObject()) {
      JsonNode commentNode = node.get("comment");
      String comment =
          commentNode == null || commentNode.isNull() ? null : commentNode.asText();
      return new DemoMessageNotesOneOf().comment(comment);
    }

    ctxt.reportInputMismatch(
        DemoMessageNotesOneOf.class,
        "Unexpected token %s while deserializing notes. Expected string, object, or null.",
        currentToken);
    return null;
  }
}
