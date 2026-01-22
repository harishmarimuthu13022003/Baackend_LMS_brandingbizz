# ✅ How to Verify Videos & PDFs are Stored Correctly

## 🔍 Check if Data is in MongoDB

### Method 1: Check Backend Logs
When you create a session, you should see logs like:
```
[Session Controller] Session created: {
  id: '...',
  title: 'Session Name',
  videosCount: 2,
  pptsCount: 1,
  materialsCount: 1,
  firstVideoUrl: 'https://res.cloudinary.com/.../video/upload/...',
  firstMaterialUrl: 'https://res.cloudinary.com/.../raw/upload/...'
}
```

### Method 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to a session with videos/PDFs
4. You should see logs like:
   ```
   [SessionVideo] Session data received: {
     videosArray: [...],
     videosCount: 2,
     firstVideoUrl: 'https://res.cloudinary.com/...'
   }
   ```

### Method 3: Check MongoDB Directly
```javascript
// In MongoDB Compass or mongo shell
db.sessions.findOne({ title: "Your Session Title" })

// Should show:
{
  videos: [
    {
      title: "Video 1",
      videoUrl: "https://res.cloudinary.com/...",
      publicId: "...",
      order: 0
    }
  ],
  materials: [
    {
      title: "Material 1",
      materialUrl: "https://res.cloudinary.com/...",
      publicId: "...",
      order: 0
    }
  ]
}
```

## 🐛 Troubleshooting

### Videos/PDFs Not Showing

1. **Check if URLs are stored:**
   - Open browser console
   - Look for `[SessionVideo]` or `[SessionMaterial]` logs
   - Verify `firstVideoUrl` or `firstMaterialUrl` has a Cloudinary URL

2. **Check Cloudinary URLs format:**
   - Should start with `https://res.cloudinary.com/`
   - Should contain `/video/upload/` for videos
   - Should contain `/raw/upload/` for PDFs

3. **Check if React Player can play the video:**
   - Cloudinary videos should work with ReactPlayer
   - If video doesn't play, check browser console for CORS errors

4. **Check if PDF iframe loads:**
   - PDFs from Cloudinary should load in iframe
   - If not, try opening URL directly in new tab

### Common Issues

**Issue: Videos array is empty**
- **Cause**: Files weren't uploaded before creating session
- **Fix**: Upload files first, then create session

**Issue: URLs are empty strings**
- **Cause**: Upload failed or didn't complete
- **Fix**: Check upload progress, ensure files uploaded successfully

**Issue: Video/PDF doesn't play/load**
- **Cause**: URL might be incorrect or file not accessible
- **Fix**: 
  1. Copy URL from console log
  2. Paste in browser address bar
  3. If it loads, the URL is correct
  4. If not, check Cloudinary dashboard

## ✅ What Was Fixed

1. **SessionMaterial.jsx** - Now reads from `materials` array instead of legacy `studyMaterialUrl`
2. **SessionVideo.jsx** - Improved video player handling and error messages
3. **SessionLearning.jsx** - Materials now navigate to viewer page instead of direct download
4. **Added debug logging** - Console logs show what data is received
5. **Backend logging** - Server logs show what's being saved to database

## 🧪 Test Steps

1. **Upload a video:**
   - Go to Admin → Add Session
   - Select course and section
   - Enter session title
   - Upload a video file
   - Wait for upload to complete
   - Create session
   - Check backend logs for video URL

2. **Upload a PDF:**
   - Same steps as above, but upload PDF
   - Check backend logs for material URL

3. **View as user:**
   - Go to Courses → Select course → Select session
   - Click on Videos tab - should see uploaded videos
   - Click on Study Materials tab - should see uploaded PDFs
   - Click "View PDF" - should open PDF viewer
   - Click "Watch Video" - should open video player

4. **Check console:**
   - Open browser DevTools
   - Check Console tab for debug logs
   - Verify URLs are present and correct
