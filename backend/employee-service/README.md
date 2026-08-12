# Employee & HR Core Service (employee-service)

## 🌟 Service Importance & Business Role
The `employee-service` is the core business domain engine of the Employee Management Platform. It handles employee lifecycle management, department mapping, payroll outflow summaries, attendance tracking, and integrates external AI capabilities via the **Nvidia AI API**.

## 🛠️ Architecture Specs
* **Port:** `8082`
* **Database:** `emp_db` (PostgreSQL)
* **AI Integration:** Nvidia AI API (`meta/llama-3.1-8b-instruct`)
* **Technology:** Spring Boot 3, Spring Data JPA, Eureka Client

---

## 🎤 MNC Interview Q&A Talking Points

### Q1: How does `employee-service` integrate with Nvidia AI LLMs for performance appraisals?
**Answer:** The service constructs structured JSON prompt payloads containing employee metrics, departments, and project history, sending HTTP POST requests to `https://integrate.api.nvidia.com/v1/chat/completions` using Spring's `RestTemplate` with automatic fallback to secondary models if primary model timeout occurs.

### Q2: How do other microservices query employee details securely?
**Answer:** Other services (such as `task-service`) do not access `emp_db` directly. Instead, they use Spring Cloud OpenFeign to make declarative REST calls to `GET /employee/details/{id}` through Eureka discovery.

### Q3: How is database migration handled in high-availability environments?
**Answer:** We configure Hibernate DDL auto rules alongside versioned migration scripts (Flyway / Liquibase) to ensure database schema changes execute transactionally without breaking zero-downtime rolling deployments.
