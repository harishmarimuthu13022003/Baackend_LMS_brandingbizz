# 🔧 Cloudinary Upload Preset Setup Guide

## ❌ Error: "Upload preset not found"

This error means the upload preset doesn't exist in your Cloudinary account or the name doesn't match.

## ✅ Step-by-Step Fix

### Step 1: Go to Cloudinary Dashboard
1. Open https://cloudinary.com/console
2. Log in to your account

### Step 2: Create Upload Preset
1. Click **"Settings"** (gear icon) in the top menu
2. Click **"Upload"** tab
3. Scroll down to **"Upload presets"** section
4. Click **"Add upload preset"** button

### Step 3: Configure Preset
Fill in these settings:

- **Preset name**: `lms_unsigned_preset` (or any name you prefer)
- **Signing mode**: Select **"Unsigned"** ⚠️ (This is CRITICAL!)
- **Resource type**: Select **"Auto"** (or "Video" for videos only)
- **Folder**: Leave empty or set to `lms_videos` (optional)
- **Max file size**: Set to **1000 MB** (or higher for large videos)
- **Allowed formats**: Leave default or add specific formats
- **Eager transformations**: Leave empty (optional)

### Step 4: Save Preset
1. Click **"Save"** button at the bottom
2. Note the exact preset name (case-sensitive!)

### Step 5: Update Backend .env File
1. Open `Baackend_LMS_brandingbizz/.env` file
2. Add or update this line:
   ```
   CLOUDINARY_UPLOAD_PRESET=lms_unsigned_preset
   ```
   ⚠️ **Important**: Use the EXACT preset name from Step 3 (case-sensitive!)

### Step 6: Restart Backend Server
1. Stop your backend server (Ctrl+C)
2. Start it again:
   ```bash
   cd Baackend_LMS_brandingbizz
   npm run dev
   ```

### Step 7: Test Upload
1. Go to Admin → Add Session
2. Try uploading a file
3. It should work now! ✅

## 🔍 Troubleshooting

### If preset still not found:
1. **Check preset name spelling** - Must match exactly (case-sensitive)
2. **Verify preset is "Unsigned"** - Signed presets won't work for direct uploads
3. **Check .env file location** - Must be in `Baackend_LMS_brandingbizz/` folder
4. **Restart backend** - Environment variables load at startup
5. **Check Cloudinary console** - Verify preset exists and is active

### Common Mistakes:
- ❌ Using "Signed" mode instead of "Unsigned"
- ❌ Preset name has typos or wrong case
- ❌ Forgot to restart backend after updating .env
- ❌ .env file in wrong location

## 📝 Example .env File

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=da8qvoqus
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=lms_unsigned_preset
```

## ✅ Verification

After setup, you should see:
- ✅ No "preset not found" errors
- ✅ Files upload successfully to Cloudinary
- ✅ Progress bars show upload status
- ✅ Files appear in Cloudinary Media Library

---

**Need help?** Check Cloudinary documentation: https://cloudinary.com/documentation/upload_presets
