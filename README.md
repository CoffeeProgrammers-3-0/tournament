# 🏆 Programming Tournament Platform 2026

[![Mission & Details](https://img.shields.io/badge/Mission-SFL_Programming_Tournament-blue?style=for-the-badge)](https://www.sflua.org/uk/copy-of-programming-tournament-2026)
[![Java 21](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://java.com)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/)
[![React 19](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

A comprehensive, full-stack platform built to manage and host the **SFL Programming Tournament 2026**. This application provides a seamless experience for participants and administrators, featuring robust authentication, real-time updates, interactive scheduling, and automated document processing.

## ✨ Key Features

* **Secure Authentication & Authorization:** Centralized identity management powered by Keycloak with custom themes.
* **Real-Time Capabilities:** Live updates and notifications using WebSockets (STOMP).
* **Interactive Scheduling:** Advanced calendar and event management using React Big Calendar and Schedule-X.
* **Multi-language Support:** Dynamic localization via `i18next` on the frontend and language detection on the backend.
* **Automated Document Processing:** Dedicated `pdf-worker` microservice for generating and handling PDFs.
* **Modern UI/UX:** Built with Material UI (MUI) for a clean, responsive, and accessible interface.

---

## START


1. Install and open docker desktop and git (if you don't have it already downloaded to your computer)

    - [docker-desktop](https://www.docker.com/products/docker-desktop/)

    - [git](https://git-scm.com/downloads)

2. Open the docker desktop and start it

3. Clone the repository:
   ```
    git clone https://github.com/CoffeeProgrammers-3-0/tournament.git
   ```
4. Navigate to the project directory:
   ```
   cd tournament
   ```
5. Start with the dc.bat file or use the dc.sh file to start the containers

6. After a full start of all containers,
    - for dev – go to the [localhost:3000](http://localhost:3000) to see the application.
    - for prod – go to the [localhost](http://localhost) to see the application.

For dev links:
- frontend: [localhost:3000](http://localhost:3000)
- swagger: [localhost:8081/api-docs](http://localhost:8081/api-docs)
- keycloak: [localhost:8080](http://localhost:8080)
- backend: [localhost:8081](http://localhost:8081)

For prod links:
- frontend: [localhost](http://localhost)
- swagger: [localhost/api-docs](http://localhost/api-docs)
- keycloak: [localhost/auth](http://localhost/auth)
- backend: [localhost/api](http://localhost/api)
---

## 🛠️ Technology Stack

### **Frontend**
* **Core:** React 19, TypeScript, Vite
* **Styling & Components:** Material UI (MUI) v7, Emotion
* **Routing & State:** React Router v7
* **Data Visualization & Calendars:** MUI X-Charts, Schedule-X, React Big Calendar
* **Testing:** Vitest, React Testing Library

### **Backend**
* **Core:** Java 21, Spring Boot 3.5.3
* **Database:** PostgreSQL 17, Liquibase (Migrations), Spring Data JPA
* **Security:** Spring Security, OAuth2 (Keycloak Integration)
* **Utilities:** MapStruct, Lombok, Apache POI, Jsoup, Freemarker (Emails)
* **API Documentation:** Springdoc OpenAPI (Swagger)

### **Infrastructure & DevOps**
* **Orchestration:** Docker Compose
* **Proxy/Web Server:** NGINX
* **Identity Provider:** Keycloak 26

---

## 📂 Project Structure

This project is structured as a monorepo containing all necessary services:

```text
tournament/
├── backend/            # Spring Boot REST API
├── frontend/           # React SPA 
├── nginx/              # NGINX reverse proxy configurations
├── pdf-worker/         # Microservice for PDF processing
├── themes/             # Custom Keycloak UI themes
├── .env* # Environment variable configurations
└── docker-compose.yml  # Docker orchestration setup
```

---

## Users:

- Admin:
  - email: ```admin@test-user.com```
  - password: ```passWord1```

**Note: Users with email @test-user.com will be automatically created with password passWord1 and won`t receive any email.**

