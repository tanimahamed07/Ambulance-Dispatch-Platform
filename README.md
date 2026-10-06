# 🚑 Ambulance Dispatch Platform - Backend

A comprehensive **RESTful API** for managing emergency ambulance dispatch services. This platform provides real-time dispatch coordination, driver management, payment processing, and analytics for ambulance services.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Module Overview](#-module-overview)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role management (Admin, Driver, Caller)
- 🏥 **Emergency Management** - Real-time emergency request handling and tracking
- 🚑 **Ambulance Dispatch** - Intelligent ambulance assignment and dispatch coordination
- 👨‍⚕️ **Driver Management** - Complete driver profiles, verification, and availability tracking
- 🏢 **Hospital Integration** - Hospital registration and coordination
- 💳 **Payment Processing** - Integrated bKash payment gateway support
- 🚗 **Trip Management** - End-to-end trip tracking from dispatch to completion
- 📊 **Analytics Dashboard** - Comprehensive metrics and reporting
- 🔔 **Real-time Updates** - Redis-powered caching for performance
- 📧 **Email Notifications** - Automated email notifications using Nodemailer
- ☁️ **Cloud Storage** - Cloudinary integration for document uploads
- 🌐 **Google OAuth** - Social authentication support

---

## 🛠 Tech Stack

### Core Technologies

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js v5
- **Database**: PostgreSQL
- **ORM**: Prisma v7
- **Cache**: Redis v6
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod v4
- **File Upload**: Multer + Cloudinary

### Additional Libraries

- **Password Hashing**: bcryptjs
- **CORS Support**: cors
- **HTTP Status Codes**: http-status
- **Email Service**: Nodemailer
- **PDF Generation**: PDFKit
- **Date Utilities**: date-fns
- **Template Engine**: EJS

### Development Tools

- **Code Quality**: Biome (Linting & Formatting)
- **Build Tool**: tsup
- **Dev Server**: tsx watch
- **Type System**: TypeScript v7

---

## 📁 Project Structure

```
ambulance-dispatch-platform/
├── prisma/
│   ├── migrations/           # Database migrations
│   └── schema/              # Prisma schema files
│       ├── ambulance.prisma
│       ├── caller.prisma
│       ├── dispatch.prisma
│       ├── driver.prisma
│       ├── emergency.prisma
│       ├── enums.prisma
│       ├── hospital.prisma
│       ├── payment.prisma
│       ├── trip.prisma
│       └── user.prisma
├── src/
│   ├── app/
│   │   ├── config/          # Configuration files
│   │   ├── interface/       # TypeScript interfaces
│   │   ├── lib/             # Third-party integrations
│   │   │   ├── bkash.ts
│   │   │   ├── cloudinary.ts
│   │   │   ├── googleAuth.ts
│   │   │   ├── multer.ts
│   │   │   ├── nodemailer.ts
│   │   │   ├── prisma.ts
│   │   │   └── redis.ts
│   │   ├── middleware/      # Express middlewares
│   │   │   ├── checkAuth.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   └── validateRequest.ts
│   │   └── module/          # Feature modules
│   │       ├── ambulance/
│   │       ├── analytics/
│   │       ├── auth/
│   │       ├── dispatch/
│   │       ├── driver/
│   │       ├── emergency/
│   │       ├── hospital/
│   │       ├── payment/
│   │       ├── trip/
│   │       └── user/
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
├── .env                    # Environment variables
├── package.json
├── tsconfig.json
└── biome.json              # Biome configuration
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher
- **Redis**: v6.x or higher
- **npm** or **bun** package manager

---

## 🚀 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ambulance-dispatch-platform
```

2. **Install dependencies**

```bash
npm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env` file in the root directory (see [Environment Variables](#-environment-variables))

4. **Set up the database**

```bash
npx prisma generate
npx prisma migrate dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ambulance_dispatch

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=365d

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# bKash Payment Gateway
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
```

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```bash
createdb ambulance_dispatch
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 4. (Optional) Seed Database

```bash
npm run seed
```

### 5. View Database in Prisma Studio

```bash
npx prisma studio
```

---

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

The server will start at `http://localhost:5000` with hot-reload enabled.

### Production Mode

1. **Build the application**

```bash
npm run build
```

2. **Start the production server**

```bash
npm start
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Available Endpoints

#### 🔐 Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

#### 👤 User Management (`/user`)

- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user` - Get all users (Admin)
- `GET /user/:id` - Get user by ID
- `DELETE /user/:id` - Delete user (Admin)

#### 👨‍⚕️ Driver Management (`/driver`)

- `POST /driver` - Register as driver
- `GET /driver` - Get all drivers
- `GET /driver/:id` - Get driver details
- `PUT /driver/:id` - Update driver
- `DELETE /driver/:id` - Remove driver
- `PATCH /driver/:id/status` - Update driver status
- `PATCH /driver/:id/verify` - Verify driver (Admin)

#### 🚑 Ambulance Management (`/ambulance`)

- `POST /ambulance` - Register ambulance
- `GET /ambulance` - Get all ambulances
- `GET /ambulance/:id` - Get ambulance details
- `PUT /ambulance/:id` - Update ambulance
- `DELETE /ambulance/:id` - Remove ambulance
- `PATCH /ambulance/:id/status` - Update ambulance status

#### 🚨 Emergency Management (`/emergency`)

- `POST /emergency` - Create emergency request
- `GET /emergency` - Get all emergencies
- `GET /emergency/:id` - Get emergency details
- `PATCH /emergency/:id/status` - Update emergency status
- `GET /emergency/active` - Get active emergencies

#### 🚗 Dispatch Management (`/dispatch`)

- `POST /dispatch` - Create dispatch assignment
- `GET /dispatch` - Get all dispatches
- `GET /dispatch/:id` - Get dispatch details
- `PATCH /dispatch/:id/status` - Update dispatch status
- `POST /dispatch/:id/accept` - Driver accepts dispatch
- `POST /dispatch/:id/reject` - Driver rejects dispatch

#### 🏥 Hospital Management (`/hospital`)

- `POST /hospital` - Register hospital
- `GET /hospital` - Get all hospitals
- `GET /hospital/:id` - Get hospital details
- `PUT /hospital/:id` - Update hospital
- `DELETE /hospital/:id` - Remove hospital

#### 🚕 Trip Management (`/trip`)

- `GET /trip` - Get all trips
- `GET /trip/:id` - Get trip details
- `PATCH /trip/:id/start` - Start trip
- `PATCH /trip/:id/complete` - Complete trip
- `GET /trip/driver/:driverId` - Get trips by driver

#### 💳 Payment Management (`/payment`)

- `POST /payment/create` - Create payment
- `POST /payment/callback` - bKash payment callback
- `GET /payment/:id` - Get payment details
- `GET /payment/trip/:tripId` - Get payment by trip

#### 📊 Analytics (`/analytics`)

- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/revenue` - Get revenue analytics
- `GET /analytics/trips` - Get trip analytics
- `GET /analytics/drivers` - Get driver performance
- `GET /analytics/emergencies` - Get emergency statistics

---

## 🧩 Module Overview

### Authentication Module
Handles user registration, login, JWT token management, password reset, and Google OAuth integration.

### User Module
Manages user profiles, roles (Admin, Driver, Caller), and user CRUD operations.

### Driver Module
Complete driver lifecycle management including verification, status tracking, and document management.

### Ambulance Module
Ambulance registration, status management (Available, On Trip, Maintenance), and specifications tracking.

### Emergency Module
Real-time emergency request handling with priority levels (LOW, MEDIUM, HIGH, CRITICAL).

### Dispatch Module
Intelligent dispatch assignment system connecting emergencies with available drivers and ambulances.

### Hospital Module
Hospital registration and management for emergency destination coordination.

### Trip Module
End-to-end trip tracking from dispatch acceptance to completion with status updates.

### Payment Module
bKash payment gateway integration with transaction tracking and callback handling.

### Analytics Module
Comprehensive reporting and metrics for business insights and operational monitoring.

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run format:check` | Check code formatting |
| `npm run format:fix` | Fix code formatting |
| `npm run lint:check` | Check linting issues |
| `npm run lint:fix` | Fix linting issues |

---

## 🔒 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (RBAC)
- ✅ Request validation using Zod schemas
- ✅ CORS configuration for cross-origin requests
- ✅ Secure cookie handling
- ✅ Environment-based security settings

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

This project uses **Biome** for linting and formatting. Run these before committing:

```bash
npm run format:fix
npm run lint:fix
```

---

## 📝 License

This project is licensed under the ISC License.

---

## 📧 Contact

For questions or support, please contact the development team.

---

## 🙏 Acknowledgments

- Express.js community
- Prisma team
- All open-source contributors

---

**Built with ❤️ for emergency medical services**
