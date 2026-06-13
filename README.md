# JWT Authentication Backend

A secure authentication backend built with Node.js, Express.js, MongoDB, JWT, and Nodemailer.

## Features

- User Registration
- User Login
- JWT Access Token Authentication
- Refresh Token Authentication
- Protected Routes
- User Logout
- Forgot Password
- Password Reset via Email
- Password Hashing using bcrypt
- MongoDB Integration

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- bcrypt
- Nodemailer

---

## Project Structure

```
backend
│
├── src
│   ├── config
│   │   └── db.js
│   │
│   ├── controllers
│   │   └── userAuth.js
│   │
│   ├── models
│   │   └── users.js
│   │
│   ├── routes
│   │   └── userAuth.js
│   │
│   ├── utils
│   │   ├── AccessToken.js
│   │   └── validator.js
│   │
│   └── index.js
│
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

---

## API Endpoints

### Register

```http
POST /user/register
```

### Login

```http
POST /user/login
```

### Profile (Protected)

```http
GET /user/profile
```

### Refresh Access Token

```http
POST /user/refresh
```

### Logout

```http
POST /user/logout
```

### Forgot Password

```http
POST /user/forgotPassword
```

### Reset Password

```http
POST /user/resetPassword/:token
```

---

## Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

ACCESS_JWT_KEY=your_access_token_secret

REFRESH_JWT_KEY=your_refresh_token_secret

EMAIL=your_email@gmail.com

EMAIL_PASS=your_gmail_app_password
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/token-backend.git
```

Move into project directory:

```bash
cd token-backend/backend
```

Install dependencies:

```bash
npm install
```

Start server:

```bash
npm run dev
```

---

## Authentication Flow

1. User logs in.
2. Server generates Access Token and Refresh Token.
3. Access Token is used for protected routes.
4. Refresh Token generates a new Access Token after expiration.
5. User can logout which invalidates the Refresh Token.
6. Forgot Password generates a reset token and sends a reset link through email.
7. User resets password using the reset token.

---

## Future Improvements

- Store refresh tokens in HTTP-only cookies
- Hash password reset tokens before storing
- Role Based Access Control (RBAC)
- API Rate Limiting
- Docker Support
- Redis Integration
- Swagger API Documentation

---

## Author

Ashish

Backend Authentication System built for learning JWT Authentication and Secure User Management.
