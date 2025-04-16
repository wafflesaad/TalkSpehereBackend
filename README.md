Backend for Talk Sphere 


# Authentication API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [Register User](#1-register-user)
  - [Login User](#2-login-user)
  - [Logout User](#3-logout-user)
  - [Send Verification OTP](#4-send-verification-otp)
  - [Verify Email](#5-verify-email)
  - [Check Authentication](#6-check-authentication)
  - [Send Password Reset OTP](#7-send-password-reset-otp)
  - [Reset Password](#8-reset-password)
- [Authentication Flow](#authentication-flow)
- [Cookie Specifications](#cookie-specifications)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Usage Example](#usage-example)
- [Requirements](#requirements)

## Overview
This API provides complete user authentication functionality including registration, login, email verification, and password reset features. The system uses JWT tokens stored in HTTP-only cookies for secure authentication.

## Base URL
`https://your-api-domain.com/api/auth`

## Endpoints

### 1. Register User
**`POST /register`**  
Create a new user account

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Responses:**
- **200 Success**:
  ```json
  { "success": true }
  ```
- **400 Missing Details**:
  ```json
  { "success": false, "message": "Missing details" }
  ```
- **409 User Exists**:
  ```json
  { "success": false, "message": "User already exists" }
  ```

**Notes:**
- Sets HTTP-only cookie with JWT token
- Sends welcome email
- Password is hashed with bcrypt before storage

---

### 2. Login User
**`POST /login`**  
Authenticate user and return JWT token

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Responses:**
- **200 Success**:
  ```json
  { "success": true }
  ```
- **400 Missing Details**:
  ```json
  { "success": false, "message": "Missing details" }
  ```
- **401 Invalid Credentials**:
  ```json
  { "success": false, "message": "Invalid email or password" }
  ```

---

### 3. Logout User
**`POST /logout`**  
Clear authentication cookie

**Responses:**
- **200 Success**:
  ```json
  { "success": true, "message": "logged out" }
  ```

---

### 4. Send Verification OTP
**`POST /send-verify-otp`**  
Send OTP to user's email for verification  
*(Requires authentication cookie)*

**Responses:**
- **200 Success**:
  ```json
  { "success": true, "message": "Otp sent to email." }
  ```
- **404 User Not Found**:
  ```json
  { "success": false, "message": "user not found" }
  ```
- **400 Already Verified**:
  ```json
  { "success": false, "message": "account already verified" }
  ```

**Notes:**
- OTP valid for 24 hours
- 6-digit code sent via email

---

### 5. Verify Email
**`POST /verify-email`**  
Verify user's email using OTP  
*(Requires authentication cookie)*

**Request Body:**
```json
{
  "otp": "string"
}
```

**Responses:**
- **200 Success**:
  ```json
  { "success": true, "message": "User verified" }
  ```
- **400 Invalid OTP**:
  ```json
  { "success": false, "message": "Invalid otp" }
  ```
- **400 Timeout**:
  ```json
  { "success": false, "message": "Timeout." }
  ```

---

### 6. Check Authentication
**`GET /is-authenticated`**  
Verify if user is authenticated

**Responses:**
- **200 Authenticated**:
  ```json
  { "success": true }
  ```
- **401 Unauthorized**:
  ```json
  { "success": false, "message": "Unauthorized" }
  ```

---

### 7. Send Password Reset OTP
**`POST /send-pass-reset-otp`**  
Send password reset OTP to email

**Request Body:**
```json
{
  "email": "string"
}
```

**Responses:**
- **200 Success**:
  ```json
  { "success": true, "message": "Reset otp sent to email" }
  ```
- **404 User Not Found**:
  ```json
  { "success": false, "message": "User not found" }
  ```

**Notes:**
- OTP valid for 1 hour

---

### 8. Reset Password
**`POST /reset-pass`**  
Reset password using OTP

**Request Body:**
```json
{
  "email": "string",
  "otp": "string",
  "newPass": "string"
}
```

**Responses:**
- **200 Success**:
  ```json
  { "success": true }
  ```
- **400 Invalid OTP**:
  ```json
  { "success": false, "message": "Invalid otp" }
  ```

## Authentication Flow
1. User registers or logs in → receives JWT token in HTTP-only cookie
2. For protected endpoints:
   - Middleware verifies JWT from cookie
   - Extracts userID and attaches to `req.user`
3. Sensitive operations require both cookie auth and OTP verification

## Cookie Specifications
**Name**: `token`  
**Type**: HTTP-only  
**Contents**: JWT with payload `{ id: user._id }`  
**Expiration**: 1 hour  
**Security**:
- `secure`: true in production
- `sameSite`: 'none' in production, 'strict' in development

## Security Features
- HTTP-only cookies prevent XSS attacks
- Password hashing with bcrypt (cost factor 7)
- JWT expiration (1 hour)
- OTP expiration (1 hour for password reset, 24 hours for verification)
- Production-grade cookie security settings
- CSRF protection via sameSite cookie policy

## Error Handling
All endpoints return consistent error responses with:
- `success`: boolean
- `message`: string (when error occurs)

Common error responses:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

## Usage Example

```javascript
// Register new user
const register = async () => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepassword123'
    })
  });
  const data = await response.json();
  console.log(data);
};

// Login
const login = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'securepassword123'
    })
  });
  const data = await response.json();
  console.log(data);
};
```

## Requirements
- Node.js environment
- MongoDB database
- Required packages:
  - bcryptjs
  - jsonwebtoken
  - nodemailer
- Environment variables:
  - `JWT_SECRET`
  - `SENDER_EMAIL`
  - `EMAIL_PASSWORD`
  - `NODE_ENV` (development/production)
``` 
