# 🚌 BookMyRoute

A full-stack bus ticket booking web application built with **React + Vite** (frontend) and **Spring Boot** (backend). Users can search for bus routes, book seats, pay securely via Razorpay, manage bookings, and interact with an AI chatbot — all managed through a clean admin dashboard.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Default Credentials](#default-credentials)
- [API Overview](#api-overview)
- [Database Schema](#database-schema)
- [Payment Gateway](#payment-gateway)
- [Chatbot Setup](#chatbot-setup-optional)
- [Build for Production](#build-for-production)

---

## ✨ Features

### 👤 User
- Register & login with JWT-based authentication
- Search bus routes by source, destination & date
- View available schedules with seat availability
- Select seats and book tickets
- **Real-time payment via Razorpay** (UPI, Card, Net Banking, Wallet)
- Download ticket as PDF after booking
- View & manage personal bookings
- Submit and manage route reviews
- AI-powered chatbot assistant
- Help & support ticket system

### 🛠️ Admin
- Admin dashboard with stats & analytics
- Manage buses (add, edit, activate/deactivate)
- Manage routes and schedules
- View and manage all user bookings
- Manage user accounts
- Reply to support tickets

---

## 🧰 Tech Stack

### Frontend
| Technology | Version |
|-----------|---------|
| React | 18.3.1 |
| Vite | 5.3.1 |
| Tailwind CSS | 3.4.4 |
| React Router DOM | 6.24.0 |
| Axios | 1.7.2 |
| Recharts | 2.12.7 |
| React Hot Toast | 2.4.1 |
| React Icons | 5.2.1 |
| Date-fns | 3.6.0 |

### Backend
| Technology | Version |
|-----------|---------|
| Java | 17 |
| Spring Boot | 3.2.4 |
| Spring Security | (included) |
| Spring Data JPA | (included) |
| MySQL | 8.0+ |
| JWT (jjwt) | 0.11.5 |
| MapStruct | 1.5.5 |
| Apache PDFBox | 2.0.30 |
| Razorpay Java SDK | 1.4.3 |

---

## 📁 Project Structure

```
BookMyRoute/
├── frontend/                        # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   └── common/              # Navbar, Footer, Chatbot, ProtectedRoute
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── BookingPage.jsx      # Seat selection + Razorpay checkout
│   │   │   ├── MyBookingsPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── AuthPages.jsx
│   │   ├── context/                 # Auth context (global state)
│   │   └── services/
│   │       └── api.js               # Axios API service layer (incl. paymentApi)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                         # Spring Boot application
│   ├── src/main/java/com/bookmyroute/
│   │   ├── config/                  # Security, JPA, Admin bootstrap, RazorpayConfig
│   │   ├── controller/              # REST API controllers (incl. PaymentController)
│   │   ├── dto/
│   │   │   ├── request/             # Request DTOs (incl. PaymentOrderRequest, PaymentVerifyRequest)
│   │   │   └── response/            # Response DTOs (incl. PaymentOrderResponse)
│   │   ├── entity/                  # JPA entities
│   │   ├── enums/                   # Enums (BusType, PaymentMethod, PaymentStatus, etc.)
│   │   ├── exception/               # Global exception handling
│   │   ├── repository/              # Spring Data JPA repositories
│   │   ├── security/                # JWT filter, utils, UserDetails
│   │   ├── service/                 # Service interfaces (incl. PaymentGatewayService)
│   │   │   └── impl/                # Service implementations (incl. PaymentGatewayServiceImpl)
│   │   └── BookMyRouteApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── templates/email/         # Booking confirmation & cancellation email templates
│   └── pom.xml
│
└── README.md
```

---

## ✅ Prerequisites

Make sure the following are installed on your system:

| Tool | Version | Download |
|------|---------|---------|
| Java JDK | 17+ | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org |
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8.0+ | https://dev.mysql.com/downloads |

---

## 🚀 Getting Started

### 1. Database Setup

Open your MySQL client and run:

```sql
CREATE DATABASE bookmyroute;
```

> Spring Boot will automatically create all tables on first startup (`spring.jpa.hibernate.ddl-auto=update`).

---

### 2. Backend Setup

```bash
cd backend
```

If your MySQL credentials differ from the defaults (`root / root`), update `src/main/resources/application.properties`:

```properties
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Add your Razorpay test keys (see [Payment Gateway](#payment-gateway) section):

```properties
razorpay.key.id=rzp_test_YOUR_KEY_ID
razorpay.key.secret=YOUR_KEY_SECRET
```

Then start the backend:

```bash
mvn spring-boot:run
```

If Maven is not installed globally, use the repo-local Maven on Windows:

```powershell
..\tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

The backend runs at: **http://localhost:8080**

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at: **http://localhost:5173**

Open **http://localhost:5173** in your browser. 🎉

---

## ⚙️ Environment Variables

All config lives in `backend/src/main/resources/application.properties`. Key settings:

| Property | Default | Description |
|----------|---------|-------------|
| `spring.datasource.username` | `root` | MySQL username |
| `spring.datasource.password` | `root` | MySQL password |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/bookmyroute` | DB connection URL |
| `app.admin.email` | `book.my.route2026@gmail.com` | Default admin email |
| `app.admin.password` | *(required)* | Default admin password |
| `razorpay.key.id` | *(required)* | Razorpay Key ID from dashboard |
| `razorpay.key.secret` | *(required)* | Razorpay Key Secret from dashboard |
| `razorpay.currency` | `INR` | Payment currency |
| `spring.mail.username` | *(empty)* | SMTP username (your Gmail address) |
| `spring.mail.password` | *(empty)* | Gmail App Password |
| `app.mail.enabled` | `false` | Enable/disable email notifications |
| `app.mail.from` | `MAIL_USERNAME` | Sender email address |
| `app.mail.sender-name` | `BookMyRoute` | Sender display name |
| `app.jwt.expiration-ms` | `86400000` | JWT token expiry (24 hours) |
| `app.cors.allowed-origins` | `http://localhost:3000,http://localhost:5173` | Allowed CORS origins |

You can also pass these as environment variables:

```bash
DB_USERNAME=myuser DB_PASSWORD=mypass JWT_SECRET=change-me ADMIN_PASSWORD=change-me RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=secret mvn spring-boot:run
```

For Gmail email notifications, enable 2-Step Verification in your Google account, create an App Password, then start the backend with:

```bash
MAIL_USERNAME=yourgmail@gmail.com MAIL_PASSWORD=your-app-password mvn spring-boot:run
```

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|---------|
| Admin | `book.my.route2026@gmail.com` | Set with `ADMIN_PASSWORD` |

> The admin account is auto-created on first startup. Register new user accounts from the `/register` page.

---

## 📡 API Overview

All endpoints are prefixed with `/api`.

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Register, login, get current user |
| Routes | `/api/routes` | Browse available bus routes |
| Buses | `/api/buses` | Bus information |
| Schedules | `/api/schedules` | Search schedules by route & date |
| Bookings | `/api/bookings` | Create, view & cancel bookings, download PDF ticket |
| Payments | `/api/payments` | Create Razorpay order & verify payment |
| Reviews | `/api/reviews` | Submit and view route reviews |
| Support | `/api/support` | Help desk tickets |
| Admin | `/api/admin` | Admin-only management endpoints |
| Chatbot | `/api/chatbot` | AI chatbot messages |

---

## 🗄️ Database Schema

The application manages the following core entities:

```
User ──< Booking >── Schedule ──< Bus
                         │
                      Route
Booking ──< BookingSeat
Booking ──  Payment
Bus ──< Seat
```

| Entity | Description |
|--------|-------------|
| `User` | Registered users with ROLE_USER or ROLE_ADMIN |
| `Bus` | Bus details — number, name, type, seats, amenities |
| `Route` | Source to destination route definition |
| `Schedule` | A bus running a route on a specific date & time |
| `Seat` | Individual seats belonging to a bus |
| `Booking` | A user's reservation on a schedule |
| `BookingSeat` | Specific seats tied to a booking with passenger details |
| `Payment` | Payment record linked to a booking (includes Razorpay transaction ID) |
| `RouteReview` | User reviews and ratings for completed routes |
| `SupportRequest` | Help desk tickets raised by users |

---

## 💳 Payment Gateway

BookMyRoute uses **Razorpay** for real-time payments, supporting UPI, Credit/Debit Cards, Net Banking, and Wallets.

### Setup

1. Sign up at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Switch to **Test Mode** (toggle at top-left)
3. Go to **Settings → API Keys → Generate Test Key**
4. Copy your **Key ID** (`rzp_test_...`) and **Key Secret**
5. Add them to `application.properties`:

```properties
razorpay.key.id=rzp_test_YOUR_KEY_ID
razorpay.key.secret=YOUR_KEY_SECRET
```

### Payment Flow

```
1. User clicks "Pay"
        ↓
2. Frontend calls POST /api/payments/create-order
        ↓
3. Backend creates Razorpay order → returns orderId + keyId
        ↓
4. Razorpay checkout popup opens (UPI / Card / Net Banking / Wallet)
        ↓
5. User completes payment on Razorpay
        ↓
6. Frontend calls POST /api/payments/verify with razorpay_payment_id + signature
        ↓
7. Backend verifies HMAC-SHA256 signature → confirms booking → sends email
        ↓
8. Booking confirmed ✅ — user sees booking reference + payment ID
```

### Test Cards (Test Mode)

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

For UPI testing use: `success@razorpay`

> Switch to **Live Mode** and replace keys with live keys when deploying to production.

---

## 🤖 Chatbot Setup (Optional)

The chatbot requires an OpenAI API key. Add it to `application.properties`:

```properties
openai.api.key=sk-your-openai-api-key-here
```

Without a key, the chatbot feature will be inactive.

---

## 📦 Build for Production

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/bookmyroute-1.0.0.jar
```

On Windows without global Maven:

```powershell
cd backend
..\tools\apache-maven-3.9.9\bin\mvn.cmd clean package -DskipTests
java -jar target/bookmyroute-1.0.0.jar
```
