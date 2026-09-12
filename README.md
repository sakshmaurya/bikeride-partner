# BikeRide Partner

> **A full-stack mobile application for bike ride partners to register, complete onboarding, submit verification details, manage their profile, vehicle and bank information, and track their application status.**

BikeRide Partner is a React Native + Expo mobile application powered by a Node.js/Express REST API and MySQL database. It provides a structured partner onboarding experience with phone-based authentication, OTP verification, document submission, selfie verification, bank details, vehicle details, application status tracking, and a partner dashboard.

---

## ✨ Current Features

### 🔐 Authentication

* Phone number-based registration
* Phone number-based login
* 6-digit OTP verification
* Demo OTP mode for development and testing
* OTP expiration
* OTP resend cooldown
* Maximum OTP verification attempts
* JWT-based authentication
* Existing account detection
* Account-not-found handling

### 👤 Partner Onboarding

* Permission handling
* Partner profile details
* Document submission
* Selfie verification
* Bank details
* Vehicle details
* Application status tracking

### 📄 Document Verification

* Document selection and submission
* Image/document upload
* Document status handling
* Selfie submission for verification

### 🏦 Bank Details

* Account holder name
* Account number
* Account number confirmation
* IFSC details
* Bank name
* Bank information submission

### 🏍️ Vehicle Details

* Vehicle information
* Vehicle registration details
* Vehicle image upload
* Vehicle information submission

### 📊 Partner Dashboard

* Partner dashboard
* Application status
* Rides section
* Earnings section
* Profile section

### 🌐 Multilingual Support

The application currently supports:

* English
* Hindi
* Gujarati
* Tamil
* Telugu

### 🎨 UI/UX

* Reusable React Native components
* Consistent theme system
* Form validation
* Loading states
* Progress indicators
* Structured onboarding navigation
* Mobile-focused interface

---

## 🛠️ Tech Stack

### Frontend

* React Native
* Expo
* TypeScript
* React Navigation
* Expo Camera
* Expo Image Picker
* Expo File System
* Async Storage

### Backend

* Node.js
* Express.js
* MySQL
* mysql2
* JWT
* bcryptjs
* Multer
* CORS
* dotenv
* Nodemon

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│       React Native App       │
│          Expo + TS           │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│      Node.js + Express       │
│          REST API             │
├──────────────────────────────┤
│ Authentication              │
│ User Management              │
│ Documents                    │
│ Bank Details                 │
│ Vehicle Management           │
│ Onboarding                   │
│ Dashboard                    │
└──────────────┬───────────────┘
               │
               │ SQL
               ▼
┌──────────────────────────────┐
│            MySQL             │
│        bikeride_partner      │
└──────────────────────────────┘
```

---

## 📱 Application Flow

```text
Splash
   ↓
Language Selection
   ↓
Welcome
   ↓
Login / Register
   ↓
Phone Number
   ↓
OTP Verification
   ↓
Permissions
   ↓
Profile Details
   ↓
Documents
   ↓
Selfie Verification
   ↓
Bank Details
   ↓
Vehicle Details
   ↓
Under Review
   ↓
Approved
   ↓
Partner Dashboard
```

---

## 📂 Project Structure

```text
bikeride-partner/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── ensureSchema.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bankController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── documentController.js
│   │   │   ├── onboardingController.js
│   │   │   ├── userController.js
│   │   │   └── vehicleController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── selfieUpload.js
│   │   │   ├── upload.js
│   │   │   └── vehicleUpload.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── bankRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── onboardingRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── vehicleRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── smsService.js
│   │   │
│   │   ├── utils/
│   │   │   └── phone.js
│   │   │
│   │   └── app.js
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── i18n/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── theme/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── assets/
│   ├── App.tsx
│   ├── index.ts
│   ├── app.json
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MySQL
* Git
* Expo Go or an Android/iOS development environment

---

## ⚙️ Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/sakshmaurya/bikeride-partner.git
cd bikeride-partner
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create environment file

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bikeride_partner

JWT_SECRET=your_secure_jwt_secret

DEMO_OTP=123456

OTP_EXPIRY_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5

SMS_PROVIDER=msg91
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
MSG91_SENDER_ID=BIKRD
```

> Never commit `.env` files or production credentials to the repository.

### 4. Create the database

Open MySQL:

```bash
mysql -u root -p
```

Then:

```sql
CREATE DATABASE bikeride_partner;
```

The backend automatically checks and prepares the required database schema when it starts.

### 5. Start the backend

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The API will run on:

```text
http://localhost:5000
```

---

## 📱 Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
EXPO_PUBLIC_API_IP=YOUR_LOCAL_IP
```

For example:

```env
EXPO_PUBLIC_API_IP=192.168.x.x
```

For physical-device testing, make sure the phone and development machine are connected to the same network.

Start Expo:

```bash
npx expo start
```

Then open the application using Expo Go or another supported development environment.

---

## 🔑 Demo OTP

The current development configuration uses a fixed demo OTP:

```text
123456
```

This allows the complete authentication and onboarding flow to be tested without an SMS provider.

Real SMS integration is available as a planned production configuration.

---

## 🔌 API Modules

The backend currently provides API modules for:

```text
/api/auth
/api/users
/api/documents
/api/bank
/api/vehicle
/api/onboarding
/api/dashboard
```

### Authentication

```text
POST /api/auth/send-otp
POST /api/auth/register-send-otp
POST /api/auth/verify-otp
```

Other API modules cover:

* User management
* Documents
* Bank details
* Vehicle details
* Onboarding
* Dashboard

---

## 🔒 Security

The project currently includes:

* JWT-based authentication
* bcrypt OTP hashing
* Environment-based configuration
* OTP expiration
* OTP resend cooldown
* Maximum OTP attempts
* Indian phone number validation
* Input validation
* File type validation
* File upload size limits
* CORS configuration
* Environment files excluded from Git

### Supported Upload Formats

```text
JPG
JPEG
PNG
WEBP
```

Maximum upload size:

```text
5 MB
```

---

## 🧪 Testing the Application

After starting both backend and frontend, test the complete flow:

```text
Registration
      ↓
OTP Verification
      ↓
Permissions
      ↓
Profile
      ↓
Documents
      ↓
Selfie
      ↓
Bank Details
      ↓
Vehicle Details
      ↓
Under Review
      ↓
Approved
      ↓
Dashboard
```

For development authentication, use:

```text
OTP: 123456
```

---

# 🚧 Future Development

The following features are planned for future versions and are **not represented as currently implemented features**.

### Authentication & Security

* [ ] Real SMS OTP integration
* [ ] Production-grade rate limiting
* [ ] Refresh token mechanism
* [ ] Advanced authentication security
* [ ] Account recovery flow

### Partner Features

* [ ] Real-time ride management
* [ ] Ride acceptance and completion
* [ ] Online/offline partner status
* [ ] Ride history
* [ ] Detailed earnings and payout management
* [ ] Partner performance analytics

### Notifications

* [ ] Push notifications
* [ ] Email notifications
* [ ] Application status notifications
* [ ] Ride-related notifications

### Verification & Administration

* [ ] Admin dashboard
* [ ] Document review and approval
* [ ] Partner verification management
* [ ] Application management
* [ ] Partner verification history

### Storage & Infrastructure

* [ ] Cloudinary-based image storage
* [ ] Production database deployment
* [ ] HTTPS configuration
* [ ] Production monitoring
* [ ] Automated backups

### Developer Experience

* [ ] OpenAPI / Swagger documentation
* [ ] Unit tests
* [ ] Integration tests
* [ ] End-to-end tests
* [ ] CI/CD pipeline
* [ ] Automated deployment

---

# 🤝 Contributing

Contributions are welcome.

If you would like to improve the project:

### 1. Fork the repository

### 2. Clone your fork

```bash
git clone https://github.com/your-username/bikeride-partner.git
cd bikeride-partner
```

### 3. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Make your changes

Keep changes focused and maintain the existing project structure and coding style.

### 5. Commit your changes

```bash
git add .
git commit -m "feat: add your feature"
```

### 6. Push the branch

```bash
git push origin feature/your-feature-name
```

### 7. Open a Pull Request

Please describe:

* What was changed
* Why the change was needed
* How it was tested
* Any additional considerations

---

## 📌 Development Status

**Status:** Active Development

The current version focuses on partner authentication, onboarding, verification information, vehicle and bank details, application status, and the partner dashboard.

Additional production features will be introduced progressively.

---

## 👨‍💻 Developer

**Satyam Maurya**

Full Stack Developer

### Core Technologies

```text
React Native
Expo
TypeScript
Node.js
Express.js
MySQL
REST APIs
JWT
Git
GitHub
```

---

## 📄 License

MIT License
