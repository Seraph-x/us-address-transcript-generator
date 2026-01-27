/**
 * Address Validator Module
 * Uses Google Geocoding API to validate addresses and ensure they are precise
 */

const AddressValidator = {
    apiKey: APP_CONFIG.GOOGLE_MAPS_API_KEY,

    /**
     * Validate an address using Google Geocoding API
     * @param {string} address - Full address to validate
     * @returns {Promise<object>} - Validation result with isValid, isPrecise, coordinates
     */
    async validateAddress(address) {
        try {
            const encodedAddress = encodeURIComponent(address);
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== 'OK' || !data.results || data.results.length === 0) {
                return {
                    isValid: false,
                    isPrecise: false,
                    error: data.status,
                    message: 'Address not found'
                };
            }

            const result = data.results[0];
            const locationType = result.geometry.location_type;

            // ROOFTOP = exact building location (most precise)
            const isPrecise = locationType === 'ROOFTOP';

            // Check if it's potentially residential
            const types = result.types || [];
            const isResidential = types.includes('street_address') || types.includes('premise') || types.includes('subpremise');

            return {
                isValid: true,
                isPrecise: isPrecise,
                isResidential: isResidential,
                locationType: locationType,
                formattedAddress: result.formatted_address,
                coordinates: {
                    lat: result.geometry.location.lat,
                    lng: result.geometry.location.lng
                },
                placeId: result.place_id,
                addressComponents: result.address_components,
                types: types
            };
        } catch (error) {
            console.error('Address validation error:', error);
            return {
                isValid: false,
                isPrecise: false,
                error: 'NETWORK_ERROR',
                message: error.message
            };
        }
    },

    /**
     * Reverse geocode coordinates to find a real address
     * @param {number} lat 
     * @param {number} lng 
     * @returns {Promise<object>}
     */
    async reverseGeocode(lat, lng) {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}&result_type=street_address|premise|subpremise`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const result = data.results[0];
                return {
                    isValid: true,
                    isPrecise: result.geometry.location_type === 'ROOFTOP',
                    formattedAddress: result.formatted_address,
                    coordinates: result.geometry.location,
                    addressComponents: result.address_components,
                    types: result.types
                };
            }
            return { isValid: false };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return { isValid: false };
        }
    },

    /**
     * Discover a real residential address in a specific area
     * @param {string} zip 
     * @param {string} city 
     * @param {string} state 
     */
    async discoverRealResidentialAddress(zip, city, state) {
        // Step 1: Get area center coordinates
        const areaQuery = `${city}, ${state} ${zip}`;
        const areaGeocode = await this.validateAddress(areaQuery);

        if (!areaGeocode.isValid) return null;

        const center = areaGeocode.coordinates;

        // Try up to 5 random points around the center to find a building
        for (let i = 0; i < 5; i++) {
            // Apply random offset (approx 300m to 1km)
            const latOffset = (Math.random() - 0.5) * 0.01;
            const lngOffset = (Math.random() - 0.5) * 0.01;

            const discovered = await this.reverseGeocode(center.lat + latOffset, center.lng + lngOffset);

            if (discovered.isValid && discovered.isPrecise) {
                const components = discovered.addressComponents;
                const streetNumber = components.find(c => c.types.includes('street_number'))?.long_name || '';
                const route = components.find(c => c.types.includes('route'))?.long_name || '';

                if (streetNumber && route) {
                    return {
                        address: `${streetNumber} ${route}`,
                        city: components.find(c => c.types.includes('locality'))?.long_name || city,
                        state: components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || state,
                        zipCode: components.find(c => c.types.includes('postal_code'))?.long_name || zip,
                        fullAddress: discovered.formattedAddress,
                        coordinates: discovered.coordinates,
                        validated: true,
                        discoveryUsed: true
                    };
                }
            }
            await new Promise(r => setTimeout(r, 200));
        }
        return null;
    },


    /**
     * Generate and validate an address for a school
     * Will retry up to maxAttempts times to find a precise address
     * @param {object} school - School object with city, state, zip
     * @param {number} maxAttempts - Maximum validation attempts
     * @returns {Promise<object>} - Valid address data
     */
    async generateValidatedAddress(school, maxAttempts = 5) {
        // First 3 attempts: Try probabilistic generator (fast)
        for (let attempt = 0; attempt < 3; attempt++) {
            const addressData = AddressGenerator.generateForSchool(school);
            const validation = await this.validateAddress(addressData.fullAddress);

            if (validation.isValid && validation.isPrecise) {
                return {
                    ...addressData,
                    validated: true,
                    validation: validation,
                    fullAddress: validation.formattedAddress || addressData.fullAddress,
                    coordinates: validation.coordinates
                };
            }
        }

        // If simple guessing fails, use dynamic discovery (accurate)
        console.log('Switching to dynamic discovery mode for precise residential address...');
        const discovered = await this.discoverRealResidentialAddress(school.zip, school.city, school.state);

        if (discovered) {
            const studentInfo = AddressGenerator.generateName();
            const stateName = AddressGenerator.states[discovered.state]?.name || discovered.state;
            const dob = AddressGenerator.generateDateOfBirth();

            return {
                ...studentInfo,
                name: studentInfo.fullName,
                ...discovered,
                stateName: stateName,
                studentId: AddressGenerator.generateStudentId(),
                phone: AddressGenerator.generatePhoneNumber(discovered.state),
                dateOfBirth: dob.formatted,
                dateOfBirthDate: dob.date
            };
        }

        // Final fallback
        const fallbackAddress = AddressGenerator.generateForSchool(school);
        return {
            ...fallbackAddress,
            validated: false,
            validationNote: 'Could not find precise address after discovery'
        };
    },


    /**
     * Search for real residential addresses near a location
     * @param {string} city - City name
     * @param {string} state - State code
     * @param {string} zip - ZIP code
     * @returns {Promise<array>} - Array of validated addresses
     */
    async findRealAddresses(city, state, zip, count = 10) {
        const validAddresses = [];
        let attempts = 0;
        const maxAttempts = count * 3; // Allow 3x attempts to find valid addresses

        while (validAddresses.length < count && attempts < maxAttempts) {
            attempts++;

            // Generate candidate address
            const streetNumber = Math.floor(Math.random() * 9000) + 100;
            const streets = [
                'Oak St', 'Maple Ave', 'Cedar Ln', 'Pine Dr', 'Elm Ct',
                'Main St', 'Park Ave', 'Washington St', 'Lincoln Ave', 'Jefferson Dr'
            ];
            const street = streets[Math.floor(Math.random() * streets.length)];
            const address = `${streetNumber} ${street}, ${city}, ${state} ${zip}`;

            const validation = await this.validateAddress(address);

            if (validation.isValid && validation.isPrecise) {
                validAddresses.push({
                    address: validation.formattedAddress,
                    coordinates: validation.coordinates,
                    placeId: validation.placeId
                });
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return validAddresses;
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AddressValidator;
}
