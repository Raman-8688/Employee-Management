# Service Registry (Eureka Server)

## 🌟 Service Importance & Business Role
The `service-registry` module acts as the central telephone directory for the entire microservice ecosystem. Built on **Netflix Eureka Server**, it dynamically registers all instances of `api-gateway`, `auth-service`, `employee-service`, and `task-service`.

## 🛠️ Architecture Specs
* **Port:** `8761`
* **Technology:** Spring Cloud Netflix Eureka Server
* **Dashboard URL:** `http://localhost:8761`

---

## 🎤 MNC Interview Q&A Talking Points

### Q1: Why do we need Service Discovery in Microservices instead of hardcoding IP addresses?
**Answer:** In cloud-native enterprise environments (Kubernetes, AWS EC2, Docker containers), microservices auto-scale up/down, creating dynamic IP addresses and ephemeral ports. Eureka allows instances to register themselves automatically at startup using logical application names (e.g. `EMPLOYEE-SERVICE`) rather than static IP addresses.

### Q2: How does Client-Side Load Balancing work with Eureka?
**Answer:** Spring Cloud OpenFeign and RestTemplate query Eureka to fetch the registry map of active service instances. The client (e.g. `task-service`) uses load balancing algorithms (Round Robin / Least Connections) to route HTTP requests across healthy nodes.

### Q3: What happens if a microservice crashes?
**Answer:** Eureka microservices send heartbeat pings every 30 seconds. If Eureka does not receive heartbeats for 90 seconds, it automatically deregisters the unhealthy instance from the active routing registry.
