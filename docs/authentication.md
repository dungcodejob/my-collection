# Authentication Feature Documentation

## Overview
The authentication feature provides secure access control for the My Collection application. It enables users to register, log in, and maintain authenticated sessions using JWT (JSON Web Token) based authentication. The system supports both access and refresh tokens for robust session management.

## Key Features
- **User Registration:** Allows new users to create an account with a username, password, and optional email.
- **User Login:** Authenticates users using their credentials and issues JWT access and refresh tokens.
- **Token Refresh:** Supports refreshing access tokens using a valid refresh token.
- **Password Hashing:** User passwords are securely hashed using bcrypt before storage.
- **Guards & Strategies:** Uses NestJS guards and Passport strategies to protect routes and validate tokens.
- **Error Handling:** Provides meaningful error messages for authentication failures (e.g., invalid credentials, user already exists).

## API Endpoints
### POST `/security/register`
- Registers a new user.
- **Body:** `{ username, password, firstName, lastName, email? }`
- **Response:** User profile and tokens.

### POST `/security/login`
- Authenticates a user and returns tokens.
- **Body:** `{ username, password }`
- **Response:** User profile and tokens.

### POST `/security/refresh`
- Issues new access and refresh tokens.
- **Headers:** `Authorization: Bearer <refresh_token>`
- **Response:** User profile and tokens.

## How It Works
- On registration, the password is hashed and stored securely.
- On login, credentials are verified and tokens are issued.
- Access tokens are used for protected API calls; refresh tokens are used to obtain new access tokens.
- Guards (`AccessTokenGuard`, `RefreshTokenGuard`) protect sensitive endpoints.

## Technologies Used
- **NestJS** (server framework)
- **Passport** (authentication middleware)
- **JWT** (token-based authentication)
- **bcrypt** (password hashing)
- **Angular** (client-side authentication integration)

## Error Codes
- `Auth.Unauthorized`: Invalid credentials or unauthorized access.
- `Auth.UserExists`: Attempt to register with an existing username.
- `Auth.UsernameOrPasswordNotMatched`: Login failed due to incorrect credentials.
- `Auth.InvalidHeader`: Malformed or missing authorization header.
- `Auth.AccessDenied`: Access to the resource is denied.

## Client Integration
- The Angular client uses services and interceptors to manage authentication state, store tokens, and handle login/logout flows.
- Guards are used to restrict access to authenticated routes.

## Security Best Practices
- Passwords are never stored in plain text.
- JWT secrets and expiration times are configurable via environment variables.
- Refresh tokens are hashed before storage and validated on use.

---
For more details, see the source code in `server/src/authentication/` and `server/src/modules/security/`.
