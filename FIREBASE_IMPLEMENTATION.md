# 🔥 Firebase Authentication Implementation

This guide covers the Firebase authentication system added to the ABIDANT application.

## 📋 Files Overview

### Backend Files
| File | Purpose |
|------|---------|
| `controllers/firebaseAuthController.js` | Firebase auth logic and endpoints |
| `routes/firebaseAuthRoutes.js` | Firebase API routes |
| `config/firebaseConfig.js` | Firebase Admin SDK initialization |
| `app.js` | Updated with Firebase routes |
| `server.js` | Updated with Firebase initialization |

### Frontend Files Updated
| File | Changes |
|------|---------|
| `lib/core/services/auth_service.dart` | Added Firebase Auth methods |
| `lib/core/services/api_service.dart` | Added Firebase API endpoints |

---

## 🎯 Key Features

### Authentication Methods
✅ Email/Password Registration  
✅ Email/Password Login  
✅ Firebase Token Verification  
✅ Password Reset via Email  
✅ Token Refresh  
✅ Secure Logout  

### User Data Storage
- **Firebase Authentication**: User credentials and identity
- **MongoDB**: User profile and additional data
- **Local Storage (SharedPreferences)**: Session management

### Security Features
- Server-side token verification
- Firebase ID token validation
- Custom claims support
- Password hashing (bcryptjs)
- Environment-based configuration

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
# Navigate to backend
cd abidant_backend/abidant-backend

# Install Firebase dependencies
npm install firebase-admin

# Create config folder and add serviceAccountKey.json
mkdir -p config
# Download from Firebase Console and place here

# Update .env file with Firebase credentials
cat .env.example > .env
# Edit .env with your Firebase details

# Start server
npm start
```

### 2. Frontend Setup
```bash
# Update pubspec.yaml
flutter pub add firebase_auth firebase_core

# Run app
flutter run
```

### 3. Firebase Console Setup
1. Create project at https://console.firebase.google.com
2. Download service account key
3. Enable Email/Password authentication
4. Save service account key to `config/serviceAccountKey.json`

---

## 🔐 API Endpoints

```
POST /api/firebase-auth/register          - Register new user
POST /api/firebase-auth/login            - Login and verify token
POST /api/firebase-auth/logout           - Logout user
POST /api/firebase-auth/password-reset   - Send reset email
POST /api/firebase-auth/refresh-token    - Refresh authentication token
```

---

## 💡 Usage Examples

### Register User (Flutter)
```dart
try {
  final credential = await AuthService.firebaseRegister(
    email: 'user@example.com',
    password: 'password123',
  );
  
  final response = await ApiService.firebaseRegister(
    name: 'John Doe',
    email: 'user@example.com',
    password: 'password123',
  );
  
  await AuthService.saveLoginData(
    'user@example.com',
    loginMethod: 'firebase',
  );
} catch (e) {
  print('Error: $e');
}
```

### Login User (Flutter)
```dart
try {
  final credential = await AuthService.firebaseLogin(
    email: 'user@example.com',
    password: 'password123',
  );
  
  final idToken = await AuthService.getFirebaseIdToken();
  
  final response = await ApiService.firebaseLogin(
    idToken: idToken ?? '',
    email: 'user@example.com',
  );
  
  await AuthService.saveLoginData(
    'user@example.com',
    loginMethod: 'firebase',
  );
} catch (e) {
  print('Error: $e');
}
```

### Password Reset (Flutter)
```dart
try {
  await AuthService.sendPasswordResetEmail('user@example.com');
  print('Reset email sent!');
} catch (e) {
  print('Error: $e');
}
```

---

## 📁 Project Structure

```
abidant_backend/
├── abidant-backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── firebaseConfig.js          ✨ NEW
│   │   └── serviceAccountKey.json     (download from Firebase)
│   ├── controllers/
│   │   ├── userController.js
│   │   └── firebaseAuthController.js  ✨ NEW
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── firebaseAuthRoutes.js      ✨ NEW
│   ├── app.js                         ✏️ UPDATED
│   ├── server.js                      ✏️ UPDATED
│   └── package.json                   ✏️ UPDATED
│
├── FIREBASE_SETUP_GUIDE.md            ✨ NEW

abidant_application/
├── lib/
│   └── core/
│       └── services/
│           ├── auth_service.dart      ✏️ UPDATED
│           └── api_service.dart       ✏️ UPDATED
```

---

## ⚙️ Environment Variables

Create `.env` file in `abidant-backend/` with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/abidant
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_PROJECT_ID=your-project-id
```

---

## 🔒 Security Best Practices

1. ✅ Never commit `serviceAccountKey.json` to Git
2. ✅ Use environment variables for sensitive data
3. ✅ Verify tokens on backend before granting access
4. ✅ Use HTTPS in production
5. ✅ Set strong password requirements
6. ✅ Implement rate limiting on auth endpoints
7. ✅ Log authentication events
8. ✅ Regularly rotate service account keys

---

## 🧪 Testing

### Manual Testing Steps

1. **Register New User**
   - Call: `POST /api/firebase-auth/register`
   - Verify user created in Firebase Console
   - Verify user created in MongoDB

2. **Login Existing User**
   - Call: `POST /api/firebase-auth/login`
   - Verify ID token is valid
   - Check user data returned

3. **Password Reset**
   - Call: `POST /api/firebase-auth/password-reset`
   - Verify email received

4. **Logout**
   - Call: `POST /api/firebase-auth/logout`
   - Verify session cleared

---

## 📊 Database Schema Updates

### User Model (MongoDB)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  firebaseUid: String,          // NEW: Firebase UID
  authMethod: String,            // NEW: 'firebase' or 'traditional'
  password: String,              // Empty for Firebase users
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚨 Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `FIREBASE_SERVICE_ACCOUNT_PATH not set` | Missing .env | Copy .env.example to .env |
| `User already exists` | Duplicate email | Use different email |
| `Invalid ID token` | Token expired | Get fresh token |
| `Email not verified` | Firebase setup | Enable Email/Password provider |

---

## 📞 Support

For issues or questions:
1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Review error messages in console
3. Verify Firebase project settings
4. Check service account permissions

---

## ✅ Deployment Checklist

- [ ] Firebase project created
- [ ] Service account key downloaded
- [ ] Email/Password provider enabled
- [ ] Environment variables configured
- [ ] Backend dependencies installed
- [ ] MongoDB connected
- [ ] All tests passing
- [ ] Security rules reviewed
- [ ] Rate limiting configured
- [ ] Error logging enabled

---

Happy coding! 🚀
