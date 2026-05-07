# 🗂️ Firebase Implementation - File Structure & Quick Reference

## 📁 Complete Project Structure

```
abident_backend/
│
├── IMPLEMENTATION_SUMMARY.md          ✨ Overview of all changes
├── FIREBASE_SETUP_GUIDE.md            ✨ Detailed setup instructions
├── FIREBASE_IMPLEMENTATION.md         ✨ Architecture & usage
│
└── abidant-backend/
    ├── setup-firebase.sh              ✨ Automated setup script
    ├── .env                           (Configure with Firebase details)
    ├── .env.example                   ✨ Environment template
    ├── package.json                   ✏️ Added firebase-admin
    ├── app.js                         ✏️ Added Firebase routes
    ├── server.js                      ✏️ Firebase initialization
    │
    ├── config/
    │   ├── db.js                      (MongoDB connection)
    │   ├── firebaseConfig.js          ✨ Firebase Admin SDK init
    │   └── serviceAccountKey.json     (Download from Firebase)
    │
    ├── controllers/
    │   ├── userController.js          (Traditional auth)
    │   └── firebaseAuthController.js  ✨ Firebase auth logic
    │
    ├── routes/
    │   ├── userRoutes.js              (Traditional auth routes)
    │   └── firebaseAuthRoutes.js      ✨ Firebase API routes
    │
    ├── models/
    │   └── User.js                    (MongoDB user model)
    │
    └── node_modules/                  (Dependencies)

abidant_application/
│
├── pubspec.yaml                       (Update with firebase packages)
│
└── lib/
    ├── core/
    │   └── services/
    │       ├── auth_service.dart      ✏️ Added Firebase methods
    │       ├── api_service.dart       ✏️ Added Firebase endpoints
    │       └── config/
    │           └── app_config.dart
    │
    ├── features/
    │   ├── auth/
    │   │   ├── presentation/
    │   │   │   ├── pages/
    │   │   │   │   ├── login_page.dart
    │   │   │   │   └── register_page.dart
    │   │   │   └── widgets/
    │   │   └── (Use new Firebase methods)
    │   │
    │   └── home/
    │       └── (Use new auth service)
```

---

## 🚀 Quick Start Commands

### Backend Setup
```bash
# Navigate to backend
cd abidant_backend/abidant-backend

# Install dependencies
npm install

# Run setup script (if on Linux/Mac)
bash setup-firebase.sh

# Or manually install Firebase
npm install firebase-admin

# Create config directory
mkdir -p config

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase details
nano .env

# Start server
npm start
```

### Frontend Setup
```bash
# Add Firebase packages
flutter pub add firebase_auth firebase_core

# Get all dependencies
flutter pub get

# Run app
flutter run
```

---

## 📋 Environment Variables Setup

Create `.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/abidant
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_PROJECT_ID=your-project-id
```

---

## 🔌 API Endpoints Quick Reference

### Register User
```
POST /api/firebase-auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```
POST /api/firebase-auth/login
Content-Type: application/json

{
  "idToken": "firebase-id-token",
  "email": "john@example.com"
}
```

### Logout User
```
POST /api/firebase-auth/logout
Content-Type: application/json

{
  "firebaseUid": "firebase-uid"
}
```

### Password Reset
```
POST /api/firebase-auth/password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Refresh Token
```
POST /api/firebase-auth/refresh-token
Content-Type: application/json

{
  "firebaseUid": "firebase-uid"
}
```

---

## 💻 Flutter Code Snippets

### Import Firebase
```dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/services/auth_service.dart';
import 'core/services/api_service.dart';
```

### Register Example
```dart
try {
  // Firebase registration (client-side)
  await AuthService.firebaseRegister(
    email: 'user@example.com',
    password: 'password123',
  );

  // Backend registration
  final response = await ApiService.firebaseRegister(
    name: 'John Doe',
    email: 'user@example.com',
    password: 'password123',
  );

  // Save session
  await AuthService.saveLoginData(
    'user@example.com',
    loginMethod: 'firebase',
  );

  print('✅ Registration successful!');
} catch (e) {
  print('❌ Error: $e');
}
```

### Login Example
```dart
try {
  // Firebase login
  await AuthService.firebaseLogin(
    email: 'user@example.com',
    password: 'password123',
  );

  // Get ID token
  String? idToken = await AuthService.getFirebaseIdToken();

  // Backend verification
  final response = await ApiService.firebaseLogin(
    idToken: idToken ?? '',
    email: 'user@example.com',
  );

  // Save session
  await AuthService.saveLoginData(
    'user@example.com',
    loginMethod: 'firebase',
  );

  print('✅ Login successful!');
} catch (e) {
  print('❌ Error: $e');
}
```

### Logout Example
```dart
try {
  String? uid = await AuthService.getFirebaseUid();
  
  // Backend logout
  await ApiService.firebaseLogout(firebaseUid: uid ?? '');
  
  // Firebase logout
  await AuthService.firebaseSignOut();
  
  // Clear local session
  await AuthService.logout();

  print('✅ Logout successful!');
} catch (e) {
  print('❌ Error: $e');
}
```

---

## 🔑 Important Methods

### AuthService Methods
```dart
// Firebase Authentication
AuthService.firebaseRegister(email, password)
AuthService.firebaseLogin(email, password)
AuthService.firebaseSignOut()
AuthService.getFirebaseIdToken()
AuthService.sendPasswordResetEmail(email)
AuthService.getCurrentUser()
AuthService.isFirebaseAuthenticated()
AuthService.updateUserProfile(displayName, photoURL)

// Local Storage
AuthService.saveLoginData(email, loginMethod, firebaseUid, userName)
AuthService.isLoggedIn()
AuthService.getSavedEmail()
AuthService.getSavedUserName()
AuthService.getLoginMethod()
AuthService.getFirebaseUid()
AuthService.logout()
```

### ApiService Methods
```dart
// Firebase Endpoints
ApiService.firebaseRegister(name, email, password)
ApiService.firebaseLogin(idToken, email)
ApiService.firebaseLogout(firebaseUid)
ApiService.firebasePasswordReset(email)
ApiService.firebaseRefreshToken(firebaseUid)

// Traditional Endpoints
ApiService.login(email, password)
ApiService.register(name, email, password)
```

---

## ✅ Checklist for Implementation

### Backend Setup
- [ ] Run `npm install`
- [ ] Create `.env` file from `.env.example`
- [ ] Download Firebase service account key
- [ ] Place key in `config/serviceAccountKey.json`
- [ ] Update `.env` with Firebase details
- [ ] Test `npm start` - server should start
- [ ] Check console for Firebase initialization message

### Firebase Console
- [ ] Create Firebase project
- [ ] Enable Email/Password provider
- [ ] Download service account key
- [ ] Note project ID and database URL

### Flutter Setup
- [ ] Run `flutter pub add firebase_auth firebase_core`
- [ ] Update imports in files
- [ ] Test Firebase methods
- [ ] Integrate with login page
- [ ] Integrate with register page

### Testing
- [ ] Test register endpoint
- [ ] Test login endpoint
- [ ] Test logout endpoint
- [ ] Test password reset
- [ ] Verify data in MongoDB
- [ ] Check Firebase Console for users

---

## 🐛 Common Issues

### Issue: Firebase initialization fails
**Solution:** 
- Check `.env` file exists
- Verify `FIREBASE_SERVICE_ACCOUNT_PATH` is correct
- Ensure `serviceAccountKey.json` exists and is valid

### Issue: "User not found" error
**Solution:**
- Make sure user was registered
- Check email/password are correct
- Verify in Firebase Console

### Issue: Invalid ID token
**Solution:**
- Token might be expired (expires after 1 hour)
- Get fresh token using `getFirebaseIdToken()`
- Use refresh token endpoint

---

## 📞 Support Resources

- Firebase Docs: https://firebase.google.com/docs
- Firebase Auth: https://firebase.google.com/docs/auth
- Flutter Firebase: https://firebase.flutter.dev/
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

---

## 🚀 Deployment Notes

1. Never commit `serviceAccountKey.json` to Git
2. Always use environment variables for secrets
3. Enable HTTPS in production
4. Set strong password requirements
5. Implement rate limiting
6. Monitor authentication logs
7. Regular security audits

---

**Last Updated:** 2026-04-17  
**Status:** ✅ Ready for Use
