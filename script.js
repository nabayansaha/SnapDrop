// DOM Elements
const generateButton = document.getElementById('generateButton');
const qrSection = document.getElementById('qrSection');
const driveLinkInput = document.getElementById('driveLink');
const cameraContainer = document.getElementById('cameraContainer');
const cameraView = document.getElementById('cameraView');
const shutterButton = document.getElementById('shutterButton');
const flash = document.getElementById('flash');
const uploadingOverlay = document.getElementById('uploadingOverlay');

// QR Code Generator
generateButton.addEventListener('click', function() {
    const driveLink = driveLinkInput.value.trim();
    
    if (!driveLink) {
        alert('Please enter a valid Google Drive folder link');
        return;
    }
    
    // Generate a unique session ID
    const sessionId = generateSessionId();
    
    // Create camera link with session ID and drive link (in a real app, encrypt this)
    const cameraLink = `${window.location.href}?session=${sessionId}&drive=${encodeURIComponent(driveLink)}`;
    
    // Generate QR Code
    const qrcode = new QRCode(document.getElementById("qrcode"), {
        text: cameraLink,
        width: 200,
        height: 200,
        colorDark: "#ff5c5c",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Show QR section
    qrSection.style.display = 'block';
    
    // Scroll to QR section
    qrSection.scrollIntoView({ behavior: 'smooth' });
});

// Check if URL has camera session parameters
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    const driveLink = urlParams.get('drive');
    
    if (sessionId && driveLink) {
        // This is a camera session
        startCamera(sessionId, driveLink);
    }
});

// Camera functionality
function startCamera(sessionId, driveLink) {
    // Hide main content and show camera
    document.querySelector('.container').style.display = 'none';
    cameraContainer.style.display = 'block';
    
    // Access camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
            .then(function(stream) {
                cameraView.srcObject = stream;
            })
            .catch(function(error) {
                console.error("Camera error: ", error);
                alert("Could not access camera. Please make sure you've given permission.");
            });
    } else {
        alert("Sorry, your browser doesn't support camera access.");
    }
    
    // Set up camera counter and events
    let photosLeft = 24;
    document.querySelector('.counter').textContent = `${photosLeft} photos left`;
    
    // Add shutter button click event
    shutterButton.addEventListener('click', function() {
        if (photosLeft <= 0) {
            alert("You've used all your photos on this disposable camera!");
            return;
        }
        
        // Create flash effect
        flash.style.opacity = '0.8';
        setTimeout(() => {
            flash.style.opacity = '0';
        }, 150);
        
        // Play shutter sound
        const shutterSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhxQo97100gNChhMltzfrVwVDRIuXY27yKJlKxsVMWusyMmnaC0cDhxEerHY1pJSGwwTM3C42N2kYyYRC2Since9iEM7MzRAKExti5rFz7KMUDIzNdHd5tDIrpV3V0J9Sjxnepa2y9GsimRQTxgWLnGhx9XRs7EfAxAZ0ufizqqA46myj2FQVS5JV15zdoCYua+PAAABBXzF39awgRwAAEnb//3RpIZmT1E4KHR+uODm1J5xIwEVV7v//9upbWNEDAwH6P//96DbsHpFFQACu/39/N2wq6iOdWJJUkBQbnmRs9fkyKGGUCo5PxEPECU9aoOkxO3ppopWLzEZ1v7UqmYxP19xdBIHDZn//+7WvJZpY1lJjrK92LFmBwQQTtL//+fPupEvFTSG5vbu5tDspmMLBGPR7/DewPbmwKaPYpWLZTgFEJWwvZxgJB8rWrn/9t2OTDAHFj3F/+/amkgHDhNm4v/13JJMAw8Y0f//7NfEomcSBovf/fXVrqt5Ti4NFQIxW2yAodHw1oQsDwo6lOXs59PGnGMWDCU+grHZ68+VZzsRH43j6OvWtYxbNS5TVlt1aRgHF1+n0N2/oaB/ZUxfb3+B2//1zKRvKWtbZBMHHVed5e7VsXwohqy+j1cqEgcaWYarv6xVIyozX6iztKAuDRs0/f/xoFsENJK32mA1NzU+esvopVQbANT55cVeDd3jyrZoOf/nt39WvO3jsHUKASXL/O-/1Z1pPB4VJP//9rhs/+7QrFBjZx3//9r/6LJiHBYI2NW8nNjn2rGZgWBXLN3p5MV+EgAKI66ssNrw7NChmgPZSXQwHCJB4P/41pJ4QRYXMXO12O3euY5jPCkpcMLk6NWWNwAINTVdhL3j6cm2jBUADHLQ3NnJpgkMKFTF7OrRrGEEBWSz2NnNpHUGBECls8beymsdCXzT5+TSoV4NEIrQ3OLF/+7CgRIzKf/u4rpYCUzBt87atLFoMTcgQVyboMXk1bOISRwJAK7o2ZNrQBkuSmSElJPR3Ml9Zi4SCpXj3bhkIQ13uswINn7yZhs3ga28lFNBNjcqUYypxbGZck5ES2F0e16cwK2jc1BCNWXCz8i3j3hSTVba//S8ZU9JVPXnolgnN1XBnY9eKTxxgIFSNTY9bWqrc5Z3eXuFfXl2gtXw16dDEw+C0+fYlXBgWB+49jucZKfWrHJoQBkO4v/fsWQSF4PY69mvdXVRHA/N7su3VQhSpuTu0JR2QgwFwP7SqmZCJlKrm313QSw1PlV1jcHbqGQrGK317doFGJjjt4RoMhELTcS9tKM8EgVNzufMoVYmEQRzQzpqc46qu6s3GzVRi7S9rFIGECBExPLmwHcNCB1wvdjBkXJMtM22i1ApN06muL1HKitGa2d9cz4QGDJ6wdq2mVkPHWTAyc+hiYFKN0t5l6+jgFxRTEVIWICpvL+hmoVwSzU7UXqhzNCoeS4VME+Lnd/yy49eMClEj9Tj3rhyORgkS2WIq9Pmw5lZMzFSjOHq376PTUBJXoK4zcekfEctLT5JEwQV4N6wAAATH+b/4rU/EAwrr9bNvHMdIC/g/87CdRpZV3GOpJfnz7Z4TiclMkx4i5ObDgIIF0H/9sRuHBEfRP/3yJtHFQ41m+DoxppmNS5HzejPsFQOGErf69OiYy4tQcPny6FCHkPE7M+jKCVFxPTbuGUhJHf/zqVJLxgOLO7vvp2wXjE54v/NiFM2KxUSVw==');
        shutterSound.play();
        
        // Capture photo from video
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = cameraView.videoWidth;
        canvas.height = cameraView.videoHeight;
        context.drawImage(cameraView, 0, 0, canvas.width, canvas.height);
        
        // Convert to image data
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Show uploading overlay
        uploadingOverlay.style.display = 'flex';
        
        // Simulate upload to Google Drive (in a real app, this would use the Drive API)
        setTimeout(() => {
            console.log(`Photo uploaded to Google Drive folder: ${driveLink}`);
            uploadingOverlay.style.display = 'none';
            
            // Update counter
            photosLeft--;
            document.querySelector('.counter').textContent = `${photosLeft} photos left`;
            
            if (photosLeft <= 0) {
                setTimeout(() => {
                    alert("You've used all your photos on this disposable camera! The photos have been saved to your Google Drive folder.");
                }, 500);
            }
        }, 1500);
    });
}

// Helper function to generate a session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}