# 🔥 Firebase Authentication Setup Guide

## ✅ What's Been Added

### Backend Files Created:
1. **firebaseAuthController.js** - Firebase authentication logic
2. **firebaseAuthRoutes.js** - Firebase API routes
3. **firebaseConfig.js** - Firebase initialization configuration
4. **Updated app.js** - Added Firebase routes
5. **Updated server.js** - Initialize Firebase on startup
6. **Updated package.json** - Added firebase-admin dependency

### Frontend Updates:
1. **Updated auth_service.dart** - Added Firebase authentication methods
2. **Updated api_service.dart** - Added Firebase API endpoints

---

## 🚀 Quick Setup

### Step 1: Install Backend Dependencies
```bash
cd abidant_backend/abidant-backend
npm install
```

### Step 2: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create Project"**
3. Enter project name: `abidant` (or your choice)
4. Accept terms and click **"Create project"**
5. Wait for project to be created

### Step 3: Download Firebase Service Account Key
1. In Firebase Console, click **⚙️ Settings** (gear icon)
2. Go to **"Project Settings"**
3. Click **"Service Accounts"** tab
4. Click **"Generate New Private Key"** button
5. A JSON file will download
6. Save it as `serviceAccountKey.json` in `abidant-backend/config/` folder

### Step 4: Enable Email/Password Authentication
1. In Firebase Console, go to **Build > Authentication**
2. Click **"Get Started"** (or go to **Sign-in method** tab)
3. Click **"Email/Password"**
4. Toggle "Enable" button
5. Check **"Email/Password"** option
6. Click **"Save"**

### Step 5: Setup Environment Variables
1. Open `abidant-backend/.env` file
2. Copy content from `.env.example`
3. Fill in your Firebase details:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   FIREBASE_PROJECT_ID=your-project-id
   ```

### Step 6: Update Flutter Project (pubspec.yaml)
Ensure your Flutter project has Firebase packages:
```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_auth: ^4.14.0
```

Run: `flutter pub get`

---

## 📍 API Endpoints

### Firebase Authentication Routes

#### 1. Register User
```
POST /api/firebase-auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "User registered successfully with Firebase",
  "userId": "mongo-user-id",
  "firebaseUid": "firebase-uid",
  "customToken": "firebase-custom-token"
}
```

#### 2. Login User
```
POST /api/firebase-auth/login
Content-Type: application/json

{
  "idToken": "firebase-id-token-from-client",
  "email": "john@example.com"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": "mongo-user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "firebaseUid": "firebase-uid"
  }
}
```

#### 3. Logout User
```
POST /api/firebase-auth/logout
Content-Type: application/json

{
  "firebaseUid": "firebase-uid"
}

Response:
{
  "message": "Logout successful"
}
```

#### 4. Password Reset
```
POST /api/firebase-auth/password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}

Response:
{
  "message": "Password reset email sent successfully",
  "resetLink": "password-reset-link"
}
```

#### 5. Refresh Token
```
POST /api/firebase-auth/refresh-token
Content-Type: application/json

{
  "firebaseUid": "firebase-uid"
}

Response:
{
  "message": "Token refreshed successfully",
  "customToken": "new-custom-token"
}
```

---

## 📱 Flutter Implementation Examples

### Example 1: Firebase Register
```dart
import 'package:firebase_auth/firebase_auth.dart';
import 'core/services/auth_service.dart';

Future<void> firebaseRegister(String name, String email, String password) async {
  try {
    // Register with Firebase (client-side)
    UserCredential credential = await AuthService.firebaseRegister(
      email: email,
      password: password,
    );

    // Register with backend
    final response = await ApiService.firebaseRegister(
      name: name,
      email: email,
      password: password,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      
      // Save login data
      await AuthService.saveLoginData(
        email,
        loginMethod: 'firebase',
        firebaseUid: data['firebaseUid'],
        userName: name,
      );

      print('✅ Registration successful!');
    } else {
      print('❌ Registration failed');
    }
  } catch (e) {
    print('Error: $e');
  }
}
```

### Example 2: Firebase Login
```dart
Future<void> firebaseLogin(String email, String password) async {
  try {
    // Login with Firebase (client-side)
    UserCredential credential = await AuthService.firebaseLogin(
      email: email,
      password: password,
    );

    // Get ID Token
    String? idToken = await AuthService.getFirebaseIdToken();

    // Verify with backend
    final response = await ApiService.firebaseLogin(
      idToken: idToken ?? '',
      email: email,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      
      // Save login data
      await AuthService.saveLoginData(
        email,
        loginMethod: 'firebase',
        firebaseUid: data['user']['firebaseUid'],
        userName: data['user']['name'],
      );

      print('✅ Login successful!');
    } else {
      print('❌ Login failed');
    }
  } on FirebaseAuthException catch (e) {
    print('Firebase Error: ${e.message}');
  } catch (e) {
    print('Error: $e');
  }
}
```

### Example 3: Firebase Logout
```dart
Future<void> firebaseLogout() async {
  try {
    String? firebaseUid = await AuthService.getFirebaseUid();
    
    // Logout from backend
    await ApiService.firebaseLogout(firebaseUid: firebaseUid ?? '');
    
    // Logout from Firebase
    await AuthService.firebaseSignOut();
    
    // Clear local data
    await AuthService.logout();
    
    print('✅ Logout successful!');
  } catch (e) {
    print('Error: $e');
  }
}
```

### Example 4: Password Reset
```dart
Future<void> resetPassword(String email) async {
  try {
    // Send password reset email via Firebase
    await AuthService.sendPasswordResetEmail(email);
    
    // Optional: Also notify backend
    await ApiService.firebasePasswordReset(email: email);
    
    print('✅ Password reset email sent!');
  } catch (e) {
    print('Error: $e');
  }
}
```

---

## 🔑 Authentication Methods Available

### In AuthService (auth_service.dart):
- `firebaseRegister()` - Register with email/password
- `firebaseLogin()` - Login with email/password
- `getFirebaseIdToken()` - Get ID token for backend
- `firebaseSignOut()` - Sign out from Firebase
- `sendPasswordResetEmail()` - Send password reset email
- `getCurrentUser()` - Get current Firebase user
- `isFirebaseAuthenticated()` - Check if authenticated
- `updateUserProfile()` - Update user display name and photo

### In ApiService (api_service.dart):
- `firebaseRegister()` - Register user with backend
- `firebaseLogin()` - Verify token with backend
- `firebaseLogout()` - Logout with backend
- `firebasePasswordReset()` - Password reset endpoint
- `firebaseRefreshToken()` - Refresh authentication token

---

## ⚠️ Important Notes

1. **Service Account Key**: Keep `serviceAccountKey.json` SECRET! Never commit to Git.
2. **Add to .gitignore**: `config/serviceAccountKey.json`
3. **Environment Variables**: Always use `.env` for sensitive data
4. **ID Token**: Firebase ID tokens expire after 1 hour. Use refresh tokens for long sessions.
5. **Backend Verification**: Always verify tokens on the backend for security

---

## 🐛 Troubleshooting

### Issue: "FIREBASE_SERVICE_ACCOUNT_PATH not set"
- Make sure `.env` file exists in `abidant-backend/` folder
- Make sure `config/serviceAccountKey.json` exists

### Issue: "User not found" in Firebase
- Check email is correct
- Make sure Email/Password provider is enabled in Firebase Console

### Issue: "auth/email-already-exists"
- User is already registered
- Try login instead of register

### Issue: ID Token invalid
- Token might be expired (expires after 1 hour)
- Get a fresh token or use refresh token

---

## 📚 References

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Flutter](https://firebase.flutter.dev/)

---

## ✅ Testing Checklist

- [ ] Firebase project created
- [ ] Service account key downloaded
- [ ] Email/Password provider enabled
- [ ] Backend dependencies installed
- [ ] Environment variables set
- [ ] Backend server running
- [ ] Flutter dependencies updated
- [ ] Can register new user
- [ ] Can login with registered user
- [ ] Can logout successfully
- [ ] Can request password reset

---

Good luck with Firebase implementation! 🚀
