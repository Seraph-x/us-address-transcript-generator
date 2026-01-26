/**
 * Main Application Module
 * Combines all modules and handles UI interactions
 */

const App = {
    currentAddress: null,
    currentSchool: null,
    currentTranscript: null,
    courses: [],

    // Initialize the application
    async init() {
        // Initialize modules
        TranscriptGenerator.init();
        await SchoolMatcher.init();

        // Populate state dropdown
        this.populateStateDropdown();

        // Populate semester dropdown
        this.populateSemesterDropdown();

        // Populate course dropdowns
        this.populateCourseDropdowns();

        // Bind event listeners
        this.bindEvents();

        // Generate initial data
        this.generateAddress();
    },

    // Populate state dropdown with US states only
    populateStateDropdown() {
        const select = document.getElementById('stateSelect');
        if (!select) return;

        const states = AddressGenerator.getStates();
        select.innerHTML = '<option value="">随机选择州 (Random State)</option>';

        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state.code;
            option.textContent = `${state.name} (${state.code})`;
            select.appendChild(option);
        });
    },

    // Populate semester dropdown
    populateSemesterDropdown() {
        const select = document.getElementById('termSelect');
        if (!select) return;

        const semesters = TranscriptGenerator.getSemesters();
        select.innerHTML = '';

        semesters.forEach(sem => {
            const option = document.createElement('option');
            option.value = sem.value;
            option.textContent = sem.label;
            select.appendChild(option);
        });

        // Default to current or recent semester
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentSeason = now.getMonth() >= 7 ? 'fall' : 'spring';
        const defaultValue = `${currentYear}-${currentSeason}`;

        if (select.querySelector(`option[value="${defaultValue}"]`)) {
            select.value = defaultValue;
        }
    },

    // Populate course dropdowns
    populateCourseDropdowns() {
        // Grade dropdown
        const gradeSelect = document.getElementById('gradeSelect');
        if (gradeSelect) {
            gradeSelect.innerHTML = '';
            TranscriptGenerator.getGrades().forEach(grade => {
                const option = document.createElement('option');
                option.value = grade;
                option.textContent = grade;
                gradeSelect.appendChild(option);
            });
        }

        // Level dropdown
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) {
            levelSelect.innerHTML = '';
            TranscriptGenerator.getLevels().forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = level;
                levelSelect.appendChild(option);
            });
        }
    },

    // Bind event listeners
    bindEvents() {
        // Generate address button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateAddress());
        }

        // Add course button
        const addCourseBtn = document.getElementById('addCourseBtn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', () => this.addCourse());
        }

        // Remove last course button
        const removeCourseBtn = document.getElementById('removeCourseBtn');
        if (removeCourseBtn) {
            removeCourseBtn.addEventListener('click', () => this.removeLastCourse());
        }

        // Download PDF button
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => this.downloadPDF());
        }

        // Generate sample courses button
        const generateSampleBtn = document.getElementById('generateSampleBtn');
        if (generateSampleBtn) {
            generateSampleBtn.addEventListener('click', () => this.generateSampleCourses());
        }

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyToClipboard(e.target));
        });
    },

    // Generate new address and match school
    // NEW: Reverse matching - select school first, then generate matching address
    generateAddress() {
        const stateSelect = document.getElementById('stateSelect');
        const selectedState = stateSelect ? stateSelect.value : null;

        // Step 1: Select a school first (by state or random)
        let school = null;
        if (selectedState) {
            // Get schools from selected state
            const stateSchools = SchoolMatcher.getSchoolsByState(selectedState);
            if (stateSchools.length > 0) {
                school = stateSchools[Math.floor(Math.random() * stateSchools.length)];
            }
        }

        // Fallback: get random school from all available
        if (!school && SchoolMatcher.schools.length > 0) {
            school = SchoolMatcher.schools[Math.floor(Math.random() * SchoolMatcher.schools.length)];
        }

        // Step 2: Generate address matching the school's location
        if (school) {
            this.currentAddress = AddressGenerator.generateForSchool(school);
            this.currentSchool = {
                name: school.name,
                address: school.address,
                city: school.city,
                state: school.state,
                zip: school.zip,
                phone: school.phone,
                fullAddress: `${school.address}, ${school.city}, ${school.state} ${school.zip}`
            };
        } else {
            // Fallback if no schools available
            this.currentAddress = AddressGenerator.generate(selectedState || null);
            this.currentSchool = SchoolMatcher.match(this.currentAddress);
        }

        // Update UI
        this.updateAddressDisplay();
        this.updateSchoolDisplay();
        this.updateTranscriptPreview();

        // Add animation
        const addressCard = document.querySelector('.address-card');
        if (addressCard) {
            addressCard.classList.remove('animate-in');
            void addressCard.offsetWidth; // Trigger reflow
            addressCard.classList.add('animate-in');
        }
    },

    // Update address display
    updateAddressDisplay() {
        if (!this.currentAddress) return;

        const fields = {
            'displayName': this.currentAddress.name,
            'displayGender': this.currentAddress.gender === 'male' ? '男 (Male)' : '女 (Female)',
            'displayAddress': this.currentAddress.fullAddress,
            'displayPhone': this.currentAddress.phone,
            'displayDob': this.currentAddress.dateOfBirth
        };

        Object.entries(fields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    },

    // Update school display
    updateSchoolDisplay() {
        if (!this.currentSchool) return;

        const fields = {
            'displaySchoolName': this.currentSchool.name,
            'displaySchoolAddress': this.currentSchool.fullAddress,
            'displaySchoolPhone': this.currentSchool.phone
        };

        Object.entries(fields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    },

    // Add a course
    addCourse() {
        const term = document.getElementById('termSelect')?.value;
        const code = document.getElementById('courseCode')?.value || this.generateCourseCode();
        const name = document.getElementById('courseName')?.value;
        const grade = document.getElementById('gradeSelect')?.value;
        const credits = parseFloat(document.getElementById('creditsInput')?.value) || 1.0;
        const level = document.getElementById('levelSelect')?.value;

        if (!name) {
            alert('请输入课程名称 (Please enter course name)');
            return;
        }

        const course = { term, code, name, grade, credits, level };
        this.courses.push(course);

        // Clear inputs
        document.getElementById('courseName').value = '';
        document.getElementById('courseCode').value = '';

        // Update display
        this.updateCourseList();
        this.updateTranscriptPreview();
    },

    // Generate course code
    generateCourseCode() {
        const prefixes = ['ENG', 'MTH', 'SCI', 'SOC', 'LNG', 'ELE', 'ART', 'PHY'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 400) + 100;
        return `${prefix}${number}`;
    },

    // Remove last course
    removeLastCourse() {
        if (this.courses.length > 0) {
            this.courses.pop();
            this.updateCourseList();
            this.updateTranscriptPreview();
        }
    },

    // Generate sample courses
    generateSampleCourses() {
        this.courses = TranscriptGenerator.generateSampleCourses(2021, 4);
        this.updateCourseList();
        this.updateTranscriptPreview();
    },

    // Update course list display
    updateCourseList() {
        const tbody = document.getElementById('courseListBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.courses.forEach((course, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${TranscriptGenerator.formatTerm(course.term)}</td>
        <td>${course.code}</td>
        <td>${course.name}</td>
        <td>${course.grade}</td>
        <td>${course.credits.toFixed(2)}</td>
        <td><span class="level-badge level-${course.level.toLowerCase()}">${course.level}</span></td>
        <td>
          <button class="btn-icon delete-course" data-index="${index}" title="删除">×</button>
        </td>
      `;
            tbody.appendChild(tr);
        });

        // Bind delete buttons
        tbody.querySelectorAll('.delete-course').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.courses.splice(index, 1);
                this.updateCourseList();
                this.updateTranscriptPreview();
            });
        });
    },

    // Update transcript preview
    updateTranscriptPreview() {
        if (!this.currentAddress || !this.currentSchool) return;

        // Create transcript data
        this.currentTranscript = TranscriptGenerator.createTranscript(
            this.currentAddress,
            this.currentSchool,
            this.courses
        );

        // Update preview elements
        const t = this.currentTranscript;

        // School info
        this.setPreviewText('previewSchoolName', t.school.name);
        this.setPreviewText('previewSchoolAddress', t.school.address);
        this.setPreviewText('previewSchoolPhone', t.school.phone);

        // Student info
        this.setPreviewText('previewStudentName', t.student.name);
        this.setPreviewText('previewStudentAddress', t.student.address);
        this.setPreviewText('previewStudentDob', t.student.dateOfBirth);
        this.setPreviewText('previewStudentPhone', t.student.phone);

        // Academic info
        this.setPreviewText('previewEnrollmentStatus', t.academic.enrollmentStatus);
        this.setPreviewText('previewGradeLevel', t.academic.gradeLevel);
        this.setPreviewText('previewGpa', t.academic.gpa);
        this.setPreviewText('previewWeightedGpa', t.academic.weightedGpa);
        this.setPreviewText('previewClassRank', t.academic.classRank);
        this.setPreviewText('previewVerificationCode', t.academic.verificationCode);
        this.setPreviewText('previewPrintDate', t.printDate);
        this.setPreviewText('previewEffectiveDate', t.effectiveDate);

        // Course table
        this.updatePreviewCourseTable();

        // Credit summary
        this.updateCreditSummary();
    },

    // Helper to set preview text
    setPreviewText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value || '-';
    },

    // Update preview course table
    updatePreviewCourseTable() {
        const tbody = document.getElementById('previewCourseBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Sort courses by term
        const sortedCourses = [...this.courses].sort((a, b) => {
            return a.term.localeCompare(b.term);
        });

        sortedCourses.forEach(course => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${TranscriptGenerator.formatTerm(course.term)}</td>
        <td>${course.code}</td>
        <td>${course.name}</td>
        <td>${course.grade}</td>
        <td>${course.credits.toFixed(2)}</td>
        <td>${course.level}</td>
      `;
            tbody.appendChild(tr);
        });
    },

    // Update credit summary
    updateCreditSummary() {
        if (!this.currentTranscript) return;

        const summary = this.currentTranscript.creditSummary;

        Object.entries(summary).forEach(([category, data]) => {
            const earnedEl = document.getElementById(`credits-${category}-earned`);
            const requiredEl = document.getElementById(`credits-${category}-required`);

            if (earnedEl) earnedEl.textContent = data.earned.toFixed(1);
            if (requiredEl) requiredEl.textContent = data.required.toFixed(1);
        });
    },

    // Copy to clipboard
    async copyToClipboard(button) {
        const targetId = button.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const text = targetEl.textContent;

        try {
            await navigator.clipboard.writeText(text);
            button.textContent = '✓';
            button.classList.add('copied');

            setTimeout(() => {
                button.textContent = '📋';
                button.classList.remove('copied');
            }, 1500);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    },

    // Download PDF
    async downloadPDF() {
        const studentName = this.currentAddress?.name?.replace(/\s+/g, '_') || 'Student';
        const schoolName = this.currentSchool?.name?.replace(/\s+/g, '_') || 'School';
        const filename = `Transcript_${studentName}_${schoolName}.pdf`;

        await PDFExporter.exportToPDF('transcriptPreview', filename);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
