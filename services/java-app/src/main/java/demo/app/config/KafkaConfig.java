package demo.app.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.activate.models.DemoMessage;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.openapitools.jackson.nullable.JsonNullableModule;

@Configuration
public class KafkaConfig {

  @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
  private String bootstrapServers;

  private final ObjectMapper objectMapper;

  public KafkaConfig(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Bean
  public ProducerFactory<String, DemoMessage> producerFactory() {
    Map<String, Object> props = new HashMap<>();
    props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
    ObjectMapper mapper = objectMapper.copy()
        .registerModule(new JavaTimeModule())
        .registerModule(new JsonNullableModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    JsonSerializer<DemoMessage> jsonSerializer = new JsonSerializer<>(mapper);
    jsonSerializer.setAddTypeInfo(false);
    return new DefaultKafkaProducerFactory<>(
        props, new StringSerializer(), jsonSerializer);
  }

  @Bean
  public KafkaTemplate<String, DemoMessage> kafkaTemplate() {
    return new KafkaTemplate<>(producerFactory());
  }

  @Bean
  public ConsumerFactory<String, DemoMessage> consumerFactory() {
    ObjectMapper mapper = objectMapper.copy()
        .registerModule(new JavaTimeModule())
        .registerModule(new JsonNullableModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    JsonDeserializer<DemoMessage> jsonDeserializer = new JsonDeserializer<>(DemoMessage.class, mapper);
    jsonDeserializer.addTrustedPackages("*");
    Map<String, Object> props = new HashMap<>();
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, jsonDeserializer.getClass());
    props.put(ConsumerConfig.GROUP_ID_CONFIG, "java-demo-consumer");
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), jsonDeserializer);
  }

  @Bean
  public ConcurrentKafkaListenerContainerFactory<String, DemoMessage>
      kafkaListenerContainerFactory() {
    ConcurrentKafkaListenerContainerFactory<String, DemoMessage> factory =
        new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(consumerFactory());
    return factory;
  }
}
