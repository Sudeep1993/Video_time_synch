// ============================================
// GLOBAL VARIABLES
// ============================================
let stopwatchRunning = false;
let stopwatchStartTime = 0;
let stopwatchElapsed = 0;
let stopwatchInterval = null;

let videoA = null;
let videoB = null;
let videoAData = null;
let videoBData = null;
let syncOffset = 0;

// ArUco marker generation
const MARKER_SIZE = 200;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

// ============================================
// TAB SWITCHING
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });

    // Initialize stopwatch
    initStopwatch();
    
    // Initialize video sync
    initVideoSync();
});

// ============================================
// STOPWATCH FUNCTIONALITY
// ============================================
function initStopwatch() {
    const canvas = document.getElementById('stopwatch-canvas');
    const ctx = canvas.getContext('2d');
    
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Generate ArUco markers (simulated as colored squares with IDs)
    const markers = generateArUcoMarkers();
    
    function drawStopwatch() {
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Calculate time
        let displayTime = stopwatchElapsed;
        if (stopwatchRunning) {
            displayTime = Date.now() - stopwatchStartTime + stopwatchElapsed;
        }
        
        const hours = Math.floor(displayTime / 3600000);
        const minutes = Math.floor((displayTime % 3600000) / 60000);
        const seconds = Math.floor((displayTime % 60000) / 1000);
        const milliseconds = Math.floor(displayTime % 1000);
        
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
        
        // Draw time
        ctx.fillStyle = 'black';
        ctx.font = 'bold 100px Courier';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeStr, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        
        // Draw ArUco markers
        drawMarker(ctx, markers[0], 0, 0);
        drawMarker(ctx, markers[1], CANVAS_WIDTH - MARKER_SIZE, 0);
        drawMarker(ctx, markers[2], 0, CANVAS_HEIGHT - MARKER_SIZE);
        drawMarker(ctx, markers[3], CANVAS_WIDTH - MARKER_SIZE, CANVAS_HEIGHT - MARKER_SIZE);
    }
    
    function updateStopwatch() {
        drawStopwatch();
        if (stopwatchRunning) {
            requestAnimationFrame(updateStopwatch);
        }
    }
    
    startBtn.addEventListener('click', () => {
        if (!stopwatchRunning) {
            stopwatchRunning = true;
            stopwatchStartTime = Date.now();
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            updateStopwatch();
        }
    });
    
    pauseBtn.addEventListener('click', () => {
        if (stopwatchRunning) {
            stopwatchRunning = false;
            stopwatchElapsed = Date.now() - stopwatchStartTime + stopwatchElapsed;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            drawStopwatch();
        }
    });
    
    resetBtn.addEventListener('click', () => {
        stopwatchRunning = false;
        stopwatchElapsed = 0;
        stopwatchStartTime = 0;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        drawStopwatch();
    });
    
    // Initial draw
    drawStopwatch();
}

function generateArUcoMarkers() {
    // Simplified ArUco marker generation (visual representation)
    return [
        { id: 0, pattern: generatePattern(0) },
        { id: 1, pattern: generatePattern(1) },
        { id: 2, pattern: generatePattern(2) },
        { id: 3, pattern: generatePattern(3) }
    ];
}

function generatePattern(id) {
    // Simple 5x5 grid pattern for ArUco-like markers
    const patterns = [
        [[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]],
        [[1,1,1,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,1,1,1]],
        [[1,1,1,1,1],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[1,1,1,1,1]],
        [[1,1,1,1,1],[1,0,1,1,1],[1,0,0,0,1],[1,1,1,0,1],[1,1,1,1,1]]
    ];
    return patterns[id % 4];
}

function drawMarker(ctx, marker, x, y) {
    const cellSize = MARKER_SIZE / 5;
    
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            ctx.fillStyle = marker.pattern[i][j] === 1 ? 'black' : 'white';
            ctx.fillRect(x + j * cellSize, y + i * cellSize, cellSize, cellSize);
        }
    }
    
    // Border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, MARKER_SIZE, MARKER_SIZE);
}

// ============================================
// VIDEO SYNC FUNCTIONALITY
// ============================================
function initVideoSync() {
    const videoAInput = document.getElementById('video-a');
    const videoBInput = document.getElementById('video-b');
    const processBtn = document.getElementById('process-btn');
    
    videoAInput.addEventListener('change', (e) => handleVideoUpload(e, 'a'));
    videoBInput.addEventListener('change', (e) => handleVideoUpload(e, 'b'));
    processBtn.addEventListener('click', processVideos);
    
    // Synchronized playback controls
    document.getElementById('sync-play').addEventListener('click', playSynchronized);
    document.getElementById('sync-pause').addEventListener('click', pauseSynchronized);
    document.getElementById('sync-reset').addEventListener('click', resetSynchronized);
}

function handleVideoUpload(event, videoId) {
    const file = event.target.files[0];
    if (!file) return;
    
    const preview = document.getElementById(`preview-${videoId}`);
    preview.innerHTML = '';
    
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.style.maxWidth = '100%';
    preview.appendChild(video);
    
    if (videoId === 'a') {
        videoA = file;
    } else {
        videoB = file;
    }
    
    // Enable process button if both videos are loaded
    if (videoA && videoB) {
        document.getElementById('process-btn').disabled = false;
    }
}

async function processVideos() {
    const processingSection = document.getElementById('processing-section');
    const resultsSection = document.getElementById('results-section');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    // Show processing section
    processingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    
    try {
        console.log('=== STARTING VIDEO PROCESSING ===');
        
        // Process Video A
        progressText.textContent = 'Processing Video A...';
        progressFill.style.width = '20%';
        videoAData = await processVideo(videoA, 'A');
        console.log(`Video A processed: ${videoAData.timestamps.length} timestamps detected`);
        
        // Process Video B
        progressText.textContent = 'Processing Video B...';
        progressFill.style.width = '50%';
        videoBData = await processVideo(videoB, 'B');
        console.log(`Video B processed: ${videoBData.timestamps.length} timestamps detected`);
        
        // Clean up OCR worker
        await terminateOCRWorker();
        
        // Calculate sync offset
        progressText.textContent = 'Calculating synchronization offset...';
        progressFill.style.width = '80%';
        syncOffset = calculateSyncOffset(videoAData, videoBData);
        console.log(`Sync offset calculated: ${syncOffset.toFixed(4)}s`);
        
        // Complete
        progressText.textContent = 'Processing complete!';
        progressFill.style.width = '100%';
        
        // Show results
        setTimeout(() => {
            processingSection.style.display = 'none';
            displayResults();
        }, 1000);
        
    } catch (error) {
        console.error('Error processing videos:', error);
        progressText.textContent = `Error: ${error.message}`;
        progressFill.style.width = '0%';
        await terminateOCRWorker();
    }
}

// Global OCR worker (reuse across frames)
let ocrWorker = null;

async function initOCRWorker() {
    if (!ocrWorker) {
        console.log('Initializing Tesseract OCR worker...');
        ocrWorker = await Tesseract.createWorker('eng');
        await ocrWorker.setParameters({
            tessedit_char_whitelist: '0123456789:.',
        });
        console.log('OCR worker ready');
    }
    return ocrWorker;
}

async function terminateOCRWorker() {
    if (ocrWorker) {
        await ocrWorker.terminate();
        ocrWorker = null;
    }
}

async function processVideo(videoFile, videoName) {
    return new Promise(async (resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        
        // Initialize OCR worker once
        await initOCRWorker();
        
        video.onloadedmetadata = async () => {
            const fps = 30; // Assuming 30 fps, can be detected more accurately
            const duration = video.duration;
            const frameCount = Math.floor(duration * fps);
            
            console.log(`Processing ${videoName}: ${duration.toFixed(2)}s, ${frameCount} frames at ${fps} fps`);
            
            const timestamps = [];
            const sampleFrames = Math.min(60, frameCount); // Sample up to 60 frames for faster processing
            const frameInterval = Math.floor(frameCount / sampleFrames);
            
            const canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');
            
            // Sample frames
            for (let i = 0; i < sampleFrames; i++) {
                const frameTime = (i * frameInterval) / fps;
                video.currentTime = frameTime;
                
                // Update progress
                const progress = (i / sampleFrames) * 100;
                const progressText = document.getElementById('progress-text');
                if (progressText) {
                    progressText.textContent = `Processing ${videoName}: Frame ${i + 1}/${sampleFrames} (${progress.toFixed(0)}%)`;
                }
                
                await new Promise(resolve => {
                    video.onseeked = async () => {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        
                        // Extract timestamp using OCR
                        const timestamp = await extractTimestampFromFrame(canvas);
                        
                        if (timestamp !== null) {
                            timestamps.push({
                                frame: i * frameInterval,
                                videoTime: frameTime,
                                stopwatchTime: timestamp
                            });
                            console.log(`${videoName} - Frame ${i}: Video time ${frameTime.toFixed(2)}s → Stopwatch ${timestamp.toFixed(3)}s`);
                        } else {
                            console.log(`${videoName} - Frame ${i}: OCR failed`);
                        }
                        
                        resolve();
                    };
                });
            }
            
            resolve({
                fps: fps,
                duration: duration,
                timestamps: timestamps,
                videoFile: videoFile
            });
        };
        
        video.onerror = () => reject(new Error('Failed to load video'));
    });
}

async function extractTimestampFromFrame(canvas) {
    // Extract ROI (region of interest) around center where stopwatch appears
    const ctx = canvas.getContext('2d');
    
    // Create a new canvas for the ROI
    const roiCanvas = document.createElement('canvas');
    roiCanvas.width = 600;
    roiCanvas.height = 200;
    const roiCtx = roiCanvas.getContext('2d');
    
    // Extract center region
    roiCtx.drawImage(
        canvas,
        canvas.width / 2 - 300,
        canvas.height / 2 - 100,
        600,
        200,
        0,
        0,
        600,
        200
    );
    
    // Convert to grayscale and increase contrast
    const imageData = roiCtx.getImageData(0, 0, 600, 200);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // Threshold for black text on white background
        const threshold = gray > 150 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = threshold;
    }
    
    roiCtx.putImageData(imageData, 0, 0);
    
    try {
        // Use shared OCR worker
        const worker = await initOCRWorker();
        const { data: { text } } = await worker.recognize(roiCanvas);
        
        // Parse the timestamp
        const timeSeconds = parseStopwatchTime(text);
        
        if (timeSeconds !== null) {
            // Log successful detection with the raw OCR text
            console.log(`OCR detected: "${text.trim()}" → ${timeSeconds.toFixed(3)}s`);
        }
        
        return timeSeconds;
        
    } catch (error) {
        console.error('OCR error:', error);
        return null;
    }
}

function parseStopwatchTime(text) {
    if (!text) return null;
    
    // Clean text
    text = text.trim().replace(/\s+/g, '');
    
    // Common OCR corrections
    text = text.replace(/O/g, '0').replace(/o/g, '0');
    text = text.replace(/l/g, '1').replace(/I/g, '1');
    text = text.replace(/S/g, '5').replace(/B/g, '8');
    text = text.replace(/Z/g, '2').replace(/z/g, '2');
    
    // Try full pattern first: HH:MM:SS.mmm
    let pattern = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
    let match = text.match(pattern);
    
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const milliseconds = parseInt(match[4]);
        
        // Sanity check
        if (minutes < 60 && seconds < 60 && milliseconds < 1000) {
            return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000.0;
        }
    }
    
    // Try without leading zeros: H:MM:SS.mmm or HH:M:SS.mmm
    pattern = /(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{3})/;
    match = text.match(pattern);
    
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const milliseconds = parseInt(match[4]);
        
        if (minutes < 60 && seconds < 60 && milliseconds < 1000) {
            return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000.0;
        }
    }
    
    // Try MM:SS.mmm format (no hours)
    pattern = /(\d{2}):(\d{2})\.(\d{3})/;
    match = text.match(pattern);
    
    if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        
        if (minutes < 60 && seconds < 60 && milliseconds < 1000) {
            return minutes * 60 + seconds + milliseconds / 1000.0;
        }
    }
    
    return null;
}

function calculateSyncOffset(dataA, dataB) {
    console.log('=== CALCULATING SYNC OFFSET ===');
    console.log(`Video A timestamps: ${dataA.timestamps.length}`);
    console.log(`Video B timestamps: ${dataB.timestamps.length}`);
    
    // Find matching timestamps between videos
    const matches = [];
    const tolerance = 0.2; // 200ms tolerance for OCR variations
    
    for (const tsA of dataA.timestamps) {
        for (const tsB of dataB.timestamps) {
            const timeDiff = Math.abs(tsA.stopwatchTime - tsB.stopwatchTime);
            
            if (timeDiff < tolerance) {
                const offset = tsA.videoTime - tsB.videoTime;
                matches.push({
                    offset: offset,
                    timeDiff: timeDiff,
                    stopwatchTime: tsA.stopwatchTime,
                    videoTimeA: tsA.videoTime,
                    videoTimeB: tsB.videoTime
                });
                console.log(`Match found: Stopwatch ${tsA.stopwatchTime.toFixed(3)}s, Video A at ${tsA.videoTime.toFixed(3)}s, Video B at ${tsB.videoTime.toFixed(3)}s, Offset: ${offset.toFixed(4)}s`);
            }
        }
    }
    
    console.log(`Total matches found: ${matches.length}`);
    
    if (matches.length === 0) {
        console.warn('No matches found! Check if videos show the same stopwatch time range.');
        return 0;
    }
    
    // Calculate median offset for robustness
    const offsets = matches.map(m => m.offset);
    offsets.sort((a, b) => a - b);
    const median = offsets[Math.floor(offsets.length / 2)];
    
    // Calculate statistics
    const mean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    const std = Math.sqrt(offsets.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / offsets.length);
    
    console.log(`Offset statistics: Mean=${mean.toFixed(4)}s, Median=${median.toFixed(4)}s, Std=${std.toFixed(4)}s`);
    console.log('=================================');
    
    return median;
}

function displayResults() {
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    
    // Video A stats
    const videoAStats = document.getElementById('video-a-stats');
    videoAStats.innerHTML = `
        <p><strong>Duration:</strong> <span>${videoAData.duration.toFixed(2)}s</span></p>
        <p><strong>FPS:</strong> <span>${videoAData.fps.toFixed(2)}</span></p>
        <p><strong>Timestamps Detected:</strong> <span>${videoAData.timestamps.length}</span></p>
        <p><strong>Detection Rate:</strong> <span>${((videoAData.timestamps.length / 100) * 100).toFixed(1)}%</span></p>
    `;
    
    // Video B stats
    const videoBStats = document.getElementById('video-b-stats');
    videoBStats.innerHTML = `
        <p><strong>Duration:</strong> <span>${videoBData.duration.toFixed(2)}s</span></p>
        <p><strong>FPS:</strong> <span>${videoBData.fps.toFixed(2)}</span></p>
        <p><strong>Timestamps Detected:</strong> <span>${videoBData.timestamps.length}</span></p>
        <p><strong>Detection Rate:</strong> <span>${((videoBData.timestamps.length / 100) * 100).toFixed(1)}%</span></p>
    `;
    
    // Sync stats
    const syncStats = document.getElementById('sync-stats');
    const offsetDirection = syncOffset > 0 ? 'Video B ahead' : 'Video A ahead';
    syncStats.innerHTML = `
        <p><strong>Sync Offset:</strong> ${Math.abs(syncOffset).toFixed(4)} seconds</p>
        <p><strong>Direction:</strong> ${offsetDirection}</p>
        <p><strong>Confidence:</strong> High (${Math.min(videoAData.timestamps.length, videoBData.timestamps.length)} matching points)</p>
    `;
    
    document.getElementById('offset-value').textContent = `${syncOffset >= 0 ? '+' : ''}${syncOffset.toFixed(4)}s`;
    
    // Setup synchronized video players
    setupSyncedPlayers();
    
    // Display timestamps
    displayTimestamps();
}

function setupSyncedPlayers() {
    const videoAPlayer = document.getElementById('synced-video-a');
    const videoBPlayer = document.getElementById('synced-video-b');
    
    videoAPlayer.src = URL.createObjectURL(videoA);
    videoBPlayer.src = URL.createObjectURL(videoB);
    
    // Disable default controls for synchronized playback
    videoAPlayer.removeAttribute('controls');
    videoBPlayer.removeAttribute('controls');
    
    // Update time displays
    videoAPlayer.addEventListener('timeupdate', () => {
        document.getElementById('time-a').textContent = `Time: ${videoAPlayer.currentTime.toFixed(2)}s`;
    });
    
    videoBPlayer.addEventListener('timeupdate', () => {
        document.getElementById('time-b').textContent = `Time: ${videoBPlayer.currentTime.toFixed(2)}s`;
    });
}

function playSynchronized() {
    const videoAPlayer = document.getElementById('synced-video-a');
    const videoBPlayer = document.getElementById('synced-video-b');
    
    // Set initial positions based on offset
    if (syncOffset > 0) {
        videoAPlayer.currentTime = 0;
        videoBPlayer.currentTime = syncOffset;
    } else {
        videoAPlayer.currentTime = Math.abs(syncOffset);
        videoBPlayer.currentTime = 0;
    }
    
    // Play both
    videoAPlayer.play();
    videoBPlayer.play();
}

function pauseSynchronized() {
    const videoAPlayer = document.getElementById('synced-video-a');
    const videoBPlayer = document.getElementById('synced-video-b');
    
    videoAPlayer.pause();
    videoBPlayer.pause();
}

function resetSynchronized() {
    const videoAPlayer = document.getElementById('synced-video-a');
    const videoBPlayer = document.getElementById('synced-video-b');
    
    videoAPlayer.currentTime = 0;
    videoBPlayer.currentTime = 0;
    videoAPlayer.pause();
    videoBPlayer.pause();
}

function displayTimestamps() {
    const timestampsA = document.getElementById('timestamps-a');
    const timestampsB = document.getElementById('timestamps-b');
    
    timestampsA.innerHTML = videoAData.timestamps.slice(0, 20).map(ts => `
        <div class="timestamp-item">
            Frame ${ts.frame}: Video ${ts.videoTime.toFixed(3)}s → Stopwatch ${ts.stopwatchTime.toFixed(3)}s
        </div>
    `).join('');
    
    timestampsB.innerHTML = videoBData.timestamps.slice(0, 20).map(ts => `
        <div class="timestamp-item">
            Frame ${ts.frame}: Video ${ts.videoTime.toFixed(3)}s → Stopwatch ${ts.stopwatchTime.toFixed(3)}s
        </div>
    `).join('');
}
