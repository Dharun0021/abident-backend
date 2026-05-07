# 🔥 Firebase Service Account Setup - Step by Step

## ❌ Problem: serviceAccountKey.json Not Found

The Firebase Admin SDK needs a service account key to work properly. Here's how to fix it:

---

## 🚀 Step 1: Get Your Real Service Account Key

### From Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **abidant** project
3. Click **⚙️ Settings** (gear icon) → **Project Settings**
4. Go to **"Service Accounts"** tab
5. Click **"Generate New Private Key"** button
6. A JSON file will download automatically

### Expected filename: 
`abidant-XXXXXXX.json` (or similar)

---

## 📁 Step 2: Place the Key File

1. **Open the downloaded JSON file** with a text editor
2. **Copy all the content**
3. **Create/Update** the file: `abidant-backend/config/serviceAccountKey.json`
4. **Paste the JSON content** into that file
5. **Save the file**

### File Location:
```
abidant-backend/
└── config/
    └── serviceAccountKey.json  ← Place your downloaded key here
```

---

## ⚠️ Step 3: Security - Add to .gitignore

Make sure this file is NOT committed to Git:

1. Open `abidant-backend/.gitignore`
2. Add this line:
   ```
   config/serviceAccountKey.json
   ```
3. Save the file

---

## ✅ Step 4: Start the Server

After placing the service account key file:

```bash
cd abidant_backend/abidant-backend
node ./server.js
```

### Expected Output:
```
✅ Firebase Admin SDK initialized successfully
📦 Project: abidant
Server running on port 5000
```

---

## 🔍 Verify Everything Works

### Test Firebase Registration:
```bash
curl -X POST http://localhost:5000/api/firebase-auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Expected Response:
```json
{
  "message": "User registered successfully with Firebase",
  "userId": "mongodb-id",
  "firebaseUid": "firebase-uid",
  "customToken": "token"
}
```

---

## 📋 What's Inside serviceAccountKey.json

Your service account key contains:
```json
{
  "type": "service_account",
  "project_id": "abidant",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----...",
  "client_email": "firebase-adminsdk-...@abidant.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

---

## 🆘 Troubleshooting

### Issue: Still can't find the file
**Solution:**
- Check the file path is exactly: `config/serviceAccountKey.json`
- Make sure you're in the right directory: `abidant-backend/`
- Restart the server after adding the file

### Issue: Invalid JSON in the file
**Solution:**
- The downloaded file must be valid JSON
- Copy-paste again from the downloaded file
- Don't modify the file content

### Issue: Permission denied
**Solution:**
- Make sure the file has read permissions
- Try: `chmod 644 config/serviceAccountKey.json`

### Issue: Still getting errors
**Solution:**
1. Check the `.env` file has correct path:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
   ```
2. Verify the file exists: `ls config/serviceAccountKey.json`
3. Check Firebase Console - Project might not exist or be inactive

---

## ✨ Alternative: Using JSON as Environment Variable

If you prefer, you can use the JSON as an environment variable:

1. Open `config/serviceAccountKey.json`
2. Copy the entire JSON content
3. Add to `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_JSON={the entire JSON here}
   ```

The system will automatically detect and use it.

---

## 🔒 Security Reminders

1. ✅ **Never commit** `serviceAccountKey.json` to Git
2. ✅ **Never share** your service account key publicly
3. ✅ **Add to .gitignore** immediately
4. ✅ **Keep it safe** on your local machine only
5. ✅ **Rotate keys** periodically in production

---

## 📚 Next Steps

1. ✅ Download service account key from Firebase Console
2. ✅ Save it as `config/serviceAccountKey.json`
3. ✅ Add to `.gitignore`
4. ✅ Restart server: `node ./server.js`
5. ✅ Test endpoints with curl or Postman

---

## 🎯 Quick Command Reference

```bash
# Check if file exists
ls config/serviceAccountKey.json

# Start server
node ./server.js

# Test registration
curl -X POST http://localhost:5000/api/firebase-auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```

---

## ✅ Checklist

- [ ] Downloaded service account key from Firebase Console
- [ ] Created `config/serviceAccountKey.json` file
- [ ] Pasted the JSON content into the file
- [ ] Added to `.gitignore`
- [ ] Restarted the server
- [ ] Server shows "✅ Firebase Admin SDK initialized successfully"
- [ ] Tested registration endpoint
- [ ] User created in Firebase Console
- [ ] User stored in MongoDB

---

**Last Updated:** April 17, 2026  
**Status:** Ready to configure
