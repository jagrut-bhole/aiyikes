# Authentication Setup Guide

## Overview

Your application now supports **two authentication methods**:

1. **Email/Password (Credentials)** - Traditional login with email and password
2. **Google OAuth** - Sign in with Google account

Both methods work seamlessly together and share the same user database.

---

## 🔧 How It Works

### Authentication Flow

#### **1. Credentials Login (Email/Password)**

```
User enters email & password
    ↓
NextAuth validates credentials
    ↓
Checks if user exists in database
    ↓
Compares password hash
    ↓
Creates JWT token with user data
    ↓
User is logged in
```

#### **2. Google OAuth Login**

```
User clicks "Sign in with Google"
    ↓
Redirects to Google OAuth
    ↓
User authorizes the app
    ↓
Google returns user profile
    ↓
signIn callback checks if user exists
    ↓
If new user → Creates account in database
    ↓
If existing user → Fetches user data
    ↓
Creates JWT token with user data
    ↓
User is logged in
```

---

## 📁 File Structure

### **1. `/lib/auth.ts`** - Main Authentication Configuration

This file contains:

- **Providers**: CredentialsProvider and GoogleProvider
- **Callbacks**: signIn, jwt, and session callbacks
- **Configuration**: Session strategy, pages, and secret

### **2. `/app/api/auth/[...nextauth]/route.ts`** - API Route Handler

```typescript
import { authOptions } from "@/lib/auth";

export const { GET, POST } = authOptions;
```

This exports the NextAuth handlers for GET and POST requests.

### **3. `/types/next-auth.d.ts`** - TypeScript Type Definitions

Extends NextAuth types to include custom fields like `username` and `avatar`.

---

## 🔑 Environment Variables Setup

### Required Variables in `.env`:

```bash
# Database
DATABASE_URL="postgresql://postgres:2040@localhost:5432/aiyikes"

# NextAuth Configuration
NEXTAUTH_SECRET=jagsMoonDrop
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

---

## 🌐 Setting Up Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as application type
7. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   For production, add:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**
10. Paste them into your `.env` file

### Step 2: Update `.env` File

```bash
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
```

---

## 💻 Usage in Your Application

### Sign In with Credentials

```typescript
import { signIn } from "next-auth/react";

const handleLogin = async (email: string, password: string) => {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    console.error("Login failed:", result.error);
  } else {
    console.log("Login successful!");
  }
};
```

### Sign In with Google

```typescript
import { signIn } from "next-auth/react";

const handleGoogleLogin = () => {
  signIn("google", {
    callbackUrl: "/dashboard", // Redirect after successful login
  });
};
```

### Get Current Session

```typescript
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.username}!</h1>
      <p>Email: {session?.user?.email}</p>
      {session?.user?.avatar && (
        <img src={session.user.avatar} alt="Avatar" />
      )}
    </div>
  );
}
```

### Sign Out

```typescript
import { signOut } from "next-auth/react";

const handleLogout = () => {
  signOut({
    callbackUrl: "/", // Redirect after logout
  });
};
```

---

## 🔐 How the Callbacks Work

### 1. **signIn Callback**

- **Purpose**: Handles user creation for Google OAuth
- **Flow**:
  - Checks if user email exists
  - For Google login: Creates new user if doesn't exist
  - Returns `true` to allow sign-in, `false` to deny

### 2. **jwt Callback**

- **Purpose**: Adds custom data to JWT token
- **Flow**:
  - On initial sign-in: Adds user data to token
  - For Google OAuth: Fetches user data from database
  - Returns enriched token with id, email, username, avatar

### 3. **session Callback**

- **Purpose**: Makes JWT data available in session
- **Flow**:
  - Extracts data from JWT token
  - Adds it to session.user object
  - Returns session with user data

---

## 🎯 Key Features

### ✅ Unified User Management

- Both authentication methods use the same `User` table
- Google users are automatically created in the database
- Credentials users can be created via registration

### ✅ Automatic User Creation (Google OAuth)

- When a user signs in with Google for the first time:
  - A new user record is created
  - Username is set from Google name or email
  - Avatar is set from Google profile picture
  - Password field is empty (Google users don't need it)

### ✅ Secure Password Handling

- Passwords are hashed using `bcryptjs`
- Passwords are never stored in plain text
- Google users don't have passwords

### ✅ Session Management

- JWT-based sessions
- 30-day session expiration
- Automatic token refresh

---

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use strong NEXTAUTH_SECRET** - Generate with: `openssl rand -base64 32`
3. **Enable HTTPS in production** - Required for OAuth
4. **Validate user input** - Always sanitize email/password inputs
5. **Use environment variables** - Never hardcode secrets

---

## 🐛 Troubleshooting

### Error: "CredentialsProvider only refers to a type"

**Solution**: Import as default export

```typescript
import CredentialsProvider from "next-auth/providers/credentials";
```

### Error: "No credentials provided" when logging in

**Solution**: Check the validation logic uses `!` (NOT) operator

```typescript
if (!credentials?.email || !credentials?.password) {
  throw new Error("No credentials provided");
}
```

### Google OAuth not working

**Solutions**:

1. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
2. Verify redirect URI in Google Console matches your app
3. Ensure OAuth consent screen is configured
4. Check `NEXTAUTH_URL` matches your domain

### Session not persisting

**Solutions**:

1. Verify `NEXTAUTH_SECRET` is set
2. Check cookies are enabled in browser
3. Ensure `SessionProvider` wraps your app

---

## 📝 Database Schema

Your `User` model supports both authentication methods:

```prisma
model User {
  id            String   @id @default(uuid())
  username      String   @unique
  email         String   @unique
  password      String   // Empty for Google users
  avatar        String?  // From Google profile or uploaded
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  posts         Post[]

  @@index([username])
  @@index([email])
}
```

---

## 🚀 Next Steps

1. **Set up Google OAuth credentials** (see above)
2. **Create login/register pages** with both options
3. **Add SessionProvider** to your app layout
4. **Implement protected routes** using middleware
5. **Test both authentication methods**

---

## 📚 Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup Guide](https://next-auth.js.org/providers/google)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Your authentication system is now fully configured and ready to use!** 🎉
