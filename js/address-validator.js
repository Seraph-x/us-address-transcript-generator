/**
 * Address Validator Module
 * Uses OpenStreetMap (Nominatim) to validate addresses and ensure they are precise
 * This works in China and does not require an API key.
 */

const AddressValidator = {
    // Nominatim usage policy: 1 request per second max, custom User-Agent required
    lastRequestTime: 0,
    userAgent: 'US-Address-Transcript-Generator/1.0',

    // Helper to respect rate limits (1 second between requests)
    async throttle() {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        if (elapsed < 1100) {
            await new Promise(resolve => setTimeout(resolve, 1100 - elapsed));
        }
        this.lastRequestTime = Date.now();
    },

    /**
     * Validate an address using Nominatim API
     * @param {string} address - Full address to validate
     * @returns {Promise<object>} - Validation result
     */
    async validateAddress(address) {
        try {
            await this.throttle();
            const encodedAddress = encodeURIComponent(address);
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&addressdetails=1&limit=1`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept-Language': 'en'
                }
            });
            const data = await response.json();

            if (!data || data.length === 0) {
                return {
                    isValid: false,
                    isPrecise: false,
                    message: 'Address not found'
                };
            }

            const result = data[0];
            const addr = result.address;

            // Check if it's a precise residential address (has house number)
            const isPrecise = !!addr.house_number;

            return {
                isValid: true,
                isPrecise: isPrecise,
                formattedAddress: result.display_name,
                coordinates: {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                },
                addressComponents: addr
            };
        } catch (error) {
            console.error('OSM validation error:', error);
            return {
                isValid: false,
                isPrecise: false,
                error: 'NETWORK_ERROR',
                message: error.message
            };
        }
    },

    /**
     * Reverse geocode coordinates to find a real address via Nominatim
     * @param {number} lat 
     * @param {number} lng 
     * @returns {Promise<object>}
     */
    async reverseGeocode(lat, lng) {
        try {
            await this.throttle();
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept-Language': 'en'
                }
            });
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                const osmClass = data.class;
                const osmType = data.type;

                console.log(`OSM Result: ${data.display_name} (Class: ${osmClass}, Type: ${osmType})`);

                // STRICT residential-only filter:
                // Exclude non-residential types explicitly
                const nonResidentialClasses = [
                    'highway', 'natural', 'water', 'waterway', 'landuse',
                    'amenity', 'office', 'shop', 'tourism', 'leisure',
                    'sport', 'historic', 'railway', 'aeroway', 'power',
                    'man_made', 'barrier', 'military', 'emergency'
                ];

                const nonResidentialTypes = [
                    'lake', 'river', 'stream', 'pond', 'reservoir', 'water',
                    'park', 'forest', 'wood', 'meadow', 'grass', 'cemetery',
                    'parking', 'industrial', 'commercial', 'retail',
                    'school', 'university', 'college', 'hospital', 'clinic',
                    'church', 'library', 'police', 'fire_station',
                    'restaurant', 'cafe', 'bar', 'fast_food', 'fuel',
                    'bank', 'atm', 'pharmacy', 'supermarket', 'mall'
                ];

                // Residential building types we accept
                const residentialTypes = [
                    'house', 'residential', 'detached', 'semidetached', 'terrace',
                    'apartments', 'apartment', 'flat', 'flats', 'dwelling',
                    'bungalow', 'cottage', 'townhouse', 'duplex', 'triplex',
                    'yes' // OSM often uses building=yes for residential
                ];

                // Check if it's a valid residential address:
                // 1. Must have house_number
                // 2. Must NOT be in excluded classes
                // 3. Should be a building class OR have residential type
                const hasHouseNumber = !!addr.house_number;
                const isExcludedClass = nonResidentialClasses.includes(osmClass);
                const isExcludedType = nonResidentialTypes.includes(osmType);
                const isResidentialType = residentialTypes.includes(osmType);
                const isBuilding = osmClass === 'building' || osmClass === 'place';

                // Must have house number and NOT be excluded, and either be a building or residential type
                const isPrecise = hasHouseNumber &&
                    !isExcludedClass &&
                    !isExcludedType &&
                    (isBuilding || isResidentialType);

                return {
                    isValid: true,
                    isPrecise: isPrecise,
                    formattedAddress: data.display_name,
                    coordinates: {
                        lat: parseFloat(data.lat),
                        lng: parseFloat(data.lon)
                    },
                    addressComponents: addr,
                    osmMetadata: { class: osmClass, type: osmType }
                };
            }
            return { isValid: false };
        } catch (error) {
            console.error('OSM Reverse geocoding error:', error);
            return { isValid: false };
        }
    },

    /**
     * Discover a real residential address in a specific state using coordinate-based discovery
     * @param {string} stateCode 
     */
    async discoverRealResidentialAddress(stateCode) {
        // Get center points for the state
        const coordsArray = AddressGenerator.stateCoordinates[stateCode] || [{ lat: 39.8283, lng: -98.5795 }];

        // Try up to 20 random points (increased from 10)
        for (let i = 0; i < 20; i++) {
            const baseCoord = coordsArray[Math.floor(Math.random() * coordsArray.length)];
            // Random offset: vary discovery radius to hit different densities
            const range = i < 5 ? 0.05 : (i < 12 ? 0.15 : 0.3);
            const latOffset = (Math.random() - 0.5) * range;
            const lngOffset = (Math.random() - 0.5) * range;

            console.log(`Discovery attempt ${i + 1} for ${stateCode}...`);
            const discovered = await this.reverseGeocode(baseCoord.lat + latOffset, baseCoord.lng + lngOffset);

            if (discovered.isValid && discovered.isPrecise) {
                const addr = discovered.addressComponents;
                const road = addr.road || '';

                // Final check for essential US address components
                if (addr.house_number && road && (addr.city || addr.town || addr.village)) {
                    const city = addr.city || addr.town || addr.village;
                    const zip = addr.postcode;

                    return {
                        address: `${addr.house_number} ${road}`,
                        city: city,
                        state: stateCode,
                        zipCode: zip,
                        fullAddress: `${addr.house_number} ${road}, ${city}, ${stateCode} ${zip}`,
                        coordinates: discovered.coordinates,
                        validated: true,
                        discoveryUsed: true
                    };
                }
            }
        }
        return null;
    },

    /**
     * Main entry point for generating a validated address
     * @param {object} school - Not used for matching anymore, just for state context
     * @returns {Promise<object>}
     */
    async generateValidatedAddress(school = null, targetState = null) {
        const state = targetState || school?.state || AddressGenerator.random(Object.keys(AddressGenerator.states));

        console.log(`Starting real address discovery for state: ${state}`);
        const discovered = await this.discoverRealResidentialAddress(state);

        if (discovered) {
            const studentInfo = AddressGenerator.generateName();
            const stateName = AddressGenerator.states[state]?.name || state;
            const dob = AddressGenerator.generateDateOfBirth();

            return {
                ...studentInfo,
                name: studentInfo.fullName,
                ...discovered,
                stateName: stateName,
                studentId: AddressGenerator.generateStudentId(),
                phone: AddressGenerator.generatePhoneNumber(state),
                dateOfBirth: dob.formatted,
                dateOfBirthDate: dob.date
            };
        }

        // Final fallback to probabilistic generator if OSM fails multiple times
        console.warn('OSM discovery failed, falling back to probabilistic generator');
        const fallback = AddressGenerator.generate(state);
        return {
            ...fallback,
            validated: false,
            validationNote: 'OSM discovery failed'
        };
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AddressValidator;
}

