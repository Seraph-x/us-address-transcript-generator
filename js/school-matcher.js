/**
 * School Matcher Module
 * Matches addresses to nearby US public high schools
 */

const SchoolMatcher = {
    schools: [],
    schoolsByZip: {},
    schoolsByState: {},

    // Initialize with school data
    async init() {
        try {
            const response = await fetch('data/us-high-schools.json');
            const data = await response.json();
            this.schools = data.schools;
            this.buildIndexes();
        } catch (error) {
            console.error('Failed to load school data:', error);
        }
    },

    // Build lookup indexes
    buildIndexes() {
        this.schoolsByZip = {};
        this.schoolsByState = {};

        this.schools.forEach(school => {
            // Index by ZIP code
            if (!this.schoolsByZip[school.zip]) {
                this.schoolsByZip[school.zip] = [];
            }
            this.schoolsByZip[school.zip].push(school);

            // Index by ZIP prefix (first 3 digits)
            const zipPrefix = school.zip.substring(0, 3);
            if (!this.schoolsByZip[zipPrefix]) {
                this.schoolsByZip[zipPrefix] = [];
            }
            this.schoolsByZip[zipPrefix].push(school);

            // Index by state
            if (!this.schoolsByState[school.state]) {
                this.schoolsByState[school.state] = [];
            }
            this.schoolsByState[school.state].push(school);
        });
    },

    // Find matching school by ZIP code
    findByZip(zipCode, state) {
        // 1. Exact ZIP match
        if (this.schoolsByZip[zipCode] && this.schoolsByZip[zipCode].length > 0) {
            const exactMatches = this.schoolsByZip[zipCode].filter(s =>
                s.zip === zipCode
            );
            if (exactMatches.length > 0) {
                return this.random(exactMatches);
            }
        }

        // 2. ZIP prefix match (same area)
        const zipPrefix = zipCode.substring(0, 3);
        if (this.schoolsByZip[zipPrefix] && this.schoolsByZip[zipPrefix].length > 0) {
            return this.random(this.schoolsByZip[zipPrefix]);
        }

        // 3. Same state fallback
        if (this.schoolsByState[state] && this.schoolsByState[state].length > 0) {
            return this.random(this.schoolsByState[state]);
        }

        // 4. Random fallback
        return this.random(this.schools);
    },

    // Match address to school
    match(addressData) {
        const school = this.findByZip(addressData.zipCode, addressData.state);

        if (!school) {
            return null;
        }

        return {
            name: school.name,
            address: school.address,
            city: school.city,
            state: school.state,
            zip: school.zip,
            phone: school.phone,
            fullAddress: `${school.address}, ${school.city}, ${school.state} ${school.zip}`
        };
    },

    // Get random element from array
    random(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // Get all available states from school data
    getAvailableStates() {
        return Object.keys(this.schoolsByState).sort();
    },

    // Get schools by state
    getSchoolsByState(state) {
        return this.schoolsByState[state] || [];
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchoolMatcher;
}
