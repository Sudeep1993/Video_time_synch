# 🎬 Video Synchronization Tool

A web-based application for synchronizing multiple video recordings using ArUco markers and stopwatch-based timestamp detection.

![Video Sync Tool](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### Live Stopwatch Display
- Real-time stopwatch with ArUco markers in corners
- High-precision timing (milliseconds)
- Can be displayed during video recording
- Provides visual reference points for synchronization

### Video Synchronization
- Upload two video files for synchronization
- Automatic timestamp detection using OCR (Tesseract.js)
- ArUco marker detection for ROI extraction
- Calculate precise time offset between videos
- Side-by-side synchronized playback
- Detailed analysis and statistics

## 🚀 Live Demo

**[View Live Demo](https://yourusername.github.io/video-sync-app/)**

## 📋 How It Works

### Recording Setup
1. Open the **Live Stopwatch** tab
2. Display the stopwatch on a screen visible to all cameras
3. Start recording with multiple cameras capturing the stopwatch
4. The stopwatch provides a common time reference

### Synchronization Process
1. Open the **Video Sync** tab
2. Upload Video A and Video B
3. Click "Process & Synchronize Videos"
4. The system will:
   - Detect ArUco markers to identify the stopwatch region
   - Extract timestamps using OCR from each video
   - Match corresponding timestamps between videos
   - Calculate the time offset
5. View synchronized playback and detailed results

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Computer Vision**: OpenCV.js (ArUco marker detection)
- **OCR**: Tesseract.js (timestamp extraction)
- **Video Processing**: HTML5 Video API
- **UI/UX**: Modern responsive design with CSS Grid/Flexbox

## 📦 Installation

### Option 1: Use GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings > Pages
3. Select "main" branch as source
4. Your site will be published at `https://yourusername.github.io/video-sync-app/`

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/video-sync-app.git
cd video-sync-app
```

2. Open `index.html` in a modern web browser:
```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Or simply open index.html in your browser
```

3. Navigate to `http://localhost:8000`

## 📖 Usage Guide

### Recording Videos

1. **Setup**:
   - Open the Live Stopwatch tab
   - Position your recording devices to capture the stopwatch
   - Ensure the stopwatch is clearly visible in all camera views

2. **Recording**:
   - Click "Start" on the stopwatch
   - Begin recording on all cameras simultaneously
   - Record for at least 10-15 seconds showing the stopwatch
   - Click "Pause" or let the recording continue

### Synchronizing Videos

1. **Upload Videos**:
   - Go to the Video Sync tab
   - Upload your first video as "Video A"
   - Upload your second video as "Video B"

2. **Process**:
   - Click "Process & Synchronize Videos"
   - Wait for the analysis to complete (may take 30-60 seconds)

3. **Review Results**:
   - Check the synchronization offset
   - View detection statistics
   - Use synchronized playback controls
   - Review detected timestamps

## 🎯 Key Features Explained

### ArUco Markers
- Four ArUco markers in corners help identify the stopwatch area
- Automatic ROI (Region of Interest) detection
- Improves OCR accuracy by focusing on the relevant area

### OCR Timestamp Detection
- Extracts time in HH:MM:SS.mmm format
- Handles common OCR errors (O→0, l→1, etc.)
- Processes every 5th frame for efficiency
- Upscales image 3x for better accuracy

### Synchronization Algorithm
1. Detects timestamps in both videos
2. Matches corresponding times (within 100ms tolerance)
3. Calculates median offset for robust synchronization
4. Accounts for different frame rates

## 🔧 Configuration

You can customize various parameters in `app.js`:

```javascript
// Processing parameters
const PROCESS_EVERY_N_FRAMES = 5;  // Process every Nth frame
const MAX_FRAMES_TO_PROCESS = 300; // Maximum frames to analyze
const SYNC_TOLERANCE = 0.1;        // Matching tolerance in seconds

// Display parameters
const MARKER_SIZE = 200;           // ArUco marker size in pixels
const CANVAS_WIDTH = 1200;         // Stopwatch canvas width
const CANVAS_HEIGHT = 800;         // Stopwatch canvas height
```

## 📊 Output Information

The tool provides comprehensive results:

- **Video Statistics**:
  - Duration, FPS, resolution
  - Number of timestamps detected
  - Detection success rate

- **Synchronization Data**:
  - Time offset between videos
  - Offset direction (which video is ahead)
  - Confidence level
  - Number of matching points

- **Verification**:
  - Frame-by-frame timestamp matching
  - Average synchronization error
  - Drift detection over time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Limitations

- OCR accuracy depends on video quality and stopwatch visibility
- Processing time increases with video length
- Browser performance may vary
- Large video files may cause memory issues

## 🔮 Future Enhancements

- [ ] GPU acceleration for faster processing
- [ ] Support for more than 2 videos
- [ ] Export synchronized video
- [ ] Timeline visualization
- [ ] Manual timestamp adjustment
- [ ] Batch processing
- [ ] Mobile app version

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🙏 Acknowledgments

- OpenCV.js for computer vision capabilities
- Tesseract.js for OCR functionality
- ArUco marker library for fiducial markers

---

**Made with ❤️ for synchronized video production**
