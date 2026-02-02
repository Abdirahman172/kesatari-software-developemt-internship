# Google Cloud Project Setup Guide

## 🔧 Complete Setup Instructions

### **Step 1: Create Google Cloud Project**

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**:
   - Click "Select a project" dropdown (top left)
   - Click "NEW PROJECT"
   - Project name: `kasatari-3d-visualization`
   - Click "CREATE"

### **Step 2: Enable Required APIs**

1. **Enable Google Identity Services**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Identity"
   - Click "Google Identity Services API"
   - Click "ENABLE"

### **Step 3: Create OAuth 2.0 Credentials**

1. **Go to Credentials**:
   - "APIs & Services" → "Credentials"
   - Click "CREATE CREDENTIALS"
   - Select "OAuth 2.0 Client IDs"

2. **Configure OAuth Consent Screen** (if prompted):
   - User Type: "External"
   - App name: "3D Profile Visualization"
   - User support email: Your email
   - Developer contact: Your email
   - Click "SAVE AND CONTINUE"
   - Skip scopes (click "SAVE AND CONTINUE")
   - Add test users if needed
   - Click "BACK TO DASHBOARD"

3. **Create OAuth 2.0 Client ID**:
   - Application type: "Web application"
   - Name: "3D Profile Visualization"
   
4. **Add Authorized JavaScript Origins**:
   ```
   http://localhost:8000
   https://abdirahman172.github.io
   ```

5. **Add Authorized Redirect URIs**:
   ```
   http://localhost:8000/
   https://abdirahman172.github.io/kasatari-software-developer-ineternship/
   ```

6. **Click CREATE**:
   - Copy the Client ID that appears
   - It looks like: `123456789-abcdefghijk.apps.googleusercontent.com`

### **Step 4: Update Your Application**

1. **Replace Client ID in index.html**:
   ```html
   data-client_id="YOUR_ACTUAL_CLIENT_ID_HERE"
   ```

2. **Commit and Push Changes**:
   ```bash
   git add index.html
   git commit -m "Update Google OAuth Client ID for production"
   git push
   ```

### **Step 5: Test Your Deployment**

1. **Visit Your Live Site**:
   - https://abdirahman172.github.io/kasatari-software-developer-ineternship/

2. **Test Google Sign-In**:
   - Click the Google Sign-In button
   - Should work without CORS errors
   - Should redirect properly after authentication

## 🚨 Important Security Notes

### **Client ID Security**
- Client IDs are public and safe to expose
- They identify your app to Google
- No secret keys needed for frontend apps

### **Domain Restrictions**
- Only authorized domains can use your Client ID
- This prevents unauthorized use
- Always keep your authorized origins list minimal

### **Testing vs Production**
- Use different Client IDs for testing and production
- Or add both localhost and GitHub Pages to same Client ID

## 🔍 Troubleshooting

### **"redirect_uri_mismatch" Error**
- Check authorized redirect URIs match exactly
- Include trailing slashes if your URLs have them
- Case-sensitive matching

### **"origin_mismatch" Error**
- Check authorized JavaScript origins
- Don't include paths, only domains
- Use HTTPS for production

### **Sign-In Popup Blocked**
- Modern browsers block popups
- The app uses FedCM which avoids popups
- Ensure `data-use_fedcm_for_prompt="true"` is set

## ✅ Final Checklist

- [ ] Google Cloud Project created
- [ ] Google Identity Services API enabled
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized origins added:
  - [ ] `https://abdirahman172.github.io`
  - [ ] `http://localhost:8000` (for testing)
- [ ] Client ID updated in index.html
- [ ] Changes committed and pushed to GitHub
- [ ] GitHub Pages deployment working
- [ ] Google Sign-In tested on live site

## 🎯 Expected Result

After completing these steps:
- ✅ Google Sign-In works on your live GitHub Pages site
- ✅ No CORS or authentication errors
- ✅ Users can access the 3D visualization
- ✅ Professional deployment ready for review

---

**Your GitHub Pages URL**: https://abdirahman172.github.io/kasatari-software-developer-ineternship/

Add this URL to your Google Cloud Project authorized origins!