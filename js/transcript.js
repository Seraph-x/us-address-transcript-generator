/**
 * Transcript Generator Module
 * Generates high school transcripts with auto-filled student and school info
 */

const TranscriptGenerator = {
    // Semester options from 2020 to 2030
    semesters: [],

    // Course templates - Expanded with more common courses
    courseTemplates: {
        english: [
            'English 9', 'English 10', 'English 11', 'English 12',
            'AP English Language', 'AP English Literature', 'Honors English',
            'Creative Writing', 'Journalism', 'Speech and Debate',
            'IB English A', 'IB English B', 'World Literature'
        ],
        math: [
            'Algebra I', 'Algebra II', 'Geometry', 'Pre-Calculus',
            'AP Calculus AB', 'AP Calculus BC', 'AP Statistics',
            'Honors Geometry', 'Trigonometry', 'Discrete Mathematics',
            'IB Mathematics SL', 'IB Mathematics HL', 'Linear Algebra',
            'Multivariable Calculus', 'Honors Algebra II'
        ],
        science: [
            'Biology', 'Chemistry', 'Physics', 'AP Biology', 'AP Chemistry',
            'AP Physics 1', 'AP Physics 2', 'AP Physics C: Mechanics',
            'Honors Chemistry', 'Environmental Science', 'AP Environmental Science',
            'Anatomy and Physiology', 'Earth Science', 'Astronomy',
            'IB Biology SL', 'IB Biology HL', 'IB Chemistry SL', 'IB Physics SL',
            'Marine Biology', 'Forensic Science'
        ],
        socialStudies: [
            'World History', 'US History', 'AP US History', 'AP World History',
            'Government', 'AP Government', 'Economics', 'AP Economics',
            'Psychology', 'AP Psychology', 'Sociology', 'Geography',
            'IB History SL', 'IB History HL', 'Civics', 'Current Events',
            'AP Human Geography', 'Philosophy'
        ],
        foreignLanguage: [
            'Spanish I', 'Spanish II', 'Spanish III', 'Spanish IV', 'AP Spanish',
            'French I', 'French II', 'French III', 'AP French',
            'Chinese I', 'Chinese II', 'Chinese III', 'AP Chinese',
            'German I', 'German II', 'German III', 'Latin I', 'Latin II',
            'Japanese I', 'Japanese II', 'Italian I', 'Italian II',
            'IB Spanish SL', 'IB French SL', 'IB Mandarin SL'
        ],
        electives: [
            'Art', 'Music', 'Band', 'Orchestra', 'Choir', 'Drama', 'Theater Arts',
            'Computer Science', 'AP Computer Science A', 'AP Computer Science Principles',
            'Physical Education', 'Health', 'Photography', 'Film Studies',
            'Culinary Arts', 'Wood Shop', 'Automotive Technology',
            'Business', 'Accounting', 'Marketing', 'Graphic Design',
            'Robotics', 'Engineering', 'Architecture', 'Fashion Design',
            'IB Visual Arts', 'IB Music', 'IB Computer Science'
        ]
    },

    grades: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
    gradePoints: {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
    },

    // Course levels - Added IB
    courseLevels: ['Standard', 'Honors', 'AP', 'IB'],
    levelWeights: { 'Standard': 0, 'Honors': 0.5, 'AP': 1.0, 'IB': 1.0 },

    // Initialize semesters
    init() {
        this.semesters = [];
        for (let year = 2020; year <= 2030; year++) {
            this.semesters.push({ value: `${year}-fall`, label: `${year} 秋季 (Fall)` });
            this.semesters.push({ value: `${year}-spring`, label: `${year} 春季 (Spring)` });
        }
    },

    // Generate verification code
    generateVerificationCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 3; i++) {
            code += chars.charAt(Math.floor(Math.random() * 26));
        }
        code += '-';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // Calculate GPA
    calculateGPA(courses, weighted = false) {
        if (!courses || courses.length === 0) return 0;

        let totalPoints = 0;
        let totalCredits = 0;

        courses.forEach(course => {
            const basePoints = this.gradePoints[course.grade] || 0;
            const weight = weighted ? (this.levelWeights[course.level] || 0) : 0;
            const points = Math.min(basePoints + weight, 5.0); // Cap at 5.0

            totalPoints += points * course.credits;
            totalCredits += course.credits;
        });

        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    },

    // Calculate total credits by category
    calculateCreditSummary(courses) {
        const summary = {
            english: { earned: 0, required: 4 },
            math: { earned: 0, required: 4 },
            science: { earned: 0, required: 3 },
            socialStudies: { earned: 0, required: 3 },
            foreignLanguage: { earned: 0, required: 2 },
            electives: { earned: 0, required: 6 },
            total: { earned: 0, required: 22 }
        };

        courses.forEach(course => {
            const category = this.getCourseCategory(course.name);
            if (summary[category]) {
                summary[category].earned += course.credits;
            }
            summary.total.earned += course.credits;
        });

        return summary;
    },

    // Determine course category
    getCourseCategory(courseName) {
        const name = courseName.toLowerCase();
        if (name.includes('english') || name.includes('literature') || name.includes('writing')) return 'english';
        if (name.includes('algebra') || name.includes('geometry') || name.includes('calculus') || name.includes('math') || name.includes('statistics')) return 'math';
        if (name.includes('biology') || name.includes('chemistry') || name.includes('physics') || name.includes('science')) return 'science';
        if (name.includes('history') || name.includes('government') || name.includes('economics') || name.includes('geography')) return 'socialStudies';
        if (name.includes('spanish') || name.includes('french') || name.includes('chinese') || name.includes('german') || name.includes('japanese')) return 'foreignLanguage';
        return 'electives';
    },

    // Generate sample courses for a transcript
    generateSampleCourses(startYear = 2021, numYears = 4) {
        const courses = [];
        const categories = ['english', 'math', 'science', 'socialStudies', 'foreignLanguage', 'electives'];

        for (let year = 0; year < numYears; year++) {
            const currentYear = startYear + year;

            // Fall semester courses
            categories.forEach(cat => {
                if (Math.random() > 0.3) { // 70% chance to add course
                    const template = this.courseTemplates[cat];
                    const courseName = template[Math.min(year, template.length - 1)];
                    const level = year >= 2 && Math.random() > 0.5 ?
                        (Math.random() > 0.5 ? 'AP' : 'Honors') : 'Standard';

                    courses.push({
                        term: `${currentYear}-fall`,
                        code: this.generateCourseCode(cat),
                        name: courseName,
                        grade: this.generateRandomGrade(),
                        credits: 1.0,
                        level: level
                    });
                }
            });

            // Spring semester courses
            categories.forEach(cat => {
                if (Math.random() > 0.3) {
                    const template = this.courseTemplates[cat];
                    const courseName = template[Math.min(year, template.length - 1)];
                    const level = year >= 2 && Math.random() > 0.5 ?
                        (Math.random() > 0.5 ? 'AP' : 'Honors') : 'Standard';

                    courses.push({
                        term: `${currentYear}-spring`,
                        code: this.generateCourseCode(cat),
                        name: courseName,
                        grade: this.generateRandomGrade(),
                        credits: 1.0,
                        level: level
                    });
                }
            });
        }

        return courses;
    },

    // Generate course code
    generateCourseCode(category) {
        const prefixes = {
            english: 'ENG',
            math: 'MTH',
            science: 'SCI',
            socialStudies: 'SOC',
            foreignLanguage: 'LNG',
            electives: 'ELE'
        };
        const prefix = prefixes[category] || 'GEN';
        const number = Math.floor(Math.random() * 400) + 100;
        return `${prefix}${number}`;
    },

    // Generate course code by course name
    generateCourseCodeByName(courseName) {
        const category = this.getCourseCategory(courseName);
        return this.generateCourseCode(category);
    },

    // Get all available course names for autocomplete
    getAllCourseNames() {
        const allCourses = [];
        Object.values(this.courseTemplates).forEach(courses => {
            courses.forEach(course => allCourses.push(course));
        });
        return allCourses;
    },

    // Calculate start year based on birth date
    calculateStartYear(dateOfBirth) {
        // Parse date (MM/DD/YYYY format)
        const parts = dateOfBirth.split('/');
        if (parts.length !== 3) {
            return new Date().getFullYear() - 3; // Default to current year - 3
        }

        const birthYear = parseInt(parts[2]);
        // High school starts at age 14 (9th grade)
        // So start year = birth year + 14
        const startYear = birthYear + 14;

        return startYear;
    },

    // Generate random grade (weighted towards good grades)
    generateRandomGrade() {
        const rand = Math.random();
        if (rand < 0.4) return 'A';
        if (rand < 0.6) return 'A-';
        if (rand < 0.75) return 'B+';
        if (rand < 0.85) return 'B';
        if (rand < 0.92) return 'B-';
        if (rand < 0.97) return 'C+';
        return 'C';
    },

    // Generate class rank
    generateClassRank(totalStudents = 450) {
        const rank = Math.floor(Math.random() * Math.floor(totalStudents * 0.3)) + 1;
        return `${rank} of ${totalStudents}`;
    },

    // Format term for display
    formatTerm(termValue) {
        if (!termValue) return '';
        const [year, season] = termValue.split('-');
        return season === 'fall' ? `Fall ${year}` : `Spring ${year}`;
    },

    // Create transcript data object
    createTranscript(studentInfo, schoolInfo, courses = [], options = {}) {
        const today = new Date();

        return {
            student: {
                name: studentInfo.name || '',
                address: studentInfo.fullAddress || '',
                dateOfBirth: studentInfo.dateOfBirth || '',
                phone: studentInfo.phone || '',
                studentId: studentInfo.studentId || AddressGenerator.generateStudentId()
            },
            school: {
                name: schoolInfo.name || '',
                address: schoolInfo.fullAddress || '',
                phone: schoolInfo.phone || '',
                logo: options.schoolLogo || null
            },
            academic: {
                gradeLevel: options.gradeLevel || '12',
                entryDate: options.entryDate || '08/15/2021',
                expectedGraduation: options.expectedGraduation || '06/15/2025',
                gpa: this.calculateGPA(courses),
                weightedGpa: this.calculateGPA(courses, true),
                classRank: this.generateClassRank(),
                verificationCode: this.generateVerificationCode()
            },
            courses: courses,
            creditSummary: this.calculateCreditSummary(courses),
            signatureDate: today.toLocaleDateString('en-US')
        };
    },

    // Get available semesters
    getSemesters() {
        if (this.semesters.length === 0) {
            this.init();
        }
        return this.semesters;
    },

    // Get course templates for dropdown
    getCourseTemplates() {
        return this.courseTemplates;
    },

    // Get all available grades
    getGrades() {
        return this.grades;
    },

    // Get course levels
    getLevels() {
        return this.courseLevels;
    }
};

// Initialize on load
TranscriptGenerator.init();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranscriptGenerator;
}
