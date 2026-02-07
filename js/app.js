/**
 * Main Application Module
 * Combines all modules and handles UI interactions
 */

const App = {
    currentAddress: null,
    currentSchool: null,
    currentTranscript: null,
    currentEmergencyContact: null,
    courses: [],
    availableSchools: [],
    schoolLogo: null,
    isEditMode: false,
    principalSignature: null,

    // Common principal names database
    principalNames: [
        'Dr. Robert Anderson', 'Dr. Patricia Williams', 'Dr. Michael Johnson', 'Dr. Jennifer Davis',
        'Dr. James Wilson', 'Dr. Linda Martinez', 'Dr. William Brown', 'Dr. Elizabeth Garcia',
        'Dr. David Miller', 'Dr. Barbara Taylor', 'Dr. Richard Thomas', 'Dr. Susan Jackson',
        'Dr. Joseph White', 'Dr. Margaret Harris', 'Dr. Charles Thompson', 'Dr. Dorothy Robinson',
        'Dr. Christopher Clark', 'Dr. Nancy Lewis', 'Dr. Daniel Walker', 'Dr. Karen Hall',
        'Dr. Matthew Allen', 'Dr. Betty Young', 'Dr. Anthony King', 'Dr. Sandra Wright',
        'Dr. Mark Scott', 'Dr. Ashley Green', 'Dr. Steven Adams', 'Dr. Kimberly Nelson',
        'Dr. Paul Baker', 'Dr. Emily Carter', 'Dr. Andrew Mitchell', 'Dr. Michelle Roberts',
        'Dr. Joshua Turner', 'Dr. Amanda Phillips', 'Dr. Kenneth Campbell', 'Dr. Stephanie Parker',
        'Mrs. Catherine Evans', 'Mr. Brian Edwards', 'Mrs. Rebecca Collins', 'Mr. Kevin Stewart',
        'Ms. Laura Sanchez', 'Mr. Timothy Morris', 'Mrs. Deborah Rogers', 'Mr. Jason Reed',
        'Ms. Nicole Cook', 'Mr. Ryan Morgan', 'Mrs. Melissa Bell', 'Mr. Jeffrey Murphy'
    ],

    // Initialize the application
    async init() {
        // Initialize modules
        TranscriptGenerator.init();
        await SchoolMatcher.init();

        // Load residential streets data for address generation
        await AddressGenerator.loadResidentialStreets();

        // Populate state dropdown
        this.populateStateDropdown();

        // Populate semester dropdown
        this.populateSemesterDropdown();

        // Populate course dropdowns
        this.populateCourseDropdowns();

        // Bind event listeners
        this.bindEvents();

        // Generate initial data
        await this.generateAddress();
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
            generateBtn.addEventListener('click', async () => await this.generateAddress());
        }

        // Add course button
        const addCourseBtn = document.getElementById('addCourseBtn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', () => this.addCourse());
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

        // Clear courses button
        const clearCoursesBtn = document.getElementById('clearCoursesBtn');
        if (clearCoursesBtn) {
            clearCoursesBtn.addEventListener('click', () => this.clearAllCourses());
        }

        // Course name input - Auto-fill code & Autocomplete logic
        const courseNameInput = document.getElementById('courseName');
        const courseCodeInput = document.getElementById('courseCode');
        if (courseNameInput && courseCodeInput) {
            // Auto-generate code when course name changes
            courseNameInput.addEventListener('blur', (e) => {
                if (!courseCodeInput.value && e.target.value) {
                    courseCodeInput.value = TranscriptGenerator.generateCourseCodeByName(e.target.value);
                }
            });

            // Simple autocomplete (datalist)
            courseNameInput.setAttribute('list', 'courseNameList');
            let datalist = document.getElementById('courseNameList');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'courseNameList';
                document.body.appendChild(datalist);

                // Populate datalist
                const allCourses = TranscriptGenerator.getAllCourseNames();
                allCourses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course;
                    datalist.appendChild(option);
                });
            }
        }

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyToClipboard(e.target));
        });

        // School selector
        const schoolSelect = document.getElementById('schoolSelect');
        if (schoolSelect) {
            schoolSelect.addEventListener('change', (e) => this.selectSchool(e.target.value));
        }

        // School logo upload
        const logoInput = document.getElementById('schoolLogoInput');
        if (logoInput) {
            logoInput.addEventListener('change', (e) => this.handleLogoUpload(e));
        }

        // Remove logo button
        const removeLogoBtn = document.getElementById('removeLogoBtn');
        if (removeLogoBtn) {
            removeLogoBtn.addEventListener('click', () => this.removeLogo());
        }

        // Edit student info button
        const editStudentBtn = document.getElementById('editStudentBtn');
        if (editStudentBtn) {
            editStudentBtn.addEventListener('click', () => this.toggleEditMode());
        }

        // Generate signature button
        const generateSignatureBtn = document.getElementById('generateSignatureBtn');
        if (generateSignatureBtn) {
            generateSignatureBtn.addEventListener('click', () => this.generateSignature());
        }

        // Principal name input - auto update signature on blur
        const principalNameInput = document.getElementById('principalNameInput');
        if (principalNameInput) {
            principalNameInput.addEventListener('blur', () => {
                if (principalNameInput.value.trim()) {
                    this.principalSignature = principalNameInput.value.trim();
                    this.updateSignatureDisplay();
                }
            });
        }
    },

    // Generate new address and match school
    // Uses OpenStreetMap (Nominatim) via AddressValidator to get precise real addresses
    async generateAddress() {
        const stateSelect = document.getElementById('stateSelect');
        const selectedState = stateSelect ? stateSelect.value : null;
        const generateBtn = document.getElementById('generateBtn');

        // Show loading state
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '⏳ 发现真实地址中...';
        }

        try {
            // Step 1: Generate and validate a real US address via OSM discovery
            // This will pick a random point in the selected state (or random state) and find a real building
            this.currentAddress = await AddressValidator.generateValidatedAddress(null, selectedState);

            const stateCode = this.currentAddress.state;

            // Step 2: Match school using ZIP code for better geographical accuracy
            // This will try: exact ZIP -> ZIP prefix -> same state -> random
            const matchedSchool = SchoolMatcher.match(this.currentAddress);

            if (matchedSchool) {
                this.currentSchool = matchedSchool;

                // For the school selector, provide nearby schools (by ZIP and state)
                this.availableSchools = SchoolMatcher.matchMultiple(this.currentAddress, 5);
                this.updateSchoolSelector();
            } else {
                // Fallback: pick random school from same state
                const stateSchools = SchoolMatcher.getSchoolsByState(stateCode);
                if (stateSchools.length > 0) {
                    const school = stateSchools[Math.floor(Math.random() * stateSchools.length)];
                    this.currentSchool = {
                        name: school.name,
                        address: school.address,
                        city: school.city,
                        state: school.state,
                        zip: school.zip,
                        phone: school.phone,
                        fullAddress: `${school.address}, ${school.city}, ${school.state} ${school.zip}`
                    };
                    this.availableSchools = [this.currentSchool];
                    this.updateSchoolSelector();
                }
            }

            // Update UI
            this.updateAddressDisplay();
            this.updateSchoolDisplay();

            // Show student info and emergency contact cards (they start hidden)
            const studentInfoCard = document.getElementById('studentInfoCard');
            const emergencyContactCard = document.getElementById('emergencyContactCard');
            if (studentInfoCard) {
                studentInfoCard.classList.remove('hidden');
            }
            if (emergencyContactCard) {
                emergencyContactCard.classList.remove('hidden');
            }

            // Show validation status
            if (this.currentAddress.validated) {
                console.log('✅ Real address discovered via OSM');
            } else {
                console.log('⚠️ Using probabilistic address (OSM discovery failed)');
            }

            // Auto-generate principal signature
            this.generateSignature();

            // Generate emergency contact (parent with same last name, address, and phone)
            this.generateEmergencyContact();

            // Clear courses when generating new address
            this.clearAllCourses();

            this.updateTranscriptPreview();

            // Add animation
            const addressCard = document.querySelector('.address-card');
            if (addressCard) {
                addressCard.classList.remove('animate-in');
                void addressCard.offsetWidth; // Trigger reflow
                addressCard.classList.add('animate-in');
            }
        } catch (error) {
            console.error('Generation Error:', error);
            alert('地址生成失败，请重试 (Generation failed, please try again)');
        } finally {
            // Reset button state
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '✨ 生成地址信息';
            }
        }
    },

    // Generate random principal signature
    generateSignature() {
        const principalNameInput = document.getElementById('principalNameInput');

        // If user has entered a name, use that
        if (principalNameInput && principalNameInput.value.trim()) {
            this.principalSignature = principalNameInput.value.trim();
        } else {
            // Otherwise, generate a random principal name
            const randomIndex = Math.floor(Math.random() * this.principalNames.length);
            this.principalSignature = this.principalNames[randomIndex];

            // Update the input field
            if (principalNameInput) {
                principalNameInput.value = this.principalSignature;
            }
        }

        this.updateSignatureDisplay();
        this.updateTranscriptPreview();
    },

    // Generate emergency contact (parent) with same last name, address, and phone as student
    generateEmergencyContact() {
        if (!this.currentAddress) return;

        // Generate parent first name (different gender from student for variety)
        const parentGender = this.currentAddress.gender === 'male' ? 'female' : 'male';
        const parentFirstNames = parentGender === 'male'
            ? AddressGenerator.maleNames
            : AddressGenerator.femaleNames;
        const parentFirstName = parentFirstNames[Math.floor(Math.random() * parentFirstNames.length)];

        // Use student's last name
        const parentLastName = this.currentAddress.lastName;

        this.currentEmergencyContact = {
            name: `${parentFirstName} ${parentLastName}`,
            relationship: 'Parent/Guardian',
            address: this.currentAddress.fullAddress,
            phone: this.currentAddress.phone
        };

        this.updateEmergencyContactDisplay();
    },

    // Update emergency contact display
    updateEmergencyContactDisplay() {
        if (!this.currentEmergencyContact) return;

        const fields = {
            'displayEmergencyName': this.currentEmergencyContact.name,
            'displayEmergencyRelation': this.currentEmergencyContact.relationship,
            'displayEmergencyAddress': this.currentEmergencyContact.address,
            'displayEmergencyPhone': this.currentEmergencyContact.phone
        };

        Object.entries(fields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    },

    // Update signature display in transcript
    updateSignatureDisplay() {
        const signatureDisplay = document.getElementById('signatureDisplay');
        if (signatureDisplay && this.principalSignature) {
            signatureDisplay.textContent = this.principalSignature;
        }
    },

    // Update school selector dropdown
    updateSchoolSelector() {
        const select = document.getElementById('schoolSelect');
        if (!select) return;

        select.innerHTML = '';

        if (this.availableSchools.length === 0) {
            select.innerHTML = '<option value="">无可用学校</option>';
            return;
        }

        this.availableSchools.forEach((school, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${school.name} (${school.city}, ${school.state})`;
            if (index === 0) {
                option.textContent += ' ★ 最佳匹配';
            }
            select.appendChild(option);
        });
    },

    // Select a school from dropdown
    selectSchool(index) {
        if (index === '' || !this.availableSchools[index]) return;

        this.currentSchool = this.availableSchools[index];
        this.updateSchoolDisplay();
        this.updateTranscriptPreview();
    },

    // Update address display
    updateAddressDisplay() {
        if (!this.currentAddress) return;

        const fields = {
            'displayStudentId': this.currentAddress.studentId || '-',
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
        const name = document.getElementById('courseName')?.value;
        const grade = document.getElementById('gradeSelect')?.value;
        const credits = parseFloat(document.getElementById('creditsInput')?.value) || 1.0;
        const level = document.getElementById('levelSelect')?.value;

        if (!name) {
            alert('Please enter course name');
            return;
        }

        // Auto-generate course code based on course name
        let code = document.getElementById('courseCode')?.value;
        if (!code) {
            code = TranscriptGenerator.generateCourseCodeByName(name);
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



    // Generate sample courses based on birth date - always 4 years
    generateSampleCourses() {
        // Calculate start year from birth date
        let startYear = new Date().getFullYear() - 3; // Default

        if (this.currentAddress && this.currentAddress.dateOfBirth) {
            startYear = TranscriptGenerator.calculateStartYear(this.currentAddress.dateOfBirth);
        }

        // Make sure we don't generate courses in the future
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const maxYear = currentMonth >= 7 ? currentYear : currentYear - 1;

        // Adjust start year if it would extend into the future
        // Always generate 4 years of courses
        const numYears = 4;
        if (startYear + numYears - 1 > maxYear) {
            startYear = maxYear - numYears + 1;
        }

        // Ensure startYear is reasonable (not too far in the past)
        if (startYear < currentYear - 10) {
            startYear = currentYear - 3;
        }

        this.courses = TranscriptGenerator.generateSampleCourses(startYear, numYears);
        this.updateCourseList();
        this.updateTranscriptPreview();
    },

    // Clear all courses
    clearAllCourses() {
        this.courses = [];
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

        // Create transcript data with options
        this.currentTranscript = TranscriptGenerator.createTranscript(
            this.currentAddress,
            this.currentSchool,
            this.courses,
            {
                schoolLogo: this.schoolLogo
            }
        );

        // Update preview elements
        const t = this.currentTranscript;

        // School info
        this.setPreviewText('previewSchoolName', t.school.name);
        this.setPreviewText('previewSchoolAddress', t.school.address);
        this.setPreviewText('previewSchoolPhone', t.school.phone);
        this.setPreviewText('previewSchoolNameFooter', t.school.name);
        this.setPreviewText('previewRegistrarPhone', t.school.phone);

        // School logo in header
        const logoEl = document.getElementById('previewSchoolLogo');
        if (logoEl) {
            if (this.schoolLogo) {
                logoEl.src = this.schoolLogo;
                logoEl.classList.remove('hidden');
            } else {
                logoEl.classList.add('hidden');
            }
        }

        // Watermark - School Logo
        const watermarkLogoImg = document.getElementById('watermarkLogoImg');
        if (watermarkLogoImg) {
            if (this.schoolLogo) {
                watermarkLogoImg.src = this.schoolLogo;
                watermarkLogoImg.classList.remove('hidden');
            } else {
                watermarkLogoImg.classList.add('hidden');
            }
        }

        // Student info
        this.setPreviewText('previewStudentId', t.student.studentId);
        this.setPreviewText('previewStudentName', t.student.name);
        this.setPreviewText('previewStudentAddress', t.student.address);
        this.setPreviewText('previewStudentDob', t.student.dateOfBirth);
        this.setPreviewText('previewStudentPhone', t.student.phone);

        // Emergency contact
        if (this.currentEmergencyContact) {
            this.setPreviewText('previewEmergencyName', this.currentEmergencyContact.name);
            this.setPreviewText('previewEmergencyRelation', this.currentEmergencyContact.relationship);
            this.setPreviewText('previewEmergencyAddress', this.currentEmergencyContact.address);
            this.setPreviewText('previewEmergencyPhone', this.currentEmergencyContact.phone);
        }

        // Academic info
        this.setPreviewText('previewGradeLevel', t.academic.gradeLevel);
        this.setPreviewText('previewGpa', t.academic.gpa);
        this.setPreviewText('previewWeightedGpa', t.academic.weightedGpa);
        this.setPreviewText('previewClassRank', t.academic.classRank);
        this.setPreviewText('previewVerificationCode', t.academic.verificationCode);
        this.setPreviewText('previewSignatureDate', t.signatureDate);

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
    },

    // Handle logo upload
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件 (Please upload an image file)');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('图片大小不能超过2MB (Image size should not exceed 2MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.schoolLogo = e.target.result;

            // Show preview
            const preview = document.getElementById('schoolLogoPreview');
            const container = document.getElementById('logoPreviewContainer');
            if (preview && container) {
                preview.src = this.schoolLogo;
                container.classList.remove('hidden');
            }

            this.updateTranscriptPreview();
        };
        reader.readAsDataURL(file);
    },

    // Remove logo
    removeLogo() {
        this.schoolLogo = null;

        const input = document.getElementById('schoolLogoInput');
        const container = document.getElementById('logoPreviewContainer');

        if (input) input.value = '';
        if (container) container.classList.add('hidden');

        this.updateTranscriptPreview();
    },

    // Toggle edit mode for student info
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const btn = document.getElementById('editStudentBtn');

        const editableFields = [
            { display: 'displayName', edit: 'editName', key: 'name' },
            { display: 'displayDob', edit: 'editDob', key: 'dateOfBirth' },
            { display: 'displayAddress', edit: 'editAddress', key: 'fullAddress' },
            { display: 'displayPhone', edit: 'editPhone', key: 'phone' }
        ];

        if (this.isEditMode) {
            // Enter edit mode
            if (btn) btn.textContent = '💾 保存';

            editableFields.forEach(field => {
                const displayEl = document.getElementById(field.display);
                const editEl = document.getElementById(field.edit);
                if (displayEl && editEl) {
                    editEl.value = displayEl.textContent;
                    displayEl.classList.add('hidden');
                    editEl.classList.remove('hidden');
                }
            });
        } else {
            // Save and exit edit mode
            if (btn) btn.textContent = '✏️ 编辑';

            let dobChanged = false;
            editableFields.forEach(field => {
                const displayEl = document.getElementById(field.display);
                const editEl = document.getElementById(field.edit);
                if (displayEl && editEl) {
                    const newValue = editEl.value.trim();
                    if (newValue) {
                        // Check if DOB changed
                        if (field.key === 'dateOfBirth' && displayEl.textContent !== newValue) {
                            dobChanged = true;
                        }
                        displayEl.textContent = newValue;
                        // Update currentAddress
                        if (field.key === 'name') {
                            this.currentAddress.name = newValue;
                            // Update emergency contact last name if student name changed
                            const nameParts = newValue.split(' ');
                            if (nameParts.length >= 2 && this.currentEmergencyContact) {
                                const newLastName = nameParts[nameParts.length - 1];
                                const emergencyNameParts = this.currentEmergencyContact.name.split(' ');
                                emergencyNameParts[emergencyNameParts.length - 1] = newLastName;
                                this.currentEmergencyContact.name = emergencyNameParts.join(' ');
                                this.updateEmergencyContactDisplay();
                            }
                        } else if (field.key === 'dateOfBirth') {
                            this.currentAddress.dateOfBirth = newValue;
                        } else if (field.key === 'fullAddress') {
                            this.currentAddress.fullAddress = newValue;
                            // Update emergency contact address too
                            if (this.currentEmergencyContact) {
                                this.currentEmergencyContact.address = newValue;
                                this.updateEmergencyContactDisplay();
                            }
                        } else if (field.key === 'phone') {
                            this.currentAddress.phone = newValue;
                            // Update emergency contact phone too
                            if (this.currentEmergencyContact) {
                                this.currentEmergencyContact.phone = newValue;
                                this.updateEmergencyContactDisplay();
                            }
                        }
                    }
                    displayEl.classList.remove('hidden');
                    editEl.classList.add('hidden');
                }
            });

            // If DOB changed and there are courses, ask user if they want to regenerate
            if (dobChanged && this.courses.length > 0) {
                const regenerate = confirm('出生日期已更改。是否要根据新日期重新生成课程？\n(Date of birth changed. Do you want to regenerate courses based on the new date?)');
                if (regenerate) {
                    this.generateSampleCourses();
                }
            }

            this.updateTranscriptPreview();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
