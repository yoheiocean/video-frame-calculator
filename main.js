const videoInput = document.getElementById('videoInput');
const videoPlayer = document.getElementById('videoPlayer');
const fpsInput = document.getElementById('fpsInput');
const totalFramesDisplay = document.getElementById('totalFramesDisplay');
const frameNumberInput = document.getElementById('frameNumberInput');
const nextFrameButton = document.getElementById('nextFrameButton');
const timeDisplay = document.getElementById('timeDisplay');
const link = document.getElementById('link');

function chooseAndUpload() {
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    // Reset inputs and time display
    fpsInput.value = '';  // Set to empty string or default value
    totalFramesDisplay.textContent = ''; // Clear frame display
    frameNumberInput.value = '';  // Set to empty string or default value
    timeDisplay.textContent = '';  // Clear time display

    // Trigger the file input click programmatically
    videoInput.click();

    // Update the file name display when a file is chosen
    videoInput.addEventListener('change', function() {
        const selectedFile = this.files[0];
        if (selectedFile) {
            fileNameDisplay.textContent = `Selected File: ${selectedFile.name}`;

            // Automatically trigger the upload process
            uploadVideo(selectedFile, videoPlayer);
            // Extract and set the frame rate using mediainfo.js
            extractFrameRate(selectedFile);
        } else {
            fileNameDisplay.textContent = 'No file selected';
        }
    });
}

function uploadVideo(file, videoPlayer) {
    const videoUrl = URL.createObjectURL(file);
    videoPlayer.src = videoUrl;

    // Show the video player
    videoPlayer.style.display = 'block';
    // Show the link below the video player
    link.style.display = 'block';
}

function extractFrameRate(file) {
    const getSize = () => file.size;
    const readChunk = (chunkSize, offset) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target.error) {
                    reject(event.target.error);
                }
                resolve(new Uint8Array(event.target.result));
            };
            reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
        });

    MediaInfo({ format: 'text' }, (mediainfo) => {
        mediainfo
        .analyzeData(getSize, readChunk)
        .then((result) => {
            console.log('MediaInfo Result:', result);  // Log the entire result
    
            // Extract frame rate from the Video section
            const frameRateMatch = result.match(/Frame rate\s+:\s+(\d+\.\d+) FPS/);
            const frameRate = frameRateMatch ? parseFloat(frameRateMatch[1]) : null;
            console.log('Original Frame rate:', frameRate);
    
            if (frameRate !== null) {
                // Round the frame rate to the 100th place
                const roundedFrameRate = parseFloat(frameRate.toFixed(2));
                console.log('Rounded Frame rate:', roundedFrameRate);
    
                // Set the extracted frame rate to the fpsInput
                fpsInput.value = roundedFrameRate;
                // Calculate and display total frames dynamically
                calculateTotalFrames();
            } else {
                console.log('Frame rate not found in the result.');
            }
        })
        .catch((error) => {
            console.error(`An error occurred while extracting frame rate: ${error.stack}`);
        });
    
    });
}

//The (i) button tool tip
function showTooltip() {
    document.getElementById("tooltip").style.display = "block";
}

function hideTooltip() {
    document.getElementById("tooltip").style.display = "none";
}

//The (i) button tool tip for mobile devices
function showTooltipMobile() {
    document.getElementById("tooltip").style.display = "block";
}

function hideTooltipMobile() {
    document.getElementById("tooltip").style.display = "none";
}

// Add an event listener to the FPS input
fpsInput.addEventListener('input', function() {
    calculateTotalFrames();
});

// Add an event listener to the next frame button
nextFrameButton.addEventListener('click', nextFrame);

function nextFrame(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const fps = parseFloat(fpsInput.value);
    const totalFrames = Math.ceil(videoPlayer.duration * fps);
    const currentFrame = parseInt(frameNumberInput.value) || 0;
    if (totalFrames > currentFrame) {
    frameNumberInput.value = currentFrame + 1;
  
    // Trigger the calculateTime function
    calculateTime();
    }
  }

function calculateTime() {
    const fps = parseFloat(fpsInput.value);
    const totalFrames = Math.ceil(videoPlayer.duration * fps);
    const frameNumber = parseInt(frameNumberInput.value);

    if (!isNaN(fps) && !isNaN(frameNumber) && fps > 0 && frameNumber >= 0 && totalFrames >= frameNumber) {
        const timeInSeconds = frameNumber / fps;
        const formattedTime = timeInSeconds.toFixed(3);

        // Set the time display
        timeDisplay.innerHTML = `Time at Frame #${frameNumber} (of ${totalFrames}): <br><span class="formatted-time">${formattedTime} seconds</span>`;

        // Set the video to the calculated time
        const adjustedTime = formattedTime - 0.01; // To avoid getting time exactly at frame transition.
        videoPlayer.currentTime = adjustedTime;

        // For mobile devices, trigger video playback after setting currentTime
        if (isMobileDevice()) {
            videoPlayer.play();
            // Pause the video after a 30 ms delay (adjust as needed)
            setTimeout(() => {
                videoPlayer.pause();
            }, 30);
        }

        // Calculate and display the total number of frames
        totalFramesDisplay.textContent = `Total Frames: ${totalFrames}`;
    } else {
        timeDisplay.innerHTML = `<span class="error">Invalid input. Please enter valid numbers for FPS and Frame #.</span>`;
    }
}

// Helper function to check if the device is a mobile device
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Add a function to calculate and display the total number of frames dynamically
function calculateTotalFrames() {
    const fps = parseFloat(fpsInput.value);

    if (!isNaN(fps) && fps > 0 && videoPlayer.duration) {
        const totalFrames = Math.ceil(videoPlayer.duration * fps);
        totalFramesDisplay.textContent = `Total Frames: ${totalFrames}`;
    } else {
        // Clear the total frames display if input is invalid
        totalFramesDisplay.textContent = '';
    }
}