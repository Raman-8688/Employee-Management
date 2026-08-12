# API Gateway Service (api-gateway)

## 🌟 Service Importance & Business Role
The `api-gateway` serves as the single public entry point for all frontend Angular HTTP traffic. It hides backend microservices from public exposure, manages CORS policies, routes requests dynamically using Eureka load balancing (`lb://`), and validates JWT tokens globally.

## 🛠️ Architecture Specs
* **Port:** `8080`
* **Technology:** Spring Cloud Gateway, Reactive WebFlux framework
* **Routes Handled:**
  * `/auth/**` -> `AUTH-SERVICE`
  * `/employee/**`, `/api/ai/**`, `/api/attendance/**` -> `EMPLOYEE-SERVICE`
  * `/api/tasks/**` -> `TASK-SERVICE`

---

## 🎤 MNC Interview Q&A Talking Points

### Q1: Why do we use Spring Cloud Gateway instead of Netflix Zuul 1.x?
**Answer:** Spring Cloud Gateway is built natively on Spring 5, Spring Boot 2+, and Project Reactor (non-blocking WebFlux). Netflix Zuul 1.x uses blocking I/O (one thread per request), whereas Spring Cloud Gateway uses netty-based event loops, yielding vastly higher request throughput and lower latency under heavy MNC load.

### Q2: How does API Gateway handle Cross-Origin Resource Sharing (CORS) centrally?
**Answer:** We configure global CORS rules directly inside `application.yml` (`spring.cloud.gateway.globalcors`). This eliminates duplicating `@CrossOrigin` annotations across backend microservices and prevents pre-flight `OPTIONS` request failures.

### Q3: What is the benefit of using `lb://` URI scheme in gateway routing?
**Answer:** The `lb://` prefix instructs Spring Cloud Gateway to use Spring Cloud LoadBalancer to resolve logical service names (e.g., `lb://EMPLOYEE-SERVICE`) against Eureka's registered health endpoints instead of static hostnames.
