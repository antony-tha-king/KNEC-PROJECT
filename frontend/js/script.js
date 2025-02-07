// JavaScript for handling API calls and functionalities

// Handle login form role selection and display appropriate fields
document.addEventListener('DOMContentLoaded', function() {
    const userRole = document.getElementById('userRole');
    const loginForm = document.getElementById('loginForm');
    const roleFields = document.querySelectorAll('.roleFields');

    if (userRole) {
        userRole.addEventListener('change', function() {
            // Hide all role-specific fields
            roleFields.forEach(field => field.style.display = 'none');

            // Show fields for selected role
            const selectedRole = this.value;
            const selectedFields = document.getElementById(selectedRole + 'Fields');
            if (selectedFields) {
                selectedFields.style.display = 'block';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const selectedRole = userRole.value;
            let credentials = {};

            // Get credentials based on role
            switch(selectedRole) {
                case 'student':
                    credentials = {
                        admissionNumber: document.getElementById('admissionNumber').value,
                        password: document.getElementById('studentPassword').value
                    };
                    break;
                case 'teacher':
                    credentials = {
                        registrationNumber: document.getElementById('registrationNumber').value,
                        password: document.getElementById('teacherPassword').value
                    };
                    break;
                case 'staff':
                    credentials = {
                        staffNumber: document.getElementById('staffNumber').value,
                        password: document.getElementById('staffPassword').value
                    };
                    break;
            }

            // Redirect based on role (temporary, should be replaced with actual authentication)
            if (selectedRole === 'student') {
                window.location.href = 'pages/student_portal.html';
            } else if (selectedRole === 'teacher') {
                window.location.href = 'pages/teacher_portal.html';
            } else if (selectedRole === 'staff') {
                window.location.href = 'pages/admin_dashboard.html';
            }
        });
    }

    // Remember me functionality
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        // Check if there's a saved role
        const savedRole = localStorage.getItem('userRole');
        if (savedRole) {
            userRole.value = savedRole;
            // Trigger change event to show appropriate fields
            const event = new Event('change');
            userRole.dispatchEvent(event);
        }

        rememberMe.addEventListener('change', function() {
            if (this.checked) {
                localStorage.setItem('userRole', userRole.value);
            } else {
                localStorage.removeItem('userRole');
            }
        });
    }
});

// Handle carousel autoplay
$(document).ready(function() {
    // Initialize the carousel
    $('.carousel').carousel({
        interval: 5000
    });

    // Initialize testimonial carousel
    $('.testimonial-carousel').owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        dots: true,
        loop: true,
        items: 1
    });
});

// Function to handle student registration
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const admissionNumber = document.getElementById('admissionNumber').value;
    const password = document.getElementById('password').value;

    // API call to register the student
    fetch('/api/students/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, admissionNumber, password }),
    })
    .then(response => response.json())
    .then(data => {
        alert('Registration successful!');
        // Redirect to student portal or handle success
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

// Function to generate QR code for attendance
function generateQRCode(classId) {
    // API call to generate QR code
    fetch(`/api/attendance/generateQRCode?classId=${classId}`)
    .then(response => response.json())
    .then(data => {
        // Display QR code on the page
        const qrCodeContainer = document.getElementById('attendance');
        qrCodeContainer.innerHTML = `<img src="${data.qrCodeUrl}" alt="QR Code">`;
    })
    .catch((error) => {
        console.error('Error generating QR code:', error);
    });
}

// Additional functions for chat and other functionalities can be added here
