# 🌐 Nexus 360 Enterprise Platform

> **Formerly Winfo / Employee System** — Upgraded into an Industrial-Grade, Resilient, Cloud-Native **Nexus Enterprise Hub** connecting Enterprise Applications (AMS, Pharma, Construction), Database Schemas, REST APIs, Jira Sprint Velocity, and Nvidia GenAI Copilot Intelligence.

---

## 🌟 Executive Summary & High-Tech Vision

**Nexus 360 Enterprise Platform** serves as the central neural nexus for modern tech and engineering organizations. It bridges corporate silos by connecting:
1. **Application & Knowledge Governance:** Central lookup for tech stacks, database schemas, stored procedures, screen components, and API endpoints across vertical domains (AMS - Asset Management System, Pharma Clinical Suite, Construction ERP).
2. **Jira-Style Sprint & Time Velocity:** Kanban board with automated time calculation upon task completion and task learnings knowledge base.
3. **Nvidia GenAI Copilot Intelligence:** Multi-model resilient LLM assistant with voice input/output and document analysis.
4. **Workforce Operations:** Directory, attendance clock, audit ledger, and payroll engine.

---

## 🏗️ Microservices Architecture & Ecosystem Topology

```
                                  +-----------------------+
                                  |    Angular 19 SPA     |
                                  | (http://localhost:4200)|
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  |  Spring Cloud Gateway |
                                  | (http://localhost:8080)|
                                  +-----------+-----------+
                                              |
                        +---------------------+---------------------+
                        |                     |                     |
                        v                     v                     v
              +-------------------+ +-------------------+ +-------------------+ +-----------------------+
              |   auth-service    | |  employee-service | |   task-service    | |project-knowledge-service|
              | (Port: 8081)      | | (Port: 8082)      | | (Port: 8083)      | | (Port: 8084)          |
              | DB: auth_db       | | DB: emp_db        | | DB: task_db       | | DB: project_knowledge_db|
              +-------------------+ +-------------------+ +-------------------+ +-----------------------+
                        ^                     ^                     ^                     ^
                        +---------------------+---------------------+---------------------+
                                              |
                                  +-----------+-----------+
                                  |    Eureka Registry    |
                                  | (http://localhost:8761)|
                                  +-----------------------+
```

---

## 🗄️ Microservices Database Isolation Matrix

Every microservice operates on its dedicated relational database to guarantee domain boundary compliance:

| Microservice | Port | Service ID | Dedicated Database | Scope & Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `auth-service` | `8081` | `AUTH-SERVICE` | `auth_db` | User authentication, security roles (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_EMPLOYEE`), JWT issuance |
| `employee-service` | `8082` | `EMPLOYEE-SERVICE` | `emp_db` | Employee directory, payroll records, attendance logs, Nvidia AI copilot engine |
| `task-service` | `8083` | `TASK-SERVICE` | `task_db` | Jira tasks, subtask checklists, time tracking, velocity metrics, learnings attachments |
| **`project-knowledge-service`** | **`8084`** | **`PROJECT-KNOWLEDGE-SERVICE`** | **`project_knowledge_db`** | **Nexus project catalog, tech stacks, database schemas, stored procedures, screens, APIs & docs** |

---

## 💎 Core Pillars & Enterprise Modules

### 🏢 1. Nexus Enterprise Application & Project Knowledge Hub (`project-knowledge-service`)
- **Port:** `8084` | **Dedicated Database:** `project_knowledge_db`
- **Domain Project Catalog:** Central tracking for enterprise applications across **AMS (Asset Management System)**, **Pharma Clinical Suite**, **Construction ERP**, and **General Enterprise**.
- **Project 360° Inspector:** Deep architectural inspection with 5 dedicated tabs:
  1. *Tech Stack & Architecture:* Frontend, Backend, Database, DevOps, and AI component registry.
  2. *Database & Schemas Inventory:* Tables, column summaries, and stored procedures used (e.g. `sp_calculate_depreciation`, `sp_fda_safety_audit`).
  3. *Screens & Submenus Registry:* Registered modules, Angular component trees, and submenu paths.
  4. *API Endpoints Registry:* REST endpoints list with HTTP method badges (`GET`, `POST`, `PUT`, `DELETE`).
  5. *Architecture Documents Repository:* File repository with upload & download support for PDFs, specifications, and architecture diagrams under `/project-docs/`.
- **Project Registration Wizard:** Multi-step onboarding form allowing architects and leads to document new projects from scratch.

### 📌 2. Jira-Style Task Management, Velocity & Time Tracking (`task-service`)
- **Port:** `8083` | **Dedicated Database:** `task_db`
- **Interactive Kanban Board:** Drag-and-drop status transitions (`TO DO`, `IN PROGRESS`, `IN REVIEW`, `DONE`) with checklist progress indicators.
- **Automated Task Duration Calculation:** Moving a task to `DONE` automatically calculates elapsed work hours between `createdAt` and completion timestamp, persisting an automated ledger log to accurately track velocity.
- **Task Learnings & Best Practices Knowledge Base:** Technical knowledge repository with multi-part file attachment support (PDF, DOCX, PNG, JPG) stored under `/uploads/learnings/`.
- **Role-Based Access Control (RBAC):** Standard employees can view the company board, but can only edit/move tasks assigned to them. Admins & Managers retain full CRUD authority.

### 🤖 3. Nvidia AI GenAI Copilot & Document Intelligence (`employee-service`)
- **Port:** `8082` | **Dedicated Database:** `emp_db`
- **Multi-Model Resiliency Engine:** Automatic fallback across Nvidia AI models (`meta/llama-3.1-8b-instruct`, `meta/llama-3.1-70b-instruct`, `mistralai/mistral-7b-instruct-v0.2`, `google/gemma-2-27b-it`).
- **Voice Assistant (STT & TTS):** Integrated Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) for real-time hands-free voice interaction.
- **Automated Performance Appraisals:** One-click AI evaluation generator based on employee performance data.
- **Document Analysis Engine:** PDF/CSV document parsing for instant AI policy summaries.

### 👥 4. Workforce Directory, Attendance Clock & Audit Ledger
- **Live Attendance Clock:** Interactive 🟢 Clock In / 🔴 Clock Out widget with IP and geo-location tracking.
- **Monthly Attendance Grid:** Calendar view with daily working hours, WFH, overtime tracking, and status badges.
- **Admin Override & Audit Trail:** Secure override modal for attendance corrections with mandatory audit justification notes.
- **WhatsApp-Style Profile Photo Lightbox:** Avatar lightbox modal with high-res file upload preview.

### 💵 5. Payroll Management Engine
- **Itemized Payroll Calculation:** Base salary breakdown, itemized 10% tax/PF deductions, and net payable salary.
- **Payslip Generator:** Instant text payslip file generator (`Payslip_August2026.txt`).
- **Batch Processing:** One-click batch payroll execution.

---

## 🛠️ Technology Stack & Architectural Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Architecture** | Spring Cloud Microservices | Decentralized, domain-driven microservices for scalable organizational growth |
| **Service Discovery** | Netflix Eureka (`service-registry`) | Dynamic service registry enabling zero-downtime microservice registration |
| **API Gateway** | Spring Cloud Gateway (`api-gateway`) | Centralized ingress routing, CORS deduplication, and request predicates |
| **Backend Framework** | Java 17, Spring Boot 3.3.x, Spring Data JPA | Industrial performance, strong typing, and enterprise JPA abstractions |
| **Database Systems** | PostgreSQL 15+ (H2 Fallback Profiles) | Production relational persistence with JSONB and transaction safety |
| **Security** | Spring Security 6 & JJWT 0.12.5 | Stateless JWT authentication and role-based route protection |
| **AI Copilot** | Nvidia GenAI API (`integrate.api.nvidia.com`) | State-of-the-art LLM reasoning with automated fallback models |
| **Frontend Framework** | Angular 19 (Standalone Components) | Type-safe, modular SPA architecture with RxJS reactive state streams |
| **Navigation Style** | Amazon-Style Sliding Submenus | Two-panel navigation with smooth CSS transitions and `← MAIN MENU` header |

---

## 📁 Repository Directory Structure

```
Nexus-360-Enterprise-Platform/
├── backend/
│   ├── pom.xml                                 # Root Maven Multi-Module POM
│   ├── common-library/                         # Shared DTOs (ApiResponse, UserPrincipal)
│   ├── service-registry/                       # Eureka Server (Port 8761)
│   ├── api-gateway/                            # Spring Cloud Gateway Ingress (Port 8080)
│   ├── auth-service/                           # JWT Authentication Service (Port 8081)
│   ├── employee-service/                       # Employees, Payroll, AI Copilot Service (Port 8082)
│   ├── task-service/                           # Jira Tasks, Sprint Velocity Service (Port 8083)
│   └── project-knowledge-service/              # Enterprise Project Hub Service (Port 8084)
└── frontend/
    ├── src/app/
    │   ├── components/
    │   │   ├── ai-copilot/                     # Nvidia GenAI Voice & Text Copilot
    │   │   ├── auth/                           # Login & Register Screens
    │   │   ├── dashboard/                      # Dashboard Container
    │   │   ├── dashboard-overview/             # Executive Overview Widgets
    │   │   ├── employee-list/                  # Employee Directory & Profile Lightbox
    │   │   ├── payroll/                        # Payroll Engine & Payslip Generator
    │   │   ├── project-knowledge/              # Projects Directory, 360 Inspector & Wizard
    │   │   ├── sidebar/                        # Amazon-Style Sliding Navigation
    │   │   ├── task-board/                     # Jira Kanban, Backlog, Time Logs & Learnings
    │   │   └── time-tools/                     # Attendance Clock & Audit Ledger
    │   ├── services/                           # Reactive HTTP API Services
    │   └── app.routes.ts                       # Lazy-Loaded Route Mappings
```

---

## ⚡ Getting Started & Launch Sequence

### Prerequisites
1. **Java 17 JDK** installed and configured in `PATH`.
2. **Node.js (v18+)** & `npm` / `npx`.
3. **PostgreSQL Database** running on `localhost:5432` with databases created: `auth_db`, `emp_db`, `task_db`, `project_knowledge_db` *(Or use fallback H2 embedded profile)*.

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

#### 3. Start Angular Frontend SPA
```bash
cd frontend
npm install
npm start
```
*Access Nexus 360 Enterprise Platform at `http://localhost:4200`.*

---

## 🔑 Default Credentials

The platform auto-seeds initial administrator access on startup:

- **Role:** Administrator (`ROLE_ADMIN`)
- **Username:** `admin`
- **Password:** `Admin@123`

---

## 🔗 Gateway Ingress API Registry (Port `8080`)

| Method | Ingress Route Path | Microservice Target | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | `AUTH-SERVICE` | User authentication & JWT issuance |
| `GET` | `/employee/findAll` | `EMPLOYEE-SERVICE` | Fetch employee directory |
| `POST` | `/api/ai/chat` | `EMPLOYEE-SERVICE` | Nvidia GenAI Copilot stream |
| `GET` | `/api/tasks` | `TASK-SERVICE` | Fetch tasks & backlog |
| `POST` | `/api/tasks/learnings/upload` | `TASK-SERVICE` | Upload task learning attachment |
| `GET` | `/api/projects` | `PROJECT-KNOWLEDGE-SERVICE` | Fetch enterprise projects directory |
| `GET` | `/api/projects/{id}` | `PROJECT-KNOWLEDGE-SERVICE` | Fetch Project 360° Inspector details |
| `POST` | `/api/projects/{id}/documents/upload` | `PROJECT-KNOWLEDGE-SERVICE` | Upload architecture blueprint document |

---

## 📄 License & Organization

**Nexus 360 Enterprise Platform** is built for high-performance enterprise operations, architectural inspection, and cloud-native microservices engineering.
