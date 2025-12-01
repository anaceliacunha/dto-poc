# Demo universe - Multi-language OpenAPI code generation

.PHONY: codegen-demo codegen-demo-java codegen-demo-python codegen-demo-ts
.PHONY: codegen-demo-java-models codegen-demo-java-api
.PHONY: codegen-demo-python-models codegen-demo-python-api
.PHONY: codegen-demo-ts-models codegen-demo-react-api

# Generate all demo code (Java, Python, TypeScript)
codegen-demo: codegen-demo-java codegen-demo-python codegen-demo-ts

codegen-demo-java: codegen-demo-java-models codegen-demo-java-api

codegen-demo-python: codegen-demo-python-models codegen-demo-python-api

codegen-demo-ts: codegen-demo-ts-models codegen-demo-ts-fetch-api

# Java Models
codegen-demo-java-models:
	openapi-generator generate \
	  -i openapi/demo/demo-models.yaml \
	  -g spring \
	  -o $(JAVA_LIB_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage,DemoMessage1Items=Item \
	  --global-property models,modelTests=false \
	  --additional-properties=useSpringBoot3=false,dateLibrary=java8,serializationLibrary=jackson,apiPackage=com.activate.demo.apis,modelPackage=com.activate.demo.models,useJakartaEe=false

# Java API
codegen-demo-java-api:
	openapi-generator generate \
	  -i openapi/demo/demo-api.yaml \
	  -g spring \
	  -o $(JAVA_LIB_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,supportingFiles=ApiUtil.java,apiTests=false \
	  --additional-properties=useSpringBoot3=false,interfaceOnly=false,dateLibrary=java8,serializationLibrary=jackson,apiPackage=com.activate.demo.apis,modelPackage=com.activate.demo.models,useJakartaEe=false

# Python Models
codegen-demo-python-models:
	openapi-generator generate \
	  -i openapi/demo/demo-models.yaml \
	  -g python-fastapi \
	  -o $(PYTHON_LIB_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage,DemoMessage1Items=Item \
	  --global-property models,supportingFiles,modelTests=false \
	  --additional-properties=packageName=activate_api_models.demo


# Python API
codegen-demo-python-api:
	openapi-generator generate \
	  -i openapi/demo/demo-api.yaml \
	  -g python-fastapi \
	  -o $(PYTHON_LIB_DIR) \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,supportingFiles,apiTests=false \
	  --additional-properties=packageName=activate_api_models.demo
	@# Fix package name in setup.cfg to avoid domain suffix in wheel name
	@sed -i '' 's/name = activate_api_models\.demo/name = activate_api_models/' $(PYTHON_LIB_DIR)/setup.cfg

# TypeScript Models
codegen-demo-ts-models:
	openapi-generator generate \
	  -i openapi/demo/demo-models.yaml \
	  -g typescript-fetch \
	  -o $(TS_LIB_DIR)/src/demo \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage,DemoMessage1Items=Item \
	  --type-mappings binary=string,Date=string,DateTime=string \
	  --global-property models,supportingFiles \
	  --additional-properties=modelPropertyNaming=original,supportsES6=true,modelPropertyNaming=camelCase

# React API (TypeScript Fetch)
codegen-demo-ts-fetch-api:
	openapi-generator generate \
	  -i openapi/demo/demo-api.yaml \
	  -g typescript-fetch \
	  -o $(TS_LIB_DIR)/src/demo \
	  --inline-schema-name-mappings DemoMessage1=DemoMessage,DemoMessage2=DemoMessage \
	  --global-property apis,supportingFiles \
	  --additional-properties=modelPropertyNaming=original,supportsES6=true
