# 🌐 Nexus 360 Enterprise Platform

> **Industrial-Grade Cloud-Native Microservices Architecture** | **Architect:** [Ramanjaneyulu Boya](https://raman-8688.github.io/portfolio-projects/)
> 
> *Connecting Enterprise Workforce Intelligence, Jira Sprint Velocity, Project Knowledge 360°, Real-Time Notification Publishing, and Nvidia GenAI Copilot.*

---

## 📸 Authentication & Platform Showcase

![Nexus 360 Split-Screen Login Page](file:///C:/Users/admin/.gemini/antigravity/brain/b4917d56-28aa-4b63-b24f-67a99b15155b/.user_uploaded/media_1786887016969.png)

### 🌟 Key Highlights
- **Split-Screen Interactive Layout**: Dual-panel design uniting an active sign-in form on the left with an animated platform showcase & developer portfolio hub on the right.
- **Mandatory Employee Directory Pre-Verification**: During account registration, `auth-service` performs real-time pre-validation (`GET /employee/verify-email`) against `employee-service` to ensure only verified employees present in the company directory can create an account.
- **Developer Portfolio Integration**: Instant access to the Platform Architect's interactive portfolio ([`https://raman-8688.github.io/portfolio-projects/`](https://raman-8688.github.io/portfolio-projects/)), GitHub ([`Raman-8688`](https://github.com/Raman-8688)), and LinkedIn profile.

---

## 🏗️ Microservices Architecture & Ecosystem Topology

```
                                  +-----------------------+
                                  |    Angular 18 SPA     |
                                  | (http://localhost:4200)|
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  |  Spring Cloud Gateway |
                                  | (http://localhost:8080)|
                                  +-----------+-----------+
                                              |
      +---------------------+-----------------+---------------------+---------------------+
      |                     |                 |                     |                     |
      v                     v                 v                     v                     v
+-----------+         +-----------+     +-----------+         +-----------+         +-----------+
|auth-serv. |         |emp-service|     |task-serv. |         |proj-know. |         |notif-serv.|
|(Port 8081)|         |(Port 8082)|     |(Port 8083)|         |(Port 8084)|         |(Port 8085)|
|DB:auth_db |         |DB: emp_db |     |DB: task_db|         |DB:proj_k_db|        |DB:notif_db|
+-----------+         +-----------+     +-----------+         +-----------+         +-----------+
      ^                     ^                 ^                     ^                     ^
      +---------------------+-----------------+---------------------+---------------------+
                                              |
                                  +-----------+-----------+
                                  |    Eureka Registry    |
                                  | (http://localhost:8761)|
                                  +-----------------------+
```

---

## 🗄️ Microservices Database Isolation Matrix

Every microservice operates on its dedicated relational database to enforce strict domain boundary compliance:

| Microservice | Port | Service ID | Dedicated Database | Scope & Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `auth-service` | `8081` | `AUTH-SERVICE` | `auth_db` | JWT Token issuance, authentication, Security Roles (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_HR`, `ROLE_EMPLOYEE`, `ROLE_USER`), Employee Directory Pre-Verification |
| `employee-service` | `8082` | `EMPLOYEE-SERVICE` | `emp_db` | HR Employee directory, 10MB multipart profile photo upload, attendance audit ledger, itemized payroll, Nvidia GenAI Copilot |
| `task-service` | `8083` | `TASK-SERVICE` | `task_db` | Jira Kanban tasks, subtask checklists, time tracking, velocity metrics, learnings knowledge attachments |
| `project-knowledge-service` | `8084` | `PROJECT-KNOWLEDGE-SERVICE` | `project_knowledge_db` | Enterprise project catalog, tech stacks, database schemas, stored procedures, screen registries, API endpoint catalog |
| **`notification-service`** | **`8085`** | **`NOTIFICATION-SERVICE`** | **`notification_db`** | **Real-time event notification center, asynchronous event dispatcher, unread badge counter, DB ledger** |

---

## 💎 Core Pillars & Enterprise Modules

### 🔔 1. Real-Time Cross-Service Notification Center (`notification-service`)
- **Port:** `8085` | **Dedicated Database:** `notification_db`
- **Event-Driven Architecture**: Asynchronously listens for system events across microservices:
  - **Task Events**: Triggers alerts when a task is created or status transitions (e.g. `TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`).
  - **HR Onboarding Events**: Triggers alerts when a new employee is onboarded or profile details are updated.
- **Top Navbar Bell Widget**: Dynamic badge counter showing unread notifications with auto-polling (interval 10s) and quick-preview dropdown menu.
- **Notification Center Hub (`/dashboard/notifications`)**: Full-screen notification hub with KPI metric cards, category filter tabs (`ALL`, `TASK`, `SYSTEM`, `HR`, `ALERT`), mark as read, and test event dispatcher modal.

### 🏢 2. Project Knowledge 360° Inspector (`project-knowledge-service`)
- **Port:** `8084` | **Dedicated Database:** `project_knowledge_db`
- **Domain Project Catalog:** Central tracking for enterprise applications across **AMS (Asset Management System)**, **Pharma Clinical Suite**, **Construction ERP**, and **General Enterprise**.
- **Project 360° Inspector:** Deep architectural inspection with 5 dedicated tabs:
  1. *Tech Stack & Architecture:* Frontend, Backend, Database, DevOps, and AI component registry.
  2. *Database & Schemas Inventory:* Tables, column summaries, and stored procedures used (e.g. `sp_calculate_depreciation`, `sp_fda_safety_audit`).
  3. *Screens & Submenus Registry:* Registered modules, Angular component trees, and submenu paths.
  4. *API Endpoints Registry:* REST endpoints list with HTTP method badges (`GET`, `POST`, `PUT`, `DELETE`).
  5. *Architecture Documents Repository:* File repository with upload & download support for PDFs, specifications, and architecture diagrams under `/project-docs/`.

### 📌 3. Jira-Style Task Management, Velocity & Time Tracking (`task-service`)
- **Port:** `8083` | **Dedicated Database:** `task_db`
- **Sprint Analytics KPI Hub:** Modern velocity summary cards, hours logged progress bars, bugs resolved tracker, and sprint health ratios.
- **Interactive Kanban Board:** Drag-and-drop status transitions (`TO DO`, `IN PROGRESS`, `IN REVIEW`, `DONE`) with checklist progress indicators.
- **Automated Task Duration Calculation:** Moving a task to `DONE` automatically calculates elapsed work hours between `createdAt` and completion timestamp.
- **Task Learnings Knowledge Base:** Technical learnings repository with multi-part file attachment support (PDF, DOCX, PNG, JPG).

### 🤖 4. Nvidia AI GenAI Copilot & Document Intelligence (`employee-service`)
- **Port:** `8082` | **Dedicated Database:** `emp_db`
- **Multi-Model Resiliency Engine:** Automatic fallback across Nvidia AI models (`meta/llama-3.1-8b-instruct`, `meta/llama-3.1-70b-instruct`, `mistralai/mistral-7b-instruct-v0.2`, `google/gemma-2-27b-it`).
- **Voice Assistant (STT & TTS):** Integrated Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) for hands-free voice interaction.
- **Document Analysis Engine:** PDF/CSV document parsing for instant policy summaries.

### 👥 5. Workforce Directory, Attendance Clock & Audit Ledger
- **Live Attendance Clock:** Interactive 🟢 Clock In / 🔴 Clock Out widget with IP and geo-location tracking.
- **Admin Override & Audit Trail:** Secure override modal for attendance corrections with mandatory audit justification notes.
- **Profile Photo Lightbox:** Avatar lightbox modal with high-res 10MB file upload support.

---

## 🛠️ Technology Stack & Architectural Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Architecture** | Spring Cloud Microservices | Decentralized, domain-driven microservices for scalable organizational growth |
| **Service Discovery** | Netflix Eureka (`service-registry`) | Dynamic service discovery enabling zero-downtime microservice registration |
| **API Gateway** | Spring Cloud Gateway (`api-gateway`) | Centralized ingress routing, CORS deduplication, and 20MB request buffer |
| **Backend Framework** | Java 17, Spring Boot 3.3.x, Spring Data JPA | Industrial performance, strong typing, and enterprise JPA abstractions |
| **Database Systems** | PostgreSQL 15+ (H2 Fallback Profiles) | Production relational persistence with unique constraint validation |
| **Security** | Spring Security 6 & JJWT 0.12.5 | Stateless JWT authentication and role-based route protection (`ROLE_EMPLOYEE`) |
| **Frontend Framework** | Angular 18 (Standalone Components) | Type-safe, modular SPA architecture with RxJS reactive state streams |
| **Styling** | Vanilla CSS3 & Bootstrap 5 | Modern glassmorphism design system, CSS animations, and fluid responsiveness |

---

## 📁 Repository Directory Structure

```
Nexus-360-Enterprise-Platform/
├── backend/
│   ├── pom.xml                                 # Root Maven Multi-Module POM
│   ├── common-library/                         # Shared DTOs (ApiResponse, UserDto, EmployeeDto)
│   ├── service-registry/                       # Eureka Server (Port 8761)
│   ├── api-gateway/                            # Spring Cloud Gateway Ingress (Port 8080)
│   ├── auth-service/                           # JWT Authentication Service (Port 8081)
│   ├── employee-service/                       # Employees, Payroll, AI Copilot Service (Port 8082)
│   ├── task-service/                           # Jira Tasks, Sprint Velocity Service (Port 8083)
│   ├── project-knowledge-service/              # Enterprise Project Hub Service (Port 8084)
│   └── notification-service/                   # Real-Time Event Notification Hub (Port 8085)
└── frontend/
    ├── src/app/
    │   ├── components/
    │   │   ├── ai-copilot/                     # Nvidia GenAI Voice & Text Copilot
    │   │   ├── auth/                           # Split-Screen Login & Register Pages
    │   │   ├── dashboard/                      # Main Dashboard Container
    │   │   ├── dashboard-overview/             # Executive Overview Widgets
    │   │   ├── employee-list/                  # Employee Directory & Profile Lightbox
    │   │   ├── notification-center/            # Notification Center Hub & Top Bell Widget
    │   │   ├── payroll/                        # Payroll Engine & Payslip Generator
    │   │   ├── project-knowledge/              # Projects Directory & 360° Inspector
    │   │   ├── sidebar/                        # Sliding Submenu Navigation
    │   │   ├── task-board/                     # Jira Kanban, Sprint KPIs & Learnings
    │   │   └── time-tools/                     # Attendance Clock & Audit Ledger
    │   ├── services/                           # Reactive HTTP API Services
    │   └── app.routes.ts                       # Lazy-Loaded Route Mappings
```

---

## ⚡ Getting Started & Launch Sequence

### Prerequisites
1. **Java 17 JDK** installed and configured in `PATH`.
2. **Node.js (v18+)** & `npm` / `npx`.
3. **PostgreSQL Database** running on `localhost:5432` with databases: `auth_db`, `emp_db`, `task_db`, `project_knowledge_db`, `notification_db`.

---

### Step-by-Step Startup Sequence

#### 1. Compile Backend Microservices
```bash
cd backend
mvnw.cmd compile
```

#### 2. Start Microservices in Order

1. **Service Registry (Eureka)**:
   ```bash
   cd backend/service-registry
   ..\mvnw.cmd spring-boot:run
   ```
   *Dashboard available at `http://localhost:8761`.*

2. **API Gateway**:
   ```bash
   cd backend/api-gateway
   ..\mvnw.cmd spring-boot:run
   ```
   *Ingress Gateway runs on `http://localhost:8080`.*

3. **Auth Service**:
   ```bash
   cd backend/auth-service
   ..\mvnw.cmd spring-boot:run
   ```

4. **Employee Service**:
   ```bash
   cd backend/employee-service
   ..\mvnw.cmd spring-boot:run
   ```

5. **Task Service**:
   ```bash
   cd backend/task-service
   ..\mvnw.cmd spring-boot:run
   ```

6. **Project Knowledge Service**:
   ```bash
   cd backend/project-knowledge-service
   ..\mvnw.cmd spring-boot:run
   ```

7. **Notification Service**:
   ```bash
   cd backend/notification-service
   ..\mvnw.cmd spring-boot:run
   ```

#### 3. Start Angular Frontend SPA
```bash
cd frontend
npm install
npm start
```
*Access Nexus 360 Enterprise Platform at `http://localhost:4200`.*

---

## 🔑 Default Credentials

- **Administrator Access:** Username: `admin` | Password: `Admin@123`
- **Employee Access:** Register any email pre-existing in `employee-service` (e.g., `ramanms8688@gmail.com`).

---

## 🔗 Gateway Ingress API Registry (Port `8080`)

| Method | Ingress Route Path | Microservice Target | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | `AUTH-SERVICE` | User authentication & JWT issuance |
| `POST` | `/auth/register` | `AUTH-SERVICE` | Register account with employee email pre-check |
| `GET` | `/employee/findAll` | `EMPLOYEE-SERVICE` | Fetch employee directory |
| `GET` | `/employee/verify-email` | `EMPLOYEE-SERVICE` | Public employee email existence check |
| `POST` | `/employee/save` | `EMPLOYEE-SERVICE` | Save employee with unique constraint validation |
| `POST` | `/employee/upload-image` | `EMPLOYEE-SERVICE` | 10MB multipart profile photo upload |
| `GET` | `/api/tasks` | `TASK-SERVICE` | Fetch Jira tasks & backlog |
| `POST` | `/api/tasks` | `TASK-SERVICE` | Create task & dispatch event notification |
| `GET` | `/api/projects` | `PROJECT-KNOWLEDGE-SERVICE` | Fetch enterprise projects directory |
| `GET` | `/api/notifications/user/{id}` | `NOTIFICATION-SERVICE` | Fetch user notifications & unread count |
| `POST` | `/api/notifications/dispatch` | `NOTIFICATION-SERVICE` | Asynchronous event notification dispatcher |

---

## 👨‍💻 Developer & Platform Architect

- **Platform Architect:** Ramanjaneyulu Boya
- **Interactive Portfolio:** [`https://raman-8688.github.io/portfolio-projects/`](https://raman-8688.github.io/portfolio-projects/)
- **GitHub Repository:** [`https://github.com/Raman-8688`](https://github.com/Raman-8688)
- **LinkedIn Profile:** [Ramanjaneyulu Boya on LinkedIn](https://www.linkedin.com)
