# Authentication Service (auth-service)

## 🌟 Service Importance & Business Role
The `auth-service` manages identity, user credentials, role-based access control (RBAC), and issues stateless **JSON Web Tokens (JWT)**. It operates its own isolated database (`auth_db`), embodying the **Database-per-Service** microservice design pattern.

## 🛠️ Architecture Specs
* **Port:** `8081`
* **Database:** `auth_db` (PostgreSQL)
* **RBAC Roles:** `ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_HR`, `ROLE_EMPLOYEE`
* **Technology:** Spring Security 6, JWT (JJWT 0.12.x), Spring Data JPA

---

## 🎤 MNC Interview Q&A Talking Points

### Q1: Why do microservices use Database-per-Service architecture instead of a shared database?
**Answer:** A shared database creates tight coupling across microservices, breaking schema independence and causing single points of failure. Database-per-Service ensures `auth-service` can modify its `users` or `roles` schema without risking downtime for `employee-service` or `task-service`.

### Q2: How does Role-Based Access Control (RBAC) work across microservices?
**Answer:** `auth-service` embeds user roles (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_HR`, `ROLE_EMPLOYEE`) inside the JWT claims payload during authentication. Downstream microservices parse the verified JWT claims to enforce granular authority rules (`@PreAuthorize("hasAuthority('ROLE_ADMIN')")`).

### Q3: How do stateless JWT tokens enhance microservices scalability?
**Answer:** Unlike traditional HTTP sessions which store session state in server memory, stateless JWT tokens contain signed user claims. Any microservice instance can validate the token independently without querying a central session database.
