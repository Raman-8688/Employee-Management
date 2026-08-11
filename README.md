# 🏢 Enterprise Employee Management System (EMS)

An MNC-grade, production-ready **Employee Management & HR Operating System** built with **Spring Boot 3**, **Angular 19**, **Nvidia AI (GenAI LLMs)**, and **PostgreSQL**.

---

## 🚀 Key Modules & Highlights

### 🤖 1. Nvidia AI HR Copilot & Document Intelligence
* **Multi-Model Resiliency Engine:** Integrates with Nvidia AI (`integrate.api.nvidia.com`) with automatic fallback between models:
  * `meta/llama-3.1-8b-instruct` (Primary 100% Verified)
  * `meta/llama-3.1-70b-instruct`
  * `mistralai/mistral-7b-instruct-v0.2`
  * `google/gemma-2-27b-it`
* **Automated Performance Reviews:** One-click automated performance appraisal evaluations generated for employees based on profile data.
* **HR Document Analysis:** Upload text/PDF/CSV documents for instant AI summarizing and policy Q&A.
* **Microphone Voice Assistant (Speech-to-Text 🎙️):** Integrated Web Speech Recognition API (`SpeechRecognition`) for real-time voice input.
* **Voice Speaker (Text-to-Speech 🔊):** Integrated Web Speech API (`speechSynthesis`) so AI responses can be listened to out loud.
* **ChatGPT/Claude-Style Input Toolbar:** Sleek input bar combining model dropdown, file attachment button, microphone recorder, and send button.

### 📊 2. Executive Dashboard Overview
* **Top KPI Summary Cards:** Active Headcount, Onboarding, Offboarding, and Total Monthly Payroll Outflow.
* **Department Distribution Widget:** Department headcount breakdown, percentage ratios, and monthly salary budget progress bars.
* **Quick Action Shortcuts & Recent Activity Feed:** Instant access to adding recruits, AI appraisals, payroll, documents, and real-time system audit feeds.

### 💵 3. Payroll Management Module
* **Automated Calculations:** Itemized breakdown of Base Salary, Deductions (10% standard tax/PF calculation), and Net Payable Salary.
* **Payment Status Tracking:** Color-coded status badges (`Paid`, `Processing`, `Pending`).
* **Payslip Generator:** Downloadable itemized payslips (`Payslip_Name_August2026.txt`) generated on the fly.
* **Batch Payroll Processing:** One-click batch payroll execution for all pending employees.

### ⏱️ 4. Time Tools & Attendance Module
* **Live Punch Clock Widget:** Interactive 🟢 Clock In / 🔴 Clock Out widget with IP and location tagging.
* **Monthly Attendance & Grid View:** Detailed calendar grid with daily hours, break times, overtime tracking, and status badges (`Present`, `Absent`, `WFH`, `Half-Day`, `Leave`).
* **History & Audit Trail Log:** Complete audit log tracking admin manual overrides, status changes, and modification notes.
* **Admin Override Modal:** Admin modal to override attendance times/statuses with mandatory audit log note!

### 🖼️ 5. Media Management & WhatsApp-Style Profile Photo Lightbox
* **Multipart Storage:** Server-side file upload serving static images from `/uploads/profile-images/`.
* **WhatsApp-Style Photo Lightbox:** Clicking any employee's avatar in the table opens a full-screen dark backdrop modal displaying the high-res photo with an instant **"📷 Change Photo"** button.

### 🛡️ 6. Enterprise Security & Architecture Patterns
* **JWT Stateless Authentication:** Secure token-based access with role-based authorization (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_USER`).
* **POST-Based Encrypted Payload Pattern:** Sensitive query criteria are sent via encrypted HTTPS POST bodies to prevent parameter leakage in server access logs and URLs.
* **Reusable Confirm Dialog Service:** Async `ConfirmDialogService` replacing default browser confirm dialogs.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | Java 17, Spring Boot 3.3.x, Spring Security, Spring Data JPA |
| **Database** | PostgreSQL |
| **AI Integration** | Nvidia AI Open-AI API (`integrate.api.nvidia.com`) |
| **Frontend Framework** | Angular 19 (Standalone Components, RxJS) |
| **UI & Styling** | Bootstrap 5.3, Angular Material Icons |
| **Speech APIs** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |

---

## 📁 Repository Directory Structure

```
Employee-Management/
├── backend/
│   ├── src/main/java/com/employee/backend/
│   │   ├── config/             # Security & Web MVC configurations
│   │   ├── controller/         # REST Controllers (Auth, Employee, AI, Attendance)
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── entity/             # JPA Entities (Employee, AttendanceRecord, AuditLog)
│   │   ├── reopository/        # Spring Data JPA Repositories
│   │   ├── security/           # JWT Filters & Entry Points
│   │   └── service/            # Business Logic Services & Nvidia AI Engine
│   └── src/main/resources/
│       ├── application.properties
│       └── application-secret.properties  # Secret keys (Git-ignored)
└── frontend/
    ├── src/app/
    │   ├── components/         # Angular Standalone Components
    │   │   ├── ai-copilot/
    │   │   ├── auth/
    │   │   ├── dashboard/
    │   │   ├── dashboard-overview/
    │   │   ├── employee-list/
    │   │   ├── payroll/
    │   │   ├── sidebar/
    │   │   └── time-tools/
    │   ├── services/           # Angular HTTP Services (Auth, Employee, AI, TTS, STT)
    │   └── shared/             # Reusable Confirm Dialog & Utilities
```

---

## ⚡ Getting Started & Local Setup

### Prerequisites
- **Java 17 JDK**
- **Node.js (v18+)** and `npm` / `npx`
- **PostgreSQL Database** running on `localhost:5432` with database name `emp_db`

---

### 1. Backend Setup (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Verify secret configuration file `src/main/resources/application-secret.properties`:
   ```properties
   nvidia.ai.api-key=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
   nvidia.ai.url=https://integrate.api.nvidia.com/v1/chat/completions
   nvidia.ai.default-model=meta/llama-3.1-8b-instruct
   ```
3. Build and compile the backend:
   ```bash
   mvnw.cmd compile
   ```
4. Run the Spring Boot Application:
   ```bash
   mvnw.cmd spring-boot:run
   ```
   *The backend runs on `http://localhost:8080`.*

---

### 2. Frontend Setup (Angular)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
4. Open `http://localhost:4200` in your web browser.

---

## 🔑 Default Credentials

The system automatically seeds initial admin credentials into the database on startup:

- **Role:** Administrator (`ROLE_ADMIN`)
- **Username:** `admin`
- **Password:** `Admin@123`

---

## 🔗 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | User login & JWT token generation | No |
| `GET` | `/employee/findAll` | Fetch all employees | Yes |
| `POST` | `/employee/upload-image` | Upload profile image (Multipart) | Yes |
| `POST` | `/api/ai/chat` | AI Copilot Chat | Yes |
| `POST` | `/api/ai/performance-review` | Generate automated AI performance evaluation | Yes |
| `POST` | `/api/ai/analyze-document` | Analyze uploaded document via AI | Yes |
| `GET` | `/api/attendance/summary` | Fetch monthly attendance KPI metrics | Yes |
| `POST` | `/api/attendance/clock-in` | Punch-in real-time attendance | Yes |
| `PUT` | `/api/attendance/override/{id}` | Admin override attendance & log audit trail | Yes (Admin) |

---

## 📄 License & Contact

This project is built for enterprise application learning, interview preparation, and technical stack mastery.
