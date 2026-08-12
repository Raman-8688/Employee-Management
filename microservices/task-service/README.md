# Task & Project Service (task-service)

## 🌟 Service Importance & Business Role
The `task-service` module handles project tasks, Kanban board status transitions (`TODO`, `IN_PROGRESS`, `DONE`), and bug tracking. It integrates with `employee-service` via **Spring Cloud OpenFeign** to fetch assignee profile information dynamically while maintaining its own database (`task_db`).

## 🛠️ Architecture Specs
* **Port:** `8083`
* **Database:** `task_db` (PostgreSQL)
* **Inter-Service Client:** Spring Cloud OpenFeign client calling `EMPLOYEE-SERVICE`
* **Technology:** Spring Boot 3, Spring Data JPA, OpenFeign Client

---

## 🎤 MNC Interview Q&A Talking Points

### Q1: How does OpenFeign handle inter-service communication between microservices?
**Answer:** Spring Cloud OpenFeign creates declarative REST clients at runtime. Instead of writing boilerplate `RestTemplate` or `WebClient` HTTP calls, we define an annotated Java interface (`@FeignClient(name = "EMPLOYEE-SERVICE")`). OpenFeign automatically integrates with Eureka to discover endpoints and execute load-balanced HTTP requests.

### Q2: What happens if `employee-service` is down when `task-service` calls it via OpenFeign?
**Answer:** We implement Feign Fallbacks using Resilience4j circuit breakers (`fallback = EmployeeClientFallback.class`). When `employee-service` is unavailable, OpenFeign invokes the fallback method, returning cached or default placeholder data without failing the user request.

### Q3: How do Kanban Board drag-and-drop state transitions persist in the backend?
**Answer:** When a user moves a task card between columns (`TODO` -> `IN_PROGRESS` -> `DONE`), Angular issues a `PATCH /api/tasks/{id}/status?status=IN_PROGRESS` request. The backend updates the record in `task_db` transactionally.
