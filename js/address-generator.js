/**
 * US Address Generator Module
 * Generates realistic US addresses with names, phone numbers (no email)
 */

const AddressGenerator = {
    // Residential streets database - loaded from JSON
    residentialStreets: null,

    // Load residential streets data
    async loadResidentialStreets() {
        if (this.residentialStreets) return;
        try {
            const response = await fetch('data/residential-streets.json');
            const data = await response.json();
            this.residentialStreets = data.streets;
        } catch (e) {
            console.warn('Could not load residential streets data:', e);
            this.residentialStreets = {};
        }
    },

    // State center coordinates for discovery (from reference project)
    stateCoordinates: {
        "AL": [{ lat: 32.377716, lng: -86.300568 }, { lat: 33.520661, lng: -86.802490 }],
        "AK": [{ lat: 61.216583, lng: -149.899597 }, { lat: 58.301598, lng: -134.419998 }],
        "AZ": [{ lat: 33.448376, lng: -112.074036 }, { lat: 34.048927, lng: -111.093735 }],
        "AR": [{ lat: 34.746483, lng: -92.289597 }, { lat: 36.082157, lng: -94.171852 }],
        "CA": [{ lat: 36.778259, lng: -119.417931 }, { lat: 34.052235, lng: -118.243683 }],
        "CO": [{ lat: 39.739235, lng: -104.990250 }, { lat: 38.833881, lng: -104.821365 }],
        "CT": [{ lat: 41.763710, lng: -72.685097 }, { lat: 41.308273, lng: -72.927887 }],
        "DE": [{ lat: 39.739072, lng: -75.539787 }, { lat: 38.774055, lng: -75.139351 }],
        "FL": [{ lat: 30.332184, lng: -81.655647 }, { lat: 25.761681, lng: -80.191788 }],
        "GA": [{ lat: 33.749001, lng: -84.387985 }, { lat: 32.083541, lng: -81.099831 }],
        "HI": [{ lat: 21.306944, lng: -157.858337 }, { lat: 19.896767, lng: -155.582779 }],
        "ID": [{ lat: 43.615021, lng: -116.202316 }, { lat: 47.677683, lng: -116.780466 }],
        "IL": [{ lat: 41.878113, lng: -87.629799 }, { lat: 40.633125, lng: -89.398529 }],
        "IN": [{ lat: 39.768402, lng: -86.158066 }, { lat: 41.593369, lng: -87.346427 }],
        "IA": [{ lat: 41.586834, lng: -93.625000 }, { lat: 42.500000, lng: -94.166672 }],
        "KS": [{ lat: 39.099728, lng: -94.578568 }, { lat: 37.687176, lng: -97.330055 }],
        "KY": [{ lat: 38.252666, lng: -85.758453 }, { lat: 37.839333, lng: -84.270020 }],
        "LA": [{ lat: 30.695366, lng: -91.187393 }, { lat: 29.951065, lng: -90.071533 }],
        "ME": [{ lat: 44.310623, lng: -69.779490 }, { lat: 43.661471, lng: -70.255325 }],
        "MD": [{ lat: 38.978447, lng: -76.492180 }, { lat: 39.290386, lng: -76.612190 }],
        "MA": [{ lat: 42.360081, lng: -71.058884 }, { lat: 42.313373, lng: -71.057083 }],
        "MI": [{ lat: 42.732536, lng: -84.555534 }, { lat: 42.331429, lng: -83.045753 }],
        "MN": [{ lat: 44.953703, lng: -93.089958 }, { lat: 44.977753, lng: -93.265015 }],
        "MS": [{ lat: 32.298756, lng: -90.184807 }, { lat: 32.366806, lng: -88.703705 }],
        "MO": [{ lat: 38.576702, lng: -92.173516 }, { lat: 38.627003, lng: -90.199402 }],
        "MT": [{ lat: 46.878717, lng: -113.996586 }, { lat: 45.783287, lng: -108.500690 }],
        "NE": [{ lat: 41.256538, lng: -95.934502 }, { lat: 40.813618, lng: -96.702595 }],
        "NV": [{ lat: 39.163914, lng: -119.767403 }, { lat: 36.114647, lng: -115.172813 }],
        "NH": [{ lat: 43.208137, lng: -71.538063 }, { lat: 42.995640, lng: -71.454789 }],
        "NJ": [{ lat: 40.058323, lng: -74.405663 }, { lat: 39.364285, lng: -74.422928 }],
        "NM": [{ lat: 35.084385, lng: -106.650421 }, { lat: 32.319939, lng: -106.763653 }],
        "NY": [{ lat: 40.712776, lng: -74.005974 }, { lat: 43.299427, lng: -74.217933 }],
        "NC": [{ lat: 35.779591, lng: -78.638176 }, { lat: 35.227085, lng: -80.843124 }],
        "ND": [{ lat: 46.825905, lng: -100.778275 }, { lat: 46.877186, lng: -96.789803 }],
        "OH": [{ lat: 39.961178, lng: -82.998795 }, { lat: 41.499321, lng: -81.694359 }],
        "OK": [{ lat: 35.467560, lng: -97.516426 }, { lat: 36.153980, lng: -95.992775 }],
        "OR": [{ lat: 44.046236, lng: -123.022029 }, { lat: 45.505917, lng: -122.675049 }],
        "PA": [{ lat: 40.273191, lng: -76.886701 }, { lat: 39.952583, lng: -75.165222 }],
        "RI": [{ lat: 41.824009, lng: -71.412834 }, { lat: 41.580095, lng: -71.477429 }],
        "SC": [{ lat: 34.000710, lng: -81.034814 }, { lat: 32.776474, lng: -79.931051 }],
        "SD": [{ lat: 44.366787, lng: -100.353760 }, { lat: 43.544595, lng: -96.731103 }],
        "TN": [{ lat: 36.162663, lng: -86.781601 }, { lat: 35.149532, lng: -90.048981 }],
        "TX": [{ lat: 30.267153, lng: -97.743057 }, { lat: 29.760427, lng: -95.369804 }],
        "UT": [{ lat: 40.760780, lng: -111.891045 }, { lat: 37.774929, lng: -111.920414 }],
        "VT": [{ lat: 44.260059, lng: -72.575386 }, { lat: 44.475883, lng: -73.212074 }],
        "VA": [{ lat: 37.540726, lng: -77.436050 }, { lat: 36.852924, lng: -75.977982 }],
        "WA": [{ lat: 47.606209, lng: -122.332069 }, { lat: 47.252876, lng: -122.444290 }],
        "WV": [{ lat: 38.349820, lng: -81.632622 }, { lat: 39.629527, lng: -79.955896 }],
        "WI": [{ lat: 43.073051, lng: -89.401230 }, { lat: 43.038902, lng: -87.906471 }],
        "WY": [{ lat: 41.140259, lng: -104.820236 }, { lat: 44.276569, lng: -105.507391 }],
        "DC": [{ lat: 38.907192, lng: -77.036871 }]
    },

    // US States only (no Canada)
    states: {
        'AL': { name: 'Alabama', areaCodes: ['205', '251', '256', '334'] },
        'AK': { name: 'Alaska', areaCodes: ['907'] },
        'AZ': { name: 'Arizona', areaCodes: ['480', '520', '602', '623', '928'] },
        'AR': { name: 'Arkansas', areaCodes: ['479', '501', '870'] },
        'CA': { name: 'California', areaCodes: ['213', '310', '323', '408', '415', '510', '562', '619', '650', '714', '818', '858', '909', '949'] },
        'CO': { name: 'Colorado', areaCodes: ['303', '719', '720', '970'] },
        'CT': { name: 'Connecticut', areaCodes: ['203', '475', '860'] },
        'DE': { name: 'Delaware', areaCodes: ['302'] },
        'FL': { name: 'Florida', areaCodes: ['305', '321', '352', '386', '407', '561', '727', '754', '786', '813', '850', '863', '904', '941', '954'] },
        'GA': { name: 'Georgia', areaCodes: ['229', '404', '470', '478', '678', '706', '762', '770', '912'] },
        'HI': { name: 'Hawaii', areaCodes: ['808'] },
        'ID': { name: 'Idaho', areaCodes: ['208', '986'] },
        'IL': { name: 'Illinois', areaCodes: ['217', '224', '309', '312', '331', '618', '630', '708', '773', '815', '847', '872'] },
        'IN': { name: 'Indiana', areaCodes: ['219', '260', '317', '463', '574', '765', '812', '930'] },
        'IA': { name: 'Iowa', areaCodes: ['319', '515', '563', '641', '712'] },
        'KS': { name: 'Kansas', areaCodes: ['316', '620', '785', '913'] },
        'KY': { name: 'Kentucky', areaCodes: ['270', '364', '502', '606', '859'] },
        'LA': { name: 'Louisiana', areaCodes: ['225', '318', '337', '504', '985'] },
        'ME': { name: 'Maine', areaCodes: ['207'] },
        'MD': { name: 'Maryland', areaCodes: ['240', '301', '410', '443', '667'] },
        'MA': { name: 'Massachusetts', areaCodes: ['339', '351', '413', '508', '617', '774', '781', '857', '978'] },
        'MI': { name: 'Michigan', areaCodes: ['231', '248', '269', '313', '517', '586', '616', '734', '810', '906', '947', '989'] },
        'MN': { name: 'Minnesota', areaCodes: ['218', '320', '507', '612', '651', '763', '952'] },
        'MS': { name: 'Mississippi', areaCodes: ['228', '601', '662', '769'] },
        'MO': { name: 'Missouri', areaCodes: ['314', '417', '573', '636', '660', '816'] },
        'MT': { name: 'Montana', areaCodes: ['406'] },
        'NE': { name: 'Nebraska', areaCodes: ['308', '402', '531'] },
        'NV': { name: 'Nevada', areaCodes: ['702', '725', '775'] },
        'NH': { name: 'New Hampshire', areaCodes: ['603'] },
        'NJ': { name: 'New Jersey', areaCodes: ['201', '551', '609', '732', '848', '856', '862', '908', '973'] },
        'NM': { name: 'New Mexico', areaCodes: ['505', '575'] },
        'NY': { name: 'New York', areaCodes: ['212', '315', '332', '347', '516', '518', '585', '607', '631', '646', '680', '716', '718', '845', '914', '917', '929', '934'] },
        'NC': { name: 'North Carolina', areaCodes: ['252', '336', '704', '743', '828', '910', '919', '980', '984'] },
        'ND': { name: 'North Dakota', areaCodes: ['701'] },
        'OH': { name: 'Ohio', areaCodes: ['216', '220', '234', '330', '380', '419', '440', '513', '567', '614', '740', '937'] },
        'OK': { name: 'Oklahoma', areaCodes: ['405', '539', '580', '918'] },
        'OR': { name: 'Oregon', areaCodes: ['458', '503', '541', '971'] },
        'PA': { name: 'Pennsylvania', areaCodes: ['215', '223', '267', '272', '412', '484', '570', '610', '717', '724', '814', '878'] },
        'RI': { name: 'Rhode Island', areaCodes: ['401'] },
        'SC': { name: 'South Carolina', areaCodes: ['803', '843', '854', '864'] },
        'SD': { name: 'South Dakota', areaCodes: ['605'] },
        'TN': { name: 'Tennessee', areaCodes: ['423', '615', '629', '731', '865', '901', '931'] },
        'TX': { name: 'Texas', areaCodes: ['210', '214', '254', '281', '325', '346', '361', '409', '430', '432', '469', '512', '682', '713', '737', '806', '817', '830', '832', '903', '915', '936', '940', '956', '972', '979'] },
        'UT': { name: 'Utah', areaCodes: ['385', '435', '801'] },
        'VT': { name: 'Vermont', areaCodes: ['802'] },
        'VA': { name: 'Virginia', areaCodes: ['276', '434', '540', '571', '703', '757', '804'] },
        'WA': { name: 'Washington', areaCodes: ['206', '253', '360', '425', '509', '564'] },
        'WV': { name: 'West Virginia', areaCodes: ['304', '681'] },
        'WI': { name: 'Wisconsin', areaCodes: ['262', '414', '534', '608', '715', '920'] },
        'WY': { name: 'Wyoming', areaCodes: ['307'] },
        'DC': { name: 'District of Columbia', areaCodes: ['202'] }
    },

    // Common residential street names
    streetNames: [
        'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Willow', 'Hickory', 'Walnut', 'Cherry',
        'Magnolia', 'Sycamore', 'Poplar', 'Dogwood', 'Chestnut', 'Laurel', 'Holly', 'Juniper', 'Cypress', 'Aspen'
    ],

    // Directional prefixes for residential addresses
    directionalPrefixes: ['N', 'S', 'E', 'W'],

    // Residential-focused street types
    residentialStreetTypes: ['Ave', 'Dr', 'Ln', 'Way', 'Ct', 'Pl'],
    streetTypes: ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct', 'Pl', 'Cir', 'Ter'],

    // Generate ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
    getOrdinalSuffix(num) {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    },

    // Generate a numbered street name (e.g., "47th", "48th")
    generateNumberedStreet() {
        const streetNum = this.randomNumber(30, 99);
        return streetNum + this.getOrdinalSuffix(streetNum);
    },

    // Common first names - Expanded to 100+
    maleNames: [
        'James', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew',
        'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kevin', 'Brian', 'George',
        'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Nicholas', 'Gary', 'Eric',
        'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory',
        'Nathan', 'Patrick', 'Alexander', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam',
        'Henry', 'Douglas', 'Zachary', 'Peter', 'Kyle', 'Noah', 'Ethan', 'Jeremy', 'Walter', 'Christian',
        'Keith', 'Roger', 'Terry', 'Austin', 'Sean', 'Gerald', 'Carl', 'Dylan', 'Harold', 'Jordan',
        'Jesse', 'Bryan', 'Lawrence', 'Arthur', 'Gabriel', 'Bruce', 'Logan', 'Billy', 'Albert', 'Willie',
        'Eugene', 'Russell', 'Vincent', 'Philip', 'Bobby', 'Johnny', 'Bradley', 'Roy', 'Ralph', 'Eugene',
        'Randy', 'Howard', 'Carlos', 'Louis', 'Harry', 'Wayne', 'Liam', 'Mason', 'Lucas', 'Oliver',
        'Aiden', 'Elijah', 'Jayden', 'Caleb', 'Connor', 'Owen', 'Sebastian', 'Adrian', 'Hunter', 'Evan'
    ],

    femaleNames: [
        'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
        'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
        'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
        'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
        'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
        'Diane', 'Ruth', 'Julie', 'Olivia', 'Joyce', 'Virginia', 'Victoria', 'Kelly', 'Lauren', 'Christina',
        'Joan', 'Evelyn', 'Judith', 'Megan', 'Andrea', 'Cheryl', 'Hannah', 'Jacqueline', 'Martha', 'Gloria',
        'Teresa', 'Ann', 'Sara', 'Madison', 'Frances', 'Kathryn', 'Janice', 'Jean', 'Abigail', 'Alice',
        'Judy', 'Sophia', 'Grace', 'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle', 'Beverly', 'Isabella',
        'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Marie', 'Kayla', 'Alexis', 'Lori', 'Ava',
        'Chloe', 'Zoe', 'Lily', 'Ella', 'Mia', 'Aria', 'Sofia', 'Camila', 'Savannah', 'Audrey'
    ],

    // Common last names - Expanded to 100+
    lastNames: [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
        'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
        'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
        'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
        'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
        'Turner', 'Phillips', 'Evans', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Morris', 'Murphy', 'Cook',
        'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 'Howard',
        'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett', 'Gray', 'James',
        'Reyes', 'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales',
        'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins', 'Gutierrez', 'Perry', 'Butler', 'Barnes', 'Fisher',
        'Henderson', 'Coleman', 'Simmons', 'Patterson', 'Jordan', 'Reynolds', 'Hamilton', 'Graham', 'Kim', 'Gonzales',
        'Alexander', 'Ramos', 'Wallace', 'Griffin', 'West', 'Cole', 'Hayes', 'Chavez', 'Gibson', 'Bryant'
    ],

    // Cities by state - Expanded database
    cities: {
        'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Palo Alto', 'Irvine', 'Pasadena', 'Beverly Hills', 'Santa Monica', 'Cupertino', 'Mountain View', 'Fremont', 'Oakland', 'Berkeley', 'Long Beach', 'Sacramento', 'Fresno', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Bakersfield', 'Modesto', 'Glendale', 'Huntington Beach', 'Santa Clarita', 'Garden Grove', 'Oceanside', 'Rancho Cucamonga', 'Ontario', 'Santa Rosa', 'Elk Grove', 'Corona', 'Lancaster', 'Palmdale', 'Salinas', 'Pomona', 'Hayward', 'Escondido', 'Sunnyvale', 'Torrance', 'Roseville', 'Fullerton', 'Visalia', 'Orange', 'Concord', 'Thousand Oaks', 'Simi Valley', 'Victorville', 'Vallejo'],
        'NY': ['New York', 'Brooklyn', 'Queens', 'Manhattan', 'Bronx', 'Staten Island', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'White Plains', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica', 'Niagara Falls', 'Binghamton', 'Freeport', 'Valley Stream', 'Long Beach', 'Spring Valley', 'Rome', 'Ithaca', 'Poughkeepsie', 'North Tonawanda', 'Jamestown', 'Elmira', 'Auburn', 'Saratoga Springs', 'Glen Cove', 'Peekskill', 'Plattsburgh', 'Kingston', 'Middletown', 'Amsterdam', 'Oswego', 'Lackawanna', 'Cohoes', 'Rye'],
        'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Plano', 'Irving', 'Frisco', 'McKinney', 'The Woodlands', 'Corpus Christi', 'Laredo', 'Lubbock', 'Garland', 'Amarillo', 'Grand Prairie', 'Brownsville', 'Mesquite', 'McAllen', 'Killeen', 'Pasadena', 'Denton', 'Midland', 'Waco', 'Carrollton', 'Round Rock', 'Abilene', 'Beaumont', 'Richardson', 'Odessa', 'Sugar Land', 'Lewisville', 'Tyler', 'College Station', 'Wichita Falls', 'Allen', 'San Angelo', 'Pearland', 'League City', 'Edinburg', 'Longview', 'Mission', 'Bryan', 'Pharr'],
        'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Naples', 'Boca Raton', 'West Palm Beach', 'Coral Gables', 'Miami Beach', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Port St. Lucie', 'Cape Coral', 'Pembroke Pines', 'Hollywood', 'Miramar', 'Gainesville', 'Coral Springs', 'Clearwater', 'Palm Bay', 'Pompano Beach', 'Lakeland', 'Davie', 'Sunrise', 'Plantation', 'Deerfield Beach', 'Largo', 'Melbourne', 'Boynton Beach', 'Lauderhill', 'Weston', 'Fort Myers', 'Deltona', 'Kissimmee', 'Palm Coast', 'Sanford', 'Margate', 'Coconut Creek', 'Tamarac', 'Sarasota', 'Daytona Beach', 'Delray Beach', 'Ocala'],
        'IL': ['Chicago', 'Naperville', 'Evanston', 'Schaumburg', 'Aurora', 'Rockford', 'Joliet', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Champaign', 'Bloomington', 'Decatur', 'Arlington Heights', 'Palatine', 'Skokie', 'Des Plaines', 'Orland Park', 'Tinley Park', 'Oak Lawn', 'Berwyn', 'Mount Prospect', 'Normal', 'Wheaton', 'Hoffman Estates', 'Oak Park', 'Downers Grove', 'Elmhurst', 'Glenview', 'DeKalb', 'Lombard', 'Belleville', 'Moline', 'Buffalo Grove', 'Bartlett', 'Urbana', 'Crystal Lake', 'Quincy', 'Streamwood'],
        'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Lancaster', 'Harrisburg', 'Bethlehem', 'York', 'Wilkes-Barre', 'Chester', 'State College', 'Easton', 'Lebanon', 'Hazleton', 'Johnstown', 'McKeesport', 'Williamsport', 'New Castle', 'Butler', 'Pottstown', 'Norristown', 'Phoenixville', 'Meadville', 'Sharon', 'Greensburg', 'Indiana', 'Washington', 'Chambersburg', 'Carlisle', 'Hanover', 'Gettysburg', 'Media', 'West Chester', 'King of Prussia', 'Bryn Mawr', 'Doylestown', 'Ardmore', 'Wayne'],
        'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Dublin', 'Westerville', 'Parma', 'Canton', 'Youngstown', 'Lorain', 'Hamilton', 'Springfield', 'Kettering', 'Elyria', 'Lakewood', 'Cuyahoga Falls', 'Middletown', 'Newark', 'Mentor', 'Euclid', 'Beavercreek', 'Cleveland Heights', 'Strongsville', 'Fairfield', 'Warren', 'Findlay', 'Lancaster', 'Huber Heights', 'Marion', 'Lima', 'Mansfield', 'Grove City', 'Delaware', 'Reynoldsburg', 'Mason', 'Upper Arlington', 'Gahanna', 'Powell'],
        'GA': ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Macon', 'Athens', 'Marietta', 'Johns Creek', 'Alpharetta', 'Sandy Springs', 'Roswell', 'Albany', 'Warner Robins', 'Smyrna', 'Valdosta', 'Dunwoody', 'Peachtree City', 'Brookhaven', 'Stonecrest', 'Gainesville', 'Milton', 'Newnan', 'Rome', 'East Point', 'Kennesaw', 'Lawrenceville', 'Duluth', 'Woodstock', 'Douglasville', 'Canton', 'Statesboro', 'Redan', 'Dalton', 'Griffin', 'LaGrange', 'Carrollton', 'McDonough', 'Hinesville', 'Decatur', 'Suwanee'],
        'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Chapel Hill', 'Wilmington', 'High Point', 'Concord', 'Asheville', 'Gastonia', 'Jacksonville', 'Huntersville', 'Apex', 'Mooresville', 'Rocky Mount', 'Burlington', 'Kannapolis', 'Wake Forest', 'Wilson', 'Hickory', 'Monroe', 'Matthews', 'New Bern', 'Sanford', 'Cornelius', 'Mint Hill', 'Kernersville', 'Morrisville', 'Statesville', 'Holly Springs', 'Garner', 'Lumberton', 'Salisbury', 'Goldsboro', 'Indian Trail', 'Fuquay-Varina', 'Harrisburg'],
        'MI': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Troy', 'Dearborn', 'Livonia', 'Clinton Township', 'Canton', 'Farmington Hills', 'Westland', 'Kalamazoo', 'Rochester Hills', 'Wyoming', 'Southfield', 'Taylor', 'Novi', 'Pontiac', 'St. Clair Shores', 'Royal Oak', 'Portage', 'Dearborn Heights', 'Battle Creek', 'Saginaw', 'Lincoln Park', 'East Lansing', 'Muskegon', 'Midland', 'Holland', 'Jackson', 'Bay City', 'Roseville', 'Eastpointe', 'Allen Park', 'Mount Pleasant', 'Birmingham', 'Bloomfield Hills'],
        'NJ': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Princeton', 'Trenton', 'Hoboken', 'Woodbridge', 'Lakewood', 'Toms River', 'Hamilton', 'Clifton', 'Camden', 'Passaic', 'Union City', 'Old Bridge', 'Middletown', 'East Orange', 'Bayonne', 'Franklin', 'North Bergen', 'Vineland', 'Piscataway', 'New Brunswick', 'Hackensack', 'Sayreville', 'Perth Amboy', 'West New York', 'Plainfield', 'Kearny', 'Linden', 'West Orange', 'Parsippany', 'Livingston', 'Cherry Hill', 'Montclair', 'Morristown', 'Summit', 'Red Bank'],
        'VA': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Arlington', 'Alexandria', 'McLean', 'Fairfax', 'Newport News', 'Hampton', 'Roanoke', 'Portsmouth', 'Suffolk', 'Lynchburg', 'Harrisonburg', 'Leesburg', 'Charlottesville', 'Danville', 'Manassas', 'Petersburg', 'Fredericksburg', 'Winchester', 'Salem', 'Staunton', 'Herndon', 'Ashburn', 'Sterling', 'Vienna', 'Centreville', 'Annandale', 'Burke', 'Springfield', 'Reston', 'Woodbridge', 'Dale City', 'Lake Ridge', 'Tysons', 'Falls Church', 'Great Falls', 'Chantilly'],
        'WA': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Redmond', 'Kirkland', 'Issaquah', 'Kent', 'Everett', 'Renton', 'Spokane Valley', 'Federal Way', 'Yakima', 'Bellingham', 'Kennewick', 'Auburn', 'Pasco', 'Marysville', 'Lakewood', 'Burien', 'Sammamish', 'Olympia', 'Richland', 'Lacey', 'Edmonds', 'Shoreline', 'Bremerton', 'Lynnwood', 'Bothell', 'Puyallup', 'Longview', 'Walla Walla', 'Wenatchee', 'Mount Vernon', 'University Place', 'Pullman', 'Mercer Island', 'Woodinville', 'Snoqualmie'],
        'MA': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Newton', 'Brookline', 'New Bedford', 'Quincy', 'Lynn', 'Fall River', 'Somerville', 'Lawrence', 'Framingham', 'Haverhill', 'Malden', 'Waltham', 'Medford', 'Taunton', 'Chicopee', 'Weymouth', 'Revere', 'Peabody', 'Methuen', 'Barnstable', 'Pittsfield', 'Attleboro', 'Arlington', 'Everett', 'Salem', 'Westfield', 'Leominster', 'Fitchburg', 'Beverly', 'Holyoke', 'Marlborough', 'Woburn', 'Chelsea', 'Amherst'],
        'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Gilbert', 'Tempe', 'Peoria', 'Glendale', 'Surprise', 'Yuma', 'Avondale', 'Goodyear', 'Flagstaff', 'Buckeye', 'Lake Havasu City', 'Casa Grande', 'Sierra Vista', 'Maricopa', 'Oro Valley', 'Prescott', 'Bullhead City', 'Prescott Valley', 'Apache Junction', 'Marana', 'El Mirage', 'Queen Creek', 'Kingman', 'San Tan Valley', 'Florence', 'Fountain Hills', 'Paradise Valley', 'Anthem', 'Sun City', 'Sedona', 'Cottonwood', 'Payson', 'Show Low', 'Safford', 'Nogales'],
        'CO': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder', 'Centennial', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Greeley', 'Highlands Ranch', 'Longmont', 'Loveland', 'Broomfield', 'Grand Junction', 'Castle Rock', 'Commerce City', 'Parker', 'Littleton', 'Brighton', 'Northglenn', 'Englewood', 'Wheat Ridge', 'Ken Caryl', 'Fountain', 'Golden', 'Windsor', 'Erie', 'Lafayette', 'Louisville', 'Superior', 'Frederick', 'Firestone', 'Evans', 'Durango', 'Steamboat Springs', 'Vail', 'Aspen'],
        'TN': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City', 'Bartlett', 'Hendersonville', 'Kingsport', 'Collierville', 'Smyrna', 'Cleveland', 'Brentwood', 'Germantown', 'Columbia', 'La Vergne', 'Spring Hill', 'Gallatin', 'Cookeville', 'Lebanon', 'Mount Juliet', 'Morristown', 'Oak Ridge', 'Maryville', 'Bristol', 'Farragut', 'Goodlettsville', 'Tullahoma', 'Sevierville', 'Dyersburg', 'Shelbyville', 'Dickson', 'Springfield', 'Pigeon Forge', 'Gatlinburg', 'Crossville', 'Manchester'],
        'MD': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Bethesda', 'Silver Spring', 'Hagerstown', 'Annapolis', 'College Park', 'Salisbury', 'Laurel', 'Greenbelt', 'Cumberland', 'Westminster', 'Hyattsville', 'Takoma Park', 'Easton', 'Elkton', 'Cambridge', 'Havre de Grace', 'La Plata', 'Aberdeen', 'Waldorf', 'Potomac', 'Columbia', 'Ellicott City', 'Germantown', 'Towson', 'Dundalk', 'Essex', 'Parkville', 'Catonsville', 'Owings Mills', 'Reisterstown', 'Glen Burnie', 'Severna Park', 'Odenton', 'Crofton', 'Pasadena'],
        'MN': ['Minneapolis', 'Saint Paul', 'Rochester', 'Bloomington', 'Duluth', 'Brooklyn Park', 'Plymouth', 'Maple Grove', 'Woodbury', 'St. Cloud', 'Eagan', 'Eden Prairie', 'Coon Rapids', 'Burnsville', 'Blaine', 'Lakeville', 'Minnetonka', 'Apple Valley', 'Edina', 'St. Louis Park', 'Mankato', 'Moorhead', 'Shakopee', 'Maplewood', 'Richfield', 'Cottage Grove', 'Roseville', 'Inver Grove Heights', 'Andover', 'Savage', 'Fridley', 'Chanhassen', 'Prior Lake', 'Ramsey', 'Shoreview', 'Winona', 'Chaska', 'Champlin', 'Faribault', 'Hastings'],
        'WI': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Oshkosh', 'Eau Claire', 'Janesville', 'West Allis', 'La Crosse', 'Sheboygan', 'Wauwatosa', 'Fond du Lac', 'New Berlin', 'Wausau', 'Brookfield', 'Beloit', 'Greenfield', 'Franklin', 'Oak Creek', 'Manitowoc', 'West Bend', 'Sun Prairie', 'Superior', 'Stevens Point', 'Neenah', 'Fitchburg', 'Muskego', 'Watertown', 'De Pere', 'Mequon', 'South Milwaukee', 'Caledonia', 'Mount Pleasant', 'Cudahy', 'Middleton', 'Menomonee Falls', 'Germantown'],
        'MO': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee Summit', 'O Fallon', 'St. Joseph', 'St. Charles', 'Blue Springs', 'St. Peters', 'Florissant', 'Joplin', 'Chesterfield', 'Jefferson City', 'Cape Girardeau', 'Wildwood', 'University City', 'Ballwin', 'Raytown', 'Liberty', 'Wentzville', 'Mehlville', 'Oakville', 'Affton', 'Kirkwood', 'Maryland Heights', 'Hazelwood', 'Gladstone', 'Grandview', 'Belton', 'Webster Groves', 'Sedalia', 'Ferguson', 'Arnold', 'Creve Coeur', 'Clayton', 'Warrensburg', 'Rolla', 'Hannibal'],
        'CT': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Greenwich', 'Westport', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Bristol', 'Meriden', 'Milford', 'West Haven', 'Middletown', 'Shelton', 'Norwich', 'Torrington', 'Fairfield', 'Trumbull', 'Manchester', 'Glastonbury', 'Hamden', 'East Hartford', 'Enfield', 'Vernon', 'Stratford', 'Naugatuck', 'Wallingford', 'Farmington', 'Southington', 'Cheshire', 'Simsbury', 'New Canaan', 'Darien', 'Wilton', 'Ridgefield', 'Guilford', 'Madison'],
        'OR': ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Beaverton', 'Lake Oswego', 'Bend', 'Medford', 'Springfield', 'Corvallis', 'Albany', 'Tigard', 'Aloha', 'Keizer', 'Tualatin', 'Grants Pass', 'Oregon City', 'McMinnville', 'Redmond', 'West Linn', 'Woodburn', 'Forest Grove', 'Newberg', 'Roseburg', 'Wilsonville', 'Klamath Falls', 'Ashland', 'Milwaukie', 'Canby', 'Hermiston', 'Pendleton', 'Coos Bay', 'Central Point', 'Dallas', 'St. Helens', 'La Grande', 'Baker City', 'Ontario', 'The Dalles'],
        'NV': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Fernley', 'Elko', 'Mesquite', 'Boulder City', 'Fallon', 'Winnemucca', 'West Wendover', 'Ely', 'Yerington', 'Carlin', 'Lovelock', 'Wells', 'Caliente', 'Tonopah', 'Enterprise', 'Spring Valley', 'Sunrise Manor', 'Paradise', 'Whitney', 'Winchester', 'Summerlin', 'Green Valley', 'Anthem', 'Mountains Edge'],
        'UT': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton', 'South Jordan', 'Lehi', 'Millcreek', 'Taylorsville', 'Logan', 'Murray', 'Draper', 'Bountiful', 'Riverton', 'Herriman', 'Spanish Fork', 'Roy', 'Pleasant Grove', 'Kearns', 'Tooele', 'Cottonwood Heights', 'Springville', 'Midvale', 'Holladay', 'Kaysville', 'American Fork', 'Clearfield', 'Syracuse', 'Cedar City', 'Woods Cross', 'Clinton', 'North Salt Lake', 'Farmington', 'Saratoga Springs', 'Eagle Mountain', 'Highland'],
        'AL': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn', 'Decatur', 'Madison', 'Florence', 'Gadsden', 'Vestavia Hills', 'Prattville', 'Phenix City', 'Alabaster', 'Bessemer', 'Enterprise', 'Opelika', 'Homewood', 'Northport', 'Anniston', 'Prichard', 'Athens', 'Daphne', 'Pelham', 'Fairhope', 'Albertville', 'Oxford', 'Selma', 'Mountain Brook', 'Troy', 'Trussville', 'Helena', 'Cullman', 'Foley', 'Talladega', 'Hueytown', 'Center Point', 'Gulf Shores'],
        'SC': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Sumter', 'Goose Creek', 'Hilton Head Island', 'Florence', 'Spartanburg', 'Myrtle Beach', 'Anderson', 'Aiken', 'Mauldin', 'North Augusta', 'Easley', 'Simpsonville', 'Greer', 'Hanahan', 'Conway', 'West Columbia', 'Bluffton', 'Lexington', 'Irmo', 'Taylors', 'North Myrtle Beach', 'Clemson', 'Fort Mill', 'Tega Cay', 'James Island', 'Beaufort', 'Orangeburg', 'Cayce', 'Seneca', 'Greenwood', 'Socastee', 'Forest Acres', 'Wade Hampton'],
        'LA': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Metairie', 'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma', 'Marrero', 'New Iberia', 'Laplace', 'Slidell', 'Central', 'Prairieville', 'Terrytown', 'Ruston', 'Hammond', 'Harvey', 'Chalmette', 'Bayou Cane', 'Sulphur', 'Natchitoches', 'Gretna', 'Opelousas', 'Zachary', 'Thibodaux', 'Pineville', 'Mandeville', 'Covington', 'Gonzales', 'Minden', 'Morgan City', 'Crowley', 'Bastrop', 'West Monroe', 'Abbeville', 'Denham Springs'],
        'KY': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond', 'Georgetown', 'Florence', 'Nicholasville', 'Elizabethtown', 'Henderson', 'Hopkinsville', 'Independence', 'Jeffersontown', 'Frankfort', 'Paducah', 'Ashland', 'Radcliff', 'Murray', 'Erlanger', 'Winchester', 'St. Matthews', 'Danville', 'Fort Thomas', 'Newport', 'Shively', 'Shelbyville', 'Bardstown', 'Shepherdsville', 'Madisonville', 'Berea', 'Somerset', 'Mount Washington', 'London', 'Middlesboro', 'Corbin', 'Lyndon', 'Glasgow', 'Mayfield', 'Versailles'],
        'OK': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond', 'Lawton', 'Moore', 'Midwest City', 'Enid', 'Stillwater', 'Muskogee', 'Bartlesville', 'Owasso', 'Shawnee', 'Ponca City', 'Ardmore', 'Duncan', 'Del City', 'Bixby', 'Yukon', 'Sapulpa', 'Jenks', 'Sand Springs', 'Altus', 'El Reno', 'McAlester', 'Ada', 'Durant', 'Tahlequah', 'Chickasha', 'Claremore', 'Bethany', 'Mustang', 'Guthrie', 'Warr Acres', 'Weatherford', 'Elk City', 'Glenpool', 'Choctaw', 'Newcastle'],
        'IA': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Ames', 'West Des Moines', 'Council Bluffs', 'Ankeny', 'Dubuque', 'Urbandale', 'Cedar Falls', 'Marion', 'Bettendorf', 'Marshalltown', 'Mason City', 'Clinton', 'Burlington', 'Ottumwa', 'Fort Dodge', 'Muscatine', 'Coralville', 'Johnston', 'North Liberty', 'Waukee', 'Altoona', 'Clive', 'Newton', 'Indianola', 'Grimes', 'Norwalk', 'Boone', 'Spencer', 'Oskaloosa', 'Fairfield', 'Storm Lake', 'Fort Madison', 'Le Mars', 'Pella'],
        'KS': ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence', 'Shawnee', 'Manhattan', 'Lenexa', 'Salina', 'Hutchinson', 'Leavenworth', 'Leawood', 'Dodge City', 'Garden City', 'Emporia', 'Derby', 'Prairie Village', 'Junction City', 'Hays', 'Liberal', 'Pittsburg', 'Newton', 'Gardner', 'Great Bend', 'McPherson', 'El Dorado', 'Ottawa', 'Winfield', 'Arkansas City', 'Andover', 'Lansing', 'Merriam', 'Haysville', 'Atchison', 'Parsons', 'Independence', 'Coffeyville', 'Chanute', 'Wellington'],
        'NE': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings', 'Norfolk', 'North Platte', 'Columbus', 'Papillion', 'La Vista', 'Scottsbluff', 'South Sioux City', 'Beatrice', 'Lexington', 'Chalco', 'Gering', 'Alliance', 'Blair', 'York', 'McCook', 'Ralston', 'Nebraska City', 'Seward', 'Crete', 'Sidney', 'Plattsmouth', 'Schuyler', 'Wayne', 'Holdrege', 'Chadron', 'Ogallala', 'Falls City', 'Wahoo', 'Auburn', 'Central City', 'West Point', 'Broken Bow', 'David City'],
        'NM': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis', 'Hobbs', 'Alamogordo', 'Carlsbad', 'Gallup', 'Deming', 'Los Lunas', 'Chaparral', 'Sunland Park', 'Las Vegas', 'Portales', 'Artesia', 'Lovington', 'Silver City', 'Espanola', 'Anthony', 'Grants', 'Socorro', 'Bernalillo', 'Ruidoso', 'North Valley', 'South Valley', 'Corrales', 'Taos', 'Los Alamos', 'Belen', 'Bloomfield', 'Aztec', 'Raton', 'Truth or Consequences', 'Shiprock', 'Tucumcari', 'Zuni Pueblo', 'Eldorado at Santa Fe'],
        'HI': ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu', 'Kaneohe', 'Mililani Town', 'Kahului', 'Ewa Gentry', 'Kapolei', 'Kihei', 'Makakilo', 'Waimea', 'Lahaina', 'Wahiawa', 'Schofield Barracks', 'Wailuku', 'Kapaa', 'Aiea', 'Royal Kunia', 'Halawa', 'Kalaoa', 'Nanakuli', 'Hawaii Kai', 'Ocean Pointe', 'Ewa Beach', 'Waipio', 'Waianae', 'Kaanapali', 'Kealakekua'],
        'ID': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Coeur d Alene', 'Twin Falls', 'Lewiston', 'Post Falls', 'Rexburg', 'Moscow', 'Eagle', 'Kuna', 'Ammon', 'Chubbuck', 'Hayden', 'Mountain Home', 'Blackfoot', 'Garden City', 'Jerome', 'Burley', 'Star', 'Sandpoint', 'Rathdrum', 'Emmett', 'Middleton', 'Weiser', 'Hailey', 'Rupert', 'Payette', 'Fruitland', 'Preston', 'Shelley', 'American Falls', 'Orofino', 'McCall', 'Salmon', 'Soda Springs', 'Ketchum'],
        'WV': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling', 'Weirton', 'Fairmont', 'Martinsburg', 'Beckley', 'Clarksburg', 'South Charleston', 'St. Albans', 'Teays Valley', 'Vienna', 'Bluefield', 'Cross Lanes', 'Moundsville', 'Bridgeport', 'Oak Hill', 'Dunbar', 'Elkins', 'Nitro', 'Hurricane', 'Princeton', 'Charles Town', 'Buckhannon', 'Keyser', 'New Martinsville', 'Grafton', 'Ranson', 'Point Pleasant', 'Weston', 'Ravenswood', 'Summersville', 'Shepherdstown', 'Lewisburg', 'Hinton', 'Williamson', 'Logan', 'Mullens'],
        'NH': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Portsmouth', 'Rochester', 'Salem', 'Dover', 'Merrimack', 'Hudson', 'Londonderry', 'Keene', 'Bedford', 'Laconia', 'Lebanon', 'Claremont', 'Hanover', 'Exeter', 'Durham', 'Hooksett', 'Milford', 'Hampton', 'Somersworth', 'Conway', 'Berlin', 'Gilford', 'Newmarket', 'Amherst', 'Windham', 'Goffstown', 'Barrington', 'Raymond', 'Stratham', 'Plymouth', 'Weare', 'Pembroke', 'Hampstead', 'Hollis', 'Bow', 'Seabrook'],
        'ME': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford', 'Brunswick', 'Scarborough', 'Westbrook', 'Saco', 'Augusta', 'Windham', 'Gorham', 'Kennebunk', 'Waterville', 'Falmouth', 'Orono', 'Old Orchard Beach', 'Cape Elizabeth', 'Presque Isle', 'Yarmouth', 'Bath', 'Standish', 'Wells', 'Buxton', 'Kittery', 'Ellsworth', 'Brewer', 'Freeport', 'Caribou', 'Gray', 'Hampden', 'Topsham', 'Belfast', 'Rockland', 'Old Town', 'Camden', 'Farmington', 'Norway'],
        'MT': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Helena', 'Butte', 'Kalispell', 'Havre', 'Anaconda', 'Miles City', 'Belgrade', 'Livingston', 'Laurel', 'Whitefish', 'Lewistown', 'Sidney', 'Glendive', 'Columbia Falls', 'Polson', 'Dillon', 'Hamilton', 'Hardin', 'Wolf Point', 'Glasgow', 'Shelby', 'Cut Bank', 'Deer Lodge', 'Conrad', 'Libby', 'Colstrip', 'Ronan', 'Stevensville', 'Malta', 'Red Lodge', 'Manhattan', 'Browning', 'East Helena', 'Lolo', 'Four Corners', 'Orchard Homes'],
        'RI': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Coventry', 'Cumberland', 'North Providence', 'South Kingstown', 'West Warwick', 'Johnston', 'North Kingstown', 'Newport', 'Bristol', 'Lincoln', 'Smithfield', 'Central Falls', 'Burrillville', 'Middletown', 'North Smithfield', 'Narragansett', 'Westerly', 'Barrington', 'East Greenwich', 'Tiverton', 'Portsmouth', 'Warren', 'Charlestown', 'Hopkinton', 'West Greenwich', 'Glocester', 'Scituate', 'Exeter', 'Foster', 'Richmond', 'North Scituate', 'Wakefield', 'Kingston', 'Valley Falls'],
        'DE': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford', 'Seaford', 'Georgetown', 'Elsmere', 'New Castle', 'Millsboro', 'Laurel', 'Harrington', 'Camden', 'Clayton', 'Lewes', 'Milton', 'Selbyville', 'Bridgeville', 'Rehoboth Beach', 'Townsend', 'Ocean View', 'Wyoming', 'Bethany Beach', 'Delmar', 'Cheswold', 'Greenwood', 'Frankford', 'Felton', 'Fenwick Island', 'Bowers', 'South Bethany', 'Bellefonte', 'Blades', 'Dewey Beach', 'Houston', 'Farmington', 'Magnolia', 'Woodside', 'Viola'],
        'SD': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton', 'Pierre', 'Huron', 'Vermillion', 'Spearfish', 'Brandon', 'Box Elder', 'Sturgis', 'Madison', 'Belle Fourche', 'Harrisburg', 'Tea', 'Dell Rapids', 'Mobridge', 'Hot Springs', 'Lead', 'Canton', 'Milbank', 'Winner', 'Chamberlain', 'Deadwood', 'Beresford', 'Lennox', 'Sisseton', 'Parkston', 'Elk Point', 'Redfield', 'Volga', 'Webster', 'Gregory', 'Gettysburg', 'Fort Pierre', 'Flandreau', 'Custer'],
        'ND': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson', 'Mandan', 'Jamestown', 'Wahpeton', 'Devils Lake', 'Valley City', 'Watford City', 'Beulah', 'Rugby', 'Grafton', 'Cavalier', 'Bottineau', 'Lisbon', 'Carrington', 'Oakes', 'Langdon', 'Stanley', 'Harvey', 'Park River', 'Mayville', 'New Town', 'Hazen', 'Hillsboro', 'Enderlin', 'Beach', 'Bowman', 'Crosby', 'Kenmare', 'Tioga', 'Casselton', 'Larimore', 'New Rockford', 'Ellendale', 'LaMoure'],
        'AK': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Wasilla', 'Kenai', 'Kodiak', 'Bethel', 'Palmer', 'Homer', 'Unalaska', 'Soldotna', 'Valdez', 'Nome', 'Kotzebue', 'Seward', 'Wrangell', 'Dillingham', 'Cordova', 'North Pole', 'Houston', 'Craig', 'Barrow', 'Haines', 'Petersburg', 'Delta Junction', 'Tok', 'Big Lake', 'Nikiski', 'Meadow Lakes', 'Knik-Fairview', 'Fishhook', 'Lakes', 'Gateway', 'Tanaina', 'Sterling', 'Fritz Creek', 'Kalifornsky', 'Butte'],
        'VT': ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier', 'Winooski', 'St. Albans', 'Newport', 'Vergennes', 'Middlebury', 'St. Johnsbury', 'Bennington', 'Brattleboro', 'Hartford', 'Milton', 'Essex Junction', 'Williston', 'Colchester', 'Springfield', 'Rockingham', 'Northfield', 'Swanton', 'Lyndon', 'Stowe', 'Morristown', 'Waterbury', 'Richmond', 'Jericho', 'Shelburne', 'Manchester', 'Randolph', 'Poultney', 'Fair Haven', 'Hardwick', 'Orleans', 'Johnson', 'Enosburg Falls', 'Chester', 'Windsor', 'Woodstock'],
        'WY': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River', 'Evanston', 'Riverton', 'Cody', 'Jackson', 'Rawlins', 'Lander', 'Torrington', 'Powell', 'Douglas', 'Worland', 'Buffalo', 'Thermopolis', 'Newcastle', 'Wheatland', 'Mills', 'Lovell', 'Kemmerer', 'Afton', 'Pinedale', 'Star Valley Ranch', 'Bar Nunn', 'Glenrock', 'Diamondville', 'Lyman', 'Basin', 'Sundance', 'Mountain View', 'Wright', 'Saratoga', 'Pine Bluffs', 'Greybull', 'Moorcroft', 'Cokeville'],
        'DC': ['Washington', 'Georgetown', 'Dupont Circle', 'Capitol Hill', 'Adams Morgan', 'Foggy Bottom', 'Chinatown', 'Shaw', 'Anacostia', 'Navy Yard'],
        'AR': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'North Little Rock', 'Conway', 'Rogers', 'Bentonville', 'Pine Bluff', 'Hot Springs', 'Benton', 'Texarkana', 'Sherwood', 'Jacksonville', 'Russellville', 'Bella Vista', 'West Memphis', 'Paragould', 'Cabot', 'Searcy', 'Van Buren', 'El Dorado', 'Maumelle', 'Bryant', 'Siloam Springs', 'Blytheville', 'Forrest City', 'Harrison', 'Mountain Home', 'Marion', 'Helena', 'Camden', 'Magnolia', 'Arkadelphia', 'Malvern', 'Batesville', 'Hope', 'Stuttgart', 'Monticello'],
        'MS': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Olive Branch', 'Greenville', 'Horn Lake', 'Clinton', 'Pearl', 'Madison', 'Starkville', 'Ridgeland', 'Vicksburg', 'Columbus', 'Brandon', 'Pascagoula', 'Gautier', 'Oxford', 'Ocean Springs', 'Laurel', 'Hernando', 'Clarksdale', 'Moss Point', 'Natchez', 'Brookhaven', 'Grenada', 'Cleveland', 'Long Beach', 'Corinth', 'McComb', 'Greenwood', 'Canton', 'Bay St. Louis', 'Flowood', 'Byram', 'Petal', 'Picayune'],
        'IN': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Gary', 'Lafayette', 'Muncie', 'Terre Haute', 'Kokomo', 'Noblesville', 'Anderson', 'Greenwood', 'Elkhart', 'Mishawaka', 'Lawrence', 'Jeffersonville', 'Columbus', 'Portage', 'New Albany', 'Richmond', 'Westfield', 'Valparaiso', 'Goshen', 'Michigan City', 'Merrillville', 'Marion', 'East Chicago', 'Hobart', 'Crown Point', 'Franklin', 'La Porte', 'Greenfield', 'Plainfield', 'Schererville', 'Granger', 'Zionsville']
    },

    // ZIP code prefixes by state
    zipPrefixes: {
        'AL': ['350', '351', '352', '354', '355', '356', '357', '358', '359', '360', '361', '362', '363', '364', '365', '366', '367', '368', '369'],
        'AK': ['995', '996', '997', '998', '999'],
        'AZ': ['850', '851', '852', '853', '855', '856', '857', '859', '860', '863', '864', '865'],
        'AR': ['716', '717', '718', '719', '720', '721', '722', '723', '724', '725', '726', '727', '728', '729'],
        'CA': ['900', '901', '902', '903', '904', '905', '906', '907', '908', '910', '911', '912', '913', '914', '915', '916', '917', '918', '919', '920', '921', '922', '923', '924', '925', '926', '927', '928', '930', '931', '932', '933', '934', '935', '936', '937', '938', '939', '940', '941', '942', '943', '944', '945', '946', '947', '948', '949', '950', '951', '952', '953', '954', '955', '956', '957', '958', '959', '960', '961'],
        'CO': ['800', '801', '802', '803', '804', '805', '806', '807', '808', '809', '810', '811', '812', '813', '814', '815', '816'],
        'CT': ['060', '061', '062', '063', '064', '065', '066', '067', '068', '069'],
        'DE': ['197', '198', '199'],
        'FL': ['320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331', '332', '333', '334', '335', '336', '337', '338', '339', '340', '341', '342', '344', '346', '347', '349'],
        'GA': ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '398', '399'],
        'HI': ['967', '968'],
        'ID': ['832', '833', '834', '835', '836', '837', '838'],
        'IL': ['600', '601', '602', '603', '604', '605', '606', '607', '608', '609', '610', '611', '612', '613', '614', '615', '616', '617', '618', '619', '620', '622', '623', '624', '625', '626', '627', '628', '629'],
        'IN': ['460', '461', '462', '463', '464', '465', '466', '467', '468', '469', '470', '471', '472', '473', '474', '475', '476', '477', '478', '479'],
        'IA': ['500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514', '515', '516', '520', '521', '522', '523', '524', '525', '526', '527', '528'],
        'KS': ['660', '661', '662', '664', '665', '666', '667', '668', '669', '670', '671', '672', '673', '674', '675', '676', '677', '678', '679'],
        'KY': ['400', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415', '416', '417', '418', '420', '421', '422', '423', '424', '425', '426', '427'],
        'LA': ['700', '701', '703', '704', '705', '706', '707', '708', '710', '711', '712', '713', '714'],
        'ME': ['039', '040', '041', '042', '043', '044', '045', '046', '047', '048', '049'],
        'MD': ['206', '207', '208', '209', '210', '211', '212', '214', '215', '216', '217', '218', '219'],
        'MA': ['010', '011', '012', '013', '014', '015', '016', '017', '018', '019', '020', '021', '022', '023', '024', '025', '026', '027'],
        'MI': ['480', '481', '482', '483', '484', '485', '486', '487', '488', '489', '490', '491', '492', '493', '494', '495', '496', '497', '498', '499'],
        'MN': ['550', '551', '553', '554', '555', '556', '557', '558', '559', '560', '561', '562', '563', '564', '565', '566', '567'],
        'MS': ['386', '387', '388', '389', '390', '391', '392', '393', '394', '395', '396', '397'],
        'MO': ['630', '631', '633', '634', '635', '636', '637', '638', '639', '640', '641', '644', '645', '646', '647', '648', '649', '650', '651', '652', '653', '654', '655', '656', '657', '658'],
        'MT': ['590', '591', '592', '593', '594', '595', '596', '597', '598', '599'],
        'NE': ['680', '681', '683', '684', '685', '686', '687', '688', '689', '690', '691', '692', '693'],
        'NV': ['889', '890', '891', '893', '894', '895', '897', '898'],
        'NH': ['030', '031', '032', '033', '034', '035', '036', '037', '038'],
        'NJ': ['070', '071', '072', '073', '074', '075', '076', '077', '078', '079', '080', '081', '082', '083', '084', '085', '086', '087', '088', '089'],
        'NM': ['870', '871', '872', '873', '874', '875', '877', '878', '879', '880', '881', '882', '883', '884'],
        'NY': ['100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149'],
        'NC': ['270', '271', '272', '273', '274', '275', '276', '277', '278', '279', '280', '281', '282', '283', '284', '285', '286', '287', '288', '289'],
        'ND': ['580', '581', '582', '583', '584', '585', '586', '587', '588'],
        'OH': ['430', '431', '432', '433', '434', '435', '436', '437', '438', '439', '440', '441', '442', '443', '444', '445', '446', '447', '448', '449', '450', '451', '452', '453', '454', '455', '456', '457', '458'],
        'OK': ['730', '731', '734', '735', '736', '737', '738', '739', '740', '741', '743', '744', '745', '746', '747', '748', '749'],
        'OR': ['970', '971', '972', '973', '974', '975', '976', '977', '978', '979'],
        'PA': ['150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196'],
        'RI': ['028', '029'],
        'SC': ['290', '291', '292', '293', '294', '295', '296', '297', '298', '299'],
        'SD': ['570', '571', '572', '573', '574', '575', '576', '577'],
        'TN': ['370', '371', '372', '373', '374', '375', '376', '377', '378', '379', '380', '381', '382', '383', '384', '385'],
        'TX': ['750', '751', '752', '753', '754', '755', '756', '757', '758', '759', '760', '761', '762', '763', '764', '765', '766', '767', '768', '769', '770', '771', '772', '773', '774', '775', '776', '777', '778', '779', '780', '781', '782', '783', '784', '785', '786', '787', '788', '789', '790', '791', '792', '793', '794', '795', '796', '797', '798', '799'],
        'UT': ['840', '841', '842', '843', '844', '845', '846', '847'],
        'VT': ['050', '051', '052', '053', '054', '056', '057', '058', '059'],
        'VA': ['201', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246'],
        'WA': ['980', '981', '982', '983', '984', '985', '986', '988', '989', '990', '991', '992', '993', '994'],
        'WV': ['247', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '259', '260', '261', '262', '263', '264', '265', '266', '267', '268'],
        'WI': ['530', '531', '532', '534', '535', '537', '538', '539', '540', '541', '542', '543', '544', '545', '546', '547', '548', '549'],
        'WY': ['820', '821', '822', '823', '824', '825', '826', '827', '828', '829', '830', '831'],
        'DC': ['200', '202', '203', '204', '205']
    },

    // Helper functions
    random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    generateZipCode(stateCode) {
        const prefixes = this.zipPrefixes[stateCode] || ['100'];
        const prefix = this.random(prefixes);
        const suffix = String(this.randomNumber(0, 99)).padStart(2, '0');
        return prefix + suffix;
    },

    generatePhoneNumber(stateCode) {
        const state = this.states[stateCode];
        const areaCode = this.random(state.areaCodes);
        const exchange = this.randomNumber(200, 999);
        const subscriber = this.randomNumber(1000, 9999);
        return `(${areaCode}) ${exchange}-${subscriber}`;
    },

    // Generate a realistic residential-style address (e.g., "6243 N 48th Ave")
    generateAddress(stateCode) {
        // Use numbered streets 80% of the time for residential feel
        const useNumberedStreet = Math.random() < 0.8;
        const streetNumber = this.randomNumber(1000, 9999);
        const direction = this.random(this.directionalPrefixes);
        const streetType = this.random(this.residentialStreetTypes);

        let streetName;
        if (useNumberedStreet) {
            streetName = this.generateNumberedStreet();
        } else {
            streetName = this.random(this.streetNames);
        }

        return `${streetNumber} ${direction} ${streetName} ${streetType}`;
    },

    // Generate residential address using real street data for a specific ZIP
    // Falls back to generated residential-style address if no data available
    generateResidentialAddress(zipCode) {
        if (this.residentialStreets && this.residentialStreets[zipCode]) {
            const streets = this.residentialStreets[zipCode];
            const street = this.random(streets);
            const streetNumber = this.randomNumber(street.min, street.max);
            return `${streetNumber} ${street.name}`;
        }
        // Fallback to generated residential-style address (e.g., "6217 N 47th Dr")
        const streetNumber = this.randomNumber(1000, 9999);
        const direction = this.random(this.directionalPrefixes);
        const streetType = this.random(this.residentialStreetTypes);

        // 80% numbered streets, 20% named streets for residential feel
        const useNumberedStreet = Math.random() < 0.8;
        let streetName;
        if (useNumberedStreet) {
            streetName = this.generateNumberedStreet();
        } else {
            streetName = this.random(this.streetNames);
        }

        return `${streetNumber} ${direction} ${streetName} ${streetType}`;
    },

    generateCity(stateCode) {
        const cities = this.cities[stateCode];
        if (cities && cities.length > 0) {
            return this.random(cities);
        }
        return this.random(Object.values(this.cities).flat());
    },

    generateName() {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = gender === 'male'
            ? this.random(this.maleNames)
            : this.random(this.femaleNames);
        const lastName = this.random(this.lastNames);
        return { firstName, lastName, fullName: `${firstName} ${lastName}`, gender };
    },

    // Generate unique student ID
    generateStudentId() {
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(Math.random() * 900000) + 100000;
        return `${year}${random}`;
    },

    generateDateOfBirth(minAge = 17, maxAge = 19) {
        const today = new Date();
        const age = this.randomNumber(minAge, maxAge);
        const year = today.getFullYear() - age;
        const month = this.randomNumber(1, 12);
        const day = this.randomNumber(1, 28);
        return {
            date: new Date(year, month - 1, day),
            formatted: `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`
        };
    },

    // Main generate function
    generate(stateCode = null) {
        // If no state specified, pick random
        const states = Object.keys(this.states);
        const selectedState = stateCode || this.random(states);
        const stateName = this.states[selectedState].name;

        const name = this.generateName();
        const address = this.generateAddress(selectedState);
        const city = this.generateCity(selectedState);
        const zipCode = this.generateZipCode(selectedState);
        const phone = this.generatePhoneNumber(selectedState);
        const dob = this.generateDateOfBirth();

        return {
            name: name.fullName,
            firstName: name.firstName,
            lastName: name.lastName,
            gender: name.gender,
            address: address,
            city: city,
            state: selectedState,
            stateName: stateName,
            zipCode: zipCode,
            fullAddress: `${address}, ${city}, ${selectedState} ${zipCode}`,
            phone: phone,
            dateOfBirth: dob.formatted,
            dateOfBirthDate: dob.date
        };
    },

    // Generate address matching a specific school's location with real residential streets
    generateForSchool(school) {
        if (!school) {
            return this.generate();
        }

        const stateCode = school.state;
        const stateName = this.states[stateCode]?.name || school.state;

        const name = this.generateName();
        // Use residential address generation with school's ZIP code
        const address = this.generateResidentialAddress(school.zip);
        const phone = this.generatePhoneNumber(stateCode);
        const dob = this.generateDateOfBirth();

        // Use school's city and ZIP for precise location matching
        return {
            name: name.fullName,
            firstName: name.firstName,
            lastName: name.lastName,
            gender: name.gender,
            address: address,
            city: school.city,  // Use school's city
            state: stateCode,
            stateName: stateName,
            zipCode: school.zip,  // Use school's ZIP code
            fullAddress: `${address}, ${school.city}, ${stateCode} ${school.zip}`,
            phone: phone,
            dateOfBirth: dob.formatted,
            dateOfBirthDate: dob.date
        };
    },

    // Get all states for dropdown
    getStates() {
        return Object.entries(this.states).map(([code, data]) => ({
            code,
            name: data.name
        })).sort((a, b) => a.name.localeCompare(b.name));
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AddressGenerator;
}
