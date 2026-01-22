# 🚀 Google Cloud Storage Setup Guide

## 📋 Prerequisites

1. Google Cloud Platform account (https://cloud.google.com/)
2. A GCP project created
3. Billing enabled (GCS has a free tier)

## 🔧 Step-by-Step Setup

### Step 1: Create a GCS Bucket

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **Cloud Storage** → **Buckets**
4. Click **"Create Bucket"**
5. Configure:
   - **Name**: Choose a unique name (e.g., `lms-storage-bucket`)
   - **Location type**: Regional (choose a region close to your users)
   - **Storage class**: Standard
   - **Access control**: Uniform (recommended)
   - **Public access**: Enable if you want public URLs
6. Click **"Create"**

### Step 2: Create a Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **"Create Service Account"**
3. Fill in:
   - **Name**: `lms-storage-service`
   - **Description**: Service account for LMS file uploads
4. Click **"Create and Continue"**
5. Grant role: **"Storage Admin"** (or "Storage Object Admin" for more restricted access)
6. Click **"Continue"** → **"Done"**

### Step 3: Create Service Account Key

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **JSON** format
5. Click **"Create"**
6. **IMPORTANT**: The JSON file will download automatically. Save it securely!

### Step 4: Configure Backend .env File

Open `Baackend_LMS_brandingbizz/.env` and add:

```env
# GCS Configuration
GCS_PROJECT_ID=your-project-id-here
GCS_BUCKET_NAME=your-bucket-name-here

# Choose ONE of these methods:

# Method A: Key file path (recommended for local development)
GCS_KEY_FILE=gcs-key.json

# Method B: Credentials JSON string (for production)
# GCS_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Method C: Use GOOGLE_APPLICATION_CREDENTIALS environment variable
# Set: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

### Step 5: Place Key File (Method A)

1. Copy the downloaded JSON key file to your backend folder
2. Rename it to `gcs-key.json` (or any name you prefer)
3. Add to `.gitignore`:
   ```
   gcs-key.json
   *.json
   ```
4. Update `.env` with the file path:
   ```env
   GCS_KEY_FILE=gcs-key.json
   ```

### Step 6: Make Bucket Public (Optional)

If you want public URLs (recommended for videos/PDFs):

1. Go to **Cloud Storage** → **Buckets**
2. Click on your bucket
3. Go to **"Permissions"** tab
4. Click **"Add Principal"**
5. Add:
   - **New principals**: `allUsers`
   - **Role**: **Storage Object Viewer**
6. Click **"Save"**
7. Confirm the warning

### Step 7: Install Dependencies

```bash
cd Baackend_LMS_brandingbizz
npm install @google-cloud/storage
```

### Step 8: Test the Setup

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. You should see:
   ```
   [GCS] Connected to bucket: your-bucket-name
   ```

3. Try uploading a file through the admin panel

## 🔐 Security Best Practices

1. **Never commit key files to Git**
   - Add `*.json` to `.gitignore`
   - Use environment variables in production

2. **Use least privilege**
   - Service account should only have "Storage Object Admin" role
   - Not "Storage Admin" (unless needed)

3. **Rotate keys regularly**
   - Delete old keys when creating new ones
   - Update `.env` with new key file

4. **Use signed URLs for private files** (optional)
   - Modify `gcs.js` to generate signed URLs instead of public URLs
   - Set expiration times

## 📁 File Structure in GCS

Files will be stored with this structure:
```
lms/
  ├── thumbnails/
  │   └── course_thumbnail.jpg
  ├── videos/
  │   └── course_name/
  │       └── session_name/
  │           └── video_1234567890-video.mp4
  ├── materials/
  │   └── course_name/
  │       └── session_name/
  │           └── material_1234567890-document.pdf
  └── ppts/
      └── course_name/
          └── session_name/
              └── ppt_1234567890-presentation.pptx
```

## 🌐 Public URLs Format

Files will be accessible at:
```
https://storage.googleapis.com/your-bucket-name/lms/videos/course/session/video.mp4
```

## 💰 Pricing

- **Free Tier**: 5GB storage, 1GB egress/month
- **Storage**: ~$0.020 per GB/month
- **Egress**: ~$0.12 per GB (first 10GB free)
- **Operations**: Very cheap (pennies per 10,000 operations)

## 🐛 Troubleshooting

### Error: "Bucket does not exist"
- Check `GCS_BUCKET_NAME` matches exactly (case-sensitive)
- Verify bucket exists in GCP Console

### Error: "Permission denied"
- Check service account has "Storage Admin" or "Storage Object Admin" role
- Verify key file is correct

### Error: "Invalid credentials"
- Check JSON key file is valid
- Verify `GCS_PROJECT_ID` matches the project in key file
- Try regenerating the key

### Files not publicly accessible
- Make sure bucket has public access enabled
- Check file permissions in GCS Console

## ✅ Verification Checklist

- [ ] GCS bucket created
- [ ] Service account created with Storage Admin role
- [ ] JSON key file downloaded
- [ ] Key file placed in backend folder
- [ ] `.env` file configured
- [ ] `@google-cloud/storage` installed
- [ ] Backend server starts without errors
- [ ] Test upload works
- [ ] Files appear in GCS bucket
- [ ] Files are publicly accessible (if needed)

---

**Need help?** Check [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
