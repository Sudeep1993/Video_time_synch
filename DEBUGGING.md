# 🐛 Debugging & Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Sync Offset Shows 0.0000 seconds

**Symptoms:**
- Processing completes successfully
- No error messages
- Sync offset shows exactly 0.0000 seconds
- Expected a non-zero offset

**Causes:**
1. **No matching timestamps found** - Videos don't overlap in stopwatch time
2. **OCR failing** - Timestamps not being detected
3. **Different time ranges** - Videos recorded at completely different times

**Debugging Steps:**

1. **Check Browser Console** (F12 → Console tab):
   ```
   Look for these messages:
   ✓ "Video A processed: X timestamps detected"
   ✓ "Video B processed: Y timestamps detected"
   ✓ "Total matches found: Z"
   
   If timestamps detected = 0 or very low:
      → OCR is failing
   
   If matches found = 0:
      → Videos don't overlap in time
   ```

2. **Check Timestamp Detection**:
   - Scroll down to "Detected Timestamps" section
   - Verify timestamps are being extracted
   - Check if stopwatch times overlap between videos

3. **Verify Video Quality**:
   ```
   Good conditions:
   ✓ Stopwatch clearly visible
   ✓ Good lighting (no glare, shadows)
   ✓ Camera in focus
   ✓ Stopwatch fills decent portion of frame
   ✓ High contrast (black text on white)
   
   Bad conditions:
   ✗ Stopwatch too small
   ✗ Blurry or out of focus
   ✗ Poor lighting
   ✗ Stopwatch obscured
   ✗ Low video quality/resolution
   ```

**Solutions:**

**Solution A: Improve OCR Detection**
```javascript
// In app.js, adjust these parameters:

// Line ~304: Sample more frames
const sampleFrames = Math.min(100, frameCount); // Increase from 60 to 100

// Line ~403: Increase tolerance
const tolerance = 0.3; // Increase from 0.2 to 0.3 seconds

// Line ~343: Adjust threshold
const threshold = gray > 140 ? 255 : 0; // Lower from 150 to 140
```

**Solution B: Record Better Videos**
1. Display stopwatch on a dedicated screen
2. Ensure stopwatch is large and centered
3. Use good lighting
4. Keep camera steady and in focus
5. Record for at least 30 seconds showing the stopwatch

**Solution C: Manual Verification**
1. Open both videos in the preview
2. Find a specific stopwatch time visible in both (e.g., 00:00:05.000)
3. Note the video timeline position for each
4. Calculate offset manually: offset = timeA - timeB

---

### Issue 2: Processing Takes Too Long

**Symptoms:**
- Processing stuck or very slow
- Browser becomes unresponsive
- Takes more than 5 minutes

**Solutions:**

1. **Reduce Sample Size**:
   ```javascript
   // Line ~304 in app.js
   const sampleFrames = Math.min(30, frameCount); // Reduce from 60
   ```

2. **Use Smaller Videos**:
   - Compress videos before upload
   - Trim to only the overlapping section
   - Lower resolution (720p instead of 1080p)

3. **Close Other Browser Tabs**:
   - OCR is memory-intensive
   - Free up browser memory

---

### Issue 3: OCR Not Detecting Timestamps

**Symptoms:**
- Console shows "OCR failed" messages
- Timestamps detected = 0 or very low
- Processing completes but no sync data

**Debugging:**

1. **Check Console for OCR Output**:
   ```
   Look for: "OCR detected: "..." → X.XXXs"
   
   If you see gibberish instead of numbers:
      → Stopwatch not visible or readable
   ```

2. **Verify Stopwatch Visibility**:
   - Pause video at any frame
   - Check if stopwatch is in center of frame
   - Check if time is readable to human eye

**Solutions:**

1. **Adjust ROI (Region of Interest)**:
   ```javascript
   // In app.js, extractTimestampFromFrame function
   // Line ~324-333
   
   // If stopwatch is higher/lower, adjust Y offset:
   roiCtx.drawImage(
       canvas,
       canvas.width / 2 - 300,
       canvas.height / 2 - 150, // Changed from -100
       600,
       300, // Changed from 200 (taller ROI)
       0,
       0,
       600,
       300
   );
   ```

2. **Improve Preprocessing**:
   ```javascript
   // Try different threshold values
   // Line ~343
   const threshold = gray > 130 ? 255 : 0; // Experiment: 130, 140, 150, 160
   ```

3. **Add Sharpening** (advanced):
   ```javascript
   // After line 347, before putImageData:
   // Apply sharpening kernel
   // (Code example in TECHNICAL.md)
   ```

---

### Issue 4: Incorrect Offset Calculated

**Symptoms:**
- Offset calculated but videos don't sync correctly
- Offset seems wrong when compared to manual check

**Debugging:**

1. **Check Match Quality**:
   ```
   Console message: "Match found: Stopwatch X.XXXs..."
   
   Look at timeDiff values:
   ✓ Good: timeDiff < 0.05s (50ms)
   ⚠ OK: timeDiff < 0.15s (150ms)
   ✗ Bad: timeDiff > 0.2s (200ms)
   
   If many matches have high timeDiff:
      → OCR accuracy is poor
      → Need better video quality
   ```

2. **Check Statistics**:
   ```
   Console: "Offset statistics: Mean=X, Median=Y, Std=Z"
   
   ✓ Good: Std < 0.05s (consistent)
   ⚠ OK: Std < 0.15s (acceptable)
   ✗ Bad: Std > 0.2s (unreliable)
   
   High standard deviation means:
      → Inconsistent OCR detection
      → Frame rate issues
      → Video encoding problems
   ```

**Solutions:**

1. **Filter Bad Matches**:
   ```javascript
   // In calculateSyncOffset, line ~403
   if (timeDiff < 0.1) { // Stricter: change from 0.2 to 0.1
   ```

2. **Use More Samples**:
   ```javascript
   // More frames = better statistics
   const sampleFrames = Math.min(100, frameCount);
   ```

3. **Manual Override**:
   - Manually identify offset
   - Update `syncOffset` variable in console
   - Click synchronized playback

---

### Issue 5: Synchronized Playback Not Working

**Symptoms:**
- Videos don't play together
- One video doesn't start
- Timing is still off during playback

**Solutions:**

1. **Check Offset Sign**:
   - Positive offset: Video B should start later
   - Negative offset: Video A should start later

2. **Manual Sync Test**:
   ```javascript
   // In browser console:
   const videoA = document.getElementById('synced-video-a');
   const videoB = document.getElementById('synced-video-b');
   
   // Set positions manually
   videoA.currentTime = 5.0;  // 5 seconds in
   videoB.currentTime = 8.5;  // 8.5 seconds in (offset of +3.5s)
   
   videoA.play();
   videoB.play();
   ```

---

## Console Commands for Debugging

### Check Current State
```javascript
// Video data
console.log('Video A:', videoAData);
console.log('Video B:', videoBData);
console.log('Sync offset:', syncOffset);

// Timestamp counts
console.log('A timestamps:', videoAData?.timestamps.length);
console.log('B timestamps:', videoBData?.timestamps.length);
```

### Test OCR Manually
```javascript
// Get a test frame
const videoA = document.getElementById('synced-video-a');
videoA.currentTime = 10; // Go to 10 seconds

videoA.onseeked = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoA, 0, 0, canvas.width, canvas.height);
    
    const result = await extractTimestampFromFrame(canvas);
    console.log('OCR result:', result);
};
```

### Force Recalculate Sync
```javascript
syncOffset = calculateSyncOffset(videoAData, videoBData);
console.log('New offset:', syncOffset);
displayResults();
```

---

## Performance Optimization Tips

### Faster Processing
```javascript
// Reduce samples (less accurate but faster)
const sampleFrames = Math.min(30, frameCount); // Line ~304

// Skip more frames
const frameInterval = Math.floor(frameCount / sampleFrames) * 2; // Line ~305
```

### Better Accuracy
```javascript
// More samples (slower but more accurate)
const sampleFrames = Math.min(120, frameCount);

// Stricter matching
const tolerance = 0.1; // Line ~403
```

---

## Checking for Browser Compatibility

```javascript
// Run in console to check feature support
console.log('Canvas support:', !!document.createElement('canvas').getContext);
console.log('Video support:', !!document.createElement('video').canPlayType);
console.log('FileReader support:', !!window.FileReader);
console.log('Promises support:', !!window.Promise);
```

---

## Getting Help

### Information to Provide
When asking for help, include:

1. **Browser Console Output** (full logs)
2. **Video details**:
   - Format (MP4, MOV, etc.)
   - Duration
   - Resolution
   - File size
3. **Timestamps detected** (from console)
4. **Expected vs actual offset**
5. **Screenshots** of results section

### Create Minimal Test Case
1. Record 10-second test videos
2. Ensure stopwatch is clearly visible
3. Try with those first
4. If it works → problem is with original videos
5. If it doesn't work → problem is with setup

---

## Advanced Debugging

### Enable Verbose Logging
Add at top of app.js:
```javascript
const DEBUG = true;

function debugLog(...args) {
    if (DEBUG) {
        console.log('[DEBUG]', ...args);
    }
}

// Use throughout code:
debugLog('Processing frame', i, 'at time', frameTime);
```

### Save Debug Frames
```javascript
// In extractTimestampFromFrame, after preprocessing:
const debugURL = roiCanvas.toDataURL();
console.log('Debug frame:', debugURL);
// Paste URL in browser to view preprocessed image
```

### Export Timestamp Data
```javascript
// Save to JSON for analysis
const data = {
    videoA: videoAData.timestamps,
    videoB: videoBData.timestamps,
    offset: syncOffset
};
console.log(JSON.stringify(data, null, 2));
```

---

**For more help, open an issue on GitHub with console output and video details!**
