// Initialize Supabase
const SUPABASE_URL = 'https://oyjqllqplktgruvebfap.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95anFsbHFwbGt0Z3J1dmViZmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMDU1NDcsImV4cCI6MjA0NzY4MTU0N30.QLaVHoTfK5XmdemfJq--yObvkUr28jWhdoUIKTjTeq8';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper Functions
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star text-2xl"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-2xl"></i>';
        } else {
            stars += '<i class="far fa-star text-2xl"></i>';
        }
    }
    return stars;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function createPerformanceChart(statistics) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    const stats = JSON.parse(statistics);
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Hours Taught', 'Average Rating'],
            datasets: [{
                label: 'Performance Metrics',
                data: [stats.hours_taught, stats.average_rating * 200], // Scale rating for better visualization
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function loadTeacherProfile(teacherId) {
    try {
        // Fetch teacher data
        const { data: teacher, error } = await supabaseClient
            .from('teachers')
            .select('*')
            .eq('id', teacherId)
            .single();

        if (error) throw error;

        // Update UI
        document.getElementById('teacher-image').src = teacher.teacher_image || '/api/placeholder/150/150';
        document.getElementById('teacher-name').textContent = teacher.name;
        document.getElementById('teacher-email').textContent = teacher.email;
        document.getElementById('teacher-phone').textContent = teacher.mobile_number;
        document.getElementById('teacher-department').textContent = teacher.department;
        document.getElementById('start-date').textContent = formatDate(teacher.start_date);
        document.getElementById('students-count').textContent = teacher.students_taught.toLocaleString();

        // Set rating based on teaching statistics
        const teachingStats = JSON.parse(teacher.teaching_statistics);
        document.querySelector('.rating-stars').innerHTML = createStarRating(teachingStats.average_rating);

        // Populate qualifications
        const qualificationsList = document.getElementById('qualifications-list');
        const qualifications = JSON.parse(teacher.qualifications);
        qualifications.forEach((qual, index) => {
            const li = document.createElement('div');
            li.className = 'achievement-card p-4 bg-gray-50 rounded-lg animate__animated animate__fadeInLeft';
            li.style.animationDelay = `${index * 0.2}s`;
            li.innerHTML = `
                <div class="flex items-center justify-between">
                    <h4 class="font-bold text-gray-800">${qual.degree}</h4>
                    <span class="text-sm text-indigo-600">
                        ${qual.year}
                    </span>
                </div>
                <p class="text-gray-600 mt-2">${qual.institution}</p>
            `;
            qualificationsList.appendChild(li);
        });

        // Populate expertise tags
        const expertiseTags = document.getElementById('expertise-tags');
        const expertise = JSON.parse(teacher.expertise);
        expertise.forEach((area, index) => {
            const tag = document.createElement('span');
            tag.className = 'expertise-tag px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm animate__animated animate__fadeIn';
            tag.style.animationDelay = `${index * 0.1}s`;
            tag.innerHTML = `
                <i class="fas fa-check-circle mr-1"></i>
                ${area}
            `;
            expertiseTags.appendChild(tag);
        });

        // Populate weekly schedule
        const scheduleGrid = document.getElementById('schedule-grid');
        const weeklySchedule = JSON.parse(teacher.weekly_schedule);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        days.forEach(day => {
            const daySchedule = weeklySchedule[day] || 'No schedule';
            const dayDiv = document.createElement('div');
            dayDiv.className = 'schedule-slot p-4 bg-gray-50 rounded-lg';
            dayDiv.innerHTML = `
                <h4 class="font-bold text-gray-800 mb-2">${day}</h4>
                <div class="text-sm p-2 bg-white rounded shadow-sm">
                    <i class="fas fa-clock text-indigo-600 mr-1"></i>
                    ${daySchedule}
                </div>
            `;
            scheduleGrid.appendChild(dayDiv);
        });

        // Populate achievements
        const achievementsList = document.getElementById('achievements-list');
        const achievements = teacher.achievements.split(';');
        achievements.forEach((achievement, index) => {
            const div = document.createElement('div');
            div.className = 'achievement-card p-4 bg-gray-50 rounded-lg animate__animated animate__fadeInRight';
            div.style.animationDelay = `${index * 0.2}s`;
            div.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-trophy text-yellow-500 mr-3"></i>
                    <p class="text-gray-800">${achievement.trim()}</p>
                </div>
            `;
            achievementsList.appendChild(div);
        });

        // Create performance chart
        if (teacher.teaching_statistics) {
            createPerformanceChart(teacher.teaching_statistics);
        }

        // Show content and hide loading
        document.getElementById('loading').classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').classList.remove('hidden');
            document.getElementById('content').classList.add('animate__animated', 'animate__fadeIn');
        }, 500);

    } catch (error) {
        console.error('Error loading teacher profile:', error);
        alert('Error loading teacher profile. Please try again.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the profile with the teacher ID
    const teacherId = '08936058-e39e-4acb-9b50-cb6edf262df5'; // Your provided teacher ID
    loadTeacherProfile(teacherId);
});