let qrCode = null;
let timer = null;
const TIMER_DURATION = 30 * 60; // 30 minutes in seconds

function generateQRCode() {
	// Clear existing QR code
	const container = document.getElementById('qrCodeContainer');
	container.innerHTML = '';
	
	// Generate random session ID
	const sessionId = Math.random().toString(36).substring(2, 15);
	const timestamp = new Date().getTime();
	const studentId = 'AC2023001'; // This would come from user session
	
	// Create QR code data
	const qrData = JSON.stringify({
		sessionId,
		timestamp,
		studentId,
		type: 'attendance'
	});
	
	// Generate QR code
	qrCode = new QRCode(container, {
		text: qrData,
		width: 256,
		height: 256,
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: QRCode.CorrectLevel.H
	});
	
	// Start timer
	startTimer();
}

function startTimer() {
	let timeLeft = TIMER_DURATION;
	const timerDisplay = document.getElementById('timer');
	
	// Clear existing timer
	if (timer) {
		clearInterval(timer);
	}
	
	// Update timer every second
	timer = setInterval(() => {
		const minutes = Math.floor(timeLeft / 60);
		const seconds = timeLeft % 60;
		
		timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		
		if (timeLeft <= 0) {
			clearInterval(timer);
			document.getElementById('qrCodeContainer').innerHTML = '<p class="text-danger">QR Code expired. Generate a new one.</p>';
		}
		
		timeLeft--;
	}, 1000);
}

// Generate QR code on page load
window.onload = function() {
	const generateBtn = document.querySelector('button[onclick="generateQRCode()"]');
	if (generateBtn) {
		generateQRCode();
	}
};