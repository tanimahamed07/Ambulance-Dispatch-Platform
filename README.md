# 🚑 Ambulance Dispatch Platform

A comprehensive real-time ambulance dispatch and management system built with Node.js, Express, TypeScript, and Prisma. This platform streamlines emergency response by connecting callers, dispatchers, drivers, and hospitals in a seamless workflow.

## 🌟 Features

### Core Functionalities

- **Real-time Emergency Request Management** - Instant emergency call handling and tracking
- **Smart Ambulance Dispatch** - Intelligent ambulance allocation based on availability and location
- **Driver Management** - Complete driver application, verification, and status tracking
- **Trip Tracking** - Full trip lifecycle management from pickup to hospital delivery
- **Payment Integration** - bKash payment gateway integration for seamless transactions
- **Hospital Management** - Hospital database with availability and specialization tracking
- **Multi-role Authentication** - Secure JWT-based authentication for Admin, Dispatcher, Driver, and Caller
- **Google OAuth** - Social login integration for quick user onboarding
- **Email Notifications** - Automated email notifications for critical events
- **Redis Caching** - High-performance caching for improved response times

### Role-based Access Control

- **Admin** - Full system control, fleet management, user management
- **Dispatcher** - Emergency handling, ambulance allocation, trip coordination
- **Driver** - Trip management, location updates, status reporting
- **Caller** - Emergency requests, trip tracking, payment processing

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Language:** TypeScript 7.x
- **Database:** PostgreSQL (Prisma ORM)
- **Cache:** Redis
- **Authentication:** JWT + Google OAuth
- **Payment Gateway:** bKash Tokenized API
- **Email Service:** Nodemailer
- **Image Upload:** Cloudinary
- **Validation:** Zod

### Development Tools
- **Code Quality:** Biome (Linting & Formatting)
- **Development:** tsx (TypeScript execution)
- **Build:** TypeScript Compiler
- **Deployment:** Vercel

## 📁 Project Structure

```
Ambulance Dispatch Platform/
├── prisma/
│   ├── migrations/          # Database migrations
│   └── schema/              # Prisma schema files
│       ├── schema.prisma    # Main schema
│       ├── ambulance.prisma
│       ├── caller.prisma
│       ├── dispatch.prisma
│       ├── driver.prisma
│       ├── emergency.prisma
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
│   │   ├── middleware/      # Express middleware
│   │   │   ├── checkAuth.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   └── validateRequest.ts
│   │   ├── module/          # Feature modules
│   │   │   ├── ambulance/
│   │   │   ├── auth/
│   │   │   ├── dispatch/
│   │   │   ├── driver/
│   │   │   ├── emergency/
│   │   │   ├── hospital/
│   │   │   ├── payment/
│   │   │   ├── trip/
│   │   │   └── user/
│   │   └── utils/           # Utility functions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── dist/                    # Compiled JavaScript
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
├── biome.json
└── vercel.json              # Vercel deployment config
```

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Ambulance Dispatch Platform"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# URLs
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Super Admin Credentials
SUPER_ADMIN_NAME="Super Admin"
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=secure_password

# Redis Configuration
REDIS_USER=default
REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=6379

# Email Configuration (SMTP)
SMTP_USER=your_email@gmail.com
EMAIL_SENDER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_API_KEY=your_api_key

# bKash Payment Gateway
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_CALLBACK_URL=http://localhost:5001/payment
```

4. **Setup database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npm run seed
```

5. **Build the project**
```bash
npm run build
```

6. **Start the development server**
```bash
npm run dev
```

The server will start at `http://localhost:5001`

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Build
npm run build            # Compile TypeScript to JavaScript

# Production
npm start                # Start production server

# Code Quality
npm run format:check     # Check code formatting
npm run format:fix       # Fix code formatting
npm run lint:check       # Check linting errors
npm run lint:fix         # Fix linting errors

# Database
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Create and apply migration
npx prisma migrate deploy # Apply migrations (production)
npx prisma studio        # Open Prisma Studio GUI
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5001/api/v1
Production: https://your-domain.vercel.app/api/v1
```

### API Modules

#### 1. Authentication (`/api/v1/auth`)
- `POST /register` - Register new caller
- `POST /verify-email` - Verify email with OTP
- `POST /login` - Login with credentials
- `POST /google` - Google OAuth login
- `GET /me` - Get current user profile
- `POST /refresh-token` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

#### 2. User Management (`/api/v1/user`)
- `PATCH /profile-image` - Update profile image

#### 3. Driver (`/api/v1/driver`)
- `POST /apply-as-driver` - Apply as driver
- `PATCH /approve-driver` - Approve driver application (Admin)
- `GET /application-status` - Check application status
- `GET /applications` - Get all pending applications (Admin)
- `GET /applications/:id` - Get application by ID (Admin)
- `GET /all-driver` - Get all approved drivers
- `GET /all-driver/:id` - Get driver by ID
- `PATCH /me/status` - Update driver status

#### 4. Ambulance (`/api/v1/ambulance`)
- `POST /create-ambulance` - Create ambulance (Admin)
- `GET /all-ambulance` - Get all ambulances
- `GET /available` - Get available ambulances
- `GET /:id` - Get ambulance by ID
- `PATCH /:id` - Update ambulance (Admin)
- `DELETE /:id` - Delete ambulance (Admin)
- `PATCH /:id/assign-driver` - Assign driver to ambulance
- `PATCH /:id/unassign-driver` - Unassign driver from ambulance
- `PATCH /me/location` - Update ambulance location (Driver)

#### 5. Emergency (`/api/v1/emergency`)
- `POST /` - Create emergency request (Caller)
- `GET /` - Get all emergencies (Admin/Dispatcher)
- `GET /my-emergencies` - Get caller's emergencies
- `GET /:id` - Get emergency by ID
- `PATCH /:id/priority` - Update emergency priority (Dispatcher)
- `PATCH /:id/cancel` - Cancel emergency (Admin/Dispatcher)

#### 6. Dispatch (`/api/v1/dispatch`)
- `POST /create-dispatch` - Create dispatch (Dispatcher)
- `GET /` - Get all dispatches
- `GET /my-dispatches` - Get driver's dispatches
- `GET /:id` - Get dispatch by ID
- `PATCH /:id/accept` - Accept dispatch (Driver)
- `PATCH /:id/reject` - Reject dispatch (Driver)
- `PATCH /:id/cancel` - Cancel dispatch (Admin/Dispatcher)

#### 7. Hospital (`/api/v1/hospital`)
- `POST /` - Create hospital (Admin)
- `GET /` - Get all hospitals
- `GET /nearby` - Get nearby hospitals
- `GET /:id` - Get hospital by ID
- `PATCH /:id` - Update hospital (Admin)

#### 8. Trip (`/api/v1/trip`)
- `GET /` - Get all trips (Admin/Dispatcher)
- `GET /my-trips` - Get driver's trips
- `GET /:id` - Get trip by ID
- `GET /:id/calculate-fare` - Calculate trip fare
- `PATCH /:id/en-route` - Mark trip as en-route (Driver)
- `PATCH /:id/pickup` - Mark patient picked up (Driver)
- `PATCH /:id/select-hospital` - Select destination hospital (Driver)
- `PATCH /:id/hospital-arrival` - Mark hospital arrival (Driver)
- `PATCH /:id/complete` - Complete trip (Driver)
- `PATCH /:id/cancel` - Cancel trip (Admin/Dispatcher)

#### 9. Payment (`/api/v1/payment`)
- `POST /initiate` - Initiate payment (Caller)
- `POST /retry` - Retry payment (Caller)
- `GET /callback` - bKash payment callback (Public)
- `GET /my-payment/:tripId` - Get payment details (Caller)
- `POST /query-status` - Query payment status (Admin/Dispatcher)

### Postman Collection

Import the `Ambulance Dispatch V2.postman_collection.json` file into Postman for complete API documentation with 70+ pre-configured endpoints.

## 🔐 Authentication

The API uses JWT-based authentication with Bearer tokens.

### Getting Access Token

1. **Register/Login** to get access and refresh tokens
2. **Include token** in request headers:
```
Authorization: Bearer <your_access_token>
```

### Token Refresh

When access token expires, use the refresh token endpoint:
```bash
POST /api/v1/auth/refresh-token
```

## 🗃️ Database Schema

### Main Entities

- **User** - Base user entity with role-based access
- **Caller** - Emergency service callers
- **Driver** - Ambulance drivers with status and location
- **Ambulance** - Fleet vehicles with specifications
- **EmergencyRequest** - Emergency calls and requests
- **Dispatch** - Assignment of ambulance to emergency
- **Trip** - Complete trip lifecycle tracking
- **Hospital** - Hospital database with details
- **Payment** - Payment transaction records

### Relationships

```
User (1) ──→ (1) Caller
User (1) ──→ (1) Driver

Driver (1) ──→ (1) Ambulance
Driver (1) ──→ (*) Dispatch
Driver (1) ──→ (*) Trip

EmergencyRequest (1) ──→ (1) Dispatch
Dispatch (1) ──→ (1) Trip
Trip (1) ──→ (1) Payment

EmergencyRequest (*) ──← (1) Caller
Trip (*) ──→ (1) Hospital
```

## 🔄 Workflow

### Emergency Request Flow

1. **Caller** creates emergency request
2. **Dispatcher** reviews and prioritizes request
3. **Dispatcher** assigns available ambulance and driver
4. **Driver** accepts/rejects dispatch
5. **Driver** updates trip status (en-route → pickup → hospital → complete)
6. **System** calculates fare
7. **Caller** processes payment via bKash
8. **Trip** marked as completed

### Trip States

```
PENDING → EN_ROUTE → PICKED_UP → AT_HOSPITAL → COMPLETED
         ↓
      CANCELLED
```

## 💳 Payment Integration

The platform integrates with **bKash Tokenized Payment Gateway** for secure payment processing.

### Payment Flow

1. **Initiate Payment** - Caller requests payment for trip
2. **Grant Token** - System authenticates with bKash
3. **Create Payment** - Payment URL generated
4. **User Redirect** - Caller redirected to bKash
5. **Callback** - bKash sends callback to system
6. **Execute Payment** - System executes payment
7. **Query Payment** - Verify payment status
8. **Update Database** - Payment record updated

## 📧 Email Notifications

Automated email notifications are sent for:

- Email verification (OTP)
- Password reset
- Driver application status
- Emergency assignment
- Trip completion
- Payment confirmation

## 🖼️ File Upload

**Cloudinary** integration for:
- User profile images
- Driver documents
- Ambulance photos

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- Request validation with Zod
- CORS protection
- Environment variable security
- Redis session management

## 🧪 Testing

Import the Postman collection and test all endpoints:

1. **Setup environment** variables in Postman
2. **Login** to get access token
3. **Test endpoints** based on user roles

## 🚀 Deployment

### Vercel Deployment

The project is configured for Vercel deployment.

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Vercel**
```bash
vercel --prod
```

### Environment Variables

Make sure to set all environment variables in Vercel dashboard:
- Database credentials
- JWT secrets
- Third-party API keys (Google, bKash, Cloudinary, Redis)
- SMTP credentials

## 📝 License

ISC

## 👨‍💻 Author

**Tanim Ahamed**

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support, email tanimislamt@gmail.com

---

**Made with ❤️ for emergency healthcare services**
